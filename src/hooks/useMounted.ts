'use client';

import { useSyncExternalStore } from 'react';

// Returns true only on the client after hydration, avoiding SSR/client mismatches
const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,   // client snapshot
    () => false   // server snapshot
  );
}
