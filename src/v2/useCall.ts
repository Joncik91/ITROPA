import { useCallback, useEffect, useRef, useState } from 'react';

export type CallState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; data: T };

/** Runs `fn` when `key` changes; `retry` runs it again. Only the latest run may set state. */
export function useCall<T>(fn: () => Promise<T>, key: string): [CallState<T>, () => void] {
  const [state, setState] = useState<CallState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });
    fnRef.current().then(
      (data) => current && setState({ status: 'done', data }),
      (e: unknown) => current && setState({ status: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' }),
    );
    return () => { current = false; };
  }, [key, attempt]);

  return [state, useCallback(() => setAttempt((n) => n + 1), [])];
}
