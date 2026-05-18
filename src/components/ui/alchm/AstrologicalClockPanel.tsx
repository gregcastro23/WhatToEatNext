import type { JSX } from "react";

export interface AstrologicalClockRow {
  planet: string;
  sym: string;
  /** Longitude/sign string e.g. "07°34′ Scorpio" */
  position: string;
  /** Detail line e.g. "current hour", "retrograde" */
  detail: string;
  /** Whether this row is the active hour ruler */
  active?: boolean;
}

export interface AstrologicalClockPanelProps {
  rows: AstrologicalClockRow[];
  live?: boolean;
}

export function AstrologicalClockPanel({
  rows,
  live = true,
}: AstrologicalClockPanelProps): JSX.Element {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <span className="t-tag">ASTROLOGICAL CLOCK</span>
        {live && (
          <span
            className="t-mono"
            style={{
              fontSize: 9,
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              data-motion
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "alchm-blink 1.4s ease-in-out infinite",
              }}
            />{" "}
            LIVE
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((row) => (
          <div
            key={row.planet}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "8px 10px",
              background: row.active
                ? "color-mix(in oklch, var(--accent), transparent 88%)"
                : "transparent",
              border: row.active
                ? "1px solid color-mix(in oklch, var(--accent), transparent 60%)"
                : "1px solid transparent",
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 13,
                color: row.active ? "var(--accent)" : "var(--fg-dim)",
              }}
            >
              {row.sym}
            </span>
            <div>
              <div className="t-mono" style={{ fontSize: 11, color: "var(--fg)" }}>
                {row.position}
              </div>
              <div
                className="t-mono"
                style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.08em" }}
              >
                {row.detail}
              </div>
            </div>
            <span
              className="t-mono"
              style={{
                fontSize: 9,
                color: row.active ? "var(--accent)" : "var(--fg-faint)",
              }}
            >
              {row.active ? "★" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AstrologicalClockPanel;
