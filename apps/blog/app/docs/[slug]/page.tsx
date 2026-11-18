import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS, type Block } from "@/lib-posts";

export function generateStaticParams() {
  return DOCS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: DOCS.find((d) => d.slug === slug)?.title ?? "Docs" };
}

// Text between backticks becomes inline code.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

function render(block: Block, i: number) {
  if ("h" in block) return <h2 key={i}>{block.h}</h2>;
  if ("code" in block)
    return (
      <pre key={i}>
        <code>{block.code}</code>
      </pre>
    );
  if ("list" in block)
    return (
      <ul key={i}>
        {block.list.map((item, j) => (
          <li key={j}>
            <Inline text={item} />
          </li>
        ))}
      </ul>
    );
  return (
    <p key={i}>
      <Inline text={block.p} />
    </p>
  );
}

export default async function Doc({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const index = DOCS.findIndex((d) => d.slug === slug);
  if (index === -1) notFound();
  const doc = DOCS[index];
  const next = DOCS[index + 1];
  return (
    <article className="prose">
      <Link href="/docs" className="back">
        ← All docs
      </Link>
      <span className="eyebrow">
        Docs · {String(index + 1).padStart(2, "0")} of {String(DOCS.length).padStart(2, "0")}
      </span>
      <h1>{doc.title}</h1>
      <p className="lead">{doc.summary}</p>
      {doc.blocks.map(render)}
      {doc.seeAlso && (
        <p className="muted">
          See also:{" "}
          {doc.seeAlso.map((l, i) => (
            <Fragment key={l.href}>
              {i > 0 && " · "}
              <a href={l.href}>{l.label}</a>
            </Fragment>
          ))}
        </p>
      )}
      {next && (
        <Link href={`/docs/${next.slug}`} className="card link-card" style={{ marginTop: "2rem" }}>
          <span className="tag">Next</span>
          <h3>{next.title}</h3>
          <p>{next.summary}</p>
        </Link>
      )}
    </article>
  );
}
