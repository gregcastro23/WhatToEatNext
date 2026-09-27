/**
 * Vitamins and minerals as labelled % Daily Value, never as amounts (owner
 * ruling 2026-09-27, option c). See `utils/dailyValueFractions`.
 */

import React from "react";
import {
  DAILY_VALUE_BASIS,
  LOWER_BOUND_NOTE,
  dailyValueEntries,
  formatDailyValue,
  listedByNote,
  type DailyValueEntry,
} from "@/utils/dailyValueFractions";

interface DailyValueProps {
  /** A recipe's `nutrition`, per serving. */
  nutrition: unknown;
  servings: number;
}

/** Rows for a Nutrition Facts panel: name, then "≥12%" in the % DV column. */
export function DailyValueLabelRows({ nutrition, servings }: DailyValueProps): React.JSX.Element {
  const entries = dailyValueEntries(nutrition, servings);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-1">
        No vitamin or mineral data for this recipe.
      </p>
    );
  }
  return (
    <div data-testid="daily-value-rows">
      {entries.map((entry) => (
        <div
          key={entry.nutrient}
          className="flex justify-between py-0.5 border-b border-gray-100"
          title={listedByNote(entry)}
        >
          <span className="text-sm">{entry.label}</span>
          <span className="text-sm font-mono text-gray-700">
            {formatDailyValue(entry)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Chips({ title, entries, extra }: {
  title: string;
  entries: DailyValueEntry[];
  extra: Array<{ label: string; text: string }>;
}): React.JSX.Element | null {
  if (entries.length === 0 && extra.length === 0) return null;
  return (
    <div>
      <h4 className="font-medium text-sm text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {extra.map(({ label, text }) => (
          <span key={label} className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">
            {label}: {text}
          </span>
        ))}
        {entries.map((entry) => (
          <span
            key={entry.nutrient}
            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
            title={listedByNote(entry)}
          >
            {entry.label}: {formatDailyValue(entry)} DV
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Vitamin and mineral chips. `amounts` are minerals published in mg (sodium,
 * potassium), shown ahead of the %DV chips with their unit.
 */
export function DailyValueChips({
  nutrition,
  servings,
  amounts = [],
}: DailyValueProps & { amounts?: Array<{ label: string; text: string }> }): React.JSX.Element | null {
  const entries = dailyValueEntries(nutrition, servings);
  if (entries.length === 0 && amounts.length === 0) return null;
  return (
    <div className="space-y-3" data-testid="daily-value-chips">
      <Chips title="Vitamins" entries={entries.filter((e) => e.group === "vitamins")} extra={[]} />
      <Chips title="Minerals" entries={entries.filter((e) => e.group === "minerals")} extra={amounts} />
      {entries.length > 0 && <DailyValueFootnote marker="" />}
    </div>
  );
}

/** The basis every %DV figure carries. `marker` ties it to a "†" in a panel. */
export function DailyValueFootnote({ marker = "†" }: { marker?: string }): React.JSX.Element {
  return (
    <p className="text-xs text-gray-500">
      {marker ? `${marker} ` : ""}
      {DAILY_VALUE_BASIS} {LOWER_BOUND_NOTE}
    </p>
  );
}
