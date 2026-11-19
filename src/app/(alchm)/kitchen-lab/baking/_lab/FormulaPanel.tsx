"use client";

import { useState, type JSX } from "react";
import { BAKING_INGREDIENTS, bakingIngredient, CATEGORY_LABELS } from "@/data/baking";
import type { FormulaTelemetry } from "@/lib/baking/formulaTypes";
import type { BakingCategory } from "@/lib/baking/types";
import { DraftNumberInput } from "./DraftNumberInput";
import { fmtNum } from "./format";
import { isModifiedFromBaseline, type BakingLab, type LabState } from "./useBakingLab";

const CATEGORIES = Object.keys(CATEGORY_LABELS).filter((k): k is BakingCategory => Object.hasOwn(CATEGORY_LABELS, k));

function IngredientSelect({ value, onChange, label }: { value: string; onChange: (id: string) => void; label: string }): JSX.Element {
  return (
    <select className="bl-input max-w-[15rem]" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {CATEGORIES.map((category) => (
        <optgroup key={category} label={CATEGORY_LABELS[category]}>
          {BAKING_INGREDIENTS.filter((i) => i.category === category).map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

interface RowProps {
  lab: BakingLab;
  index: number;
  telemetry: FormulaTelemetry | null;
}

function FormulaRow({ lab, index, telemetry }: RowProps): JSX.Element | null {
  const line = lab.state.formula.lines[index];
  if (line === undefined) return null;
  const ingredient = bakingIngredient(line.ingredientId);
  const bakers = telemetry?.bakersPercent[index] ?? null;
  const locked = lab.state.limitLine === index;
  return (
    <tr>
      <td>
        <IngredientSelect label={`Ingredient on line ${index + 1}`} value={line.ingredientId} onChange={(id) => lab.dispatch({ type: "ingredient", line: index, id })} />
      </td>
      <td>
        <DraftNumberInput
          className="bl-input bl-num w-24 text-right"
          label={`${ingredient.name} grams`}
          value={line.grams}
          min={0}
          max={100000}
          step={1}
          digits={1}
          onCommit={(grams) => lab.dispatch({ type: "grams", line: index, grams })}
        />
      </td>
      <td className="bl-num text-right">{bakers === null ? "—" : `${bakers.toFixed(1)} %`}</td>
      <td className="hidden md:table-cell">
        <span className="flex flex-wrap gap-1">
          {ingredient.roles.slice(0, 4).map((r) => (
            <span key={r} className="bl-chip">
              {r}
            </span>
          ))}
        </span>
      </td>
      <td className="whitespace-nowrap text-right">
        <button type="button" className="bl-btn mr-1" aria-pressed={locked} title="Hold this line fixed and scale the rest around it" onClick={() => lab.dispatch({ type: "lock", line: locked ? null : index })}>
          {locked ? "Limiting" : "Limit"}
        </button>
        <button type="button" className="bl-btn" aria-label={`Remove ${ingredient.name}`} onClick={() => lab.dispatch({ type: "remove", line: index })}>
          ✕
        </button>
      </td>
    </tr>
  );
}

function LimitScaler({ lab }: { lab: BakingLab }): JSX.Element | null {
  const index = lab.state.limitLine;
  const line = index === null ? undefined : lab.state.formula.lines[index];
  const [have, setHave] = useState("");
  if (index === null || line === undefined) {
    return <p className="mt-3 text-xs text-white/45">Mark one line as <em>Limit</em> to scale the whole batch around what you actually have.</p>;
  }
  const grams = Number(have);
  const valid = Number.isFinite(grams) && grams > 0;
  return (
    <form
      className="mt-3 flex flex-wrap items-center gap-2 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) lab.dispatch({ type: "scale-to", line: index, grams });
      }}
    >
      <label htmlFor="bl-have">I only have</label>
      <input id="bl-have" className="bl-input bl-num w-24 text-right" type="number" min={0} value={have} onChange={(e) => setHave(e.target.value)} placeholder={line.grams.toFixed(0)} />
      <span>g of {bakingIngredient(line.ingredientId).name}</span>
      <button type="submit" className="bl-btn is-primary" disabled={!valid}>
        Scale batch ×{valid ? (grams / line.grams).toFixed(3) : "—"}
      </button>
    </form>
  );
}

function AddLine({ lab }: { lab: BakingLab }): JSX.Element {
  const [id, setId] = useState("water");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <IngredientSelect label="Ingredient to add" value={id} onChange={setId} />
      <button type="button" className="bl-btn" onClick={() => lab.dispatch({ type: "add", id })}>
        + Add line
      </button>
    </div>
  );
}

export function formatFormulaMarkdown(state: LabState, t: FormulaTelemetry | null): string {
  const rows = state.formula.lines.map((l, i) => {
    const ing = bakingIngredient(l.ingredientId);
    const bp = t?.bakersPercent[i] ?? null;
    return `| ${ing.name} | ${l.grams.toFixed(1)} g | ${bp === null ? "—" : `${bp.toFixed(1)} %`} |`;
  });
  const hydration = t?.trueHydrationPct === null || t === null ? "—" : `${t.trueHydrationPct.toFixed(1)} %`;
  const aw = t?.waterActivity.available ? t.waterActivity.value.aw.toFixed(3) : "—";
  const stage2 = state.oven.stage2OvenC ? ` → ${state.oven.stage2OvenC} °C after ${state.oven.stage1Minutes ?? Math.round(state.oven.bakeMinutes / 2)} min` : "";
  return [
    `### ${state.formula.name}`,
    `Flour base: ${fmtNum(t?.flourGrams ?? null, 0)} g · True hydration: ${hydration} · Water activity (a_w): ${aw} · Oven: ${state.oven.ovenC} °C${stage2} for ${state.oven.bakeMinutes} min (${state.oven.mode})`,
    "",
    "| Ingredient | Grams | Baker's % |",
    "| :--- | ---: | ---: |",
    ...rows,
  ].join("\n");
}

function FormulaHeader({ lab, t }: { lab: BakingLab; t: FormulaTelemetry | null }): JSX.Element {
  const modified = isModifiedFromBaseline(lab.state);
  const [copied, setCopied] = useState(false);
  const copyFormula = (): void => {
    const md = formatFormulaMarkdown(lab.state, t);
    navigator.clipboard
      .writeText(md)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {
        setCopied(false);
      });
  };
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl">{lab.state.formula.name}</h2>
        {modified ? <span className="bl-chip text-amber-300">Modified from preset</span> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="bl-num text-xs text-white/50">
          flour base {fmtNum(t?.flourGrams ?? null, 0)} g · true hydration {t?.trueHydrationPct === null || t === null ? "—" : `${t.trueHydrationPct.toFixed(1)} %`}
        </span>
        {modified ? (
          <button type="button" className="bl-btn" onClick={() => lab.dispatch({ type: "reset" })}>
            Reset to original
          </button>
        ) : null}
        <button type="button" className="bl-btn" onClick={copyFormula}>
          {copied ? "Copied formula" : "Copy baker's formula"}
        </button>
      </div>
    </div>
  );
}

export function FormulaPanel({ lab }: { lab: BakingLab }): JSX.Element {
  const { telemetry } = lab.derived;
  const t = telemetry.available ? telemetry.value : null;
  return (
    <div className="bl-card">
      <FormulaHeader lab={lab} t={t} />
      <div className="overflow-x-auto">
        <table className="bl-table">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col" className="text-right">Grams</th>
              <th scope="col" className="text-right">Baker&apos;s %</th>
              <th scope="col" className="hidden md:table-cell">Function</th>
              <th scope="col" className="text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lab.state.formula.lines.map((line, i) => (
              <FormulaRow key={`${line.ingredientId}-${i}`} lab={lab} index={i} telemetry={t} />
            ))}
          </tbody>
        </table>
      </div>
      <AddLine lab={lab} />
      <LimitScaler lab={lab} />
      {telemetry.available ? null : <p className="mt-3 text-sm text-amber-200/80">{telemetry.reason}</p>}
    </div>
  );
}
