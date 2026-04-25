"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { CompositeNatalChart } from "@/types/natalChart";

const ElementalVisualizer = dynamic(
  () => import("@/components/ElementalVisualizer"),
  { ssr: false },
);

const ELEMENT_ICON: Record<string, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌿",
  Air: "💨",
};

const ELEMENT_BAR: Record<string, string> = {
  Fire: "bg-red-400/80",
  Water: "bg-blue-400/80",
  Earth: "bg-green-400/80",
  Air: "bg-gray-300/80",
};

interface Props {
  composite: CompositeNatalChart;
  /** "dark" matches glass-card-premium pages (default). "light" matches the dashboard. */
  theme?: "dark" | "light";
}

const THEME = {
  dark: {
    container:
      "glass-card-premium rounded-3xl p-6 md:p-7 border border-white/10",
    title: "text-purple-100",
    subtitle: "text-purple-300/80",
    titleHighlight: "text-purple-100",
    chip: "bg-purple-500/15 border border-purple-300/20 text-purple-200",
    sectionHeader: "text-purple-300/80",
    rowLabel: "text-purple-100/90",
    track: "bg-white/5",
    pctText: "text-purple-200",
    pill: "bg-white/5 border border-white/10 text-purple-100",
    pillKey: "text-purple-300/80",
    pillValue: "text-purple-50",
  },
  light: {
    container: "bg-white border border-gray-200 rounded-2xl p-5 shadow-sm",
    title: "text-gray-900",
    subtitle: "text-gray-500",
    titleHighlight: "text-gray-800",
    chip: "bg-purple-100 border border-purple-200 text-purple-700",
    sectionHeader: "text-gray-500",
    rowLabel: "text-gray-700",
    track: "bg-gray-100",
    pctText: "text-gray-600",
    pill: "bg-gray-50 border border-gray-200 text-gray-700",
    pillKey: "text-gray-500",
    pillValue: "text-purple-700",
  },
};

export function CompositeEnergyVisualizer({
  composite,
  theme = "dark",
}: Props) {
  const t = THEME[theme];
  const elements: Array<keyof typeof composite.elementalBalance> = [
    "Fire",
    "Water",
    "Earth",
    "Air",
  ];
  const alchemy = composite.alchemicalProperties;
  const alchemyKeys: Array<keyof typeof alchemy> = [
    "Spirit",
    "Essence",
    "Matter",
    "Substance",
  ];

  return (
    <div className={t.container}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {ELEMENT_ICON[composite.dominantElement] ?? "✨"}
          </span>
          <div>
            <h2 className={`text-xl md:text-2xl font-bold leading-tight ${t.title}`}>
              Composite Energy
            </h2>
            <p className={`text-sm ${t.subtitle}`}>
              Dominant element:{" "}
              <span className={`font-semibold ${t.titleHighlight}`}>
                {composite.dominantElement}
              </span>{" "}
              · Modality:{" "}
              <span className={`font-semibold ${t.titleHighlight}`}>
                {composite.dominantModality}
              </span>
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide ${t.chip}`}>
          {composite.memberCount} member{composite.memberCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <ElementalVisualizer
            elementalProperties={{
              Fire: composite.elementalBalance.Fire,
              Water: composite.elementalBalance.Water,
              Earth: composite.elementalBalance.Earth,
              Air: composite.elementalBalance.Air,
            }}
            visualizationType="radar"
            darkMode={theme === "dark"}
            size="md"
            title=""
            showLegend={false}
            showLabels
            showPercentages
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className={`text-xs uppercase tracking-wider mb-2 ${t.sectionHeader}`}>
              Elemental balance
            </h3>
            <ul className="space-y-2">
              {elements.map((el) => {
                const value = composite.elementalBalance[el] ?? 0;
                const pct = Math.round(value * 100);
                return (
                  <li key={el} className="flex items-center gap-3">
                    <span className="w-5 text-base" aria-hidden>
                      {ELEMENT_ICON[el]}
                    </span>
                    <span className={`w-14 text-sm ${t.rowLabel}`}>{el}</span>
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${t.track}`}>
                      <div
                        className={`h-full ${ELEMENT_BAR[el]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right text-xs font-mono ${t.pctText}`}>
                      {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className={`text-xs uppercase tracking-wider mb-2 ${t.sectionHeader}`}>
              Alchemical totals
            </h3>
            <div className="flex flex-wrap gap-2">
              {alchemyKeys.map((k) => {
                const value = Number(alchemy[k] ?? 0);
                return (
                  <span
                    key={k}
                    className={`px-3 py-1 rounded-full text-xs ${t.pill}`}
                  >
                    <span className={`mr-1.5 ${t.pillKey}`}>{k}</span>
                    <span className={`font-mono ${t.pillValue}`}>
                      {value.toFixed(1)}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompositeEnergyVisualizer;
