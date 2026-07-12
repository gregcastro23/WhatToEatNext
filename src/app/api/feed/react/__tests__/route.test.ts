/**
 * POST /api/feed/react — per-kind reaction toggle (PR 5, constraint-widened).
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie reacts to Nikola Tesla's dish.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: init?.headers ?? {},
    })),
  },
}));

jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: {
    recognize: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { practiceRewardService } from "@/services/practiceRewardService";
import { POST } from "../route";

// Valid v4 UUIDs (the route's UUID regex requires version [1-5] + variant [89ab]).
const CURIE = "11111111-1111-4111-8111-111111111111"; // Marie Curie (reactor)
const TESLA = "22222222-2222-4222-8222-222222222222"; // Nikola Tesla (poster)
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // Tesla's cooked dish

const mockQuery = executeQuery as jest.Mock;

let ipCounter = 0;
function makeRequest(body: unknown): any {
  const addr = `10.7.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return {
    url: "http://localhost/api/feed/react",
    method: "POST",
    nextUrl: { pathname: "/api/feed/react" },
    json: async () => body,
    headers: {
      get: (key: string) => (key.toLowerCase() === "x-forwarded-for" ? addr : null),
    },
  };
}

/**
 * Prime the DB by SQL shape.
 *  - actorId: the event's poster
 *  - insertRows: RETURNING id result ([] = conflict, [{id}] = fresh insert)
 *  - counts: rows for the GROUP BY per-kind aggregation
 *  - viewer: the viewer's current kinds after the write
 *  - deleteRowCount: rows removed on un-react
 */
function primeReact(opts: {
  actorId?: string | null;
  insertRows?: Array<{ id: string }>;
  counts?: Array<{ kind: string; n: number }>;
  viewer?: string[];
  deleteRowCount?: number;
}) {
  mockQuery.mockImplementation((sql: string) => {
    if (sql.includes("SELECT actor_id FROM feed_events")) {
      return Promise.resolve({ rows: opts.actorId === null ? [] : [{ actor_id: opts.actorId ?? TESLA }] });
    }
    if (sql.includes("INSERT INTO feed_reactions")) {
      return Promise.resolve({ rows: opts.insertRows ?? [{ id: "r1" }] });
    }
    if (sql.includes("DELETE FROM feed_reactions")) {
      return Promise.resolve({ rows: [], rowCount: opts.deleteRowCount ?? 1 });
    }
    if (sql.includes("GROUP BY kind")) {
      return Promise.resolve({ rows: opts.counts ?? [] });
    }
    if (sql.includes("AND user_id = $2")) {
      return Promise.resolve({ rows: (opts.viewer ?? []).map((kind) => ({ kind })) });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe("POST /api/feed/react — toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(CURIE);
    (practiceRewardService.recognize as jest.Mock).mockResolvedValue({ rewarded: false });
  });

  it("first tap on a kind INSERTs and recognizes both practices", async () => {
    primeReact({
      insertRows: [{ id: "r1" }],
      counts: [{ kind: "fire", n: 1 }],
      viewer: ["fire"],
    });
    (practiceRewardService.recognize as jest.Mock).mockResolvedValueOnce({
      rewarded: true,
      tokenType: "Spirit",
      amount: 0.5,
      hint: "A spark passed between charts",
    });

    const res = await POST(makeRequest({ eventId: EVENT, kind: "fire" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reacted).toBe(true);
    expect(body.removed).toBe(false);
    expect(body.counts).toEqual({ fire: 1 });
    expect(body.viewerKinds).toEqual(["fire"]);
    expect(body.reward).toEqual({ tokenType: "Spirit", amount: 0.5, hint: "A spark passed between charts" });

    // Reactor's feed_reaction + poster's work_resonated, both anchored to eventId.
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "feed_reaction", EVENT);
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(TESLA, "work_resonated", EVENT);
  });

  it("second tap on the SAME kind DELETEs (un-react) and pays nothing", async () => {
    primeReact({
      insertRows: [], // ON CONFLICT DO NOTHING — row already existed
      deleteRowCount: 1,
      counts: [], // last of that kind removed
      viewer: [],
    });

    const res = await POST(makeRequest({ eventId: EVENT, kind: "fire" }));
    const body = await res.json();

    expect(body.reacted).toBe(false);
    expect(body.removed).toBe(true);
    expect(body.counts).toEqual({});
    expect(body.viewerKinds).toEqual([]);
    // Un-react never touches the append-once practice ledger.
    expect(practiceRewardService.recognize).not.toHaveBeenCalled();
  });

  it("returns per-kind counts across simultaneous kinds", async () => {
    primeReact({
      insertRows: [{ id: "r2" }],
      counts: [
        { kind: "fire", n: 3 },
        { kind: "earth", n: 2 },
      ],
      viewer: ["fire", "earth"],
    });

    const res = await POST(makeRequest({ eventId: EVENT, kind: "earth" }));
    const body = await res.json();

    expect(body.counts).toEqual({ fire: 3, earth: 2 });
    expect(body.count).toBe(5); // derived total across kinds
    expect(body.viewerKinds).toEqual(["fire", "earth"]);
  });

  it("reward cannot multiply across kinds — recognize always targets eventId, never a kind", async () => {
    primeReact({ insertRows: [{ id: "r3" }], counts: [{ kind: "water", n: 1 }], viewer: ["water"] });
    await POST(makeRequest({ eventId: EVENT, kind: "water" }));

    // Both recognitions are keyed to the eventId (dedupe "ever"), so the same
    // reactor sparking 5 different kinds on one event still pays exactly once —
    // the kind never appears in the dedupe target.
    for (const call of (practiceRewardService.recognize as jest.Mock).mock.calls) {
      expect(call[2]).toBe(EVENT);
      expect(["fire", "water", "earth", "air", "spark"]).not.toContain(call[2]);
    }
  });

  it("rejects self-reactions with 400 and no write", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(TESLA); // poster reacts to own dish
    primeReact({ actorId: TESLA });

    const res = await POST(makeRequest({ eventId: EVENT, kind: "fire" }));
    expect(res.status).toBe(400);
    const insertCalls = mockQuery.mock.calls.filter(([sql]) =>
      String(sql).includes("INSERT INTO feed_reactions"),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it("404s a missing event", async () => {
    primeReact({ actorId: null });
    const res = await POST(makeRequest({ eventId: EVENT, kind: "fire" }));
    expect(res.status).toBe(404);
  });

  it("401s an anonymous viewer", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ eventId: EVENT, kind: "fire" }));
    expect(res.status).toBe(401);
  });

  it("400s a malformed eventId", async () => {
    const res = await POST(makeRequest({ eventId: "not-a-uuid", kind: "fire" }));
    expect(res.status).toBe(400);
  });
});
