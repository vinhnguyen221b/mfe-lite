import Link from "next/link";

// Only reachable on the blog project's own domain. On the group domain, "/" belongs to the shell.
export default function BlogRoot() {
  return (
    <>
      <h1>Blog zone</h1>
      <p>
        This project serves <Link href="/blog">/blog</Link> and <Link href="/docs">/docs</Link>. Visit the shell domain
        to see them composed.
      </p>
    </>
  );
}
