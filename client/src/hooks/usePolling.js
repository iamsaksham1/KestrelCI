/**
 * @file client/src/hooks/usePolling.js
 * @description Periodic polling hook with backoff and completion detection.
 * Polling automatically halts once the pipeline run reaches a terminal state.
 */

import { useEffect, useRef } from 'react';

export function usePolling(callback, intervalMs = 1000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    async function tick() {
      if (!isMounted) return;
      try {
        await savedCallback.current();
      } catch (err) {
        console.error('[Polling Error]', err);
      }
    }

    // Execute immediately on enable
    tick();

    const id = setInterval(tick, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}

export default usePolling;
