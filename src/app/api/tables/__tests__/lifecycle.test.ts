/**
 * @jest-environment node
 *
 * Full happy-path integration test for the Table entity's lifecycle, driven
 * through the REAL route handlers + the REAL tableDatabaseService, against a
 * small in-memory fake of `@/lib/database/connection` (pattern-matches the
 * exact SQL tableDatabaseService issues — mirrors the "real service against
 * a mocked transaction client" convention used elsewhere in this repo).
 *
 * Path exercised: create table (host) -> issue invite -> guest A redeems the
 * invite link (joins immediately) -> host search-invites guest B (creates an
 * `invited` row) -> guest B RSVPs joined -> host goes live -> host closes
 * (memory artifact + frozen guest list).
 *
 * Composite recomputation (`@/lib/tables/composite`) and notification
 * fan-out are mocked — this test is about the lifecycle/routing/service
 * orchestration, not the chart math (covered by tableDatabaseService.test.ts)
 * or notification delivery.
 */

const HOST = "10000000-0000-0000-0000-000000000001";
const GUEST_A = "20000000-0000-0000-0000-000000000002";
const GUEST_B = "30000000-0000-0000-0000-000000000003";

let nextId = 1;
const genId = (prefix: string) => `${prefix}-${nextId++}`;

interface FakeRow {
  [key: string]: unknown;
}

const tables: FakeRow[] = [];
const tableMembers: FakeRow[] = [];
const tableInvites: FakeRow[] = [];
const tablePhotos: FakeRow[] = [];
const feedEvents: FakeRow[] = [];

const USER_NAMES: Record<string, string> = {
  [HOST]: "Leonardo da Vinci",
  [GUEST_A]: "Marie Curie",
  [GUEST_B]: "Nikola Tesla",
};

function nowIso(): string {
  return new Date().toISOString();
}

function has(sql: string, substr: string): boolean {
  return sql.includes(substr);
}

async function fakeQuery(sql: string, params: unknown[] = []): Promise<{ rows: FakeRow[]; rowCount: number }> {
  const q = sql.trim();

  // ── tables ──────────────────────────────────────────────────
  if (has(q, "INSERT INTO tables") && has(q, "RETURNING id")) {
    const id = genId("table");
    const row: FakeRow = {
      id,
      host_id: params[0],
      title: params[1],
      description: params[2],
      scheduled_at: params[3],
      venue_type: params[4],
      venue_restaurant_id: params[5],
      venue_name: params[6],
      venue_address: params[7],
      status: "planned",
      visibility: params[8],
      composite_snapshot: null,
      composite_updated_at: null,
      menu: params[9],
      memory: null,
      went_live_at: null,
      closed_at: null,
      feed_event_id: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    tables.push(row);
    return { rows: [{ id }], rowCount: 1 };
  }

  if (has(q, "SELECT host_id, status FROM tables WHERE id = $1")) {
    const t = tables.find((r) => r.id === params[0]);
    return t ? { rows: [{ host_id: t.host_id, status: t.status }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (has(q, "SELECT composite_updated_at FROM tables WHERE id = $1")) {
    const t = tables.find((r) => r.id === params[0]);
    return t ? { rows: [{ composite_updated_at: t.composite_updated_at }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (q.startsWith("SELECT * FROM tables WHERE id = $1")) {
    const t = tables.find((r) => r.id === params[0]);
    return t ? { rows: [t], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (has(q, "UPDATE tables SET status = 'live'")) {
    const t = tables.find((r) => r.id === params[0] && r.host_id === params[1] && r.status === "planned");
    if (!t) return { rows: [], rowCount: 0 };
    t.status = "live";
    t.went_live_at = nowIso();
    t.updated_at = nowIso();
    return { rows: [t], rowCount: 1 };
  }

  if (has(q, "FOR UPDATE") && has(q, "status = 'live'")) {
    const t = tables.find((r) => r.id === params[0] && r.host_id === params[1] && r.status === "live");
    return t ? { rows: [t], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (has(q, "UPDATE tables") && has(q, "status = 'memory'")) {
    const t = tables.find((r) => r.id === params[0]);
    if (!t) return { rows: [], rowCount: 0 };
    t.status = "memory";
    t.closed_at = params[1];
    t.memory = params[2];
    t.feed_event_id = params[3];
    t.updated_at = nowIso();
    return { rows: [t], rowCount: 1 };
  }

  // ── table_members ───────────────────────────────────────────
  if (has(q, "INSERT INTO table_members") && has(q, "'host', 'joined', 'host'")) {
    tableMembers.push({
      id: genId("member"),
      table_id: params[0],
      user_id: params[1],
      manual_companion_chart_id: null,
      role: "host",
      rsvp_status: "joined",
      joined_via: "host",
      invited_by: null,
      display_name: null,
      rsvp_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return { rows: [], rowCount: 1 };
  }

  if (has(q, "INSERT INTO table_members") && has(q, "'guest', 'invited'")) {
    const id = genId("member");
    tableMembers.push({
      id,
      table_id: params[0],
      user_id: params[1],
      manual_companion_chart_id: null,
      role: "guest",
      rsvp_status: "invited",
      joined_via: params[2],
      invited_by: params[3],
      display_name: null,
      rsvp_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return { rows: [{ id }], rowCount: 1 };
  }

  if (has(q, "INSERT INTO table_members") && has(q, "'guest', 'joined', $3, CURRENT_TIMESTAMP")) {
    // Invite-link redemption upsert.
    tableMembers.push({
      id: genId("member"),
      table_id: params[0],
      user_id: params[1],
      manual_companion_chart_id: null,
      role: "guest",
      rsvp_status: "joined",
      joined_via: params[2],
      invited_by: null,
      display_name: null,
      rsvp_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return { rows: [], rowCount: 1 };
  }

  if (has(q, "SELECT COUNT(*)::int AS n FROM table_members WHERE table_id = $1")) {
    const n = tableMembers.filter((m) => m.table_id === params[0]).length;
    return { rows: [{ n }], rowCount: 1 };
  }

  if (
    has(q, "SELECT id FROM table_members WHERE table_id = $1 AND user_id = $2::uuid") ||
    has(q, "SELECT id, rsvp_status FROM table_members WHERE table_id = $1 AND user_id = $2::uuid")
  ) {
    const m = tableMembers.find((r) => r.table_id === params[0] && r.user_id === params[1]);
    return m
      ? { rows: [{ id: m.id, rsvp_status: m.rsvp_status }], rowCount: 1 }
      : { rows: [], rowCount: 0 };
  }

  // Invite-link redemption upgrading an already-invited guest to joined.
  if (has(q, "UPDATE table_members SET rsvp_status = 'joined'") && has(q, "WHERE id = $1")) {
    const m = tableMembers.find((r) => r.id === params[0]);
    if (!m) return { rows: [], rowCount: 0 };
    m.rsvp_status = "joined";
    m.rsvp_at = nowIso();
    return { rows: [], rowCount: 1 };
  }

  if (has(q, "UPDATE table_members SET rsvp_status = $3")) {
    const m = tableMembers.find(
      (r) => r.table_id === params[0] && r.user_id === params[1] && r.rsvp_status === "invited",
    );
    if (!m) return { rows: [], rowCount: 0 };
    m.rsvp_status = params[2];
    m.rsvp_at = nowIso();
    m.updated_at = nowIso();
    return { rows: [{ id: m.id }], rowCount: 1 };
  }

  if (has(q, "FROM table_members tm") && has(q, "WHERE tm.id = $1")) {
    const m = tableMembers.find((r) => r.id === params[0]);
    if (!m) return { rows: [], rowCount: 0 };
    return { rows: [joinMemberRow(m)], rowCount: 1 };
  }

  if (has(q, "FROM table_members tm") && has(q, "WHERE tm.table_id = $1 ORDER BY tm.created_at ASC")) {
    const rows = tableMembers.filter((r) => r.table_id === params[0]).map(joinMemberRow);
    return { rows, rowCount: rows.length };
  }

  if (has(q, "FROM table_members tm") && has(q, "rsvp_status = 'joined'") && has(q, "FROM table_photos") === false) {
    const rows = tableMembers
      .filter((r) => r.table_id === params[0] && r.rsvp_status === "joined")
      .map((r) => ({
        user_id: r.user_id,
        display_name: r.display_name,
        user_name: r.user_id ? USER_NAMES[r.user_id as string] : undefined,
      }));
    return { rows, rowCount: rows.length };
  }

  // ── table_invites ───────────────────────────────────────────
  if (has(q, "INSERT INTO table_invites") && has(q, "RETURNING *")) {
    const row: FakeRow = {
      id: genId("invite"),
      table_id: params[0],
      token: params[1],
      created_by: params[2],
      max_uses: params[3],
      use_count: 0,
      expires_at: new Date(Date.now() + Number(params[4]) * 60 * 60 * 1000).toISOString(),
      revoked_at: null,
      created_at: nowIso(),
    };
    tableInvites.push(row);
    return { rows: [row], rowCount: 1 };
  }

  if (has(q, "SELECT * FROM table_invites WHERE table_id = $1 ORDER BY created_at DESC")) {
    const rows = tableInvites.filter((r) => r.table_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  if (has(q, "SELECT table_id FROM table_invites WHERE token = $1")) {
    const inv = tableInvites.find((r) => r.token === params[0]);
    return inv ? { rows: [{ table_id: inv.table_id }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (has(q, "UPDATE table_invites SET use_count = use_count + 1")) {
    const inv = tableInvites.find(
      (r) =>
        r.token === params[0] &&
        !r.revoked_at &&
        new Date(r.expires_at as string).getTime() > Date.now() &&
        (r.use_count as number) < (r.max_uses as number),
    );
    if (!inv) return { rows: [], rowCount: 0 };
    inv.use_count = (inv.use_count as number) + 1;
    return { rows: [{ table_id: inv.table_id }], rowCount: 1 };
  }

  // ── table_photos ────────────────────────────────────────────
  if (has(q, "SELECT url FROM table_photos WHERE table_id = $1")) {
    const rows = tablePhotos.filter((r) => r.table_id === params[0]).map((r) => ({ url: r.url }));
    return { rows, rowCount: rows.length };
  }

  if (has(q, "SELECT * FROM table_photos WHERE table_id = $1")) {
    const rows = tablePhotos.filter((r) => r.table_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  // ── commensalships (block/accepted checks — none exist in this test) ──
  if (has(q, "FROM commensalships")) {
    return { rows: [], rowCount: 0 };
  }

  // ── feed_events ─────────────────────────────────────────────
  if (has(q, "INSERT INTO feed_events") && has(q, "'table_memory'")) {
    const id = genId("feed");
    feedEvents.push({ id, actor_id: params[0], event_type: "table_memory", metadata_payload: params[1] });
    return { rows: [{ id }], rowCount: 1 };
  }

  throw new Error(`FakeDb: unhandled query: ${q}`);
}

function joinMemberRow(m: FakeRow): FakeRow {
  return {
    ...m,
    user_name: m.user_id ? USER_NAMES[m.user_id as string] : undefined,
    user_image: null,
    user_is_agent: false,
  };
}

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (sql: string, params?: unknown[]) => fakeQuery(sql, params),
  withTransaction: (operation: (client: { query: typeof fakeQuery }) => Promise<unknown>) =>
    operation({ query: fakeQuery }),
}));

jest.mock("@/lib/tables/composite", () => ({
  computeAndStoreTableComposite: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserById: jest.fn(async (id: string) => ({ id, profile: { name: USER_NAMES[id] } })),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// Force the rate limiter onto its in-memory fallback (no Redis in tests).
jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

import { POST as createTable } from "../route";
import { POST as issueInvite } from "../[tableId]/invites/route";
import { POST as redeemInvite } from "../../table-invites/[token]/redeem/route";
import { POST as addMember } from "../[tableId]/members/route";
import { POST as rsvp } from "../[tableId]/rsvp/route";
import { POST as goLive } from "../[tableId]/go-live/route";
import { POST as closeTable } from "../[tableId]/close/route";

function req(body: unknown = {}): any {
  return {
    url: "http://localhost/api/tables",
    method: "POST",
    json: async () => body,
    text: async () => JSON.stringify(body ?? {}),
    headers: { get: () => null },
  };
}

function tableParams(tableId: string) {
  return { params: Promise.resolve({ tableId }) };
}

function tokenParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe("Table lifecycle happy path: create -> invite -> redeem -> rsvp -> go-live -> close", () => {
  it("carries a table through its full life as host + two guests", async () => {
    // 1. Host creates the table.
    mockGetUserId.mockResolvedValue(HOST);
    const createRes = await createTable(
      req({
        title: "Solstice Feast",
        scheduledAt: "2026-08-01T18:00:00.000Z",
        venue: { type: "home", name: "My place" },
      }),
    );
    const createData = await createRes.json();
    expect(createRes.status).toBe(201);
    expect(createData.success).toBe(true);
    const tableId = createData.table.id;
    expect(createData.table.status).toBe("planned");
    expect(createData.table.members).toHaveLength(1);
    expect(createData.table.members[0].role).toBe("host");

    // 2. Host issues an invite link.
    const inviteRes = await issueInvite(req({}), tableParams(tableId));
    const inviteData = await inviteRes.json();
    expect(inviteRes.status).toBe(201);
    const token = inviteData.invite.token;
    expect(inviteData.invite.url).toBe(`/t/${token}`);

    // 3. Guest A redeems the invite link — joins immediately, no RSVP needed.
    mockGetUserId.mockResolvedValue(GUEST_A);
    const redeemRes = await redeemInvite(req({ via: "link" }), tokenParams(token));
    const redeemData = await redeemRes.json();
    expect(redeemRes.status).toBe(200);
    expect(redeemData).toEqual({ success: true, tableId, alreadyMember: false });

    // 4. Host search-invites Guest B by id — creates an `invited` row.
    mockGetUserId.mockResolvedValue(HOST);
    const addRes = await addMember(req({ userId: GUEST_B }), tableParams(tableId));
    const addData = await addRes.json();
    expect(addRes.status).toBe(201);
    expect(addData.member.rsvpStatus).toBe("invited");
    expect(addData.member.userId).toBe(GUEST_B);

    // 5. Guest B RSVPs joined.
    mockGetUserId.mockResolvedValue(GUEST_B);
    const rsvpRes = await rsvp(req({ response: "joined" }), tableParams(tableId));
    const rsvpData = await rsvpRes.json();
    expect(rsvpRes.status).toBe(200);
    expect(rsvpData.member.rsvpStatus).toBe("joined");

    // 6. Host goes live.
    mockGetUserId.mockResolvedValue(HOST);
    const liveRes = await goLive(req({}), tableParams(tableId));
    const liveData = await liveRes.json();
    expect(liveRes.status).toBe(200);
    expect(liveData.table.status).toBe("live");

    // 7. Host closes — memory artifact freezes all three joined members.
    const closeRes = await closeTable(req({}), tableParams(tableId));
    const closeData = await closeRes.json();
    expect(closeRes.status).toBe(200);
    expect(closeData.table.status).toBe("memory");
    expect(closeData.table.memory).toBeTruthy();
    expect(closeData.table.memory.guestCount).toBe(3);
    const guestNames = closeData.table.memory.guests.map((g: { name: string }) => g.name).sort();
    expect(guestNames).toEqual(
      [USER_NAMES[HOST], USER_NAMES[GUEST_A], USER_NAMES[GUEST_B]].sort(),
    );
    expect(closeData.table.feedEventId).toBeTruthy();
    expect(feedEvents).toHaveLength(1);
    expect(feedEvents[0].event_type).toBe("table_memory");
  });
});
