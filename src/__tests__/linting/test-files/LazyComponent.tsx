/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import React from 'react';

export default function LazyComponent() {
  return (
    <div>
      <h2>Lazy Loaded Component</h2>
      <p>This component was loaded dynamically using React.lazy()</p>
    </div>
  );
}
