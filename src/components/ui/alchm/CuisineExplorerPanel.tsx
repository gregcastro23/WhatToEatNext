import { Glyph } from "./Glyph";
import type { JSX } from "react";

export interface CuisineSignatureRow {
  id: string;
  name: string;
  /** Short locale code e.g. "MED·IT" */
  region: string;
  /** 0-1 match score against current sky */
  match: number;
  /** Four-element signature, each 0-1 */
  sig: [number, number, number, number];
  /** CSS color or var */
  color?: string;
}

export interface CuisineExplorerPanelProps {
  cuisines: CuisineSignatureRow[];
  totalEntries?: number;
  onSelect?: (id: string) => void;
}

const DEFAULT_COLOR = "var(--accent)";

export function CuisineExplorerPanel({
  cuisines,
  totalEntries,
  onSelect,
}: CuisineExplorerPanelProps): JSX.Element {
  const total = totalEntries ?? cuisines.length;
  return (
    <div className="alchm-panel" style={{ padding: "18px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div>
          <div className="t-tag">CUISINE EXPLORER · TIER III</div>
          <h3 className="t-display" style={{ fontSize: 20, margin: "4px 0 0", color: "var(--fg)" }}>
            Aggregated signatures
          </h3>
        </div>
        <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
          {total.toString().padStart(3, "0")} ENTRIES
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {cuisines.map((c, i) => {
          const color = c.color ?? DEFAULT_COLOR;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              style={{
                all: "unset",
                cursor: onSelect ? "pointer" : "default",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto",
                alignItems: "center",
                gap: 14,
                padding: "10px 14px",
                borderBottom: i < cuisines.length - 1 ? "1px solid var(--line)" : "none",
                fontSize: 13,
              }}
            >
              <div
                className="t-mono"
                style={{ fontSize: 10, color: "var(--fg-mute)", width: 20 }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="t-display" style={{ fontSize: 17, color: "var(--fg)" }}>
                  {c.name}
                </div>
                <div
                  className="t-mono"
                  style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
                >
                  {c.region}
                </div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {c.sig.map((v, j) => (
                  <div
                    key={j}
                    style={{
                      width: 4,
                      height: 22,
                      background: `linear-gradient(to top, ${color} ${v * 100}%, rgba(255,255,255,0.06) ${v * 100}%)`,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
              <div
                className="t-num"
                style={{ fontSize: 16, color: "var(--fg)", minWidth: 50, textAlign: "right" }}
              >
                {(c.match * 100).toFixed(0)}
                <span style={{ fontSize: 10, color: "var(--fg-mute)" }}>%</span>
              </div>
              <Glyph name="chevron" size={14} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CuisineExplorerPanel;
