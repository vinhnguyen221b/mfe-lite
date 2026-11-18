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
        p: "`pnpm test` runs the routing contract tests in `apps/shell/__tests__/routing.test.ts` and the shared-likes tests in `apps/shell/__tests__/likes.test.ts`. `pnpm typecheck` and `pnpm build` cover the rest.",
      },
    ],
  },
  {
    slug: "routing",
    title: "Routing",
    summary: "How one domain is split between two apps, decided before any app code runs.",
    blocks: [
      {
        p: "`microfrontends.json` in the default app is the only routing table. The shell declares no routes: it owns every path that nobody else claims. The blog claims three groups of paths:",
      },
      {
        code: [
          '{ "group": "blog", "paths": ["/blog", "/blog/:path*"] },',
          '{ "group": "docs", "paths": ["/docs", "/docs/:path*"] },',
          '{ "group": "components", "paths": ["/components", "/components/:path*"] }',
        ].join("\n"),
      },
      { h: "One decision, before any code runs" },
      {
        list: [
          "Vercel's routing layer matches the path against the table. `/blog`, `/docs` and `/components` go straight to the blog project; the shell never sees them.",
          "Every other path, `/` included, goes to the shell, which answers with its own page or its 404.",
        ],
      },
      { h: "Rules for the shell's matcher" },
      {
        list: [
          "The shell's `proxy.ts` only stamps `x-mfe-zone: shell`; it makes no routing decision.",
          "Its matcher excludes `_next/`, `vc-ap-` and the blog's `/blog`, `/docs` and `/components` paths, or the shell would shadow the blog and its assets.",
        ],
      },
      {
        p: "The routing tests check both: every sample path lands in the expected app, and the shell's matcher skips every path the blog owns.",
      },
    ],
    seeAlso: [{ href: "/lab.html#vertical", label: "Lab: vertical, a request step by step" }],
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
    seeAlso: [{ href: "/lab.html#setup", label: "Lab: where each piece lives" }],
  },
  {
    slug: "horizontal",
    title: "One page, two deployments",
    summary: "How the shell's /horizontal page embeds components that the blog builds and deploys.",
    blocks: [
      {
        p: "Routing splits the site by path: each page comes from one app. The shell's `/horizontal` page goes one step further and puts both apps on one page: its own text, plus two components rendered by this blog project.",
      },
      {
        list: [
          "`/components/latest-posts`: a Server Component. It arrives as HTML and needs no JavaScript.",
          "`/components/reactions`: a Client Component with a Like button. Its JavaScript is built by the blog and hydrates inside the shell's page, and its count also shows in the shell's header (see the next article).",
        ],
      },
      { h: "How it is wired" },
      {
        p: "The blog wraps each component page in `ExposeRemoteComponent` from `remote-components`. The shell renders `ConsumeRemoteComponent` with a relative `src`, inside an error boundary and `Suspense`:",
      },
      {
        code: [
          "// apps/shell/app/horizontal/remote-slot.tsx",
          "<SlotBoundary label={label}>",
          "  <Suspense fallback={<div className=\"card\">Loading {label}…</div>}>",
          "    <ConsumeRemoteComponent src={src} />",
          "  </Suspense>",
          "</SlotBoundary>",
        ].join("\n"),
      },
      {
        list: [
          "On the server, the shell fetches `https://mfe-lite-shell.vercel.app/components/<name>`. That request goes through the same routing as a visitor's, so it reaches the blog's current production deployment.",
          "The page is rendered per request, so a blog deployment shows up on the next page load without a shell build.",
          "If the blog is down, the page still answers and each slot shows its fallback.",
        ],
      },
      { h: "What it costs" },
      {
        list: [
          "Each component renders in an open Shadow DOM: the blog's CSS stays inside it, and page-level selectors do not see it.",
          "The components bring the blog's own JavaScript, about as much as the shell's.",
          "Links inside a component are plain `<a>` tags: the component does not know which zone its host page belongs to.",
          "Preview deployments are behind Deployment Protection, so the page is demonstrated on production only.",
        ],
      },
      {
        p: "Each card prints the blog's build commit and the page text prints the shell's, so a blog-only deployment is visible on the page: the cards change, the shell's commit does not.",
      },
    ],
    seeAlso: [
      { href: "/horizontal", label: "The /horizontal page" },
      { href: "/lab.html#horizontal", label: "Lab: the horizontal page, step by step" },
    ],
  },
  {
    slug: "shared-state",
    title: "Sharing state between zones",
    summary: "How a Like in a blog component updates a count in the shell's header, with no code shared at runtime.",
    blocks: [
      {
        p: "Press Like in the blog's card on `/horizontal` and the ♥ count in the header follows. The header there is rendered by the shell; the button is built by this blog project. The count is the same on blog pages like this one, after a reload and in other tabs.",
      },
      { h: "Why not a shared store" },
      {
        list: [
          "`remote-components` shares only `react`, `react-dom` and `next/*` between the shell and an embedded component. Everything else, `@mfe-lite/ui` included, is bundled once per zone.",
          "So a module variable or a React context in a shared package would exist twice, even on `/horizontal`, where both apps run in one React tree.",
          "Between whole pages there is nothing to share at all: moving from a shell page to a blog page is a full page load.",
        ],
      },
      { h: "A browser contract" },
      {
        p: "Both zones are served from one origin, so they see the same browser storage. `@mfe-lite/ui/likes` agrees on three things:",
      },
      {
        code: [
          'localStorage  "mfe-lite:likes"   // the count; survives reloads and zone changes',
          'window event  "mfe-lite:likes"   // fired after each change; updates the current page',
          'window event  "storage"          // fired by the browser; updates other tabs',
        ].join("\n"),
      },
      {
        code: [
          "// apps/blog/app/components/reactions/reactions.tsx",
          'import { addLike, useLikes } from "@mfe-lite/ui/likes";',
          "",
          "const likes = useLikes();   // 0 on the server, then the browser's value",
          "<button onClick={() => addLike()}>Like · {likes}</button>",
        ].join("\n"),
      },
      {
        p: "`useLikes()` is `useSyncExternalStore` over that contract. Each zone runs its own copy of this code, and the copies agree because they read and write the same key and listen for the same events. `apps/shell/__tests__/likes.test.ts` loads two copies and checks exactly that.",
      },
      { h: "Limits" },
      {
        list: [
          "The count is per browser and per origin: the blog project's own domain keeps its own count. A count shared by every visitor would need server-side storage.",
          "The key, the event names and the value format are an API between two apps. Change them like an API, with both sides deployed.",
          "If the blog is down, the shell's header still shows the stored count; only the button is missing.",
        ],
      },
    ],
    seeAlso: [
      { href: "/horizontal", label: "Try it on /horizontal" },
      { href: "/lab.html#horizontal", label: "Lab: the horizontal page" },
    ],
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
    seeAlso: [{ href: "/lab.html#setup", label: "Lab: try the checks yourself" }],
  },
];
