// Shared likes contract tests. Each zone bundles its own copy of @mfe-lite/ui/likes,
// so these tests load the module twice and check that the copies agree through the browser.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Likes = typeof import("@mfe-lite/ui/likes");

/** A fresh, separate copy of the module, like the one each zone bundles. */
async function loadCopy(): Promise<Likes> {
  vi.resetModules();
  return import("@mfe-lite/ui/likes");
}

function fakeWindow({ blockStorage = false } = {}) {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => {
      if (blockStorage) throw new Error("SecurityError");
      return data.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (blockStorage) throw new Error("SecurityError");
      data.set(key, value);
    },
  };
  return Object.assign(new EventTarget(), { localStorage, data });
}

describe("shared likes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads 0 on the server", async () => {
    const likes = await loadCopy();
    expect(likes.readLikes()).toBe(0);
  });

  describe("in the browser", () => {
    let win: ReturnType<typeof fakeWindow>;
    beforeEach(() => {
      win = fakeWindow();
      vi.stubGlobal("window", win);
    });

    it("counts, persists under the contract key and notifies the page", async () => {
      const likes = await loadCopy();
      const onChange = vi.fn();
      const unsubscribe = likes.subscribeLikes(onChange);

      expect(likes.readLikes()).toBe(0);
      expect(likes.addLike()).toBe(1);
      expect(likes.addLike()).toBe(2);
      expect(win.data.get("mfe-lite:likes")).toBe("2");
      expect(onChange).toHaveBeenCalledTimes(2);

      unsubscribe();
      likes.addLike();
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("lets two bundled copies (blog and shell) see the same count", async () => {
      const blog = await loadCopy();
      const shell = await loadCopy();
      expect(blog.addLike).not.toBe(shell.addLike);

      const shellSaw = vi.fn();
      shell.subscribeLikes(() => shellSaw(shell.readLikes()));
      blog.addLike();
      blog.addLike();

      expect(shellSaw).toHaveBeenLastCalledWith(2);
      expect(shell.readLikes()).toBe(2);
    });

    it("follows another tab through the storage event and ignores other keys", async () => {
      const likes = await loadCopy();
      const onChange = vi.fn();
      likes.subscribeLikes(onChange);

      win.dispatchEvent(Object.assign(new Event("storage"), { key: "something-else" }));
      expect(onChange).not.toHaveBeenCalled();

      win.data.set("mfe-lite:likes", "7");
      win.dispatchEvent(Object.assign(new Event("storage"), { key: "mfe-lite:likes" }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(likes.readLikes()).toBe(7);
    });

    it("treats a broken stored value as 0", async () => {
      const likes = await loadCopy();
      for (const value of ["abc", "-3", "1.5", ""]) {
        win.data.set("mfe-lite:likes", value);
        expect(likes.readLikes(), value).toBe(0);
      }
    });
  });

  it("still shares the count between copies when storage is blocked", async () => {
    vi.stubGlobal("window", fakeWindow({ blockStorage: true }));
    const blog = await loadCopy();
    const shell = await loadCopy();

    blog.addLike();
    expect(shell.addLike()).toBe(2);
    expect(blog.readLikes()).toBe(2);
  });
});
