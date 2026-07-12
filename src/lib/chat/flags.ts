/**
 * Messaging feature flags (docs/plans/pr3-messaging-plan.md §8).
 *
 * Visible at launch: table chat (its only gate is the client-side
 * NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT for the live mirror — the Postgres
 * chat itself ships on). Gated: DMs, circles, and the /messages inbox.
 *
 * Server flags (checked in API routes — the authoritative gate):
 *   CHAT_DMS_ENABLED=1      allow creating/sending in 'dm' conversations
 *   CHAT_CIRCLES_ENABLED=1  allow creating/sending in 'circle' conversations
 *
 * Client twins (checked in components — presentation only, never trusted):
 *   NEXT_PUBLIC_CHAT_DMS=1
 *   NEXT_PUBLIC_CHAT_CIRCLES=1
 */

export function isDmsEnabledServer(): boolean {
  return process.env.CHAT_DMS_ENABLED === "1";
}

export function isCirclesEnabledServer(): boolean {
  return process.env.CHAT_CIRCLES_ENABLED === "1";
}

export function isDmsEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_DMS === "1";
}

export function isCirclesEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_CIRCLES === "1";
}
