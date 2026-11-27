import { FAT_CLASS_COLOR, FAT_CLASS_LABEL, FAT_CLASS_RANGE, FAT_CLASSES_FATTEST_FIRST, fatClassFor } from "@/lib/butcher/science/fatClass";
import type { AnatomicalCut, ColorOverlayMode } from "@/lib/butcher/types";

/**
 * Pure-TS color thresholds and UI legend descriptors for the 4 Butcher Shop
 * 3D carcass overlay modes. Kept free of `three` imports so UI panels can
 * render the legend without pulling Three.js into the main route entry chunk.
 *
 * @file src/lib/butcher/stage/overlayLegend.ts
 */

export interface OverlayLegendSwatch {
  readonly colorHex: string;
  readonly label: string;
}

export const COLLAGEN_COLORS = {
  high: "#a855f7",
  medium: "#f59e0b",
  low: "#10b981",
} as const;

export const THERMAL_STRATEGY_COLORS = {
  slow: "#6366f1",
  gentleWet: "#06b6d4",
  highHeat: "#f97316",
} as const;

export const OVERLAY_COLOR_LEGEND: Readonly<Record<ColorOverlayMode, readonly OverlayLegendSwatch[]>> = {
  anatomical: [
    { colorHex: "#bf3b3b", label: "Anatomical primal tone" },
    { colorHex: "#fbbf24", label: "Selected cut" },
    { colorHex: "#38bdf8", label: "Hovered cut" },
  ],
  marbling: FAT_CLASSES_FATTEST_FIRST.map((fc) => ({
    colorHex: FAT_CLASS_COLOR[fc],
    label: `${FAT_CLASS_RANGE[fc]} fat (${FAT_CLASS_LABEL[fc]})`,
  })),
  collagen: [
    { colorHex: COLLAGEN_COLORS.low, label: "<1.3 g (Tender / quick sear)" },
    { colorHex: COLLAGEN_COLORS.medium, label: "1.3–2.1 g (Medium)" },
    { colorHex: COLLAGEN_COLORS.high, label: "≥2.2 g (Braise / smoke)" },
  ],
  thermal: [
    { colorHex: THERMAL_STRATEGY_COLORS.highHeat, label: "Sear / Reverse Sear" },
    { colorHex: THERMAL_STRATEGY_COLORS.gentleWet, label: "Sous-Vide / Poach" },
    { colorHex: THERMAL_STRATEGY_COLORS.slow, label: "Braise / BBQ Smoke" },
  ],
};

export function colorHexForOverlay(cut: AnatomicalCut, mode: ColorOverlayMode): string {
  if (mode === "anatomical") return cut.geometry3d.colorHex;
  if (mode === "marbling") return FAT_CLASS_COLOR[fatClassFor(cut.proximate.fatG)];
  if (mode === "collagen") {
    if (cut.proximate.collagenG >= 2.2) return COLLAGEN_COLORS.high;
    if (cut.proximate.collagenG >= 1.3) return COLLAGEN_COLORS.medium;
    return COLLAGEN_COLORS.low;
  }
  const [primary] = cut.optimalMethods;
  if (primary === "collagen-braise" || primary === "low-and-slow-smoke") return THERMAL_STRATEGY_COLORS.slow;
  if (primary === "sous-vide" || primary === "poach-confit") return THERMAL_STRATEGY_COLORS.gentleWet;
  return THERMAL_STRATEGY_COLORS.highHeat;
}
