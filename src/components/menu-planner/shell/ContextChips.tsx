"use client";

/**
 * ContextChips — a single glanceable row of what's shaping this week's
 * suggestions (diet, cuisines, prep time, calorie/protein targets, budget,
 * guests, lunar sync). Each chip opens the matching Plan settings tab.
 *
 * @file src/components/menu-planner/shell/ContextChips.tsx
 */

import { SlidersHorizontal } from "lucide-react";
import React, { useMemo } from "react";
import { z } from "zod";
import { trackViewAction } from "@/components/analytics/PageViewTracker";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { usePlannerUI } from "./PlannerUIContext";
import type { SettingsTab } from "./PlannerUIContext";

interface Chip {
  key: string;
  label: string;
  tab: SettingsTab;
}

const MAX_VISIBLE = 5;

const SafeNutritionalTargetsSchema = z
  .object({
    dailyCalories: z.number().nullable().catch(null),
    dailyProteinG: z.number().nullable().catch(null),
    prioritizeProtein: z.boolean().catch(false),
  })
  .catch({ dailyCalories: null, dailyProteinG: null, prioritizeProtein: false });

const SafeContextPrefsSchema = z
  .object({
    dietaryRestrictions: z.array(z.string()).catch([]),
    preferredCuisines: z.array(z.string()).catch([]),
    excludeIngredients: z.array(z.string()).catch([]),
    maxPrepTimeMinutes: z.number().nullable().catch(null),
    nutritionalTargets: SafeNutritionalTargetsSchema,
  })
  .catch({
    dietaryRestrictions: [],
    preferredCuisines: [],
    excludeIngredients: [],
    maxPrepTimeMinutes: null,
    nutritionalTargets: { dailyCalories: null, dailyProteinG: null, prioritizeProtein: false },
  });

const SafeParticipantsSchema = z.array(z.object({ id: z.string() })).catch([]);

function buildContextChips(
  rawPrefs: unknown,
  weeklyBudget: number | null | undefined,
  rawParticipants: unknown,
  syncWithLunarCycle: boolean | undefined,
): Chip[] {
  const prefs = SafeContextPrefsSchema.parse(rawPrefs);
  const participants = SafeParticipantsSchema.parse(rawParticipants);
  const out: Chip[] = [];
  const t = prefs.nutritionalTargets;
  prefs.dietaryRestrictions.forEach((d) => out.push({ key: `diet-${d}`, label: d.replace(/-/g, " "), tab: "taste" }));
  if (prefs.preferredCuisines.length > 0) {
    out.push({ key: "cuisines", label: prefs.preferredCuisines.slice(0, 2).join(", ") + (prefs.preferredCuisines.length > 2 ? ` +${prefs.preferredCuisines.length - 2}` : ""), tab: "taste" });
  }
  if (prefs.maxPrepTimeMinutes !== null) out.push({ key: "time", label: `≤ ${prefs.maxPrepTimeMinutes} min`, tab: "taste" });
  if (t.dailyCalories !== null) out.push({ key: "kcal", label: `${t.dailyCalories} kcal/day`, tab: "taste" });
  if (t.dailyProteinG !== null || t.prioritizeProtein) {
    out.push({ key: "protein", label: t.dailyProteinG !== null ? `${t.dailyProteinG}g protein` : "High protein", tab: "taste" });
  }
  if (prefs.excludeIngredients.length > 0) {
    out.push({ key: "exclude", label: `No ${prefs.excludeIngredients.slice(0, 2).join(", ")}${prefs.excludeIngredients.length > 2 ? "…" : ""}`, tab: "taste" });
  }
  if (weeklyBudget) out.push({ key: "budget", label: `$${weeklyBudget}/wk`, tab: "budget" });
  const guests = participants.filter((p) => p.id.startsWith("chart-")).length;
  if (guests > 0) out.push({ key: "guests", label: `${guests} guest${guests === 1 ? "" : "s"}`, tab: "guests" });
  if (syncWithLunarCycle) out.push({ key: "lunar", label: "☽ Lunar sync", tab: "cosmic" });
  return out;
}

export default function ContextChips({ className = "" }: { className?: string }): React.ReactElement {
  const { generationPreferences: prefs, weeklyBudget, participants, syncWithLunarCycle } = useMenuPlanner();
  const { openSettings } = usePlannerUI();
  const chips = useMemo<Chip[]>(() => buildContextChips(prefs, weeklyBudget, participants, syncWithLunarCycle), [prefs, weeklyBudget, participants, syncWithLunarCycle]);
  const visible = chips.slice(0, MAX_VISIBLE);
  const overflow = chips.length - visible.length;

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${className}`} aria-label="Active plan settings">
      {visible.map((c) => (
        <button key={c.key} type="button" onClick={() => { trackViewAction(`plan:filter_element:${c.tab}`); openSettings(c.tab); }} className="shrink-0 rounded-full border border-muted bg-surface-container-low px-2.5 py-1 text-xs capitalize text-on-surface-variant transition-colors hover:border-active-violet/40 hover:text-on-surface">
          {c.label}
        </button>
      ))}
      {overflow > 0 && (
        <button type="button" onClick={() => openSettings()} className="shrink-0 rounded-full px-2 py-1 text-xs text-on-surface-variant hover:text-on-surface">
          +{overflow} more
        </button>
      )}
      <button type="button" onClick={() => openSettings()} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-active-violet hover:bg-active-violet/10">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        {chips.length === 0 ? "Set preferences" : "Plan settings"}
      </button>
    </div>
  );
}
