export const POSTS = [
  { slug: "hello-world", title: "Hello, world", body: "First post from the blog zone." },
  { slug: "why-microfrontends", title: "Why microfrontends", body: "Teams ship on their own schedule behind one domain." },
];

// Docs content. Text between backticks renders as inline code.
export type Block =
  | { p: string }
  | { h: string }
  | { code: string }
  | { list: string[] }
  | { figure: "likes-same-page" | "likes-between-pages"; caption: string };

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
    slug: "two-splits",
    title: "Two ways to split a frontend",
    summary: "Vertical and horizontal in theory: how each is composed, what the apps share, whom it fits, and how to choose.",
    blocks: [
      {
        p: "Three questions describe any way of splitting a frontend between teams: where it is composed, what the apps share at run time, and whom it fits. MFE Lite shows both splits; this page is the theory behind them.",
      },
      { h: "Vertical: every page has one owner" },
      {
        list: [
          "Composed in front of the apps. A router picks one app for each request, by path, and that app returns the whole document. On Vercel the router is the microfrontends routing layer.",
          "Shared at run time: only the domain, so cookies and browser storage. Code is shared at build time, through packages. Memory is not shared at all.",
          "The boundary is a navigation: a link into the other app is a full page load.",
          "It fits teams that own whole sections of a site: marketing, docs, a dashboard, checkout.",
        ],
      },
      {
        p: "In MFE Lite: `/blog` and `/docs` belong to this blog project, and every other path belongs to the shell. The next two articles show how.",
      },
      { h: "Horizontal: one page, several owners" },
      {
        list: [
          "Composed inside the page. A host page leaves slots, and another app renders the component for each slot and deploys it on its own.",
          "Shared at run time: one document and one runtime. That means React, plus every module both apps list as shared, and that list is a contract between two deployments.",
          "The boundary is inside the page: nothing reloads, but every slot needs a fallback for when the other app is down.",
          "It fits a piece that sits on other teams' pages and must change without their redeploy: a header for many apps, a cart, recommendations.",
        ],
      },
      {
        p: "In MFE Lite: the shell's `/horizontal` page holds two components that this blog project builds and deploys.",
      },
      { h: "Three ways to share a piece of UI" },
      {
        list: [
          "A workspace package shares source code at build time. A change goes live when every app that uses it redeploys, and it costs nothing at run time. Here: `packages/ui`, with the header, `Link` and the badges.",
          "A vertical zone shares a domain, routed by path. A change goes live when that zone deploys, and the cost is a full page load at the zone's edge. Here: `/blog` and `/docs`.",
          "A remote component shares a page and its runtime. A change goes live when the remote deploys, while the hosts stay as they are. The cost is more JavaScript and two running apps that depend on each other. Here: the two cards on `/horizontal`.",
        ],
      },
      {
        p: "Rule of thumb: take the first of the three that gives the independence you need. That is also Vercel's guidance: start vertical, share code through workspace packages, and reach for horizontal only when a piece must update without redeploying the pages that show it.",
      },
    ],
    seeAlso: [{ href: "/lab.html#choose", label: "Lab: which one do you need?" }],
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
          "`/components/reactions`: a Client Component with a Like button. Its JavaScript is built by the blog and hydrates inside the shell's page, and its count also shows in the shell's header (see \"Sharing state between zones\").",
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
        p: "Each card says `served by: blog`, inside a dashed frame that the shell draws. After a blog-only deployment the cards change on the next request, while the shell's deployment is canceled as unaffected.",
      },
    ],
    seeAlso: [
      { href: "/horizontal", label: "The /horizontal page" },
      { href: "/lab.html#horizontal", label: "Lab: the horizontal page, step by step" },
    ],
  },
  {
    slug: "state",
    title: "Where shared state can live",
    summary: "Five places to keep a value that two apps share, how far each one reaches, and five cases from real projects.",
    blocks: [
      {
        p: "A move between the shell and the blog is a full page load, and a page load discards everything in memory. So the first question about any value two apps share is where it is kept.",
      },
      { h: "Five places" },
      {
        list: [
          "Memory (React state, context, module variables): it ends with the page, and the next page starts empty. Good for live UI on one page.",
          "The URL (path and query): it travels with every link, and every zone's server and client can read it. Good for filters, selection and deep links. It is public, so nothing sensitive goes there.",
          "Browser storage (`localStorage`, IndexedDB): all zones are one origin, so they read the same keys, but only client code can. Good for preferences and drafts.",
          "A cookie on the shared domain: the browser sends it with every request, so every zone's server can read it and render the right HTML the first time. Good for a session, a language, a theme.",
          "A server (an API in front of a database): any zone, any device, any visitor. The source of truth.",
        ],
      },
      {
        p: "Between zones, memory never crosses. On one page, two apps can share memory too, but only through a module both load as one copy. Browser storage and cookies stay in the browser that wrote them; only a server reaches another visitor.",
      },
      { h: "Five cases" },
      { p: "For each case ask two questions: where does the truth live, and how does each app get it?" },
      {
        list: [
          "Who is signed in: a session cookie on the shared domain. Every zone checks the session itself, through one shared auth package, because each app's proxy sees only its own paths.",
          "A cart or notification count in the header: a server API that one team owns. Each zone's header calls the API; no zone reads another team's database.",
          "Theme, language, consent: a cookie. Each zone's server reads it and renders the right HTML the first time. Kept only in `localStorage`, the page would flash.",
          "Filters, search, the selected item: the URL. Links carry it between zones, the Back button works, and there is nothing to synchronise.",
          "Two widgets on one page that react to each other: memory, as one shared context or a browser event. Both apps load one copy of the module, or agree on the event's name and payload.",
        ],
      },
      {
        p: "The sign-in case follows Vercel's microfrontends documentation. The other four are common practice, not something this demo tests: MFE Lite has no sign-in and no server store. It implements the last case, described in the next article.",
      },
      { h: "Three things to avoid" },
      {
        list: [
          "`localStorage` as the main channel between apps: a server cannot read it, and nothing says who owns a key.",
          "One global store that every app reads and writes: it ties the apps' releases together again.",
          "One zone reading another team's database: the owning team's API is the boundary.",
        ],
      },
      {
        p: "The rule behind every case: decide where the truth lives first, then how each page gets a copy.",
      },
    ],
    seeAlso: [{ href: "/lab.html#state", label: "Lab: five places, three distances" }],
  },
  {
    slug: "shared-state",
    title: "Sharing state between zones",
    summary: "How a Like in a blog component writes into a React context that the shell owns, and how the count survives page loads.",
    blocks: [
      {
        p: "This is MFE Lite's own case of shared state: two widgets on one page, built by two apps.",
      },
      {
        p: "Press Like in the blog's card on `/horizontal` and the ♥ count in the header and the shell's panel follow. The header and the panel are rendered by the shell; the button is built by this blog project. All three read one React context, held by the shell.",
      },
      { h: "One module, shared" },
      {
        list: [
          "By default `remote-components` shares only `react`, `react-dom` and `next/*` between the shell and an embedded component. Everything else is bundled once per zone, so the blog would bring its own copy of a context and find no provider for it.",
          "Both apps therefore list one more module as shared. On `/horizontal`, the blog's import of it is the shell's live copy, so the blog's button finds the shell's provider.",
          "Each zone's root layout renders a `LikesProvider`. On a blog page like this one, the button uses the blog's own provider.",
        ],
      },
      {
        code: [
          "// apps/shell/next.config.ts and apps/blog/next.config.ts",
          "export default withRemoteComponentsConfig(withMicrofrontends(nextConfig), {",
          '  shared: ["@mfe-lite/ui/likes-context"],',
          "});",
        ].join("\n"),
      },
      {
        code: [
          "// apps/blog/app/components/reactions/reactions.tsx",
          'import { useLikesStore } from "@mfe-lite/ui/likes-context";',
          "",
          "const { count, like, owner } = useLikesStore();   // owner: \"shell\" on /horizontal, \"blog\" here",
          "<button data-store={owner} onClick={() => like?.()}>Like · {count}</button>",
        ].join("\n"),
      },
      {
        figure: "likes-same-page",
        caption: "On the same page, the blog's button writes into the shell's provider. Nothing is stored or sent.",
      },
      {
        p: "`apps/shell/__tests__/likes.test.ts` renders a provider and a consumer: from the same copy of the module they connect, from two separate copies (each zone bundling its own) the consumer gets `like: null`.",
      },
      { h: "Between pages" },
      {
        p: "Moving between a shell page and a blog page, or reloading, is a full page load: a new React tree and a new provider. The provider saves the count in `localStorage` under `mfe-lite:likes` and loads it when it mounts. Both zones are served from one origin, so they read the same key, and the browser's `storage` event updates other tabs.",
      },
      {
        figure: "likes-between-pages",
        caption: "Across pages, the two apps never talk to each other. They read and write the same key.",
      },
      { h: "What is shared, what is saved" },
      {
        list: [
          "The same page, both apps (`/horizontal`): shared. One React context, through `shared`; it updates at once and nothing is stored or sent.",
          "Another page, either app: saved. A new page builds a new provider, which loads the count this browser saved.",
          "Another tab: saved. The browser's `storage` event tells the other tab to load the saved count again.",
          "Another browser or visitor: neither. This demo has no server, so each browser keeps its own count.",
        ],
      },
      { h: "In production" },
      {
        p: "`localStorage` is this demo's stand-in. A real app would keep the count on a server, behind an API owned by the team that owns the feature: here this blog, for example an `/api/likes` route on a database such as Redis. The shell would call that API through the shared domain, never the database, and each layout would render the count from it, so the HTML shows the real number. The shared context would not change: it stays the in-page copy that updates at once when someone presses Like. Only where the provider loads and saves the count would change.",
      },
      { h: "Limits" },
      {
        list: [
          "Sharing happens in the browser. This blog renders the component's server HTML under its own layout; the shell's module takes over when the page loads.",
          "The shared module is an API between two deployments: this button runs against the shell's build of it. Change `count`, `like` and `owner` so both the old and the new side keep working.",
          "The count is per browser and per origin: the blog project's own domain keeps its own count. A count shared by every visitor would need server-side storage.",
          "If the blog is down, `/horizontal` shows a fallback in place of the button, and the shell's header and panel keep the saved count.",
        ],
      },
    ],
    seeAlso: [{ href: "/lab.html#one-like", label: "Lab: one Like, two apps" }],
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
