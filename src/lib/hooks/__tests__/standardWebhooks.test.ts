/**
 * @jest-environment node
 *
 * Test vectors and verification tests for Standard Webhooks (Phase 2).
 */

import { _logger } from "@/lib/logger";
import {
  computeV1Signature,
  evaluateSignatureGate,
  parseWebhookSecret,
  verifyStandardWebhook,
} from "../standardWebhooks";

describe("Standard Webhooks signature verifier", () => {
  const RAW_SECRET = "test-secret-key-12345";
  const BASE64_SECRET = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw=";
  const MSG_ID = "msg_2D9t4b1E5g8h9j0k";
  const TIMESTAMP = 1727092800; // fixed timestamp
  const BODY = '{"event":"recipe.created","agentId":"sol"}';

  describe("parseWebhookSecret", () => {
    it("decodes base64 when prefixed with whsec_", () => {
      const buf = parseWebhookSecret(BASE64_SECRET);
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.toString("base64")).toBe("MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw");
    });

    it("uses raw UTF-8 bytes when not prefixed with whsec_", () => {
      const buf = parseWebhookSecret(RAW_SECRET);
      expect(buf.toString("utf-8")).toBe(RAW_SECRET);
    });
  });

  describe("verifyStandardWebhook", () => {
    it("accepts a correctly signed webhook message", () => {
      const secretBuf = parseWebhookSecret(RAW_SECRET);
      const sig = computeV1Signature(MSG_ID, TIMESTAMP, BODY, secretBuf);

      const headers = {
        "webhook-id": MSG_ID,
        "webhook-timestamp": String(TIMESTAMP),
        "webhook-signature": `v1,${sig}`,
      };

      const result = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP + 10, // 10s later
      });

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.msgId).toBe(MSG_ID);
        expect(result.timestamp).toBe(TIMESTAMP);
      }
    });

    it("accepts when matching signature is one of multiple candidate signatures (e.g. key rotation)", () => {
      const secretBuf = parseWebhookSecret(RAW_SECRET);
      const sig = computeV1Signature(MSG_ID, TIMESTAMP, BODY, secretBuf);

      const headers = {
        "webhook-id": MSG_ID,
        "webhook-timestamp": String(TIMESTAMP),
        "webhook-signature": `v1,oldInvalidSig== v1,${sig} v2,someFutureSig==`,
      };

      const result = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP + 5,
      });

      expect(result.valid).toBe(true);
    });

    it("verifies correctly with whsec_ base64 secret", () => {
      const secretBuf = parseWebhookSecret(BASE64_SECRET);
      const sig = computeV1Signature(MSG_ID, TIMESTAMP, BODY, secretBuf);

      const headers = {
        "webhook-id": MSG_ID,
        "webhook-timestamp": String(TIMESTAMP),
        "webhook-signature": `v1,${sig}`,
      };

      const result = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: BASE64_SECRET,
        nowSeconds: TIMESTAMP + 15,
      });

      expect(result.valid).toBe(true);
    });

    it("rejects when signature does not match secret or body", () => {
      const secretBuf = parseWebhookSecret(RAW_SECRET);
      const sig = computeV1Signature(MSG_ID, TIMESTAMP, BODY, secretBuf);

      const headers = {
        "webhook-id": MSG_ID,
        "webhook-timestamp": String(TIMESTAMP),
        "webhook-signature": `v1,${sig}`,
      };

      // Tampered body
      const resultTampered = verifyStandardWebhook({
        headers,
        rawBody: '{"event":"tampered"}',
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP,
      });
      expect(resultTampered.valid).toBe(false);
      expect(resultTampered.reason).toBe("no_matching_signature");

      // Wrong secret
      const resultWrongSecret = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: "wrong-secret",
        nowSeconds: TIMESTAMP,
      });
      expect(resultWrongSecret.valid).toBe(false);
      expect(resultWrongSecret.reason).toBe("no_matching_signature");
    });

    it("rejects when required headers are missing", () => {
      const result = verifyStandardWebhook({
        headers: { "webhook-id": MSG_ID },
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("missing_headers");
    });

    it("rejects when timestamp is not a valid number", () => {
      const result = verifyStandardWebhook({
        headers: {
          "webhook-id": MSG_ID,
          "webhook-timestamp": "not-a-number",
          "webhook-signature": "v1,abc",
        },
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("invalid_timestamp");
    });

    it("rejects when timestamp drift exceeds 300 seconds (5 minutes)", () => {
      const secretBuf = parseWebhookSecret(RAW_SECRET);
      const sig = computeV1Signature(MSG_ID, TIMESTAMP, BODY, secretBuf);

      const headers = {
        "webhook-id": MSG_ID,
        "webhook-timestamp": String(TIMESTAMP),
        "webhook-signature": `v1,${sig}`,
      };

      // 301 seconds in future
      const resultFuture = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP - 301,
      });
      expect(resultFuture.valid).toBe(false);
      expect(resultFuture.reason).toBe("timestamp_drift");

      // 301 seconds in past
      const resultPast = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP + 301,
      });
      expect(resultPast.valid).toBe(false);
      expect(resultPast.reason).toBe("timestamp_drift");

      // 299 seconds in past (within tolerance)
      const resultWithin = verifyStandardWebhook({
        headers,
        rawBody: BODY,
        secret: RAW_SECRET,
        nowSeconds: TIMESTAMP + 299,
      });
      expect(resultWithin.valid).toBe(true);
    });

    it("rejects when secret is missing or empty", () => {
      const result = verifyStandardWebhook({
        headers: {},
        rawBody: BODY,
        secret: "",
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("missing_secret");
    });
  });

  describe("evaluateSignatureGate", () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = jest.spyOn(_logger, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("allows request to proceed when mode is 'off'", () => {
      const gate = evaluateSignatureGate({ valid: false, reason: "no_matching_signature" }, "off");
      expect(gate.proceed).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("allows request but logs warning when mode is 'shadow' and verification fails", () => {
      const gate = evaluateSignatureGate(
        { valid: false, reason: "no_matching_signature", detail: "sig mismatch" },
        "shadow",
      );
      expect(gate.proceed).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Verification failed: no_matching_signature"),
        "sig mismatch",
      );
    });

    it("rejects request with 401 when mode is 'required' and verification fails", () => {
      const gate = evaluateSignatureGate(
        { valid: false, reason: "no_matching_signature" },
        "required",
      );
      expect(gate.proceed).toBe(false);
      expect(gate.status).toBe(401);
      expect(gate.error).toContain("no_matching_signature");
    });

    it("allows request when mode is 'required' and verification succeeds", () => {
      const gate = evaluateSignatureGate(
        { valid: true, msgId: MSG_ID, timestamp: TIMESTAMP },
        "required",
      );
      expect(gate.proceed).toBe(true);
      expect(gate.status).toBeUndefined();
    });
  });
});
