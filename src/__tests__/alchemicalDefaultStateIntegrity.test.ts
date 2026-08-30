/**
 * Regression guard for the `/` root-page crash:
 *   "can't access property \"Fire\", t is undefined"
 *
 * `AlchemicalState` declares `elementalState` REQUIRED, but `defaultState`
 * omitted it and closed with `as any`, so the compiler never complained.
 * Nothing in the codebase dispatches `SET_ELEMENTAL_STATE`, so the field was
 * `undefined` for the whole process lifetime. Anonymous visitors never hit it
 * (`useUserElementalBias` returns null and the consumer early-returns), but any
 * visitor with a natal chart or a guest on the table dereferenced `base.Fire`
 * and took down the page via the root error boundary.
 *
 * These tests fail on the pre-fix tree.
 */

import { defaultState } from "@/contexts/AlchemicalContext/context";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

describe("AlchemicalContext defaultState integrity", () => {
  it("defines elementalState so consumers can dereference it", () => {
    expect(defaultState.elementalState).toBeDefined();
  });

  it("carries all four elements as finite numbers", () => {
    for (const element of ELEMENTS) {
      const value = defaultState.elementalState[element];
      expect(typeof value).toBe("number");
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("keeps every field AlchemicalState marks required present at runtime", () => {
    // `as any` on defaultState disables the compiler's own completeness check,
    // so assert it here instead. Extend this list when the interface gains a
    // required field.
    const REQUIRED_AT_RUNTIME = [
      "elementalState",
      "planetaryPositions",
      "normalizedPositions",
      "lunarPhase",
      "dominantElement",
      "planetaryHour",
      "astrologicalState",
      "alchemicalValues",
      "errors",
    ] as const;

    const missing = REQUIRED_AT_RUNTIME.filter(
      (key) => (defaultState as Record<string, unknown>)[key] === undefined,
    );
    expect(missing).toEqual([]);
  });
});
