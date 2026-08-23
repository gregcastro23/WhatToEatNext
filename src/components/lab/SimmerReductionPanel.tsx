"use client";

/**
 * Simmer Reduction Panel — Closed-Form Solver Matrix & Live Collaborative Sync
 *
 * Provides:
 *  1. Actionable cooking times and volume reduction estimates (Cups/Quarts and Litres)
 *  2. Practical culinary lid seal impact (open glaze vs tight moisture lock)
 *  3. Interactive Live SpacetimeDB Collaborative Sync companion
 *
 * @file src/components/lab/SimmerReductionPanel.tsx
 */

import { useEffect, useMemo, useState, type JSX } from "react";
import { VAPOUR_ESCAPE_FRACTION, type LidSeal } from "@/data/cooking/vessels";
import {
  createThermoScalars,
  type ThermoScalars,
} from "@/lib/wasm/thermoEngine";
import { CitationChip, Refused } from "./CitationChip";
import { LivePotSyncPanel } from "./LivePotSyncPanel";
import { TemperatureUnitToggle } from "./TemperatureUnitToggle";

/** The four seal states with plain-English culinary explanations */
const SEALS: ReadonlyArray<[LidSeal, string, string]> = [
  ["none", "No lid", "Fast reduction for pan glazes & demi-glace (100% steam loss)"],
  ["cracked", "Ajar / Vented", "Controlled thickening without boil-over risk (55% steam loss)"],
  ["loose", "Lid resting on", "Standard braising & stewing, gentle simmer (25% steam loss)"],
  ["tight", "Heavy, tight lid", "Dutch oven moisture lock, 12× slower reduction (8% steam loss)"],
];

/** Reduction milestones a cook actually names. */
const TARGETS: ReadonlyArray<[number, string, string]> = [
  [0.25, "by a quarter (25%)", "Light reduction for soups / rich broths"],
  [0.5, "by half (50%)", "Classic Demi-Glace / Velvety Sauce"],
  [0.75, "to a demi (75%)", "Glacé / Spoon-coating glaze syrup"],
];

const VOLUMES = [
  { l: 0.5, label: "0.5 L (~2.1 cups)" },
  { l: 1, label: "1.0 L (~1.05 qt / 4.2 cups)" },
  { l: 2, label: "2.0 L (~2.1 qt)" },
  { l: 3, label: "3.0 L (~3.2 qt)" },
] as const;

const POWERS = [
  { w: 500, label: "500 W (Gentle Simmer)" },
  { w: 800, label: "800 W (Active Simmer)" },
  { w: 1200, label: "1200 W (Rolling Boil)" },
  { w: 2000, label: "2000 W (High Flame)" },
] as const;

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
  className = "",
}: {
  className?: string;
}): JSX.Element {
  const [viewMode, setViewMode] = useState<"live_pot" | "matrix">("live_pot");
  const [scalars, setScalars] = useState<ThermoScalars | null>(null);
  const [volumeL, setVolumeL] = useState<number>(1);
  const [powerW, setPowerW] = useState<number>(1200);

  useEffect(() => {
    let disposed = false;
    createThermoScalars().then(
      (s): void => {
        if (!disposed) setScalars(s);
      },
      (): void => {
        if (!disposed) setScalars(null);
      },
    );
    return (): void => {
      disposed = true;
    };
  }, []);

  const hfg = useMemo(
    (): ReturnType<ThermoScalars["saturatedWaterHfgJkg"]> | null =>
      scalars ? scalars.saturatedWaterHfgJkg(BOILING_C) : null,
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

  const engineLabel = scalars?.engine === "wasm" ? "RUST · WASM" : "TYPESCRIPT FALLBACK";

  return (
    <section className={`space-y-6 ${className}`}>
      {/* ── View Mode Switcher Header ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold tracking-wide text-white">
              Simmer Reduction &amp; Sauce Glaze Calculator
            </h3>
            {scalars ? (
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                  scalars.engine === "wasm"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {engineLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-white/60">
            How long a boiling sauce takes to reduce, and what happens to flavor and salt concentration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TemperatureUnitToggle size="sm" />
          <div className="inline-flex rounded-lg border border-white/15 bg-white/5 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("live_pot")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                viewMode === "live_pot"
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🥘 Live Pot Sync (SpacetimeDB)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                viewMode === "matrix"
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              📊 Reduction Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Pot Interactive View ──────────────────────────────────── */}
      {viewMode === "live_pot" ? (
        <LivePotSyncPanel />
      ) : null}

      {/* ── Static Reduction Matrix View ───────────────────────────────── */}
      {viewMode === "matrix" ? (
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap gap-6">
            <label className="text-xs font-medium uppercase tracking-wider text-white/60">
              Starting liquid volume
              <select
                value={volumeL}
                onChange={(e) => setVolumeL(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 outline-none"
              >
                {VOLUMES.map((v) => (
                  <option key={v.l} value={v.l} className="bg-neutral-900 text-white">
                    {v.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-wider text-white/60">
              Burner heat level
              <select
                value={powerW}
                onChange={(e) => setPowerW(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 outline-none"
              >
                {POWERS.map((p) => (
                  <option key={p.w} value={p.w} className="bg-neutral-900 text-white">
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!hfg?.available ? (
            <Refused reason={hfg?.reason ?? "latent heat unavailable"} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/15 text-left">
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                      Lid Seal &amp; Culinary Technique
                    </th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                      Steam Loss
                    </th>
                    {TARGETS.map(([pct, label]) => (
                      <th
                        key={pct}
                        className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-amber-300"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SEALS.map(([seal, sealLabel, sealDesc], row) => (
                    <tr key={seal} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-white/90 block">{sealLabel}</span>
                        <span className="text-[11px] text-white/50">{sealDesc}</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-sm text-white/60">
                        {(VAPOUR_ESCAPE_FRACTION[seal] * 100).toFixed(0)}%
                      </td>
                      {TARGETS.map(([target], col) => {
                        const cell = grid?.[row]?.[col];
                        return (
                          <td
                            key={target}
                            className="py-3 pr-4 font-mono text-sm font-semibold text-white/90"
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

          <div className="mt-6 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
            <p>
              <strong className="text-amber-300">Salt &amp; Flavor Takeaway:</strong>{" "}
              Concentration follows the inverse of liquid remaining: reducing a sauce by 50% exactly doubles
              all non-volatile solutes (salt, savory glutamates, gelatin). Season lightly at the start, as
              the final glaze will taste significantly saltier.
            </p>
            <p>
              <strong className="text-white/80">Power-Limited Saturation:</strong> Loss rate follows{" "}
              <span className="font-mono text-amber-200">P / h_fg</span> at the boiling point and is independent
              of pan diameter.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <CitationChip work="Incropera & DeWitt" locator="Table A.6 — Saturation latent heat (2,257 kJ/kg)" />
            <CitationChip work="vessels.ts" locator="VAPOUR_ESCAPE_FRACTION — Graded seal states" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
