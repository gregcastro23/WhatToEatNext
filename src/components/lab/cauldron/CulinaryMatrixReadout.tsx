"use client";

import type { CulinaryMatrix, HermeticOperationInfo } from "@/utils/cauldronTransformation";
import type { JSX } from "react";

/**
 * Visual gauges for the culinary matrix (collagen hydrolysis, Maillard fond,
 * volatile aroma retention, reduction concentration, starch softening) and
 * active Hermetic Operation badge (Opus Culinaris).
 *
 * @file src/components/lab/cauldron/CulinaryMatrixReadout.tsx
 */

function GaugeBar({
  label,
  value,
  unit,
  accent = false,
  inverse = false,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
  inverse?: boolean;
}): JSX.Element {
  const pct = Math.min(100, Math.max(0, value));
  let barColor = "bg-[var(--accent,#f0b35a)]";
  if (inverse) {
    barColor = pct > 85 ? "bg-emerald-400" : pct > 50 ? "bg-amber-400" : "bg-rose-400";
  } else if (accent) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-mono tabular-nums text-white/90">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OperationHeader({ operation }: { operation: HermeticOperationInfo }): JSX.Element {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-medium">
            Active Opus Culinaris Operation
          </span>
          <h4 className="text-sm font-semibold tracking-wide text-white">
            {operation.label}
          </h4>
        </div>
        <div className="text-right">
          <span className="inline-block rounded border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[11px] font-mono text-white/80">
            {operation.elementalBoost}
          </span>
        </div>
      </div>
      <p className="text-xs text-white/60 italic leading-relaxed">
        {operation.principle} — {operation.culinaryEffect}
      </p>
    </>
  );
}

function MatrixGauges({ matrix }: { matrix: CulinaryMatrix }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <GaugeBar
        label="Collagen → Gelatin Hydrolysis"
        value={matrix.collagenHydrolysisPct}
        unit="%"
      />
      <GaugeBar
        label="Volatile Spirit Retention"
        value={matrix.volatileAromaticRetentionPct}
        unit="%"
        inverse
      />
      <GaugeBar
        label="Maillard Fond Index"
        value={matrix.maillardFondIndex}
        unit="/100"
        accent
      />
      <GaugeBar
        label="Starch & Pectin Softening"
        value={matrix.starchPectinSofteningPct}
        unit="%"
      />
    </div>
  );
}

export function CulinaryMatrixReadout({
  operation,
  matrix,
  refluxRatio,
}: {
  operation: HermeticOperationInfo;
  matrix: CulinaryMatrix;
  refluxRatio: number;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-4 space-y-4">
      <OperationHeader operation={operation} />
      <MatrixGauges matrix={matrix} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/50">Reduction Factor:</span>
          <span className="font-mono font-medium text-amber-300">
            {matrix.reductionConcentrationFactor.toFixed(2)}×
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50">Dome Reflux Ratio:</span>
          <span className="font-mono font-medium text-emerald-300">
            {(refluxRatio * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
