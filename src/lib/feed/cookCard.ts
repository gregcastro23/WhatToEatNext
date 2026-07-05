/**
 * Cooked-it card metadata — SERVER ONLY.
 *
 * Builds the alchemical identity of a dish post at share time: the cook's
 * chart-persona ("A Scorpio-Sun water cook" — pseudonymous by design, real
 * names never appear on cooked-it cards), their elemental signature chip, and
 * the transit line ("made under a waxing gibbous Moon in Pisces"). Everything
 * is computed ONCE here and stored in the feed row's metadata — renders never
 * recompute astronomy.
 */

import type { NatalChart } from "@/types/natalChart";
import { extractPlanetaryPositions } from "@/utils/astrology/chartDataUtils";
import { getLunarPhaseName, calculateLunarPhase, calculatemoonSign } from "@/utils/astrology/core";
import { elementalSignature } from "@/utils/elemental";

export interface CookCardIdentity {
  /** e.g. "A Scorpio-Sun water cook" — never a real name. */
  persona: string;
  /** e.g. "Water & Earth" — the elemental signature short label. */
  signature: string | null;
  /** e.g. "made under a waxing gibbous Moon in Pisces". */
  transitLine: string;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

/** The chart-persona string. Chartless cooks get the humble default. */
export function buildPersona(natalChart: NatalChart | null | undefined): string {
  if (!natalChart) return "An alchemist of the kitchen";
  const positions = extractPlanetaryPositions(natalChart) as Record<string, string>;
  const sun = positions?.Sun ?? positions?.sun;
  const element = natalChart.dominantElement;
  if (sun && element) return `A ${capitalize(String(sun))}-Sun ${String(element).toLowerCase()} cook`;
  if (sun) return `A ${capitalize(String(sun))}-Sun cook`;
  if (element) return `A ${String(element).toLowerCase()}-leaning cook`;
  return "An alchemist of the kitchen";
}

/** Full card identity: persona + signature chip + transit line for `at`. */
export async function buildCookCardIdentity(
  natalChart: NatalChart | null | undefined,
  at = new Date(),
): Promise<CookCardIdentity> {
  const persona = buildPersona(natalChart);

  let signature: string | null = null;
  if (natalChart?.elementalBalance) {
    try {
      // celestial.ElementalProperties lacks the index signature alchemy's
      // variant declares — same four keys at runtime.
      signature = elementalSignature({ ...natalChart.elementalBalance }).shortLabel;
    } catch {
      signature = null;
    }
  }

  let transitLine = "made under today's sky";
  try {
    const [phase, moonSign] = await Promise.all([
      calculateLunarPhase(at).then(getLunarPhaseName),
      calculatemoonSign(at),
    ]);
    // "new moon"/"full moon" phase names would double the word before "Moon".
    const phaseLabel = String(phase).replace(/\s*moon$/i, "");
    transitLine = `made under a ${phaseLabel} Moon in ${capitalize(String(moonSign))}`;
  } catch {
    /* astronomy hiccup — keep the graceful default */
  }

  return { persona, signature, transitLine };
}
