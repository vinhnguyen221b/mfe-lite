import { ExposeRemoteComponent } from "remote-components/remote/nextjs/app";
import { ZoneBadge } from "@mfe-lite/ui";
import { POSTS } from "@/lib-posts";

const BUILD = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

// A remote Server Component: rendered by the blog zone, embedded in a shell page. No client JavaScript.
export default function LatestPostsRemote() {
  return (
    <ExposeRemoteComponent>
      <section className="card" data-remote="latest-posts">
        <h2>Latest posts</h2>
        <ul>
          {POSTS.map((p) => (
            <li key={p.slug}>
              {/* A plain <a>: /blog belongs to another zone from the host's point of view. */}
              <a href={`/blog/${p.slug}`}>{p.title}</a>: {p.body}
            </li>
          ))}
        </ul>
        <p>
          <a href="/blog">All posts</a>
        </p>
        <ZoneBadge zone="blog" /> <code>build {BUILD}</code>
      </section>
    </ExposeRemoteComponent>
  );
}
