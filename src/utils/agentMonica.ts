/**
 * Agent monica — a real thermodynamic monica for a single planetary configuration.
 *
 * A "planetary agent" is one planet at one position (e.g. "Aries Sun 1 Degree").
 * That configuration has a definite alchemical signature, so a real monica is
 * computable for it — but only once two problems are solved (both measured; see
 * docs/physics/SYNTHESIS_MODEL.md §18):
 *
 *  1. A lone planet's ESMS is too sparse: with the raw synthesis table kalchm
 *     collapses to exactly 1 for 8 of 10 planets and monica goes undefined.
 *     SECT-RESOLVING the ESMS (a single axis per sect, PLANETARY_SECTARIAN_ESMS)
 *     breaks that symmetry.
 *  2. A single planet barely populates Matter/Substance, so reactivity blows up.
 *     A GROUNDING VESSEL fixes it.
 *
 * The vessel is process-shaped and dignity-scaled:
 *
 *     vessel = normalize( max(0, 1 + pillarEffect(degree)), mass = 4 )
 *              × (1 + dignity / 100)
 *
 * where the degree selects one of the 14 alchemical processes (§7a) and dignity
 * is the planet's own essential dignity at its sign (the +10/+7/-7/-10 scale).
 * The sect-resolved ESMS plus the vessel goes through the canonical
 * data/unified thermodynamics. Both sects are returned — a position expresses
 * differently by day and night.
 *
 * Measured with the canonical totality contract: always finite, on the full-chart
 * scale (|monica| < 10). The degree resolves into a handful of bands. Dignity
 * moves the value for the asymmetric-vessel degrees (domicile reads LOWER than
 * peregrine — the stronger vessel pushes the ESMS toward balance); the two
 * symmetric-vessel degrees (Solution, Calcination → {0,2,2,0}) land in the
 * equilibrium band and correctly return φ regardless of dignity. Any all-zero /
 * unknown-planet input also resolves to φ, never NaN.
 */
import { ALCHEMICAL_PILLARS } from "@/constants/alchemicalPillars";
import {
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import type { AlchemicalProperties } from "@/types/celestial";
import { getDignityScore } from "@/utils/dignityScales";
import {
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
} from "@/utils/planetaryAlchemyMapping";

export type Sect = "diurnal" | "nocturnal";

/** Total mass the process-shaped vessel is normalised to — equal to a flat
 *  {1,1,1,1} baseline, so only the SHAPE varies by degree, not the grounding
 *  magnitude. See §18c. */
export const VESSEL_MASS = 4;

interface ESMS {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

const ZERO_ESMS: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

type SignKey = keyof typeof ZODIAC_ELEMENTS;

/** Normalise a sign to the Title-case key ZODIAC_ELEMENTS uses. */
function toSignKey(sign: string): SignKey | null {
  if (!sign) return null;
  const key = (sign.charAt(0).toUpperCase() +
    sign.slice(1).toLowerCase()) as SignKey;
  return key in ZODIAC_ELEMENTS ? key : null;
}

/**
 * The process-shaped, dignity-scaled grounding vessel for a given degree.
 * `dignityEsmsScale` is the +10/+7/0/-7/-10 essential-dignity score.
 */
function vessel(degree: number, dignityEsmsScale: number): ESMS {
  // Degree 1..30 → one of the 14 alchemical processes (§7a). The array is
  // 0-indexed, so pillar id = index + 1.
  const idx = ((Math.floor(degree) - 1) % 14 + 14) % 14;
  const eff = ALCHEMICAL_PILLARS[idx].effects;

  // Base {1,1,1,1} + signed process effect, floored at zero (§7 vessel rule).
  const raw: ESMS = {
    Spirit: Math.max(0, 1 + eff.Spirit),
    Essence: Math.max(0, 1 + eff.Essence),
    Matter: Math.max(0, 1 + eff.Matter),
    Substance: Math.max(0, 1 + eff.Substance),
  };
  const sum = raw.Spirit + raw.Essence + raw.Matter + raw.Substance || 1;
  const k = (VESSEL_MASS / sum) * (1 + dignityEsmsScale / 100);
  return {
    Spirit: raw.Spirit * k,
    Essence: raw.Essence * k,
    Matter: raw.Matter * k,
    Substance: raw.Substance * k,
  };
}

/**
 * The single-body monica for one planet at one sign+degree, in one sect.
 * Always finite by the canonical totality contract.
 */
export function agentMonicaForSect(
  planet: string,
  sign: string,
  degree: number,
  sect: Sect,
): number {
  const sectTable = PLANETARY_SECTARIAN_ESMS[
    planet as keyof typeof PLANETARY_SECTARIAN_ESMS
  ];
  const base: ESMS = sectTable ? { ...ZERO_ESMS, ...sectTable[sect] } : ZERO_ESMS;

  const signKey = toSignKey(sign);
  const dignityScale = signKey ? getDignityScore(planet, signKey).esmsScale : 0;
  const v = vessel(degree, dignityScale);

  const esms: ESMS = {
    Spirit: base.Spirit + v.Spirit,
    Essence: base.Essence + v.Essence,
    Matter: base.Matter + v.Matter,
    Substance: base.Substance + v.Substance,
  };

  const element = signKey ? ZODIAC_ELEMENTS[signKey] : "Fire";
  const elementalProps = {
    Fire: element === "Fire" ? 1 : 0,
    Water: element === "Water" ? 1 : 0,
    Air: element === "Air" ? 1 : 0,
    Earth: element === "Earth" ? 1 : 0,
  };

  const t = calculateThermodynamics(esms as AlchemicalProperties, elementalProps);
  const kalchm = calculateKalchm(esms as AlchemicalProperties);
  return calculateMonica(t.gregsEnergy, t.reactivity, kalchm);
}

export interface AgentMonica {
  diurnal: number;
  nocturnal: number;
  /** The average of the two sects — the value written to monica_constant. */
  combined: number;
}

/**
 * The agent monica for a planetary configuration, both sects. `combined` is the
 * mean, for the single-column consumers (§18e).
 */
export function agentMonica(
  planet: string,
  sign: string,
  degree: number,
): AgentMonica {
  const diurnal = agentMonicaForSect(planet, sign, degree, "diurnal");
  const nocturnal = agentMonicaForSect(planet, sign, degree, "nocturnal");
  return { diurnal, nocturnal, combined: (diurnal + nocturnal) / 2 };
}
