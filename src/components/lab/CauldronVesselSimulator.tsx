"use client";

import Link from "next/link";
import { useMemo, useState, type JSX } from "react";
import { formatFixed, readVessel } from "@/lib/cooking/thermoVessel";
import type { VesselState } from "@/lib/cooking/vesselState";
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
import { DEFAULT_STAGES, StageEditor, type StageRow } from "./cauldron/StageEditor";
import { useElementalCatalog } from "./cauldron/useElementalCatalog";
import { useVesselState } from "./useVesselState";
import { VesselControls } from "./vessel/VesselControls";

/**
 * The alchm cauldron: the tilt-skillet planner's staged recipe-as-a-circuit,
 * run inside the Hermetic Vessel instead of a fixed commercial skillet.
 *
 * The vessel is the SAME one the physics page shows (`useVesselState`), so
 * moving a slider here moves it there. The SI readings it uses are computed
 * by IAPWS-IF97 on the physics side; the step from those readings to the
 * circuit's V/I/R is a proposed ruling, and the page shows every mapping.
 *
 * Like the planner, it passes no planetary positions: the circuit moves with
 * the vessel and the ingredients, not with the sky.
 *
 * @file src/components/lab/CauldronVesselSimulator.tsx
 */

interface Simulation {
  profile: CauldronVesselProfile;
  circuit: BatchCircuit;
  tsatC: number;
  deficitKpa: number;
  matches: IngredientMatchReport;
  /** Stages left out of the circuit because they hold no named ingredient. */
  emptyStages: number;
}

function simulate(
  vessel: VesselState,
  rows: readonly StageRow[],
  catalog: IngredientElementalCatalog,
): Simulation | string {
  try {
    const reading = readVessel(vessel);
    const profile = cauldronVesselProfile(vessel, reading);
    const stages = namedStages(rows);
    return {
      profile,
      circuit: computeCauldronCircuitWithCatalog(stages, profile.profile, catalog),
      tsatC: reading.saturation.tsatC,
      deficitKpa: reading.vaporDeficitKpa,
      matches: ingredientMatchReport(stages, catalog),
      emptyStages: rows.length - stages.length,
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

export function CauldronVesselSimulator(): JSX.Element {
  const { vessel, update, setVessel } = useVesselState();
  const [stages, setStages] = useState<StageRow[]>(() =>
    DEFAULT_STAGES.map((s) => ({ ...s, ingredients: s.ingredients.map((g) => ({ ...g })) })),
  );
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
      <div className="mt-5 grid grid-cols-1 gap-5">
        <StageEditor stages={stages} onChange={setStages} />
        <CircuitSection vessel={vessel} stages={stages} />
      </div>
    </section>
  );
}
