"use client";

import type { JSX } from "react";

/**
 * The cauldron's charge: ingredients added in stages, by volume or mass.
 *
 * Ported from the tilt-skillet planner's batch builder. Each row is free
 * text resolved against the elemental catalog; amounts and units feed the
 * same quantity weighting (`calculateQuantityFactor`) the planner used.
 *
 * @file src/components/lab/cauldron/StageEditor.tsx
 */

export type Unit = "cup" | "l" | "ml" | "tbsp" | "tsp" | "g" | "kg" | "piece";
export const UNITS: readonly Unit[] = ["cup", "l", "ml", "tbsp", "tsp", "g", "kg", "piece"];

export interface IngredientRow {
  name: string;
  amount: number;
  unit: Unit;
}

export interface StageRow {
  name: string;
  ingredients: IngredientRow[];
}

/** The planner's two starting stages, kept so the circuit has something to read on load. */
export const DEFAULT_STAGES: readonly StageRow[] = [
  {
    name: "Sear the base",
    ingredients: [
      { name: "olive oil", amount: 0.25, unit: "cup" },
      { name: "beef", amount: 4, unit: "cup" },
      { name: "onion", amount: 2, unit: "cup" },
      { name: "garlic", amount: 0.25, unit: "cup" },
    ],
  },
  {
    name: "Braise the bulk",
    ingredients: [
      { name: "stock", amount: 6, unit: "cup" },
      { name: "tomato", amount: 3, unit: "cup" },
      { name: "carrot", amount: 2, unit: "cup" },
    ],
  },
];

function isUnit(value: string): value is Unit {
  return UNITS.some((u) => u === value);
}

const INPUT =
  "rounded border border-white/15 bg-black/20 px-2 py-1 text-xs text-white/85 focus:border-white/40 focus:outline-none";

function IngredientEditor({
  row,
  onChange,
  onRemove,
}: {
  row: IngredientRow;
  onChange: (next: IngredientRow) => void;
  onRemove: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        aria-label="Ingredient"
        value={row.name}
        onChange={(e) => onChange({ ...row, name: e.target.value })}
        className={`${INPUT} min-w-0 flex-1`}
        placeholder="ingredient"
      />
      <input
        aria-label="Amount"
        type="number"
        min={0}
        step={0.25}
        value={row.amount}
        onChange={(e) => onChange({ ...row, amount: Number(e.target.value) })}
        className={`${INPUT} w-16 font-mono`}
      />
      <select
        aria-label="Unit"
        value={row.unit}
        onChange={(e) => {
          if (isUnit(e.target.value)) onChange({ ...row, unit: e.target.value });
        }}
        className={INPUT}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <button type="button" onClick={onRemove} className="px-1 text-xs text-white/40 hover:text-white/80" aria-label={`Remove ${row.name || "ingredient"}`}>
        ✕
      </button>
    </div>
  );
}

function StageCard({
  stage,
  index,
  onChange,
  onRemove,
}: {
  stage: StageRow;
  index: number;
  onChange: (next: StageRow) => void;
  onRemove: () => void;
}): JSX.Element {
  const setIngredient = (i: number, next: IngredientRow): void =>
    onChange({ ...stage, ingredients: stage.ingredients.map((g, j) => (j === i ? next : g)) });
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-white/35">{String(index + 1).padStart(2, "0")}</span>
        <input
          aria-label={`Stage ${index + 1} name`}
          value={stage.name}
          onChange={(e) => onChange({ ...stage, name: e.target.value })}
          className={`${INPUT} flex-1`}
        />
        <button type="button" onClick={onRemove} className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/80">
          Remove stage
        </button>
      </div>
      {stage.ingredients.map((row, i) => (
        <IngredientEditor
          key={i}
          row={row}
          onChange={(next) => setIngredient(i, next)}
          onRemove={() => onChange({ ...stage, ingredients: stage.ingredients.filter((_, j) => j !== i) })}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...stage, ingredients: [...stage.ingredients, { name: "", amount: 1, unit: "cup" }] })}
        className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white/85"
      >
        + Ingredient
      </button>
    </div>
  );
}

export function StageEditor({
  stages,
  onChange,
}: {
  stages: readonly StageRow[];
  onChange: (next: StageRow[]) => void;
}): JSX.Element {
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => (
        <StageCard
          key={i}
          stage={stage}
          index={i}
          onChange={(next) => onChange(stages.map((s, j) => (j === i ? next : s)))}
          onRemove={() => onChange(stages.filter((_, j) => j !== i))}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...stages, { name: `Stage ${stages.length + 1}`, ingredients: [{ name: "", amount: 1, unit: "cup" }] }])}
        className="rounded border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wider text-white/60 hover:border-white/35 hover:text-white"
      >
        + Stage
      </button>
    </div>
  );
}
