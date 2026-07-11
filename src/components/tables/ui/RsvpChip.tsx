import { LabelXS } from "./LabelXS";
import type { JSX } from "react";

export type RsvpStatus = "joined" | "invited" | "declined";

export interface RsvpChipProps {
  status: RsvpStatus;
  className?: string;
}

const STATUS_STYLES: Record<RsvpStatus, string> = {
  joined: "text-green-300 border-green-400/30 bg-green-400/10",
  invited: "text-alchm-copper-bright border-alchm-copper-bright/40 bg-alchm-copper-bright/10",
  declined: "text-alchm-fg-mute border-white/10 bg-white/5",
};

/** RSVP state pill in LabelXS (tables-design-spec.md §2.14). */
export function RsvpChip({ status, className = "" }: RsvpChipProps): JSX.Element {
  return (
    <LabelXS
      className={`inline-flex items-center rounded-full border px-2.5 py-1 ${STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </LabelXS>
  );
}

export default RsvpChip;
