import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "@/lib-posts";

export function generateStaticParams() {
  return POSTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: POSTS.find((p) => p.slug === slug)?.title ?? "Blog" };
}

export default async function Post({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article>
      <p>
        <Link href="/blog">← All posts</Link>
      </p>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
