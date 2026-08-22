"use client";

import { useEffect, useState, type JSX } from "react";
import {
  createThermoScalars,
  type ScalarReading,
  type ThermoScalars,
} from "@/lib/wasm/thermoEngine";
import { CitationChip, Refused } from "./CitationChip";

/**
 * Latent heat, computed through whichever engine is actually present.
 *
 * ## The two things this panel is careful about
 *
 * 1. It states which ENGINE ran. `public/wasm` is gitignored, so a checkout
 *    that has not run `bun run build:wasm` silently takes the TypeScript path.
 *    A panel that claimed WASM regardless would be describing a build step the
 *    reader may never have performed.
 *
 * 2. It renders REFUSALS as refusals. The Fleagle & Andreas fit is valid over
 *    0–100 °C; outside it the engine returns NaN and this renders an em dash
 *    with the reason on hover. Extrapolating the line instead would produce
 *    numbers around 2.5 MJ·kg⁻¹ that look completely reasonable and are
 *    meaningless — which is exactly why the refusal is enforced in the Rust,
 *    asserted in the parity script, and surfaced here rather than trusted.
 *
 * @file src/components/lab/LatentHeatPanel.tsx
 */

/** Probe temperatures. −5 and 105 are OUTSIDE the fit, deliberately: the panel
 *  demonstrates its own refusal behaviour rather than only asserting it. */
const PROBE_C = [-5, 0, 20, 50, 80, 100, 105] as const;

/**
 * Representative compositions for the fusion column.
 *
 * Water mass fractions only, and labelled as class-typical rather than
 * measured — these are illustrative of the calculation, not sourced records.
 * The sourced compositions live on the ingredient corpus and carry an FDC id;
 * borrowing this table's numbers for a specific ingredient would be exactly the
 * provenance downgrade the corpus's `basis` field exists to prevent.
 */
const FOODS: ReadonlyArray<{ name: string; water: number }> = [
  { name: "Lean beef", water: 0.74 },
  { name: "Potato", water: 0.79 },
  { name: "Spinach", water: 0.91 },
  { name: "Bread dough", water: 0.44 },
];

function Value({
  reading,
  format,
}: {
  reading: ScalarReading<number>;
  format: (v: number) => string;
}): JSX.Element {
  return reading.available ? (
    <span className="font-mono tabular-nums text-white/90">
      {format(reading.value)}
    </span>
  ) : (
    <Refused reason={reading.reason} />
  );
}

const mj = (v: number): string => (v / 1e6).toFixed(4);

export function LatentHeatPanel({
  className,
}: {
  className?: string;
}): JSX.Element {
  const [scalars, setScalars] = useState<ThermoScalars | null>(null);

  useEffect(() => {
    let disposed = false;
    // See BoundaryTransferCanvas: two-argument `then` keeps this off the
    // floating-promise path without reaching for the `void` operator.
    createThermoScalars().then(
      (s) => {
        if (!disposed) setScalars(s);
      },
      () => {
        if (!disposed) setScalars(null);
      },
    );
    return (): void => {
      disposed = true;
    };
  }, []);

  if (!scalars) {
    return (
      <section className={className}>
        <p className="text-sm text-white/40">Loading the physics engine…</p>
      </section>
    );
  }

  const fusionWater = scalars.waterFusionJKg();

  return (
    <section className={className}>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
            Latent heat
          </h2>
          <p className="mt-1 text-xs text-white/45">
            The energy a phase change costs, which never shows up as a
            temperature rise.
          </p>
        </div>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
            scalars.engine === "wasm"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-amber-400/30 bg-amber-400/10 text-amber-200"
          }`}
          title={
            scalars.engine === "wasm"
              ? "Compiled Rust, verified against the golden vectors at ≤8 ULP."
              : "public/wasm is not built in this checkout — running the TypeScript half of the same parity contract. Run `bun run build:wasm` for the compiled engine."
          }
        >
          {scalars.engine === "wasm" ? "Rust · WASM" : "TypeScript fallback"}
        </span>
      </header>

      {/* Vaporisation ---------------------------------------------------- */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <caption className="mb-2 text-left text-xs text-white/45">
            Vaporisation of water, MJ·kg⁻¹.{" "}
            <CitationChip
              work="Fleagle & Andreas"
              locator="Atmospheric Dynamics — linear fit, 0–100 °C"
            />
          </caption>
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th scope="col" className="py-2 pr-4 font-medium">
                Temperature
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                h_fg (MJ·kg⁻¹)
              </th>
              <th scope="col" className="py-2 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {PROBE_C.map((c) => {
              const reading = scalars.latentHeatVaporisation(c);
              return (
                <tr key={c} className="border-b border-white/5">
                  <td className="py-2 pr-4 font-mono tabular-nums text-white/70">
                    {c} °C
                  </td>
                  <td className="py-2 pr-4">
                    <Value reading={reading} format={mj} />
                  </td>
                  <td className="py-2 text-xs text-white/35">
                    {reading.available ? "within the fit" : "outside the fit"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fusion ---------------------------------------------------------- */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <caption className="mb-2 text-left text-xs text-white/45">
            Freezing load, MJ·kg⁻¹ of food.{" "}
            <CitationChip
              work="ASHRAE"
              locator="1998 Refrigeration Handbook Ch. 8 — 143.4 Btu/lb"
            />
          </caption>
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th scope="col" className="py-2 pr-4 font-medium">
                Food
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Water fraction
              </th>
              <th scope="col" className="py-2 font-medium">
                Fusion (MJ·kg⁻¹)
              </th>
            </tr>
          </thead>
          <tbody>
            {FOODS.map((f) => (
              <tr key={f.name} className="border-b border-white/5">
                <td className="py-2 pr-4 text-white/70">{f.name}</td>
                <td className="py-2 pr-4 font-mono tabular-nums text-white/50">
                  {f.water.toFixed(2)}
                </td>
                <td className="py-2">
                  <Value
                    reading={scalars.foodFusionEnthalpy(f.water)}
                    format={mj}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-white/50">
        <p>
          <span className="font-semibold text-white/70">
            Pure water fuses at {(fusionWater / 1e3).toFixed(1)} kJ·kg⁻¹
          </span>{" "}
          — but a food never does. The engine discounts bound water, which stays
          liquid at freezer temperatures; treating all of a food&apos;s water as
          freezable overstates the load by about 25 %.
        </p>
        <p className="text-white/35">
          Water fractions above are class-typical illustrations, not sourced
          records. Measured compositions carry an FDC id and a retrieval date on
          the ingredient corpus.
        </p>
      </div>
    </section>
  );
}
