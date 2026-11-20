/**
 * Canonical culinary sauce presets for the Real Physics Sauce Lab bench.
 *
 * Each preset bridges physical bench parameters (water, fat, starch, protein,
 * solutes, temperature, droplet radius, pan geometry) with its Alchm pairing
 * lineage ID (`catalogueSauceId`) and optional `/sauces?focus=` key.
 *
 * @file src/lib/sauces/physics/presets.ts
 */

export type SauceMechanism =
  | "roux-starch"
  | "warm-emulsion"
  | "cold-emulsion"
  | "tomato-reduction"
  | "stock-reduction"
  | "sugar-reduction"
  | "coconut-emulsion"
  | "seed-spice-suspension";

export type ThickenerKind =
  | "none"
  | "wheat-roux"
  | "cornstarch"
  | "egg-yolk"
  | "gelatin-pectin"
  | "nut-seed-solids";

export interface SauceBenchPreset {
  id: string;
  name: string;
  cuisine: string;
  mechanism: SauceMechanism;
  thickener: ThickenerKind;
  summary: string;
  waterG: number;
  fatG: number;
  starchG: number;
  proteinG: number;
  solutesG: number;
  insolubleG: number;
  baselinePh: number;
  nominalTempC: number;
  dropletRadiusUm: number;
  panDiameterCm: number;
  burnerWatts: number;
  targetReductionPct: number;
  catalogueSauceId: string;
  focusKey?: string;
}

export const DEFAULT_SAUCE_PRESET_ID = "bechamel";

export const SAUCE_BENCH_PRESETS: readonly SauceBenchPreset[] = [
  {
    id: "bechamel",
    name: "Béchamel",
    cuisine: "French",
    mechanism: "roux-starch",
    thickener: "wheat-roux",
    summary: "Milk-hydrated white roux (butter fat + wheat starch swollen past 64 °C).",
    waterG: 425,
    fatG: 58,
    starchG: 24,
    proteinG: 17,
    solutesG: 28,
    insolubleG: 4,
    baselinePh: 6.6,
    nominalTempC: 86,
    dropletRadiusUm: 18,
    panDiameterCm: 20,
    burnerWatts: 550,
    targetReductionPct: 12,
    catalogueSauceId: "french:mother:bechamel",
    focusKey: "bechamel",
  },
  {
    id: "hollandaise",
    name: "Hollandaise",
    cuisine: "French",
    mechanism: "warm-emulsion",
    thickener: "egg-yolk",
    summary: "High-fat warm O/W emulsion stabilised by yolk lecithin above butter's melt point.",
    waterG: 105,
    fatG: 165,
    starchG: 0,
    proteinG: 10.5,
    solutesG: 6,
    insolubleG: 1,
    baselinePh: 4.1,
    nominalTempC: 62,
    dropletRadiusUm: 14,
    panDiameterCm: 18,
    burnerWatts: 250,
    targetReductionPct: 0,
    catalogueSauceId: "french:mother:hollandaise",
    focusKey: "hollandaise",
  },
  {
    id: "marinara",
    name: "Marinara",
    cuisine: "Italian",
    mechanism: "tomato-reduction",
    thickener: "gelatin-pectin",
    summary: "Simmered plum tomato cellular pulp suspended with dispersed extra-virgin olive oil.",
    waterG: 460,
    fatG: 28,
    starchG: 2,
    proteinG: 8,
    solutesG: 32,
    insolubleG: 16,
    baselinePh: 4.3,
    nominalTempC: 94,
    dropletRadiusUm: 24,
    panDiameterCm: 24,
    burnerWatts: 700,
    targetReductionPct: 28,
    catalogueSauceId: "italian:mother:marinarabase",
    focusKey: "marinara",
  },
  {
    id: "espagnole",
    name: "Espagnole",
    cuisine: "French",
    mechanism: "stock-reduction",
    thickener: "wheat-roux",
    summary: "Browned roux + roasted veal stock collagen matrix reduced into rich body.",
    waterG: 520,
    fatG: 42,
    starchG: 20,
    proteinG: 26,
    solutesG: 18,
    insolubleG: 8,
    baselinePh: 5.4,
    nominalTempC: 92,
    dropletRadiusUm: 18,
    panDiameterCm: 24,
    burnerWatts: 650,
    targetReductionPct: 35,
    catalogueSauceId: "french:mother:espagnole",
    focusKey: "espagnole",
  },
  {
    id: "veloute",
    name: "Velouté",
    cuisine: "French",
    mechanism: "roux-starch",
    thickener: "wheat-roux",
    summary: "Blond roux dispersed in gelatin-rich white stock for silk-gloss coating viscosity.",
    waterG: 480,
    fatG: 40,
    starchG: 22,
    proteinG: 20,
    solutesG: 12,
    insolubleG: 4,
    baselinePh: 6.1,
    nominalTempC: 88,
    dropletRadiusUm: 16,
    panDiameterCm: 22,
    burnerWatts: 550,
    targetReductionPct: 18,
    catalogueSauceId: "french:mother:veloute",
    focusKey: "veloute",
  },
  {
    id: "pesto",
    name: "Pesto alla Genovese",
    cuisine: "Italian",
    mechanism: "cold-emulsion",
    thickener: "nut-seed-solids",
    summary: "Oil-dominant herb & pine-nut lipid suspension bound with trace Parmigiano moisture.",
    waterG: 46,
    fatG: 118,
    starchG: 1,
    proteinG: 22,
    solutesG: 8,
    insolubleG: 18,
    baselinePh: 5.8,
    nominalTempC: 22,
    dropletRadiusUm: 22,
    panDiameterCm: 16,
    burnerWatts: 150,
    targetReductionPct: 0,
    catalogueSauceId: "italian:traditional:pesto",
    focusKey: "pesto",
  },
  {
    id: "teriyaki",
    name: "Teriyaki Glaze",
    cuisine: "Japanese",
    mechanism: "sugar-reduction",
    thickener: "none",
    summary: "Fat-free soy, mirin, and sucrose solution concentrated via open boiling for sheen.",
    waterG: 210,
    fatG: 0,
    starchG: 0,
    proteinG: 12,
    solutesG: 115,
    insolubleG: 0,
    baselinePh: 4.8,
    nominalTempC: 100,
    dropletRadiusUm: 15,
    panDiameterCm: 20,
    burnerWatts: 800,
    targetReductionPct: 42,
    catalogueSauceId: "japanese:traditional:teriyaki",
    focusKey: "teriyaki",
  },
  {
    id: "thai-green-curry",
    name: "Thai Green Curry",
    cuisine: "Thai",
    mechanism: "coconut-emulsion",
    thickener: "none",
    summary: "Coconut-cream lauric oil emulsion gently simmered without shattering interfacial proteins.",
    waterG: 310,
    fatG: 72,
    starchG: 2,
    proteinG: 9,
    solutesG: 22,
    insolubleG: 18,
    baselinePh: 5.9,
    nominalTempC: 88,
    dropletRadiusUm: 14,
    panDiameterCm: 24,
    burnerWatts: 650,
    targetReductionPct: 15,
    catalogueSauceId: "thai:traditional:thaigreencurry",
    focusKey: "thaiGreenCurry",
  },
  {
    id: "mole",
    name: "Oaxacan Mole",
    cuisine: "Mexican",
    mechanism: "seed-spice-suspension",
    thickener: "nut-seed-solids",
    summary: "Multi-solids suspension of toasted sesame, pepitas, cocoa butter, and chile polysaccharides.",
    waterG: 380,
    fatG: 54,
    starchG: 18,
    proteinG: 16,
    solutesG: 36,
    insolubleG: 32,
    baselinePh: 5.1,
    nominalTempC: 89,
    dropletRadiusUm: 19,
    panDiameterCm: 26,
    burnerWatts: 600,
    targetReductionPct: 22,
    catalogueSauceId: "mexican:mother:mole",
    focusKey: "mole",
  },
  {
    id: "goma-dare",
    name: "Goma Dare",
    cuisine: "Japanese",
    mechanism: "seed-spice-suspension",
    thickener: "nut-seed-solids",
    summary: "Toasted white-sesame paste sheared with rice vinegar and dashi-soy aqueous dispersion.",
    waterG: 135,
    fatG: 48,
    starchG: 3,
    proteinG: 18,
    solutesG: 26,
    insolubleG: 16,
    baselinePh: 4.9,
    nominalTempC: 24,
    dropletRadiusUm: 11,
    panDiameterCm: 16,
    burnerWatts: 150,
    targetReductionPct: 0,
    catalogueSauceId: "japanese:traditional:gomadare",
    focusKey: "gomaDare",
  },
];

function foldPresetKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

export function getSaucePreset(id: string | null | undefined): SauceBenchPreset {
  const [fallback] = SAUCE_BENCH_PRESETS;
  if (!fallback) {
    throw new Error("SAUCE_BENCH_PRESETS cannot be empty");
  }
  const trimmed = id?.trim();
  if (!trimmed) return fallback;
  const wanted = foldPresetKey(trimmed);
  const match = SAUCE_BENCH_PRESETS.find((p) => {
    if (foldPresetKey(p.id) === wanted) return true;
    if (p.focusKey && foldPresetKey(p.focusKey) === wanted) return true;
    if (foldPresetKey(p.catalogueSauceId) === wanted) return true;
    return foldPresetKey(p.name) === wanted;
  });
  return match ?? fallback;
}

export function findSaucePresetId(nameOrKey: string): string | undefined {
  const wanted = foldPresetKey(nameOrKey);
  return SAUCE_BENCH_PRESETS.find(
    (p) =>
      foldPresetKey(p.id) === wanted ||
      foldPresetKey(p.name) === wanted ||
      (p.focusKey !== undefined && foldPresetKey(p.focusKey) === wanted),
  )?.id;
}
