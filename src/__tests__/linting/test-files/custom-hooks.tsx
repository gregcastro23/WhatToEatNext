
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
