/**
 * Unit tests for POST /api/agent-forge/ignite
 *
 * Guards the onboarding dual-write fix. The /onboarding page posts here, and
 * this route must persist onboarding through userDatabase.updateUserProfile()
 * — which writes the normalized user_profiles columns (onboarding_completed,
 * birth_data, natal_chart) that rowToUserWithProfile reads back into the
 * session JWT and that the admin onboarding funnel + /lab stats panels read. A
 * raw jsonb_set on the users.profile JSONB alone is invisible to all of them,
 * which previously made the funnel report 0% completion and left /lab showing
 * "AWAITING BACKEND" for onboarded users. These tests pin the contract so it
 * can't silently regress.
 */

// next/server stub so NextResponse.json works without a web Response in jsdom.
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));
jest.mock("@/lib/serviceUrls", () => ({
  getServiceUrl: jest.fn(() => "https://api.agents.example"),
}));
jest.mock("@/services/geocodingService", () => ({
  geocodeLocationSingle: jest.fn(),
}));
jest.mock("@/services/natalChartService", () => ({
  calculateNatalChart: jest.fn(),
}));
jest.mock("@/services/RealAlchemizeService", () => ({
  alchemize: jest.fn(() => ({ thermodynamicProperties: {} })),
}));
jest.mock("@/utils/astrology/positions", () => ({
  getAccuratePlanetaryPositions: jest.fn(() => ({})),
}));
jest.mock("@/utils/astrology/signElement", () => ({
  getDominantElementFromPositions: jest.fn(() => "Fire"),
}));
jest.mock("@/utils/planetaryAlchemyMapping", () => ({
  calculateAlchemicalFromPlanets: jest.fn(() => ({})),
}));
jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { updateUserProfile: jest.fn() },
}));

import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database";
import { geocodeLocationSingle } from "@/services/geocodingService";
import { calculateNatalChart } from "@/services/natalChartService";
import { userDatabase } from "@/services/userDatabaseService";
import { POST } from "../ignite/route";

const mockAuth = auth as unknown as jest.Mock;
const mockGeocode = geocodeLocationSingle as unknown as jest.Mock;
const mockCalcChart = calculateNatalChart as unknown as jest.Mock;
const mockExecuteQuery = executeQuery as unknown as jest.Mock;
const mockUpdateProfile = userDatabase.updateUserProfile as unknown as jest.Mock;

// The recipe-gen fetch wraps its request in AbortSignal.timeout(); guard it so
// the test is robust across the jsdom/Node global surface.
if (typeof (AbortSignal as unknown as { timeout?: unknown }).timeout !== "function") {
  (AbortSignal as unknown as { timeout: () => AbortSignal }).timeout = () =>
    new AbortController().signal;
}

const MOCK_CHART = {
  elementalBalance: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
  dominantElement: "Fire",
  planets: [],
};

const VALID_BODY = { dob: "1990-05-15T10:30:00.000Z", city: "New York" };

const EXPECTED_BIRTH_DATA = {
  dateTime: "1990-05-15T10:30:00.000Z",
  latitude: 40.7,
  longitude: -74,
  timezone: "America/New_York",
};

function makeRequest(body: unknown): Request {
  return {
    json: async () => body,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "cookie" ? "session=abc" : null,
    },
  } as unknown as Request;
}

describe("POST /api/agent-forge/ignite", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockGeocode.mockResolvedValue({
      latitude: 40.7,
      longitude: -74,
      estimatedTimezone: "America/New_York",
    });
    mockCalcChart.mockResolvedValue(MOCK_CHART);
    mockExecuteQuery.mockResolvedValue({ rows: [] });
    mockUpdateProfile.mockResolvedValue({ id: "user-123" });

    // Recipe generation succeeds → happy path, never reaches the PA fallback.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ recipe: { title: "Onboarding Meal" } }),
      text: async () => "",
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("persists onboarding through updateUserProfile (onboardingComplete + chart + birthData)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(200);
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      "user-123",
      {
        birthData: EXPECTED_BIRTH_DATA,
        natalChart: MOCK_CHART,
        onboardingComplete: true,
      },
      "test@example.com",
    );
  });

  it("returns 401 and never writes the profile when the session has no user id", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(401);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("returns 400 when dob or city is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });

    const res = await POST(makeRequest({ city: "New York" }));

    expect(res.status).toBe(400);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("still returns 200 and logs at error level when the profile write throws (non-blocking contract)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });
    mockUpdateProfile.mockRejectedValue(new Error("DB down"));

    const res = await POST(makeRequest(VALID_BODY));

    // The constitution is already stored, so a profile-write failure must not
    // 500 the ignition — but it must surface in logs, not fail silently.
    expect(res.status).toBe(200);
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("profile persistence failed"),
      expect.any(Error),
    );
  });
});
