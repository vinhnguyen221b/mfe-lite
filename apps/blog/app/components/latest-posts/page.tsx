import { ExposeRemoteComponent } from "remote-components/remote/nextjs/app";
import { ZoneBadge } from "@mfe-lite/ui";
import { POSTS } from "@/lib-posts";

// A remote Server Component: rendered by the blog zone, embedded in a shell page. No client JavaScript.
export default function LatestPostsRemote() {
  return (
    <ExposeRemoteComponent>
      <section className="remote" data-remote="latest-posts">
        <div className="remote-head">
          <h2>Latest posts</h2>
          <ZoneBadge zone="blog" />
        </div>
        <ul className="posts">
          {POSTS.map((p) => (
            <li key={p.slug}>
              {/* A plain <a>: /blog belongs to another zone from the host's point of view. */}
              <a href={`/blog/${p.slug}`}>{p.title}</a>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
        <a href="/blog">All posts →</a>
      </section>
    </ExposeRemoteComponent>
  );
}
