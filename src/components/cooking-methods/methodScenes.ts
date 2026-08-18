/**
 * What each cooking method's heat flow LOOKS like.
 *
 * The simulation in `crates/thermo-core` decides how the medium moves. This
 * file decides what the viewer sees around it: the vessel, where the energy
 * enters, which way it travels, and what it does to the food.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-17]` The canvas used to draw ONE scene — a dry oven
 * chamber with a top radiant rod, buoyant tracers and a seared slab — for all
 * 26 methods. Three scalars varied and none of them could change what the
 * picture asserted, so the panel showed:
 *
 *   * a glowing element over `boiling`, `steaming` and `pressure_cooking`, none
 *     of which have one, and no water anywhere in any of them;
 *   * a hot amber chamber for `cryo_cooking` at −196 °C;
 *   * identical radiant rays for `grilling` (radiation 0.70) and `roasting`
 *     (0.40), and the same rays again for `sous_vide` (0.00);
 *   * a seared-crust gradient on the food for all 26 — including the 18 whose
 *     `surfaceCanBrown` is `false`, where the panel's own text one scroll below
 *     says the surface pins at the boiling point and never browns.
 *
 * That last one is the reason this is not merely a decoration task. A picture
 * that asserts browning next to prose that denies it is the same defect class
 * as a wrong number: the surface claims something the data does not support.
 * {@link foodPalette} is where that is fixed, and it is gated on the method's
 * own `surfaceCanBrown` rather than on how hot the scene looks.
 *
 * ── Division of labour ──────────────────────────────────────────────────────
 *
 * Nothing here computes physics. Every quantity it draws from — the regime, the
 * medium temperature, `h`, the radiant source, whether the surface can brown —
 * arrives already derived from `METHOD_PHYSICS`. This file may choose colours
 * and shapes; it may not choose facts.
 *
 * @file src/components/cooking-methods/methodScenes.ts
 */

import type { MethodPhysicsMetrics } from "@/lib/cooking/methodMetrics";
import { HeatRegime } from "@/lib/wasm/thermoEngine";

/**
 * Maillard onset, °C.
 *
 * BASIS: the same ~140 °C threshold `methodMetrics.ts` uses to decide whether
 * to tell the user browning is available at all. Read from the same number so
 * the picture and the sentence cannot disagree.
 */
const MAILLARD_ONSET_C = 140;

/** Where the radiant source sits relative to the food. */
export type RadiantGeometry = "above" | "below" | "surrounding";

/** Everything the renderer needs that is not per-frame particle state. */
export interface SceneInputs {
  regime: HeatRegime;
  /** Temperature of the medium doing the work, °C. */
  mediumC: number;
  /** Surface coefficient, or null where the method has none. */
  hWm2K: number | null;
  radiantSourceK: number | null;
  radiantGeometry: RadiantGeometry;
  /** Gate on browning. NOT inferred from temperature — read from the method. */
  surfaceCanBrown: boolean;
  /** Which way water moves, for the mass-flux annotations. */
  moistureFlux: "into-food" | "out-of-food" | "neutral" | "held";
  /** True for `pressurised-steam`, which gets a sealed vessel. */
  sealed: boolean;
}

/** Pull the scene inputs out of the metrics the panel already holds. */
export function sceneInputs(metrics: MethodPhysicsMetrics, regime: HeatRegime): SceneInputs {
  const p = metrics.physics;
  return {
    regime,
    mediumC: metrics.medium.celsius,
    hWm2K: metrics.transfer?.typical ?? null,
    radiantSourceK: p.radiantSourceK ?? null,
    radiantGeometry: p.radiantGeometry ?? "surrounding",
    surfaceCanBrown: p.surfaceCanBrown,
    moistureFlux: p.moistureFlux,
    sealed: p.mediumKind === "pressurised-steam",
  };
}

/** The palette and copy for one regime's scene. */
export interface SceneTheme {
  /** What the picture is of. Shown as the panel heading. */
  title: string;
  /** Where the heat comes from and where it goes. One line, shown beneath. */
  flow: string;
  /** Chamber background, top → bottom. */
  bg: readonly [string, string, string];
  /** Vessel outline. */
  vessel: string;
  /** The energy source, wherever the scene puts it. */
  source: string;
  /** Convection tracer at its hottest and at its coldest. */
  tracerHot: string;
  tracerCold: string;
  /** Phase-change tracers: bubbles, droplets, vapour. */
  phase: string;
  /** Fill medium, or null for a gas-filled chamber. */
  fill: string | null;
  /** Fraction of the canvas height the fill surface sits at, from the top. */
  fillTopFrac: number;
  /** Fraction of the canvas height the food's centre sits at. */
  foodYFrac: number;
}

/**
 * One theme per regime.
 *
 * Colour carries meaning here and is not free decoration: the palette tracks
 * what the medium IS. Water regimes are blue, fat is amber, radiant sources run
 * to white-hot, a cryogen is pale blue-white, and the diffusion scene has no
 * heat colour anywhere because it has no heat.
 */
export const SCENE_THEMES: Readonly<Record<HeatRegime, SceneTheme>> = {
  [HeatRegime.BuoyantAir]: {
    title: "Oven chamber · buoyant air",
    flow: "Walls and element heat the air; the air rises past the food and carries heat into it.",
    bg: ["#1e130c", "#0d0a08", "#18100a"],
    vessel: "rgba(245, 158, 11, 0.35)",
    source: "#f59e0b",
    tracerHot: "#fb923c",
    tracerCold: "#3b82f6",
    phase: "#fed7aa",
    fill: null,
    fillTopFrac: 0,
    foodYFrac: 0.62,
  },
  [HeatRegime.Oil]: {
    title: "Fry pan · hot fat",
    flow: "The burner heats the pan, the pan heats the oil, and the food's own moisture boils out through it.",
    bg: ["#1a1206", "#0c0904", "#150f05"],
    vessel: "rgba(203, 213, 225, 0.45)",
    source: "#38bdf8",
    tracerHot: "#fbbf24",
    tracerCold: "#a16207",
    phase: "rgba(254, 243, 199, 0.85)",
    fill: "rgba(217, 160, 43, 0.30)",
    fillTopFrac: 0.42,
    foodYFrac: 0.64,
  },
  [HeatRegime.RollingBoil]: {
    title: "Open pot · rolling water",
    flow: "The burner boils the floor of the pot; vapour rises through the column and stirs it.",
    bg: ["#04121c", "#03080f", "#04101a"],
    vessel: "rgba(203, 213, 225, 0.45)",
    source: "#38bdf8",
    tracerHot: "#7dd3fc",
    tracerCold: "#1d4ed8",
    phase: "rgba(224, 242, 254, 0.9)",
    fill: "rgba(37, 99, 235, 0.26)",
    fillTopFrac: 0.34,
    foodYFrac: 0.66,
  },
  [HeatRegime.CondensingSteam]: {
    title: "Covered vessel · condensing steam",
    flow: "Steam gives up its latent heat ON the food surface and runs back down as water.",
    bg: ["#0b1418", "#050b0e", "#0a1216"],
    vessel: "rgba(203, 213, 225, 0.5)",
    source: "#38bdf8",
    tracerHot: "#e0f2fe",
    tracerCold: "#38bdf8",
    phase: "rgba(240, 249, 255, 0.95)",
    fill: "rgba(56, 189, 248, 0.14)",
    fillTopFrac: 0.2,
    foodYFrac: 0.56,
  },
  [HeatRegime.StillLiquid]: {
    title: "Held bath · still water",
    flow: "A regulated bath holds one temperature; heat crosses the boundary and nothing boils.",
    bg: ["#071320", "#040a12", "#06111c"],
    vessel: "rgba(148, 163, 184, 0.45)",
    source: "#22d3ee",
    tracerHot: "#67e8f9",
    tracerCold: "#0e7490",
    phase: "rgba(186, 230, 253, 0.7)",
    fill: "rgba(14, 165, 233, 0.20)",
    fillTopFrac: 0.2,
    foodYFrac: 0.6,
  },
  [HeatRegime.Radiant]: {
    title: "Radiant fire · line of sight",
    flow: "Photons cross the gap in straight lines. The lit face cooks; the far face waits.",
    bg: ["#1c0a04", "#0c0503", "#180803"],
    vessel: "rgba(248, 113, 113, 0.3)",
    source: "#fbbf24",
    tracerHot: "#fca5a5",
    tracerCold: "#7c2d12",
    phase: "#fde68a",
    fill: null,
    fillTopFrac: 0,
    foodYFrac: 0.5,
  },
  [HeatRegime.SolidContact]: {
    title: "Hot solid · contact conduction",
    flow: "Heat crosses one interface and marches into the food as a conduction front.",
    bg: ["#14100c", "#080605", "#100c09"],
    vessel: "rgba(148, 163, 184, 0.5)",
    source: "#f97316",
    tracerHot: "#fdba74",
    tracerCold: "#57534e",
    phase: "rgba(255, 237, 213, 0.8)",
    fill: null,
    fillTopFrac: 0,
    foodYFrac: 0.55,
  },
  [HeatRegime.Cryogenic]: {
    title: "Cryogen · heat leaving the food",
    flow: "The flow runs backwards: the food gives up heat, and the cold dense vapour sinks.",
    bg: ["#0a1626", "#050a14", "#0d1a2c"],
    vessel: "rgba(186, 230, 253, 0.5)",
    source: "#bae6fd",
    tracerHot: "#e0f2fe",
    tracerCold: "#0ea5e9",
    phase: "rgba(255, 255, 255, 0.9)",
    fill: "rgba(125, 211, 252, 0.12)",
    fillTopFrac: 0.62,
    foodYFrac: 0.45,
  },
  [HeatRegime.Diffusion]: {
    title: "No heat flow · solute crossing a boundary",
    flow: "Nothing here is heat-limited. What moves is dissolved matter, across the food's surface.",
    bg: ["#131426", "#080911", "#101120"],
    vessel: "rgba(165, 180, 252, 0.4)",
    source: "#a5b4fc",
    tracerHot: "#c7d2fe",
    tracerCold: "#4f46e5",
    phase: "rgba(199, 210, 254, 0.7)",
    fill: "rgba(99, 102, 241, 0.14)",
    fillTopFrac: 0.24,
    foodYFrac: 0.6,
  },
  [HeatRegime.Distillation]: {
    title: "Still · evaporate, travel, condense",
    flow: "Vapour leaves the boiler, crosses to a cold surface, and comes back as liquid.",
    bg: ["#0d1418", "#06090b", "#0b1115"],
    vessel: "rgba(203, 213, 225, 0.5)",
    source: "#38bdf8",
    tracerHot: "#a5f3fc",
    tracerCold: "#0891b2",
    phase: "rgba(236, 254, 255, 0.9)",
    fill: "rgba(6, 182, 212, 0.18)",
    fillTopFrac: 0.66,
    foodYFrac: 0.8,
  },
};

/** Crust and core colours for the food, and whether a crust is legitimate. */
export interface FoodPalette {
  /** Outer surface. */
  crust: string;
  /** Mid-depth. */
  mid: string;
  /** Centre, which lags the surface in every transient solution. */
  core: string;
  /** True only where the method can actually brown. Drives the crust ring. */
  browned: boolean;
  /** What the surface is doing, for the caption. */
  surfaceNote: string;
}

/**
 * How the food should be coloured, from the method's own physics.
 *
 * ⚠️ THE honesty fix this file was written for. The previous renderer painted
 * one hardcoded gradient — `#e11d48` core through `#b91c1c` to a `#d97706`
 * "140 °C crust (seared brown)" — on every method in the corpus. Eighteen of
 * the twenty-six declare `surfaceCanBrown: false`, and for those the panel's
 * own prose reads "the surface stays wet and pins at the boiling point, so it
 * never reaches the ~140 °C Maillard threshold". The picture was asserting a
 * sear the data explicitly denies.
 *
 * Browning is gated on `surfaceCanBrown` FIRST and temperature second. A method
 * cannot brown its way past its own physics just because its medium is hot: at
 * 117 °C `pressure_cooking` is well above boiling and still cannot brown,
 * because the surface is wet.
 */
export function foodPalette(inputs: SceneInputs): FoodPalette {
  const { mediumC, surfaceCanBrown } = inputs;

  // Below freezing the surface is not cooking at all — it is frosting over.
  if (mediumC < 0) {
    return {
      crust: "#f8fafc",
      mid: "#cbd5e1",
      core: "#e11d48",
      browned: false,
      surfaceNote: "Surface frosting — heat is leaving, not arriving",
    };
  }

  // No heat flow: the food is at room temperature and stays there.
  if (inputs.hWm2K === null) {
    return {
      crust: "#be6a7a",
      mid: "#c2536a",
      core: "#e11d48",
      browned: false,
      surfaceNote: "Surface unchanged — this method applies no heat",
    };
  }

  if (surfaceCanBrown && mediumC >= MAILLARD_ONSET_C) {
    return {
      crust: "#b45309",
      mid: "#9a3412",
      core: "#e11d48",
      browned: true,
      surfaceNote: `Surface past ${MAILLARD_ONSET_C} °C — Maillard browning available`,
    };
  }

  if (surfaceCanBrown) {
    return {
      crust: "#a8703f",
      mid: "#a13c2f",
      core: "#e11d48",
      browned: false,
      surfaceNote: `Surface below ${MAILLARD_ONSET_C} °C — no browning yet`,
    };
  }

  // Wet surface, pinned at the boiling point. Pale and grey, never brown.
  return {
    crust: "#d8c3b4",
    mid: "#bf8686",
    core: "#e11d48",
    browned: false,
    surfaceNote: "Surface wet and pinned near boiling — browning unreachable",
  };
}

/**
 * Which direction the net heat flux points, as a unit vector in canvas space
 * (y grows downward), plus a label.
 *
 * `Cryogenic` is the case worth having a function for: its flux points OUT of
 * the food, and every arrow in the scene must run the other way.
 */
export function heatFlux(inputs: SceneInputs): { dx: number; dy: number; label: string } | null {
  switch (inputs.regime) {
    case HeatRegime.Diffusion:
      return null;
    case HeatRegime.Cryogenic:
      return { dx: 0, dy: -1, label: "Heat leaving the food" };
    case HeatRegime.CondensingSteam:
      return { dx: 0, dy: 1, label: "Latent heat onto the surface" };
    case HeatRegime.SolidContact:
      return { dx: 0, dy: -1, label: "Conduction up from the contact face" };
    case HeatRegime.Radiant:
      return inputs.radiantGeometry === "above"
        ? { dx: 0, dy: 1, label: "Radiant flux from above" }
        : { dx: 0, dy: -1, label: "Radiant flux from below" };
    case HeatRegime.RollingBoil:
    case HeatRegime.Oil:
    case HeatRegime.StillLiquid:
    case HeatRegime.Distillation:
    case HeatRegime.BuoyantAir:
      return { dx: 0, dy: -1, label: "Heat into the food" };
  }
}
