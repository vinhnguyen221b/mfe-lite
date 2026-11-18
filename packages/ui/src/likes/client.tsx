"use client";

import { useLikesStore } from "./context";

/** Header badge. Reads the LikesProvider of the zone that renders the page. The number pops when it changes. */
export function LikesBadge() {
  const { count } = useLikesStore();
  return (
    <span
      className="likes"
      data-likes={count}
      role="status"
      aria-label={`${count} ${count === 1 ? "like" : "likes"} in this browser`}
      title="Likes in this browser, kept across both zones"
    >
      <span className="heart" aria-hidden="true">
        ♥
      </span>
      <strong key={count} className="pop" aria-hidden="true">
        {count}
      </strong>
      <span className="likes-label" aria-hidden="true">
        {count === 1 ? "like" : "likes"}
      </span>
    </span>
  );
}

/** A large read-out of the same count, for a page that wants to show it next to the Like button. */
export function LikesMeter() {
  const { count, owner } = useLikesStore();
  return (
    <p className="meter" data-likes={count} data-store={owner ?? "none"}>
      <span className="heart" aria-hidden="true">
        ♥
      </span>
      <strong key={count} className="pop">
        {count}
      </strong>
      <span className="unit">{count === 1 ? "like" : "likes"}</span>
    </p>
  );
}
