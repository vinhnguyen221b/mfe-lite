"use client";

// The like count, shared through a React context.
//
// Each zone renders a LikesProvider in its root layout. Both zones also list "@mfe-lite/ui/likes-context" in
// withRemoteComponentsConfig({ shared }). So on a shell page that embeds a blog component, the blog's import of
// this module is swapped for the shell's live copy in the browser: the blog's button finds the shell's provider
// and writes into the shell's state. Without `shared`, the blog would bring its own LikesContext object, find no
// provider for it, and get DISCONNECTED.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadLikes, saveLikes, watchOtherTabs } from "./store";

export type LikesStore = {
  /** The like count in this browser. */
  count: number;
  /** Adds one like, or null when no provider is above the component. */
  like: (() => void) | null;
  /** The zone whose provider holds the state, or null when disconnected. */
  owner: string | null;
};

export const DISCONNECTED: LikesStore = { count: 0, like: null, owner: null };

export const LikesContext = createContext<LikesStore>(DISCONNECTED);
LikesContext.displayName = "LikesContext";

/** Holds the count in React state. Renders 0 on the server, then loads the saved count. */
export function LikesProvider({ owner, children }: { owner: string; children: ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(loadLikes());
    return watchOtherTabs(setCount);
  }, []);

  const like = useCallback(() => {
    setCount((n) => {
      saveLikes(n + 1); // idempotent, so a doubled updater call in development is harmless
      return n + 1;
    });
  }, []);

  const value = useMemo(() => ({ count, like, owner }), [count, like, owner]);
  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikesStore(): LikesStore {
  return useContext(LikesContext);
}
