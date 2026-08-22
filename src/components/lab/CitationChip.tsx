import type { JSX } from "react";

/**
 * A source, rendered so it can be checked.
 *
 * The repo standard is that every value names its BASIS and reproduces from it.
 * A citation the reader cannot act on — "literature", "standard tables" — meets
 * the letter of that and not the point, so this component requires the specific
 * locator (an edition and table, a handbook chapter, an FDC id) as a separate
 * field from the work's name. There is no prop for an unsourced value: a datum
 * with no basis should render as a stated gap, not as a vague chip.
 *
 * @file src/components/lab/CitationChip.tsx
 */

export interface CitationChipProps {
  /** The work, e.g. "Incropera & DeWitt". */
  work: string;
  /** The specific locator, e.g. "Table A.6" or "FDC 170917". */
  locator: string;
  /** Optional retrieval date for a database record. */
  retrieved?: string;
}

export function CitationChip({
  work,
  locator,
  retrieved,
}: CitationChipProps): JSX.Element {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] leading-normal text-white/50">
      <span className="text-white/70">{work}</span>
      <span className="text-white/35">·</span>
      <span>{locator}</span>
      {retrieved ? (
        <>
          <span className="text-white/35">·</span>
          <span className="text-white/35">{retrieved}</span>
        </>
      ) : null}
    </span>
  );
}

/**
 * A value that is missing, with the reason stated.
 *
 * Renders an em dash — never 0, never "N/A", never a placeholder number. The
 * kernels under src/lib/cooking throw outside their validity envelopes
 * specifically so a caller cannot quietly substitute a plausible number, and
 * this is the visual end of that contract.
 */
export function Refused({ reason }: { reason: string }): JSX.Element {
  return (
    <span
      title={reason}
      className="cursor-help font-mono text-white/30 underline decoration-dotted decoration-white/20 underline-offset-4"
    >
      —
    </span>
  );
}
