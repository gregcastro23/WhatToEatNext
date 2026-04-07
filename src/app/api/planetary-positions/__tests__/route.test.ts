/**
 * Tests for planetary-positions API route.
 * Verifies backend integration and fallback logic.
 */
// Mock next/server before anything else
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method?: string;
    body?: any;
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method;
      this.body = init?.body;
    }
    async json() {
      return JSON.parse(this.body);
    }
  },
}));

// Set environment variables BEFORE importing the route handlers
process.env.BACKEND_URL = "https://mock-backend.railway.app";
process.env.INTERNAL_API_SECRET = "test-secret";

import { GET, POST } from "../route";
import * as positionsUtils from "@/utils/astrology/positions";

// Mock the astrology utilities - keep getSignFromLongitude real for normalization tests
jest.mock("@/utils/astrology/positions", () => ({
  ...jest.requireActual("@/utils/astrology/positions"),
  getAccuratePlanetaryPositions: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Planetary Positions API (/api/planetary-positions)", () => {
  const mockParams = {
    year: 2026,
    month: 4,
    day: 6,
    hour: 12,
    minute: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/planetary-positions", () => {
    it("should return positions from remote backend when successful", async () => {
      const mockBackendData = {
        planetary_positions: {
          Sun: { exactLongitude: 15.5, sign: "Aries", degree: 15.5, isRetrograde: false },
          Moon: { exactLongitude: 145.2, sign: "Leo", degree: 25, isRetrograde: false },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendData,
      });

      const req = new (jest.requireMock("next/server").NextRequest)(
        `http://localhost:3000/api/planetary-positions?year=${mockParams.year}&month=${mockParams.month}&day=${mockParams.day}`
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data.source).toBe("backend-pyswisseph");
      expect(data.positions.Sun).toBeDefined();
      expect(data.positions.Sun.sign).toBe("aries");
      expect(data.positions.Sun.degree).toBe(15); // Floored from 15.5
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/planetary/positions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Internal-Secret": "test-secret",
          }),
        })
      );
    });

    it("should fallback to local astronomy-engine when backend fails", async () => {
      // Mock fetch failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Mock local calculation
      const mockLocalData = {
        Sun: { sign: "Aries", degree: 15.5, exactLongitude: 15.5, isRetrograde: false },
      };
      (positionsUtils.getAccuratePlanetaryPositions as jest.Mock).mockReturnValue(mockLocalData);

      const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/planetary-positions");

      const response = await GET(req);
      const data = await response.json();

      expect(data.source).toBe("local-astronomy-engine");
      expect(data.positions.Sun.sign).toBe("Aries");
      expect(positionsUtils.getAccuratePlanetaryPositions).toHaveBeenCalled();
    });

    it("should correctly normalize different backend shapes (positions vs planetary_positions)", async () => {
      const mockBackendData = {
        positions: {
          Mercury: { longitude: 45.8, isRetrograde: true }, // No sign/degree, testing auto-calculation from longitude
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendData,
      });

      const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/planetary-positions");
      const response = await GET(req);
      const data = await response.json();

      expect(data.positions.Mercury.sign).toBe("taurus");
      // degree is longitude % 30 = 45.8 % 30 = 15
      expect(data.positions.Mercury.degree).toBe(15);
      expect(data.positions.Mercury.isRetrograde).toBe(true);
    });
  });

  describe("POST /api/planetary-positions", () => {
    it("should parse body and fetch from backend", async () => {
      const mockBackendData = { Mars: { exactLongitude: 200, sign: "Libra" } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendData,
      });

      const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/planetary-positions", {
        method: "POST",
        body: JSON.stringify({ year: 2025, month: 12 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.source).toBe("backend-pyswisseph");
      const lastFetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const sentPayload = JSON.parse(lastFetchCall[1].body);
      expect(sentPayload.year).toBe(2025);
      expect(sentPayload.month).toBe(12);
    });
  });
});
