# MFE Lite architecture

Two Next.js apps, one domain, one microfrontends group on the Vercel Hobby plan. This page is the short version;
`README.md` has the workflow, `EVIDENCE.md` the recorded outputs, and the lab
([apps/shell/public/lab.html](../apps/shell/public/lab.html), live at https://mfe-lite-shell.vercel.app/lab.html)
an interactive version of the request flow below.

## Request flow

```
browser ──GET──▶ mfe-lite-shell.vercel.app ──▶ Vercel routing (group mfe-lite)
                                                 │  /blog, /blog/:path*, /docs, /docs/:path*  ──▶ blog project  ──▶ x-mfe-zone: blog
                                                 │  everything else                           ──▶ shell project ──▶ x-mfe-zone: shell
```

1. The browser only ever talks to the shell's production domain. The blog project's own domain is never used by visitors.
2. Vercel's routing layer reads the group's routing table, which comes from `apps/shell/microfrontends.json`, before any code runs.
   `/blog`, `/docs` and every path under them go to `mfe-lite-blog`. Every other path goes to the default app `mfe-lite-shell`,
   which answers with its own page or its 404. This is the only routing decision: neither app forwards requests to the other.
3. Each zone's `proxy.ts` (Next.js 16 "proxy" = middleware) only stamps `x-mfe-zone: shell | blog` on the responses it serves, so
   routing is checkable with `curl -sI`.
4. Child assets are served under the hashed prefix `/vc-ap-5d190e/_next/...` (given by `withMicrofrontends`); the default app keeps the bare `/_next/...` path.

## The two projects

| | `mfe-lite-shell` | `mfe-lite-blog` |
|---|---|---|
| Role | default app | child zone |
| Package / directory | `@mfe-lite/shell`, `apps/shell` | `@mfe-lite/blog`, `apps/blog` |
| Paths | `/` and every path nobody claims | `/blog`, `/blog/*`, `/docs`, `/docs/*` |
| Owns | `microfrontends.json`, its pages and a `proxy.ts` that only stamps the zone header | its pages and a `proxy.ts` that only stamps the zone header |
| Vercel settings | Root Directory `apps/shell`, framework Next.js, Node 24 | Root Directory `apps/blog`, framework Next.js, Node 24 |
| Build command (`vercel.json`) | `cd ../.. && pnpm turbo build --filter=@mfe-lite/shell` | `cd ../.. && pnpm turbo build --filter=@mfe-lite/blog` |
| Git | this repo, production branch `main` | same repo, same branch; each project builds only its own app, and every push builds both |
| Local port | 3000 | 3001 |

Group `mfe-lite` (`vercel microfrontends create-group --name mfe-lite --default-app mfe-lite-shell --project mfe-lite-shell
--project mfe-lite-blog --project-default-route mfe-lite-blog=/docs`): `mfe-lite-shell` is the default app with default route `/`,
`mfe-lite-blog` has default route `/docs`, fallback environment `SAME_ENV`. Deployments built before the group existed do not read
`microfrontends.json`, so both projects were redeployed once after `create-group`.

`packages/ui` holds the shared header. Its links use `Link` from `@vercel/microfrontends/next/client`: inside a zone a link stays a
client-side navigation, into the other zone it becomes a full navigation. `withMicrofrontends` gives each app a copy of the routing
table at build time (`NEXT_PUBLIC_MFE_CLIENT_CONFIG`), so `Link` knows which zone a path belongs to without a request.

## The shell's proxy matcher

The shell's `proxy.ts` uses the catch-all `/((?!_next/|vc-ap-|favicon.ico|blog/|blog$|docs/|docs$).*)`. Rules it follows (checked by
`apps/shell/__tests__/routing.test.ts`):

- exclude `_next/`, `vc-ap-`, `favicon.ico` and the child-owned `/blog` and `/docs` paths, or the shell shadows the child;
- exclude them as `blog/` and `blog$` rather than `blog`, so a shell path such as `/blogroll` is still matched.

## Local vs production

| | Local (`pnpm dev`) | Production |
|---|---|---|
| Entry point | microfrontends proxy on `localhost:3024` (from `options.localProxyPort`) | `https://mfe-lite-shell.vercel.app` |
| Routing | done by the local proxy from `microfrontends.json` | done by Vercel from the group's routing table |
| Missing app | `development.fallback` points the shell at `mfe-lite-shell.vercel.app` | n/a |
| Env injection | `withMicrofrontends` injects `MFE_CONFIG`, `NEXT_PUBLIC_MFE_CURRENT_APPLICATION`, `NEXT_PUBLIC_MFE_CLIENT_CONFIG` | same, at build time on Vercel |

## Hobby limits that shaped the demo

- One microfrontends group per account and two projects per group (the first two are free). The `mfe-lite` group currently
  holds the account's only slot.
- `create-group` must list the default app among `--project` too.
- A CLI deploy must run from the repo root (`vercel deploy --prod --project <name>`), or the upload lacks the monorepo root.
