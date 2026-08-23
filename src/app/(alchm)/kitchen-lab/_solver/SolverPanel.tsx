"use client";

/**
 * The Guided Culinary Solver — Accessible Real-Physics Kitchen Lab
 *
 * Combines Choi-Okos food thermophysics, Rohsenow boiling, and Biot boundary-layer
 * solutions with accessible culinary guidance:
 *  - Default Fahrenheit (°F) with instant °C toggle
 *  - Estimated cook duration & target doneness
 *  - Recommended pull temperature & resting carryover heat rise
 *  - Plain-English heat bottleneck and browning takeaways
 *
 * @file src/app/(alchm)/kitchen-lab/_solver/SolverPanel.tsx
 */
import { useMemo, useState } from "react";
import { TemperatureUnitToggle } from "@/components/lab/TemperatureUnitToggle";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import { VESSELS_DERIVED } from "@/data/cooking/vessels";
import type { LidSeal } from "@/data/cooking/vessels";
import {
  DEFAULT_AMBIENT,
  SOLVABLE_INGREDIENTS,
  SOLVABLE_INGREDIENT_COUNT,
  TOTAL_INGREDIENT_COUNT,
  solveArrangement,
  type Reading,
  type SolverIngredient,
} from "@/lib/cooking/labSolver";
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  getCarryoverRestGuidance,
  useTemperatureUnit,
} from "@/lib/cooking/temperatureUnits";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { ResistanceChain } from "./ResistanceChain";

/** Methods that declare a heat transfer coefficient, in registry order. */
const METHOD_IDS = Object.keys(METHOD_PHYSICS).sort();

const GEOMETRIES: Array<{ id: FoodGeometry; label: string; dimension: string }> = [
  { id: "slab", label: "slab / cutlet", dimension: "half-thickness" },
  { id: "cylinder", label: "cylinder / tenderloin", dimension: "radius" },
  { id: "sphere", label: "sphere / meatball", dimension: "radius" },
];

const LID_SEALS: LidSeal[] = ["none", "cracked", "loose", "tight"];

/**
 * The ONLY way a solver output reaches the screen.
 * Funnels every reading through one component to enforce honesty contracts.
 */
function Value<T>({
  reading,
  children,
}: {
  reading: Reading<T>;
  children: (value: T) => React.ReactNode;
}): React.JSX.Element {
  if (!reading.available) {
    return <p className="ma-refusal">{reading.reason}</p>;
  }
  return <>{children(reading.value)}</>;
}

export function SolverPanel(): React.JSX.Element {
  const { unit, formatTemp } = useTemperatureUnit();

  const [ingredientId, setIngredientId] = useState("chicken");
  const [geometry, setGeometry] = useState<FoodGeometry>("slab");
  const [halfDimensionMm, setHalfDimensionMm] = useState(20);
  const [massG, setMassG] = useState(250);

  // Store temperatures internally in Celsius for physics engine
  const [startC, setStartC] = useState(5); // 41°F fridge temp
  const [targetC, setTargetC] = useState(74); // 165°F chicken core doneness
  const [methodId, setMethodId] = useState("roasting");
  const [airC, setAirC] = useState(DEFAULT_AMBIENT.airC);
  const [rhPct, setRhPct] = useState(DEFAULT_AMBIENT.relativeHumidityPct);
  const [elevationM, setElevationM] = useState(DEFAULT_AMBIENT.elevationM);
  const [vesselId, setVesselId] = useState<string>("");
  const [lidSeal, setLidSeal] = useState<LidSeal | "">("");
  const [burnerW, setBurnerW] = useState(800);

  const vessel = VESSELS_DERIVED.find((v) => v.id === vesselId) ?? null;

  const solved = useMemo(() => {
    try {
      return {
        ok: true as const,
        result: solveArrangement({
          ingredientId,
          geometry,
          halfDimensionM: halfDimensionMm / 1000,
          massKg: massG / 1000,
          startC,
          targetC,
          methodId,
          ambient: { airC, relativeHumidityPct: rhPct, elevationM, airVelocityMs: 0 },
          vesselId: vesselId || undefined,
          lidSeal: lidSeal || undefined,
          burnerPowerW: vessel?.lid ? burnerW : undefined,
        }),
      };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [
    ingredientId, geometry, halfDimensionMm, massG, startC, targetC, methodId,
    airC, rhPct, elevationM, vesselId, lidSeal, burnerW, vessel,
  ]);

  if (!solved.ok) {
    return <p className="ma-refusal">{solved.message}</p>;
  }
  const s = solved.result;
  const carryover = getCarryoverRestGuidance(targetC, massG / 1000, geometry);

  // Input helpers converted to active unit
  const displayedStartTemp = unit === "fahrenheit" ? Math.round(celsiusToFahrenheit(startC)) : startC;
  const displayedTargetTemp = unit === "fahrenheit" ? Math.round(celsiusToFahrenheit(targetC)) : targetC;
  const displayedAirTemp = unit === "fahrenheit" ? Math.round(celsiusToFahrenheit(airC)) : airC;

  const handleStartTempChange = (val: number): void => {
    setStartC(unit === "fahrenheit" ? fahrenheitToCelsius(val) : val);
  };

  const handleTargetTempChange = (val: number): void => {
    setTargetC(unit === "fahrenheit" ? fahrenheitToCelsius(val) : val);
  };

  const handleAirTempChange = (val: number): void => {
    setAirC(unit === "fahrenheit" ? fahrenheitToCelsius(val) : val);
  };

  return (
    <div className="ma-solver">
      {/* ── Top Header with Unit Switcher ──────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Thermal Cooking Solver &amp; Doneness Calculator
          </h2>
          <p className="text-xs text-white/50">
            Real boundary layer physics translated to chef cook times, resting carryover, and heat flow.
          </p>
        </div>
        <TemperatureUnitToggle />
      </div>

      {/* ── Input rail ──────────────────────────────────────────────────── */}
      <section className="ma-rail" aria-label="arrangement">
        <fieldset className="ma-step">
          <legend><span>01</span> ingredient</legend>
          <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)}>
            {SOLVABLE_INGREDIENTS.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          <p className="ma-coverage">
            {SOLVABLE_INGREDIENT_COUNT} of {TOTAL_INGREDIENT_COUNT} ingredients carry a USDA proximate
            composition (water, protein, fat, ash).
          </p>
          <CompositionBar ingredient={s.ingredient} />
          {s.compositionWarning ? <p className="ma-warn">{s.compositionWarning}</p> : null}
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>02</span> geometry &amp; temperatures</legend>
          <div className="ma-tiles">
            {GEOMETRIES.map((g) => (
              <button
                key={g.id}
                type="button"
                className={g.id === geometry ? "is-active" : undefined}
                onClick={() => setGeometry(g.id)}
              >
                <GeometryGlyph geometry={g.id} />
                <span>{g.label}</span>
                <em>{g.dimension}</em>
              </button>
            ))}
          </div>
          <div className="ma-fields">
            <Field label={GEOMETRIES.find((g) => g.id === geometry)!.dimension} unit="mm"
              value={halfDimensionMm} onChange={setHalfDimensionMm} min={1} />
            <Field label="mass" unit="g" value={massG} onChange={setMassG} min={1} />
            <Field label="start temp" unit={`°${unit === "fahrenheit" ? "F" : "C"}`} value={displayedStartTemp} onChange={handleStartTempChange} />
            <Field label="target doneness" unit={`°${unit === "fahrenheit" ? "F" : "C"}`} value={displayedTargetTemp} onChange={handleTargetTempChange} />
          </div>
          <Derived label="surface area to volume" value={`${s.surfaceAreaToVolumePerM.toFixed(1)} m⁻¹`} />
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>03</span> cooking method &amp; environment</legend>
          <select value={methodId} onChange={(e) => setMethodId(e.target.value)}>
            {METHOD_IDS.map((id) => <option key={id} value={id}>{id.replace(/_/g, " ")}</option>)}
          </select>
          <p className="ma-chip">standard atmosphere · editable</p>
          <div className="ma-fields">
            <Field label="ambient / medium temp" unit={`°${unit === "fahrenheit" ? "F" : "C"}`} value={displayedAirTemp} onChange={handleAirTempChange} />
            <Field label="humidity" unit="%" value={rhPct} onChange={setRhPct} min={0} max={100} />
            <Field label="elevation" unit="m" value={elevationM} onChange={setElevationM} />
          </div>
          <Derived
            label="local boiling ceiling"
            value={formatTemp(s.ceilingC, 1)}
            note={s.ceilingClamped ? "pressure clamped to Antoine limit" : undefined}
          />
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>04</span> cookware vessel &amp; lid</legend>
          <select value={vesselId} onChange={(e) => { setVesselId(e.target.value); setLidSeal(""); }}>
            <option value="">no vessel — in the oven air / rack</option>
            {VESSELS_DERIVED.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {vessel ? (
            <dl className="ma-vessel">
              <div><dt>diameter</dt><dd>{(vessel.internalDiameterMm / 25.4).toFixed(1)} in ({vessel.internalDiameterMm} mm)</dd></div>
              <div><dt>capacity</dt><dd>{(vessel.capacityLitres * 1.0567).toFixed(1)} qt ({vessel.capacityLitres.toFixed(1)} L)</dd></div>
              <div><dt>material</dt><dd>{vessel.material.name}</dd></div>
            </dl>
          ) : null}
          {vessel?.lid ? (
            <>
              <div className="ma-seg" role="group" aria-label="lid seal">
                {LID_SEALS.map((seal) => (
                  <button key={seal} type="button"
                    className={(lidSeal || vessel.lid!.seal) === seal ? "is-active" : undefined}
                    onClick={() => setLidSeal(seal)}>{seal}</button>
                ))}
              </div>
              <Field label="burner power" unit="W" value={burnerW} onChange={setBurnerW} min={0} />
            </>
          ) : vessel ? (
            <p className="ma-note">Open pan (no lid fitted).</p>
          ) : null}
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>05</span> solve summary</legend>
          <p className="ma-summary">
            {s.ingredient.name} · {halfDimensionMm} mm {geometry} · {massG} g ·{" "}
            {methodId.replace(/_/g, " ")} · {vessel ? vessel.name : "direct air"}
          </p>
          <p className="ma-note">Recomputed in real time on every input change.</p>
        </fieldset>
      </section>

      {/* ── Result rail ─────────────────────────────────────────────────── */}
      <section className="ma-results" aria-label="results">
        {/* Time to Core & Doneness Card */}
        <article className="ma-card">
          <h3>estimated cook time to core</h3>
          <Value reading={s.coreTime}>
            {(t) => (
              <>
                <p className="ma-headline">{t.minutes.toFixed(0)}<em>min</em></p>
                <div className="mt-3 rounded-md bg-white/5 p-2.5 text-xs text-white/80 border border-white/10">
                  <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <span>⏱️</span> Resting Carryover Advice
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {unit === "fahrenheit"
                      ? carryover.restAdvice
                      : `Pull at ${Math.round(carryover.pullTempC)}°C. Carryover heat will rise to ${Math.round(targetC)}°C during a ${carryover.restMinutes}-minute rest.`}
                  </p>
                </div>
                <dl className="ma-stats mt-3">
                  <div><dt>target core</dt><dd>{formatTemp(targetC)}</dd></div>
                  <div><dt>pull temp</dt><dd>{unit === "fahrenheit" ? `${carryover.pullTempF}°F` : `${Math.round(carryover.pullTempC)}°C`}</dd></div>
                  <div><dt>carryover rise</dt><dd>+{unit === "fahrenheit" ? `${carryover.carryoverRiseF}°F` : `${(carryover.carryoverRiseF * 5 / 9).toFixed(1)}°C`}</dd></div>
                </dl>
                {!t.oneTermValid ? (
                  <p className="ma-warn mt-2">
                    Thin cutlet: Transient heating is fast; check internal temperature early with an instant-read probe.
                  </p>
                ) : null}
              </>
            )}
          </Value>
        </article>

        {/* Surface Searing & Browning State */}
        <article className="ma-card">
          <h3>surface browning &amp; sear</h3>
          <Value reading={s.surfaceState}>
            {(v) => (
              <>
                <p className="ma-headline">
                  ≥&nbsp;{formatTemp(v.lowerBoundC)}
                </p>
                <p className="ma-note">
                  Minimum surface temperature while moisture evaporates. Once dried, crust heats to medium temperature.
                </p>
                <dl className="ma-stats">
                  <div><dt>water boil ceiling</dt><dd>{formatTemp(v.ceilingC, 1)}</dd></div>
                  <div><dt>browning possible</dt><dd>{v.canBrown ? "Yes (≥ 285°F / 140°C)" : "No (wet surface)"}</dd></div>
                </dl>
                <p className={v.canBrown ? "ma-note font-medium text-amber-200 mt-2" : "ma-warn mt-2"}>
                  {v.browningNote}
                </p>
              </>
            )}
          </Value>
        </article>

        {/* Water Evaporation Loss Card */}
        <article className="ma-card">
          <h3>moisture evaporation</h3>
          <Value reading={s.waterLoss}>
            {(w) => (
              <>
                <p className="ma-headline">
                  {w.gramsPerHour.toFixed(0)}<em>g/h</em>
                </p>
                <p className="text-xs text-white/50 mb-2">
                  ≈ {(w.gramsPerHour * 0.033814).toFixed(1)} fl oz per hour evaporation loss
                </p>
                <dl className="ma-stats">
                  <div><dt>latent heat loss</dt><dd>{w.latentWatts.toFixed(0)} W</dd></div>
                  {w.covered ? (
                    <>
                      <div><dt>lid moisture return</dt><dd>{w.covered.returnedGramsPerHour.toFixed(0)} g/h</dd></div>
                      <div><dt>retained moisture</dt><dd>{(w.covered.returnFraction * 100).toFixed(0)} %</dd></div>
                    </>
                  ) : null}
                </dl>
                {w.covered?.holding ? (
                  <p className="ma-note mt-2 text-emerald-300">
                    Lid condenses all generated steam: zero net moisture loss (braising mode).
                  </p>
                ) : null}
              </>
            )}
          </Value>
        </article>

        {/* Heat Bottleneck & Technique Breakdown */}
        <article className="ma-card ma-card--wide">
          <h3>heat flow bottleneck breakdown</h3>
          <Value reading={s.bottleneck}>
            {(n) => (
              <ResistanceChain
                network={n}
                caption={`Primary heat bottleneck: ${n.controlling.label} (${(n.controlling.share * 100).toFixed(0)}% of total delay).`}
              />
            )}
          </Value>
        </article>
      </section>
    </div>
  );
}

/** Stacked composition bar */
function CompositionBar({ ingredient }: { ingredient: SolverIngredient }): React.JSX.Element {
  const parts = [
    ["water", ingredient.composition.water],
    ["protein", ingredient.composition.protein],
    ["fat", ingredient.composition.fat],
    ["carbohydrate", ingredient.composition.carbohydrate],
    ["ash", ingredient.composition.ash],
  ] as const;
  const sum = parts.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="ma-comp">
      <div className="ma-comp__bar">
        {parts.map(([name, v]) => (
          <span key={name} className={`ma-comp__seg ma-comp__seg--${name}`}
            style={{ width: `${v * 100}%` }} title={`${name} ${(v * 100).toFixed(1)} %`} />
        ))}
      </div>
      <ul className="ma-comp__legend">
        {parts.map(([name, v]) => (
          <li key={name}><i className={`ma-comp__key ma-comp__seg--${name}`} />{name} {(v * 100).toFixed(1)}%</li>
        ))}
      </ul>
      <p className="ma-basis">
        {ingredient.fdcId ? (
          <>USDA FDC #{ingredient.fdcId}{ingredient.retrieved ? ` · retrieved ${ingredient.retrieved}` : ""}</>
        ) : (
          <span className="ma-absent">no source recorded</span>
        )}
        {" · proximate sum "}{sum.toFixed(3)}
      </p>
    </div>
  );
}

function GeometryGlyph({ geometry }: { geometry: FoodGeometry }): React.JSX.Element {
  return (
    <svg viewBox="0 0 40 32" aria-hidden="true" className="ma-glyph">
      {geometry === "slab" ? (
        <>
          <rect x="6" y="10" width="28" height="12" />
          <line x1="20" y1="10" x2="20" y2="16" strokeDasharray="2 2" />
        </>
      ) : geometry === "cylinder" ? (
        <>
          <ellipse cx="20" cy="9" rx="9" ry="3.5" />
          <path d="M11 9v14c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V9" />
          <line x1="20" y1="9" x2="29" y2="9" strokeDasharray="2 2" />
        </>
      ) : (
        <>
          <circle cx="20" cy="16" r="10" />
          <line x1="20" y1="16" x2="30" y2="16" strokeDasharray="2 2" />
        </>
      )}
    </svg>
  );
}

function Field({
  label, unit, value, onChange, min, max,
}: {
  label: string; unit: string; value: number;
  onChange: (v: number) => void; min?: number; max?: number;
}): React.JSX.Element {
  return (
    <label className="ma-field">
      <span>{label}</span>
      <span className="ma-field__input">
        <input type="number" value={value} min={min} max={max}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(next);
          }} />
        <em>{unit}</em>
      </span>
    </label>
  );
}

function Derived({ label, value, note }: { label: string; value: string; note?: string }): React.JSX.Element {
  return (
    <p className="ma-derived">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <em>{note}</em> : null}
    </p>
  );
}
