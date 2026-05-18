import type { JSX } from "react";

export interface PipelineService {
  name: string;
  /** Latency string e.g. "0.42ms" */
  latency: string;
  /** Health state: true = up, false = degraded/down */
  up: boolean;
  /** Whether to tag with ·AG (agentic) */
  agent?: boolean;
}

export interface PipelinePanelProps {
  services: PipelineService[];
  title?: string;
}

export function PipelinePanel({
  services,
  title = "SERVICE TELEMETRY",
}: PipelinePanelProps): JSX.Element {
  return (
    <div>
      <div className="t-tag" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {services.map((s) => {
          const dot = s.up ? "var(--el-earth)" : "var(--el-fire)";
          return (
            <div
              key={s.name}
              style={{
                display: "grid",
                gridTemplateColumns: "8px 1fr auto",
                gap: 10,
                alignItems: "center",
                padding: "7px 10px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--line)",
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: dot,
                  boxShadow: `0 0 6px ${dot}`,
                }}
              />
              <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>
                {s.name}
                {s.agent && <span style={{ color: "var(--accent)", marginLeft: 6 }}>·AG</span>}
              </span>
              <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                {s.latency}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelinePanel;
