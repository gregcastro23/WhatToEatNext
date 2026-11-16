/**
 * Water activity of a formula's aqueous phase.
 *
 * Non-electrolytes: the multi-solute Norrish equation in Chirife's form,
 *
 *   ln a_w = ln X_w − (Σᵢ √Kᵢ · Xᵢ)²
 *
 * over the sugars actually IN SOLUTION — each species is capped at its own
 * solubility in the free water at 25 °C (Ergun et al. 2010, Table 6), so the
 * undissolved half of a cookie's sugar stays crystalline and depresses
 * nothing. NaCl: ideal two-ion Raoult, combined by Ross's (1975) product rule.
 *
 * Check, pinned in the tests: a saturated sucrose solution (67.4 % w/w at
 * 25 °C) computes to a_w = 0.847 against the measured 0.844.
 *
 * ⚠️ This is the aqueous phase, not the whole crumb: starch and protein bind
 * water by sorption, which this model does not see, so a low-moisture product
 * (a cookie) reads HIGH. It is the right number for comparing formulas and for
 * the sugar-and-salt effect; it is not a shelf-life certificate.
 *
 * @file src/lib/baking/waterActivity.ts
 */
import { MOLAR_MASS, SUGAR_MOLAR_MASS, SUGAR_SPECIES, type SugarSpecies } from "./chemistry";
import { NORRISH_K } from "./sweetness";
import type { Reading, WaterActivityResult } from "./formulaTypes";
import type { SugarProfile } from "./types";

/** Saturated concentration at 25 °C, % w/w of solution (Ergun et al. 2010, Table 6). */
const SATURATED_PCT_25C: Partial<Record<SugarSpecies, number>> = {
  sucrose: 67.4,
  glucose: 51.0,
  fructose: 80.0,
  lactose: 18.7,
};

/** g of solute that dissolves per g of water at saturation — COMPUTED from the % w/w above. */
export function solubilityGPerGWater(species: SugarSpecies): number | null {
  const pct = SATURATED_PCT_25C[species];
  return pct === undefined ? null : pct / (100 - pct);
}

interface Dissolved {
  grams: Record<SugarSpecies, number>;
  undissolvedSucrose: number;
}

function dissolve(freeWaterG: number, sugars: SugarProfile): Dissolved {
  const grams: Record<SugarSpecies, number> = { sucrose: 0, glucose: 0, fructose: 0, lactose: 0, maltose: 0, galactose: 0, allulose: 0 };
  let undissolvedSucrose = 0;
  for (const s of SUGAR_SPECIES) {
    const solubility = solubilityGPerGWater(s);
    const cap = solubility === null ? Number.POSITIVE_INFINITY : solubility * freeWaterG;
    grams[s] = Math.min(sugars[s], cap);
    if (s === "sucrose") undissolvedSucrose = sugars[s] - grams[s];
  }
  return { grams, undissolvedSucrose };
}

function excludedSolutes(sugars: SugarProfile, ethanolG: number): string[] {
  const out: string[] = [];
  if (sugars.unspeciated > 0) out.push(`${sugars.unspeciated.toFixed(1)} g sugar of unknown species`);
  if (ethanolG > 0) out.push(`${ethanolG.toFixed(1)} g ethanol (volatile; not modelled)`);
  for (const s of SUGAR_SPECIES) {
    if (NORRISH_K[s].value === null && sugars[s] > 0) out.push(`${s}: no Norrish K — counted ideally`);
    if (solubilityGPerGWater(s) === null && sugars[s] > 0) out.push(`${s}: solubility unknown — assumed fully dissolved`);
  }
  return out;
}

/**
 * @param freeWaterG Water not bound by fibre, g.
 * @param sugars Grams of each sugar species in the batch.
 * @param naclG Grams of sodium chloride.
 */
export function aqueousWaterActivity(freeWaterG: number, sugars: SugarProfile, naclG: number, ethanolG = 0): Reading<WaterActivityResult> {
  if (!(freeWaterG > 0)) return { available: false, reason: "no free water: there is no aqueous phase to describe" };
  const { grams, undissolvedSucrose } = dissolve(freeWaterG, sugars);
  const waterMol = freeWaterG / MOLAR_MASS.water;
  let soluteMol = 0;
  for (const s of SUGAR_SPECIES) soluteMol += grams[s] / SUGAR_MOLAR_MASS[s];
  const total = waterMol + soluteMol;
  let norrishSum = 0;
  for (const s of SUGAR_SPECIES) {
    const k = NORRISH_K[s].value;
    if (k !== null) norrishSum += Math.sqrt(k) * (grams[s] / SUGAR_MOLAR_MASS[s] / total);
  }
  const lnSugar = Math.log(waterMol / total) - norrishSum * norrishSum;
  const ionMol = (2 * naclG) / MOLAR_MASS.sodiumChloride;
  const lnSalt = Math.log(waterMol / (waterMol + ionMol));
  return {
    available: true,
    value: {
      aw: Math.exp(lnSugar + lnSalt),
      undissolvedSucroseGrams: undissolvedSucrose,
      excluded: excludedSolutes(sugars, ethanolG),
      model: "Norrish multi-solute (Chirife K) for dissolved sugars × ideal two-ion NaCl (Ross product rule); 25 °C solubility caps",
    },
  };
}
