/**
 * Display formatting for the Baking Lab. Rounding happens HERE and nowhere
 * upstream: the engine keeps exact doubles, so a rounded figure on screen can
 * never feed back into a calculation.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/_lab/format.ts
 */
import { cToF } from "@/lib/cooking/thermo";

export type TempUnit = "C" | "F";

export function fmtTemp(celsius: number | null, unit: TempUnit, digits = 0): string {
  if (celsius === null) return "—";
  const value = unit === "C" ? celsius : cToF(celsius);
  return `${value.toFixed(digits)} °${unit}`;
}

/** A temperature DIFFERENCE: °F differences are 9/5 of °C differences, with no offset. */
export function fmtTempDelta(deltaC: number, unit: TempUnit): string {
  const value = unit === "C" ? deltaC : (deltaC * 9) / 5;
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(0)} °${unit}`;
}

export function fmtNum(value: number | null, digits = 1, suffix = ""): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}${suffix}`;
}

export function fmtGrams(grams: number): string {
  return grams >= 100 ? `${grams.toFixed(0)} g` : `${grams.toFixed(1)} g`;
}

export function fmtSigned(value: number | null, digits = 1, suffix = ""): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}${suffix}`;
}

export function fmtMinutes(minutes: number | null): string {
  return minutes === null ? "—" : `${minutes.toFixed(1)} min`;
}

/** Browning extent 0–1 → an approximate crust colour (display only). */
export function crustColor(extent: number): string {
  const stops: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
    [0, [238, 222, 190]],
    [0.35, [214, 168, 96]],
    [0.65, [160, 94, 42]],
    [0.9, [92, 50, 26]],
    [1, [48, 28, 18]],
  ];
  const x = Math.min(Math.max(extent, 0), 1);
  for (let i = 1; i < stops.length; i += 1) {
    const [x1, c1] = stops[i] ?? [1, [0, 0, 0]];
    const [x0, c0] = stops[i - 1] ?? [0, [0, 0, 0]];
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0);
      const mix = (k: 0 | 1 | 2): number => Math.round(c0[k] + t * (c1[k] - c0[k]));
      return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
    }
  }
  return "rgb(48, 28, 18)";
}

/**
 * Temperature → a cool-to-hot colour for crumb layers (display only). The hue
 * runs blue → violet → red → amber, going AROUND the wheel the long way so it
 * never passes through green: a jet-style ramp painted a half-baked loaf green.
 */
export function heatColor(celsius: number, ovenC: number): string {
  const t = Math.min(Math.max((celsius - 20) / Math.max(ovenC - 20, 1), 0), 1);
  const hue = (220 + 170 * t) % 360;
  return `hsl(${hue.toFixed(0)}, 68%, ${(44 + 12 * t).toFixed(0)}%)`;
}
