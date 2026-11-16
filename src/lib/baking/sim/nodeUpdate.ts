/**
 * After each thermal step: advance setting, release CO₂, expand the gas cells
 * that are still free to grow, and move the Lagrangian faces.
 *
 * A node grows only while it is FLUID. Its growth each step is the increase
 * of its equilibrium gas volume times its unset fraction (1 − s): a half-set
 * crumb takes half the push, and the rest of the gas escapes through cell
 * walls that have started to open. Once a node passes the set threshold its
 * total volume is frozen, and water boiling out of it leaves pores behind
 * instead of shrinking it — which is why a crust is light and insulating.
 *
 * @file src/lib/baking/sim/nodeUpdate.ts
 */
import { SIM } from "./constants";
import { cellVapourPa, dissolvedCo2Mol, gasVolumeM3, ramp } from "./gasCells";
import { facesFromVolumes } from "./grid";
import { nodeThermal, solidsMass } from "./nodeProperties";
import { at } from "./strict";
import { setFraction } from "./structureSet";
import type { NodeState, SimState } from "./simState";
import type { BatterState, TransitionWindow } from "./simTypes";

function windowGain(totalMolPerKg: number, w: TransitionWindow | null, fromC: number, toC: number): number {
  if (w === null || totalMolPerKg <= 0) return 0;
  return totalMolPerKg * (ramp(toC, w.onsetC, w.endC) - ramp(fromC, w.onsetC, w.endC));
}

/** CO₂ the node's gas gains this step, mol per unit. */
function co2Released(n: NodeState, batter: BatterState, previousMaxC: number, state: SimState): number {
  let released = n.mass0Kg * windowGain(batter.heatCo2MolPerKg, batter.heatCo2Window, previousMaxC, n.maxC);
  released += n.mass0Kg * windowGain(batter.sodaCo2MolPerKg, batter.sodaWindow, previousMaxC, n.maxC);
  if (n.dissolvedCo2Mol > 0) {
    const holds = n.waterKg > 0 && n.tempC < state.boilingC;
    const pCo2 = state.pressurePa - cellVapourPa(n.tempC, state.pressurePa);
    const capacity = holds ? dissolvedCo2Mol(n.waterKg, n.tempC, pCo2) : 0;
    if (capacity < n.dissolvedCo2Mol) {
      released += n.dissolvedCo2Mol - capacity;
      n.dissolvedCo2Mol = capacity;
    }
  }
  return released;
}

function matrixVolume(n: NodeState): number {
  const density = nodeThermal(n.waterKg, n.solids, n.tempC, 0).matrixDensityKgM3;
  return (n.waterKg + solidsMass(n.solids)) / density;
}

/** Updates one node; returns its increase in equilibrium gas volume, m³ per unit. */
function updateNode(n: NodeState, batter: BatterState, state: SimState, previousMaxC: number): number {
  n.dryGasMol += co2Released(n, batter, previousMaxC, state);
  const matrixM3 = matrixVolume(n);
  const wetAndBelowBoil = n.waterKg > 0 && n.tempC < state.boilingC;
  const equilibrium = wetAndBelowBoil ? gasVolumeM3(n.dryGasMol, n.tempC, state.pressurePa) : n.gasEquilibriumM3;
  const growth = Math.max(equilibrium - n.gasEquilibriumM3, 0);
  n.gasEquilibriumM3 = equilibrium;
  if (n.set) {
    n.matrixM3 = matrixM3;
    return growth;
  }
  const s = setFraction(n.maxC, batter.setComponents);
  let gasM3 = n.volumeM3 - n.matrixM3 + (1 - s) * batter.gasRetention * growth;
  const maxGas = (SIM.maxPorosity.value / (1 - SIM.maxPorosity.value)) * matrixM3;
  if (gasM3 > maxGas) {
    gasM3 = maxGas;
    if (s < SIM.structureSetFraction.value) n.ventedUnset = true;
  }
  n.matrixM3 = matrixM3;
  n.volumeM3 = matrixM3 + gasM3;
  if (s >= SIM.structureSetFraction.value) n.set = true;
  return growth;
}

/** Advance every node and move the faces; returns the bulk equilibrium gas growth, m³ per unit. */
export function updateNodes(state: SimState, batter: BatterState, previousMaxC: readonly number[]): number {
  let growth = 0;
  state.nodes.forEach((n, i) => {
    n.maxC = Math.max(n.maxC, n.tempC);
    growth += updateNode(n, batter, state, at(previousMaxC, i));
  });
  state.faces = facesFromVolumes(
    state.m,
    state.nodes.map((n) => n.volumeM3),
  );
  return growth;
}
