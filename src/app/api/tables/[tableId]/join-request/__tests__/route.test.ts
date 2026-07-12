/**
 * @jest-environment node
 *
 * POST /api/tables/[tableId]/join-request (PR 6) — driven through the REAL
 * route + tableDatabaseService against an in-memory fake DB. Covers the
 * happy path, the public-only / joinable gates, block enforcement, capacity,
 * and dedupe (member row OR an existing unactioned request notification).
 *
 * Real roster identities (design-spec §4.8).
 */

const HOST = "10000000-0000-0000-0000-000000000001"; // da Vinci
const SEEKER = "20000000-0000-0000-0000-000000000002"; // Curie
const NAMES: Record<string, string> = {
  [HOST]: "Leonardo da Vinci",
  [SEEKER]: "Marie Curie",
};

interface Row {
  [k: string]: unknown;
}

const store: {
  tables: Row[];
  members: Row[];
  commensalships: Row[];
  notifications: Row[];
} = { tables: [], members: [], commensalships: [], notifications: [] };

function reset() {
  store.tables = [];
  store.members = [];
  store.commensalships = [];
  store.notifications = [];
}

async function fakeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Row[]; rowCount: number }> {
  const q = sql.trim();

  if (q.startsWith("SELECT host_id, status, visibility, title, seat_cap FROM tables")) {
    const t = store.tables.find((r) => r.id === params[0]);
    return t ? { rows: [t], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (q.includes("FROM commensalships") && q.includes("status = 'blocked'")) {
    const [a, b] = params;
    const hit = store.commensalships.some(
      (c) => c.status === "blocked" && ((c.a === a && c.b === b) || (c.a === b && c.b === a)),
    );
    return { rows: hit ? [{ x: 1 }] : [], rowCount: hit ? 1 : 0 };
  }
  if (q.includes("FROM table_members WHERE table_id = $1 AND user_id = $2::uuid LIMIT 1")) {
    const hit = store.members.some((m) => m.table_id === params[0] && m.user_id === params[1]);
    return { rows: hit ? [{ x: 1 }] : [], rowCount: hit ? 1 : 0 };
  }
  if (q.includes("SELECT COUNT(*)::int AS n FROM table_members") && q.includes("rsvp_status = 'joined'")) {
    const n = store.members.filter((m) => m.table_id === params[0] && m.rsvp_status === "joined").length;
    return { rows: [{ n }], rowCount: 1 };
  }
  if (q.includes("FROM notifications") && q.includes("type = 'table_join_request'")) {
    const [host, requester, tableId] = params;
    const hit = store.notifications.some(
      (n) =>
        n.user_id === host &&
        n.type === "table_join_request" &&
        n.is_read === false &&
        (n.metadata as Row)?.requesterId === requester &&
        (n.metadata as Row)?.tableId === tableId,
    );
    return { rows: hit ? [{ x: 1 }] : [], rowCount: hit ? 1 : 0 };
  }
  throw new Error(`FakeDb: unhandled query: ${q}`);
}

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (sql: string, params?: unknown[]) => fakeQuery(sql, params),
  withTransaction: (op: (client: { query: typeof fakeQuery }) => Promise<unknown>) => op({ query: fakeQuery }),
}));

const createNotification = jest.fn(async (userId: string, type: string, _title: string, _msg: string, opts?: { metadata?: Row; relatedUserId?: string }) => {
  const notif = { user_id: userId, type, is_read: false, metadata: opts?.metadata ?? {} };
  store.notifications.push(notif);
  return notif;
});

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createNotification: (...a: unknown[]) => (createNotification as any)(...a) },
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { getUserById: jest.fn(async (id: string) => ({ id, profile: { name: NAMES[id] } })) },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("@/lib/tables/composite", () => ({ computeAndStoreTableComposite: jest.fn().mockResolvedValue(undefined) }));

jest.mock("@/lib/redis", () => ({ getRedisClient: () => null }));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ status: init?.status ?? 200, json: async () => body })),
  },
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

import { POST as joinRequest } from "../route";

function req(): any {
  return { url: "http://localhost/api/tables/x/join-request", method: "POST", json: async () => ({}), headers: { get: () => null } };
}
function params(tableId: string) {
  return { params: Promise.resolve({ tableId }) };
}

// The host notification fires fire-and-forget (a dynamic import) — flush the
// macrotask queue so it lands before we assert on it / the dedupe reads it.
const flush = () => new Promise((r) => setTimeout(r, 0));
async function call(tableId: string) {
  const res = await joinRequest(req(), params(tableId));
  await flush();
  return res;
}

beforeEach(() => {
  reset();
  createNotification.mockClear();
  mockGetUserId.mockResolvedValue(SEEKER);
  store.tables = [
    { id: "t-pub", host_id: HOST, status: "planned", visibility: "public", title: "Open Feast", seat_cap: null },
    { id: "t-comm", host_id: HOST, status: "planned", visibility: "commensals", title: "Inner Circle", seat_cap: null },
    { id: "t-full", host_id: HOST, status: "planned", visibility: "public", title: "Full", seat_cap: 2 },
  ];
});

describe("POST /api/tables/[tableId]/join-request", () => {
  it("creates a table_join_request notification to the host on the happy path", async () => {
    const res = await call("t-pub");
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(createNotification).toHaveBeenCalledTimes(1);
    const [hostArg, typeArg, , , opts] = createNotification.mock.calls[0];
    expect(hostArg).toBe(HOST);
    expect(typeArg).toBe("table_join_request");
    expect(opts.metadata).toMatchObject({ tableId: "t-pub", requesterId: SEEKER, requesterName: "Marie Curie" });
  });

  it("dedupes: a second request while the first is unactioned is a silent success with no new notification", async () => {
    await call("t-pub");
    expect(createNotification).toHaveBeenCalledTimes(1);
    const res2 = await call("t-pub");
    const data2 = await res2.json();
    expect(res2.status).toBe(200); // duplicate → success-to-requester
    expect(data2.success).toBe(true);
    expect(createNotification).toHaveBeenCalledTimes(1); // no second notification
  });

  it("rejects a non-public (commensals) table", async () => {
    const res = await call("t-comm");
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("dedupes an existing member (already on the table)", async () => {
    store.members.push({ table_id: "t-pub", user_id: SEEKER, rsvp_status: "invited" });
    const res = await call("t-pub");
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("blocks a request from a blocked party (neutral)", async () => {
    store.commensalships.push({ a: HOST, b: SEEKER, status: "blocked" });
    const res = await call("t-pub");
    expect(res.status).toBe(403);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("rejects when the table is at capacity", async () => {
    store.members.push(
      { table_id: "t-full", user_id: HOST, rsvp_status: "joined" },
      { table_id: "t-full", user_id: "x", rsvp_status: "joined" },
    );
    const res = await call("t-full");
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.message).toMatch(/full/i);
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("honors the TABLE_JOIN_REQUESTS_ENABLED kill-switch", async () => {
    process.env.TABLE_JOIN_REQUESTS_ENABLED = "false";
    const res = await call("t-pub");
    expect(res.status).toBe(403);
    delete process.env.TABLE_JOIN_REQUESTS_ENABLED;
  });
});
