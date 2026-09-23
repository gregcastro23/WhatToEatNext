/**
 * @jest-environment node
 *
 * In-flight conflict contract tests (Phase 40 Workstream A1).
 *
 * ASOL's delivery classifier (alchm-agents-solana/lib/wten/delivery.ts:isInFlightBody)
 * specifically requires `status: "in_flight"` on HTTP 409 to trigger provider backoff,
 * preventing silent event loss.
 */

import { inFlightConflict } from "@/lib/hooks/inFlightConflict";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

describe("inFlightConflict helper", () => {
  it("returns HTTP 409 with Retry-After: 1 and status in_flight marker", async () => {
    const res = inFlightConflict({
      success: false,
      error: "conflict",
      message: "Event is currently being processed",
    });

    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");

    const body: unknown = await res.json();
    expect(isRecord(body)).toBe(true);
    if (isRecord(body)) {
      expect(body.status).toBe("in_flight");
      expect(body.success).toBe(false);
      expect(body.error).toBe("conflict");
      expect(body.message).toBe("Event is currently being processed");
    }
  });

  it("preserves ok: false for routes using ok convention", async () => {
    const res = inFlightConflict({
      ok: false,
      error: "conflict",
    });

    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");

    const body: unknown = await res.json();
    expect(isRecord(body)).toBe(true);
    if (isRecord(body)) {
      expect(body.status).toBe("in_flight");
      expect(body.ok).toBe(false);
      expect(body.error).toBe("conflict");
    }
  });

  it("handles empty legacy object safely", async () => {
    const res = inFlightConflict();

    expect(res.status).toBe(409);
    expect(res.headers.get("Retry-After")).toBe("1");

    const body: unknown = await res.json();
    expect(isRecord(body)).toBe(true);
    if (isRecord(body)) {
      expect(body.status).toBe("in_flight");
    }
  });
});
