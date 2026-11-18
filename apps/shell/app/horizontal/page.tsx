import { LikesMeter } from "@mfe-lite/ui/likes";
import { RemoteSlot } from "./remote-slot";

export const metadata = { title: "Horizontal" };

// Rendered per request, so a blog deployment shows up on the next page load without rebuilding the shell.
export const dynamic = "force-dynamic";

export default function Horizontal() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Horizontal split</span>
        <h1>One page, two deployments</h1>
        <p className="lead">
          The <strong>shell</strong> renders this page. The two dashed frames are filled by the <strong>blog</strong>{" "}
          project, fetched at request time and deployed on its own.
        </p>
      </header>

      <ul className="legend" aria-label="Legend">
        <li>
          <span className="swatch" data-zone="shell" aria-hidden="true" /> Rendered by the shell
        </li>
        <li>
          <span className="swatch" data-zone="blog" aria-hidden="true" /> Embedded from the blog
        </li>
      </ul>

      <div className="board">
        <RemoteSlot src="/components/latest-posts" label="Latest posts" />

        <div className="pair">
          <RemoteSlot src="/components/reactions" label="Reactions" />
          <div className="wire" aria-hidden="true">
            <span>one React context</span>
          </div>
          <section className="shell-panel" aria-labelledby="shared-count">
            <span className="tag">shell</span>
            <h2 id="shared-count">Shared like count</h2>
            <LikesMeter />
            <p className="small muted">
              Rendered by the shell. It reads the same React context the blog&apos;s button writes into, like the ♥ in
              the header.
            </p>
          </section>
        </div>

        <section aria-labelledby="travel">
          <h2 id="travel" className="section-title">
            How the count travels
          </h2>
          <ol className="flow grid grid-3">
            <li className="card">
              <span className="tag">blog · button</span>
              <p>
                Like calls <code>like()</code> from <code>LikesContext</code>. Both apps list{" "}
                <code>@mfe-lite/ui/likes-context</code> as <code>shared</code>, so the blog&apos;s import is the
                shell&apos;s module.
              </p>
            </li>
            <li className="card">
              <span className="tag">shell · provider</span>
              <p>
                The shell&apos;s <code>LikesProvider</code>, in its layout, updates its state. The panel and the ♥ in the
                header re-render.
              </p>
            </li>
            <li className="card">
              <span className="tag">browser · saved</span>
              <p>
                The provider saves the count, so a reload or a blog page starts from it. A count for every visitor would
                need a server store.
              </p>
            </li>
          </ol>
        </section>
      </div>
    </>
  );
}
