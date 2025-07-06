import { getDominantElement as coreGetDominantElement } from '@/calculations/core/elementalCalculations';

// Ensure a global fallback for dynamic usages that expect getDominantElement to be available.
if (typeof (globalThis as any).getDominantElement === 'undefined') {
  // Use the core implementation if available; otherwise provide a safe fallback.
  (globalThis as any).getDominantElement = coreGetDominantElement ?? ((props: Record<string, number>) => {
    if (!props) return 'Fire';
    const entries = Object.entries(props);
    if (entries.length === 0) return 'Fire';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  });
}

if (typeof (globalThis as any).getElementalCharacteristics === 'undefined') {
  (globalThis as any).getElementalCharacteristics = (props: Record<string, number>) => {
    if (!props) return { element: 'Fire', strength: 1, purity: 1, interactions: [] };
    // Simple placeholder returning dominant element details
    const dominant = (globalThis as any).getDominantElement(props);
    return { element: dominant, strength: 1, purity: 1, interactions: [] };
  };
}

export {}; // Module has side-effects only 