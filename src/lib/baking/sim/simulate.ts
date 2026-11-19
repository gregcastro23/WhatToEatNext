/**
 * The bake, end to end: a 1D coupled heat, moisture and gas-cell simulation
 * of a batter or dough in an oven.
 *
 * Per step (default 2 s): implicit conduction through the product and its pan
 * or stone; convection, radiation and evaporation (or steam condensation) at
 * every exposed face; an evaporation front wherever a wet layer reaches the
 * local boil; then setting, CO₂ release and gas-cell expansion in every layer,
 * and the Lagrangian grid moves with the rise.
 *
 * It THROWS (RangeError) on inputs outside its envelope — callers that render
 * go through `simulateReading`, which converts a refusal into a stated reason.
 *
 * @file src/lib/baking/sim/simulate.ts
 */
import { browningRate, CARAMEL_ONSET_C, reactantFactor } from "./browning";
import { detectFailures, type FailureContext } from "./failureModes";
import { updateNodes } from "./nodeUpdate";
import { buildFrame, emptyEventTimes, EVENT_IDS, EVENT_LABELS, observeEvents, zoneSpans, type EventTimes } from "./simEvents";
import { DEFAULT_NUMERICS, initialState, type SimState } from "./simState";
import { exposedFaces, isWet, thermalStep, type FaceRuntime } from "./simStep";
import { item } from "./strict";
import type { SimFrame, SimInput, SimNumerics, SimResult } from "./simTypes";
import type { Reading } from "../formulaTypes";

function requireRange(label: string, value: number, low: number, high: number): void {
  if (!(Number.isFinite(value) && value >= low && value <= high)) {
    throw new RangeError(`${label} must be within ${low}–${high}, received ${value}`);
  }
}

function validate(input: SimInput, numerics: SimNumerics): void {
  const { geometry, oven, batter } = input;
  requireRange("product dimension (m)", geometry.dimensionM, 0.002, 0.5);
  requireRange("span (m)", geometry.spanM, 0.01, 2);
  requireRange("contact fraction", geometry.contactFraction, 0, 1);
  requireRange("oven temperature (°C)", oven.ovenC, 100, 320);
  if (oven.stage2OvenC !== undefined && oven.stage2OvenC !== null) {
    requireRange("stage-2 oven temperature (°C)", oven.stage2OvenC, 100, 320);
  }
  requireRange("bake time (min)", oven.bakeMinutes, 1, 240);
  requireRange("steam vapour fraction", oven.steamFraction, 0, 0.9);
  requireRange("fan speed (m/s)", oven.fanMs, 0, 15);
  requireRange("batter temperature (°C)", batter.startC, 1, 60);
  requireRange("starting gas fraction", batter.gasFraction0, 0, 0.85);
  requireRange("control volumes", numerics.nodes, 6, 80);
  requireRange("time step (s)", numerics.dtS, 0.1, 10);
}

function advanceBrowning(state: SimState, input: SimInput, runtime: readonly FaceRuntime[], dtS: number): void {
  const crust = item(exposedFaces(state, input), 0).node;
  if (isWet(state, crust)) return;
  const { surfaceC } = item(runtime, 0);
  state.browningDose += browningRate(surfaceC, reactantFactor(input.batter.reducingSugarDryFraction)) * (dtS / 60);
  if (surfaceC >= CARAMEL_ONSET_C && input.batter.sucroseDryFraction > 0) state.caramelMinutes += dtS / 60;
}

function ventedShare(state: SimState): number {
  let vented = 0;
  let total = 0;
  for (const n of state.nodes) {
    total += n.mass0Kg;
    if (n.ventedUnset) vented += n.mass0Kg;
  }
  return total > 0 ? vented / total : 0;
}

interface RunOutput {
  state: SimState;
  frames: SimFrame[];
  events: EventTimes;
}

function stepInputAt(input: SimInput, tS: number): SimInput {
  const { stage2OvenC, stage1Minutes, steamMinutes, bakeMinutes } = input.oven;
  if (stage2OvenC === undefined || stage2OvenC === null) return input;
  const splitMin = stage1Minutes !== undefined && stage1Minutes !== null && stage1Minutes > 0
    ? stage1Minutes
    : steamMinutes > 0
      ? steamMinutes
      : bakeMinutes / 2;
  return tS / 60 < splitMin ? input : { ...input, oven: { ...input.oven, ovenC: stage2OvenC } };
}

function run(input: SimInput, numerics: SimNumerics, doneC: number): RunOutput {
  const state = initialState(input, numerics);
  const runtime: FaceRuntime[] = exposedFaces(state, input).map(() => ({ surfaceC: input.batter.startC, latentWm2: 0 }));
  const events = emptyEventTimes();
  const frames: SimFrame[] = [buildFrame(state, input, runtime)];
  const steps = Math.round((input.oven.bakeMinutes * 60) / numerics.dtS);
  const framesEvery = Math.max(Math.round(numerics.frameEveryS / numerics.dtS), 1);
  for (let step = 1; step <= steps; step += 1) {
    const previousMaxC = state.nodes.map((n) => n.maxC);
    const activeInput = stepInputAt(input, state.tS);
    thermalStep(state, activeInput, runtime, numerics.dtS);
    const growth = updateNodes(state, input.batter, previousMaxC);
    state.tS += numerics.dtS;
    if (growth / numerics.dtS > state.peakGasRate) {
      state.peakGasRate = growth / numerics.dtS;
      state.peakGasS = state.tS;
    }
    advanceBrowning(state, activeInput, runtime, numerics.dtS);
    observeEvents(events, state, activeInput, doneC);
    if (step % framesEvery === 0 || step === steps) frames.push(buildFrame(state, activeInput, runtime));
  }
  return { state, frames, events };
}

const STANDING_LIMITATIONS: readonly string[] = [
  "One dimension: heat enters through the top and bottom of a slab, or radially for a loaf or boule — corners and sides are not resolved.",
  "Vapour leaves the product as soon as it forms; the evaporation–condensation 'heat pipe' that speeds heating inside real crumb is not modelled.",
  "Radiation uses the kernel's generic effective emissivity (0.85): no measured dough or crust emissivity was found.",
  "Yeast makes no new CO₂ in the oven; oven spring comes from gas expansion, dissolved CO₂ and water vapour.",
  "Crust rigidity does not cap the rise, so steam's main benefit — an extensible crust that lets a loaf rise longer — is not modelled; steam here only condenses, heats the surface and slows its evaporation.",
  "A round product has one outer layer, so heat from the pan or stone is shared by the whole crust rather than concentrated in the bottom.",
];

export function simulateBake(input: SimInput, context: FailureContext = { structureToTenderizer: null }): SimResult {
  const numerics: SimNumerics = { ...DEFAULT_NUMERICS, ...input.numerics };
  validate(input, numerics);
  const probe = initialState(input, numerics);
  const doneC = Math.min(input.doneCoreC, probe.boilingC - 1);
  const { state, frames, events } = run(input, numerics, doneC);
  const limitations = [...STANDING_LIMITATIONS, ...state.limitations];
  if (doneC < input.doneCoreC) limitations.push(`Done target capped at ${doneC.toFixed(1)} °C, just under the local boiling point.`);
  const evidence = { frames, events, ventedUnsetShare: ventedShare(state) };
  return {
    frames,
    events: EVENT_IDS.map((id) => ({ id, label: EVENT_LABELS[id], tMin: events[id] })),
    zones: zoneSpans(frames, state.boilingC),
    warnings: detectFailures(evidence, input, doneC, context),
    boilingC: state.boilingC,
    pressureKpa: state.pressurePa / 1000,
    doneMin: events.done,
    doneCoreC: doneC,
    limitations,
  };
}

/** {@link simulateBake} with a refusal turned into a stated reason instead of a throw. */
export function simulateReading(input: SimInput, context?: FailureContext): Reading<SimResult> {
  try {
    return { available: true, value: simulateBake(input, context) };
  } catch (error) {
    if (error instanceof RangeError) return { available: false, reason: error.message };
    throw error;
  }
}
