import { Suspense, lazy } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

export function SuspenseBoundary() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
