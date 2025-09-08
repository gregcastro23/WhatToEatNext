/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

export function SuspenseBoundary() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
