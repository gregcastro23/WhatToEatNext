/**
 * Builds a {@link BakingIngredient} from a FoodData Central record (or a
 * stated custom composition) plus its functional claims.
 *
 * What the builder COMPUTES, so no ingredient file restates it:
 * - POD = Σ gᵢ·PODᵢ/100 over the speciated sugars (sweetness.ts);
 * - PAC = Σ gᵢ·PACᵢ/100, with PAC from molar mass (chemistry.ts), including
 *   NaCl (two ions) and ethanol;
 * - the reducing share of the speciated sugars.
 *
 * Absence stays absent: an FDC nutrient that was never reported comes out of
 * `fdcRecords.ts` as `null`, and the builder either refuses (a missing
 * proximate is a data error) or records why it took the value it did.
 *
 * @file src/data/baking/defineIngredient.ts
 */
import { MOLAR_MASS, NACL_PAC, pacFromMolarMass, REDUCING, SUGAR_PAC, SUGAR_SPECIES, type SugarSpecies } from "@/lib/baking/chemistry";
import { SUGAR_POD } from "@/lib/baking/sweetness";
import type {
  BakingCategory,
  BakingIngredient,
  Basis,
  Composition,
  FdcBakingRecord,
  FunctionalRole,
  LeaveningSpec,
  ProvenanceField,
  SugarProfile,
} from "@/lib/baking/types";
import { basisOf, none, type Valued } from "./basis";
import { FDC_BAKING_RECORDS } from "./fdcRecords";

export type StarchRule = "reported" | "by-difference" | "none";

export type CompositionSource =
  | { kind: "fdc"; key: string; starch: StarchRule; sugarsAs?: "sucrose" | "lactose" }
  | { kind: "custom"; composition: Composition; sugars: SugarProfile; basis: Basis; sugarBasis: Basis };

export interface CoagulationWindow {
  onsetC: number;
  endC: number;
}

export interface IngredientSpec {
  id: string;
  name: string;
  category: BakingCategory;
  roles: readonly FunctionalRole[];
  source: CompositionSource;
  solidFatIndex: Valued<number | null>;
  meltingPointC: Valued<number | null>;
  glutenPotency: Valued<number>;
  coagulation: Valued<CoagulationWindow | null>;
  gelatinizationTempC: Valued<number | null>;
  fiberWaterBinding: Valued<number>;
  pH: Valued<number | null>;
  acidMmolPerG: Valued<number | null>;
  bicarbonateMmolPerG?: Valued<number>;
  leaveningGasYield?: Valued<number>;
  leavening?: LeaveningSpec;
  naclPct?: Valued<number>;
  /** Flour carried by a non-flour ingredient (a levain). Flours default to all flour. */
  flour?: { share: number; waterPct: number; basis: Basis };
  notes?: readonly string[];
}

const RECORDS = new Map(FDC_BAKING_RECORDS.map((r) => [r.key, r]));

export function fdcRecord(key: string): FdcBakingRecord {
  const record = RECORDS.get(key);
  if (record === undefined) throw new RangeError(`no FDC record for "${key}" — add it to scripts/fetch-usda-baking.mjs`);
  return record;
}

/** A reported FDC nutrient; refuses when FDC never reported it. */
export function fdcNutrient(key: string, field: keyof FdcBakingRecord["per100g"]): number {
  const record = fdcRecord(key);
  const value = record.per100g[field];
  if (value === null) throw new RangeError(`FDC ${record.fdcId} reports no ${field}`);
  return value;
}

function proximate(record: FdcBakingRecord, field: "water" | "protein" | "fat" | "carbohydrate" | "ash"): number {
  const value = record.per100g[field];
  if (value === null) throw new RangeError(`FDC ${record.fdcId} reports no ${field}`);
  return value;
}

function emptySugars(): SugarProfile {
  return { sucrose: 0, glucose: 0, fructose: 0, lactose: 0, maltose: 0, galactose: 0, allulose: 0, unspeciated: 0 };
}

function fdcSugars(record: FdcBakingRecord, sugarsAs: "sucrose" | "lactose" | undefined, totalSugars: number): SugarProfile {
  const p = record.per100g;
  const out = emptySugars();
  out.sucrose = p.sucrose ?? 0;
  out.glucose = p.glucose ?? 0;
  out.fructose = p.fructose ?? 0;
  out.lactose = p.lactose ?? 0;
  out.maltose = p.maltose ?? 0;
  out.galactose = p.galactose ?? 0;
  const speciated = SUGAR_SPECIES.reduce((sum, s) => sum + out[s], 0);
  const rest = Math.max(totalSugars - speciated, 0);
  if (speciated === 0 && sugarsAs !== undefined) out[sugarsAs] = rest;
  else out.unspeciated = rest;
  return out;
}

interface Resolved {
  composition: Composition;
  sugars: SugarProfile;
  compositionBasis: Basis;
  sugarBasis: Basis;
  fdc: BakingIngredient["fdc"];
}

function resolveFdc(source: Extract<CompositionSource, { kind: "fdc" }>): Resolved {
  const record = fdcRecord(source.key);
  const p = record.per100g;
  const carbohydrate = proximate(record, "carbohydrate");
  const fiber = p.fiber ?? 0;
  // FDC occasionally reports total sugars ABOVE its own carbohydrate-by-difference (two methods; buttermilk
  // 5.36 g against 4.79 g). Sugars are a subset of carbohydrate, so they are capped and the cap is stated.
  const reportedSugars = p.sugars ?? 0;
  const sugarsTotal = Math.min(reportedSugars, Math.max(carbohydrate - fiber, 0));
  const byDifference = Math.max(carbohydrate - fiber - sugarsTotal, 0);
  const starch = p.starch ?? (source.starch === "by-difference" ? byDifference : 0);
  const composition: Composition = {
    water: proximate(record, "water"),
    protein: proximate(record, "protein"),
    fat: proximate(record, "fat"),
    carbohydrate,
    fiber,
    ash: proximate(record, "ash"),
    ethanol: p.ethanol ?? 0,
    starch,
    sugars: sugarsTotal,
  };
  const starchNote = p.starch !== null ? "starch as reported" : source.starch === "by-difference" ? "starch by difference (carbohydrate − fibre − sugars): an upper bound" : "no starch claimed";
  const speciated = p.sucrose !== null || p.glucose !== null || p.lactose !== null;
  const capNote = sugarsTotal < reportedSugars ? `; FDC's ${reportedSugars} g total sugars exceed its carbohydrate by difference, capped at ${sugarsTotal.toFixed(2)} g` : "";
  return {
    composition,
    sugars: fdcSugars(record, source.sugarsAs, sugarsTotal),
    compositionBasis: { kind: "MEASURED", source: "USDA_FDC", fdcId: record.fdcId, note: `${record.description}; ${starchNote}${capNote}` },
    sugarBasis: speciated
      ? { kind: "MEASURED", source: "USDA_FDC", fdcId: record.fdcId }
      : source.sugarsAs === undefined
        ? basisOf("ABSENT", "USDA_FDC", "FDC reports total sugars only: their sweetness and colligative power are excluded")
        : basisOf("DECLARED", "USDA_FDC", `FDC reports total sugars only; taken as ${source.sugarsAs}`),
    fdc: { fdcId: record.fdcId, description: record.description, dataType: record.dataType },
  };
}

function resolve(source: CompositionSource): Resolved {
  if (source.kind === "fdc") return resolveFdc(source);
  return { composition: source.composition, sugars: source.sugars, compositionBasis: source.basis, sugarBasis: source.sugarBasis, fdc: null };
}

function speciesSum(sugars: SugarProfile, weight: (s: SugarSpecies) => number | null): number {
  return SUGAR_SPECIES.reduce((sum, s) => sum + sugars[s] * (weight(s) ?? 0), 0);
}

function sugarChemistry(r: Resolved, naclPct: number): { pod: number; pac: number; reducing: number } {
  const pod = speciesSum(r.sugars, (s) => SUGAR_POD[s].value) / 100;
  const ethanolPac = pacFromMolarMass(MOLAR_MASS.ethanol);
  const pac = (speciesSum(r.sugars, (s) => SUGAR_PAC[s]) + naclPct * NACL_PAC + r.composition.ethanol * ethanolPac) / 100;
  const speciated = speciesSum(r.sugars, () => 1);
  const reducing = speciated > 0 ? speciesSum(r.sugars, (s) => (REDUCING[s] ? 1 : 0)) / speciated : 0;
  return { pod, pac, reducing };
}

function provenanceOf(spec: IngredientSpec, r: Resolved, extra: Pick<Required<IngredientSpec>, "bicarbonateMmolPerG" | "leaveningGasYield" | "naclPct">): Record<ProvenanceField, Basis> {
  return {
    composition: r.compositionBasis,
    flourShare: flourOf(spec, r).basis,
    sugars: r.sugarBasis,
    solidFatIndex: spec.solidFatIndex.basis,
    meltingPointC: spec.meltingPointC.basis,
    pod: basisOf("COMPUTED", "OPENSTAX_SWEETNESS", "Σ sugar grams × relative sweetness; maltose and galactose excluded"),
    pac: basisOf("COMPUTED", "CIAAW_2021", "Σ solute grams × 342.297/M (×2 for NaCl), from molar masses"),
    reducingSugarScore: basisOf("COMPUTED", "USDA_FDC", "reducing share of the speciated sugars"),
    glutenPotency: spec.glutenPotency.basis,
    coagulationTempC: spec.coagulation.basis,
    gelatinizationTempC: spec.gelatinizationTempC.basis,
    fiberWaterBinding: spec.fiberWaterBinding.basis,
    pH: spec.pH.basis,
    leaveningGasYield: extra.leaveningGasYield.basis,
    naclPct: extra.naclPct.basis,
    acidMmolPerG: spec.acidMmolPerG.basis,
    bicarbonateMmolPerG: extra.bicarbonateMmolPerG.basis,
  };
}

function flourOf(spec: IngredientSpec, r: Resolved): { share: number; waterPct: number; basis: Basis } {
  if (spec.flour !== undefined) return spec.flour;
  if (spec.category === "flour_grain") {
    return { share: 1, waterPct: r.composition.water, basis: basisOf("DERIVED", "MODEL", "a flour: all of it counts toward the baker's base") };
  }
  return { share: 0, waterPct: 0, basis: basisOf("DERIVED", "MODEL", "carries no flour") };
}

export function defineIngredient(spec: IngredientSpec): BakingIngredient {
  const r = resolve(spec.source);
  const extra = {
    bicarbonateMmolPerG: spec.bicarbonateMmolPerG ?? none("no bicarbonate"),
    leaveningGasYield: spec.leaveningGasYield ?? none("not a chemical leavener"),
    naclPct: spec.naclPct ?? none("no added sodium chloride"),
  };
  const chem = sugarChemistry(r, extra.naclPct.value);
  const c = r.composition;
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    waterPct: c.water,
    fatPct: c.fat,
    solidFatIndex: spec.solidFatIndex.value,
    meltingPointC: spec.meltingPointC.value,
    sugarPct: c.sugars,
    pod: chem.pod,
    pac: chem.pac,
    reducingSugarScore: chem.reducing,
    proteinPct: c.protein,
    glutenPotency: spec.glutenPotency.value,
    coagulationTempC: spec.coagulation.value?.onsetC ?? null,
    coagulationEndC: spec.coagulation.value?.endC ?? null,
    flourShare: flourOf(spec, r).share,
    flourWaterPct: flourOf(spec, r).waterPct,
    starchPct: c.starch,
    gelatinizationTempC: spec.gelatinizationTempC.value,
    fiberWaterBinding: spec.fiberWaterBinding.value,
    pH: spec.pH.value,
    leaveningGasYield: extra.leaveningGasYield.value,
    composition: c,
    sugars: r.sugars,
    naclPct: extra.naclPct.value,
    acidMmolPerG: spec.acidMmolPerG.value,
    bicarbonateMmolPerG: extra.bicarbonateMmolPerG.value,
    leavening: spec.leavening ?? null,
    roles: spec.roles,
    fdc: r.fdc,
    provenance: provenanceOf(spec, r, extra),
    notes: spec.notes ?? [],
  };
}
