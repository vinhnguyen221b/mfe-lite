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
- A commit that changed only `apps/blog` (`5fbb141`) built only the blog, a Production and a Preview; both shell deployments
  were CANCELED as unaffected, and the shell kept serving its previous deployment.

## Horizontal: one page, two deployments (2026-11-18)

The shell's `/horizontal` page renders its own text plus two components built and served by the blog project, using
`remote-components` 0.4.16. The blog exposes `/components/latest-posts` (a Server Component) and `/components/reactions` (a Client
Component with a Like button), each wrapped in `ExposeRemoteComponent`; the shell embeds them with `ConsumeRemoteComponent`, each
inside an error boundary and `Suspense`. `microfrontends.json` gives the blog a third routing group, `/components, /components/:path*`.
`/horizontal` is rendered per request (`dynamic = "force-dynamic"`). On the server, a relative `src` resolves against
`https://$VERCEL_PROJECT_PRODUCTION_URL` in production, so the fetch goes through the group's routing to the blog.

```
$ pnpm test      → 5 passed (routing contract ×2 incl. /components/*, shell proxy matcher ×3)
$ pnpm typecheck → 3 packages successful
$ pnpm build     → shell: /, /horizontal (dynamic), Proxy · blog: /, /blog, /blog/[slug], /components/latest-posts,
                   /components/reactions, /docs, /docs/[slug], Proxy
```

Commit `2ccdb5d` touched both apps, `packages/ui` and the lockfile, so both projects built (Production and Preview each, all READY,
25–26 s). On https://mfe-lite-shell.vercel.app:

```
/                          200 x-mfe-zone: shell     header nav: Home · Blog · Docs · Horizontal
/horizontal                200 x-mfe-zone: shell
/components/latest-posts   200 x-mfe-zone: blog
/components/reactions      200 x-mfe-zone: blog
/blog, /blog/hello-world   200 x-mfe-zone: blog
/docs, /docs/routing       200 x-mfe-zone: blog
/does-not-exist            404 x-mfe-zone: shell
/lab.html                  200 x-mfe-zone: shell

/horizontal HTML: both remotes server-rendered (data-remote="latest-posts", data-remote="reactions"), no fallback,
                  build stamps 2ccdb5d ×3 (shell text, both blog cards), badges shell ×2, blog ×2
blog chunks under /vc-ap-5d190e/ → 200 application/javascript
```

In a browser: three clicks on Like showed `Like · 3`, no console errors. Each remote sits in an open Shadow DOM, so
`document.querySelector('[data-remote]')` from the page returns null. The blog loads 12 JavaScript chunks (about 190 KB
transferred); the shell's own JavaScript is 12 chunks, about 187 KB.

Commit `57e241f` changed only `apps/blog/app/components/latest-posts/page.tsx` (post summaries and an "All posts" link):

```
mfe-lite-shell  production  CANCELED  "The deployment was canceled because the commit didn't affect this project."
mfe-lite-shell  preview     CANCELED
mfe-lite-blog   production  READY     20 s
mfe-lite-blog   preview     READY     18 s

/horizontal after the blog deployment, no shell build:
  shell text   build 2ccdb5d   (unchanged)
  both cards   build 57e241f   ("All posts" link and summaries present)
  the 10 blog chunk URLs referenced by the page before the deployment still returned 200
```

In a browser: Like still counted, "All posts" opened `/blog` (blog zone), and the blog header's Horizontal link returned to
`/horizontal`.

| # | Check | Result |
|---|---|---|
| 1 | `/components/*` → `x-mfe-zone: blog` | pass |
| 2 | `/horizontal` HTML holds both remotes, server-rendered | pass |
| 3 | the remote Client Component hydrates and counts clicks | pass |
| 4 | a blog-only commit builds only the blog (shell CANCELED) | pass |
| 5 | `/horizontal` shows the new blog build without a shell build | pass (shell `2ccdb5d`, blog `57e241f`) |

Not checked on production: a blog outage. Locally, with the blog stopped, `/horizontal` answered 200 and both slots showed their
fallback. Preview deployments are behind Deployment Protection, and outside production a relative `src` resolves against the
branch or deployment URL, so `/horizontal` is only demonstrated on production.

Commit `caa5c1a` changed only `EVIDENCE.md` at the repo root, so both projects built (Production and Preview each, READY, 11–13 s).
Both builds were Turborepo remote-cache hits ("cache hit, replaying logs"): the app inputs had not changed, and
`VERCEL_GIT_COMMIT_SHA` is not part of the cache key. Afterwards `/horizontal` showed the shell text at `caa5c1a` (rendered per
request, so it reads the deployment's environment) and both blog cards still at `57e241f` (static pages, replayed from the cache).
The build commit printed on a static page is the last commit that changed that app.

## Next.js 16.4.6 (2026-11-18)

`next` 16.4.3 was affected by two moderate advisories, GHSA-mfr8-8qww-v76h and GHSA-vc7v-qv4w-wrv8, both about `'use cache'`
and `unstable_cache()`, which this repo does not use. Commit `8e00da8` pins `next` 16.4.6 in both apps and `packages/ui`.

```
$ pnpm audit --prod → no advisories for next
$ pnpm test         → 5 passed
$ pnpm typecheck    → 3 packages successful
$ pnpm build        → Next.js 16.4.6 (Turbopack), same routes as before
```

The lockfile changed, so both projects built from scratch (Turborepo cache miss), Production and Preview each, all READY in
28–32 s. On https://mfe-lite-shell.vercel.app:

```
/                          200 x-mfe-zone: shell
/horizontal                200 x-mfe-zone: shell     both remotes server-rendered, no fallback, build 8e00da8 ×3
/components/latest-posts   200 x-mfe-zone: blog
/components/reactions      200 x-mfe-zone: blog
/blog, /blog/hello-world   200 x-mfe-zone: blog
/docs, /docs/routing       200 x-mfe-zone: blog
/does-not-exist            404 x-mfe-zone: shell
/lab.html                  200 x-mfe-zone: shell
blog chunks under /vc-ap-5d190e/ → 200 application/javascript
```

In a browser, two clicks on Like showed `Like · 2`, with no console errors.

## follow-redirects override (2026-11-18)

`@vercel/microfrontends` 2.4.2 pulls `follow-redirects` 1.16.1 through `http-proxy` 1.18.1, used by the local microfrontends
proxy (GHSA-mrwp-f3q8-3g9p, high, fixed in 1.16.2). `pnpm-workspace.yaml` now overrides it to 1.16.2.

```
$ pnpm why follow-redirects -r → follow-redirects@1.16.2 ← http-proxy@1.18.1 ← @vercel/microfrontends@2.4.2
$ pnpm audit --prod             → one advisory left: picomatch <=4.0.7 (GHSA-fc5q-39xc-vjpf), no patched version yet
$ pnpm test / typecheck / build → 5 passed / 3 packages successful / both apps built
```

## Shared likes across zones (2026-11-18)

A Like pressed in a blog component updates a count in the shell's header. `remote-components` shares only `react`, `react-dom`
and `next/*` between host and remote by default, so each zone bundles its own copy of `@mfe-lite/ui`; a module variable or a
React context there would exist twice. The copies agree through the browser instead: `@mfe-lite/ui/likes` keeps the count in
`localStorage` under `mfe-lite:likes`, fires a `mfe-lite:likes` event on `window` after each change, and listens to the browser's
`storage` event for other tabs. The header (both zones) shows `♥ N`; the blog's Reactions card and a new Like on each post write it.

```
$ pnpm test      → 11 passed (routing contract ×2, shell proxy matcher ×3, shared likes ×6: two separately loaded copies
                   of the module see the same count, other tabs, broken stored values, storage blocked)
$ pnpm typecheck → 3 packages successful
$ pnpm build     → same routes as before
```

Commit `31caaea` touched both apps and `packages/ui`, so both projects built (Production and Preview each, all READY, 22–30 s).
On https://mfe-lite-shell.vercel.app:

```
/, /horizontal, /does-not-exist, /lab.html      x-mfe-zone: shell   (200, 200, 404, 200)
/components/*, /blog, /blog/hello-world, /docs  x-mfe-zone: blog    (all 200)

/horizontal HTML: header data-likes="0", both remotes server-rendered, Reactions "Like · 0", no fallback, build 31caaea ×3
/blog/hello-world HTML: header data-likes="0", one Like button
```

In a browser, starting from an empty `localStorage`:

| # | Step | Result |
|---|---|---|
| 1 | `/horizontal`: three clicks on the blog's Like (inside an open Shadow DOM) | the shell's header shows `♥ 3` at once |
| 2 | reload `/horizontal` | `♥ 3`, `Like · 3` |
| 3 | "Hello, world" link → `/blog/hello-world` (blog zone), two clicks on Like | `♥ 5`, `Like · 5` |
| 4 | header Home → `/` (shell zone) | `♥ 5` |
| 5 | a second tab on `/docs`, one click on Like in the first tab | the second tab shows `♥ 6` without reloading |
| 6 | https://mfe-lite-blog.vercel.app/blog/hello-world | `♥ 0`: another origin, so another `localStorage` |

No console errors on `/horizontal` or `/docs`. Not checked on production: a blog outage. Locally, with the blog stopped,
`/horizontal` still showed the stored count in the header and both slots showed their fallback.

The count is per browser and per origin. A count shared by every visitor would need server-side storage.

## Blueprint redesign, no build stamp

Commit `4f5c0d3` restyled every page (one shared stylesheet in `packages/ui`) and removed the build commit that `/horizontal`
and both blog cards used to print: it was easy to misread (see the Turborepo cache note above). Deploy independence is shown
by the Vercel deployment list instead. `/horizontal` now frames each blog component in a dashed box and shows the shared count
in a shell panel next to the Like button.

```
$ pnpm test      → 11 passed
$ pnpm typecheck → 3 packages successful
$ pnpm build     → same routes as before
```

The commit touched both apps and `packages/ui`, so both projects built (Production READY in 21–23 s). On
https://mfe-lite-shell.vercel.app:

```
/, /horizontal, /lab.html                                   x-mfe-zone: shell   (all 200)
/blog, /blog/hello-world, /docs, /docs/horizontal,
/components/reactions                                       x-mfe-zone: blog    (all 200)

/horizontal HTML: header likes pill, two shell-drawn slots, both remotes server-rendered, shell panel, no "build <sha>"
```

In a browser on `/horizontal`, two clicks on the blog's Like took the header pill, the shell panel and the button from 6 to 8;
`/blog/hello-world` then showed 8 with "Blog" marked as the current page. No console errors.

## Shared React context on /horizontal (2026-11-18)

This replaces the mechanism in "Shared likes across zones" above. The count now lives in a `LikesProvider` (React state)
that each zone renders in its root layout. Both apps pass `shared: ["@mfe-lite/ui/likes-context"]` to
`withRemoteComponentsConfig`, so the blog's remote manifest lists `packages/ui/src/likes/context.tsx` as a required
singleton and, on `/horizontal`, the blog's Like button imports the shell's live copy of that module. It finds the shell's
provider: the button, the shell panel and the header read one context. `localStorage` (`mfe-lite:likes`) is only persistence
now, for reloads and moving between zones; the window event is gone.

```
$ pnpm test      → 12 passed (routing ×5; likes ×7: a consumer from the same module copy as the provider is connected,
                   one from a separate copy is not; save/load, broken values, other tabs, storage blocked)
$ pnpm typecheck → 3 packages successful
$ pnpm build     → same routes as before
```

Locally (`next start` on 3100/3101 behind the microfrontends proxy), with a control build:

| Build | Click Like in the blog card on `/horizontal` |
|---|---|
| both apps with `shared` | button `data-store="shell"`; the shell panel follows each click |
| blog built with `shared: []` | button finds no shell provider; the shell panel stays at 0 |

With the blog stopped, `/horizontal` still answered 200 and both slots showed their fallback.

Commit `3ff8ea0` touched both apps and `packages/ui`, so both projects built (Production READY in 22–23 s, Preview 20–21 s).
On https://mfe-lite-shell.vercel.app:

```
/, /horizontal, /blog, /blog/hello-world, /docs, /components/reactions, /components/latest-posts   all 200
/horizontal HTML: "one React context" in the page; the remote's server HTML says data-store="blog"
                  (the blog renders it under its own layout); the browser swaps in the shell's module on load
```

In a browser, starting from a saved count of 8:

| # | Step | Result |
|---|---|---|
| 1 | `/horizontal` after load | button `data-store="shell"`; header, button and shell panel all show 8 |
| 2 | three real clicks on the blog's Like | header, button and panel 11; saved count 11 |
| 3 | `/blog/hello-world` (blog zone) | button `data-store="blog"` (the blog's own provider), header 11 |
| 4 | a second tab on `/docs`, two clicks on the article's Like | first tab 13; the second tab shows 13 without reloading |
| 5 | header Home → `/` (shell zone) | 13 |

No console errors. The count stays per browser and per origin; a count shared by every visitor needs server-side storage.
