import { notFound } from "next/navigation";
import { POSTS } from "@/lib-posts";

export function generateStaticParams() {
  return POSTS.map(({ slug }) => ({ slug }));
}

export default async function Post({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
