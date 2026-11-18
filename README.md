# MFE Lite

The smallest honest demo of [Vercel Microfrontends](https://vercel.com/docs/microfrontends) on the Hobby plan, cost $0.

**Live demo:** https://mfe-lite-shell.vercel.app · **Horizontal page:** https://mfe-lite-shell.vercel.app/horizontal · **Interactive lab:** https://mfe-lite-shell.vercel.app/lab.html

It shows the four things that matter and nothing else. The first three are the **vertical** split, where each path belongs to one app; the fourth is the **horizontal** split, where one page holds pieces from both apps:

1. **One domain** in front of two independently built Next.js apps.
2. **Independent deployments**: each app is its own Vercel project with its own builds, deployments and rollbacks; a failed blog build leaves the shell up.
3. **One routing file**: `microfrontends.json` in the shell lists the paths the blog owns; Vercel applies it before any app code runs.
4. **One page, two deployments**: the shell's `/horizontal` page embeds two components that the blog project builds and deploys. A blog-only deployment changes them without a shell build. A Like pressed in the blog's component also updates a count in the shell's header ([shared state](#shared-state-between-zones)).

| App | Package | Role | Paths | Vercel project |
|---|---|---|---|---|
| `apps/shell` | `@mfe-lite/shell` | Default app; owns `microfrontends.json`; hosts `/horizontal` | `/` and every path nobody claims | `mfe-lite-shell` |
| `apps/blog` | `@mfe-lite/blog` | Child zone; serves the embedded components | `/blog`, `/blog/*`, `/docs`, `/docs/*`, `/components/*` | `mfe-lite-blog` |

`packages/ui` holds the shared header. Its links use `Link` from `@vercel/microfrontends/next/client`, so a link inside a zone stays a client-side navigation and a link into the other zone becomes a full navigation, and a small badge shows which zone rendered the page. It also holds `@mfe-lite/ui/likes`, the small browser contract both zones use to share a like count.

## Request flow (vertical)

```mermaid
flowchart LR
  B[Browser] -->|"https://mfe-lite-shell.vercel.app/..."| V[Vercel routing<br/>group mfe-lite]
  V -->|"/blog/*, /docs/*, /components/*"| BLOG[blog project]
  V -->|everything else| SHELL[shell project]
```

Ownership is decided by Vercel's routing layer before any code runs: `/blog`, `/docs` and `/components` go to the blog project, every other path to the shell. Neither app forwards requests to the other; the shell never sees `/blog` or `/docs`.

Every response carries `x-mfe-zone: shell | blog`, set by each zone's `proxy.ts`, so routing can be checked with curl. That header is the proxies' only job.

## One page, two deployments (horizontal)

```mermaid
flowchart LR
  B[Browser] -->|"GET /horizontal"| V[Vercel routing]
  V --> SHELL[shell renders /horizontal]
  SHELL -->|"server fetch /components/latest-posts<br/>/components/reactions"| V2[Vercel routing]
  V2 --> BLOG[blog renders each component]
  BLOG -->|HTML| SHELL
  SHELL -->|"one HTML page"| B
```

- The blog exposes two pages under `/components/*`, a path group it owns in `microfrontends.json`: `latest-posts` (a Server Component, no client JavaScript) and `reactions` (a Client Component with a Like button). Each is wrapped in `ExposeRemoteComponent` from [`remote-components`](https://www.npmjs.com/package/remote-components) (0.4.16, pinned).
- The shell's `/horizontal` page renders its own text and two `ConsumeRemoteComponent` slots. On the server, a relative `src` resolves against `https://$VERCEL_PROJECT_PRODUCTION_URL` in production, so the fetch goes through the same routing and reaches the blog. The page arrives with both components already in the HTML; the Like button then hydrates with JavaScript loaded from the blog's `/vc-ap-<hash>/` prefix.
- The page is rendered per request (`dynamic = "force-dynamic"`), so a blog deployment shows up on the next page load. Each slot sits in an error boundary and `Suspense`: if the blog is down, the page still answers 200 and the slot shows a fallback.
- Each card says `served by: blog`, inside a dashed frame that the shell draws. After a blog-only commit, the shell's deployment is canceled as unaffected and the next request to `/horizontal` shows the changed cards without a shell build (see [EVIDENCE.md](EVIDENCE.md)).

What it costs, measured on production:

- Each embedded component renders inside an open Shadow DOM: its CSS cannot leak into the shell, but `document.querySelector` on the page does not see it.
- The embedded components bring the blog's own JavaScript: 12 files, about 190 KB transferred, roughly as much as the shell's own JavaScript.
- Preview deployments are behind Deployment Protection, and outside production a relative `src` resolves against the branch URL, so `/horizontal` is only demonstrated on production.
- `remote-components` is a 0.x package; its API may still change.

## Shared state between zones

```mermaid
flowchart LR
  LIKE["Like button<br/>(blog's code)"] -->|"addLike()"| LS[("localStorage<br/>mfe-lite:likes")]
  LIKE -->|"window event mfe-lite:likes"| HDR["♥ badge in the header<br/>(shell's code)"]
  LS -->|"read on load"| HDR
  LS -->|"storage event"| TAB[other tabs]
```

Press Like in the blog's Reactions card on `/horizontal` and the ♥ count in the shell's header follows at once. The count is the same on blog pages, after a reload and in other tabs.

- **Why not a shared store or React context.** `remote-components` shares only `react`, `react-dom` and `next/*` between the host and a remote. Each zone bundles its own copy of `@mfe-lite/ui`, so a module variable or a context provider there would exist twice. On the vertical pages there is no shared JavaScript at all: moving between zones is a full page load.
- **The contract instead.** `@mfe-lite/ui/likes` keeps the count in `localStorage` under `mfe-lite:likes`, fires a `mfe-lite:likes` event on `window` after each change, and listens to the browser's `storage` event for other tabs. `useLikes()` reads it with `useSyncExternalStore`: 0 on the server, the browser's value once hydrated. Both zones are served from one origin, so they see the same storage.
- **Where it is used.** The ♥ badge in both zones' header, the blog's Reactions card, and a Like button on each blog post.
- **Tests.** `apps/shell/__tests__/likes.test.ts` loads two separate copies of the module, as the two zones do, and checks that they see the same count.

Limits:

- The count is per browser and per origin: the blog project's own domain, `mfe-lite-blog.vercel.app`, keeps its own. A count shared by every visitor would need server-side storage.
- The key, the event name and the value format are an API between the two apps: change them like one, with both sides deployed.
- The library's `shared` option can make a remote use the host's copy of a package (its docs mention context providers). Not tried here: it would only help on `/horizontal`, and the blog's component would then run against the shell's build of that package.

## Local workflow

```bash
pnpm install
pnpm dev        # Turborepo starts shell (3000), blog (3001) and the microfrontends proxy on 3024
```

Open http://localhost:3024 (and http://localhost:3024/horizontal). Then:

```bash
curl -sI localhost:3024/                         | grep x-mfe-zone   # shell
curl -sI localhost:3024/blog                     | grep x-mfe-zone   # blog
curl -sI localhost:3024/docs                     | grep x-mfe-zone   # blog
curl -sI localhost:3024/components/latest-posts  | grep x-mfe-zone   # blog
```

Outside Vercel, a relative remote `src` resolves against the local proxy (`http://localhost:3024`), so `/horizontal` needs the proxy running.

```bash
pnpm test        # routing contract and shared-likes tests (apps/shell/__tests__/)
pnpm typecheck
pnpm build
```

`validateRouting` (from `@vercel/microfrontends/next/testing`) checks that each sample path lands in the expected app and that none of the blog's paths falls through to the shell. `unstable_doesMiddlewareMatch` (from `next/experimental/testing/server`) checks that the shell proxy's matcher runs for the shell's paths and skips `/blog`, `/docs`, `/components`, the `vc-ap-*` asset prefix and `_next`.

## Deploy (Vercel Hobby)

1. Create two projects from this repo: `mfe-lite-shell` (Root Directory `apps/shell`) and `mfe-lite-blog` (Root Directory `apps/blog`). Each app's `vercel.json` sets the build command to `cd ../.. && pnpm turbo build --filter=<package>`.
2. Link the repo root to the shell project and create the group (one group of two projects is the Hobby maximum):
   ```bash
   vercel link --project mfe-lite-shell --yes
   vercel microfrontends create-group --name mfe-lite --default-app mfe-lite-shell \
     --project mfe-lite-shell --project mfe-lite-blog --project-default-route mfe-lite-blog=/docs --yes
   ```
3. Connect both projects to the repo (`vercel git connect`, from the repo root and with `--cwd apps/blog`) and push to `main`. Each project builds only its own app (the `--filter` in its build command) and skips commits that do not affect it: a change only under `apps/blog` builds the blog alone, while a change outside the apps, such as a doc at the repo root, builds both. The group composes them on the shell's domain. Deployments built before the group existed must be redeployed once.
   A CLI deploy must also run from the repo root (`vercel deploy --prod --project <name>`): from inside `apps/<app>` the upload lacks the monorepo root and fails with "Root Directory does not exist".

## The four checks

Against the shell's production domain (`$HOST=https://mfe-lite-shell.vercel.app`):

| Check | Command | Expect |
|---|---|---|
| One domain | `curl -sI $HOST/blog \| grep x-mfe-zone`, same for `/docs` | `blog` (shell `/` answers `shell`) |
| Independent deployments | push a change under `apps/blog` only | only the blog builds; the shell's deployment is canceled as unaffected and `/` keeps serving its current deployment; each project keeps its own deployment list and rollback |
| One routing file | `curl -sI $HOST/does-not-exist \| grep -E '^HTTP\|x-mfe-zone'` | `404`, `shell`: nobody claims the path, so the default app answers |
| One page, two deployments | `curl -s $HOST/horizontal \| grep -o 'data-remote="[a-z-]*"'`, then push a change under `apps/blog/app/components` only | both remotes in the HTML; after the blog-only deploy the cards show the change while the shell's deployment is Canceled |

Blog assets load under `/vc-ap-<hash>/_next/...`, the hashed prefix `withMicrofrontends` gives the child zone. Shared state is checked in a browser: press Like on `/horizontal` and the header's ♥ count follows; reload, open `/blog/hello-world`, then go back Home, and the count stays. Recorded outputs: [EVIDENCE.md](EVIDENCE.md).

## Gotchas this demo encodes

- The shell's matcher must exclude `_next/`, `vc-ap-` and the child-owned `/blog`, `/docs` and `/components` paths, or the shell shadows the child.
- `withMicrofrontends` injects `MFE_CONFIG`, `NEXT_PUBLIC_MFE_CURRENT_APPLICATION` and the client's copy of the routing table at build time; the shared `Link` reads that copy to tell same-zone links from cross-zone ones.
- Both `next.config.ts` files wrap the config as `withRemoteComponentsConfig(withMicrofrontends(config))`.
- A link inside an embedded component is a plain `<a>`: the component does not know which zone the host page belongs to.
- A shared workspace package is bundled once per zone, embedded components included. State that both apps must see goes through the browser (here a `localStorage` key and a `window` event), not through a module variable or a React context.
- Hobby: one microfrontends group per team, two projects per group. The embedded components come from the blog, not a third project.
- Vercel skips a project that a commit does not affect (`enableAffectedProjectsDeployments`, on for both projects): a change only under `apps/blog` builds only the blog. A change outside the apps, even a doc at the repo root, builds both, and a commit with no file changes builds neither.

## Learn more

- [docs/architecture.md](docs/architecture.md): request flow, the horizontal page, shared state, the two projects and their settings, local vs production.
- [apps/shell/public/lab.html](apps/shell/public/lab.html), live at https://mfe-lite-shell.vercel.app/lab.html: a self-contained interactive lab served by the shell as a static file. It explains how the vertical and the horizontal split are set up and how they work: a vertical/horizontal explorer, a request router you can type any path into, the asset prefix, cross-zone navigation, `/horizontal` assembled step by step (with the blog down and an X-ray view), the shared like count, a blog-only deploy, and a map of every file involved.

## License

[MIT](LICENSE)
