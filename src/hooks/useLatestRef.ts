import { useEffect, useRef } from "react";

/**
 * Mirrors `value` into a ref that always holds the most recently committed value.
 *
 * Use it when an effect must READ a value but must not RE-RUN when that value changes,
 * e.g. a fetch keyed on the search inputs that also forwards the current favourites.
 * Declare the hook before the effect that reads it: effects run in declaration order, so
 * the ref is already current when the reading effect fires.
 *
 * The returned object is the same on every render. `react-hooks/exhaustive-deps` cannot
 * see that through a custom hook, so list the ref in the effect's dependency array; that
 * never re-triggers the effect.
 */
export function useLatestRef<T>(value: T): { current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
