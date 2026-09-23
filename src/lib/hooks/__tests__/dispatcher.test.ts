/**
 * @jest-environment node
 *
 * Record-then-dispatch semantics, with the record mocked (its SQL is exercised
 * against a real PostgreSQL separately — see the PR's verification notes).
 */

jest.mock("@/lib/hooks/inbox", () => ({
  claimWebhookEvent: jest.fn(),
  completeWebhookEvent: jest.fn(),
  failWebhookEvent: jest.fn(),
}));

import { dispatchHookEvent, handlerRegistry, httpStatusFor } from "@/lib/hooks/dispatcher";
import { claimWebhookEvent, completeWebhookEvent, failWebhookEvent } from "@/lib/hooks/inbox";
import type { HookEvent, HookHandler, InboxClaim } from "@/lib/hooks/types";

const mockClaim = jest.mocked(claimWebhookEvent);
const mockComplete = jest.mocked(completeWebhookEvent);
const mockFail = jest.mocked(failWebhookEvent);

const EVENT: HookEvent<{ n: number }> = {
  source: "vercel",
  id: "evt_1",
  type: "deployment.succeeded",
  subjectId: "dpl_1",
  occurredAt: null,
  summary: {},
  data: { n: 1 },
};

const handle = jest.fn();
const REGISTRY = handlerRegistry<{ n: number }>([{ type: "deployment.succeeded", handle }]);
const CLAIMED: InboxClaim = { kind: "claimed", rowId: 7, attempt: 1, startedAt: 0 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("dispatchHookEvent", () => {
  it("runs the handler once for a first delivery and records what it returned", async () => {
    mockClaim.mockResolvedValue(CLAIMED);
    handle.mockResolvedValue({ action: "probes-scheduled" });
    const outcome = await dispatchHookEvent(EVENT, REGISTRY);
    expect(handle).toHaveBeenCalledTimes(1);
    expect(mockComplete).toHaveBeenCalledWith(CLAIMED, "processed", { action: "probes-scheduled" });
    expect(httpStatusFor(outcome)).toBe(200);
  });

  it("does not re-run a redelivery of a finished event, and acknowledges it", async () => {
    mockClaim.mockResolvedValue({ kind: "duplicate", status: "processed" });
    const outcome = await dispatchHookEvent(EVENT, REGISTRY);
    expect(handle).not.toHaveBeenCalled();
    expect(outcome.status).toBe("duplicate");
    expect(httpStatusFor(outcome)).toBe(200);
  });

  it("answers 409 to a redelivery while the first is still in flight, so the provider retries", async () => {
    // Acknowledging it would tell the provider "delivered" while the first
    // attempt could still fail — and then nothing would ever retry.
    mockClaim.mockResolvedValue({ kind: "duplicate", status: "processing" });
    const outcome = await dispatchHookEvent(EVENT, REGISTRY);
    expect(handle).not.toHaveBeenCalled();
    expect(outcome.status).toBe("in_flight");
    expect(httpStatusFor(outcome)).toBe(409);
  });

  it("records a failure and answers 500 so the provider redelivers", async () => {
    mockClaim.mockResolvedValue(CLAIMED);
    handle.mockRejectedValue(new Error("alert sink down"));
    const outcome = await dispatchHookEvent(EVENT, REGISTRY);
    expect(mockFail).toHaveBeenCalledWith(CLAIMED, expect.any(Error));
    expect(mockComplete).not.toHaveBeenCalled();
    expect(outcome.error).toBe("alert sink down");
    expect(httpStatusFor(outcome)).toBe(500);
  });

  it("records an event type with no handler as ignored — not a failure to retry", async () => {
    mockClaim.mockResolvedValue(CLAIMED);
    const outcome = await dispatchHookEvent({ ...EVENT, type: "deployment.cleanup" }, REGISTRY);
    expect(mockComplete).toHaveBeenCalledWith(CLAIMED, "ignored");
    expect(httpStatusFor(outcome)).toBe(200);
  });

  it("still processes when the record cannot be written — bookkeeping never blocks delivery", async () => {
    mockClaim.mockResolvedValue({ kind: "unrecorded", error: "db down", startedAt: 0 });
    handle.mockResolvedValue({});
    const outcome = await dispatchHookEvent(EVENT, REGISTRY);
    expect(handle).toHaveBeenCalledTimes(1);
    expect(outcome.status).toBe("processed");
  });
});

describe("handlerRegistry", () => {
  it("refuses two handlers for one event type", () => {
    const one: HookHandler<unknown> = { type: "x", handle: () => Promise.resolve({}) };
    expect(() => handlerRegistry([one, one])).toThrow("two handlers registered for x");
  });
});
