/**
 * Baking simulator — input, frame and result contracts.
 *
 * @file src/lib/baking/sim/simTypes.ts
 */
import type { MassFractions } from "@/lib/cooking/choiOkos";
import type { OvenSettings, ProductGeometry } from "../formulaTypes";

/** A temperature window over which a transition runs from 0 to 1, °C. */
export interface TransitionWindow {
  onsetC: number;
  endC: number;
}

/** One structure-forming component and the window over which it sets. */
export interface SetComponent {
  kind: "starch" | "protein";
  label: string;
  /** Mass fraction of the batter. */
  massFraction: number;
  /** Gelatinization (starch) or coagulation (protein) window, already shifted for dissolved sugar. */
  window: TransitionWindow;
}

/**
 * The batter or dough as the simulator sees it: one homogeneous matrix,
 * per kg of batter. Built from a formula by `batterFromFormula`.
 */
export interface BatterState {
  /** Wet-basis matrix composition (no gas), mass fractions. */
  fractions: MassFractions;
  /** Gas volume fraction at the oven door, 0–1. */
  gasFraction0: number;
  startC: number;
  /** Every starch and protein that turns the fluid foam into a fixed crumb. */
  setComponents: readonly SetComponent[];
  /** How far dissolved sugar delayed starch gelatinization, K. */
  sugarGelShiftK: number;
  /** Clear point of the fat phase, °C. */
  fatMeltC: number | null;
  /** Heat-activated chemical CO₂, mol per kg of batter, released over `heatCo2Window`. */
  heatCo2MolPerKg: number;
  heatCo2Window: TransitionWindow | null;
  /** CO₂ from excess soda decomposing, mol per kg of batter, released over `sodaWindow`. */
  sodaCo2MolPerKg: number;
  sodaWindow: TransitionWindow | null;
  /** Yeast or levain present: gas cells hold CO₂ and the water is CO₂-saturated. */
  fermented: boolean;
  /** Share of each step's gas growth the matrix holds (the rest escapes), 0–1. */
  gasRetention: number;
  /** Reducing sugar and sucrose as fractions of the batter's DRY matter. */
  reducingSugarDryFraction: number;
  sucroseDryFraction: number;
}

export interface AmbientKitchen {
  kitchenC: number;
  kitchenRhPct: number;
}

export interface SimNumerics {
  /** Control volumes across the dimension. */
  nodes: number;
  dtS: number;
  /** A frame is recorded every this many seconds. */
  frameEveryS: number;
}

export interface SimInput {
  batter: BatterState;
  geometry: ProductGeometry;
  oven: OvenSettings;
  ambient: AmbientKitchen;
  doneCoreC: number;
  numerics?: Partial<SimNumerics>;
}

/** A cross-section at one instant, centre (or bottom, for a slab) to surface. */
export interface SimProfile {
  /** Face-centred positions normalised to the current outer dimension, 0–1. */
  position: readonly number[];
  tempC: readonly number[];
  porosity: readonly number[];
  /** Water as a fraction of the node's own starting water, 0–1. */
  moistureRatio: readonly number[];
}

export interface SimFrame {
  tMin: number;
  coreC: number;
  surfaceC: number;
  /** Bottom face of a slab, or the pan/deck for a round product. Null without a plate. */
  plateC: number | null;
  /** Volume over starting volume. */
  volumeRatio: number;
  /** Mass lost to evaporation, % of starting mass. */
  moistureLossPct: number;
  /** Crust browning dose, equivalent minutes at the reference temperature. */
  browningDose: number;
  /** Minutes the surface has spent above sucrose's caramelisation onset. */
  caramelMinutes: number;
  /** Structural set fraction at the core, 0–1. */
  coreSet: number;
  /** Thickness of the dried crust, mm. */
  crustMm: number;
  profile: SimProfile;
}

export type SimEventId =
  | "fat-melted"
  | "yeast-dead"
  | "peak-gas"
  | "gelatinized"
  | "coagulated"
  | "structure-set"
  | "plateau"
  | "crust-dry"
  | "browning-onset"
  | "caramel-onset"
  | "done";

export interface SimEvent {
  id: SimEventId;
  label: string;
  /** Minutes into the bake; null when it never happened in the bake time. */
  tMin: number | null;
}

export interface ZoneSpan {
  zone: 1 | 2 | 3 | 4 | 5;
  label: string;
  startMin: number | null;
  endMin: number | null;
}

export type WarningSeverity = "info" | "warn" | "critical";

export interface FailureWarning {
  id: "collapse" | "scorch" | "raw-core" | "gummy" | "dense" | "dry";
  severity: WarningSeverity;
  title: string;
  detail: string;
  /** The rule that fired, stated so a reader can check it. */
  rule: string;
}

export interface SimResult {
  frames: readonly SimFrame[];
  events: readonly SimEvent[];
  zones: readonly ZoneSpan[];
  warnings: readonly FailureWarning[];
  /** Local boiling point — the evaporative plateau the wet core cannot pass, °C. */
  boilingC: number;
  pressureKpa: number;
  /** Minutes until the core reached the done temperature, or null. */
  doneMin: number | null;
  /** The done target actually used (capped below the local boiling point). */
  doneCoreC: number;
  /** Statements about where the model is out of its depth, for display. */
  limitations: readonly string[];
}
