"use client";

import React from "react";
import { ScanLine, Sparkline } from "./atoms";
import { seeded } from "./data";

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
          }}
        >
          <div>
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
// MASTER LINE HERO
// ============================================================
interface HeroEvent {
  i: number;
  kind: "deploy" | "warn" | "inc" | "ok";
  label: string;
}

export function MasterLineHero({ greeting = "Good Mars hour, Greg" }: { greeting?: string }) {
  const reqs = seeded(7, 96, 0.35, 0.92);
  const errs = seeded(13, 96, 0.05, 0.2).map((v, i) =>
    i > 70 && i < 78 ? v * 2.4 : i > 30 && i < 34 ? v * 1.6 : v,
  );
  const events: HeroEvent[] = [
    { i: 16, kind: "deploy", label: "deploy · 2.7.3" },
    { i: 32, kind: "warn", label: "queue spike · planner" },
    { i: 54, kind: "deploy", label: "deploy · 2.7.4" },
    { i: 74, kind: "inc", label: "INC-2207 · cart 5xx" },
    { i: 86, kind: "ok", label: "engine v17.4 cutover" },
  ];

  return (
    <section
      className="panel"
      style={{ padding: 18, marginBottom: 14, position: "relative", overflow: "hidden" }}
    >
      <ScanLine />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div>
              <div className="t-tag">MASTER LINE · 24H · SITE-WIDE</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 2 }}>
                <h2 className="t-display" style={{ margin: 0, fontSize: 30, letterSpacing: "-0.005em" }}>
                  {greeting}
                </h2>
                <span
                  className="t-mono"
                  style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.12em" }}
                >
                  3 items want your sign-off · 1 active incident
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 9 }} type="button">1H</button>
              <button className="btn" style={{ padding: "5px 10px", fontSize: 9 }} type="button">24H</button>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 9 }} type="button">7D</button>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 9 }} type="button">30D</button>
            </div>
          </div>

          <Heartbeat reqs={reqs} errs={errs} events={events} />

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <Ticker label="REQ/s" value="1,284" delta="+4.2%" up />
            <Ticker label="ACTIVE" value="3,917" delta="+1.1%" up />
            <Ticker label="P50" value="42ms" delta="-3ms" up />
            <Ticker label="P95" value="184ms" delta="+8ms" warn />
            <Ticker label="ERR" value="0.04%" delta="-0.01" up />
            <Ticker label="QUEUE" value="14" delta="+6" warn />
            <Ticker label="MRR" value="$84.2k" delta="+$1.6k" up />
            <Ticker label="MESH" value="412/440" delta="-2" warn last />
          </div>
        </div>

        <div>
          <div className="t-tag" style={{ marginBottom: 6 }}>SYSTEM STANDING CHART</div>
          <SystemStandingChart />
        </div>
      </div>
    </section>
  );
}

function Heartbeat({
  reqs,
  errs,
  events,
}: {
  reqs: number[];
  errs: number[];
  events: HeroEvent[];
}) {
  const W = 980;
  const H = 168;
  const P = 4;
  const n = reqs.length;
  const xOf = (i: number) => P + ((W - P * 2) * i) / (n - 1);
  const yReq = (v: number) => H - P - v * (H - P * 2);
  const yErr = (v: number) => H - P - v * (H - P * 2) * 0.55;

  const reqPath = reqs.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)} ${yReq(v).toFixed(1)}`).join(" ");
  const reqFill = `${reqPath} L${(W - P).toFixed(1)} ${(H - P).toFixed(1)} L${P} ${(H - P).toFixed(1)} Z`;
  const errPath = errs.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)} ${yErr(v).toFixed(1)}`).join(" ");

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
        <path d={errPath} fill="none" stroke="var(--el-fire)" strokeWidth="1.2" opacity="0.7" />
        <path d={reqFill} fill="url(#hb-req)" />
        <path d={reqPath} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
        {events.map((e, idx) => {
          const x = xOf(e.i);
          const color =
            e.kind === "inc"
              ? "#FF5252"
              : e.kind === "warn"
                ? "var(--el-fire)"
                : e.kind === "deploy"
                  ? "var(--accent-2)"
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
        <line x1={W - P} x2={W - P} y1={P} y2={H - P} stroke="var(--accent)" strokeWidth="1" />
        <circle cx={W - P} cy={yReq(reqs[reqs.length - 1])} r="3.5" fill="var(--accent)" />
        {[0, 6, 12, 18, 24].map((h) => (
          <text
            key={h}
            x={P + ((W - P * 2) * h) / 24}
            y={H - 10}
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >
            {h === 24 ? "now" : `${String(h).padStart(2, "0")}:00`}
          </text>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 12, top: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {events.map((e, i) => {
          const color =
            e.kind === "inc"
              ? "#FF5252"
              : e.kind === "warn"
                ? "var(--el-fire)"
                : e.kind === "deploy"
                  ? "var(--accent-2)"
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
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>━ requests/s</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-fire)" }}>━ errors/s</span>
      </div>
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
function SystemStandingChart() {
  const size = 280;
  const c = size / 2;
  const services = [
    { id: "api", sym: "A", color: "var(--accent)", health: 0.99, orbit: 0, tier: 1, label: "API" },
    { id: "db", sym: "D", color: "var(--el-earth)", health: 0.98, orbit: 1, tier: 1, label: "PG" },
    { id: "engine", sym: "E", color: "var(--accent-2)", health: 0.96, orbit: 2, tier: 1, label: "ENG" },
    { id: "auth", sym: "Z", color: "var(--el-air)", health: 0.97, orbit: 1, tier: 1, label: "AUTH" },
    { id: "queue", sym: "Q", color: "var(--el-fire)", health: 0.82, orbit: 2, tier: 2, label: "QUE", warn: true },
    { id: "mesh", sym: "M", color: "var(--accent)", health: 0.94, orbit: 3, tier: 2, label: "MESH" },
    { id: "cdn", sym: "C", color: "var(--el-water)", health: 0.99, orbit: 3, tier: 2, label: "CDN" },
    { id: "search", sym: "S", color: "var(--el-earth)", health: 0.95, orbit: 2, tier: 2, label: "SRCH" },
    { id: "ml", sym: "L", color: "var(--accent-2)", health: 0.9, orbit: 3, tier: 3, label: "ML" },
    { id: "amz", sym: "Z", color: "var(--el-air)", health: 0.93, orbit: 4, tier: 3, label: "AMZ" },
    { id: "billing", sym: "B", color: "var(--el-earth)", health: 0.97, orbit: 4, tier: 3, label: "STR" },
  ];
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
        {services.map((s, i) => {
          const r = radii[s.orbit] || radii[0];
          const a = (i / services.length) * 2 * Math.PI - Math.PI / 2;
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r;
          return (
            <g key={s.id}>
              {s.tier === 1 && (
                <line x1={c} y1={c} x2={x} y2={y} stroke={s.color} strokeWidth="0.4" opacity="0.4" />
              )}
              <circle
                cx={x}
                cy={y}
                r={s.warn ? 9 : 7}
                fill={`color-mix(in oklch, ${s.color}, black 30%)`}
                stroke={s.color}
                strokeWidth={s.warn ? 1.2 : 0.8}
                style={{ filter: s.warn ? `drop-shadow(0 0 6px ${s.color})` : "none" }}
              />
              <text
                x={x}
                y={y + 3}
                fill="rgba(0,0,0,0.7)"
                fontSize="8"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                fontWeight="600"
              >
                {s.sym}
              </text>
              <text
                x={x}
                y={y + (s.orbit > 1 ? 20 : -12)}
                fill={s.warn ? s.color : "var(--fg-mute)"}
                fontSize="7"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                letterSpacing="1"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 8, left: 10 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>T1 · CRITICAL</div>
      </div>
      <div style={{ position: "absolute", top: 8, right: 10, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.14em" }}>11 / 12 GREEN</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, left: 10 }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--el-fire)", letterSpacing: "0.14em" }}>QUE · DEGRADED</div>
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 10, textAlign: "right" }} className="t-mono">
        <div style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em" }}>T3 · AUX</div>
      </div>
    </div>
  );
}

// ============================================================
// KPI STRIP
// ============================================================
export function KPIStrip() {
  const kpis = [
    { label: "Practitioners · DAU", v: "12,847", d: "+612 · 24h", spark: seeded(1, 36, 0.4, 0.95), tone: "ok" },
    { label: "Recipes/min · Tier II", v: "184", d: "↑ peak 21:32", spark: seeded(2, 36, 0.3, 0.9), tone: "ok" },
    { label: "MRR", v: "$84,210", d: "+$1.6k MoM", spark: seeded(3, 36, 0.4, 0.9), tone: "ok" },
    { label: "Engine v17.4 NDCG@10", v: "0.742", d: "+0.018 vs v17.3", spark: seeded(5, 36, 0.5, 0.95), tone: "ok" },
    { label: "Calibration · R²", v: "0.942", d: "obs vs pred", spark: seeded(31, 36, 0.85, 0.96), tone: "ok" },
    { label: "Agent dispatches/min", v: "1,284", d: "+118 · across mesh", spark: seeded(7, 36, 0.5, 0.92), tone: "ok" },
    { label: "Galileo · gen/min", v: "22", d: "GPU 78% · 0.6% fail", spark: seeded(8, 36, 0.6, 0.95), tone: "ok" },
    { label: "Substitution fidelity", v: "0.864", d: "86 swaps/min", spark: seeded(12, 36, 0.7, 0.9), tone: "ok" },
    { label: "Ephemeris drift", v: "0.38″", d: "vs JPL Horizons", spark: seeded(15, 36, 0.1, 0.4), tone: "ok" },
    { label: "Cosmic Yield velocity", v: "2.4x", d: "MoM · inflationary", spark: seeded(17, 36, 0.4, 0.9), tone: "ok" },
    { label: "SEMS · Substance", v: "−11pts", d: "below band", spark: seeded(19, 36, 0.2, 0.5), tone: "warn" },
    { label: "Mesh uptime", v: "412/440", d: "-2 idle · 92% role", spark: seeded(9, 36, 0.5, 0.95), tone: "warn" },
  ];
  return (
    <section
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
            }}
          >
            <span
              className="t-mono"
              style={{ fontSize: 9, color: k.tone === "warn" ? "var(--el-fire)" : "var(--el-earth)" }}
            >
              {k.d}
            </span>
            <Sparkline
              data={k.spark}
              width={60}
              height={20}
              color={k.tone === "warn" ? "var(--el-fire)" : "var(--accent)"}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
