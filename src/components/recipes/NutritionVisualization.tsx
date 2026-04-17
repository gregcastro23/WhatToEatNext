"use client";

import React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface NutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  vitamins?: string[];
  minerals?: string[];
}

// 2000-calorie reference daily values (FDA)
const DAILY_VALUES = {
  protein: 50,   // g
  carbs: 275,    // g
  fat: 78,       // g
  fiber: 28,     // g
  sodium: 2300,  // mg
  sugar: 50,     // g (added sugar limit)
};

// Calories per gram
const CAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

const MACRO_COLORS = {
  protein: "#10b981",
  carbs:   "#3b82f6",
  fat:     "#f97316",
};

function DvBar({
  label,
  grams,
  unit = "g",
  pct,
  colorClass,
}: {
  label: string;
  grams: number;
  unit?: string;
  pct: number;
  colorClass: string;
}) {
  const clamped = Math.min(150, pct);
  const over = pct > 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-white/60 capitalize">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-500" : colorClass}`}
          style={{ width: `${Math.min(100, clamped)}%` }}
        />
      </div>
      <span className="text-xs text-white/70 tabular-nums w-16 text-right">
        {grams}{unit}
      </span>
      <span className={`text-xs tabular-nums w-10 text-right ${over ? "text-red-400" : "text-white/40"}`}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

interface MacroTooltipPayload {
  name?: string;
  value?: number;
  payload?: { grams?: number; calories?: number };
}

function MacroTooltip({ active, payload }: {
  active?: boolean;
  payload?: MacroTooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const name = p.name ?? "";
  const cals = p.value ?? 0;
  const grams = p.payload?.grams ?? 0;
  return (
    <div className="glass-card-premium rounded-lg border border-white/10 px-3 py-2 text-xs">
      <div className="text-white font-semibold capitalize mb-1">{name}</div>
      <div className="text-white/70 tabular-nums">
        {grams}g · {cals} cal
      </div>
    </div>
  );
}

export function NutritionVisualization({ nutrition }: { nutrition: NutritionData }) {
  const protein = nutrition.protein ?? 0;
  const carbs = nutrition.carbs ?? 0;
  const fat = nutrition.fat ?? 0;

  const proteinCal = protein * CAL_PER_G.protein;
  const carbsCal = carbs * CAL_PER_G.carbs;
  const fatCal = fat * CAL_PER_G.fat;
  const derivedTotal = proteinCal + carbsCal + fatCal;

  const stated = nutrition.calories ?? 0;
  // Use stated calories when available, else derived
  const totalCal = stated > 0 ? stated : derivedTotal;

  const macroData = [
    { name: "protein", value: proteinCal, grams: protein, color: MACRO_COLORS.protein },
    { name: "carbs",   value: carbsCal,   grams: carbs,   color: MACRO_COLORS.carbs },
    { name: "fat",     value: fatCal,     grams: fat,     color: MACRO_COLORS.fat },
  ].filter((d) => d.value > 0);

  const hasMacros = macroData.length > 0;

  const caloriePct = stated ? (stated / 2000) * 100 : 0;

  const vitamins = nutrition.vitamins ?? [];
  const minerals = nutrition.minerals ?? [];
  const microCount = vitamins.length + minerals.length;
  // Heuristic "coverage" label
  const microLabel =
    microCount === 0 ? "None listed"
      : microCount <= 3 ? "Low"
      : microCount <= 6 ? "Moderate"
      : microCount <= 10 ? "High"
      : "Exceptional";

  return (
    <div className="space-y-5">
      {/* Headline calories */}
      {stated > 0 && (
        <div className="flex items-baseline justify-between pb-3 border-b border-white/5">
          <div>
            <div className="text-3xl font-bold text-amber-300 tabular-nums">
              {stated}
              <span className="text-sm text-white/40 font-normal ml-1">cal</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
              Per serving
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40">% Daily Value</div>
            <div className="text-base font-semibold text-white/80 tabular-nums">
              {Math.round(caloriePct)}%
            </div>
            <div className="text-[10px] text-white/30">of 2000 cal</div>
          </div>
        </div>
      )}

      {/* Macro pie */}
      {hasMacros && (
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={60}
                  paddingAngle={2}
                  strokeWidth={0}
                  isAnimationActive
                >
                  {macroData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<MacroTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {macroData.map((m) => {
              const pct = totalCal > 0 ? Math.round((m.value / totalCal) * 100) : 0;
              return (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: m.color }}
                  />
                  <span className="capitalize text-white/70 w-14">{m.name}</span>
                  <span className="text-white/50 tabular-nums w-14">{m.grams}g</span>
                  <span className="text-white/80 font-semibold tabular-nums ml-auto">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Value bars */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
          % Daily Value
        </div>
        {protein > 0 && (
          <DvBar
            label="Protein"
            grams={protein}
            pct={(protein / DAILY_VALUES.protein) * 100}
            colorClass="bg-emerald-500"
          />
        )}
        {carbs > 0 && (
          <DvBar
            label="Carbs"
            grams={carbs}
            pct={(carbs / DAILY_VALUES.carbs) * 100}
            colorClass="bg-blue-500"
          />
        )}
        {fat > 0 && (
          <DvBar
            label="Fat"
            grams={fat}
            pct={(fat / DAILY_VALUES.fat) * 100}
            colorClass="bg-orange-500"
          />
        )}
        {nutrition.fiber != null && nutrition.fiber > 0 && (
          <DvBar
            label="Fiber"
            grams={nutrition.fiber}
            pct={(nutrition.fiber / DAILY_VALUES.fiber) * 100}
            colorClass="bg-green-500"
          />
        )}
        {nutrition.sugar != null && nutrition.sugar > 0 && (
          <DvBar
            label="Sugar"
            grams={nutrition.sugar}
            pct={(nutrition.sugar / DAILY_VALUES.sugar) * 100}
            colorClass="bg-pink-500"
          />
        )}
        {nutrition.sodium != null && nutrition.sodium > 0 && (
          <DvBar
            label="Sodium"
            grams={nutrition.sodium}
            unit="mg"
            pct={(nutrition.sodium / DAILY_VALUES.sodium) * 100}
            colorClass="bg-purple-500"
          />
        )}
      </div>

      {/* Micronutrient coverage */}
      {(vitamins.length > 0 || minerals.length > 0) && (
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">
                Micronutrient Coverage
              </div>
              <div className="text-sm text-white/80 font-semibold mt-0.5">
                {microLabel}
                <span className="text-white/40 font-normal ml-2 text-xs">
                  ({microCount} identified)
                </span>
              </div>
            </div>
          </div>

          {vitamins.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1.5">
                Vitamins · {vitamins.length}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {vitamins.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
          {minerals.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-sky-400/70 mb-1.5">
                Minerals · {minerals.length}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {minerals.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-xs text-sky-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
