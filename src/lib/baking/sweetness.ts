/**
 * Per-sugar constants: relative sweetness (POD) and the Norrish constant K.
 *
 * Both tables are deliberately INCOMPLETE where the literature pass of
 * 2026-11-15 found no trustworthy number: maltose and galactose have no POD,
 * lactose has no Norrish K. A missing entry is `null`, and the formula
 * telemetry EXCLUDES those grams from the total and names them — it does not
 * count them at sucrose's value or at zero.
 *
 * - POD, sucrose = 100: McMurry, Organic Chemistry (OpenStax) relative
 *   sweetness table (lactose 0.16, glucose 0.75, fructose 1.75); allulose 0.70
 *   per FDA's 2019 guidance as reported. Sweetness is sensory and
 *   concentration-dependent — these are single representative points.
 * - Norrish K (natural-log form, a_w = X_w·exp(−K·X_s²)): Chirife et al.
 *   (1980) via Ergun et al. (2010) Table 5 — sucrose 6.47, glucose 2.25,
 *   maltose 4.54. Fructose, galactose and allulose are hexose isomers of
 *   glucose and take its K by ANALOGY (DECLARED); Zuorro (2021) fitted
 *   fructose at 2.351 on another data basis, within 4.5 %.
 *
 * @file src/lib/baking/sweetness.ts
 */
import type { SugarSpecies } from "./chemistry";
import type { Basis } from "./types";

export interface SugarConstant {
  value: number | null;
  basis: Basis;
}

export const SUGAR_POD: Record<SugarSpecies, SugarConstant> = {
  sucrose: { value: 100, basis: { kind: "COMPUTED", source: "OPENSTAX_SWEETNESS", note: "the reference: 100 by definition" } },
  glucose: { value: 75, basis: { kind: "MEASURED", source: "OPENSTAX_SWEETNESS" } },
  fructose: { value: 175, basis: { kind: "MEASURED", source: "OPENSTAX_SWEETNESS", note: "reported 1.15–1.80 across tables; strongly concentration- and temperature-dependent" } },
  lactose: { value: 16, basis: { kind: "MEASURED", source: "OPENSTAX_SWEETNESS" } },
  maltose: { value: null, basis: { kind: "ABSENT", source: "MODEL", note: "no consistent single value found (leads span 0.30–0.50)" } },
  galactose: { value: null, basis: { kind: "ABSENT", source: "MODEL", note: "no corroborated value found" } },
  allulose: { value: 70, basis: { kind: "MEASURED", source: "FDA_ALLULOSE_2019" } },
};

export const NORRISH_K: Record<SugarSpecies, SugarConstant> = {
  sucrose: { value: 6.47, basis: { kind: "MEASURED", source: "CHIRIFE_1980" } },
  glucose: { value: 2.25, basis: { kind: "MEASURED", source: "CHIRIFE_1980" } },
  maltose: { value: 4.54, basis: { kind: "MEASURED", source: "CHIRIFE_1980" } },
  fructose: { value: 2.25, basis: { kind: "DECLARED", source: "ZUORRO_2021", note: "glucose's K by analogy (hexose isomer); Zuorro 2021 fits 2.351 on another basis" } },
  galactose: { value: 2.25, basis: { kind: "DECLARED", source: "CHIRIFE_1980", note: "glucose's K by analogy (hexose isomer)" } },
  allulose: { value: 2.25, basis: { kind: "DECLARED", source: "CHIRIFE_1980", note: "glucose's K by analogy (hexose isomer)" } },
  lactose: { value: null, basis: { kind: "ABSENT", source: "MODEL", note: "no verified K; lactose counts in the mole fraction (Raoult) but adds no Norrish term" } },
};
