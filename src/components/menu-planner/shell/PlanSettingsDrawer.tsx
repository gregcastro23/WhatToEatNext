"use client";

/**
 * PlanSettingsDrawer — slide-over settings drawer for the weekly planner.
 *
 * Consolidates previously scattered dialogs and panels:
 *  - Diet, Nutrition & Cuisines (from GenerationPreferencesPanel)
 *  - Weekly Grocery Budget (from QuickActionsToolbar inline panel)
 *  - Guest Alchemists & Natal Charts (from ParticipantSelection modal)
 *  - Cosmic & Lunar sync settings (from tools bar)
 *
 * @file src/components/menu-planner/shell/PlanSettingsDrawer.tsx
 */

import {
  Moon,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import GenerationPreferencesPanel from "@/components/menu-planner/GenerationPreferencesPanel";
import { useMenuPlanner, type Participant } from "@/contexts/MenuPlannerContext";
import type { SavedChart } from "@/types/natalChart";
import { createLogger } from "@/utils/logger";
import { usePlannerUI, type SettingsTab } from "./PlannerUIContext";
import Sheet from "./Sheet";

const logger = createLogger("PlanSettingsDrawer");

function chartToParticipant(chart: SavedChart): Omit<Participant, "id"> | null {
  const dt = new Date(chart.birthData.dateTime);
  if (Number.isNaN(dt.getTime())) return null;
  const iso = dt.toISOString();
  return {
    name: chart.label,
    birthDate: iso.slice(0, 10),
    birthTime: iso.slice(11, 16),
    location: `${chart.birthData.latitude.toFixed(2)}, ${chart.birthData.longitude.toFixed(2)} (${chart.birthData.timezone ?? "UTC"})`,
  };
}

export default function PlanSettingsDrawer(): React.ReactElement {
  const { state, closeSettings, setSettingsTab } = usePlannerUI();
  const {
    weeklyBudget,
    setWeeklyBudget,
    estimatedWeeklyCost,
    costConfidence,
    costBreakdown,
    budgetPerMeal,
    syncWithLunarCycle,
    toggleSyncWithLunarCycle,
    participants,
    addParticipant,
    removeParticipant,
  } = useMenuPlanner();

  const [budgetVal, setBudgetVal] = useState(weeklyBudget?.toString() ?? "");
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartsError, setChartsError] = useState<string | null>(null);

  useEffect(() => {
    if (weeklyBudget != null) setBudgetVal(weeklyBudget.toString());
  }, [weeklyBudget]);

  const selectedChartIds = useMemo(
    () =>
      new Set(
        (participants ?? [])
          .filter((p) => p.id.startsWith("chart-"))
          .map((p) => p.id.slice("chart-".length)),
      ),
    [participants],
  );

  // Fetch charts on-demand when the guests tab is active
  useEffect(() => {
    if (state.settingsOpen && state.settingsTab === "guests" && savedCharts.length === 0) {
      setLoadingCharts(true);
      fetch("/api/user/charts")
        .then((res) => res.json())
        .then((json: { success: boolean; charts?: SavedChart[]; message?: string }) => {
          if (json.success && json.charts) {
            setSavedCharts(json.charts);
          } else {
            setChartsError(json.message ?? "Failed to load charts");
          }
        })
        .catch((err: unknown) => {
          logger.error("Failed to fetch saved charts", err);
          setChartsError("Failed to load charts");
        })
        .finally(() => setLoadingCharts(false));
    }
  }, [state.settingsOpen, state.settingsTab, savedCharts.length]);

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: "taste", label: "Diet & Goals", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: "budget", label: "Budget", icon: <Wallet className="h-4 w-4" /> },
    { id: "guests", label: "Guests", icon: <Users className="h-4 w-4" /> },
    { id: "cosmic", label: "Cosmic", icon: <Moon className="h-4 w-4" /> },
  ];

  const handleApplyBudget = () => {
    const val = parseFloat(budgetVal);
    if (!isNaN(val) && val >= 10) {
      setWeeklyBudget(val);
    } else if (budgetVal === "" || budgetVal === "0") {
      setWeeklyBudget(null);
    }
  };

  return (
    <Sheet
      open={state.settingsOpen}
      onOpenChange={(open) => {
        if (!open) closeSettings();
      }}
      title="Plan Settings"
      description="Configure preferences, nutritional goals, budget and guest charts"
      width="max-w-lg"
    >
      <div className="space-y-4">
        {/* Tab Pills */}
        <div role="tablist" className="flex gap-1.5 p-1 rounded-xl bg-surface-container-low border border-muted overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = state.settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? "bg-active-violet text-background font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Diet & Goals */}
        {state.settingsTab === "taste" && (
          <div className="pt-2">
            <GenerationPreferencesPanel isOpen onToggle={() => {}} embedded />
          </div>
        )}

        {/* Tab 2: Budget */}
        {state.settingsTab === "budget" && (
          <div className="space-y-5 pt-2">
            <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-3">
              <label htmlFor="drawer-budget-input" className="block text-xs font-bold text-primary uppercase font-mono tracking-wider">
                Weekly Grocery Budget ($ USD)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-on-surface-variant">$</span>
                  <input
                    id="drawer-budget-input"
                    type="number"
                    min="10"
                    max="1000"
                    step="5"
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)}
                    onBlur={handleApplyBudget}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyBudget();
                    }}
                    placeholder="e.g. 150"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-muted bg-surface-container-lowest text-primary text-sm focus:border-active-violet focus:outline-none"
                  />
                </div>
                {weeklyBudget !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setWeeklyBudget(null);
                      setBudgetVal("");
                    }}
                    className="px-3 py-2 border border-muted rounded-lg text-xs text-on-surface-variant hover:text-error transition-colors font-mono uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                We estimate ingredient costs from real-time grocery mappings to keep recommendations under budget.
              </p>
            </div>

            {/* Current Estimates */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-3 font-mono">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Estimated Plan Cost:</span>
                <span className="font-bold text-primary text-base">${estimatedWeeklyCost.toFixed(2)}</span>
              </div>
              {weeklyBudget !== null && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Budget Remaining:</span>
                    <span
                      className={`font-bold ${
                        weeklyBudget - estimatedWeeklyCost >= 0 ? "text-emerald-400" : "text-error"
                      }`}
                    >
                      ${(weeklyBudget - estimatedWeeklyCost).toFixed(2)}
                    </span>
                  </div>
                  {budgetPerMeal !== null && (
                    <div className="flex justify-between items-center text-xs text-on-surface-variant">
                      <span>Per meal target:</span>
                      <span>${budgetPerMeal.toFixed(2)} / meal</span>
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        estimatedWeeklyCost > weeklyBudget
                          ? "bg-error"
                          : estimatedWeeklyCost / weeklyBudget > 0.8
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                      style={{
                        width: `${Math.min(100, (estimatedWeeklyCost / weeklyBudget) * 100)}%`,
                      }}
                    />
                  </div>
                </>
              )}
              <div className="pt-2 border-t border-muted flex items-center justify-between text-xs text-on-surface-variant">
                <span>Cost Confidence:</span>
                <span className="uppercase text-active-violet font-semibold">{costConfidence} match</span>
              </div>
            </div>

            {/* Top Ingredient Costs */}
            {costBreakdown.length > 0 && (
              <div className="p-4 rounded-xl bg-surface-container-low border border-muted">
                <h4 className="text-xs font-bold text-primary uppercase font-mono tracking-wider mb-2">
                  Grocery Cost Breakdown
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {costBreakdown.slice(0, 10).map((b, i) => (
                    <div key={i} className="flex justify-between items-center text-on-surface-variant">
                      <span className="truncate max-w-[200px]">{b.ingredient}</span>
                      <span className="font-mono text-primary">${b.estimatedCost.toFixed(2)}</span>
                    </div>
                  ))}
                  {costBreakdown.length > 10 && (
                    <p className="text-[10px] text-on-surface-variant/60 text-center pt-1 font-mono">
                      + {costBreakdown.length - 10} more items...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Guests */}
        {state.settingsTab === "guests" && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-surface-container-low border border-muted text-xs text-on-surface-variant">
              Select saved natal charts from your profile to calculate synastry and align meals for everyone sharing the table.
            </div>

            {loadingCharts && (
              <div className="p-6 text-center text-on-surface-variant font-mono text-xs">
                Loading saved charts...
              </div>
            )}

            {chartsError && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs">
                {chartsError}
              </div>
            )}

            {!loadingCharts && !chartsError && (
              <div className="space-y-2">
                {savedCharts.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-6">
                    No saved charts found. Add friends&apos; charts from your user profile.
                  </p>
                ) : (
                  savedCharts.map((chart) => {
                    const isChecked = selectedChartIds.has(chart.id);
                    return (
                      <label
                        key={chart.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-active-violet/10 border-active-violet text-primary"
                            : "bg-surface-container-low border-muted text-on-surface-variant hover:border-active-violet/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const p = chartToParticipant(chart);
                              if (p) addParticipant(p, `chart-${chart.id}`);
                            } else {
                              removeParticipant(`chart-${chart.id}`);
                            }
                          }}
                          className="h-4 w-4 rounded border-muted text-active-violet focus:ring-active-violet"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-primary">{chart.label}</p>
                          <p className="text-xs text-on-surface-variant font-mono">
                            Born: {new Date(chart.birthData.dateTime).toLocaleDateString()}
                          </p>
                        </div>
                        {chart.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-gold-accent/10 border border-gold-accent/30 text-gold-accent text-[10px] font-mono">
                            Primary
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Cosmic */}
        {state.settingsTab === "cosmic" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                    <span>☽</span> Lunar Cycle Sync
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Align meal suggestions and optimal cooking hours with real-time planetary transits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSyncWithLunarCycle}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase font-bold transition-all ${
                    syncWithLunarCycle
                      ? "bg-active-violet text-background shadow-[0_0_12px_rgba(184,90,240,0.3)]"
                      : "bg-surface-container-high border border-muted text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {syncWithLunarCycle ? "Active" : "Off"}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-2 text-xs text-on-surface-variant">
              <h5 className="font-mono uppercase text-primary font-bold tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold-accent" />
                Orbital Planetary Hours
              </h5>
              <p>
                Each day is ruled by a celestial archetype (Sun on Sunday, Moon on Monday, Mars on Tuesday, etc.). When enabled, recommendations weight recipes whose elemental properties match the active hour.
              </p>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
