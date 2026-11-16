/**
 * The thermal half of a counter-balance patch: the oven setting that bakes
 * the NEW formula to the same outcome as the original.
 *
 * "Same outcome" is two numbers the simulator already produces: the core
 * reaches its done temperature, and at that moment the crust is as brown as
 * the original's was. Browning at done rises with oven temperature (a hotter
 * oven browns the crust faster than it heats the core), so the setting that
 * matches it is found by bisection over the oven temperature, re-running the
 * real simulator each time. The bake time then keeps the original's margin
 * past done. No coefficient is fitted here: the patch is exactly as good as
 * the simulator, and inherits every stated limitation of it.
 *
 * @file src/lib/baking/thermalPatch.ts
 */
import { cToF } from "@/lib/cooking/thermo";
import { prepareBatter } from "./sim/batter";
import { browningExtent } from "./sim/browning";
import { simulateBake } from "./sim/simulate";
import type { BakeProcess, Formula, OvenSettings, ProductGeometry, Reading } from "./formulaTypes";
import type { AmbientKitchen } from "./sim/simTypes";

export interface BakeSetup {
  formula: Formula;
  process: BakeProcess;
  geometry: ProductGeometry;
  oven: OvenSettings;
  doneCoreC: number;
}

export interface ThermalPatch {
  ovenC: number;
  deltaC: number;
  /** The same change in Fahrenheit degrees (a difference, not a temperature). */
  deltaF: number;
  bakeMinutes: number;
  deltaMinutes: number;
  referenceDoneMin: number;
  referenceBrowning: number;
  achievedDoneMin: number;
  achievedBrowning: number;
  changed: boolean;
  reason: string;
}

interface Outcome {
  doneMin: number | null;
  /** Crust browning `marginMin` after done — when the baker takes it out. */
  browningAtDone: number | null;
}

const MATCH_TOLERANCE = 0.03;
const BISECTION_STEPS = 10;

function outcome(setup: BakeSetup, ovenC: number, bakeMinutes: number, ambient: AmbientKitchen, marginMin: number): Outcome {
  const prepared = prepareBatter(setup.formula, setup.process);
  const result = simulateBake(
    // The DEFAULT grid, deliberately: a coarser one moves done times by minutes (see the convergence test).
    { batter: prepared.batter, geometry: setup.geometry, oven: { ...setup.oven, ovenC, bakeMinutes }, ambient, doneCoreC: setup.doneCoreC },
    { structureToTenderizer: prepared.telemetry.structure.ratio },
  );
  const { doneMin } = result;
  if (doneMin === null) return { doneMin: null, browningAtDone: null };
  const atDone = result.frames.find((f) => f.tMin >= doneMin + marginMin) ?? result.frames[result.frames.length - 1];
  return { doneMin, browningAtDone: atDone === undefined ? null : browningExtent(atDone.browningDose) };
}

interface Match {
  ovenC: number;
  result: Outcome;
}

function bisectOven(candidate: BakeSetup, target: number, minutes: number, ambient: AmbientKitchen, marginMin: number): Match | null {
  const reference = candidate.oven.ovenC;
  let lo = Math.max(120, reference - 60);
  let hi = Math.min(300, reference + 40);
  let best: Match | null = null;
  for (let i = 0; i < BISECTION_STEPS; i += 1) {
    const mid = (lo + hi) / 2;
    const result = outcome(candidate, mid, minutes, ambient, marginMin);
    if (result.browningAtDone === null) {
      lo = mid;
      continue;
    }
    best = { ovenC: mid, result };
    if (result.browningAtDone > target) hi = mid;
    else lo = mid;
  }
  return best;
}

function describe(p: Omit<ThermalPatch, "reason">, unchanged: boolean): string {
  if (unchanged) return `The new formula browns like the original at this setting; only the bake time moves (${p.deltaMinutes >= 0 ? "+" : ""}${p.deltaMinutes.toFixed(1)} min) because its core reaches done at ${p.achievedDoneMin.toFixed(1)} min.`;
  const direction = p.deltaC < 0 ? "browns faster" : "browns more slowly";
  return `The new formula ${direction}: at the original setting its crust would not match the core. ${p.deltaC < 0 ? "Lowering" : "Raising"} the oven ${Math.abs(p.deltaC).toFixed(0)} °C (${Math.abs(p.deltaF).toFixed(0)} °F) brings the crust to the original's colour (${p.referenceBrowning.toFixed(2)}) by the end of the bake, with the core done at ${p.achievedDoneMin.toFixed(1)} min.`;
}

interface ReferenceOutcome {
  doneMin: number;
  browning: number;
}

function patchFrom(reference: BakeSetup, ref: ReferenceOutcome, ovenC: number, got: Outcome, unchanged: boolean): ThermalPatch {
  const margin = reference.oven.bakeMinutes - ref.doneMin;
  const doneMin = got.doneMin ?? ref.doneMin;
  const bakeMinutes = Math.round((doneMin + margin) * 2) / 2;
  const deltaC = Math.round(ovenC - reference.oven.ovenC);
  const base = {
    ovenC: reference.oven.ovenC + deltaC,
    deltaC,
    deltaF: cToF(deltaC) - cToF(0),
    bakeMinutes,
    deltaMinutes: bakeMinutes - reference.oven.bakeMinutes,
    referenceDoneMin: ref.doneMin,
    referenceBrowning: ref.browning,
    achievedDoneMin: doneMin,
    achievedBrowning: got.browningAtDone ?? ref.browning,
    changed: deltaC !== 0 || bakeMinutes !== reference.oven.bakeMinutes,
  };
  return { ...base, reason: describe(base, unchanged) };
}

/** The oven setting and bake time that give `candidate` the reference's outcome. */
export function thermalPatch(reference: BakeSetup, candidate: BakeSetup, ambient: AmbientKitchen): Reading<ThermalPatch> {
  try {
    const probe = outcome(reference, reference.oven.ovenC, reference.oven.bakeMinutes, ambient, 0);
    if (probe.doneMin === null) {
      return { available: false, reason: "the original formula never reaches its done temperature at its own setting, so there is no outcome to match" };
    }
    const margin = Math.max(reference.oven.bakeMinutes - probe.doneMin, 0);
    const ref = outcome(reference, reference.oven.ovenC, reference.oven.bakeMinutes, ambient, margin);
    const target = { doneMin: probe.doneMin, browning: ref.browningAtDone ?? 0 };
    const minutes = Math.min(reference.oven.bakeMinutes * 2, 240);
    const asIs = outcome(candidate, reference.oven.ovenC, minutes, ambient, margin);
    if (asIs.browningAtDone !== null && Math.abs(asIs.browningAtDone - target.browning) <= MATCH_TOLERANCE) {
      return { available: true, value: patchFrom(reference, target, reference.oven.ovenC, asIs, true) };
    }
    const match = bisectOven({ ...candidate, oven: { ...candidate.oven, ovenC: reference.oven.ovenC } }, target.browning, minutes, ambient, margin);
    if (match === null) return { available: false, reason: "no oven setting between −60 and +40 °C of the original brings the new formula to done" };
    return { available: true, value: patchFrom(reference, target, match.ovenC, match.result, false) };
  } catch (error) {
    if (error instanceof RangeError) return { available: false, reason: error.message };
    throw error;
  }
}
