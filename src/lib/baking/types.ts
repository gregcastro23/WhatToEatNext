/**
 * Baking Lab — ingredient and provenance contracts.
 *
 * An ingredient is a FUNCTIONAL VECTOR, not a label: water, lipid phase,
 * sweetener chemistry, structure-forming protein and starch, fibre binding,
 * acidity and leavening potential. Every number carries a {@link Basis} that
 * names where it came from, under the repo's defensible-values standard:
 *
 * | basis      | means                                                        |
 * |------------|--------------------------------------------------------------|
 * | MEASURED   | a dataset record (USDA FDC id) or a cited measurement         |
 * | DERIVED    | arithmetic on named measured inputs (e.g. starch by difference) |
 * | COMPUTED   | a formula with stated inputs (PAC from molar mass, CO₂ by stoichiometry) |
 * | DECLARED   | a labelled modelling choice — a representative value, not a measurement |
 * | ABSENT     | `null` — no value is claimed                                   |
 *
 * Deviation from the product brief, on purpose: `meltingPointC`, `pH` and
 * `solidFatIndex` are nullable. Olive oil has no pH (no aqueous phase) and a
 * flour's 1 % lipid has no meaningful melting point; a `0` there would be a
 * fabricated number, and `0` already means something for each of them.
 *
 * @file src/lib/baking/types.ts
 */
import type { CitationId } from "./citations";

export type BakingCategory =
  | "flour_grain"
  | "fat_lipid"
  | "sugar_sweetener"
  | "liquid_dairy"
  | "egg_binder"
  | "leavener"
  | "hydrocolloid_fiber"
  | "inclusion_flavor";

/** The product brief's functional vector. Percentages are g per 100 g of ingredient. */
export interface BakingIngredientVector {
  id: string;
  name: string;
  category: BakingCategory;
  /** Total water, g/100 g — feeds true hydration and steam generation. */
  waterPct: number;
  /** Total lipid, g/100 g. */
  fatPct: number;
  /** Solid fat fraction of the lipid at 20 °C, 0–1. Null when not determined. */
  solidFatIndex: number | null;
  /** Temperature by which the lipid is fully liquid, °C. Null when there is no lipid phase. */
  meltingPointC: number | null;
  /** Total sugars, g/100 g. */
  sugarPct: number;
  /** Sweetening power per g of ingredient, sucrose = 100. */
  pod: number;
  /** Freezing-point / softness power per g of ingredient, sucrose = 100 (colligative). */
  pac: number;
  /** Share of the sugars that are reducing (glucose, fructose, lactose, maltose, galactose, allulose), 0–1. */
  reducingSugarScore: number;
  /** Total protein, g/100 g. */
  proteinPct: number;
  /** Share of the protein able to form a gluten network, 0–1. */
  glutenPotency: number;
  /** Temperature at which the ingredient's protein sets, °C. */
  coagulationTempC: number | null;
  /** Starch, g/100 g. */
  starchPct: number;
  /** Peak starch gelatinization temperature in excess water, °C. */
  gelatinizationTempC: number | null;
  /** g of water bound per g of ingredient. */
  fiberWaterBinding: number;
  /** pH of the ingredient (or its aqueous phase). Null when it has none. */
  pH: number | null;
  /** g CO₂ per g of ingredient at full reaction (chemical) — biological leaveners are 0, see LeaveningSpec. */
  leaveningGasYield: number;
}

export type BasisKind = "MEASURED" | "DERIVED" | "COMPUTED" | "DECLARED" | "ABSENT";

export interface Basis {
  kind: BasisKind;
  /** The source, from the citation registry. */
  source: CitationId;
  /** Present when the source is a FoodData Central record. */
  fdcId?: number;
  note?: string;
}

/** g per 100 g, as FoodData Central reports them. `null` = not reported (never 0). */
export interface FdcNutrients {
  water: number | null;
  protein: number | null;
  fat: number | null;
  carbohydrate: number | null;
  ash: number | null;
  fiber: number | null;
  sugars: number | null;
  sucrose: number | null;
  glucose: number | null;
  fructose: number | null;
  lactose: number | null;
  maltose: number | null;
  galactose: number | null;
  starch: number | null;
  sodiumMg: number | null;
  ethanol: number | null;
}

/**
 * One household measure USDA weighed for a record, verbatim. SR Legacy puts
 * the measure in `modifier` ("cup", "large", "stick") and leaves `unit`
 * "undetermined"; Foundation names `unit` ("cup", "teaspoon").
 */
export interface FdcPortion {
  amount: number;
  unit: string;
  modifier: string;
  description: string;
  /** Grams per `amount` of the measure. */
  grams: number;
}

export interface FdcBakingRecord {
  key: string;
  fdcId: number;
  dataType: string;
  description: string;
  per100g: FdcNutrients;
  portions: readonly FdcPortion[];
}

/** Sugar speciation, g per 100 g of ingredient. */
export interface SugarProfile {
  sucrose: number;
  glucose: number;
  fructose: number;
  lactose: number;
  maltose: number;
  galactose: number;
  allulose: number;
  /** Sugar reported only as a total, with no speciation. Its POD/PAC are unknown and excluded. */
  unspeciated: number;
}

/** Proximate composition, g per 100 g. Starch and sugars are subsets of carbohydrate. */
export interface Composition {
  water: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  fiber: number;
  ash: number;
  ethanol: number;
  starch: number;
  sugars: number;
}

/** How a leavener releases gas. */
export interface LeaveningSpec {
  kind: "bicarbonate" | "complete" | "acid" | "biological";
  /** Share of a complete leavener's CO₂ released at mixing, before the oven. */
  mixingReleaseFraction: number;
  /** Heat-activated release window, °C. Null when nothing is heat-activated. */
  heatReleaseOnsetC: number | null;
  heatReleaseCompleteC: number | null;
}

export type FunctionalRole =
  | "structure"
  | "tenderizer"
  | "moisture"
  | "sweetener"
  | "leavening"
  | "acid"
  | "base"
  | "emulsifier"
  | "binder"
  | "browning"
  | "flavor"
  | "fat";

/** Every numeric field that carries a basis. */
export type ProvenanceField =
  | "composition"
  | "flourShare"
  | "sugars"
  | "solidFatIndex"
  | "meltingPointC"
  | "pod"
  | "pac"
  | "reducingSugarScore"
  | "glutenPotency"
  | "coagulationTempC"
  | "gelatinizationTempC"
  | "fiberWaterBinding"
  | "pH"
  | "leaveningGasYield"
  | "naclPct"
  | "acidMmolPerG"
  | "bicarbonateMmolPerG";

export interface BakingIngredient extends BakingIngredientVector {
  /** Temperature by which the protein has fully set, °C — the end of the window `coagulationTempC` opens. Shares its basis. */
  coagulationEndC: number | null;
  /** g of flour per g of ingredient — the baker's-percentage base (1 for a flour, 0.5 for a 100 % levain). */
  flourShare: number;
  /** Water per 100 g of ingredient that is that flour's own moisture — excluded from true hydration by baker's convention. */
  flourWaterPct: number;
  composition: Composition;
  sugars: SugarProfile;
  /** Sodium chloride, g/100 g — the electrolyte that depresses water activity. */
  naclPct: number;
  /**
   * Titratable acid equivalents that react with bicarbonate, mmol H⁺ per g.
   * Null when the acidity was never quantified: the acid–base balance then
   * EXCLUDES the ingredient and names it, rather than counting it as neutral.
   */
  acidMmolPerG: number | null;
  /** Bicarbonate equivalents, mmol HCO₃⁻ per g. */
  bicarbonateMmolPerG: number;
  leavening: LeaveningSpec | null;
  roles: readonly FunctionalRole[];
  /** The FoodData Central record the composition came from, when it did. */
  fdc: { fdcId: number; description: string; dataType: string } | null;
  provenance: Readonly<Record<ProvenanceField, Basis>>;
  notes: readonly string[];
}
