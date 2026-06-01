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

import { withTransaction, executeQuery } from "@/lib/database";
import { POST } from "../route";

jest.mock("@/lib/database", () => ({
  withTransaction: jest.fn(),
  executeQuery: jest.fn(),
}));

function makeRequest(body: unknown, headers: Record<string, string>): any {
  return {
    headers: {
      get: (name: string) => headers[name] || headers[name.toLowerCase()] || null,
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
    const res = await POST(makeRequest({ email: "hildegard@agentic.alchm.kitchen" }, {}));
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
        { "X-Sync-Secret": "wrong_secret" }
      )
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
        { "X-Sync-Secret": mockSyncSecret }
      )
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
        { "X-Sync-Secret": mockSyncSecret }
      )
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Sync is restricted to agentic namespaces");
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

    const res = await POST(makeRequest(body, { "X-Sync-Secret": mockSyncSecret }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.created).toBe(true);
    expect(data.wtenUserId).toBeDefined();

    // Verify INSERT queries are triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      expect.any(Array)
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO user_profiles"),
      expect.any(Array)
    );
    // Verify wallet and streak seeding
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO token_balances"),
      expect.any(Array)
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

    const res = await POST(makeRequest(body, { "X-Sync-Secret": mockSyncSecret }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.created).toBe(false);
    expect(data.wtenUserId).toBe(existingId);

    // Verify UPDATE users is triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users"),
      expect.any(Array)
    );
    // Verify user_profiles upsert/ON CONFLICT DO UPDATE is triggered
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO user_profiles"),
      expect.any(Array)
    );
  });
});
