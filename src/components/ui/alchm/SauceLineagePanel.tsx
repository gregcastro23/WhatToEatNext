import { Glyph } from "./Glyph";
import type { JSX } from "react";

export interface SauceLineageNode {
  x: number;
  y: number;
  r: number;
  label: string;
  /** Highlight color (root nodes) */
  color?: string;
}

export interface SauceLineageEdge {
  d: string;
}

export interface SauceLineagePanelProps {
  rootName: string;
  nodes: SauceLineageNode[];
  edges: SauceLineageEdge[];
  stats?: Array<{ label: string; value: string | number }>;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

export function SauceLineagePanel({
  rootName,
  nodes,
  edges,
  stats = [],
  viewBoxWidth = 320,
  viewBoxHeight = 200,
}: SauceLineagePanelProps): JSX.Element {
  return (
    <div className="alchm-panel" style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div>
          <div className="t-tag">SAUCE LINEAGE TREE</div>
          <h3 className="t-display" style={{ fontSize: 20, margin: "4px 0 0", color: "var(--fg)" }}>
            {rootName} · derivations
          </h3>
        </div>
        <Glyph name="orbital" size={20} style={{ color: "var(--accent)" }} />
      </div>

      <div style={{ position: "relative", height: viewBoxHeight }}>
        <svg width="100%" height={viewBoxHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
          <g stroke="var(--line-hi)" strokeWidth="0.8" fill="none">
            {edges.map((e, i) => (
              <path key={i} d={e.d} />
            ))}
          </g>
          {nodes.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="var(--bg)"
                stroke={n.color ?? "var(--line-hi)"}
                strokeWidth="1"
              />
              {n.color && <circle cx={n.x} cy={n.y} r={n.r - 2} fill={n.color} opacity="0.5" />}
              <text
                x={n.x + n.r + 6}
                y={n.y + 3}
                fill="var(--fg-dim)"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {stats.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 10,
            marginTop: 8,
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="t-tag" style={{ fontSize: 8 }}>
                {s.label}
              </div>
              <div className="t-num" style={{ fontSize: 16, color: "var(--fg)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SauceLineagePanel;
