"use client";

import Link from "next/link";
import type { ComputationalSystem } from "@/config/navigation";
import { SYSTEM_DESCRIPTORS as DESCRIPTORS } from "./systems";
import type { JSX } from "react";

/**
 * The persistent "which model am I reading?" indicator.
 *
 * ## Why this exists
 *
 * The two systems in this app produce numbers that LOOK alike — both render as
 * labelled scalars in a panel — and until now they were interleaved on the same
 * routes. The worst case found in the audit: the left rail of the old /lab was
 * titled `THERMODYNAMICS` and rendered Spirit/Essence/Matter/Substance, while a
 * sibling tab on the same route rendered genuine W·m⁻²·K⁻¹, Biot and Fourier
 * numbers. A reader had no way to tell which one was a physical claim.
 *
 * So the badge is not decoration. It is the thing that makes a number
 * interpretable, and it states the epistemic status directly rather than
 * relying on a colour the reader has to learn.
 *
 * ## Why the copy is blunt
 *
 * "Not a physical claim" is deliberate. A softer phrasing ("symbolic",
 * "alternative model") reads as a hedge, and a hedge next to a number that
 * looks like physics is exactly how the two get conflated again.
 *
 * @file src/components/lab/SystemBadge.tsx
 */

export { SYSTEM_DESCRIPTORS } from "./systems";
export type { SystemDescriptor } from "./systems";

export interface SystemBadgeProps {
  system: ComputationalSystem;
  /** `chip` for inline use in a header; `banner` for the top of a page. */
  variant?: "chip" | "banner";
  /** Where the OTHER model's view of the same subject lives, if it has one. */
  counterpartHref?: string;
  counterpartLabel?: string;
}

export function SystemBadge({
  system,
  variant = "chip",
  counterpartHref,
  counterpartLabel,
}: SystemBadgeProps): JSX.Element {
  const d = DESCRIPTORS[system];

  if (variant === "chip") {
    return (
      <span
        data-system={system}
        className={`inline-flex items-center gap-1.5 rounded-full border ${d.border} ${d.bg} px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${d.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${d.dot}`} aria-hidden="true" />
        {d.label}
      </span>
    );
  }

  return (
    <div
      data-system={system}
      role="note"
      className={`flex flex-col gap-3 rounded-xl border ${d.border} ${d.bg} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${d.dot}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase tracking-wider ${d.text}`}>
            {d.label}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-white/70">{d.claim}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/40">{d.verify}</p>
        </div>
      </div>

      {counterpartHref ? (
        <Link
          href={counterpartHref}
          className="shrink-0 self-start rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:text-white sm:self-center"
        >
          {counterpartLabel ?? "See the other model"} →
        </Link>
      ) : null}
    </div>
  );
}
