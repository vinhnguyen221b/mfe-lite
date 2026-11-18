"use client";

import { useLikesStore } from "@mfe-lite/ui/likes-context";

// The nearest LikesProvider holds the count. On a blog page that is the blog's own provider. Embedded in a shell
// page, this import resolves to the shell's live module (see `shared` in next.config.ts), so the button finds the
// shell's provider and the shell's header and panel update with it.
export function Reactions() {
  const { count, like, owner } = useLikesStore();
  return (
    <button
      type="button"
      className="like"
      data-testid="reactions"
      data-store={owner ?? "none"}
      disabled={like === null}
      title={like === null ? "No likes store on this page" : undefined}
      onClick={() => like?.()}
    >
      <span aria-hidden="true">♥</span> Like
      <span className="like-count" aria-label={`${count} so far`}>
        {count}
      </span>
    </button>
  );
}
