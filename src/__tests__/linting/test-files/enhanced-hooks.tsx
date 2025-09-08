/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import { useEffect, useCallback as _useCallback } from 'react';
// Mock recoil for testing
const useRecoilCallback = (callback: (utils: { set: Function }) => () => void, _deps: unknown[]) =>
  callback({ set: () => {} });

export function EnhancedHooksComponent() {
  const value = 'test';

  // Standard useEffect
  useEffect(() => {
    console.log(value);
  }, []); // Missing dependency

  // Recoil callback hook
  const _recoilCallback = useRecoilCallback(
    ({ set: _set }) =>
      () => {
        console.log(value);
      },
    [],
  ); // Missing dependency

  return <div>Enhanced Hooks</div>;
}
