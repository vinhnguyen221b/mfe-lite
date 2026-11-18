"use client";

import { useSyncExternalStore } from "react";
import { readLikes, subscribeLikes } from "./store";

/** The shared like count. Renders 0 on the server and during hydration, then the browser's value. */
export function useLikes(): number {
  return useSyncExternalStore(subscribeLikes, readLikes, () => 0);
}

/** Header badge. Each zone renders its own; both read the same count. */
export function LikesBadge() {
  const likes = useLikes();
  return (
    <span className="badge" data-likes={likes} title="Likes in this browser, shared by both zones">
      ♥ {likes}
    </span>
  );
}
