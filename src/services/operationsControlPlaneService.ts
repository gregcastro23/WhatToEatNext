/**
 * Operations Control Plane
 *
 * The admin dashboard has dozens of live panels. This service turns those
 * independent observations into an operator decision surface: what is broken,
 * what is merely unobserved, what maintenance is due, and where to go next.
 *
 * The builder is deliberately pure. Collection remains in the existing
 * telemetry services; synthesis lives here so priority and scoring behaviour
 * can be tested without a database or network.
 */

import { SUSTAINED_COMPONENT } from "@/lib/observability/alertLog";
import type { AgentNetworkTelemetry } from "@/services/agentTelemetryService";
import type {
  CosmicYieldData,
  PlatformPulse,
  RecentAlertsData,
} from "@/services/dashboardPanelsService";
import type { FeedEmitStatus } from "@/services/feedEmitTracker";
import type { LaunchReadinessReport } from "@/services/launchReadinessService";
import type { OnboardingHealthPayload } from "@/services/onboardingHealthService";
import type {
  FlowHealth,
  FlowStatus,
  SystemStatusPayload,
} from "@/services/systemStatusService";

export type OperationsStatus = "HEALTHY" | "WATCH" | "CRITICAL" | "BLIND";
export type OperationsState = "NOMINAL" | "ATTENTION" | "CRITICAL";
export type OperationsPrioritySeverity = "P0" | "P1" | "P2";
export type PlanetaryIntegrationHealth =
  | "healthy"
  | "unhealthy"
  | "offline"
  | "unknown";

export interface PlanetaryIntegrationSnapshot {
  endpoints: {
    alchmNextApp: string;
    paUi: string;
    paBackend: string;
    wtenLegacyBackend: string;
  };
  health: PlanetaryIntegrationHealth;
  agentCount: number;
  lastFeedEmit: FeedEmitStatus | null;
  telemetry: AgentNetworkTelemetry | null;
}

export interface OperationsDomain {
  id: string;
  label: string;
  status: OperationsStatus;
  summary: string;
  href: string;
  metrics: Array<{ label: string; value: string }>;
}

export interface OperationsPriority {
  id: string;
  severity: OperationsPrioritySeverity;
  category: string;
  title: string;
  detail: string;
  href: string;
}

export interface OperationsMaintenanceItem {
  id: string;
  label: string;
  status: "CLEAR" | "WATCH" | "DUE";
  count: number;
  detail: string;
  href: string;
}

export interface CodebaseGap {
  id: string;
  label: string;
  category: "PLACEHOLDER_DATA" | "MISSING_INSTRUMENTATION" | "MISSING_WORKFLOW";
  severity: "P1" | "P2";
  detail: string;
  href: string;
}

export interface OperationsControlPlane {
  generatedAt: string;
  state: OperationsState;
  readinessScore: number;
  summary: string;
  coverage: {
    live: number;
    total: number;
    percent: number;
    blindSpots: string[];
  };
  rollout: {
    ready: number;
    total: number;
    partial: number;
    off: number;
  };
  codebase: {
    knownGaps: CodebaseGap[];
    highPriority: number;
  };
  domains: OperationsDomain[];
  priorities: OperationsPriority[];
  maintenance: OperationsMaintenanceItem[];
}

export interface OperationsControlPlaneInput {
  systemStatus: SystemStatusPayload;
  onboarding: OnboardingHealthPayload;
  cosmicYield: CosmicYieldData;
  launchReadiness: LaunchReadinessReport;
  recentAlerts: RecentAlertsData;
  planetaryIntegration: PlanetaryIntegrationSnapshot;
  pulse: PlatformPulse;
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    completedOnboarding: number;
    totalRecipes: number;
    totalIngredients: number;
    totalSubscriptions: number;
    totalTransactions: number;
  };
  observability: {
    catalog: boolean;
    database: boolean;
    engine: boolean;
    security: boolean;
    commerce: boolean;
    resources: boolean;
    deploys: boolean;
    featureFlags: boolean;
  };
  mockedFields: string[];
  codebaseGaps: CodebaseGap[];
}

const FLOW_HREF: Record<string, string> = {
  auth: "/admin/onboarding",
  onboarding: "/admin/onboarding",
  recommendations: "#engine",
  "ai-generation": "#engine",
  economy: "#economy",
  payments: "#commerce",
  agents: "#agents",
  mcp: "#agents",
  database: "#infrastructure",
};

const PRIORITY_RANK: Record<OperationsPrioritySeverity, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

function statusFromFlow(status: FlowStatus): OperationsStatus {
  if (status === "INCIDENT") return "CRITICAL";
  if (status === "DEGRADED") return "WATCH";
  if (status === "UNKNOWN") return "BLIND";
  return "HEALTHY";
}

function worstStatus(statuses: OperationsStatus[]): OperationsStatus {
  if (statuses.includes("CRITICAL")) return "CRITICAL";
  if (statuses.includes("WATCH")) return "WATCH";
  if (statuses.includes("BLIND")) return "BLIND";
  return "HEALTHY";
}

function findFlow(
  systemStatus: SystemStatusPayload,
  id: string,
): FlowHealth | undefined {
  return systemStatus.flows.find((flow) => flow.id === id);
}

function flowStatus(
  systemStatus: SystemStatusPayload,
  id: string,
): OperationsStatus {
  const flow = findFlow(systemStatus, id);
  return flow ? statusFromFlow(flow.status) : "BLIND";
}

function observedStatus(live: boolean): OperationsStatus {
  return live ? "HEALTHY" : "BLIND";
}

/** Collapse backend-specific health vocabulary at the API boundary. */
export function normalizePlanetaryHealth(
  health: string | null | undefined,
): PlanetaryIntegrationHealth {
  const normalized = health?.trim().toLowerCase();
  if (["healthy", "online", "ok", "ready"].includes(normalized ?? "")) {
    return "healthy";
  }
  if (["unhealthy", "degraded"].includes(normalized ?? "")) {
    return "unhealthy";
  }
  if (normalized === "offline") return "offline";
  return "unknown";
}

function isPlanetaryHealthy(health: PlanetaryIntegrationHealth): boolean {
  return health === "healthy";
}

function isPlanetaryReachable(health: PlanetaryIntegrationHealth): boolean {
  return health === "healthy" || health === "unhealthy";
}

function fmt(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function activeAlerts(recentAlerts: RecentAlertsData): number {
  // alert_events is transition history, not an open-incident table. Only the
  // newest transition for each component represents its current state; older
  // failures must not remain "active" after a later OK recovery.
  const latestByComponent = new Map<
    string,
    RecentAlertsData["entries"][number]
  >();
  for (const alert of recentAlerts.entries) {
    // The sustained-incident digest is a re-announcement of components already
    // counted here, not a component of its own. Counting it would inflate this
    // number by one for the entire life of any outage.
    if (alert.component === SUSTAINED_COMPONENT) continue;
    if (!latestByComponent.has(alert.component)) {
      latestByComponent.set(alert.component, alert);
    }
  }
  return [...latestByComponent.values()].filter(
    (alert) =>
      !alert.suppressed &&
      ["DEGRADED", "INCIDENT"].includes(alert.currentStatus.toUpperCase()),
  ).length;
}

function priorityFromFlow(flow: FlowHealth): OperationsPriority | null {
  if (flow.status === "OK") return null;
  const severity: OperationsPrioritySeverity =
    flow.status === "INCIDENT"
      ? "P0"
      : flow.status === "DEGRADED"
        ? "P1"
        : "P2";
  return {
    id: `flow-${flow.id}`,
    severity,
    category: flow.label,
    title:
      flow.status === "UNKNOWN"
        ? `${flow.label} is not observable`
        : `${flow.label} is ${flow.status.toLowerCase()}`,
    detail: flow.summary,
    href: FLOW_HREF[flow.id] ?? "#operations",
  };
}

/** Build the scored, actionable view consumed by the quantum control panel. */
export function buildOperationsControlPlane(
  input: OperationsControlPlaneInput,
): OperationsControlPlane {
  const {
    systemStatus,
    onboarding,
    cosmicYield,
    launchReadiness,
    recentAlerts,
    planetaryIntegration,
    pulse,
    stats,
    observability,
    mockedFields,
    codebaseGaps,
  } = input;

  const planetaryReachable = isPlanetaryReachable(planetaryIntegration.health);
  const planetaryHealthy = isPlanetaryHealthy(planetaryIntegration.health);
  const rollout = {
    ready: launchReadiness.readyCount,
    total: launchReadiness.subsystems.length,
    partial: launchReadiness.subsystems.filter(
      (item) => item.status === "PARTIAL",
    ).length,
    off: launchReadiness.subsystems.filter((item) => item.status === "OFF")
      .length,
  };
  const alertCount = activeAlerts(recentAlerts);
  const onboardingCompletion =
    stats.totalUsers > 0
      ? Math.round((stats.completedOnboarding / stats.totalUsers) * 100)
      : 0;

  const domains: OperationsDomain[] = [
    {
      id: "platform",
      label: "Core Platform",
      status: statusFromFlow(systemStatus.overall),
      summary:
        systemStatus.overall === "OK"
          ? "Critical user journeys are operating normally."
          : `${systemStatus.overall.toLowerCase()} platform signals require review.`,
      href: "#operations",
      metrics: [
        { label: "Availability", value: `${pulse.availability}%` },
        { label: "p95", value: `${pulse.p95}ms` },
        { label: "Open alerts", value: String(alertCount) },
      ],
    },
    {
      id: "identity-onboarding",
      label: "Identity & Onboarding",
      status: worstStatus([
        flowStatus(systemStatus, "auth"),
        flowStatus(systemStatus, "onboarding"),
        statusFromFlow(onboarding.overall),
        observedStatus(onboarding.live),
      ]),
      summary: onboarding.headline,
      href: "/admin/onboarding",
      metrics: [
        { label: "New · 24h", value: String(stats.newUsersToday) },
        { label: "Stuck", value: String(onboarding.stuckUsers.length) },
        { label: "All-time complete", value: `${onboardingCompletion}%` },
      ],
    },
    {
      id: "experience",
      label: "Culinary Intelligence",
      status: worstStatus([
        flowStatus(systemStatus, "recommendations"),
        flowStatus(systemStatus, "ai-generation"),
        observedStatus(observability.engine),
        observedStatus(observability.catalog),
      ]),
      summary: `${fmt(stats.totalRecipes)} recipes · ${fmt(stats.totalIngredients)} ingredients`,
      href: "#engine",
      metrics: [
        { label: "Recipes", value: fmt(stats.totalRecipes) },
        { label: "Ingredients", value: fmt(stats.totalIngredients) },
      ],
    },
    {
      id: "practitioners",
      label: "Practitioners",
      status: worstStatus([
        observedStatus(onboarding.live),
        flowStatus(systemStatus, "auth"),
      ]),
      summary: `${fmt(stats.activeUsers)} active of ${fmt(stats.totalUsers)} accounts`,
      href: "/admin/users",
      metrics: [
        { label: "Total", value: fmt(stats.totalUsers) },
        { label: "Active", value: fmt(stats.activeUsers) },
        { label: "Onboarded", value: fmt(stats.completedOnboarding) },
      ],
    },
    {
      id: "token-economy",
      label: "Token Economy",
      status: worstStatus([
        flowStatus(systemStatus, "economy"),
        observedStatus(cosmicYield.live),
      ]),
      summary: cosmicYield.live
        ? `${fmt(cosmicYield.inCirculation)} ESMS in circulation · ${cosmicYield.netFlow30d >= 0 ? "+" : ""}${fmt(cosmicYield.netFlow30d)} net 30d`
        : "Ledger rollup is unavailable.",
      href: "#economy",
      metrics: [
        { label: "Circulation", value: fmt(cosmicYield.inCirculation) },
        { label: "Minted · 30d", value: fmt(cosmicYield.minted30d) },
        { label: "Burned · 30d", value: fmt(cosmicYield.burned30d) },
      ],
    },
    {
      id: "planetary-agents",
      label: "Planetary Agents",
      status: worstStatus([
        flowStatus(systemStatus, "agents"),
        flowStatus(systemStatus, "mcp"),
        planetaryHealthy
          ? "HEALTHY"
          : planetaryReachable
            ? "WATCH"
            : "CRITICAL",
        observedStatus(Boolean(planetaryIntegration.telemetry?.allLive)),
      ]),
      summary: `${planetaryIntegration.agentCount} remote agents · backend ${planetaryIntegration.health || "unknown"}`,
      href: "#agents",
      metrics: [
        { label: "Agents", value: String(planetaryIntegration.agentCount) },
        {
          label: "Feed · 1h",
          value: planetaryIntegration.telemetry?.transmutationRate.value ?? "—",
        },
        {
          label: "MCP · 1h",
          value: planetaryIntegration.telemetry?.mcpInvocationRate.value ?? "—",
        },
      ],
    },
    {
      id: "commerce",
      label: "Commerce & Settlement",
      status: worstStatus([
        flowStatus(systemStatus, "payments"),
        observedStatus(observability.commerce),
        observedStatus(launchReadiness.settlement.live),
        launchReadiness.settlement.pending > 0 ? "CRITICAL" : "HEALTHY",
        rollout.partial > 0 ? "WATCH" : "HEALTHY",
      ]),
      summary:
        launchReadiness.settlement.pending > 0
          ? `${launchReadiness.settlement.pending} restaurant settlements require action.`
          : "No unresolved restaurant settlement backlog.",
      href: "/admin/settlements",
      metrics: [
        { label: "Paid subs", value: String(stats.totalSubscriptions) },
        {
          label: "Pending settlement",
          value: String(launchReadiness.settlement.pending),
        },
        { label: "Rollouts ready", value: `${rollout.ready}/${rollout.total}` },
      ],
    },
    {
      id: "infrastructure",
      label: "Data & Infrastructure",
      status: worstStatus([
        flowStatus(systemStatus, "database"),
        observedStatus(observability.database),
        observedStatus(observability.resources),
      ]),
      summary:
        "Database, connection pool, storage, and hosting resource telemetry.",
      href: "#infrastructure",
      metrics: [
        { label: "Ledger rows", value: fmt(stats.totalTransactions) },
        {
          label: "Resource meter",
          value: observability.resources ? "live" : "blind",
        },
      ],
    },
    {
      id: "trust",
      label: "Trust & Governance",
      status: worstStatus([
        observedStatus(observability.security),
        observedStatus(recentAlerts.live),
        alertCount > 0 ? "WATCH" : "HEALTHY",
      ]),
      summary:
        alertCount > 0
          ? `${alertCount} unsuppressed alerts are awaiting operator review.`
          : "No active trust or governance alerts.",
      href: "#trust",
      metrics: [
        { label: "Open alerts", value: String(alertCount) },
        { label: "Alert stream", value: recentAlerts.live ? "live" : "blind" },
      ],
    },
    {
      id: "delivery",
      label: "Delivery & Change",
      status: worstStatus([
        observedStatus(observability.deploys),
        observedStatus(observability.featureFlags),
      ]),
      summary: "Deploy history, feature gates, and audit trail coverage.",
      href: "#delivery",
      metrics: [
        { label: "Deploy", value: pulse.deployFreshness },
        {
          label: "Flags",
          value: observability.featureFlags ? "tracked" : "blind",
        },
      ],
    },
  ];

  const blindSignals: Array<[string, boolean]> = [
    ...systemStatus.flows.map((flow): [string, boolean] => [
      `${flow.label} flow`,
      flow.live,
    ]),
    ["Onboarding funnel", onboarding.live],
    ["Token ledger", cosmicYield.live],
    ["Alert history", recentAlerts.live],
    ["Planetary backend", planetaryReachable],
    ["Planetary telemetry", Boolean(planetaryIntegration.telemetry?.allLive)],
    ["Catalog telemetry", observability.catalog],
    ["Database telemetry", observability.database],
    ["Recommendation telemetry", observability.engine],
    ["Security telemetry", observability.security],
    ["Commerce telemetry", observability.commerce],
    ["Resource metering", observability.resources],
    ["Deploy history", observability.deploys],
    ["Feature flags", observability.featureFlags],
    ["Settlement queue", launchReadiness.settlement.live],
  ];
  const blindSpots = blindSignals
    .filter(([, live]) => !live)
    .map(([label]) => label);
  blindSpots.push(...mockedFields.map((field) => `Mocked: ${field}`));
  const coverageLive = blindSignals.filter(([, live]) => live).length;
  const coverageTotal = blindSignals.length + mockedFields.length;

  const priorities: OperationsPriority[] = systemStatus.flows
    .map(priorityFromFlow)
    .filter((item): item is OperationsPriority => item !== null);

  for (const dependency of systemStatus.dependencies) {
    if (dependency.status !== "DEGRADED" && dependency.status !== "INCIDENT") {
      continue;
    }
    priorities.push({
      id: `dependency-${dependency.id}`,
      severity: dependency.status === "INCIDENT" ? "P0" : "P1",
      category: dependency.label,
      title: `${dependency.label} dependency is ${dependency.status.toLowerCase()}`,
      detail: dependency.summary,
      href:
        dependency.id === "planetary-agents"
          ? "#agents"
          : dependency.id === "stripe"
            ? "#commerce"
            : "#operations",
    });
  }

  if (!planetaryHealthy) {
    priorities.push({
      id: "planetary-backend",
      severity: planetaryReachable ? "P1" : "P0",
      category: "Planetary Agents",
      title: planetaryReachable
        ? "Planetary Agents backend is degraded"
        : "Planetary Agents backend is offline",
      detail: `Remote health probe reports ${planetaryIntegration.health || "unknown"}; verify signed sync, feed emit, and MCP paths.`,
      href: "#agents",
    });
  }

  if (onboarding.stuckUsers.length > 0) {
    priorities.push({
      id: "onboarding-stuck",
      severity: onboarding.stuckUsers.length >= 5 ? "P1" : "P2",
      category: "Onboarding",
      title: `${onboarding.stuckUsers.length} ${onboarding.stuckUsers.length === 1 ? "user is" : "users are"} stuck in onboarding`,
      detail:
        "Review incomplete birth-data, natal-chart, and completion-flag transitions.",
      href: "/admin/onboarding",
    });
  }

  if (launchReadiness.settlement.pending > 0) {
    priorities.push({
      id: "settlement-backlog",
      severity: "P0",
      category: "Commerce",
      title: `${launchReadiness.settlement.pending} settlement ${launchReadiness.settlement.pending === 1 ? "is" : "are"} unresolved`,
      detail:
        "Tokens have been debited but restaurant transfers are not confirmed.",
      href: "/admin/settlements",
    });
  }

  for (const subsystem of launchReadiness.subsystems) {
    if (subsystem.status !== "PARTIAL") continue;
    priorities.push({
      id: `config-${subsystem.key}`,
      severity: "P2",
      category: "Rollout Readiness",
      title: `${subsystem.label} is only partially configured`,
      detail: `${subsystem.configured}/${subsystem.total} required configuration checks pass.`,
      href: "/admin/settings",
    });
  }

  if (!cosmicYield.live) {
    priorities.push({
      id: "blind-token-ledger",
      severity: "P1",
      category: "Token Economy",
      title: "Token ledger rollup is blind",
      detail:
        "Circulation, mint, burn, sink, and holder telemetry could not be verified.",
      href: "#economy",
    });
  }

  if (mockedFields.length > 0) {
    priorities.push({
      id: "mocked-dashboard-fields",
      severity: "P2",
      category: "Observability",
      title: `${mockedFields.length} dashboard ${mockedFields.length === 1 ? "field is" : "fields are"} still mocked`,
      detail: mockedFields.join(", "),
      href: "#infrastructure",
    });
  }

  for (const gap of codebaseGaps) {
    priorities.push({
      id: `codebase-${gap.id}`,
      severity: gap.severity,
      category: "Codebase Debt",
      title: gap.label,
      detail: gap.detail,
      href: gap.href,
    });
  }

  priorities.sort(
    (a, b) => PRIORITY_RANK[a.severity] - PRIORITY_RANK[b.severity],
  );

  const maintenance: OperationsMaintenanceItem[] = [
    {
      id: "onboarding-review",
      label: "Onboarding rescue",
      status: onboarding.stuckUsers.length > 0 ? "DUE" : "CLEAR",
      count: onboarding.stuckUsers.length,
      detail:
        onboarding.stuckUsers.length > 0
          ? "Inspect incomplete journey state and contact or recover the account through the user admin route."
          : "No users are stuck beyond the one-hour threshold.",
      href: "/admin/onboarding",
    },
    {
      id: "settlement-review",
      label: "Settlement reconciliation",
      status: !launchReadiness.settlement.live
        ? "WATCH"
        : launchReadiness.settlement.pending > 0
          ? "DUE"
          : "CLEAR",
      count: launchReadiness.settlement.pending,
      detail: launchReadiness.settlement.live
        ? "Resolve retry-required restaurant transfers before fulfillment drifts."
        : "Settlement queue cannot be observed.",
      href: "/admin/settlements",
    },
    {
      id: "alert-triage",
      label: "Incident triage",
      status: !recentAlerts.live ? "WATCH" : alertCount > 0 ? "DUE" : "CLEAR",
      count: alertCount,
      detail: recentAlerts.live
        ? "Review unsuppressed operational alerts and recent transitions."
        : "Alert history cannot be observed.",
      href: "#trust",
    },
    {
      id: "telemetry-repair",
      label: "Observability repair",
      status: blindSpots.length > 0 ? "DUE" : "CLEAR",
      count: blindSpots.length,
      detail:
        blindSpots.length > 0
          ? "Restore missing sources before treating green panels as proof."
          : "Every registered control-plane signal is live.",
      href: "#infrastructure",
    },
    {
      id: "rollout-review",
      label: "Rollout configuration",
      status: rollout.partial > 0 ? "DUE" : rollout.off > 0 ? "WATCH" : "CLEAR",
      count: rollout.partial,
      detail:
        rollout.partial > 0
          ? "Finish partially configured subsystems or intentionally turn them off."
          : rollout.off > 0
            ? `${rollout.off} subsystem${rollout.off === 1 ? " is" : "s are"} feature-gated off.`
            : "All registered rollout subsystems are ready.",
      href: "/admin/settings",
    },
    {
      id: "agent-network-review",
      label: "Agent network continuity",
      status: !planetaryHealthy
        ? "DUE"
        : planetaryIntegration.lastFeedEmit
          ? "CLEAR"
          : "WATCH",
      count: planetaryHealthy ? 0 : 1,
      detail: planetaryIntegration.lastFeedEmit
        ? `Last feed emit: ${planetaryIntegration.lastFeedEmit.eventType} (${planetaryIntegration.lastFeedEmit.responseCode}).`
        : "No in-process feed emit has been observed; confirm durable agent telemetry.",
      href: "#agents",
    },
  ];

  const criticalDomains = domains.filter(
    (item) => item.status === "CRITICAL",
  ).length;
  const watchDomains = domains.filter((item) => item.status === "WATCH").length;
  const blindDomains = domains.filter((item) => item.status === "BLIND").length;
  const codebasePenalty = codebaseGaps.reduce(
    (sum, gap) => sum + (gap.severity === "P1" ? 3 : 1),
    0,
  );
  // This is an operator triage score, not a product KPI. Incidents consume a
  // large fixed slice so one broken domain cannot hide behind many green ones;
  // degraded and blind domains carry smaller penalties, and each individual
  // missing source adds a final observability penalty. Registered codebase
  // gaps are intentionally lighter than live incidents, but prevent a known
  // placeholder-heavy dashboard from claiming 100% readiness. The weights are
  // policy, deliberately centralized here and boundary-tested above.
  const readinessScore = Math.max(
    0,
    Math.round(
      100 -
        criticalDomains * 15 -
        watchDomains * 6 -
        blindDomains * 4 -
        blindSpots.length * 2 -
        codebasePenalty,
    ),
  );
  const state: OperationsState =
    criticalDomains > 0 || priorities.some((item) => item.severity === "P0")
      ? "CRITICAL"
      : watchDomains > 0 || blindDomains > 0 || priorities.length > 0
        ? "ATTENTION"
        : "NOMINAL";

  return {
    generatedAt: new Date().toISOString(),
    state,
    readinessScore,
    summary:
      state === "CRITICAL"
        ? `${criticalDomains} critical domain${criticalDomains === 1 ? "" : "s"} · immediate operator action required`
        : state === "ATTENTION"
          ? `${watchDomains + blindDomains} domain${watchDomains + blindDomains === 1 ? "" : "s"} need attention · ${blindSpots.length} blind spot${blindSpots.length === 1 ? "" : "s"}`
          : "Every registered domain is healthy and observable.",
    coverage: {
      live: coverageLive,
      total: coverageTotal,
      percent:
        coverageTotal > 0
          ? Math.round((coverageLive / coverageTotal) * 100)
          : 100,
      blindSpots,
    },
    rollout,
    codebase: {
      knownGaps: codebaseGaps,
      highPriority: codebaseGaps.filter((gap) => gap.severity === "P1").length,
    },
    domains,
    priorities,
    maintenance,
  };
}
