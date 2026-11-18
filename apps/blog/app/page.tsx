import Link from "next/link";

// Only reachable on the blog project's own domain. On the group domain, "/" belongs to the shell.
export default function BlogRoot() {
  return (
    <header className="page-head">
      <span className="eyebrow">Blog zone</span>
      <h1>The blog project</h1>
      <p className="lead">
        This project serves <Link href="/blog">/blog</Link>, <Link href="/docs">/docs</Link> and the components under{" "}
        <code>/components</code>. Visit the shell domain to see them composed.
      </p>
    </header>
  );
}
