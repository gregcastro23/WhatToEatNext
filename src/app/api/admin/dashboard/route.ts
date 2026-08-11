/**
 * Admin Dashboard API Route
 * GET /api/admin/dashboard - Telemetry payload for the High Alchemist dashboard
 *
 * @requires Authentication - Admin role required
 *
 * Response shape: `AdminDashboardData` from src/app/admin/_dashboard/data.ts.
 * Every telemetry panel is wired to a live source (user database, request
 * log, ephemeris, Postgres stat views, Planetary Agents backend); only the
 * admin identity card is static. `meta.mockedFields` lists any panels still
 * on explicitly-labelled illustrative data.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { AdminDashboardData } from "@/app/admin/_dashboard/data";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  getAdminUserStats,
  getRecentHumanSignups,
} from "@/services/adminStatsService";
import { getAgentNetworkTelemetry } from "@/services/agentTelemetryService";
import { getCronHeartbeats } from "@/services/cronHeartbeatService";
import {
  getAuditEvents,
  getCatalogTrending,
  getCosmicYield,
  getDatabaseObservability,
  getErrorGroupSummary,
  getPlatformPulse,
  getEnginePerformance,
  getPractitionerCohorts,
  getCommerceTelemetry,
  getPageTelemetry,
  getRecentAlerts,
  getLivingEconomyMetrics,
  getRequestHourlySeries,
  getSecuritySummary,
  getDeployHistory,
  getFeatureFlags,
  getResourceUsage,
  getPractitionerGeo,
  getCohortRetention,
} from "@/services/dashboardPanelsService";
import { getEconomyIntegrity } from "@/services/economyIntegrityService";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { getTriageQueue } from "@/services/githubTriageService";
import { getLaunchReadiness } from "@/services/launchReadinessService";
import { getLiveActivity } from "@/services/liveActivityService";
import { getMigrationStatus } from "@/services/migrationStatusService";
import { getOnboardingHealth } from "@/services/onboardingHealthService";
import {
  buildOperationsControlPlane,
  normalizePlanetaryHealth,
  type CodebaseGap,
} from "@/services/operationsControlPlaneService";
import { getSkyConditions } from "@/services/skyConditionsService";
import { getSubscriptionRevenueBreakdown } from "@/services/subscriptionRevenueService";
import { getSystemStatus } from "@/services/systemStatusService";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Safe (non-throwing) resolver: the admin dashboard is a monitoring surface and
// must render even when a dependency URL is unconfigured.
const PA_BACKEND_URL = getServiceUrlSafe("planetaryAgentsApi");

// Known implementation debt that is visible from the admin surface. Keeping
// this registry beside the payload assembly makes unfinished work explicit in
// production instead of hiding it behind a permanently-empty `mockedFields`.
const KNOWN_CODEBASE_GAPS: CodebaseGap[] = [
  {
    id: "api-volume-heatmap",
    label: "API volume heatmap is not instrumented",
    category: "MISSING_INSTRUMENTATION",
    severity: "P1",
    detail:
      "Persist per-route hourly request counts before enabling the heatmap for capacity decisions.",
    href: "#infrastructure",
  },
  {
    id: "canonical-route-performance",
    label: "Canonical route latency and error rates are not captured",
    category: "MISSING_INSTRUMENTATION",
    severity: "P1",
    detail:
      "The route matrix has live row counts but no per-route request, latency, or error aggregation.",
    href: "#infrastructure",
  },
  {
    id: "recipe-quality-sems",
    label: "Recipe-level SEMS quality scores are not captured",
    category: "MISSING_INSTRUMENTATION",
    severity: "P1",
    detail:
      "Recipe ingestion does not persist the per-axis quality scores rendered by the inspector.",
    href: "#engine",
  },
  {
    id: "token-flow-series",
    label: "Token mint/burn trend lacks time-series telemetry",
    category: "MISSING_INSTRUMENTATION",
    severity: "P1",
    detail:
      "The ledger provides 30-day totals, but no dated daily aggregates are persisted.",
    href: "#economy",
  },
  {
    id: "sems-rollup",
    label: "SEMS thermodynamic rollup is illustrative",
    category: "PLACEHOLDER_DATA",
    severity: "P2",
    detail:
      "Add a persisted per-recipe SEMS rollup before restoring this sample panel.",
    href: "#engine",
  },
  {
    id: "recommendation-evals",
    label: "Recommendation eval and canary controls are not wired",
    category: "MISSING_WORKFLOW",
    severity: "P2",
    detail:
      "NDCG, MAP, canary promotion, and rollback have no operator workflow yet.",
    href: "#engine",
  },
  {
    id: "billing-analytics",
    label: "Billing retention analytics are not wired",
    category: "MISSING_INSTRUMENTATION",
    severity: "P2",
    detail:
      "Subscription mix, churn, lifetime value, and free-to-pro conversion are absent.",
    href: "#commerce",
  },
  {
    id: "agent-reasoning-traces",
    label: "Agent step-level traces are not instrumented",
    category: "MISSING_INSTRUMENTATION",
    severity: "P2",
    detail:
      "Only agent-chat decision previews exist; no structured trace event or table is emitted.",
    href: "#agents",
  },
  {
    id: "agent-topology-state",
    label: "Agent topology node states are decorative",
    category: "PLACEHOLDER_DATA",
    severity: "P2",
    detail:
      "Role counts are live, but per-node healthy, warning, and idle states are not backed by agent heartbeat data.",
    href: "#agents",
  },
  {
    id: "dashboard-visual-traces",
    label: "Dashboard pulse and KPI mini-traces are illustrative",
    category: "PLACEHOLDER_DATA",
    severity: "P2",
    detail:
      "Headline values are live, but the hero line and KPI sparkline shapes are synthesized because time-series samples are not stored.",
    href: "#overview",
  },
  {
    id: "sky-event-projections",
    label: "Upcoming sky-event impact projections are illustrative",
    category: "PLACEHOLDER_DATA",
    severity: "P2",
    detail:
      "Future event timing and projected site impact are not backed by a forecast feed.",
    href: "#engine",
  },
];

/**
 * Helper to fetch external APIs safely with a timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 2000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

function getAgentCount(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  if (!payload || typeof payload !== "object") return 0;

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.agents)) return record.agents.length;
  if (typeof record.count === "number") return record.count;
  if (typeof record.total === "number") return record.total;

  return 0;
}

/**
 * Run a scalar COUNT query, degrading to 0 on any failure so a single missing
 * table or transient DB error can't fail the entire dashboard payload.
 */
async function safeCount(label: string, sql: string): Promise<number> {
  try {
    const result = await executeQuery(sql);
    return Number(result.rows[0]?.count ?? 0);
  } catch (error) {
    console.error(`[admin/dashboard] ${label} count failed:`, error);
    return 0;
  }
}

/**
 * Assemble everything except the per-admin identity card. Memoized for 5s by
 * GET so bursts (both admin surfaces poll this endpoint at 30s, plus extra
 * tabs) coalesce into one ~35-query fan-out instead of one per request.
 */
async function assembleTelemetryCore() {
  {
    // SQL aggregates replace the former getAllUsers() full-table read; the
    // stats payload now carries its own honest `live` flag instead of
    // silently rendering zeros on failure.
    const [
      userStats,
      recentSignups,
      totalRecipes,
      totalIngredients,
      totalSubscriptions,
      totalTransactions,
    ] = await Promise.all([
      getAdminUserStats(),
      getRecentHumanSignups(),
      safeCount("recipes", "SELECT COUNT(*)::integer AS count FROM recipes"),
      safeCount(
        "ingredients",
        "SELECT COUNT(*)::integer AS count FROM ingredients",
      ),
      // Only Stripe-backed subs are paying customers; provisioned/agent
      // accounts (no stripe_subscription_id) are not revenue. Falls back to 0
      // on failure, matching the safeCount() graceful-degradation pattern.
      getSubscriptionRevenueBreakdown()
        .then((b) => b.paidSubs)
        .catch(() => 0),
      safeCount(
        "token transactions",
        "SELECT COUNT(*)::integer AS count FROM token_transactions",
      ),
    ]);

    const now = new Date();

    const stats = {
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      newUsersToday: userStats.newUsersToday,
      completedOnboarding: userStats.completedOnboarding,
      humanUsers: userStats.humanUsers,
      agentUsers: userStats.agentUsers,
      totalRecipes,
      totalIngredients,
      totalSubscriptions,
      totalTransactions,
      live: userStats.live,
    };

    const recentUsers = recentSignups.users;

    // Kick off live telemetry + sky-conditions aggregation in parallel with
    // the PA backend probe below. Neither rejects — degraded sources surface
    // as `live: false`.
    const telemetryPromise = getAgentNetworkTelemetry();
    const skyConditionsPromise = getSkyConditions();
    const cosmicYieldPromise = getCosmicYield();
    const dbObservabilityPromise = getDatabaseObservability();
    const catalogTrendingPromise = getCatalogTrending();
    const auditEventsPromise = getAuditEvents();
    const platformPulsePromise = getPlatformPulse();
    const enginePerformancePromise = getEnginePerformance();
    const practitionerCohortsPromise = getPractitionerCohorts();
    const commerceTelemetryPromise = getCommerceTelemetry();
    const pageTelemetryPromise = getPageTelemetry();
    const systemStatusPromise = getSystemStatus();
    const liveActivityPromise = getLiveActivity();
    const recentAlertsPromise = getRecentAlerts();
    const livingEconomyPromise = getLivingEconomyMetrics();
    const errorGroupsPromise = getErrorGroupSummary();
    const securityPromise = getSecuritySummary();
    const deploysPromise = Promise.resolve(getDeployHistory());
    const featureFlagsPromise = Promise.resolve(getFeatureFlags());
    const practitionerGeoPromise = getPractitionerGeo();
    const cohortRetentionPromise = getCohortRetention();
    const onboardingHealthPromise = getOnboardingHealth();
    const launchReadinessPromise = getLaunchReadiness();
    const resourceUsagePromise = getResourceUsage();
    const requestSeriesPromise = getRequestHourlySeries();
    const economyIntegrityPromise = getEconomyIntegrity();
    const migrationStatusPromise = getMigrationStatus();
    const cronHeartbeatsPromise = getCronHeartbeats();
    const triageQueuePromise = getTriageQueue();

    let paHealth = "offline";
    // null = the roster probe failed — renders as unknown, never as an
    // empty roster (a fabricated 0 was the previous behavior).
    let paAgentCount: number | null = null;

    try {
      const internalSecret = process.env.INTERNAL_API_SECRET;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (internalSecret) {
        headers.Authorization = `Bearer ${internalSecret}`;
      }

      const [healthRes, agentsRes] = await Promise.allSettled([
        fetchWithTimeout(`${PA_BACKEND_URL}/health`, { headers }, 2000),
        fetchWithTimeout(`${PA_BACKEND_URL}/api/agents`, { headers }, 2000),
      ]);

      if (healthRes.status === "fulfilled" && healthRes.value.ok) {
        const healthData = (await healthRes.value.json().catch(() => ({}))) as {
          status?: string;
          health?: string;
        };
        paHealth = healthData.status || healthData.health || "healthy";
      } else {
        paHealth = healthRes.status === "fulfilled" ? "unhealthy" : "offline";
      }

      if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
        paAgentCount = getAgentCount(
          await agentsRes.value.json().catch(() => []),
        );
      }
    } catch (err) {
      console.error("Failed to query Planetary Agents backend metrics:", err);
      paHealth = "offline";
    }

    const skyConditions = await skyConditionsPromise;
    const cosmicYield = await cosmicYieldPromise;
    const dbObservability = await dbObservabilityPromise;
    const catalogTrending = await catalogTrendingPromise;
    const auditEvents = await auditEventsPromise;
    const platformPulse = await platformPulsePromise;
    const enginePerformance = await enginePerformancePromise;
    const practitionerCohorts = await practitionerCohortsPromise;
    const commerce = await commerceTelemetryPromise;
    const pageTelemetry = await pageTelemetryPromise;
    const systemStatus = await systemStatusPromise;
    const liveActivityResult = await liveActivityPromise;
    const recentAlerts = await recentAlertsPromise;
    const livingEconomy = await livingEconomyPromise;
    const errorGroups = await errorGroupsPromise;
    const security = await securityPromise;
    const deploys = await deploysPromise;
    const featureFlags = await featureFlagsPromise;
    const practitionerGeo = await practitionerGeoPromise;
    const cohortRetention = await cohortRetentionPromise;
    const onboardingHealth = await onboardingHealthPromise;
    const launchReadiness = await launchReadinessPromise;
    const resourceUsage = await resourceUsagePromise;
    const requestSeries = await requestSeriesPromise;
    const economyIntegrity = await economyIntegrityPromise;
    const migrationStatus = await migrationStatusPromise;
    const cronHeartbeats = await cronHeartbeatsPromise;
    const triageQueue = await triageQueuePromise;

    // Live metaphysical telemetry — feed-event rate + event-type entropy from
    // the database, elemental harmony from the live ephemeris. Supersedes the
    // former `meta.mockedTelemetry` seed fixture.
    const telemetry = await telemetryPromise;

    const planetaryIntegration = {
      endpoints: {
        alchmNextApp: "https://alchm.kitchen",
        paUi: getServiceUrlSafe("agentsUi"),
        paBackend: PA_BACKEND_URL,
        wtenLegacyBackend: getServiceUrlSafe("wtenBackend"),
      },
      health: normalizePlanetaryHealth(paHealth),
      agentCount: paAgentCount,
      // Roster drift: WTEN's is_agent count vs the PA backend's roster.
      // Either side is null when its source degraded this poll.
      rosterDiff: {
        wtenAgents: stats.live ? stats.agentUsers : null,
        paAgents: paAgentCount,
      },
      lastFeedEmit: feedEmitTracker.getLastEmit(),
      telemetry,
    };

    const mockedFields = KNOWN_CODEBASE_GAPS.filter(
      (gap) => gap.category === "PLACEHOLDER_DATA",
    ).map((gap) => gap.label);
    const operations = buildOperationsControlPlane({
      systemStatus,
      onboarding: onboardingHealth,
      cosmicYield,
      launchReadiness,
      recentAlerts,
      planetaryIntegration,
      pulse: platformPulse,
      stats,
      observability: {
        catalog: catalogTrending.live,
        database: dbObservability.live,
        engine: enginePerformance.live,
        security: security.live,
        commerce: commerce.live,
        resources: resourceUsage.live,
        deploys: deploys.live,
        featureFlags: featureFlags.live,
      },
      mockedFields,
      codebaseGaps: KNOWN_CODEBASE_GAPS,
    });

    return {
      pulse: platformPulse,
      stats,
      recentUsers,
      recentUsersLive: recentSignups.live,
      skyConditions,
      cosmicYield,
      dbObservability,
      catalogTrending,
      auditEvents,
      enginePerformance,
      practitionerCohorts,
      commerce,
      pageTelemetry,
      systemStatus,
      onboardingHealth,
      launchReadiness,
      operations,
      planetaryIntegration,
      requestSeries,
      economyIntegrity,
      maintenance: { migrations: migrationStatus, cronHeartbeats },
      triageQueue,
      liveActivity: {
        entries: liveActivityResult.events,
        live: liveActivityResult.live,
      },
      recentAlerts,
      livingEconomy,
      errorGroups,
      security,
      deploys,
      featureFlags,
      resourceUsage,
      practitionerGeo,
      cohortRetention,
      meta: {
        generatedAt: now.toISOString(),
        mockedFields,
      },
    };
  }
}

// Coalesce polling bursts: both admin surfaces poll at 30s, and extra tabs
// multiply that. 5s matches the sibling admin routes' memoize TTL.
const CORE_CACHE_TTL_MS = 5_000;

/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics, recent users, and cross-project PA observability.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const core = await memoize("admin:dashboard-core", CORE_CACHE_TTL_MS, () =>
      assembleTelemetryCore(),
    );

    // Resolve the admin identity from the validated session rather than
    // hardcoding a single operator. Per-request (never cached — the core
    // memoize is shared across admins). Falls back to the session token
    // payload when the DB lookup fails so the panel always renders something.
    const adminEmail = authResult.user.email;
    let adminDbUser: Awaited<
      ReturnType<typeof userDatabase.getUserById>
    > | null = null;
    try {
      adminDbUser = await userDatabase.getUserById(authResult.user.userId);
    } catch (err) {
      console.error(
        `[admin/dashboard] failed to resolve admin user ${authResult.user.userId}:`,
        err,
      );
    }
    const adminName =
      adminDbUser?.profile.name ||
      authResult.user.email.split("@")[0] ||
      "Operator";
    const adminHandle = adminEmail.split("@")[0] || "operator";
    const adminJoined = adminDbUser?.createdAt
      ? new Date(adminDbUser.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    // BirthData stores lat/lon (no place name) — render coordinates when known.
    const lat = adminDbUser?.profile.birthData?.latitude;
    const lon = adminDbUser?.profile.birthData?.longitude;
    const adminLocation =
      typeof lat === "number" && typeof lon === "number"
        ? `${lat.toFixed(2)}°${lat >= 0 ? "N" : "S"} · ${lon.toFixed(2)}°${lon >= 0 ? "E" : "W"}`
        : "—";

    const { recentUsersLive, ...coreData } = core;

    const data: AdminDashboardData = {
      user: {
        handle: adminHandle,
        name: adminName,
        email: adminEmail,
        role: "ARCHITECT",
        badge: `ALCH-${(adminDbUser?.id || "").slice(0, 6).toUpperCase() || "0001"}`,
        initial: (adminName[0] || "A").toUpperCase(),
        tier: authResult.user.roles.includes("admin") ? "ROOT" : "ALCHEMIST",
        joined: adminJoined,
        location: adminLocation,
        onCall: true,
      },
      ...coreData,
    };

    // Backwards-compatible response: legacy `/admin` reads `stats` and
    // `recentUsers` from the top level; `/admin/dashboard` reads `data`;
    // the new PA panel reads `paIntegration`. `recentUsersLive` lets the
    // overview render fetch-failure as absence instead of "No users yet".
    return NextResponse.json({
      success: true,
      stats: core.stats,
      recentUsers: core.recentUsers,
      recentUsersLive,
      data,
      paIntegration: core.planetaryIntegration,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
