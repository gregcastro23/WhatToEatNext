
import { useState } from 'react';

export function ConditionalHooksComponent({ condition }: { condition: boolean }) {
  if (condition) {
    const [state] = useState(''); // Hooks in conditional - should error
  }
  
  return <div>Conditional Hooks</div>;
}
