import { Droplet, Flame, Leaf, Wind, type LucideIcon } from "lucide-react";
import type { GlyphName } from "@/components/ui/alchm/Glyph";
import type { Element } from "@/types/alchemy";

/**
 * Single element color/icon map for the Tables kit
 * (docs/design/tables-design-spec.md §1).
 *
 * Palette follows the repo's existing element conventions
 * (CompanionSuggestions.tsx: Fire orange-400, Water blue-400,
 * Air purple-300, Earth green-400). `hex` mirrors the Tailwind
 * class so SVG strokes / glows stay in lockstep with the classes.
 * Glyph names reuse the alchemical-triangle sigils from
 * ELEMENT_META (ui/alchm/ElementalSignature).
 */

export const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air"];

export interface ElementColor {
  /** Raw color for SVG strokes, drop-shadows, and inline styles. */
  hex: string;
  text: string;
  hoverText: string;
  border: string;
  bg: string;
  /** Glowing 2px dot recipe for ElementChip. */
  dot: string;
}

export const ELEMENT_COLORS: Record<Element, ElementColor> = {
  Fire: {
    hex: "#fb923c",
    text: "text-orange-400",
    hoverText: "hover:text-orange-400",
    border: "border-orange-400/30",
    bg: "bg-orange-500/10",
    dot: "bg-orange-400 shadow-[0_0_5px_#fb923c]",
  },
  Water: {
    hex: "#60a5fa",
    text: "text-blue-400",
    hoverText: "hover:text-blue-400",
    border: "border-blue-400/30",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400 shadow-[0_0_5px_#60a5fa]",
  },
  Earth: {
    hex: "#4ade80",
    text: "text-green-400",
    hoverText: "hover:text-green-400",
    border: "border-green-400/30",
    bg: "bg-green-500/10",
    dot: "bg-green-400 shadow-[0_0_5px_#4ade80]",
  },
  Air: {
    hex: "#d8b4fe",
    text: "text-purple-300",
    hoverText: "hover:text-purple-300",
    border: "border-purple-300/30",
    bg: "bg-purple-500/10",
    dot: "bg-purple-300 shadow-[0_0_5px_#d8b4fe]",
  },
};

/** lucide icons per element (tables-design-spec.md §5). */
export const ELEMENT_ICONS: Record<Element, LucideIcon> = {
  Fire: Flame,
  Water: Droplet,
  Earth: Leaf,
  Air: Wind,
};

/** Alchemical-triangle sigils (same set as ui/alchm ELEMENT_META). */
export const ELEMENT_GLYPHS: Record<Element, GlyphName> = {
  Fire: "triangle-up",
  Water: "triangle-down",
  Earth: "triangle-down-bar",
  Air: "triangle-up-bar",
};

/**
 * Normalize an element vector into whole percentages via largest-remainder
 * apportionment: floor each exact share, then hand the leftover points to
 * the largest fractional remainders (ties broken deterministically by
 * ELEMENTS order). Guarantees the values sum to exactly 100 whenever the
 * input total is positive — independent per-element rounding does not
 * ({Fire:1, Water:1, Earth:1} would otherwise read 33/33/33 = 99).
 * Negative/missing entries count as 0; an all-zero vector returns all 0s.
 */
export function apportionPercentages(
  values: Partial<Record<Element, number>>,
): Record<Element, number> {
  const result: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };
  const clamped = ELEMENTS.map(
    (element) => [element, Math.max(0, values[element] ?? 0)] as const,
  );
  const total = clamped.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return result;

  let leftover = 100;
  const remainders = clamped.map(([element, value], index) => {
    const exact = (value / total) * 100;
    const floored = Math.floor(exact);
    result[element] = floored;
    leftover -= floored;
    return { element, remainder: exact - floored, index };
  });
  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { element } of remainders) {
    if (leftover <= 0) break;
    result[element] += 1;
    leftover -= 1;
  }
  return result;
}

export type { Element };
