"use client";

import { useEffect, useState, type JSX } from "react";
import { simulateBoneConduction3d, type BoneConduction3dResult } from "@/lib/butcher/science/boneConduction3d";
import { VOXEL_BONE, VOXEL_MARROW } from "@/lib/butcher/science/boneVoxelGeometry";
import { grayBandThresholdForCut, type TrajectoryMethodId } from "@/lib/butcher/science/trajectoryMethods";
import type { AnatomicalCut } from "@/lib/butcher/types";

/**
 * 3D voxel conduction readout for bone-in steaks and chops whose bone runs
 * through the thickness: a mid-length cross-section heat map of peak
 * temperature, and the bone-adjacent vs away-from-bone columns. Runs on the
 * Rust/WASM engine when it loads, otherwise the bit-identical TypeScript twin,
 * and says which.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/BoneConduction3dPanel.tsx
 */

type ColumnReadout = BoneConduction3dResult["boneAdjacent"];

const BONE_FILL = "#f5eedc";
const MARROW_FILL = "#e7d49b";

function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * Math.min(1, Math.max(0, t))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Peak-temperature ramp: raw (≤ 30 °C) → doneness pink at target → gray at the gray-band threshold → crust brown. */
function peakColor(tempC: number, targetC: number, grayC: number): string {
  if (tempC <= targetC) return lerpHex("#4c0519", "#fb7185", (tempC - 30) / Math.max(1, targetC - 30));
  if (tempC <= grayC) return lerpHex("#fb7185", "#a8a29e", (tempC - targetC) / Math.max(1, grayC - targetC));
  return lerpHex("#a8a29e", "#7c2d12", (tempC - grayC) / 60);
}

function SliceHeatmap({ result, targetC, grayC }: { readonly result: BoneConduction3dResult; readonly targetC: number; readonly grayC: number }): JSX.Element {
  const { nx, ny, material, peakTemps } = result.slice;
  const cells: JSX.Element[] = [];
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const idx = i + nx * j;
      const mat = material[idx] ?? 0;
      const fill = mat === VOXEL_BONE ? BONE_FILL : mat === VOXEL_MARROW ? MARROW_FILL : peakColor(peakTemps[idx] ?? 20, targetC, grayC);
      cells.push(<rect key={idx} x={i} y={j} width={1.02} height={1.02} fill={fill} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${nx} ${ny}`}
      preserveAspectRatio="none"
      className="h-28 w-full rounded-md border border-white/15"
      role="img"
      aria-label={`Mid-length cross-section, ${result.grid.widthMm.toFixed(0)} mm wide by ${(result.grid.dyMm * ny).toFixed(0)} mm thick: peak temperature with the bone in ivory`}
    >
      {cells}
    </svg>
  );
}

function ColumnCard({ title, col, tone }: { readonly title: string; readonly col: ColumnReadout; readonly tone: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-2.5 text-xs">
      <span className="bt-label block">{title} · {col.distanceFromBoneMm.toFixed(0)} mm from bone</span>
      <span className={`bt-num block text-sm ${tone}`}>At pull {col.coreAtRemovalC.toFixed(1)} °C</span>
      <span className="bt-num block text-white/75">Carryover +{col.carryoverRiseC.toFixed(1)} °C → {col.carryoverPeakC.toFixed(1)} °C</span>
      <span className="bt-num block text-white/75">Gray band {col.grayBandMm.toFixed(1)} mm</span>
    </div>
  );
}

function useBoneConduction(cut: AnatomicalCut, method: TrajectoryMethodId, targetCoreTempC: number): { readonly result: BoneConduction3dResult | null; readonly pending: boolean } {
  const [state, setState] = useState<{ readonly key: string; readonly result: BoneConduction3dResult | null } | null>(null);
  const key = `${cut.id}|${method}|${targetCoreTempC}`;
  useEffect(() => {
    let cancelled = false;
    simulateBoneConduction3d({ cut, method, targetCoreTempC })
      .then((result) => {
        if (!cancelled) setState({ key, result });
      })
      .catch(() => {
        if (!cancelled) setState({ key, result: null });
      });
    return (): void => {
      cancelled = true;
    };
  }, [cut, method, targetCoreTempC, key]);
  return { result: state?.key === key ? state.result : null, pending: state?.key !== key };
}

function BoneEffectSummary({ result }: { readonly result: BoneConduction3dResult }): JSX.Element {
  const effect = result.boneEffectAtRemovalC;
  const verdict = Math.abs(effect) < 0.5
    ? "under 0.5 °C — the meat beside the bone reads within half a degree of"
    : `${Math.abs(effect).toFixed(1)} °C ${effect > 0 ? "cooler" : "warmer"} beside the bone than`;
  return (
    <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-2.5 text-xs text-white/80">
      <strong className="text-emerald-200">Bone effect: {verdict}</strong> the same spot in a boneless steak,
      after {result.cookMinutes} min to a {result.pullCoreTempC} °C pull. Cortical bone carries heat almost as fast as lean
      meat, so most of the &quot;rare by the bone&quot; you see in a pan comes from the bone holding the meat off the pan — contact this
      conduction model does not include.
    </p>
  );
}

export function BoneConduction3dPanel({
  cut,
  method,
  targetCoreTempC,
}: {
  readonly cut: AnatomicalCut;
  readonly method: TrajectoryMethodId;
  readonly targetCoreTempC: number;
}): JSX.Element | null {
  const { result, pending } = useBoneConduction(cut, method, targetCoreTempC);
  if (pending) return <div className="bt-card text-xs text-white/55">Running the 3D bone conduction model…</div>;
  if (!result) return null;
  const grayC = grayBandThresholdForCut(cut, targetCoreTempC);
  return (
    <section className="bt-card space-y-3" aria-label="3D bone conduction">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg">3D Bone-In Conduction</h3>
          <p className="text-xs text-white/60">
            The bone runs through the thickness, so this {result.grid.nx}×{result.grid.ny}×{result.grid.nz} voxel model shows its effect; the 1D column above is the meat away from it.
          </p>
        </div>
        <span className="rounded-md border border-white/15 px-2 py-0.5 text-[11px] text-white/70">
          {result.runtime === "rust-wasm" ? "RUST · WASM" : "TypeScript"}
        </span>
      </div>
      <SliceHeatmap result={result} targetC={targetCoreTempC} grayC={grayC} />
      <BoneEffectSummary result={result} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ColumnCard title="Beside the bone" col={result.boneAdjacent} tone="text-amber-200" />
        <ColumnCard title="Same spot, boneless" col={result.boneAdjacentBoneless} tone="text-white/85" />
        <ColumnCard title="Thermal centre (probe)" col={result.awayFromBone} tone="text-white" />
      </div>
      <details className="text-[11px] text-white/55">
        <summary className="cursor-pointer text-white/70">Model basis</summary>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {result.basis.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </details>
    </section>
  );
}
