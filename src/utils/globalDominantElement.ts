// import { getDominantElement as coreGetDominantElement } from "@/calculations/core/elementalCalculations";

type DominantElementFn = (props: Record<string, number>) => string;
type ElementalCharacteristicsFn = (props: Record<string, number>) => {
  element: string;
  strength: number;
  purity: number;
  interactions: unknown[];
};
type ElementalProfileFn = (props: Record<string, number>) => {
  dominant: string;
  _balance: Record<string, number>;
};

// `var` is required here, not a style slip: only `var` in a `declare global`
// block augments the `globalThis` type, which is what the assignments below
// rely on. `no-var` does not report ambient declarations, so this needs no
// disable directive — three of them sat here unused until 2026-08-13.
declare global {
  var getDominantElement: DominantElementFn | undefined;
  var getElementalCharacteristics: ElementalCharacteristicsFn | undefined;
  var getElementalProfile: ElementalProfileFn | undefined;
}

const coreGetDominantElement: DominantElementFn | null = null;

// Ensure a global fallback for dynamic usages that expect getDominantElement to be available.
if (typeof globalThis.getDominantElement === "undefined") {
  // Use the core implementation if available; otherwise provide a safe fallback.
  globalThis.getDominantElement =
    coreGetDominantElement ??
    ((props: Record<string, number>) => {
      if (!props) return "Fire";
      const entries = Object.entries(props);
      if (entries.length === 0) return "Fire";
      const [dominant] = entries.sort((a, b) => b[1] - a[1]);
      return dominant ? dominant[0] : "Fire";
    });
}

if (typeof globalThis.getElementalCharacteristics === "undefined") {
  globalThis.getElementalCharacteristics = (props: Record<string, number>) => {
    if (!props)
      return { element: "Fire", strength: 1, purity: 1, interactions: [] };
    // Simple placeholder returning dominant element details
    const dominant = globalThis.getDominantElement?.(props) ?? "Fire";
    return { element: dominant, strength: 1, purity: 1, interactions: [] };
  };
}

// Provide lightweight fallbacks
if (typeof globalThis.getElementalProfile === "undefined") {
  globalThis.getElementalProfile = (props: Record<string, number>) => ({
    dominant: globalThis.getDominantElement?.(props) ?? "Fire",
    _balance: props,
  });
}

// Add other frequently-missing helpers here as needed

export {}; // Module has side-effects only
