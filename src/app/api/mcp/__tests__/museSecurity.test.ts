/**
 * @file src/app/api/mcp/__tests__/museSecurity.test.ts
 *
 * Dedicated security test suite for Meta Muse connectors, Streamable HTTP
 * transport, and external agent safety boundaries.
 */

import { GET as getMuseConnector } from "@/app/.well-known/muse/connector.json/route";
import { POST as postMcp, OPTIONS as optionsMcp } from "@/app/api/mcp/route";
import {
  getTrustedOrigin,
  isTrustedHost,
  isTrustedOrigin,
  redactSensitiveString,
  sanitizeSecurityString,
  sanitizeSecurityStringArray,
} from "@/lib/mcp/httpSecurity";
import {
  auditAllergenRemoval,
  sanitizeProfilePayload,
} from "@/lib/mcp/culinaryProfileSecurity";
import { updateCulinaryProfileHandler } from "@/lib/mcp/culinaryProfile";
import type { ResolvedCaller } from "@/lib/mcp/auth";

describe("Meta Muse Connector & MCP HTTP Security", () => {
  describe("Host Header Poisoning & DNS Rebinding Defenses", () => {
    it("rejects malicious host headers and defaults to canonical origin", () => {
      const spoofedReq = new Request("https://evil.com/.well-known/muse/connector.json", {
        headers: {
          host: "attacker.evil.com",
          "x-forwarded-host": "spoofed-host.net",
        },
      });

      const origin = getTrustedOrigin(spoofedReq);
      expect(origin).toBe("https://alchm.kitchen");
    });

    it("accepts canonical production hosts", () => {
      expect(isTrustedHost("alchm.kitchen")).toBe(true);
      expect(isTrustedHost("www.alchm.kitchen")).toBe(true);
      expect(isTrustedHost("whattoeatnext.com")).toBe(true);
      expect(isTrustedHost("agents.alchm.kitchen")).toBe(true);
      expect(isTrustedHost("evil-domain.com")).toBe(false);
      expect(isTrustedHost(null)).toBe(false);
    });

    it("serves secure headers on .well-known/muse/connector.json", async () => {
      const req = new Request("https://alchm.kitchen/.well-known/muse/connector.json", {
        headers: { host: "alchm.kitchen" },
      });

      const res = await getMuseConnector(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
      expect(res.headers.get("x-frame-options")).toBe("DENY");
      expect(res.headers.get("vary")).toContain("Host");
      expect(res.headers.get("cache-control")).toContain("must-revalidate");

      const manifest = await res.json();
      expect(manifest.website).toBe("https://alchm.kitchen");
      expect(manifest.protocol.transport.endpoint).toBe("https://alchm.kitchen/api/mcp");
    });
  });

  describe("CORS Origin Boundary & Cross-Site Defenses", () => {
    it("allows trusted Meta Muse and Meta AI origins", () => {
      expect(isTrustedOrigin("https://platform.muse.ai")).toBe(true);
      expect(isTrustedOrigin("https://agent.muse.ai")).toBe(true);
      expect(isTrustedOrigin("https://meta.ai")).toBe(true);
      expect(isTrustedOrigin("https://www.meta.ai")).toBe(true);
      expect(isTrustedOrigin("https://alchm.kitchen")).toBe(true);
      expect(isTrustedOrigin("https://agents.alchm.kitchen")).toBe(true);
    });

    it("rejects untrusted third-party origins", () => {
      expect(isTrustedOrigin("https://evil-site.com")).toBe(false);
      expect(isTrustedOrigin("https://muse.ai.attacker.org")).toBe(false);
      expect(isTrustedOrigin("https://phishing-meta.ai.com")).toBe(false);
      expect(isTrustedOrigin(null)).toBe(false);
      expect(isTrustedOrigin("*")).toBe(false);
    });

    it("returns 403 Forbidden on OPTIONS preflight from untrusted origin", () => {
      const untrustedReq = new Request("https://alchm.kitchen/api/mcp", {
        method: "OPTIONS",
        headers: { origin: "https://evil-site.com" },
      });

      const res = optionsMcp(untrustedReq);
      expect(res.status).toBe(403);
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    });

    it("allows OPTIONS preflight from Meta Muse with appropriate CORS headers", () => {
      const museReq = new Request("https://alchm.kitchen/api/mcp", {
        method: "OPTIONS",
        headers: { origin: "https://platform.muse.ai" },
      });

      const res = optionsMcp(museReq);
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBe("https://platform.muse.ai");
      expect(res.headers.get("access-control-allow-methods")).toContain("POST");
      expect(res.headers.get("access-control-expose-headers")).toContain("Retry-After");
    });

    it("rejects untrusted browser origins on POST requests with 403 Forbidden", async () => {
      const untrustedReq = new Request("https://alchm.kitchen/api/mcp", {
        method: "POST",
        headers: {
          origin: "https://untrusted-site.com",
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
        }),
      });

      const res = await postMcp(untrustedReq);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Forbidden: Untrusted Origin");
    });

    it("allows server-to-server POST requests without Origin header to proceed", async () => {
      const serverReq = new Request("https://alchm.kitchen/api/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
        }),
      });

      const res = await postMcp(serverReq);
      expect(res.status).toBe(200);
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });
  });

  describe("Token & Key Redaction", () => {
    it("redacts alchm API keys from diagnostic and error strings", () => {
      const raw = "Error connecting with key sk_alchm_live_99abc123xyz_test at runtime";
      const sanitized = redactSensitiveString(raw);
      expect(sanitized).not.toContain("sk_alchm_live_99abc123xyz_test");
      expect(sanitized).toContain("sk_alchm_***[REDACTED]");
    });

    it("redacts Bearer tokens and key=value secrets", () => {
      const raw = "Authorization: Bearer mySecretToken123 with apiKey=secret_val";
      const sanitized = redactSensitiveString(raw);
      expect(sanitized).not.toContain("mySecretToken123");
      expect(sanitized).not.toContain("secret_val");
      expect(sanitized).toContain("Bearer [REDACTED]");
      expect(sanitized).toContain("apiKey=[REDACTED]");
    });
  });

  describe("Agent Profile Sanitization & Allergen Removal Safeguards", () => {
    it("sanitizes dangerous control characters and caps string lengths", () => {
      const dirty = "  peanut<script>alert(1)</script>\x00\x1F  ";
      const cleaned = sanitizeSecurityString(dirty, 20);
      expect(cleaned).toBe("peanutscriptalert(1)");
      expect(cleaned).not.toContain("<");
      expect(cleaned).not.toContain("\x00");
    });

    it("bounds array lengths and trims strings in profile payload", () => {
      const oversizedArray = Array.from({ length: 60 }, (_, i) => `allergen_${i}`);
      const payload = sanitizeProfilePayload({
        addAllergens: oversizedArray,
        setDiet: "vegan<danger>",
        householdSize: 99,
      });

      expect(payload.addAllergens.length).toBe(30); // Capped at max 30
      expect(payload.setDiet).toBe("vegandanger");
      expect(payload.householdSize).toBe(20); // Clamped to 20
    });

    it("blocks allergen removal when confirmAllergenRemoval is omitted/false", () => {
      const existingAllergens = ["peanuts", "shellfish", "dairy"];
      const removals = ["peanut", "soy"];

      const unconfirmedAudit = auditAllergenRemoval(existingAllergens, removals, false);
      expect(unconfirmedAudit.blocked).toBe(true);
      expect(unconfirmedAudit.removedAllergens).toEqual([]);
      expect(unconfirmedAudit.warning).toContain("Allergen removal blocked: Attempted to remove [peanuts] without confirmation");
      expect(unconfirmedAudit.criticalNotice).toContain("confirmAllergenRemoval: true");
    });

    it("allows allergen removal and audits warning when confirmAllergenRemoval is true", () => {
      const existingAllergens = ["peanuts", "shellfish", "dairy"];
      const removals = ["peanut", "soy"];

      const confirmedAudit = auditAllergenRemoval(existingAllergens, removals, true);
      expect(confirmedAudit.blocked).toBe(false);
      expect(confirmedAudit.removedAllergens).toEqual(["peanuts"]);
      expect(confirmedAudit.warning).toContain("Active allergen guardrails were removed from profile: [peanuts]");
      expect(confirmedAudit.criticalNotice).toContain("prevent physical allergen exposure");
    });

    it("rejects unauthorized profile updates from anonymous callers", async () => {
      const anonCaller: ResolvedCaller = {
        userId: null,
        apiKeyId: null,
        caller: "anonymous-muse-agent",
        isSynthetic: false,
        rateLimitTier: null,
      };

      const result = await updateCulinaryProfileHandler(
        { addAllergens: ["sesame"] },
        anonCaller,
      );

      expect(result.ok).toBe(false);
      expect(result.errorCode).toBe("UNAUTHORIZED");
      expect(result.errorMessage).toContain("requires an authenticated caller");
    });
  });
});
