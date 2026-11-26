/**
 * Pure runtime wire parser for `/api/alchm-quantities` kinetics & circuit payload.
 *
 * @file src/lib/api/parsers/alchmKineticsWireParser.ts
 */

import type { HistoricalContext, StatSummary } from "@/services/HistoricalStatsService";
import { isPlainObject, readFiniteNumber, readString } from "./wirePrimitives";

export interface EsmsVector {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface ESMSKinetics {
  velocity: EsmsVector;
  acceleration: EsmsVector;
  momentum: EsmsVector;
}

export interface CircuitData {
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  inertia: number;
  forceMagnitude: number;
  forceClassification: string;
  thermalDirection: string;
}

export interface AlchmKineticsApiData {
  kinetics: ESMSKinetics;
  circuit: CircuitData;
  historicalContext?: HistoricalContext;
}

function parseEsmsVector(raw: unknown): EsmsVector | null {
  if (!isPlainObject(raw)) return null;
  const Spirit = readFiniteNumber(raw.Spirit);
  const Essence = readFiniteNumber(raw.Essence);
  const Matter = readFiniteNumber(raw.Matter);
  const Substance = readFiniteNumber(raw.Substance);
  if (
    Spirit === undefined ||
    Essence === undefined ||
    Matter === undefined ||
    Substance === undefined
  ) {
    return null;
  }
  return { Spirit, Essence, Matter, Substance };
}

function parseKinetics(raw: unknown): ESMSKinetics | null {
  if (!isPlainObject(raw)) return null;
  const velocity = parseEsmsVector(raw.velocity);
  const acceleration = parseEsmsVector(raw.acceleration);
  const momentum = parseEsmsVector(raw.momentum);
  if (!velocity || !acceleration || !momentum) return null;
  return { velocity, acceleration, momentum };
}

function parseCircuit(raw: unknown): CircuitData | null {
  if (!isPlainObject(raw)) return null;
  const charge = readFiniteNumber(raw.charge);
  const potentialDifference = readFiniteNumber(raw.potentialDifference);
  const currentFlow = readFiniteNumber(raw.currentFlow);
  const power = readFiniteNumber(raw.power);
  const inertia = readFiniteNumber(raw.inertia);
  const forceMagnitude = readFiniteNumber(raw.forceMagnitude);
  const forceClassification = readString(raw.forceClassification);
  const thermalDirection = readString(raw.thermalDirection);
  if (
    charge === undefined ||
    potentialDifference === undefined ||
    currentFlow === undefined ||
    power === undefined ||
    inertia === undefined ||
    forceMagnitude === undefined ||
    forceClassification === undefined ||
    thermalDirection === undefined
  ) {
    return null;
  }
  return {
    charge,
    potentialDifference,
    currentFlow,
    power,
    inertia,
    forceMagnitude,
    forceClassification,
    thermalDirection,
  };
}

function parseStatSummary(raw: unknown): StatSummary | null {
  if (!isPlainObject(raw)) return null;
  const mean = readFiniteNumber(raw.mean);
  const variance = readFiniteNumber(raw.variance);
  const stdDev = readFiniteNumber(raw.stdDev);
  if (mean === undefined || variance === undefined || stdDev === undefined) return null;
  return { mean, variance, stdDev };
}

function parseHistoricalMetrics(raw: unknown): HistoricalContext["metrics"] | null {
  if (!isPlainObject(raw)) return null;
  const Spirit = parseStatSummary(raw.Spirit);
  const Essence = parseStatSummary(raw.Essence);
  const Matter = parseStatSummary(raw.Matter);
  const Substance = parseStatSummary(raw.Substance);
  const heat = parseStatSummary(raw.heat);
  const entropy = parseStatSummary(raw.entropy);
  const reactivity = parseStatSummary(raw.reactivity);
  const kalchm = parseStatSummary(raw.kalchm);
  const monica = parseStatSummary(raw.monica);
  const charge = parseStatSummary(raw.charge);
  const power = parseStatSummary(raw.power);
  const currentFlow = parseStatSummary(raw.currentFlow);
  const candidates = [
    Spirit, Essence, Matter, Substance,
    heat, entropy, reactivity, kalchm,
    monica, charge, power, currentFlow,
  ];
  if (candidates.some((entry) => entry === null)) {
    return null;
  }
  if (!Spirit || !Essence || !Matter || !Substance) return null;
  if (!heat || !entropy || !reactivity || !kalchm) return null;
  if (!monica || !charge || !power || !currentFlow) return null;
  return {
    Spirit, Essence, Matter, Substance,
    heat, entropy, reactivity, kalchm,
    monica, charge, power, currentFlow,
  };
}

function parseHistoricalContext(raw: unknown): HistoricalContext | undefined {
  if (!isPlainObject(raw)) return undefined;
  const timeframeDays = readFiniteNumber(raw.timeframeDays);
  const dataPoints = readFiniteNumber(raw.dataPoints);
  const metrics = parseHistoricalMetrics(raw.metrics);
  if (timeframeDays === undefined || dataPoints === undefined || !metrics) return undefined;
  return { timeframeDays, dataPoints, metrics };
}

/** Producer: `src/app/api/alchm-quantities/route.ts:651-684` */
export function parseAlchmKineticsResponse(raw: unknown): AlchmKineticsApiData | null {
  if (!isPlainObject(raw)) return null;
  const kinetics = parseKinetics(raw.kinetics);
  const circuit = parseCircuit(raw.circuit);
  if (!kinetics || !circuit) return null;
  const out: AlchmKineticsApiData = { kinetics, circuit };
  const historicalContext = parseHistoricalContext(raw.historicalContext);
  if (historicalContext) out.historicalContext = historicalContext;
  return out;
}
