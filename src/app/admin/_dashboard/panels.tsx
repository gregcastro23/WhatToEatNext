"use client";

import React from "react";
import type {
  AuditEventsData,
  CatalogTrendingData,
  RecentAlertsData,
  SecuritySummaryData,
} from "@/services/dashboardPanelsService";
import type { ActivityEvent } from "@/services/liveActivityService";
import type { SystemStatusPayload } from "@/services/systemStatusService";
import { ElementalMeter, Glyph } from "./atoms";
import { Card, Legend, MiniStat } from "./hero";

// ============================================================
// SERVICE MATRIX — wired to systemStatusService (8 flows + 3 deps)
// ============================================================
const STATUS_COLOR: Record<string, string> = {
  OK: "var(--el-earth)",
  DEGRADED: "var(--el-fire)",
  INCIDENT: "#FF5252",
  UNKNOWN: "var(--fg-mute)",
};

export function ServiceMatrix({ systemStatus }: { systemStatus: SystemStatusPayload }) {
  const items: Array<{
    id: string;
    name: string;
    tier: "Flow" | "Dep";
    status: string;
    summary: string;
    metrics?: Array<{ label: string; value: string }>;
  }> = [
    ...systemStatus.flows.map((f) => ({
      id: f.id,
      name: f.label,
      tier: "Flow" as const,
      status: f.status,
      summary: f.summary,
      metrics: f.metrics?.slice(0, 2),
    })),
    ...systemStatus.dependencies.map((d) => ({
      id: d.id,
      name: d.label,
      tier: "Dep" as const,
      status: d.status,
      summary: d.summary,
      metrics: typeof d.latencyMs === "number"
        ? [{ label: "ping", value: `${Math.round(d.latencyMs)}ms` }]
        : undefined,
    })),
  ];
  const warnCount = items.filter((i) => i.status === "DEGRADED").length;
  const incidentCount = items.filter((i) => i.status === "INCIDENT").length;

  return (
    <Card
      title="Service Matrix"
      subtitle={`${items.length} components · ${incidentCount} incident${incidentCount === 1 ? "" : "s"} · ${warnCount} degraded`}
      right={
        <div style={{ display: "flex", gap: 8 }}>
          <Legend color="var(--el-earth)" label="OK" />
          <Legend color="var(--el-fire)" label="DEGRADED" />
          <Legend color="#FF5252" label="INCIDENT" />
        </div>
      }
    >
      {items.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center" }}>
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            system status unavailable
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 0.5fr 0.7fr 2fr 1fr",
            rowGap: 0,
            fontSize: 11.5,
          }}
        >
          <SvcHeader label="Component" />
          <SvcHeader label="Kind" />
          <SvcHeader label="State" />
          <SvcHeader label="Summary" />
          <SvcHeader label="Metrics" />
          {items.map((it) => {
            const color = STATUS_COLOR[it.status] ?? "var(--fg-mute)";
            return (
              <React.Fragment key={it.id}>
                <SvcCell>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="el-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ color: "var(--fg)" }}>{it.name}</span>
                  </div>
                </SvcCell>
                <SvcCell>
                  <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>{it.tier}</span>
                </SvcCell>
                <SvcCell>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 9,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: `color-mix(in oklch, ${color}, transparent 78%)`,
                      color,
                      border: `1px solid color-mix(in oklch, ${color}, transparent 55%)`,
                    }}
                  >
                    {it.status}
                  </span>
                </SvcCell>
                <SvcCell>
                  <span style={{ color: "var(--fg-dim)", fontSize: 10.5 }}>{it.summary}</span>
                </SvcCell>
                <SvcCell>
                  {it.metrics && it.metrics.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {it.metrics.map((m) => (
                        <span
                          key={m.label}
                          className="t-mono"
                          style={{ fontSize: 9.5, color: "var(--fg-mute)" }}
                        >
                          {m.label}:&nbsp;
                          <span style={{ color: "var(--fg-dim)" }}>{m.value}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-faint)" }}>—</span>
                  )}
                </SvcCell>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function SvcHeader({ label, right }: { label: string; right?: boolean }) {
  return (
    <div
      className="t-tag"
      style={{
        fontSize: 8.5,
        padding: "8px 8px",
        borderBottom: "1px solid var(--line-hi)",
        textAlign: right ? "right" : "left",
      }}
    >
      {label}
    </div>
  );
}

function SvcCell({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <div
      style={{
        padding: "9px 8px",
        borderBottom: "1px solid var(--line)",
        textAlign: right ? "right" : "left",
        fontFamily: "var(--f-mono)",
        fontSize: 11,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// LIVE EVENT STREAM — wired to liveActivityService
// ============================================================
const CATEGORY_COLOR: Record<string, string> = {
  signup: "var(--el-earth)",
  auth: "var(--accent-2)",
  onboarding: "var(--el-water)",
  recipe: "var(--accent)",
  economy: "var(--el-fire)",
  agent: "var(--el-air)",
  diary: "var(--fg-dim)",
};

const STATUS_TINT: Record<string, string> = {
  success: "var(--el-earth)",
  failure: "#FF5252",
  info: "var(--fg-dim)",
};

export function LiveEventStream({
  liveActivity,
}: {
  liveActivity: { entries: ActivityEvent[]; live: boolean };
}) {
  const events = liveActivity.entries;
  return (
    <Card
      title="Live Event Stream"
      subtitle={`${events.length} events · 6h window${liveActivity.live ? "" : " · degraded"}`}
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: liveActivity.live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {liveActivity.live ? "● LIVE" : "○ STALE"}
        </span>
      }
      padded={false}
      style={{ height: 480 }}
    >
      <div style={{ height: "100%", overflow: "auto", padding: "4px 0" }}>
        {events.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center" }}>
            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
              no activity in the last 6h
            </span>
          </div>
        ) : (
          events.map((e, i) => {
            const dot = STATUS_TINT[e.status] ?? CATEGORY_COLOR[e.category] ?? "var(--fg-mute)";
            const cat = CATEGORY_COLOR[e.category] ?? "var(--accent)";
            const time = new Date(e.at).toISOString().slice(11, 19);
            return (
              <div
                key={`${e.category}-${e.id}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "62px 8px 88px 1fr",
                  gap: 8,
                  alignItems: "baseline",
                  padding: "6px 14px",
                  fontFamily: "var(--f-mono)",
                  fontSize: 10.5,
                  borderBottom:
                    i === events.length - 1
                      ? "none"
                      : "1px solid color-mix(in oklch, var(--line), transparent 30%)",
                  color: "var(--fg-dim)",
                }}
              >
                <span style={{ color: "var(--fg-mute)", fontSize: 9.5 }}>{time}</span>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: dot,
                    boxShadow: `0 0 6px ${dot}`,
                  }}
                />
                <span style={{ color: cat, fontSize: 9.5, letterSpacing: "0.08em" }}>
                  {e.category}.{e.type}
                </span>
                <span style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <span style={{ color: "var(--fg)", whiteSpace: "nowrap" }}>
                    {e.actor?.name || e.actor?.email || "system"}
                  </span>
                  <span style={{ color: "var(--fg-mute)" }}>·</span>
                  <span
                    style={{
                      color: "var(--fg-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.description}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// ============================================================
// INCIDENTS — wired to alert_events (from alertService dispatch)
// ============================================================
const SEVERITY_COLOR: Record<string, string> = {
  error: "#FF5252",
  warn: "var(--el-fire)",
  info: "var(--el-water)",
};

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function IncidentsPanel({
  recentAlerts,
}: {
  recentAlerts: RecentAlertsData;
}) {
  const alerts = recentAlerts.entries;
  const errorCount = alerts.filter((a) => a.severity === "error").length;
  const warnCount = alerts.filter((a) => a.severity === "warn").length;
  const subtitle =
    alerts.length === 0
      ? recentAlerts.live
        ? "no alerts in window"
        : "alert source offline"
      : `${errorCount} error · ${warnCount} warn`;

  return (
    <Card
      title="Recent Alerts"
      subtitle={subtitle}
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: recentAlerts.live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {recentAlerts.live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      {alerts.length === 0 ? (
        <div style={{ padding: "16px 0", textAlign: "center" }}>
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            {recentAlerts.live ? "system is quiet" : "could not reach alert_events"}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((alert) => {
            const sevColor = SEVERITY_COLOR[alert.severity] ?? "var(--fg-mute)";
            return (
              <div
                key={alert.id}
                style={{
                  border: `1px solid color-mix(in oklch, ${sevColor}, transparent 60%)`,
                  background: `linear-gradient(180deg, color-mix(in oklch, ${sevColor}, transparent 92%), transparent)`,
                  borderRadius: 10,
                  padding: 10,
                  opacity: alert.suppressed ? 0.55 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 9,
                      padding: "2px 8px",
                      borderRadius: 999,
                      color: sevColor,
                      border: `1px solid ${sevColor}`,
                      background: "rgba(0,0,0,0.3)",
                      letterSpacing: "0.16em",
                    }}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                    #{alert.id}
                  </span>
                  {alert.suppressed && (
                    <span
                      className="t-mono"
                      style={{
                        fontSize: 9,
                        color: "var(--fg-mute)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      SUPPRESSED
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--f-mono)",
                      fontSize: 9.5,
                      color: "var(--fg-mute)",
                    }}
                  >
                    {formatRelative(alert.triggeredAt)}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg)", marginBottom: 4 }}>{alert.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 9.5,
                      color: "var(--fg-mute)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {alert.previousStatus} → {alert.currentStatus} · {alert.component}
                  </span>
                </div>
                {alert.message && alert.message !== alert.title && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10.5,
                      color: "var(--fg-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {alert.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// ELEMENTAL TRAFFIC
// ============================================================
export function ElementalTraffic({ cohorts }: { cohorts?: any }) {
  const breakdownData = cohorts?.elementalBreakdown || [];
  
  let fireCount = 0;
  let earthCount = 0;
  let waterCount = 0;
  let airCount = 0;
  let total = 0;

  for (const item of breakdownData) {
    const count = item.count;
    total += count;
    const el = item.element.toLowerCase();
    if (el === "fire") fireCount += count;
    else if (el === "earth") earthCount += count;
    else if (el === "water") waterCount += count;
    else if (el === "air") airCount += count;
  }

  const hasData = total > 0;
  // Only badge as live when the service actually fetched (every other panel
  // gates on `live`). Prevents a future stale-but-nonzero payload from being
  // mislabelled "● LIVE LEDGER".
  const isLive = (cohorts?.live ?? false) && hasData;
  const displayTotal = total;
  const fPct = hasData ? fireCount / total : 0;
  const ePct = hasData ? earthCount / total : 0;
  const wPct = hasData ? waterCount / total : 0;
  const aPct = hasData ? airCount / total : 0;

  const fCountStr = `${fireCount.toLocaleString()} charts`;
  const eCountStr = `${earthCount.toLocaleString()} charts`;
  const wCountStr = `${waterCount.toLocaleString()} charts`;
  const aCountStr = `${airCount.toLocaleString()} charts`;

  const meterValues = {
    fire: fPct,
    water: wPct,
    earth: ePct,
    air: aPct
  };

  const breakdown = [
    { label: "Fire · spice + bold", v: `${(fPct * 100).toFixed(1)}%`, n: fCountStr, color: "var(--el-fire)" },
    { label: "Earth · root + slow", v: `${(ePct * 100).toFixed(1)}%`, n: eCountStr, color: "var(--el-earth)" },
    { label: "Water · stew + sea", v: `${(wPct * 100).toFixed(1)}%`, n: wCountStr, color: "var(--el-water)" },
    { label: "Air · raw + bright", v: `${(aPct * 100).toFixed(1)}%`, n: aCountStr, color: "var(--el-air)" },
  ];

  return (
    <Card
      title="Practitioner Elemental Affinity"
      subtitle={hasData ? `${displayTotal.toLocaleString()} birth charts registered` : "no birth charts registered yet"}
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: isLive ? "var(--el-earth)" : "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          {isLive ? "● LIVE LEDGER" : hasData ? "○ STALE" : "○ AWAITING CHARTS"}
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }}>
        <ElementalMeter values={meterValues} layout="radial" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {breakdown.map((b) => (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg-dim)" }}>
                  <span className="el-dot" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                  {b.label}
                </span>
                <span className="t-num" style={{ fontSize: 12 }}>{b.v}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>{b.n}</span>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 6,
              paddingTop: 8,
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span className="t-tag">SYSTEM SOURCE</span>
            <span className="t-num" style={{ fontSize: 11 }}>
              natal_charts <span style={{ color: isLive ? "var(--el-earth)" : "var(--fg-mute)" }}>●</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// PRACTITIONERS COHORT — funnel + retention heatmap
// ============================================================
export function PractitionersCohort({
  realFunnel,
}: {
  realFunnel?: Array<{ stage: string; count: number; pct: number }>;
}) {
  const funnel =
    realFunnel ??
    [
      { stage: "Signup · Google", count: 0, pct: 0 },
      { stage: "Onboarding · complete", count: 0, pct: 0 },
      { stage: "Active · 24h", count: 0, pct: 0 },
      { stage: "First cook log", count: 0, pct: 0 },
      { stage: "Paid · Pro", count: 0, pct: 0 },
    ];
  const max = funnel[0].count || 1;
  return (
    <Card
      title="Practitioner Funnel · 7-day cohorts"
      subtitle={`${funnel[0].count.toLocaleString()} → ${funnel[funnel.length - 1].count.toLocaleString()} pro · this week`}
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN COHORTS
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 18 }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>ACQUISITION FUNNEL · 30D</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {funnel.map((f, i) => (
              <div key={f.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                  <span style={{ color: "var(--fg-dim)" }}>{f.stage}</span>
                  <span className="t-num" style={{ color: "var(--fg)" }}>
                    {f.count.toLocaleString()}
                    <span style={{ color: "var(--fg-mute)", marginLeft: 8 }}>{(f.pct * 100).toFixed(2)}%</span>
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 10,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(f.count / max) * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, color-mix(in oklch, var(--accent), transparent ${20 + i * 8}%), color-mix(in oklch, var(--accent-2), transparent ${30 + i * 6}%))`,
                      boxShadow: `0 0 12px color-mix(in oklch, var(--accent), transparent 70%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>RETENTION · D1 / D7 / D14 / D30</div>
          <div
            style={{
              padding: "32px 12px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 8,
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div className="t-tag" style={{ marginBottom: 4 }}>COHORT RETENTION · NOT WIRED</div>
            <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
              D1 / D7 / D14 / D30 retention needs a per-cohort activity rollup —
              not yet computed.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// ENGINE HEALTH
// Only the metrics that have a real source (`enginePerformance`)
// are shown — NDCG/MAP eval pipeline isn't wired yet, so we
// label the slots honestly instead of fabricating numbers.
// ============================================================
export function EngineHealth({ enginePerformance }: { enginePerformance: any }) {
  const perf = enginePerformance || {
    clickToCookRate: 0,
    totalCalculations: 0,
    averageLatencyMs: 0,
    live: false,
  };
  const live = perf.live ?? false;
  return (
    <Card
      title="Recommendation Engine · Performance & Metrics"
      subtitle={
        live
          ? `click-to-cook ${(perf.clickToCookRate * 100).toFixed(1)}% · ${perf.totalCalculations.toLocaleString()} calc total`
          : "engine telemetry offline"
      }
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <MiniStat
          label="Click→Cook"
          value={live ? `${(perf.clickToCookRate * 100).toFixed(1)}%` : "—"}
          delta="live"
        />
        <MiniStat
          label="Avg latency"
          value={live ? `${perf.averageLatencyMs}ms` : "—"}
          delta="req log"
        />
        <MiniStat
          label="Transmutations"
          value={live ? perf.totalCalculations.toLocaleString() : "—"}
          delta="total"
        />
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          border: "1px dashed var(--line)",
          borderRadius: 8,
        }}
      >
        <div className="t-tag" style={{ marginBottom: 4 }}>OFFLINE EVAL · NOT WIRED</div>
        <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
          NDCG@10 · MAP · canary harness · promote/rollback controls — add an
          eval pipeline + flag table to surface these here.
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// CATALOG STATE — recipes/ingredients/cuisines
// ============================================================
export function CatalogState({
  realCards,
  trending,
}: {
  realCards?: Array<{ label: string; value: string; delta: string; icon: string }>;
  trending?: CatalogTrendingData;
}) {
  const cards =
    realCards ??
    [
      { label: "Ingredients", value: "2,901", delta: "+12 · 24h", icon: "diamond" },
      { label: "Recipes", value: "12,438", delta: "+47 · 24h", icon: "bookmark" },
      { label: "Cuisines", value: "184", delta: "—", icon: "ring" },
      { label: "Methods", value: "62", delta: "+1 · molecular", icon: "triangle-up-bar" },
    ];
  const recipes = trending?.recipes ?? [];
  return (
    <Card
      title="Catalog · State of the Pantry"
      subtitle="ingredients · recipes · cuisines · methods"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN CATALOG
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="t-tag" style={{ fontSize: 8.5 }}>{c.label}</span>
              <Glyph
                name={c.icon as React.ComponentProps<typeof Glyph>["name"]}
                size={12}
                style={{ color: "var(--fg-mute)" }}
              />
            </div>
            <div className="t-num" style={{ fontSize: 18 }}>{c.value}</div>
            <div className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>{c.delta}</div>
          </div>
        ))}
      </div>
      <div className="t-tag" style={{ marginBottom: 6 }}>
        TOP RECIPES · BY POPULARITY{trending && !trending.live ? " · CACHED" : ""}
      </div>
      <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "24px 1fr 64px 64px 48px",
            padding: "6px 10px",
            borderBottom: "1px solid var(--line-hi)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {["#", "Recipe", "Cuisine", "Rating", "Pop"].map((h, i) => (
            <span key={h} className="t-tag" style={{ fontSize: 8.5, textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {recipes.length === 0 && (
          <div style={{ padding: "10px", textAlign: "center" }}>
            <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
              no recipe data
            </span>
          </div>
        )}
        {recipes.map((r, i) => (
          <div
            key={`${i}-${r.name}`}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 64px 64px 48px",
              padding: "8px 10px",
              borderBottom: "1px solid var(--line)",
              fontSize: 11.5,
              alignItems: "center",
            }}
          >
            <span className="t-num" style={{ color: "var(--fg-mute)", fontSize: 10 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                color: "var(--fg)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.name}
            </span>
            <span
              className="t-mono"
              style={{
                fontSize: 9.5,
                color: "var(--fg-mute)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.cuisine}
            </span>
            <span className="t-num" style={{ textAlign: "right", color: "var(--el-earth)", fontSize: 11 }}>
              ★ {r.rating.toFixed(1)}
            </span>
            <span className="t-num" style={{ textAlign: "right", color: "var(--fg-dim)", fontSize: 11 }}>
              {Math.round(r.popularity * 100)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// COMMERCE PANEL — MRR + orders
// ============================================================
export function CommercePanel({ commerceSummary }: { commerceSummary: any }) {
  const summary = commerceSummary || { mrr: 0, recentOrders: [], live: false };
  const live = summary.live ?? false;
  const stateColor: Record<string, string> = {
    fulfilled: "var(--el-earth)",
    charged: "var(--accent)",
    failed: "var(--el-fire)",
    created: "var(--el-water)",
    succeeded: "var(--el-earth)",
    paid: "var(--el-earth)",
    pending: "var(--accent-2)",
  };
  return (
    <Card
      title="Commerce & Conversion"
      subtitle={
        live
          ? `active Pro subscriptions · $${summary.mrr.toLocaleString()} MRR`
          : "billing telemetry offline"
      }
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          {live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span className="t-tag">MRR · ACTIVE SUBS</span>
            <span className="t-num" style={{ fontSize: 18 }}>
              {live ? `$${summary.mrr.toLocaleString()}` : "—"}{" "}
              <span
                className="t-mono"
                style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)" }}
              >
                {live ? "live" : "offline"}
              </span>
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              border: "1px dashed var(--line)",
              borderRadius: 8,
            }}
          >
            <div className="t-tag" style={{ marginBottom: 4 }}>BILLING ANALYTICS · NOT WIRED</div>
            <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
              subscription mix · churn · LTV · free→pro — wire Stripe billing
              analytics to surface these here.
            </div>
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>ORDERS & CART INTENTS{live ? " · LIVE" : ""}</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.75fr 1fr 0.5fr 0.5fr 0.7fr",
                padding: "6px 10px",
                borderBottom: "1px solid var(--line-hi)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Order", "Practitioner", "Value", "Age", "Route"].map((h) => (
                <span key={h} className="t-tag" style={{ fontSize: 8.5 }}>{h}</span>
              ))}
            </div>
            {summary.recentOrders.length === 0 ? (
              <div style={{ padding: "10px", textAlign: "center" }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                  {live ? "no recent orders" : "order telemetry offline"}
                </span>
              </div>
            ) : (
              summary.recentOrders.map((o: any) => {
                const sColor = stateColor[o.status.toLowerCase()] || "var(--accent)";
                return (
                  <div
                    key={o.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "0.75fr 1fr 0.5fr 0.5fr 0.7fr",
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--line)",
                      fontFamily: "var(--f-mono)",
                      fontSize: 10.5,
                      color: "var(--fg-dim)",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        className="el-dot"
                        style={{ background: sColor, boxShadow: `0 0 6px ${sColor}` }}
                      />
                      <span style={{ color: "var(--fg)" }}>{o.id}</span>
                    </span>
                    <span style={{ color: "var(--accent-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.user}</span>
                    <span className="t-num">${o.amount.toFixed(2)}</span>
                    <span>{o.age}</span>
                    <span style={{ color: sColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.type}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// COMMENSAL PULSE
// We don't yet capture per-party harmony or live state, so render
// an honest snapshot of the row counts when commensals exist and
// an empty state otherwise.
// ============================================================
export function CommensalPulse({ pageTelemetry }: { pageTelemetry?: any }) {
  const count = pageTelemetry?.commensals ?? 0;
  const live = pageTelemetry?.live ?? false;
  const mealPlans = pageTelemetry?.mealPlans ?? 0;
  const customRecipes = pageTelemetry?.customRecipes ?? 0;
  return (
    <Card
      title="Commensal Dining & Companions"
      subtitle={
        live
          ? `${count.toLocaleString()} companion charts · ${mealPlans.toLocaleString()} meal plans`
          : "page telemetry offline"
      }
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      {count === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            border: "1px dashed var(--line)",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 4 }}>
            No commensal sessions yet
          </div>
          <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
            ratings + party-state will populate once /commensal traffic begins
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <MetricTile label="Commensals" v={count.toLocaleString()} sub="companion rows" />
          <MetricTile label="Meal plans" v={mealPlans.toLocaleString()} sub="saved plans" />
          <MetricTile label="Custom recipes" v={customRecipes.toLocaleString()} sub="user-created" />
          <MetricTile
            label="Restaurants"
            v={(pageTelemetry?.restaurants ?? 0).toLocaleString()}
            sub="user-saved"
          />
        </div>
      )}
    </Card>
  );
}

function MetricTile({ label, v, sub }: { label: string; v: string; sub: string }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
      <div className="t-tag" style={{ fontSize: 8.5 }}>{label}</div>
      <div className="t-num" style={{ fontSize: 20, color: "var(--fg)", marginTop: 4 }}>{v}</div>
      <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ============================================================
// DEPLOYS · FEATURE FLAGS · AUDIT
// Deploys + Feature flags have no live source yet — render an honest
// empty state with a hint about how to wire them up. We avoid fake
// SHAs and fake flags that look real but aren't.
// ============================================================
export function DeploysPanel() {
  return (
    <Card
      title="Deploys"
      subtitle="Vercel deployments API not wired"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          ○ NO SOURCE
        </span>
      }
    >
      <div
        style={{
          padding: "32px 12px",
          textAlign: "center",
          border: "1px dashed var(--line)",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 4 }}>
          No deploy history wired
        </div>
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          attach Vercel API token + query <code>/v6/deployments</code>
        </div>
      </div>
    </Card>
  );
}

export function FeatureFlagsPanel() {
  return (
    <Card
      title="Feature Flags"
      subtitle="no flag service configured"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          ○ NO SOURCE
        </span>
      }
    >
      <div
        style={{
          padding: "32px 12px",
          textAlign: "center",
          border: "1px dashed var(--line)",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 4 }}>
          No feature flag service
        </div>
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          flags are env-var-only today · add a <code>feature_flags</code> table to surface them here
        </div>
      </div>
    </Card>
  );
}

export function AuditLogPanel({ data }: { data: AuditEventsData }) {
  const { events, live } = data;
  return (
    <Card
      title="Audit · auth events"
      subtitle="sign-in · sign-out · failures"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--el-earth)" : "var(--fg-mute)" }}
        >
          {live ? "● LIVE" : "○ CACHED"}
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.length === 0 && (
          <span
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-mute)", padding: "8px 0" }}
          >
            no auth events recorded
          </span>
        )}
        {events.map((e, i) => {
          const statusColor =
            e.status === "failure"
              ? "var(--el-fire)"
              : e.status === "success"
                ? "var(--el-earth)"
                : "var(--fg-mute)";
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "42px 1fr 96px 56px",
                gap: 8,
                alignItems: "baseline",
                padding: "8px 0",
                borderBottom: i === events.length - 1 ? "none" : "1px solid var(--line)",
                fontFamily: "var(--f-mono)",
                fontSize: 10.5,
              }}
            >
              <span style={{ color: "var(--fg-mute)" }}>{e.createdAt.slice(11, 16)}</span>
              <span
                style={{
                  color: "var(--accent-2)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.email}
              </span>
              <span
                style={{
                  color: "var(--accent)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.eventType}
              </span>
              <span style={{ color: statusColor, textAlign: "right" }}>{e.status}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================
// MODERATION · SECURITY
// Moderation queue has no live source yet — there's no user-generated
// content moderation pipeline. Honest empty state until we add one.
// ============================================================
export function ModerationQueue() {
  return (
    <Card
      title="Moderation Queue"
      subtitle="no moderation pipeline configured"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          ○ NO SOURCE
        </span>
      }
    >
      <div
        style={{
          padding: "32px 12px",
          textAlign: "center",
          border: "1px dashed var(--line)",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 4 }}>
          No user content moderation pipeline
        </div>
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          add a <code>moderation_queue</code> table + classifier when UGC ships
        </div>
      </div>
    </Card>
  );
}

export function SecurityPanel({ security }: { security: SecuritySummaryData }) {
  const maxHourly = Math.max(...security.hourlyAttempts, 1);
  const items = [
    {
      label: "Sign-in failures · 24h",
      v: security.signinFailure24h.toLocaleString(),
      delta: security.signinFailure24h > 0 ? `${security.signinFailure24h} attempt${security.signinFailure24h === 1 ? "" : "s"}` : "clean",
      tone: security.signinFailure24h > 0 ? "warn" : "ok",
    },
    {
      label: "Sign-in successes · 24h",
      v: security.signinSuccess24h.toLocaleString(),
      delta: security.signinSuccess24h > 0 ? "live" : "quiet",
      tone: "ok",
    },
    {
      label: "Unique IPs · 24h",
      v: security.uniqueIps24h.toLocaleString(),
      delta: "auth_events",
      tone: "ok",
    },
    {
      label: "Top failing IP · 24h",
      v: security.failingIps[0] ? `…${security.failingIps[0].ipHash}` : "—",
      delta: security.failingIps[0]
        ? `${security.failingIps[0].failures} fail${security.failingIps[0].failures === 1 ? "" : "s"}`
        : "none",
      tone: security.failingIps[0] ? "warn" : "ok",
    },
  ];
  return (
    <Card
      title="Security"
      subtitle={security.live ? "auth_events · 24h window" : "auth_events offline"}
      right={
        <span
          className="t-mono"
          style={{
            fontSize: 9,
            color: security.live ? "var(--el-earth)" : "var(--fg-mute)",
            letterSpacing: "0.14em",
          }}
        >
          {security.live ? "● LIVE" : "○ STALE"}
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {items.map((it) => (
          <div key={it.label} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
            <div className="t-tag" style={{ fontSize: 8.5 }}>{it.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
              <span className="t-num" style={{ fontSize: 16, color: "var(--fg)" }}>{it.v}</span>
              <span
                className="t-mono"
                style={{ fontSize: 9, color: it.tone === "warn" ? "var(--el-fire)" : "var(--el-earth)" }}
              >
                {it.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: "8px 10px", border: "1px dashed var(--line)", borderRadius: 8 }}>
        <div className="t-tag" style={{ marginBottom: 6 }}>SIGN-IN ATTEMPTS · LAST 24H × HOUR</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2 }}>
          {security.hourlyAttempts.map((count, i) => {
            const v = count / maxHourly;
            return (
              <div
                key={i}
                title={`${count} attempt${count === 1 ? "" : "s"}`}
                style={{
                  height: 16,
                  borderRadius: 2,
                  background:
                    count === 0
                      ? "rgba(255,255,255,0.03)"
                      : `color-mix(in oklch, var(--accent), transparent ${(1 - v) * 92}%)`,
                  border: "1px solid var(--line)",
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>−24h</span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>−12h</span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>now</span>
        </div>
      </div>
    </Card>
  );
}
