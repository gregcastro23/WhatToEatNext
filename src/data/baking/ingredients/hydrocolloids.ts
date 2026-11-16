/**
 * Hydrocolloids and fibre — the gluten-free structure builders — and cocoa,
 * whose 30–37 g of fibre per 100 g makes it behave more like a flour than a
 * flavouring.
 *
 * Xanthan and psyllium have no FoodData Central record. Their compositions
 * are DECLARED manufacturer-typical figures, and their water-holding
 * capacities are the values Belorio & Gómez (2020) report — with units and
 * method NOT confirmed this session, which is why their basis says so.
 *
 * @file src/data/baking/ingredients/hydrocolloids.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, derived, measured } from "../basis";
import { COCOA_BUTTER_MELT, COCOA_BUTTER_SFI, emptySugars, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL, UNQUANTIFIED_ACID } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const COLLOID: Pick<IngredientSpec, "category" | "solidFatIndex" | "meltingPointC" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "acidMmolPerG"> = {
  category: "hydrocolloid_fiber",
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  acidMmolPerG: NEUTRAL_ACID,
};

function declaredPowder(water: number, protein: number, fat: number, fiber: number, ash: number, what: string): IngredientSpec["source"] {
  return {
    kind: "custom",
    composition: { water, protein, fat, carbohydrate: fiber, fiber, ash, ethanol: 0, starch: 0, sugars: 0 },
    sugars: emptySugars(),
    basis: basisOf("DECLARED", "MODEL", `manufacturer-typical ${what}; not a measured record`),
    sugarBasis: basisOf("DECLARED", "MODEL", "no free sugars"),
  };
}

export const XANTHAN_GUM: BakingIngredient = defineIngredient({
  ...COLLOID,
  id: "xanthan-gum",
  name: "Xanthan gum",
  roles: ["binder", "structure"],
  source: declaredPowder(10, 1, 0, 81, 8, "xanthan gum powder"),
  fiberWaterBinding: measured(3.64, "BELORIO_2020", "g water per g as reported; units and method not confirmed"),
  pH: absent("not measured"),
  notes: ["Used at 0.5–2 % of flour in gluten-free baking to hold gas the way gluten would."],
});

export const PSYLLIUM_HUSK: BakingIngredient = defineIngredient({
  ...COLLOID,
  id: "psyllium-husk",
  name: "Psyllium husk powder",
  roles: ["binder", "structure", "moisture"],
  source: declaredPowder(8, 2, 0.6, 86.4, 3, "psyllium husk powder"),
  fiberWaterBinding: measured(3.42, "BELORIO_2020", "g water per g as reported; units and method not confirmed"),
  pH: absent("not measured"),
  notes: ["Forms a cohesive, extensible gel — the gluten-free baker's closest thing to a dough network."],
});

const COCOA: Pick<IngredientSpec, "solidFatIndex" | "meltingPointC" | "fiberWaterBinding"> = {
  solidFatIndex: { value: COCOA_BUTTER_SFI.value, basis: basisOf("DERIVED", "MODEL", "cocoa butter, as in chocolate") },
  meltingPointC: { value: COCOA_BUTTER_MELT.value, basis: basisOf("DERIVED", "WILLE_LUTTON_1966", "cocoa butter form V") },
  fiberWaterBinding: NO_FIBRE_BINDING,
};

export const COCOA_NATURAL: BakingIngredient = defineIngredient({
  ...COLLOID,
  ...COCOA,
  id: "cocoa-natural",
  name: "Cocoa powder (natural)",
  roles: ["structure", "acid", "flavor", "browning"],
  source: { kind: "fdc", key: "cocoa-natural", starch: "none" },
  pH: derived<number | null>(5.55, "MILLER_2008", "midpoint of the 5.3–5.8 measured on commercial natural cocoas"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Acidic: pairs with baking soda. Its fibre binds water strongly in practice — not modelled, so hydration reads high in cocoa-heavy formulas."],
});

export const COCOA_DUTCH: BakingIngredient = defineIngredient({
  ...COLLOID,
  ...COCOA,
  id: "cocoa-dutch",
  name: "Cocoa powder (Dutch-process)",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "cocoa-dutch", starch: "none" },
  pH: derived<number | null>(7.4, "MILLER_2008", "midpoint of the 'medium alkalized' 7.21–7.60 class"),
  notes: ["Alkalized: it will NOT activate baking soda. Swapping it for natural cocoa leaves soda unneutralised."],
});

export const HYDROCOLLOIDS: readonly BakingIngredient[] = [XANTHAN_GUM, PSYLLIUM_HUSK, COCOA_NATURAL, COCOA_DUTCH];
