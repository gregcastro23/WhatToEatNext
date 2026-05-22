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
} from "@/services/dashboardPanelsService";
import type { SkyConditionsData } from "@/services/skyConditionsService";

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
    uptime30d: number;
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
  /**
   * Fields below are not yet wired to a real backend.
   * They are filled by the API route from deterministic seeds
   * so the visual output stays stable. Real wire-up is follow-up
   * work — see the TODO comments next to each field in
   * /api/admin/dashboard/route.ts.
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
    score: 98.7,
    uptime30d: 99.978,
    activeIncidents: 1,
    p95: 184,
    errRate: 0.04,
    deployFreshness: "23m",
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
    live: false,
  },
  catalogTrending: { recipes: [], live: false },
  auditEvents: { events: [], live: false },
  meta: {
    generatedAt: new Date(0).toISOString(),
    mockedFields: [
      "pulse",
      "services",
      "kpis",
      "agents",
      "incidents",
      "deploys",
      "featureFlags",
      "moderation",
      "commerce",
      "geo",
      "errors",
      "cost",
    ],
  },
};
