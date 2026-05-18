import { ProcurementMark } from "./ProcurementMark";
import type { JSX } from "react";

export interface ProcureChipProps {
  price?: string;
  supplier?: string;
  onClick?: () => void;
}

export function ProcureChip({
  price = "9.80",
  supplier = "Cortas",
  onClick,
}: ProcureChipProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px 5px 8px",
        background: "color-mix(in oklch, var(--accent-2), transparent 88%)",
        border: "1px solid color-mix(in oklch, var(--accent-2), transparent 60%)",
        borderRadius: 999,
        color: "var(--accent-2)",
        fontFamily: "var(--f-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        cursor: "pointer",
      }}
    >
      <ProcurementMark size={14} />
      <span style={{ fontWeight: 600 }}>${price}</span>
      <span style={{ color: "var(--fg-mute)" }}>· {supplier}</span>
    </button>
  );
}

export default ProcureChip;
