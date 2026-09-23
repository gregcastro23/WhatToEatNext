/**
 * @jest-environment node
 *
 * Tests for GET /api/economy/vessel (KitchenVesselLedger v1).
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

const mockGetUserIdFromRequest = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]): unknown => mockGetUserIdFromRequest(...args),
}));

const mockGetBalances = jest.fn();
jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getBalances: (...args: unknown[]): unknown => mockGetBalances(...args),
  },
}));

const mockGetStreak = jest.fn();
jest.mock("@/services/StreakService", () => ({
  streakService: {
    getStreak: (...args: unknown[]): unknown => mockGetStreak(...args),
  },
}));

const mockGetQuestPanel = jest.fn();
jest.mock("@/services/QuestService", () => ({
  questService: {
    getQuestPanel: (...args: unknown[]): unknown => mockGetQuestPanel(...args),
  },
}));

import { NextRequest } from "next/server";
import { GET } from "../route";

const TEST_SYNC_SECRET = "vessel-sync-secret-777";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeVesselRequest(options: {
  email?: string;
  syncSecret?: string;
  cookie?: string;
}): NextRequest {
  const url = new URL("http://localhost/api/economy/vessel");
  if (options.email !== undefined) {
    url.searchParams.set("email", options.email);
  }
  const headers: Record<string, string> = {};
  if (options.syncSecret !== undefined) {
    headers["x-sync-secret"] = options.syncSecret;
  }
  if (options.cookie !== undefined) {
    headers["cookie"] = options.cookie;
  }
  return new NextRequest(url.toString(), {
    method: "GET",
    headers,
  });
}

describe("GET /api/economy/vessel", () => {
  const origSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SYNC_SECRET;
    mockExecuteQuery.mockReset();
    mockGetUserIdFromRequest.mockReset().mockResolvedValue(null);
    mockGetBalances.mockReset().mockResolvedValue({
      spirit: 10.5,
      essence: 20.0,
      matter: 5.25,
      substance: 15.125,
    });
    mockGetStreak.mockReset().mockResolvedValue({
      currentStreak: 7,
      longestStreak: 14,
    });
    mockGetQuestPanel.mockReset().mockResolvedValue({
      daily: [{ completedAt: "2026-09-23T10:00:00Z", claimedAt: "2026-09-23T10:05:00Z" }],
      weekly: [{ completedAt: null, claimedAt: null }],
      achievements: [
        { completedAt: "2026-09-20T12:00:00Z", claimedAt: "2026-09-20T12:00:00Z" },
        { completedAt: null, claimedAt: null },
      ],
    });
  });

  afterAll(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = origSecret;
  });

  it("returns 401 when no session cookie and no valid sync secret are provided", async () => {
    const req = makeVesselRequest({});
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when querying by email via X-Sync-Secret and user does not exist", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = makeVesselRequest({
      email: "missing@alchm.kitchen",
      syncSecret: TEST_SYNC_SECRET,
    });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("returns 200 with full KitchenVesselLedger matching contract v1", async () => {
    // 1. user lookup
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: "user-uuid-123" }] });

    // 2. streams aggregation
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          source_type: "jing_duel",
          token_type: "Spirit",
          total_amount: 5,
          entry_count: 2,
          last_created_at: "2026-09-23T08:00:00Z",
        },
        {
          source_type: "daily_yield",
          token_type: "Essence",
          total_amount: 10,
          entry_count: 5,
          last_created_at: "2026-09-23T09:00:00Z",
        },
        {
          source_type: "quest_reward",
          token_type: "Matter",
          total_amount: 8,
          entry_count: 3,
          last_created_at: "2026-09-22T14:00:00Z",
        },
        {
          source_type: "pentacles_word_duel",
          token_type: "Substance",
          total_amount: 12,
          entry_count: 4,
          last_created_at: "2026-09-21T18:00:00Z",
        },
      ],
    });

    // 3. recent transactions
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "tx-1",
          source_type: "jing_duel",
          token_type: "Spirit",
          amount: 2.5,
          description: "Jing Duel victory",
          created_at: "2026-09-23T08:00:00Z",
        },
      ],
    });

    const req = makeVesselRequest({
      email: "player@alchm.kitchen",
      syncSecret: TEST_SYNC_SECRET,
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.success).toBe(true);
      expect(data.version).toBe(1);
      expect(typeof data.generatedAt).toBe("string");
      expect(data.streakDays).toBe(7);

      expect(data.balances).toEqual({
        spirit: 10.5,
        essence: 20.0,
        matter: 5.25,
        substance: 15.125,
      });

      expect(data.quests).toEqual({
        achievementsUnlocked: 1,
        questsCompleted: 2,
        rewardsClaimed: 2,
      });

      // Streams validation
      const streams = data.streams;
      expect(isRecord(streams)).toBe(true);
      if (isRecord(streams)) {
        const jd = streams.jingDuels;
        expect(isRecord(jd) && jd.entries).toBe(2);
        expect(isRecord(jd) && jd.esms).toEqual([5, 0, 0, 0]);

        const st = streams.staking;
        expect(isRecord(st) && st.entries).toBe(5);
        expect(isRecord(st) && st.esms).toEqual([0, 10, 0, 0]);

        const pm = streams.pentaclesMelee;
        expect(isRecord(pm) && pm.entries).toBe(4);
        expect(isRecord(pm) && pm.esms).toEqual([0, 0, 0, 12]);

        const ka = streams.kitchenAchievements;
        expect(isRecord(ka) && ka.entries).toBe(3);
        expect(isRecord(ka) && ka.esms).toEqual([0, 0, 8, 0]);
      }

      // Recent transactions validation
      const recent = data.recent;
      expect(Array.isArray(recent)).toBe(true);
      if (Array.isArray(recent)) {
        expect(recent.length).toBe(1);
        expect(recent[0]).toMatchObject({
          id: "tx-1",
          stream: "jingDuels",
          sourceType: "jing_duel",
          tokenType: "Spirit",
          amount: 2.5,
          description: "Jing Duel victory",
        });
      }
    }
  });

  it("counts the source types Agents actually syncs into the ledger", async () => {
    mockGetUserIdFromRequest.mockResolvedValueOnce("session-user-uuid");
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        { source_type: "duel_yield", token_type: "Spirit", total_amount: "0.5", entry_count: "3", last_created_at: "2026-09-23T08:00:00Z" },
        { source_type: "kitchen_daily_yield", token_type: "Matter", total_amount: "4", entry_count: "2", last_created_at: null },
        { source_type: "agents_daily_yield", token_type: "Matter", total_amount: "1", entry_count: "1", last_created_at: null },
        { source_type: "group_chat_quest", token_type: "Essence", total_amount: "2", entry_count: "1", last_created_at: null },
        { source_type: "alchemical_log", token_type: "Essence", total_amount: "1", entry_count: "1", last_created_at: null },
      ],
    });
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] }); // recent

    const res = await GET(makeVesselRequest({ cookie: "next-auth.session-token=valid-session" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    const streams = isRecord(data) ? data.streams : null;
    expect(isRecord(streams)).toBe(true);
    if (isRecord(streams)) {
      expect(streams.jingDuels).toMatchObject({ esms: [0.5, 0, 0, 0], entries: 3 });
      expect(streams.staking).toMatchObject({ esms: [0, 0, 5, 0], entries: 3 });
      expect(streams.kitchenAchievements).toMatchObject({ esms: [0, 3, 0, 0], entries: 2 });
    }
  });

  it("authenticates via session cookie when X-Sync-Secret is not used", async () => {
    mockGetUserIdFromRequest.mockResolvedValueOnce("session-user-uuid");
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] }); // streams
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] }); // recent

    const req = makeVesselRequest({ cookie: "next-auth.session-token=valid-session" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(isRecord(data) && data.success).toBe(true);
  });
});
