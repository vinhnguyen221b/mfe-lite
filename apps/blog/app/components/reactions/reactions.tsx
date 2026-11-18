"use client";

import { addLike, useLikes } from "@mfe-lite/ui/likes";

// The count lives in the browser (see @mfe-lite/ui/likes), so the shell's header badge
// sees every click, on /horizontal and after navigating to a shell page.
export function Reactions() {
  const likes = useLikes();
  return (
    <button type="button" className="like" data-testid="reactions" onClick={() => addLike()}>
      <span aria-hidden="true">♥</span> Like
      <span className="like-count" aria-label={`${likes} so far`}>
        {likes}
      </span>
    </button>
  );
}
