/**
 * POST /api/admin/users/[userId]/sessions/revoke — the response must describe
 * what the write did, not an outcome it cannot deliver.
 *
 * The route stamps `device_sessions.revoked_at` in Postgres and nothing else.
 * Whether that signs anybody out is gated behind AUTH_REVOCATION_CHECK
 * (src/lib/auth/auth.config.ts:165, src/lib/auth/auth.ts:585), which is off by
 * default (.env.example) and — measured 2026-08-17 — absent from all 135
 * production environment variables. The admin UI nonetheless confirmed with
 * "They will be signed out on every device."
 *
 * These pin the two mechanical properties the wording is derived from. The env
 * var is POISONED per test rather than read from the ambient environment, so
 * the assertions do not depend on how the suite happens to be launched.
 */
import { NextRequest } from "next/server";

const USER_ID = "0198f3c1-2f4a-7c11-9e33-abcdef012345";

/** Must be `mock*` to be referenceable from inside a jest.mock factory. */
let mockQueryResult: { rows: unknown[]; rowCount: number | null };

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(async () => ({
    user: { email: "operator@example.com", id: "admin-1", role: "admin" },
  })),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(async () => mockQueryResult),
}));

const ORIGINAL_FLAG = process.env.AUTH_REVOCATION_CHECK;

beforeEach(() => {
  mockQueryResult = { rows: [], rowCount: 0 };
});

afterEach(() => {
  if (ORIGINAL_FLAG === undefined) {
    delete process.env.AUTH_REVOCATION_CHECK;
  } else {
    process.env.AUTH_REVOCATION_CHECK = ORIGINAL_FLAG;
  }
});

async function callRoute() {
  const { POST } = await import(
    "@/app/api/admin/users/[userId]/sessions/revoke/route"
  );
  const res = await POST(
    new NextRequest(
      `http://localhost/api/admin/users/${USER_ID}/sessions/revoke`,
      { method: "POST" },
    ),
    { params: Promise.resolve({ userId: USER_ID }) },
  );
  return { status: res.status, body: await res.json() };
}

describe("admin session revoke — the revoked count", () => {
  it("counts the rows the statement returned, not the driver's rowCount", async () => {
    // RED-PROOF of the `rowCount ?? 0` idiom: the UPDATE already carries
    // RETURNING id, so the rows ARE the measurement. A driver that supplies a
    // null rowCount must not turn three stamped sessions into a confident 0.
    mockQueryResult = { rows: [{ id: "a" }, { id: "b" }, { id: "c" }], rowCount: null };

    const { status, body } = await callRoute();

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.revoked).toBe(3);
  });

  it("reports zero when genuinely nothing was stamped", async () => {
    mockQueryResult = { rows: [], rowCount: 0 };

    const { body } = await callRoute();

    expect(body.revoked).toBe(0);
  });
});

describe("admin session revoke — the enforcement flag", () => {
  it("reports 'off' when the gate is unset", async () => {
    delete process.env.AUTH_REVOCATION_CHECK;

    const { body } = await callRoute();

    expect(body.revocationCheck).toBe("off");
  });

  it("reports 'off' for any value that is not exactly 'on'", async () => {
    // The real gate is `=== "on"`, so "true" and "ON" do NOT enable it. The
    // response must collapse them the same way the middleware does, or it
    // would advertise an enforcement that is not running.
    for (const value of ["true", "ON", "1", "yes", ""]) {
      process.env.AUTH_REVOCATION_CHECK = value;
      const { body } = await callRoute();
      expect(body.revocationCheck).toBe("off");
    }
  });

  it("reports 'on' only for exactly 'on'", async () => {
    process.env.AUTH_REVOCATION_CHECK = "on";

    const { body } = await callRoute();

    expect(body.revocationCheck).toBe("on");
  });
});
