/**
 * @jest-environment node
 *
 * Tests for POST /api/economy/sync-event
 *
 * Pins:
 * 1. 401 Unauthorized when X-Sync-Secret header is missing or incorrect.
 * 2. 400 on malformed JSON body.
 * 3. 400 on literal null body (proves fix for null-dereference 500 error).
 * 4. 400 on missing or empty userEmail / event with details.fieldErrors.
 * 5. 400 when userEmail > 200 or event > 100 characters.
 * 6. 404 user_not_found when user does not exist.
 * 7. Case-insensitivity: query uses userEmail.toLowerCase().
 * 8. 200 positive event completion with QuestService dispatch.
 * 9. Verbatim PA caller fixture test with full agentProfile metadata.
 */

import { NextRequest } from "next/server";
import { EconomySyncEventRequestSchema } from "@/lib/validation/apiSchemas";
import { POST } from "../route";

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

const mockReportEvent = jest.fn();
jest.mock("@/services/QuestService", () => ({
  questService: {
    reportEvent: (...args: unknown[]) => mockReportEvent(...args),
  },
}));

const TEST_SECRET = "test-sync-secret-42";

function createRequest(
  body: unknown,
  options: {
    secret?: string | null;
    rawBody?: string;
  } = {},
): NextRequest {
  const secret = options.secret !== undefined ? options.secret : TEST_SECRET;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret !== null) {
    headers["X-Sync-Secret"] = secret;
  }

  return new NextRequest("http://localhost/api/economy/sync-event", {
    method: "POST",
    headers,
    body: options.rawBody !== undefined ? options.rawBody : JSON.stringify(body),
  });
}

describe("POST /api/economy/sync-event", () => {
  const originalEnv = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = originalEnv;
  });

  describe("Authentication", () => {
    it("returns 401 when X-Sync-Secret header is missing", async () => {
      const req = createRequest({ userEmail: "a@b.com", event: "recipe_created" }, { secret: null });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.ok).toBe(false);
      expect(data.reason).toBe("unauthorized");
    });

    it("returns 401 when X-Sync-Secret header does not match", async () => {
      const req = createRequest(
        { userEmail: "a@b.com", event: "recipe_created" },
        { secret: "wrong-secret" },
      );
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.ok).toBe(false);
      expect(data.reason).toBe("unauthorized");
    });
  });

  describe("Inbound body schema validation", () => {
    it("returns 400 when body is invalid JSON syntax", async () => {
      const req = createRequest(null, { rawBody: "not-json{{" });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.reason).toBe("invalid_request");
      expect(data.message).toBe("Body must be valid JSON");
    });

    it("returns 400 on literal null body (pins fix for 500 error)", async () => {
      const req = createRequest(null, { rawBody: "null" });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.reason).toBe("invalid_request");
      expect(data.message).toBe("Missing or invalid userEmail or event");
      expect(data.details).toBeDefined();
    });

    it("returns 400 when userEmail is missing or empty", async () => {
      const req = createRequest({ event: "recipe_created" });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.details?.userEmail).toBeDefined();
    });

    it("returns 400 when event is missing or empty", async () => {
      const req = createRequest({ userEmail: "agent@alchm.kitchen" });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.details?.event).toBeDefined();
    });

    it("returns 400 when userEmail exceeds 200 characters", async () => {
      const req = createRequest({
        userEmail: "a".repeat(201),
        event: "test_event",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.details?.userEmail).toBeDefined();
    });

    it("returns 400 when event exceeds 100 characters", async () => {
      const req = createRequest({
        userEmail: "agent@alchm.kitchen",
        event: "e".repeat(101),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.details?.event).toBeDefined();
    });
  });

  describe("User lookup & event dispatch", () => {
    it("returns 404 when user is not found in database", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      const req = createRequest({
        userEmail: "nonexistent@alchm.kitchen",
        event: "recipe_created",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.ok).toBe(false);
      expect(data.reason).toBe("user_not_found");
    });

    it("preserves lowercase normalization in database user lookup", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ id: "user-123", is_agent: true }],
      });
      mockReportEvent.mockResolvedValueOnce([]);

      const req = createRequest({
        userEmail: "AGENT.Apollo@Alchm.Kitchen",
        event: "recipe_created",
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT id, is_agent FROM users WHERE email = $1 LIMIT 1",
        ["agent.apollo@alchm.kitchen"],
      );
    });

    it("reports event and returns completed quests for authenticated agent user", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ id: "agent-user-id", is_agent: true }],
      });
      mockReportEvent.mockResolvedValueOnce([
        { questSlug: "first_cosmic_recipe", tokensAwarded: 1, tokenType: "Spirit" },
      ]);

      const req = createRequest({
        userEmail: "agent@alchm.kitchen",
        event: "cosmic_recipe_generated",
        metadata: {
          agentName: "Agent Apollo",
          sacredStat: "Sun",
        },
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.event).toBe("cosmic_recipe_generated");
      expect(data.isAgent).toBe(true);
      expect(data.completedCount).toBe(1);
      expect(data.completed).toHaveLength(1);
      expect(mockReportEvent).toHaveBeenCalledWith(
        "agent-user-id",
        "cosmic_recipe_generated",
        {
          agentName: "Agent Apollo",
          sacredStat: "Sun",
        },
      );
    });
  });

  describe("PA Caller Fixture", () => {
    it("safely parses and handles verbatim payload from planetary-agents alchm-event-sync.ts", async () => {
      const verbatimPaPayload = {
        userEmail: "agent-hermes@agentic.alchm.kitchen",
        event: "cosmic_recipe_generated",
        metadata: {
          agentName: "Hermes Trismegistus",
          sacredStat: "Air",
          agentProfile: {
            bio: "Thrice-great messenger of the gods",
            monicaCreationStory: "Forged in the fires of Alexandria",
            natalChart: { sun: "Gemini", moon: "Aquarius" },
            natalPositions: { mercury: 15.4 },
            dominantElement: "Air",
            monicaConstant: 1.618,
            birthDate: "2026-01-01",
            birthTime: "12:00",
            birthLocation: "Alexandria, Egypt",
          },
        },
      };

      // 1. Direct Schema Assertion: safeParse must succeed despite deep nested agentProfile
      const schemaResult = EconomySyncEventRequestSchema.safeParse(verbatimPaPayload);
      expect(schemaResult.success).toBe(true);

      // 2. Full Route Integration: POST handles it and dispatches without 400/500
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [{ id: "hermes-uuid", is_agent: true }],
      });
      mockReportEvent.mockResolvedValueOnce([]);

      const req = createRequest(verbatimPaPayload);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.event).toBe("cosmic_recipe_generated");
      expect(mockReportEvent).toHaveBeenCalledWith(
        "hermes-uuid",
        "cosmic_recipe_generated",
        {
          agentName: "Hermes Trismegistus",
          sacredStat: "Air",
        },
      );
    });
  });
});
