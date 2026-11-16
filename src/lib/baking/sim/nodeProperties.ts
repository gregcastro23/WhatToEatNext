/**
 * Thermophysical properties of one control volume of batter, dough or crumb.
 *
 * The MATRIX (everything but the gas cells) comes from Choi & Okos (1986)
 * via `foodProperties`, at zero porosity — that function applies porosity to
 * density only, so passing the crumb's porosity there would leave the
 * conductivity of a solid block while dividing the density, and overstate the
 * diffusivity of an aerated crumb several-fold.
 *
 * The gas phase is added here instead, with the Maxwell–Eucken relation for a
 * continuous matrix holding dispersed cells:
 *
 *   k = k_m · (2k_m + k_g − 2ε(k_m − k_g)) / (2k_m + k_g + ε(k_m − k_g))
 *
 * the upper of the two Maxwell–Eucken bounds, which is the one a crumb whose
 * cell walls stay continuous follows (Carson et al. 2005, the bounds for
 * isotropic porous materials). The gas is air at the node temperature
 * (Incropera Table A.4, through `airProperties`).
 *
 * ⚠️ Choi–Okos is fitted to −40…148.9 °C and THROWS outside it. A crust passes
 * that ceiling, so properties above it are evaluated AT the ceiling and the
 * result says so (`clamped`) — a stated approximation, not a silent one. By
 * then the node is dry and its properties change slowly.
 *
 * @file src/lib/baking/sim/nodeProperties.ts
 */
import { airProperties } from "@/lib/cooking/boundaryNetwork";
import { CHOI_OKOS_MAX_C, CHOI_OKOS_MIN_C, foodProperties, type MassFractions } from "@/lib/cooking/choiOkos";

/** Solid (non-water) mass of a control volume by component, kg per unit. */
export interface NodeSolids {
  protein: number;
  fat: number;
  carbohydrate: number;
  fibre: number;
  ash: number;
}

export interface NodeThermal {
  /** Effective conductivity of matrix + gas, W·m⁻¹·K⁻¹. */
  kWmK: number;
  /** Mass-based specific heat of the matrix (gas mass is negligible), J·kg⁻¹·K⁻¹. */
  cpJkgK: number;
  /** Density of the gas-free matrix, kg·m⁻³. */
  matrixDensityKgM3: number;
  /** True when the node was hotter than the Choi–Okos fit and was evaluated at its ceiling. */
  clamped: boolean;
}

export function solidsMass(s: NodeSolids): number {
  return s.protein + s.fat + s.carbohydrate + s.fibre + s.ash;
}

/** Wet-basis mass fractions of a node holding `waterKg` and `solids`. */
export function matrixFractions(waterKg: number, solids: NodeSolids): MassFractions {
  const total = waterKg + solidsMass(solids);
  if (!(total > 0)) throw new RangeError("a control volume with no mass has no composition");
  return {
    water: waterKg / total,
    protein: solids.protein / total,
    fat: solids.fat / total,
    carbohydrate: solids.carbohydrate / total,
    fibre: solids.fibre / total,
    ash: solids.ash / total,
  };
}

/** Maxwell–Eucken conductivity of a continuous phase `kMatrix` holding a dispersed phase `kGas` at volume fraction `porosity`. */
export function maxwellEucken(kMatrix: number, kGas: number, porosity: number): number {
  if (!(porosity >= 0 && porosity < 1)) throw new RangeError(`porosity must be in [0, 1), got ${porosity}`);
  const difference = kMatrix - kGas;
  return (kMatrix * (2 * kMatrix + kGas - 2 * porosity * difference)) / (2 * kMatrix + kGas + porosity * difference);
}

export function nodeThermal(waterKg: number, solids: NodeSolids, celsius: number, porosity: number): NodeThermal {
  const evaluatedC = Math.min(Math.max(celsius, CHOI_OKOS_MIN_C), CHOI_OKOS_MAX_C);
  const matrix = foodProperties(matrixFractions(waterKg, solids), evaluatedC, 0);
  const gas = airProperties(celsius);
  return {
    kWmK: maxwellEucken(matrix.conductivityWmK, gas.kWmK, porosity),
    cpJkgK: matrix.specificHeatJkgK,
    matrixDensityKgM3: matrix.densityKgM3,
    clamped: evaluatedC !== celsius,
  };
}
