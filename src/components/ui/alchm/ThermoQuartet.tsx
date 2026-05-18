import type { JSX } from "react";

export interface ThermoValues {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface ThermoQuartetProps {
  values?: ThermoValues;
  compact?: boolean;
}

const ROWS: Array<{ id: keyof ThermoValues; label: string; sym: string; hint: string }> = [
  { id: "spirit", label: "Spirit", sym: "🜀", hint: "volatile / aroma" },
  { id: "essence", label: "Essence", sym: "🜁", hint: "soluble / flavor" },
  { id: "matter", label: "Matter", sym: "🜃", hint: "fixed / texture" },
  { id: "substance", label: "Substance", sym: "🜄", hint: "structural / yield" },
];

export function ThermoQuartet({
  values = { spirit: 0.62, essence: 0.78, matter: 0.41, substance: 0.55 },
  compact = false,
}: ThermoQuartetProps): JSX.Element {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {ROWS.map((x) => {
        const v = values[x.id] ?? 0;
        return (
          <div
            key={x.id}
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="t-tag" style={{ fontSize: 9 }}>
                {x.label}
              </span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "var(--accent)" }}>
                {x.sym}
              </span>
            </div>
            <div className="t-num" style={{ fontSize: 18, color: "var(--fg)", marginTop: 4 }}>
              {v.toFixed(2)}
              <span style={{ fontSize: 10, color: "var(--fg-mute)", marginLeft: 2 }}>q</span>
            </div>
            <div
              style={{
                position: "relative",
                height: 2,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 999,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.max(0, Math.min(1, v)) * 100}%`,
                  background: "var(--accent)",
                  borderRadius: 999,
                  boxShadow: "0 0 6px var(--accent)",
                }}
              />
            </div>
            {!compact && (
              <div
                style={{ marginTop: 4, fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.06em" }}
              >
                {x.hint}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ThermoQuartet;
