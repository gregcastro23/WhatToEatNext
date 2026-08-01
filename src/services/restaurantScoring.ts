/**
 * Restaurant cosmic scoring — provider-agnostic.
 *
 * Extracted from YelpService so the SAME 5-factor scorer can be applied to
 * restaurants from ANY provider (Google Places, Yelp, Foursquare). The scorer
 * operates on a normalized `YelpBusiness` shape, so a Google/Foursquare result
 * normalized into that shape scores identically to a native Yelp result.
 *
 * This is the fix for the historical "alchmScore = 0" blocker: the discovery
 * orchestrator short-circuits on Google (which was never scored), so Best Match
 * had nothing to rank. By scoring every provider's normalized businesses here,
 * results carry real scores regardless of which provider produced them.
 *
 * Scoring reuses existing alchemical primitives — it does NOT reimplement
 * elemental match or Monica calculation.
 */

import { calculateThermodynamics } from "@/data/unified/alchemicalCalculations";
import { thermoAffinity } from "@/data/unified/thermodynamicAffinity";
import type { ElementalProperties } from "@/types/alchemy";
import type {
  AstrologicalState,
  Element,
  AlchemicalProperties,
} from "@/types/celestial";
import type { YelpBusiness, AlchmScoredRestaurant } from "@/types/yelp";
import { calculateElementalMatch } from "@/utils/cuisineRecommender";
import { PLANETARY_SECTARIAN_ALCHEMICAL } from "@/utils/planetaryAlchemyMapping";

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Cuisine → elemental fingerprint + planetary ruler.
 * Used by `scoreCuisineAgainstMoment` when the cuisine matches a known
 * tradition. Falls back to "Default" for unknown cuisines.
 */
export const CUISINE_ELEMENTAL_MAP: Record<
  string,
  {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    planetaryRuler: string;
  }
> = {
  Italian:       { Fire: 0.2,  Water: 0.3,  Earth: 0.4,  Air: 0.1,  planetaryRuler: "Venus" },
  French:        { Fire: 0.1,  Water: 0.3,  Earth: 0.2,  Air: 0.4,  planetaryRuler: "Venus" },
  Japanese:      { Fire: 0.1,  Water: 0.5,  Earth: 0.3,  Air: 0.1,  planetaryRuler: "Moon" },
  Chinese:       { Fire: 0.2,  Water: 0.2,  Earth: 0.4,  Air: 0.2,  planetaryRuler: "Saturn" },
  Mexican:       { Fire: 0.5,  Water: 0.1,  Earth: 0.3,  Air: 0.1,  planetaryRuler: "Mars" },
  Indian:        { Fire: 0.4,  Water: 0.3,  Earth: 0.2,  Air: 0.1,  planetaryRuler: "Mars" },
  Thai:          { Fire: 0.3,  Water: 0.2,  Earth: 0.1,  Air: 0.4,  planetaryRuler: "Mercury" },
  Mediterranean: { Fire: 0.3,  Water: 0.2,  Earth: 0.2,  Air: 0.3,  planetaryRuler: "Sun" },
  American:      { Fire: 0.3,  Water: 0.1,  Earth: 0.4,  Air: 0.2,  planetaryRuler: "Jupiter" },
  Greek:         { Fire: 0.4,  Water: 0.1,  Earth: 0.2,  Air: 0.3,  planetaryRuler: "Sun" },
  Spanish:       { Fire: 0.4,  Water: 0.2,  Earth: 0.2,  Air: 0.2,  planetaryRuler: "Sun" },
  Korean:        { Fire: 0.4,  Water: 0.3,  Earth: 0.2,  Air: 0.1,  planetaryRuler: "Mars" },
  Vietnamese:    { Fire: 0.2,  Water: 0.3,  Earth: 0.1,  Air: 0.4,  planetaryRuler: "Mercury" },
  Ethiopian:     { Fire: 0.2,  Water: 0.2,  Earth: 0.5,  Air: 0.1,  planetaryRuler: "Saturn" },
  Default:       { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25, planetaryRuler: "Sun" },
};

/** Zodiac sign → dominant element (used for the zodiac alignment factor). */
const ZODIAC_ELEMENT: Record<string, Element> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

export const SCORING_WEIGHTS = {
  elemental: 0.35,
  planetary: 0.25,
  /**
   * Was `monica`, and RENAMED rather than repurposed: the factor now measures
   * thermodynamic state distance, not monica distance. Keeping the old key while
   * changing what it means would leave every reader silently wrong. The 0.20
   * value is unchanged — this change restores signal to the existing weight, it
   * does not re-argue the weighting.
   */
  thermodynamic: 0.20,
  zodiac: 0.10,
  lunar: 0.10,
} as const;

// ─── Public scorer ───────────────────────────────────────────────────────────

/**
 * Score a single (already-normalized) business against the current
 * astrological moment, returning a full `AlchmScoredRestaurant`.
 *
 * Reuses existing scoring primitives:
 *   - `calculateElementalMatch`   (cuisineRecommender)
 *   - `calculateThermodynamics`   (data/unified/alchemicalCalculations)
 *   - `thermoAffinity`            (data/unified/thermodynamicAffinity)
 *
 * Cuisine ESMS is derived from the cuisine's planetary ruler via
 * `PLANETARY_SECTARIAN_ALCHEMICAL`, so it represents an authentic
 * planet-derived alchemical profile rather than an elemental approximation.
 * ⚠️ That profile is a single unweighted UNIT VECTOR, unlike the moment's
 * mass-weighted multi-body sum. It is why the old monica factor collapsed; see
 * `thermodynamicAffinity.ts`. Fixing it is a separate, queued data correction.
 *
 * Final score: weighted sum of elemental, planetary, thermodynamic, zodiac, lunar.
 *
 * Note: requires `astrologicalState.domElements` and `zodiacSign` to be present
 * (the discovery orchestrator's `buildAstrologicalState` always populates them).
 * Throws if absent so callers cannot accidentally mis-wire an unscored state.
 */
export function scoreCuisineAgainstMoment(
  business: YelpBusiness,
  cuisineType: string,
  astrologicalState: AstrologicalState,
  momentAlchemical: AlchemicalProperties,
  diurnal: boolean,
): AlchmScoredRestaurant {
  const cuisineKey = resolveCuisineKey(cuisineType, business.categories);
  // Own-property check here too, so this cannot desync from resolveCuisineKey.
  // Belt and braces on a user-controlled lookup: an inherited key would give
  // four `undefined` elements, which now throws in performAlchemicalAnalysis
  // instead of being fabricated into 0.25s — a user-triggerable 503 rather than
  // silently wrong scores. Neither is acceptable; resolve to Default instead.
  const cuisineProfile = Object.hasOwn(CUISINE_ELEMENTAL_MAP, cuisineKey)
    ? CUISINE_ELEMENTAL_MAP[cuisineKey]
    : CUISINE_ELEMENTAL_MAP.Default;

  const cuisineElement: ElementalProperties = {
    Fire: cuisineProfile.Fire,
    Water: cuisineProfile.Water,
    Earth: cuisineProfile.Earth,
    Air: cuisineProfile.Air,
  };

  // ── Current moment elemental profile (route guarantees domElements) ──
  const momentElement: ElementalProperties = deriveMomentElemental(astrologicalState);

  // ── Factor 1: Elemental match (REUSED utility) ──
  const elementalMatch = calculateElementalMatch(cuisineElement, momentElement);

  // ── Factor 2: Planetary alignment ──
  const planetaryAlignment = scorePlanetaryAlignment(
    cuisineProfile.planetaryRuler,
    astrologicalState,
  );

  // ── Factor 3: Thermodynamic state affinity ──
  // Was a distance between two `monica` constants. That carried MEASURED ZERO
  // signal: cuisine ESMS is a one-hot unit vector, so kalchm ≡ 1, ln(kalchm) = 0,
  // and monica was φ for all 30 cuisine × sect rows. The full derivation and the
  // replacement metric live in `@/data/unified/thermodynamicAffinity`.
  //
  // Monica is deliberately NOT computed here any more, not even for display: it
  // is the same constant for every cuisine, so surfacing it would present a
  // constant as a per-cuisine measurement. It becomes meaningful again once
  // cuisine ESMS is derived the way the moment's is (mass-weighted over the
  // cuisine's ruling planets) — tracked separately.
  const cuisineAlchemical = deriveCuisineAlchemical(
    cuisineProfile.planetaryRuler,
    diurnal,
  );
  const thermodynamicAffinity = thermoAffinity(
    calculateThermodynamics(cuisineAlchemical, cuisineElement),
    calculateThermodynamics(momentAlchemical, momentElement),
  );

  // ── Factor 4: Zodiac alignment ──
  const zodiacScore = scoreZodiacAlignment(
    astrologicalState.zodiacSign ?? astrologicalState.currentZodiac,
    cuisineElement,
  );

  // ── Factor 5: Lunar alignment ──
  const lunarScore = scoreLunarAlignment(astrologicalState.lunarPhase, cuisineElement);

  // ── Composite ──
  const alchmScore =
    elementalMatch * SCORING_WEIGHTS.elemental +
    planetaryAlignment * SCORING_WEIGHTS.planetary +
    thermodynamicAffinity * SCORING_WEIGHTS.thermodynamic +
    zodiacScore * SCORING_WEIGHTS.zodiac +
    lunarScore * SCORING_WEIGHTS.lunar;

  const dominantElement = dominantElementOf(cuisineElement);

  const matchReasons = buildMatchReasons({
    cuisineKey,
    cuisineRuler: cuisineProfile.planetaryRuler,
    dominantElement,
    elementalMatch,
    planetaryAlignment,
    thermodynamicAffinity,
    astrologicalState,
  });

  return {
    business,
    alchmScore: clamp01(alchmScore),
    elementalMatch: clamp01(elementalMatch),
    planetaryAlignment: clamp01(planetaryAlignment),
    thermodynamicAffinity: clamp01(thermodynamicAffinity),
    dominantElement,
    matchReasons,
    cuisineElement,
  };
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

/**
 * Resolves a cuisine key to one present in CUISINE_ELEMENTAL_MAP.
 * 1. Try the user-supplied cuisineType verbatim (capitalized).
 * 2. Fuzzy match against business `categories` titles (e.g. "Sushi Bars" → Japanese).
 * 3. Default fallback.
 */
function resolveCuisineKey(
  cuisineType: string,
  categories: YelpBusiness["categories"],
): string {
  const normalized = capitalize(cuisineType.trim());
  // `Object.hasOwn`, NOT truthiness. `cuisineType` is a user-supplied query
  // param, and a plain-object map inherits from Object.prototype — so
  // `CUISINE_ELEMENTAL_MAP["__proto__"]` is Object.prototype (truthy), and
  // "constructor"/"toString" are functions (also truthy). Each returned a key
  // whose four element reads are all `undefined`, which the old engine then
  // silently replaced with 0.25 apiece. MEASURED: `?cuisine=__proto__` produced
  // `{Fire: undefined, Water: undefined, Earth: undefined, Air: undefined}`.
  if (Object.hasOwn(CUISINE_ELEMENTAL_MAP, normalized)) return normalized;

  // Loose match — case-insensitive
  for (const key of Object.keys(CUISINE_ELEMENTAL_MAP)) {
    if (key.toLowerCase() === normalized.toLowerCase()) return key;
  }

  // Fuzzy match against categories
  for (const cat of categories) {
    const haystack = `${cat.title} ${cat.alias}`.toLowerCase();
    for (const key of Object.keys(CUISINE_ELEMENTAL_MAP)) {
      if (key === "Default") continue;
      if (haystack.includes(key.toLowerCase())) return key;
    }
  }

  return "Default";
}

/**
 * Derive the current moment's elemental profile.
 * The orchestrator computes `domElements` via `aggregateEnhancedZodiacElementals`
 * before calling the scorer, so it is always present. We pass it through
 * directly — no approximation layer.
 */
function deriveMomentElemental(state: AstrologicalState): ElementalProperties {
  if (!state.domElements) {
    // Should never happen — orchestrator always populates domElements. Throw
    // rather than silently degrade, so callers can't accidentally mis-wire.
    throw new Error(
      "scoreCuisineAgainstMoment: AstrologicalState.domElements is required",
    );
  }
  return {
    Fire: state.domElements.Fire,
    Water: state.domElements.Water,
    Earth: state.domElements.Earth,
    Air: state.domElements.Air,
  };
}

/**
 * Derive the cuisine's alchemical (ESMS) profile from its planetary ruler
 * using the authoritative `PLANETARY_SECTARIAN_ALCHEMICAL` table.
 */
function deriveCuisineAlchemical(
  ruler: string,
  diurnal: boolean,
): AlchemicalProperties {
  const entry = PLANETARY_SECTARIAN_ALCHEMICAL[
    ruler as keyof typeof PLANETARY_SECTARIAN_ALCHEMICAL
  ];
  if (!entry) {
    return { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 };
  }
  const sect = diurnal ? entry.diurnal : entry.nocturnal;
  return {
    Spirit: sect.Spirit,
    Essence: sect.Essence,
    Matter: sect.Matter,
    Substance: sect.Substance,
  };
}

/**
 * Planetary alignment: 1.0 when ruler matches the planetary hour, 0.75
 * when it appears in active planets / dominant planets, otherwise 0.5.
 */
function scorePlanetaryAlignment(
  ruler: string,
  state: AstrologicalState,
): number {
  if (state.planetaryHour && String(state.planetaryHour) === ruler) return 1.0;

  const active = (state.activePlanets ?? []).map((p) => String(p));
  const dominant = (state.dominantPlanets ?? []).map((p) => String(p));
  if (active.includes(ruler) || dominant.includes(ruler)) return 0.75;

  return 0.5;
}

/**
 * Zodiac alignment: 1.0 when the zodiac's element is the cuisine's dominant
 * element, 0.7 when the cuisine has meaningful presence (≥0.25) of that
 * element, 0.5 otherwise.
 */
function scoreZodiacAlignment(
  zodiac: unknown,
  cuisineElement: ElementalProperties,
): number {
  if (typeof zodiac !== "string" || zodiac.length === 0) {
    throw new Error(
      "scoreCuisineAgainstMoment: AstrologicalState.zodiacSign is required",
    );
  }
  const element = ZODIAC_ELEMENT[zodiac.toLowerCase()];
  if (!element) {
    throw new Error(
      `scoreCuisineAgainstMoment: unknown zodiac sign "${zodiac}"`,
    );
  }

  const dominant = dominantElementOf(cuisineElement);
  if (dominant === element) return 1.0;
  if (cuisineElement[element] >= 0.25) return 0.7;
  return 0.5;
}

/**
 * Lunar alignment: full / waxing favors bold (Fire-leaning) cuisines,
 * new / waning favors subtle (Water/Air-leaning) ones.
 */
function scoreLunarAlignment(
  lunarPhase: AstrologicalState["lunarPhase"] | undefined,
  cuisineElement: ElementalProperties,
): number {
  if (!lunarPhase) return 0.5;
  const phase = String(lunarPhase).toLowerCase();
  const dominant = dominantElementOf(cuisineElement);

  if (phase.includes("full") || phase.includes("waxing")) {
    return dominant === "Fire" || dominant === "Earth" ? 0.9 : 0.55;
  }
  if (phase.includes("new") || phase.includes("waning")) {
    return dominant === "Water" || dominant === "Air" ? 0.9 : 0.55;
  }
  return 0.6;
}

function dominantElementOf(profile: ElementalProperties): Element {
  const entries: Array<[Element, number]> = [
    ["Fire", profile.Fire ?? 0],
    ["Water", profile.Water ?? 0],
    ["Earth", profile.Earth ?? 0],
    ["Air", profile.Air ?? 0],
  ];
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

function buildMatchReasons(input: {
  cuisineKey: string;
  cuisineRuler: string;
  dominantElement: Element;
  elementalMatch: number;
  planetaryAlignment: number;
  thermodynamicAffinity: number;
  astrologicalState: AstrologicalState;
}): string[] {
  const reasons: string[] = [];
  const {
    cuisineKey,
    cuisineRuler,
    dominantElement,
    elementalMatch,
    planetaryAlignment,
    thermodynamicAffinity,
    astrologicalState,
  } = input;

  if (planetaryAlignment >= 1.0 && astrologicalState.planetaryHour) {
    reasons.push(`${cuisineKey} cuisine resonates with ${cuisineRuler} hour`);
  } else if (planetaryAlignment >= 0.75) {
    reasons.push(`${cuisineRuler} is active right now — favors ${cuisineKey}`);
  }

  const zodiac =
    typeof astrologicalState.zodiacSign === "string"
      ? astrologicalState.zodiacSign
      : typeof astrologicalState.currentZodiac === "string"
        ? astrologicalState.currentZodiac
        : null;
  if (zodiac && ZODIAC_ELEMENT[zodiac.toLowerCase()] === dominantElement) {
    reasons.push(
      `${dominantElement} element dominant — aligns with ${capitalize(zodiac)} season`,
    );
  }

  if (elementalMatch >= 0.8) {
    reasons.push(`Elemental harmony with the moment (${Math.round(elementalMatch * 100)}%)`);
  }

  // 0.85 affinity is d ≤ −D0·ln(0.85) = 0.2709 in whitened units, between p10
  // (0.195) and p25 (0.314) of the measured reachable distribution — see
  // `thermodynamicAffinity.ts`. The old copy keyed off a monica score that was
  // identical for every cuisine at any given moment, so it fired for all fifteen
  // or none, which is not a per-restaurant reason.
  if (thermodynamicAffinity >= 0.85) {
    reasons.push("Thermodynamic state closely matches this moment");
  }

  if (reasons.length === 0) {
    reasons.push(`${dominantElement}-leaning ${cuisineKey} option nearby`);
  }

  return reasons.slice(0, 3);
}

// ─── Primitive helpers ─────────────────────────────────────────────────────

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
