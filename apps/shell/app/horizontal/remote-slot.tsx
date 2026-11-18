import { Suspense } from "react";
import { ConsumeRemoteComponent } from "remote-components/host/nextjs/app";
import { SlotBoundary } from "./slot-boundary";

// One remote on a page. Suspense streams it in; SlotBoundary keeps a failing remote from taking the page down.
export function RemoteSlot({ src, label }: { src: string; label: string }) {
  return (
    <SlotBoundary label={label}>
      <Suspense fallback={<div className="card">Loading {label}…</div>}>
        <ConsumeRemoteComponent src={src} />
      </Suspense>
    </SlotBoundary>
  );
}
