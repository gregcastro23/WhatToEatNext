
import { useEffect, useCallback } from 'react';
// Mock recoil for testing
const useRecoilCallback = (callback: (utils: { set: Function }) => () => void, deps: unknown[]) => callback({ set: () => {} });

export function EnhancedHooksComponent() {
  const value = 'test';
  
  // Standard useEffect
  useEffect(() => {
    console.log(value);
  }, []); // Missing dependency
  
  // Recoil callback hook
  const recoilCallback = useRecoilCallback(({ set }) => () => {
    console.log(value);
  }, []); // Missing dependency
  
  return <div>Enhanced Hooks</div>;
}
