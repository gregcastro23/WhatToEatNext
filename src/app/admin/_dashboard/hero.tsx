"use client";

import React from "react";
import { ScanLine, Sparkline } from "./atoms";
import type { AdminDashboardData } from "./data";

// ============================================================
// CARD — reusable framed panel
// ============================================================
interface CardProps {
  title?: string;
  subtitle?: string | false;
  right?: React.ReactNode;
  children: React.ReactNode;
  glow?: boolean;
  padded?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  title,
  subtitle,
  right,
  children,
  glow,
  padded = true,
  style = {},
}: CardProps) {
  return (
    <div
      className={glow ? "panel-glow" : "panel"}
      style={{ ...style, display: "flex", flexDirection: "column", position: "relative" }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px 8px",
            borderBottom: subtitle === false ? "none" : "1px solid var(--line)",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && <div className="t-tag" style={{ fontSize: 9 }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: padded ? "12px 14px 14px" : 0, flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  const positive = !!delta && (delta.startsWith("+") || delta.startsWith("−6"));
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: "6px 10px",
      }}
    >
      <div className="t-tag" style={{ fontSize: 8.5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
        <span className="t-num" style={{ fontSize: 13 }}>{value}</span>
        {delta && (
          <span className="t-mono" style={{ fontSize: 9, color: positive ? "var(--el-earth)" : "var(--fg-mute)" }}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "var(--f-mono)",
        fontSize: 9,
        color: "var(--fg-mute)",
        letterSpacing: "0.14em",
      }}
    >
      <span className="el-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}

// ============================================================
// MASTER LINE HERO — wired to pulse + requestSeries + recentAlerts + systemStatus
// ============================================================
interface HeroEvent {
  /** 0..1 fraction of the series window (real time alignment). */
  f: number;
  kind: "alert" | "incident" | "ok";
  label: string;
}

interface MasterLineHeroProps {
  greeting?: string;
  data: AdminDashboardData;
}

export function MasterLineHero({ greeting = "Good Mars hour, Greg", data }: MasterLineHeroProps) {
  const { pulse, recentAlerts, systemStatus, commerce, requestSeries } = data;

  // The x-axis is real hours from request_log_entries, so alert markers are
  // placed at their actual timestamps; alerts outside the window are dropped.
  const { points } = requestSeries;
  const windowMs = (requestSeries.windowHours || 24) * 3_600_000;
  const windowEnd =
    points.length > 0
      ? new Date(points[points.length - 1].hour).getTime() + 3_600_000
      : Date.now();
  const windowStart =
    points.length > 0 ? new Date(points[0].hour).getTime() : windowEnd - windowMs;
  const events: HeroEvent[] = requestSeries.live
    ? recentAlerts.entries.slice(0, 5).flatMap((a) => {
        const t = new Date(a.triggeredAt).getTime();
        if (!Number.isFinite(t) || t < windowStart || t > windowEnd) return [];
        return [
          {
            f: (t - windowStart) / Math.max(windowEnd - windowStart, 1),
            kind:
              a.severity === "error"
                ? ("incident" as const)
                : a.severity === "warn"
                  ? ("alert" as const)
                  : ("ok" as const),
            label: a.title.length > 28 ? `${a.title.slice(0, 26)}…` : a.title,
          },
        ];
      })
    : [];

  const incidentCount = systemStatus.flows.filter((f) => f.status === "INCIDENT").length;
  // UNKNOWN = the telemetry payload itself is absent (loading or API outage).
  // "all systems quiet" here would be a fabricated verdict about systems we
  // cannot currently see.
  const telemetryAbsent = pulse.state === "UNKNOWN";
  const subtitle = telemetryAbsent
    ? "awaiting telemetry"
    : pulse.activeIncidents > 0 || incidentCount > 0
      ? `${pulse.activeIncidents || incidentCount} active incident${(pulse.activeIncidents || incidentCount) === 1 ? "" : "s"}`
      : recentAlerts.entries.length > 0
        ? `${recentAlerts.entries.length} recent alert${recentAlerts.entries.length === 1 ? "" : "s"}`
        : "all systems quiet";

  return (
    <section
      className="panel"
      style={{ padding: 18, marginBottom: 14, position: "relative", overflow: "hidden" }}
    >
      <ScanLine />
      <div
        className="dash-hero-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 6,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div className="t-tag">MASTER LINE · 24H · SITE-WIDE</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  marginTop: 2,
                  flexWrap: "wrap",
                }}
              >
                <h2 className="t-display" style={{ margin: 0, fontSize: 30, letterSpacing: "-0.005em" }}>
                  {greeting}
                </h2>
                <span
                  className="t-mono"
                  style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.12em" }}
                >
                  {subtitle}
                </span>
              </div>
            </div>
            <span className="chip chip-active" style={{ padding: "4px 10px", fontSize: 9 }}>
              24H
            </span>
          </div>

          <Heartbeat
            series={requestSeries}
            events={events}
            windowStart={windowStart}
            windowEnd={windowEnd}
          />

          <div
            className="dash-hero-tickers"
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <Ticker
              label="AVAIL"
              value={telemetryAbsent ? "—" : `${pulse.availability.toFixed(2)}%`}
              delta={telemetryAbsent ? "no data" : "rolling"}
              up={!telemetryAbsent && pulse.availability >= 99}
              warn={!telemetryAbsent && pulse.availability < 99}
            />
            <Ticker
              label="P95"
              value={telemetryAbsent ? "—" : `${pulse.p95}ms`}
              delta={telemetryAbsent ? "no data" : "req log"}
              warn={!telemetryAbsent && pulse.p95 > 500}
              up={!telemetryAbsent && pulse.p95 <= 500}
            />
            <Ticker
              label="ERR"
              value={telemetryAbsent ? "—" : `${pulse.errRate.toFixed(2)}%`}
              delta={telemetryAbsent ? "no data" : pulse.errRate > 0 ? "active" : "nominal"}
              warn={!telemetryAbsent && pulse.errRate > 0.5}
              up={!telemetryAbsent && pulse.errRate <= 0.5}
            />
            <Ticker
              label="INC"
              value={telemetryAbsent ? "—" : String(pulse.activeIncidents || incidentCount)}
              delta={pulse.state}
              warn={!telemetryAbsent && (pulse.activeIncidents > 0 || incidentCount > 0)}
              up={!telemetryAbsent && pulse.activeIncidents === 0 && incidentCount === 0}
            />
            <Ticker
              label="MRR"
              value={
                commerce.live
                  ? commerce.mrr >= 1000
                    ? `$${(commerce.mrr / 1000).toFixed(1).replace(/\.0$/, "")}k`
                    : `$${commerce.mrr.toLocaleString()}`
                  : "—"
              }
              delta="active subs"
              up={commerce.mrr > 0}
            />
            <Ticker label="DEPLOY" value={pulse.deployFreshness} delta="fresh" up last />
          </div>
        </div>

        <div className="dash-hero-aside">
          <div className="t-tag" style={{ marginBottom: 6 }}>SYSTEM STANDING CHART</div>
          <SystemStandingChart systemStatus={systemStatus} />
        </div>
      </div>
    </section>
  );
}

function Heartbeat({
  series,
  events,
  windowStart,
  windowEnd,
}: {
  series: AdminDashboardData["requestSeries"];
  events: HeroEvent[];
  windowStart: number;
  windowEnd: number;
}) {
  const W = 980;
  const H = 168;
  const P = 4;
  const { points } = series;
  const span = Math.max(windowEnd - windowStart, 1);
  const xOfTime = (t: number) => P + ((W - P * 2) * (t - windowStart)) / span;
  const maxV = Math.max(1, ...points.map((p) => Math.max(p.requests, p.errors)));
  const yOf = (v: number) => H - P - (v / maxV) * (H - P * 2) * 0.92;

  // A live-but-empty (or all-zero) series is a measured zero — draw the real
  // flat line at zero rather than hiding it, and say so in the corner note.
  const allZero =
    series.live && points.every((p) => p.requests === 0 && p.errors === 0);
  const toPath = (valueOf: (p: (typeof points)[number]) => number) =>
    points.length > 0
      ? points
          .map(
            (p, i) =>
              `${i === 0 ? "M" : "L"}${xOfTime(new Date(p.hour).getTime()).toFixed(1)} ${yOf(valueOf(p)).toFixed(1)}`,
          )
          .join(" ")
      : `M${P} ${yOf(0).toFixed(1)} L${(W - P).toFixed(1)} ${yOf(0).toFixed(1)}`;
  const reqPath = toPath((p) => p.requests);
  const reqFill = `${reqPath} L${(W - P).toFixed(1)} ${(H - P).toFixed(1)} L${P} ${(H - P).toFixed(1)} Z`;
  const errPath = toPath((p) => p.errors);
  const lastY =
    points.length > 0 ? yOf(points[points.length - 1].requests) : yOf(0);

  const tickLabel = (frac: number): string => {
    if (frac === 1) return "now";
    const d = new Date(windowStart + span * frac);
    return `${String(d.getUTCHours()).padStart(2, "0")}:00`;
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        <defs>
          <linearGradient id="hb-req" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
          <pattern id="hb-grid" width="40.83" height="42" patternUnits="userSpaceOnUse">
            <path d="M 40.83 0 L 0 0 0 42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#hb-grid)" />
        {Array.from({ length: 24 }, (_, h) => {
          const x = P + ((W - P * 2) * h) / 24;
          const big = h % 6 === 0;
          return (
            <line
              key={h}
              x1={x}
              x2={x}
              y1={H - P}
              y2={H - P - (big ? 8 : 4)}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.6"
            />
          );
        })}
        {series.live && (
          <>
            <path d={errPath} fill="none" stroke="var(--el-fire)" strokeWidth="1.2" opacity="0.7" />
            <path d={reqFill} fill="url(#hb-req)" />
            <path d={reqPath} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
          </>
        )}
        {events.map((e, idx) => {
          const x = P + (W - P * 2) * e.f;
          const color =
            e.kind === "incident"
              ? "#FF5252"
              : e.kind === "alert"
                ? "var(--el-fire)"
                : "var(--el-earth)";
          return (
            <g key={idx}>
              <line
                x1={x}
                x2={x}
                y1={P}
                y2={H - P}
                stroke={color}
                strokeWidth="0.6"
                strokeDasharray="2 3"
                opacity="0.7"
              />
              <circle cx={x} cy={P + 6} r={4} fill={color} stroke="var(--bg)" strokeWidth="1" />
            </g>
          );
        })}
        {series.live && (
          <>
            <line x1={W - P} x2={W - P} y1={P} y2={H - P} stroke="var(--accent)" strokeWidth="1" />
            <circle cx={W - P} cy={lastY} r="3.5" fill="var(--accent)" />
          </>
        )}
        {!series.live && (
          <text
            x={W / 2}
            y={H / 2}
            fill="var(--fg-mute)"
            fontSize="11"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            letterSpacing="2"
          >
            REQUEST LOG UNREADABLE
          </text>
        )}
        {allZero && (
          <text
            x={W / 2}
            y={H / 2 - 14}
            fill="var(--fg-mute)"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            letterSpacing="1"
          >
            no instrumented traffic in window
          </text>
        )}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <text
            key={frac}
            x={P + (W - P * 2) * frac}
            y={H - 10}
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            {series.live ? tickLabel(frac) : "—"}
          </text>
        ))}
      </svg>
      {events.length > 0 && (
        <div style={{ position: "absolute", left: 12, top: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {events.map((e, i) => {
            const color =
              e.kind === "incident"
                ? "#FF5252"
                : e.kind === "alert"
                  ? "var(--el-fire)"
                  : "var(--el-earth)";
            return (
              <span
                key={i}
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.5)",
                  border: `1px solid ${color}`,
                  color,
                  textTransform: "uppercase",
                }}
              >
                {e.label}
              </span>
            );
          })}
        </div>
      )}
      {series.live && (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-end",
          }}
        >
          <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>━ requests/hr</span>
          <span className="t-mono" style={{ fontSize: 9, color: "var(--el-fire)" }}>━ 5xx/hr (instrumented routes)</span>
        </div>
      )}
    </div>
  );
}

function Ticker({
  label,
  value,
  delta,
  up,
  warn,
  last,
}: {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
  warn?: boolean;
  last?: boolean;
}) {
  const color = warn ? "var(--el-fire)" : up ? "var(--el-earth)" : "var(--fg-mute)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px 12px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ fontSize: 8.5, letterSpacing: "0.2em", color: "var(--fg-mute)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="t-num" style={{ fontSize: 14, color: "var(--fg)" }}>{value}</span>
        <span className="t-mono" style={{ fontSize: 9, color }}>
          {up && !warn ? "▲" : warn ? "▲" : "▼"} {delta}
        </span>
      </div>
    </div>
  );
}

// ----- System standing chart (services as planets) -----
const SVC_COLOR_BY_STATUS: Record<string, string> = {
  OK: "var(--el-earth)",
  DEGRADED: "var(--el-fire)",
  INCIDENT: "#FF5252",
  UNKNOWN: "var(--fg-mute)",
};

function SystemStandingChart({
  systemStatus,
}: {
  systemStatus: AdminDashboardData["systemStatus"];
}) {
  const size = 280;
  const c = size / 2;
  const services = [
    ...systemStatus.flows.map((f, i) => ({
      id: f.id,
      label: f.label.slice(0, 6).toUpperCase(),
      status: f.status,
      orbit: i < 4 ? 1 : 2,
      tier: 1,
      warn: f.status === "DEGRADED" || f.status === "INCIDENT",
    })),
    ...systemStatus.dependencies.map((d, i) => ({
      id: d.id,
      label: d.label.slice(0, 6).toUpperCase(),
      status: d.status,
      orbit: 3 + (i % 2),
      tier: 2,
      warn: d.status === "DEGRADED" || d.status === "INCIDENT",
    })),
  ];
  const totalGreen = services.filter((s) => s.status === "OK").length;
  const totalDegraded = services.filter((s) => s.status === "DEGRADED").length;
  const radii = [60, 84, 108, 132];
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        border: "1px solid var(--line)",
        borderRadius: 12,
        background:
          "radial-gradient(circle at 50% 50%, rgba(140,100,255,0.06), transparent 70%), rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
        {radii.map((r, i) => (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.6"
            strokeDasharray="3 4"
          />
        ))}
        <circle
          cx={c}
          cy={c}
          r={radii[3] + 6}
          fill="none"
          stroke="color-mix(in oklch, var(--el-earth), transparent 75%)"
          strokeWidth="14"
          opacity="0.5"
        />
        <line x1={c} y1={4} x2={c} y2={size - 4} stroke="rgba(255,255,255,0.06)" />
        <line x1={4} y1={c} x2={size - 4} y2={c} stroke="rgba(255,255,255,0.06)" />
        <circle cx={c} cy={c} r={18} fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.8" />
        <circle cx={c} cy={c} r={9} fill="color-mix(in oklch, var(--accent), transparent 60%)" />
        <text x={c} y={c + 3} fill="var(--accent)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
          CORE
        </text>
        {services.length === 0 ? (
          <text
            x={c}
            y={c + 50}
            fill="var(--fg-mute)"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            no systemStatus data
          </text>
        ) : (
          services.map((s, i) => {
            const r = radii[Math.min(s.orbit, radii.length - 1)] || radii[0];
            const a = (i / services.length) * 2 * Math.PI - Math.PI / 2;
            const x = c + Math.cos(a) * r;
            const y = c + Math.sin(a) * r;
            const color = SVC_COLOR_BY_STATUS[s.status] ?? "var(--fg-mute)";
            return (
              <g key={s.id}>
                {s.tier === 1 && (
                  <line x1={c} y1={c} x2={x} y2={y} stroke={color} strokeWidth="0.4" opacity="0.4" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={s.warn ? 9 : 7}
                  fill={`color-mix(in oklch, ${color}, black 30%)`}
                  stroke={color}
                  strokeWidth={s.warn ? 1.2 : 0.8}
                  style={{ filter: s.warn ? `drop-shadow(0 0 6px ${color})` : "none" }}
                />
                <text
                  x={x}
                  y={y + (s.orbit > 1 ? 20 : -12)}
                  fill={s.warn ? color : "var(--fg-mute)"}
                  fontSize="7"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  {s.label}
                </text>
              </g>
            );
          })
        )}
      </svg>
      <div style={{ position: "absolute", top: 8, left: 10 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>T1 · CRITICAL</div>
      </div>
      <div style={{ position: "absolute", top: 8, right: 10, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.14em" }}>
          {totalGreen} / {services.length} GREEN
        </div>
      </div>
      {totalDegraded > 0 && (
        <div style={{ position: "absolute", bottom: 8, left: 10 }} className="t-mono">
          <div style={{ fontSize: 9, color: "var(--el-fire)", letterSpacing: "0.14em" }}>
            {totalDegraded} DEGRADED
          </div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 8, right: 10, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>T2 · DEP</div>
      </div>
    </div>
  );
}

// ============================================================
// KPI STRIP — wired to real telemetry
// Drops the prototype's 12 fabricated tiles in favor of 10 metrics
// that all come from real sources. Layout: 5 per row on desktop.
// ============================================================
function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

function fmtCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n.toLocaleString()}`;
}

export function KPIStrip({ data }: { data: AdminDashboardData }) {
  const { stats, commerce, cosmicYield, dbObservability, enginePerformance, security, recentAlerts, errorGroups } = data;
  const onboardingRate =
    stats.totalUsers > 0 ? stats.completedOnboarding / stats.totalUsers : 0;

  // Only two tiles have a real time series (auth hourly attempts, cosmic-yield
  // daily flow); every other tile is value-only — no decorative trend shapes.
  const flowSpark =
    cosmicYield.flowSeries.live && cosmicYield.flowSeries.days.length > 0
      ? cosmicYield.flowSeries.days.map((d) => d.minted - d.burned)
      : undefined;

  const kpis: Array<{
    label: string;
    v: string;
    d: string;
    spark?: number[];
    tone: "ok" | "warn" | "neutral";
    live?: boolean;
  }> = [
    {
      label: "Practitioners · total",
      v: stats.live ? fmtCount(stats.totalUsers) : "—",
      d: stats.live ? `+${stats.newUsersToday} · 24h` : "offline",
      tone: stats.live && stats.newUsersToday > 0 ? "ok" : "neutral",
      live: stats.live,
    },
    {
      // activeUsers counts is_active accounts (not deactivated) — an
      // account-status total, NOT daily activity. The old "Active · 24h"
      // label fabricated an engagement metric out of a suspension flag.
      label: "Accounts · active",
      v: stats.live ? fmtCount(stats.activeUsers) : "—",
      d: stats.live
        ? `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% not deactivated`
        : "offline",
      tone: stats.live ? "ok" : "neutral",
      live: stats.live,
    },
    {
      label: "Onboarded",
      v: stats.live ? fmtCount(stats.completedOnboarding) : "—",
      d: stats.live ? `${(onboardingRate * 100).toFixed(1)}% complete` : "offline",
      tone: !stats.live ? "neutral" : onboardingRate < 0.3 ? "warn" : "ok",
      live: stats.live,
    },
    {
      label: "Recipes · catalog",
      v: stats.live ? fmtCount(stats.totalRecipes) : "—",
      d: stats.live ? `${fmtCount(stats.totalIngredients)} ingredients` : "offline",
      tone: stats.live ? "ok" : "neutral",
      live: stats.live,
    },
    {
      label: "MRR · active subs",
      v: commerce.live ? fmtCurrency(commerce.mrr) : "—",
      d: stats.live ? `${stats.totalSubscriptions} subs` : "offline",
      tone: commerce.live ? "ok" : "neutral",
      live: commerce.live,
    },
    {
      label: "Cosmic yield · circ.",
      v: cosmicYield.live ? fmtCount(Math.round(cosmicYield.inCirculation)) : "—",
      d: cosmicYield.live ? `${cosmicYield.netFlow30d >= 0 ? "+" : ""}${fmtCount(Math.round(cosmicYield.netFlow30d))} · 30d` : "offline",
      spark: flowSpark,
      tone: cosmicYield.live ? "ok" : "neutral",
      live: cosmicYield.live,
    },
    {
      label: "Engine · click→cook",
      v: enginePerformance.live ? `${(enginePerformance.clickToCookRate * 100).toFixed(1)}%` : "—",
      d: enginePerformance.live ? `${fmtCount(enginePerformance.totalCalculations)} calc` : "offline",
      tone: enginePerformance.live ? "ok" : "neutral",
      live: enginePerformance.live,
    },
    {
      label: "Engine · avg latency",
      v: enginePerformance.live ? `${enginePerformance.averageLatencyMs}ms` : "—",
      d: !enginePerformance.live
        ? "offline"
        : enginePerformance.averageLatencyMs > 200
          ? "above SLO"
          : "within SLO",
      tone: !enginePerformance.live
        ? "neutral"
        : enginePerformance.averageLatencyMs > 200
          ? "warn"
          : "ok",
      live: enginePerformance.live,
    },
    {
      label: "Auth · 24h failures",
      v: security.live ? String(security.signinFailure24h) : "—",
      d: security.live ? `${security.signinSuccess24h} success` : "offline",
      spark: security.live ? security.hourlyAttempts : undefined,
      tone: !security.live ? "neutral" : security.signinFailure24h > 0 ? "warn" : "ok",
      live: security.live,
    },
    {
      label: "DB · pool",
      v: dbObservability.live ? `${dbObservability.pool.total - dbObservability.pool.idle}/${dbObservability.pool.max}` : "—",
      d: !dbObservability.live
        ? "offline"
        : dbObservability.pool.waiting > 0
          ? `${dbObservability.pool.waiting} waiting`
          : `${dbObservability.slowQueries.length} slow Q`,
      tone: !dbObservability.live
        ? "neutral"
        : dbObservability.pool.waiting > 0
          ? "warn"
          : "ok",
      live: dbObservability.live,
    },
    {
      label: "Recent alerts",
      v: recentAlerts.live ? String(recentAlerts.entries.length) : "—",
      d: recentAlerts.live
        ? `${recentAlerts.entries.filter((a) => a.severity === "error").length} err`
        : "offline",
      tone: recentAlerts.entries.some((a) => a.severity === "error") ? "warn" : "ok",
      live: recentAlerts.live,
    },
    {
      label: "Error groups · 60m",
      v: errorGroups.live ? String(errorGroups.groups.length) : "—",
      d: errorGroups.live
        ? `${errorGroups.groups.reduce((s, g) => s + g.fiveXxCount, 0)} 5xx`
        : "offline",
      tone: errorGroups.groups.some((g) => g.fiveXxCount > 0) ? "warn" : "ok",
      live: errorGroups.live,
    },
  ];

  return (
    <section
      className="dash-kpi-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 0,
        border: "1px solid var(--line)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      {kpis.map((k, i) => (
        <div
          key={k.label}
          style={{
            padding: "12px 14px",
            borderRight: i % 6 < 5 ? "1px solid var(--line)" : "none",
            borderBottom: i < 6 ? "1px solid var(--line)" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minHeight: 92,
            opacity: k.live === false ? 0.55 : 1,
          }}
        >
          <div className="t-tag" style={{ fontSize: 8.5 }}>{k.label}</div>
          <div className="t-num" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1 }}>{k.v}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              gap: 8,
            }}
          >
            <span
              className="t-mono"
              style={{
                fontSize: 9,
                color:
                  k.tone === "warn"
                    ? "var(--el-fire)"
                    : k.tone === "ok"
                      ? "var(--el-earth)"
                      : "var(--fg-mute)",
              }}
            >
              {k.d}
            </span>
            {k.spark && k.spark.length > 0 && (
              <Sparkline
                data={k.spark}
                width={60}
                height={20}
                color={k.tone === "warn" ? "var(--el-fire)" : "var(--accent)"}
              />
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
