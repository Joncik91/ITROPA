import { useCallback, useRef, useState } from 'react';

export type ActionState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'done' };

/** A call that runs on a click, not on mount: idle until `run`, then loading, then done or an error to retry. */
export function useAction<A extends unknown[]>(fn: (...args: A) => Promise<void>): { state: ActionState; run: (...args: A) => void } {
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const latest = useRef(0);
  const run = useCallback((...args: A) => {
    const id = ++latest.current;
    setState({ status: 'loading' });
    fn(...args).then(
      () => id === latest.current && setState({ status: 'done' }),
      (e: unknown) => id === latest.current && setState({ status: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' }),
    );
  }, [fn]);
  return { state, run };
}
