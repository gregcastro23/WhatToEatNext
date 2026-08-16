/**
 * Instrument primitives for the cooking-method recommender.
 *
 * This surface is an instrument readout, not a card grid: monospaced label-caps
 * over tabular figures, hairline rules instead of filled boxes, and a unit that
 * is always visually subordinate to its number.
 *
 * ⚠️ TOKENS: these use the GLOBAL `alchm-*` palette, never the `ma-*` one. The
 * molecular-alchemy theme is scoped to `.ma-root` under `/cooking-methods` and
 * its cyan reads as a different product anywhere else. See
 * `src/app/cooking-methods/alchemy.css`.
 *
 * ⚠️ ABSENCE: `Readout` takes an `absent` reason and renders an em dash beside
 * it. It deliberately has no "default", "typical" or skeleton value — a
 * plausible number that nothing measured is worse than a blank, because the
 * blank prompts a question and the fabrication ends one.
 *
 * @file src/components/recommendations/instrument.tsx
 */

import React from "react";

/**
 * Row accent by dominant element.
 *
 * Shared with the `ma-accent-*` palettes in `src/app/cooking-methods/alchemy.css`
 * so a method keeps its colour identity across both surfaces, even though the
 * two themes are otherwise separate.
 */
export const ELEMENT_ACCENT: Readonly<Record<string, string>> = {
  Fire: "#FF571A",
  Water: "#00DBE7",
  Earth: "#FEC184",
  Air: "#E1FDFF",
};

/** Neutral fallback for an unrecognised or absent element. */
const NEUTRAL_ACCENT = "#B5ADCC";

export function elementAccent(element: string | null | undefined): string {
  // ⚠️ NOT `(element && ELEMENT_ACCENT[element]) ?? NEUTRAL_ACCENT`, which is
  // the swap the nullish-coalescing lint rule invites. `element && …` yields
  // the EMPTY STRING when `element` is `""`, and `??` passes an empty string
  // straight through — so a blank element would have been rendered as a
  // colour of `""`. The ternary maps every falsy element to `undefined` first,
  // which is what `??` is actually there to catch.
  return (element ? ELEMENT_ACCENT[element] : undefined) ?? NEUTRAL_ACCENT;
}

/** Uppercase monospaced microcopy. Every label on this surface is one of these. */
export function InstrumentLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={`font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-alchm-fg-mute ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Where a value sits in the 26-method corpus, as a ±3σ track.
 *
 * A raw coefficient is decoration; the same coefficient with the distribution
 * behind it is information. Outliers pin at the edge rather than escaping the
 * track, and the centre tick marks the corpus median so the direction of the
 * marker is readable without reading the number.
 */
export function ZTrack({ z, className = "" }: { z: number; className?: string }): React.ReactElement {
  const clamped = Math.max(-3, Math.min(3, z));
  const pct = ((clamped + 3) / 6) * 100;
  const magnitude = Math.abs(z);
  const colour = magnitude >= 2 ? "bg-amber-300" : magnitude >= 1 ? "bg-alchm-violet-bright" : "bg-alchm-fg-mute";

  return (
    <span
      className={`relative inline-block h-[3px] w-12 rounded-full bg-white/[0.08] align-middle ${className}`}
      aria-hidden
    >
      <span className="absolute left-1/2 top-1/2 h-[7px] w-px -translate-x-1/2 -translate-y-1/2 bg-white/20" />
      <span
        className={`absolute top-1/2 h-[7px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full ${colour}`}
        style={{ left: `${pct}%` }}
      />
    </span>
  );
}

export type ReadoutTone = "default" | "heat" | "transfer" | "time" | "browning" | "accent";

const TONE_CLASS: Readonly<Record<ReadoutTone, string>> = {
  default: "text-alchm-fg",
  heat: "text-sky-300",
  transfer: "text-amber-300",
  time: "text-emerald-300",
  browning: "text-orange-300",
  accent: "text-alchm-violet-bright",
};

/**
 * One label/value pair in a physics strip.
 *
 * `absent` wins over `value`: when a reason is supplied the cell renders an em
 * dash and the reason, and never the value. That ordering is deliberate — it
 * makes "we don't know" unrepresentable as a number at the call site.
 */
export function Readout({
  label,
  value,
  unit,
  tone = "default",
  z,
  absent,
  className = "",
}: {
  label: string;
  value?: React.ReactNode;
  unit?: string;
  tone?: ReadoutTone;
  z?: number | null;
  absent?: string | null;
  className?: string;
}): React.ReactElement {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <InstrumentLabel>{label}</InstrumentLabel>
      {absent ? (
        <span className="flex items-baseline gap-1.5 font-mono text-[13px] leading-none text-alchm-fg-faint">
          —<span className="text-[10px] font-normal text-alchm-fg-mute">{absent}</span>
        </span>
      ) : (
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-none">
          <span className={`font-mono text-[13px] font-bold tabular-nums ${TONE_CLASS[tone]}`}>{value}</span>
          {unit && <span className="font-mono text-[10px] font-normal text-alchm-fg-mute">{unit}</span>}
          {typeof z === "number" && (
            <>
              <ZTrack z={z} />
              <span className="font-mono text-[10px] font-normal tabular-nums text-alchm-fg-mute">
                z{z >= 0 ? "+" : ""}
                {z.toFixed(2)}
              </span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

/** Vertical hairline between readout groups. Decorative, hence aria-hidden. */
export function Divider(): React.ReactElement {
  return <span className="hidden h-8 w-px shrink-0 bg-alchm-line-hi md:block" aria-hidden />;
}

export type ChipTone = "live" | "stale" | "warn" | "accent" | "neutral";

const CHIP_CLASS: Readonly<Record<ChipTone, string>> = {
  live: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  stale: "border-alchm-line-hi bg-white/[0.03] text-alchm-fg-mute",
  warn: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  accent: "border-alchm-violet/40 bg-alchm-violet/10 text-alchm-violet-bright",
  neutral: "border-alchm-line-hi bg-white/[0.03] text-alchm-fg-dim",
};

export function Chip({
  tone = "neutral",
  pulse = false,
  children,
}: {
  tone?: ChipTone;
  pulse?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.1em] ${CHIP_CLASS[tone]}`}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse" aria-hidden />
      )}
      {children}
    </span>
  );
}

/**
 * Frosted obsidian panel. Depth comes from the hairline and the blur, never
 * from a shadow on a light card — there are no light cards on this surface.
 */
export function Panel({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}): React.ReactElement {
  return (
    <div
      className={`relative overflow-hidden rounded-alchm border border-alchm-line bg-white/[0.02] backdrop-blur-xl ${className}`}
      style={accent ? { boxShadow: `inset 2px 0 0 0 ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Circular harmony gauge.
 *
 * The track is a white wash rather than a light-grey fill: on `#07060B` the old
 * `#f3f4f6` track read as a solid white ring with a coloured sliver on it.
 */
export function HarmonyRing({ value, size = 44 }: { value: number; size?: number }): React.ReactElement {
  const band =
    value >= 75
      ? "#34D399"
      : value >= 60
        ? "#6EE7B7"
        : value >= 45
          ? "#FCD34D"
          : value >= 30
            ? "#FB923C"
            : "#F87171";
  const r = 15.9;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" viewBox="0 0 36 36" width={size} height={size} aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={band}
          strokeWidth="2"
          strokeDasharray={`${Math.max(0, Math.min(100, value))} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-mono font-bold tabular-nums"
          style={{ color: band, fontSize: size <= 44 ? 10 : 13 }}
        >
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
}
