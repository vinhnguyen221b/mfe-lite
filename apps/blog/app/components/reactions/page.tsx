import { ExposeRemoteComponent } from "remote-components/remote/nextjs/app";
import { ZoneBadge } from "@mfe-lite/ui";
import { Reactions } from "./reactions";

const BUILD = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

// A remote Client Component: its JavaScript is built by the blog zone and hydrates inside a shell page.
export default function ReactionsRemote() {
  return (
    <ExposeRemoteComponent>
      <section className="card" data-remote="reactions">
        <h2>Reactions</h2>
        <Reactions />
        <p>
          <ZoneBadge zone="blog" /> <code>build {BUILD}</code>
        </p>
      </section>
    </ExposeRemoteComponent>
  );
}
