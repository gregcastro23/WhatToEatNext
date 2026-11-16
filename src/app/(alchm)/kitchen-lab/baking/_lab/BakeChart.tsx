"use client";

import { browningExtent } from "@/lib/baking/sim/browning";
import type { SimFrame, SimResult, ZoneSpan } from "@/lib/baking/sim/simTypes";
import { cToF } from "@/lib/cooking/thermo";
import type { TempUnit } from "./format";
import type { JSX } from "react";

const W = 640;
const H = 250;
const PAD = { left: 44, right: 40, top: 12, bottom: 28 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

interface Scales {
  x: (tMin: number) => number;
  yTemp: (celsius: number) => number;
  yPct: (pct: number) => number;
  maxMin: number;
  maxC: number;
}

function scales(result: SimResult, ovenC: number): Scales {
  const last = result.frames[result.frames.length - 1];
  const maxMin = Math.max(last?.tMin ?? 1, 1);
  const maxC = Math.ceil(Math.max(ovenC, ...result.frames.map((f) => f.surfaceC)) / 25) * 25;
  return {
    x: (t) => PAD.left + (t / maxMin) * PLOT_W,
    yTemp: (c) => PAD.top + PLOT_H - (Math.max(c, 0) / maxC) * PLOT_H,
    yPct: (p) => PAD.top + PLOT_H - (Math.min(Math.max(p, 0), 100) / 100) * PLOT_H,
    maxMin,
    maxC,
  };
}

function path(frames: readonly SimFrame[], x: (f: SimFrame) => number, y: (f: SimFrame) => number | null): string {
  let d = "";
  for (const f of frames) {
    const yy = y(f);
    if (yy === null) continue;
    d += `${d === "" ? "M" : "L"}${x(f).toFixed(1)},${yy.toFixed(1)}`;
  }
  return d;
}

const ZONE_COLORS: Record<ZoneSpan["zone"], string> = { 1: "#f6c177", 2: "#9ccfd8", 3: "#c4a7e7", 4: "#31748f", 5: "#eb6f92" };

function ZoneStrip({ zones, s }: { zones: readonly ZoneSpan[]; s: Scales }): JSX.Element {
  return (
    <g aria-hidden="true">
      {zones.map((z) => {
        if (z.startMin === null) return null;
        const x0 = s.x(z.startMin);
        const x1 = s.x(z.endMin ?? s.maxMin);
        return <rect key={z.zone} x={x0} y={PAD.top + PLOT_H + 4 + (z.zone - 1) * 2.4} width={Math.max(x1 - x0, 1)} height={2.4} fill={ZONE_COLORS[z.zone]} opacity={0.9} />;
      })}
    </g>
  );
}

function Axes({ s, unit }: { s: Scales; unit: TempUnit }): JSX.Element {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * s.maxC);
  return (
    <g className="text-white/40" fontSize="9" fill="currentColor">
      {ticks.map((c) => (
        <g key={c}>
          <line x1={PAD.left} x2={W - PAD.right} y1={s.yTemp(c)} y2={s.yTemp(c)} stroke="currentColor" strokeOpacity="0.15" />
          <text x={PAD.left - 6} y={s.yTemp(c) + 3} textAnchor="end">
            {(unit === "C" ? c : cToF(c)).toFixed(0)}°
          </text>
          <text x={W - PAD.right + 6} y={s.yTemp(c) + 3}>
            {((c / s.maxC) * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <text x={PAD.left} y={H - 4}>0 min</text>
      <text x={W - PAD.right} y={H - 4} textAnchor="end">
        {s.maxMin.toFixed(0)} min
      </text>
    </g>
  );
}

export type SeriesKey = "core" | "crust" | "plate" | "rise" | "brown";

export const CHART_SERIES: ReadonlyArray<{ key: SeriesKey; label: string; color: string }> = [
  { key: "core", label: "Core", color: "var(--el-water)" },
  { key: "crust", label: "Crust surface", color: "var(--el-fire)" },
  { key: "plate", label: "Pan / bottom", color: "rgba(255,255,255,0.45)" },
  { key: "rise", label: "Rise %", color: "var(--el-air)" },
  { key: "brown", label: "Browning %", color: "var(--accent-2)" },
];

export function BakeChart({ result, ovenC, scrubMin, unit }: { result: SimResult; ovenC: number; scrubMin: number; unit: TempUnit }): JSX.Element {
  const s = scales(result, ovenC);
  const fx = (f: SimFrame): number => s.x(f.tMin);
  const series: Record<SeriesKey, string> = {
    core: path(result.frames, fx, (f) => s.yTemp(f.coreC)),
    crust: path(result.frames, fx, (f) => s.yTemp(f.surfaceC)),
    plate: path(result.frames, fx, (f) => (f.plateC === null ? null : s.yTemp(f.plateC))),
    rise: path(result.frames, fx, (f) => s.yPct((f.volumeRatio - 1) * 100)),
    brown: path(result.frames, fx, (f) => s.yPct(browningExtent(f.browningDose) * 100)),
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Core and crust temperature, rise and browning over the bake">
      <Axes s={s} unit={unit} />
      {CHART_SERIES.map((c) => (
        <path key={c.key} d={series[c.key]} fill="none" stroke={c.color} strokeWidth={c.key === "core" || c.key === "crust" ? 2.2 : 1.4} strokeDasharray={c.key === "plate" ? "4 3" : c.key === "rise" || c.key === "brown" ? "6 3" : undefined} />
      ))}
      <line x1={s.x(scrubMin)} x2={s.x(scrubMin)} y1={PAD.top} y2={PAD.top + PLOT_H} stroke="white" strokeOpacity="0.7" strokeWidth="1" />
      <line x1={PAD.left} x2={W - PAD.right} y1={s.yTemp(result.boilingC)} y2={s.yTemp(result.boilingC)} stroke="var(--el-water)" strokeOpacity="0.35" strokeDasharray="2 4" />
      <ZoneStrip zones={result.zones} s={s} />
    </svg>
  );
}
