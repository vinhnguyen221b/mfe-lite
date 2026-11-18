import { ZoneBadge } from "@mfe-lite/ui";
import { RemoteSlot } from "./remote-slot";

export const metadata = { title: "Horizontal" };

// Rendered per request, so a blog deployment shows up on the next page load without rebuilding the shell.
export const dynamic = "force-dynamic";

const BUILD = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

export default function Horizontal() {
  return (
    <>
      <h1>One page, two deployments</h1>
      <p>
        This text comes from the <strong>shell</strong>: <ZoneBadge zone="shell" /> <code>build {BUILD}</code>. The two
        cards below are rendered by the <strong>blog</strong> project and embedded here at request time.
      </p>
      <RemoteSlot src="/components/latest-posts" label="Latest posts" />
      <RemoteSlot src="/components/reactions" label="Reactions" />
    </>
  );
}
