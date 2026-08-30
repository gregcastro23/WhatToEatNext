/**
 * data.ts — admin dashboard data contract.
 *
 * Typed contract consumed by the admin dashboard. The API fills this from
 * operational sources; FALLBACK_DATA is an explicit loading/error state and
 * must not impersonate live telemetry.
 */

import type { CronHeartbeatData } from "@/services/cronHeartbeatService";
import type {
  AuditEventsData,
  CatalogTrendingData,
  CosmicYieldData,
  DatabaseObservabilityData,
  EnginePerformanceData,
  ErrorGroupsData,
  PractitionerCohortsData,
  CommerceSummaryData,
  PageTelemetryData,
  RecentAlertsData,
  LivingEconomyMetrics,
  RequestSeriesData,
  SecuritySummaryData,
  DeployHistoryEntry,
  FeatureFlagEntry,
  ResourceUsageData,
  PractitionerGeoData,
  CohortRetentionData,
} from "@/services/dashboardPanelsService";
import type { EconomyIntegrityData } from "@/services/economyIntegrityService";
import type { TriageQueueData } from "@/services/githubTriageService";
import type { LaunchReadinessReport } from "@/services/launchReadinessService";
import type { ActivityEvent } from "@/services/liveActivityService";
import type { MigrationStatusData } from "@/services/migrationStatusService";
import type { OnboardingHealthPayload } from "@/services/onboardingHealthService";
import type {
  OperationsControlPlane,
  PlanetaryIntegrationSnapshot,
} from "@/services/operationsControlPlaneService";
import type { SkyConditionsData } from "@/services/skyConditionsService";
import type { SystemStatusPayload } from "@/services/systemStatusService";

// ============================================================
// PALETTE
// ============================================================
export const PALETTES = {
  violet: {
    label: "Violet · Copper",
    accent: "oklch(0.72 0.18 305)",
    accent2: "oklch(0.78 0.14 65)",
  },
  bio: {
    label: "Bioluminescent",
    accent: "oklch(0.82 0.20 165)",
    accent2: "oklch(0.78 0.14 90)",
  },
  copper: {
    label: "Ember · Copper",
    accent: "oklch(0.78 0.16 60)",
    accent2: "oklch(0.70 0.18 25)",
  },
  prism: {
    label: "Prismatic",
    accent: "oklch(0.74 0.22 330)",
    accent2: "oklch(0.78 0.16 220)",
  },
} as const;

export type PaletteKey = keyof typeof PALETTES;
export type Density = "comfortable" | "compact";
export type FocusModule =
  | "overview"
  | "ops"
  | "engine"
  | "users"
  | "commerce"
  | "security";

// ============================================================
// DASHBOARD DATA SHAPE — what the page receives
// ============================================================
export interface AdminDashboardData {
  user: {
    handle: string;
    name: string;
    email: string;
    role: string;
    badge: string;
    initial: string;
    tier: string;
    joined: string;
    location: string;
    onCall: boolean;
  };
  pulse: {
    /** UNKNOWN is the loading/outage state — the UI must render it as an
     *  absence, never as a healthy default. */
    state: "NOMINAL" | "DEGRADED" | "INCIDENT" | "UNKNOWN";
    score: number;
    /** Request success rate (%) over the in-memory request-log window. */
    availability: number;
    activeIncidents: number;
    p95: number;
    errRate: number;
    deployFreshness: string;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    completedOnboarding: number;
    /** Human/agent split of totalUsers — user administration is about the
     *  humans; agentUsers is the WTEN half of the PA roster diff. */
    humanUsers: number;
    agentUsers: number;
    totalRecipes: number;
    totalIngredients: number;
    totalSubscriptions: number;
    totalTransactions: number;
    /** false when the user-stats query degraded — zeros are absence, not fact. */
    live: boolean;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    dominantElement: string | null;
    isActive: boolean;
  }>;
  /** false when the recent-signups query itself degraded — an empty list
   *  under a failed query is absence, not a measured empty roster. */
  recentUsersLive: boolean;
  /** Live planetary snapshot — computed by getSkyConditions(). */
  skyConditions: SkyConditionsData;
  /** Live token-economy rollup — computed by getCosmicYield(). */
  cosmicYield: CosmicYieldData;
  /** Live Postgres observability — computed by getDatabaseObservability(). */
  dbObservability: DatabaseObservabilityData;
  /** Top recipes by popularity — computed by getCatalogTrending(). */
  catalogTrending: CatalogTrendingData;
  /** Recent auth events — computed by getAuditEvents(). */
  auditEvents: AuditEventsData;
  /** Live Recommendation engine stats. */
  enginePerformance: EnginePerformanceData;
  /** Live cohort/practitioner funnel stats. */
  practitionerCohorts: PractitionerCohortsData;
  /** Live commerce performance. */
  commerce: CommerceSummaryData;
  /** Live row counts/usage mapped to routes. */
  pageTelemetry: PageTelemetryData;
  /** Per-flow + dependency health from systemStatusService. */
  systemStatus: SystemStatusPayload;
  /** Dedicated 24h onboarding funnel, stuck-user queue, and API health. */
  onboardingHealth: OnboardingHealthPayload;
  /** Presence-only rollout configuration and settlement backlog. */
  launchReadiness: LaunchReadinessReport;
  /** Synthesized operator priorities, domain coverage, and maintenance queue. */
  operations: OperationsControlPlane;
  /** Cross-project Planetary Agents reachability and live telemetry. */
  planetaryIntegration: PlanetaryIntegrationSnapshot;
  /** Real 24h hourly request/error series (hero trace) from
   *  request_log_entries — replaces the synthesized sine wave. */
  requestSeries: RequestSeriesData;
  /** Ledger invariants: balance drift, welcome-grant coverage, stuck
   *  on-chain claims. Each check degrades independently. */
  economyIntegrity: EconomyIntegrityData;
  /** Schema + scheduled-job maintenance state: pending migrations and
   *  per-cron heartbeat staleness. */
  maintenance: {
    migrations: MigrationStatusData;
    cronHeartbeats: CronHeartbeatData;
  };
  /** Unfinished work — live GitHub triage-label queue for this repo. */
  triageQueue: TriageQueueData;
  /** Recent merged activity feed (auth + recipe + token + agent events). */
  liveActivity: { entries: ActivityEvent[]; live: boolean };
  /** Recent alert_events rows for the IncidentsPanel. */
  recentAlerts: RecentAlertsData;
  /** Living Economy scorecard: affiliate clicks, cooked posts, feed DAU. */
  livingEconomy?: LivingEconomyMetrics;
  /** request_log_entries aggregated 5xx/4xx by path for ErrorGroups. */
  errorGroups: ErrorGroupsData;
  /** auth_events rollup for SecurityPanel. */
  security: SecuritySummaryData;
  /** Real-time git deploys telemetry. */
  deploys: { entries: DeployHistoryEntry[]; live: boolean };
  /** Real-time feature flags status. */
  featureFlags: { flags: FeatureFlagEntry[]; live: boolean };
  /** Real Railway metered resource usage (MTD + projected), not dollars. */
  resourceUsage: ResourceUsageData;
  /** User birth chart location aggregation. */
  practitionerGeo: PractitionerGeoData;
  /** User login and activity cohort retention. */
  cohortRetention: CohortRetentionData;
  /**
   * Generation metadata. `mockedFields` lists any panels still served
   * from explicitly-labelled illustrative values rather than a live source.
   */
  meta: {
    generatedAt: string;
    /** Which panels still contain explicitly-labelled illustrative values. */
    mockedFields: string[];
  };
}

// ============================================================
// FALLBACK / LOADING — deliberately neutral when the API is unavailable
// ============================================================
const SKY_SEED: SkyConditionsData = {
  headline: "Awaiting ephemeris",
  live: false,
  generatedAt: new Date(0).toISOString(),
  planets: [
    {
      symbol: "☉",
      name: "Sun",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "☽",
      name: "Moon",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "☿",
      name: "Mercury",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "♀",
      name: "Venus",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "♂",
      name: "Mars",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "♃",
      name: "Jupiter",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
    {
      symbol: "♄",
      name: "Saturn",
      position: "—",
      speed: "—",
      retrograde: false,
      stationing: false,
    },
  ],
  aspects: [],
  planetaryHour: {
    symbol: "—",
    planet: "Sun",
    dayRuler: "Sun",
    hourNumber: 0,
    isDaytime: true,
    segments: [],
    live: false,
  },
};

export const FALLBACK_DATA: AdminDashboardData = {
  // Neutral placeholder identity — the real operator arrives with the API
  // payload. The fallback must not impersonate a specific person.
  user: {
    handle: "—",
    name: "Operator",
    email: "—",
    role: "ARCHITECT",
    badge: "ALCH-????",
    initial: "·",
    tier: "—",
    joined: "—",
    location: "—",
    onCall: false,
  },
  // UNKNOWN, score 0 — while the API is unreachable the topbar must read as
  // an absence. A fabricated "NOMINAL · 100%" during an outage is the exact
  // failure mode this fixture previously shipped.
  pulse: {
    state: "UNKNOWN",
    score: 0,
    availability: 0,
    activeIncidents: 0,
    p95: 0,
    errRate: 0,
    deployFreshness: "—",
  },
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    completedOnboarding: 0,
    humanUsers: 0,
    agentUsers: 0,
    totalRecipes: 0,
    totalIngredients: 0,
    totalSubscriptions: 0,
    totalTransactions: 0,
    live: false,
  },
  recentUsers: [],
  recentUsersLive: false,
  skyConditions: SKY_SEED,
  cosmicYield: {
    inCirculation: 0,
    minted30d: 0,
    burned30d: 0,
    netFlow30d: 0,
    sinks24h: [],
    sources24h: [],
    flowSeries: { days: [], live: false },
    topHolders: [],
    live: false,
  },
  dbObservability: {
    pool: { total: 0, idle: 0, waiting: 0, max: 0 },
    dbSizeBytes: 0,
    activeConnections: 0,
    tables: [],
    slowQueries: [],
    slowQueryThresholdMs: 200,
    live: false,
  },
  catalogTrending: { recipes: [], live: false },
  auditEvents: { events: [], live: false },
  enginePerformance: {
    clickToCookRate: 0,
    totalCalculations: 0,
    averageLatencyMs: 0,
    live: false,
  },
  practitionerCohorts: {
    funnel: {
      landing: 0,
      signup: 0,
      onboarded: 0,
      active: 0,
      firstCook: 0,
      paidPro: 0,
    },
    elementalBreakdown: [],
    live: false,
  },
  commerce: {
    mrr: 0,
    paidSubs: 0,
    provisionedSubs: 0,
    recentOrders: [],
    live: false,
  },
  pageTelemetry: {
    foodDiary: 0,
    customRecipes: 0,
    restaurants: 0,
    commensals: 0,
    mealPlans: 0,
    natalCharts: 0,
    cuisines: 0,
    live: false,
  },
  systemStatus: {
    generatedAt: new Date(0).toISOString(),
    overall: "UNKNOWN",
    flows: [],
    dependencies: [],
  },
  onboardingHealth: {
    generatedAt: new Date(0).toISOString(),
    overall: "UNKNOWN",
    headline: "Awaiting onboarding signals",
    funnel: [
      { id: "signup", label: "Signed up", count: 0, dropOff: 0 },
      { id: "birth-data", label: "Submitted birth data", count: 0, dropOff: 0 },
      {
        id: "natal-chart",
        label: "Natal chart computed",
        count: 0,
        dropOff: 0,
      },
      { id: "onboarded", label: "Onboarding complete", count: 0, dropOff: 0 },
    ],
    stuckUsers: [],
    recentSuccesses: [],
    apiHealth: {
      observed: false,
      count: 0,
      successRate: 0,
      errors4xx: 0,
      errors5xx: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      recentErrors: [],
    },
    skipRate: 0,
    live: false,
  },
  launchReadiness: {
    subsystems: [],
    settlement: { pending: 0, oldestPendingAgeHours: null, live: false },
    readyCount: 0,
    generatedAt: new Date(0).toISOString(),
  },
  operations: {
    generatedAt: new Date(0).toISOString(),
    state: "ATTENTION",
    readinessScore: 0,
    summary: "Awaiting control-plane signals",
    coverage: { live: 0, total: 0, percent: 0, blindSpots: [] },
    rollout: { ready: 0, total: 0, partial: 0, off: 0 },
    codebase: { knownGaps: [], highPriority: 0 },
    domains: [],
    priorities: [],
    maintenance: [],
  },
  planetaryIntegration: {
    endpoints: {
      alchmNextApp: "https://alchm.kitchen",
      paUi: "",
      paBackend: "",
      wtenLegacyBackend: "",
    },
    health: "unknown",
    agentCount: null,
    rosterDiff: { wtenAgents: null, paAgents: null },
    lastFeedEmit: null,
    telemetry: null,
  },
  requestSeries: { points: [], windowHours: 24, live: false },
  economyIntegrity: {
    drift: { driftedUsers: 0, maxAbsDelta: 0, checkedUsers: 0, live: false },
    welcomeGrant: { humansWithoutGrant: 0, missing: [], live: false },
    onchainClaims: { pending: 0, oldestPendingHours: null, live: false },
    solanaSupply: {
      cluster: "devnet",
      enabled: false,
      live: true,
      onchainAtoms: null,
      ledgerAtoms: null,
      violations: [],
    },
    generatedAt: new Date(0).toISOString(),
  },
  maintenance: {
    migrations: {
      appliedCount: 0,
      latestApplied: null,
      pendingFiles: [],
      manifestCount: null,
      live: false,
    },
    cronHeartbeats: { entries: [], live: false },
  },
  triageQueue: {
    counts: {
      needsTriage: 0,
      needsInfo: 0,
      readyForAgent: 0,
      readyForHuman: 0,
    },
    topIssues: [],
    openTotal: null,
    fetchedAt: null,
    live: false,
  },
  liveActivity: { entries: [], live: false },
  recentAlerts: { entries: [], live: false },
  livingEconomy: {
    affiliateClicksWeek: 0,
    instacartHandoffsWeek: 0,
    cookedPostsWeek: 0,
    feedDauToday: 0,
    live: false,
  },
  errorGroups: { groups: [], windowMinutes: 60, live: false },
  security: {
    signinSuccess24h: 0,
    signinFailure24h: 0,
    uniqueIps24h: 0,
    failingIps: [],
    hourlyAttempts: Array.from({ length: 24 }, () => 0),
    live: false,
  },
  deploys: { entries: [], live: false },
  featureFlags: { flags: [], live: false },
  resourceUsage: {
    items: [],
    provider: "Railway",
    periodLabel: "",
    live: false,
  },
  practitionerGeo: { regions: [], live: false },
  cohortRetention: { cohorts: [], live: false },
  meta: {
    generatedAt: new Date(0).toISOString(),
    mockedFields: [],
  },
};
