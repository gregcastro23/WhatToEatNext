/**
 * Baking Lab state: one reducer for the editable inputs, and every reading
 * DERIVED from them on render — telemetry, the prepared batter, the bake,
 * the elemental projection. Nothing derived is stored, so nothing on screen
 * can disagree with the formula it describes.
 *
 * Every engine call goes through `reading()`: a RangeError (an input outside
 * a kernel's envelope) becomes a stated reason, never a fallback number.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/_lab/useBakingLab.ts
 */
import { useDeferredValue, useMemo, useReducer, type Dispatch } from "react";
import { BAKING_PRESETS } from "@/data/baking/presets";
import { elementalReading, type ElementalReading } from "@/lib/baking/elemental";
import type { BakeProcess, BakingPreset, Formula, FormulaTelemetry, OvenSettings, ProductGeometry, Reading } from "@/lib/baking/formulaTypes";
import { scaleToLimit, setLineGrams } from "@/lib/baking/scaling";
import { prepareBatter, type PreparedBatter } from "@/lib/baking/sim/batter";
import { browningExtent } from "@/lib/baking/sim/browning";
import type { SimResult } from "@/lib/baking/sim/simTypes";
import { simulateBake } from "@/lib/baking/sim/simulate";
import type { TempUnit } from "./format";

export interface LabState {
  presetId: string;
  formula: Formula;
  process: BakeProcess;
  geometry: ProductGeometry;
  oven: OvenSettings;
  doneCoreC: number;
  /** The line held fixed by the limiting-ingredient scaler. */
  limitLine: number | null;
  scrubMin: number;
  unit: TempUnit;
}

export type LabAction =
  | { type: "preset"; id: string }
  | { type: "grams"; line: number; grams: number }
  | { type: "ingredient"; line: number; id: string }
  | { type: "add"; id: string }
  | { type: "remove"; line: number }
  | { type: "lock"; line: number | null }
  | { type: "scale-to"; line: number; grams: number }
  | { type: "formula"; formula: Formula }
  | { type: "oven"; patch: Partial<OvenSettings> }
  | { type: "process"; patch: Partial<BakeProcess> }
  | { type: "geometry"; patch: Partial<ProductGeometry> }
  | { type: "done"; celsius: number }
  | { type: "scrub"; minutes: number }
  | { type: "unit"; unit: TempUnit };

function fromPreset(p: BakingPreset): LabState {
  return { presetId: p.id, formula: p.formula, process: p.process, geometry: p.geometry, oven: p.oven, doneCoreC: p.doneCoreC, limitLine: null, scrubMin: p.oven.bakeMinutes, unit: "C" };
}

export function presetById(id: string): BakingPreset {
  const found = BAKING_PRESETS.find((p) => p.id === id);
  if (found === undefined) throw new RangeError(`unknown preset "${id}"`);
  return found;
}

export function initialLabState(presetId: string = BAKING_PRESETS[0]?.id ?? ""): LabState {
  return fromPreset(presetById(presetId));
}

function withLines(state: LabState, lines: Formula["lines"]): LabState {
  return { ...state, formula: { ...state.formula, lines } };
}

function editFormula(state: LabState, action: LabAction): LabState | null {
  switch (action.type) {
    case "grams":
      return { ...state, formula: setLineGrams(state.formula, action.line, action.grams) };
    case "ingredient":
      return withLines(state, state.formula.lines.map((l, i) => (i === action.line ? { ...l, ingredientId: action.id } : l)));
    case "add":
      return withLines(state, [...state.formula.lines, { ingredientId: action.id, grams: 0 }]);
    case "remove":
      return { ...withLines(state, state.formula.lines.filter((_, i) => i !== action.line)), limitLine: null };
    case "scale-to":
      return { ...state, formula: scaleToLimit(state.formula, action.line, action.grams).formula };
    case "formula":
      return { ...state, formula: action.formula };
    default:
      return null;
  }
}

function editSetting(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "preset":
      return { ...fromPreset(presetById(action.id)), unit: state.unit };
    case "lock":
      return { ...state, limitLine: action.line };
    case "oven":
      return { ...state, oven: { ...state.oven, ...action.patch } };
    case "process":
      return { ...state, process: { ...state.process, ...action.patch } };
    case "geometry":
      return { ...state, geometry: { ...state.geometry, ...action.patch } };
    case "done":
      return { ...state, doneCoreC: action.celsius };
    case "scrub":
      return { ...state, scrubMin: action.minutes };
    case "unit":
      return { ...state, unit: action.unit };
    default:
      return state;
  }
}

export function labReducer(state: LabState, action: LabAction): LabState {
  try {
    return editFormula(state, action) ?? editSetting(state, action);
  } catch (error) {
    if (error instanceof RangeError) return state;
    throw error;
  }
}

export function reading<T>(compute: () => T): Reading<T> {
  try {
    return { available: true, value: compute() };
  } catch (error) {
    if (error instanceof RangeError) return { available: false, reason: error.message };
    throw error;
  }
}

export interface LabDerived {
  telemetry: Reading<FormulaTelemetry>;
  prepared: Reading<PreparedBatter>;
  sim: Reading<SimResult>;
  elements: ElementalReading | null;
}

function elementsOf(prepared: Reading<PreparedBatter>, sim: Reading<SimResult>, density: number): ElementalReading | null {
  if (!prepared.available) return null;
  const last = sim.available ? sim.value.frames[sim.value.frames.length - 1] : undefined;
  const outcome = last === undefined ? null : { browningExtent: browningExtent(last.browningDose), volumeRatio: last.volumeRatio };
  return elementalReading(prepared.value.telemetry, prepared.value.batter.gasFraction0, density, outcome);
}

/** Only these inputs change a bake — scrubbing and the unit toggle must not re-run it. */
export type BakeInputs = Pick<LabState, "formula" | "process" | "geometry" | "oven" | "doneCoreC">;

export function deriveLab(state: BakeInputs): LabDerived {
  const prepared = reading(() => prepareBatter(state.formula, state.process));
  const sim: Reading<SimResult> = prepared.available
    ? reading(() =>
        simulateBake(
          { batter: prepared.value.batter, geometry: state.geometry, oven: state.oven, ambient: { kitchenC: 20, kitchenRhPct: 50 }, doneCoreC: state.doneCoreC },
          { structureToTenderizer: prepared.value.telemetry.structure.ratio },
        ),
      )
    : { available: false, reason: prepared.reason };
  const telemetry: Reading<FormulaTelemetry> = prepared.available ? { available: true, value: prepared.value.telemetry } : { available: false, reason: prepared.reason };
  return { telemetry, prepared, sim, elements: elementsOf(prepared, sim, state.process.densityGPerMl) };
}

export interface BakingLab {
  state: LabState;
  dispatch: Dispatch<LabAction>;
  derived: LabDerived;
  /** True while a newer input is still being simulated. */
  stale: boolean;
}

export function useBakingLab(): BakingLab {
  const [state, dispatch] = useReducer(labReducer, undefined, () => initialLabState());
  const deferred = useDeferredValue(state);
  const { formula, process, geometry, oven, doneCoreC } = deferred;
  const derived = useMemo(() => deriveLab({ formula, process, geometry, oven, doneCoreC }), [formula, process, geometry, oven, doneCoreC]);
  return { state, dispatch, derived, stale: deferred.formula !== state.formula || deferred.oven !== state.oven };
}
