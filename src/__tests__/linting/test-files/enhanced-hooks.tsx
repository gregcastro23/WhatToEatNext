
import { useEffect, useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

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
