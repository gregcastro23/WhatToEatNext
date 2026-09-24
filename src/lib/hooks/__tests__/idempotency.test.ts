/**
 * @jest-environment node
 *
 * Tests for inbound webhook idempotency:
 * - Header and body key extraction.
 * - Key normalization and length bounds (>255 chars hashed).
 * - Claiming, duplication, in-flight conflicts, and result caching.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import {
  claimInboundEvent,
  extractIdempotencyKey,
  fetchStoredResult,
  normalizeEventId,
  resolveInboundDeliveryContext,
} from "@/lib/hooks/idempotency";

describe("idempotency helpers", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
  });

  describe("extractIdempotencyKey", () => {
    it("extracts from Idempotency-Key header", () => {
      const req = new Request("https://test.local", {
        headers: { "Idempotency-Key": "key-123" },
      });
      expect(extractIdempotencyKey(req)).toBe("key-123");
    });

    it("extracts from lowercase idempotency-key header", () => {
      const req = new Request("https://test.local", {
        headers: { "idempotency-key": "key-lowercase" },
      });
      expect(extractIdempotencyKey(req)).toBe("key-lowercase");
    });

    it("extracts from body.idempotencyKey when header is absent", () => {
      const req = new Request("https://test.local");
      expect(extractIdempotencyKey(req, { idempotencyKey: "body-key-456" })).toBe(
        "body-key-456",
      );
    });

    it("prefers header over body", () => {
      const req = new Request("https://test.local", {
        headers: { "Idempotency-Key": "header-wins" },
      });
      expect(extractIdempotencyKey(req, { idempotencyKey: "body-loses" })).toBe(
        "header-wins",
      );
    });

    it("returns null when no key is present or blank", () => {
      const req = new Request("https://test.local", {
        headers: { "Idempotency-Key": "   " },
      });
      expect(extractIdempotencyKey(req, { idempotencyKey: "  " })).toBeNull();
    });
  });

  describe("normalizeEventId", () => {
    it("preserves keys within 255 characters", () => {
      const normal = "pentacle_conv:12345:abc";
      expect(normalizeEventId(normal)).toBe(normal);
    });

    it("hashes keys longer than 255 characters to sha256 hex string fitting in VARCHAR(255)", () => {
      const oversized = "k".repeat(300);
      const normalized = normalizeEventId(oversized);
      expect(normalized.startsWith("sha256:")).toBe(true);
      expect(normalized.length).toBe(71); // "sha256:" (7) + 64 hex = 71
      expect(normalized.length).toBeLessThanOrEqual(255);
    });
  });

  describe("claimInboundEvent", () => {
    it("returns claimed: true and claim: null if key is null (pass-through)", async () => {
      const outcome = await claimInboundEvent({
        source: "asol-sync-event",
        key: null,
        eventType: "sync-event",
      });
      expect(outcome.claimed).toBe(true);
      expect(outcome.claim).toBeNull();
      expect(outcome.isDuplicate).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("claims a new event successfully", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ id: 42, attempts: 1 }],
      });
      const outcome = await claimInboundEvent({
        source: "asol-sync-event",
        key: "unique-key-1",
        eventType: "sync-event",
      });
      expect(outcome.claimed).toBe(true);
      expect(outcome.isDuplicate).toBe(false);
      expect(outcome.claim).toMatchObject({ kind: "claimed", rowId: 42 });
    });

    it("detects in-flight duplicate (status: processing)", async () => {
      // 1. insert fails (conflict -> no rows)
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      // 2. retry update fails (still processing, lock fresh -> no rows)
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      // 3. mark duplicate returns status 'processing'
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ status: "processing" }],
      });

      const outcome = await claimInboundEvent({
        source: "asol-sync-event",
        key: "in-flight-key",
        eventType: "sync-event",
      });
      expect(outcome.claimed).toBe(false);
      expect(outcome.isDuplicate).toBe(true);
      expect(outcome.isInFlight).toBe(true);
    });

    it("detects finished duplicate (status: processed) and returns stored result", async () => {
      // 1. insert fails
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      // 2. retry update fails
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      // 3. mark duplicate returns status 'processed'
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ status: "processed" }],
      });
      // 4. fetch stored result returns previously cached response
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ result: { ok: true, completedCount: 1 } }],
      });

      const outcome = await claimInboundEvent({
        source: "asol-sync-event",
        key: "finished-key",
        eventType: "sync-event",
      });
      expect(outcome.claimed).toBe(false);
      expect(outcome.isDuplicate).toBe(true);
      expect(outcome.isInFlight).toBe(false);
      expect(outcome.previousResult).toEqual({ ok: true, completedCount: 1 });
    });
  });

  describe("fetchStoredResult", () => {
    it("returns null if query fails or row does not exist", async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error("DB timeout"));
      const result = await fetchStoredResult("asol-sync-event", "some-id");
      expect(result).toBeNull();
    });
  });

  describe("resolveInboundDeliveryContext", () => {
    it("prioritizes idempotencyKey over webhookId as effectiveKey", () => {
      const headers = new Headers({
        "webhook-id": "msg_webhook_123",
        "idempotency-key": "idem_client_456",
      });
      const ctx = resolveInboundDeliveryContext(headers, {}, { valid: true });
      expect(ctx.effectiveKey).toBe("idem_client_456");
      expect(ctx.idempotencyKey).toBe("idem_client_456");
      expect(ctx.webhookId).toBe("msg_webhook_123");
      expect(ctx.keyMismatch).toBe(true);
      expect(ctx.signatureSummary).toBe("valid");
    });

    it("falls back to webhookId when idempotencyKey is absent", () => {
      const headers = new Headers({
        "webhook-id": "msg_webhook_123",
      });
      const ctx = resolveInboundDeliveryContext(headers, {}, { valid: false, reason: "unsigned" });
      expect(ctx.effectiveKey).toBe("msg_webhook_123");
      expect(ctx.idempotencyKey).toBeNull();
      expect(ctx.webhookId).toBe("msg_webhook_123");
      expect(ctx.keyMismatch).toBe(false);
      expect(ctx.signatureSummary).toBe("unsigned");
    });

    it("returns null effectiveKey when neither header nor body key is present", () => {
      const headers = new Headers();
      const ctx = resolveInboundDeliveryContext(headers, {}, { valid: false });
      expect(ctx.effectiveKey).toBeNull();
      expect(ctx.idempotencyKey).toBeNull();
      expect(ctx.webhookId).toBeNull();
      expect(ctx.keyMismatch).toBe(false);
      expect(ctx.signatureSummary).toBe("unknown");
    });

    it("reports keyMismatch as false when both keys match", () => {
      const headers = new Headers({
        "webhook-id": "shared_key_789",
        "idempotency-key": "shared_key_789",
      });
      const ctx = resolveInboundDeliveryContext(headers, {}, { valid: true });
      expect(ctx.effectiveKey).toBe("shared_key_789");
      expect(ctx.keyMismatch).toBe(false);
    });
  });
});
