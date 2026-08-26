import {
  calculateKalchm as canonicalCalculateKalchm,
  calculateMonica as canonicalCalculateMonica,
} from "@/data/unified/alchemicalCalculations";
import type {
  AstrologicalState,
  Element,
  ElementalProperties,
} from "@/types/alchemy";
import { AlchemicalEngineAdvanced } from "../alchemicalEngine";

// --- Core Alchemizer Engine with Kalchm and Monica Constant ---

// Zodiac sign names
const signs = {
  0: "aries",
  1: "taurus",
  2: "gemini",
  3: "cancer",
  4: "leo",
  5: "virgo",
  6: "libra",
  7: "scorpio",
  8: "sagittarius",
  9: "capricorn",
  10: "aquarius",
  11: "pisces",
};

// Planetary alchemy and element info
interface PlanetInfo {
  "Dignity Effect": Record<string, number>;
  Elements: Element[];
  Alchemy: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  "Diurnal Element": Element;
  "Nocturnal Element": Element;
}

const planetInfo: Record<string, PlanetInfo | undefined> = {
  Sun: {
    "Dignity Effect": { leo: 1, aries: 2, aquarius: -1, libra: -2 },
    Elements: ["Fire", "Fire"],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    "Diurnal Element": "Fire",
    "Nocturnal Element": "Fire",
  },
  Moon: {
    "Dignity Effect": { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 },
    Elements: ["Water", "Water"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    "Diurnal Element": "Water",
    "Nocturnal Element": "Water",
  },
  Mercury: {
    "Dignity Effect": { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 },
    Elements: ["Air", "Earth"],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    "Diurnal Element": "Air",
    "Nocturnal Element": "Earth",
  },
  Venus: {
    "Dignity Effect": {
      libra: 1,
      taurus: 1,
      pisces: 2,
      aries: -1,
      scorpio: -1,
      virgo: -2,
    },
    Elements: ["Water", "Earth"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    "Diurnal Element": "Water",
    "Nocturnal Element": "Earth",
  },
  Mars: {
    "Dignity Effect": {
      aries: 1,
      scorpio: 1,
      capricorn: 2,
      taurus: -1,
      libra: -1,
      cancer: -2,
    },
    Elements: ["Fire", "Water"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    "Diurnal Element": "Fire",
    "Nocturnal Element": "Water",
  },
  Jupiter: {
    "Dignity Effect": {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2,
    },
    Elements: ["Air", "Fire"],
    Alchemy: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    "Diurnal Element": "Air",
    "Nocturnal Element": "Fire",
  },
  Saturn: {
    "Dignity Effect": {
      aquarius: 1,
      capricorn: 1,
      libra: 2,
      cancer: -1,
      leo: -1,
      aries: -2,
    },
    Elements: ["Air", "Earth"],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    "Diurnal Element": "Air",
    "Nocturnal Element": "Earth",
  },
  Uranus: {
    "Dignity Effect": { aquarius: 1, scorpio: 2, taurus: -3 },
    Elements: ["Water", "Air"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    "Diurnal Element": "Water",
    "Nocturnal Element": "Air",
  },
  Neptune: {
    "Dignity Effect": { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 },
    Elements: ["Water", "Water"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    "Diurnal Element": "Water",
    "Nocturnal Element": "Water",
  },
  Pluto: {
    "Dignity Effect": { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 },
    Elements: ["Earth", "Water"],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    "Diurnal Element": "Earth",
    "Nocturnal Element": "Water",
  },
  Ascendant: {
    "Dignity Effect": { leo: 0, aries: 0, aquarius: 0, libra: 0 },
    Elements: ["Earth"],
    Alchemy: { Spirit: 0, Essence: 0, Matter: 1, Substance: 0 },
    "Diurnal Element": "Earth",
    "Nocturnal Element": "Earth",
  },
};

// Zodiac sign info (abbreviated for brevity, expand as needed)
interface SignInfo {
  Element: Element;
}

const signInfo: Record<string, SignInfo | undefined> = {
  aries: { Element: "Fire" },
  taurus: { Element: "Earth" },
  gemini: { Element: "Air" },
  cancer: { Element: "Water" },
  leo: { Element: "Fire" },
  virgo: { Element: "Earth" },
  libra: { Element: "Air" },
  scorpio: { Element: "Water" },
  sagittarius: { Element: "Fire" },
  capricorn: { Element: "Earth" },
  aquarius: { Element: "Air" },
  pisces: { Element: "Water" },
};

// --- Types ---
interface AlchemyTotals {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

// --- Core Calculation Function ---
function alchemize(planetaryPositions: {
  [planet: string]: string;
}): ThermodynamicMetrics {
  // 1. Aggregate alchemical and elemental properties
  const totals: AlchemyTotals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet];
    const planetData = planetInfo[planet];
    if (!planetData) continue;

    // Sum alchemical properties
    for (const prop in planetData.Alchemy) {
      // `prop` ranges only over `planetData.Alchemy`'s own keys (Spirit,
      // Essence, Matter, Substance), so this mirrors the existing
      // `keyof AlchemyTotals` assertion on the left-hand side.
      totals[prop as keyof AlchemyTotals] +=
        planetData.Alchemy[prop as keyof typeof planetData.Alchemy];
    }

    // Sum elemental properties (use signInfo for sign's element).
    // Guard against an unrecognized sign string so a single bad position can't
    // throw and take down the whole calculation.
    const signElement = signInfo[sign]?.Element;
    if (signElement) {
      totals[signElement] += 1;
    }
  }

  // 2. Calculate thermodynamic metrics (using exact formulas)
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } =
    totals;

  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = heatNum / heatDen;

  // Entropy
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / entropyDen;

  // Reactivity
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / reactivityDen;

  // Greg's Energy
  const gregsEnergy = heat - entropy * reactivity;

  // Kalchm (K_alchm) via THE canonical engine. This copy had no floor and no
  // guard at all, so it matched canonical exactly on non-negative axes and
  // produced NaN on a negative one — which then propagated into monica below.
  const kalchm = canonicalCalculateKalchm({
    Spirit,
    Essence,
    Matter,
    Substance,
  });

  // Monica constant via canonical engine (handles kalchm=1 equilibrium -> phi)
  const monica = canonicalCalculateMonica(gregsEnergy, reactivity, kalchm);

  return { heat, entropy, reactivity, gregsEnergy, kalchm, monica };
}

// --- Export for use in other modules ---
export { alchemize, planetInfo, signInfo, signs };

// Pattern OO-4: Integration Import Resolution - AlchemicalEngine class for service compatibility
export class AlchemicalEngine {
  private readonly advanced: AlchemicalEngineAdvanced;

  constructor() {
    this.advanced = new AlchemicalEngineAdvanced();
  }

  /**
   * Calculate thermodynamic metrics from planetary positions
   */
  alchemize(planetaryPositions: {
    [planet: string]: string;
  }): ThermodynamicMetrics {
    return alchemize(planetaryPositions);
  }

  /**
   * Calculate elemental compatibility between two elemental property sets
   */
  calculateElementalCompatibility(
    properties1: ElementalProperties,
    properties2: ElementalProperties,
  ): number {
    const elements: Array<keyof ElementalProperties> = [
      "Fire",
      "Water",
      "Earth",
      "Air",
    ];
    let score = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (const element of elements) {
      const v1 = properties1[element] || 0;
      const v2 = properties2[element] || 0;
      score += v1 * v2;
      sum1 += v1 * v1;
      sum2 += v2 * v2;
    }

    const magnitude = Math.sqrt(sum1) * Math.sqrt(sum2);
    return magnitude > 0 ? Math.max(0, Math.min(1, score / magnitude)) : 0.5;
  }

  // Proxy legacy/advanced methods for compatibility
  calculateAstroCuisineMatch(
    recipeElements?: ElementalProperties,
    astrologicalState?: AstrologicalState,
    season?: string,
    cuisine?: string,
  ): unknown {
    return this.advanced.calculateAstroCuisineMatch(
      recipeElements,
      astrologicalState,
      season,
      cuisine,
    );
  }

  // Proxy: calculateAdvancedRecipeHarmony → calculateRecipeHarmony
  calculateAdvancedRecipeHarmony(
    _recipeName: string,
    userElements: ElementalProperties,
    astroState: AstrologicalState,
    _birthInfo?: unknown,
  ): number {
    const astroElements = (astroState as unknown as Record<string, unknown>).elementalBalance as ElementalProperties | undefined;
    return this.calculateElementalCompatibility(
      userElements,
      astroElements ?? userElements,
    );
  }

  calculateAstrologicalPower(
    recipeSunSign: string,
    astrologicalState: AstrologicalState,
  ): number {
    const active = astrologicalState.activePlanets ?? [];
    return active.includes(recipeSunSign) ? 1.0 : 0.5;
  }

  getElementalAffinity(
    element1: keyof ElementalProperties,
    element2: keyof ElementalProperties,
  ): { compatibility: Record<string, number> } {
    const score = element1 === element2 ? 1.0 : 0.7;
    return {
      compatibility: {
        [element1]: score,
        [element2]: score,
      },
    };
  }

  calculateNaturalInfluences(params: unknown): Record<string, number> {
    return typeof params === "object" && params !== null
      ? (params as Record<string, number>)
      : {};
  }

  getElementRanking(elementObject: Record<string, number>): Array<{ element: string; value: number }> {
    return Object.entries(elementObject)
      .map(([element, value]) => ({ element, value }))
      .sort((a, b) => b.value - a.value);
  }

  combineElementObjects(
    elementObject1: ElementalProperties,
    elementObject2: ElementalProperties,
    weight1?: number,
    weight2?: number,
  ): ElementalProperties {
    if (typeof weight1 === "number" && typeof weight2 === "number") {
      return {
        Fire: elementObject1.Fire * weight1 + elementObject2.Fire * weight2,
        Water: elementObject1.Water * weight1 + elementObject2.Water * weight2,
        Air: elementObject1.Air * weight1 + elementObject2.Air * weight2,
        Earth: elementObject1.Earth * weight1 + elementObject2.Earth * weight2,
      };
    }
    return {
      Fire: (elementObject1.Fire + elementObject2.Fire) / 2,
      Water: (elementObject1.Water + elementObject2.Water) / 2,
      Air: (elementObject1.Air + elementObject2.Air) / 2,
      Earth: (elementObject1.Earth + elementObject2.Earth) / 2,
    };
  }
}

// Also provide default export for backwards compatibility
export default { alchemize, signs, planetInfo, signInfo };
