"use client";

/**
 * The Guided Culinary Solver — Accessible Real-Physics Kitchen Lab
 *
 * Combines Choi-Okos food thermophysics, Rohsenow boiling, and Biot boundary-layer
 * solutions with accessible culinary guidance and live Rust/WASM (with TS fallback)
 * resistance-chain solving.
 *
 * @file src/app/(alchm)/kitchen-lab/_solver/SolverPanel.tsx
 */
import { useEffect, useMemo, useState } from "react";
import { TemperatureUnitToggle } from "@/components/lab/TemperatureUnitToggle";
import { VESSELS_DERIVED, type VesselDerived } from "@/data/cooking/vessels";
import { DEFAULT_AMBIENT, solveArrangement, type SolverInput } from "@/lib/cooking/labSolver";
import { useTemperatureUnit } from "@/lib/cooking/temperatureUnits";
import { createBoundarySolver, type BoundarySolver } from "@/lib/wasm/thermoEngine";
import { SolverInputs, type SolverInputState } from "./SolverInputs";
import { SolverResults } from "./SolverResults";
import type React from "react";

const INITIAL_STATE: SolverInputState = {
  ingredientQuery: "",
  ingredientId: "chicken",
  geometry: "slab",
  halfDimensionMm: 20,
  massG: 250,
  startC: 5,
  targetC: 74,
  methodId: "roasting",
  airC: DEFAULT_AMBIENT.airC,
  rhPct: DEFAULT_AMBIENT.relativeHumidityPct,
  airVelocityMs: DEFAULT_AMBIENT.airVelocityMs,
  elevationM: DEFAULT_AMBIENT.elevationM,
  vesselId: "",
  lidSeal: "",
  burnerW: 800,
};

function useBoundarySolver(): BoundarySolver | null {
  const [boundarySolver, setBoundarySolver] = useState<BoundarySolver | null>(null);
  useEffect(() => {
    let disposed = false;
    createBoundarySolver().then(
      (solver) => {
        if (!disposed) setBoundarySolver(solver);
      },
      () => {
        if (!disposed) setBoundarySolver(null);
      },
    );
    return (): void => {
      disposed = true;
    };
  }, []);
  return boundarySolver;
}

function toSolverInput(state: SolverInputState, vessel: VesselDerived | null): SolverInput {
  return {
    ingredientId: state.ingredientId,
    geometry: state.geometry,
    halfDimensionM: state.halfDimensionMm / 1000,
    massKg: state.massG / 1000,
    startC: state.startC,
    targetC: state.targetC,
    methodId: state.methodId,
    ambient: {
      airC: state.airC,
      relativeHumidityPct: state.rhPct,
      airVelocityMs: state.airVelocityMs,
      elevationM: state.elevationM,
    },
    ...(state.vesselId ? { vesselId: state.vesselId } : {}),
    ...(state.lidSeal ? { lidSeal: state.lidSeal } : {}),
    ...(vessel?.lid ? { burnerPowerW: state.burnerW } : {}),
  };
}

function SolverHeader({ engine }: { engine: BoundarySolver["engine"] | null }): React.JSX.Element {
  const engineLabel =
    engine === "wasm"
      ? "Engine: Rust · WASM"
      : engine === "typescript"
        ? "Engine: TypeScript fallback"
        : "Engine: TypeScript (initializing WASM…)";
  return (
    <div className="ma-solver__head mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-white">
          Thermal Cooking Solver &amp; Doneness Calculator
        </h2>
        <p className="text-xs text-white/50">
          Real boundary layer physics translated to cook times, resting carryover, and heat flow.{" "}
          <span className="ma-engine-badge">{engineLabel}</span>
        </p>
      </div>
      <TemperatureUnitToggle />
    </div>
  );
}

export function SolverPanel(): React.JSX.Element {
  const { unit, formatTemp } = useTemperatureUnit();
  const [state, setState] = useState<SolverInputState>(INITIAL_STATE);
  const boundarySolver = useBoundarySolver();
  const vessel = VESSELS_DERIVED.find((v) => v.id === state.vesselId) ?? null;

  const solved = useMemo(() => {
    try {
      const input = toSolverInput(state, vessel);
      const opts = boundarySolver ? { boundarySolver } : undefined;
      return { ok: true as const, result: solveArrangement(input, opts) };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [state, vessel, boundarySolver]);

  return (
    <div className="ma-solver">
      <SolverHeader engine={boundarySolver?.engine ?? null} />
      <SolverInputs
        state={state}
        solved={solved}
        vessel={vessel}
        unit={unit}
        formatTemp={formatTemp}
        onUpdate={(patch) => setState((prev) => ({ ...prev, ...patch }))}
      />
      {solved.ok ? (
        <SolverResults
          result={solved.result}
          geometry={state.geometry}
          massG={state.massG}
          startC={state.startC}
          targetC={state.targetC}
          unit={unit}
          formatTemp={formatTemp}
        />
      ) : (
        <section className="ma-results" aria-label="results">
          <p className="ma-refusal">{solved.message}</p>
        </section>
      )}
    </div>
  );
}
