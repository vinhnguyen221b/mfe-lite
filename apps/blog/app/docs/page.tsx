import Link from "next/link";
import { DOCS } from "@/lib-posts";

export const metadata = { title: "Docs" };

// /docs is owned by the blog zone: Vercel routes it here and the shell never sees these requests.
export default function Docs() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Vertical split · blog zone</span>
        <h1>Docs</h1>
        <p className="lead">
          MFE Lite shows four things and nothing else. The first three split the site by path (vertical); the fourth puts
          both apps on one page (horizontal).
        </p>
      </header>
      <ol className="spec grid grid-2">
        <li className="card">
          <strong>One domain</strong>
          <span>In front of two independently deployed Next.js apps.</span>
        </li>
        <li className="card">
          <strong>Independent deployments</strong>
          <span>
            Each app has its own builds, deployments and rollbacks; a failed blog build leaves the shell up.
          </span>
        </li>
        <li className="card">
          <strong>One routing file</strong>
          <span>
            <code>microfrontends.json</code> in the shell lists the paths the blog owns (<code>/blog</code>,{" "}
            <code>/docs</code>, <code>/components</code>); the shell answers everything else.
          </span>
        </li>
        <li className="card">
          <strong>One page, two deployments</strong>
          <span>
            The shell&apos;s <a href="/horizontal">/horizontal</a> page embeds two components that this blog project
            builds and deploys. A Like pressed in one of them also updates the ♥ count in the shell&apos;s header.
          </span>
        </li>
      </ol>
      <h2 className="section-title">Articles</h2>
      <ul className="index">
        {DOCS.map((d) => (
          <li key={d.slug}>
            <Link href={`/docs/${d.slug}`}>
              <strong>{d.title}</strong>
              <span>{d.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="card muted small">
        This page is served by the <strong>blog</strong> project: Vercel sends <code>/docs</code> here directly, so the
        shell&apos;s proxy never runs for it. Diagrams and step-by-step request traces are in the{" "}
        <a href="/lab.html">interactive lab</a>.
      </p>
    </>
  );
}
