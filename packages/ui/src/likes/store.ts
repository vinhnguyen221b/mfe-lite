// Persistence for the like count. Not how components share it: they share a React context (see context.tsx).
//
// A context lives as long as the page. A full page load (a reload, or moving between zones) starts a new React
// tree, so each zone's LikesProvider loads the count from here when it mounts and saves it after each Like.
// Both zones are served from one origin, so they read the same key. A count shared by every visitor would need
// a server store instead.

export const LIKES_KEY = "mfe-lite:likes";

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : 0;
}

/** Saved count in this browser; 0 on the server or when storage is blocked. */
export function loadLikes(): number {
  if (typeof window === "undefined") return 0;
  try {
    return toCount(window.localStorage.getItem(LIKES_KEY));
  } catch {
    return 0;
  }
}

/** Saves the count. Blocked storage only costs persistence, so errors are ignored. */
export function saveLikes(count: number): void {
  try {
    window.localStorage.setItem(LIKES_KEY, String(count));
  } catch {
    // storage blocked: the count still works for this page view
  }
}

/** Calls onChange with the new count when another tab saves it. Returns the unsubscribe function. */
export function watchOtherTabs(onChange: (count: number) => void): () => void {
  const onStorage = (event: Event) => {
    const { key } = event as StorageEvent;
    if (key === LIKES_KEY || key === null) onChange(loadLikes()); // null: another tab cleared storage
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
