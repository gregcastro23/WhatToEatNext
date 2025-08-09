import { useEffect } from 'react';

// Mock Recoil hook for testing
function useRecoilCallback(callback: any, deps: any[]) {
  return callback;
}

export function RecoilComponent() {
  const value = 'test';

  const recoilCallback = useRecoilCallback(
    ({ set }) =>
      () => {
        console.log(value);
      },
    [],
  ); // Missing dependency - should be detected

  return <div>Recoil Component</div>;
}
