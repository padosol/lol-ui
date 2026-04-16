"use client";

import { useSyncExternalStore } from "react";

interface PersistStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

export function useHasHydrated(store: PersistStore): boolean {
  return useSyncExternalStore(
    (callback) => store.persist.onFinishHydration(callback),
    () => store.persist.hasHydrated(),
    () => false,
  );
}
