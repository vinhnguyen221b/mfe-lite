// Shared likes: a browser contract, not a shared module instance.
//
// Each zone bundles its own copy of this file (remote-components only shares react, react-dom and next/*),
// so a module-level variable or a React context here would exist twice. The copies agree through the
// browser instead, which both zones reach because they are served from one origin:
//   - localStorage key LIKES_KEY holds the count, so it survives reloads and cross-zone navigations;
//   - a window event LIKES_EVENT tells every copy on the current page that the count changed;
//   - the browser's own `storage` event does the same for other tabs.

export const LIKES_KEY = "mfe-lite:likes";
export const LIKES_EVENT = "mfe-lite:likes";

// Used only when localStorage throws (storage blocked): kept on window so both zones' copies still share it.
const MEMORY = Symbol.for(LIKES_KEY);
type LikesWindow = Window & { [MEMORY]?: number };

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : 0;
}

/** Current count in this browser; 0 on the server. */
export function readLikes(): number {
  if (typeof window === "undefined") return 0;
  try {
    return toCount(window.localStorage.getItem(LIKES_KEY));
  } catch {
    return toCount((window as LikesWindow)[MEMORY]);
  }
}

/** Adds one like and tells every zone on this page. Returns the new count. */
export function addLike(): number {
  const next = readLikes() + 1;
  try {
    window.localStorage.setItem(LIKES_KEY, String(next));
  } catch {
    (window as LikesWindow)[MEMORY] = next;
  }
  window.dispatchEvent(new CustomEvent(LIKES_EVENT, { detail: next }));
  return next;
}

/** Calls onChange when the count changes on this page or in another tab. Returns the unsubscribe function. */
export function subscribeLikes(onChange: () => void): () => void {
  const onStorage = (event: Event) => {
    const { key } = event as StorageEvent;
    if (key === LIKES_KEY || key === null) onChange(); // null: another tab cleared storage
  };
  window.addEventListener(LIKES_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LIKES_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
