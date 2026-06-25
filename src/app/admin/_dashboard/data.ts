/**
 * data.ts — admin dashboard data contract.
 *
 * The prototype baked deterministic mock data into the component
 * tree. Here we extract the same data into a typed contract that
 * the page fetches from `/api/admin/dashboard`. Anything the API
 * doesn't yet provide is filled with the same seeded mock the
 * prototype used, so the visual output matches one-for-one.
 */

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
  SecuritySummaryData,
  DeployHistoryEntry,
  FeatureFlagEntry,
  CostBurndownData,
  PractitionerGeoData,
  CohortRetentionData,
} from "@/services/dashboardPanelsService";
import type { ActivityEvent } from "@/services/liveActivityService";
import type { SkyConditionsData } from "@/services/skyConditionsService";
import type { SystemStatusPayload } from "@/services/systemStatusService";

// ============================================================
// DETERMINISTIC PSEUDO-RANDOM — used for sparkline / heatmap fill
// ============================================================
export function seeded(seed: number, n: number, lo = 0.2, hi = 0.95): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(lo + (s / 233280) * (hi - lo));
  }
  return out;
}

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
    state: "NOMINAL" | "DEGRADED" | "INCIDENT";
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
    totalRecipes: number;
    totalIngredients: number;
    totalSubscriptions: number;
    totalTransactions: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    dominantElement: string | null;
    isActive: boolean;
  }>;
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
  /** Recent merged activity feed (auth + recipe + token + agent events). */
  liveActivity: { entries: ActivityEvent[]; live: boolean };
  /** Recent alert_events rows for the IncidentsPanel. */
  recentAlerts: RecentAlertsData;
  /** request_log_entries aggregated 5xx/4xx by path for ErrorGroups. */
  errorGroups: ErrorGroupsData;
  /** auth_events rollup for SecurityPanel. */
  security: SecuritySummaryData;
  /** Real-time git deploys telemetry. */
  deploys: { entries: DeployHistoryEntry[]; live: boolean };
  /** Real-time feature flags status. */
  featureFlags: { flags: FeatureFlagEntry[]; live: boolean };
  /** estimated hosting and compute resource usage. */
  costBurndown: CostBurndownData;
  /** User birth chart location aggregation. */
  practitionerGeo: PractitionerGeoData;
  /** User login and activity cohort retention. */
  cohortRetention: CohortRetentionData;
  /**
   * Generation metadata. `mockedFields` lists any panels still served
   * from seeded fixtures rather than a live source — currently empty.
   */
  meta: {
    generatedAt: string;
    /** Which fields are still served from seeded fixtures. */
    mockedFields: string[];
  };
}

// ============================================================
// FALLBACK / SEED — used during loading and as the API mock
// ============================================================
const SKY_SEED: SkyConditionsData = {
  headline: "Awaiting ephemeris",
  live: false,
  generatedAt: new Date(0).toISOString(),
  planets: [
    { symbol: "☉", name: "Sun", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "☽", name: "Moon", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "☿", name: "Mercury", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "♀", name: "Venus", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "♂", name: "Mars", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "♃", name: "Jupiter", position: "—", speed: "—", retrograde: false, stationing: false },
    { symbol: "♄", name: "Saturn", position: "—", speed: "—", retrograde: false, stationing: false },
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
  user: {
    handle: "gregcastro23",
    name: "Greg Castro",
    email: "gregcastro23@gmail.com",
    role: "ARCHITECT",
    badge: "ALCH-0001",
    initial: "G",
    tier: "ROOT",
    joined: "2023-08-14",
    location: "Brooklyn, NY · 40.6782°N",
    onCall: true,
  },
  pulse: {
    state: "NOMINAL",
    score: 100,
    availability: 100,
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
    totalRecipes: 0,
    totalIngredients: 0,
    totalSubscriptions: 0,
    totalTransactions: 0,
  },
  recentUsers: [],
  skyConditions: SKY_SEED,
  cosmicYield: {
    inCirculation: 0,
    minted30d: 0,
    burned30d: 0,
    netFlow30d: 0,
    sinks24h: [],
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
  enginePerformance: { clickToCookRate: 0, totalCalculations: 0, averageLatencyMs: 0, live: false },
  practitionerCohorts: {
    funnel: { landing: 0, signup: 0, onboarded: 0, active: 0, firstCook: 0, paidPro: 0 },
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
  pageTelemetry: { foodDiary: 0, customRecipes: 0, restaurants: 0, commensals: 0, mealPlans: 0, live: false },
  systemStatus: {
    generatedAt: new Date(0).toISOString(),
    overall: "UNKNOWN",
    flows: [],
    dependencies: [],
  },
  liveActivity: { entries: [], live: false },
  recentAlerts: { entries: [], live: false },
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
  costBurndown: { items: [], totalMtd: 0, projectedTotal: 0, live: false },
  practitionerGeo: { regions: [], live: false },
  cohortRetention: { cohorts: [], live: false },
  meta: {
    generatedAt: new Date(0).toISOString(),
    mockedFields: [],
  },
};
