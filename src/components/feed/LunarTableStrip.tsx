"use client";

/**
 * The lunar table strip — the sky's standing invitation, pinned atop the feed.
 *
 * Pure astronomy, no rows: nextLunarTable() computes the open-or-upcoming
 * new/full-moon table client-side. While a table is open the strip glows and
 * cooked-it posts made in the window auto-attach (the share route stamps
 * metadata.tableKey); before it opens it counts down.
 */

import Link from "next/link";
import { useEffect, useState, type JSX } from "react";
import { nextLunarTable, type LunarTable } from "@/lib/feed/lunarTables";

function daysUntil(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "now";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 2) return `in ${days} days`;
  const hours = Math.round(ms / 3_600_000);
  return days === 1 ? "tomorrow" : `in ${Math.max(1, hours)}h`;
}

export function LunarTableStrip(): JSX.Element | null {
  const [table, setTable] = useState<LunarTable | null>(null);

  useEffect(() => {
    // Client-only: astronomy off the render path, refreshed hourly.
    const compute = () => setTable(nextLunarTable());
    compute();
    const t = window.setInterval(compute, 3_600_000);
    return () => window.clearInterval(t);
  }, []);

  if (!table) return null;
  const moon = table.kind === "full-moon" ? "🌕" : "🌑";

  return (
    <div
      className={`rounded-2xl border px-5 py-4 mb-4 flex items-center justify-between gap-4 flex-wrap ${
        table.isOpen
          ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>{moon}</span>
          <span className="text-sm font-black uppercase tracking-[0.14em] text-white/85">{table.title}</span>
          <span
            className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              table.isOpen
                ? "text-amber-200 border-amber-400/40 bg-amber-500/10"
                : "text-white/40 border-white/10"
            }`}
          >
            {table.isOpen ? "table is open" : `opens ${daysUntil(table.opensAt)}`}
          </span>
        </div>
        <p className="text-xs text-white/45 mt-1 max-w-xl">{table.invitation}</p>
      </div>
      {table.isOpen && (
        <Link
          href="/cuisines"
          className="shrink-0 text-[10px] font-black uppercase tracking-widest text-amber-200 border border-amber-400/40 rounded-xl px-4 py-2 hover:bg-amber-500/10 transition-colors"
        >
          Cook for the table →
        </Link>
      )}
    </div>
  );
}
