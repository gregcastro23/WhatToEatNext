/**
 * @jest-environment node
 *
 * The Stripe route records every verified event in webhook_events by Stripe
 * event id BEFORE it runs, and keeps Stripe's retry contract:
 *   - a redelivery of a finished event is acknowledged, not re-run
 *   - a redelivery while the first is still running gets 409 (retry later)
 *   - a failure is recorded AND answered 500, so Stripe redelivers — and the
 *     record lets that retry through (see inbox.ts CLAIM_RETRY_SQL)
 */

const mockConstructEvent = jest.fn();
const getSubscriptionByStripeCustomerId = jest.fn();

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) } }),
}));
jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: { getSubscriptionByStripeCustomerId, updateSubscription: jest.fn() },
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/lib/hooks/inbox", () => ({
  claimWebhookEvent: jest.fn(),
  completeWebhookEvent: jest.fn(),
  failWebhookEvent: jest.fn(),
}));

import { POST } from "@/app/api/stripe/webhook/route";
import { claimWebhookEvent, completeWebhookEvent, failWebhookEvent } from "@/lib/hooks/inbox";
import type { InboxClaim } from "@/lib/hooks/types";

const mockClaim = jest.mocked(claimWebhookEvent);
const mockComplete = jest.mocked(completeWebhookEvent);
const mockFail = jest.mocked(failWebhookEvent);

const CLAIMED: InboxClaim = { kind: "claimed", rowId: 9, attempt: 1, startedAt: 0 };

function stripeEvent(type: string): Record<string, unknown> {
  return {
    id: "evt_123",
    type,
    created: 1790125000,
    livemode: false,
    api_version: "2026-04-22.dahlia",
    data: { object: { id: "in_1", object: "invoice", customer: "cus_1", customer_email: "person@example.com" } },
  };
}

function request(): Request {
  return new Request("https://alchm.kitchen/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=x" },
    body: "{}",
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mockClaim.mockResolvedValue(CLAIMED);
  getSubscriptionByStripeCustomerId.mockResolvedValue(null);
});

describe("Stripe webhook → webhook_events", () => {
  it("records the event by Stripe event id, with a PII-free summary, then processes it", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("invoice.payment_failed"));
    const res = await POST(request());
    expect(res.status).toBe(200);
    const [recorded] = mockClaim.mock.calls[0] ?? [];
    expect(recorded?.source).toBe("stripe");
    expect(recorded?.id).toBe("evt_123");
    expect(recorded?.subjectId).toBe("in_1");
    expect(JSON.stringify(recorded?.summary)).not.toContain("person@example.com");
    expect(getSubscriptionByStripeCustomerId).toHaveBeenCalledWith("cus_1");
    expect(mockComplete).toHaveBeenCalledWith(CLAIMED, "processed");
  });

  it("does not re-run a redelivery of an event already processed", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("invoice.payment_failed"));
    mockClaim.mockResolvedValue({ kind: "duplicate", status: "processed" });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(getSubscriptionByStripeCustomerId).not.toHaveBeenCalled();
  });

  it("answers 409 while the first delivery is still running, so Stripe retries instead of settling", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("invoice.payment_failed"));
    mockClaim.mockResolvedValue({ kind: "duplicate", status: "processing" });
    const res = await POST(request());
    expect(res.status).toBe(409);
    expect(getSubscriptionByStripeCustomerId).not.toHaveBeenCalled();
  });

  it("records a failure and still answers 500, so Stripe's own retry runs", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("invoice.payment_failed"));
    getSubscriptionByStripeCustomerId.mockRejectedValue(new Error("Query read timeout"));
    const res = await POST(request());
    expect(res.status).toBe(500);
    expect(mockFail).toHaveBeenCalledWith(CLAIMED, expect.any(Error));
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("records an event type the route does not handle as ignored", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("payment_intent.created"));
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(mockComplete).toHaveBeenCalledWith(CLAIMED, "ignored");
  });

  it("still processes when the record cannot be written", async () => {
    mockConstructEvent.mockReturnValue(stripeEvent("invoice.payment_failed"));
    mockClaim.mockResolvedValue({ kind: "unrecorded", error: "db down", startedAt: 0 });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(getSubscriptionByStripeCustomerId).toHaveBeenCalledTimes(1);
  });
});
