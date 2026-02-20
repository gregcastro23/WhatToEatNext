/**
 * Planetary Scoring Service
 *
 * Provides minute-precision planetary scoring for recipe recommendations.
 * Uses real planetary positions to calculate dignity, decan rulers,
 * planetary hours, critical degrees, and retrograde modifiers.
 */

import type {
  Planet,
  ZodiacSignType,
  PlanetaryPosition,
} from "@/types/celestial";
import type { Recipe } from "@/types/recipe";

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
      return this.getDefaultScore(rulingPlanet);
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

    const overallScore = this.calculateOverallScore(components);
    const recommendedTiming = this.getRecommendedTiming(rulingPlanet);
    const planetaryReason = this.generateReason(
      rulingPlanet,
      sign,
      components,
      isRetrograde,
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

  private calculateOverallScore(components: PlanetaryScoreComponents): number {
    const base =
      components.dignityScore * 0.4 +
      components.decanScore * 0.25 +
      components.aspectScore * 0.25 +
      components.planetaryHourBonus +
      components.criticalDegreeBonus;

    const modified = base * components.retrogradeModifier;
    return Math.round(Math.min(modified, 1) * 100);
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
  ): string {
    const reasons: string[] = [];
    if (components.dignityScore >= 0.9)
      reasons.push(`${planet} is strong in ${sign}`);
    if (components.decanScore >= 0.8) reasons.push("favorable decan alignment");
    if (components.planetaryHourBonus > 0.1)
      reasons.push("current planetary hour supports this dish");
    if (isRetrograde)
      reasons.push("retrograde period favors simpler preparation");
    return reasons.length > 0
      ? reasons.join(", ")
      : `${planet} in ${sign} provides moderate support`;
  }

  private getDefaultScore(rulingPlanet: Planet): PlanetaryScoringResult {
    return {
      overallScore: 50,
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

  private extractPositions(data: any): PlanetaryPosition[] {
    const positions: PlanetaryPosition[] = [];
    const planetaryData =
      data?.planetaryPositions ?? data?.positions ?? data ?? {};

    for (const planet of SCORING_PLANETS) {
      const pos = planetaryData[planet];
      if (pos) {
        positions.push({
          ...pos,
          planet,
        } as any);
      }
    }
    return positions;
  }

  private estimatePositions(date: Date): PlanetaryPosition[] {
    const daysSinceJ2000 =
      (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const baseLongitudes: Record<string, number> = {
      Sun: 280.46,
      Moon: 218.32,
      Mercury: 252.25,
      Venus: 181.98,
      Mars: 355.43,
      Jupiter: 34.35,
      Saturn: 49.94,
    };
    const dailyMotion: Record<string, number> = {
      Sun: 0.9856,
      Moon: 13.176,
      Mercury: 1.383,
      Venus: 1.2,
      Mars: 0.524,
      Jupiter: 0.0831,
      Saturn: 0.0335,
    };

    return SCORING_PLANETS.map((planet) => {
      const longitude =
        ((baseLongitudes[planet] ?? 0) +
          (dailyMotion[planet] ?? 0) * daysSinceJ2000) %
        360;
      const posLong = longitude < 0 ? longitude + 360 : longitude;
      const signIdx = Math.floor(posLong / 30);
      const degree = Math.floor(posLong % 30);
      const minute = Math.floor(((posLong % 30) - degree) * 60);

      return {
        sign: ZODIAC_SIGNS[signIdx],
        degree,
        minute,
        exactLongitude: posLong,
        isRetrograde: false,
        planet,
      } as any;
    });
  }
}
