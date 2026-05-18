import type { CSSProperties } from "react";

export const procureBtnStyle: CSSProperties = {
  position: "relative",
  padding: "12px 20px",
  background:
    "linear-gradient(180deg, color-mix(in oklch, var(--accent-2), transparent 30%), color-mix(in oklch, var(--accent-2), transparent 55%))",
  border: "1px solid color-mix(in oklch, var(--accent-2), transparent 30%)",
  borderRadius: 8,
  color: "#1B1308",
  fontFamily: "var(--f-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow:
    "0 0 0 1px color-mix(in oklch, var(--accent-2), transparent 70%), 0 14px 40px -8px color-mix(in oklch, var(--accent-2), transparent 50%), inset 0 1px 0 rgba(255,255,255,0.18)",
};

export const premiumBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 18px",
  background:
    "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 35%), color-mix(in oklch, var(--accent), transparent 65%))",
  border: "1px solid color-mix(in oklch, var(--accent), transparent 30%)",
  borderRadius: 8,
  color: "var(--fg)",
  fontFamily: "var(--f-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow:
    "0 0 0 1px color-mix(in oklch, var(--accent), transparent 60%), 0 14px 40px -8px color-mix(in oklch, var(--accent), transparent 40%), inset 0 1px 0 rgba(255,255,255,0.1)",
};
