export default function Home() {
  return (
    <>
      <h1>One domain, two deployments</h1>
      <p>
        This page comes from the <strong>shell</strong> project. <a href="/blog">/blog</a> and <a href="/docs">/docs</a>{" "}
        come from the <strong>blog</strong> project. Both are served under this one domain by Vercel Microfrontends.
      </p>
      <div className="card">
        <p>
          The badge in the header names the project that rendered the page. With curl, the <code>x-mfe-zone</code>{" "}
          response header says the same: <code>shell</code> here, <code>blog</code> on <code>/blog</code> and{" "}
          <code>/docs</code>. The <a href="/lab.html">interactive lab</a> traces a request step by step.
        </p>
      </div>
    </>
  );
}
