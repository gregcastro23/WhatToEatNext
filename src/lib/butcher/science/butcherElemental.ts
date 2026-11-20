import type { AnatomicalCut, ButcherElement } from "@/lib/butcher/types";

/**
 * One-way ALCHM elemental & ESMS projection for `/kitchen-lab/butcher`.
 *
 * Rendered exclusively on the `Elements` tab behind `<SystemBadge system="alchm" />`.
 * Nothing here feeds back into meat physics, shear force, or USDA composition.
 *
 * @file src/lib/butcher/science/butcherElemental.ts
 */

export const BUTCHER_ELEMENTS: readonly ButcherElement[] = [
  "Fire",
  "Water",
  "Earth",
  "Air",
];

export interface ButcherElementComponent {
  readonly label: string;
  readonly value: number;
}

export interface ButcherElementalReading {
  readonly scores: Readonly<Record<ButcherElement, number>>;
  readonly shares: Readonly<Record<ButcherElement, number>>;
  readonly dominant: ButcherElement;
  readonly components: Readonly<Record<ButcherElement, readonly ButcherElementComponent[]>>;
  readonly esms: AnatomicalCut["alchm"]["esms"];
  readonly rulingPlanets: readonly string[];
  readonly alchemicalPrep: string;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function mean100(items: readonly ButcherElementComponent[]): number {
  if (items.length === 0) return 0;
  return (items.reduce((acc, item) => acc + item.value, 0) / items.length) * 100;
}

function buildButcherElementComponents(
  cut: AnatomicalCut,
): Record<ButcherElement, readonly ButcherElementComponent[]> {
  const { waterG, proteinG, fatG, collagenG } = cut.proximate;
  const base = cut.alchm.elements;

  return {
    Fire: [
      { label: "Species solar / sear affinity", value: clamp01(base.Fire) },
      { label: "Intramuscular lipid fuel share", value: clamp01(fatG / 35) },
      { label: "Target heat intensity", value: clamp01((cut.targetCoreTempC.ideal - 40) / 60) },
    ],
    Water: [
      { label: "Species moisture affinity", value: clamp01(base.Water) },
      { label: "Bound tissue water fraction", value: clamp01(waterG / 80) },
      { label: "Gelatin broth potential", value: clamp01(collagenG / 3.6) },
    ],
    Earth: [
      { label: "Species structural affinity", value: clamp01(base.Earth) },
      { label: "Myofibrillar protein density", value: clamp01(proteinG / 32) },
      { label: "Connective matrix load", value: clamp01(collagenG / 3.5) },
    ],
    Air: [
      { label: "Species aromatic / lean lightness", value: clamp01(base.Air) },
      { label: "Tenderness permeability (inverse fiber)", value: clamp01(1 - (cut.fiberLengthFactor - 1) / 2) },
      { label: "Volatile fat-aroma lightness", value: clamp01(1 - fatG / 55) },
    ],
  };
}

export function computeButcherElementalReading(
  cut: AnatomicalCut,
): ButcherElementalReading {
  const components = buildButcherElementComponents(cut);
  const scores: Record<ButcherElement, number> = {
    Fire: mean100(components.Fire),
    Water: mean100(components.Water),
    Earth: mean100(components.Earth),
    Air: mean100(components.Air),
  };

  const total = scores.Fire + scores.Water + scores.Earth + scores.Air;
  const share = (e: ButcherElement): number => (total > 0 ? scores[e] / total : 0.25);
  const dominant = BUTCHER_ELEMENTS.reduce(
    (best, el) => (scores[el] > scores[best] ? el : best),
    "Fire",
  );

  return {
    scores,
    shares: {
      Fire: share("Fire"),
      Water: share("Water"),
      Earth: share("Earth"),
      Air: share("Air"),
    },
    dominant,
    components,
    esms: cut.alchm.esms,
    rulingPlanets: cut.alchm.rulingPlanets,
    alchemicalPrep: cut.alchm.alchemicalPrep,
  };
}
