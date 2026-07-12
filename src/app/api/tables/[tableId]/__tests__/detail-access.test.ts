/**
 * @jest-environment node
 *
 * GET /api/tables/[tableId] — the PR 6 "publicJoinable" card-level detail
 * amendment. Regression test for the adversarial-review finding: a viewer the
 * host has BLOCKED must not be able to see even card-level detail of a public
 * planned/live table via a direct tableId, exactly like every other
 * interaction path (member-add, requestToJoin, redeemInvite) already blocks.
 *
 * Real roster identities (design-spec §4.8).
 */

const HOST = "10000000-0000-0000-0000-000000000001"; // da Vinci
const STRANGER = "20000000-0000-0000-0000-000000000002"; // Curie — not blocked
const BLOCKED = "30000000-0000-0000-0000-000000000003"; // Cleopatra — blocked by host

const NAMES: Record<string, string> = {
  [HOST]: "Leonardo da Vinci",
  [STRANGER]: "Marie Curie",
  [BLOCKED]: "Cleopatra",
};

interface Row {
  [k: string]: unknown;
}

const store: { tables: Row[]; members: Row[]; commensalships: Row[]; photos: Row[] } = {
  tables: [],
  members: [],
  commensalships: [],
  photos: [],
};

function reset() {
  store.tables = [];
  store.members = [];
  store.commensalships = [];
  store.photos = [];
}

function nowIso(): string {
  return new Date().toISOString();
}

async function fakeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Row[]; rowCount: number }> {
  const q = sql.trim();

  if (q.startsWith("SELECT * FROM tables WHERE id = $1")) {
    const t = store.tables.find((r) => r.id === params[0]);
    return t ? { rows: [t], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (q.includes("FROM table_members tm") && q.includes("WHERE tm.table_id = $1 ORDER BY tm.created_at ASC")) {
    const rows = store.members
      .filter((m) => m.table_id === params[0])
      .map((m) => ({
        ...m,
        user_name: NAMES[m.user_id as string] ?? null,
        user_image: null,
        user_is_agent: false,
      }));
    return { rows, rowCount: rows.length };
  }
  if (q.startsWith("SELECT * FROM table_photos WHERE table_id = $1")) {
    const rows = store.photos.filter((p) => p.table_id === params[0]);
    return { rows, rowCount: rows.length };
  }
  if (q.startsWith("SELECT * FROM table_invites WHERE table_id = $1")) {
    return { rows: [], rowCount: 0 };
  }
  if (q.includes("FROM commensalships") && q.includes("status = 'blocked'")) {
    const [a, b] = params;
    const hit = store.commensalships.some(
      (c) => c.status === "blocked" && ((c.a === a && c.b === b) || (c.a === b && c.b === a)),
    );
    return { rows: hit ? [{ x: 1 }] : [], rowCount: hit ? 1 : 0 };
  }
  throw new Error(`FakeDb: unhandled query: ${q}`);
}

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (sql: string, params?: unknown[]) => fakeQuery(sql, params),
  withTransaction: (op: (client: { query: typeof fakeQuery }) => Promise<unknown>) => op({ query: fakeQuery }),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ status: init?.status ?? 200, json: async () => body })),
  },
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

import { GET as getTableDetail } from "../route";

function req(): any {
  return { url: "http://localhost/api/tables/t-pub", method: "GET", headers: { get: () => null } };
}
function params(tableId: string) {
  return { params: Promise.resolve({ tableId }) };
}

beforeEach(() => {
  reset();
  store.tables = [
    {
      id: "t-pub",
      host_id: HOST,
      title: "Open Feast",
      description: null,
      scheduled_at: nowIso(),
      venue_type: "restaurant",
      venue_restaurant_id: null,
      venue_name: "Some Place",
      venue_address: "123 Main St",
      status: "planned",
      visibility: "public",
      composite_snapshot: null,
      composite_updated_at: null,
      menu: [],
      memory: null,
      went_live_at: null,
      closed_at: null,
      feed_event_id: null,
      seat_cap: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
  store.members = [
    {
      id: "m-host",
      table_id: "t-pub",
      user_id: HOST,
      manual_companion_chart_id: null,
      role: "host",
      rsvp_status: "joined",
      joined_via: "host",
      invited_by: null,
      display_name: null,
      rsvp_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
  store.commensalships = [{ a: HOST, b: BLOCKED, status: "blocked" }];
});

describe("GET /api/tables/[tableId] — publicJoinable block gate", () => {
  it("403s a viewer the host has BLOCKED, even though the table is public planned", async () => {
    mockGetUserId.mockResolvedValue(BLOCKED);
    const res = await getTableDetail(req(), params("t-pub"));
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it("200s card-level detail for a non-member, non-blocked authed viewer of a public planned table", async () => {
    mockGetUserId.mockResolvedValue(STRANGER);
    const res = await getTableDetail(req(), params("t-pub"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Card-level: host-only member row, no invites, no street address.
    expect(data.table.members).toHaveLength(1);
    expect(data.table.members[0].role).toBe("host");
    expect(data.table.invites).toBeUndefined();
    expect(data.table.venue.address).toBeUndefined();
    expect(data.joinedCount).toBe(1);
  });

  it("403s an anonymous (unauthenticated) viewer of a public planned table", async () => {
    mockGetUserId.mockResolvedValue(null);
    const res = await getTableDetail(req(), params("t-pub"));
    expect(res.status).toBe(403);
  });

  it("the host always sees full detail regardless of the block list", async () => {
    mockGetUserId.mockResolvedValue(HOST);
    const res = await getTableDetail(req(), params("t-pub"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.table.hostId).toBe(HOST);
    expect(data.viewerId).toBe(HOST);
  });
});
