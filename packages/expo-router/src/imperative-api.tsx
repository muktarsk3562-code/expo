import type { NavigationContainerRef, ParamListBase } from '@react-navigation/native';
import { type RefObject, useEffect, useSyncExternalStore } from 'react';

import { router, Router } from './global-state/router';
import { routingQueue } from './global-state/routing';

export type { Router };
export { router };

export function useImperativeApiEmitter(
  ref: RefObject<NavigationContainerRef<ParamListBase> | null>
) {
  const events = useSyncExternalStore(
    routingQueue.subscribe,
    routingQueue.snapshot,
    routingQueue.snapshot
  );
  useEffect(() => {
    routingQueue.run(ref);
  }, [events, ref]);
  return null;
}
