/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import { useState, useEffect } from 'react';

function useCustomHook(dependency: string) {
  const [state, setState] = useState('');

  useEffect(() => {
    setState(dependency);
  }, [dependency]);

  return state;
}

export function CustomHookComponent() {
  const value = useCustomHook('test');

  return <div>{value}</div>;
}
