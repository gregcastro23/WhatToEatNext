/**
 * @file src/app/api/mcp/__tests__/openapiBridge.test.ts
 *
 * Tests for the OpenAPI 3.1.0 REST Tool Bridge (/api/mcp/openapi.json & /api/mcp/rest/[tool])
 * and expanded web agent CORS allowlist.
 */

import {
  GET as getOpenApi,
  OPTIONS as optionsOpenApi,
} from "@/app/api/mcp/openapi.json/route";
import {
  POST as postRestTool,
  OPTIONS as optionsRestTool,
} from "@/app/api/mcp/rest/[tool]/route";
import { TOOL_NAMES } from "@/lib/mcp/catalog";
import { isTrustedOrigin } from "@/lib/mcp/httpSecurity";
import { mapToolErrorCodeToHttpStatus } from "@/lib/mcp/openapiBridge";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

describe("OpenAPI 3.1.0 REST Bridge & Expanded Web Agent CORS", () => {
  describe("Expanded Trusted Browser Origins", () => {
    it("allows Google AI Studio, Claude, ChatGPT, MCP Inspector, Smithery, and Glama origins", () => {
      expect(isTrustedOrigin("https://aistudio.google.com")).toBe(true);
      expect(isTrustedOrigin("https://idx.google.com")).toBe(true);
      expect(isTrustedOrigin("https://claude.ai")).toBe(true);
      expect(isTrustedOrigin("https://chatgpt.com")).toBe(true);
      expect(isTrustedOrigin("https://platform.openai.com")).toBe(true);
      expect(isTrustedOrigin("https://inspector.modelcontextprotocol.io")).toBe(
        true,
      );
      expect(isTrustedOrigin("https://smithery.ai")).toBe(true);
      expect(isTrustedOrigin("https://glama.ai")).toBe(true);
    });

    it("continues rejecting untrusted third-party browser origins", () => {
      expect(isTrustedOrigin("https://evil-google.com")).toBe(false);
      expect(isTrustedOrigin("https://phishing.example.org")).toBe(false);
    });
  });

  describe("GET /api/mcp/openapi.json", () => {
    it("generates a valid OpenAPI 3.1.0 spec with dual-mode auth for free vs metered tools", async () => {
      const req = new Request("https://alchm.kitchen/api/mcp/openapi.json", {
        method: "GET",
        headers: {
          Host: "alchm.kitchen",
          Origin: "https://chatgpt.com",
        },
      });
      const res = getOpenApi(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("access-control-allow-origin")).toBe(
        "https://chatgpt.com",
      );

      const rawSpec: unknown = await res.json();
      expect(isRecord(rawSpec)).toBe(true);
      if (!isRecord(rawSpec)) return;

      expect(rawSpec.openapi).toBe("3.1.0");
      expect(Array.isArray(rawSpec.servers)).toBe(true);
      if (Array.isArray(rawSpec.servers) && isRecord(rawSpec.servers[0])) {
        expect(rawSpec.servers[0].url).toBe("https://alchm.kitchen");
      }

      const paths = rawSpec.paths;
      expect(isRecord(paths)).toBe(true);
      if (!isRecord(paths)) return;
      expect(Object.keys(paths)).toHaveLength(TOOL_NAMES.length);

      // 0-ESMS readOnlyHint: true tools have optional security
      const subPath = paths["/api/mcp/rest/substitute_ingredient"];
      if (isRecord(subPath) && isRecord(subPath.post)) {
        expect(subPath.post.operationId).toBe("substitute_ingredient");
        expect(subPath.post["x-esms-cost"]).toBe(0);
        expect(subPath.post["x-read-only"]).toBe(true);
        expect(subPath.post.security).toEqual([{}, { BearerAuth: [] }]);
      }

      // Paid 10-ESMS tools (what_to_cook_now & generate_cosmic_recipe) require BearerAuth
      const cookPath = paths["/api/mcp/rest/what_to_cook_now"];
      if (isRecord(cookPath) && isRecord(cookPath.post)) {
        expect(cookPath.post["x-esms-cost"]).toBe(10);
        expect(cookPath.post["x-read-only"]).toBe(false);
        expect(cookPath.post.security).toEqual([{ BearerAuth: [] }]);
      }

      const recipePath = paths["/api/mcp/rest/generate_cosmic_recipe"];
      if (isRecord(recipePath) && isRecord(recipePath.post)) {
        expect(recipePath.post["x-esms-cost"]).toBe(10);
        expect(recipePath.post.security).toEqual([{ BearerAuth: [] }]);
      }
    });

    it("rejects untrusted Origin on OPTIONS /api/mcp/openapi.json with 403", () => {
      const badRes = optionsOpenApi(
        new Request("https://alchm.kitchen/api/mcp/openapi.json", {
          method: "OPTIONS",
          headers: { Origin: "https://untrusted.example.com" },
        }),
      );
      expect(badRes.status).toBe(403);
    });
  });

  describe("POST /api/mcp/rest/[tool]", () => {
    it("unwraps MCP envelope and returns 200 OK JSON on valid tool call", async () => {
      const req = new Request(
        "https://alchm.kitchen/api/mcp/rest/substitute_ingredient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://aistudio.google.com",
          },
          body: JSON.stringify({
            ingredient: "butter",
            dietaryRestriction: "vegan",
          }),
        },
      );

      const res = await postRestTool(req, {
        params: Promise.resolve({ tool: "substitute_ingredient" }),
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("access-control-allow-origin")).toBe(
        "https://aistudio.google.com",
      );
      const body: unknown = await res.json();
      expect(isRecord(body)).toBe(true);
      if (!isRecord(body)) return;
      expect(body.originalIngredient).toBe("butter");
      expect(Array.isArray(body.substitutes)).toBe(true);
      expect(typeof body.correlationId).toBe("string");
    });

    it("returns 404 on unknown tool and 400 on invalid arguments", async () => {
      const unknownRes = await postRestTool(
        new Request("https://alchm.kitchen/api/mcp/rest/nonexistent_tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        }),
        { params: Promise.resolve({ tool: "nonexistent_tool" }) },
      );
      expect(unknownRes.status).toBe(404);
      const unknownBody: unknown = await unknownRes.json();
      if (isRecord(unknownBody)) {
        expect(unknownBody.errorCode).toBe("NOT_FOUND");
      }

      const badArgsRes = await postRestTool(
        new Request(
          "https://alchm.kitchen/api/mcp/rest/substitute_ingredient",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          },
        ),
        { params: Promise.resolve({ tool: "substitute_ingredient" }) },
      );
      expect(badArgsRes.status).toBe(400);
      const badArgsBody: unknown = await badArgsRes.json();
      if (isRecord(badArgsBody)) {
        expect(badArgsBody.errorCode).toBe("INVALID_ARGS");
      }
    });

    it("maps tool error codes to standard HTTP status codes", () => {
      expect(mapToolErrorCodeToHttpStatus("INVALID_ARGS")).toBe(400);
      expect(mapToolErrorCodeToHttpStatus("UNAUTHORIZED")).toBe(401);
      expect(mapToolErrorCodeToHttpStatus("QUOTA")).toBe(402);
      expect(mapToolErrorCodeToHttpStatus("NOT_FOUND")).toBe(404);
      expect(mapToolErrorCodeToHttpStatus("CONFLICT")).toBe(409);
      expect(mapToolErrorCodeToHttpStatus("RATE_LIMIT")).toBe(429);
      expect(mapToolErrorCodeToHttpStatus("UPSTREAM")).toBe(502);
      expect(mapToolErrorCodeToHttpStatus("INTERNAL")).toBe(500);

      const okOptions = optionsRestTool(
        new Request(
          "https://alchm.kitchen/api/mcp/rest/substitute_ingredient",
          {
            method: "OPTIONS",
            headers: { Origin: "https://claude.ai" },
          },
        ),
      );
      expect(okOptions.status).toBe(204);
    });
  });
});
