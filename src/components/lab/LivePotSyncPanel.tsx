"use client";

/**
 * LivePotSyncPanel — Collaborative Kitchen Simmer Reduction & Line Cook Sync
 *
 * Designed with the accessibility-first principle:
 *  - Primary volume in familiar US cooking units (Quarts / Cups) with Metric secondary
 *  - Real-time concentration milestones (Demi-Glace, Glacé) and salt intensification
 *  - Live 60 FPS RAF progress interpolation synchronized across devices via SpacetimeDB
 *  - Clear target reduction alarm
 *
 * @file src/components/lab/LivePotSyncPanel.tsx
 */

import { useState, type JSX } from "react";
import {
  formatCookingVolume,
  formatSoluteConcentration,
} from "@/lib/cooking/temperatureUnits";
import {
  useLivePotSimulation,
} from "@/lib/spacetime/hooks/useLivePotSimulation";

const POWER_PRESETS = [
  { label: "Low Simmer (500 W)", watts: 500 },
  { label: "Gentle Boil (800 W)", watts: 800 },
  { label: "Rolling Boil (1200 W)", watts: 1200 },
  { label: "High Flame (2000 W)", watts: 2000 },
];

const LID_SEALS = [
  { id: 0, label: "No Lid", desc: "Open pan sauce / fast reduction (100% steam loss)" },
  { id: 1, label: "Ajar / Vented", desc: "Controlled thickening without boil-over (55% loss)" },
  { id: 2, label: "Resting Lid", desc: "Standard stewing / braising (25% loss)" },
  { id: 3, label: "Tight Lid", desc: "Dutch oven moisture lock (8% loss, 12× slower)" },
];

const TARGET_PRESETS = [
  { pct: 0.25, label: "Reduce by 25%", desc: "Thicker soup / broth" },
  { pct: 0.50, label: "Reduce by 50%", desc: "Classic Demi-Glace / Rich Sauce" },
  { pct: 0.75, label: "Reduce by 75%", desc: "Heavy Glacé / Coating syrup" },
];

export function LivePotSyncPanel({
  className = "",
  initialSessionId = "kitchen-station-1",
}: {
  className?: string;
  initialSessionId?: string;
}): JSX.Element {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [copied, setCopied] = useState(false);

  const {
    status,
    pot,
    interpolatedVolL,
    interpolatedConcentration,
    percentReduced,
    estimatedMinutesRemaining,
    setControls,
    resetPot,
    createPot,
  } = useLivePotSimulation(sessionId);

  const currentVolume = formatCookingVolume(interpolatedVolL);
  const initialVolume = formatCookingVolume(pot.initialVolL);
  const concentration = formatSoluteConcentration(interpolatedConcentration);

  const handleCopyLink = (): void => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?potSession=${encodeURIComponent(
      sessionId
    )}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2500);
      })
      .catch(() => {});
  };

  const handleResetPot = (): void => {
    resetPot().catch(() => {});
  };

  const handleSetControls = (watts: number, seal: number): void => {
    setControls(watts, seal).catch(() => {});
  };

  const handleSetTarget = (pct: number): void => {
    createPot({
      vesselName: pot.vesselName,
      initialVolL: pot.initialVolL,
      burnerPowerW: pot.burnerPowerW,
      lidSeal: pot.lidSeal,
      targetReductionPct: pct,
    }).catch(() => {});
  };

  return (
    <section className={`rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6 ${className}`}>
      {/* ── Header & Collaborative Session Bar ────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-semibold tracking-wide text-white">
              Collaborative Pot Sync
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${
                status === "live_connected"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : status === "connecting"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
            >
              {status === "live_connected"
                ? "🟢 SpacetimeDB Live (Push Sync)"
                : status === "connecting"
                ? "🟡 Connecting…"
                : "⚡ Optimistic Local Engine"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Real-time pot simmer reduction synchronization across chef stove controls and line cook prep monitors.
          </p>
        </div>

        {/* Session ID & Share */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/80">
            <label htmlFor="pot-session-input" className="text-white/40 uppercase tracking-wider text-[10px]">
              Session:
            </label>
            <input
              id="pot-session-input"
              type="text"
              value={sessionId}
              onChange={(e): void => { setSessionId(e.target.value); }}
              className="bg-transparent font-mono text-xs text-amber-300 outline-none w-28"
              placeholder="session-name"
            />
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
          >
            {copied ? "✓ Copied!" : "🔗 Share Link"}
          </button>
        </div>
      </div>

      {/* ── Alarm Banner ─────────────────────────────────────────────────── */}
      {pot.alarmTriggered ? (
        <div className="mt-5 rounded-lg border-2 border-emerald-500 bg-emerald-950/40 p-4 text-emerald-200 animate-pulse shadow-lg shadow-emerald-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h4 className="font-bold text-emerald-100 text-sm">
                  TARGET REDUCTION REACHED! ({(pot.targetReductionPct * 100).toFixed(0)}% Reduced)
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Liquid has reached target volume ({currentVolume.primary}). Reduce flame to low or remove from heat to preserve glaze.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetPot}
              className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              Reset Timer
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Main Monitor Grid ────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Pot Visualizer & Real-time Gauges (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {pot.vesselName}
              </span>
              <span className="text-xs font-medium text-amber-400">
                {pot.isBoiling ? `🔥 Boiling (${pot.burnerPowerW} W)` : "Off"}
              </span>
            </div>

            {/* Large Prominent Volume & Concentration Readout */}
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-xs text-white/50 block">Current Liquid Volume</span>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-0.5">
                  {currentVolume.primary}{" "}
                  <span className="text-sm font-normal text-white/40 font-mono">
                    ({currentVolume.secondary})
                  </span>
                </div>
                <span className="text-xs text-white/40 mt-1 block">
                  Started at {initialVolume.primary} ({initialVolume.secondary})
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-white/50 block">Flavor Concentration</span>
                <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-0.5">
                  {concentration.label}
                </div>
                <span className="text-xs text-amber-200/70 mt-1 block font-medium">
                  {concentration.culinaryStage}
                </span>
              </div>
            </div>

            {/* Visual Liquid Level Gauge */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
                <span>Reduction Progress</span>
                <span className="font-mono font-medium text-white/90">
                  {percentReduced.toFixed(1)}% reduced
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    pot.alarmTriggered
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300"
                  }`}
                  style={{ width: `${Math.min(100, (interpolatedVolL / pot.initialVolL) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                <span>0 (Dry)</span>
                <span>Target: {(pot.targetReductionPct * 100).toFixed(0)}%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Flavor Note Card */}
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <p>
                <strong className="text-amber-300">Flavor Profile:</strong>{" "}
                {concentration.flavorImpact}. Non-volatile solutes (gelatin, salt, glutamates) concentrate with reduction.
              </p>
            </div>
          </div>

          {/* Time Remaining Forecast */}
          <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/40 block">Estimated Time Remaining</span>
              <span className="text-lg font-semibold text-white">
                {estimatedMinutesRemaining !== null && estimatedMinutesRemaining > 0
                  ? `~${estimatedMinutesRemaining.toFixed(1)} minutes`
                  : pot.alarmTriggered
                  ? "Completed"
                  : "—"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetPot}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Restart Batch
            </button>
          </div>
        </div>

        {/* Live Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Chef Controls
            </h4>
            <p className="text-[11px] text-white/40 mt-0.5">
              Changes sync instantly to all connected cook stations.
            </p>
          </div>

          {/* Heat Power Setting */}
          <div>
            <div className="text-xs font-medium text-white/80 block mb-2">
              Burner Power Input: <span className="font-mono text-amber-300">{pot.burnerPowerW} W</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {POWER_PRESETS.map((p) => (
                <button
                  key={p.watts}
                  type="button"
                  onClick={(): void => { handleSetControls(p.watts, pot.lidSeal); }}
                  className={`rounded-lg border p-2 text-left text-xs transition-all ${
                    pot.burnerPowerW === p.watts
                      ? "border-amber-500 bg-amber-500/15 text-amber-200 font-semibold"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lid Seal State */}
          <div>
            <div className="text-xs font-medium text-white/80 block mb-2">
              Lid Seal State
            </div>
            <div className="flex flex-col gap-1.5">
              {LID_SEALS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={(): void => { handleSetControls(pot.burnerPowerW, s.id); }}
                  className={`rounded-lg border px-3 py-2 text-left transition-all ${
                    pot.lidSeal === s.id
                      ? "border-amber-500 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90">{s.label}</span>
                    {pot.lidSeal === s.id ? (
                      <span className="text-[10px] uppercase font-bold text-amber-400">Active</span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-white/50 block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Reduction */}
          <div>
            <div className="text-xs font-medium text-white/80 block mb-2">
              Target Reduction Goal
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {TARGET_PRESETS.map((t) => (
                <button
                  key={t.pct}
                  type="button"
                  onClick={(): void => { handleSetTarget(t.pct); }}
                  className={`rounded-lg border p-2 text-center text-xs transition-all ${
                    pot.targetReductionPct === t.pct
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-bold">{(t.pct * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-white/50 block mt-0.5">{t.label.replace("Reduce by ", "")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
