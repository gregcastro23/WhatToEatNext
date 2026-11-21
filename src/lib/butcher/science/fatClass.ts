/**
 * Fat class of a cut, derived from its USDA total fat (g per 100 g raw).
 *
 * Basis: the bands are a DECLARED display scale, not a USDA or grading-body
 * standard. They are the same 6 / 12 / 20 g thresholds the 3D fat overlay
 * already used, now held in one place so every label (HUD, compare table,
 * overlay legend, 2D diagram, yield model) reads the same scale.
 *
 * It is called "fat class", not "marbling": SR Legacy's "separable lean and
 * fat" includes seam and external fat, not only intramuscular marbling.
 *
 * @file src/lib/butcher/science/fatClass.ts
 */

import type { FatClass } from "@/lib/butcher/types";

export type { FatClass };

/** Lower bound (inclusive) of each class above `lean`, g fat per 100 g. */
export const FAT_CLASS_THRESHOLDS_G = { moderate: 6, high: 12, "very-high": 20 } as const;

export function fatClassFor(fatG: number): FatClass {
  if (fatG >= FAT_CLASS_THRESHOLDS_G["very-high"]) return "very-high";
  if (fatG >= FAT_CLASS_THRESHOLDS_G.high) return "high";
  if (fatG >= FAT_CLASS_THRESHOLDS_G.moderate) return "moderate";
  return "lean";
}

export const FAT_CLASS_LABEL: Readonly<Record<FatClass, string>> = {
  lean: "Lean",
  moderate: "Moderate fat",
  high: "High fat",
  "very-high": "Very high fat",
};

export const FAT_CLASS_RANGE: Readonly<Record<FatClass, string>> = {
  lean: "<6 g",
  moderate: "6–11.9 g",
  high: "12–19.9 g",
  "very-high": "≥20 g",
};

/** Overlay / diagram colours, leanest to fattest. */
export const FAT_CLASS_COLOR: Readonly<Record<FatClass, string>> = {
  lean: "#6b2135",
  moderate: "#be123c",
  high: "#fb7185",
  "very-high": "#f59e0b",
};

/** Classes in display order, fattest first (legend order). */
export const FAT_CLASSES_FATTEST_FIRST: readonly FatClass[] = ["very-high", "high", "moderate", "lean"];
