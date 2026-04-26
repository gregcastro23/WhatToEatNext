/**
 * Full Statistics view — the dedicated tab on /quantities.
 *
 * Pulls from the AlchemicalStatisticsProvider (already mounted higher in the
 * tree) and renders ESMS / Thermo / Elemental / Per-Planet quantities each
 * with their wavefunction envelope, mean ± σ, percentile box, and z-score.
 *
 * Pure presentation — no fetching of its own.
 */
"use client";

import {
  PERIOD_LABELS,
  STAT_PERIODS,
  useAlchemicalStatistics,
} from "@/contexts/AlchemicalStatisticsContext";
import {
  QuantitySparkline,
  QuantityWavefunction,
  QuantityZBadge,
} from "@/components/QuantityContext";
import { classifyZScore } from "@/utils/statisticsCalculations";

const ESMS_KEYS = ["Spirit", "Essence", "Matter", "Substance"] as const;
const THERMO_KEYS = [
  "heat",
  "entropy",
  "reactivity",
  "gregsEnergy",
  "kalchm",
  "monica",
] as const;
const ELEMENT_KEYS = ["Fire", "Water", "Earth", "Air"] as const;

const ESMS_COLORS: Record<(typeof ESMS_KEYS)[number], string> = {
  Spirit: "#f59e0b",
  Essence: "#3b82f6",
  Matter: "#10b981",
  Substance: "#8b5cf6",
};

const ELEMENT_COLORS: Record<(typeof ELEMENT_KEYS)[number], string> = {
  Fire: "#ef4444",
  Water: "#0ea5e9",
  Earth: "#84cc16",
  Air: "#a855f7",
};

const THERMO_COLORS: Record<(typeof THERMO_KEYS)[number], string> = {
  heat: "#fb923c",
  entropy: "#f43f5e",
  reactivity: "#a78bfa",
  gregsEnergy: "#34d399",
  kalchm: "#fbbf24",
  monica: "#22d3ee",
};

const PLANET_ORDER = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Ascendant",
];

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1000) return n.toFixed(0);
  if (a >= 100) return n.toFixed(1);
  if (a >= 10) return n.toFixed(2);
  if (a >= 1) return n.toFixed(3);
  return n.toFixed(digits);
}

function StatCard({
  label,
  current,
  mean,
  stdDev,
  p10,
  p90,
  spark,
  hist,
  ctx,
  color,
  unit,
}: {
  label: string;
  current: number;
  mean: number;
  stdDev: number;
  p10: number;
  p90: number;
  spark: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hist: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any;
  color: string;
  unit?: string;
}) {
  const z = stdDev > 1e-12 ? (current - mean) / stdDev : 0;
  const cls = classifyZScore(z);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">
            {label}
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color }}
            >
              {fmt(current)}
            </span>
            {unit && (
              <span className="text-[9px] text-white/30 font-mono uppercase">
                {unit}
              </span>
            )}
          </div>
          <div className="text-[9px] text-white/40 mt-0.5 italic">
            {cls.label}
          </div>
        </div>
        <QuantityZBadge z={z} compact />
      </div>

      <QuantityWavefunction
        hist={hist}
        ctx={ctx}
        current={current}
        stroke={color}
        width={260}
        height={64}
        className="mb-3 text-white/40"
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] tabular-nums">
        <div className="flex justify-between text-white/50">
          <span className="text-white/30">μ</span>
          <span className="font-mono">{fmt(mean)}</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span className="text-white/30">σ</span>
          <span className="font-mono">{fmt(stdDev)}</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span className="text-white/30">p10</span>
          <span className="font-mono">{fmt(p10)}</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span className="text-white/30">p90</span>
          <span className="font-mono">{fmt(p90)}</span>
        </div>
      </div>

      <div className="mt-3 -mx-1 opacity-60">
        <QuantitySparkline
          series={spark}
          current={current}
          stroke={color}
          width={272}
          height={20}
        />
      </div>
    </div>
  );
}

function CardGrid({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="text-sm font-black text-white/80 uppercase tracking-[0.25em]">
          {title}
        </h3>
        <span className="text-[10px] text-white/30">{subtitle}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </section>
  );
}

export default function AlchmQuantitiesStatistics() {
  const { allPeriods, period, setPeriod, isLoading, error, fileMeta } =
    useAlchemicalStatistics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/5 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
        Failed to load statistics: {error}
      </div>
    );
  }
  const stats = allPeriods?.[period];
  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-white/50 text-sm">
        No statistics available for this period yet. Try a wider window.
      </div>
    );
  }

  const planetsPresent = PLANET_ORDER.filter((p) => stats.perPlanet[p]);

  return (
    <div className="space-y-8">
      {/* Period selector + meta */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="inline-flex gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
          {STAT_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                period === p
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="text-[9px] text-white/30 font-mono uppercase tracking-widest">
          {stats.sampleCount} samples · {stats.intervalHours}h interval ·{" "}
          {fileMeta && new Date(fileMeta.generatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* A-Number hero */}
      <section>
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent p-5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">
                Total A-Number — {PERIOD_LABELS[period]}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                  {fmt(stats.aNumber.current)}
                </span>
                <QuantityZBadge z={
                  stats.aNumber.stdDev > 1e-12
                    ? (stats.aNumber.current - stats.aNumber.mean) / stats.aNumber.stdDev
                    : 0
                } />
              </div>
              <div className="text-[10px] text-white/40 mt-1 font-mono">
                μ {fmt(stats.aNumber.mean)} · σ {fmt(stats.aNumber.stdDev)} ·
                range [{fmt(stats.aNumber.min)}, {fmt(stats.aNumber.max)}]
              </div>
            </div>
            <QuantityWavefunction
              hist={stats.aNumber.hist}
              ctx={stats.aNumber}
              current={stats.aNumber.current}
              stroke="#fbbf24"
              width={320}
              height={72}
              className="text-white/40"
            />
          </div>
        </div>
      </section>

      {/* ESMS */}
      <CardGrid title="ESMS Quantities" subtitle="Spirit · Essence · Matter · Substance — wavefunction envelopes">
        {ESMS_KEYS.map((k) => {
          const c = stats.esms[k];
          return (
            <StatCard
              key={k}
              label={k}
              current={c.current}
              mean={c.mean}
              stdDev={c.stdDev}
              p10={c.p10}
              p90={c.p90}
              spark={c.spark}
              hist={c.hist}
              ctx={c}
              color={ESMS_COLORS[k]}
            />
          );
        })}
      </CardGrid>

      {/* Thermodynamic */}
      <CardGrid title="Thermodynamics" subtitle="Heat · Entropy · Reactivity · Greg's Energy · Kalchm · Monica">
        {THERMO_KEYS.map((k) => {
          const c = stats.thermo[k];
          return (
            <StatCard
              key={k}
              label={k}
              current={c.current}
              mean={c.mean}
              stdDev={c.stdDev}
              p10={c.p10}
              p90={c.p90}
              spark={c.spark}
              hist={c.hist}
              ctx={c}
              color={THERMO_COLORS[k]}
            />
          );
        })}
      </CardGrid>

      {/* Elemental */}
      <CardGrid title="Elemental Contribution" subtitle="Raw totals — sign element (60%) + sect element (40%)">
        {ELEMENT_KEYS.map((k) => {
          const c = stats.elemental[k];
          return (
            <StatCard
              key={k}
              label={k}
              current={c.current}
              mean={c.mean}
              stdDev={c.stdDev}
              p10={c.p10}
              p90={c.p90}
              spark={c.spark}
              hist={c.hist}
              ctx={c}
              color={ELEMENT_COLORS[k]}
            />
          );
        })}
      </CardGrid>

      {/* Per-planet contributions */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-[0.25em]">
            Per-Planet Contribution
          </h3>
          <span className="text-[10px] text-white/30">
            Each planet's share of ESMS and elements over the period
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full text-[11px] tabular-nums">
            <thead className="bg-white/[0.03] text-white/40 uppercase tracking-wider text-[9px]">
              <tr>
                <th className="text-left p-2 font-bold">Planet</th>
                {ESMS_KEYS.map((k) => (
                  <th key={k} className="text-right p-2 font-bold" style={{ color: ESMS_COLORS[k] }}>
                    {k.slice(0, 3)} μ±σ
                  </th>
                ))}
                {ELEMENT_KEYS.map((k) => (
                  <th key={k} className="text-right p-2 font-bold" style={{ color: ELEMENT_COLORS[k] }}>
                    {k.slice(0, 3)} μ±σ
                  </th>
                ))}
                <th className="text-right p-2 font-bold">σ now</th>
              </tr>
            </thead>
            <tbody>
              {planetsPresent.map((planet) => {
                const pp = stats.perPlanet[planet];
                if (!pp) return null;
                // Pick the dominant ESMS column for this planet to use for the z-score column.
                const esmsList = ESMS_KEYS.map((k) => pp.esms[k]);
                const dominant = esmsList.reduce((a, b) => (a.mean > b.mean ? a : b));
                const z =
                  dominant.stdDev > 1e-12
                    ? (dominant.current - dominant.mean) / dominant.stdDev
                    : 0;
                return (
                  <tr key={planet} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="p-2 font-bold text-white/80">{planet}</td>
                    {ESMS_KEYS.map((k) => {
                      const e = pp.esms[k];
                      return (
                        <td key={k} className="p-2 text-right text-white/60 font-mono">
                          {fmt(e.mean)}
                          <span className="text-white/25"> ± {fmt(e.stdDev)}</span>
                        </td>
                      );
                    })}
                    {ELEMENT_KEYS.map((k) => {
                      const e = pp.elements[k];
                      return (
                        <td key={k} className="p-2 text-right text-white/60 font-mono">
                          {fmt(e.mean)}
                          <span className="text-white/25"> ± {fmt(e.stdDev)}</span>
                        </td>
                      );
                    })}
                    <td className="p-2 text-right">
                      <QuantityZBadge z={z} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <p className="text-[9px] text-white/20 font-mono italic">
        Statistics computed from {stats.sampleCount} pre-generated samples at{" "}
        {stats.intervalHours}h resolution. The "wavefunction" overlay is a
        Gaussian implied by the period's μ and σ — its breadth IS the standard
        deviation of every quantity.
      </p>
    </div>
  );
}
