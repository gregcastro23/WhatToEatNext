import fs from "fs";
import {
  calculateMonica,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { _logger } from "@/lib/logger";
import type { ElementalProperties } from "@/types/celestial";
import { type DegradedInfo, mergeDegraded } from "@/types/degraded";
import {
  calculateComprehensiveAspects,
  signDegreeToLongitude,
} from "@/utils/aspectCalculator";
import type { AspectWithStrength } from "@/utils/aspectESMSEffects";
import { getAccuratePlanetaryPositionsWithMeta, isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import {
    getPlanetarySectElement, calculateEnhancedAlchemicalFromPlanets, PLANETARY_SECTARIAN_ESMS
} from "@/utils/planetaryAlchemyMapping";

// Zodiac modality lookup + dominant-modality tally, computed from the live
// planetary positions instead of a hardcoded "Cardinal".
const SIGN_MODALITY: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

function computeDominantModality(
  positions: Record<string, { sign?: string }>,
): "Cardinal" | "Fixed" | "Mutable" {
  const tally: Record<"Cardinal" | "Fixed" | "Mutable", number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };
  for (const pos of Object.values(positions || {})) {
    const modality = SIGN_MODALITY[(pos?.sign || "").toLowerCase()];
    if (modality) tally[modality] += 1;
  }
  const [top] = (
    Object.entries(tally) as Array<["Cardinal" | "Fixed" | "Mutable", number]>
  ).sort((a, b) => b[1] - a[1]);
  return top && top[1] > 0 ? top[0] : "Cardinal";
}

const PLANET_ALCHM_PERIODS: Record<string, number> = {
  Pluto: 247.94,
  Neptune: 164.79,
  Uranus: 84.01,
  Saturn: 29.46,
  Jupiter: 11.86,
  Mars: 1.88,
  Sun: 1.0,
  Venus: 0.615,
  Mercury: 0.241,
  Moon: 0.075,
  Ascendant: 0.003,
};

const PERIOD_LOG_MIN = Math.log10(0.003);
const PERIOD_LOG_MAX = Math.log10(247.94);

function normalizeAlchmWeight(periodYears: number): number {
  return (
    (Math.log10(Math.max(periodYears, 1e-9)) - PERIOD_LOG_MIN) /
    (PERIOD_LOG_MAX - PERIOD_LOG_MIN)
  );
}

/**
 * Bodies excluded from the ESMS aspect universe — not real planets, so they
 * carry no planetaryAlchemy/dignity entry and must not seed Layer-3 aspects.
 *
 * Matched case- and whitespace-insensitively. The Swiss-Ephemeris backend and
 * the local astronomy-engine fallback disagree on spelling for the very same
 * body ("North Node" vs "NorthNode"), and a literal `===` list silently
 * admits whichever spelling it forgets to list. That happened here: "South
 * Node" was excluded but "North Node" was not, so whenever backend positions
 * were live, node aspects leaked into Layer 3 for one node but not the other.
 * Normalizing closes this gap and any future one in the same shape, rather
 * than chasing spellings one at a time.
 */
const EXCLUDED_ASPECT_BODIES = new Set([
  "northnode",
  "southnode",
  "truenode",
  "meannode",
  "chiron",
  "lilith",
  "vertex",
  "parsfortune",
  "mc",
]);

function isExcludedAspectBody(planet: string): boolean {
  return EXCLUDED_ASPECT_BODIES.has(planet.toLowerCase().replace(/\s+/g, ""));
}

/**
 * Real Alchemize Service
 *
 * This service provides real alchemical calculations based on actual planetary positions.
 * It uses the proven standalone alchemize function that produces meaningful, nonzero results.
 *
 * Sectarian Logic (January 2026):
 * The elemental totals are now a blend of:
 *   60% — the element of the zodiac sign the planet occupies (traditional)
 *   40% — the planet's own sectarian element (diurnal or nocturnal)
 * This means the elemental profile of the sky shifts at every sunrise and sunset,
 * making the quantities truly dynamic.
 */
// Types
export interface PlanetaryPosition {
  sign: any;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
}
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}
export interface StandardizedAlchemicalResult {
  elementalProperties: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  planetaryMomentum: Record<string, number>;
  kalchm: number;
  monica: number;
  score: number;
  normalized: boolean;
  confidence: number;
  metadata: {
    source: string;
    dominantElement: string;
    dominantModality: string;
    sunSign: string;
    chartRuler: string;
    isDiurnal: boolean;
  };
  /**
   * Present only when the result is not fully live — e.g. positions fell back to
   * interpolated/static data, or monica fell back to its equilibrium value (φ).
   * Absent on healthy results so existing consumers are unaffected.
   */
  degraded?: DegradedInfo;
}
// Utility functions
function normalizeSign(sign: string): any {
  const normalized = sign.toLowerCase();
  const validSigns: any[] = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];
  if (validSigns.includes(normalized as any)) {
    return normalized as any;
  }
  throw new Error(`Invalid zodiac sign: ${sign}`);
}
function getZodiacElement(sign: string): string {
  const elementMap: Record<string, string> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };
  return elementMap[sign.toLowerCase()] || "Air";
}
function getPlanetaryDignity(planet: string, sign: string): number {
  const dignityMap: Record<string, Record<string, number>> = {
    Sun: {
      leo: 1,
      aries: 2,
      aquarius: -1,
      libra: -2,
    },
    Moon: {
      cancer: 1,
      taurus: 2,
      capricorn: -1,
      scorpio: -2,
    },
    Mercury: {
      gemini: 1,
      virgo: 3,
      sagittarius: 1,
      pisces: -3,
    },
    Venus: {
      libra: 1,
      taurus: 1,
      pisces: 2,
      aries: -1,
      scorpio: -1,
      virgo: -2,
    },
    Mars: {
      aries: 1,
      scorpio: 1,
      capricorn: 2,
      taurus: -1,
      libra: -1,
      cancer: -2,
    },
    Jupiter: {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2,
    },
    Saturn: {
      aquarius: 1,
      capricorn: 1,
      libra: 2,
      cancer: -1,
      leo: -1,
      aries: -2,
    },
    Uranus: {
      aquarius: 1,
      scorpio: 2,
      taurus: -3,
    },
    Neptune: {
      pisces: 1,
      cancer: 2,
      virgo: -1,
      capricorn: -2,
    },
    Pluto: {
      scorpio: 1,
      leo: 2,
      taurus: -1,
      aquarius: -2,
    },
  };
  const planetMap = dignityMap[planet];
  if (!planetMap) return 0;
  return planetMap[sign.toLowerCase()] || 0;
}
/**
 * Core alchemize function that calculates alchemical properties from planetary positions
 * This is the proven implementation that produces meaningful, nonzero results
 *
 * @param planetaryPositions - CURRENT planetary positions
 * @param historicalPositions - PREVIOUS planetary positions (for momentum calculation)
 * @param date - The moment being calculated
 * @param options.diurnal - Override the computed sect. Sect is otherwise derived
 *   from `date` at the site's NEW YORK reference observer, which is right for
 *   the live sky and WRONG for a natal chart: a birth chart's sect belongs to
 *   the birth moment at the BIRTHPLACE. Natal callers should compute it with
 *   `isDiurnalAt(birthMoment, lat, lon)` and pass it here.
 */
export function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
  date: Date = new Date(),
  options: { incomingDegraded?: DegradedInfo | null; diurnal?: boolean } = {},
): StandardizedAlchemicalResult {
  // Initialize totals
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
  // Planetary alchemical properties (CANONICAL VALUES from CLAUDE.md)
  // These MUST be 0 or 1 - no fractional values allowed
  const planetaryAlchemy: Record<
    string,
    { Spirit: number; Essence: number; Matter: number; Substance: number }
  > = {
    Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Ascendant: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 },
  };
  // Determine sect (diurnal / nocturnal) for the moment being calculated.
  // Using the provided `date` parameter ensures historical/forecast
  // calculations use the correct sect for that point in time.
  //
  // `options.diurnal` overrides it entirely. Required for NATAL charts: the
  // default resolves sect at the site's New York reference observer, so a
  // birth chart would otherwise inherit the sect of whoever's sky it was
  // computed under rather than its own. See the @param note above.
  const diurnal = options.diurnal ?? isCurrentSkyDiurnal(date);

  // Momentum Tracking
  const planetaryMomentum: Record<string, number> = {};
  // Elemental blending weights:
  //   60% from the planet's zodiac sign (WHERE it is — the medium)
  //   40% from the planet's sectarian element (WHAT it is — its nature)
  const SIGN_WEIGHT = 0.6;
  const SECT_WEIGHT = 0.4;
  // Process each planet
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Non-planets (nodes, MC, Chiron, Lilith, Vertex, Pars Fortune) contribute
    // nothing here either — same rule as the aspect pass below.
    //
    // Without this gate they still reached the elemental blend: 60% from
    // getZodiacElement(sign), which is real, plus 40% from
    // getPlanetarySectElement(), which silently returns "Air" for any body it
    // does not know. A live sky carrying MC and both nodes therefore had three
    // phantom bodies each pushing 0.4 of pure Air into the totals, skewing
    // elementalProperties and everything derived from it (thermodynamics,
    // monica). Their momentum was fabricated too: alchmWeight falls back to
    // PLANET_ALCHM_PERIODS[planet] ?? 1.0, and 1.0 is Pluto's weight, so MC
    // was being handed the heaviest alchemical mass in the system.
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    // Get planetary alchemical properties
    const alchemy = planetaryAlchemy[planet];
    // Alchm weighting: orbital period (slower = deeper alchemical tide)
    // SPECIAL CASE: The Ascendant is the "Physical Vessel" grounding constant (weight = 1.0)
    // Declared here (outside if-alchemy) so alchmWeight is in scope for momentum calc below.
    const period = PLANET_ALCHM_PERIODS[planet] ?? 1.0;
    const alchmWeight = planet === "Ascendant" ? 1.0 : normalizeAlchmWeight(period);
    if (alchemy) {
      // Apply dignity modifier (existing ±0.15/level scale kept for RealAlchemize compat)
      const dignity = getPlanetaryDignity(planet, position.sign);
      const dignityMultiplier = Math.max(0.5, 1.0 + dignity * 0.15);
      totals.Spirit    += alchemy.Spirit    * dignityMultiplier * alchmWeight;
      totals.Essence   += alchemy.Essence   * dignityMultiplier * alchmWeight;
      totals.Matter    += alchemy.Matter    * dignityMultiplier * alchmWeight;
      totals.Substance += alchemy.Substance * dignityMultiplier * alchmWeight;
    }
    // Elemental contribution — blend of zodiac sign element and sectarian element.
    // Sign element: the element of the sign the planet currently occupies.
    const signElement = getZodiacElement(position.sign);
    // Sectarian element: the planet's own elemental nature under the current sect.
    const sectElement = getPlanetarySectElement(planet, diurnal);
    // Apply both weights (total weight per planet remains 1.0)
    const addElement = (el: string, weight: number) => {
      if (el === "Fire") totals.Fire += weight;
      else if (el === "Water") totals.Water += weight;
      else if (el === "Air") totals.Air += weight;
      else if (el === "Earth") totals.Earth += weight;
    };
    addElement(signElement, SIGN_WEIGHT);
    addElement(sectElement, SECT_WEIGHT);

    // Momentum Calculation: (Current Longitude - Historical Longitude) * Mass
    // Using decimalDegrees for arc-minute precise difference.
    if (historicalPositions && historicalPositions[planet]) {
      const histPos = historicalPositions[planet];
      // Note: handles 12*60=720 arc-minute / 360 degree wrap implicitly 
      // as DecimalDegrees are typically 0-360.
      let delta = (position.exactLongitude || (position.degree + position.minute/60)) - 
                  (histPos.exactLongitude || (histPos.degree + histPos.minute/60));
      
      // Handle the 360 -> 0 wrap
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      // Momentum = Velocity (delta) * Alchemical Mass (alchmWeight)
      planetaryMomentum[planet] = delta * alchmWeight;
    } else {
      planetaryMomentum[planet] = 0;
    }
  }

  // Convert planetaryPositions to positionData and signMap for aspect/enhanced calculations
  const positionData: Record<string, any> = {};
  const signMap: Record<string, string> = {};
  for (const [planet, pos] of Object.entries(planetaryPositions)) {
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    signMap[planet] = sign;
    positionData[planet] = {
      sign,
      degree: pos.degree,
      // `degree` is sign-relative, so it is NOT a longitude. Reconstruct the
      // absolute longitude from sign + degree when the caller omitted it;
      // treating degree as a longitude would collapse all ten planets into the
      // first 30° of the zodiac and make almost every pair a false conjunction.
      // `??` not `||`, so a true 0° Aries longitude is not discarded.
      exactLongitude:
        pos.exactLongitude ??
        signDegreeToLongitude(sign, pos.degree, pos.minute) ??
        undefined,
      isRetrograde: pos.isRetrograde,
    };
  }

  // Physical-Vessel grounding constant: a location-less "live sky" has no
  // computed Ascendant, but the sect ESMS model relies on it to supply the
  // Matter/Substance baseline (a day chart maps every planet to Spirit/Essence,
  // so both collapse to 0 without it). Added to signMap only — not positionData
  // — so it grounds ESMS without injecting phantom aspects or element weight.
  if (!signMap.Ascendant) {
    signMap.Ascendant = "aries";
  }

  // Calculate aspects
  const aspectsRaw = calculateComprehensiveAspects(positionData);
  const aspects: AspectWithStrength[] = aspectsRaw.map((a) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    strength: a.strength,
  }));

  // Enhanced calculation
  const enhancedESMS = calculateEnhancedAlchemicalFromPlanets(signMap, diurnal, aspects);
  totals.Spirit = enhancedESMS.Spirit;
  totals.Essence = enhancedESMS.Essence;
  totals.Matter = enhancedESMS.Matter;
  totals.Substance = enhancedESMS.Substance;

  // Calculate thermodynamic metrics using the exact formulas
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } =
    totals;
  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = heatNum / Math.max(heatDen, 0.01); // canonical floor (§17c)
  // Entropy
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / Math.max(entropyDen, 0.01);
  // Reactivity — CANONICAL form (§17c): reactivityNum / (Matter + Earth)².
  //
  // This previously used the divergent `(Σ / Matter) + Earth²` form, which read
  // 9.09 on the shared probe against the canonical 2.05 and grew without bound as
  // Earth rose (Earth had moved from the denominator to an additive term). The
  // (Matter + Earth)² denominator keeps Earth grounding reactivity, matches every
  // other live engine, and the 0.01 floor preserves the non-zero baseline the old
  // comment relied on the Ascendant's Matter for. See SYNTHESIS_MODEL.md §14a.
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivity =
    reactivityNum / Math.max(Math.pow(Matter + Earth, 2), 0.01);
  // Greg's Energy;
  const gregsEnergy = heat - entropy * reactivity;
  // Kalchm (K_alchm). Clamp ESMS bases to a tiny positive epsilon first: a
  // negative base (possible after aspect modifications subtract below 0) makes
  // Math.pow return NaN, which would otherwise propagate into monica, pricing,
  // and the API payload. x^x → 1 as x → 0, so valid inputs are unaffected.
  const kSpirit = Math.max(Spirit, 1e-9);
  const kEssence = Math.max(Essence, 1e-9);
  const kMatter = Math.max(Matter, 1e-9);
  const kSubstance = Math.max(Substance, 1e-9);
  const kalchmRaw =
    (Math.pow(kSpirit, kSpirit) * Math.pow(kEssence, kEssence)) /
    (Math.pow(kMatter, kMatter) * Math.pow(kSubstance, kSubstance));
  const kalchm = Number.isFinite(kalchmRaw) ? kalchmRaw : 1;
  // Monica constant: −GregsEnergy / (Reactivity × ln(Kalchm))
  // Guards: kalchm must be > 0; lnK must be non-zero; reactivity must be non-zero
  // Monica via the canonical engine (§17c): always finite, and returns φ at the
  // equilibrium point (kalchm ≈ 1) instead of the old 1.0 placeholder. The
  // degraded flag still fires when the value is that fallback rather than a real
  // deviation, so consumers can still distinguish a degenerate monica.
  const monica = calculateMonica(gregsEnergy, reactivity, kalchm);
  const lnK = kalchm > 0 && Number.isFinite(kalchm) ? Math.log(kalchm) : 0;
  const monicaDegenerate = !(
    Math.abs(lnK) >= MONICA_LN_EPSILON && reactivity !== 0
  );
  // A degraded result is surfaced when the inbound positions were not live
  // (passed via options.incomingDegraded) or monica never escaped its default.
  const degraded = mergeDegraded(
    options.incomingDegraded,
    monicaDegenerate ? { reasons: ["monica-degenerate"] } : null,
  );
  // Calculate dominant element
  const elements = { Fire, Water, Air, Earth };
  const dominantElement = Object.entries(elements).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  // Calculate score based on total energy
  const score = Math.min(
    1.0,
    Math.max(
      0.0,
      (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20,
    ),
  );
  return {
    elementalProperties: {
      Fire: Fire / Math.max(1, Fire + Water + Air + Earth),
      Water: Water / Math.max(1, Fire + Water + Air + Earth),
      Earth: Earth / Math.max(1, Fire + Water + Air + Earth),
      Air: Air / Math.max(1, Fire + Water + Air + Earth),
    },
    thermodynamicProperties: {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
    },
    esms: { Spirit, Essence, Matter, Substance },
    planetaryMomentum,
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: "alchemize",
      dominantElement,
      dominantModality: computeDominantModality(planetaryPositions),
      sunSign: planetaryPositions["Sun"]?.sign || "",
      chartRuler: getZodiacElement(planetaryPositions["Sun"]?.sign || "aries"),
      isDiurnal: diurnal,
    },
    ...(degraded ? { degraded } : {}),
  };
}
/**
 * Per-planet contribution to the alchemize totals at a single moment.
 * - `esms`     : raw Spirit/Essence/Matter/Substance contributed by this planet
 *                (alchemy × dignityMultiplier × alchmWeight).
 * - `elements` : Fire/Water/Earth/Air contributed (sign-element × 0.6 + sect-element × 0.4).
 * - `signElement` / `sectElement` : the two elemental sources that blended.
 * - `alchmWeight` / `dignityMultiplier` : the scalars applied this moment.
 */
export interface PerPlanetBreakdown {
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  elements: { Fire: number; Water: number; Earth: number; Air: number };
  sign: string;
  signElement: string;
  sectElement: string;
  alchmWeight: number;
  dignityMultiplier: number;
}

export type DetailedAlchemicalResult = StandardizedAlchemicalResult & {
  /** Each contributing planet's decomposition. Keyed by planet name. */
  perPlanet: Record<string, PerPlanetBreakdown>;
};

/**
 * Same calculation as {@link alchemize}, but additionally returns the
 * per-planet contribution to ESMS and to each element. Used by the
 * pre-computation pipeline and the statistics layer.
 *
 * Logic is intentionally a near-clone of {@link alchemize} so its outputs are
 * bit-identical; if you change one, change the other. (We could share an
 * inner helper, but the duplication keeps each function independently
 * auditable, which the team has preferred for this critical path.)
 */
export function alchemizeDetailed(
  planetaryPositions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
  date: Date = new Date(),
  options: { incomingDegraded?: DegradedInfo | null } = {},
): DetailedAlchemicalResult {
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
  const planetaryAlchemy: Record<
    string,
    { Spirit: number; Essence: number; Matter: number; Substance: number }
  > = {
    Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Ascendant: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 },
  };
  const diurnal = isCurrentSkyDiurnal(date);
  const planetaryMomentum: Record<string, number> = {};
  const perPlanet: Record<string, PerPlanetBreakdown> = {};
  const SIGN_WEIGHT = 0.6;
  const SECT_WEIGHT = 0.4;

  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Same exclusion as alchemize() above and the aspect pass below — see the
    // comment there. Additionally keeps non-planets out of `perPlanet`, whose
    // consumers reasonably assume its keys are real planets (an MC entry
    // carried populated `elements` beside all-zero `esms`).
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    const alchemy = planetaryAlchemy[planet];
    const period = PLANET_ALCHM_PERIODS[planet] ?? 1.0;
    const alchmWeight = planet === "Ascendant" ? 1.0 : normalizeAlchmWeight(period);

    const dignity = alchemy ? getPlanetaryDignity(planet, position.sign) : 0;
    const dignityMultiplier = Math.max(0.5, 1.0 + dignity * 0.15);

    const planetEsms = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    if (alchemy) {
      const sectEntry = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
      const baseESMS = sectEntry ? (diurnal ? sectEntry.diurnal : sectEntry.nocturnal) : alchemy;

      planetEsms.Spirit = baseESMS.Spirit * alchmWeight * dignityMultiplier;
      planetEsms.Essence = baseESMS.Essence * alchmWeight * dignityMultiplier;
      planetEsms.Matter = baseESMS.Matter * alchmWeight * dignityMultiplier;
      planetEsms.Substance = baseESMS.Substance * alchmWeight * dignityMultiplier;
      totals.Spirit += planetEsms.Spirit;
      totals.Essence += planetEsms.Essence;
      totals.Matter += planetEsms.Matter;
      totals.Substance += planetEsms.Substance;
    }

    const signElement = getZodiacElement(position.sign);
    const sectElement = getPlanetarySectElement(planet, diurnal);
    const planetElements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const addElement = (el: string, weight: number) => {
      if (el === "Fire") {
        totals.Fire += weight;
        planetElements.Fire += weight;
      } else if (el === "Water") {
        totals.Water += weight;
        planetElements.Water += weight;
      } else if (el === "Air") {
        totals.Air += weight;
        planetElements.Air += weight;
      } else if (el === "Earth") {
        totals.Earth += weight;
        planetElements.Earth += weight;
      }
    };
    addElement(signElement, SIGN_WEIGHT);
    addElement(sectElement, SECT_WEIGHT);

    if (historicalPositions && historicalPositions[planet]) {
      const histPos = historicalPositions[planet];
      let delta =
        (position.exactLongitude || (position.degree + position.minute / 60)) -
        (histPos.exactLongitude || (histPos.degree + histPos.minute / 60));
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      planetaryMomentum[planet] = delta * alchmWeight;
    } else {
      planetaryMomentum[planet] = 0;
    }

    perPlanet[planet] = {
      esms: planetEsms,
      elements: planetElements,
      sign: String(position.sign ?? "").toLowerCase(),
      signElement,
      sectElement,
      alchmWeight,
      dignityMultiplier,
    };
  }

  // Convert planetaryPositions to positionData and signMap for aspect/enhanced calculations
  const positionData: Record<string, any> = {};
  const signMap: Record<string, string> = {};
  for (const [planet, pos] of Object.entries(planetaryPositions)) {
    if (isExcludedAspectBody(planet)) {
      continue;
    }
    const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    signMap[planet] = sign;
    positionData[planet] = {
      sign,
      degree: pos.degree,
      // `degree` is sign-relative, so it is NOT a longitude. Reconstruct the
      // absolute longitude from sign + degree when the caller omitted it;
      // treating degree as a longitude would collapse all ten planets into the
      // first 30° of the zodiac and make almost every pair a false conjunction.
      // `??` not `||`, so a true 0° Aries longitude is not discarded.
      exactLongitude:
        pos.exactLongitude ??
        signDegreeToLongitude(sign, pos.degree, pos.minute) ??
        undefined,
      isRetrograde: pos.isRetrograde,
    };
  }

  // Physical-Vessel grounding constant: a location-less "live sky" has no
  // computed Ascendant, but the sect ESMS model relies on it to supply the
  // Matter/Substance baseline (a day chart maps every planet to Spirit/Essence,
  // so both collapse to 0 without it). Added to signMap only — not positionData
  // — so it grounds ESMS without injecting phantom aspects or element weight.
  if (!signMap.Ascendant) {
    signMap.Ascendant = "aries";
  }

  // Calculate aspects
  const aspectsRaw = calculateComprehensiveAspects(positionData);
  const aspects: AspectWithStrength[] = aspectsRaw.map((a) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    strength: a.strength,
  }));

  // Enhanced calculation
  const enhancedESMS = calculateEnhancedAlchemicalFromPlanets(signMap, diurnal, aspects);
  totals.Spirit = enhancedESMS.Spirit;
  totals.Essence = enhancedESMS.Essence;
  totals.Matter = enhancedESMS.Matter;
  totals.Substance = enhancedESMS.Substance;

  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } = totals;
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / Math.max(heatDen, 0.01);
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / Math.max(entropyDen, 0.01);
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  // Canonical (Matter + Earth)² form — see the alchemize() site above and §14a.
  const reactivity =
    reactivityNum / Math.max(Math.pow(Matter + Earth, 2), 0.01);
  const gregsEnergy = heat - entropy * reactivity;
  // Clamp ESMS bases to epsilon before pow/ratio so a negative base can't make
  // kalchm NaN (mirrors alchemize()); x^x → 1 as x → 0 so valid inputs are unaffected.
  const kSpirit = Math.max(Spirit, 1e-9);
  const kEssence = Math.max(Essence, 1e-9);
  const kMatter = Math.max(Matter, 1e-9);
  const kSubstance = Math.max(Substance, 1e-9);
  const kalchmRaw =
    (Math.pow(kSpirit, kSpirit) * Math.pow(kEssence, kEssence)) /
    (Math.pow(kMatter, kMatter) * Math.pow(kSubstance, kSubstance));
  const kalchm = Number.isFinite(kalchmRaw) ? kalchmRaw : 1;
  // Monica via the canonical engine (§17c): always finite, and returns φ at the
  // equilibrium point (kalchm ≈ 1) instead of the old 1.0 placeholder. The
  // degraded flag still fires when the value is that fallback rather than a real
  // deviation, so consumers can still distinguish a degenerate monica.
  const monica = calculateMonica(gregsEnergy, reactivity, kalchm);
  const lnK = kalchm > 0 && Number.isFinite(kalchm) ? Math.log(kalchm) : 0;
  const monicaDegenerate = !(
    Math.abs(lnK) >= MONICA_LN_EPSILON && reactivity !== 0
  );
  const degraded = mergeDegraded(
    options.incomingDegraded,
    monicaDegenerate ? { reasons: ["monica-degenerate"] } : null,
  );

  const elements = { Fire, Water, Air, Earth };
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
  const score = Math.min(
    1.0,
    Math.max(0.0, (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20),
  );
  const elementalSum = Math.max(1, Fire + Water + Air + Earth);

  return {
    elementalProperties: {
      Fire: Fire / elementalSum,
      Water: Water / elementalSum,
      Earth: Earth / elementalSum,
      Air: Air / elementalSum,
    },
    thermodynamicProperties: { heat, entropy, reactivity, gregsEnergy },
    esms: { Spirit, Essence, Matter, Substance },
    planetaryMomentum,
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: "alchemizeDetailed",
      dominantElement,
      dominantModality: computeDominantModality(planetaryPositions),
      sunSign: planetaryPositions["Sun"]?.sign || "",
      chartRuler: getZodiacElement(planetaryPositions["Sun"]?.sign || "aries"),
      isDiurnal: diurnal,
    },
    perPlanet,
    ...(degraded ? { degraded } : {}),
  };
}

/**
 * Load planetary positions from the extracted data file, reporting whether the
 * result is degraded (interpolated / static fallback rather than live data).
 */
export function loadPlanetaryPositionsWithMeta(): {
  positions: Record<string, PlanetaryPosition>;
  degraded: DegradedInfo | null;
} {
  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // In browser, use the frozen static snapshot — not live, so degraded.
      return {
        positions: getFallbackPlanetaryPositions(),
        degraded: { reasons: ["stale-positions"] },
      };
    }
    // In Node.js environment, try to read the file
    const rawData = fs.readFileSync(
      "extracted-planetary-positions.json",
      "utf8",
    );
    const positions = JSON.parse(rawData);
    // Convert to the format expected by alchemize
    const convertedPositions: Record<string, PlanetaryPosition> = {};
    for (const [planetName, planetData] of Object.entries(positions)) {
      const data = planetData as any;
      convertedPositions[planetName] = {
        sign: normalizeSign(String(data.sign || "")),
        degree: Number(data.degree) || 0,
        minute: Number(data.minute) || 0,
        isRetrograde: Boolean(data.isRetrograde) || false,
      };
    }
    return { positions: convertedPositions, degraded: null };
  } catch (error) {
    _logger.warn(
      "Error loading planetary positions from file, using dynamic Swiss/Astronomy-Engine positions: ",
      error,
    );
    try {
      const { positions: accurate, degraded } =
        getAccuratePlanetaryPositionsWithMeta(new Date());
      const convertedPositions: Record<string, PlanetaryPosition> = {};
      for (const [planetName, planetData] of Object.entries(accurate)) {
        convertedPositions[planetName] = {
          sign: normalizeSign(String(planetData.sign || "")),
          degree: Math.floor(planetData.degree),
          minute: Math.floor((planetData.degree - Math.floor(planetData.degree)) * 60),
          isRetrograde: planetData.isRetrograde,
          exactLongitude: planetData.exactLongitude,
        };
      }
      return { positions: convertedPositions, degraded };
    } catch (calcError) {
      _logger.error("Failed to dynamically compute fallback planetary positions, reverting to static backup:", calcError);
      return {
        positions: getFallbackPlanetaryPositions(),
        degraded: { reasons: ["stale-positions"] },
      };
    }
  }
}

/**
 * Load planetary positions from the extracted data file.
 *
 * Thin wrapper over {@link loadPlanetaryPositionsWithMeta} that drops the
 * degraded signal, preserving the original signature.
 */
export function loadPlanetaryPositions(): Record<string, PlanetaryPosition> {
  return loadPlanetaryPositionsWithMeta().positions;
}
/**
 * Get fallback planetary positions for when file loading fails
 */
function getFallbackPlanetaryPositions(): Record<string, PlanetaryPosition> {
  // Current planetary positions as of July 2025
  return {
    Sun: { sign: "cancer", degree: 15, minute: 30, isRetrograde: false },
    Moon: { sign: "virgo", degree: 8, minute: 45, isRetrograde: false },
    Mercury: { sign: "gemini", degree: 22, minute: 10, isRetrograde: false },
    Venus: { sign: "leo", degree: 3, minute: 20, isRetrograde: false },
    Mars: { sign: "taurus", degree: 18, minute: 55, isRetrograde: false },
    Jupiter: { sign: "gemini", degree: 12, minute: 40, isRetrograde: false },
    Saturn: { sign: "pisces", degree: 7, minute: 15, isRetrograde: false },
    Uranus: { sign: "taurus", degree: 25, minute: 30, isRetrograde: false },
    Neptune: { sign: "aries", degree: 29, minute: 45, isRetrograde: false },
    Pluto: { sign: "aquarius", degree: 1, minute: 20, isRetrograde: false },
  };
}
/**
 * Get current alchemical state based on real planetary positions
 */
export function getCurrentAlchemicalState(): StandardizedAlchemicalResult {
  const { positions, degraded } = loadPlanetaryPositionsWithMeta();
  return alchemize(positions, null, new Date(), { incomingDegraded: degraded });
}
/**
 * Calculate alchemical properties for a specific set of planetary positions
 */
export function calculateAlchemicalProperties(
  positions: Record<string, PlanetaryPosition>,
  historicalPositions: Record<string, PlanetaryPosition> | null = null,
): StandardizedAlchemicalResult {
  return alchemize(positions, historicalPositions);
}

/**
 * Real alchemical signature for a planetary alignment, computed by the
 * canonical {@link alchemize} engine.
 *
 * The recommendation layer historically carried positions as `{ sign, degree }`
 * and could only map them to elemental properties — which cannot yield kalchm or
 * monica, since those require the Spirit/Essence/Matter/Substance axes. This
 * adapts those positions onto the canonical engine so callers get REAL ESMS,
 * kalchm, monica, thermodynamics, and the engine's own sect-aware elemental
 * profile from a single, internally-consistent computation.
 *
 * `degree`/`minute` are optional: they only feed inter-moment momentum, which is
 * not computed here (no historical positions passed), so the sign alone drives
 * the result. Inherits all of {@link alchemize}'s guards (epsilon-clamped kalchm,
 * degenerate-monica detection, degraded flag).
 */
export interface PlanetaryAlignmentAlchemy {
  elementalProperties: ElementalProperties;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  kalchm: number;
  monica: number;
  thermodynamics: ThermodynamicProperties;
  degraded?: DegradedInfo;
}

export function planetaryAlignmentAlchemy(
  positions: Record<string, { sign: string; degree?: number; minute?: number }>,
  date: Date = new Date(),
): PlanetaryAlignmentAlchemy {
  const full: Record<string, PlanetaryPosition> = {};
  for (const [planet, p] of Object.entries(positions)) {
    full[planet] = { sign: p.sign, degree: p.degree ?? 0, minute: p.minute ?? 0 };
  }
  const result = alchemize(full, null, date);
  return {
    elementalProperties: result.elementalProperties,
    esms: result.esms,
    kalchm: result.kalchm,
    monica: result.monica,
    thermodynamics: result.thermodynamicProperties,
    ...(result.degraded ? { degraded: result.degraded } : {}),
  };
}
// Export the service as default
export default {
  alchemize,
  loadPlanetaryPositions,
  getCurrentAlchemicalState,
  calculateAlchemicalProperties,
};
