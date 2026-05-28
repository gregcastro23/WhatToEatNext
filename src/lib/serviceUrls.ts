/**
 * Central resolver for the external service base URLs the app talks to.
 *
 * Replaces ~20 scattered `process.env.X || "https://..."` literals so the
 * production hosts live in exactly one place and a misconfiguration is caught
 * instead of silently using a stale baked-in default.
 *
 * Two resolvers, deliberately different:
 *
 * - getServiceUrl() FAILS LOUD in production when none of the configured env
 *   names is set (mirrors assertRuntimeDatabaseConfig). It must be called
 *   LAZILY — inside a request handler or a per-request service method — NEVER
 *   at module top level: a module-load throw would break `next build`, which
 *   evaluates route modules during the build.
 *
 * - getServiceUrlSafe() never throws. Use it for client components, shared
 *   module-level constants, and informational endpoints, where falling back to
 *   the documented default is preferable to a crash.
 *
 * Both resolve from a priority list of env names, so any one canonical name
 * being set is enough (the hosts are identical across the synonyms).
 */

export type ServiceKey = "planetaryAgentsApi" | "wtenBackend" | "agentsUi";

interface ServiceSpec {
  label: string;
  envNames: string[];
  defaultUrl: string;
}

const SERVICES: Record<ServiceKey, ServiceSpec> = {
  // Planetary Agents Python/FastAPI backend (api.agents.alchm.kitchen).
  planetaryAgentsApi: {
    label: "Planetary Agents API",
    envNames: ["PLANETARY_AGENTS_API_URL", "NEXT_PUBLIC_PLANETARY_AGENTS_URL"],
    defaultUrl: "https://api.agents.alchm.kitchen",
  },
  // WhatToEatNext legacy Python backend (whattoeatnext-production.up.railway.app).
  wtenBackend: {
    label: "WhatToEatNext backend",
    envNames: ["API_BASE_URL", "BACKEND_URL", "NEXT_PUBLIC_BACKEND_URL"],
    defaultUrl: "https://whattoeatnext-production.up.railway.app",
  },
  // Planetary Agents Next.js UI — agent profiles + chat (agents.alchm.kitchen).
  agentsUi: {
    label: "Planetary Agents UI",
    envNames: ["NEXT_PUBLIC_AGENTS_UI_URL"],
    defaultUrl: "https://agents.alchm.kitchen",
  },
};

function resolveFromEnv(key: ServiceKey): string | undefined {
  for (const name of SERVICES[key].envNames) {
    const v = process.env[name];
    if (v && v.trim()) return v.trim().replace(/\/+$/, "");
  }
  return undefined;
}

/**
 * Resolve a service base URL, failing loud in production when unconfigured.
 * Call lazily (inside a handler / per-request method), never at module scope.
 */
export function getServiceUrl(key: ServiceKey): string {
  const fromEnv = resolveFromEnv(key);
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    const spec = SERVICES[key];
    throw new Error(
      `[serviceUrls] ${spec.label} URL is not configured in production. ` +
        `Set one of: ${spec.envNames.join(", ")}.`,
    );
  }
  return SERVICES[key].defaultUrl;
}

/**
 * Non-throwing resolver: env value if present, else the documented default.
 * For client components, shared module-level constants, and informational
 * endpoints where a crash would be worse than a stale default.
 */
export function getServiceUrlSafe(key: ServiceKey): string {
  return resolveFromEnv(key) ?? SERVICES[key].defaultUrl;
}
