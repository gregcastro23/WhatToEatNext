import { NextRequest } from "next/server";
import { AstrologizeSuccessResponseSchema } from "@/lib/validation/astrologySchemas";
import { GET, POST } from "../route";

describe("Astrologize boundary validation (AstrologizeSuccessResponseSchema)", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.HONO_API_URL;

  beforeEach(() => {
    process.env.HONO_API_URL = "https://hono.internal";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.HONO_API_URL = originalEnv;
  });

  const validPlanet = {
    key: "sun",
    label: "Sun",
    Sign: {
      key: "aries",
      zodiac: "tropical",
      label: "Aries",
    },
    ChartPosition: {
      Ecliptic: {
        DecimalDegrees: 15.5,
        ArcDegrees: {
          degrees: 15,
          minutes: 30,
          seconds: 0,
        },
      },
    },
    isRetrograde: false,
  };

  describe("Rejection tests for malformed or degraded upstream payloads", () => {
    it("rejects empty object {}", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects payload with only success: true and missing celestial bodies", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({ success: true });
      expect(result.success).toBe(false);
    });

    it("rejects upstream failure payload { success: false, error: 'upstream failed' }", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({
        success: false,
        error: "upstream failed",
      });
      expect(result.success).toBe(false);
    });

    it("rejects payload with empty celestial bodies array { success: true, _celestialBodies: { all: [] } }", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({
        success: true,
        _celestialBodies: { all: [] },
      });
      expect(result.success).toBe(false);
    });

    it("rejects payload with error field present even if success is true", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({
        success: true,
        error: "upstream degraded",
        _celestialBodies: { all: [validPlanet] },
      });
      expect(result.success).toBe(false);
    });

    it("rejects celestial bodies where planet data is incomplete", () => {
      const result = AstrologizeSuccessResponseSchema.safeParse({
        success: true,
        _celestialBodies: {
          all: [{ key: "sun", label: "Sun" }],
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Acceptance tests for valid upstream payloads", () => {
    it("accepts valid successful response with usable planetary data", () => {
      const validPayload = {
        success: true,
        _celestialBodies: {
          all: [validPlanet],
          sun: validPlanet,
        },
        birth_info: {
          year: 2026,
          month: 7,
          date: 12,
          hour: 12,
          minute: 0,
          latitude: 40.7128,
          longitude: -74.006,
        },
        source: "hono-gateway",
        precision: "arcsecond",
      };

      const result = AstrologizeSuccessResponseSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (!result.success) throw new Error("Expected valid payload to parse successfully");
      expect(result.data.success).toBe(true);
      expect(result.data._celestialBodies.all).toHaveLength(1);
      expect(result.data.source).toBe("hono-gateway");
    });
  });

  describe("Route fallback behavior when Hono returns malformed payloads", () => {
    it("falls through to local calculation when Hono returns {}", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const req = new NextRequest("http://localhost:3000/api/astrologize?year=2026&month=7&date=12");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.source).toBe("astronomy-engine");
      expect(json.success).toBe(true);
    });

    it("falls through to local calculation when Hono returns upstream error", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: "upstream failed" }),
      });

      const req = new NextRequest("http://localhost:3000/api/astrologize?year=2026&month=7&date=12");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.source).toBe("astronomy-engine");
      expect(json.success).toBe(true);
    });

    it("falls through to local calculation when Hono returns empty bodies array", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, _celestialBodies: { all: [] } }),
      });

      const req = new NextRequest("http://localhost:3000/api/astrologize?year=2026&month=7&date=12");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.source).toBe("astronomy-engine");
      expect(json.success).toBe(true);
    });

    it("returns Hono data when Hono returns a valid successful payload", async () => {
      const validPayload = {
        success: true,
        _celestialBodies: {
          all: [validPlanet],
          sun: validPlanet,
        },
        source: "hono-gateway",
        precision: "arcsecond",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => validPayload,
      });

      const req = new NextRequest("http://localhost:3000/api/astrologize?year=2026&month=7&date=12");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.source).toBe("hono-gateway");
      expect(json.success).toBe(true);
    });
  });
});
