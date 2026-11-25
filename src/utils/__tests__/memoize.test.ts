/**
 * @jest-environment node
 */

import { cloneDefault } from "@/constants/defaults";
import { memoize } from "../memoize";

describe("memoize & cloneDefault", () => {
  it("memoizes pure function results without losing return type fidelity", () => {
    const fn = jest.fn((a: number, b: string): string => `${b}:${a * 2}`);
    const memoized = memoize(fn);

    expect(memoized(3, "x")).toBe("x:6");
    expect(memoized(3, "x")).toBe("x:6");
    expect(memoized(4, "y")).toBe("y:8");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("memoizes falsy values (0, false, empty string) without recomputing", () => {
    const fn = jest.fn((_k: string): number => 0);
    const memoized = memoize(fn);

    expect(memoized("zero")).toBe(0);
    expect(memoized("zero")).toBe(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("deep-clones default objects via structuredClone", () => {
    const original = { nested: { items: [1, 2, 3] } };
    const cloned = cloneDefault(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    cloned.nested.items.push(4);
    expect(original.nested.items).toEqual([1, 2, 3]);
  });
});
