/**
 * Historical births, and the two-digit-year trap that widening the range exposes.
 *
 * The create endpoint rejected any year outside 1900-2100 while
 * `/api/internal/agent-sync` accepted anything — its own fixture is Hildegard of
 * Bingen, 1098-09-17 — so the public path could not author what the sync path
 * routinely does.
 *
 * The trap: `Date.UTC(year, …)` maps years 0-99 to 1900-1999. That is specified
 * ECMAScript behaviour, so nothing errors; it silently shifts a birth by 1900
 * years. Unreachable under the old floor, reachable the moment the range widens.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { calculateNatalChart } from "@/services/natalChartService";
import { executeQuery } from "@/lib/database";
import { MAX_BIRTH_YEAR, MIN_BIRTH_YEAR } from "@/lib/agents/birthYear";
import { POST } from "../route";

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));
jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "creator-uuid-0001" } })),
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn(async () => ({ allowed: true })) }));
jest.mock("@/services/natalChartService", () => ({ calculateNatalChart: jest.fn() }));
jest.mock("@/lib/agents/persona/build-agent-context", () => ({ buildAgentContext: jest.fn() }));
jest.mock("@/lib/serviceUrls", () => ({ getServiceUrlSafe: jest.fn(() => null) }));

const SIGNS = ["leo", "taurus", "virgo", "cancer", "aries", "sagittarius", "capricorn", "aquarius", "pisces", "scorpio", "gemini"];
const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant"];

const serverChart = {
  planets: PLANETS.map((name, i) => ({ name, sign: SIGNS[i], position: i * 30 + 15 })),
  ascendant: "gemini",
  elementalBalance: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
};

const makeRequest = (body: unknown): any =>
  ({ headers: { get: () => null }, json: async () => body }) as unknown as any;

const create = (year: number, month = 9, day = 17, hour = 12, minute = 0) =>
  POST(
    makeRequest({
      action: "create",
      parameters: {
        name: "Historical Agent",
        purpose: "Pin the accepted birth-year range",
        birthInfo: { year, month, day, hour, minute, latitude: 49.79, longitude: 8.12 },
      },
    }),
  );

/** birth_data is $4 of the user_profiles INSERT — index 3. */
const BIRTH_DATA_PARAM = 3;

function storedBirthData(): { dateTime: string } {
  const call = (executeQuery as jest.Mock).mock.calls.find(([sql]: [string]) =>
    sql.includes("INSERT INTO user_profiles"),
  );
  if (!call) throw new Error("INSERT INTO user_profiles was never called");
  return JSON.parse(call[1][BIRTH_DATA_PARAM] as string);
}

describe("POST /api/agents/unified — accepted birth years", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (calculateNatalChart as jest.Mock).mockResolvedValue(serverChart);
    (executeQuery as jest.Mock).mockResolvedValue({ rows: [], rowCount: 1 });
  });

  it("accepts a medieval birth the sync path already accepts", async () => {
    const data = await (await create(1098)).json();

    expect(data.success).toBe(true);
    // Hildegard of Bingen — the agent-sync test fixture, previously rejected here.
    expect(storedBirthData().dateTime).toBe("1098-09-17T12:00:00.000Z");
  });

  it("a two-digit year is NOT shifted into the 1900s", async () => {
    const data = await (await create(50)).json();

    expect(data.success).toBe(true);
    // `Date.UTC(50, …)` would have made this 1950-09-17 — silently, no error.
    expect(storedBirthData().dateTime).toBe("0050-09-17T12:00:00.000Z");
    expect(storedBirthData().dateTime).not.toContain("1950");
  });

  it.each([MIN_BIRTH_YEAR, 1600, 1899, 1900, 2026, MAX_BIRTH_YEAR])(
    "accepts year %s and stores it unchanged",
    async (year) => {
      const data = await (await create(year)).json();

      expect(data.success).toBe(true);
      expect(new Date(storedBirthData().dateTime).getUTCFullYear()).toBe(year);
    },
  );

  it.each([0, -1, MAX_BIRTH_YEAR + 1, 3000])("still rejects year %s", async (year) => {
    const res = await create(year);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    // A BCE birth needs a proleptic-calendar convention this codebase has never
    // fixed; refusing beats silently inventing one.
    expect(data.error).toContain(`year: ${MIN_BIRTH_YEAR}-${MAX_BIRTH_YEAR}`);
  });

  it("the other field validations are untouched", async () => {
    for (const bad of [
      { year: 1098, month: 13 },
      { year: 1098, day: 32 },
      { year: 1098, hour: 24 },
    ]) {
      const res = await create(bad.year, bad.month ?? 9, bad.day ?? 17, bad.hour ?? 12);
      expect(res.status).toBe(400);
    }
  });
});
