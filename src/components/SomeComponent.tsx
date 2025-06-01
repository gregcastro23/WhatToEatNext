import { useClientEffect } from '@/hooks/useClientEffect';

const SomeComponent = () => {
  useClientEffect(() => {
    // Your effect code here
  }, []);
  
  return <div>...</div>;
}; 