// Routing contract tests. They run in the default app, where microfrontends.json and proxy.ts live.
import { describe, it, expect } from "vitest";
import { validateRouting } from "@vercel/microfrontends/next/testing";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config as proxyConfig } from "../proxy";

const CONFIG = "./microfrontends.json";

const SHELL_PATHS = ["/", "/does-not-exist", "/lab.html"];
const BLOG_PATHS = ["/blog", "/blog/hello-world", "/docs", "/docs/getting-started"];

describe("routing contract", () => {
  it("routes every path to the expected app", () => {
    expect(() =>
      validateRouting(CONFIG, { "mfe-lite-shell": SHELL_PATHS, "mfe-lite-blog": BLOG_PATHS }),
    ).not.toThrow();
  });

  it("never lets /blog or /docs fall through to the shell", () => {
    for (const path of BLOG_PATHS) {
      expect(() => validateRouting(CONFIG, { "mfe-lite-shell": [path] })).toThrow();
    }
  });
});

describe("shell proxy matcher", () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config: proxyConfig, url });

  it("runs for the shell's own paths", () => {
    for (const path of SHELL_PATHS) expect(matches(path), path).toBe(true);
  });

  it("skips the blog's paths, the blog's asset prefix and framework assets", () => {
    for (const path of [...BLOG_PATHS, "/vc-ap-5d190e/_next/static/chunks/a.js", "/_next/static/chunks/a.js"]) {
      expect(matches(path), path).toBe(false);
    }
  });

  it("does not skip shell paths that only start like a blog path", () => {
    expect(matches("/blogroll")).toBe(true);
    expect(matches("/docsify")).toBe(true);
  });
});
