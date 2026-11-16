"use client";

import { browningExtent } from "@/lib/baking/sim/browning";
import type { SimFrame, SimResult } from "@/lib/baking/sim/simTypes";
import { BakeChart, CHART_SERIES } from "./BakeChart";
import { CrossSection } from "./CrossSection";
import { fmtMinutes, fmtNum, fmtTemp } from "./format";
import { OvenControls } from "./OvenControls";
import type { BakingLab } from "./useBakingLab";
import type { JSX } from "react";

function frameAt(result: SimResult, minutes: number): SimFrame | null {
  let best: SimFrame | null = null;
  for (const f of result.frames) {
    if (best === null || Math.abs(f.tMin - minutes) < Math.abs(best.tMin - minutes)) best = f;
  }
  return best;
}

function Readout({ frame, lab }: { frame: SimFrame; lab: BakingLab }): JSX.Element {
  const { unit } = lab.state;
  const cells: Array<[string, string]> = [
    ["Time", fmtMinutes(frame.tMin)],
    ["Core", fmtTemp(frame.coreC, unit, 1)],
    ["Crust surface", fmtTemp(frame.surfaceC, unit, 0)],
    ["Rise", `${fmtNum((frame.volumeRatio - 1) * 100, 0)} %`],
    ["Moisture lost", `${fmtNum(frame.moistureLossPct, 1)} %`],
    ["Browning", `${fmtNum(browningExtent(frame.browningDose) * 100, 0)} %`],
    ["Core set", `${fmtNum(frame.coreSet * 100, 0)} %`],
    ["Crust", `${fmtNum(frame.crustMm, 1)} mm`],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
      {cells.map(([k, v]) => (
        <div key={k} className="flex flex-col">
          <dt className="bl-label">{k}</dt>
          <dd className="bl-num text-[14px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Timeline({ result }: { result: SimResult }): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <p className="bl-label mb-1">Thermal zones (display bands)</p>
        <ul className="space-y-0.5 text-[12px]">
          {result.zones.map((z) => (
            <li key={z.zone} className="flex justify-between gap-2">
              <span>
                Zone {z.zone} · {z.label}
              </span>
              <span className="bl-num text-white/60">
                {z.startMin === null ? "not reached" : `${z.startMin.toFixed(1)}–${z.endMin === null ? "…" : z.endMin.toFixed(1)} min`}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="bl-label mb-1">Events</p>
        <ul className="space-y-0.5 text-[12px]">
          {result.events.map((e) => (
            <li key={e.id} className="flex justify-between gap-2">
              <span className={e.tMin === null ? "text-white/40" : undefined}>{e.label}</span>
              <span className="bl-num text-white/60">{fmtMinutes(e.tMin)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Warnings({ result }: { result: SimResult }): JSX.Element {
  if (result.warnings.length === 0) return <p className="text-[12px] text-emerald-200/80">No failure mode fired: the core reaches done, sets before the gas peaks, and the crust stays short of scorching.</p>;
  return (
    <div className="space-y-2">
      {result.warnings.map((w) => (
        <div key={w.id} className="bl-warn text-[13px]" data-severity={w.severity}>
          <strong>{w.title}.</strong> {w.detail}
          <div className="bl-num mt-1 text-[10px] text-white/45">rule: {w.rule}</div>
        </div>
      ))}
    </div>
  );
}

function SimView({ result, lab }: { result: SimResult; lab: BakingLab }): JSX.Element {
  const { state } = lab;
  const frame = frameAt(result, state.scrubMin) ?? result.frames[0];
  const end = result.frames[result.frames.length - 1]?.tMin ?? state.oven.bakeMinutes;
  return (
    <div className="bl-card mt-4 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">The bake</h2>
        <span className="bl-num text-xs text-white/55">
          done {fmtMinutes(result.doneMin)} (core {fmtTemp(result.doneCoreC, state.unit)}) · plateau {fmtTemp(result.boilingC, state.unit, 1)} at {fmtNum(result.pressureKpa, 1)} kPa
        </span>
      </div>
      <BakeChart result={result} ovenC={state.oven.ovenC} scrubMin={frame?.tMin ?? 0} unit={state.unit} />
      <ul className="flex flex-wrap gap-3 text-[11px] text-white/60" aria-label="Chart legend">
        {CHART_SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <label htmlFor="bl-scrub" className="block">
        <span className="bl-label">Scrub the bake</span>
        <input id="bl-scrub" className="bl-range" type="range" min={0} max={end} step={0.25} value={frame?.tMin ?? 0} onChange={(e) => lab.dispatch({ type: "scrub", minutes: Number(e.target.value) })} />
      </label>
      {frame === undefined ? null : (
        <div className="grid items-center gap-4 md:grid-cols-[320px_1fr]">
          <CrossSection frame={frame} geometry={state.geometry} ovenC={state.oven.ovenC} plate={state.oven.plate !== null} />
          <Readout frame={frame} lab={lab} />
        </div>
      )}
      <Warnings result={result} />
      <Timeline result={result} />
      <details className="text-[11px] text-white/45">
        <summary className="cursor-pointer">What this model does not do</summary>
        <ul className="mt-2 space-y-1">
          {result.limitations.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function OvenPanel({ lab }: { lab: BakingLab }): JSX.Element {
  const { sim } = lab.derived;
  return (
    <div>
      <OvenControls lab={lab} />
      {sim.available ? <SimView result={sim.value} lab={lab} /> : <div className="bl-card mt-4 text-sm text-amber-200/80">The simulator refused this setup: {sim.reason}</div>}
    </div>
  );
}
