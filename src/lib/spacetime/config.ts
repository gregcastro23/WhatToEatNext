/**
 * SpacetimeDB client configuration (v4.0 real-time layer).
 *
 * The integration is entirely env-driven so it works against SpacetimeDB
 * Maincloud or a self-hosted instance, and degrades to the legacy REST/static
 * paths when unset:
 *
 *   NEXT_PUBLIC_SPACETIME_URI            e.g. "wss://maincloud.spacetimedb.com"
 *                                        or   "ws://localhost:3000" (self-hosted)
 *   NEXT_PUBLIC_SPACETIME_MODULE         database name (default "alchm-culinary")
 *   NEXT_PUBLIC_SPACETIME_LIVE_CULINARY  "1" to let browse surfaces merge live
 *                                        in-module recipes (read-path swap flag)
 *
 * No URI → `getSpacetimeConfig()` returns null and the provider stays in the
 * "disabled" state; nothing connects, nothing breaks.
 */

export interface SpacetimeConfig {
  uri: string;
  moduleName: string;
}

export function getSpacetimeConfig(): SpacetimeConfig | null {
  const uri = process.env.NEXT_PUBLIC_SPACETIME_URI;
  if (!uri) return null;
  
  // Normalize to the bare database name the SpacetimeDB HTTP/WS API expects.
  // The CLI and dashboard display modules as "owner/name" (sometimes prefixed
  // with "@"), but the connection URL is /v1/database/<name>/subscribe — a slash
  // there is an invalid database name, so EVERY WS handshake 400s ("invalid
  // characters in database name") and the client is trapped in a reconnect loop
  // (the live badge never lights). Strip a leading "@" and any "owner/" prefix so
  // whichever form the env var carries resolves to the publishable name.
  const rawModule = (
    process.env.NEXT_PUBLIC_SPACETIME_MODULE ?? "alchm-culinary"
  ).trim();
  const moduleName =
    rawModule.replace(/^@/, "").split("/").pop()?.trim() || "alchm-culinary";

  return {
    uri,
    moduleName,
  };
}

/** Read-path swap flag: browse surfaces subscribe to live culinary tables. */
export function isLiveCulinaryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_CULINARY === "1";
}

/** Planner write-mirror + cross-device persistence via `meal_plan_slot`. */
export function isLivePlannerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_PLANNER === "1";
}

/** Two-way grocery cart sync via `grocery_cart_item`. */
export function isLiveCartEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_CART === "1";
}

/** Live feed push via `feed_event` (supplements the 30s HTTP poll). */
export function isLiveFeedEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_FEED === "1";
}

/** Live commensal dinner-party lobby via `commensal_session`/`_member`. */
export function isLiveCommensalEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL === "1";
}

/** localStorage key for the SpacetimeDB identity token. */
export const SPACETIME_TOKEN_STORAGE_KEY = "alchm:spacetime:token";
