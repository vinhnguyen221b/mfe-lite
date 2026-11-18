"use client";

import { useSyncExternalStore } from "react";
import { readLikes, subscribeLikes } from "./store";

/** The shared like count. Renders 0 on the server and during hydration, then the browser's value. */
export function useLikes(): number {
  return useSyncExternalStore(subscribeLikes, readLikes, () => 0);
}

/** Header badge. Each zone renders its own; both read the same count. The number pops when it changes. */
export function LikesBadge() {
  const likes = useLikes();
  return (
    <span
      className="likes"
      data-likes={likes}
      role="status"
      aria-label={`${likes} ${likes === 1 ? "like" : "likes"} in this browser, shared by both zones`}
      title="Likes in this browser, shared by both zones"
    >
      <span className="heart" aria-hidden="true">
        ♥
      </span>
      <strong key={likes} className="pop" aria-hidden="true">
        {likes}
      </strong>
      <span className="likes-label" aria-hidden="true">
        {likes === 1 ? "like" : "likes"}
      </span>
    </span>
  );
}

/** A large read-out of the same count, for a page that wants to show it next to the Like button. */
export function LikesMeter() {
  const likes = useLikes();
  return (
    <p className="meter" data-likes={likes}>
      <span className="heart" aria-hidden="true">
        ♥
      </span>
      <strong key={likes} className="pop">
        {likes}
      </strong>
      <span className="unit">{likes === 1 ? "like" : "likes"}</span>
    </p>
  );
}
