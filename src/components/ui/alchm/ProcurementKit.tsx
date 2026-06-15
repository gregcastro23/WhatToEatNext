"use client";

import { useState, type JSX } from "react";
import { procureBtnStyle } from "./buttonStyles";
import { Glyph } from "./Glyph";
import { ProcurementMark } from "./ProcurementMark";

export interface ProcurementItem {
  /** Short symbol e.g. "BCK" */
  sym: string;
  /** Display name e.g. "Grass-fed beef cheek, 1.2 kg" */
  n: string;
  /** Supplier label */
  src: string;
  /** Unit price string (no currency symbol) */
  px: string;
  /** Quantity */
  qty: number;
  /** Optional ingredient id for cart handoff */
  ingredientId?: string;
}

export interface ProcurementKitProps {
  items?: ProcurementItem[];
  total?: string;
  currency?: string;
  compact?: boolean;
  onQtyChange?: (sym: string, qty: number) => void;
  onProcure?: (items: ProcurementItem[]) => void;
  ctaLabel?: string;
  primeBadge?: string;
}

const DEFAULT_ITEMS: ProcurementItem[] = [
  { sym: "BCK", n: "Grass-fed beef cheek, 1.2 kg", src: "Whole Earth Mkt.", px: "32.40", qty: 1 },
  { sym: "PMG", n: "Pomegranate molasses, 250 ml", src: "Cortas", px: "9.80", qty: 1 },
  { sym: "SUM", n: "Sumac, fresh-milled, 60 g", src: "Burlap & Barrel", px: "12.50", qty: 1 },
  { sym: "BGL", n: "Aged black garlic, 8 cloves", src: "Black Garlic Co.", px: "14.00", qty: 1 },
  { sym: "BAY", n: "California bay laurel, dried", src: "Sourced Botanical", px: "6.50", qty: 1 },
  { sym: "LBN", n: "Labneh, hand-strained, 200 g", src: "Karoun", px: "9.00", qty: 1 },
];

export function ProcurementKit({
  items,
  total,
  currency = "USD",
  compact = false,
  onQtyChange,
  onProcure,
  ctaLabel = "Procure substances",
  primeBadge = "PRIME · 1 DAY",
}: ProcurementKitProps): JSX.Element {
  const [internal, setInternal] = useState<ProcurementItem[]>(items ?? DEFAULT_ITEMS);
  const list = items ?? internal;

  const updateQty = (sym: string, delta: number) => {
    const next = list.map((it) =>
      it.sym === sym ? { ...it, qty: Math.max(0, it.qty + delta) } : it,
    );
    if (items) {
      onQtyChange?.(sym, (next.find((it) => it.sym === sym)?.qty) ?? 0);
    } else {
      setInternal(next);
    }
  };

  const pricedItems = list.filter((it) => it.px);
  const computedTotal =
    total ??
    (pricedItems.length
      ? pricedItems
          .reduce((sum, it) => sum + parseFloat(it.px || "0") * it.qty, 0)
          .toFixed(2)
      : null);

  const itemCount = list.length.toString().padStart(2, "0");

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid color-mix(in oklch, var(--accent-2), transparent 65%)",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--accent-2), transparent 92%), color-mix(in oklch, var(--accent-2), transparent 96%) 30%, rgba(255,255,255,0.01)), rgba(255,255,255,0.015)",
        boxShadow:
          "0 0 0 1px color-mix(in oklch, var(--accent-2), transparent 80%), 0 30px 80px -40px color-mix(in oklch, var(--accent-2), transparent 60%), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProcurementMark />
          <div>
            <div
              className="t-tag"
              style={{ color: "var(--accent-2)", letterSpacing: "0.18em" }}
            >
              PROCUREMENT KIT · {itemCount} SUBSTANCES
            </div>
            <div
              className="t-display"
              style={{ fontSize: 17, color: "var(--fg)", marginTop: 2 }}
            >
              Procure these elemental substances
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            border: "1px solid var(--line)",
            borderRadius: 6,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.16em" }}
          >
            VIA
          </span>
          <span
            className="t-mono"
            style={{
              fontSize: 11,
              color: "var(--accent-2)",
              letterSpacing: "0.04em",
              fontWeight: 600,
            }}
          >
            AMAZON FRESH
          </span>
        </div>
      </div>

      {!compact && (
        <div style={{ padding: "4px 18px" }}>
          {list.map((it, i) => (
            <div
              key={it.sym}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto",
                alignItems: "center",
                gap: 14,
                padding: "10px 0",
                borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                className="t-mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-mute)",
                  letterSpacing: "0.14em",
                  width: 32,
                }}
              >
                {it.sym}
              </span>
              <div>
                <div style={{ fontSize: 12, color: "var(--fg)" }}>{it.n}</div>
                <div
                  className="t-mono"
                  style={{
                    fontSize: 9,
                    color: "var(--fg-mute)",
                    marginTop: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  SUPPLIER · {it.src || "—"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                <button
                  type="button"
                  aria-label={`Decrease ${it.n}`}
                  onClick={() => updateQty(it.sym, -1)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--fg-mute)",
                    display: "inline-flex",
                  }}
                >
                  <Glyph name="minus" size={10} stroke={1.6} />
                </button>
                <span
                  className="t-num"
                  style={{
                    fontSize: 11,
                    color: "var(--fg)",
                    minWidth: 14,
                    textAlign: "center",
                  }}
                >
                  {it.qty}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${it.n}`}
                  onClick={() => updateQty(it.sym, 1)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--fg-mute)",
                    display: "inline-flex",
                  }}
                >
                  <Glyph name="plus" size={10} stroke={1.6} />
                </button>
              </div>
              <span
                className="t-num"
                style={{
                  fontSize: 12,
                  color: "var(--fg)",
                  minWidth: 50,
                  textAlign: "right",
                }}
              >
                {it.px ? `$${it.px}` : "—"}
              </span>
              <Glyph name="check" size={12} stroke={1.6} style={{ color: "var(--accent-2)" }} />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid var(--line)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div>
          <div className="t-tag" style={{ fontSize: 9 }}>
            KIT TOTAL · {itemCount} ITEMS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span className="t-num" style={{ fontSize: 24, color: "var(--fg)" }}>
              {computedTotal != null ? `$${computedTotal}` : "—"}
            </span>
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
              {currency}
            </span>
            <span
              className="t-mono"
              style={{
                fontSize: 9,
                color: "var(--accent-2)",
                marginLeft: 6,
                padding: "2px 6px",
                border: "1px solid color-mix(in oklch, var(--accent-2), transparent 60%)",
                borderRadius: 4,
                letterSpacing: "0.1em",
              }}
            >
              {primeBadge}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onProcure?.(list)}
          style={procureBtnStyle}
        >
          <span
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {ctaLabel} <Glyph name="arrow" size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProcurementKit;
