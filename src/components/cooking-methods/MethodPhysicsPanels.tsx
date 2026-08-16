"use client";

/**
 * Physics panels for a cooking method.
 *
 * Every number rendered here comes from `src/lib/cooking/*` and
 * `src/data/cooking/methodPhysics.ts` — measured or textbook quantities with a
 * stated basis. Nothing alchemical reaches this file, by design: the sky drives
 * matching, not temperature.
 *
 * Where a quantity does not apply to a method, these panels say so in words
 * rather than printing a plausible-looking number. That is the whole point.
 *
 * @file src/components/cooking-methods/MethodPhysicsPanels.tsx
 */

import React, { useMemo, useState } from "react";
import { METHOD_PHYSICS, RATE_LIMITER_LABEL, RATE_LIMITER_NOTE } from "@/data/cooking/methodPhysics";
import type { MethodPhysicalReference } from "@/data/cooking/physicalReference";
import {
  useEnvironmentalObservation,
  type ElevationProvenance,
} from "@/hooks/useEnvironmentalObservation";
import { useEnvironmentalProducer } from "@/hooks/useEnvironmentalProducer";
import {
  altitudeEffect,
  altitudeCriticalGap,
  REFERENCE_LOAD,
  type MethodPhysicsMetrics,
} from "@/lib/cooking/methodMetrics";
import { cToF, fToC, slabCoreTime } from "@/lib/cooking/thermo";
import { OvenConvectionCanvas } from "./OvenConvectionCanvas";

/** How the elevation was obtained, in words a cook can weigh. */
const PROVENANCE_LABEL: Readonly<Record<ElevationProvenance, string>> = {
  gps: "device GPS",
  dem: "an elevation model",
  ip: "IP geolocation",
  user: "you",
};

// ============================================================================
// Shared primitives
// ============================================================================

function Panel({
  title,
  subtitle,
  children,
  tone = "neutral",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "neutral" | "warm" | "cool";
}) {
  const border =
    tone === "warm" ? "border-amber-400/25" : tone === "cool" ? "border-sky-400/25" : "border-white/10";
  return (
    <div className={`rounded-xl border ${border} bg-white/[0.02] p-5 shadow-sm`}>
      <h4 className="text-sm font-bold text-gray-200">{title}</h4>
      {subtitle && <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * Where a value sits in the 26-method corpus, as a z-score on a track.
 *
 * A raw coefficient is decoration; the same coefficient with its distribution
 * behind it is information. Renders an explicit "no baseline" state rather than
 * defaulting a null z to the centre of the track.
 */
function ZMeter({ z, note, label }: { z: number | null; note: string | null; label: string }) {
  if (z === null) {
    return (
      <div className="text-[11px] text-gray-500">
        {label}: no measurable spread across methods — cannot standardise.
      </div>
    );
  }
  // Track spans ±3 sigma; clamp so outliers pin at the edge instead of escaping.
  const clamped = Math.max(-3, Math.min(3, z));
  const pct = ((clamped + 3) / 6) * 100;
  const strong = Math.abs(z) >= 2;
  const colour = strong ? "bg-amber-400" : Math.abs(z) >= 1 ? "bg-indigo-400" : "bg-gray-500";

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-gray-500">{label}</span>
        <span className={`font-mono font-bold ${strong ? "text-amber-300" : "text-gray-300"}`}>
          z = {z >= 0 ? "+" : ""}
          {z.toFixed(2)}
        </span>
      </div>
      <div className="relative mt-1 h-1.5 rounded-full bg-white/10">
        {/* median marker */}
        <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-white/25" />
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${colour}`}
          style={{ left: `${pct}%` }}
        />
      </div>
      {note && <div className="mt-1 text-[11px] text-gray-400">{note}</div>}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-bold leading-tight text-gray-100">
        {value}
        {unit && <span className="ml-1 text-[11px] font-normal text-gray-500">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-[11px] leading-snug text-gray-500">{hint}</div>}
    </div>
  );
}

/**
 * Magnitude wording for a z-score over TIME, where the sign's meaning is
 * inverted from the usual reading: a lower time is a better result. The caller
 * supplies the faster/slower direction; this supplies only how far out it is.
 */
function describeTimeZ(z: number): string {
  const magnitude = Math.abs(z);
  if (magnitude < 0.5) return "within the typical band";
  if (magnitude < 1) return "slightly outside the typical band";
  if (magnitude < 2) return "well outside the typical band";
  return "an outlier against every comparable method";
}

/** Absent data is stated, never filled in. */
function Absent({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-gray-500">
      {reason}
    </div>
  );
}

// ============================================================================
// Physics tab
// ============================================================================

const MODE_META = [
  { key: "conduction", label: "Conduction", colour: "bg-orange-400", note: "direct contact" },
  { key: "convection", label: "Convection", colour: "bg-sky-400", note: "moving fluid" },
  { key: "radiation", label: "Radiation", colour: "bg-rose-400", note: "infrared, no medium" },
  { key: "phaseChange", label: "Phase change", colour: "bg-violet-400", note: "latent heat" },
] as const;

export function PhysicsTab({ metrics }: { metrics: MethodPhysicsMetrics }) {
  const { physics, transfer, medium, reference, browning } = metrics;
  const modeTotal =
    physics.modes.conduction + physics.modes.convection + physics.modes.radiation + physics.modes.phaseChange;

  return (
    <div className="space-y-4">
      {/* 3D Real-time Convection & Radiant Physics Canvas Loop */}
      <OvenConvectionCanvas metrics={metrics} />

      {/* What sets the pace */}
      <Panel
        title={`Rate-limiting step · ${RATE_LIMITER_LABEL[physics.rateLimiter]}`}
        subtitle={RATE_LIMITER_NOTE[physics.rateLimiter]}
      >
        {modeTotal > 0 ? (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
              {MODE_META.map(({ key, colour }) => {
                const v = physics.modes[key];
                if (v <= 0) return null;
                return <div key={key} className={colour} style={{ width: `${(v / modeTotal) * 100}%` }} />;
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {MODE_META.map(({ key, label, colour, note }) => {
                const v = physics.modes[key];
                if (v <= 0) return null;
                return (
                  <span key={key} className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className={`h-2 w-2 rounded-full ${colour}`} />
                    {label} {Math.round((v / modeTotal) * 100)}%
                    <span className="text-gray-600">· {note}</span>
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <Absent reason="No thermal transfer mode — this method does not move heat into food at all." />
        )}
      </Panel>

      {/* Heat transfer coefficient */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel
          title="Surface heat transfer coefficient"
          subtitle="h, in watts per square metre per kelvin — how hard the medium pushes heat across the food's surface."
          tone="warm"
        >
          {transfer ? (
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="font-mono text-3xl font-black text-amber-300">
                  {transfer.typical.toLocaleString()}
                </div>
                <div className="pb-1 text-[11px] text-gray-500">
                  W·m⁻²·K⁻¹
                  <br />
                  range {transfer.low.toLocaleString()}–{transfer.high.toLocaleString()}
                </div>
              </div>
              <ZMeter z={transfer.z} note={transfer.zNote} label="vs all methods (log scale)" />
              <p className="text-[11px] leading-relaxed text-gray-400">{transfer.regime}</p>
            </div>
          ) : (
            <Absent
              reason={`Not a heat-transfer problem. ${RATE_LIMITER_NOTE[physics.rateLimiter]} Quoting an h here would be a category error.`}
            />
          )}
        </Panel>

        <Panel
          title="Driving temperature"
          subtitle="The medium actually doing the work — not a dial setting."
          tone="cool"
        >
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="font-mono text-3xl font-black text-sky-300">
                {Math.round(medium.fahrenheit)}°F
              </div>
              <div className="pb-1 text-[11px] text-gray-500">{Math.round(medium.celsius)}°C</div>
            </div>
            <ZMeter z={medium.z} note={medium.zNote} label="vs all methods" />
            {/* Where the medium legitimately differs from the published envelope,
                say so loudly. In braising that gap IS the technique. */}
            {physics.mediumDivergenceNote && (
              <div className="rounded-lg border border-amber-400/25 bg-amber-500/5 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-amber-300/80">
                  Setting ≠ medium
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                  {physics.mediumDivergenceNote}
                </p>
              </div>
            )}
            {physics.radiantFluxKwM2 !== undefined && (
              <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-rose-300/80">Radiant flux</div>
                <div className="font-mono text-lg font-bold text-rose-300">
                  {physics.radiantFluxKwM2.toFixed(1)}
                  <span className="ml-1 text-[11px] font-normal text-gray-500">kW·m⁻²</span>
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  From a source near {physics.radiantSourceK} K. An oven wall delivers about 1.9 — the
                  difference is why this method chars in seconds.
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Reference benchmark */}
      <Panel
        title="Reference benchmark"
        subtitle={`Same load, every method: ${REFERENCE_LOAD.description}. The only way to compare methods on time.`}
      >
        {reference.result ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                label="Time to core"
                value={reference.result.minutes.toFixed(1)}
                unit="min"
                hint="centre of the slab"
              />
              <Stat
                label="Biot number"
                value={reference.result.biot.toFixed(2)}
                hint={
                  reference.result.biot < 0.1
                    ? "thermally thin — the medium sets the pace"
                    : reference.result.biot > 1
                      ? "conduction-limited — a hotter medium mostly burns the outside"
                      : "mixed regime"
                }
              />
              <Stat
                label="Fourier number"
                value={reference.result.fourier.toFixed(2)}
                hint={reference.result.oneTermValid ? "one-term solution valid" : "⚠ Fo ≤ 0.2, early transient"}
              />
              {/* `[MEASURED 2026-08-16]` The exponent is NOT a constant 2 — it
                  interpolates with Biot number, from L¹ in the lumped limit to
                  L² in the conduction limit. Measured for a 12.5→25 mm doubling:
                  h=25 → ×2.41, h=95 → ×2.94, h=500 → ×3.59, h=3000 → ×3.91.
                  A flat "t ∝ L²" would overstate the penalty by 65 % in an oven. */}
              <Stat
                label="Thickness law"
                value={reference.result.biot > 5 ? "t ∝ L²" : reference.result.biot < 0.5 ? "t ∝ L" : "t ∝ L^1.5"}
                hint={
                  reference.result.biot > 5
                    ? "conduction-limited: double the thickness, ~4× the time"
                    : reference.result.biot < 0.5
                      ? "surface-limited: double the thickness, ~2× the time"
                      : "mixed: double the thickness, ~3× the time"
                }
              />
            </div>
            {/* Labelled by the quantity actually standardised — TIME, not speed.
                Stir-frying cores in 4.9 min at z = −1.04; captioned "speed …
                well below the median" that reads as slow, when the method is
                among the fastest on the board. Negative must mean less time. */}
            <ZMeter
              z={reference.z}
              note={
                reference.z === null
                  ? null
                  : reference.z < 0
                    ? `Faster than most — ${describeTimeZ(reference.z)}`
                    : `Slower than most — ${describeTimeZ(reference.z)}`
              }
              label="time to core vs comparable methods"
            />
            <p className="text-[11px] leading-relaxed text-gray-500">
              One-term plane-wall transient conduction with convective boundaries (Incropera &amp; DeWitt
              §5.5). A real cut is not an infinite slab — this shows how time scales with thickness, medium
              and coefficient, not when dinner is ready.
            </p>
          </div>
        ) : (
          <Absent reason={reference.unavailableReason ?? "Not available."} />
        )}
      </Panel>

      {/* Browning */}
      <Panel title="Browning availability" subtitle="Can this method's surface reach Maillard chemistry?">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
              browning.available ? "bg-amber-500/15 text-amber-300" : "bg-sky-500/15 text-sky-300"
            }`}
          >
            {browning.available ? "Available" : "Unreachable"}
          </span>
          <p className="text-[11px] leading-relaxed text-gray-400">{browning.explanation}</p>
        </div>
      </Panel>
    </div>
  );
}

// ============================================================================
// Reactions tab — thresholds against the method's own envelope
// ============================================================================

const REACTION_SCALE_MIN_C = -20;
const REACTION_SCALE_MAX_C = 300;

function scalePos(celsius: number): number {
  const clamped = Math.max(REACTION_SCALE_MIN_C, Math.min(REACTION_SCALE_MAX_C, celsius));
  return ((clamped - REACTION_SCALE_MIN_C) / (REACTION_SCALE_MAX_C - REACTION_SCALE_MIN_C)) * 100;
}

export function ReactionsTab({
  metrics,
  reference,
}: {
  metrics: MethodPhysicsMetrics;
  reference?: MethodPhysicalReference;
}) {
  const { physics } = metrics;
  const envLowC = reference ? fToC(reference.temperatureF.low) : null;
  const envHighC = reference ? fToC(reference.temperatureF.high) : null;

  const sorted = [...physics.reactions].sort((a, b) => a.onsetC - b.onsetC);

  return (
    <div className="space-y-4">
      <Panel
        title="Reaction thresholds"
        subtitle="Each reaction plotted against this method's own working range. A threshold outside the band is chemistry this method cannot reach."
      >
        {/* Scale */}
        <div className="relative mb-6 h-10">
          <div className="absolute inset-x-0 top-4 h-2 rounded-full bg-white/10" />
          {envLowC !== null && envHighC !== null && (
            <div
              className="absolute top-4 h-2 rounded-full bg-emerald-400/40"
              style={{ left: `${scalePos(envLowC)}%`, width: `${scalePos(envHighC) - scalePos(envLowC)}%` }}
              title={`Working range ${reference!.temperatureF.low}–${reference!.temperatureF.high} °F`}
            />
          )}
          {sorted.map((r) => (
            <div
              key={r.name}
              className="absolute top-2 h-6 w-0.5 -translate-x-1/2 bg-amber-300"
              style={{ left: `${scalePos(r.onsetC)}%` }}
              title={`${r.name} — ${Math.round(r.onsetC)} °C`}
            />
          ))}
          <div className="absolute inset-x-0 top-7 flex justify-between text-[10px] text-gray-600">
            <span>{Math.round(cToF(REACTION_SCALE_MIN_C))}°F</span>
            <span>{Math.round(cToF(REACTION_SCALE_MAX_C))}°F</span>
          </div>
        </div>

        {envLowC !== null && (
          <div className="mb-3 flex items-center gap-3 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-emerald-400/40" /> working range
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-amber-300" /> reaction onset
            </span>
          </div>
        )}

        <div className="space-y-2">
          {sorted.map((r) => {
            const reachable = envHighC === null || r.onsetC <= envHighC;
            return (
              <div
                key={r.name}
                className={`rounded-lg border p-3 ${
                  reachable ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-transparent opacity-55"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-200">{r.name}</span>
                  <span className="font-mono text-[11px] text-gray-400">
                    {r.onsetC === 0 ? (
                      <span className="text-gray-500">not temperature-gated</span>
                    ) : (
                      <>
                        from {Math.round(cToF(r.onsetC))}°F / {Math.round(r.onsetC)}°C
                      </>
                    )}
                    {!reachable && <span className="ml-2 text-amber-400/80">· out of range</span>}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{r.note}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Moisture" subtitle="Which way water is moving decides texture as much as temperature does.">
        <div className="text-sm font-semibold capitalize text-gray-200">
          {physics.moistureFlux.replace(/-/g, " ")}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
          {physics.moistureFlux === "out-of-food" &&
            "Water is leaving. The surface cannot exceed the boiling point until it dries locally — which is exactly when browning starts."}
          {physics.moistureFlux === "into-food" &&
            "Water is entering. The surface stays saturated throughout, so it holds at the boiling point and no browning is possible."}
          {physics.moistureFlux === "held" &&
            "Water is neither gained nor lost — a sealed system, so weight and juiciness are preserved and no crust can form."}
          {physics.moistureFlux === "neutral" &&
            "No net water movement is driving this method; the transformation is chemical or structural."}
        </p>
      </Panel>
    </div>
  );
}

// ============================================================================
// Conditions tab — real envelopes, real environment
// ============================================================================

/** Elevations offered in the altitude explorer, with a recognisable anchor each. */
const ELEVATION_PRESETS = [
  { m: 0, label: "Sea level" },
  { m: 500, label: "500 m" },
  { m: 1609, label: "Denver 1609 m" },
  // Bogotá's elevation is 2640 m; the value here read 2240 while the label
  // said 2640, so the readout was 400 m of someone else's city.
  { m: 2640, label: "Bogotá 2640 m" },
  { m: 3000, label: "3000 m" },
] as const;

export function ConditionsTab({
  metrics,
  reference,
  optimalTemperatures,
}: {
  metrics: MethodPhysicsMetrics;
  reference?: MethodPhysicalReference;
  optimalTemperatures?: Record<string, number>;
}) {
  const { physics, methodId } = metrics;

  // Active telemetry producer: resolves elevation (GNSS/DEM/geohash) and publishes to SpacetimeDB
  useEnvironmentalProducer();

  // Live telemetry, or null when the flag is off / disconnected / no row yet.
  // Null means "we do not know where you are" — NOT sea level.
  const live = useEnvironmentalObservation();

  // A manual pick always wins over the live reading; `null` means "follow live
  // if there is one". The user can leave the live reading by tapping a preset
  // and return to it with the Live chip, so the app never traps them on a
  // location a coarse IP lookup guessed for them.
  const [manualElevationM, setManualElevationM] = useState<number | null>(null);
  const usingLive = manualElevationM === null && live !== null;
  const elevationM = manualElevationM ?? live?.elevationM ?? 0;
  // Only a live reading carries a barometer. A manual preset is an elevation
  // and nothing more, so it must fall back to the ISA model.
  const stationPressureKpa = usingLive ? (live?.stationPressureKpa ?? undefined) : undefined;

  const altitude = useMemo(
    () => altitudeEffect(methodId, elevationM, stationPressureKpa),
    [methodId, elevationM, stationPressureKpa],
  );
  const criticalGap = useMemo(
    () => altitudeCriticalGap(methodId, elevationM),
    [methodId, elevationM],
  );
  /** Sea-level medium, for the "down from" comparison. */
  const nominalMediumC = METHOD_PHYSICS[methodId]?.mediumC ?? null;

  const perIngredient = optimalTemperatures ? Object.entries(optimalTemperatures) : [];
  const proteins = reference?.temperatureF.proteins
    ? Object.entries(reference.temperatureF.proteins)
    : [];

  return (
    <div className="space-y-4">
      {/* Temperature envelope */}
      {reference ? (
        <Panel
          title="Working temperature range"
          subtitle="Published culinary envelope for this method. Not derived from anything — this is the range the technique is defined by."
          tone="warm"
        >
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <Stat
              label="Ideal"
              value={`${reference.temperatureF.ideal}°F`}
              hint={`${Math.round(fToC(reference.temperatureF.ideal))}°C`}
            />
            <Stat
              label="Range"
              value={`${reference.temperatureF.low}–${reference.temperatureF.high}°F`}
              hint={`${Math.round(fToC(reference.temperatureF.low))}–${Math.round(fToC(reference.temperatureF.high))}°C`}
            />
            <Stat
              label="Pressure"
              value={reference.pressure.mode}
              hint={`${reference.pressure.absoluteKPa} kPa absolute · gauge ${reference.pressure.gaugePsi} psi`}
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">{reference.temperatureF.note}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{reference.pressure.note}</p>
        </Panel>
      ) : (
        <Absent reason="No published temperature envelope on file for this method." />
      )}

      {/* Per-ingredient targets — curated data, not derived */}
      {(perIngredient.length > 0 || proteins.length > 0) && (
        <Panel
          title="Targets by ingredient"
          subtitle="Curated per-ingredient figures from this method's own record. These are the numbers to cook to."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {proteins.map(([klass, entry]) => (
              <div key={klass} className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3">
                <div className="text-[10px] uppercase tracking-wide text-emerald-300/80">
                  {klass.replace(/([A-Z])/g, " $1")}
                </div>
                <div className="mt-0.5 font-mono text-lg font-bold text-gray-100">{entry.temp}°F</div>
                <div className="text-[10px] text-gray-500">{Math.round(fToC(entry.temp))}°C</div>
                <div className="mt-1 text-[11px] leading-snug text-gray-500">{entry.note}</div>
              </div>
            ))}
            {perIngredient.map(([label, temp]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  {label.replace(/_/g, " ")}
                </div>
                <div className="mt-0.5 font-mono text-lg font-bold text-gray-100">{temp}°F</div>
                <div className="text-[10px] text-gray-500">{Math.round(fToC(temp))}°C</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Altitude */}
      <Panel
        title="Altitude"
        subtitle="Water's boiling point falls with pressure. Whether that slows YOUR method depends on whether the method is capped by it."
        tone="cool"
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {live && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setManualElevationM(null);
              }}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                usingLive
                  ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              ● Live {live.elevationM.toFixed(0)} m
            </button>
          )}
          {ELEVATION_PRESETS.map(({ m, label }) => (
            <button
              key={m}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setManualElevationM(m);
              }}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                !usingLive && elevationM === m
                  ? "bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/40"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* An elevation is only as good as how it was obtained. IP geolocation
            resolves to a city centroid — in mountain terrain that is not an
            error bar but a systematic offset, and at ~0.34 °C per 100 m it is
            large enough to change what a cook should actually do. Saying which
            source produced the number is cheaper than quietly printing a
            confident boiling point derived from a guess. */}
        {usingLive && (
          <div
            className={`mb-3 rounded-lg border p-2.5 text-[11px] leading-snug ${
              live.elevationTrustworthy
                ? "border-emerald-400/20 bg-emerald-500/5 text-gray-400"
                : "border-amber-400/25 bg-amber-500/5 text-gray-300"
            }`}
          >
            {live.elevationTrustworthy ? (
              <>
                Elevation from{" "}
                <span className="font-semibold text-emerald-200">
                  {PROVENANCE_LABEL[live.elevationProvenance]}
                </span>
                {" · ±"}
                {live.elevationErrorM} m
                {live.stationPressureKpa !== null && (
                  <>
                    {" · barometer "}
                    <span className="font-semibold text-emerald-200">
                      {live.stationPressureKpa.toFixed(1)} kPa
                    </span>{" "}
                    (measured, not modelled)
                  </>
                )}
              </>
            ) : (
              <>
                This elevation came from{" "}
                <span className="font-semibold text-amber-200">
                  {PROVENANCE_LABEL[live.elevationProvenance]}
                </span>
                , which resolves to a city centroid and can be off by a kilometre
                or more in hilly terrain — roughly 3 °C of boiling point. Treat
                the numbers below as approximate, or pick a preset you know.
              </>
            )}
          </div>
        )}

        {altitude && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat
                label="Water boils at"
                value={`${altitude.boilingF.toFixed(0)}°F`}
                hint={`${altitude.boilingC.toFixed(1)}°C · ${altitude.shiftC >= 0 ? "" : ""}${altitude.shiftC.toFixed(1)} K vs sea level`}
              />
              {altitude.multipliersApply ? (
                <>
                  <Stat
                    label="Softening time"
                    value={`×${altitude.softeningMultiplier.toFixed(2)}`}
                    hint="vegetables, starches, collagen (Q10 ≈ 2)"
                  />
                  <Stat
                    label="Pasteurising time"
                    value={`×${altitude.pasteurisationMultiplier.toFixed(1)}`}
                    hint="microbial lethality (z = 5.6 °C)"
                  />
                </>
              ) : (
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">
                    Effect on this method
                  </div>
                  <div className="mt-0.5 text-sm font-bold capitalize text-gray-200">
                    {altitude.response}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-gray-500">
                    {altitude.response === "unaffected" &&
                      "The boiling point above is shown for reference only — it does not set this method's pace, so no time multiplier applies."}
                    {altitude.response === "compensated" &&
                      "This method restores the ceiling that altitude removes. Applying a slowdown here would be backwards."}
                    {altitude.response === "accelerated" &&
                      "Lower ambient pressure helps this method rather than hindering it."}
                  </div>
                </div>
              )}
            </div>
            {/* `[FIXED 2026-08-16]` The medium temperature shown elsewhere on
                this card was a fixed constant, so at Bogotá the panel could
                read "medium 212 °F" directly above "water boils at 196 °F
                here" — two numbers, one screen, flatly contradicting each
                other. This block is where the corrected medium is stated, and
                it appears ONLY when elevation genuinely moved it. */}
            {altitude.localizedMedium.clamped && (
              <div className="mt-3 rounded-lg border border-sky-400/25 bg-sky-500/5 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                  At this elevation, your medium is cooler
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-bold text-gray-100">
                    {altitude.localizedMedium.fahrenheit.toFixed(0)}°F
                  </span>
                  <span className="text-[11px] text-gray-400">
                    down from {nominalMediumC === null ? "—" : cToF(nominalMediumC).toFixed(0)}°F at sea level
                    {" · "}
                    {altitude.localizedMedium.shiftC.toFixed(1)} K
                  </span>
                </div>
                {altitude.localizedMedium.coreTimeIncrease !== null &&
                  altitude.localizedMedium.coreTimeIncrease > 0.005 && (
                    <div className="mt-1.5 text-[11px] leading-snug text-gray-400">
                      The reference load ({REFERENCE_LOAD.description}) takes{" "}
                      <span className="font-semibold text-sky-200">
                        +{(altitude.localizedMedium.coreTimeIncrease * 100).toFixed(0)}%
                      </span>{" "}
                      longer here —{" "}
                      {altitude.localizedMedium.seaLevelCoreMinutes!.toFixed(0)} min at sea level
                      versus {altitude.localizedMedium.coreMinutes!.toFixed(0)} min.
                    </div>
                  )}
              </div>
            )}

            {/* A method can be altitude-penalised while the number on the card
                does not move, because the penalty lands on a phase the card
                never shows — tilt-skillet's sear floor holds at 424 °F while
                its covered braise liquid follows the ceiling down. Saying so is
                better than either clamping the wrong number or staying silent. */}
            {!altitude.localizedMedium.clamped && criticalGap?.differsFromMedium && (
              <div className="mt-3 rounded-lg border border-amber-400/25 bg-amber-500/5 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  The medium above does not move — a different phase does
                </div>
                <div className="mt-1 text-[11px] leading-snug text-gray-400">
                  Altitude acts on this method at{" "}
                  <span className="font-semibold text-amber-200">
                    {cToF(criticalGap.criticalC).toFixed(0)}°F
                  </span>
                  , not at the medium temperature shown on this card.{" "}
                  {criticalGap.squeezed
                    ? `The local ceiling of ${cToF(criticalGap.ceilingC).toFixed(0)}°F is now below it, so that phase is running cooler than intended.`
                    : `The local ceiling of ${cToF(criticalGap.ceilingC).toFixed(0)}°F still clears it, so nothing is squeezed yet.`}
                </div>
              </div>
            )}

            {/* The measurement was past the Antoine correlation's validity, so
                the number above is a FLOOR. This happens in two unrelated
                situations that share one cause — pressure above 101.325 kPa:
                a strong high-pressure system, and any elevation below −3.98 m
                (Death Valley, the Turfan Depression, the Dead Sea shore). The
                alternative to saying this is printing sea level as though it
                were measured. */}
            {altitude.localizedMedium.pressureClamped && (
              <div className="mt-3 rounded-lg border border-amber-400/25 bg-amber-500/5 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  Above this library&rsquo;s pressure range — shown as sea level
                </div>
                <div className="mt-1 text-[11px] leading-snug text-gray-400">
                  Local pressure here is above one atmosphere, so water actually
                  boils a little <em>hotter</em> than the {altitude.boilingF.toFixed(0)}°F shown.
                  The Antoine correlation behind these numbers is only valid to
                  101.325 kPa, so the readout is capped there rather than
                  extrapolated. The gap is under 0.5 °C in ordinary high pressure
                  and up to about 1.7 °C at the lowest inhabited places on Earth.
                </div>
              </div>
            )}

            {altitude.localizedMedium.uncomputableReason && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Not computed here
                </div>
                <div className="mt-1 text-[11px] leading-snug text-gray-500">
                  {altitude.localizedMedium.uncomputableReason}
                </div>
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-gray-400">{altitude.note}</p>
          </>
        )}
      </Panel>

      {/* Humidity
          ⚠️ GUARDRAIL — this is where live humidity stops.
          `ambientTempC` and `relativeHumidityPct` reach this panel's TEXT and
          go no further. They are deliberately not passed to
          `OvenConvectionCanvas`: that engine solves buoyancy, drag and Newton
          cooling, and not one of those terms takes a humidity argument. Feeding
          humidity into a particle velocity would make the canvas *look*
          responsive to the room while meaning nothing — a fabricated behaviour
          wearing the costume of physics. If humidity is ever to move a
          particle, it earns that by first appearing in the thermo-core
          equations with a citation and a golden vector. */}
      <Panel title="Humidity" subtitle="The variable most kitchens never think about, and several methods are ruled by.">
        {/* Rendered ONLY when something actually measured the room. A previous
            producer supplied 21 °C / 50 % as literals whenever no sensor
            existed — which was every case — and this block printed them under
            "in your kitchen now". A plausible number labelled as a measurement
            is worse than a blank: the blank prompts a question, the fabrication
            ends one. The `!== null` guards are the fix, and they are load-
            bearing rather than defensive. */}
        {usingLive && (live.ambientTempC !== null || live.relativeHumidityPct !== null) && (
          <div className="mb-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-3 py-2">
            <span className="text-[10px] uppercase tracking-wide text-emerald-300">
              ● In your kitchen now
            </span>
            <span className="text-[11px] text-gray-300">
              {live.ambientTempC !== null && (
                <>
                  <span className="font-semibold text-gray-100">
                    {cToF(live.ambientTempC).toFixed(0)}°F
                  </span>{" "}
                  air
                </>
              )}
              {live.ambientTempC !== null && live.relativeHumidityPct !== null && " · "}
              {live.relativeHumidityPct !== null && (
                <>
                  <span className="font-semibold text-gray-100">
                    {live.relativeHumidityPct.toFixed(0)}%
                  </span>{" "}
                  RH
                </>
              )}
            </span>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-gray-400">{physics.humidityNote}</p>
      </Panel>
    </div>
  );
}

// ============================================================================
// Equipment tab — why the pan matters
// ============================================================================

const PRIORITY_EXPLAIN: Record<string, string> = {
  recovery: "Recovery — how little the surface temperature falls when cold food lands. Effusivity first, mass second.",
  spreading: "Spreading — how well the pan erases the burner's hot ring. Conductivity × thickness.",
  "thermal-mass": "Stored energy — how long the vessel can keep giving heat back without the burner.",
  inertness: "Chemical inertness — hours of acid or salt will strip a reactive surface into the food.",
  sealing: "Sealing — the enclosure is the appliance; a leak silently changes the method.",
  airflow: "Airflow — the rate is set by how fast the medium is exchanged, not by how hot it is.",
};

export function EquipmentPhysicsPanel({ metrics }: { metrics: MethodPhysicsMetrics }) {
  const { physics, equipment } = metrics;

  return (
    <div className="space-y-4">
      <Panel title="What matters in a pan here" subtitle={PRIORITY_EXPLAIN[physics.equipmentPriority]}>
        <p className="text-[11px] leading-relaxed text-gray-400">{physics.equipmentNote}</p>
      </Panel>

      {equipment.length > 0 && (
        <Panel
          title="Material physics"
          subtitle="Interface temperature the instant 5 °C food meets a 230 °C pan — the moment that decides sear versus steam."
        >
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-gray-500">
                  <th className="px-1 pb-2 font-medium">Material</th>
                  <th className="px-1 pb-2 text-right font-medium">Contact °C</th>
                  <th className="px-1 pb-2 text-right font-medium">Effusivity</th>
                  <th className="px-1 pb-2 text-right font-medium">Stored J·m⁻²·K⁻¹</th>
                  <th className="px-1 pb-2 text-right font-medium">Spreading</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((m) => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="px-1 py-2">
                      <div className="text-xs font-semibold text-gray-200">{m.name}</div>
                      <div className="text-[10px] text-gray-600">{m.typicalThicknessMm} mm typical</div>
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs text-amber-300">
                      {m.contactC.toFixed(0)}
                      <div className="text-[10px] font-normal text-gray-600">−{m.dropK.toFixed(0)} K</div>
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs text-gray-300">
                      {Math.round(m.effusivity).toLocaleString()}
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs text-gray-300">
                      {Math.round(m.arealHeatCapacity).toLocaleString()}
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs text-gray-300">
                      {m.spreading.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 space-y-2">
            {equipment.map((m) => (
              <div key={m.id} className="text-[11px] leading-relaxed">
                <span className="font-semibold text-gray-300">{m.name}.</span>{" "}
                <span className="text-gray-400">{m.characterNote}</span>{" "}
                <span className="text-gray-500">{m.limitationNote}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ============================================================================
// Cook-time explorer — the "how does time change" question, answered live
// ============================================================================

const DONENESS_TARGETS = [
  { label: "Rare 52 °C", c: 52 },
  { label: "Medium 60 °C", c: 60 },
  { label: "Well done 71 °C", c: 71 },
] as const;

const THICKNESS_STEPS = [10, 15, 20, 25, 30, 40, 50, 65] as const;

/**
 * Lets a cook move the two variables that actually decide time — thickness and
 * target — and watch the answer respond. The L² law is far more persuasive when
 * you can drag it than when it is written down.
 */
export function CookTimeExplorer({ metrics }: { metrics: MethodPhysicsMetrics }) {
  const { physics, reference } = metrics;
  const [thicknessMm, setThicknessMm] = useState<number>(25);
  const [targetC, setTargetC] = useState<number>(60);

  const usable = reference.result !== null && physics.h !== null;

  const solved = useMemo(() => {
    if (!usable || !physics.h) return null;
    try {
      return slabCoreTime({
        thicknessMm,
        mediumC: physics.mediumC,
        initialC: REFERENCE_LOAD.initialC,
        targetC,
        hWm2K: physics.h.typical,
      });
    } catch {
      return null;
    }
  }, [usable, physics.h, physics.mediumC, thicknessMm, targetC]);

  if (!usable) {
    return (
      <Absent
        reason={
          reference.unavailableReason ??
          "This method is not paced by heat reaching a core, so a cook-time model does not apply."
        }
      />
    );
  }

  return (
    <Panel
      title="Cook-time explorer"
      subtitle={`Lean muscle from ${REFERENCE_LOAD.initialC} °C in this method's ${Math.round(physics.mediumC)} °C medium.`}
    >
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-500">Thickness</div>
          <div className="flex flex-wrap gap-1.5">
            {THICKNESS_STEPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setThicknessMm(t);
                }}
                className={`rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
                  thicknessMm === t
                    ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                }`}
              >
                {t} mm
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-500">Target core</div>
          <div className="flex flex-wrap gap-1.5">
            {DONENESS_TARGETS.map(({ label, c }) => {
              const reachable = physics.mediumC > c + 2;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!reachable}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTargetC(c);
                  }}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    !reachable
                      ? "cursor-not-allowed text-gray-700 line-through"
                      : targetC === c
                        ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                  title={reachable ? undefined : "Medium is not hot enough to reach this core temperature"}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {solved ? (
          <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
            <div className="flex items-end gap-3">
              <div className="font-mono text-3xl font-black text-amber-300">
                {solved.minutes < 90
                  ? `${solved.minutes.toFixed(0)} min`
                  : `${(solved.minutes / 60).toFixed(1)} hr`}
              </div>
              <div className="pb-1.5 text-[11px] text-gray-500">
                Bi {solved.biot.toFixed(2)} · Fo {solved.fourier.toFixed(2)}
                {!solved.oneTermValid && <span className="ml-1 text-amber-400/80">⚠ early transient</span>}
              </div>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
              Idealised one-dimensional slab. Use it to see how the answer MOVES, not as a timer. Doubling
              the thickness costs between 2× and 4× depending on how hard this medium pushes — the harder it
              pushes, the more the food&apos;s own conduction becomes the bottleneck and the closer the
              penalty gets to 4×.
            </p>
          </div>
        ) : (
          <Absent reason="Not reachable in this medium." />
        )}
      </div>
    </Panel>
  );
}
