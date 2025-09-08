// eslint-disable-next-line react-hooks/rules-of-hooks -- Test file demonstrating conditional hook error
import { useState } from 'react';

export function ConditionalHooksComponent({ condition }: { condition: boolean }) {
  if (condition) {
    const [_state] = useState(''); // Hooks in conditional - should error
  }

  return <div>Conditional Hooks</div>;
}
