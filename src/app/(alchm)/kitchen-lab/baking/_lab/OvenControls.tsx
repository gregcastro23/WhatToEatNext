"use client";

import { COOKWARE_MATERIALS } from "@/data/cooking/cookwareMaterials";
import type { OvenMode } from "@/lib/baking/formulaTypes";
import { cToF, fToC, type FoodGeometry } from "@/lib/cooking/thermo";
import { DraftNumberInput } from "./DraftNumberInput";
import type { BakingLab } from "./useBakingLab";
import type { JSX } from "react";

interface FieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}

function NumberField({ id, label, value, min, max, step, suffix, onChange }: FieldProps): JSX.Element {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-[12px] text-white/70">
      <span className="bl-label">{label}</span>
      <span className="flex items-center gap-1">
        <DraftNumberInput id={id} label={label} value={value} min={min} max={max} step={step} digits={2} onCommit={onChange} />
        <span className="text-white/45">{suffix}</span>
      </span>
    </label>
  );
}

const MODES: ReadonlyArray<[OvenMode, string]> = [
  ["conventional", "Conventional"],
  ["convection", "Convection (fan)"],
  ["deck", "Deck / stone"],
];

const SHAPES: ReadonlyArray<[FoodGeometry, string]> = [
  ["slab", "Slab (cake, cookie, sheet)"],
  ["cylinder", "Cylinder (tin loaf, baguette)"],
  ["sphere", "Sphere (boule, roll)"],
];

function OvenFields({ lab }: { lab: BakingLab }): JSX.Element {
  const { oven, unit } = lab.state;
  const set = (patch: Partial<typeof oven>): void => lab.dispatch({ type: "oven", patch });
  const shown = unit === "C" ? oven.ovenC : cToF(oven.ovenC);
  const stage2C = oven.stage2OvenC ?? null;
  const shown2 = stage2C === null ? null : unit === "C" ? stage2C : cToF(stage2C);
  const stage1Min = oven.stage1Minutes ?? (oven.steamMinutes > 0 ? oven.steamMinutes : Math.max(1, Math.round(oven.bakeMinutes / 2)));
  return (
    <div className="flex flex-wrap items-end gap-4">
      <NumberField id="bl-oven" label={stage2C === null ? "Oven" : "Stage 1 oven"} value={shown} min={unit === "C" ? 100 : 212} max={unit === "C" ? 320 : 608} step={5} suffix={`°${unit}`} onChange={(v) => set({ ovenC: unit === "C" ? v : fToC(v) })} />
      {stage2C !== null && shown2 !== null ? (
        <>
          <NumberField id="bl-stage1-min" label="Stage 1 for" value={stage1Min} min={1} max={240} step={1} suffix="min" onChange={(v) => set({ stage1Minutes: v })} />
          <NumberField id="bl-oven2" label="Stage 2 oven" value={shown2} min={unit === "C" ? 100 : 212} max={unit === "C" ? 320 : 608} step={5} suffix={`°${unit}`} onChange={(v) => set({ stage2OvenC: unit === "C" ? v : fToC(v) })} />
          <button type="button" className="bl-btn" onClick={() => set({ stage2OvenC: null, stage1Minutes: null })}>
            Single stage
          </button>
        </>
      ) : (
        <button
          type="button"
          className="bl-btn"
          onClick={() => set({ stage2OvenC: Math.max(100, oven.ovenC - 20), stage1Minutes: oven.steamMinutes > 0 ? oven.steamMinutes : Math.max(1, Math.round(oven.bakeMinutes / 3)) })}
        >
          + Stage 2 temp
        </button>
      )}
      <label htmlFor="bl-mode" className="flex flex-col gap-1 text-[12px]">
        <span className="bl-label">Mode</span>
        <select id="bl-mode" className="bl-input" value={oven.mode} onChange={(e) => set({ mode: MODES.find(([m]) => m === e.target.value)?.[0] ?? oven.mode })}>
          {MODES.map(([m, label]) => (
            <option key={m} value={m}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {oven.mode === "convection" ? <NumberField id="bl-fan" label="Fan air speed" value={oven.fanMs} min={0} max={15} step={0.5} suffix="m/s" onChange={(v) => set({ fanMs: v })} /> : null}
      <NumberField id="bl-steam" label="Steam (vapour)" value={oven.steamFraction * 100} min={0} max={90} step={5} suffix="%" onChange={(v) => set({ steamFraction: v / 100 })} />
      <NumberField id="bl-steam-min" label="Steam for" value={oven.steamMinutes} min={0} max={60} step={1} suffix="min" onChange={(v) => set({ steamMinutes: v })} />
      <NumberField id="bl-bake" label="Bake time" value={oven.bakeMinutes} min={1} max={240} step={1} suffix="min" onChange={(v) => set({ bakeMinutes: v })} />
      <NumberField id="bl-elev" label="Elevation" value={oven.elevationM} min={0} max={4500} step={100} suffix="m" onChange={(v) => set({ elevationM: v })} />
    </div>
  );
}

function PlateFields({ lab }: { lab: BakingLab }): JSX.Element {
  const { plate } = lab.state.oven;
  return (
    <div className="flex flex-wrap gap-4">
      <label htmlFor="bl-plate" className="flex flex-col gap-1 text-[12px]">
        <span className="bl-label">Pan / stone</span>
        <select
          id="bl-plate"
          className="bl-input"
          value={plate?.materialId ?? "none"}
          onChange={(e) => lab.dispatch({ type: "oven", patch: { plate: e.target.value === "none" ? null : { materialId: e.target.value, thicknessMm: plate?.thicknessMm ?? 2 } } })}
        >
          <option value="none">None (on the rack)</option>
          {COOKWARE_MATERIALS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      {plate === null ? null : (
        <NumberField id="bl-plate-mm" label="Thickness" value={plate.thicknessMm} min={0.3} max={30} step={0.5} suffix="mm" onChange={(v) => lab.dispatch({ type: "oven", patch: { plate: { ...plate, thicknessMm: v } } })} />
      )}
    </div>
  );
}

function ProductFields({ lab }: { lab: BakingLab }): JSX.Element {
  const { geometry, process, doneCoreC } = lab.state;
  const geo = (patch: Partial<typeof geometry>): void => lab.dispatch({ type: "geometry", patch });
  return (
    <div className="flex flex-wrap gap-4">
      <label htmlFor="bl-shape" className="flex flex-col gap-1 text-[12px]">
        <span className="bl-label">Shape</span>
        <select id="bl-shape" className="bl-input" value={geometry.shape} onChange={(e) => geo({ shape: SHAPES.find(([s]) => s === e.target.value)?.[0] ?? geometry.shape })}>
          {SHAPES.map(([s, label]) => (
            <option key={s} value={s}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <NumberField id="bl-dim" label={geometry.shape === "slab" ? "Thickness" : "Radius"} value={geometry.dimensionM * 100} min={0.2} max={50} step={0.1} suffix="cm" onChange={(v) => geo({ dimensionM: v / 100 })} />
      <NumberField id="bl-span" label="Top width" value={geometry.spanM * 100} min={1} max={200} step={1} suffix="cm" onChange={(v) => geo({ spanM: v / 100 })} />
      {geometry.shape === "slab" ? null : <NumberField id="bl-contact" label="Resting on pan" value={geometry.contactFraction * 100} min={0} max={100} step={5} suffix="%" onChange={(v) => geo({ contactFraction: v / 100 })} />}
      <NumberField id="bl-density" label="Batter density" value={process.densityGPerMl} min={0.1} max={1.6} step={0.01} suffix="g/mL" onChange={(v) => lab.dispatch({ type: "process", patch: { densityGPerMl: v } })} />
      <NumberField id="bl-start" label="Batter temp" value={process.startC} min={1} max={60} step={1} suffix="°C" onChange={(v) => lab.dispatch({ type: "process", patch: { startC: v } })} />
      <NumberField id="bl-done" label="Done at core" value={doneCoreC} min={60} max={99} step={1} suffix="°C" onChange={(v) => lab.dispatch({ type: "done", celsius: v })} />
    </div>
  );
}

export function OvenControls({ lab }: { lab: BakingLab }): JSX.Element {
  return (
    <div className="bl-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Oven</h2>
        <div role="group" aria-label="Temperature unit" className="flex gap-1">
          {(["C", "F"] satisfies Array<"C" | "F">).map((u) => (
            <button key={u} type="button" className="bl-btn" aria-pressed={lab.state.unit === u} onClick={() => lab.dispatch({ type: "unit", unit: u })}>
              °{u}
            </button>
          ))}
        </div>
      </div>
      <OvenFields lab={lab} />
      <PlateFields lab={lab} />
      <ProductFields lab={lab} />
    </div>
  );
}
