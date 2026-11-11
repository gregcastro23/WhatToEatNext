"use client";

import Link from "next/link";
import { useMemo, useState, type JSX } from "react";
import { formatFixed, readVessel } from "@/lib/cooking/thermoVessel";
import type { VesselState } from "@/lib/cooking/vesselState";
import {
  computeStageTransformation,
  type TransformationState,
} from "@/utils/cauldronTransformation";
import {
  computeCauldronCircuitWithCatalog,
  ingredientMatchReport,
  namedStages,
  type BatchCircuit,
  type IngredientElementalCatalog,
  type IngredientMatchReport,
} from "@/utils/cauldronVesselCore";
import { cauldronVesselProfile, type CauldronVesselProfile } from "@/utils/cauldronVesselProfile";
import { ProfileMappingTable, SeriesSummary, StageCircuitTable } from "./cauldron/CauldronReadouts";
import { CulinaryMatrixReadout } from "./cauldron/CulinaryMatrixReadout";
import { DEFAULT_STAGES, StageEditor, type StageRow } from "./cauldron/StageEditor";
import { useElementalCatalog } from "./cauldron/useElementalCatalog";
import { useVesselState } from "./useVesselState";
import { VesselControls } from "./vessel/VesselControls";

/**
 * The alchm cauldron: the staged recipe-as-a-circuit with 7 Hermetic Operations
 * and time-stepped food-matrix kinetics inside the Vas Hermeticum.
 *
 * @file src/components/lab/CauldronVesselSimulator.tsx
 */

interface Simulation {
  profile: CauldronVesselProfile;
  circuit: BatchCircuit;
  tsatC: number;
  deficitKpa: number;
  matches: IngredientMatchReport;
  emptyStages: number;
  transformation: TransformationState;
  refluxRatio: number;
}

interface TimelineStep {
  name: string;
  stageRow: StageRow;
  vesselState: VesselState;
}

const OPUS_CULINARIS_TIMELINE: readonly TimelineStep[] = [
  {
    name: "1. Calcinatio (Dry Sear)",
    stageRow: {
      name: "Calcinatio (Dry Sear)",
      ingredients: [
        { name: "beef_shank", amount: 450, unit: "g" },
        { name: "shallot", amount: 60, unit: "g" },
        { name: "olive_oil", amount: 15, unit: "ml" },
      ],
    },
    vesselState: {
      temperatureC: 185,
      pressureKpa: 101.325,
      humidityPct: 15,
      headspaceC: 25,
      sealMode: "open",
      durationMinutes: 10,
    },
  },
  {
    name: "2. Solutio (Deglaze)",
    stageRow: {
      name: "Solutio (Deglaze & Infusion)",
      ingredients: [
        { name: "red_wine", amount: 150, unit: "ml" },
        { name: "bone_broth", amount: 250, unit: "ml" },
      ],
    },
    vesselState: {
      temperatureC: 95,
      pressureKpa: 101.325,
      humidityPct: 70,
      headspaceC: 25,
      sealMode: "open",
      durationMinutes: 5,
    },
  },
  {
    name: "3. Circulatio (Hermetic Reflux)",
    stageRow: {
      name: "Circulatio (Hermetic Reflux Braise)",
      ingredients: [
        { name: "fresh_thyme", amount: 5, unit: "g" },
        { name: "garlic", amount: 15, unit: "g" },
        { name: "carrot", amount: 120, unit: "g" },
      ],
    },
    vesselState: {
      temperatureC: 118,
      pressureKpa: 200,
      humidityPct: 100,
      headspaceC: 118,
      sealMode: "hermetic_sealed",
      durationMinutes: 45,
    },
  },
  {
    name: "4. Coagulatio (Open Reduction)",
    stageRow: {
      name: "Coagulatio (Open Reduction Glaze)",
      ingredients: [
        { name: "butter", amount: 30, unit: "g" },
        { name: "parsley", amount: 10, unit: "g" },
      ],
    },
    vesselState: {
      temperatureC: 102,
      pressureKpa: 101.325,
      humidityPct: 50,
      headspaceC: 25,
      sealMode: "open",
      durationMinutes: 15,
    },
  },
];

function simulate(
  vessel: VesselState,
  rows: readonly StageRow[],
  catalog: IngredientElementalCatalog,
): Simulation | string {
  try {
    const reading = readVessel(vessel);
    const profile = cauldronVesselProfile(vessel, reading);
    const stages = namedStages(rows);
    const duration = vessel.durationMinutes ?? 15;
    const transformation = computeStageTransformation(vessel, reading, duration);
    const circuit = computeCauldronCircuitWithCatalog(stages, profile.profile, catalog);
    circuit.transformation = transformation;
    return {
      profile,
      circuit,
      tsatC: reading.saturation.tsatC,
      deficitKpa: reading.vaporDeficitKpa,
      matches: ingredientMatchReport(stages, catalog),
      emptyStages: rows.length - stages.length,
      transformation,
      refluxRatio: reading.refluxRatio,
    };
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

function MatchNotes({ sim }: { sim: Simulation }): JSX.Element | null {
  const { unresolved, partial } = sim.matches;
  if (unresolved.length === 0 && partial.length === 0 && sim.emptyStages === 0) return null;
  return (
    <div className="space-y-1 text-xs text-amber-200/80">
      {unresolved.length > 0 ? (
        <p>Not in the ingredient catalog, so blended as neutral (25 % of each element): {unresolved.join(", ")}.</p>
      ) : null}
      {partial.length > 0 ? (
        <p>
          Matched by partial name only — check these:{" "}
          {partial.map((p) => `${p.name} → ${p.key.replace(/_/g, " ")}`).join(", ")}.
        </p>
      ) : null}
      {sim.emptyStages > 0 ? (
        <p>{sim.emptyStages} stage(s) with no named ingredient are left out of the circuit.</p>
      ) : null}
    </div>
  );
}

function Results({ sim }: { sim: Simulation }): JSX.Element {
  return (
    <div className="space-y-5">
      <p className="font-mono text-[11px] text-white/50">
        SI · IAPWS-IF97: T_sat {sim.tsatC.toFixed(2)} °C · Δp_v {formatFixed(sim.deficitKpa, 2)} kPa
      </p>
      <CulinaryMatrixReadout
        operation={sim.transformation.operation}
        matrix={sim.transformation.matrix}
        refluxRatio={sim.refluxRatio}
      />
      <ProfileMappingTable mappings={sim.profile.mappings} />
      <MatchNotes sim={sim} />
      {sim.circuit.stages.length > 0 ? (
        <>
          <StageCircuitTable circuit={sim.circuit} />
          <SeriesSummary circuit={sim.circuit} />
        </>
      ) : (
        <p className="text-xs text-white/45">The cauldron is empty: add a stage with at least one named ingredient.</p>
      )}
    </div>
  );
}

function CircuitSection({ vessel, stages }: { vessel: VesselState; stages: readonly StageRow[] }): JSX.Element {
  const { catalog, retry } = useElementalCatalog();
  const sim = useMemo(
    () => (catalog && catalog !== "unavailable" ? simulate(vessel, stages, catalog) : null),
    [vessel, stages, catalog],
  );
  if (catalog === "unavailable") {
    return (
      <p className="text-xs text-white/50">
        The ingredient catalog could not be loaded, so no circuit is computed.{" "}
        <button type="button" onClick={retry} className="underline hover:text-white/80">
          Retry
        </button>
      </p>
    );
  }
  if (sim === null) return <p className="text-xs text-white/40">Loading the ingredient catalog…</p>;
  if (typeof sim === "string") return <p className="text-xs text-white/50">Outside the vessel model: {sim}</p>;
  return <Results sim={sim} />;
}

function TimelinePresetBar({
  onLoad,
  onStep,
}: {
  onLoad: () => void;
  onStep: (index: number) => void;
}): JSX.Element {
  return (
    <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
          Opus Culinaris · 4-Step Interactive Timeline
        </span>
        <button
          type="button"
          onClick={onLoad}
          className="rounded border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200 hover:border-amber-400 hover:bg-amber-400/20 transition-colors"
        >
          Load 4-Step Opus Culinaris Preset
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Timeline navigation">
        {OPUS_CULINARIS_TIMELINE.map((step, idx) => (
          <button
            key={step.name}
            type="button"
            onClick={() => onStep(idx)}
            className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/70 hover:border-amber-400/40 hover:text-amber-200 transition-colors"
          >
            {step.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CauldronVesselSimulator(): JSX.Element {
  const { vessel, update, setVessel } = useVesselState();
  const [stages, setStages] = useState<StageRow[]>(() =>
    DEFAULT_STAGES.map((s) => ({ ...s, ingredients: s.ingredients.map((g) => ({ ...g })) })),
  );

  const loadTimeline = (): void => {
    setStages(OPUS_CULINARIS_TIMELINE.map((step) => ({
      name: step.stageRow.name,
      ingredients: step.stageRow.ingredients.map((g) => ({ ...g })),
    })));
    const [first] = OPUS_CULINARIS_TIMELINE;
    if (first) setVessel(first.vesselState);
  };

  const jumpToStep = (index: number): void => {
    const step = OPUS_CULINARIS_TIMELINE[index];
    if (step) setVessel(step.vesselState);
  };

  return (
    <section className="alchm-panel" style={{ padding: "20px 22px" }} aria-label="Hermetic Vessel cauldron">
      <div className="t-tag" style={{ marginBottom: 6, color: "var(--accent)" }}>
        HERMETIC VESSEL · CAULDRON CIRCUIT
      </div>
      <p className="mb-4 text-xs leading-relaxed text-white/50">
        Stage ingredients into the vessel and read each stage as a circuit. The vessel is shared
        with <Link href="/kitchen-lab/physics?tab=vessel" className="underline">the physics page</Link>,
        where the same pressure, temperature and humidity are read in SI.
      </p>
      <VesselControls vessel={vessel} onPatch={update} onPreset={setVessel} />
      <TimelinePresetBar onLoad={loadTimeline} onStep={jumpToStep} />
      <div className="mt-5 grid grid-cols-1 gap-5">
        <StageEditor stages={stages} onChange={setStages} />
        <CircuitSection vessel={vessel} stages={stages} />
      </div>
    </section>
  );
}
