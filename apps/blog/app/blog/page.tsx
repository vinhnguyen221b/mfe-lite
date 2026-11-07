import Link from "next/link";
import { POSTS } from "@/lib-posts";

export const metadata = { title: "Blog" };

// /blog is owned by the blog zone: Vercel routes it here and the shell never sees the request.
export default function Blog() {
  return (
    <>
      <h1>Blog</h1>
      <p>
        These posts are served by the <strong>blog</strong> project, the same project that serves{" "}
        <Link href="/docs">/docs</Link>.
      </p>
      <ul>
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
