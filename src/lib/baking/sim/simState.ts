/**
 * Simulator state and its construction from a batter at the oven door.
 *
 * @file src/lib/baking/sim/simState.ts
 */
import { getCookware } from "@/data/cooking/cookwareMaterials";
import { foodProperties } from "@/lib/cooking/choiOkos";
import { saturationCeilingAtElevation } from "@/lib/cooking/thermo";
import { pressureFromElevation } from "@/lib/environment/isa";
import { cellVapourPa, dissolvedCo2Mol, dryGasMol } from "./gasCells";
import { faceArea, geometryExponent, uniformFaces, volumesFromFaces, type GeometryExponent } from "./grid";
import { solidsMass, type NodeSolids } from "./nodeProperties";
import type { BatterState, SimInput, SimNumerics } from "./simTypes";

export const DEFAULT_NUMERICS: SimNumerics = { nodes: 24, dtS: 2, frameEveryS: 15 };

export interface NodeState {
  /** Water, kg per unit. */
  waterKg: number;
  water0Kg: number;
  solids: NodeSolids;
  /** Total volume (matrix + gas), m³ per unit. */
  volumeM3: number;
  volume0M3: number;
  /** Gas-free matrix volume, m³ per unit — recomputed from mass and density. */
  matrixM3: number;
  /** Non-condensable gas (air + CO₂), mol per unit. */
  dryGasMol: number;
  /** CO₂ still dissolved in the water, mol per unit (fermented doughs). */
  dissolvedCo2Mol: number;
  /** Equilibrium gas volume at the last step, m³ — expansion follows its increments. */
  gasEquilibriumM3: number;
  tempC: number;
  /** Hottest temperature reached: setting transitions are irreversible. */
  maxC: number;
  /** Mass at the oven door, kg per unit. */
  mass0Kg: number;
  /** True once the structure has set and the volume is frozen. */
  set: boolean;
  /** True if the node's cells ruptured while it was still fluid. */
  ventedUnset: boolean;
}

export interface PlateState {
  tempC: number;
  /** Contact area with the product, per unit. */
  areaM2: number;
  capacitanceJK: number;
  /** Half-thickness conduction resistance, m²·K·W⁻¹. */
  halfResistance: number;
  /** True for a preheated stone conducting from the oven floor. */
  deck: boolean;
  kWmK: number;
  thicknessM: number;
}

export interface SimState {
  m: GeometryExponent;
  nodes: NodeState[];
  faces: number[];
  plate: PlateState | null;
  pressurePa: number;
  boilingC: number;
  tS: number;
  /** Air-side surface temperature from the last step, °C. */
  surfaceC: number;
  /** Lagged latent flux at the exposed face, W·m⁻² (negative on condensation). */
  latentWm2: number;
  browningDose: number;
  caramelMinutes: number;
  /** Bulk rate of equilibrium gas growth, m³·s⁻¹ per unit, and when it peaked. */
  peakGasRate: number;
  peakGasS: number | null;
  limitations: Set<string>;
}

function nodeSolids(batter: BatterState, massKg: number): NodeSolids {
  const f = batter.fractions;
  return {
    protein: massKg * f.protein,
    fat: massKg * f.fat,
    carbohydrate: massKg * f.carbohydrate,
    fibre: massKg * (f.fibre ?? 0),
    ash: massKg * f.ash,
  };
}

function initialNode(batter: BatterState, volumeM3: number, matrixDensity: number, pressurePa: number): NodeState {
  const gasM3 = batter.gasFraction0 * volumeM3;
  const matrixM3 = volumeM3 - gasM3;
  const massKg = matrixM3 * matrixDensity;
  const waterKg = massKg * batter.fractions.water;
  const pCo2 = pressurePa - cellVapourPa(batter.startC, pressurePa);
  const solids = nodeSolids(batter, massKg);
  return {
    waterKg,
    water0Kg: waterKg,
    solids,
    volumeM3,
    volume0M3: volumeM3,
    matrixM3,
    dryGasMol: dryGasMol(gasM3, batter.startC, pressurePa),
    dissolvedCo2Mol: batter.fermented ? dissolvedCo2Mol(waterKg, batter.startC, pCo2) : 0,
    gasEquilibriumM3: gasM3,
    tempC: batter.startC,
    maxC: batter.startC,
    mass0Kg: waterKg + solidsMass(solids),
    set: false,
    ventedUnset: false,
  };
}

function initialPlate(input: SimInput, m: GeometryExponent, outerFace: number): PlateState | null {
  const { oven, geometry } = input;
  if (oven.plate === null) return null;
  const material = getCookware(oven.plate.materialId);
  if (material === null) throw new RangeError(`unknown plate material "${oven.plate.materialId}"`);
  const thicknessM = oven.plate.thicknessMm / 1000;
  const areaM2 = m === 0 ? 1 : geometry.contactFraction * faceArea(m, outerFace);
  if (!(areaM2 > 0)) return null;
  const deck = oven.mode === "deck";
  return {
    tempC: deck ? oven.ovenC : input.batter.startC,
    areaM2,
    capacitanceJK: material.rhoKgM3 * material.cJkgK * thicknessM * areaM2,
    halfResistance: thicknessM / 2 / material.kWmK,
    deck,
    kWmK: material.kWmK,
    thicknessM,
  };
}

export function initialState(input: SimInput, numerics: SimNumerics): SimState {
  const { batter, geometry, oven } = input;
  const m = geometryExponent(geometry.shape);
  const faces = uniformFaces(geometry.dimensionM, numerics.nodes);
  const pressurePa = pressureFromElevation(oven.elevationM) * 1000;
  const matrix = foodProperties(batter.fractions, batter.startC, 0);
  const nodes = volumesFromFaces(m, faces).map((v) => initialNode(batter, v, matrix.densityKgM3, pressurePa));
  return {
    m,
    nodes,
    faces,
    plate: initialPlate(input, m, geometry.dimensionM),
    pressurePa,
    boilingC: saturationCeilingAtElevation(oven.elevationM).celsius,
    tS: 0,
    surfaceC: batter.startC,
    latentWm2: 0,
    browningDose: 0,
    caramelMinutes: 0,
    peakGasRate: 0,
    peakGasS: null,
    limitations: new Set<string>(),
  };
}
