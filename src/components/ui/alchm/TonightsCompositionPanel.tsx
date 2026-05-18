"use client";

import Link from "next/link";
import { AgentImage } from "./AgentImage";
import { Glyph } from "./Glyph";
import { ProcurementMark } from "./ProcurementMark";
import type { JSX } from "react";

export interface TonightsCompositionData {
  title: string;
  elementTags: Array<{ label: string; element?: "fire" | "water" | "earth" | "air" }>;
  metaTags: string[];
  /** Optional generated hero image URL */
  imageSrc?: string;
  recipeHref: string;
  procurementSummary: string;
  onProcure?: () => void;
}

export interface TonightsCompositionPanelProps {
  data: TonightsCompositionData;
}

export function TonightsCompositionPanel({ data }: TonightsCompositionPanelProps): JSX.Element {
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 12 }}>
        TONIGHT&apos;S COMPOSITION
      </div>
      <div
        style={{
          position: "relative",
          padding: 14,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--line)",
          borderRadius: 10,
        }}
      >
        <AgentImage label="AGENT · COMPOSITION" src={data.imageSrc} style={{ marginBottom: 12 }} />
        <div
          className="t-display"
          style={{ fontSize: 19, lineHeight: 1.1, color: "var(--fg)", marginBottom: 4 }}
        >
          {data.title}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {data.elementTags.map((tag, i) => (
            <span
              key={`${tag.label}-${i}`}
              className="alchm-chip"
              style={
                tag.element
                  ? {
                      borderColor: `color-mix(in oklch, var(--el-${tag.element}), transparent 50%)`,
                    }
                  : undefined
              }
            >
              {tag.element ? <span className={`el-dot el-${tag.element}`} /> : null}
              {tag.label}
            </span>
          ))}
          {data.metaTags.map((m) => (
            <span key={m} className="alchm-chip">
              {m}
            </span>
          ))}
        </div>
        <Link
          href={data.recipeHref}
          className="alchm-btn"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "10px 14px",
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 60%), color-mix(in oklch, var(--accent), transparent 80%))",
            borderColor: "color-mix(in oklch, var(--accent), transparent 40%)",
            textDecoration: "none",
          }}
        >
          Open Recipe <Glyph name="arrow" size={14} />
        </Link>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            className="t-mono"
            style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.12em" }}
          >
            {data.procurementSummary}
          </div>
          <button
            type="button"
            onClick={data.onProcure}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "color-mix(in oklch, var(--accent-2), transparent 85%)",
              border: "1px solid color-mix(in oklch, var(--accent-2), transparent 55%)",
              borderRadius: 6,
              color: "var(--accent-2)",
              fontFamily: "var(--f-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ProcurementMark size={12} /> PROCURE
          </button>
        </div>
      </div>
    </div>
  );
}

export default TonightsCompositionPanel;
