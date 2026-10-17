/**
 * Triplicate Synastry Pricing Engine (ADR-013 & ADR-018 extension).
 *
 * Couples:
 * 1. Agent A's Natal Chart
 * 2. Agent B's Natal Chart
 * 3. The Current Moment's Transit Sky (live astronomical ephemeris)
 *
 * Computes:
 * - Cross-aspect harmonic resonance (Trines, Sextiles, Conjunctions)
 * - Transit catalyst closures (Grand Trines, Kites, transit triggers)
 * - Symmetric celestial resonance multiplier beta_AB in [0, 0.15]
 * - Deterministic transit window cooldown keys (triplicate_window:...)
 * - Portfolio variance equilibrium checks (ensuring non-wash trading)
 *
 * @file src/lib/economy/triplicatePricing.ts
 */

import {
  type Holdings,
  toLedgerAmount,
} from "@/lib/economy/transmutationMarket";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";
import { signDegreeToLongitude } from "@/utils/aspectCalculator";
import { getAccuratePlanetaryPositionsWithMeta } from "@/utils/astrology/positions";
import {
  calculateAlchemicalFromPlanetsDetailed,
  type AlchemicalPlanetPositions,
} from "@/utils/planetaryAlchemyMapping";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function usablePrice(prices: Record<TokenType, number>, token: TokenType): number {
  const price = prices[token];
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return 1.0;
  }
  return price;
}

const AXIS: Record<TokenType, keyof Holdings> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};

export const MIN_RESONANCE_BONUS = 0.05; // 5% minimum hurdle to trigger celestial rebate
export const MAX_RESONANCE_BONUS = 0.15; // 15% maximum capped celestial rebate

export interface NatalPlacement {
  planet?: string;
  sign?: string;
  degree?: number;
  exactLongitude?: number;
}

export interface AspectClosure {
  planetA: string;
  planetB: string;
  transitPlanet?: string;
  type: "trine" | "sextile" | "conjunction" | "grand_trine";
  orb: number;
  weight: number;
  description: string;
}

export interface TriplicateEvaluation {
  beta: number; // [0, 0.15]
  qualifies: boolean; // beta >= MIN_RESONANCE_BONUS
  aspectDescription: string;
  transitCatalyst: string;
  primaryTransitPlanet: string;
  aspectType: string;
  elementalConcentration: number;
  windowKey: string;
  makerRebateAmount: number; // in wantToken
  takerRebateAmount: number; // in giveToken
}

export interface ActiveResonanceWindow {
  partnerId: string;
  partnerName: string;
  partnerIsAgent: boolean;
  aspectDescription: string;
  transitCatalyst: string;
  bonusPct: number;
  complementaryAxes: { give: TokenType; want: TokenType };
  expiresAt: string;
}

/** Compute angular separation between two ecliptic longitudes (0-180). */
export function aspectSeparation(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Cosine-bell orb tightness factor in [0, 1]. */
export function orbTightness(orb: number, maxOrb: number): number {
  if (orb >= maxOrb || orb < 0) return 0;
  const normalized = (Math.PI * orb) / (2 * maxOrb);
  return Math.cos(normalized) ** 2;
}

function toNatalPlacement(val: unknown): NatalPlacement | null {
  if (!isRecord(val)) return null;
  const planet = typeof val.planet === "string" ? val.planet : undefined;
  const sign = typeof val.sign === "string" ? val.sign : undefined;
  const degree = typeof val.degree === "number" ? val.degree : undefined;
  const exactLongitude = typeof val.exactLongitude === "number" ? val.exactLongitude : undefined;
  return {
    ...(planet ? { planet } : {}),
    ...(sign ? { sign } : {}),
    ...(degree !== undefined ? { degree } : {}),
    ...(exactLongitude !== undefined ? { exactLongitude } : {}),
  };
}

/** Normalise arbitrary natal records into a map of absolute longitudes. */
export function extractLongitudes(
  positions: NatalPlacement[] | Record<string, NatalPlacement> | unknown,
): Record<string, { sign: string; longitude: number }> {
  const result: Record<string, { sign: string; longitude: number }> = {};
  if (!positions) return result;

  const entries: NatalPlacement[] = [];
  if (Array.isArray(positions)) {
    for (const item of positions) {
      const placement = toNatalPlacement(item);
      if (placement) entries.push(placement);
    }
  } else if (isRecord(positions)) {
    for (const [planet, p] of Object.entries(positions)) {
      const placement = toNatalPlacement(p);
      if (placement) {
        entries.push({
          ...placement,
          planet: placement.planet ?? planet,
        });
      }
    }
  }

  for (const entry of entries) {
    if (!entry.planet || !entry.sign) continue;
    const sign = entry.sign.toLowerCase();
    let lon = entry.exactLongitude;
    if (typeof lon !== "number" || !Number.isFinite(lon)) {
      const deg = typeof entry.degree === "number" && Number.isFinite(entry.degree) ? entry.degree : 0;
      lon = signDegreeToLongitude(sign, deg) ?? 0;
    }
    result[entry.planet] = { sign, longitude: ((lon % 360) + 360) % 360 };
  }

  return result;
}

/** Convert natal placement list to AlchemicalPlanetPositions for the ESMS engine. */
export function toAlchemicalPositions(
  lons: Record<string, { sign: string; longitude: number }>,
): AlchemicalPlanetPositions {
  const res: AlchemicalPlanetPositions = {};
  for (const [planet, data] of Object.entries(lons)) {
    res[planet] = {
      sign: data.sign,
      degree: data.longitude % 30,
      exactLongitude: data.longitude,
    };
  }
  return res;
}

/** Construct deterministic 12-hour date bucket string (e.g., "2026-10-17-H1"). */
export function getCurrentDateBucket(date = new Date()): string {
  const dateStr = date.toISOString().slice(0, 10);
  const hourBucket = date.getUTCHours() < 12 ? "H1" : "H2";
  return `${dateStr}-${hourBucket}`;
}

/** Deterministic cooldown key for a pair's claimed transit window. */
export function buildResonanceWindowKey(args: {
  makerId: string;
  takerId: string;
  transitPlanet: string;
  aspectType: string;
  dateBucketUtc?: string;
}): string {
  const [firstId, secondId] = [args.makerId, args.takerId].sort();
  const bucket = args.dateBucketUtc ?? getCurrentDateBucket();
  const planet = args.transitPlanet.replace(/\s+/g, "").toLowerCase();
  const aspect = args.aspectType.replace(/\s+/g, "").toLowerCase();
  return `triplicate_window:${firstId}:${secondId}:${planet}:${aspect}:${bucket}`;
}

/**
 * Check if the principal swap strictly reduces the portfolio value variance for both agents.
 * Computed strictly on the principal swap amounts BEFORE the celestial rebate.
 * Requires makerPostPrincipal < makerPre - EPSILON and takerPostPrincipal < takerPre - EPSILON.
 */
export function checkEquilibriumProgress(args: {
  makerHoldings: Holdings;
  takerHoldings: Holdings;
  giveToken: TokenType;
  giveAmount: number;
  wantToken: TokenType;
  wantAmount: number;
  prices: Record<TokenType, number>;
}): { ok: boolean; reason?: string } {
  const { makerHoldings, takerHoldings, giveToken, giveAmount, wantToken, wantAmount, prices } = args;

  const varianceOf = (h: Holdings): number => {
    const vals = TOKEN_TYPES.map((t) => Math.max(0, h[AXIS[t]]) * usablePrice(prices, t));
    const mean = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    return vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / vals.length;
  };

  const makerPre = varianceOf(makerHoldings);
  const makerPostPrincipal = varianceOf({
    ...makerHoldings,
    [AXIS[giveToken]]: Math.max(0, makerHoldings[AXIS[giveToken]] - giveAmount),
    [AXIS[wantToken]]: makerHoldings[AXIS[wantToken]] + wantAmount,
  });

  const takerPre = varianceOf(takerHoldings);
  const takerPostPrincipal = varianceOf({
    ...takerHoldings,
    [AXIS[wantToken]]: Math.max(0, takerHoldings[AXIS[wantToken]] - wantAmount),
    [AXIS[giveToken]]: takerHoldings[AXIS[giveToken]] + giveAmount,
  });

  const EPSILON = 1e-6;
  if (makerPostPrincipal >= makerPre - EPSILON) {
    return {
      ok: false,
      reason: "Trade does not reduce Maker portfolio imbalance",
    };
  }
  if (takerPostPrincipal >= takerPre - EPSILON) {
    return {
      ok: false,
      reason: "Trade does not reduce Taker portfolio imbalance",
    };
  }
  return { ok: true };
}

/**
 * Evaluate the Triplicate Resonance between Agent A, Agent B, and the Live Sky.
 */
export function evaluateTriplicateSynastry(args: {
  makerId: string;
  takerId: string;
  makerNatal: unknown;
  takerNatal: unknown;
  giveToken: TokenType;
  giveAmount: number;
  wantToken: TokenType;
  wantAmount: number;
  date?: Date;
  transitPositions?: Record<string, { sign: string; degree: number; exactLongitude?: number }>;
}): TriplicateEvaluation {
  const date = args.date ?? new Date();
  const lonsA = extractLongitudes(args.makerNatal);
  const lonsB = extractLongitudes(args.takerNatal);

  // 1. Get Live Transit Sky
  const liveSky =
    args.transitPositions ??
    getAccuratePlanetaryPositionsWithMeta(date).positions;

  const lonsT: Record<string, { sign: string; longitude: number }> = {};
  for (const [p, d] of Object.entries(liveSky)) {
    if (typeof d.exactLongitude === "number") {
      lonsT[p] = { sign: d.sign, longitude: d.exactLongitude };
    }
  }

  // 2. Identify Harmonious Cross-Aspects (Natal A <-> Natal B)
  const closures: AspectClosure[] = [];

  for (const [pA, posA] of Object.entries(lonsA)) {
    for (const [pB, posB] of Object.entries(lonsB)) {
      const sep = aspectSeparation(posA.longitude, posB.longitude);

      // Trine (120 deg, orb <= 6)
      if (Math.abs(sep - 120) <= 6.0) {
        const tightness = orbTightness(Math.abs(sep - 120), 6.0);
        closures.push({
          planetA: pA,
          planetB: pB,
          type: "trine",
          orb: Math.abs(sep - 120),
          weight: 1.0 * tightness,
          description: `${pA} in ${posA.sign} Trine ${pB} in ${posB.sign}`,
        });
      }
      // Sextile (60 deg, orb <= 4)
      else if (Math.abs(sep - 60) <= 4.0) {
        const tightness = orbTightness(Math.abs(sep - 60), 4.0);
        closures.push({
          planetA: pA,
          planetB: pB,
          type: "sextile",
          orb: Math.abs(sep - 60),
          weight: 0.6 * tightness,
          description: `${pA} in ${posA.sign} Sextile ${pB} in ${posB.sign}`,
        });
      }
      // Conjunction (0 deg, orb <= 5)
      else if (sep <= 5.0) {
        const tightness = orbTightness(sep, 5.0);
        closures.push({
          planetA: pA,
          planetB: pB,
          type: "conjunction",
          orb: sep,
          weight: 0.8 * tightness,
          description: `${pA} conjunct ${pB} in ${posA.sign}`,
        });
      }
    }
  }

  // 3. Evaluate Transit Catalyst Closures (Live Sky -> A & B)
  let bestTransitCatalyst = "Transit Sky Activation";
  let primaryTransitPlanet = "Sun";
  let grandTrineDetected = false;

  for (const [pT, posT] of Object.entries(lonsT)) {
    for (const c of closures) {
      if (c.type === "trine") {
        const sepTA = aspectSeparation(posT.longitude, lonsA[c.planetA]?.longitude ?? 0);
        const sepTB = aspectSeparation(posT.longitude, lonsB[c.planetB]?.longitude ?? 0);

        if (Math.abs(sepTA - 120) <= 5.0 && Math.abs(sepTB - 120) <= 5.0) {
          grandTrineDetected = true;
          c.weight *= 1.8;
          c.type = "grand_trine";
          c.transitPlanet = pT;
          primaryTransitPlanet = pT;
          bestTransitCatalyst = `Grand Trine closed by Transit ${pT} in ${posT.sign} (${posT.longitude.toFixed(1)}°)`;
          c.description = `Grand Trine: ${c.planetA} - ${c.planetB} - Transit ${pT}`;
          break;
        }
      }
    }
    if (grandTrineDetected) break;
  }

  if (!grandTrineDetected && closures.length > 0) {
    closures.sort((a, b) => b.weight - a.weight);
    const [top] = closures;
    if (top) {
      let minOrb = 999;
      for (const [pT, posT] of Object.entries(lonsT)) {
        const s = aspectSeparation(posT.longitude, lonsA[top.planetA]?.longitude ?? 0);
        const orb = Math.min(Math.abs(s - 120), Math.abs(s - 60), s);
        if (orb < minOrb) {
          minOrb = orb;
          primaryTransitPlanet = pT;
          bestTransitCatalyst = `Transit ${pT} in ${posT.sign} (${posT.longitude.toFixed(1)}°)`;
        }
      }
    }
  }

  // 4. Compute Harmonious Aspect Score
  const rawHarmonious = closures.reduce((acc, c) => acc + c.weight, 0);
  const hHarmonious = Math.min(1.0, rawHarmonious / 2.0);

  // 5. Compute Elemental Triplicate Activation on the Traded Axes
  const esmsA = calculateAlchemicalFromPlanetsDetailed(toAlchemicalPositions(lonsA)).totals;
  const esmsB = calculateAlchemicalFromPlanetsDetailed(toAlchemicalPositions(lonsB)).totals;
  const esmsT = calculateAlchemicalFromPlanetsDetailed(toAlchemicalPositions(lonsT)).totals;

  const esmsTriplicate = {
    Spirit: esmsA.Spirit + esmsB.Spirit + esmsT.Spirit,
    Essence: esmsA.Essence + esmsB.Essence + esmsT.Essence,
    Matter: esmsA.Matter + esmsB.Matter + esmsT.Matter,
    Substance: esmsA.Substance + esmsB.Substance + esmsT.Substance,
  };

  const meanEsms =
    (esmsTriplicate.Spirit + esmsTriplicate.Essence + esmsTriplicate.Matter + esmsTriplicate.Substance) / 4;
  const tradedConcentration =
    meanEsms > 0
      ? (esmsTriplicate[args.giveToken] + esmsTriplicate[args.wantToken]) / (2 * meanEsms)
      : 1.0;

  // 6. Calculate Symmetric Rebate Multiplier beta_AB
  const rawBeta = hHarmonious * tradedConcentration * MAX_RESONANCE_BONUS;
  const beta = Math.min(MAX_RESONANCE_BONUS, Math.max(0, Math.round(rawBeta * 1000) / 1000));
  const qualifies = beta >= MIN_RESONANCE_BONUS;

  const [topClosure] = closures;
  const aspectDescription = topClosure ? topClosure.description : "Cosmic Transit Alignment";
  const aspectType = topClosure ? topClosure.type : "conjunction";

  const windowKey = buildResonanceWindowKey({
    makerId: args.makerId,
    takerId: args.takerId,
    transitPlanet: primaryTransitPlanet,
    aspectType,
    dateBucketUtc: getCurrentDateBucket(date),
  });

  return {
    beta: qualifies ? beta : 0,
    qualifies,
    aspectDescription,
    transitCatalyst: bestTransitCatalyst,
    primaryTransitPlanet,
    aspectType,
    elementalConcentration: tradedConcentration,
    windowKey,
    makerRebateAmount: qualifies ? toLedgerAmount(args.wantAmount * beta) : 0,
    takerRebateAmount: qualifies ? toLedgerAmount(args.giveAmount * beta) : 0,
  };
}
