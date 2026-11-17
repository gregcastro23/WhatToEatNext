"use client";

import { SOLVABLE_INGREDIENTS, type SolverIngredient } from "@/lib/cooking/labSolver";
import { celsiusToFahrenheit, fahrenheitToCelsius, type TemperatureUnit } from "@/lib/cooking/temperatureUnits";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import type React from "react";

export function filterIngredients(query: string): readonly SolverIngredient[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return SOLVABLE_INGREDIENTS;
  return SOLVABLE_INGREDIENTS.filter((item) => {
    const fdcMatch = item.fdcId !== undefined && String(item.fdcId).includes(normalized);
    return item.name.toLowerCase().includes(normalized) || fdcMatch;
  });
}

export function toDisplayTemp(celsius: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? Math.round(celsiusToFahrenheit(celsius)) : celsius;
}

export function fromDisplayTemp(value: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? fahrenheitToCelsius(value) : value;
}

export function IngredientSelect({
  filtered,
  ingredientId,
  onSelect,
}: {
  filtered: readonly SolverIngredient[];
  ingredientId: string;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  return (
    <select
      aria-label="Ingredient"
      value={filtered.length > 0 ? ingredientId : ""}
      onChange={(e) => {
        if (e.target.value) onSelect(e.target.value);
      }}
    >
      {filtered.length === 0 ? (
        <option value="" disabled>No matching solvable ingredients</option>
      ) : (
        filtered.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}{item.fdcId !== undefined ? ` · FDC #${item.fdcId}` : ""}
          </option>
        ))
      )}
    </select>
  );
}

export function CompositionBar({ ingredient }: { ingredient: SolverIngredient }): React.JSX.Element {
  const parts = [
    ["water", ingredient.composition.water],
    ["protein", ingredient.composition.protein],
    ["fat", ingredient.composition.fat],
    ["carbohydrate", ingredient.composition.carbohydrate],
    ["ash", ingredient.composition.ash],
  ] as const;
  const sum = parts.reduce((acc, [, value]) => acc + value, 0);
  return (
    <div className="ma-comp">
      <div className="ma-comp__bar">
        {parts.map(([name, value]) => (
          <span
            key={name}
            className={`ma-comp__seg ma-comp__seg--${name}`}
            style={{ width: `${value * 100}%` }}
            title={`${name} ${(value * 100).toFixed(1)} %`}
          />
        ))}
      </div>
      <ul className="ma-comp__legend">
        {parts.map(([name, value]) => (
          <li key={name}>
            <i className={`ma-comp__key ma-comp__seg--${name}`} />
            {name} {(value * 100).toFixed(1)}%
          </li>
        ))}
      </ul>
      <p className="ma-basis">
        {ingredient.fdcId !== undefined ? (
          <>USDA FDC #{ingredient.fdcId}{ingredient.retrieved ? ` · retrieved ${ingredient.retrieved}` : ""}</>
        ) : (
          <span className="ma-absent">no source recorded</span>
        )}
        {" · proximate sum "}{sum.toFixed(3)}
      </p>
    </div>
  );
}

export function GeometryGlyph({ geometry }: { geometry: FoodGeometry }): React.JSX.Element {
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

export function Field({
  label,
  unit,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}): React.JSX.Element {
  return (
    <label className="ma-field">
      <span>{label}</span>
      <span className="ma-field__input">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
        />
        <em>{unit}</em>
      </span>
    </label>
  );
}

export function Derived({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}): React.JSX.Element {
  return (
    <p className="ma-derived">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <em>{note}</em> : null}
    </p>
  );
}
