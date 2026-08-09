"use client";

import Link from "next/link";
import React from "react";
import type { OperationsStatus } from "@/services/operationsControlPlaneService";
import { Glyph } from "./atoms";
import type { AdminDashboardData } from "./data";

interface Props {
  data: AdminDashboardData;
}

const STATUS_COLOR: Record<OperationsStatus, string> = {
  HEALTHY: "var(--el-earth)",
  WATCH: "var(--accent-2)",
  CRITICAL: "#FF5252",
  BLIND: "var(--fg-mute)",
};

const PRIORITY_COLOR = {
  P0: "#FF5252",
  P1: "var(--accent-2)",
  P2: "var(--el-water)",
} as const;

const MAINTENANCE_COLOR = {
  CLEAR: "var(--el-earth)",
  WATCH: "var(--accent-2)",
  DUE: "#FF5252",
} as const;

function statusColor(status: OperationsStatus): string {
  return STATUS_COLOR[status];
}

function QuickRoute({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="btn btn-ghost"
      style={{ padding: "7px 10px", fontSize: 8.5, textDecoration: "none" }}
    >
      {label}
      {badge && (
        <span
          className="t-mono"
          style={{
            padding: "1px 5px",
            borderRadius: 999,
            color: "var(--accent-2)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function HeadlineMetric({
  label,
  value,
  detail,
  color = "var(--fg)",
}: {
  label: string;
  value: string;
  detail: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: "11px 12px",
        borderRight: "1px solid var(--line)",
        minWidth: 0,
      }}
    >
      <div className="t-tag" style={{ fontSize: 8, marginBottom: 5 }}>
        {label}
      </div>
      <div className="t-num" style={{ fontSize: 19, color, lineHeight: 1.1 }}>
        {value}
      </div>
      <div
        style={{
          color: "var(--fg-mute)",
          fontSize: 9.5,
          marginTop: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={detail}
      >
        {detail}
      </div>
    </div>
  );
}

/**
 * The synthesis layer for the dashboard: independent telemetry becomes an
 * ordered work queue, domain coverage matrix, maintenance board, and operator
 * routes. This is intentionally first in the dashboard's long-form body.
 */
export function OperationsControlPlane({ data }: Props) {
  const {
    operations,
    onboardingHealth,
    launchReadiness,
    planetaryIntegration,
  } = data;
  const stateColor =
    operations.state === "NOMINAL"
      ? "var(--el-earth)"
      : operations.state === "ATTENTION"
        ? "var(--accent-2)"
        : "#FF5252";
  const p0 = operations.priorities.filter(
    (item) => item.severity === "P0",
  ).length;
  const due = operations.maintenance.filter(
    (item) => item.status === "DUE",
  ).length;
  const maxFunnel = Math.max(
    1,
    ...onboardingHealth.funnel.map((stage) => stage.count),
  );
  const rolloutNeedsWork = launchReadiness.subsystems.filter(
    (subsystem) => subsystem.status !== "READY",
  );
  const warming = operations.domains.length === 0;

  return (
    <section
      id="operations"
      className="panel-glow quantum-control-plane"
      style={{ marginBottom: 12, overflow: "hidden", scrollMarginTop: 70 }}
    >
      <div
        style={{
          padding: "16px 18px 14px",
          borderBottom: "1px solid var(--line)",
          background:
            "radial-gradient(650px 180px at 0% 0%, var(--accent-glow), transparent 70%), rgba(255,255,255,0.008)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 260,
            }}
          >
            <div
              aria-label={`Operational readiness ${operations.readinessScore} percent`}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                padding: 5,
                background: `conic-gradient(${stateColor} ${operations.readinessScore}%, rgba(255,255,255,0.06) 0)`,
                boxShadow: `0 0 28px color-mix(in oklch, ${stateColor}, transparent 75%)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "var(--bg)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="t-num"
                  style={{ fontSize: 20, color: stateColor, lineHeight: 1 }}
                >
                  {operations.readinessScore}
                </span>
                <span
                  className="t-mono"
                  style={{ fontSize: 7, color: "var(--fg-mute)" }}
                >
                  READINESS
                </span>
              </div>
            </div>
            <div>
              <div
                className="t-tag"
                style={{ color: stateColor, marginBottom: 3 }}
              >
                QUANTUM CONTROL PLANE · {operations.state}
              </div>
              <h2
                className="t-display"
                style={{ fontSize: 25, margin: 0, lineHeight: 1.1 }}
              >
                The work that matters, in order
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "var(--fg-dim)",
                  fontSize: 11.5,
                }}
              >
                {operations.summary}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: 760,
            }}
          >
            <QuickRoute
              href="/admin/users"
              label="Users"
              badge={String(data.stats.totalUsers)}
            />
            <QuickRoute
              href="/admin/onboarding"
              label="Onboarding"
              badge={
                onboardingHealth.stuckUsers.length > 0
                  ? `${onboardingHealth.stuckUsers.length} stuck`
                  : "clear"
              }
            />
            <QuickRoute href="#economy" label="Token economy" />
            <QuickRoute
              href="#agents"
              label="Agent mesh"
              badge={String(planetaryIntegration.agentCount)}
            />
            <QuickRoute href="/admin/mcp" label="MCP" />
            <QuickRoute
              href="/admin/settlements"
              label="Settlements"
              badge={String(launchReadiness.settlement.pending)}
            />
            <QuickRoute href="/admin/chat-reports" label="Moderation" />
            <QuickRoute href="/admin/settings" label="Settings" />
          </div>
        </div>
      </div>

      <div
        className="quantum-headline-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <HeadlineMetric
          label="Signal coverage"
          value={`${operations.coverage.percent}%`}
          detail={`${operations.coverage.live}/${operations.coverage.total} sources live`}
          color={
            operations.coverage.percent === 100
              ? "var(--el-earth)"
              : "var(--accent-2)"
          }
        />
        <HeadlineMetric
          label="Priority work"
          value={String(operations.priorities.length)}
          detail={`${p0} immediate · ${operations.priorities.length - p0} queued`}
          color={
            p0 > 0
              ? "#FF5252"
              : operations.priorities.length > 0
                ? "var(--accent-2)"
                : "var(--el-earth)"
          }
        />
        <HeadlineMetric
          label="Maintenance"
          value={String(due)}
          detail={`${operations.maintenance.length} registered routines`}
          color={due > 0 ? "var(--accent-2)" : "var(--el-earth)"}
        />
        <HeadlineMetric
          label="Rollout readiness"
          value={`${operations.rollout.ready}/${operations.rollout.total}`}
          detail={`${operations.rollout.partial} partial · ${operations.rollout.off} gated`}
        />
        <HeadlineMetric
          label="Onboarding API"
          value={
            onboardingHealth.apiHealth.observed
              ? `${(onboardingHealth.apiHealth.successRate * 100).toFixed(0)}%`
              : "—"
          }
          detail={`${onboardingHealth.apiHealth.count} calls · p95 ${onboardingHealth.apiHealth.p95LatencyMs}ms`}
          color={
            onboardingHealth.overall === "OK"
              ? "var(--el-earth)"
              : "var(--accent-2)"
          }
        />
        <HeadlineMetric
          label="Planetary backend"
          value={planetaryIntegration.health.toUpperCase()}
          detail={`${planetaryIntegration.agentCount} agents · ${planetaryIntegration.telemetry?.mcpInvocationRate.value ?? "MCP blind"}`}
          color={
            operations.domains.find((item) => item.id === "planetary-agents")
              ? statusColor(
                  operations.domains.find(
                    (item) => item.id === "planetary-agents",
                  )!.status,
                )
              : "var(--fg-mute)"
          }
        />
      </div>

      <div
        className="dash-stack quantum-primary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "0.92fr 1.55fr",
          gap: 0,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRight: "1px solid var(--line)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <div className="t-tag">PRIORITY QUEUE</div>
              <div
                style={{ fontSize: 11, color: "var(--fg-mute)", marginTop: 3 }}
              >
                Live failures, blind spots, and unfinished rollout work
              </div>
            </div>
            <span className="chip" style={{ fontSize: 8 }}>
              {operations.priorities.length} OPEN
            </span>
          </div>

          {operations.priorities.length === 0 ? (
            <div
              style={{
                border:
                  "1px dashed color-mix(in oklch, var(--el-earth), transparent 55%)",
                borderRadius: 10,
                padding: "28px 14px",
                textAlign: "center",
                color: "var(--el-earth)",
                background:
                  "color-mix(in oklch, var(--el-earth), transparent 94%)",
              }}
            >
              <Glyph name="check" size={22} />
              <div
                className="t-mono"
                style={{ fontSize: 10, letterSpacing: "0.12em", marginTop: 8 }}
              >
                {warming
                  ? "CONTROL PLANE · SYNTHESIZING"
                  : "NO ACTIONABLE WEAK POINTS"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {operations.priorities.slice(0, 8).map((item) => {
                const color = PRIORITY_COLOR[item.severity];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "38px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                      padding: "9px 10px",
                      border: "1px solid var(--line)",
                      borderLeft: `2px solid ${color}`,
                      borderRadius: 8,
                      color: "inherit",
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.012)",
                    }}
                  >
                    <span
                      className="t-mono"
                      style={{ color, fontSize: 10, fontWeight: 700 }}
                    >
                      {item.severity}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 11.5,
                          color: "var(--fg)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 9.5,
                          color: "var(--fg-mute)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                        title={item.detail}
                      >
                        {item.category} · {item.detail}
                      </span>
                    </span>
                    <Glyph
                      name="chevron"
                      size={11}
                      style={{ color: "var(--fg-mute)" }}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: 16, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <div className="t-tag">DOMAIN PULSE · ENTIRE SITE</div>
              <div
                style={{ fontSize: 11, color: "var(--fg-mute)", marginTop: 3 }}
              >
                Business health and observability are scored independently
              </div>
            </div>
            <span
              className="t-mono"
              style={{ fontSize: 9, color: "var(--fg-mute)" }}
            >
              {
                operations.domains.filter((item) => item.status === "HEALTHY")
                  .length
              }
              /{operations.domains.length} GREEN
            </span>
          </div>
          <div
            className="quantum-domain-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 7,
            }}
          >
            {operations.domains.map((item) => {
              const color = statusColor(item.status);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    padding: "10px 11px",
                    border: "1px solid var(--line)",
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.012)",
                    color: "inherit",
                    textDecoration: "none",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: color,
                          boxShadow: `0 0 8px ${color}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "var(--fg)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span className="t-mono" style={{ fontSize: 7.5, color }}>
                      {item.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 9.5,
                      color: "var(--fg-mute)",
                      margin: "5px 0 8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.summary}
                  >
                    {item.summary}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {item.metrics.map((metric) => (
                      <span
                        key={metric.label}
                        className="t-mono"
                        style={{ fontSize: 8.5, color: "var(--fg-dim)" }}
                      >
                        <span style={{ color: "var(--fg-mute)" }}>
                          {metric.label}
                        </span>{" "}
                        {metric.value}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="dash-stack quantum-secondary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr 0.9fr",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            padding: 16,
            borderRight: "1px solid var(--line)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 11,
            }}
          >
            <div>
              <div className="t-tag">ONBOARDING ROUTE</div>
              <div
                style={{ fontSize: 10, color: "var(--fg-mute)", marginTop: 3 }}
              >
                {onboardingHealth.headline}
              </div>
            </div>
            <Link
              href="/admin/onboarding"
              className="btn btn-ghost"
              style={{
                padding: "5px 8px",
                fontSize: 8,
                textDecoration: "none",
              }}
            >
              OPEN OPS
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {onboardingHealth.funnel.map((stage, index) => (
              <div key={stage.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>
                    {stage.label}
                  </span>
                  <span
                    className="t-mono"
                    style={{ fontSize: 9.5, color: "var(--fg)" }}
                  >
                    {stage.count}
                    {index > 0 && stage.dropOff > 0 && (
                      <span style={{ color: "var(--accent-2)", marginLeft: 6 }}>
                        −{Math.round(stage.dropOff * 100)}%
                      </span>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(stage.count > 0 ? 4 : 0, (stage.count / maxFunnel) * 100)}%`,
                      background:
                        index === onboardingHealth.funnel.length - 1
                          ? "var(--el-earth)"
                          : "var(--accent)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {onboardingHealth.stuckUsers.length > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div
                className="t-tag"
                style={{ color: "var(--accent-2)", marginBottom: 6 }}
              >
                RESCUE QUEUE · {onboardingHealth.stuckUsers.length}
              </div>
              {onboardingHealth.stuckUsers.slice(0, 3).map((user) => (
                <Link
                  key={user.userId}
                  href={`/admin/users/${user.userId}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "5px 0",
                    color: "inherit",
                    textDecoration: "none",
                    borderBottom: "1px dashed var(--line)",
                  }}
                >
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 9.5,
                      color: "var(--fg-dim)",
                    }}
                  >
                    {user.email}
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 8.5,
                      color: "var(--accent-2)",
                      flexShrink: 0,
                    }}
                  >
                    {user.ageHours}h · {user.missing}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: 16,
            borderRight: "1px solid var(--line)",
            minWidth: 0,
          }}
        >
          <div className="t-tag" style={{ marginBottom: 10 }}>
            MAINTENANCE BOARD
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {operations.maintenance.map((item) => {
              const color = MAINTENANCE_COLOR[item.status];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "8px 1fr auto",
                    gap: 8,
                    alignItems: "center",
                    color: "inherit",
                    textDecoration: "none",
                    padding: "7px 8px",
                    border: "1px solid var(--line)",
                    borderRadius: 7,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 99,
                      background: color,
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10.5,
                        color: "var(--fg)",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 8.5,
                        color: "var(--fg-mute)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.detail}
                    >
                      {item.detail}
                    </span>
                  </span>
                  <span className="t-mono" style={{ fontSize: 8, color }}>
                    {item.status}
                    {item.count > 0 ? ` · ${item.count}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ padding: 16, minWidth: 0 }}>
          <div className="t-tag" style={{ marginBottom: 10 }}>
            ROLLOUT & BLIND SPOTS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 5,
              marginBottom: 10,
            }}
          >
            {(["READY", "PARTIAL", "OFF"] as const).map((status) => {
              const count = launchReadiness.subsystems.filter(
                (item) => item.status === status,
              ).length;
              const color =
                status === "READY"
                  ? "var(--el-earth)"
                  : status === "PARTIAL"
                    ? "var(--accent-2)"
                    : "var(--fg-mute)";
              return (
                <div
                  key={status}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 7,
                    padding: "7px 5px",
                    textAlign: "center",
                  }}
                >
                  <div className="t-num" style={{ color, fontSize: 15 }}>
                    {count}
                  </div>
                  <div
                    className="t-mono"
                    style={{ color: "var(--fg-mute)", fontSize: 7 }}
                  >
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
          {rolloutNeedsWork.slice(0, 4).map((subsystem) => (
            <Link
              key={subsystem.key}
              href="/admin/settings"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                padding: "5px 0",
                borderBottom: "1px dashed var(--line)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "var(--fg-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subsystem.label}
              </span>
              <span
                className="t-mono"
                style={{
                  fontSize: 8,
                  color:
                    subsystem.status === "PARTIAL"
                      ? "var(--accent-2)"
                      : "var(--fg-mute)",
                  flexShrink: 0,
                }}
              >
                {subsystem.configured}/{subsystem.total}
              </span>
            </Link>
          ))}

          <div className="t-tag" style={{ margin: "13px 0 7px" }}>
            OBSERVABILITY GAPS · {operations.coverage.blindSpots.length}
          </div>
          {operations.coverage.total === 0 ? (
            <div
              className="t-mono"
              style={{ color: "var(--fg-mute)", fontSize: 9 }}
            >
              ○ SOURCE REGISTRY WARMING
            </div>
          ) : operations.coverage.blindSpots.length === 0 ? (
            <div
              className="t-mono"
              style={{ color: "var(--el-earth)", fontSize: 9 }}
            >
              ● ALL REGISTERED SOURCES LIVE
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {operations.coverage.blindSpots.slice(0, 8).map((label) => (
                <span
                  key={label}
                  className="chip"
                  style={{
                    padding: "2px 6px",
                    fontSize: 7.5,
                    color: "var(--accent-2)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="t-tag" style={{ margin: "13px 0 7px" }}>
            KNOWN CODEBASE GAPS · {operations.codebase.knownGaps.length}
          </div>
          {operations.codebase.knownGaps.length === 0 ? (
            <div
              className="t-mono"
              style={{ color: "var(--el-earth)", fontSize: 9 }}
            >
              ● NO REGISTERED IMPLEMENTATION DEBT
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {operations.codebase.knownGaps.slice(0, 5).map((gap) => (
                <Link
                  key={gap.id}
                  href={gap.href}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "5px 0",
                    borderBottom: "1px dashed var(--line)",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                  title={gap.detail}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--fg-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {gap.label}
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 8,
                      color:
                        gap.severity === "P1"
                          ? "var(--accent-2)"
                          : "var(--el-water)",
                      flexShrink: 0,
                    }}
                  >
                    {gap.severity}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div
            style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}
          >
            {planetaryIntegration.endpoints.paUi && (
              <a
                href={planetaryIntegration.endpoints.paUi}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{
                  padding: "5px 7px",
                  fontSize: 7.5,
                  textDecoration: "none",
                }}
              >
                PA CONSOLE ↗
              </a>
            )}
            <Link
              href="/admin/mcp"
              className="btn btn-ghost"
              style={{
                padding: "5px 7px",
                fontSize: 7.5,
                textDecoration: "none",
              }}
            >
              MCP NETWORK
            </Link>
            <Link
              href="/admin/settings"
              className="btn btn-ghost"
              style={{
                padding: "5px 7px",
                fontSize: 7.5,
                textDecoration: "none",
              }}
            >
              CONFIG REGISTRY
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
