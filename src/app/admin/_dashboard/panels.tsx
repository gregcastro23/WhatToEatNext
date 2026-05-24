"use client";

import React from "react";
import type {
  AuditEventsData,
  CatalogTrendingData,
} from "@/services/dashboardPanelsService";
import { CompatibilityRing, ElementalMeter, Glyph, Sparkline } from "./atoms";
import { seeded } from "./data";
import { Card, Legend, MiniStat } from "./hero";

// ============================================================
// SERVICE MATRIX
// ============================================================
export function ServiceMatrix() {
  const services = [
    { name: "alchm-api", tier: "T1", health: "OK", p50: 28, p95: 184, qps: 1284, err: 0.04, instances: "8/8", color: "var(--el-earth)" },
    { name: "alchm-engine-v17", tier: "T1", health: "OK", p50: 62, p95: 240, qps: 412, err: 0.02, instances: "6/6", color: "var(--accent-2)" },
    { name: "alchm-auth", tier: "T1", health: "OK", p50: 18, p95: 96, qps: 187, err: 0.0, instances: "3/3", color: "var(--el-air)" },
    { name: "pg-primary · 16.2", tier: "T1", health: "OK", p50: 4, p95: 18, qps: 3120, err: 0.0, instances: "1/1 · 2 replicas", color: "var(--el-earth)" },
    { name: "redis-hot", tier: "T1", health: "OK", p50: 1, p95: 3, qps: 8120, err: 0.0, instances: "3/3", color: "var(--el-water)" },
    { name: "queue · planner", tier: "T2", health: "WARN", p50: 220, p95: 1840, qps: 14, err: 0.18, instances: "2/2", color: "var(--el-fire)", note: "backlog · 318 jobs" },
    { name: "search · meilisearch", tier: "T2", health: "OK", p50: 8, p95: 42, qps: 540, err: 0.01, instances: "2/2", color: "var(--el-water)" },
    { name: "cdn · cf workers", tier: "T2", health: "OK", p50: 12, p95: 60, qps: 5240, err: 0.0, instances: "global · 312 PoPs", color: "var(--el-air)" },
    { name: "ml · recsys-batch", tier: "T2", health: "OK", p50: 0, p95: 0, qps: 0, err: 0.0, instances: "nightly · 03:00 UTC", color: "var(--accent-2)" },
    { name: "agents · mesh edge", tier: "T2", health: "WARN", p50: 84, p95: 320, qps: 218, err: 0.06, instances: "412/440", color: "var(--accent)", note: "28 nodes idle > 5m" },
    { name: "stripe · billing", tier: "T3", health: "OK", p50: 142, p95: 510, qps: 9.4, err: 0.0, instances: "external · webhook q=0", color: "var(--el-earth)" },
    { name: "amazon · fresh", tier: "T3", health: "OK", p50: 220, p95: 980, qps: 6.2, err: 0.01, instances: "external", color: "var(--el-air)" },
  ];
  return (
    <Card
      title="Service Matrix"
      subtitle="12 services · 2 warnings"
      right={
        <div style={{ display: "flex", gap: 8 }}>
          <Legend color="var(--el-earth)" label="OK" />
          <Legend color="var(--el-fire)" label="WARN" />
          <Legend color="#FF5252" label="DOWN" />
        </div>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 0.4fr 0.5fr 0.6fr 0.6fr 0.6fr 0.6fr 1fr",
          rowGap: 0,
          fontSize: 11.5,
        }}
      >
        <SvcHeader label="Service" />
        <SvcHeader label="Tier" />
        <SvcHeader label="State" />
        <SvcHeader label="P50" right />
        <SvcHeader label="P95" right />
        <SvcHeader label="QPS" right />
        <SvcHeader label="Err%" right />
        <SvcHeader label="Instances" />
        {services.map((s) => (
          <React.Fragment key={s.name}>
            <SvcCell>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="el-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                <span style={{ color: "var(--fg)" }}>{s.name}</span>
              </div>
              {s.note && (
                <div
                  className="t-mono"
                  style={{ fontSize: 9, color: "var(--el-fire)", marginTop: 2, letterSpacing: "0.1em" }}
                >
                  {s.note}
                </div>
              )}
            </SvcCell>
            <SvcCell>
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>{s.tier}</span>
            </SvcCell>
            <SvcCell>
              <span
                className="t-mono"
                style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background:
                    s.health === "OK"
                      ? "color-mix(in oklch, var(--el-earth), transparent 80%)"
                      : "color-mix(in oklch, var(--el-fire), transparent 75%)",
                  color: s.health === "OK" ? "var(--el-earth)" : "var(--el-fire)",
                  border: `1px solid ${
                    s.health === "OK"
                      ? "color-mix(in oklch, var(--el-earth), transparent 60%)"
                      : "color-mix(in oklch, var(--el-fire), transparent 50%)"
                  }`,
                }}
              >
                {s.health}
              </span>
            </SvcCell>
            <SvcCell right>
              <span className="t-num" style={{ color: "var(--fg-dim)" }}>
                {s.p50}<span style={{ color: "var(--fg-faint)" }}>ms</span>
              </span>
            </SvcCell>
            <SvcCell right>
              <span className="t-num" style={{ color: s.p95 > 500 ? "var(--el-fire)" : "var(--fg)" }}>
                {s.p95}<span style={{ color: "var(--fg-faint)" }}>ms</span>
              </span>
            </SvcCell>
            <SvcCell right>
              <span className="t-num" style={{ color: "var(--fg-dim)" }}>{s.qps.toLocaleString()}</span>
            </SvcCell>
            <SvcCell right>
              <span className="t-num" style={{ color: s.err > 0.1 ? "var(--el-fire)" : "var(--fg-dim)" }}>
                {s.err.toFixed(2)}
              </span>
            </SvcCell>
            <SvcCell>
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>{s.instances}</span>
            </SvcCell>
          </React.Fragment>
        ))}
      </div>
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
// LIVE EVENT STREAM
// ============================================================
export function LiveEventStream() {
  const events = [
    { t: "21:46:08", k: "auth.signin", sev: "info", who: "@lila.fontana", msg: "Google · session est · IAD" },
    { t: "21:46:04", k: "engine.predict", sev: "info", who: "engine-v17", msg: "score=0.918 · acc-cluster=warm" },
    { t: "21:46:01", k: "cart.add", sev: "info", who: "@marcus.kw", msg: "+ heirloom tomato · $4.20 · Amz" },
    { t: "21:45:58", k: "queue.spike", sev: "warn", who: "planner", msg: "backlog 318 > 200 threshold" },
    { t: "21:45:54", k: "mesh.node.idle", sev: "warn", who: "mesh-edge", msg: "sous-chef-209 idle 6m · drain" },
    { t: "21:45:50", k: "admin.signoff", sev: "ok", who: "@gregcastro23", msg: "approved · recipe #c8f1ad" },
    { t: "21:45:47", k: "moderation.flag", sev: "warn", who: "auto", msg: "recipe #84a210 · profanity score 0.62" },
    { t: "21:45:42", k: "billing.charge", sev: "info", who: "stripe", msg: "+$24.00 · pro · 0xc2…" },
    { t: "21:45:39", k: "engine.canary", sev: "ok", who: "engine-v17", msg: "canary @ 12% · delta +0.014 acc" },
    { t: "21:45:35", k: "auth.signup", sev: "ok", who: "@noor.eldin", msg: "onboarding · step Palate" },
    { t: "21:45:31", k: "agent.dispatch", sev: "info", who: "agents.alchm.kit", msg: "sous-chef · dinner-party-441" },
    { t: "21:45:28", k: "incident.update", sev: "err", who: "INC-2207", msg: "cart 5xx · 4 occurrences · mitigating" },
    { t: "21:45:24", k: "search.reindex", sev: "info", who: "meili", msg: "ingredients +12 · re-rank" },
    { t: "21:45:21", k: "deploy.preview", sev: "info", who: "@gregcastro23", msg: "branch fix/cart-checkout @ pr-1184" },
    { t: "21:45:18", k: "auth.signin", sev: "info", who: "@kazu.tanaka", msg: "Google · NRT · returning" },
    { t: "21:45:14", k: "engine.feedback", sev: "info", who: "@isobel.r", msg: "★ 5 · pad krapow · acc++" },
    { t: "21:45:11", k: "feature.flag", sev: "ok", who: "@gregcastro23", msg: "cosmic-recipe-v2 → 100%" },
    { t: "21:45:07", k: "auth.fail", sev: "warn", who: "203.0.113.7", msg: "OAuthCallback ×3 · throttled" },
  ];
  const sevColor: Record<string, string> = {
    info: "var(--fg-dim)",
    ok: "var(--el-earth)",
    warn: "var(--el-fire)",
    err: "#FF5252",
  };
  return (
    <Card
      title="Live Event Stream"
      subtitle={false}
      right={
        <div style={{ display: "flex", gap: 6 }}>
          <span className="chip chip-active" style={{ padding: "2px 8px", fontSize: 8 }}>ALL</span>
          <span className="chip" style={{ padding: "2px 8px", fontSize: 8 }}>WARN+</span>
          <span className="chip" style={{ padding: "2px 8px", fontSize: 8 }}>ADMIN</span>
        </div>
      }
      padded={false}
      style={{ height: 480 }}
    >
      <div style={{ height: "100%", overflow: "auto", padding: "4px 0" }}>
        {events.map((e, i) => (
          <div
            key={i}
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
            <span style={{ color: "var(--fg-mute)", fontSize: 9.5 }}>{e.t}</span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: 999,
                background: sevColor[e.sev],
                boxShadow: `0 0 6px ${sevColor[e.sev]}`,
              }}
            />
            <span style={{ color: sevColor[e.sev], fontSize: 9.5, letterSpacing: "0.08em" }}>{e.k}</span>
            <span style={{ display: "flex", gap: 8, minWidth: 0 }}>
              <span style={{ color: "var(--fg)", whiteSpace: "nowrap" }}>{e.who}</span>
              <span style={{ color: "var(--fg-mute)" }}>·</span>
              <span
                style={{
                  color: "var(--fg-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.msg}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// INCIDENTS
// ============================================================
export function IncidentsPanel() {
  interface Incident {
    id: string;
    sev: "MAJOR" | "MINOR";
    title: string;
    svc: string;
    started: string;
    assignee: string;
    step: string;
    progress: number;
    timeline?: Array<{ t: string; e: string }>;
  }
  const items: Incident[] = [
    {
      id: "INC-2207",
      sev: "MAJOR",
      title: "Cart checkout 5xx · Amazon Fresh adapter",
      svc: "amazon-fresh · stripe-bridge",
      started: "21:31 UTC · 14m",
      assignee: "@gregcastro23",
      step: "Mitigating",
      progress: 0.6,
      timeline: [
        { t: "21:31", e: "Pageduty paged · 4 alerts · 5xx rate 2.4%" },
        { t: "21:33", e: "Greg ack · started rollback of #c8f1ad" },
        { t: "21:38", e: "Adapter restored to v2.7.3 · errors -82%" },
        { t: "21:45", e: "Monitoring · awaiting 5m clear window" },
      ],
    },
    {
      id: "INC-2204",
      sev: "MINOR",
      title: "Planner queue backlog · planetary refresh job",
      svc: "queue.planner",
      started: "21:18 UTC · 27m",
      assignee: "auto",
      step: "Auto-scaling",
      progress: 0.3,
    },
  ];
  return (
    <Card
      title="Active Incidents"
      subtitle="1 major · 1 minor"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          RUNBOOK
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((inc) => {
          const sevColor = inc.sev === "MAJOR" ? "#FF5252" : "var(--el-fire)";
          return (
            <div
              key={inc.id}
              style={{
                border: `1px solid color-mix(in oklch, ${sevColor}, transparent 60%)`,
                background: `linear-gradient(180deg, color-mix(in oklch, ${sevColor}, transparent 92%), transparent)`,
                borderRadius: 10,
                padding: 12,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
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
                  {inc.sev}
                </span>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>{inc.id}</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--fg-mute)" }}>
                  {inc.started}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg)", marginBottom: 4 }}>{inc.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
                  {inc.svc}
                </span>
                <span className="t-mono" style={{ fontSize: 9.5, color: "var(--accent-2)" }}>{inc.assignee}</span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 4,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${inc.progress * 100}%`,
                    background: `linear-gradient(90deg, ${sevColor}, color-mix(in oklch, ${sevColor}, transparent 50%))`,
                    boxShadow: `0 0 12px ${sevColor}`,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.14em" }}>
                  {inc.step.toUpperCase()}
                </span>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                  {Math.round(inc.progress * 100)}%
                </span>
              </div>
              {inc.timeline && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>
                  {inc.timeline.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 1fr",
                        gap: 8,
                        fontSize: 10.5,
                        padding: "2px 0",
                      }}
                    >
                      <span className="t-mono" style={{ color: "var(--fg-mute)", fontSize: 9.5 }}>{t.t}</span>
                      <span style={{ color: "var(--fg-dim)" }}>{t.e}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
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

  const displayTotal = total || 12847;
  const fPct = total > 0 ? (fireCount / total) : 0.312;
  const ePct = total > 0 ? (earthCount / total) : 0.284;
  const wPct = total > 0 ? (waterCount / total) : 0.227;
  const aPct = total > 0 ? (airCount / total) : 0.177;

  const fCountStr = total > 0 ? `${fireCount.toLocaleString()} charts` : "3,996 sessions";
  const eCountStr = total > 0 ? `${earthCount.toLocaleString()} charts` : "3,638 sessions";
  const wCountStr = total > 0 ? `${waterCount.toLocaleString()} charts` : "2,907 sessions";
  const aCountStr = total > 0 ? `${airCount.toLocaleString()} charts` : "2,267 sessions";

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
      subtitle={`${displayTotal.toLocaleString()} birth charts registered`}
      right={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>LIVE POSTGRES LEDGER</span>
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
              natal_charts <span style={{ color: "var(--el-earth)" }}>●</span>
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
      { stage: "Landing", count: 84210, pct: 1.0 },
      { stage: "Signup · Google", count: 6280, pct: 0.075 },
      { stage: "Onboarding · Place", count: 5910, pct: 0.07 },
      { stage: "First recipe view", count: 5640, pct: 0.067 },
      { stage: "First cook log", count: 3402, pct: 0.04 },
      { stage: "Paid · Pro", count: 1582, pct: 0.0188 },
    ];
  const max = funnel[0].count;
  const cohort = [
    { week: "W-7", d1: 0.82, d7: 0.54, d14: 0.42, d30: 0.31 },
    { week: "W-6", d1: 0.84, d7: 0.56, d14: 0.44, d30: 0.33 },
    { week: "W-5", d1: 0.81, d7: 0.55, d14: 0.43, d30: 0.32 },
    { week: "W-4", d1: 0.85, d7: 0.59, d14: 0.47, d30: 0.35 },
    { week: "W-3", d1: 0.87, d7: 0.62, d14: 0.5, d30: null as number | null },
    { week: "W-2", d1: 0.89, d7: 0.64, d14: null as number | null, d30: null as number | null },
    { week: "W-1", d1: 0.91, d7: null as number | null, d14: null as number | null, d30: null as number | null },
    { week: "THIS", d1: null as number | null, d7: null as number | null, d14: null as number | null, d30: null as number | null },
  ];
  const cellColor = (v: number | null) => {
    if (v == null) return "rgba(255,255,255,0.02)";
    const a = 0.15 + v * 0.55;
    return `color-mix(in oklch, var(--accent), transparent ${(1 - a) * 100}%)`;
  };
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
          <div style={{ display: "grid", gridTemplateColumns: "44px repeat(4, 1fr)", gap: 4 }}>
            <span />
            {["D1", "D7", "D14", "D30"].map((h) => (
              <span key={h} className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", textAlign: "center" }}>
                {h}
              </span>
            ))}
            {cohort.map((row) => (
              <React.Fragment key={row.week}>
                <span
                  className="t-mono"
                  style={{ fontSize: 9.5, color: "var(--fg-dim)", display: "flex", alignItems: "center" }}
                >
                  {row.week}
                </span>
                {[row.d1, row.d7, row.d14, row.d30].map((v, i) => (
                  <div
                    key={i}
                    style={{
                      height: 28,
                      borderRadius: 4,
                      background: cellColor(v),
                      border: "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--f-mono)",
                      fontSize: 9.5,
                      color: v != null ? (v > 0.5 ? "var(--fg)" : "var(--fg-dim)") : "var(--fg-faint)",
                    }}
                  >
                    {v != null ? `${Math.round(v * 100)}%` : "—"}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// ENGINE HEALTH
// ============================================================
export function EngineHealth({ enginePerformance }: { enginePerformance: any }) {
  const perf = enginePerformance || { clickToCookRate: 0.047, totalCalculations: 2743, averageLatencyMs: 78 };
  const acc = seeded(11, 40, 0.82, 0.94);
  const versions = [
    { v: "v17.4 (Py)", since: "Railway", traffic: "100%", acc: 0.918, ndcg: 0.74, latP95: "184ms", state: "live" },
    { v: "v1.3.13 (Bun)", since: "Vercel", traffic: "12%", acc: 0.928, ndcg: 0.76, latP95: `${perf.averageLatencyMs}ms`, state: "canary" },
  ];
  return (
    <Card
      title="Recommendation Engine · Performance & Metrics"
      subtitle={`Native Bun v1.3.13 · click-to-cook ${(perf.clickToCookRate * 100).toFixed(1)}%`}
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN ENGINE
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>ENGINE HARMONY ACCURACY · EVAL WINDOWS</div>
          <Sparkline data={acc} width={300} height={70} color="var(--accent)" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
            <MiniStat label="NDCG@10" value="0.742" delta="+0.018" />
            <MiniStat label="MAP" value="0.681" delta="+0.012" />
            <MiniStat label="Click→Cook" value={`${(perf.clickToCookRate * 100).toFixed(1)}%`} delta="live" />
            <MiniStat label="Avg Latency" value={`${perf.averageLatencyMs}ms`} delta="db log" />
            <MiniStat label="Transmutations" value={perf.totalCalculations.toLocaleString()} delta="total" />
            <MiniStat label="Coverage" value="2,743 / 2,901" delta="ing." />
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>ACTIVE ENGINE CORRELATION VERTICES</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.7fr 0.6fr 0.7fr 0.6fr 0.6fr 0.7fr",
                padding: "6px 10px",
                borderBottom: "1px solid var(--line-hi)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Version", "Engine", "Traffic", "Acc", "NDCG", "p95"].map((h) => (
                <span key={h} className="t-tag" style={{ fontSize: 8.5 }}>{h}</span>
              ))}
            </div>
            {versions.map((v) => (
              <div
                key={v.v}
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.7fr 0.6fr 0.7fr 0.6fr 0.6fr 0.7fr",
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--line)",
                  fontFamily: "var(--f-mono)",
                  fontSize: 11,
                  color: "var(--fg-dim)",
                  alignItems: "center",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    className="el-dot"
                    style={{
                      background:
                        v.state === "live"
                          ? "var(--el-earth)"
                          : v.state === "canary"
                            ? "var(--accent)"
                            : "var(--fg-faint)",
                      boxShadow:
                        v.state === "live"
                          ? "0 0 6px var(--el-earth)"
                          : v.state === "canary"
                            ? "0 0 6px var(--accent)"
                            : "none",
                    }}
                  />
                  <span style={{ color: "var(--fg)" }}>{v.v}</span>
                </span>
                <span>{v.since}</span>
                <span
                  style={{
                    color:
                      v.state === "live"
                        ? "var(--accent)"
                        : v.state === "canary"
                          ? "var(--accent-2)"
                          : "var(--fg-mute)",
                  }}
                >
                  {v.traffic}
                </span>
                <span>{v.acc}</span>
                <span>{v.ndcg}</span>
                <span>{v.latP95}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ padding: "5px 10px", fontSize: 9 }} type="button">
              PROMOTE CANARY →
            </button>
            <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 9 }} type="button">
              ROLLBACK
            </button>
            <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 9 }} type="button">
              EVAL SET
            </button>
          </div>
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
  const summary = commerceSummary || { mrr: 1612, recentOrders: [] };
  const mrrData = seeded(21, 30, 0.5, 0.92);
  const stack = [
    { label: "Pro", color: "var(--accent)", v: 64 },
    { label: "Practitioner", color: "var(--accent-2)", v: 22 },
    { label: "Free → Gift", color: "var(--el-water)", v: 8 },
    { label: "Trial", color: "var(--el-fire)", v: 6 },
  ];
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
      subtitle={`Total Pro subscriptions MRR: $${summary.mrr.toLocaleString()}`}
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN BILLING
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span className="t-tag">MRR · 30D</span>
            <span className="t-num" style={{ fontSize: 18 }}>
              ${summary.mrr.toLocaleString()}{" "}
              <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>live</span>
            </span>
          </div>
          <Sparkline data={mrrData} width={280} height={56} color="var(--accent)" />
          <div style={{ marginTop: 12 }}>
            <div className="t-tag" style={{ marginBottom: 4 }}>SUBSCRIPTION MIX</div>
            <div
              style={{
                display: "flex",
                height: 12,
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid var(--line)",
              }}
            >
              {stack.map((s) => (
                <div
                  key={s.label}
                  style={{ width: `${s.v}%`, background: s.color, boxShadow: `inset 0 0 8px ${s.color}` }}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
              {stack.map((s) => (
                <span
                  key={s.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    color: "var(--fg-dim)",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  {s.label} <span className="t-num" style={{ color: "var(--fg-mute)" }}>{s.v}%</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 12 }}>
            <MiniStat label="Churn 30d" value="2.1%" delta="−0.4pts" />
            <MiniStat label="LTV" value="$184" delta="+$12" />
            <MiniStat label="Free → Pro" value="4.7%" delta="+0.3pts" />
            <MiniStat label="Refund queue" value="0" delta="nominal" />
          </div>
        </div>
        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>ORDERS & CART INTENTS · LIVE</div>
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
                  no recent orders
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
// ============================================================
export function CommensalPulse({ pageTelemetry }: { pageTelemetry?: any }) {
  const count = pageTelemetry?.commensals ?? 31;
  const parties = [
    { id: "DP-441", host: "@kemi.adekunle", guests: 8, cuisine: "Yoruba · West African", harmony: 0.92, state: "live" },
    { id: "DP-440", host: "@ezra.kuhn", guests: 6, cuisine: "Pesach · spring", harmony: 0.81, state: "live" },
    { id: "DP-439", host: "@hiro.matsui", guests: 4, cuisine: "Kaiseki", harmony: 0.88, state: "starting" },
    { id: "DP-438", host: "@alma.r", guests: 12, cuisine: "Sobremesa", harmony: 0.74, state: "live" },
  ];
  return (
    <Card title="Commensal Dining & Companions" subtitle={`${count.toLocaleString()} companion charts registered`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {parties.map((p) => (
          <div
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "8px 10px",
              border: "1px solid var(--line)",
              borderRadius: 8,
            }}
          >
            <CompatibilityRing value={p.harmony} size={42} label="HARM" />
            <div>
              <div style={{ fontSize: 11.5, color: "var(--fg)" }}>{p.cuisine}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)" }}>{p.host}</span>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>· {p.guests} guests</span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 9,
                    color: p.state === "live" ? "var(--el-earth)" : "var(--accent)",
                  }}
                >
                  · {p.state}
                </span>
              </div>
            </div>
            <Glyph name="chevron" size={14} style={{ color: "var(--fg-mute)" }} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// DEPLOYS · FEATURE FLAGS · AUDIT
// ============================================================
export function DeploysPanel() {
  const deploys = [
    { sha: "c8f1ad", branch: "main", who: "@gregcastro23", t: "23m", s: "live", note: "engine v17.4 cutover" },
    { sha: "84a210", branch: "main", who: "@gregcastro23", t: "2h", s: "live", note: "fix · planner queue" },
    { sha: "192bb7", branch: "fix/cart-checkout", who: "@gregcastro23", t: "5h", s: "preview", note: "pr-1184 · cart adapter" },
    { sha: "7c3091", branch: "main", who: "@deploybot", t: "9h", s: "live", note: "deps · pg client" },
    { sha: "412de8", branch: "main", who: "@gregcastro23", t: "1d", s: "rolled", note: "rollback · billing webhook" },
    { sha: "ee920f", branch: "main", who: "@gregcastro23", t: "1d", s: "live", note: "nav IA · 5 primary" },
  ];
  const stateColor: Record<string, string> = {
    live: "var(--el-earth)",
    preview: "var(--accent)",
    rolled: "var(--el-fire)",
  };
  return (
    <Card title="Deploys · last 7 days" subtitle="6 prod · 1 preview · 1 rollback">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {deploys.map((d, i) => (
          <div
            key={d.sha}
            style={{
              display: "grid",
              gridTemplateColumns: "8px 70px 1fr 70px 50px",
              gap: 10,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: i === deploys.length - 1 ? "none" : "1px solid var(--line)",
              fontSize: 11,
            }}
          >
            <span className="el-dot" style={{ background: stateColor[d.s], boxShadow: `0 0 6px ${stateColor[d.s]}` }} />
            <span className="t-mono" style={{ color: "var(--fg)", fontSize: 10.5 }}>#{d.sha}</span>
            <span
              style={{
                color: "var(--fg-dim)",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {d.note}
            </span>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--accent-2)" }}>{d.who}</span>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", textAlign: "right" }}>{d.t}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FeatureFlagsPanel() {
  const flags = [
    { key: "cosmic-recipe-v2", pct: 100, env: "prod", state: "on", owner: "@greg" },
    { key: "engine-canary", pct: 12, env: "prod", state: "canary", owner: "@greg" },
    { key: "agent-sync-badge", pct: 100, env: "prod", state: "on", owner: "@greg" },
    { key: "commensal-12-guests", pct: 25, env: "prod", state: "ramp", owner: "@greg" },
    { key: "amz-fresh-tax-fix", pct: 0, env: "prod", state: "off", owner: "@greg" },
    { key: "barcode-scan-quick", pct: 50, env: "stg", state: "ramp", owner: "@greg" },
  ];
  const stateColor: Record<string, string> = {
    on: "var(--el-earth)",
    canary: "var(--accent)",
    ramp: "var(--accent-2)",
    off: "var(--fg-mute)",
  };
  return (
    <Card
      title="Feature Flags"
      subtitle="6 active · 1 ramping"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          NEW
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {flags.map((f, i) => (
          <div
            key={f.key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 56px 50px 40px",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              borderBottom: i === flags.length - 1 ? "none" : "1px solid var(--line)",
              fontSize: 11,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className="el-dot"
                  style={{ background: stateColor[f.state], boxShadow: `0 0 6px ${stateColor[f.state]}` }}
                />
                <span className="t-mono" style={{ color: "var(--fg)", fontSize: 11 }}>{f.key}</span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 3,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 999,
                  marginTop: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${f.pct}%`,
                    height: "100%",
                    background: stateColor[f.state],
                    boxShadow: `0 0 6px ${stateColor[f.state]}`,
                  }}
                />
              </div>
            </div>
            <span className="t-num" style={{ fontSize: 11, fontStyle: "normal", textAlign: "right", color: "var(--fg)" }}>{f.pct}%</span>
            <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>
              {f.env.toUpperCase()}
            </span>
            <span
              role="switch"
              aria-checked={f.state !== "off"}
              aria-label={`Feature flag ${f.key} · ${f.state}`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end" }}
            >
              <span
                style={{
                  width: 26,
                  height: 14,
                  borderRadius: 999,
                  background:
                    f.state === "off"
                      ? "rgba(255,255,255,0.08)"
                      : "color-mix(in oklch, var(--accent), transparent 60%)",
                  position: "relative",
                  border: "1px solid var(--line-hi)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 1,
                    left: f.state === "off" ? 1 : 12,
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "var(--fg)",
                    transition: "left 200ms ease",
                  }}
                />
              </span>
            </span>
          </div>
        ))}
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
// ============================================================
export function ModerationQueue() {
  const items = [
    { id: "MOD-441", kind: "recipe", who: "@silas.t", reason: "profanity · 0.62", at: "12m", sev: "warn" },
    { id: "MOD-440", kind: "comment", who: "@anon.4192", reason: "spam · 0.91", at: "21m", sev: "warn" },
    { id: "MOD-439", kind: "image", who: "@kavi.s", reason: "blurred · QC", at: "33m", sev: "info" },
    { id: "MOD-438", kind: "report", who: "by @ana.p", reason: "abuse · DM", at: "1h", sev: "high" },
    { id: "MOD-437", kind: "recipe", who: "@hyun.j", reason: "allergen flag", at: "1h", sev: "info" },
    { id: "MOD-436", kind: "comment", who: "@anon.7811", reason: "spam · 0.84", at: "2h", sev: "warn" },
    { id: "MOD-435", kind: "recipe", who: "@bea.l", reason: "duplicate", at: "3h", sev: "info" },
  ];
  const sevColor: Record<string, string> = { info: "var(--fg-mute)", warn: "var(--el-fire)", high: "#FF5252" };
  return (
    <Card
      title="Moderation Queue"
      subtitle="7 pending · 2 high"
      right={
        <button className="btn btn-primary" style={{ padding: "5px 10px", fontSize: 9 }} type="button">
          TRIAGE
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "64px 64px 1fr 1fr 40px",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: i === items.length - 1 ? "none" : "1px solid var(--line)",
              fontSize: 11,
            }}
          >
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>{m.id}</span>
            <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)", letterSpacing: "0.14em" }}>
              {m.kind.toUpperCase()}
            </span>
            <span style={{ color: "var(--fg-dim)" }}>{m.who}</span>
            <span style={{ color: sevColor[m.sev] }}>{m.reason}</span>
            <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", textAlign: "right" }}>{m.at}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SecurityPanel() {
  const items = [
    { label: "Failed sign-ins · 24h", v: "84", delta: "+12", tone: "warn" },
    { label: "Throttled IPs", v: "6", delta: "+1", tone: "warn" },
    { label: "Suspicious sessions", v: "0", delta: "—", tone: "ok" },
    { label: "Active root sessions", v: "1", delta: "you", tone: "ok" },
    { label: "Linked agents · OAuth", v: "42", delta: "+2", tone: "ok" },
    { label: "Secrets rotation due", v: "2", delta: "stripe · sendgrid", tone: "warn" },
  ];
  return (
    <Card
      title="Security"
      subtitle="auth · sessions · keys"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          SECRETS
        </button>
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
        <div className="t-tag" style={{ marginBottom: 6 }}>SIGN-IN ATTEMPTS · 24H × 12 HOUR BUCKETS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2 }}>
          {seeded(99, 24, 0.1, 0.9).map((v, i) => (
            <div
              key={i}
              style={{
                height: 16,
                borderRadius: 2,
                background: `color-mix(in oklch, var(--accent), transparent ${(1 - v) * 92}%)`,
                border: "1px solid var(--line)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>00</span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>12</span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>now</span>
        </div>
      </div>
    </Card>
  );
}
