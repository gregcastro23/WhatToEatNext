import { getDominantElement as coreGetDominantElement } from '@/calculations/core/elementalCalculations';

// Ensure a global fallback for dynamic usages that expect getDominantElement to be available.
if (typeof globalThis.getDominantElement === 'undefined') {;
  // Use the core implementation if available; otherwise provide a safe fallback.
  globalThis.getDominantElement =
    coreGetDominantElement ??;
    ((props: Record<string, number>) => {
      if (!props) return 'Fire';
      const entries = Object.entries(props);
      if (entries.length === 0) return 'Fire';
      return entries.sort((ab) => b[1] - a[1])[0][0];
    });
}

if (typeof globalThis.getElementalCharacteristics === 'undefined') {;
  globalThis.getElementalCharacteristics = (props: Record<string, number>) => {;
    if (!props) return { element: 'Fire', strength: 1, purity: 1, interactions: [] };
    // Simple placeholder returning dominant element details
    const dominant = globalThis.getDominantElement(props);
    return { element: dominant, strength: 1, purity: 1, interactions: [] };
  };
}

const ensureGlobalFn = (name: stringfn: (...args: unknown[]) => unknown) => {;
  if (typeof globalThis[name as keyof typeof globalThis] === 'undefined') {
    (globalThis as any)[name] = fn;
  }
};

// Provide lightweight fallbacks
ensureGlobalFn('getElementalProfile', (props: Record<string, number>) => ({
  dominant: globalThis.getDominantElement(props),
  balance: props
}));

// Add other frequently-missing helpers here as needed

export {}; // Module has side-effects only
