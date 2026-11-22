import { renderHook } from "@testing-library/react";
import { useEffect } from "react";

import { useLatestRef } from "../useLatestRef";

describe("useLatestRef", () => {
  it("starts with the initial value", () => {
    const { result } = renderHook(() => useLatestRef(["a"]));
    expect(result.current.current).toEqual(["a"]);
  });

  it("returns one stable ref object that tracks the latest value", () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: ["a"] },
    });
    const first = result.current;

    rerender({ value: ["a", "b"] });

    expect(result.current).toBe(first);
    expect(first.current).toEqual(["a", "b"]);
  });

  it("lets an effect read the newest value without re-running when only that value changes", () => {
    // Models the restaurant fetch effects: keyed on the cuisine, forwarding the favourites.
    const seen: string[][] = [];
    const { rerender } = renderHook(
      ({ cuisine, favorites }: { cuisine: string; favorites: string[] }) => {
        const favoritesRef = useLatestRef(favorites);
        useEffect(() => {
          seen.push(favoritesRef.current);
        }, [cuisine, favoritesRef]);
      },
      { initialProps: { cuisine: "thai", favorites: ["a"] } },
    );
    expect(seen).toEqual([["a"]]);

    // A favourite is toggled: no refetch.
    rerender({ cuisine: "thai", favorites: ["a", "b"] });
    expect(seen).toHaveLength(1);

    // The cuisine changes: the effect runs once and sees the toggled favourites.
    rerender({ cuisine: "sushi", favorites: ["a", "b"] });
    expect(seen).toEqual([["a"], ["a", "b"]]);
  });
});
