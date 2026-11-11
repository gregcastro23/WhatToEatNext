/**
 * Tool handler for simulate_hermetic_cauldron (and calculate_batch_circuit alias).
 *
 * Runs the IAPWS-IF97 hermetic vessel simulation and optional alchemical cauldron
 * staged ingredient circuit. Returns SI readings, cited cooking regimes, and the
 * 6-field kinetic circuit profile approved on 2026-11-11.
 *
 * @file src/lib/mcp/cauldronTools.ts
 */

import { readVessel, type VesselReading } from "@/lib/cooking/thermoVessel";
import {
  DEFAULT_VESSEL,
  VESSEL_RANGES,
  type VesselState,
} from "@/lib/cooking/vesselState";
import {
  type BatchCircuit,
  type BatchStageInput,
} from "@/utils/cauldronVesselCore";
import {
  cauldronVesselProfile,
  type CauldronVesselProfile,
} from "@/utils/cauldronVesselProfile";
import { simulateCauldron } from "@/utils/cauldronVesselSimulation";
import type { ToolErrorCode } from "./outputSchemas";

export interface HermeticCauldronOutput {
  vessel: {
    setpointC: number;
    pressureKpa: number;
    humidityPct: number;
    headspaceC: number;
    surfaceWet: boolean;
  };
  saturation: {
    tsatC: number;
    boilingState: string;
    aboveCeiling: boolean;
    wetSurfaceC: number;
    surfaceVaporKpa: number;
    headspaceVaporKpa: number;
    latentVsSeaLevel: number;
  };
  deficit: {
    vaporDeficitKpa: number;
    transfer: string;
    headspaceVaporCapped: boolean;
  };
  regimes: Array<{
    id: string;
    label: string;
    moisture: string;
    onsetC: number;
    endC: number | null;
    note: string;
  }>;
  profile: {
    fields: CauldronVesselProfile["profile"];
    mappings: CauldronVesselProfile["mappings"];
    power: number;
  };
  circuit: BatchCircuit | null;
}

export interface CauldronToolResult {
  ok: boolean;
  data: HermeticCauldronOutput | null;
  errorCode?: ToolErrorCode;
  errorMessage?: string;
  remediation?: string;
  summary: Record<string, unknown>;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractStages(raw: unknown): BatchStageInput[] {
  if (!Array.isArray(raw)) return [];
  const validStages: BatchStageInput[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const rawIngredients = Array.isArray(item.ingredients)
      ? item.ingredients
      : [];
    const ingredients = rawIngredients
      .filter(isRecord)
      .map((ing) => ({
        name: typeof ing.name === "string" ? ing.name : "unnamed",
        amount: typeof ing.amount === "number" ? Math.max(0, ing.amount) : 1,
        unit: typeof ing.unit === "string" ? ing.unit : "unit",
      }));
    validStages.push({
      ...(typeof item.name === "string" ? { name: item.name } : {}),
      ingredients,
    });
  }
  return validStages;
}

function buildVesselState(args: Record<string, unknown>): VesselState {
  const setpointC =
    typeof args.setpointC === "number"
      ? args.setpointC
      : typeof args.temperatureC === "number"
        ? args.temperatureC
        : DEFAULT_VESSEL.temperatureC;
  const pressureKpa =
    typeof args.pressureKpa === "number"
      ? args.pressureKpa
      : DEFAULT_VESSEL.pressureKpa;
  const humidityPct =
    typeof args.relativeHumidityPct === "number"
      ? args.relativeHumidityPct
      : typeof args.humidityPct === "number"
        ? args.humidityPct
        : DEFAULT_VESSEL.humidityPct;
  const headspaceC =
    typeof args.headspaceC === "number"
      ? args.headspaceC
      : DEFAULT_VESSEL.headspaceC;

  return {
    temperatureC: clamp(
      setpointC,
      VESSEL_RANGES.temperatureC.min,
      VESSEL_RANGES.temperatureC.max,
    ),
    pressureKpa: clamp(
      pressureKpa,
      VESSEL_RANGES.pressureKpa.min,
      VESSEL_RANGES.pressureKpa.max,
    ),
    humidityPct: clamp(
      humidityPct,
      VESSEL_RANGES.humidityPct.min,
      VESSEL_RANGES.humidityPct.max,
    ),
    headspaceC: clamp(
      headspaceC,
      VESSEL_RANGES.headspaceC.min,
      VESSEL_RANGES.headspaceC.max,
    ),
  };
}

function formatRegimes(
  reading: VesselReading,
  surfaceWet: boolean,
): HermeticCauldronOutput["regimes"] {
  const activeRegimes = surfaceWet
    ? reading.regimesWhileWet
    : reading.aboveCeiling
      ? reading.regimesOnceDry
      : reading.regimesWhileWet;
  return activeRegimes.map((regime) => ({
    id: regime.id,
    label: regime.label,
    moisture: regime.moisture,
    onsetC: regime.onsetC,
    endC: regime.endC,
    note: regime.note,
  }));
}

function assembleCauldronOutput(
  vessel: VesselState,
  surfaceWet: boolean,
  reading: VesselReading,
  profileWithMappings: CauldronVesselProfile,
  circuit: BatchCircuit | null,
  regimes: HermeticCauldronOutput["regimes"],
): HermeticCauldronOutput {
  const power =
    profileWithMappings.profile.voltage * profileWithMappings.profile.current;
  return {
    vessel: {
      setpointC: vessel.temperatureC,
      pressureKpa: vessel.pressureKpa,
      humidityPct: vessel.humidityPct,
      headspaceC: vessel.headspaceC,
      surfaceWet,
    },
    saturation: {
      tsatC: reading.saturation.tsatC,
      boilingState: reading.boilingState,
      aboveCeiling: reading.aboveCeiling,
      wetSurfaceC: reading.wetSurfaceC,
      surfaceVaporKpa: reading.surfaceVaporKpa,
      headspaceVaporKpa: reading.headspaceVaporKpa,
      latentVsSeaLevel: reading.latentVsSeaLevel,
    },
    deficit: {
      vaporDeficitKpa: reading.vaporDeficitKpa,
      transfer: reading.transfer,
      headspaceVaporCapped: reading.headspaceVaporCapped,
    },
    regimes,
    profile: {
      fields: profileWithMappings.profile,
      mappings: profileWithMappings.mappings,
      power,
    },
    circuit,
  };
}

/**
 * Executes simulate_hermetic_cauldron tool: validates parameters, calculates SI
 * state via IF97, constructs the 6-field kinetic profile, and optionally simulates
 * stages through the series circuit.
 */
export function simulateHermeticCauldronHandler(
  args: Record<string, unknown>,
): CauldronToolResult {
  const vessel = buildVesselState(args);
  const surfaceWet = typeof args.surfaceWet === "boolean" ? args.surfaceWet : true;
  const reading = readVessel(vessel);
  const profileWithMappings = cauldronVesselProfile(vessel, reading);
  const stages = extractStages(args.stages);
  const circuit: BatchCircuit | null =
    stages.length > 0 ? simulateCauldron(stages, vessel).circuit : null;
  const power =
    profileWithMappings.profile.voltage * profileWithMappings.profile.current;
  const regimes = formatRegimes(reading, surfaceWet);
  const data = assembleCauldronOutput(
    vessel,
    surfaceWet,
    reading,
    profileWithMappings,
    circuit,
    regimes,
  );

  return {
    ok: true,
    data,
    summary: {
      temperatureC: vessel.temperatureC,
      pressureKpa: vessel.pressureKpa,
      boilingState: reading.boilingState,
      power,
      hasCircuit: circuit !== null,
      regimesCount: regimes.length,
    },
  };
}
