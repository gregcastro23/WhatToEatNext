"use client";

import Link from "next/link";
import type {
  CosmicYieldData,
  CosmicYieldSink,
} from "@/services/dashboardPanelsService";
import type { EconomyIntegrityData } from "@/services/economyIntegrityService";
import { Card } from "./hero";
import type { AdminDashboardData } from "./data";

// ============================================================
// LEDGER INTEGRITY — invariant checks + 24h flow decomposition
// Each sub-check degrades independently; a zeroed value with
// live:false renders as absence, never as a clean bill of health.
// ============================================================
const TONE_COLOR = {
  ok: "var(--el-earth)",
  warn: "var(--accent-2)",
  alarm: "#FF5252",
  none: "var(--fg-mute)",
} as const;

type IntegrityTone = keyof typeof TONE_COLOR;

function formatHoursAge(hours: number): string {
  if (hours < 1) return "<1h";
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function formatTokens(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function IntegrityTile({
  label,
  value,
  sub,
  tone,
  action,
}: {
  label: string;
  value: string;
  sub: string;
  tone: IntegrityTone;
  action?: { href: string; label: string };
}) {
  const color = TONE_COLOR[tone];
  return (
    <div
      style={{
        border:
          tone === "alarm"
            ? `1px solid color-mix(in oklch, ${color}, transparent 55%)`
            : "1px solid var(--line)",
        background:
          tone === "alarm"
            ? `linear-gradient(180deg, color-mix(in oklch, ${color}, transparent 92%), transparent)`
            : "rgba(255,255,255,0.012)",
        borderRadius: 8,
        padding: "9px 11px",
        minWidth: 0,
      }}
    >
      <div className="t-tag" style={{ fontSize: 8.5, marginBottom: 4 }}>
        {label}
      </div>
      <div className="t-num" style={{ fontSize: 15, color, lineHeight: 1.15 }}>
        {value}
      </div>
      <div
        className="t-mono"
        style={{ fontSize: 8.5, color: "var(--fg-mute)", marginTop: 3 }}
      >
        {sub}
        {action && (
          <>
            {" "}
            <Link
              href={action.href}
              style={{ color: "var(--accent-2)", textDecoration: "none" }}
            >
              {action.label}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The users behind a non-zero welcome-grant count, named.
 *
 * Rendered BELOW the tile row rather than inside the tile: the tiles sit in a
 * 3-column grid where a list of emails is unreadable, and this only appears
 * when the alarm is actually up. In the healthy case (every poll, in a healthy
 * production) it renders nothing and the panel keeps its compact shape.
 *
 * `missing` empty while the count is non-zero is NOT "nobody" — it means the
 * identity query failed while the count survived. Saying so is the honest
 * degradation; rendering an empty list under a count of 3 would read as a
 * contradiction the operator has to debug.
 *
 * Each name links to `/admin/users/[userId]`, which carries a GrantTokensModal
 * — so the link is the repair, not just a lookup. The bulk path stays
 * `scripts/backfillSignupGrants.ts`, which reads the same predicate.
 */
function MissingGrantRoster({
  count,
  missing,
}: {
  count: number;
  missing: EconomyIntegrityData["welcomeGrant"]["missing"];
}) {
  const unnamed = count - missing.length;
  return (
    <div
      style={{
        border: "1px solid color-mix(in oklch, var(--accent-2), transparent 65%)",
        borderRadius: 8,
        padding: "9px 11px",
        marginBottom: 12,
      }}
    >
      <div
        className="t-tag"
        style={{ fontSize: 8, marginBottom: 6, color: "var(--accent-2)" }}
      >
        WITHOUT A WELCOME GRANT · REPAIR ONE BELOW, OR ALL WITH
        scripts/backfillSignupGrants.ts
      </div>
      {missing.length === 0 ? (
        <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          {count.toLocaleString()} counted · identities unavailable (the count
          query succeeded, the identity query did not)
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {missing.map((u) => (
            <div
              key={u.id}
              className="t-mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 9,
                color: "var(--fg-dim)",
              }}
            >
              <Link
                href={`/admin/users/${u.id}`}
                style={{
                  color: "var(--accent-2)",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.email ?? u.id}
              </Link>
              <span style={{ flexShrink: 0, color: "var(--fg-mute)" }}>
                {u.createdAt ? relativeTime(u.createdAt) : "age unknown"}
              </span>
            </div>
          ))}
          {unnamed > 0 && (
            <div
              className="t-mono"
              style={{ fontSize: 8.5, color: "var(--fg-mute)", marginTop: 2 }}
            >
              + {unnamed.toLocaleString()} more not shown · newest{" "}
              {missing.length} listed
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlowColumn({
  title,
  rows,
  live,
  emptyLabel,
  color,
}: {
  title: string;
  rows: CosmicYieldSink[];
  live: boolean;
  emptyLabel: string;
  color: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.amount));
  return (
    <div style={{ minWidth: 0 }}>
      <div className="t-tag" style={{ fontSize: 8, marginBottom: 6 }}>
        {title}
      </div>
      {rows.length === 0 ? (
        <div
          className="t-mono"
          style={{ fontSize: 9, color: "var(--fg-mute)", padding: "6px 0" }}
        >
          {live ? emptyLabel : "ledger unavailable"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {rows.map((r) => (
            <div key={r.source}>
              <div
                className="t-mono"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: 8.5,
                  color: "var(--fg-dim)",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.source.replace(/_/g, " ")}
                </span>
                <span style={{ flexShrink: 0 }}>
                  {Math.round(r.amount).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  marginTop: 2,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(r.amount / max) * 100}%`,
                    height: "100%",
                    background: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlowStrip({
  flowSeries,
}: {
  flowSeries: CosmicYieldData["flowSeries"];
}) {
  const { days } = flowSeries;
  if (!flowSeries.live || days.length === 0) {
    return (
      <div
        style={{
          padding: "14px 12px",
          textAlign: "center",
          border: "1px dashed var(--line)",
          borderRadius: 8,
        }}
      >
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          {flowSeries.live
            ? "no ledger flow in the last 30d"
            : "flow series unavailable"}
        </span>
      </div>
    );
  }
  const max = Math.max(1, ...days.map((d) => Math.max(d.minted, d.burned)));
  return (
    <div>
      <div style={{ display: "flex", gap: 2 }}>
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date} · +${Math.round(d.minted).toLocaleString()} minted / −${Math.round(d.burned).toLocaleString()} burned`}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 20, display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${(d.minted / max) * 100}%`,
                  background: "var(--el-earth)",
                  borderRadius: 1,
                  opacity: 0.85,
                }}
              />
            </div>
            <div style={{ height: 1, background: "var(--line-hi)" }} />
            <div
              style={{ height: 20, display: "flex", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${(d.burned / max) * 100}%`,
                  background: "var(--el-fire)",
                  borderRadius: 1,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}
      >
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>
          ▲ minted · ▼ burned
        </span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>
          −30d → today
        </span>
      </div>
    </div>
  );
}

export function EconomyIntegrityPanel({
  integrity,
  cosmicYield,
}: {
  integrity: EconomyIntegrityData;
  cosmicYield: CosmicYieldData;
}) {
  const { drift, welcomeGrant, onchainClaims, solanaSupply } = integrity;

  const driftTile = !drift.live
    ? {
        value: "—",
        sub: "drift check unreadable",
        tone: "none" as IntegrityTone,
      }
    : drift.driftedUsers === 0
      ? {
          value: "ZERO DRIFT",
          sub: `${drift.checkedUsers.toLocaleString()} users checked`,
          tone: "ok" as IntegrityTone,
        }
      : {
          value: `${drift.driftedUsers.toLocaleString()} DRIFTED`,
          sub: `max |Δ| ${formatTokens(drift.maxAbsDelta)} · ${drift.checkedUsers.toLocaleString()} checked`,
          tone: "alarm" as IntegrityTone,
        };

  const grantTile = !welcomeGrant.live
    ? {
        value: "—",
        sub: "grant check unreadable",
        tone: "none" as IntegrityTone,
        action: undefined as { href: string; label: string } | undefined,
      }
    : welcomeGrant.humansWithoutGrant === 0
      ? {
          value: "COVERED",
          sub: "every non-agent holds a welcome grant",
          tone: "ok" as IntegrityTone,
          action: undefined,
        }
      : {
          value: welcomeGrant.humansWithoutGrant.toLocaleString(),
          // No link here any more: it used to point at an unfiltered
          // /admin/users, which cannot answer "which ones?". The roster below
          // names them and links each one directly.
          sub: "humans without grant · named below",
          tone: "warn" as IntegrityTone,
          action: undefined,
        };

  const claimsStuck =
    onchainClaims.pending > 0 &&
    onchainClaims.oldestPendingHours !== null &&
    onchainClaims.oldestPendingHours > 24;
  const claimsTile = !onchainClaims.live
    ? {
        value: "—",
        sub: "claims table unreadable",
        tone: "none" as IntegrityTone,
      }
    : onchainClaims.pending === 0
      ? {
          value: "CLEAR",
          sub: "no pending on-chain claims",
          tone: "ok" as IntegrityTone,
        }
      : {
          value: `${onchainClaims.pending.toLocaleString()} PENDING`,
          sub:
            onchainClaims.oldestPendingHours === null
              ? "oldest age unknown"
              : `oldest ${formatHoursAge(onchainClaims.oldestPendingHours)}`,
          tone: (claimsStuck ? "alarm" : "warn") as IntegrityTone,
        };

  const supplyTile = !solanaSupply.live
    ? {
        value: "—",
        sub: "Solana supply unreadable",
        tone: "none" as IntegrityTone,
      }
    : solanaSupply.violations.length > 0
      ? {
          value: `${solanaSupply.violations.length} OVER`,
          sub: "on-chain supply exceeds ledger",
          tone: "alarm" as IntegrityTone,
        }
      : {
          value: "BACKED",
          sub: `${solanaSupply.cluster} exact-atom check`,
          tone: "ok" as IntegrityTone,
        };

  const baseLiveChecks = [drift.live, welcomeGrant.live, onchainClaims.live].filter(
    Boolean,
  ).length;
  const totalChecks = solanaSupply.enabled ? 4 : 3;
  const liveChecks = baseLiveChecks + Number(solanaSupply.enabled && solanaSupply.live);
  const anyAlarm =
    driftTile.tone === "alarm" ||
    claimsTile.tone === "alarm" ||
    (solanaSupply.enabled && supplyTile.tone === "alarm");
  const badgeColor = anyAlarm
    ? "#FF5252"
    : liveChecks === totalChecks
      ? "var(--el-earth)"
      : "var(--fg-mute)";

  return (
    <Card
      title="Ledger Integrity"
      subtitle="balance drift · welcome grants · claims · Solana backing"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: badgeColor, letterSpacing: "0.14em" }}
        >
          {liveChecks === totalChecks ? "●" : "○"} {liveChecks}/{totalChecks} CHECKS
        </span>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalChecks}, minmax(0, 1fr))`,
          gap: 8,
          marginBottom: 12,
        }}
      >
        <IntegrityTile label="Balance drift" {...driftTile} />
        <IntegrityTile label="Welcome grants" {...grantTile} />
        <IntegrityTile label="On-chain claims" {...claimsTile} />
        {solanaSupply.enabled && (
          <IntegrityTile label="Solana backing" {...supplyTile} />
        )}
      </div>
      {welcomeGrant.live && welcomeGrant.humansWithoutGrant > 0 && (
        <MissingGrantRoster
          count={welcomeGrant.humansWithoutGrant}
          missing={welcomeGrant.missing}
        />
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 12,
        }}
      >
        <FlowColumn
          title="INFLOW · 24H · BY SOURCE"
          rows={cosmicYield.sources24h}
          live={cosmicYield.live}
          emptyLabel="no inflow recorded"
          color="var(--el-earth)"
        />
        <FlowColumn
          title="OUTFLOW · 24H · BY SINK"
          rows={cosmicYield.sinks24h}
          live={cosmicYield.live}
          emptyLabel="no outflow recorded"
          color="var(--el-fire)"
        />
      </div>
      <div className="t-tag" style={{ fontSize: 8, marginBottom: 6 }}>
        LEDGER FLOW · 30D DAILY
      </div>
      <FlowStrip flowSeries={cosmicYield.flowSeries} />
    </Card>
  );
}

// ============================================================
// RECENT SIGNUPS — the recentUsers contract data, rendered.
// Empty-and-live is a measured fact; empty-and-degraded is not.
// ============================================================
type RecentUser = AdminDashboardData["recentUsers"][number];

const ELEMENT_COLOR: Record<string, string> = {
  fire: "var(--el-fire)",
  water: "var(--el-water)",
  earth: "var(--el-earth)",
  air: "var(--el-air)",
};

function relativeTime(iso: string): string {
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

export function RecentSignupsPanel({
  users,
  live,
}: {
  users: RecentUser[];
  live: boolean;
}) {
  return (
    <Card
      title="Recent Signups"
      subtitle={
        live
          ? `${users.length} latest human signup${users.length === 1 ? "" : "s"}`
          : "user query degraded"
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
      {users.length === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            border: "1px dashed var(--line)",
            borderRadius: 8,
          }}
        >
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
            {live ? "no human signups recorded" : "user query degraded"}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {users.map((u, i) => {
            const el = u.dominantElement?.toLowerCase() ?? "";
            const elColor = ELEMENT_COLOR[el] ?? "var(--fg-faint)";
            return (
              <div
                key={u.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "10px 1fr 64px 56px",
                  gap: 10,
                  alignItems: "center",
                  padding: "7px 0",
                  borderBottom:
                    i === users.length - 1 ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  className="el-dot"
                  title={u.dominantElement ?? "no element set"}
                  style={{
                    background: elColor,
                    boxShadow:
                      elColor === "var(--fg-faint)" ? "none" : `0 0 6px ${elColor}`,
                  }}
                />
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "var(--fg)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.name ?? u.email}
                  </span>
                  {u.name && (
                    <span
                      className="t-mono"
                      style={{
                        display: "block",
                        fontSize: 8.5,
                        color: "var(--fg-mute)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.email}
                    </span>
                  )}
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    color: u.isActive ? "var(--el-earth)" : "var(--fg-mute)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {u.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    color: "var(--fg-mute)",
                    textAlign: "right",
                  }}
                >
                  {relativeTime(u.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
