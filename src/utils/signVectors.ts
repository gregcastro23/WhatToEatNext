import { ZODIAC_ELEMENTS } from "@/calculations/core/elementalCalculations";
import { ZODIAC_SEASONS } from "@/constants/seasonalCore";
import {
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties, Season } from "@/types/alchemy";
import type {
  AlchemicalProperties,
  PlanetaryAspect,
  PlanetaryPosition,
} from "@/types/celestial";
import type {
  SignVector,
  SignVectorCalculationInput,
  SignVectorCompatibilityResult,
  SignVectorComponents,
  SignVectorMap,
} from "@/types/signVectors";
import { getModalityForZodiac } from "@/utils/zodiacUtils";

const ZODIAC_SIGNS: any[] = [
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

function normalize(value: number, _min = 0, _max = 1): number {
  if (Number.isNaN(value)) return 0;
  const clamped = Math.max(_min, Math.min(_max, value));
  return clamped;
}

function unitNormalizeVector(values: number[]): number[] {
  const magnitude = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return values.map(() => 0);
  return values.map((v) => v / magnitude);
}

function createEmptyComponents(): SignVectorComponents {
  return {
    cardinal: 0,
    fixed: 0,
    mutable: 0,
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    seasonal: 0,
  };
}

function getSeasonalAlignment(sign: any, season?: Season): number {
  if (!season) return 0.5; // neutral when unknown
  const signs = ZODIAC_SEASONS[season];
  if (!Array.isArray(signs)) return 0.5;
  return signs.includes(sign) ? 1.0 : 0.25;
}

function addModalityComponent(
  components: SignVectorComponents,
  sign: any,
  weight: number,
): void {
  const modality = getModalityForZodiac(sign);
  if (modality === "cardinal") components.cardinal += weight;
  else if (modality === "fixed") components.fixed += weight;
  else components.mutable += weight;
}

function addElementalComponent(
  components: SignVectorComponents,
  sign: any,
  weight: number,
): void {
  const element = ZODIAC_ELEMENTS[sign];
  if (!element) return;
  components[element] += weight;
}

function computePlanetaryWeightForSign(
  targetSign: any,
  planetaryPositions: Record<string, PlanetaryPosition>,
  aspects?: PlanetaryAspect[],
): number {
  let weight = 0;
  Object.entries(planetaryPositions || {}).forEach(([planet, pos]) => {
    const sign = String(pos.sign || "").toLowerCase();
    if (!sign) return;
    const base = sign === targetSign ? 1.0 : 0.2; // strongest when the planet is in the target sign

    // Degree proximity boost within the same, sign: earlier degrees slightly stronger
    const degree = typeof pos.degree === "number" ? pos.degree : undefined;
    const degreeFactor =
      typeof degree === "number"
        ? 1 - Math.min(30, Math.max(0, degree)) / 30
        : 0.5;

    // Aspect modifiers involving the planet
    const aspectFactor = (aspects || []).reduce((acc, aspect) => {
      if (aspect.planet1 === planet || aspect.planet2 === planet) {
        const t = String(aspect.type || aspect.aspectType || "").toLowerCase();
        if (t === "conjunction") return acc * 1.2;
        if (t === "trine") return acc * 1.1;
        if (t === "sextile") return acc * 1.05;
        if (t === "square") return acc * 0.93;
        if (t === "opposition") return acc * 0.9;
      }
      return acc;
    }, 1);

    // Retrograde slightly diffuses expression
    const retrogradeFactor = pos.isRetrograde ? 0.9 : 1.0;

    // Planetary weighting (Sun/Moon stronger, personal > outer);
    const planetWeightMap: Record<string, number> = {
      Sun: 1.5,
      Moon: 1.3,
      _Mercury: 1.1,
      _Venus: 1.1,
      _Mars: 1.2,
      _Jupiter: 1.0,
      _Saturn: 0.95,
      _Uranus: 0.9,
      _Neptune: 0.9,
      _Pluto: 0.9,
    };
    const planetWeight = planetWeightMap[planet] ?? 1.0;

    weight +=
      base * degreeFactor * aspectFactor * retrogradeFactor * planetWeight;
  });
  return weight;
}

export function calculateSignVectors(
  _input: SignVectorCalculationInput,
): SignVectorMap {
  const { planetaryPositions, aspects, season } = _input;
  const result: Partial<SignVectorMap> = {};

  // First, pass: build raw components and magnitudes
  ZODIAC_SIGNS.forEach((sign) => {
    const components = createEmptyComponents();
    // Planetary expression weight for this sign
    const planetaryWeight = computePlanetaryWeightForSign(
      sign,
      planetaryPositions,
      aspects,
    );

    // Modality and elemental components scaled by planetary weight
    addModalityComponent(components, sign, planetaryWeight);
    addElementalComponent(components, sign, planetaryWeight);

    // Seasonal alignment
    components.seasonal = getSeasonalAlignment(sign, season);

    // Normalize modality sub-vector to unit length to avoid bias vs elemental axes
    const modalityVector = [
      components.cardinal,
      components.fixed,
      components.mutable,
    ];
    const [nCardinal, nFixed, nMutable] = unitNormalizeVector(modalityVector);
    components.cardinal = nCardinal;
    components.fixed = nFixed;
    components.mutable = nMutable;

    // Normalize elemental sub-vector similarly
    const elementalVector = [
      components.Fire,
      components.Water,
      components.Earth,
      components.Air,
    ];
    const [nFire, nWater, nEarth, nAir] = unitNormalizeVector(elementalVector);
    components.Fire = nFire;
    components.Water = nWater;
    components.Earth = nEarth;
    components.Air = nAir;

    // Magnitude combines planetary expression (scaled 0-1) with seasonal alignment
    const rawMagnitude = planetaryWeight;
    const scaledMagnitude = Math.min(1, rawMagnitude / 6); // heuristic scaling
    const magnitude = normalize(
      0.7 * scaledMagnitude + 0.3 * components.seasonal,
    );

    // _Direction: dominant modality component
    const modalityTriplet: Array<{
      key: "cardinal" | "fixed" | "mutable";
      value: number;
    }> = [
      { key: "cardinal", value: components.cardinal },
      { key: "fixed", value: components.fixed },
      { key: "mutable", value: components.mutable },
    ];
    modalityTriplet.sort((a, b) => b.value - a.value);
    const direction = modalityTriplet[0].key;

    result[sign] = {
      sign,
      _magnitude: magnitude,
      direction,
      components,
    };
  });

  return result as SignVectorMap;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const minLen = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < minLen; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function compareSignVectors(
  a: SignVector,
  b: SignVector,
): SignVectorCompatibilityResult {
  const aVec = [
    a.components.cardinal,
    a.components.fixed,
    a.components.mutable,
    a.components.Fire,
    a.components.Water,
    a.components.Earth,
    a.components.Air,
    a.components.seasonal,
  ];
  const bVec = [
    b.components.cardinal,
    b.components.fixed,
    b.components.mutable,
    b.components.Fire,
    b.components.Water,
    b.components.Earth,
    b.components.Air,
    b.components.seasonal,
  ];
  const similarity = normalize((cosineSimilarity(aVec, bVec) + 1) / 2); // map [-11] -> [01]

  // Determine dominant shared axis by maximum product of corresponding components
  const modalityScore =
    a.components.cardinal * b.components.cardinal +
    a.components.fixed * b.components.fixed +
    a.components.mutable * b.components.mutable;
  const elementalScore =
    a.components.Fire * b.components.Fire +
    a.components.Water * b.components.Water +
    a.components.Earth * b.components.Earth +
    a.components.Air * b.components.Air;
  const seasonalScore = a.components.seasonal * b.components.seasonal;

  const axisScores: Array<{
    axis: "modality" | "elemental" | "seasonal";
    score: number;
  }> = [
    { axis: "modality", score: modalityScore },
    { axis: "elemental", score: elementalScore },
    { axis: "seasonal", score: seasonalScore },
  ];
  axisScores.sort((x, y) => y.score - x.score);
  const dominantSharedAxis =
    axisScores[0].score > 0 ? axisScores[0].axis : "none";

  return { similarity, dominantSharedAxis };
}

// =====================
// Vector → ESMS mapping and integration
// =====================

import {
  calculateAlchemicalProperties as calcESMSFromPositions,
  calculateElementalValues,
} from "@/calculations/core/kalchmEngine";

export const VECTOR_CONFIG = {
  blendWeightAlpha: 0.15,
  elementalToESMS: {
    Spirit: { Fire: 0.5, Air: 0.5 },
    Essence: { Water: 0.5, Fire: 0.5 },
    Matter: { Earth: 0.6, Water: 0.4 },
    Substance: { Earth: 0.5, Air: 0.5 },
  } as Record<keyof AlchemicalProperties, Partial<ElementalProperties>>,
  modalityBoosts: {
    cardinal: { Spirit: 1.15, Essence: 1.05, Matter: 1.0, Substance: 1.0 },
    fixed: { Spirit: 1.0, Essence: 1.0, Matter: 1.05, Substance: 1.15 },
    mutable: { Spirit: 1.08, Essence: 1.12, Matter: 1.0, Substance: 1.0 },
  } as Record<
    "cardinal" | "fixed" | "mutable",
    Record<keyof AlchemicalProperties, number>
  >,
};

export function signVectorToESMS(_v: SignVector): AlchemicalProperties {
  const { components, _magnitude, direction } = _v;

  const elemental: ElementalProperties = {
    Fire: components.Fire,
    Water: components.Water,
    Earth: components.Earth,
    Air: components.Air,
  };

  const e2 = VECTOR_CONFIG.elementalToESMS;
  const modality = VECTOR_CONFIG.modalityBoosts[direction];

  const Spirit =
    (elemental.Fire * (e2.Spirit.Fire || 0) +
      elemental.Air * (e2.Spirit.Air || 0)) *
    modality.Spirit *
    _magnitude;
  const Essence =
    (elemental.Water * (e2.Essence.Water || 0) +
      elemental.Fire * (e2.Essence.Fire || 0)) *
    modality.Essence *
    _magnitude;
  const Matter =
    (elemental.Earth * (e2.Matter.Earth || 0) +
      elemental.Water * (e2.Matter.Water || 0)) *
    modality.Matter *
    _magnitude;
  const Substance =
    (elemental.Earth * (e2.Substance.Earth || 0) +
      elemental.Air * (e2.Substance.Air || 0)) *
    modality.Substance *
    _magnitude;

  const raw: AlchemicalProperties = { Spirit, Essence, Matter, Substance };
  const sum = Spirit + Essence + Matter + Substance || 1;
  return {
    Spirit: Spirit / sum,
    Essence: Essence / sum,
    Matter: Matter / sum,
    Substance: Substance / sum,
  };
}

export function blendESMS(
  base: AlchemicalProperties,
  contribution: AlchemicalProperties,
  alpha: number = VECTOR_CONFIG.blendWeightAlpha,
): AlchemicalProperties {
  const Spirit = base.Spirit * (1 - alpha) + contribution.Spirit * alpha;
  const Essence = base.Essence * (1 - alpha) + contribution.Essence * alpha;
  const Matter = base.Matter * (1 - alpha) + contribution.Matter * alpha;
  const Substance =
    base.Substance * (1 - alpha) + contribution.Substance * alpha;
  const sum = Spirit + Essence + Matter + Substance || 1;
  return {
    Spirit: Spirit / sum,
    Essence: Essence / sum,
    Matter: Matter / sum,
    Substance: Substance / sum,
  };
}

export function getAlchemicalStateWithVectors(input: {
  planetaryPositions: Record<string, PlanetaryPosition>;
  aspects?: PlanetaryAspect[];
  season?: Season;
  governing?: "sun" | "moon" | "dominant" | "ensemble";
}): {
  signVectors: SignVectorMap;
  selected: SignVector;
  base: { alchemical: AlchemicalProperties; elemental: ElementalProperties };
  blendedAlchemical: AlchemicalProperties;
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    kalchm: number;
    monica: number;
  };
  config: typeof VECTOR_CONFIG;
} {
  const { planetaryPositions, aspects, season, governing = "dominant" } = input;

  const baseAlchemical = calcESMSFromPositions(planetaryPositions as any);
  const baseElemental = calculateElementalValues(
    planetaryPositions as any,
  ) as ElementalProperties;

  const signVectors = calculateSignVectors({
    planetaryPositions,
    aspects,
    season,
  });

  let selected: SignVector | null = null;
  if (governing === "sun") {
    const sunSign = String(
      planetaryPositions.Sun.sign || "",
    ).toLowerCase() as any;
    selected = sunSign ? signVectors[sunSign] : null;
  } else if (governing === "moon") {
    const moonSign = String(
      planetaryPositions.Moon.sign || "",
    ).toLowerCase() as any;
    selected = moonSign ? signVectors[moonSign] : null;
  } else if (governing === "ensemble") {
    // Sun/Moon/Ascendant ensemble (if available) with heuristic weights
    const sunSign = String(
      planetaryPositions.Sun.sign || "",
    ).toLowerCase() as any;
    const moonSign = String(
      planetaryPositions.Moon.sign || "",
    ).toLowerCase() as any;
    const ascSign = String(
      planetaryPositions.Ascendant.sign || "",
    ).toLowerCase() as any;
    const parts: SignVector[] = [
      sunSign && signVectors[sunSign],
      moonSign && signVectors[moonSign],
      ascSign && signVectors[ascSign],
    ].filter(Boolean);
    const weights = [0.5, 0.3, 0.2].slice(0, parts.length);
    if (parts.length > 0) {
      // Weighted average on components and magnitude; direction from strongest magnitude
      const ref = parts.reduce(
        (acc, v, i) => {
          const w = weights[i] || 0;
          acc.components.cardinal += v.components.cardinal * w;
          acc.components.fixed += v.components.fixed * w;
          acc.components.mutable += v.components.mutable * w;
          acc.components.Fire += v.components.Fire * w;
          acc.components.Water += v.components.Water * w;
          acc.components.Earth += v.components.Earth * w;
          acc.components.Air += v.components.Air * w;
          acc.components.seasonal += v.components.seasonal * w;
          acc._magnitude += v._magnitude * w;
          return acc;
        },
        {
          components: {
            cardinal: 0,
            fixed: 0,
            mutable: 0,
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0,
            seasonal: 0,
          },
          magnitude: 0,
        } as unknown as SignVector,
      );
      const strongest = parts.sort((a, b) => b._magnitude - a._magnitude)[0];
      selected = {
        sign: strongest.sign,
        direction: strongest.direction,
        _magnitude: ref._magnitude,
        components: ref.components,
      } as SignVector;
    }
  }
  if (!selected) {
    selected = Object.values(signVectors).sort(
      (a, b) => b._magnitude - a._magnitude,
    )[0];
  }

  const esmsFromVector = signVectorToESMS(selected);
  const blendedAlchemical = blendESMS(baseAlchemical, esmsFromVector);

  const { heat, entropy, reactivity, gregsEnergy } = calculateThermodynamics(
    blendedAlchemical,
    baseElemental,
  );
  const kalchm = calculateKalchm(blendedAlchemical);
  const monica = calculateMonica(gregsEnergy, reactivity, kalchm);

  return {
    signVectors,
    selected,
    base: { alchemical: baseAlchemical, elemental: baseElemental },
    blendedAlchemical,
    thermodynamics: { heat, entropy, reactivity, gregsEnergy, kalchm, monica },
    config: VECTOR_CONFIG,
  };
}
