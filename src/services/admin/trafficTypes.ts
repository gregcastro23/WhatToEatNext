/**
 * Types for first-party traffic analytics (page_views, migration 86).
 *
 * @file src/services/admin/trafficTypes.ts
 */

import type { DeviceType } from "@/lib/analytics/pageViewClassify";

export type TrafficRange = "24h" | "7d" | "30d";

export type TrafficStatus = "live" | "missing-table" | "error";

export interface PageViewInsert {
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  visitorHash: string;
  sessionId: string | null;
  userId: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
  isBot: boolean;
}

export interface TrafficTotals {
  pageviews: number;
  visitors: number;
  sessions: number;
  signedInUsers: number;
  bounceRate: number | null;
  pagesPerSession: number | null;
}

export interface TrafficBucket {
  /** New York wall-clock key: "2026-09-22" (day) or "2026-09-22T14" (hour). */
  key: string;
  pageviews: number;
  visitors: number;
}

export interface CountRow {
  label: string;
  count: number;
  visitors?: number;
}

export interface RecentPageView {
  id: string;
  at: string;
  path: string;
  referrerHost: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  sessionId: string | null;
  user: { id: string; email: string; name: string | null; isAdmin: boolean } | null;
}

export interface TrafficDimensions {
  referrers: CountRow[];
  utmSources: CountRow[];
  countries: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
}

export interface TrafficSummary extends TrafficDimensions {
  generatedAt: string;
  range: TrafficRange;
  /** Only `live` carries numbers; the others explain why there are none. */
  status: TrafficStatus;
  detail?: string;
  trackingSince: string | null;
  totalPageviewsAllTime: number;
  activeNow: { visitors: number; pages: CountRow[] };
  totals: TrafficTotals;
  previous: TrafficTotals;
  series: TrafficBucket[];
  bucketUnit: "hour" | "day";
  topPages: CountRow[];
  entryPages: CountRow[];
  bots: number;
  recent: RecentPageView[];
}

export interface TrafficPulse {
  status: TrafficStatus;
  activeNow: number;
  pageviews24h: number;
  visitors24h: number;
  pageviewsPrev24h: number;
  lastVisitAt: string | null;
}
