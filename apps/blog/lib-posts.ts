export const POSTS = [
  { slug: "hello-world", title: "Hello, world", body: "First post from the blog zone." },
  { slug: "why-microfrontends", title: "Why microfrontends", body: "Teams ship on their own schedule behind one domain." },
];

// Docs content. Text between backticks renders as inline code.
export type Block = { p: string } | { h: string } | { code: string } | { list: string[] };

export type Doc = {
  slug: string;
  title: string;
  summary: string;
  blocks: Block[];
  seeAlso?: { href: string; label: string }[];
};

export const DOCS: Doc[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Run both zones locally behind one proxy and check which zone answered.",
    blocks: [
      {
        p: "MFE Lite is a pnpm + Turborepo monorepo with two Next.js apps: `apps/shell` (the default app) and `apps/blog` (a child zone). `packages/ui` holds the header both apps share.",
      },
      { code: "pnpm install\npnpm dev   # shell :3000, blog :3001, microfrontends proxy :3024" },
      {
        p: "Open http://localhost:3024, not the app ports. The proxy on 3024 reads `apps/shell/microfrontends.json` and plays the part that Vercel's routing layer plays in production.",
      },
      { h: "Which zone answered?" },
      {
        p: "Every response carries `x-mfe-zone: shell` or `x-mfe-zone: blog`, set by that zone's `proxy.ts`. The badge in the header shows the same fact in the browser.",
      },
      {
        code: [
          "curl -sI localhost:3024/      | grep x-mfe-zone   # shell",
          "curl -sI localhost:3024/blog  | grep x-mfe-zone   # blog",
          "curl -sI localhost:3024/docs  | grep x-mfe-zone   # blog",
        ].join("\n"),
      },
      { h: "Tests" },
      {
        p: "`pnpm test` runs the routing contract tests in `apps/shell/__tests__/routing.test.ts`. `pnpm typecheck` and `pnpm build` cover the rest.",
      },
    ],
  },
  {
    slug: "routing",
    title: "Routing",
    summary: "How one domain is split between two apps, decided before any app code runs.",
    blocks: [
      {
        p: "`microfrontends.json` in the default app is the only routing table. The shell declares no routes: it owns every path that nobody else claims. The blog claims two groups of paths:",
      },
      {
        code: [
          '{ "group": "blog", "paths": ["/blog", "/blog/:path*"] },',
          '{ "group": "docs", "paths": ["/docs", "/docs/:path*"] }',
        ].join("\n"),
      },
      { h: "One decision, before any code runs" },
      {
        list: [
          "Vercel's routing layer matches the path against the table. `/blog` and `/docs` go straight to the blog project; the shell never sees them.",
          "Every other path, `/` included, goes to the shell, which answers with its own page or its 404.",
        ],
      },
      { h: "Rules for the shell's matcher" },
      {
        list: [
          "The shell's `proxy.ts` only stamps `x-mfe-zone: shell`; it makes no routing decision.",
          "Its matcher excludes `_next/`, `vc-ap-` and the blog's `/blog` and `/docs` paths, or the shell would shadow the blog and its assets.",
        ],
      },
      {
        p: "The routing tests check both: every sample path lands in the expected app, and the shell's matcher skips every path the blog owns.",
      },
    ],
    seeAlso: [{ href: "/lab.html#request", label: "Lab: a request, step by step" }],
  },
  {
    slug: "links-and-assets",
    title: "Links and assets across zones",
    summary: "What happens when a link crosses from one app to the other, and why the two apps' files never collide.",
    blocks: [
      {
        p: "The shared header uses `Link` from `@vercel/microfrontends/next/client` instead of `next/link`. It knows the routing table, because `withMicrofrontends` bakes it into each app at build time.",
      },
      {
        list: [
          "A link to a path in the same zone renders `next/link`: a client-side navigation, as in any Next.js app.",
          "A link to a path in the other zone renders a plain `<a>`: a full page load, because the other zone is a different deployment with its own JavaScript.",
        ],
      },
      {
        p: "`PrefetchCrossZoneLinks` in each layout adds speculation rules, so the browser can prefetch the other zone's pages before the click and the full page load feels close to instant.",
      },
      { h: "Assets" },
      {
        p: "Both apps are Next.js apps, so both would serve their files under `/_next/`. `withMicrofrontends` gives the child zone a hashed prefix instead, and Vercel routes that prefix to the blog:",
      },
      {
        code: [
          "/_next/static/...               # shell (default app)",
          "/vc-ap-5d190e/_next/static/...  # blog",
        ].join("\n"),
      },
      {
        p: "This is also why the shell's proxy matcher must skip `vc-ap-`: otherwise the shell would intercept the blog's files.",
      },
    ],
    seeAlso: [{ href: "/lab.html#cheatsheet", label: "Lab: cheat sheet" }],
  },
  {
    slug: "deploy",
    title: "Deploying on Vercel Hobby",
    summary: "Two projects, one group, and the limits and surprises of the free plan.",
    blocks: [
      {
        p: "Each app is its own Vercel project with its own builds, deployments and rollbacks: `mfe-lite-shell` (Root Directory `apps/shell`) and `mfe-lite-blog` (Root Directory `apps/blog`). Each app's `vercel.json` builds only that app with `pnpm turbo build --filter=<package>`.",
      },
      { p: "A microfrontends group joins the two projects on the shell's domain:" },
      {
        code: [
          "vercel microfrontends create-group --name mfe-lite --default-app mfe-lite-shell \\",
          "  --project mfe-lite-shell --project mfe-lite-blog \\",
          "  --project-default-route mfe-lite-blog=/docs --yes",
        ].join("\n"),
      },
      { h: "Good to know" },
      {
        list: [
          "Hobby allows one microfrontends group per team, with two projects.",
          "`create-group` must list the default app among `--project` too.",
          "Deployments built before the group existed ignore `microfrontends.json`: redeploy both projects once after creating it.",
          "Vercel skips a project that a commit does not affect: a change only under `apps/blog` builds only the blog, while a change outside the apps (a doc at the repo root, for example) builds both.",
          "A failed blog build leaves the shell's current deployment up.",
        ],
      },
    ],
    seeAlso: [{ href: "/lab.html#checks", label: "Lab: the recorded checks" }],
  },
];
