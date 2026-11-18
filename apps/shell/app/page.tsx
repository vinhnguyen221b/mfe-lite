import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Vercel Microfrontends · research demo</span>
        <h1>One domain, two deployments</h1>
        <p className="lead">
          This page comes from the <strong>shell</strong> project. <a href="/blog">/blog</a> and <a href="/docs">/docs</a>{" "}
          come from the <strong>blog</strong> project. Vercel serves both under this one domain.
        </p>
      </header>

      <section aria-label="Routing" className="card">
        <span className="tag">microfrontends.json</span>
        <div className="route-map" style={{ marginTop: "1rem" }}>
          <div className="route-domain">mfe-lite-shell.vercel.app</div>
          <div className="route-split" aria-hidden="true" />
          <div className="zones">
            <div className="zone" data-zone="shell">
              <h3>
                <span className="badge" data-zone="shell">
                  <span className="dot" aria-hidden="true" />
                  shell
                </span>
              </h3>
              <ul className="paths" aria-label="Paths the shell answers">
                <li>/</li>
                <li>/horizontal</li>
                <li>everything else</li>
              </ul>
            </div>
            <div className="zone" data-zone="blog">
              <h3>
                <span className="badge" data-zone="blog">
                  <span className="dot" aria-hidden="true" />
                  blog
                </span>
              </h3>
              <ul className="paths" aria-label="Paths the blog answers">
                <li>/blog</li>
                <li>/docs</li>
                <li>/components</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="muted small">
          The badge in the header names the project that rendered the page. With curl, the <code>x-mfe-zone</code> response
          header says the same.
        </p>
      </section>

      <h2 className="section-title">Two ways to split</h2>
      <div className="grid grid-3">
        <a href="/blog" className="card link-card">
          <span className="tag">Vertical</span>
          <h3>Whole pages</h3>
          <p>Each path belongs to one app. /blog and /docs are pages of the blog project.</p>
          <span className="go">Open /blog →</span>
        </a>
        <Link href="/horizontal" className="card link-card">
          <span className="tag">Horizontal</span>
          <h3>One page, both apps</h3>
          <p>A shell page with two components from the blog inside it, and one shared ♥ count.</p>
          <span className="go">Open /horizontal →</span>
        </Link>
        <a href="/lab.html" className="card link-card">
          <span className="tag">Lab</span>
          <h3>How it works</h3>
          <p>An interactive lab that traces a request step by step for both splits.</p>
          <span className="go">Open the lab →</span>
        </a>
      </div>
    </>
  );
}
