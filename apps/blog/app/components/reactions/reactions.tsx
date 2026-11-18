"use client";

import { addLike, useLikes } from "@mfe-lite/ui/likes";

// The count lives in the browser (see @mfe-lite/ui/likes), so the shell's header badge
// sees every click, on /horizontal and after navigating to a shell page.
export function Reactions() {
  const likes = useLikes();
  return (
    <button type="button" data-testid="reactions" onClick={() => addLike()}>
      Like · {likes}
    </button>
  );
}
