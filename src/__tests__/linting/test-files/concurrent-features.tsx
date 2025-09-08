/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import {
  Suspense,
  startTransition as _startTransition,
  useDeferredValue,
  useTransition,
} from 'react';

export function ConcurrentComponent() {
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue('test');

  const handleClick = () => {
    startTransition(() => {
      // Non-urgent update
      console.log('Transition started');
    });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <button onClick={handleClick} disabled={isPending}>
          {isPending ? 'Loading...' : 'Click me'}
        </button>
        <p>Deferred: {deferredValue}</p>
      </div>
    </Suspense>
  );
}
