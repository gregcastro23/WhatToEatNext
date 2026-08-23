"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { VAPOUR_ESCAPE_FRACTION, type LidSeal } from "@/data/cooking/vessels";
import {
  createThermoScalars,
  type ThermoScalars,
} from "@/lib/wasm/thermoEngine";
import { CitationChip, Refused } from "./CitationChip";

/**
 * Simmer reduction — how long a sauce takes to come down, and what that does
 * to its salt.
 *
 * ## What this panel is careful about
 *
 * 1. **The lid is a graded state, not a multiplier.** `VAPOUR_ESCAPE_FRACTION`
 *    in src/data/cooking/vessels.ts carries four seal states with an explicit
 *    caveat that they are an ORDERING rather than fitted coefficients. This
 *    panel shows all four side by side precisely so a reader sees the spread —
 *    a tight lid takes over twelve times as long as no lid — instead of one
 *    number that hides it.
 *
 * 2. **The latent heat is the SATURATION value, not the fit.** A boiling pot is
 *    at saturation, so `saturatedWaterHfgJkg` (Incropera Table A.6) is the
 *    right source; `latentHeatVaporisation` is the Fleagle & Andreas fit for
 *    sub-boiling evaporation and sits 0.6848 % above it. Both are correct, for
 *    different questions. Getting this wrong is a 0.68 % error in every time
 *    below, and it is how the parity verifier caught the same slip in
 *    `scripts/verify-thermo-wasm-parity.mjs`.
 *
 * 3. **It states which engine ran**, like every other panel here.
 *
 * ⚠️ POWER-LIMITED REGIME ONLY. Every number here assumes the pot is boiling,
 * where loss is `P / h_fg` and has no area term. It is NOT sub-boiling
 * evaporation, where the rate follows the liquid surface — and a bowl's surface
 * shrinks as it empties, which is why a wok's reduction slows as it goes. That
 * case has no closed form and is not what this panel answers.
 *
 * @file src/components/lab/SimmerReductionPanel.tsx
 */

/** The four seal states, in the order a cook would think of them. */
const SEALS: ReadonlyArray<[LidSeal, string]> = [
  ["none", "No lid"],
  ["cracked", "Ajar / vented"],
  ["loose", "Lid resting on"],
  ["tight", "Heavy, well-seated"],
];

/** Reduction milestones a cook actually names. */
const TARGETS: ReadonlyArray<[number, string]> = [
  [0.25, "by a quarter"],
  [0.5, "by half"],
  [0.75, "to a demi"],
];

const VOLUMES_L = [0.5, 1, 2, 3] as const;
const POWERS_W = [500, 800, 1200, 2000] as const;

/** Boiling point at one atmosphere; the panel's whole premise is a boiling pot. */
const BOILING_C = 100;

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "—";
  const minutes = seconds / 60;
  if (minutes < 90) return `${minutes.toFixed(0)} min`;
  const hours = minutes / 60;
  return `${hours.toFixed(1)} h`;
}

export function SimmerReductionPanel({
  className,
}: {
  className?: string;
}): JSX.Element {
  const [scalars, setScalars] = useState<ThermoScalars | null>(null);
  const [volumeL, setVolumeL] = useState<number>(1);
  const [powerW, setPowerW] = useState<number>(1200);

  useEffect(() => {
    let disposed = false;
    // Two-argument `then`: off the floating-promise path without `void`.
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

  const hfg = useMemo(
    () => (scalars ? scalars.saturatedWaterHfgJkg(BOILING_C) : null),
    [scalars],
  );

  /** times[seal][target] — every cell solved, refusals included. */
  const grid = useMemo(() => {
    if (!scalars || !hfg?.available) return null;
    return SEALS.map(([seal]) =>
      TARGETS.map(([target]) =>
        scalars.reductionTimeSeconds({
          initialVolumeL: volumeL,
          powerIntoContentsW: powerW,
          latentHeatJkg: hfg.value,
          escapeFraction: VAPOUR_ESCAPE_FRACTION[seal],
          liquidC: BOILING_C,
          targetFraction: target,
        }),
      ),
    );
  }, [scalars, hfg, volumeL, powerW]);

  if (!scalars) {
    return (
      <section className={className}>
        <p className="text-sm text-white/40">Loading the reduction engine…</p>
      </section>
    );
  }

  const engineLabel = scalars.engine === "wasm" ? "RUST · WASM" : "TYPESCRIPT FALLBACK";

  return (
    <section className={className}>
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Simmer reduction
          </h3>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
              scalars.engine === "wasm"
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {engineLabel}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-white/50">
          How long a boiling pot takes to come down, and what that concentrates.
          Every joule arriving goes into phase change, so the rate is{" "}
          <span className="font-mono text-white/70">P / h_fg</span> and does not
          depend on the pot&rsquo;s width.
        </p>
        <p className="sr-only">Engine actually running: {engineLabel}.</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-6">
        <label className="text-xs uppercase tracking-wider text-white/40">
          Starting volume
          <select
            value={volumeL}
            onChange={(e) => setVolumeL(Number(e.target.value))}
            className="ml-2 rounded bg-white/5 px-2 py-1 font-mono text-sm text-white/90"
          >
            {VOLUMES_L.map((v) => (
              <option key={v} value={v}>
                {v} L
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-wider text-white/40">
          Power into contents
          <select
            value={powerW}
            onChange={(e) => setPowerW(Number(e.target.value))}
            className="ml-2 rounded bg-white/5 px-2 py-1 font-mono text-sm text-white/90"
          >
            {POWERS_W.map((w) => (
              <option key={w} value={w}>
                {w} W
              </option>
            ))}
          </select>
        </label>
      </div>

      {!hfg?.available ? (
        <Refused reason={hfg?.reason ?? "latent heat unavailable"} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Lid state
                </th>
                <th className="py-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Escapes
                </th>
                {TARGETS.map(([, label]) => (
                  <th
                    key={label}
                    className="py-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-white/40"
                  >
                    Reduce {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEALS.map(([seal, sealLabel], row) => (
                <tr key={seal} className="border-b border-white/[0.06]">
                  <td className="py-2 pr-4 text-white/80">{sealLabel}</td>
                  <td className="py-2 pr-4 font-mono tabular-nums text-white/50">
                    {(VAPOUR_ESCAPE_FRACTION[seal] * 100).toFixed(0)} %
                  </td>
                  {TARGETS.map(([target], col) => {
                    const cell = grid?.[row]?.[col];
                    return (
                      <td
                        key={target}
                        className="py-2 pr-4 font-mono tabular-nums text-white/90"
                      >
                        {cell?.available ? (
                          formatDuration(cell.value)
                        ) : (
                          <Refused reason={cell?.reason ?? "refused"} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 space-y-2 text-xs text-white/40">
        <p>
          Concentration follows the inverse of what remains: reduce by half and
          every non-volatile solute doubles. Salt, gelatin and glutamates track
          it. Aromatics do not — they leave with the steam, which is why a
          hard-reduced sauce tastes saltier but not more of what it smelled like.
        </p>
        <p>
          ⚠️ Boiling only. Below the boil, loss follows the liquid SURFACE, and a
          bowl&rsquo;s surface shrinks as it empties — a wok&rsquo;s reduction
          slows as it goes. That case has no closed form and is not answered
          here.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {/* Saturation h_fg, NOT the Fleagle & Andreas fit — see the header. */}
        <CitationChip work="Incropera & DeWitt" locator="Table A.6 — h_fg, saturated water" />
        <CitationChip work="vessels.ts" locator="VAPOUR_ESCAPE_FRACTION — graded seal states" />
      </div>
    </section>
  );
}
