jest.mock("@/lib/logger", () => ({
  _logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { PlanetaryAPIClient } from "@/lib/planetary-api-client";

const originalFetch = global.fetch;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("PlanetaryAPIClient response boundaries", () => {
  const fetchMock = jest.fn();
  const client = new PlanetaryAPIClient("https://planetary.example");

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns validated planetary positions", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          sun: { longitude: 12, latitude: 0, distance: 1, speed: 0.98 },
        },
      }),
    );

    await expect(
      client.getPlanetaryPositions(new Date("2026-08-28T12:00:00Z")),
    ).resolves.toEqual({
      sun: { longitude: 12, latitude: 0, distance: 1, speed: 0.98 },
    });
  });

  it("rejects a successful envelope whose nested data is malformed", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          sun: { longitude: 12, latitude: 0, distance: 1 },
        },
      }),
    );

    await expect(
      client.getPlanetaryPositions(new Date("2026-08-28T12:00:00Z")),
    ).rejects.toThrow("expected contract");
  });

  it("preserves an unsuccessful backend envelope's error message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: "Ephemeris unavailable" }),
    );

    await expect(
      client.getPlanetaryPositions(new Date("2026-08-28T12:00:00Z")),
    ).rejects.toThrow("Ephemeris unavailable");
  });

  it("preserves error details from non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: "Rate limited" },
        { status: 429, statusText: "Too Many Requests" },
      ),
    );

    await expect(
      client.getPlanetaryPositions(new Date("2026-08-28T12:00:00Z")),
    ).rejects.toThrow("Rate limited");
  });
});
