import Link from "next/link";
import { POSTS } from "@/lib-posts";

export const metadata = { title: "Blog" };

// /blog is owned by the blog zone: Vercel routes it here and the shell never sees the request.
export default function Blog() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Vertical split · blog zone</span>
        <h1>Blog</h1>
        <p className="lead">
          These posts are served by the <strong>blog</strong> project, the same project that serves{" "}
          <Link href="/docs">/docs</Link>.
        </p>
      </header>
      <div className="grid grid-2">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card link-card">
            <span className="tag">
              <code>/blog/{p.slug}</code>
            </span>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
            <span className="go">Read →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
