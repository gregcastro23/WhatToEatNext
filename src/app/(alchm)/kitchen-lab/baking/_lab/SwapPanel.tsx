"use client";

import { useMemo, useState, type JSX } from "react";
import { bakingIngredient } from "@/data/baking";
import type { Formula, Reading } from "@/lib/baking/formulaTypes";
import { DEFAULT_PATCH_SETS, PATCH_CAPS, solvePatch, type PatchResult } from "@/lib/baking/patchSolver";
import { substituteCandidates, swapLine, type SwapBasis } from "@/lib/baking/substitution";
import { thermalPatch, type ThermalPatch } from "@/lib/baking/thermalPatch";
import { DeltaBars } from "./DeltaBars";
import { fmtSigned, fmtTemp, fmtTempDelta } from "./format";
import { reading, type BakingLab } from "./useBakingLab";

const SWAP_BASES: readonly SwapBasis[] = ["matched", "mass"];

interface SwapChoice {
  line: number;
  substituteId: string;
  basis: SwapBasis;
  allowed: readonly string[];
}

function defaultChoice(formula: Formula, line: number): SwapChoice | null {
  const current = formula.lines[line];
  if (current === undefined) return null;
  const candidates = substituteCandidates(current.ingredientId);
  const [first] = candidates;
  if (first === undefined) return null;
  return { line, substituteId: first.id, basis: "matched", allowed: DEFAULT_PATCH_SETS[bakingIngredient(current.ingredientId).category] };
}

function Chooser({ lab, choice, onChange }: { lab: BakingLab; choice: SwapChoice; onChange: (c: SwapChoice) => void }): JSX.Element {
  const current = lab.state.formula.lines[choice.line];
  const candidates = current === undefined ? [] : substituteCandidates(current.ingredientId);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="bl-label" htmlFor="bl-swap-line">Swap</label>
      <select id="bl-swap-line" className="bl-input" value={choice.line} onChange={(e) => { const next = defaultChoice(lab.state.formula, Number(e.target.value)); if (next !== null) onChange(next); }}>
        {lab.state.formula.lines.map((l, i) => (
          <option key={`${l.ingredientId}-${i}`} value={i}>
            {bakingIngredient(l.ingredientId).name} ({l.grams.toFixed(0)} g)
          </option>
        ))}
      </select>
      <label className="bl-label" htmlFor="bl-swap-sub">for</label>
      <select id="bl-swap-sub" className="bl-input" value={choice.substituteId} onChange={(e) => onChange({ ...choice, substituteId: e.target.value })}>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <span className="bl-label">by</span>
      {SWAP_BASES.map((b) => (
        <button key={b} type="button" className="bl-btn" aria-pressed={choice.basis === b} onClick={() => onChange({ ...choice, basis: b })}>
          {b === "matched" ? "matched function" : "same grams"}
        </button>
      ))}
    </div>
  );
}

function AllowedPatchIngredients({ choice, onChange }: { choice: SwapChoice; onChange: (c: SwapChoice) => void }): JSX.Element {
  const toggle = (id: string): void => onChange({ ...choice, allowed: choice.allowed.includes(id) ? choice.allowed.filter((a) => a !== id) : [...choice.allowed, id] });
  return (
    <fieldset className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <legend className="bl-label mb-1">Patch may use</legend>
      {Object.keys(PATCH_CAPS).map((id) => (
        <button key={id} type="button" className="bl-btn" aria-pressed={choice.allowed.includes(id)} onClick={() => toggle(id)}>
          {bakingIngredient(id).name}
        </button>
      ))}
    </fieldset>
  );
}

function PatchCard({ patch, onApply }: { patch: PatchResult; onApply: (f: Formula) => void }): JSX.Element {
  return (
    <div className="bl-card mt-4">
      <h3 className="text-lg">Counter-balance patch</h3>
      {patch.adjustments.length === 0 ? <p className="text-sm text-white/60">No adjustment from the allowed ingredients improves the match.</p> : null}
      <ul className="space-y-2 text-sm">
        {patch.adjustments.map((a) => (
          <li key={a.ingredientId}>
            <span className="bl-num mr-2 font-semibold">{fmtSigned(a.deltaGrams, 1, " g")}</span>
            <strong>{a.name}</strong> — <span className="text-white/70">{a.explanation}</span>
          </li>
        ))}
      </ul>
      {patch.unresolved.length > 0 ? (
        <p className="mt-3 text-[12px] text-amber-200/80">
          Still off after the patch: {patch.unresolved.map((u) => `${u.label} ${u.patched.toFixed(1)} vs ${u.original.toFixed(1)} ${u.unit}`).join("; ")}. Allow another patch ingredient, or adjust a line by hand.
        </p>
      ) : null}
      <p className="bl-num mt-2 text-[11px] text-white/40">
        misfit {patch.misfitBefore.toFixed(2)} → {patch.misfitAfter.toFixed(2)} (0 = every target restored)
      </p>
      <button type="button" className="bl-btn is-primary mt-3" onClick={() => onApply(patch.patched)}>
        Apply swap + counter-balance patch
      </button>
    </div>
  );
}

function ThermalCard({ lab, patch, onShowOven }: { lab: BakingLab; patch: PatchResult; onShowOven: () => void }): JSX.Element {
  const [result, setResult] = useState<Reading<ThermalPatch> | null>(null);
  const { state } = lab;
  const compute = (): void => {
    const base = { process: state.process, geometry: state.geometry, oven: state.oven, doneCoreC: state.doneCoreC };
    setResult(thermalPatch({ ...base, formula: state.formula }, { ...base, formula: patch.patched }, { kitchenC: 20, kitchenRhPct: 50 }));
  };
  return (
    <div className="bl-card mt-4">
      <h3 className="text-lg">Thermal patch</h3>
      <p className="text-[12px] text-white/55">Re-runs the oven simulator to find the setting that gives the patched formula the original&apos;s crust colour by the end of the bake.</p>
      <button type="button" className="bl-btn mt-2" onClick={compute}>
        Find the oven setting
      </button>
      {result === null ? null : result.available ? (
        <div className="mt-3 text-sm">
          <p>
            <span className="bl-num font-semibold">{fmtTemp(result.value.ovenC, state.unit)}</span> ({fmtTempDelta(result.value.deltaC, state.unit)}) for <span className="bl-num font-semibold">{result.value.bakeMinutes} min</span> ({fmtSigned(result.value.deltaMinutes, 1, " min")})
          </p>
          <p className="mt-1 text-white/70">{result.value.reason}</p>
          <button type="button" className="bl-btn is-primary mt-2" onClick={() => { lab.dispatch({ type: "formula", formula: patch.patched }); lab.dispatch({ type: "oven", patch: { ovenC: result.value.ovenC, bakeMinutes: result.value.bakeMinutes } }); onShowOven(); }}>
            Apply formula + oven patch and bake
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-amber-200/80">{result.reason}</p>
      )}
    </div>
  );
}

export function SwapPanel({ lab, onShowOven }: { lab: BakingLab; onShowOven: () => void }): JSX.Element {
  const [choice, setChoice] = useState<SwapChoice | null>(() => defaultChoice(lab.state.formula, 0));
  const { formula } = lab.state;
  const live = useMemo(() => (choice !== null && choice.line < formula.lines.length ? choice : defaultChoice(formula, 0)), [choice, formula]);
  const patch = useMemo(
    () => (live === null ? null : reading(() => solvePatch(formula, swapLine(formula, live.line, live.substituteId, live.basis).formula, live.allowed))),
    [formula, live],
  );
  if (live === null) return <div className="bl-card text-sm text-white/60">Nothing in this formula has a substitute in the database.</div>;
  return (
    <div>
      <div className="bl-card">
        <h2 className="text-xl">Smart swap &amp; delta inspector</h2>
        <Chooser lab={lab} choice={live} onChange={setChoice} />
        <AllowedPatchIngredients choice={live} onChange={setChoice} />
        {patch === null ? null : patch.available ? (
          <div className="mt-4">
            <p className="bl-label mb-1">Functional delta ΔĪ</p>
            <DeltaBars swap={patch.value.swapDelta} patched={patch.value.patchedDelta} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-amber-200/80">{patch.reason}</p>
        )}
      </div>
      {patch?.available ? <PatchCard patch={patch.value} onApply={(f) => lab.dispatch({ type: "formula", formula: f })} /> : null}
      {patch?.available ? <ThermalCard key={`${live.line}-${live.substituteId}-${live.basis}`} lab={lab} patch={patch.value} onShowOven={onShowOven} /> : null}
    </div>
  );
}
