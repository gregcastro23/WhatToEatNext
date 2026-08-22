import type { ComputationalSystem } from "@/config/navigation";

/**
 * Presentation facts about the two computational systems.
 *
 * ⚠️ Deliberately NOT in SystemBadge.tsx, which is a `"use client"` module.
 * Next.js replaces a client module's exports with client-reference proxies when
 * a SERVER component imports them, so a plain constant read from the server
 * comes back `undefined` — and the failure is a render-time
 * `Cannot read properties of undefined`, invisible to `tsc` because the types
 * are perfectly valid on both sides. This file carries no directive, so it is
 * genuinely shared by both runtimes.
 *
 * @file src/components/lab/systems.ts
 */

export interface SystemDescriptor {
  label: string;
  /** One line, shown in the banner. States what the numbers are. */
  claim: string;
  /** What a reader can do to check a number. */
  verify: string;
  dot: string;
  text: string;
  border: string;
  bg: string;
}

/**
 * Tailwind classes are written out in full rather than composed from a
 * template, because Tailwind's scanner only sees literal class strings — an
 * interpolated `border-${x}-500/30` is silently dropped from the build.
 */
export const SYSTEM_DESCRIPTORS: Record<ComputationalSystem, SystemDescriptor> = {
  real: {
    label: "Real physics",
    claim:
      "SI units. Every value traces to a cited correlation or a measured record.",
    verify: "Each figure names its basis — a table, a correlation, or an FDC id.",
    dot: "bg-emerald-400",
    text: "text-emerald-200",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
  },
  alchm: {
    label: "Alchm model",
    claim:
      "The alchm system (ESMS, kalchm, monica). Internally consistent — not a physical claim.",
    verify:
      "These quantities are defined by this project, not measured against nature.",
    dot: "bg-violet-400",
    text: "text-violet-200",
    border: "border-violet-400/30",
    bg: "bg-violet-400/10",
  },
};
