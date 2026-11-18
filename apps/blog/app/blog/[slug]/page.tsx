import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reactions } from "@/app/components/reactions/reactions";
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
    <article className="prose">
      <Link href="/blog" className="back">
        ← All posts
      </Link>
      <span className="eyebrow">Blog zone</span>
      <h1>{post.title}</h1>
      <p className="lead">{post.body}</p>
      <div className="reactions-bar">
        <Reactions />
        <span className="muted small">Your Like also counts in the ♥ badge, on every page of both zones.</span>
      </div>
    </article>
  );
}
