"use client";

import { useId, type JSX } from "react";
import type { SauceLabInputs, SaucePhysicsReport } from "@/lib/sauces/physics/engine";

function NumericField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (next: number) => void;
}): JSX.Element {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="sl-label block">
        {label} <span className="text-white/45 normal-case">({unit})</span>
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="sl-input w-full"
      />
    </div>
  );
}

const SHEAR_MODES: ReadonlyArray<{ label: string; radiusUm: number }> = [
  { label: "Immersion Blender (6 μm)", radiusUm: 6 },
  { label: "Balloon Whisk (22 μm)", radiusUm: 22 },
  { label: "Spoon / Fork (45 μm)", radiusUm: 45 },
];

function ThermalWindowMeter({
  inputs,
  report,
}: {
  inputs: SauceLabInputs;
  report: SaucePhysicsReport;
}): JSX.Element {
  const { onsetC, ceilingC } = report.thickener;
  const pct = (c: number): number => Math.min(100, Math.max(0, (c / 110) * 100));
  const tempPct = pct(inputs.tempC);
  const startPct = onsetC !== null ? pct(onsetC) : null;
  const endPct = ceilingC !== null ? pct(ceilingC) : 95;

  return (
    <div className="sl-card space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="sl-label">Thermal Stability Window (0–110 °C)</span>
        <span className="sl-num text-white/80">{inputs.tempC.toFixed(0)} °C</span>
      </div>
      <svg viewBox="0 0 300 28" className="w-full h-7 overflow-visible" role="img" aria-label={`Pan temperature ${inputs.tempC.toFixed(0)} degrees Celsius`}>
        <rect x={0} y={8} width={300} height={12} rx={6} fill="rgba(255,255,255,0.08)" />
        {startPct !== null && (
          <rect
            x={startPct * 3}
            y={8}
            width={Math.max(6, (endPct - startPct) * 3)}
            height={12}
            rx={4}
            fill="rgba(52,211,153,0.35)"
            stroke="rgba(52,211,153,0.75)"
            strokeWidth={1}
          />
        )}
        {ceilingC !== null && (
          <rect
            x={pct(ceilingC) * 3}
            y={8}
            width={Math.max(4, (100 - pct(ceilingC)) * 3)}
            height={12}
            rx={4}
            fill="rgba(244,63,94,0.3)"
          />
        )}
        <circle cx={tempPct * 3} cy={14} r={6} fill="#34d399" stroke="#08080e" strokeWidth={2} />
      </svg>
      <p className="text-[11px] text-white/55">
        {onsetC !== null
          ? `Activation onset ${onsetC} °C${ceilingC !== null ? ` · upper curdling/break ceiling ${ceilingC} °C` : " · hold simmer ≤ 96 °C"}.`
          : "Physical stabilization via lipid packing and particulate suspension."}
      </p>
    </div>
  );
}

export function EmulsionBodyPanel({
  inputs,
  report,
  onChange,
}: {
  inputs: SauceLabInputs;
  report: SaucePhysicsReport;
  onChange: (patch: Partial<SauceLabInputs>) => void;
}): JSX.Element {
  const tempId = useId();
  const radiusId = useId();

  return (
    <div className="space-y-4">
      <div className="sl-card space-y-4">
        <h3 className="text-base">Base Phase Masses & Batch Scale</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <NumericField label="Aqueous phase" value={inputs.waterG} min={0} max={2000} unit="g" onChange={(waterG) => onChange({ waterG })} />
          <NumericField label="Lipid / Butter" value={inputs.fatG} min={0} max={1000} unit="g" onChange={(fatG) => onChange({ fatG })} />
          <NumericField label="Starch / Flour" value={inputs.starchG} min={0} max={250} unit="g" onChange={(starchG) => onChange({ starchG })} />
          <NumericField label="Protein / Lecithin" value={inputs.proteinG} min={0} max={200} step={0.5} unit="g" onChange={(proteinG) => onChange({ proteinG })} />
          <NumericField label="Dissolved solutes" value={inputs.solutesG} min={0} max={400} unit="g" onChange={(solutesG) => onChange({ solutesG })} />
          <NumericField label="Pan Temp" value={inputs.tempC} min={10} max={110} unit="°C" onChange={(tempC) => onChange({ tempC })} />
        </div>
        <div>
          <label htmlFor={tempId} className="sl-label block mb-1">
            Holding / Simmer Temperature: {inputs.tempC.toFixed(0)} °C
          </label>
          <input
            id={tempId}
            type="range"
            min={10}
            max={105}
            step={1}
            value={inputs.tempC}
            onChange={(e) => onChange({ tempC: Number(e.target.value) })}
            className="w-full accent-emerald-400 min-h-[32px]"
          />
        </div>
      </div>

      <div className="sl-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base mb-0">Mechanical Shear & Droplet Size</h3>
          <span className="sl-num text-xs text-emerald-300">{inputs.dropletRadiusUm} μm</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SHEAR_MODES.map((m) => (
            <button
              key={m.label}
              type="button"
              aria-pressed={inputs.dropletRadiusUm === m.radiusUm}
              onClick={() => onChange({ dropletRadiusUm: m.radiusUm })}
              className="sl-btn"
            >
              {m.label}
            </button>
          ))}
        </div>
        <label htmlFor={radiusId} className="sl-label block">
          Mean droplet radius{" "}
          <span className="text-white/55 normal-case">({inputs.dropletRadiusUm} μm — Stokes creaming scales as r²)</span>
        </label>
        <input
          id={radiusId}
          type="range"
          min={4}
          max={60}
          step={1}
          value={inputs.dropletRadiusUm}
          onChange={(e) => onChange({ dropletRadiusUm: Number(e.target.value) })}
          className="w-full accent-emerald-400 min-h-[32px]"
        />
      </div>

      <ThermalWindowMeter inputs={inputs} report={report} />
    </div>
  );
}
