/**
 * Unit Tests for /api/internal/agent-sync
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { withTransaction } from "@/lib/database";
import { agentMonica } from "@/utils/agentMonica";
import { MIN_CHART_BODIES } from "@/utils/fullChartMonica";
import { POST } from "../route";

jest.mock("@/lib/database", () => ({
  withTransaction: jest.fn(),
  executeQuery: jest.fn(),
}));

function makeRequest(body: unknown, headers: Record<string, string>): any {
  return {
    headers: {
      get: (name: string) =>
        headers[name] || headers[name.toLowerCase()] || null,
    },
    json: async () => body,
  } as unknown as any;
}

const mockSyncSecret = "test_sync_secret_123";

describe("POST /api/internal/agent-sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALCHM_KITCHEN_SYNC_SECRET = mockSyncSecret;
  });

  it("returns 401 when sync secret header is missing", async () => {
    const res = await POST(
      makeRequest({ email: "hildegard@agentic.alchm.kitchen" }, {}),
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Unauthorized");
    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("returns 401 when sync secret header is invalid", async () => {
    const res = await POST(
      makeRequest(
        { email: "hildegard@agentic.alchm.kitchen" },
        { "X-Sync-Secret": "wrong_secret" },
      ),
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(
      makeRequest(
        { displayName: "Monica" },
        { "X-Sync-Secret": mockSyncSecret },
      ),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("email is required");
  });

  it("returns 400 when email domain is not white-listed", async () => {
    const res = await POST(
      makeRequest(
        { email: "hildegard@gmail.com" },
        { "X-Sync-Secret": mockSyncSecret },
      ),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Sync is restricted to agentic namespaces");
  });

  it("rejects malformed birth coordinates before opening a transaction", async () => {
    const res = await POST(
      makeRequest(
        {
          email: "hildegard@agentic.alchm.kitchen",
          birthLocation: { latitude: "49.79", longitude: 8.12 },
        },
        { "X-Sync-Secret": mockSyncSecret },
      ),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid sync payload");
    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("creates a new user and profile on first sync (idempotent, created: true)", async () => {
    const mockClient = {
      query: jest.fn().mockImplementation((queryStr: string) => {
        if (queryStr.includes("SELECT id FROM users")) {
          return Promise.resolve({ rows: [] }); // User does not exist
        }
        return Promise.resolve({ rowCount: 1, rows: [] });
      }),
    };

    (withTransaction as jest.Mock).mockImplementation(async (callback) => {
      await callback(mockClient);
    });

    const body = {
      email: "hildegard@agentic.alchm.kitchen",
      displayName: "Hildegard of Bingen",
      bio: "Sybill of the Rhine",
      birthDate: "1098-09-17",
      birthTime: "12:00",
      birthLocation: {
        displayName: "Bermersheim vor der Höhe, Germany",
        latitude: 49.79,
        longitude: 8.12,
        timezone: "Europe/Berlin",
      },
      monicaConstant: "1.618033",
      dominantElement: "Water",
    };

    const res = await POST(
      makeRequest(body, { "X-Sync-Secret": mockSyncSecret }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.created).toBe(true);
    expect(data.wtenUserId).toBeDefined();

    // Verify INSERT queries are triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      expect.any(Array),
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO user_profiles"),
      expect.any(Array),
    );
    // Verify wallet and streak seeding
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO token_balances"),
      expect.any(Array),
    );
  });

  it("updates existing user and profile on repeated sync (idempotent, created: false)", async () => {
    const existingId = "existing-uuid-12345";
    const mockClient = {
      query: jest.fn().mockImplementation((queryStr: string) => {
        if (queryStr.includes("SELECT id FROM users")) {
          return Promise.resolve({ rows: [{ id: existingId }] }); // User exists
        }
        return Promise.resolve({ rowCount: 1, rows: [] });
      }),
    };

    (withTransaction as jest.Mock).mockImplementation(async (callback) => {
      await callback(mockClient);
    });

    const body = {
      email: "hildegard@agents.alchm.kitchen", // test @agents.alchm.kitchen domain
      displayName: "Hildegard of Bingen",
      bio: "Updated bio description",
    };

    const res = await POST(
      makeRequest(body, { "X-Sync-Secret": mockSyncSecret }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.created).toBe(false);
    expect(data.wtenUserId).toBe(existingId);

    // Verify UPDATE users is triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users"),
      expect.any(Array),
    );
    // Verify user_profiles upsert/ON CONFLICT DO UPDATE is triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO user_profiles"),
      expect.any(Array),
    );
  });

  // §18j — the 4th write path. This endpoint used to trust `monicaConstant`
  // straight from the sync payload (PA's own legacy, disconnected, unsigned
  // formula) via a bare parseFloat. It now computes it server-side from the
  // agent's own name, the same way sync-debit and agents/unified do — WTEN
  // owns the truth regardless of what the payload claims.
  describe("monica is computed server-side, not trusted from the payload", () => {
    function captureUserProfilesParams(mockClient: {
      query: jest.Mock;
    }): unknown[] {
      const call = mockClient.query.mock.calls.find(([sql]: [string]) =>
        sql.includes("INSERT INTO user_profiles"),
      );
      if (!call) throw new Error("INSERT INTO user_profiles was never called");
      return call[1];
    }

    it("ignores an untrusted monicaConstant and writes the real single-body value instead", async () => {
      const mockClient = {
        query: jest.fn().mockImplementation((queryStr: string) => {
          if (queryStr.includes("SELECT id FROM users")) {
            return Promise.resolve({ rows: [] }); // new user
          }
          return Promise.resolve({ rowCount: 1, rows: [] });
        }),
      };
      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // A resolvable single-body placement, canonical name form.
      const body = {
        email: "jupiter-leo-2@agentic.alchm.kitchen",
        displayName: "Jupiter Leo 2",
        // A hostile/stale value from PA's own legacy formula — must NOT
        // survive into the stored row.
        monicaConstant: "999.999",
      };

      const res = await POST(
        makeRequest(body, { "X-Sync-Secret": mockSyncSecret }),
      );
      expect((await res.json()).ok).toBe(true);

      const params = captureUserProfilesParams(mockClient);
      const expected = agentMonica("Jupiter", "Leo", 2);

      // monica_constant (index 6): the real computed value, not the payload's.
      expect(params[6]).not.toBe("999.999");
      expect(params[6]).toBeCloseTo(expected.combined, 10);
      // monica_diurnal / monica_nocturnal (indices 7, 8).
      expect(params[7]).toBeCloseTo(expected.diurnal, 10);
      expect(params[8]).toBeCloseTo(expected.nocturnal, 10);
      // monica_method (index 9).
      expect(params[9]).toBe("single-body");
    });

    it("stores null (not the payload value) for a name that isn't a placement", async () => {
      const mockClient = {
        query: jest.fn().mockImplementation((queryStr: string) => {
          if (queryStr.includes("SELECT id FROM users")) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rowCount: 1, rows: [] });
        }),
      };
      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      const body = {
        email: "hildegard@agentic.alchm.kitchen",
        displayName: "Hildegard of Bingen", // a real person, not a placement
        monicaConstant: "1.618033", // must not pass through either
      };

      const res = await POST(
        makeRequest(body, { "X-Sync-Secret": mockSyncSecret }),
      );
      expect((await res.json()).ok).toBe(true);

      const params = captureUserProfilesParams(mockClient);
      expect(params[6]).toBeNull(); // monica_constant
      expect(params[7]).toBeNull(); // monica_diurnal
      expect(params[8]).toBeNull(); // monica_nocturnal
      expect(params[9]).toBeNull(); // monica_method
    });
  });

  /**
   * A chart-bearing agent is the same kind of user as a chart-bearing human, so
   * it must derive `natal_positions` through the SAME converter — #751 fixed the
   * human half, where `natal_chart` was stored and `natal_positions` was not, and
   * every full-chart monica silently computed over an empty column.
   *
   * `natal_positions` is parameter index 5 on the profile INSERT.
   */
  describe("natal_positions comes from the shared chart core when the caller omits it", () => {
    function captureUserProfilesParams(mockClient: {
      query: jest.Mock;
    }): unknown[] {
      const call = mockClient.query.mock.calls.find(([sql]: [string]) =>
        sql.includes("INSERT INTO user_profiles"),
      );
      if (!call) throw new Error("INSERT INTO user_profiles was never called");
      return call[1];
    }

    const newUserClient = () => {
      const mockClient = {
        query: jest.fn().mockImplementation((queryStr: string) => {
          if (queryStr.includes("SELECT id FROM users")) {
            return Promise.resolve({ rows: [] }); // new user
          }
          return Promise.resolve({ rowCount: 1, rows: [] });
        }),
      };
      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        await callback(mockClient);
      });
      return mockClient;
    };

    /**
     * A stored-shape chart: `planets` as an ARRAY, the human dialect.
     *
     * Sized from `MIN_CHART_BODIES` rather than a hand-picked count, because the
     * converter returns null for a chart shorter than that — a partial chart is
     * refused rather than silently treated as whole. A literal here would keep
     * passing if that threshold moved.
     */
    const BODIES = [
      { name: "Sun", sign: "leo", position: 132.5 },
      { name: "Moon", sign: "taurus", position: 42.25 },
      { name: "Mercury", sign: "virgo", position: 155.75 },
      { name: "Venus", sign: "cancer", position: 98.5 },
      { name: "Mars", sign: "aries", position: 12.25 },
      { name: "Jupiter", sign: "pisces", position: 341.5 },
    ];
    const CHART = { planets: BODIES };

    it("uses a fixture long enough to clear MIN_CHART_BODIES", () => {
      // Guards the three cases below: if BODIES fell under the threshold the
      // converter would return null and "derived nothing" would be
      // indistinguishable from "derivation is not wired up".
      expect(BODIES.length).toBeGreaterThanOrEqual(MIN_CHART_BODIES);
    });

    it("refuses to derive from a chart shorter than MIN_CHART_BODIES", async () => {
      const mockClient = newUserClient();

      const res = await POST(
        makeRequest(
          {
            email: "hildegard@agentic.alchm.kitchen",
            displayName: "Hildegard of Bingen",
            natalChart: { planets: BODIES.slice(0, MIN_CHART_BODIES - 1) },
          },
          { "X-Sync-Secret": mockSyncSecret },
        ),
      );
      expect((await res.json()).ok).toBe(true);

      // A partial chart yields NULL, not a partial set — the same rule
      // `parseNatalPositions` states. A half-read chart produces a monica that
      // looks fine and means nothing.
      expect(captureUserProfilesParams(mockClient)[5]).toBeNull();
    });

    it("derives positions from the chart when none are supplied", async () => {
      const mockClient = newUserClient();

      const res = await POST(
        makeRequest(
          {
            email: "hildegard@agentic.alchm.kitchen",
            displayName: "Hildegard of Bingen",
            natalChart: CHART,
            // natalPositions deliberately absent — the case this guards
          },
          { "X-Sync-Secret": mockSyncSecret },
        ),
      );
      expect((await res.json()).ok).toBe(true);

      const stored = JSON.parse(
        String(captureUserProfilesParams(mockClient)[5]),
      );
      expect(stored).toHaveLength(BODIES.length);
      expect(stored).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            planet: "Sun",
            sign: "leo",
            position: 132.5,
          }),
          expect.objectContaining({
            planet: "Moon",
            sign: "taurus",
            position: 42.25,
          }),
        ]),
      );
    });

    it("derives when the caller supplies an EMPTY array, not just when absent", async () => {
      const mockClient = newUserClient();

      const res = await POST(
        makeRequest(
          {
            email: "hildegard@agentic.alchm.kitchen",
            displayName: "Hildegard of Bingen",
            natalChart: CHART,
            natalPositions: [], // the shape `[]` column default also has
          },
          { "X-Sync-Secret": mockSyncSecret },
        ),
      );
      expect((await res.json()).ok).toBe(true);

      const stored = JSON.parse(
        String(captureUserProfilesParams(mockClient)[5]),
      );
      expect(stored).toHaveLength(BODIES.length);
    });

    it("does NOT override positions the caller actually sent", async () => {
      const mockClient = newUserClient();

      // Deliberately disagrees with CHART: if derivation overrode the caller,
      // this would come back as the chart's two bodies instead of this one.
      const supplied = [
        { planet: "Mars", sign: "aries", degree: 3, position: 3 },
      ];

      const res = await POST(
        makeRequest(
          {
            email: "hildegard@agentic.alchm.kitchen",
            displayName: "Hildegard of Bingen",
            natalChart: CHART,
            natalPositions: supplied,
          },
          { "X-Sync-Secret": mockSyncSecret },
        ),
      );
      expect((await res.json()).ok).toBe(true);

      const stored = JSON.parse(
        String(captureUserProfilesParams(mockClient)[5]),
      );
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ planet: "Mars", sign: "aries" });
    });

    it("stores NULL for a planetary agent — no chart means nothing to derive", async () => {
      const mockClient = newUserClient();

      const res = await POST(
        makeRequest(
          {
            email: "mercury-leo-7@agentic.alchm.kitchen",
            displayName: "Mercury Leo 7",
            // No chart at all: the 6,240-agent majority measured in production.
          },
          { "X-Sync-Secret": mockSyncSecret },
        ),
      );
      expect((await res.json()).ok).toBe(true);

      // Not `'[]'` — an empty JSON array would claim a chart was read and found
      // to contain no bodies, which is a different statement from "no chart".
      expect(captureUserProfilesParams(mockClient)[5]).toBeNull();
    });
  });
});
