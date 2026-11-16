/**
 * The ALCHM reading of a formula: its real-physics telemetry projected onto
 * Fire, Water, Earth and Air.
 *
 * ⚠️ This is the alchm system, not physics (navigation.ts: a reader must
 * always know which system they are reading). It is a ONE-WAY projection —
 * nothing here feeds back into the simulator or the telemetry — and it is
 * DEFINED by this project rather than measured. To keep it checkable, every
 * component is a quantity that is already bounded 0–1 by its own definition
 * (a mass fraction, a water activity, a share), so no normalising constant is
 * invented; each element is the plain mean of its components, × 100.
 *
 * - Water — hydration and mobility: moisture (wet basis), mobile water
 *   (moisture × a_w), and the dough's hydration share.
 * - Earth — structure and solids: dry-solids fraction, the structure-forming
 *   share of those solids, the gluten-forming share of the protein.
 * - Fire  — browning chemistry: the reducing share of the sugars, sugar and
 *   protein as fractions of the dry matter, and — once baked — the crust's
 *   browning extent.
 * - Air   — leavening and porosity: gas at the oven door, the fat phase's
 *   solid (creamable) fraction, the chemical CO₂ as a share of batter volume,
 *   and — once baked — the share of the final volume that is gas.
 *
 * @file src/lib/baking/elemental.ts
 */
import { GAS_CONSTANT } from "@/lib/cooking/boundaryNetwork";
import { SEA_LEVEL_PRESSURE_KPA } from "@/lib/environment/isa";
import { MOLAR_MASS } from "./chemistry";
import type { FormulaTelemetry } from "./formulaTypes";

export type BakingElement = "Fire" | "Water" | "Earth" | "Air";

export const BAKING_ELEMENTS: readonly BakingElement[] = ["Fire", "Water", "Earth", "Air"];

export interface ElementalComponent {
  label: string;
  /** 0–1 by its own definition. */
  value: number;
}

export interface ElementalReading {
  /** 0–100 per element: the mean of its components. */
  scores: Record<BakingElement, number>;
  /** Scores as shares of their sum, 0–1 — the form the rest of the app displays. */
  shares: Record<BakingElement, number>;
  dominant: BakingElement;
  components: Record<BakingElement, readonly ElementalComponent[]>;
}

/** Bake outcomes the projection can use when a simulation has run. */
export interface BakeOutcome {
  browningExtent: number;
  /** Final volume over starting volume. */
  volumeRatio: number;
}

/** Ideal-gas molar volume at 100 °C and sea-level pressure, L·mol⁻¹. */
const LITRES_PER_MOL_AT_100C = ((GAS_CONSTANT * 373.15) / (SEA_LEVEL_PRESSURE_KPA * 1000)) * 1000;

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 1);
}

function mean(components: readonly ElementalComponent[]): number {
  return components.length === 0 ? 0 : (components.reduce((s, c) => s + c.value, 0) / components.length) * 100;
}

/** Hydrating water ÷ (hydrating water + flour), 0–1; the moisture fraction when there is no flour. */
function hydrationShare(t: FormulaTelemetry): number {
  if (t.trueHydrationPct === null) return clamp01(t.moistureWbPct / 100);
  const water = (t.trueHydrationPct * t.flourGrams) / 100;
  return clamp01(water / (water + t.flourGrams));
}

function chemicalCo2Share(t: FormulaTelemetry, batterLitres: number): number {
  const grams = t.leavening.neutralisationCo2Grams + t.leavening.thermalCo2Grams + t.leavening.powderMixingCo2Grams + t.leavening.powderHeatCo2Grams;
  const litres = (grams / MOLAR_MASS.carbonDioxide) * LITRES_PER_MOL_AT_100C;
  return litres + batterLitres > 0 ? litres / (litres + batterLitres) : 0;
}

export function elementalReading(t: FormulaTelemetry, gasFraction0: number, densityGPerMl: number, outcome: BakeOutcome | null): ElementalReading {
  const dry = t.totalGrams - t.composition.water;
  const s = t.structure;
  const structure = s.glutenGrams + s.coagulatingProteinGrams + s.starchGrams + s.hydrocolloidGrams;
  const aw = t.waterActivity.available ? t.waterActivity.value.aw : 0;
  const components: Record<BakingElement, ElementalComponent[]> = {
    // Every Water component must DISCRIMINATE: a_w alone and the free share of the water sit near 1 for
    // nearly every formula, which once read a 10 %-moisture cookie as "Water-led".
    Water: [
      { label: "Moisture (wet basis)", value: clamp01(t.moistureWbPct / 100) },
      { label: "Mobile water (moisture × a_w)", value: clamp01((t.moistureWbPct / 100) * aw) },
      { label: "Hydration share of the dough", value: hydrationShare(t) },
    ],
    Earth: [
      { label: "Dry solids", value: clamp01(dry / t.totalGrams) },
      { label: "Structure share of solids", value: dry > 0 ? clamp01(structure / dry) : 0 },
      { label: "Gluten-forming share of protein", value: t.composition.protein > 0 ? clamp01(s.glutenGrams / t.composition.protein) : 0 },
    ],
    Fire: [
      { label: "Reducing share of sugars", value: clamp01(t.reducingSugarFraction) },
      { label: "Sugar in dry matter", value: dry > 0 ? clamp01(t.composition.sugars / dry) : 0 },
      { label: "Protein in dry matter", value: dry > 0 ? clamp01(t.composition.protein / dry) : 0 },
      ...(outcome === null ? [] : [{ label: "Crust browning extent", value: clamp01(outcome.browningExtent) }]),
    ],
    Air: [
      { label: "Gas at the oven door", value: clamp01(gasFraction0) },
      { label: "Solid (creamable) fat fraction", value: clamp01(t.fatPhaseSolidFatIndex ?? 0) },
      { label: "Chemical CO₂ share of volume", value: clamp01(chemicalCo2Share(t, t.totalGrams / densityGPerMl / 1000)) },
      ...(outcome === null ? [] : [{ label: "Gas share of baked volume", value: clamp01(1 - 1 / outcome.volumeRatio) }]),
    ],
  };
  const scores: Record<BakingElement, number> = {
    Fire: mean(components.Fire),
    Water: mean(components.Water),
    Earth: mean(components.Earth),
    Air: mean(components.Air),
  };
  const total = scores.Fire + scores.Water + scores.Earth + scores.Air;
  const share = (e: BakingElement): number => (total > 0 ? scores[e] / total : 0.25);
  const dominant = BAKING_ELEMENTS.reduce((best, e) => (scores[e] > scores[best] ? e : best), "Fire");
  return {
    scores,
    shares: { Fire: share("Fire"), Water: share("Water"), Earth: share("Earth"), Air: share("Air") },
    dominant,
    components,
  };
}
