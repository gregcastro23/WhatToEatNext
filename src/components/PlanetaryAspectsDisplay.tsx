"use client";

import React, { useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft, FaSyncAlt } from "react-icons/fa";

interface AspectEntry {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  orbDegrees: number;
  strength: number;
  applying: boolean;
  daysToExact: number;
  influence: "harmonious" | "challenging" | "neutral";
}

interface AspectsData {
  aspects: AspectEntry[];
  timestamp: string;
}

// ── Visual helpers ───────────────────────────────────────────────────────────

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "⛢", Neptune: "♆", Pluto: "♇",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌", opposition: "☍", trine: "△", square: "□", sextile: "✶",
};

const ASPECT_NAMES: Record<string, string> = {
  conjunction: "Conjunction", opposition: "Opposition",
  trine: "Trine", square: "Square", sextile: "Sextile",
};

/** Tailwind classes for each aspect type */
function aspectStyle(type: string): { border: string; text: string; bg: string } {
  switch (type) {
    case "trine":       return { border: "border-emerald-500/40", text: "text-emerald-300", bg: "bg-emerald-900/20" };
    case "sextile":     return { border: "border-teal-500/40",    text: "text-teal-300",    bg: "bg-teal-900/20"    };
    case "conjunction": return { border: "border-amber-500/40",   text: "text-amber-300",   bg: "bg-amber-900/20"  };
    case "square":      return { border: "border-red-500/40",     text: "text-red-300",     bg: "bg-red-900/20"    };
    case "opposition":  return { border: "border-orange-500/40",  text: "text-orange-300",  bg: "bg-orange-900/20" };
    default:            return { border: "border-gray-600/40",    text: "text-gray-400",    bg: "bg-gray-800/20"   };
  }
}

/** Format daysToExact into a concise human-readable string */
function formatDays(days: number): string {
  if (days >= 999) return "—";
  if (days < 1 / 24) {
    const mins = Math.round(days * 24 * 60);
    return `${mins} min`;
  }
  if (days < 1) {
    const hours = (days * 24).toFixed(1);
    return `${hours} h`;
  }
  if (days < 7) return `${days.toFixed(1)} d`;
  if (days < 30) return `${(days / 7).toFixed(1)} wk`;
  return `${(days / 30).toFixed(1)} mo`;
}

// ── Strength bar ─────────────────────────────────────────────────────────────

function StrengthBar({ strength, applying, type }: { strength: number; applying: boolean; type: string }) {
  const _style = aspectStyle(type);
  const pct = `${(strength * 100).toFixed(0)}%`;
  return (
    <div className="h-1.5 w-full bg-gray-900/40 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          applying ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-gradient-to-r from-gray-600 to-gray-500"
        }`}
        style={{ width: pct }}
      />
    </div>
  );
}

// ── Single aspect card ────────────────────────────────────────────────────────

function AspectCard({ aspect }: { aspect: AspectEntry }) {
  const style = aspectStyle(aspect.type);
  const glyph1 = PLANET_GLYPHS[aspect.planet1] ?? "🪐";
  const glyph2 = PLANET_GLYPHS[aspect.planet2] ?? "🪐";
  const symbol = ASPECT_SYMBOLS[aspect.type] ?? "·";
  const name   = ASPECT_NAMES[aspect.type] ?? aspect.type;

  return (
    <div className={`p-3 rounded-lg border ${style.border} ${style.bg}`}>
      {/* Header: planets + aspect */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-200 min-w-0">
          <span className="text-base leading-none">{glyph1}</span>
          <span className="truncate text-xs text-gray-300">{aspect.planet1}</span>
        </div>

        <div className={`flex flex-col items-center shrink-0 ${style.text}`}>
          <span className="text-lg leading-none">{symbol}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide">{name}</span>
          <span className="text-[10px] text-gray-500">{aspect.aspectAngle}°</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-200 min-w-0 justify-end">
          <span className="truncate text-xs text-gray-300 text-right">{aspect.planet2}</span>
          <span className="text-base leading-none">{glyph2}</span>
        </div>
      </div>

      {/* Strength bar */}
      <StrengthBar strength={aspect.strength} applying={aspect.applying} type={aspect.type} />

      {/* Footer: orb + applying/separating + time */}
      <div className="flex items-center justify-between mt-2 text-xs">
        {/* Orb */}
        <span className="font-mono text-gray-400">
          orb {aspect.orbDegrees.toFixed(2)}°
        </span>

        {/* Applying / Separating badge + countdown */}
        <div className="flex items-center gap-1">
          {aspect.applying ? (
            <>
              <FaArrowRight className="h-3 w-3 text-amber-400" />
              <span className="text-amber-300 font-semibold">Applying</span>
              <span className="text-gray-400 ml-1">exact in {formatDays(aspect.daysToExact)}</span>
            </>
          ) : (
            <>
              <FaArrowLeft className="h-3 w-3 text-gray-400" />
              <span className="text-gray-400 font-semibold">Separating</span>
              <span className="text-gray-500 ml-1">{formatDays(aspect.daysToExact)} ago</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlanetaryAspectsDisplay() {
  const [data, setData] = useState<AspectsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "applying" | "separating">("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alchm-quantities/aspects");
      if (!res.ok) throw new Error("Failed to fetch aspects");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // Aspects change slowly — refresh every 2 minutes
    const iv = setInterval(() => { void fetchData(); }, 120_000);
    return () => clearInterval(iv);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-indigo-900/20 rounded-lg border border-indigo-800/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">Error: {error}</p>;
  }

  if (!data || data.aspects.length === 0) {
    return <p className="text-gray-400 italic text-sm">No major aspects active right now.</p>;
  }

  const visible = data.aspects.filter((a) => {
    if (filter === "applying") return a.applying;
    if (filter === "separating") return !a.applying;
    return true;
  });

  const applyingCount   = data.aspects.filter((a) => a.applying).length;
  const separatingCount = data.aspects.filter((a) => !a.applying).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 text-xs">
          {(["all", "applying", "separating"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                filter === f
                  ? "bg-indigo-700/50 border-indigo-400/60 text-indigo-200"
                  : "bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-indigo-600/40"
              }`}
            >
              {f === "all"
                ? `All (${data.aspects.length})`
                : f === "applying"
                ? `Applying (${applyingCount})`
                : `Separating (${separatingCount})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { void fetchData(); }}
          className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-indigo-900/30 border border-gray-700/40 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-300 transition-colors"
          title="Refresh aspects"
        >
          <FaSyncAlt className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><FaArrowRight className="h-3 w-3 text-amber-400" /> Applying = orb shrinking</span>
        <span className="flex items-center gap-1"><FaArrowLeft className="h-3 w-3 text-gray-500" /> Separating = orb growing</span>
        <span className="flex items-center gap-1"><span className="text-emerald-400">△ ✶</span> Harmonious</span>
        <span className="flex items-center gap-1"><span className="text-red-400">□ ☍</span> Challenging</span>
        <span className="flex items-center gap-1"><span className="text-amber-400">☌</span> Conjunction</span>
      </div>

      {/* Aspect cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {visible.map((a, i) => (
          <AspectCard key={`${a.planet1}-${a.planet2}-${i}`} aspect={a} />
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Updated: {new Date(data.timestamp).toLocaleTimeString()} ·
        Strength = 1 − (orb / max_orb) · Daily motion from average orbital velocity
      </p>
    </div>
  );
}
