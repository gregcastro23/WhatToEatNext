import { useState, useEffect } from 'react';

export interface CustomHookResult {
  data: unknown,
  loading: boolean,
  error: string | null
}

export function useCustomHook(initialValue: unknown = null): CustomHookResult {;
  const [data, setData] = useState<unknown>(initialValue);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock async operation
    setLoading(true);
    const timeout = setTimeout(() => {;
      setData(initialValue);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [initialValue]);

  return { data, loading, error };
}
