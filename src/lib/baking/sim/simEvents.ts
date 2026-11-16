/**
 * Reading a bake: frames for the scrubber, first-crossing events, and the
 * brief's five thermal zones.
 *
 * The zones are DISPLAY BANDS from the product brief (30–50, 55–65, 60–85,
 * the plateau, 140–180 °C), not physics: the physics runs on each
 * ingredient's own measured windows (see structureSet.ts). The plateau band is
 * the five kelvin below the LOCAL boiling point, so at altitude it moves down
 * with the boil instead of claiming a 95–100 °C the core can never reach.
 *
 * @file src/lib/baking/sim/simEvents.ts
 */
import { SIM } from "./constants";
import { normalisedCentres, widths } from "./grid";
import { solidsMass } from "./nodeProperties";
import { exposedFaces, isWet, type FaceRuntime } from "./simStep";
import { at, item } from "./strict";
import { kindComplete, setFraction } from "./structureSet";
import type { SimState } from "./simState";
import type { SimEventId, SimFrame, SimInput, ZoneSpan } from "./simTypes";

export const EVENT_LABELS: Record<SimEventId, string> = {
  "fat-melted": "Fat phase fully melted (core)",
  "yeast-dead": "Yeast killed (core)",
  "peak-gas": "Peak gas expansion rate",
  gelatinized: "Starch gelatinization complete (core)",
  coagulated: "Protein coagulation complete (core)",
  "structure-set": "Crumb structure set (core)",
  plateau: "Core reaches the evaporative plateau",
  "crust-dry": "Crust surface dries",
  "browning-onset": "Maillard browning begins",
  "caramel-onset": "Sucrose caramelisation begins",
  done: "Core reaches done temperature",
};

export const EVENT_IDS: readonly SimEventId[] = [
  "fat-melted",
  "yeast-dead",
  "peak-gas",
  "gelatinized",
  "coagulated",
  "structure-set",
  "plateau",
  "crust-dry",
  "browning-onset",
  "caramel-onset",
  "done",
];

export type EventTimes = Record<SimEventId, number | null>;

export function emptyEventTimes(): EventTimes {
  return {
    "fat-melted": null,
    "yeast-dead": null,
    "peak-gas": null,
    gelatinized: null,
    coagulated: null,
    "structure-set": null,
    plateau: null,
    "crust-dry": null,
    "browning-onset": null,
    "caramel-onset": null,
    done: null,
  };
}

/** The thermal centre: the bottom-to-top coldest node of a slab, the centre of a round product. */
export function coreIndex(state: SimState): number {
  if (state.m !== 0) return 0;
  let coldest = 0;
  state.nodes.forEach((n, i) => {
    if (n.tempC < item(state.nodes, coldest).tempC) coldest = i;
  });
  return coldest;
}

function eventConditions(state: SimState, input: SimInput, doneC: number): Record<SimEventId, boolean> {
  const core = item(state.nodes, coreIndex(state));
  const { batter } = input;
  const crustNode = item(exposedFaces(state, input), 0).node;
  return {
    "fat-melted": batter.fatMeltC !== null && core.tempC >= batter.fatMeltC,
    "yeast-dead": batter.fermented && core.tempC >= SIM.yeastDeathC.value,
    "peak-gas": false,
    gelatinized: kindComplete(core.maxC, batter.setComponents, "starch"),
    coagulated: kindComplete(core.maxC, batter.setComponents, "protein"),
    "structure-set": setFraction(core.maxC, batter.setComponents) >= SIM.structureSetFraction.value,
    plateau: core.tempC >= state.boilingC - 1,
    "crust-dry": !isWet(state, crustNode),
    "browning-onset": state.browningDose > 0,
    "caramel-onset": state.caramelMinutes > 0,
    done: core.tempC >= doneC,
  };
}

export function observeEvents(times: EventTimes, state: SimState, input: SimInput, doneC: number): void {
  const now = state.tS / 60;
  const conditions = eventConditions(state, input, doneC);
  for (const id of EVENT_IDS) {
    if (times[id] === null && conditions[id]) times[id] = now;
  }
  times["peak-gas"] = state.peakGasS === null ? null : state.peakGasS / 60;
}

function crustMm(state: SimState, input: SimInput): number {
  const w = widths(state.faces);
  const outer = item(exposedFaces(state, input), 0).node;
  const step = outer === 0 ? 1 : -1;
  let total = 0;
  for (let i = outer; i >= 0 && i < state.nodes.length && !isWet(state, i); i += step) total += at(w, i);
  return total * 1000;
}

function plateReading(state: SimState, runtime: readonly FaceRuntime[]): number | null {
  if (state.plate !== null) return state.plate.tempC;
  return state.m === 0 && runtime.length > 1 ? item(runtime, 1).surfaceC : null;
}

export function buildFrame(state: SimState, input: SimInput, runtime: readonly FaceRuntime[]): SimFrame {
  const core = item(state.nodes, coreIndex(state));
  let volume = 0;
  let volume0 = 0;
  let mass = 0;
  let mass0 = 0;
  for (const n of state.nodes) {
    volume += n.volumeM3;
    volume0 += n.volume0M3;
    mass += n.waterKg + solidsMass(n.solids);
    mass0 += n.mass0Kg;
  }
  return {
    tMin: state.tS / 60,
    coreC: core.tempC,
    surfaceC: item(runtime, 0).surfaceC,
    plateC: plateReading(state, runtime),
    volumeRatio: volume / volume0,
    moistureLossPct: ((mass0 - mass) / mass0) * 100,
    browningDose: state.browningDose,
    caramelMinutes: state.caramelMinutes,
    coreSet: setFraction(core.maxC, input.batter.setComponents),
    crustMm: crustMm(state, input),
    profile: {
      position: normalisedCentres(state.faces),
      tempC: state.nodes.map((n) => n.tempC),
      porosity: state.nodes.map((n) => Math.max(1 - n.matrixM3 / n.volumeM3, 0)),
      moistureRatio: state.nodes.map((n) => (n.water0Kg > 0 ? n.waterKg / n.water0Kg : 0)),
    },
  };
}

interface ZoneBand {
  zone: ZoneSpan["zone"];
  label: string;
  lowC: number;
  highC: number;
  reads: "coreC" | "surfaceC";
}

function zoneBands(boilingC: number): ZoneBand[] {
  return [
    { zone: 1, label: "Lipid melting & gas expansion", lowC: 30, highC: 50, reads: "coreC" },
    { zone: 2, label: "Yeast death & enzyme peak", lowC: 55, highC: 65, reads: "coreC" },
    { zone: 3, label: "Foam-to-sponge set", lowC: 60, highC: 85, reads: "coreC" },
    { zone: 4, label: "Evaporative plateau", lowC: boilingC - 5, highC: boilingC, reads: "coreC" },
    { zone: 5, label: "Crust surface kinetics", lowC: 140, highC: 180, reads: "surfaceC" },
  ];
}

export function zoneSpans(frames: readonly SimFrame[], boilingC: number): ZoneSpan[] {
  return zoneBands(boilingC).map((band) => {
    const entered = frames.find((f) => f[band.reads] >= band.lowC);
    const exited = entered === undefined ? undefined : frames.find((f) => f.tMin > entered.tMin && f[band.reads] > band.highC + 0.01);
    return {
      zone: band.zone,
      label: band.label,
      startMin: entered === undefined ? null : entered.tMin,
      endMin: exited === undefined ? null : exited.tMin,
    };
  });
}
