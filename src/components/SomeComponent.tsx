import { useClientEffect } from '@/hooks/useClientEffect';

const _SomeComponent = () => {
  useClientEffect(() => {
    // Your effect code here
  }, []);

  return <div>...</div>;
};
