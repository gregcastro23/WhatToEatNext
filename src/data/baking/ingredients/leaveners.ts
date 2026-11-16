/**
 * Leaveners — chemical (by stoichiometry) and biological.
 *
 * Baking soda's figures are COMPUTED from molar mass, and FDC corroborates
 * them: 27 400 mg sodium per 100 g is 11.92 mmol Na per g against the 11.90
 * mmol of NaHCO₃ the formula predicts — 0.1 % apart. Cream of tartar's FDC
 * ash (36.8 g) matches the 36.7 % of K₂CO₃ its ignition leaves. Both checks
 * are pinned in the tests.
 *
 * @file src/data/baking/ingredients/leaveners.ts
 */
import { BICARBONATE_MMOL_PER_G, BITARTRATE_ACID_MMOL_PER_G, CO2_PER_G_BICARBONATE_NEUTRALISED } from "@/lib/baking/chemistry";
import { SIM } from "@/lib/baking/sim/constants";
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, computed, declared, measured } from "../basis";
import {
  blend,
  CORN_STARCH_GEL_ONSET,
  GLUTEN_SETTING,
  NEUTRAL_ACID,
  NO_FIBRE_BINDING,
  NO_GLUTEN,
  NO_LIPID_PHASE,
  NO_SETTING,
  NO_STARCH_GEL,
  WHEAT_GLUTEN_POTENCY,
  WHEAT_STARCH_GEL_ONSET,
} from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";
import { BREAD_FLOUR } from "./flours";
import { WATER } from "./liquids";

const CHEMICAL: Pick<IngredientSpec, "category" | "solidFatIndex" | "meltingPointC" | "glutenPotency" | "coagulation" | "fiberWaterBinding"> = {
  category: "leavener",
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  fiberWaterBinding: NO_FIBRE_BINDING,
};

export const BAKING_SODA: BakingIngredient = defineIngredient({
  ...CHEMICAL,
  id: "baking-soda",
  name: "Baking soda",
  roles: ["leavening", "base", "browning"],
  source: { kind: "fdc", key: "baking-soda", starch: "none" },
  gelatinizationTempC: NO_STARCH_GEL,
  pH: measured<number | null>(8.3, "SIGMA_NAHCO3", "0.1 M solution at 25 °C"),
  acidMmolPerG: NEUTRAL_ACID,
  bicarbonateMmolPerG: computed(BICARBONATE_MMOL_PER_G, "CIAAW_2021", "pure NaHCO₃: 1000 / 84.006"),
  leaveningGasYield: computed(CO2_PER_G_BICARBONATE_NEUTRALISED, "CIAAW_2021", "NaHCO₃ + H⁺ → CO₂: 44.009 / 84.006 with acid; half that by heat alone"),
  leavening: { kind: "bicarbonate", mixingReleaseFraction: 0, heatReleaseOnsetC: SIM.sodaOnsetC.value, heatReleaseCompleteC: SIM.sodaEndC.value },
  notes: ["FDC's proximates do not close for a pure chemical (37 g of 100); thermophysically it is mineral, and at ≤ 1 % of a formula it barely registers."],
});

export const BAKING_POWDER: BakingIngredient = defineIngredient({
  ...CHEMICAL,
  id: "baking-powder",
  name: "Baking powder (double-acting)",
  roles: ["leavening"],
  source: { kind: "fdc", key: "baking-powder", starch: "by-difference" },
  gelatinizationTempC: { value: CORN_STARCH_GEL_ONSET.value, basis: basisOf("DERIVED", "ALLAN_2020", "its carbohydrate is the cornstarch carrier") },
  pH: absent("a reacting mixture: no single pH"),
  acidMmolPerG: declared<number | null>(0, "formulated to neutralise its own bicarbonate"),
  leaveningGasYield: declared(0.12, "the US specification minimum of 12 % available CO₂; real powders run 12–14.5 %", "CID_A_A_20094"),
  leavening: {
    kind: "complete",
    mixingReleaseFraction: SIM.powderMixingFraction.value,
    heatReleaseOnsetC: SIM.powderHeatOnsetC.value,
    heatReleaseCompleteC: SIM.powderHeatEndC.value,
  },
  notes: ["FDC record: double-acting, sodium aluminium sulfate type. Its acid–base pair is internal, so it neither needs nor neutralises the formula's acids."],
});

export const CREAM_OF_TARTAR: BakingIngredient = defineIngredient({
  ...CHEMICAL,
  id: "cream-of-tartar",
  name: "Cream of tartar",
  roles: ["acid"],
  source: { kind: "fdc", key: "cream-of-tartar", starch: "none" },
  gelatinizationTempC: NO_STARCH_GEL,
  pH: measured<number | null>(3.557, "IUPAC_PH_2002", "saturated potassium hydrogen tartrate at 25 °C"),
  acidMmolPerG: computed<number | null>(BITARTRATE_ACID_MMOL_PER_G, "CIAAW_2021", "one acidic proton per KC₄H₅O₆: 1000 / 188.176"),
  leavening: { kind: "acid", mixingReleaseFraction: 1, heatReleaseOnsetC: null, heatReleaseCompleteC: null },
  notes: ["FDC's 61.5 g 'carbohydrate' is the tartrate counted by difference — not a sugar or a starch."],
});

export const INSTANT_YEAST: BakingIngredient = defineIngredient({
  ...CHEMICAL,
  id: "instant-yeast",
  name: "Instant / active dry yeast",
  roles: ["leavening", "flavor"],
  source: { kind: "fdc", key: "instant-yeast", starch: "none" },
  gelatinizationTempC: NO_STARCH_GEL,
  pH: absent("not applicable to dry yeast"),
  acidMmolPerG: NEUTRAL_ACID,
  leaveningGasYield: declared(0, "biological: its gas is made during proofing and arrives in the dough's measured density"),
  leavening: { kind: "biological", mixingReleaseFraction: 0, heatReleaseOnsetC: null, heatReleaseCompleteC: null },
  notes: ["FDC 'active dry'; instant yeast is the same organism dried finer. Killed near 60 °C in the dough."],
});

export const SOURDOUGH_LEVAIN: BakingIngredient = defineIngredient({
  id: "sourdough-levain",
  name: "Sourdough levain (100 % hydration)",
  category: "leavener",
  roles: ["leavening", "acid", "structure", "flavor"],
  source: {
    kind: "custom",
    composition: blend(0.5, BREAD_FLOUR.composition, 0.5, WATER.composition),
    sugars: { ...BREAD_FLOUR.sugars, unspeciated: BREAD_FLOUR.sugars.unspeciated / 2 },
    basis: basisOf("DERIVED", "USDA_FDC", "equal masses of bread flour (FDC 168896) and water (FDC 174158); fermentation's small consumption of sugar and starch is not modelled"),
    sugarBasis: basisOf("DERIVED", "USDA_FDC", "half of bread flour's (unspeciated) sugars"),
  },
  flour: { share: 0.5, waterPct: BREAD_FLOUR.composition.water / 2, basis: basisOf("DERIVED", "MODEL", "half its mass is flour, which counts toward the baker's base") },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: WHEAT_GLUTEN_POTENCY,
  coagulation: GLUTEN_SETTING,
  gelatinizationTempC: WHEAT_STARCH_GEL_ONSET,
  fiberWaterBinding: NO_FIBRE_BINDING,
  pH: declared<number | null>(4, "a mature levain; peer-reviewed ranges were not confirmed (leads: 3.9–4.1)"),
  acidMmolPerG: declared<number | null>(0.15, "titratable acidity of a mature levain, mmol per g (typical 0.1–0.2; not verified)"),
  leaveningGasYield: declared(0, "biological: its gas is made during proofing and arrives in the dough's measured density"),
  leavening: { kind: "biological", mixingReleaseFraction: 0, heatReleaseOnsetC: null, heatReleaseCompleteC: null },
});

export const LEAVENERS: readonly BakingIngredient[] = [BAKING_SODA, BAKING_POWDER, CREAM_OF_TARTAR, INSTANT_YEAST, SOURDOUGH_LEVAIN];
