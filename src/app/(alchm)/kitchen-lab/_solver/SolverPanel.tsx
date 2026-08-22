"use client";

/**
 * The guided solver — ruling 2's "procedure" is the tool's own input sequence.
 *
 * Five steps, all open and editable at once, with a result rail that recomputes
 * on every keystroke. Not a wizard: there is no Next button, because the engine
 * answers in well under a millisecond and pacing a user through a form would be
 * theatre.
 *
 * ── Where the honesty lives ─────────────────────────────────────────────────
 *
 * `solveArrangement` returns every output as a `Reading<T>` — a value, or a
 * sentence saying why not. This component renders the reason. There is one
 * helper, {@link Value}, and it is the only path to the screen for a solver
 * output, so a refusal cannot be turned into a number by an inattentive edit.
 *
 * The ingredient picker lists ONLY what can be solved. `[MEASURED 2026-08-18]`
 * that is 40 of 931; the count is printed, because a picker that listed 931 and
 * failed on 891 would be this codebase's recurring defect in a new costume.
 *
 * @file src/app/(alchm)/lab/_solver/SolverPanel.tsx
 */
import { useMemo, useState } from "react";
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
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { ResistanceChain } from "./ResistanceChain";

/** Methods that declare a heat transfer coefficient, in registry order. */
const METHOD_IDS = Object.keys(METHOD_PHYSICS).sort();

const GEOMETRIES: Array<{ id: FoodGeometry; label: string; dimension: string }> = [
  { id: "slab", label: "slab", dimension: "half-thickness" },
  { id: "cylinder", label: "cylinder", dimension: "radius" },
  { id: "sphere", label: "sphere", dimension: "radius" },
];

const LID_SEALS: LidSeal[] = ["none", "cracked", "loose", "tight"];

/**
 * The ONLY way a solver output reaches the screen.
 *
 * Funnelling every reading through one component is what makes the honesty
 * rule enforceable rather than aspirational: there is no second path where
 * someone could write `reading.value` without having handled the other branch.
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
  const [ingredientId, setIngredientId] = useState("chicken");
  const [geometry, setGeometry] = useState<FoodGeometry>("slab");
  const [halfDimensionMm, setHalfDimensionMm] = useState(20);
  const [massG, setMassG] = useState(250);
  const [startC, setStartC] = useState(5);
  const [targetC, setTargetC] = useState(74);
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
      // An unknown id is a bug in this component, not a fact about the world.
      // Surfacing it plainly beats an empty board that looks like a valid answer.
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

  return (
    <div className="ma-solver">
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
            {SOLVABLE_INGREDIENT_COUNT} of {TOTAL_INGREDIENT_COUNT} ingredients carry a proximate
            composition. The rest cannot be solved at all — Choi–Okos needs water and ash.
          </p>
          <CompositionBar ingredient={s.ingredient} />
          {s.compositionWarning ? <p className="ma-warn">{s.compositionWarning}</p> : null}
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>02</span> geometry &amp; state</legend>
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
            <Field label="start" unit="°C" value={startC} onChange={setStartC} />
            <Field label="target" unit="°C" value={targetC} onChange={setTargetC} />
          </div>
          <Derived label="surface area to volume" value={`${s.surfaceAreaToVolumePerM.toFixed(1)} m⁻¹`} />
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>03</span> environment</legend>
          <select value={methodId} onChange={(e) => setMethodId(e.target.value)}>
            {METHOD_IDS.map((id) => <option key={id} value={id}>{id.replace(/_/g, " ")}</option>)}
          </select>
          <p className="ma-chip">standard atmosphere · editable · not weather</p>
          <div className="ma-fields">
            <Field label="kitchen air" unit="°C" value={airC} onChange={setAirC} />
            <Field label="humidity" unit="%" value={rhPct} onChange={setRhPct} min={0} max={100} />
            <Field label="elevation" unit="m" value={elevationM} onChange={setElevationM} />
          </div>
          <Derived
            label="local water ceiling"
            value={`${s.ceilingC.toFixed(1)} °C`}
            note={s.ceilingClamped ? "pressure clamped to the Antoine limit" : undefined}
          />
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>04</span> vessel &amp; lid</legend>
          <select value={vesselId} onChange={(e) => { setVesselId(e.target.value); setLidSeal(""); }}>
            <option value="">no vessel — on a rack, in the air</option>
            {VESSELS_DERIVED.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {vessel ? (
            <dl className="ma-vessel">
              <div><dt>internal ⌀</dt><dd>{vessel.internalDiameterMm} mm</dd></div>
              <div><dt>capacity</dt><dd>{vessel.capacityLitres.toFixed(2)} L</dd></div>
              <div><dt>thermal mass</dt><dd>{vessel.thermalMassJperK.toFixed(0)} J·K⁻¹</dd></div>
              <div><dt>material</dt><dd>{vessel.material.name}</dd></div>
            </dl>
          ) : null}
          {/* A lidless vessel gets no lid control at all — the absence is real. */}
          {vessel?.lid ? (
            <>
              <div className="ma-seg" role="group" aria-label="lid seal">
                {LID_SEALS.map((seal) => (
                  <button key={seal} type="button"
                    className={(lidSeal || vessel.lid!.seal) === seal ? "is-active" : undefined}
                    onClick={() => setLidSeal(seal)}>{seal}</button>
                ))}
              </div>
              <Field label="power into contents" unit="W" value={burnerW} onChange={setBurnerW} min={0} />
              <p className="ma-note">
                A lid&rsquo;s water loss is set by the burner, not by the seal alone — the seal
                fractions in the registry are a coarse index, kept only for callers with no power.
              </p>
            </>
          ) : vessel ? (
            <p className="ma-note">This vessel has no lid, so there is no seal to set.</p>
          ) : null}
        </fieldset>

        <fieldset className="ma-step">
          <legend><span>05</span> solve</legend>
          <p className="ma-summary">
            {s.ingredient.name} · {halfDimensionMm} mm {geometry} · {massG} g ·{" "}
            {methodId.replace(/_/g, " ")} · {vessel ? vessel.name : "no vessel"}
          </p>
          <p className="ma-note">Recomputed on every change. There is nothing to press.</p>
        </fieldset>
      </section>

      {/* ── Result rail ─────────────────────────────────────────────────── */}
      <section className="ma-results" aria-label="results">
        <article className="ma-card">
          <h3>time to core</h3>
          <Value reading={s.coreTime}>
            {(t) => (
              <>
                <p className="ma-headline">{t.minutes.toFixed(0)}<em>min</em></p>
                <dl className="ma-stats">
                  <div><dt>coefficient</dt><dd>{t.hWm2K.toPrecision(2)} W·m⁻²·K⁻¹ <em>±25 %</em></dd></div>
                  <div><dt>Biot</dt><dd>{t.biot.toPrecision(3)}</dd></div>
                  <div><dt>Fourier</dt><dd>{t.fourier.toPrecision(3)}</dd></div>
                </dl>
                {!t.oneTermValid ? (
                  <p className="ma-warn">
                    Fo ≤ 0.2: the one-term series understates the early transient, so this time
                    is optimistic for a piece this thin.
                  </p>
                ) : null}
              </>
            )}
          </Value>
        </article>

        <article className="ma-card">
          <h3>water loss</h3>
          <Value reading={s.waterLoss}>
            {(w) => (
              <>
                <p className="ma-headline">
                  {w.gramsPerHour.toFixed(0)}<em>g·h⁻¹</em>
                </p>
                <dl className="ma-stats">
                  <div><dt>as latent heat</dt><dd>{w.latentWatts.toFixed(0)} W</dd></div>
                  {w.covered ? (
                    <>
                      <div><dt>lid returns</dt><dd>{w.covered.returnedGramsPerHour.toFixed(0)} g·h⁻¹</dd></div>
                      <div><dt>returned share</dt><dd>{(w.covered.returnFraction * 100).toFixed(0)} %</dd></div>
                    </>
                  ) : null}
                </dl>
                {w.covered?.holding ? (
                  <p className="ma-note">
                    The lid condenses everything this power raises: the pot is holding and loses
                    no water at all.
                  </p>
                ) : null}
              </>
            )}
          </Value>
        </article>

        <article className="ma-card">
          <h3>surface state</h3>
          <Value reading={s.surfaceState}>
            {(v) => (
              <>
                <p className="ma-headline">
                  ≥&nbsp;{v.lowerBoundC.toFixed(0)}<em>°C</em>
                </p>
                <p className="ma-note">
                  A lower bound — free water evaporating. Real food, once its surface dries, sits
                  above this.
                </p>
                <dl className="ma-stats">
                  <div><dt>water ceiling</dt><dd>{v.ceilingC.toFixed(1)} °C</dd></div>
                  <div><dt>at the ceiling</dt><dd>{v.saturated ? "yes" : "no"}</dd></div>
                </dl>
                <p className={v.canBrown ? "ma-note" : "ma-warn"}>{v.browningNote}</p>
              </>
            )}
          </Value>
        </article>

        <article className="ma-card ma-card--wide">
          <h3>where the bottleneck is</h3>
          <Value reading={s.bottleneck}>
            {(n) => (
              <ResistanceChain
                network={n}
                caption={`${n.controlling.label} holds ${(n.controlling.share * 100).toFixed(0)} % of the total resistance.`}
              />
            )}
          </Value>
        </article>
      </section>
    </div>
  );
}

/** Stacked composition bar. Widths are the mass fractions, nothing else. */
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
        {" · sums to "}{sum.toFixed(3)}
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
