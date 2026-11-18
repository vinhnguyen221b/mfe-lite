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
            <span>localStorage + window event</span>
          </div>
          <section className="shell-panel" aria-labelledby="shared-count">
            <span className="tag">shell</span>
            <h2 id="shared-count">Shared like count</h2>
            <LikesMeter />
            <p className="small muted">
              Rendered by the shell. It follows every Like in the blog&apos;s card, like the ♥ in the header.
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
                Like adds one to the localStorage key <code>mfe-lite:likes</code>.
              </p>
            </li>
            <li className="card">
              <span className="tag">browser</span>
              <p>
                It fires the <code>mfe-lite:likes</code> window event. Other tabs get a <code>storage</code> event.
              </p>
            </li>
            <li className="card">
              <span className="tag">shell · header and panel</span>
              <p>Each copy of the likes code re-reads the key. A reload or a blog page keeps the count.</p>
            </li>
          </ol>
        </section>
      </div>
    </>
  );
}
