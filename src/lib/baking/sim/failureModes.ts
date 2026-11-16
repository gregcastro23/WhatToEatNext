/**
 * Failure-mode physics: the rules that turn a simulated bake into a warning.
 *
 * Every rule is stated in the warning itself (`rule`), with the measured
 * times and the threshold it compared them to, so a reader can check it
 * against the curves. The thresholds are DECLARED model choices (constants.ts).
 *
 * @file src/lib/baking/sim/failureModes.ts
 */
import { browningExtent } from "./browning";
import { SIM } from "./constants";
import type { EventTimes } from "./simEvents";
import type { FailureWarning, SimFrame, SimInput } from "./simTypes";

export interface FailureContext {
  /** Structure-to-tenderiser mass ratio from the formula telemetry, when known. */
  structureToTenderizer: number | null;
}

export interface BakeEvidence {
  frames: readonly SimFrame[];
  events: EventTimes;
  /** Mass share of the batter whose cells vented while still fluid. */
  ventedUnsetShare: number;
}

const COLLAPSE_RATIO = 0.5;

function fmt(minutes: number | null): string {
  return minutes === null ? "never" : `${minutes.toFixed(1)} min`;
}

function collapse(e: BakeEvidence, ctx: FailureContext): FailureWarning | null {
  const peak = e.events["peak-gas"];
  const set = e.events["structure-set"];
  if (peak === null || (set !== null && peak >= set)) return null;
  const vented = e.ventedUnsetShare >= SIM.collapseVentShare.value;
  const weak = ctx.structureToTenderizer !== null && ctx.structureToTenderizer < COLLAPSE_RATIO;
  if (!vented && !weak) return null;
  return {
    id: "collapse",
    severity: vented ? "critical" : "warn",
    title: "Structural collapse risk",
    detail: `Gas expansion peaked at ${fmt(peak)}, before the core set (${fmt(set)}).${vented ? ` ${(e.ventedUnsetShare * 100).toFixed(0)} % of the batter ruptured its cells while still fluid.` : ""}${weak ? ` Structure-to-tenderiser ratio is ${ctx.structureToTenderizer?.toFixed(2) ?? "?"}.` : ""}`,
    rule: `peak gas before set AND (vented-unset share ≥ ${SIM.collapseVentShare.value} OR structure:tenderiser < ${COLLAPSE_RATIO})`,
  };
}

function scorch(e: BakeEvidence): FailureWarning | null {
  const burnt = e.frames.find((f) => browningExtent(f.browningDose) >= SIM.scorchExtent.value);
  if (burnt === undefined) return null;
  const gel = e.events.gelatinized;
  if (gel !== null && burnt.tMin >= gel) return null;
  return {
    id: "scorch",
    severity: "critical",
    title: "Crust scorches before the core sets",
    detail: `The crust reached ${(SIM.scorchExtent.value * 100).toFixed(0)} % browning at ${fmt(burnt.tMin)}; the core's starch finished gelatinizing ${gel === null ? "never" : `at ${fmt(gel)}`}.`,
    rule: `browning extent ≥ ${SIM.scorchExtent.value} before core gelatinization completes`,
  };
}

function rawCore(e: BakeEvidence, doneC: number): FailureWarning | null {
  if (e.events.done !== null) return null;
  const last = e.frames[e.frames.length - 1];
  return {
    id: "raw-core",
    severity: "critical",
    title: "Core never reaches done",
    detail: `The core peaked at ${last === undefined ? "?" : last.coreC.toFixed(1)} °C against a ${doneC.toFixed(1)} °C target within the bake time.`,
    rule: `core < ${doneC.toFixed(1)} °C at the end of the bake`,
  };
}

function gummy(e: BakeEvidence, input: SimInput): FailureWarning | null {
  const starch = input.batter.setComponents.filter((c) => c.kind === "starch").reduce((sum, c) => sum + c.massFraction, 0);
  if (!(starch > 0) || e.events.gelatinized !== null) return null;
  if (input.batter.fractions.water / starch < SIM.gummyWaterToStarch.value) return null;
  return {
    id: "gummy",
    severity: "warn",
    title: "Gummy crumb",
    detail: "Starch at the core never completed gelatinization, so it stays wet and pasty instead of setting into crumb.",
    rule: `core starch window not completed, with at least ${SIM.gummyWaterToStarch.value} g water per g starch`,
  };
}

function dense(e: BakeEvidence): FailureWarning | null {
  const last = e.frames[e.frames.length - 1];
  if (last === undefined) return null;
  const core = Math.min(...last.profile.porosity);
  if (core >= SIM.denseFinalPorosity.value || last.volumeRatio >= 1.1) return null;
  return {
    id: "dense",
    severity: "info",
    title: "Dense crumb",
    detail: `Volume rose only ${((last.volumeRatio - 1) * 100).toFixed(0)} % and the tightest crumb is ${(core * 100).toFixed(0)} % gas.`,
    rule: `final porosity < ${SIM.denseFinalPorosity.value} and rise < 10 %`,
  };
}

function dry(e: BakeEvidence): FailureWarning | null {
  const last = e.frames[e.frames.length - 1];
  if (last === undefined || last.moistureLossPct <= SIM.dryLossPct.value) return null;
  return {
    id: "dry",
    severity: "warn",
    title: "Over-dried",
    detail: `The bake lost ${last.moistureLossPct.toFixed(1)} % of its mass to evaporation.`,
    rule: `bake loss > ${SIM.dryLossPct.value} %`,
  };
}

export function detectFailures(e: BakeEvidence, input: SimInput, doneC: number, ctx: FailureContext): FailureWarning[] {
  const found = [collapse(e, ctx), scorch(e), rawCore(e, doneC), gummy(e, input), dense(e), dry(e)];
  return found.filter((w): w is FailureWarning => w !== null);
}
