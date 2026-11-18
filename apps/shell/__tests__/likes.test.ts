// Shared likes tests.
// 1. Why `shared` is needed: a component only finds a LikesProvider from the same copy of the context module.
//    Without `shared`, the blog bundles its own copy, which these tests mimic with vi.resetModules().
// 2. The persistence that carries the count across reloads and zones.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Context = typeof import("@mfe-lite/ui/likes-context");
type Store = typeof import("@mfe-lite/ui/likes");

/** A fresh, separate copy of a module, like the one each zone bundles on its own. */
async function loadCopy<T>(load: () => Promise<T>): Promise<T> {
  vi.resetModules();
  return load();
}
const contextCopy = () => loadCopy<Context>(() => import("@mfe-lite/ui/likes-context"));
const storeCopy = () => loadCopy<Store>(() => import("@mfe-lite/ui/likes"));

/** Renders a provider from one copy around a consumer from another and reports what the consumer saw. */
function seenBy(provider: Context, consumer: Context): string {
  function Probe() {
    const { owner, like, count } = consumer.useLikesStore();
    return createElement("i", null, `${owner ?? "none"}|${like ? "connected" : "disconnected"}|${count}`);
  }
  const html = renderToString(createElement(provider.LikesProvider, { owner: "shell", children: createElement(Probe) }));
  return html.replace(/<\/?i>/g, "");
}

describe("likes context across bundles", () => {
  // Count 0: the server render, which hydration matches before the provider loads the saved count.
  it("connects a consumer to the provider when both use the same module (what `shared` gives)", async () => {
    const shell = await contextCopy();
    expect(seenBy(shell, shell)).toBe("shell|connected|0");
  });

  it("leaves a consumer from a separate copy disconnected (no `shared`)", async () => {
    const shell = await contextCopy();
    const blog = await contextCopy();
    expect(blog.LikesContext).not.toBe(shell.LikesContext);
    expect(seenBy(shell, blog)).toBe("none|disconnected|0");
  });
});

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

describe("likes persistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads 0 on the server", async () => {
    const store = await storeCopy();
    expect(store.loadLikes()).toBe(0);
  });

  describe("in the browser", () => {
    let win: ReturnType<typeof fakeWindow>;
    beforeEach(() => {
      win = fakeWindow();
      vi.stubGlobal("window", win);
    });

    it("saves under the key both zones read", async () => {
      const store = await storeCopy();
      store.saveLikes(3);
      expect(win.data.get("mfe-lite:likes")).toBe("3");
      expect(store.loadLikes()).toBe(3);
    });

    it("treats a broken saved value as 0", async () => {
      const store = await storeCopy();
      for (const value of ["abc", "-3", "1.5", ""]) {
        win.data.set("mfe-lite:likes", value);
        expect(store.loadLikes(), value).toBe(0);
      }
    });

    it("follows another tab through the storage event and ignores other keys", async () => {
      const store = await storeCopy();
      const onChange = vi.fn();
      const stop = store.watchOtherTabs(onChange);

      win.dispatchEvent(Object.assign(new Event("storage"), { key: "something-else" }));
      expect(onChange).not.toHaveBeenCalled();

      win.data.set("mfe-lite:likes", "7");
      win.dispatchEvent(Object.assign(new Event("storage"), { key: "mfe-lite:likes" }));
      expect(onChange).toHaveBeenCalledWith(7);

      stop();
      win.dispatchEvent(Object.assign(new Event("storage"), { key: "mfe-lite:likes" }));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps working when storage is blocked: loads 0, saving does not throw", async () => {
    vi.stubGlobal("window", fakeWindow({ blockStorage: true }));
    const store = await storeCopy();
    expect(() => store.saveLikes(5)).not.toThrow();
    expect(store.loadLikes()).toBe(0);
  });
});
