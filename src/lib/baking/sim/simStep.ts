/**
 * One thermal step: assemble the chain (pan or stone + control volumes),
 * solve it implicitly, then let any wet node above the boil spend its excess
 * heat on vaporisation — the evaporation front that pins a loaf's core at the
 * local boiling point while the crust beyond it climbs toward the oven.
 *
 * Latent heat follows the repo's two-number rule: at the boil the SATURATION
 * table value (`saturatedWaterProperties`, Incropera A.6); below it, at a
 * wet surface, the Fleagle & Andreas fit (inside `wetFaceMoisture`).
 *
 * @file src/lib/baking/sim/simStep.ts
 */
import { saturatedWaterProperties, type ConvectiveSurface } from "@/lib/cooking/boundaryNetwork";
import { CHOI_OKOS_MAX_C, componentSpecificHeat } from "@/lib/cooking/choiOkos";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import { faceCoefficients, ovenVapourPressurePa, solveWetSurface } from "./boundary";
import { SIM } from "./constants";
import { faceArea, widths } from "./grid";
import { nodeThermal, solidsMass } from "./nodeProperties";
import { at, item } from "./strict";
import { implicitStep, type ThermalChain } from "./thermalChain";
import { vapourConductivity } from "./vapourTransport";
import type { SimState } from "./simState";
import type { SimInput } from "./simTypes";

export interface ExposedFace {
  node: number;
  areaM2: number;
  surface: ConvectiveSurface;
  lengthM: number;
}

/** Lagged state of one exposed face. */
export interface FaceRuntime {
  surfaceC: number;
  latentWm2: number;
}

export function isWet(state: SimState, node: number): boolean {
  const n = item(state.nodes, node);
  return n.water0Kg > 0 && n.waterKg / n.water0Kg > SIM.crustDryRatio.value;
}

/** The faces that see oven air. The first is the crust the lab reports. */
export function exposedFaces(state: SimState, input: SimInput): ExposedFace[] {
  const last = state.nodes.length - 1;
  const outer = at(state.faces, state.faces.length - 1);
  const span = input.geometry.spanM;
  if (state.m === 0) {
    const top: ExposedFace = { node: last, areaM2: 1, surface: "horizontal-down", lengthM: span / 4 };
    if (state.plate !== null) return [top];
    return [top, { node: 0, areaM2: 1, surface: "horizontal-up", lengthM: span / 4 }];
  }
  const contact = state.plate === null ? 0 : input.geometry.contactFraction;
  const surface: ConvectiveSurface = state.m === 1 ? "horizontal-cylinder" : "horizontal-down";
  const lengthM = state.m === 1 ? 2 * outer : span / 4;
  return [{ node: last, areaM2: (1 - contact) * faceArea(state.m, outer), surface, lengthM }];
}

interface NodeCoefficients {
  capacitance: number[];
  k: number[];
  /** The evaporation–condensation share of each node's conductivity, W·m⁻¹·K⁻¹. */
  kVapour: number[];
  cp: number[];
}

function nodeCoefficients(state: SimState): NodeCoefficients {
  const out: NodeCoefficients = { capacitance: [], k: [], kVapour: [], cp: [] };
  for (const n of state.nodes) {
    const porosity = Math.min(Math.max(1 - n.matrixM3 / n.volumeM3, 0), SIM.maxPorosity.value);
    const props = nodeThermal(n.waterKg, n.solids, n.tempC, porosity);
    if (props.clamped) state.limitations.add("Crust above 148.9 °C uses Choi–Okos properties evaluated at the fit's ceiling.");
    // Every node still holding water has saturated cells — including one sitting AT the boil, where the
    // heat pipe is strongest. Switching it off there turned the evaporation front into an insulating layer
    // one grid cell thick, and made done times depend on the grid (52 → 36 min from 12 to 64 nodes).
    const kVapour = n.waterKg > 0 ? vapourConductivity(Math.min(n.tempC, state.boilingC), porosity, state.pressurePa) : 0;
    out.k.push(props.kWmK + kVapour);
    out.kVapour.push(kVapour);
    out.cp.push(props.cpJkgK);
    out.capacitance.push((n.waterKg + solidsMass(n.solids)) * props.cpJkgK);
  }
  return out;
}

/** Conduction resistance from a node's centre to one of its faces, m²·K·W⁻¹. */
function halfResistance(state: SimState, coeff: NodeCoefficients, node: number): number {
  return at(widths(state.faces), node) / (2 * at(coeff.k, node));
}

function plateEnvConductance(state: SimState, input: SimInput): number {
  const { plate } = state;
  if (plate === null) return 0;
  if (plate.deck) return plate.areaM2 / plate.halfResistance;
  const length = input.oven.mode === "convection" ? input.geometry.spanM : input.geometry.spanM / 4;
  const c = faceCoefficients(input.oven, plate.tempC, "horizontal-up", length);
  return plate.areaM2 * (c.convectionWm2K + c.radiationWm2K);
}

interface Assembly {
  chain: ThermalChain;
  temps: number[];
  /** Chain index of control volume 0. */
  offset: number;
  plateIndex: number | null;
}

function cvChain(state: SimState, coeff: NodeCoefficients): ThermalChain {
  const link: number[] = [];
  for (let i = 0; i + 1 < state.nodes.length; i += 1) {
    const r = halfResistance(state, coeff, i) + halfResistance(state, coeff, i + 1);
    link.push(faceArea(state.m, at(state.faces, i + 1)) / r);
  }
  const zeros = (): number[] => state.nodes.map(() => 0);
  return { capacitance: coeff.capacitance, link, envConductance: zeros(), envC: zeros(), source: zeros() };
}

function withPlate(state: SimState, input: SimInput, base: ThermalChain, coeff: NodeCoefficients): Assembly {
  const temps = state.nodes.map((n) => n.tempC);
  const { plate } = state;
  if (plate === null) return { chain: base, temps, offset: 0, plateIndex: null };
  const bottom = state.m === 0;
  const cvIndex = bottom ? 0 : state.nodes.length - 1;
  const contact = plate.areaM2 / (plate.halfResistance + halfResistance(state, coeff, cvIndex));
  const join = (values: readonly number[], value: number): number[] => (bottom ? [value, ...values] : [...values, value]);
  const chain: ThermalChain = {
    capacitance: join(base.capacitance, plate.capacitanceJK),
    link: join(base.link, contact),
    envConductance: join(base.envConductance, plateEnvConductance(state, input)),
    envC: join(base.envC, input.oven.ovenC),
    source: join(base.source, 0),
  };
  return { chain, temps: join(temps, plate.tempC), offset: bottom ? 1 : 0, plateIndex: bottom ? 0 : state.nodes.length };
}

/** Adds each exposed face's conductance and latent sink; returns its water flux, kg·s⁻¹ per unit. */
function addAirFaces(state: SimState, input: SimInput, a: Assembly, coeff: NodeCoefficients, runtime: FaceRuntime[]): number[] {
  const vapour = ovenVapourPressurePa(input.oven, state.tS / 60, input.ambient, state.pressurePa / 1000);
  const env = [...a.chain.envConductance];
  const source = [...a.chain.source];
  const massFlux = exposedFaces(state, input).map((face, f) => {
    const rt = item(runtime, f);
    const c = faceCoefficients(input.oven, rt.surfaceC, face.surface, face.lengthM);
    const gIn = 1 / halfResistance(state, coeff, face.node);
    const moisture = isWet(state, face.node)
      ? solveWetSurface(gIn, item(state.nodes, face.node).tempC, c, input.oven, vapour, state.boilingC)
      : null;
    rt.latentWm2 = moisture === null ? 0 : moisture.latentWm2;
    if (moisture !== null) rt.surfaceC = moisture.surfaceC;
    const i = face.node + a.offset;
    env[i] = at(env, i) + face.areaM2 / (1 / gIn + 1 / (c.convectionWm2K + c.radiationWm2K));
    source[i] = at(source, i) - face.areaM2 * rt.latentWm2;
    return moisture === null ? 0 : moisture.massFluxKgM2s * face.areaM2;
  });
  a.chain = { ...a.chain, envConductance: env, envC: a.chain.envC.map(() => input.oven.ovenC), source };
  return massFlux;
}

/**
 * The mass half of the heat pipe. Heat the vapour carried across a link is
 * water that evaporated on the warm side and condensed on the cool side:
 * ṁ = q_vap / h_fg. Moving it conserves mass — the energy is already in the
 * conductance — and it is what dries a crust from the inside and leaves the
 * crumb ahead of the front slightly wetter than the dough was.
 */
function carryVapour(state: SimState, coeff: NodeCoefficients, dtS: number): void {
  for (let i = 0; i + 1 < state.nodes.length; i += 1) {
    const a = item(state.nodes, i);
    const b = item(state.nodes, i + 1);
    const share = (at(coeff.kVapour, i) + at(coeff.kVapour, i + 1)) / (at(coeff.k, i) + at(coeff.k, i + 1));
    if (!(share > 0) || a.tempC === b.tempC) continue;
    const r = halfResistance(state, coeff, i) + halfResistance(state, coeff, i + 1);
    const heatW = (faceArea(state.m, at(state.faces, i + 1)) / r) * Math.abs(a.tempC - b.tempC) * share;
    const [hot, cold] = a.tempC > b.tempC ? [a, b] : [b, a];
    const moved = Math.min((heatW * dtS) / latentHeatVaporisation(Math.min(hot.tempC, 100)), hot.waterKg);
    if (!(moved > 0)) continue;
    // The condensate arrives carrying its sensible heat from the warm side: mix it in, so energy is conserved.
    const coldHeatCapacity = (cold.waterKg + solidsMass(cold.solids)) * at(coeff.cp, cold === a ? i : i + 1);
    const condensateHeatCapacity = moved * componentSpecificHeat("water", Math.min(hot.tempC, CHOI_OKOS_MAX_C));
    cold.tempC = (coldHeatCapacity * cold.tempC + condensateHeatCapacity * hot.tempC) / (coldHeatCapacity + condensateHeatCapacity);
    hot.waterKg -= moved;
    cold.waterKg += moved;
  }
}

/** Wet nodes above the boil spend the excess on vaporisation. */
function boilOff(state: SimState, cp: readonly number[]): void {
  const hfg = saturatedWaterProperties(state.boilingC).hfgJkg;
  state.nodes.forEach((n, i) => {
    if (n.waterKg <= 0 || n.tempC <= state.boilingC) return;
    const c = at(cp, i);
    const excessJ = (n.waterKg + solidsMass(n.solids)) * c * (n.tempC - state.boilingC);
    const vapourKg = Math.min(n.waterKg, excessJ / hfg);
    n.waterKg -= vapourKg;
    n.tempC = state.boilingC + (excessJ - vapourKg * hfg) / ((n.waterKg + solidsMass(n.solids)) * c);
  });
}

function applySurfaceMoisture(state: SimState, input: SimInput, massFlux: readonly number[], dtS: number): void {
  exposedFaces(state, input).forEach((face, f) => {
    const n = item(state.nodes, face.node);
    n.waterKg = Math.max(n.waterKg - at(massFlux, f) * dtS, 0);
  });
}

function updateSurfaceTemps(state: SimState, input: SimInput, coeff: NodeCoefficients, runtime: FaceRuntime[]): void {
  exposedFaces(state, input).forEach((face, f) => {
    const rt = item(runtime, f);
    const n = item(state.nodes, face.node);
    const c = faceCoefficients(input.oven, rt.surfaceC, face.surface, face.lengthM);
    const gIn = 1 / halfResistance(state, coeff, face.node);
    const hOut = c.convectionWm2K + c.radiationWm2K;
    // A wet face was solved from its own balance before the step; only a dry one is read off the node.
    if (isWet(state, face.node)) return;
    rt.surfaceC = (gIn * n.tempC + hOut * c.envC) / (gIn + hOut);
  });
}

/** Advance heat and moisture by one step. Mutates `state` and `runtime`. */
export function thermalStep(state: SimState, input: SimInput, runtime: FaceRuntime[], dtS: number): void {
  const coeff = nodeCoefficients(state);
  const assembly = withPlate(state, input, cvChain(state, coeff), coeff);
  const massFlux = addAirFaces(state, input, assembly, coeff, runtime);
  const next = implicitStep(assembly.temps, assembly.chain, dtS);
  state.nodes.forEach((n, i) => {
    n.tempC = at(next, i + assembly.offset);
  });
  if (state.plate !== null && assembly.plateIndex !== null) state.plate.tempC = at(next, assembly.plateIndex);
  applySurfaceMoisture(state, input, massFlux, dtS);
  carryVapour(state, coeff, dtS);
  boilOff(state, coeff.cp);
  updateSurfaceTemps(state, input, coeff, runtime);
}
