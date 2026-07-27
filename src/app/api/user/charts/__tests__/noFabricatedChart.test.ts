/**
 * The property that matters end to end: a chart that cannot be stated is never
 * PERSISTED.
 *
 * This route saved whatever it could assemble, and what it assembled included an
 * invented "aries" ascendant and a `?? 0` longitude — then handed it to
 * `createSavedChart`. The unit tests for `natalBodiesFromRawPositions` cover the
 * builder; this covers the thing a user would actually be shown later, by asserting
 * the database is never reached.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { POST } from "../route";

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(async () => "11111111-1111-4111-8111-111111111111"),
}));
jest.mock("@/services/astrologizeApi", () => ({ getPlanetaryPositionsForDateTime: jest.fn() }));
jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: { createSavedChart: jest.fn(), listSavedCharts: jest.fn() },
}));
jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { getUserById: jest.fn() },
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

const MEASURED = {
  Sun: { sign: "virgo", degree: 24.76, exactLongitude: 174.7641 },
  Moon: { sign: "taurus", degree: 3.2, exactLongitude: 33.2 },
  Mercury: { sign: "libra", degree: 2.5, exactLongitude: 182.5 },
  Venus: { sign: "cancer", degree: 20, exactLongitude: 110 },
  Mars: { sign: "aries", degree: 8, exactLongitude: 8 },
  Jupiter: { sign: "sagittarius", degree: 25, exactLongitude: 265 },
  Saturn: { sign: "capricorn", degree: 11, exactLongitude: 281 },
  Uranus: { sign: "aquarius", degree: 10, exactLongitude: 310 },
  Neptune: { sign: "pisces", degree: 10, exactLongitude: 340 },
  Pluto: { sign: "scorpio", degree: 10, exactLongitude: 220 },
  Ascendant: { sign: "leo", degree: 15.03, exactLongitude: 135.0341 },
};

const request = (): any =>
  ({
    json: async () => ({
      label: "Cosmic identity",
      birthData: { dateTime: "1984-09-17T12:00:00.000Z", latitude: 49.79, longitude: 8.12 },
    }),
  }) as unknown as any;

describe("POST /api/user/charts — a fabricated chart is never saved", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue("11111111-1111-4111-8111-111111111111");
    (commensalDatabase.createSavedChart as jest.Mock).mockResolvedValue({ id: "chart_1" });
  });

  it("CONTROL: a complete chart IS saved, with its measured longitudes", async () => {
    (getPlanetaryPositionsForDateTime as jest.Mock).mockResolvedValue(MEASURED);

    const res = await POST(request());
    expect((await res.json()).success).toBe(true);
    expect(commensalDatabase.createSavedChart).toHaveBeenCalledTimes(1);

    const saved = (commensalDatabase.createSavedChart as jest.Mock).mock.calls[0][0];
    const sun = saved.natalChart.planets.find((p: { name: string }) => p.name === "Sun");
    expect(sun.position).toBe(174.7641);
    expect(saved.natalChart.ascendant).toBe("leo");
    // If this control ever fails, every refusal assertion below is vacuous.
  });

  it("returns 503 and saves NOTHING when the ascendant is missing", async () => {
    (getPlanetaryPositionsForDateTime as jest.Mock).mockResolvedValue({
      ...MEASURED,
      Ascendant: undefined,
    });

    const res = await POST(request());
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Ascendant");
    // The whole point: no row, rather than a row claiming an Aries rising.
    expect(commensalDatabase.createSavedChart).not.toHaveBeenCalled();
  });

  it("returns 503 and saves NOTHING when a planet is missing", async () => {
    (getPlanetaryPositionsForDateTime as jest.Mock).mockResolvedValue({
      ...MEASURED,
      Pluto: undefined,
    });

    const res = await POST(request());

    expect(res.status).toBe(503);
    expect(commensalDatabase.createSavedChart).not.toHaveBeenCalled();
  });

  it("still saves when a longitude is absent, deriving it from the sign", async () => {
    (getPlanetaryPositionsForDateTime as jest.Mock).mockResolvedValue({
      ...MEASURED,
      Pluto: { sign: "scorpio", degree: 10 },
    });

    const res = await POST(request());
    expect((await res.json()).success).toBe(true);

    const saved = (commensalDatabase.createSavedChart as jest.Mock).mock.calls[0][0];
    const pluto = saved.natalChart.planets.find((p: { name: string }) => p.name === "Pluto");
    // 210 (scorpio) + 10 — inside the sign the row itself states. Never 0.
    expect(pluto.position).toBe(220);
    expect(pluto.position).not.toBe(0);
  });

  it("no saved body ever carries a 0 longitude paired with a non-Aries sign", async () => {
    // The signature of the old defect, stated as an invariant over the whole chart.
    (getPlanetaryPositionsForDateTime as jest.Mock).mockResolvedValue(
      Object.fromEntries(
        Object.entries(MEASURED).map(([body, p]) => [body, { sign: p.sign, degree: p.degree }]),
      ),
    );

    await POST(request());
    const saved = (commensalDatabase.createSavedChart as jest.Mock).mock.calls[0][0];

    for (const planet of saved.natalChart.planets) {
      if (planet.sign !== "aries") expect(planet.position).not.toBe(0);
      expect(Math.floor(planet.position / 30)).toBe(
        ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
         "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"].indexOf(planet.sign),
      );
    }
  });
});
