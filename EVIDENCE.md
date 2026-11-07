# Evidence

Date: 2026-10-26 · a Vercel Hobby team · CLI 65.2.0 · `@vercel/microfrontends` 2.4.2 · `next` 16.4.3

> 2026-11-06: the demo was simplified twice. First the shell's `/about` page was removed and `/docs` gained four articles.
> Then the flag `new-blog` and the shell's old `/blog` page were removed: `/blog` now belongs to the blog zone outright, like `/docs`,
> and the shell's proxy only stamps `x-mfe-zone`. The records below are kept as captured at the time, so the earlier sections still
> show the flag; the last section has the current checks.

## Local (proxy on 3024, `pnpm dev`)

```
$ pnpm test      → 4 passed (routing contract, flag routing)
$ pnpm typecheck → 3 packages successful
$ pnpm build     → shell: /, /about, /blog, Proxy · blog: /, /blog, /blog/[slug], /docs, /docs/[slug], Proxy

/                                               200 x-mfe-zone: shell
/about                                          200 x-mfe-zone: shell
/docs                                           200 x-mfe-zone: blog
/docs/routing                                   200 x-mfe-zone: blog
/blog                                           200 x-mfe-zone: shell        (flag off)
/blog  -b new-blog=1                            200 x-mfe-zone: blog         (flag on, cookie)
/blog  -H 'x-vercel-mfe-flag-value: true'       200 x-mfe-zone: blog         (flag forced by the local proxy)
/.well-known/vercel/microfrontends/client-config 200
  {"config":{"applications":{"5d190e":{"default":false,"routing":[{"paths":["/docs","/docs/:path*"]}]},"952d86":{"default":true}},"hasFlaggedPaths":true}}
blog assets in /docs HTML: vc-ap-5d190e
```

## Production

Projects `mfe-lite-shell` (prj_PAOIuQvdttUmYE7wTrxi5VB1610u, Root Directory `apps/shell`) and `mfe-lite-blog` (prj_Nw8k1tIqt1ZV1E8y8KUJnznFgW5s, Root Directory `apps/blog`), Node 24, framework Next.js. First production deployments were made with `vercel deploy --prod --project <name>` from the repo root (33 s and 34 s builds).

Standalone domains before the group exists:

```
shell /        200 x-mfe-zone: shell
shell /about   200 x-mfe-zone: shell
shell /blog    200 x-mfe-zone: shell
shell /docs    404                       (not in a group yet: the shell has no /docs)
shell /.well-known/vercel/microfrontends/client-config 200
blog  /docs          200 x-mfe-zone: blog
blog  /docs/routing  200 x-mfe-zone: blog
blog assets: vc-ap-5d190e
```

### Blockers found and resolved (2026-10-26)

1. **Hobby allows one microfrontends group per team.** The first `create-group` answered "You've reached the microfrontends group
   limit for Hobby": a group from an earlier experiment held the slot, so it was deleted first. `create-group` must list the
   default app among `--project` too, or it answers "Default app must be one of the selected projects".
2. **The Vercel GitHub App did not have access to `mfe-lite` yet** (creating the projects with `gitRepository` answered `repo_not_found`).
   The owner granted access to `mfe-lite`; `vercel git connect` (repo root for shell, `--cwd apps/blog` for blog) answered
   "Connected" for both. The next push to `main` produced Git production deployments for both projects (19 s each).
3. Deployments built before the group existed do not read `microfrontends.json`; both projects were redeployed once after
   `create-group` (`vercel redeploy <git-deployment-url>`), 33 s and 31 s.

## Group

```
$ vercel microfrontends create-group --name mfe-lite --default-app mfe-lite-shell \
    --project mfe-lite-shell --project mfe-lite-blog --project-default-route mfe-lite-blog=/docs --yes
> Project fee: Free (first 2 included) · Success! Microfrontends group "mfe-lite" created
$ vercel microfrontends inspect-group --group mfe-lite --format json
  id mfe_3138wrTSn9Z4jwg2cstvT0fDo8xV · fallbackEnvironment SAME_ENV
  mfe-lite-shell  isDefaultApp true  defaultRoute /      git <owner>/mfe-lite apps/shell
  mfe-lite-blog   isDefaultApp false defaultRoute /docs  git <owner>/mfe-lite apps/blog
```

## Group checks on https://mfe-lite-shell.vercel.app (2026-10-26)

```
/                                   200 x-mfe-zone: shell
/about                              200 x-mfe-zone: shell
/docs                               200 x-mfe-zone: blog
/docs/routing                       200 x-mfe-zone: blog
/blog                               200 x-mfe-zone: shell     <h1>Blog (legacy)</h1>
/blog/hello-world                   404 x-mfe-zone: shell     (shell has no such page; flag off)
/blog              -b new-blog=1    200 x-mfe-zone: blog      <h1>Blog (new)</h1>
/blog/hello-world  -b new-blog=1    200 x-mfe-zone: blog

/.well-known/vercel/microfrontends/client-config  200 application/json
  no cookie: {"config":{"applications":{"5d190e":{"default":false,"routing":[{"paths":["/docs","/docs/:path*"]}]},"952d86":{"default":true}},"hasFlaggedPaths":true}}
  new-blog=1: {"config":{"applications":{"5d190e":{"default":false,"routing":[{"paths":["/blog","/blog/:path*","/docs","/docs/:path*"]}]},"952d86":{"default":true}},"hasFlaggedPaths":true}}

/docs HTML references /vc-ap-5d190e/_next/static/immutable/chunks/01bz81oyfyjyz.js
GET /vc-ap-5d190e/_next/static/immutable/chunks/01bz81oyfyjyz.js → 200 application/javascript
/ HTML references /_next/static/immutable/chunks/... (default app, no prefix)
```

| # | Check | Result |
|---|---|---|
| 1 | `/`, `/about` → `x-mfe-zone: shell` | pass |
| 2 | `/docs` → `x-mfe-zone: blog` | pass |
| 3 | `/blog` → shell; `-b new-blog=1` → blog | pass |
| 4 | `/.well-known/vercel/microfrontends/client-config` → JSON | pass (flagged paths appear only when the cookie is set) |
| 5 | child assets under `/vc-ap-<hash>/` | pass (`vc-ap-5d190e`) |

## After removing `/about` and expanding `/docs` (2026-11-06)

Commit `1bd58e9`, pushed to `main`. Both projects built from Git on their own (Production and Preview each, 18–25 s); the change was live about 50 s after the push.

```
$ pnpm test      → 4 passed
$ pnpm typecheck → 3 packages successful
$ pnpm build     → shell: /, /blog, Proxy · blog: /, /blog, /blog/[slug], /docs,
                   /docs/[slug] (getting-started, routing, flag-migration, deploy), Proxy
```

On https://mfe-lite-shell.vercel.app:

```
/                         200 x-mfe-zone: shell
/about                    404 x-mfe-zone: shell     (page removed; the shell answers its 404)
/docs                     200 x-mfe-zone: blog
/docs/getting-started     200 x-mfe-zone: blog
/docs/routing             200 x-mfe-zone: blog
/docs/flag-migration      200 x-mfe-zone: blog
/docs/deploy              200 x-mfe-zone: blog
/blog                     200 x-mfe-zone: shell
/blog  -b new-blog=1      200 x-mfe-zone: blog
header nav: Home · Blog · Docs
```

## After removing the flag (2026-11-06)

`microfrontends.json` now gives the blog two unflagged groups, `/blog, /blog/:path*` and `/docs, /docs/:path*`. The shell's
`proxy.ts` no longer calls `runMicrofrontendsMiddleware`; it only stamps `x-mfe-zone: shell`. The `flags` package, the shell's
`/blog` page and the `flag-migration` article are gone; `/docs` has a new article, `links-and-assets`.

```
$ pnpm test      → 5 passed (routing contract ×2, shell proxy matcher ×3)
$ pnpm typecheck → 3 packages successful
$ pnpm build     → shell: /, Proxy · blog: /, /blog, /blog/[slug] (hello-world, why-microfrontends), /docs,
                   /docs/[slug] (getting-started, routing, links-and-assets, deploy), Proxy
```

Local, production builds behind the microfrontends proxy (proxy on 3124, shell on 3100, blog on 3101, from a copy of
`microfrontends.json` with those ports, because port 3000 was in use on the machine):

```
/                         200 x-mfe-zone: shell
/blog                     200 x-mfe-zone: blog      <h1>Blog</h1>
/blog/hello-world         200 x-mfe-zone: blog
/blog/why-microfrontends  200 x-mfe-zone: blog
/docs                     200 x-mfe-zone: blog
/docs/links-and-assets    200 x-mfe-zone: blog
/does-not-exist           404 x-mfe-zone: shell
/lab.html                 200 x-mfe-zone: shell
/vc-ap-5d190e/_next/static/chunks/0043ecq1sndmv.js  200 application/javascript
header links on /: "/" same zone; "/blog" and "/docs" cross-zone (data-zone 5d190e)
```

On https://mfe-lite-shell.vercel.app, after commit `4461755` was pushed and both projects built from Git:

```
/                                                 200 x-mfe-zone: shell
/blog                                             200 x-mfe-zone: blog      <h1>Blog</h1>
/blog/hello-world                                 200 x-mfe-zone: blog
/blog/why-microfrontends                          200 x-mfe-zone: blog
/docs                                             200 x-mfe-zone: blog
/docs/getting-started                             200 x-mfe-zone: blog
/docs/routing                                     200 x-mfe-zone: blog
/docs/links-and-assets                            200 x-mfe-zone: blog
/docs/deploy                                      200 x-mfe-zone: blog
/docs/flag-migration                              404 x-mfe-zone: blog      (article removed)
/does-not-exist                                   404 x-mfe-zone: shell
/lab.html                                         200 x-mfe-zone: shell     (tabs: overview, request, checks, cheatsheet)
/.well-known/vercel/microfrontends/client-config  404 x-mfe-zone: shell     (no longer served: no flagged paths)
/blog  -b new-blog=1                              200 x-mfe-zone: blog      (the old cookie has no effect)
/vc-ap-5d190e/_next/static/immutable/chunks/01bz81oyfyjyz.js  200 application/javascript
/ HTML references /_next/static/immutable/chunks/... (default app, no prefix)
```

| # | Check | Result |
|---|---|---|
| 1 | `/` → `x-mfe-zone: shell` | pass |
| 2 | `/blog`, `/blog/*` → `x-mfe-zone: blog` | pass |
| 3 | `/docs`, `/docs/*` → `x-mfe-zone: blog` | pass |
| 4 | an unclaimed path → the shell's 404 | pass |
| 5 | child assets under `/vc-ap-<hash>/` | pass (`vc-ap-5d190e`) |

## Repository recreated (2026-11-07)

The Git history was squashed into one commit and the GitHub repository was recreated. Both Vercel projects were reconnected
(`vercel git disconnect`, then `vercel git connect <repo-url>`, the blog with `--cwd apps/blog`); `link.repoId` points at the new
repository for both.

- The first push was **BLOCKED** on both projects: "Vercel couldn't find a Git account for the commit author". On Hobby, a Git
  deployment is built only when the commit author's email belongs to the owner's Git account. A GitHub noreply address of the
  owner passes.
- An empty commit was **CANCELED** on both projects: "the commit didn't affect this project". Both projects have
  `enableAffectedProjectsDeployments: true`. `vercel redeploy <canceled-deployment-url>` built it.
- A docs-only commit (`3e3da61`, only `EVIDENCE.md` changed) still built **both** projects, a Production and a Preview each,
  all READY. Files outside the apps count as affecting every project; only a commit with no file changes was skipped.
