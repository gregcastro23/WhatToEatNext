"use client";

import React from "react";
import { Glyph, LiveTimecode, ScanLine } from "./atoms";
import type { AdminDashboardData, Density } from "./data";

interface ShellProps {
  children: React.ReactNode;
  density?: Density;
  showGrid?: boolean;
  user: AdminDashboardData["user"];
  pulse: AdminDashboardData["pulse"];
}

export function AdminShell({
  children,
  density = "comfortable",
  showGrid = true,
  user,
  pulse,
}: ShellProps) {
  return (
    <div
      className={`lab admin-shell density-${density} ${showGrid ? "" : "no-grid"}`}
      style={{ display: "grid", gridTemplateRows: "56px 1fr", height: "100%", overflow: "hidden" }}
    >
      <AdminTopBar user={user} pulse={pulse} />
      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: 0 }}>
        <AdminSideRail />
        <main style={{ minWidth: 0, minHeight: 0, overflow: "auto", padding: "16px 20px 24px" }}>
          {children}
        </main>
      </div>
      <div className="regmarks">
        <i />
      </div>
    </div>
  );
}

// ============================================================
// TOP BAR
// ============================================================
function AdminTopBar({
  user,
  pulse,
}: {
  user: AdminDashboardData["user"];
  pulse: AdminDashboardData["pulse"];
}) {
  const pulseColor =
    pulse.state === "NOMINAL"
      ? "var(--el-earth)"
      : pulse.state === "DEGRADED"
        ? "var(--el-fire)"
        : "#FF5252";
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 24,
        padding: "0 20px",
        borderBottom: "1px solid var(--line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        backdropFilter: "blur(12px)",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* identity cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Glyph name="orbital" size={20} stroke={1.4} style={{ color: "var(--accent)" }} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.0 }}>
            <span className="t-display" style={{ fontSize: 17, letterSpacing: "0.02em" }}>
              alchm
            </span>
            <span className="t-mono" style={{ fontSize: 8, letterSpacing: "0.32em", color: "var(--fg-mute)" }}>
              ADMIN
            </span>
          </div>
        </div>
        <span style={{ width: 1, height: 28, background: "var(--line)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--f-display)",
              fontSize: 14,
              color: "#0A0712",
              boxShadow: "0 0 0 1px var(--line-hi), 0 0 16px var(--accent-glow)",
            }}
          >
            {user.initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: 12, color: "var(--fg)" }}>{user.name}</span>
            <span className="t-mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "var(--accent-2)" }}>
              {user.badge} · {user.role}
            </span>
          </div>
          {user.onCall && (
            <span className="chip chip-active" style={{ padding: "2px 8px", fontSize: 8 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "var(--el-fire)",
                  boxShadow: "0 0 8px var(--el-fire)",
                }}
              />
              ON CALL
            </span>
          )}
        </div>
      </div>

      {/* center — global heartbeat */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: pulseColor,
              boxShadow: `0 0 10px ${pulseColor}`,
              animation: "pulseGlow 1.6s ease-in-out infinite",
            }}
            data-motion
          />
          <span className="t-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--fg)" }}>
            ALL SYSTEMS · {pulse.state}
          </span>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
            · {pulse.score.toFixed(2)}
            <span style={{ color: "var(--fg-faint)" }}>%</span>
          </span>
        </div>
        <span style={{ width: 1, height: 18, background: "var(--line)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <TopMetric label="UPT 30D" value={`${pulse.uptime30d}%`} />
          <TopMetric label="P95" value={`${pulse.p95}ms`} />
          <TopMetric label="ERR" value={`${pulse.errRate}%`} tone={pulse.errRate > 0.1 ? "warn" : "ok"} />
          <TopMetric label="DEPLOY" value={pulse.deployFreshness} />
          <TopMetric label="INC" value={pulse.activeIncidents} tone={pulse.activeIncidents ? "warn" : "ok"} />
        </div>
      </div>

      {/* right — time, search, alerts, deploy */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "right", lineHeight: 1.1 }}>
          <LiveTimecode format="JD" />
          <LiveTimecode format="UTC" />
        </div>
        <button className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 10, gap: 8 }} type="button">
          <Glyph name="search" size={12} />⌘K
        </button>
        <button className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 10, position: "relative" }} type="button">
          <Glyph name="ring" size={12} />
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 4,
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--el-fire)",
              boxShadow: "0 0 6px var(--el-fire)",
            }}
          />
        </button>
        <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 10 }} type="button">
          <Glyph name="triangle-up" size={10} /> DEPLOY
        </button>
      </div>
    </header>
  );
}

function TopMetric({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn";
}) {
  const color = tone === "warn" ? "var(--el-fire)" : "var(--fg)";
  return (
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
      <span className="t-mono" style={{ fontSize: 8, letterSpacing: "0.2em", color: "var(--fg-mute)" }}>{label}</span>
      <span className="t-num" style={{ fontSize: 12, color }}>{value}</span>
    </div>
  );
}

// ============================================================
// SIDE RAIL
// ============================================================
interface ModuleEntry {
  id: string;
  label: string;
  glyph:
    | "orbital"
    | "crosshair"
    | "atom"
    | "ring"
    | "diamond"
    | "bookmark"
    | "wave"
    | "triangle-up-bar"
    | "flask"
    | "spiral"
    | "triangle-down-bar"
    | "triangle-up"
    | "settings";
  badge: string | null;
  active?: boolean;
  warn?: boolean;
}

const MODULES: ModuleEntry[] = [
  { id: "overview", label: "Overview", glyph: "orbital", badge: null, active: true },
  { id: "ops", label: "Operations", glyph: "crosshair", badge: "12 svc" },
  { id: "engine", label: "Recommendation", glyph: "atom", badge: "v17.4" },
  { id: "agents", label: "Agent Mesh", glyph: "ring", badge: "412 live" },
  { id: "users", label: "Practitioners", glyph: "diamond", badge: "48.2k" },
  { id: "catalog", label: "Catalog", glyph: "bookmark", badge: "2.9k / 12.4k" },
  { id: "commensal", label: "Commensal", glyph: "wave", badge: "31" },
  { id: "commerce", label: "Commerce", glyph: "triangle-up-bar", badge: "$84.2k" },
  { id: "moderation", label: "Moderation", glyph: "flask", badge: "7", warn: true },
  { id: "security", label: "Security", glyph: "spiral", badge: null },
  { id: "experiments", label: "Experiments", glyph: "triangle-down-bar", badge: "6 live" },
  { id: "deploys", label: "Deploys", glyph: "triangle-up", badge: null },
  { id: "audit", label: "Audit Log", glyph: "bookmark", badge: null },
  { id: "settings", label: "Settings", glyph: "settings", badge: null },
];

function AdminSideRail() {
  return (
    <aside
      style={{
        borderRight: "1px solid var(--line)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.002))",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "12px 16px 6px" }}>
        <div className="t-tag" style={{ fontSize: 9 }}>HIGH ALCHEMIST · CONTROL</div>
      </div>

      <nav style={{ flex: 1, overflow: "auto", padding: "4px 8px 10px" }}>
        {MODULES.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: m.active ? "color-mix(in oklch, var(--accent), transparent 86%)" : "transparent",
              border: m.active
                ? "1px solid color-mix(in oklch, var(--accent), transparent 60%)"
                : "1px solid transparent",
              color: m.active ? "var(--fg)" : "var(--fg-dim)",
              position: "relative",
              marginBottom: 2,
            }}
          >
            {m.active && (
              <span
                style={{
                  position: "absolute",
                  left: -8,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: "var(--accent)",
                  borderRadius: 1,
                  boxShadow: "0 0 10px var(--accent)",
                }}
              />
            )}
            <Glyph
              name={m.glyph}
              size={14}
              stroke={1.3}
              style={{ color: m.active ? "var(--accent)" : "var(--fg-mute)" }}
            />
            <span style={{ fontSize: 12, flex: 1 }}>{m.label}</span>
            {m.badge && (
              <span
                className="t-mono"
                style={{
                  fontSize: 8.5,
                  letterSpacing: "0.1em",
                  color: m.warn ? "var(--el-fire)" : "var(--fg-mute)",
                  background: m.warn
                    ? "color-mix(in oklch, var(--el-fire), transparent 80%)"
                    : "rgba(255,255,255,0.04)",
                  padding: "2px 6px",
                  borderRadius: 999,
                  border: m.warn
                    ? "1px solid color-mix(in oklch, var(--el-fire), transparent 60%)"
                    : "1px solid var(--line)",
                }}
              >
                {m.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
        <div className="t-tag" style={{ fontSize: 9, marginBottom: 6 }}>ENVIRONMENT</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <span className="chip chip-active" style={{ padding: "2px 8px", fontSize: 8 }}>PROD</span>
          <span className="chip" style={{ padding: "2px 8px", fontSize: 8 }}>STAGING</span>
          <span className="chip" style={{ padding: "2px 8px", fontSize: 8 }}>DEV</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SideKv k="REGION" v="us-east-1 · iad" />
          <SideKv k="BUILD" v="2.7.4 · #c8f1ad" />
          <SideKv k="DB" v="pg 16.2 · primary" />
          <SideKv k="MESH" v="412/440 nodes" />
        </div>
      </div>
    </aside>
  );
}

function SideKv({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span className="t-mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--fg-mute)" }}>{k}</span>
      <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>{v}</span>
    </div>
  );
}

// ============================================================
// ARCHITECT CARD — Greg's identity + inbox
// ============================================================
export function ArchitectCard({ user }: { user: AdminDashboardData["user"] }) {
  const queue = [
    { kind: "SIGN-OFF", what: "Engine v18.0β · promote to 100%", sev: "high", age: "12m" },
    { kind: "SIGN-OFF", what: "Refund · @marcus.kw · $8.00", sev: "med", age: "26m" },
    { kind: "SIGN-OFF", what: "Restaurant Creator · @vera.j", sev: "med", age: "1h" },
    { kind: "REVIEW", what: "Recipe · molecular caviar", sev: "low", age: "2h" },
    { kind: "REVIEW", what: "PR-1184 · cart adapter", sev: "low", age: "5h" },
  ] as const;
  const sevColor: Record<string, string> = {
    high: "var(--el-fire)",
    med: "var(--accent)",
    low: "var(--fg-mute)",
  };
  return (
    <div className="panel-glow" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
      <ScanLine />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--f-display)",
            fontSize: 26,
            color: "#0A0712",
            boxShadow: "0 0 0 2px var(--line-hi), 0 0 32px var(--accent-glow)",
            position: "relative",
          }}
        >
          {user.initial}
          <span
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "var(--el-earth)",
              border: "2px solid var(--bg)",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="t-tag" style={{ fontSize: 8.5 }}>HIGH ALCHEMIST · ARCHITECT</div>
          <div className="t-display" style={{ fontSize: 18, lineHeight: 1.1, marginTop: 2 }}>{user.name}</div>
          <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.1em", marginTop: 2 }}>
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        <KvLine k="BADGE" v={user.badge} />
        <KvLine k="TIER" v={user.tier} accent />
        <KvLine k="JOINED" v={user.joined} />
        <KvLine k="REGION" v="iad" />
        <KvLine k="ON CALL" v="YES · primary" accent />
        <KvLine k="2FA" v="hw key · ok" />
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
        <div className="t-tag" style={{ marginBottom: 8 }}>YOUR INBOX · 5 items want your sign-off</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {queue.map((q, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 10,
                alignItems: "center",
                padding: "8px 4px",
                borderBottom: i === queue.length - 1 ? "none" : "1px solid var(--line)",
              }}
            >
              <span
                className="t-mono"
                style={{
                  fontSize: 8.5,
                  letterSpacing: "0.14em",
                  padding: "2px 7px",
                  borderRadius: 999,
                  color: sevColor[q.sev],
                  border: `1px solid ${sevColor[q.sev]}`,
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                {q.kind}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--fg-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {q.what}
              </span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>{q.age}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 9, flex: 1 }} type="button">
          OPEN INBOX
        </button>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 9 }} type="button">
          HAND OFF
        </button>
      </div>
    </div>
  );
}

function KvLine({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed var(--line)" }}>
      <span className="t-tag" style={{ fontSize: 8.5 }}>{k}</span>
      <span className="t-mono" style={{ fontSize: 10, color: accent ? "var(--accent)" : "var(--fg-dim)" }}>{v}</span>
    </div>
  );
}
