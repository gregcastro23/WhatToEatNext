/**
 * Links into the planetary_agents UI.
 *
 * Domain distinction — these are NOT the same host:
 *   - agents.alchm.kitchen       → the PA Next.js UI (agent profiles + chat)
 *   - api.agents.alchm.kitchen   → the PA backend API
 *
 * This module targets the UI domain only. The override env var is
 * NEXT_PUBLIC_AGENTS_UI_URL; it defaults to the public UI domain.
 */

import { getServiceUrlSafe } from "@/lib/serviceUrls";

const AGENTS_UI_URL = getServiceUrlSafe("agentsUi");

/**
 * Public chat URL for a planetary agent.
 *
 * `slug` is the agent id — the local-part of its `@agentic.alchm.kitchen`
 * email (e.g. `socrates`, `nikola-tesla-1856`). Route confirmed against the
 * PA UI: `/gallery/chat/[id]`.
 */
export function agentChatUrl(slug: string): string {
  return `${AGENTS_UI_URL}/gallery/chat/${encodeURIComponent(slug)}`;
}

/** Agent slug from an `@agentic.alchm.kitchen` email — the local-part. */
export function agentSlugFromEmail(email: string): string {
  return email.split("@")[0];
}
