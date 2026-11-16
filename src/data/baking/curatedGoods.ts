/**
 * Curated goods added 2026-11-16 for the categories the site's own recipes
 * leave without a simulable example: every muffin and brownie in the served
 * catalogue is refused (coconut sugar, plant milks or nut flours with no
 * vector), no cracker survives, and pastry and pie/tart are refused by
 * design.
 *
 * As with the four archetypes (presets.ts), the GRAMS are ordinary bakery
 * proportions and every process and oven figure is a DECLARED starting
 * point, named in the `basisNote`.
 *
 * @file src/data/baking/curatedGoods.ts
 */
import type { BakingPreset } from "@/lib/baking/formulaTypes";

const DECLARED = "Process and oven figures are declared starting points, not measurements.";

export const BUTTERMILK_MUFFIN: BakingPreset = {
  id: "buttermilk-muffin",
  name: "Buttermilk muffins",
  blurb: "Stirred, oil-tender batter; soda against buttermilk's lactic acid, powder for the rest.",
  formula: {
    id: "buttermilk-muffin",
    name: "Buttermilk muffins",
    lines: [
      { ingredientId: "all-purpose-flour", grams: 250 },
      { ingredientId: "granulated-sugar", grams: 150 },
      { ingredientId: "buttermilk", grams: 240 },
      { ingredientId: "whole-egg", grams: 100 },
      { ingredientId: "vegetable-oil", grams: 80 },
      { ingredientId: "baking-powder", grams: 8 },
      { ingredientId: "baking-soda", grams: 2 },
      { ingredientId: "salt", grams: 3 },
      { ingredientId: "vanilla-extract", grams: 4 },
    ],
  },
  process: { densityGPerMl: 0.95, startC: 21 },
  geometry: { shape: "sphere", dimensionM: 0.03, spanM: 0.06, contactFraction: 0.6 },
  oven: { ovenC: 190, mode: "conventional", fanMs: 0, steamFraction: 0, steamMinutes: 0, bakeMinutes: 22, elevationM: 0, plate: { materialId: "aluminium", thicknessMm: 1 } },
  doneCoreC: 95,
  basisNote: `${DECLARED} A stirred batter near 0.95 g/mL in a standard 6 cm muffin, modelled as a 3 cm-radius sphere 60 % against the tin (it heats from every side); done at 95 °C as the genoise preset. 2 g soda is about what 240 g of buttermilk's acid neutralises.`,
};

export const FUDGY_BROWNIE: BakingPreset = {
  id: "fudgy-brownie",
  name: "Fudgy brownies",
  blurb: "Melted butter, cocoa and chocolate: almost no flour, so egg and sugar set it.",
  formula: {
    id: "fudgy-brownie",
    name: "Fudgy brownies",
    lines: [
      { ingredientId: "butter", grams: 170 },
      { ingredientId: "granulated-sugar", grams: 250 },
      { ingredientId: "whole-egg", grams: 150 },
      { ingredientId: "vanilla-extract", grams: 8 },
      { ingredientId: "cocoa-natural", grams: 50 },
      { ingredientId: "all-purpose-flour", grams: 90 },
      { ingredientId: "salt", grams: 3 },
      { ingredientId: "semisweet-chocolate", grams: 120 },
    ],
  },
  process: { densityGPerMl: 1.05, startC: 21 },
  geometry: { shape: "slab", dimensionM: 0.019, spanM: 0.2, contactFraction: 1 },
  oven: { ovenC: 175, mode: "conventional", fanMs: 0, steamFraction: 0, steamMinutes: 0, bakeMinutes: 28, elevationM: 0, plate: { materialId: "aluminium", thicknessMm: 1 } },
  doneCoreC: 85,
  basisNote: `${DECLARED} 841 g of batter at 1.05 g/mL in an 8 × 8 in (20 cm) pan is a 1.9 cm slab; done at 85 °C, the cookie preset's fudgy point.`,
};

export const WHOLE_WHEAT_CRACKER: BakingPreset = {
  id: "whole-wheat-cracker",
  name: "Whole wheat crackers",
  blurb: "A stiff, unleavened dough rolled thin: baked dry, not risen.",
  formula: {
    id: "whole-wheat-cracker",
    name: "Whole wheat crackers",
    lines: [
      { ingredientId: "whole-wheat-flour", grams: 240 },
      { ingredientId: "water", grams: 120 },
      { ingredientId: "olive-oil", grams: 40 },
      { ingredientId: "salt", grams: 5 },
    ],
  },
  process: { densityGPerMl: 1.1, startC: 21 },
  geometry: { shape: "slab", dimensionM: 0.003, spanM: 0.3, contactFraction: 1 },
  oven: { ovenC: 200, mode: "conventional", fanMs: 0, steamFraction: 0, steamMinutes: 0, bakeMinutes: 15, elevationM: 0, plate: { materialId: "aluminium", thicknessMm: 1 } },
  doneCoreC: 96,
  basisNote: `${DECLARED} Rolled to 3 mm on a sheet; a dense unleavened dough near 1.1 g/mL. It is done once the core reaches the boil plateau, then crisps as the water goes.`,
};

export const CURATED_GOODS: readonly BakingPreset[] = [BUTTERMILK_MUFFIN, FUDGY_BROWNIE, WHOLE_WHEAT_CRACKER];
