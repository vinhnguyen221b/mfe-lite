import { ExposeRemoteComponent } from "remote-components/remote/nextjs/app";
import { ZoneBadge } from "@mfe-lite/ui";
import { Reactions } from "./reactions";

// A remote Client Component: its JavaScript is built by the blog zone and hydrates inside a shell page.
export default function ReactionsRemote() {
  return (
    <ExposeRemoteComponent>
      <section className="remote" data-remote="reactions">
        <div className="remote-head">
          <h2>Reactions</h2>
          <ZoneBadge zone="blog" />
        </div>
        <p className="muted small">This button is built and deployed by the blog project.</p>
        <Reactions />
      </section>
    </ExposeRemoteComponent>
  );
}
