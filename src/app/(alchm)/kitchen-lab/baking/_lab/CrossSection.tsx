"use client";

import type { ProductGeometry } from "@/lib/baking/formulaTypes";
import { browningExtent } from "@/lib/baking/sim/browning";
import type { SimFrame } from "@/lib/baking/sim/simTypes";
import { crustColor, heatColor } from "./format";
import type { JSX } from "react";

const W = 280;
const H = 220;

/** Band boundaries (0–1) from the normalised node centres: halfway between neighbours. */
function bounds(centres: readonly number[]): number[] {
  const out = [0];
  for (let i = 0; i + 1 < centres.length; i += 1) out.push(((centres[i] ?? 0) + (centres[i + 1] ?? 1)) / 2);
  out.push(1);
  return out;
}

function CellPattern(): JSX.Element {
  return (
    <defs>
      <pattern id="bl-cells" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3.5" r="1.9" fill="rgba(0,0,0,0.55)" />
      </pattern>
    </defs>
  );
}

function SlabSection({ frame, ovenC, plate }: { frame: SimFrame; ovenC: number; plate: boolean }): JSX.Element {
  const baseH = 46;
  const height = Math.min(baseH * frame.volumeRatio, H - 40);
  const bottom = H - 24;
  const edges = bounds(frame.profile.position);
  const crust = Math.max(Math.min((frame.crustMm / 10) * baseH, height / 2), 0);
  return (
    <g>
      {frame.profile.tempC.map((t, i) => {
        const y0 = bottom - (edges[i + 1] ?? 1) * height;
        const y1 = bottom - (edges[i] ?? 0) * height;
        const porosity = frame.profile.porosity[i] ?? 0;
        return (
          <g key={i}>
            <rect x={30} y={y0} width={W - 60} height={y1 - y0 + 0.5} fill={heatColor(t, ovenC)} />
            <rect x={30} y={y0} width={W - 60} height={y1 - y0 + 0.5} fill="url(#bl-cells)" opacity={Math.min(porosity, 0.9)} />
          </g>
        );
      })}
      <rect x={30} y={bottom - height} width={W - 60} height={crust} fill={crustColor(browningExtent(frame.browningDose))} />
      {plate ? <rect x={22} y={bottom} width={W - 44} height={5} fill="rgba(200,200,210,0.7)" /> : null}
    </g>
  );
}

function RoundSection({ frame, ovenC, exponent }: { frame: SimFrame; ovenC: number; exponent: 1 | 2 }): JSX.Element {
  const r = 62 * Math.pow(frame.volumeRatio, 1 / (exponent + 1));
  const cx = W / 2;
  const cy = H / 2;
  const edges = bounds(frame.profile.position);
  const crustWidth = Math.max(Math.min((frame.crustMm / 75) * 62, r / 2), 0.5);
  const rings = frame.profile.tempC.map((t, i) => ({ i, t, outer: (edges[i + 1] ?? 1) * r, porosity: frame.profile.porosity[i] ?? 0 })).reverse();
  return (
    <g>
      {rings.map((ring) => (
        <g key={ring.i}>
          <circle cx={cx} cy={cy} r={ring.outer} fill={heatColor(ring.t, ovenC)} />
          <circle cx={cx} cy={cy} r={ring.outer} fill="url(#bl-cells)" opacity={Math.min(ring.porosity, 0.9) * 0.6} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r - crustWidth / 2} fill="none" stroke={crustColor(browningExtent(frame.browningDose))} strokeWidth={crustWidth} />
    </g>
  );
}

/**
 * A cross-section at the scrubbed instant: layer temperatures (cool blue →
 * hot), gas cells by each layer's porosity, the rise, and the crust coloured
 * by its browning extent. A rendering of the simulator's own profile — the
 * colours are a display mapping, the geometry and porosity are the model's.
 */
export function CrossSection({ frame, geometry, ovenC, plate }: { frame: SimFrame; geometry: ProductGeometry; ovenC: number; plate: boolean }): JSX.Element {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px]" role="img" aria-label={`Cross-section at ${frame.tMin.toFixed(1)} minutes: core ${frame.coreC.toFixed(0)} °C, rise ${((frame.volumeRatio - 1) * 100).toFixed(0)} %`}>
      <CellPattern />
      {geometry.shape === "slab" ? (
        <SlabSection frame={frame} ovenC={ovenC} plate={plate} />
      ) : (
        <RoundSection frame={frame} ovenC={ovenC} exponent={geometry.shape === "cylinder" ? 1 : 2} />
      )}
    </svg>
  );
}
