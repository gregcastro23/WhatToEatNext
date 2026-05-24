/**
 * Planetary Scoring Service
 *
 * Provides minute-precision planetary scoring for recipe recommendations.
 * Uses real planetary positions to calculate dignity, decan rulers,
 * planetary hours, critical degrees, and retrograde modifiers.
 */

import { PLANET_WEIGHTS, normalizePlanetWeight } from "@/data/planets";
import type {
  Planet,
  ZodiacSignType,
  PlanetaryPosition,
} from "@/types/celestial";
import type { Recipe } from "@/types/recipe";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

// Planets used for scoring (exclude Ascendant which isn't a planet)
const SCORING_PLANETS: Planet[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
];

interface PlanetaryScoreComponents {
  dignityScore: number;
  decanScore: number;
  planetaryHourBonus: number;
  criticalDegreeBonus: number;
  retrogradeModifier: number;
  aspectScore: number;
}

export interface PlanetaryScoringResult {
  overallScore: number;
  components: PlanetaryScoreComponents;
  recommendedTiming: string;
  planetaryReason: string;
  rulingPlanet: Planet;
}

interface BirthChartPlanet {
  planet: Planet;
  exactLongitude: number;
}

export interface BirthChart {
  planets: BirthChartPlanet[];
}

// Zodiac signs in order for longitude-to-sign conversion
const ZODIAC_SIGNS: ZodiacSignType[] = [
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

// Planetary dignities
const DIGNITIES: Record<
  string,
  { domicile: ZodiacSignType[]; exaltation: ZodiacSignType[] }
> = {
  Sun: { domicile: ["leo"], exaltation: ["aries"] },
  Moon: { domicile: ["cancer"], exaltation: ["taurus"] },
  Mercury: { domicile: ["gemini", "virgo"], exaltation: ["virgo"] },
  Venus: { domicile: ["taurus", "libra"], exaltation: ["pisces"] },
  Mars: { domicile: ["aries", "scorpio"], exaltation: ["capricorn"] },
  Jupiter: { domicile: ["sagittarius", "pisces"], exaltation: ["cancer"] },
  Saturn: { domicile: ["capricorn", "aquarius"], exaltation: ["libra"] },
};

// Chaldean decan rulers
const DECAN_RULERS: Record<ZodiacSignType, [Planet, Planet, Planet]> = {
  aries: ["Mars", "Sun", "Venus"],
  taurus: ["Mercury", "Moon", "Saturn"],
  gemini: ["Jupiter", "Mars", "Sun"],
  cancer: ["Venus", "Mercury", "Moon"],
  leo: ["Saturn", "Jupiter", "Mars"],
  virgo: ["Sun", "Venus", "Mercury"],
  libra: ["Moon", "Saturn", "Jupiter"],
  scorpio: ["Mars", "Sun", "Venus"],
  sagittarius: ["Mercury", "Moon", "Saturn"],
  capricorn: ["Jupiter", "Mars", "Sun"],
  aquarius: ["Venus", "Mercury", "Moon"],
  pisces: ["Saturn", "Jupiter", "Mars"],
};

// Planetary friendships
const FRIENDSHIPS: Record<string, Planet[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury", "Venus"],
  Mercury: ["Sun", "Venus"],
  Venus: ["Mercury", "Moon", "Saturn"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Saturn: ["Venus", "Mercury"],
};

// Retrograde effects per planet
const RETROGRADE_EFFECTS: Record<string, number> = {
  Sun: 1.0,
  Moon: 1.0,
  Mercury: 0.7,
  Venus: 0.9,
  Mars: 0.8,
  Jupiter: 0.9,
  Saturn: 1.1,
  Uranus: 0.95,
  Neptune: 0.95,
  Pluto: 1.0,
};

// Chaldean planetary order for planetary hours
const CHALDEAN_ORDER: Planet[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];

// Day rulers (Sunday=0)
const DAY_RULERS: Planet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

type Element = "Fire" | "Water" | "Earth" | "Air";
const ELEMENTS: readonly Element[] = ["Fire", "Water", "Earth", "Air"];

// Zodiac sign → classical element
const SIGN_ELEMENT: Record<ZodiacSignType, Element> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  cancer: "Water", scorpio: "Water", pisces: "Water",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
};

// Dominant element of a recipe → ruling-planet fallback (when no keywords match)
const ELEMENT_TO_PLANET: Record<Element, Planet> = {
  Fire: "Mars",
  Water: "Moon",
  Earth: "Saturn",
  Air: "Mercury",
};

// Cooking method → planetary affinity. Hits keep recipes that match their
// ruling planet's energy scored higher; non-matches still score 0.4 baseline.
const METHOD_PLANET: Record<string, Planet> = {
  grilling: "Mars", searing: "Mars", frying: "Mars", broiling: "Mars",
  roasting: "Sun", caramelizing: "Sun",
  baking: "Saturn", braising: "Saturn", smoking: "Saturn", curing: "Saturn",
  fermenting: "Saturn", drying: "Saturn", pickling: "Saturn",
  boiling: "Moon", simmering: "Moon", poaching: "Moon", steaming: "Moon",
  blanching: "Moon",
  sauteing: "Mercury", "stir-frying": "Mercury", stirfrying: "Mercury",
  raw: "Mercury", chopping: "Mercury", whisking: "Mercury",
  confit: "Venus", glazing: "Venus", candying: "Venus", whipping: "Venus",
  sousvide: "Jupiter", "sous-vide": "Jupiter", basting: "Jupiter",
};

export class PlanetaryScoringService {
  private static instance: PlanetaryScoringService;
  private cachedPositions: PlanetaryPosition[] | null = null;
  private lastCalculation: Date | null = null;
  private readonly CACHE_DURATION_MS = 15 * 60 * 1000;

  static getInstance(): PlanetaryScoringService {
    if (!this.instance) {
      this.instance = new PlanetaryScoringService();
    }
    return this.instance;
  }

  /**
   * Fetch current planetary positions, with caching.
   */
  async getCurrentPlanetaryPositions(): Promise<PlanetaryPosition[]> {
    const now = new Date();
    if (
      this.cachedPositions &&
      this.lastCalculation &&
      now.getTime() - this.lastCalculation.getTime() < this.CACHE_DURATION_MS
    ) {
      return this.cachedPositions;
    }

    try {
      const response = await fetch("/api/astrologize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4000), // 4 second timeout
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          date: now.getDate(),
          hour: now.getHours(),
          minute: now.getMinutes(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const positions = this.extractPositions(data);
        this.cachedPositions = positions;
        this.lastCalculation = now;
        return positions;
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback: use estimated positions
    const fallback = this.estimatePositions(now);
    this.cachedPositions = fallback;
    this.lastCalculation = now;
    return fallback;
  }

  /**
   * Score a recipe based on current planetary positions.
   */
  async scoreRecipe(
    recipe: Recipe,
    userBirthChart?: BirthChart,
  ): Promise<PlanetaryScoringResult> {
    const positions = await this.getCurrentPlanetaryPositions();
    const rulingPlanet = this.determineRulingPlanet(recipe);
    const rulingPosition = positions.find(
      (p) => (p as any).planet === rulingPlanet,
    );

    if (!rulingPosition) {
      return this.getDefaultScore(rulingPlanet, recipe.id);
    }

    const sign = this.normalizeSign(rulingPosition.sign);
    const degree = rulingPosition.degree ?? 0;
    const minute = rulingPosition.minute ?? rulingPosition.minutes ?? 0;
    const exactLong =
      rulingPosition.exactLongitude ??
      ZODIAC_SIGNS.indexOf(sign) * 30 + degree + minute / 60;
    const isRetrograde = rulingPosition.isRetrograde ?? false;

    const components: PlanetaryScoreComponents = {
      dignityScore: this.calculateDignityScore(rulingPlanet, sign),
      decanScore: this.calculateDecanScore(sign, degree, minute, rulingPlanet),
      planetaryHourBonus: this.calculatePlanetaryHourBonus(rulingPlanet),
      criticalDegreeBonus: this.calculateCriticalDegreeBonus(degree, minute),
      retrogradeModifier: isRetrograde
        ? (RETROGRADE_EFFECTS[rulingPlanet] ?? 1.0)
        : 1.0,
      aspectScore: userBirthChart
        ? this.calculateAspectScore(exactLong, userBirthChart)
        : 0.5,
    };

    const skyBalance = this.computeSkyElementalBalance(positions);
    const elementalAlignment = this.calculateElementalAlignment(recipe, skyBalance);
    const favorableScore = this.calculateFavorablePlanetsScore(
      recipe.planetaryInfluences?.favorable,
      positions,
    );
    const methodAffinity = this.calculateMethodAffinity(recipe, rulingPlanet);

    const overallScore = this.calculateOverallScore(
      components,
      rulingPlanet,
      recipe.id,
      elementalAlignment,
      favorableScore,
      methodAffinity,
    );
    const recommendedTiming = this.getRecommendedTiming(rulingPlanet);
    const planetaryReason = this.generateReason(
      rulingPlanet,
      sign,
      components,
      isRetrograde,
      elementalAlignment,
      methodAffinity,
    );

    return {
      overallScore,
      components,
      recommendedTiming,
      planetaryReason,
      rulingPlanet,
    };
  }

  /**
   * Score multiple recipes efficiently (shared position fetch).
   */
  async scoreRecipes(
    recipes: Recipe[],
    userBirthChart?: BirthChart,
  ): Promise<Map<string, PlanetaryScoringResult>> {
    // Pre-fetch positions once
    await this.getCurrentPlanetaryPositions();

    const results = new Map<string, PlanetaryScoringResult>();
    for (const recipe of recipes) {
      const result = await this.scoreRecipe(recipe, userBirthChart);
      results.set(recipe.id, result);
    }
    return results;
  }

  // --- Scoring calculations ---

  private calculateDignityScore(planet: Planet, sign: ZodiacSignType): number {
    const dignity = DIGNITIES[planet];
    if (!dignity) return 0.6;

    if (dignity.domicile.includes(sign)) return 1.0;
    if (dignity.exaltation.includes(sign)) return 0.9;

    const detriment = this.getOppositeSign(dignity.domicile[0]);
    if (sign === detriment) return 0.3;

    const fall = this.getOppositeSign(dignity.exaltation[0]);
    if (sign === fall) return 0.2;

    return 0.6;
  }

  private calculateDecanScore(
    sign: ZodiacSignType,
    degree: number,
    minute: number,
    rulingPlanet: Planet,
  ): number {
    const exactDegree = degree + minute / 60;
    const decanNum = Math.min(Math.floor(exactDegree / 10), 2);
    const rulers = DECAN_RULERS[sign];
    if (!rulers) return 0.4;

    const decanRuler = rulers[decanNum];
    if (decanRuler === rulingPlanet) return 1.0;
    if (this.areFriendly(decanRuler, rulingPlanet)) return 0.7;
    return 0.4;
  }

  private calculatePlanetaryHourBonus(rulingPlanet: Planet): number {
    const currentHour = this.getCurrentPlanetaryHour();
    if (currentHour === rulingPlanet) return 0.2;
    if (this.areFriendly(currentHour, rulingPlanet)) return 0.1;
    return 0;
  }

  private calculateCriticalDegreeBonus(degree: number, minute: number): number {
    const exactDegree = degree + minute / 60;
    const criticalDegrees = [0, 13, 26];
    const isCritical = criticalDegrees.some(
      (c) => Math.abs(exactDegree - c) < 1,
    );
    return isCritical ? 0.1 : 0;
  }

  private calculateAspectScore(
    longitude: number,
    birthChart: BirthChart,
  ): number {
    let totalHarmony = 0;
    let count = 0;

    for (const natal of birthChart.planets) {
      const aspect = this.getAspect(longitude, natal.exactLongitude);
      if (aspect) {
        totalHarmony += aspect.harmony;
        count++;
      }
    }

    if (count === 0) return 0.5;
    return (totalHarmony / count + 1) / 2;
  }

  private calculateOverallScore(
    components: PlanetaryScoreComponents,
    rulingPlanet: Planet,
    recipeId: string,
    elementalAlignment: number,
    favorableScore: number,
    methodAffinity: number,
  ): number {
    // ─ Sky component (40%) ─
    // Ruling planet's current sky condition. This is the original formula,
    // capturing dignity, decan, aspect, hour, critical degree, retrograde.
    const skyBase =
      components.dignityScore * 0.4 +
      components.decanScore * 0.25 +
      components.aspectScore * 0.25 +
      components.planetaryHourBonus +
      components.criticalDegreeBonus;

    // Ruling planet's physical mass as a soft weight. PLANET_WEIGHTS stores
    // actual relative-to-Earth values; normalizePlanetWeight log-scales so
    // Pluto → ≈0, Sun → 1.0. Floor at 0.5 keeps small bodies in play.
    const relMass = PLANET_WEIGHTS[rulingPlanet] ?? 1.0;
    const massScale = 0.5 + 0.5 * normalizePlanetWeight(relMass);
    const skyComponent = Math.min(
      skyBase * massScale * components.retrogradeModifier,
      1,
    );

    // ─ Recipe components ─
    // 30% — elemental alignment of recipe with the current sky
    // 20% — average dignity of recipe's listed favorable planets in current sky
    // 10% — cooking method ↔ ruling planet affinity
    const blended =
      skyComponent * 0.4 +
      elementalAlignment * 0.3 +
      favorableScore * 0.2 +
      methodAffinity * 0.1;

    // ±6% deterministic per-recipe spread. Stable across visits, but breaks the
    // tie when several recipes share a ruling planet and similar elements —
    // which is why the old formula collapsed every French dish to the same %.
    const spread = this.recipeIdSpread(recipeId);

    return Math.max(15, Math.min(100, Math.round((blended + spread) * 100)));
  }

  // --- Recipe ruling planet ---

  determineRulingPlanet(recipe: Recipe): Planet {
    // Check explicit planetary influences
    if (recipe.planetaryInfluences?.favorable?.length) {
      const planet = recipe.planetaryInfluences.favorable[0];
      if (SCORING_PLANETS.includes(planet as Planet)) {
        return planet as Planet;
      }
    }

    const name = recipe.name.toLowerCase();
    const tags = recipe.tags?.map((t) => t.toLowerCase()) ?? [];
    const methods = recipe.cookingMethod?.map((m) => m.toLowerCase()) ?? [];

    if (
      tags.includes("spicy") ||
      name.includes("chili") ||
      name.includes("curry") ||
      methods.includes("grilling")
    )
      return "Mars";
    if (
      tags.includes("dessert") ||
      tags.includes("sweet") ||
      name.includes("chocolate") ||
      name.includes("cake")
    )
      return "Venus";
    if (
      tags.includes("salad") ||
      tags.includes("light") ||
      name.includes("mixed")
    )
      return "Mercury";
    if (
      tags.includes("comfort") ||
      name.includes("soup") ||
      name.includes("pasta") ||
      name.includes("cheese")
    )
      return "Moon";
    if (tags.includes("feast") || name.includes("roast")) return "Jupiter";
    if (
      tags.includes("traditional") ||
      name.includes("rice") ||
      name.includes("bread")
    )
      return "Saturn";
    if (
      tags.includes("breakfast") ||
      name.includes("citrus") ||
      name.includes("orange")
    )
      return "Sun";

    // Element-based fallback: dominant element of the recipe maps to a ruling
    // planet. Keeps a cuisine with similar keyword shapes from collapsing onto
    // a single planet (which is what produced the uniform-match-percentage bug).
    const ep = recipe.elementalProperties;
    if (ep) {
      let dom: Element = "Fire";
      let max = -Infinity;
      for (const e of ELEMENTS) {
        const v = typeof ep[e] === "number" ? ep[e] : 0;
        if (v > max) {
          max = v;
          dom = e;
        }
      }
      return ELEMENT_TO_PLANET[dom];
    }

    return "Moon";
  }

  // --- Helpers ---

  private normalizeSign(sign: any): ZodiacSignType {
    if (typeof sign !== "string") return "aries";
    const lower = sign.toLowerCase() as ZodiacSignType;
    return ZODIAC_SIGNS.includes(lower) ? lower : "aries";
  }

  private getOppositeSign(sign: ZodiacSignType): ZodiacSignType {
    const idx = ZODIAC_SIGNS.indexOf(sign);
    return ZODIAC_SIGNS[(idx + 6) % 12];
  }

  private areFriendly(p1: Planet, p2: Planet): boolean {
    return FRIENDSHIPS[p1]?.includes(p2) ?? false;
  }

  private getCurrentPlanetaryHour(): Planet {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayRuler = DAY_RULERS[dayOfWeek];
    const rulerIdx = CHALDEAN_ORDER.indexOf(dayRuler);
    const hourIdx = (rulerIdx + hour) % 7;
    return CHALDEAN_ORDER[hourIdx];
  }

  private getRecommendedTiming(rulingPlanet: Planet): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayRuler = DAY_RULERS[dayOfWeek];
    const rulerIdx = CHALDEAN_ORDER.indexOf(dayRuler);

    // Find next hour ruled by this planet
    for (let h = now.getHours() + 1; h < 24; h++) {
      const idx = (rulerIdx + h) % 7;
      if (CHALDEAN_ORDER[idx] === rulingPlanet) {
        const end = h + 1;
        return `Best prepared during ${rulingPlanet} hour: ${h}:00 - ${end}:00`;
      }
    }
    return "Favorable any time today";
  }

  private getAspect(
    long1: number,
    long2: number,
  ): { type: string; harmony: number } | null {
    const diff = Math.abs(long1 - long2) % 360;
    const angle = Math.min(diff, 360 - diff);

    if (Math.abs(angle) < 8) return { type: "conjunction", harmony: 0.8 };
    if (Math.abs(angle - 60) < 6) return { type: "sextile", harmony: 0.6 };
    if (Math.abs(angle - 90) < 8) return { type: "square", harmony: -0.3 };
    if (Math.abs(angle - 120) < 8) return { type: "trine", harmony: 1.0 };
    if (Math.abs(angle - 180) < 8) return { type: "opposition", harmony: -0.5 };
    return null;
  }

  private generateReason(
    planet: Planet,
    sign: ZodiacSignType,
    components: PlanetaryScoreComponents,
    isRetrograde: boolean,
    elementalAlignment: number,
    methodAffinity: number,
  ): string {
    const reasons: string[] = [];
    if (components.dignityScore >= 0.9)
      reasons.push(`${planet} is strong in ${sign}`);
    else if (components.dignityScore <= 0.3)
      reasons.push(`${planet} is weakened in ${sign}`);
    if (elementalAlignment >= 0.85)
      reasons.push("elements harmonize with current sky");
    else if (elementalAlignment <= 0.45)
      reasons.push("elements contrast the current sky");
    if (methodAffinity >= 0.9)
      reasons.push(`cooking method channels ${planet}`);
    if (components.decanScore >= 0.8) reasons.push("favorable decan alignment");
    if (components.planetaryHourBonus > 0.1)
      reasons.push("current planetary hour supports this dish");
    if (isRetrograde)
      reasons.push("retrograde period favors simpler preparation");
    return reasons.length > 0
      ? reasons.join(", ")
      : `${planet} in ${sign} provides moderate support`;
  }

  private getDefaultScore(
    rulingPlanet: Planet,
    recipeId?: string,
  ): PlanetaryScoringResult {
    // Even when sky data is missing, vary the displayed score by recipe id so
    // the list doesn't collapse to a single value.
    const spread = recipeId ? this.recipeIdSpread(recipeId) : 0;
    const score = Math.max(15, Math.min(100, Math.round((0.5 + spread) * 100)));
    return {
      overallScore: score,
      components: {
        dignityScore: 0.5,
        decanScore: 0.5,
        planetaryHourBonus: 0,
        criticalDegreeBonus: 0,
        retrogradeModifier: 1.0,
        aspectScore: 0.5,
      },
      recommendedTiming: "Favorable any time today",
      planetaryReason: "Planetary positions unavailable",
      rulingPlanet,
    };
  }

  // ─── Recipe-specific scoring inputs ────────────────────────────────────
  // These methods inject the recipe's own properties into the score so it
  // varies meaningfully per recipe, not just per ruling planet.

  /** Aggregate the current sky's elemental balance from planet positions. */
  private computeSkyElementalBalance(
    positions: PlanetaryPosition[],
  ): Record<Element, number> {
    // Luminaries weigh more than the personal planets; outers count for less.
    const PLANET_WEIGHT: Partial<Record<Planet, number>> = {
      Sun: 1.5, Moon: 1.5,
      Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1,
      Uranus: 0.5, Neptune: 0.5, Pluto: 0.5,
    };
    const balance: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const p of positions) {
      const sign = this.normalizeSign((p as any).sign);
      const element = SIGN_ELEMENT[sign];
      const planet = (p as any).planet as Planet | undefined;
      if (!element) continue;
      balance[element] += PLANET_WEIGHT[planet ?? "Sun"] ?? 1;
    }
    const total = balance.Fire + balance.Water + balance.Earth + balance.Air;
    if (total > 0) {
      for (const e of ELEMENTS) balance[e] /= total;
    }
    return balance;
  }

  /** Cosine similarity between recipe elements and current sky elements. */
  private calculateElementalAlignment(
    recipe: Recipe,
    sky: Record<Element, number>,
  ): number {
    const ep = recipe.elementalProperties;
    if (!ep) return 0.5;
    let dot = 0;
    let rMag = 0;
    let sMag = 0;
    for (const e of ELEMENTS) {
      const rv = typeof ep[e] === "number" ? ep[e] : 0;
      const sv = sky[e] ?? 0;
      dot += rv * sv;
      rMag += rv * rv;
      sMag += sv * sv;
    }
    if (rMag === 0 || sMag === 0) return 0.5;
    return dot / (Math.sqrt(rMag) * Math.sqrt(sMag));
  }

  /** Mean dignity of the recipe's favorable planets in the current sky. */
  private calculateFavorablePlanetsScore(
    favorable: string[] | undefined,
    positions: PlanetaryPosition[],
  ): number {
    if (!favorable?.length) return 0.5;
    const dignities: number[] = [];
    for (const name of favorable) {
      const planet = name as Planet;
      if (!SCORING_PLANETS.includes(planet)) continue;
      const pos = positions.find((p) => (p as any).planet === planet);
      if (!pos) continue;
      const sign = this.normalizeSign((pos as any).sign);
      dignities.push(this.calculateDignityScore(planet, sign));
    }
    if (dignities.length === 0) return 0.5;
    return dignities.reduce((a, b) => a + b, 0) / dignities.length;
  }

  /** Cooking method × ruling planet affinity. */
  private calculateMethodAffinity(
    recipe: Recipe,
    rulingPlanet: Planet,
  ): number {
    const methods = recipe.cookingMethod;
    if (!methods?.length) return 0.5;
    let total = 0;
    let count = 0;
    for (const raw of methods) {
      const key = String(raw).toLowerCase().replace(/\s+/g, "");
      const mp = METHOD_PLANET[key];
      if (!mp) continue;
      if (mp === rulingPlanet) total += 1.0;
      else if (this.areFriendly(mp, rulingPlanet)) total += 0.7;
      else total += 0.4;
      count++;
    }
    return count === 0 ? 0.5 : total / count;
  }

  /**
   * Deterministic ±0.06 spread keyed off the recipe id. Stable across visits;
   * its sole purpose is to break ties between recipes that share a ruling
   * planet and similar elemental shape — the case that produced uniform 29%.
   */
  private recipeIdSpread(id: string): number {
    let h = 5381;
    for (let i = 0; i < id.length; i++) {
      h = ((h << 5) + h) ^ id.charCodeAt(i);
    }
    const norm = ((h & 0xffff) / 0xffff - 0.5) * 0.12;
    return norm;
  }

  private extractPositions(data: any): PlanetaryPosition[] {
    const positions: PlanetaryPosition[] = [];
    
    // The API response structure: { success: true, _celestialBodies: { all: [...], sun: {...}, ... } }
    // Fallback/Legacy structure might be: { planetaryPositions: { ... } } or just { Sun: { ... } }
    const planetaryData =
      data?._celestialBodies ??
      data?.planetaryPositions ??
      data?.positions ??
      data ?? {};

    for (const planet of SCORING_PLANETS) {
      // Try capitalized (fallback) and lowercase (API)
      const pos = planetaryData[planet] ?? planetaryData[planet.toLowerCase()];
      if (pos) {
        // Extract properties carefully as structure varies between astronomy-engine and backend
        const ecliptic = pos.ChartPosition?.Ecliptic ?? pos;
        const arcDegrees = ecliptic.ArcDegrees ?? pos;
        
        positions.push({
          planet,
          sign: pos.Sign?.key ?? pos.sign ?? "aries",
          degree: arcDegrees.degrees ?? pos.degree ?? 0,
          minute: arcDegrees.minutes ?? pos.minute ?? 0,
          exactLongitude: ecliptic.DecimalDegrees ?? pos.exactLongitude ?? 0,
          isRetrograde: pos.isRetrograde ?? false,
        } as any);
      }
    }
    return positions;
  }

  private estimatePositions(date: Date): PlanetaryPosition[] {
    try {
      const accuratePositions = getAccuratePlanetaryPositions(date);
      return SCORING_PLANETS.map((planet) => {
        const pos = accuratePositions[planet];
        if (pos) {
          const degreeInt = Math.floor(pos.degree);
          const minuteInt = Math.floor((pos.degree - degreeInt) * 60);
          return {
            sign: pos.sign,
            degree: degreeInt,
            minute: minuteInt,
            exactLongitude: pos.exactLongitude,
            isRetrograde: pos.isRetrograde,
            planet,
          } as any;
        }
        
        // Should not happen, but safe fallback
        return {
          sign: "aries",
          degree: 0,
          minute: 0,
          exactLongitude: 0,
          isRetrograde: false,
          planet,
        } as any;
      });
    } catch (e) {
      console.error("Error calculating local accurate positions: ", e);
      // Absolute worst case fallback to Aries 0
      return SCORING_PLANETS.map((planet) => ({
        sign: "aries",
        degree: 0,
        minute: 0,
        exactLongitude: 0,
        isRetrograde: false,
        planet,
      } as any));
    }
  }
}
