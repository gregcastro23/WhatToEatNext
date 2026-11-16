/**
 * Baking Lab — formula, process and telemetry contracts.
 *
 * A formula is a list of grams. Everything else — baker's percentages, true
 * hydration, water activity, sweetness, the acid–base balance — is COMPUTED
 * from those grams and the ingredient vectors, never stored beside them, so a
 * telemetry figure can never disagree with the formula it describes.
 *
 * @file src/lib/baking/formulaTypes.ts
 */
import type { Reading } from "@/lib/cooking/labSolver";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import type { Composition, SugarProfile } from "./types";

/** The lab's value-or-stated-reason type, shared with the thermal solver. */
export type { Reading };

export interface FormulaLine {
  ingredientId: string;
  grams: number;
}

export interface Formula {
  id: string;
  name: string;
  lines: readonly FormulaLine[];
}

/** What the batter or dough is like at the oven door. */
export interface BakeProcess {
  /**
   * Density entering the oven, g/mL — weigh a level cup of batter. The gas
   * fraction is COMPUTED from it against the matrix density, so this one
   * kitchen measurement stands in for creaming, whipping or proofing.
   */
  densityGPerMl: number;
  /** Batter or dough temperature at oven entry, °C. */
  startC: number;
}

export interface ProductGeometry {
  shape: FoodGeometry;
  /** Slab: full thickness, bottom face to top face, m. Cylinder or sphere: radius, m. */
  dimensionM: number;
  /** Width of the exposed top, m — the convection length scale. */
  spanM: number;
  /** Share of a cylinder or sphere surface resting on the pan or deck, 0–1. A slab's whole bottom face is in contact. */
  contactFraction: number;
}

export type OvenMode = "conventional" | "convection" | "deck";

export interface ContactPlate {
  /** A material id from src/data/cooking/cookwareMaterials.ts. */
  materialId: string;
  thicknessMm: number;
}

export interface OvenSettings {
  ovenC: number;
  mode: OvenMode;
  /** Fan air speed over the product, m/s. Used in convection mode only. */
  fanMs: number;
  /** Vapour mole fraction of the oven air while steaming, 0–1. */
  steamFraction: number;
  steamMinutes: number;
  bakeMinutes: number;
  elevationM: number;
  /** The pan or baking stone under the product. Null: the product sits on the rack. */
  plate: ContactPlate | null;
}

export interface BakingPreset {
  id: string;
  name: string;
  blurb: string;
  formula: Formula;
  process: BakeProcess;
  geometry: ProductGeometry;
  oven: OvenSettings;
  /** Core temperature at which the product is done, °C. */
  doneCoreC: number;
  /** Where the preset's numbers come from. */
  basisNote: string;
}

export interface WaterActivityResult {
  /** Estimated water activity of the aqueous phase, 0–1. */
  aw: number;
  /** g of sucrose that cannot dissolve in the free water and stays crystalline. */
  undissolvedSucroseGrams: number;
  /** Solutes present that the model could not include, by name. */
  excluded: readonly string[];
  model: string;
}

export interface AcidBaseBalance {
  /** Titratable acid that can reach the bicarbonate, mmol. */
  acidMmol: number;
  /** Free bicarbonate (baking soda), mmol. */
  bicarbonateMmol: number;
  /** Bicarbonate neutralised by acid, mmol — each releases one CO₂. */
  neutralisedMmol: number;
  /** Bicarbonate left over, mmol — decomposes by heat at half the CO₂ and leaves carbonate. */
  excessBaseMmol: number;
  /** Acid left over, mmol. */
  excessAcidMmol: number;
  /** Ingredients whose acidity is unquantified and therefore EXCLUDED, by id. */
  unquantified: readonly string[];
}

export interface LeaveningBudget {
  /** CO₂ from soda neutralised by the formula's acids, g. Released mostly at mixing. */
  neutralisationCo2Grams: number;
  /** CO₂ from excess soda decomposing in the oven, g. */
  thermalCo2Grams: number;
  /** CO₂ from complete leaveners (baking powder) at mixing, g. */
  powderMixingCo2Grams: number;
  /** CO₂ from complete leaveners released by heat, g. */
  powderHeatCo2Grams: number;
  /** True when yeast or a levain is present — the gas cells hold fermentation CO₂. */
  fermented: boolean;
}

export interface StructureBalance {
  glutenGrams: number;
  coagulatingProteinGrams: number;
  starchGrams: number;
  hydrocolloidGrams: number;
  fatGrams: number;
  sugarGrams: number;
  /** (gluten + coagulating protein + starch + hydrocolloid) / (fat + sugar). Null with no tenderiser. */
  ratio: number | null;
}

export interface FormulaTelemetry {
  totalGrams: number;
  /** The baker's-percentage base: every flour_grain line, g. */
  flourGrams: number;
  /** Baker's percentage per formula line, same order as the lines. Null with no flour. */
  bakersPercent: ReadonlyArray<number | null>;
  /** Grams of each proximate component in the whole batch. */
  composition: Composition;
  /** Grams of each sugar species in the whole batch. */
  sugars: SugarProfile;
  /** Water bound by fibre and hydrocolloids, g. */
  boundWaterGrams: number;
  /** Water not bound by fibre, g. */
  freeWaterGrams: number;
  /** Non-flour water ÷ flour weight × 100 (baker's convention). Null with no flour. */
  trueHydrationPct: number | null;
  /** All water ÷ total mass × 100. */
  moistureWbPct: number;
  waterActivity: Reading<WaterActivityResult>;
  /** Sucrose-equivalent sweetness per 100 g of formula. */
  podPer100g: number;
  /** Sucrose-equivalent colligative (softness) power per 100 g of formula. */
  pacPer100g: number;
  /** Reducing share of the speciated sugars, 0–1. */
  reducingSugarFraction: number;
  /** Lipid-weighted solid fat index of the fat phase at 20 °C. Null when unknown. */
  fatPhaseSolidFatIndex: number | null;
  /** Clear point of the highest-melting fat present, °C. */
  fatPhaseMeltingC: number | null;
  structure: StructureBalance;
  acidBase: AcidBaseBalance;
  leavening: LeaveningBudget;
  /** Plain-language notes on unknowns the figures above had to exclude. */
  caveats: readonly string[];
}
