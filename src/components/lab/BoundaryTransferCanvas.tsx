"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import type {
  BoundaryNetworkInput,
  BoundaryNetworkResult,
} from "@/lib/cooking/boundaryNetwork";
import { createBoundarySolver, type BoundarySolver } from "@/lib/wasm/thermoEngine";
import { CitationChip, Refused } from "./CitationChip";

/**
 * The medium-transfer canvas — heat crossing atmosphere → vessel wall → medium
 * → food, drawn from a SOLVED series resistance network.
 *
 * ## What is drawn is what was solved
 *
 * Every dimension on this canvas is a function of `BoundaryNetworkResult`, and
 * nothing on it is decoration that could disagree with the numbers printed
 * underneath it:
 *
 * - **Band width** is the link's `share` of ΣR. The controlling link is the
 *   widest band because it *is* the largest resistance, not because it was
 *   styled to look important.
 * - **Band fill** is a gradient between the two node temperatures that bound
 *   the link, from `result.nodes`. The chain cools left to right and the fill
 *   cools with it.
 * - **Carrier speed** is proportional to that link's conductance, `1/R`. Only
 *   the overall time scale is a design choice ({@link TRAVERSE_SECONDS}); the
 *   *ratios* between bands are the solved resistance ratios and cannot drift
 *   from them.
 * - **Carrier density** is not set anywhere. Carriers are injected at a
 *   constant rate — which is what a steady chain requires, since the same flux
 *   crosses every plane — so they pile up in the slow band on their own. The
 *   crowd in front of the bottleneck is an output, not an effect.
 *
 * ## Why there are two x-axes
 *
 * The temperature profile is drawn on **equal-width slots**, one per link, and
 * the resistance bands underneath are drawn on **share-width bands**. The
 * connector between the two lanes is the transformation from one to the other.
 *
 * This is deliberate and it is the whole picture. Plotting the profile against
 * share would produce a perfectly straight line every time — with `x ∝ R` and
 * `ΔT = Q·R`, temperature is exactly linear in x, for any chain. True, and it
 * teaches nothing. On equal slots the drop across each slot is `Q·R_i`, so the
 * steep segment sits directly above the wide band and the correspondence
 * "the temperature falls where the resistance is" becomes visible.
 *
 * ## Two things this component will not do
 *
 * 1. **Claim an engine it is not running.** `public/wasm` is gitignored, so a
 *    fresh checkout takes the TypeScript path. The badge reads `solver.engine`.
 * 2. **Render a number it does not have.** `solve()` returning null is a
 *    REFUSAL; so is a decoded result whose nodes and links disagree. Both take
 *    the {@link Refused} path — an em dash with the reason — never a zero,
 *    never "N/A", never a NaN that paints as an invisible line.
 *
 * @file src/components/lab/BoundaryTransferCanvas.tsx
 */

// ============================================================================
// The default chain
// ============================================================================

/**
 * A simmering pot: hob plate → stainless base → water → potato.
 *
 * ⚠️ NOT exported, and that is on purpose. This module is `"use client"`, and
 * Next replaces a client module's exports with reference proxies when a server
 * component imports them — a shared constant pulled across that seam arrives
 * `undefined` at runtime with no type error. A caller that wants its own chain
 * passes `input`; it does not borrow this object.
 *
 * ── Basis for each value ────────────────────────────────────────────────────
 *
 * These are ARRANGEMENT-TYPICAL magnitudes chosen to make the picture
 * representative of a real pot, in the same spirit as the illustrative
 * compositions in `LatentHeatPanel`. They are not a measurement of one
 * particular pot on one particular hob, and the caption says so.
 *
 * | field | value | basis |
 * |---|---|---|
 * | `sourceC` | 118 °C | chosen so the solved medium node lands on water's boiling point — see below |
 * | `sinkC` | 20 °C | food core at drop-in, i.e. room temperature |
 * | `areaM2` | 0.0314 | a 20 cm pot base, π·(0.10 m)² |
 * | `sourceToVesselHWm2K` | 1000 | metal-on-metal contact conductance, hob plate ↔ pan base |
 * | `kWmK` | 16.2 | AISI 304 stainless near 100 °C |
 * | `thicknessM` | 0.003 | 3 mm base |
 * | `vesselToMediumHWm2K` | 3000 | nucleate boiling on the inner wall at a few K of superheat |
 * | `mediumToFoodHWm2K` | 1500 | food immersed in gently boiling water |
 * | `halfDimensionM` | 0.02 | 4 cm chunks, treated as spheres |
 * | `kWmK` (food) | 0.55 | Choi–Okos for a ~79 % water potato |
 * | `areaM2` (food) | 0.06 | six such chunks, exposed surface summed |
 *
 * ── The 118 °C is calibrated, not predicted ─────────────────────────────────
 *
 * `[MEASURED 2026-08-21]` at these values the solver puts the medium node at
 * **99.88 °C** and the controlling link at the food interior with a 77.3 %
 * share, Bi = 18.2, Q = 374.8 W.
 *
 * The medium landing on the boiling point is a CONSISTENCY CHECK, not a
 * discovery: this network has no phase change in it, so it cannot pin the water
 * at 100 °C on its own. The hob temperature was picked so that it does. Stating
 * that plainly matters — a chain driven at, say, 250 °C solves happily and puts
 * the "boiling water" at 207 °C, a perfectly finite number describing nothing.
 */
const DEFAULT_CHAIN: BoundaryNetworkInput = {
  sourceC: 118,
  sinkC: 20,
  vessel: {
    sourceToVesselHWm2K: 1000,
    areaM2: 0.0314,
    kWmK: 16.2,
    thicknessM: 0.003,
    vesselToMediumHWm2K: 3000,
  },
  food: {
    mediumToFoodHWm2K: 1500,
    geometry: "sphere",
    halfDimensionM: 0.02,
    kWmK: 0.55,
    areaM2: 0.06,
  },
};

// ============================================================================
// Animation constants
// ============================================================================

/**
 * Seconds for one carrier to cross the whole chain.
 *
 * The ONLY free parameter in the motion. Relative speeds between bands come
 * from the solved resistances; this just sets how long the whole traverse
 * takes so it is watchable.
 */
const TRAVERSE_SECONDS = 9;

/** Carriers in flight. Evenly spaced in TIME, which is what makes the injection
 *  rate constant and lets density emerge rather than being authored. */
const CARRIER_COUNT = 34;

/** Device pixel ratio cap — the third ratio costs fill rate and buys nothing
 *  visible, same reasoning as the cooking-method canvas. */
const DPR_CAP = 2;

/** A backgrounded tab hands back a multi-second delta on return. Clamping keeps
 *  the carriers from teleporting across the picture on refocus. */
const MAX_DT_SECONDS = 0.1;

/** Golden-ratio conjugate — spreads the carrier lanes deterministically, with
 *  no `Math.random` and therefore no hydration hazard. */
const PHI_CONJUGATE = 0.618033988749895;

// ============================================================================
// Colour
// ============================================================================

/** Cold → hot ramp, read against a dark surface. */
const HEAT_STOPS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.0, 56, 130, 246],
  [0.3, 129, 140, 248],
  [0.55, 214, 118, 214],
  [0.78, 251, 146, 60],
  [1.0, 253, 224, 71],
];

function heatRgb(t01: number): readonly [number, number, number] {
  const t = Math.min(1, Math.max(0, Number.isFinite(t01) ? t01 : 0));
  for (let i = 1; i < HEAT_STOPS.length; i += 1) {
    const hi = HEAT_STOPS[i];
    const lo = HEAT_STOPS[i - 1];
    if (t <= hi[0]) {
      const span = hi[0] - lo[0];
      const f = span <= 0 ? 0 : (t - lo[0]) / span;
      return [
        Math.round(lo[1] + (hi[1] - lo[1]) * f),
        Math.round(lo[2] + (hi[2] - lo[2]) * f),
        Math.round(lo[3] + (hi[3] - lo[3]) * f),
      ];
    }
  }
  const last = HEAT_STOPS[HEAT_STOPS.length - 1];
  return [last[1], last[2], last[3]];
}

function rgba(c: readonly [number, number, number], alpha: number): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format a scalar, or return null when there is nothing honest to print.
 *
 * Null is the caller's cue to render {@link Refused}. A formatter that returned
 * "0.000" or "NaN" for a missing value would put a number on screen that no
 * engine produced, which is the failure this whole panel is built against.
 */
function num(value: number | null | undefined, digits: number): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude < 1e-3 || magnitude >= 1e6)) {
    return value.toExponential(Math.max(1, digits - 1));
  }
  return value.toFixed(digits);
}

/** A scalar with its unit, or a stated gap. */
function Scalar({
  label,
  value,
  unit,
  reason,
}: {
  label: string;
  value: string | null;
  unit: string;
  reason: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 font-mono text-sm tabular-nums text-white/90">
        {value === null ? <Refused reason={reason} /> : value}
        {value === null ? null : (
          <span className="ml-1 text-[10px] font-normal text-white/40">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Validation — what makes a result drawable
// ============================================================================

/**
 * Return a refusal reason, or null when the result can be drawn.
 *
 * The decoder in `thermoEngine` already refuses a buffer whose layout disagrees
 * with the bundle, but a result that survives decoding can still be undrawable
 * — a node array one short of the links, a non-finite share. Those would paint
 * as a silently truncated picture rather than an error, so they are caught here
 * and shown as a refusal.
 */
function undrawableReason(result: BoundaryNetworkResult): string | null {
  if (result.links.length === 0) return "the solved chain has no links to draw";
  if (result.nodes.length !== result.links.length + 1) {
    return `the chain has ${result.links.length} links but ${result.nodes.length} node temperatures — the two disagree, so no profile can be drawn`;
  }
  for (const link of result.links) {
    if (!Number.isFinite(link.share) || !Number.isFinite(link.resistanceKperW)) {
      return `link "${link.id}" has a non-finite resistance or share`;
    }
    if (link.resistanceKperW <= 0) {
      return `link "${link.id}" has a non-positive resistance, which no band width can represent`;
    }
  }
  for (const node of result.nodes) {
    if (!Number.isFinite(node.celsius)) {
      return `node "${node.id}" has a non-finite temperature`;
    }
  }
  if (!Number.isFinite(result.totalResistanceKperW) || result.totalResistanceKperW <= 0) {
    return "the total series resistance is not a positive finite number";
  }
  return null;
}

// ============================================================================
// The frame
// ============================================================================

/** Everything the draw needs that does not change between frames. */
interface Plan {
  /** Cumulative share boundary, in 0–1, one per node. */
  shareEdges: number[];
  /** Node temperatures, °C — same order as `shareEdges`. */
  nodeC: number[];
  /** 0–1 position of each node temperature on the profile's scale. */
  nodeT01: number[];
  /** Index into `links` of the controlling link. */
  controllingIndex: number;
  /** Cumulative traverse time at each band boundary, seconds. */
  timeEdges: number[];
  tMin: number;
  tMax: number;
}

function buildPlan(result: BoundaryNetworkResult): Plan {
  const { links, nodes } = result;

  const shareEdges: number[] = [0];
  let cumulative = 0;
  for (const link of links) {
    cumulative += link.share;
    shareEdges.push(cumulative);
  }
  // The kernel's shares sum to 1 by construction; normalising by the actual sum
  // rather than trusting it means a rounding residue cannot leave a sliver of
  // unpainted canvas at the right edge that reads as a sixth, nameless link.
  const total = shareEdges[shareEdges.length - 1];
  if (total > 0) {
    for (let i = 0; i < shareEdges.length; i += 1) shareEdges[i] /= total;
  }

  const nodeC = nodes.map((n) => n.celsius);
  let tMin = Number.POSITIVE_INFINITY;
  let tMax = Number.NEGATIVE_INFINITY;
  for (const c of nodeC) {
    if (c < tMin) tMin = c;
    if (c > tMax) tMax = c;
  }
  // Only reachable if a future caller skips `undrawableReason`, which
  // guarantees at least two finite nodes. Keeping the sentinels out of the
  // axis labels is cheaper than an "Infinity °C" tick.
  if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) {
    tMin = 0;
    tMax = 0;
  }
  const span = tMax - tMin;
  // A zero span is a real state, not an error: source and sink at the same
  // temperature means no flow and a flat profile. Pin it to mid-scale rather
  // than dividing by zero and drawing an invisible NaN polyline.
  const nodeT01 = nodeC.map((c) => (span > 0 ? (c - tMin) / span : 0.5));

  let controllingIndex = links.findIndex((l) => l.id === result.controlling.id);
  if (controllingIndex < 0) {
    controllingIndex = 0;
    for (let i = 1; i < links.length; i += 1) {
      if (links[i].resistanceKperW > links[controllingIndex].resistanceKperW) {
        controllingIndex = i;
      }
    }
  }

  // Carrier speed ∝ 1/R. With band width ∝ R, the time to cross band i is
  // (width_i · R_i) / k ∝ R_i², and k is fixed by requiring the whole traverse
  // to take TRAVERSE_SECONDS. Nothing here is tuned per link.
  let weightSum = 0;
  const weights = links.map((l) => {
    const w = l.share * l.resistanceKperW;
    weightSum += w;
    return w;
  });
  const timeEdges: number[] = [0];
  for (let i = 0; i < weights.length; i += 1) {
    const dwell =
      weightSum > 0 && Number.isFinite(weightSum)
        ? (weights[i] / weightSum) * TRAVERSE_SECONDS
        : TRAVERSE_SECONDS / weights.length;
    // A floor keeps a vanishing band from producing an infinite screen speed
    // and a division by zero in the phase lookup.
    timeEdges.push(timeEdges[i] + Math.max(dwell, 1e-4));
  }

  return { shareEdges, nodeC, nodeT01, controllingIndex, timeEdges, tMin, tMax };
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  result: BoundaryNetworkResult,
  plan: Plan,
  phases: number[],
  animated: boolean,
): void {
  const { links } = result;

  ctx.clearRect(0, 0, width, height);
  if (width < 60 || height < 90) return;

  const padL = 12;
  const padR = 12;
  const padT = 8;
  const padB = 4;
  const innerW = width - padL - padR;

  let labelH = 36;
  let connH = 24;
  const bandH = Math.min(80, Math.max(40, (height - padT - padB) * 0.26));
  let profH = height - padT - padB - labelH - connH - bandH;
  if (profH < 76) {
    labelH = 26;
    connH = 14;
    profH = height - padT - padB - labelH - connH - bandH;
  }
  if (profH < 40) return;

  const profTop = padT;
  const profBot = profTop + profH;
  const connTop = profBot;
  const connBot = connTop + connH;
  const bandTop = connBot;
  const bandBot = bandTop + bandH;
  const labelTop = bandBot;

  const slotX = (i: number): number => padL + (innerW * i) / links.length;
  const shareX = (i: number): number => padL + innerW * plan.shareEdges[i];

  // Profile plot area, leaving headroom for the two axis labels.
  const plotTop = profTop + 16;
  const plotBot = profBot - 10;
  const tempY = (t01: number): number => plotBot - t01 * (plotBot - plotTop);

  // ── Profile lane ──────────────────────────────────────────────────────────
  ctx.font = `10px ${MONO}`;
  ctx.textBaseline = "alphabetic";

  // Source and sink reference rules.
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);
  for (const level of [1, 0]) {
    const y = Math.round(tempY(level)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + innerW, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.textAlign = "left";
  ctx.fillText(`${plan.tMax.toFixed(1)} °C`, padL, tempY(1) - 5);
  ctx.fillText(`${plan.tMin.toFixed(1)} °C`, padL, tempY(0) + 12);

  // Vertical slot guides, dropping into the connector.
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  for (let i = 0; i <= links.length; i += 1) {
    const x = Math.round(slotX(i)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, plotTop - 4);
    ctx.lineTo(x, connTop);
    ctx.stroke();
  }

  // The controlling link's slot, called out behind the profile.
  {
    const i = plan.controllingIndex;
    ctx.fillStyle = "rgba(253,224,71,0.06)";
    ctx.fillRect(slotX(i), plotTop - 4, slotX(i + 1) - slotX(i), plotBot - plotTop + 4);
  }

  // The profile itself.
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  for (let i = 0; i < plan.nodeT01.length; i += 1) {
    const x = slotX(i);
    const y = tempY(plan.nodeT01[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // The steepest segment, which is by construction the controlling link.
  {
    const i = plan.controllingIndex;
    ctx.strokeStyle = "rgba(253,224,71,0.95)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(slotX(i), tempY(plan.nodeT01[i]));
    ctx.lineTo(slotX(i + 1), tempY(plan.nodeT01[i + 1]));
    ctx.stroke();

    const midX = (slotX(i) + slotX(i + 1)) / 2;
    const midY = (tempY(plan.nodeT01[i]) + tempY(plan.nodeT01[i + 1])) / 2;
    const drop = `−${links[i].dropK.toFixed(1)} K`;
    ctx.font = `bold 10px ${MONO}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(253,224,71,0.95)";
    ctx.fillText(drop, Math.min(midX + 8, padL + innerW - 52), midY);
  }

  // Node dots, coloured by their own temperature.
  for (let i = 0; i < plan.nodeT01.length; i += 1) {
    const c = heatRgb(plan.nodeT01[i]);
    ctx.beginPath();
    ctx.arc(slotX(i), tempY(plan.nodeT01[i]), 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.95);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.stroke();
  }

  // ── Connector: equal slots above, resistance shares below ─────────────────
  for (let i = 0; i < links.length; i += 1) {
    const controlling = i === plan.controllingIndex;
    const c = heatRgb((plan.nodeT01[i] + plan.nodeT01[i + 1]) / 2);
    const grad = ctx.createLinearGradient(0, connTop, 0, connBot);
    grad.addColorStop(0, rgba(c, controlling ? 0.1 : 0.05));
    grad.addColorStop(1, rgba(c, controlling ? 0.34 : 0.14));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(slotX(i), connTop);
    ctx.lineTo(slotX(i + 1), connTop);
    ctx.lineTo(shareX(i + 1), connBot);
    ctx.lineTo(shareX(i), connBot);
    ctx.closePath();
    ctx.fill();
  }

  // ── Bands ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < links.length; i += 1) {
    const x0 = shareX(i);
    const x1 = shareX(i + 1);
    const w = x1 - x0;
    const controlling = i === plan.controllingIndex;
    const cLeft = heatRgb(plan.nodeT01[i]);
    const cRight = heatRgb(plan.nodeT01[i + 1]);
    const grad = ctx.createLinearGradient(x0, 0, x1 === x0 ? x0 + 1 : x1, 0);
    grad.addColorStop(0, rgba(cLeft, controlling ? 0.42 : 0.24));
    grad.addColorStop(1, rgba(cRight, controlling ? 0.42 : 0.24));
    ctx.fillStyle = grad;
    ctx.fillRect(x0, bandTop, w, bandH);
  }

  // Boundary ticks. Drawn for EVERY boundary, so a band too narrow to fill a
  // pixel is still located — the tick marks where the link is, it does not
  // claim a width the link does not have.
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= links.length; i += 1) {
    const x = Math.round(shareX(i)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, bandTop);
    ctx.lineTo(x, bandBot);
    ctx.stroke();
  }

  // ── Carriers ──────────────────────────────────────────────────────────────
  for (let n = 0; n < phases.length; n += 1) {
    const p = phases[n];
    let band = 0;
    while (band < links.length - 1 && p >= plan.timeEdges[band + 1]) band += 1;
    const dwell = plan.timeEdges[band + 1] - plan.timeEdges[band];
    const frac = dwell > 0 ? Math.min(1, Math.max(0, (p - plan.timeEdges[band]) / dwell)) : 0;
    const x0 = shareX(band);
    const x1 = shareX(band + 1);
    const x = x0 + (x1 - x0) * frac;

    const lane = (n * PHI_CONJUGATE) % 1;
    const y = bandTop + 7 + lane * Math.max(1, bandH - 14);

    const t01 = plan.nodeT01[band] + (plan.nodeT01[band + 1] - plan.nodeT01[band]) * frac;
    const c = heatRgb(t01);

    // Trail length is the screen speed, so a fast band reads as fast even in a
    // still frame — and in the reduced-motion frame, which is a still frame.
    const speed = dwell > 0 ? (x1 - x0) / dwell : 0;
    const trail = Math.min(26, Math.max(1.5, speed * 0.05));
    ctx.strokeStyle = rgba(c, 0.35);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(Math.max(padL, x - trail), y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 2.3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.92);
    ctx.fill();
  }

  // Controlling band outline, drawn last so the carriers do not sit on top of
  // the one mark the picture is about.
  {
    const i = plan.controllingIndex;
    const x0 = shareX(i);
    const w = shareX(i + 1) - x0;
    ctx.strokeStyle = "rgba(253,224,71,0.75)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 + 0.75, bandTop + 0.75, Math.max(1, w - 1.5), bandH - 1.5);

    const pill = `CONTROLS · ${(links[i].share * 100).toFixed(1)} %`;
    ctx.font = `bold 10px ${MONO}`;
    const textW = ctx.measureText(pill).width;
    if (w > textW + 16) {
      const px = x0 + w / 2 - textW / 2 - 6;
      const py = bandTop + 5;
      ctx.fillStyle = "rgba(12,10,4,0.78)";
      ctx.fillRect(px, py, textW + 12, 15);
      ctx.strokeStyle = "rgba(253,224,71,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, textW + 11, 14);
      ctx.fillStyle = "rgba(253,224,71,0.98)";
      ctx.textAlign = "left";
      ctx.fillText(pill, px + 6, py + 11);
    }
  }

  // ── Labels, staggered so a narrow band still gets a name ──────────────────
  ctx.font = `9px ${MONO}`;
  ctx.textAlign = "left";
  const rowY = [labelTop + 12, labelTop + 24];
  const rowCursor = [padL, padL];
  // Per-label budget: the busier row holds ceil(n/2) labels, so that is what a
  // full label has to fit inside. Testing against innerW/2 instead let the last
  // label in a three-label row run into its neighbour — `[MEASURED 2026-08-21]`
  // at a 346 px canvas "…→ medium 4.1%" and "food surface → core 77.3%" met
  // with no gap.
  const labelBudget = innerW / Math.max(1, Math.ceil(links.length / 2));
  for (let i = 0; i < links.length; i += 1) {
    // Stagger, so a narrow band's label does not have to fit inside the band.
    // Every link gets a label on every layout — dropping one because the lane
    // is short would leave a band on screen with no name attached to it.
    const row = i % 2;
    const centre = (shareX(i) + shareX(i + 1)) / 2;
    const pct = `${(links[i].share * 100).toFixed(1)}%`;
    const full = `${links[i].label} ${pct}`;
    const fullW = ctx.measureText(full).width;
    const pctW = ctx.measureText(pct).width;
    const text = fullW + 8 <= labelBudget ? full : pct;
    const textW = text === full ? fullW : pctW;

    let x = centre - textW / 2;
    // Right edge first, then the running cursor — in the other order the edge
    // clamp pulls a label back on top of the one before it, which is exactly
    // the collision the cursor exists to prevent.
    if (x + textW > padL + innerW) x = padL + innerW - textW;
    if (x < rowCursor[row]) x = rowCursor[row];
    rowCursor[row] = x + textW + 8;

    const controlling = i === plan.controllingIndex;
    // Leader line from the band to wherever the label ended up.
    ctx.strokeStyle = controlling ? "rgba(253,224,71,0.45)" : "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centre, bandBot);
    ctx.lineTo(centre, rowY[row] - 8);
    ctx.lineTo(x + textW / 2, rowY[row] - 8);
    ctx.lineTo(x + textW / 2, rowY[row] - 5);
    ctx.stroke();

    ctx.fillStyle = controlling ? "rgba(253,224,71,0.95)" : "rgba(255,255,255,0.5)";
    ctx.fillText(text, x, rowY[row]);
  }

  // Flow direction, stated once.
  ctx.font = `9px ${MONO}`;
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(animated ? "heat flow →" : "heat flow → (motion off)", padL + innerW, profTop + 9);
}

// ============================================================================
// Component
// ============================================================================

export function BoundaryTransferCanvas({
  input,
  className,
}: {
  input?: BoundaryNetworkInput;
  className?: string;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [solver, setSolver] = useState<BoundarySolver | null>(null);
  /** Carrier phases, held across effect re-runs so a resize or a new input does
   *  not visibly reset the animation. */
  const phasesRef = useRef<number[]>(
    Array.from({ length: CARRIER_COUNT }, (_, n) => (n / CARRIER_COUNT) * TRAVERSE_SECONDS),
  );

  const chain = input ?? DEFAULT_CHAIN;
  // A caller passing a fresh object literal every render would otherwise make
  // `result` a new object every render and restart the draw effect each time.
  const chainKey = JSON.stringify(chain);

  useEffect(() => {
    let disposed = false;
    void createBoundarySolver().then((s) => {
      if (!disposed) setSolver(s);
    });
    return () => {
      disposed = true;
    };
  }, []);

  const result = useMemo(
    () => (solver ? solver.solve(chain) : null),
    // `chainKey` stands in for `chain` by value; see above. Depending on the
    // object identity instead would resolve the lint at the cost of the bug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solver, chainKey],
  );

  const undrawable = result ? undrawableReason(result) : null;
  const plan = useMemo(
    () => (result && !undrawable ? buildPlan(result) : null),
    [result, undrawable],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result || !plan) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let animId = 0;
    let cssW = canvas.clientWidth || 640;
    let cssH = canvas.clientHeight || 320;

    const resize = (): void => {
      const dpr = Math.min(
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        DPR_CAP,
      );
      cssW = canvas.clientWidth || 640;
      cssH = canvas.clientHeight || 320;
      const nextW = Math.max(1, Math.round(cssW * dpr));
      const nextH = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      // setTransform, never scale(): scale() multiplies into whatever transform
      // is already on the context, so a second resize would draw at dpr².
      // Re-applied every time because assigning canvas.width resets the context.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const media =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let reduced = media?.matches ?? false;

    const paint = (): void => {
      drawFrame(ctx, cssW, cssH, result, plan, phasesRef.current, !reduced);
    };

    // The correct first frame, drawn NOW rather than on the first rAF. A canvas
    // that waits for rAF is blank on first paint and stays blank anywhere rAF
    // never fires — a hidden tab, a headless pane, reduced motion.
    resize();
    paint();

    const traverse = plan.timeEdges[plan.timeEdges.length - 1] || TRAVERSE_SECONDS;
    let last = typeof performance === "undefined" ? 0 : performance.now();

    const step = (now: number): void => {
      if (disposed) return;
      const dt = Math.min(MAX_DT_SECONDS, Math.max(0, (now - last) / 1000));
      last = now;
      const phases = phasesRef.current;
      for (let n = 0; n < phases.length; n += 1) {
        let p = phases[n] + dt;
        if (p >= traverse) p -= Math.floor(p / traverse) * traverse;
        phases[n] = p;
      }
      // Also re-measure here, not only in the observer.
      //
      // `[MEASURED 2026-08-21]` ResizeObserver notifications are delivered in
      // the "update the rendering" step, so an environment that does not run
      // that step never delivers them — a hidden tab, or the preview pane this
      // was verified in, where a freshly constructed observer did not even fire
      // its initial callback. Without this the backing store keeps the size it
      // had at mount and the picture is stretched across a box it no longer
      // fits: `canvas.width / rect.width` was measured at 4.382 against a
      // device ratio of 2. `resize` only touches the canvas when the numbers
      // actually differ, so the steady-state cost is one `clientWidth` read.
      resize();
      paint();
      animId = requestAnimationFrame(step);
    };

    const start = (): void => {
      if (disposed || animId !== 0) return;
      last = typeof performance === "undefined" ? 0 : performance.now();
      animId = requestAnimationFrame(step);
    };
    const stop = (): void => {
      if (animId !== 0) cancelAnimationFrame(animId);
      animId = 0;
    };

    if (!reduced) start();

    const onMotionChange = (event: MediaQueryListEvent): void => {
      reduced = event.matches;
      if (reduced) {
        stop();
        paint();
      } else {
        start();
      }
    };
    media?.addEventListener("change", onMotionChange);

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (disposed) return;
            resize();
            // Repaint immediately: under reduced motion nothing else will, and
            // a resized canvas holds a cleared backing store until something does.
            paint();
          });
    observer?.observe(canvas);

    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      media?.removeEventListener("change", onMotionChange);
    };
  }, [result, plan]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!solver) {
    return (
      <section className={className}>
        <p className="text-sm text-white/40">Loading the boundary solver…</p>
      </section>
    );
  }

  const engineBadge = (
    <span
      className={
        solver.engine === "wasm"
          ? "rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-200"
          : "rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-200"
      }
      title={
        solver.engine === "wasm"
          ? "Compiled Rust. Pinned against the TypeScript half at 4 ULP by scripts/verify-thermo-wasm-parity.mjs."
          : "public/wasm is not built in this checkout — running the TypeScript half of the same parity contract. Run `bun run build:wasm` for the compiled engine."
      }
    >
      {solver.engine === "wasm" ? "Rust · WASM" : "TypeScript fallback"}
    </span>
  );

  const header = (
    <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
          Medium transfer
        </h2>
        <p className="mt-1 text-xs text-white/45">
          Heat crossing the chain — source, vessel wall, medium, food — with each
          band as wide as its share of the total resistance.
        </p>
      </div>
      {engineBadge}
    </header>
  );

  // ── Refusal ───────────────────────────────────────────────────────────────
  if (!result || undrawable) {
    const reason = !result
      ? "The solver declined this chain: the inputs fall outside the correlations it is valid over, so there is no heat flow to draw."
      : (undrawable ?? "The solved result cannot be drawn.");
    return (
      <section className={className}>
        {header}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-6">
          <p className="text-sm text-white/60">
            Boundary network <Refused reason={reason} />
          </p>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-white/40">{reason}</p>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-white/30">
            No band widths, no profile and no carriers are drawn, because every
            one of them would be a shape with no solved number behind it.
          </p>
        </div>
      </section>
    );
  }

  const totalR = num(result.totalResistanceKperW, 4);
  const ua = num(result.uaWperK, 3);
  const q = num(result.heatFlowW, 1);
  const bi = num(result.foodBiot, 2);
  const controllingPct = (result.controlling.share * 100).toFixed(1);

  const ariaLabel = [
    `Boundary transfer diagram, ${result.links.length} links in series.`,
    `Total resistance ${totalR ?? "unavailable"} kelvin per watt,`,
    `conductance ${ua ?? "unavailable"} watts per kelvin,`,
    `heat flow ${q ?? "unavailable"} watts.`,
    `The controlling link is ${result.controlling.label} at ${controllingPct} percent of the total resistance,`,
    `dropping ${result.controlling.dropK.toFixed(1)} kelvin.`,
    bi === null
      ? "There is no Biot number: this chain has no food link."
      : `Biot number ${bi}.`,
  ].join(" ");

  return (
    <section className={className}>
      {header}

      <div className="rounded-lg border border-white/10 bg-black/30 p-1">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaLabel}
          className="block h-[300px] w-full sm:h-[360px]"
        >
          {ariaLabel}
        </canvas>
      </div>

      {/* The same numbers, as text. --------------------------------------- */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Scalar
          label="Total R"
          value={totalR}
          unit="K·W⁻¹"
          reason="the solved total resistance is not a finite number"
        />
        <Scalar
          label="UA"
          value={ua}
          unit="W·K⁻¹"
          reason="the solved conductance is not a finite number"
        />
        <Scalar
          label="Heat flow"
          value={q}
          unit="W"
          reason="the solved heat flow is not a finite number"
        />
        <Scalar
          label="Biot"
          value={bi}
          unit=""
          reason="this chain has no food link, so there is no internal-to-external resistance ratio to form"
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-white/50">
        <span className="font-semibold text-amber-200">
          {result.controlling.label}
        </span>{" "}
        controls, at {controllingPct} % of the total resistance and a{" "}
        {result.controlling.dropK.toFixed(1)} K drop. Everything else in the
        chain is arithmetic on the remainder.
      </p>

      <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-white/45">
        <p>
          <span className="text-white/70">How to read it.</span> The profile on
          top is plotted on equal steps per link, so the steep segment is the big
          resistance. The bands below are plotted on share of ΣR, so the wide
          band is the same link. The connector between them is that change of
          axis, and it is the only reason the two lanes are not the same width.
        </p>
        <p>
          Carriers move at a speed proportional to each link&apos;s conductance,
          1/R, taken straight from the solved resistances — only the {TRAVERSE_SECONDS}
          -second total traverse is a design choice. They are injected at a
          constant rate, because a steady chain passes the same flux through
          every plane, so the crowd in front of the slow band is an output of
          the solve rather than an effect.
        </p>
        <p className="text-white/35">
          The default chain is arrangement-typical for a simmering pot, not a
          measurement of one. Its hob temperature was chosen so the solved medium
          node lands on water&apos;s boiling point — a consistency check on the
          inputs, not a prediction, since this network carries no phase change.{" "}
          <CitationChip
            work="Incropera & DeWitt"
            locator="Fundamentals of Heat and Mass Transfer — series resistance network, Ch. 3"
          />
        </p>
      </div>

      {/* Full numeric alternative for anyone who cannot see the canvas. ---- */}
      <div className="sr-only">
        <h3>Boundary transfer, full numbers</h3>
        <p>
          Engine actually running: {solver.engine === "wasm" ? "compiled Rust WebAssembly" : "TypeScript fallback"}.
        </p>
        <table>
          <caption>Links in series, source end first</caption>
          <thead>
            <tr>
              <th scope="col">Link</th>
              <th scope="col">Resistance, K·W⁻¹</th>
              <th scope="col">Share of total</th>
              <th scope="col">Temperature drop, K</th>
              <th scope="col">Coefficient, W·m⁻²·K⁻¹</th>
            </tr>
          </thead>
          <tbody>
            {result.links.map((link) => (
              <tr key={link.id}>
                <th scope="row">
                  {link.label}
                  {link.id === result.controlling.id ? " (controlling)" : ""}
                </th>
                <td>{num(link.resistanceKperW, 5) ?? "not a finite number"}</td>
                <td>{(link.share * 100).toFixed(2)} %</td>
                <td>{num(link.dropK, 2) ?? "not a finite number"}</td>
                <td>
                  {link.hWm2K === null
                    ? "none — a pure conduction link"
                    : (num(link.hWm2K, 1) ?? "not a finite number")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <caption>Node temperatures down the chain</caption>
          <thead>
            <tr>
              <th scope="col">Node</th>
              <th scope="col">Temperature, °C</th>
            </tr>
          </thead>
          <tbody>
            {result.nodes.map((node, i) => (
              <tr key={`${node.id}-${i}`}>
                <th scope="row">{node.id}</th>
                <td>{num(node.celsius, 2) ?? "not a finite number"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
