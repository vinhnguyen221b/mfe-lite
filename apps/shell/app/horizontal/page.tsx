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
      <p>
        Press <strong>Like</strong> in the blog&apos;s card: the ♥ count in the shell&apos;s header follows. Each zone
        bundles its own copy of the likes code; the copies agree on a browser contract (a localStorage key and a window
        event), so the count also survives a reload and a move to a blog page.
      </p>
      <RemoteSlot src="/components/latest-posts" label="Latest posts" />
      <RemoteSlot src="/components/reactions" label="Reactions" />
    </>
  );
}
