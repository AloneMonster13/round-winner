import { useSyncExternalStore, useCallback } from "react";
import { store } from "@/lib/store";

export function useStore() {
  const subscribe = useCallback((cb: () => void) => store.subscribe(cb), []);
  // Force re-render on store changes
  useSyncExternalStore(subscribe, () => JSON.stringify({
    rounds: store.getRounds(),
    competitors: store.getCompetitors(),
    votes: store.getVotes(),
  }));

  return store;
}
