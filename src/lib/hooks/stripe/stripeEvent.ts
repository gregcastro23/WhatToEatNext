/**
 * Stripe → webhook_events. The route keeps Stripe's own semantics (verify
 * with `constructEvent`, answer 500 on failure so Stripe retries); this module
 * only turns a verified event into the record, keyed by Stripe's event id.
 *
 * The summary is deliberately PII-free: ids, types and flags only — never the
 * event object, which carries customer emails and addresses.
 *
 * @file src/lib/hooks/stripe/stripeEvent.ts
 */

import type { HookEvent } from "@/lib/hooks/types";
import { HANDLED_STRIPE_EVENTS } from "@/lib/stripe/handledEvents";
import type Stripe from "stripe";

function objectField(object: unknown, key: "id" | "object"): string | null {
  if (typeof object !== "object" || object === null || !(key in object)) return null;
  const value: unknown = Reflect.get(object, key);
  return typeof value === "string" ? value : null;
}

export function stripeHookEvent(event: Stripe.Event): HookEvent<Stripe.Event> {
  const objectId = objectField(event.data.object, "id");
  return {
    source: "stripe",
    id: event.id,
    type: event.type,
    subjectId: objectId,
    occurredAt: Number.isFinite(event.created) ? new Date(event.created * 1000) : null,
    summary: {
      type: event.type,
      objectId,
      objectType: objectField(event.data.object, "object"),
      livemode: event.livemode,
      apiVersion: event.api_version,
      account: event.account ?? null,
    },
    data: event,
  };
}

/** Whether the route has a handler for this type (else the record says `ignored`). */
export function isHandledStripeEvent(type: string): boolean {
  return HANDLED_STRIPE_EVENTS.some((handled) => handled.type === type);
}
