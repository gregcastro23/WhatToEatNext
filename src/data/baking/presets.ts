/**
 * The four archetype formulas the lab opens with.
 *
 * The GRAMS are ordinary bakery formulas. The process and oven figures —
 * batter density, product size, oven setting — are DECLARED starting points
 * (labelled in each `basisNote`), meant to be replaced with the baker's own:
 * weigh a level cup of your batter and the density stops being an assumption.
 *
 * @file src/data/baking/presets.ts
 */
import type { BakingPreset } from "@/lib/baking/formulaTypes";

const DECLARED_PROCESS = "Process and oven figures are declared starting points, not measurements: weigh a known volume of your own batter or dough for its density.";

export const SOURDOUGH_COUNTRY_LOAF: BakingPreset = {
  id: "sourdough-country-loaf",
  name: "Artisan sourdough country loaf",
  blurb: "Lean, levain-leavened, 73 % true hydration, baked on a stone with steam.",
  formula: {
    id: "sourdough-country-loaf",
    name: "Sourdough country loaf",
    lines: [
      { ingredientId: "bread-flour", grams: 450 },
      { ingredientId: "whole-wheat-flour", grams: 50 },
      { ingredientId: "water", grams: 350 },
      { ingredientId: "sourdough-levain", grams: 100 },
      { ingredientId: "salt", grams: 10 },
    ],
  },
  process: { densityGPerMl: 0.5, startC: 24 },
  geometry: { shape: "sphere", dimensionM: 0.075, spanM: 0.2, contactFraction: 0.15 },
  oven: {
    ovenC: 250,
    mode: "deck",
    fanMs: 0,
    steamFraction: 0.5,
    steamMinutes: 15,
    bakeMinutes: 45,
    elevationM: 0,
    plate: { materialId: "stoneware", thicknessMm: 15 },
  },
  doneCoreC: 96,
  basisNote: `${DECLARED_PROCESS} A proofed lean dough near 0.5 g/mL; a 960 g boule modelled as a 7.5 cm-radius sphere resting 15 % on the stone.`,
};

export const BRIOCHE_LOAF: BakingPreset = {
  id: "brioche-loaf",
  name: "Brioche loaf",
  blurb: "Enriched with 50 % butter and 60 % egg; slow-setting, quick-browning.",
  formula: {
    id: "brioche-loaf",
    name: "Brioche",
    lines: [
      { ingredientId: "bread-flour", grams: 500 },
      { ingredientId: "whole-egg", grams: 300 },
      { ingredientId: "whole-milk", grams: 60 },
      { ingredientId: "butter", grams: 250 },
      { ingredientId: "granulated-sugar", grams: 60 },
      { ingredientId: "salt", grams: 10 },
      { ingredientId: "instant-yeast", grams: 8 },
    ],
  },
  process: { densityGPerMl: 0.45, startC: 26 },
  geometry: { shape: "cylinder", dimensionM: 0.055, spanM: 0.11, contactFraction: 0.6 },
  oven: {
    ovenC: 180,
    mode: "conventional",
    fanMs: 0,
    steamFraction: 0,
    steamMinutes: 0,
    bakeMinutes: 50,
    elevationM: 0,
    plate: { materialId: "aluminium", thicknessMm: 1 },
  },
  doneCoreC: 93,
  basisNote: `${DECLARED_PROCESS} A loaf tin modelled as a cylinder of 5.5 cm radius with 60 % of its surface against the tin.`,
};

export const BROWN_BUTTER_COOKIE: BakingPreset = {
  id: "brown-butter-cookie",
  name: "Brown butter chocolate chip cookie",
  blurb: "Brown butter (no water), two sugars, soda against brown sugar's acid.",
  formula: {
    id: "brown-butter-cookie",
    name: "Brown butter chocolate chip cookies",
    lines: [
      { ingredientId: "all-purpose-flour", grams: 280 },
      { ingredientId: "brown-butter", grams: 200 },
      { ingredientId: "brown-sugar", grams: 200 },
      { ingredientId: "granulated-sugar", grams: 100 },
      { ingredientId: "whole-egg", grams: 100 },
      { ingredientId: "vanilla-extract", grams: 8 },
      { ingredientId: "baking-soda", grams: 5 },
      { ingredientId: "salt", grams: 6 },
      { ingredientId: "semisweet-chocolate", grams: 300 },
    ],
  },
  process: { densityGPerMl: 1.15, startC: 18 },
  geometry: { shape: "slab", dimensionM: 0.012, spanM: 0.07, contactFraction: 1 },
  oven: {
    ovenC: 180,
    mode: "conventional",
    fanMs: 0,
    steamFraction: 0,
    steamMinutes: 0,
    bakeMinutes: 12,
    elevationM: 0,
    plate: { materialId: "aluminium", thicknessMm: 1 },
  },
  doneCoreC: 85,
  basisNote: `${DECLARED_PROCESS} A 1.2 cm dough puck on an aluminium sheet; spread is not modelled, so the puck keeps its width.`,
};

export const GENOISE_SPONGE: BakingPreset = {
  id: "genoise-sponge",
  name: "Genoise sponge",
  blurb: "A whole-egg foam: almost all of its lift is whipped air.",
  formula: {
    id: "genoise-sponge",
    name: "Genoise",
    lines: [
      { ingredientId: "cake-flour", grams: 125 },
      { ingredientId: "granulated-sugar", grams: 125 },
      { ingredientId: "whole-egg", grams: 250 },
      { ingredientId: "butter", grams: 30 },
    ],
  },
  process: { densityGPerMl: 0.45, startC: 30 },
  geometry: { shape: "slab", dimensionM: 0.035, spanM: 0.2, contactFraction: 1 },
  oven: {
    ovenC: 175,
    mode: "conventional",
    fanMs: 0,
    steamFraction: 0,
    steamMinutes: 0,
    bakeMinutes: 28,
    elevationM: 0,
    plate: { materialId: "aluminium", thicknessMm: 2 },
  },
  doneCoreC: 95,
  basisNote: `${DECLARED_PROCESS} Warm-whipped egg foam near 0.45 g/mL in a 20 cm pan filled 3.5 cm deep.`,
};

export const BAKING_PRESETS: readonly BakingPreset[] = [SOURDOUGH_COUNTRY_LOAF, BRIOCHE_LOAF, BROWN_BUTTER_COOKIE, GENOISE_SPONGE];
