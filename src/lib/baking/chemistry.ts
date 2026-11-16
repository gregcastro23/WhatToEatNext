/**
 * Baking chemistry from first principles: molar masses, colligative power
 * (PAC) and leavening stoichiometry.
 *
 * Nothing here is a transcribed table. Molar masses are COMPUTED from the
 * IUPAC/CIAAW abridged standard atomic weights, and everything downstream is
 * arithmetic on them — so a reader can re-derive any figure with a pencil, and
 * a test can assert it with `===`.
 *
 * - **PAC** is colligative: freezing-point depression (and the softness and
 *   water-activity depression that go with it) scales with moles of solute,
 *   so per gram it scales as 1/M. Sucrose is 100 by definition, which makes
 *   glucose `100 · 342.297 / 180.156 = 190.00` — the figure ice-cream tables
 *   quote, recovered rather than copied. Electrolytes multiply by their ion
 *   count (van 't Hoff i, ideal): NaCl dissociates into two.
 * - **CO₂** from sodium bicarbonate depends on whether an acid is present:
 *     NaHCO₃ + H⁺ → Na⁺ + H₂O + CO₂        one CO₂ per bicarbonate
 *     2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂        half as much, alkaline residue
 *   The second path is why soda without acid gives a soapy, over-browned,
 *   under-risen bake: half the gas and a carbonate left behind.
 *
 * @file src/lib/baking/chemistry.ts
 */

/** IUPAC/CIAAW abridged standard atomic weights (conventional values), g/mol. */
export const ATOMIC_WEIGHT = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Cl: 35.45,
  K: 39.098,
} satisfies Record<string, number>;

export type Element = keyof typeof ATOMIC_WEIGHT;

/** Summation order is fixed, so every molar mass is the same double on every run. */
const ELEMENT_ORDER: readonly Element[] = ["H", "C", "N", "O", "Na", "Cl", "K"];

/** Molar mass of a formula given as element counts, g/mol. */
export function molarMass(formula: Partial<Record<Element, number>>): number {
  let total = 0;
  for (const element of ELEMENT_ORDER) {
    total += ATOMIC_WEIGHT[element] * (formula[element] ?? 0);
  }
  return total;
}

/** Molar masses, g/mol — COMPUTED from {@link ATOMIC_WEIGHT}. */
export const MOLAR_MASS = {
  water: molarMass({ H: 2, O: 1 }),
  sucrose: molarMass({ C: 12, H: 22, O: 11 }),
  /** Glucose, fructose, galactose and allulose are all C₆H₁₂O₆. */
  hexose: molarMass({ C: 6, H: 12, O: 6 }),
  /** Lactose and maltose (anhydrous, as dissolved) are C₁₂H₂₂O₁₁. */
  disaccharide: molarMass({ C: 12, H: 22, O: 11 }),
  sodiumChloride: molarMass({ Na: 1, Cl: 1 }),
  sodiumBicarbonate: molarMass({ Na: 1, H: 1, C: 1, O: 3 }),
  carbonDioxide: molarMass({ C: 1, O: 2 }),
  /** Potassium bitartrate (cream of tartar), KC₄H₅O₆. */
  potassiumBitartrate: molarMass({ K: 1, C: 4, H: 5, O: 6 }),
  /** Citric acid, C₆H₈O₇ (triprotic). */
  citricAcid: molarMass({ C: 6, H: 8, O: 7 }),
  /** Lactic acid, C₃H₆O₃ (monoprotic). */
  lacticAcid: molarMass({ C: 3, H: 6, O: 3 }),
  ethanol: molarMass({ C: 2, H: 6, O: 1 }),
} satisfies Record<string, number>;

/** Sugar species tracked in a {@link SugarProfile}. */
export type SugarSpecies =
  | "sucrose"
  | "glucose"
  | "fructose"
  | "lactose"
  | "maltose"
  | "galactose"
  | "allulose";

export const SUGAR_SPECIES: readonly SugarSpecies[] = [
  "sucrose",
  "glucose",
  "fructose",
  "lactose",
  "maltose",
  "galactose",
  "allulose",
];

export const SUGAR_MOLAR_MASS: Record<SugarSpecies, number> = {
  sucrose: MOLAR_MASS.sucrose,
  glucose: MOLAR_MASS.hexose,
  fructose: MOLAR_MASS.hexose,
  lactose: MOLAR_MASS.disaccharide,
  maltose: MOLAR_MASS.disaccharide,
  galactose: MOLAR_MASS.hexose,
  allulose: MOLAR_MASS.hexose,
};

/** Reducing sugars carry a free carbonyl and enter the Maillard reaction directly; sucrose does not. */
export const REDUCING: Record<SugarSpecies, boolean> = {
  sucrose: false,
  glucose: true,
  fructose: true,
  lactose: true,
  maltose: true,
  galactose: true,
  allulose: true,
};

/**
 * Colligative power per gram, sucrose = 100: `100 · i · M_sucrose / M`.
 * @param molarMassGMol Solute molar mass.
 * @param ions van 't Hoff factor (1 for sugars, 2 for NaCl), ideal dissociation.
 */
export function pacFromMolarMass(molarMassGMol: number, ions = 1): number {
  return (100 * ions * MOLAR_MASS.sucrose) / molarMassGMol;
}

export const SUGAR_PAC: Record<SugarSpecies, number> = {
  sucrose: pacFromMolarMass(SUGAR_MOLAR_MASS.sucrose),
  glucose: pacFromMolarMass(SUGAR_MOLAR_MASS.glucose),
  fructose: pacFromMolarMass(SUGAR_MOLAR_MASS.fructose),
  lactose: pacFromMolarMass(SUGAR_MOLAR_MASS.lactose),
  maltose: pacFromMolarMass(SUGAR_MOLAR_MASS.maltose),
  galactose: pacFromMolarMass(SUGAR_MOLAR_MASS.galactose),
  allulose: pacFromMolarMass(SUGAR_MOLAR_MASS.allulose),
};

/** NaCl's colligative power per gram, two ions. */
export const NACL_PAC = pacFromMolarMass(MOLAR_MASS.sodiumChloride, 2);

/** mmol of NaHCO₃ per g of pure sodium bicarbonate. */
export const BICARBONATE_MMOL_PER_G = 1000 / MOLAR_MASS.sodiumBicarbonate;

/** g CO₂ per g NaHCO₃ when an acid neutralises it (one CO₂ per bicarbonate). */
export const CO2_PER_G_BICARBONATE_NEUTRALISED = MOLAR_MASS.carbonDioxide / MOLAR_MASS.sodiumBicarbonate;

/** g CO₂ per g NaHCO₃ by thermal decomposition alone (half a CO₂ per bicarbonate). */
export const CO2_PER_G_BICARBONATE_THERMAL = CO2_PER_G_BICARBONATE_NEUTRALISED / 2;

/** mmol of acid protons per g of potassium bitartrate (one acidic proton). */
export const BITARTRATE_ACID_MMOL_PER_G = 1000 / MOLAR_MASS.potassiumBitartrate;

/** mmol of titratable protons per g of citric acid (three). */
export const CITRIC_ACID_MMOL_PER_G = 3000 / MOLAR_MASS.citricAcid;

/** mmol of titratable protons per g of lactic acid (one). */
export const LACTIC_ACID_MMOL_PER_G = 1000 / MOLAR_MASS.lacticAcid;

/** g CO₂ released per mmol of bicarbonate that reacts with acid. */
export const CO2_G_PER_MMOL = MOLAR_MASS.carbonDioxide / 1000;

/** Sodium mg per 100 g → g NaCl per 100 g, assuming every sodium ion came from NaCl. */
export function naclFromSodiumMg(sodiumMgPer100g: number): number {
  return (sodiumMgPer100g / 1000 / ATOMIC_WEIGHT.Na) * MOLAR_MASS.sodiumChloride;
}
