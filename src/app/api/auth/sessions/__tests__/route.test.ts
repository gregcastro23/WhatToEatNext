/**
 * Current-device detection for the /profile/security session routes:
 *   GET    /api/auth/sessions             — marks the requester's row `current`
 *   DELETE /api/auth/sessions/[id]        — refuses to revoke the requester's row
 *   POST   /api/auth/sessions/revoke-all  — revokes every row except the requester's
 *
 * The requester's device_sessions row id must come from `auth()`
 * (`session.user.sessionId`, set by the session callback in auth.config.ts).
 * These routes used to decode the cookie a second time with
 * `getToken({ req, secret })`, which looks for `authjs.session-token` by default
 * while production names the cookie `__Secure-authjs.session-token` — so in
 * production the current device was never found. `auth()` reads the cookie
 * under the configured name, so mocking it here is the real seam.
 *
 * Under this jest config `import("next-auth/jwt")` does not load at all (ESM,
 * "Unexpected token 'export'"), so a reintroduced getToken call would also
 * read as "no current session" here — the production failure is the same
 * state reached by a different road.
 *
 * DB + auth are mocked at module boundaries; SQL is matched by shape.
 */

const mockAuth = jest.fn();
jest.mock("@/lib/auth/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

const mockValidateToken = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  validateToken: (...args: unknown[]) => mockValidateToken(...args),
}));

import { DELETE } from "@/app/api/auth/sessions/[id]/route";
import { POST as REVOKE_ALL } from "@/app/api/auth/sessions/revoke-all/route";
import { GET } from "@/app/api/auth/sessions/route";

const USER_ID = "7c1e2a4b-3d5f-4a6b-8c7d-9e0f1a2b3c4d";
const OTHER_ROW = "0a9b8c7d-6e5f-4d3c-8b2a-1f0e9d8c7b6a";
const CURRENT_ROW = "5e4d3c2b-1a0f-4e9d-8c7b-6a5f4e3d2c1b";
const THIRD_ROW = "b1c2d3e4-f5a6-4b7c-9d8e-0f1a2b3c4d5e";

const BASE = "https://alchm.kitchen/api/auth/sessions";

interface SessionRowBody {
  id: string;
  current: boolean;
}

function signedInAs(sessionId: string | undefined) {
  mockAuth.mockResolvedValue({
    user: { id: USER_ID, ...(sessionId !== undefined ? { sessionId } : {}) },
  });
}

function deviceRow(id: string, minutesAgo: number) {
  return {
    id,
    subdomain: "kitchen.alchm.kitchen",
    device: null,
    user_agent: "Mozilla/5.0 (Macintosh)",
    location_city: null,
    location_region: null,
    location_country: null,
    last_seen_at: new Date(Date.now() - minutesAgo * 60_000),
    revoked_at: null,
  };
}

/** Prime GET's two queries by SQL shape. */
function primeList(rows: unknown[] | Error) {
  mockExecuteQuery.mockImplementation((sql: string) => {
    if (sql.includes("FROM users")) {
      return Promise.resolve({ rows: [{ created_at: "2026-05-21T00:00:00.000Z" }] });
    }
    if (sql.includes("FROM device_sessions")) {
      return rows instanceof Error
        ? Promise.reject(rows)
        : Promise.resolve({ rows, rowCount: rows.length });
    }
    return Promise.reject(new Error(`unexpected SQL: ${sql}`));
  });
}

beforeEach(() => {
  mockAuth.mockReset();
  mockExecuteQuery.mockReset();
  mockValidateToken.mockReset();
});

describe("GET /api/auth/sessions — current-device marking", () => {
  it("marks exactly the row whose id is the auth() session's sessionId", async () => {
    signedInAs(CURRENT_ROW);
    primeList([deviceRow(OTHER_ROW, 5), deviceRow(CURRENT_ROW, 1), deviceRow(THIRD_ROW, 90)]);

    const res = await GET(new Request(BASE));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { source: string; sessions: SessionRowBody[] };
    expect(body.source).toBe("db");
    expect(body.sessions.map((s) => s.id)).toEqual([OTHER_ROW, CURRENT_ROW, THIRD_ROW]);
    expect(body.sessions.filter((s) => s.current).map((s) => s.id)).toEqual([CURRENT_ROW]);
  });

  it("uses the session id for the jwt-fallback row when the table query fails", async () => {
    signedInAs(CURRENT_ROW);
    primeList(new Error("relation \"device_sessions\" does not exist"));

    const res = await GET(new Request(BASE));

    const body = (await res.json()) as { source: string; sessions: SessionRowBody[] };
    expect(body.source).toBe("jwt-fallback");
    expect(body.sessions).toEqual([expect.objectContaining({ id: CURRENT_ROW, current: true })]);
  });

  it("marks no row current for a Bearer client, which has no device session", async () => {
    mockAuth.mockResolvedValue(null);
    mockValidateToken.mockResolvedValue({ valid: true, user: { userId: USER_ID } });
    primeList([deviceRow(OTHER_ROW, 5), deviceRow(CURRENT_ROW, 1)]);

    const res = await GET(
      new Request(BASE, { headers: { authorization: "Bearer probe-token" } }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { source: string; sessions: SessionRowBody[] };
    expect(body.source).toBe("db");
    expect(body.sessions.some((s) => s.current)).toBe(false);
  });
});

describe("DELETE /api/auth/sessions/[id] — self-revoke guard", () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) });

  it("returns 400 for the requester's own row and never issues the UPDATE", async () => {
    signedInAs(CURRENT_ROW);
    // Primed as production would answer, so a missing guard revokes the row
    // (200) instead of crashing on an unprimed mock.
    mockExecuteQuery.mockResolvedValue({ rows: [{ id: CURRENT_ROW }], rowCount: 1 });

    const res = await DELETE(new Request(`${BASE}/${CURRENT_ROW}`, { method: "DELETE" }), params(CURRENT_ROW));

    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Use signOut to end the current session.");
  });

  // Control: the guard above must not be passing because nothing reaches the DB.
  it("revokes a different row of the same user", async () => {
    signedInAs(CURRENT_ROW);
    mockExecuteQuery.mockResolvedValue({ rows: [{ id: OTHER_ROW }], rowCount: 1 });

    const res = await DELETE(new Request(`${BASE}/${OTHER_ROW}`, { method: "DELETE" }), params(OTHER_ROW));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revoked: OTHER_ROW });
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const [sql, bound] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("UPDATE device_sessions");
    expect(bound).toEqual([OTHER_ROW, USER_ID]);
  });
});

describe("POST /api/auth/sessions/revoke-all — preserves the current session", () => {
  it("binds the auth() session's sessionId as $2", async () => {
    signedInAs(CURRENT_ROW);
    mockExecuteQuery.mockResolvedValue({ rows: [{ id: OTHER_ROW }, { id: THIRD_ROW }], rowCount: 2 });

    const res = await REVOKE_ALL(new Request(`${BASE}/revoke-all`, { method: "POST" }));

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const [sql, bound] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("UPDATE device_sessions");
    expect(bound).toEqual([USER_ID, CURRENT_ROW]);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revoked: 2, preservedCurrent: true });
  });

  it("binds null and reports preservedCurrent false when the session has no sessionId", async () => {
    signedInAs(undefined);
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await REVOKE_ALL(new Request(`${BASE}/revoke-all`, { method: "POST" }));

    expect(await res.json()).toEqual({ revoked: 0, preservedCurrent: false });
    const [, bound] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
    expect(bound).toEqual([USER_ID, null]);
  });
});
