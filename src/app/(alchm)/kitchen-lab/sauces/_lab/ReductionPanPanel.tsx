"use client";

import { useId, useMemo, type JSX } from "react";
import { simulateReductionCurve, type SauceLabInputs, type SaucePhysicsReport } from "@/lib/sauces/physics/engine";

function ReductionSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (val: number) => void;
}): JSX.Element {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="sl-label">
          {label}
        </label>
        <span className="sl-num text-xs text-white/85">
          {value} {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400 min-h-[32px]"
      />
    </div>
  );
}

function ReductionCurveChart({ inputs }: { inputs: SauceLabInputs }): JSX.Element {
  const points = useMemo(() => simulateReductionCurve(inputs, 8), [inputs]);
  const maxMin = Math.max(1, points[points.length - 1]?.minutes ?? 1);
  const pathSolids = points
    .map((p, idx) => {
      const x = (p.minutes / maxMin) * 280 + 10;
      const y = 100 - Math.min(92, p.solidsPct) * 0.9;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="sl-card space-y-2">
      <div className="flex items-center justify-between">
        <span className="sl-label">Evaporative Concentration Trajectory</span>
        <span className="sl-num text-[11px] text-emerald-300">Solids % vs Simmer min</span>
      </div>
      <svg
        viewBox="0 0 300 112"
        className="w-full h-28"
        role="img"
        aria-label="Solids concentration percentage over simmer duration"
      >
        <line x1={10} y1={100} x2={290} y2={100} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
        <line x1={10} y1={10} x2={10} y2={100} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
        <path d={pathSolids} fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p) => {
          const cx = (p.minutes / maxMin) * 280 + 10;
          const cy = 100 - Math.min(92, p.solidsPct) * 0.9;
          return <circle key={p.reductionPct} cx={cx} cy={cy} r={3} fill="#a7f3d0" />;
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-white/50 sl-num">
        <span>0 min</span>
        <span>Target endpoint: {maxMin.toFixed(1)} min</span>
      </div>
    </div>
  );
}

export function ReductionPanPanel({
  inputs,
  report,
  onChange,
}: {
  inputs: SauceLabInputs;
  report: SaucePhysicsReport;
  onChange: (patch: Partial<SauceLabInputs>) => void;
}): JSX.Element {
  const { reduction } = report;
  return (
    <div className="space-y-4">
      <div className="sl-card space-y-4">
        <h3 className="text-base">Open-Pan Reduction & Energy Balance</h3>
        <ReductionSlider label="Target water evaporated" value={inputs.targetReductionPct} min={0} max={70} step={1} suffix="%" onChange={(targetReductionPct) => onChange({ targetReductionPct })} />
        <ReductionSlider label="Burner power input" value={inputs.burnerWatts} min={150} max={1400} step={25} suffix="W" onChange={(burnerWatts) => onChange({ burnerWatts })} />
        <ReductionSlider label="Saucepan diameter" value={inputs.panDiameterCm} min={14} max={32} step={1} suffix="cm" onChange={(panDiameterCm) => onChange({ panDiameterCm })} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sl-card">
          <div className="sl-label">Water Boiled Off</div>
          <div className="sl-num text-lg mt-1">{report.evaporatedWaterG.toFixed(0)} g</div>
        </div>
        <div className="sl-card">
          <div className="sl-label">Latent Heat Req.</div>
          <div className="sl-num text-lg mt-1">{reduction.latentEnergyKj.toFixed(0)} kJ</div>
        </div>
        <div className="sl-card">
          <div className="sl-label">Salinity Factor</div>
          <div className="sl-num text-lg mt-1 text-amber-200">{reduction.soluteConcentrationFactor.toFixed(2)}×</div>
        </div>
        <div className="sl-card">
          <div className="sl-label">Effective Boil T_b</div>
          <div className="sl-num text-lg mt-1">{reduction.effectiveBoilingC.toFixed(1)} °C</div>
        </div>
      </div>

      <ReductionCurveChart inputs={inputs} />
    </div>
  );
}
