/**
 * Pure classification for first-party page views.
 *
 * Everything the /api/track/pageview beacon derives from a request lives here
 * so it can be tested without a database or a Next request: device/browser/OS
 * from the user-agent, bot detection, the external referrer host, path
 * normalisation, and the daily-rotating visitor hash.
 *
 * Privacy contract (see database/init/86-admin-analytics.sql): the raw IP
 * never leaves `visitorHash`, and the hash includes the UTC day so the same
 * person on two days produces two unrelated values.
 *
 * @file src/lib/analytics/pageViewClassify.ts
 */

import { createHash } from "node:crypto";

export type DeviceType = "desktop" | "mobile" | "tablet" | "bot";

export interface UserAgentClass {
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
  isBot: boolean;
}

/**
 * Crawlers, link unfurlers, uptime monitors, and headless automation. Matched
 * case-insensitively against the full UA. Deliberately broad: a bot counted
 * as a human inflates the one number the operator reads first.
 */
const BOT_PATTERN =
  /\bbot\b|bot\/|bot;|crawl|spider|slurp|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot|slackbot|linkedinbot|pinterest|vercel-screenshot|lighthouse|pagespeed|headlesschrome|phantomjs|puppeteer|playwright|selenium|curl\/|wget\/|python-requests|axios\/|node-fetch|go-http-client|okhttp|java\/|uptime|monitor|pingdom|statuscake|preview/i;

export function classifyUserAgent(ua: string | null | undefined): UserAgentClass {
  const agent = (ua ?? "").trim();
  if (agent.length === 0 || BOT_PATTERN.test(agent)) {
    return { deviceType: "bot", browser: null, os: null, isBot: true };
  }

  let os: string | null = null;
  if (/iphone|ipod/i.test(agent)) os = "iOS";
  else if (/ipad/i.test(agent)) os = "iPadOS";
  else if (/android/i.test(agent)) os = "Android";
  else if (/windows/i.test(agent)) os = "Windows";
  else if (/cros/i.test(agent)) os = "ChromeOS";
  else if (/macintosh|mac os x/i.test(agent)) os = "macOS";
  else if (/linux|x11/i.test(agent)) os = "Linux";

  // Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari".
  let browser: string | null = null;
  if (/edg(e|a|ios)?\//i.test(agent)) browser = "Edge";
  else if (/opr\/|opera/i.test(agent)) browser = "Opera";
  else if (/samsungbrowser/i.test(agent)) browser = "Samsung Internet";
  else if (/firefox\/|fxios\//i.test(agent)) browser = "Firefox";
  else if (/chrome\/|crios\//i.test(agent)) browser = "Chrome";
  else if (/safari\//i.test(agent)) browser = "Safari";

  let deviceType: DeviceType = "desktop";
  if (/ipad|tablet/i.test(agent) || (/android/i.test(agent) && !/mobile/i.test(agent))) {
    deviceType = "tablet";
  } else if (/mobi|iphone|ipod|android/i.test(agent)) {
    deviceType = "mobile";
  }

  return { deviceType, browser, os, isBot: false };
}

/**
 * The referrer's host when it is a DIFFERENT site; null for direct traffic and
 * for internal navigation (same host, or any alchm.kitchen subdomain — the
 * agents app linking back is not an acquisition channel).
 */
export function externalReferrerHost(
  referrer: string | null | undefined,
  selfHost: string | null | undefined,
): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.length === 0) return null;
  const self = (selfHost ?? "").toLowerCase().replace(/:\d+$/, "");
  if (self && (host === self || host === `www.${self}` || `www.${host}` === self)) return null;
  if (host === "alchm.kitchen" || host.endsWith(".alchm.kitchen")) return null;
  if (host === "localhost" || host === "127.0.0.1") return null;
  return host.replace(/^www\./, "").slice(0, 120);
}

/**
 * Pathname only — the query string can carry tokens, emails, and search terms,
 * and it would explode the cardinality of "top pages". Trailing slashes
 * collapse; the result is capped so a hostile beacon cannot store megabytes.
 */
export function normalizePath(raw: string): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;
  const pathOnly = raw.split(/[?#]/)[0] ?? "/";
  let decoded = pathOnly;
  try {
    decoded = decodeURI(pathOnly);
  } catch {
    // keep the encoded form
  }
  const collapsed = decoded.length > 1 ? decoded.replace(/\/+$/, "") : decoded;
  return (collapsed || "/").slice(0, 300);
}

/** Paths never recorded: operator surfaces and non-page routes. */
export function isTrackablePath(path: string): boolean {
  return !(
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/")
  );
}

/** UTC calendar day, the rotation unit of the visitor hash. */
export function utcDay(at: Date): string {
  return at.toISOString().slice(0, 10);
}

/**
 * sha256(secret ‖ day ‖ ip ‖ ua), truncated. Same visitor + same day → same
 * value; anything else → unrelated value. Without the secret the hash could
 * be brute-forced over the IPv4 space, so the caller must supply one.
 */
export function visitorHash(input: {
  secret: string;
  day: string;
  ip: string;
  userAgent: string;
}): string {
  return createHash("sha256")
    .update(`${input.secret}\u0000${input.day}\u0000${input.ip}\u0000${input.userAgent}`)
    .digest("hex")
    .slice(0, 24);
}

/** Truncate a UTM value; empty strings become null. */
export function cleanUtm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : null;
}
