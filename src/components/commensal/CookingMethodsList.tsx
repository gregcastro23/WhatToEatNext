"use client";

import React from "react";

export interface CookingMethodSummary {
  method: string;
  score: number;
  reasons: string[];
}

interface Props {
  methods: CookingMethodSummary[];
  /** Defaults to 5 */
  limit?: number;
}

function formatMethodName(raw: string): string {
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CookingMethodsList({ methods, limit = 5 }: Props) {
  const top = methods.slice(0, limit);

  if (top.length === 0) {
    return (
      <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
        <h3 className="text-base font-semibold text-purple-200 mb-1">
          Recommended cooking methods
        </h3>
        <p className="text-sm text-purple-300/70">
          No methods scored — try adding more guests with diverse charts.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
      <h3 className="text-base font-semibold text-purple-200 mb-4">
        Recommended cooking methods
      </h3>
      <ul className="space-y-3">
        {top.map((m) => {
          const pct = Math.round(m.score * 100);
          return (
            <li
              key={m.method}
              className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-purple-50 text-sm">
                  {formatMethodName(m.method)}
                </span>
                <span className="text-xs font-mono text-purple-200 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-300/20">
                  {pct}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400/80 to-pink-400/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {m.reasons.length > 0 && (
                <p className="text-xs text-purple-300/80 leading-snug">
                  {m.reasons.slice(0, 2).join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CookingMethodsList;
