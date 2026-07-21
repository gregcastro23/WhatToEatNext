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
      return entries.sort((a, b) => b[1] - a[1])[0][0];
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
