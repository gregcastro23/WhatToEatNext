/**
 * Yelp Fusion API Service
 *
 * Server-side singleton that queries Yelp's Business Search endpoint and
 * returns alchm-scored restaurants. The Yelp API key (`YELP_API_KEY`) is read
 * from the environment and never exposed to the client.
 *
 * Scoring reuses existing alchemical utilities — it does NOT reimplement
 * elemental match or Monica calculation.
 */

import type {
  YelpBusiness,
  YelpSearchParams,
  YelpSearchResponse,
  AlchmScoredRestaurant,
} from "@/types/yelp";
import type { ElementalProperties } from "@/types/alchemy";
import type {
  AstrologicalState,
  Element,
  AlchemicalProperties,
} from "@/types/celestial";
import { calculateElementalMatch } from "@/utils/cuisineRecommender";
import {
  calculateThermodynamicMetrics,
} from "@/utils/monicaKalchmCalculations";
import { PLANETARY_SECTARIAN_ALCHEMICAL } from "@/utils/planetaryAlchemyMapping";
import { createLogger } from "@/utils/logger";

const logger = createLogger("YelpService");

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Cuisine → elemental fingerprint + planetary ruler.
 * Used by `scoreRestaurant` when the user-provided cuisine matches a known
 * tradition. Falls back to "Default" for unknown cuisines.
 */
const CUISINE_ELEMENTAL_MAP: Record<
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

const SCORING_WEIGHTS = {
  elemental: 0.35,
  planetary: 0.25,
  monica: 0.20,
  zodiac: 0.10,
  lunar: 0.10,
} as const;

const YELP_BASE_URL = "https://api.yelp.com/v3";

// ─── Service ───────────────────────────────────────────────────────────────

interface FetchResult<T> {
  data: T | null;
  error: string | null;
}

class YelpService {
  private static instance: YelpService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.YELP_API_KEY ?? "";
    if (!this.apiKey) {
      logger.warn(
        "YelpService initialized without YELP_API_KEY — scored search will return graceful empty.",
      );
    } else {
      logger.info("YelpService initialized");
    }
  }

  public static getInstance(): YelpService {
    if (!YelpService.instance) {
      YelpService.instance = new YelpService();
    }
    return YelpService.instance;
  }

  /** Whether the Yelp integration is configured (API key present). */
  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  // ─── HTTP ─────────────────────────────────────────────────────────────

  /**
   * Generic GET against Yelp Fusion. Never throws — surfaces errors via
   * the returned `error` field for graceful degradation.
   */
  private async fetchYelp<T>(
    endpoint: string,
    params: Record<string, string | number | boolean>,
  ): Promise<FetchResult<T>> {
    if (!this.apiKey) {
      return { data: null, error: "Yelp API key not configured" };
    }

    const url = new URL(`${YELP_BASE_URL}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const error = `Yelp API ${response.status}: ${body.slice(0, 200) || response.statusText}`;
        logger.warn(error, { endpoint });
        return { data: null, error };
      }

      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Unknown Yelp request error";
      logger.error("Yelp request failed", { endpoint, error });
      return { data: null, error };
    }
  }

  // ─── Search ───────────────────────────────────────────────────────────

  /**
   * Raw business search — no scoring applied. Returns the Yelp response
   * payload unmodified.
   */
  public async searchRestaurants(
    params: YelpSearchParams,
  ): Promise<FetchResult<YelpSearchResponse>> {
    const search: Record<string, string | number | boolean> = {
      term: params.term,
      latitude: params.latitude,
      longitude: params.longitude,
      limit: Math.min(params.limit ?? 20, 50),
    };
    if (params.radius !== undefined) {
      search.radius = Math.min(params.radius, 40000);
    }
    if (params.sort_by) search.sort_by = params.sort_by;
    if (params.open_now !== undefined) search.open_now = params.open_now;

    return this.fetchYelp<YelpSearchResponse>("/businesses/search", search);
  }

  // ─── Scored Search ────────────────────────────────────────────────────

  /**
   * Search Yelp by cuisine + location, score every result against the
   * current astrological moment, and return the list sorted by `alchmScore`
   * (descending).
   */
  public async getScoredRestaurants(params: {
    cuisineType: string;
    latitude: number;
    longitude: number;
    astrologicalState: AstrologicalState;
    alchemicalProperties: AlchemicalProperties;
    diurnal: boolean;
    radius?: number;
    limit?: number;
  }): Promise<FetchResult<AlchmScoredRestaurant[]>> {
    const { data, error } = await this.searchRestaurants({
      term: params.cuisineType,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      limit: params.limit ?? 20,
      sort_by: "best_match",
    });

    if (!data) return { data: null, error };

    const scored = data.businesses
      .filter((b) => !b.is_closed)
      .map((business) =>
        this.scoreRestaurant(
          business,
          params.cuisineType,
          params.astrologicalState,
          params.alchemicalProperties,
          params.diurnal,
        ),
      )
      .sort((a, b) => b.alchmScore - a.alchmScore);

    return { data: scored, error: null };
  }

  // ─── Scoring ──────────────────────────────────────────────────────────

  /**
   * Score a single business against the current astrological moment.
   *
   * Reuses existing scoring primitives:
   *   - `calculateElementalMatch`     (cuisineRecommender)
   *   - `calculateThermodynamicMetrics` (monicaKalchmCalculations) — real Monica
   *
   * Cuisine ESMS is derived from the cuisine's planetary ruler via
   * `PLANETARY_SECTARIAN_ALCHEMICAL`, so it represents an authentic
   * planet-derived alchemical profile rather than an elemental approximation.
   *
   * Final score: weighted sum of elemental, planetary, monica, zodiac, lunar.
   */
  private scoreRestaurant(
    business: YelpBusiness,
    cuisineType: string,
    astrologicalState: AstrologicalState,
    momentAlchemical: AlchemicalProperties,
    diurnal: boolean,
  ): AlchmScoredRestaurant {
    const cuisineKey = this.resolveCuisineKey(cuisineType, business.categories);
    const cuisineProfile = CUISINE_ELEMENTAL_MAP[cuisineKey];

    const cuisineElement: ElementalProperties = {
      Fire: cuisineProfile.Fire,
      Water: cuisineProfile.Water,
      Earth: cuisineProfile.Earth,
      Air: cuisineProfile.Air,
    };

    // ── Current moment elemental profile (route guarantees domElements) ──
    const momentElement: ElementalProperties = this.deriveMomentElemental(astrologicalState);

    // ── Factor 1: Elemental match (REUSED utility) ──
    const elementalMatch = calculateElementalMatch(cuisineElement, momentElement);

    // ── Factor 2: Planetary alignment ──
    const planetaryAlignment = this.scorePlanetaryAlignment(
      cuisineProfile.planetaryRuler,
      astrologicalState,
    );

    // ── Factor 3: Monica compatibility ──
    // Both Monica values come from `calculateThermodynamicMetrics` so they
    // are computed from the authoritative formula:
    //   Monica = -GregsEnergy / (Reactivity * ln(Kalchm))
    const cuisineAlchemical = this.deriveCuisineAlchemical(
      cuisineProfile.planetaryRuler,
      diurnal,
    );
    const cuisineMonica = calculateThermodynamicMetrics(
      cuisineAlchemical,
      cuisineElement,
    ).monica;
    const momentMonica = calculateThermodynamicMetrics(
      momentAlchemical,
      momentElement,
    ).monica;
    const monicaCompatibility = this.normalizeMonicaDistance(cuisineMonica, momentMonica);

    // ── Factor 4: Zodiac alignment ──
    const zodiacScore = this.scoreZodiacAlignment(
      astrologicalState.zodiacSign ?? astrologicalState.currentZodiac,
      cuisineElement,
    );

    // ── Factor 5: Lunar alignment ──
    const lunarScore = this.scoreLunarAlignment(astrologicalState.lunarPhase, cuisineElement);

    // ── Composite ──
    const alchmScore =
      elementalMatch * SCORING_WEIGHTS.elemental +
      planetaryAlignment * SCORING_WEIGHTS.planetary +
      monicaCompatibility * SCORING_WEIGHTS.monica +
      zodiacScore * SCORING_WEIGHTS.zodiac +
      lunarScore * SCORING_WEIGHTS.lunar;

    const dominantElement = this.dominantElementOf(cuisineElement);

    const matchReasons = this.buildMatchReasons({
      cuisineKey,
      cuisineRuler: cuisineProfile.planetaryRuler,
      dominantElement,
      elementalMatch,
      planetaryAlignment,
      monicaCompatibility,
      astrologicalState,
    });

    return {
      business,
      alchmScore: clamp01(alchmScore),
      elementalMatch: clamp01(elementalMatch),
      planetaryAlignment: clamp01(planetaryAlignment),
      monicaCompatibility: clamp01(monicaCompatibility),
      dominantElement,
      matchReasons,
      cuisineElement,
    };
  }

  // ─── Scoring helpers ──────────────────────────────────────────────────

  /**
   * Resolves a cuisine key to one present in CUISINE_ELEMENTAL_MAP.
   * 1. Try the user-supplied cuisineType verbatim (capitalized).
   * 2. Fuzzy match against Yelp `categories` titles (e.g. "Sushi Bars" → Japanese).
   * 3. Default fallback.
   */
  private resolveCuisineKey(
    cuisineType: string,
    categories: YelpBusiness["categories"],
  ): string {
    const normalized = capitalize(cuisineType.trim());
    if (CUISINE_ELEMENTAL_MAP[normalized]) return normalized;

    // Loose match — case-insensitive
    for (const key of Object.keys(CUISINE_ELEMENTAL_MAP)) {
      if (key.toLowerCase() === normalized.toLowerCase()) return key;
    }

    // Fuzzy match against Yelp categories
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
   * The route handler computes `domElements` via `aggregateEnhancedZodiacElementals`
   * before calling the service, so it is always present. We pass it through
   * directly — no approximation layer.
   */
  private deriveMomentElemental(state: AstrologicalState): ElementalProperties {
    if (!state.domElements) {
      // Should never happen — route always populates domElements. Throw rather
      // than silently degrade, so callers can't accidentally mis-wire.
      throw new Error(
        "YelpService.scoreRestaurant: AstrologicalState.domElements is required",
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
   * using the authoritative `PLANETARY_SECTARIAN_ALCHEMICAL` table. This
   * yields a real planet-derived ESMS shape — the same source used by
   * `calculateAlchemicalFromPlanets` for the moment chart.
   */
  private deriveCuisineAlchemical(
    ruler: string,
    diurnal: boolean,
  ): AlchemicalProperties {
    const entry = PLANETARY_SECTARIAN_ALCHEMICAL[
      ruler as keyof typeof PLANETARY_SECTARIAN_ALCHEMICAL
    ];
    if (!entry) {
      // Default-ruler-only path — should not occur because all entries in
      // CUISINE_ELEMENTAL_MAP use planets that exist in the table.
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
  private scorePlanetaryAlignment(
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
   * Map two Monica constants to a 0–1 compatibility score.
   * Smaller absolute distance ⇒ higher compatibility.
   */
  private normalizeMonicaDistance(a: number, b: number): number {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0.5;
    const distance = Math.abs(a - b);
    // Empirical scaling: Monica values typically span O(1); 2.0 distance ≈ 0.
    return clamp01(1 - Math.min(distance / 2, 1));
  }

  /**
   * Zodiac alignment: 1.0 when the zodiac's element is the cuisine's dominant
   * element, 0.7 when the cuisine has meaningful presence (≥0.25) of that
   * element, 0.5 otherwise.
   *
   * The route handler always supplies a valid lowercase zodiac (sunSign) on
   * `AstrologicalState.zodiacSign`, so the unknown-zodiac branches are
   * defensive only.
   */
  private scoreZodiacAlignment(
    zodiac: unknown,
    cuisineElement: ElementalProperties,
  ): number {
    if (typeof zodiac !== "string" || zodiac.length === 0) {
      throw new Error(
        "YelpService.scoreRestaurant: AstrologicalState.zodiacSign is required",
      );
    }
    const element = ZODIAC_ELEMENT[zodiac.toLowerCase()];
    if (!element) {
      throw new Error(
        `YelpService.scoreRestaurant: unknown zodiac sign "${zodiac}"`,
      );
    }

    const dominant = this.dominantElementOf(cuisineElement);
    if (dominant === element) return 1.0;
    if (cuisineElement[element] >= 0.25) return 0.7;
    return 0.5;
  }

  /**
   * Lunar alignment: full / waxing favors bold (Fire-leaning) cuisines,
   * new / waning favors subtle (Water/Air-leaning) ones.
   */
  private scoreLunarAlignment(
    lunarPhase: AstrologicalState["lunarPhase"] | undefined,
    cuisineElement: ElementalProperties,
  ): number {
    if (!lunarPhase) return 0.5;
    const phase = String(lunarPhase).toLowerCase();
    const dominant = this.dominantElementOf(cuisineElement);

    if (phase.includes("full") || phase.includes("waxing")) {
      return dominant === "Fire" || dominant === "Earth" ? 0.9 : 0.55;
    }
    if (phase.includes("new") || phase.includes("waning")) {
      return dominant === "Water" || dominant === "Air" ? 0.9 : 0.55;
    }
    return 0.6;
  }

  private dominantElementOf(profile: ElementalProperties): Element {
    const entries: Array<[Element, number]> = [
      ["Fire", profile.Fire ?? 0],
      ["Water", profile.Water ?? 0],
      ["Earth", profile.Earth ?? 0],
      ["Air", profile.Air ?? 0],
    ];
    entries.sort(([, a], [, b]) => b - a);
    return entries[0][0];
  }

  private buildMatchReasons(input: {
    cuisineKey: string;
    cuisineRuler: string;
    dominantElement: Element;
    elementalMatch: number;
    planetaryAlignment: number;
    monicaCompatibility: number;
    astrologicalState: AstrologicalState;
  }): string[] {
    const reasons: string[] = [];
    const {
      cuisineKey,
      cuisineRuler,
      dominantElement,
      elementalMatch,
      planetaryAlignment,
      monicaCompatibility,
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

    if (monicaCompatibility >= 0.85) {
      reasons.push("Monica constant optimized for this moment");
    }

    if (reasons.length === 0) {
      reasons.push(`${dominantElement}-leaning ${cuisineKey} option nearby`);
    }

    return reasons.slice(0, 3);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const yelpService = YelpService.getInstance();
