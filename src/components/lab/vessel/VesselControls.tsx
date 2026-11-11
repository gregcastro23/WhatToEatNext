"use client";

import {
  VESSEL_PRESETS,
  VESSEL_RANGES,
  type NumericVesselKey,
  type SealMode,
  type VesselState,
} from "@/lib/cooking/vesselState";
import type { JSX } from "react";

/**
 * The controls of the Hermetic Vessel: seal boundary mode, four SI inputs,
 * cook duration, and four presets.
 *
 * Shared by both kitchen-lab pages, so the alchm simulator is driven by the
 * very same controls as the SI panel rather than a lookalike copy.
 *
 * @file src/components/lab/vessel/VesselControls.tsx
 */

interface SliderSpec {
  key: NumericVesselKey;
  label: string;
  unit: string;
  digits: number;
}

const SLIDERS: readonly SliderSpec[] = [
  { key: "pressureKpa", label: "Vessel pressure", unit: "kPa", digits: 1 },
  { key: "temperatureC", label: "Vessel temperature", unit: "°C", digits: 0 },
  { key: "humidityPct", label: "Headspace humidity", unit: "% RH", digits: 0 },
  { key: "headspaceC", label: "Headspace air temperature", unit: "°C", digits: 0 },
  { key: "durationMinutes", label: "Cook duration", unit: "min", digits: 0 },
];

const SEAL_MODES: ReadonlyArray<{ id: SealMode; label: string }> = [
  { id: "open", label: "Open Cauldron" },
  { id: "hermetic_sealed", label: "Hermetic Reflux (Vas Hermeticum)" },
  { id: "pressure_regulated", label: "Pressure Autoclave" },
  { id: "vacuum_pumped", label: "Vacuum Still" },
];

function Slider({
  spec,
  value,
  onChange,
}: {
  spec: SliderSpec;
  value: number;
  onChange: (key: NumericVesselKey, value: number) => void;
}): JSX.Element {
  const range = VESSEL_RANGES[spec.key];
  const id = `vessel-${spec.key}`;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <label htmlFor={id} className="uppercase tracking-wider text-white/55">
          {spec.label}
        </label>
        <span className="font-mono tabular-nums text-white/85">
          {value.toFixed(spec.digits)} {spec.unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(spec.key, Number(e.target.value))}
        className="w-full accent-[var(--accent,#f0b35a)]"
      />
      <div className="flex justify-between font-mono text-[10px] text-white/30">
        <span>{range.min}</span>
        <span>{range.max}</span>
      </div>
    </div>
  );
}

function SealModeSelector({
  activeSeal,
  onSelect,
}: {
  activeSeal: SealMode;
  onSelect: (sealMode: SealMode) => void;
}): JSX.Element {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">
        Hermetic Boundary Condition
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Hermetic seal mode">
        {SEAL_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className={`rounded border px-3 py-1.5 text-xs tracking-wide transition-colors ${
              activeSeal === mode.id
                ? "border-[var(--accent,#f0b35a)] bg-[var(--accent,#f0b35a)]/15 text-white font-medium"
                : "border-white/15 bg-white/[0.03] text-white/70 hover:border-white/35 hover:text-white"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PresetButtons({ onPreset }: { onPreset: (state: VesselState) => void }): JSX.Element {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">
        Vessel Presets
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Vessel presets">
        {VESSEL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPreset(preset.state)}
            className="rounded border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-wider text-white/70 hover:border-white/35 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function VesselControls({
  vessel,
  onPatch,
  onPreset,
}: {
  vessel: VesselState;
  onPatch: (patch: Partial<VesselState>) => void;
  onPreset: (state: VesselState) => void;
}): JSX.Element {
  const handle = (key: NumericVesselKey, value: number): void => onPatch({ [key]: value });
  const activeSeal = vessel.sealMode ?? "open";

  return (
    <div className="space-y-4">
      <SealModeSelector activeSeal={activeSeal} onSelect={(sealMode) => onPatch({ sealMode })} />
      <PresetButtons onPreset={onPreset} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SLIDERS.map((spec) => (
          <Slider
            key={spec.key}
            spec={spec}
            value={vessel[spec.key] ?? (spec.key === "durationMinutes" ? 15 : 0)}
            onChange={handle}
          />
        ))}
      </div>
    </div>
  );
}
