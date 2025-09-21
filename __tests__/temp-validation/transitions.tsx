import { startTransition, useDeferredValue, useTransition } from 'react';

export function TransitionComponent() {
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue('test');

  const handleClick = () => {
    startTransition(() => {
      console.log('Transition started');
    });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isPending}>
        {isPending ? 'Loading...' : 'Click me'}
      </button>
      <p>Deferred: {deferredValue}</p>
    </div>
  );
}
