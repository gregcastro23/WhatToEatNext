/**
 * Is the live Stripe webhook endpoint subscribed to everything we handle?
 *
 * Webhook integrations fail in a direction that produces no error: if the
 * Dashboard endpoint is not sending an event, the handler simply never runs.
 * Nothing throws, nothing retries, no log line appears — because from the app's
 * point of view the event never happened. The 2026-08 finding that paid crypto
 * restaurant orders were stranded at `payment_pending` had exactly this shape,
 * and the code half of it is fixed; this module watches the Dashboard half.
 *
 * Read-only: it lists endpoints and compares `enabled_events`. It never mutates
 * Stripe configuration — flipping events on is a deliberate human action.
 *
 * @file src/services/stripeWebhookCoverageService.ts
 */

import {
  CRITICAL_STRIPE_EVENT_TYPES,
  HANDLED_STRIPE_EVENTS,
  HANDLED_STRIPE_EVENT_TYPES,
} from "@/lib/stripe/handledEvents";

export type CoverageStatus = "ok" | "degraded" | "incident" | "unknown";

export interface StripeWebhookCoverage {
  status: CoverageStatus;
  /** Human-readable one-liner naming the real cause. */
  summary: string;
  /** True when we actually reached Stripe. False means this is a "no source" state. */
  live: boolean;
  /** The endpoint URL we matched, if any. */
  endpointUrl?: string;
  /** Handled by us, NOT enabled in Stripe — these events never arrive. */
  missingEvents: string[];
  /** Of the above, the ones that cost money or fulfilment. */
  missingCriticalEvents: string[];
  /** Enabled in Stripe but hitting our `default` branch — noise, not danger. */
  unhandledEvents: string[];
  /** Endpoint status as Stripe reports it (`enabled` / `disabled`). */
  endpointStatus?: string;
}

/**
 * A Stripe endpoint subscribed to `["*"]` receives everything, so nothing can
 * be missing. Stripe uses this literal in `enabled_events`.
 */
const WILDCARD = "*";

function describeMissing(missingCritical: string[], missing: string[]): string {
  if (missingCritical.length > 0) {
    return `Stripe is not sending ${missingCritical.length} critical event(s): ${missingCritical.join(", ")} — the matching handler can never run`;
  }
  return `Stripe is not sending ${missing.length} handled event(s): ${missing.join(", ")}`;
}

/**
 * Compare a set of enabled events against what the code handles.
 *
 * Pure, so the classification is testable without touching Stripe.
 */
export function classifyWebhookCoverage(input: {
  enabledEvents: string[] | null;
  endpointUrl?: string;
  endpointStatus?: string;
}): StripeWebhookCoverage {
  const { enabledEvents, endpointUrl, endpointStatus } = input;

  if (enabledEvents === null) {
    return {
      status: "unknown",
      summary: "No Stripe webhook endpoint matched this deployment's URL",
      live: true,
      missingEvents: [],
      missingCriticalEvents: [],
      unhandledEvents: [],
    };
  }

  // A disabled endpoint receives nothing at all, whatever it is subscribed to.
  if (endpointStatus && endpointStatus !== "enabled") {
    return {
      status: "incident",
      summary: `Stripe webhook endpoint is ${endpointStatus} — no events are being delivered at all`,
      live: true,
      endpointUrl,
      endpointStatus,
      missingEvents: [...HANDLED_STRIPE_EVENT_TYPES],
      missingCriticalEvents: [...CRITICAL_STRIPE_EVENT_TYPES],
      unhandledEvents: [],
    };
  }

  const enabled = new Set(enabledEvents);
  const receivesEverything = enabled.has(WILDCARD);

  const missingEvents = receivesEverything
    ? []
    : HANDLED_STRIPE_EVENT_TYPES.filter((t) => !enabled.has(t));
  const missingCriticalEvents = missingEvents.filter((t) =>
    CRITICAL_STRIPE_EVENT_TYPES.includes(t),
  );
  const unhandledEvents = receivesEverything
    ? []
    : enabledEvents.filter((t) => !HANDLED_STRIPE_EVENT_TYPES.includes(t));

  if (missingCriticalEvents.length > 0) {
    return {
      status: "incident",
      summary: describeMissing(missingCriticalEvents, missingEvents),
      live: true,
      endpointUrl,
      endpointStatus,
      missingEvents,
      missingCriticalEvents,
      unhandledEvents,
    };
  }

  if (missingEvents.length > 0) {
    return {
      status: "degraded",
      summary: describeMissing(missingCriticalEvents, missingEvents),
      live: true,
      endpointUrl,
      endpointStatus,
      missingEvents,
      missingCriticalEvents,
      unhandledEvents,
    };
  }

  return {
    status: "ok",
    summary: receivesEverything
      ? `Endpoint receives all events (${WILDCARD}); all ${HANDLED_STRIPE_EVENTS.length} handled events covered`
      : `All ${HANDLED_STRIPE_EVENTS.length} handled events are enabled in Stripe`,
    live: true,
    endpointUrl,
    endpointStatus,
    missingEvents: [],
    missingCriticalEvents: [],
    unhandledEvents,
  };
}

/**
 * Pick the endpoint belonging to this deployment.
 *
 * Matched on path rather than full URL: the same Stripe account is shared with
 * two sibling projects, so several endpoints exist and the host differs between
 * production and preview. Falls back to the sole endpoint when exactly one is
 * configured, since that cannot be ambiguous.
 */
export function selectOurEndpoint<T extends { url: string; status?: string }>(
  endpoints: T[],
  expectedPath = "/api/stripe/webhook",
): T | null {
  const byPath = endpoints.filter((e) => {
    try {
      return new URL(e.url).pathname === expectedPath;
    } catch {
      return false;
    }
  });

  if (byPath.length === 1) return byPath[0] ?? null;
  if (byPath.length > 1) {
    // Prefer an enabled one; otherwise the first, so we still report something.
    return byPath.find((e) => e.status === "enabled") ?? byPath[0] ?? null;
  }
  return endpoints.length === 1 ? (endpoints[0] ?? null) : null;
}

/**
 * Ask Stripe what our endpoint is subscribed to.
 *
 * Degrades to an honest `live: false` rather than inventing a verdict — an
 * unreachable Stripe must not read as "correctly configured".
 */
export async function fetchStripeWebhookCoverage(): Promise<StripeWebhookCoverage> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      status: "unknown",
      summary: "STRIPE_SECRET_KEY not configured — cannot read webhook config",
      live: false,
      missingEvents: [],
      missingCriticalEvents: [],
      unhandledEvents: [],
    };
  }

  try {
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();
    const { data } = await stripe.webhookEndpoints.list({ limit: 100 });

    const ours = selectOurEndpoint(data);
    if (!ours) {
      return classifyWebhookCoverage({ enabledEvents: null });
    }

    return classifyWebhookCoverage({
      enabledEvents: [...ours.enabled_events],
      endpointUrl: ours.url,
      endpointStatus: ours.status,
    });
  } catch (error) {
    return {
      status: "unknown",
      summary: `Could not read Stripe webhook config: ${error instanceof Error ? error.message : "unknown error"}`,
      live: false,
      missingEvents: [],
      missingCriticalEvents: [],
      unhandledEvents: [],
    };
  }
}
