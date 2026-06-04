import {
  BALANCED_SPREAD,
  CANONICAL_ELEMENT_ORDER,
  CO_DOMINANT_DELTA,
} from "@/constants/elementalSignature";
import type { Element, ElementalProperties } from "@/types/alchemy";

/**
 * The shared elemental signature model.
 *
 * One canonical, pure read of a four-element vector that every display surface
 * (and the cuisine recommendation fallback) routes through, replacing a scatter
 * of ad-hoc "dominant element" reductions that disagreed on ties. It always
 * knows all four elements (ranked), but only *names* secondaries when they are
 * genuinely close to the leader — a clear sky still reads as a single element.
 *
 * Elemental principle: elements are individually valuable, self-reinforcing,
 * and never opposed. "Co-dominant" is additive blending — a richer description,
 * never conflict. There is deliberately no opposing-element logic here.
 *
 * @file src/utils/elemental/signature.ts
 */

export type ElementalTier = "single" | "co-dominant" | "balanced";

export interface RankedElement {
  element: Element;
  /** Normalized share, 0–1. */
  value: number;
}

export interface ElementalSignature {
  /** Normalized values (sum ≈ 1) in canonical Fire/Water/Earth/Air order. */
  values: ElementalProperties;
  /** All four elements, strongest → weakest, with exact ties broken deterministically. */
  ranked: RankedElement[];
  /** The single strongest element. Deterministic for any given input. */
  dominant: Element;
  /**
   * Top-contiguous elements within {@link CO_DOMINANT_DELTA} of the leader.
   * Always contains at least the dominant (length 1 = a clear single lean).
   */
  coDominant: Element[];
  /** Adaptive framing: one clear lean, a close cluster, or an even sky. */
  tier: ElementalTier;
  /** 0–1 evenness (variance metric; identical formula to `useElementalState`). */
  balance: number;
  /**
   * Verb-phrase predicate sized to follow "The sky ___":
   * "leans water" · "leans water & earth" · "is in balance".
   */
  label: string;
  /** Compact descriptor for chips/badges: "Water" · "Water & Earth" · "Balanced". */
  shortLabel: string;
}

/** Coerce a single channel to a finite, non-negative number. */
function channel(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

/** "a" · "a & b" · "a, b & c" — additive joins only, never "vs". */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

function buildLabel(
  tier: ElementalTier,
  dominant: Element,
  coDominant: Element[],
): string {
  if (tier === "balanced") return "is in balance";
  const named = tier === "co-dominant" ? coDominant : [dominant];
  return `leans ${joinNames(named.map((el) => el.toLowerCase()))}`;
}

function buildShortLabel(
  tier: ElementalTier,
  dominant: Element,
  coDominant: Element[],
): string {
  if (tier === "balanced") return "Balanced";
  return tier === "co-dominant" ? joinNames(coDominant) : dominant;
}

/**
 * Derive the canonical {@link ElementalSignature} for a four-element vector.
 *
 * Accepts either raw intensities or already-normalized shares — the input is
 * normalized to sum 1 internally (idempotent for normalized input). A degenerate
 * all-zero / negative vector falls back to an even 0.25 split (→ "balanced"),
 * which is also the SSR/first-paint state, keeping first render deterministic.
 */
export function elementalSignature(
  props: ElementalProperties | null | undefined,
): ElementalSignature {
  const raw: Record<Element, number> = {
    Fire: channel(props?.Fire),
    Water: channel(props?.Water),
    Earth: channel(props?.Earth),
    Air: channel(props?.Air),
  };

  const sum = raw.Fire + raw.Water + raw.Earth + raw.Air;
  const normalized: Record<Element, number> =
    sum > 0
      ? {
          Fire: raw.Fire / sum,
          Water: raw.Water / sum,
          Earth: raw.Earth / sum,
          Air: raw.Air / sum,
        }
      : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

  // Canonical Fire/Water/Earth/Air order for display bars.
  const values: ElementalProperties = {
    Fire: normalized.Fire,
    Water: normalized.Water,
    Earth: normalized.Earth,
    Air: normalized.Air,
  };

  // Rank strongest → weakest; break exact ties by canonical order so `dominant`
  // is identical everywhere regardless of the input object's key order.
  const ranked: RankedElement[] = CANONICAL_ELEMENT_ORDER.map((element) => ({
    element,
    value: normalized[element],
  })).sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return (
      CANONICAL_ELEMENT_ORDER.indexOf(a.element) -
      CANONICAL_ELEMENT_ORDER.indexOf(b.element)
    );
  });

  const dominant = ranked[0].element;
  const leader = ranked[0].value;
  const floor = ranked[ranked.length - 1].value;

  // Co-dominant = the top-contiguous run within CO_DOMINANT_DELTA of the leader.
  const coDominant = ranked
    .filter((r) => leader - r.value <= CO_DOMINANT_DELTA)
    .map((r) => r.element);

  // Evenness — variance metric, identical to the existing useElementalState calc.
  const avg = (normalized.Fire + normalized.Water + normalized.Earth + normalized.Air) / 4;
  const variance =
    (Math.pow(normalized.Fire - avg, 2) +
      Math.pow(normalized.Water - avg, 2) +
      Math.pow(normalized.Earth - avg, 2) +
      Math.pow(normalized.Air - avg, 2)) /
    4;
  const balance = Math.max(0, 1 - variance * 4);

  // A tight overall spread reads as balanced; otherwise a clustered top is
  // co-dominant and a clear lead is a single element.
  let tier: ElementalTier;
  if (leader - floor < BALANCED_SPREAD) tier = "balanced";
  else if (coDominant.length >= 2) tier = "co-dominant";
  else tier = "single";

  return {
    values,
    ranked,
    dominant,
    coDominant,
    tier,
    balance,
    label: buildLabel(tier, dominant, coDominant),
    shortLabel: buildShortLabel(tier, dominant, coDominant),
  };
}
