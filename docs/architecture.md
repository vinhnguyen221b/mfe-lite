# MFE Lite architecture

Two Next.js apps, one domain, one microfrontends group on the Vercel Hobby plan. This page is the short version;
`README.md` has the workflow, `EVIDENCE.md` the recorded outputs, and the lab
([apps/shell/public/lab.html](../apps/shell/public/lab.html), live at https://mfe-lite-shell.vercel.app/lab.html)
an interactive version of the request flows below.

The demo shows both ways of splitting a frontend:

- **Vertical**: each path belongs to one app. `/blog` and `/docs` are whole pages from the blog; `/` is a whole page from the shell.
- **Horizontal**: one page holds pieces from both apps. The shell's `/horizontal` embeds two components that the blog builds and deploys.

Across both, the two apps share one piece of state, a like count, through the browser rather than through code.

## Request flow

```
browser ──GET──▶ mfe-lite-shell.vercel.app ──▶ Vercel routing (group mfe-lite)
                                                 │  /blog, /blog/:path*, /docs, /docs/:path*,
                                                 │  /components, /components/:path*            ──▶ blog project  ──▶ x-mfe-zone: blog
                                                 │  everything else                            ──▶ shell project ──▶ x-mfe-zone: shell
```

1. The browser only ever talks to the shell's production domain. The blog project's own domain is never used by visitors.
2. Vercel's routing layer reads the group's routing table, which comes from `apps/shell/microfrontends.json`, before any code runs.
   `/blog`, `/docs`, `/components` and every path under them go to `mfe-lite-blog`. Every other path goes to the default app
   `mfe-lite-shell`, which answers with its own page or its 404. This is the only routing decision: neither app forwards requests
   to the other.
3. Each zone's `proxy.ts` (Next.js 16 "proxy" = middleware) only stamps `x-mfe-zone: shell | blog` on the responses it serves, so
   routing is checkable with `curl -sI`.
4. Child assets are served under the hashed prefix `/vc-ap-5d190e/_next/...` (given by `withMicrofrontends`); the default app keeps the bare `/_next/...` path.

## The horizontal page

```
browser ──GET /horizontal──▶ routing ──▶ shell renders /horizontal (per request)
                                           │  slot 1: GET https://mfe-lite-shell.vercel.app/components/latest-posts ──▶ routing ──▶ blog
                                           │  slot 2: GET https://mfe-lite-shell.vercel.app/components/reactions    ──▶ routing ──▶ blog
                                           ▼
browser ◀── one HTML page: the shell's text + both blog components ── then loads the blog's JavaScript from /vc-ap-5d190e/
```

| Piece | Where | What it does |
|---|---|---|
| `apps/blog/app/components/latest-posts/page.tsx` | blog | A Server Component wrapped in `ExposeRemoteComponent`; no client JavaScript |
| `apps/blog/app/components/reactions/page.tsx` | blog | A Client Component (Like button) wrapped in `ExposeRemoteComponent`; hydrates inside the shell's page; its count is shared (see below) |
| `apps/shell/app/horizontal/page.tsx` | shell | The host page, `dynamic = "force-dynamic"`; two `RemoteSlot`s |
| `apps/shell/app/horizontal/remote-slot.tsx` | shell | Error boundary → `Suspense` → `ConsumeRemoteComponent src="/components/…"` |
| `microfrontends.json` | shell | A third blog routing group: `/components`, `/components/:path*` |
| both `next.config.ts` | both | `withRemoteComponentsConfig(withMicrofrontends(config))` |

- **Server side.** `remote-components` (0.4.16) resolves a relative `src` against `https://$VERCEL_PROJECT_PRODUCTION_URL` in
  production, otherwise against `VERCEL_BRANCH_URL`, then `VERCEL_URL`, then the local proxy `http://localhost:3024`. In production
  the fetch therefore goes through the group's routing and reaches the blog's current production deployment.
- **Why per request.** A prerendered host would fetch the components at build time: the shell's build would depend on the blog
  being deployed first, and a blog deployment would not show until the shell rebuilt.
- **Failure.** Each slot's error boundary and `Suspense` keep a failing or slow component from taking down the page. With the blog
  stopped (checked locally), `/horizontal` answers 200 and both slots show their fallback.
- **Isolation.** Each component renders in an open Shadow DOM with the blog's own stylesheet; page-level selectors do not reach it.
- **Cost.** The blog's components load 12 JavaScript files, about 190 KB transferred, on top of the shell's own 12 files, about 187 KB.
- **Independence.** A commit that changes only `apps/blog` builds only the blog; the shell's deployment is canceled as unaffected,
  and the next request to `/horizontal` shows the new blog build (recorded in `EVIDENCE.md`).
- **Old assets.** Right after a blog deployment, the blog chunk URLs referenced by the previous version of the page still answered 200.

## Shared state

```
blog's Like button ──addLike()──▶ localStorage "mfe-lite:likes" ──read on load──▶ ♥ badge (any zone, any page)
         │                                   │
         └──window event "mfe-lite:likes"──▶ ♥ badge on the same page (the shell's header on /horizontal)
                                             └──storage event──▶ ♥ badge in other tabs
```

| Piece | Where | What it does |
|---|---|---|
| `packages/ui/src/likes/store.ts` | both zones, one copy each | `readLikes`, `addLike`, `subscribeLikes`: the browser contract, no React |
| `packages/ui/src/likes/client.tsx` | both zones, one copy each | `useLikes()` (`useSyncExternalStore`, 0 on the server), the header's `LikesBadge` and the large `LikesMeter` that `/horizontal` shows next to the Like button |
| `packages/ui/src/header.tsx` | both zones | Renders `LikesBadge` next to the zone badge |
| `apps/blog/app/components/reactions/reactions.tsx` | blog | The Like button: `addLike()` on click, `useLikes()` for its label; also used on each blog post |
| `apps/shell/__tests__/likes.test.ts` | shell | Loads two copies of the module, as the two zones do, and checks they agree |

- **Why the browser.** `remote-components` shares only `react`, `react-dom` and `next/*` with a remote. `@mfe-lite/ui` is bundled
  by each zone, so a module variable or a React context in it would exist twice, even on `/horizontal` where both run in one
  React tree. Between vertical pages there is no shared JavaScript at all: crossing zones is a full page load.
- **One origin.** Visitors reach both zones on `mfe-lite-shell.vercel.app`, so both read and write the same `localStorage`. The
  blog project's own domain is another origin with its own count.
- **Same page, other pages, other tabs.** The `window` event updates every badge on the current page; `localStorage` carries the
  count across reloads and zone changes; the browser's `storage` event updates other tabs. If storage is blocked, the count is
  kept on `window` for the current page only.
- **Failure.** With the blog stopped (checked locally), the shell's header still shows the stored count.
- **Scope.** The count is per browser. A count shared by every visitor would need server-side storage.

## The two projects

| | `mfe-lite-shell` | `mfe-lite-blog` |
|---|---|---|
| Role | default app; hosts `/horizontal` | child zone; serves the embedded components |
| Package / directory | `@mfe-lite/shell`, `apps/shell` | `@mfe-lite/blog`, `apps/blog` |
| Paths | `/` and every path nobody claims | `/blog`, `/blog/*`, `/docs`, `/docs/*`, `/components/*` |
| Owns | `microfrontends.json`, its pages and a `proxy.ts` that only stamps the zone header | its pages and a `proxy.ts` that only stamps the zone header |
| Vercel settings | Root Directory `apps/shell`, framework Next.js, Node 24 | Root Directory `apps/blog`, framework Next.js, Node 24 |
| Build command (`vercel.json`) | `cd ../.. && pnpm turbo build --filter=@mfe-lite/shell` | `cd ../.. && pnpm turbo build --filter=@mfe-lite/blog` |
| Git | this repo, production branch `main` | same repo, same branch; each project builds only its own app and skips commits that do not affect it |
| Local port | 3000 | 3001 |

Group `mfe-lite` (`vercel microfrontends create-group --name mfe-lite --default-app mfe-lite-shell --project mfe-lite-shell
--project mfe-lite-blog --project-default-route mfe-lite-blog=/docs`): `mfe-lite-shell` is the default app with default route `/`,
`mfe-lite-blog` has default route `/docs`, fallback environment `SAME_ENV`. Deployments built before the group existed do not read
`microfrontends.json`, so both projects were redeployed once after `create-group`.

`packages/ui` holds the shared header and the shared-likes contract (`@mfe-lite/ui/likes`). The header's links use `Link` from `@vercel/microfrontends/next/client`: inside a zone a link stays a
client-side navigation, into the other zone it becomes a full navigation. `withMicrofrontends` gives each app a copy of the routing
table at build time (`NEXT_PUBLIC_MFE_CLIENT_CONFIG`), so `Link` knows which zone a path belongs to without a request. Links inside
an embedded component are plain `<a>` tags: the component cannot know which zone its host page belongs to.

## The shell's proxy matcher

The shell's `proxy.ts` uses the catch-all `/((?!_next/|vc-ap-|favicon.ico|blog/|blog$|docs/|docs$|components/|components$).*)`.
Rules it follows (checked by `apps/shell/__tests__/routing.test.ts`):

- exclude `_next/`, `vc-ap-`, `favicon.ico` and the child-owned `/blog`, `/docs` and `/components` paths, or the shell shadows the child;
- exclude them as `blog/` and `blog$` rather than `blog`, so shell paths such as `/blogroll` or `/componentry` are still matched.

## Local vs production

| | Local (`pnpm dev`) | Production |
|---|---|---|
| Entry point | microfrontends proxy on `localhost:3024` (from `options.localProxyPort`) | `https://mfe-lite-shell.vercel.app` |
| Routing | done by the local proxy from `microfrontends.json` | done by Vercel from the group's routing table |
| Missing app | `development.fallback` points the shell at `mfe-lite-shell.vercel.app` | n/a |
| Env injection | `withMicrofrontends` injects `MFE_CONFIG`, `NEXT_PUBLIC_MFE_CURRENT_APPLICATION`, `NEXT_PUBLIC_MFE_CLIENT_CONFIG` | same, at build time on Vercel |
| Embedded components | fetched from `http://localhost:3024/components/…` | fetched from `https://mfe-lite-shell.vercel.app/components/…` (preview deployments use their branch URL, which is behind Deployment Protection) |

## Hobby limits that shaped the demo

- One microfrontends group per account and two projects per group (the first two are free). The `mfe-lite` group currently
  holds the account's only slot, so the embedded components come from the blog rather than a third project.
- `create-group` must list the default app among `--project` too.
- A CLI deploy must run from the repo root (`vercel deploy --prod --project <name>`), or the upload lacks the monorepo root.
- No Skew Protection on Hobby: nothing pins an open page to the deployment it was loaded from.
