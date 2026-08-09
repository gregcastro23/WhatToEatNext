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
import { executeQuery } from "@/lib/database";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { getAgentNetworkTelemetry } from "@/services/agentTelemetryService";
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
  getSecuritySummary,
  getDeployHistory,
  getFeatureFlags,
  getResourceUsage,
  getPractitionerGeo,
  getCohortRetention,
} from "@/services/dashboardPanelsService";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { getLaunchReadiness } from "@/services/launchReadinessService";
import { getLiveActivity } from "@/services/liveActivityService";
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
 * GET /api/admin/dashboard
 * Returns dashboard statistics, recent users, and cross-project PA observability.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    // getAllUsers() is critical — its failure still 500s the dashboard via the
    // outer catch. The catalog counts are supplementary: safeCount swallows a
    // failed COUNT and returns 0, so one missing table or transient DB error
    // can't take down the whole payload.
    const [
      allUsers,
      totalRecipes,
      totalIngredients,
      totalSubscriptions,
      totalTransactions,
    ] = await Promise.all([
      userDatabase.getAllUsers(),
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
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => u.isActive).length,
      newUsersToday: allUsers.filter((u) => new Date(u.createdAt) > oneDayAgo)
        .length,
      completedOnboarding: allUsers.filter(
        (u) => u.profile.birthData && u.profile.natalChart,
      ).length,
      totalRecipes,
      totalIngredients,
      totalSubscriptions,
      totalTransactions,
    };

    const recentUsers = [...allUsers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.profile.name ?? null,
        createdAt: new Date(u.createdAt).toISOString(),
        dominantElement: u.profile.natalChart?.dominantElement
          ? String(u.profile.natalChart.dominantElement)
          : null,
        isActive: u.isActive,
      }));

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

    let paHealth = "offline";
    let paAgentCount = 0;

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

    // Resolve the admin identity from the validated session rather than
    // hardcoding a single operator. Falls back to the session token payload
    // when the DB lookup fails so the panel always renders something.
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
      : new Date(now).toISOString().slice(0, 10);
    // BirthData stores lat/lon (no place name) — render coordinates when known.
    const lat = adminDbUser?.profile.birthData?.latitude;
    const lon = adminDbUser?.profile.birthData?.longitude;
    const adminLocation =
      typeof lat === "number" && typeof lon === "number"
        ? `${lat.toFixed(2)}°${lat >= 0 ? "N" : "S"} · ${lon.toFixed(2)}°${lon >= 0 ? "E" : "W"}`
        : "—";

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
      pulse: platformPulse,
      stats,
      recentUsers,
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

    // Backwards-compatible response: legacy `/admin` reads `stats` and
    // `recentUsers` from the top level; `/admin/dashboard` reads `data`;
    // the new PA panel reads `paIntegration`.
    return NextResponse.json({
      success: true,
      stats,
      recentUsers,
      data,
      paIntegration: planetaryIntegration,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
