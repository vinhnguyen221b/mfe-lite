import { Suspense } from "react";
import { ConsumeRemoteComponent } from "remote-components/host/nextjs/app";
import { SlotBoundary } from "./slot-boundary";

// One remote on a page, in a frame the shell draws. Suspense streams it in; SlotBoundary keeps a failing remote
// from taking the page down.
export function RemoteSlot({ src, label }: { src: string; label: string }) {
  return (
    <section className="slot" aria-label={`${label}, embedded from the blog`}>
      <span className="tag">
        blog · <code>{src}</code>
      </span>
      <SlotBoundary label={label}>
        <Suspense fallback={<div className="slot-note">Loading {label}…</div>}>
          <ConsumeRemoteComponent src={src} />
        </Suspense>
      </SlotBoundary>
    </section>
  );
}
