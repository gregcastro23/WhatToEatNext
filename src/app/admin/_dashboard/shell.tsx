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
  data: AdminDashboardData;
}

export function AdminShell({
  children,
  density = "comfortable",
  showGrid = true,
  user,
  pulse,
  data,
}: ShellProps) {
  const [navOpen, setNavOpen] = React.useState(false);

  // close the drawer whenever the viewport grows back to desktop width
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 961px)");
    const sync = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setNavOpen(false);
    };
    sync(mql);
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={`lab admin-shell density-${density} ${showGrid ? "" : "no-grid"} ${
        navOpen ? "nav-open" : ""
      }`}
      style={{
        display: "grid",
        gridTemplateRows: "56px 1fr",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <AdminTopBar
        user={user}
        pulse={pulse}
        onToggleNav={() => setNavOpen((v) => !v)}
      />
      <div
        data-shell-body=""
        style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: 0 }}
      >
        <AdminSideRail data={data} />
        <main
          data-shell-main=""
          style={{ minWidth: 0, minHeight: 0, overflow: "auto", padding: "16px 20px 24px" }}
          onClick={() => navOpen && setNavOpen(false)}
        >
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
  onToggleNav,
}: {
  user: AdminDashboardData["user"];
  pulse: AdminDashboardData["pulse"];
  onToggleNav: () => void;
}) {
  const pulseColor =
    pulse.state === "NOMINAL"
      ? "var(--el-earth)"
      : pulse.state === "DEGRADED"
        ? "var(--el-fire)"
        : "#FF5252";
  return (
    <header
      data-shell-topbar=""
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
        <button
          type="button"
          aria-label="Open navigation"
          className="dash-hamburger"
          onClick={onToggleNav}
        >
          <Glyph name="crosshair" size={16} stroke={1.4} />
        </button>
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
      <div
        data-shell-topbar-metrics=""
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}
      >
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
          <TopMetric label="AVAIL" value={`${pulse.availability}%`} />
          <TopMetric label="P95" value={`${pulse.p95}ms`} />
          <TopMetric label="ERR" value={`${pulse.errRate}%`} tone={pulse.errRate > 0.1 ? "warn" : "ok"} />
          <TopMetric label="DEPLOY" value={pulse.deployFreshness} />
          <TopMetric label="INC" value={pulse.activeIncidents} tone={pulse.activeIncidents ? "warn" : "ok"} />
        </div>
      </div>

      {/* right — time, search, alerts, deploy */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          data-shell-time=""
          style={{ display: "flex", flexDirection: "column", textAlign: "right", lineHeight: 1.1 }}
        >
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
        <button
          className="btn btn-primary"
          data-shell-deploy-btn=""
          style={{ padding: "6px 12px", fontSize: 10 }}
          type="button"
        >
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

function formatCurrencyShort(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n.toLocaleString()}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
}

function AdminSideRail({ data }: { data: AdminDashboardData }) {
  const flowsCount = data.systemStatus.flows.length + data.systemStatus.dependencies.length;
  const activeAlerts = data.recentAlerts.entries.filter((a) => !a.suppressed && a.severity !== "info").length;
  const recipeCount = data.stats.totalRecipes;
  const ingredientCount = data.stats.totalIngredients;
  const commensals = data.pageTelemetry.commensals;

  const modules: ModuleEntry[] = [
    { id: "overview", label: "Overview", glyph: "orbital", badge: null, active: true },
    {
      id: "ops",
      label: "Operations",
      glyph: "crosshair",
      badge: flowsCount > 0 ? `${flowsCount} svc` : null,
    },
    {
      id: "engine",
      label: "Recommendation",
      glyph: "atom",
      badge: data.enginePerformance.live
        ? `${data.enginePerformance.totalCalculations.toLocaleString()} calc`
        : null,
    },
    {
      id: "agents",
      label: "Agent Mesh",
      glyph: "ring",
      badge: null,
    },
    {
      id: "users",
      label: "Practitioners",
      glyph: "diamond",
      badge: data.stats.totalUsers > 0 ? formatCount(data.stats.totalUsers) : null,
    },
    {
      id: "catalog",
      label: "Catalog",
      glyph: "bookmark",
      badge:
        recipeCount + ingredientCount > 0
          ? `${formatCount(recipeCount)} / ${formatCount(ingredientCount)}`
          : null,
    },
    {
      id: "commensal",
      label: "Commensal",
      glyph: "wave",
      badge: commensals > 0 ? String(commensals) : null,
    },
    {
      id: "commerce",
      label: "Commerce",
      glyph: "triangle-up-bar",
      badge: data.commerce.live ? formatCurrencyShort(data.commerce.mrr) : null,
    },
    {
      id: "moderation",
      label: "Moderation",
      glyph: "flask",
      badge: activeAlerts > 0 ? String(activeAlerts) : null,
      warn: activeAlerts > 0,
    },
    { id: "security", label: "Security", glyph: "spiral", badge: null },
    { id: "experiments", label: "Experiments", glyph: "triangle-down-bar", badge: null },
    { id: "deploys", label: "Deploys", glyph: "triangle-up", badge: null },
    { id: "audit", label: "Audit Log", glyph: "bookmark", badge: null },
    { id: "settings", label: "Settings", glyph: "settings", badge: null },
  ];

  const buildId =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.NEXT_PUBLIC_BUILD_ID ??
    "local";
  const region = process.env.NEXT_PUBLIC_VERCEL_REGION ?? "—";
  const pool = data.dbObservability.pool;
  const poolState =
    pool.total === 0
      ? "—"
      : `${pool.total - pool.idle}/${pool.max} busy${pool.waiting > 0 ? ` · ${pool.waiting} wait` : ""}`;
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "prod";

  return (
    <aside
      data-shell-rail=""
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
        {modules.map((m) => (
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
          <span
            className={`chip ${env === "production" || env === "prod" ? "chip-active" : ""}`}
            style={{ padding: "2px 8px", fontSize: 8 }}
          >
            PROD
          </span>
          <span
            className={`chip ${env === "preview" || env === "staging" ? "chip-active" : ""}`}
            style={{ padding: "2px 8px", fontSize: 8 }}
          >
            STAGING
          </span>
          <span
            className={`chip ${env === "development" || env === "dev" ? "chip-active" : ""}`}
            style={{ padding: "2px 8px", fontSize: 8 }}
          >
            DEV
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SideKv k="REGION" v={region} />
          <SideKv k="BUILD" v={`#${buildId}`} />
          <SideKv
            k="DB"
            v={
              data.dbObservability.live
                ? `pg · ${formatBytes(data.dbObservability.dbSizeBytes)}`
                : "pg · offline"
            }
          />
          <SideKv k="POOL" v={poolState} />
        </div>
      </div>
    </aside>
  );
}

function SideKv({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span className="t-mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--fg-mute)" }}>{k}</span>
      <span
        className="t-mono"
        style={{
          fontSize: 9.5,
          color: "var(--fg-dim)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 130,
        }}
      >
        {v}
      </span>
    </div>
  );
}

// ============================================================
// ARCHITECT CARD — identity + live alerts inbox
// ============================================================
function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const m = Math.round(ms / 60000);
  if (m < 1) return "<1m";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function ArchitectCard({
  user,
  recentAlerts,
}: {
  user: AdminDashboardData["user"];
  recentAlerts: AdminDashboardData["recentAlerts"];
}) {
  const alerts = recentAlerts.entries.slice(0, 5);
  const sevColor: Record<string, string> = {
    error: "var(--el-fire)",
    warn: "var(--accent)",
    info: "var(--fg-mute)",
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-tag" style={{ fontSize: 8.5 }}>HIGH ALCHEMIST · {user.role}</div>
          <div className="t-display" style={{ fontSize: 18, lineHeight: 1.1, marginTop: 2 }}>{user.name}</div>
          <div
            className="t-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-mute)",
              letterSpacing: "0.1em",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        <KvLine k="BADGE" v={user.badge} />
        <KvLine k="TIER" v={user.tier} accent />
        <KvLine k="JOINED" v={user.joined} />
        <KvLine k="REGION" v={process.env.NEXT_PUBLIC_VERCEL_REGION ?? "—"} />
        <KvLine k="ON CALL" v={user.onCall ? "YES · primary" : "no"} accent={user.onCall} />
        <KvLine k="2FA" v={user.onCall ? "hw key · ok" : "—"} />
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
        <div className="t-tag" style={{ marginBottom: 8 }}>
          ALERT INBOX ·{" "}
          {alerts.length === 0
            ? recentAlerts.live
              ? "system is quiet"
              : "alert source offline"
            : `${alerts.length} recent`}
        </div>
        {alerts.length === 0 ? (
          <div
            style={{
              padding: "18px 8px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 8,
              color: "var(--fg-mute)",
              fontSize: 11,
            }}
          >
            {recentAlerts.live ? "no alerts in window" : "alert_events unreachable"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {alerts.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 4px",
                  borderBottom: i === alerts.length - 1 ? "none" : "1px solid var(--line)",
                  opacity: a.suppressed ? 0.55 : 1,
                }}
              >
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.14em",
                    padding: "2px 7px",
                    borderRadius: 999,
                    color: sevColor[a.severity] ?? "var(--fg-mute)",
                    border: `1px solid ${sevColor[a.severity] ?? "var(--fg-mute)"}`,
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  {a.severity.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--fg-dim)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={a.title}
                >
                  {a.title}
                </span>
                <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
                  {formatRelative(a.triggeredAt)}
                </span>
              </div>
            ))}
          </div>
        )}
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
        borderBottom: "1px dashed var(--line)",
        gap: 6,
        minWidth: 0,
      }}
    >
      <span className="t-tag" style={{ fontSize: 8.5 }}>{k}</span>
      <span
        className="t-mono"
        style={{
          fontSize: 10,
          color: accent ? "var(--accent)" : "var(--fg-dim)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {v}
      </span>
    </div>
  );
}
