/* commerce.jsx — Amazon Procurement Kit + Premium Gate */

// ============================================================
// AMAZON PROCUREMENT — multi-item cart kit, "Procure these Elemental Substances"
// ============================================================
function ProcurementKit({ items, total = "84.20", currency = "USD", compact = false }) {
  const list = items || [
    { sym: "BCK", n: "Grass-fed beef cheek, 1.2 kg",  src: "Whole Earth Mkt.", px: "32.40", qty: 1 },
    { sym: "PMG", n: "Pomegranate molasses, 250 ml",  src: "Cortas",            px: "9.80",  qty: 1 },
    { sym: "SUM", n: "Sumac, fresh-milled, 60 g",     src: "Burlap & Barrel",   px: "12.50", qty: 1 },
    { sym: "BGL", n: "Aged black garlic, 8 cloves",   src: "Black Garlic Co.",  px: "14.00", qty: 1 },
    { sym: "BAY", n: "California bay laurel, dried",  src: "Sourced Botanical", px: "6.50",  qty: 1 },
    { sym: "LBN", n: "Labneh, hand-strained, 200 g",  src: "Karoun",            px: "9.00",  qty: 1 },
  ];

  return (
    <div style={{
      position: "relative",
      border: "1px solid color-mix(in oklch, var(--accent-2), transparent 65%)",
      borderRadius: 12,
      background: `
        linear-gradient(180deg, color-mix(in oklch, var(--accent-2), transparent 92%), color-mix(in oklch, var(--accent-2), transparent 96%) 30%, rgba(255,255,255,0.01)),
        rgba(255,255,255,0.015)
      `,
      boxShadow: `
        0 0 0 1px color-mix(in oklch, var(--accent-2), transparent 80%),
        0 30px 80px -40px color-mix(in oklch, var(--accent-2), transparent 60%),
        inset 0 1px 0 rgba(255,255,255,0.04)
      `,
      overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(255,255,255,0.015)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProcurementMark />
          <div>
            <div className="t-tag" style={{ color: "var(--accent-2)", letterSpacing: "0.18em" }}>PROCUREMENT KIT · 06 SUBSTANCES</div>
            <div className="t-display" style={{ fontSize: 17, color: "var(--fg)", marginTop: 2 }}>Procure these elemental substances</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.16em" }}>VIA</span>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--accent-2)", letterSpacing: "0.04em", fontWeight: 600 }}>AMAZON FRESH</span>
        </div>
      </div>

      {/* items */}
      {!compact && (
        <div style={{ padding: "4px 18px" }}>
          {list.map((it, i) => (
            <div key={it.sym} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto",
              alignItems: "center", gap: 14,
              padding: "10px 0",
              borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.14em", width: 32 }}>{it.sym}</span>
              <div>
                <div style={{ fontSize: 12, color: "var(--fg)" }}>{it.n}</div>
                <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2, letterSpacing: "0.08em" }}>SUPPLIER · {it.src}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--line)", borderRadius: 6, padding: "2px 6px" }}>
                <Glyph name="minus" size={10} stroke={1.6} style={{ color: "var(--fg-mute)" }} />
                <span className="t-num" style={{ fontSize: 11, color: "var(--fg)", minWidth: 14, textAlign: "center" }}>{it.qty}</span>
                <Glyph name="plus" size={10} stroke={1.6} style={{ color: "var(--fg-mute)" }} />
              </div>
              <span className="t-num" style={{ fontSize: 12, color: "var(--fg)", minWidth: 50, textAlign: "right" }}>${it.px}</span>
              <Glyph name="check" size={12} stroke={1.6} style={{ color: "var(--accent-2)" }} />
            </div>
          ))}
        </div>
      )}

      {/* footer */}
      <div style={{
        padding: "14px 18px",
        borderTop: "1px solid var(--line)",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center",
      }}>
        <div>
          <div className="t-tag" style={{ fontSize: 9 }}>KIT TOTAL · 06 ITEMS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span className="t-num" style={{ fontSize: 24, color: "var(--fg)" }}>${total}</span>
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>{currency}</span>
            <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)", marginLeft: 6, padding: "2px 6px", border: "1px solid color-mix(in oklch, var(--accent-2), transparent 60%)", borderRadius: 4, letterSpacing: "0.1em" }}>PRIME · 1 DAY</span>
          </div>
        </div>
        <button style={procureBtnStyle}>
          <span style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10 }}>
            Procure substances <Glyph name="arrow" size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}

const procureBtnStyle = {
  position: "relative",
  padding: "12px 20px",
  background: `linear-gradient(180deg, color-mix(in oklch, var(--accent-2), transparent 30%), color-mix(in oklch, var(--accent-2), transparent 55%))`,
  border: "1px solid color-mix(in oklch, var(--accent-2), transparent 30%)",
  borderRadius: 8,
  color: "#1B1308",
  fontFamily: "var(--f-mono)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: `
    0 0 0 1px color-mix(in oklch, var(--accent-2), transparent 70%),
    0 14px 40px -8px color-mix(in oklch, var(--accent-2), transparent 50%),
    inset 0 1px 0 rgba(255,255,255,0.18)
  `,
};

function ProcurementMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--accent-2)" strokeWidth="0.8" />
      <path d="M5 14h14M8 10l4-4 4 4M12 6v10" stroke="var(--accent-2)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="var(--accent-2)" />
    </svg>
  );
}

// COMPACT INLINE CTA — for ingredient row use
function ProcureChip({ price = "9.80", supplier = "Cortas" }) {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "5px 10px 5px 8px",
      background: "color-mix(in oklch, var(--accent-2), transparent 88%)",
      border: "1px solid color-mix(in oklch, var(--accent-2), transparent 60%)",
      borderRadius: 999,
      color: "var(--accent-2)",
      fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.1em",
      cursor: "pointer",
    }}>
      <ProcurementMark size={14} />
      <span style={{ fontWeight: 600 }}>${price}</span>
      <span style={{ color: "var(--fg-mute)" }}>· {supplier}</span>
    </button>
  );
}

// ============================================================
// PREMIUM GATE — information gap with signature glow
// ============================================================
function PremiumGlow({ children, label = "ALCHEMIST PREMIUM", revealAmount = 0.35, height }) {
  return (
    <div style={{ position: "relative", height, overflow: "hidden", borderRadius: 12, border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)" }}>
      <div style={{ filter: `blur(${(1 - revealAmount) * 6}px)`, opacity: revealAmount + 0.35, pointerEvents: "none" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, transparent ${revealAmount * 100}%, color-mix(in oklch, var(--accent), transparent 78%) ${revealAmount * 100 + 5}%, color-mix(in oklch, var(--accent), transparent 70%) 70%, color-mix(in oklch, var(--bg), transparent 0%))`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "22px 22px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14,
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "color-mix(in oklch, var(--accent), transparent 80%)", border: "1px solid color-mix(in oklch, var(--accent), transparent 50%)", borderRadius: 999, marginBottom: 10 }}>
            <PremiumMark size={12} />
            <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.18em", fontWeight: 600 }}>{label}</span>
          </div>
          <div className="t-display" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1.1, maxWidth: 360 }}>
            Unlock the deep alchemy beneath this ingredient.
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 6, lineHeight: 1.55, maxWidth: 360 }}>
            Full sensory map, every recipe lineage, agent-tuned substitutions, and Spirit×Essence×Matter forecasting.
          </div>
        </div>
        <button style={premiumBtnStyle}>
          Become an Alchemist <Glyph name="arrow" size={14} />
        </button>
      </div>
    </div>
  );
}

const premiumBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 10,
  padding: "12px 18px",
  background: "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 35%), color-mix(in oklch, var(--accent), transparent 65%))",
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
  boxShadow: `
    0 0 0 1px color-mix(in oklch, var(--accent), transparent 60%),
    0 14px 40px -8px color-mix(in oklch, var(--accent), transparent 40%),
    inset 0 1px 0 rgba(255,255,255,0.1)
  `,
};

function PremiumMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 6L15 7L11.5 10.5L12.5 15.5L8 13L3.5 15.5L4.5 10.5L1 7L6 6Z" fill="var(--accent)" opacity="0.2" />
      <circle cx="8" cy="8" r="2" fill="var(--accent)" />
      <circle cx="8" cy="8" r="6" stroke="var(--accent)" strokeWidth="0.8" />
    </svg>
  );
}

// PREMIUM BADGE — small inline marker
function PremiumLockBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 7px",
      background: "color-mix(in oklch, var(--accent), transparent 82%)",
      border: "1px solid color-mix(in oklch, var(--accent), transparent 55%)",
      borderRadius: 999,
      fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)", letterSpacing: "0.14em", fontWeight: 600,
    }}>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="1.5" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="0.8"/><path d="M3 4V3a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="0.8" fill="none"/></svg>
      PREMIUM
    </span>
  );
}

Object.assign(window, { ProcurementKit, ProcureChip, ProcurementMark, PremiumGlow, PremiumMark, PremiumLockBadge, premiumBtnStyle, procureBtnStyle });
