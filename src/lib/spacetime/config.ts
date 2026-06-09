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
  return {
    uri,
    moduleName: process.env.NEXT_PUBLIC_SPACETIME_MODULE ?? "alchm-culinary",
  };
}

/** Read-path swap flag: browse surfaces subscribe to live culinary tables. */
export function isLiveCulinaryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPACETIME_LIVE_CULINARY === "1";
}

/** localStorage key for the SpacetimeDB identity token. */
export const SPACETIME_TOKEN_STORAGE_KEY = "alchm:spacetime:token";
