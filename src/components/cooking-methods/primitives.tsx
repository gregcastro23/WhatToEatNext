/**
 * Molecular Alchemy primitives — shared building blocks for the
 * cooking-methods surfaces (Transmutation Hub + method profiles).
 * Pure presentational components; safe in server and client components.
 * Theme classes come from src/app/cooking-methods/alchemy.css.
 */
import { Flame, Droplets, Mountain, Wind } from "lucide-react";
import React from "react";
import type { MethodAccent } from "@/types/cookingMethod";

// ─── Accent system ──────────────────────────────────────────────────────────

export function accentClass(accent: MethodAccent | undefined): string {
  switch (accent) {
    case "ember":
      return "ma-accent-ember";
    case "emerald":
      return "ma-accent-emerald";
    case "aqueous":
      return "ma-accent-aqueous";
    case "solar":
      return "ma-accent-solar";
    case "violet":
      return "ma-accent-violet";
    case "plasma":
    default:
      return "ma-accent-plasma";
  }
}

// ─── Elements ───────────────────────────────────────────────────────────────

export type ElementName = "Fire" | "Water" | "Earth" | "Air";

export const ELEMENT_STYLES: Record<
  ElementName,
  { text: string; bar: string; glow: string }
> = {
  Fire: {
    text: "text-ma-ember-soft",
    bar: "bg-ma-ember",
    glow: "shadow-[0_0_6px_rgba(255,87,26,0.5)]",
  },
  Water: {
    text: "text-ma-cyan-bright",
    bar: "bg-ma-cyan-dim",
    glow: "shadow-[0_0_6px_rgba(0,219,231,0.5)]",
  },
  Earth: {
    text: "text-ma-emerald-soft",
    bar: "bg-ma-emerald",
    glow: "shadow-[0_0_6px_rgba(0,251,134,0.5)]",
  },
  Air: {
    text: "text-ma-ice",
    bar: "bg-ma-ice",
    glow: "shadow-[0_0_6px_rgba(225,253,255,0.5)]",
  },
};

export function ElementIcon({
  element,
  className = "h-4 w-4",
}: {
  element: ElementName;
  className?: string;
}) {
  const Icon =
    element === "Fire"
      ? Flame
      : element === "Water"
        ? Droplets
        : element === "Earth"
          ? Mountain
          : Wind;
  return <Icon className={className} aria-hidden />;
}

/** Elemental signature bar row: name, optional role, percent, glowing bar. */
export function ElementBar({
  element,
  percent,
  role,
}: {
  element: ElementName;
  /** 0–100 */
  percent: number;
  role?: string;
}) {
  const s = ELEMENT_STYLES[element];
  const width = Math.max(2, Math.min(100, Math.round(percent)));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`ma-label flex items-center gap-1.5 ${s.text}`}>
          <ElementIcon element={element} className="h-3.5 w-3.5" />
          {element.toUpperCase()}
          {role ? <span className="text-ma-outline normal-case tracking-normal">({role})</span> : null}
        </span>
        <span className={`ma-data text-sm ${s.text}`}>{width}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ma-surface-low">
        <div
          className={`h-full rounded-full ${s.bar} ${s.glow}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ─── Planets ────────────────────────────────────────────────────────────────

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "⛢",
  Neptune: "♆",
  Pluto: "♇",
};

/** Circular etched planet emblem with glyph + name + optional domain caption. */
export function PlanetEmblem({
  planet,
  governs,
  rank,
}: {
  planet: string;
  governs?: string;
  rank?: "primary" | "secondary";
}) {
  const glyph = PLANET_GLYPHS[planet] ?? "✶";
  const tone =
    rank === "secondary"
      ? "border-ma-line text-ma-fg-dim"
      : "border-[var(--ma-accent)]/40 text-[var(--ma-accent-soft)]";
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-ma-surface-low/60 text-2xl ${tone}`}
        aria-hidden
      >
        {glyph}
      </div>
      <div className="min-w-0">
        <div className="font-grimoire text-xl text-ma-fg">{planet}</div>
        {governs ? (
          <div className="ma-label mt-1 text-ma-outline">GOVERNS: {governs}</div>
        ) : rank ? (
          <div className="ma-label mt-1 text-ma-outline">{rank.toUpperCase()}</div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Panels & typography ────────────────────────────────────────────────────

export function MaPanel({
  children,
  className = "",
  glow = false,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Accent gradient border */
  glow?: boolean;
  /** Accent border + glow on hover */
  hover?: boolean;
}) {
  return (
    <section
      className={`ma-panel rounded-lg ${glow ? "ma-glow-border" : ""} ${hover ? "ma-panel-hover" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function MaSectionHeader({
  icon,
  title,
  number,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  /** Stitch-style ordinal badge, e.g. "01" */
  number?: string;
  className?: string;
}) {
  return (
    <header className={`ma-rule mb-5 flex items-center gap-3 pb-3 ${className}`}>
      {number ? (
        <span className="ma-data text-sm text-ma-outline">{number}</span>
      ) : null}
      {icon ? <span className="text-[var(--ma-accent)]">{icon}</span> : null}
      <h2 className="font-grimoire text-xl text-ma-fg md:text-2xl">{title}</h2>
    </header>
  );
}

/** Uppercase mono chip; tone keys map to theme colors. */
export function MaChip({
  children,
  tone = "outline",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "accent" | "outline" | "ember" | "emerald" | "cyan";
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent:
      "border-[var(--ma-accent)]/50 text-[var(--ma-accent-soft)] bg-[rgba(var(--ma-accent-rgb),0.08)]",
    outline: "border-ma-line text-ma-outline bg-ma-surface-low/50",
    ember: "border-ma-ember/50 text-ma-ember-soft bg-ma-ember/10",
    emerald: "border-ma-emerald/50 text-ma-emerald-soft bg-ma-emerald/10",
    cyan: "border-ma-cyan/50 text-ma-cyan-bright bg-ma-cyan/10",
  };
  return (
    <span
      className={`ma-label inline-flex items-center gap-1 rounded border px-2 py-1 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Small label-over-value data readout. */
export function MaDataReadout({
  label,
  value,
  valueClassName = "text-ma-fg",
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="ma-label mb-1.5 block text-ma-outline">{label}</span>
      <span className={`ma-data text-lg ${valueClassName}`}>{value}</span>
    </div>
  );
}

/** Governing-equation block with accent edge bar. */
export function EquationBlock({
  expression,
  label = "GOVERNING_EQUATION",
  note,
}: {
  expression: string;
  label?: string;
  note?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded border border-ma-line/40 bg-ma-surface-low/70 p-4 pl-5">
      <div className="absolute left-0 top-0 h-full w-1 bg-[var(--ma-accent)] shadow-[0_0_10px_rgba(var(--ma-accent-rgb),0.8)]" />
      <span className="ma-label mb-2 block text-ma-outline">{label}</span>
      <code className="ma-data block text-base tracking-widest text-[var(--ma-accent-soft)] md:text-lg">
        {expression}
      </code>
      {note ? <p className="mt-2 font-mono text-xs text-ma-outline">{note}</p> : null}
    </div>
  );
}
