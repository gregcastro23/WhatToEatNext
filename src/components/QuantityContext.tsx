/**
 * Inline statistical context for a single alchemical / thermodynamic /
 * kinetic quantity.
 *
 * Drop one of these next to any number on the page and the user
 * immediately sees where the current moment sits inside the period's
 * distribution — the "wavefunction envelope" the team wants visible
 * everywhere quantities appear.
 *
 * Three building blocks:
 *
 *   <QuantitySparkline />     — 96-point sparkline with a current marker.
 *   <QuantityZBadge />        — z-score chip, color-coded by magnitude.
 *   <QuantityWavefunction />  — histogram + Gaussian envelope, interactive.
 *   <QuantityContextStrip />  — composes badge + sparkline + mean ± σ in
 *                               one row, the most common usage.
 *
 * All visual-only, no data fetching. Pull stats from
 * `useQuantityContext("...")` and pass the returned object in.
 */
"use client";

import { useMemo } from "react";
import {
  classifyZScore,
  type ContextualValue,
  type Histogram,
} from "@/utils/statisticsCalculations";
import {
  PERIOD_LABELS,
  STAT_PERIODS,
  useAlchemicalStatistics,
  useQuantityContext,
} from "@/contexts/AlchemicalStatisticsContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(0);
  if (abs >= 100) return n.toFixed(1);
  if (abs >= 10) return n.toFixed(2);
  if (abs >= 1) return n.toFixed(3);
  return n.toFixed(digits);
}

function zToColor(z: number): { fg: string; bg: string; border: string } {
  const abs = Math.abs(z);
  if (abs < 0.5)
    return { fg: "text-white/60", bg: "bg-white/5", border: "border-white/10" };
  if (abs < 1)
    return {
      fg: z > 0 ? "text-emerald-300" : "text-sky-300",
      bg: z > 0 ? "bg-emerald-500/10" : "bg-sky-500/10",
      border: z > 0 ? "border-emerald-500/20" : "border-sky-500/20",
    };
  if (abs < 2)
    return {
      fg: z > 0 ? "text-amber-300" : "text-indigo-300",
      bg: z > 0 ? "bg-amber-500/10" : "bg-indigo-500/10",
      border: z > 0 ? "border-amber-500/30" : "border-indigo-500/30",
    };
  return {
    fg: z > 0 ? "text-rose-300" : "text-violet-300",
    bg: z > 0 ? "bg-rose-500/10" : "bg-violet-500/10",
    border: z > 0 ? "border-rose-500/40" : "border-violet-500/40",
  };
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

export function QuantitySparkline({
  series,
  current,
  width = 120,
  height = 28,
  stroke = "#a78bfa",
  fillOpacity = 0.12,
  className = "",
}: {
  series: number[];
  current?: number;
  width?: number;
  height?: number;
  stroke?: string;
  fillOpacity?: number;
  className?: string;
}) {
  const path = useMemo(() => {
    if (series.length < 2) return "";
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of series) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (lo === hi) {
      hi = lo + 1;
      lo = lo - 1;
    }
    const range = hi - lo;
    const dx = width / (series.length - 1);
    let d = "";
    series.forEach((v, i) => {
      const x = i * dx;
      const y = height - ((v - lo) / range) * height;
      d += i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return d;
  }, [series, width, height]);

  const { meanY, currentX, currentY } = useMemo(() => {
    if (series.length < 2) return { meanY: 0, currentX: 0, currentY: 0 };
    let lo = Infinity;
    let hi = -Infinity;
    let sum = 0;
    for (const v of series) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
      sum += v;
    }
    if (lo === hi) {
      hi = lo + 1;
      lo = lo - 1;
    }
    const range = hi - lo;
    const mean = sum / series.length;
    const meanY = height - ((mean - lo) / range) * height;
    const observed = current ?? series[series.length - 1];
    const currentY = height - ((observed - lo) / range) * height;
    return { meanY, currentX: width, currentY };
  }, [series, current, width, height]);

  if (series.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-[9px] text-white/20 ${className}`}
        style={{ width, height }}
      >
        no data
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Quantity sparkline"
    >
      {/* mean line */}
      <line
        x1={0}
        x2={width}
        y1={meanY}
        y2={meanY}
        stroke="currentColor"
        strokeOpacity={0.18}
        strokeDasharray="2 2"
      />
      {/* fill */}
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={stroke} fillOpacity={fillOpacity} />
      {/* line */}
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.25} />
      {/* current marker */}
      <circle cx={currentX} cy={currentY} r={2.5} fill={stroke} />
      <circle cx={currentX} cy={currentY} r={4.5} fill={stroke} fillOpacity={0.25} />
    </svg>
  );
}

// ─── Z-score chip ─────────────────────────────────────────────────────────────

export function QuantityZBadge({
  z,
  compact = false,
}: {
  z: number;
  compact?: boolean;
}) {
  const { fg, bg, border } = zToColor(z);
  const cls = classifyZScore(z);
  const sign = z > 0 ? "+" : "";
  return (
    <span
      title={cls.label}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums uppercase tracking-wider border ${border} ${bg} ${fg}`}
    >
      <span aria-hidden="true">σ</span>
      <span>{sign}{z.toFixed(2)}</span>
      {!compact && <span className="opacity-60">{cls.magnitude}</span>}
    </span>
  );
}

// ─── Period selector chip group ───────────────────────────────────────────────

export function PeriodSelector({
  className = "",
}: {
  className?: string;
}) {
  const { period, setPeriod, isLoading } = useAlchemicalStatistics();
  return (
    <div className={`inline-flex gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5 ${className}`}>
      {STAT_PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          disabled={isLoading}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
            period === p
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ─── Compact context strip ────────────────────────────────────────────────────

/**
 * Most common usage: one row showing z-badge · sparkline · "μ {mean} ± {σ}".
 * Fetches its own ContextualValue from the active period via the dotted path.
 *
 * Pass `value` if you have a live observation that's newer than the sample
 * file's nearest entry; otherwise the sample's `current` is used.
 */
export function QuantityContextStrip({
  path,
  value,
  stroke = "#a78bfa",
  showSparkline = true,
  showRange = true,
  className = "",
}: {
  path: string;
  value?: number;
  stroke?: string;
  showSparkline?: boolean;
  showRange?: boolean;
  className?: string;
}) {
  const ctx = useQuantityContext(path);
  if (!ctx) {
    return (
      <div className={`text-[9px] text-white/20 italic ${className}`}>
        no stats
      </div>
    );
  }
  const observed = value ?? ctx.current;
  const z = ctx.stdDev > 1e-12 ? (observed - ctx.mean) / ctx.stdDev : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <QuantityZBadge z={z} compact />
      {showSparkline && (
        <QuantitySparkline
          series={ctx.spark}
          current={observed}
          stroke={stroke}
        />
      )}
      <div className="text-[10px] text-white/50 font-mono tabular-nums whitespace-nowrap">
        μ {formatNumber(ctx.mean)}{" "}
        <span className="text-white/30">± {formatNumber(ctx.stdDev)}</span>
      </div>
      {showRange && (
        <div className="hidden sm:block text-[9px] text-white/25 font-mono tabular-nums">
          [{formatNumber(ctx.p10)} – {formatNumber(ctx.p90)}]
        </div>
      )}
    </div>
  );
}

// ─── Wavefunction (histogram + Gaussian overlay) ──────────────────────────────

/**
 * The full "wavefunction" view: a histogram of the period's values with the
 * Gaussian implied by the period's mean/stdDev drawn over the top, and a
 * vertical marker for the current observation.
 *
 * Used by the dedicated Statistics tab.
 */
export function QuantityWavefunction({
  hist,
  ctx,
  current,
  width = 280,
  height = 80,
  stroke = "#a78bfa",
  className = "",
}: {
  hist: Histogram;
  ctx: ContextualValue;
  current?: number;
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
}) {
  const { bars, gaussian, currentX } = useMemo(() => {
    if (hist.counts.length === 0 || hist.binWidth === 0) {
      return { bars: [] as Array<{ x: number; w: number; h: number }>, gaussian: "", currentX: 0 };
    }
    const xMin = hist.edges[0];
    const xMax = hist.edges[hist.edges.length - 1];
    const xRange = Math.max(xMax - xMin, 1e-9);

    const maxCount = Math.max(...hist.counts, 1);
    const binPx = width / hist.counts.length;

    const bars = hist.counts.map((c, i) => ({
      x: i * binPx + 1,
      w: Math.max(0, binPx - 2),
      h: (c / maxCount) * (height - 6),
    }));

    // Gaussian PDF using the period's mean & stdDev, scaled to histogram count.
    const sigma = Math.max(ctx.stdDev, 1e-9);
    const samples = 80;
    const gauss: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= samples; i++) {
      const v = xMin + (i / samples) * xRange;
      const px = ((v - xMin) / xRange) * width;
      const z = (v - ctx.mean) / sigma;
      const pdf = Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
      // Convert pdf → expected count per bin to share the same y-axis as bars.
      const expectedPerBin = pdf * hist.binWidth * ctx.count;
      const py = height - 3 - (expectedPerBin / maxCount) * (height - 6);
      gauss.push({ x: px, y: py });
    }
    const gaussian = gauss
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

    const observed = current ?? ctx.current;
    const currentX = ((observed - xMin) / xRange) * width;

    return { bars, gaussian, currentX };
  }, [hist, ctx, current, width, height]);

  if (bars.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-[9px] text-white/20 ${className}`}
        style={{ width, height }}
      >
        no distribution
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Quantity wavefunction"
    >
      {/* bars */}
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={height - 3 - b.h}
          width={b.w}
          height={b.h}
          fill={stroke}
          fillOpacity={0.18}
        />
      ))}
      {/* gaussian envelope */}
      <path d={gaussian} fill="none" stroke={stroke} strokeWidth={1.25} strokeOpacity={0.85} />
      {/* mean line */}
      <line
        x1={((ctx.mean - hist.edges[0]) / (hist.edges[hist.edges.length - 1] - hist.edges[0])) * width}
        x2={((ctx.mean - hist.edges[0]) / (hist.edges[hist.edges.length - 1] - hist.edges[0])) * width}
        y1={4}
        y2={height - 3}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeDasharray="2 2"
      />
      {/* current marker */}
      <line
        x1={currentX}
        x2={currentX}
        y1={4}
        y2={height - 3}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <circle cx={currentX} cy={6} r={2.5} fill={stroke} />
    </svg>
  );
}
