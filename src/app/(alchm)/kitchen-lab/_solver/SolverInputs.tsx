"use client";

import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import { VESSELS_DERIVED, type LidSeal, type VesselDerived } from "@/data/cooking/vessels";
import {
  SOLVABLE_INGREDIENT_COUNT,
  TOTAL_INGREDIENT_COUNT,
  type SolverResult,
} from "@/lib/cooking/labSolver";
import type { TemperatureUnit } from "@/lib/cooking/temperatureUnits";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import {
  CompositionBar,
  Derived,
  Field,
  GeometryGlyph,
  IngredientSelect,
  filterIngredients,
  fromDisplayTemp,
  toDisplayTemp,
} from "./SolverControlsPrimitives";
import type React from "react";

const METHOD_IDS = Object.keys(METHOD_PHYSICS).sort();
const LID_SEALS: readonly LidSeal[] = ["none", "cracked", "loose", "tight"];
const GEOMETRIES: ReadonlyArray<{ id: FoodGeometry; label: string; dimension: string }> = [
  { id: "slab", label: "slab / cutlet", dimension: "half-thickness" },
  { id: "cylinder", label: "cylinder / tenderloin", dimension: "radius" },
  { id: "sphere", label: "sphere / meatball", dimension: "radius" },
];

export interface SolverInputState {
  ingredientQuery: string;
  ingredientId: string;
  geometry: FoodGeometry;
  halfDimensionMm: number;
  massG: number;
  startC: number;
  targetC: number;
  methodId: string;
  airC: number;
  rhPct: number;
  airVelocityMs: number;
  elevationM: number;
  vesselId: string;
  lidSeal: LidSeal | "";
  burnerW: number;
}

export interface SolverInputsProps {
  state: SolverInputState;
  solved: { ok: true; result: SolverResult } | { ok: false; message: string };
  vessel: VesselDerived | null;
  unit: TemperatureUnit;
  formatTemp: (celsius: number, precision?: number) => string;
  onUpdate: (patch: Partial<SolverInputState>) => void;
}

function StepIngredient({
  state,
  result,
  onUpdate,
}: {
  state: SolverInputState;
  result: SolverResult | null;
  onUpdate: (patch: Partial<SolverInputState>) => void;
}): React.JSX.Element {
  const filtered = filterIngredients(state.ingredientQuery);
  const handleQuery = (nextQuery: string): void => {
    const matches = filterIngredients(nextQuery);
    const hasCurrent = matches.some((item) => item.id === state.ingredientId);
    const [firstMatch] = matches;
    onUpdate({
      ingredientQuery: nextQuery,
      ...(!hasCurrent && firstMatch ? { ingredientId: firstMatch.id } : {}),
    });
  };
  return (
    <fieldset className="ma-step">
      <legend><span>01</span> ingredient</legend>
      <input
        type="search"
        className="ma-search"
        aria-label="Filter solvable ingredients"
        placeholder="Search ingredient or FDC id..."
        value={state.ingredientQuery}
        onChange={(e) => handleQuery(e.target.value)}
      />
      <IngredientSelect
        filtered={filtered}
        ingredientId={state.ingredientId}
        onSelect={(id) => onUpdate({ ingredientId: id })}
      />
      <p className="ma-coverage">
        Showing {filtered.length} of {SOLVABLE_INGREDIENT_COUNT} solvable ingredients
        ({TOTAL_INGREDIENT_COUNT} total in corpus carry insufficient proximate data for Choi–Okos).
      </p>
      {result ? (
        <>
          <CompositionBar ingredient={result.ingredient} />
          {result.compositionWarning ? <p className="ma-warn">{result.compositionWarning}</p> : null}
        </>
      ) : null}
    </fieldset>
  );
}

function StepGeometry({
  state,
  result,
  unit,
  onUpdate,
}: {
  state: SolverInputState;
  result: SolverResult | null;
  unit: TemperatureUnit;
  onUpdate: (patch: Partial<SolverInputState>) => void;
}): React.JSX.Element {
  const unitLabel = unit === "fahrenheit" ? "F" : "C";
  const dimension = state.geometry === "slab" ? "half-thickness" : "radius";
  return (
    <fieldset className="ma-step">
      <legend><span>02</span> geometry &amp; temperatures</legend>
      <div className="ma-tiles">
        {GEOMETRIES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={g.id === state.geometry ? "is-active" : undefined}
            onClick={() => onUpdate({ geometry: g.id })}
          >
            <GeometryGlyph geometry={g.id} />
            <span>{g.label}</span>
            <em>{g.dimension}</em>
          </button>
        ))}
      </div>
      <div className="ma-fields">
        <Field label={dimension} unit="mm" value={state.halfDimensionMm} onChange={(v) => onUpdate({ halfDimensionMm: v })} min={1} />
        <Field label="mass" unit="g" value={state.massG} onChange={(v) => onUpdate({ massG: v })} min={1} />
        <Field label="start temp" unit={`°${unitLabel}`} value={toDisplayTemp(state.startC, unit)} onChange={(v) => onUpdate({ startC: fromDisplayTemp(v, unit) })} />
        <Field label="target doneness" unit={`°${unitLabel}`} value={toDisplayTemp(state.targetC, unit)} onChange={(v) => onUpdate({ targetC: fromDisplayTemp(v, unit) })} />
      </div>
      {result ? (
        <Derived label="surface area to volume" value={`${result.surfaceAreaToVolumePerM.toFixed(1)} m⁻¹`} />
      ) : null}
    </fieldset>
  );
}

function StepEnvironment({
  state,
  result,
  unit,
  formatTemp,
  onUpdate,
}: {
  state: SolverInputState;
  result: SolverResult | null;
  unit: TemperatureUnit;
  formatTemp: (celsius: number, precision?: number) => string;
  onUpdate: (patch: Partial<SolverInputState>) => void;
}): React.JSX.Element {
  const unitLabel = unit === "fahrenheit" ? "F" : "C";
  return (
    <fieldset className="ma-step">
      <legend><span>03</span> cooking method &amp; environment</legend>
      <select aria-label="Cooking method" value={state.methodId} onChange={(e) => onUpdate({ methodId: e.target.value })}>
        {METHOD_IDS.map((id) => <option key={id} value={id}>{id.replace(/_/g, " ")}</option>)}
      </select>
      <p className="ma-chip">standard atmosphere · editable</p>
      <div className="ma-fields">
        <Field label="ambient / medium temp" unit={`°${unitLabel}`} value={toDisplayTemp(state.airC, unit)} onChange={(v) => onUpdate({ airC: fromDisplayTemp(v, unit) })} />
        <Field label="humidity" unit="%" value={state.rhPct} onChange={(v) => onUpdate({ rhPct: v })} min={0} max={100} />
        <Field label="air velocity" unit="m/s" value={state.airVelocityMs} onChange={(v) => onUpdate({ airVelocityMs: v })} min={0} />
        <Field label="elevation" unit="m" value={state.elevationM} onChange={(v) => onUpdate({ elevationM: v })} />
      </div>
      {result ? (
        <Derived
          label="local boiling ceiling"
          value={formatTemp(result.ceilingC, 1)}
          {...(result.ceilingClamped ? { note: "pressure clamped to Antoine limit" } : {})}
        />
      ) : null}
    </fieldset>
  );
}

function StepVessel({
  state,
  vessel,
  onUpdate,
}: {
  state: SolverInputState;
  vessel: VesselDerived | null;
  onUpdate: (patch: Partial<SolverInputState>) => void;
}): React.JSX.Element {
  return (
    <fieldset className="ma-step">
      <legend><span>04</span> cookware vessel &amp; lid</legend>
      <select aria-label="Cookware vessel" value={state.vesselId} onChange={(e) => onUpdate({ vesselId: e.target.value, lidSeal: "" })}>
        <option value="">no vessel — in the oven air / rack</option>
        {VESSELS_DERIVED.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
      {vessel ? (
        <dl className="ma-vessel">
          <div><dt>diameter</dt><dd>{(vessel.internalDiameterMm / 25.4).toFixed(1)} in ({vessel.internalDiameterMm} mm)</dd></div>
          <div><dt>capacity</dt><dd>{(vessel.capacityLitres * 1.0567).toFixed(1)} qt ({vessel.capacityLitres.toFixed(1)} L)</dd></div>
          <div><dt>material</dt><dd>{vessel.material.name}</dd></div>
          <div><dt>thermal mass</dt><dd>{Math.round(vessel.thermalMassJperK)} J/K</dd></div>
        </dl>
      ) : null}
      {vessel?.lid ? (
        <>
          <div className="ma-seg" role="group" aria-label="lid seal">
            {LID_SEALS.map((seal) => (
              <button
                key={seal}
                type="button"
                className={(state.lidSeal || vessel.lid?.seal) === seal ? "is-active" : undefined}
                onClick={() => onUpdate({ lidSeal: seal })}
              >
                {seal}
              </button>
            ))}
          </div>
          <Field label="burner power" unit="W" value={state.burnerW} onChange={(v) => onUpdate({ burnerW: v })} min={0} />
        </>
      ) : vessel ? (
        <p className="ma-note">Open pan (no lid fitted).</p>
      ) : null}
    </fieldset>
  );
}

export function SolverInputs({
  state,
  solved,
  vessel,
  unit,
  formatTemp,
  onUpdate,
}: SolverInputsProps): React.JSX.Element {
  const result = solved.ok ? solved.result : null;
  return (
    <section className="ma-rail" aria-label="arrangement">
      <StepIngredient state={state} result={result} onUpdate={onUpdate} />
      <StepGeometry state={state} result={result} unit={unit} onUpdate={onUpdate} />
      <StepEnvironment state={state} result={result} unit={unit} formatTemp={formatTemp} onUpdate={onUpdate} />
      <StepVessel state={state} vessel={vessel} onUpdate={onUpdate} />
      <fieldset className="ma-step">
        <legend><span>05</span> solve summary</legend>
        <p className="ma-summary">
          {result ? result.ingredient.name : state.ingredientId} · {state.halfDimensionMm} mm {state.geometry} ·{" "}
          {state.massG} g · {state.methodId.replace(/_/g, " ")} · {vessel ? vessel.name : "direct air"}
        </p>
        <p className="ma-note">Recomputed synchronously on every input change.</p>
      </fieldset>
    </section>
  );
}
