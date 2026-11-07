import Link from "next/link";
import { DOCS } from "@/lib-posts";

export const metadata = { title: "Docs" };

// /docs is owned by the blog zone: Vercel routes it here and the shell never sees these requests.
export default function Docs() {
  return (
    <>
      <h1>Docs</h1>
      <p>MFE Lite shows three things and nothing else:</p>
      <ol>
        <li>
          <strong>One domain</strong> in front of two independently deployed Next.js apps.
        </li>
        <li>
          <strong>Independent deployments:</strong> each app has its own builds, deployments and rollbacks; a failed blog
          build leaves the shell up.
        </li>
        <li>
          <strong>One routing file:</strong> <code>microfrontends.json</code> in the shell lists the paths the blog owns
          (<code>/blog</code>, <code>/docs</code>); the shell answers everything else.
        </li>
      </ol>
      <ul className="doc-list">
        {DOCS.map((d) => (
          <li key={d.slug}>
            <Link href={`/docs/${d.slug}`}>{d.title}</Link>
            <span>{d.summary}</span>
          </li>
        ))}
      </ul>
      <p className="card">
        This page is served by the <strong>blog</strong> project: Vercel sends <code>/docs</code> here directly, so the
        shell&apos;s proxy never runs for it. Diagrams and step-by-step request traces are in the{" "}
        <a href="/lab.html">interactive lab</a>.
      </p>
    </>
  );
}
