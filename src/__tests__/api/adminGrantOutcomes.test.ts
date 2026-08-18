/**
 * POST /api/admin/users/[userId]/grant — a failed grant must not read as a
 * successful one.
 *
 * The defect these pin: `creditMultipleTokens` answers `TokenBalances | null`,
 * and the route read that `null` as "idempotency hit — already granted". But a
 * genuine replay returns the CURRENT BALANCES, not null. For sourceType
 * "admin" the only other null-producer — the daily-yield 23505 carve-out — is
 * backed by an index covering DAILY_YIELD_SOURCES only, which "admin" is not
 * in. So `null` there meant exactly one thing: the transaction rolled back.
 *
 * 100% of the times that branch painted, zero tokens had moved and the
 * operator was told they were already there, with the Grant button hidden.
 * Measured usage of this path at the time of the fix: 11 operator grants
 * across 20 ledger rows since 2026-05-27.
 *
 * The first test is the red-proof: against the old route it fails, because the
 * old route answered HTTP 200 + `alreadyClaimed: true` for this exact input.
 */
import { NextRequest } from "next/server";

import type { CreditResult } from "@/services/TokenEconomyService";

const ADMIN_EMAIL = "operator@example.com";
const USER_ID = "0198f3c1-2f4a-7c11-9e33-abcdef012345";

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(async () => ({
    user: { email: "operator@example.com", id: "admin-1", role: "admin" },
  })),
}));

function post(body: unknown) {
  return new NextRequest(`http://localhost/api/admin/users/${USER_ID}/grant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  credits: [
    { tokenType: "Spirit", amount: 5 },
    { tokenType: "Essence", amount: 5 },
  ],
  idempotencyKey: "admin-ui-grant-test-key-0001",
};

/**
 * jest.config.js sets `resetModules: true`, so every dynamic import lands in a
 * fresh registry. The service and the route must therefore be loaded inside
 * the SAME window, or the route holds a different `tokenEconomy` instance than
 * the one spied on — and silently runs the real method against the in-memory
 * fallback, which reports "credited" and hides the assertion being tested.
 *
 * A spy rather than a jest.mock factory: the route also imports
 * `isMissingUserFailure` from this module, and a factory would blank it.
 */
async function callRoute(outcome: CreditResult) {
  const { tokenEconomy } = await import("@/services/TokenEconomyService");
  const detailed = jest
    .spyOn(tokenEconomy, "creditMultipleTokensDetailed")
    .mockResolvedValue(outcome);

  const { POST } = await import("@/app/api/admin/users/[userId]/grant/route");
  const res = await POST(post(VALID_BODY), {
    params: Promise.resolve({ userId: USER_ID }),
  });
  return { status: res.status, body: await res.json(), detailed };
}

describe("admin grant — a rolled-back transaction", () => {
  it("reports failure, not 'already granted' (RED-PROOF of the old branch)", async () => {
    const { status, body } = await callRoute({
      status: "failed",
      code: "40001",
      constraint: null,
      message: "could not serialize access due to concurrent update",
    });

    expect(status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.result).toBe("failed");
    // The exact regression: it must never claim the credit already landed.
    expect(JSON.stringify(body)).not.toMatch(/already/i);
    expect(body.message).toContain("No tokens were credited");
    // The SQLSTATE is named rather than a cause being guessed.
    expect(body.message).toContain("40001");
  });

  it("answers 404 and names the constraint when the user does not exist", async () => {
    const { status, body } = await callRoute({
      status: "failed",
      code: "23503",
      constraint: "token_transactions_user_id_fkey",
      message: 'insert or update on table "token_transactions" violates foreign key',
    });

    expect(status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toContain("23503");
    expect(body.message).toContain("token_transactions_user_id_fkey");
  });

  it("404s a malformed user id on the SQLSTATE alone", async () => {
    // The route's own regex admits ids that are not valid UUIDs (`deadbeef`
    // matches /^[0-9a-f-]{8,}$/i), so the uuid cast raises 22P02. That code
    // carries NO constraint name, which is why it is matched on the code —
    // and why the message says the id was rejected rather than naming a
    // specific missing row.
    const { status, body } = await callRoute({
      status: "failed",
      code: "22P02",
      constraint: null,
      message: 'invalid input syntax for type uuid: "deadbeef"',
    });

    expect(status).toBe(404);
    expect(body.message).toContain("22P02");
    expect(body.message).toContain("No tokens were credited");
  });

  it("does not claim 'no such user' for a code that cannot prove it", async () => {
    // 22P02 (invalid_text_representation) carries no constraint name, so it is
    // matched on the code alone — but an unrelated failure must not inherit
    // that diagnosis.
    const { status, body } = await callRoute({
      status: "failed",
      code: "23514",
      constraint: "token_transactions_amount_check",
      message: "violates check constraint",
    });

    expect(status).toBe(500);
    expect(body.message).toContain("rolled back");
    expect(body.message).not.toMatch(/user id/i);
  });
});

describe("admin grant — the honest success paths", () => {
  it("reports a real replay as replayed, with the balance it read", async () => {
    const { status, body } = await callRoute({
      status: "replayed",
      balances: { spirit: 10, essence: 10, matter: 5, substance: 5 },
    });

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.result).toBe("replayed");
    expect(body.balances.spirit).toBe(10);
  });

  it("passes a null balance through instead of fabricating zeros", async () => {
    // getBalancesOrNull returns null when the read failed. Four zeros here
    // would be indistinguishable from a user who genuinely holds nothing.
    const { status, body } = await callRoute({
      status: "replayed",
      balances: null,
    });

    expect(status).toBe(200);
    expect(body.result).toBe("replayed");
    expect(body.balances).toBeNull();
  });

  it("reports how many credits actually wrote a row", async () => {
    const { status, body } = await callRoute({
      status: "credited",
      balances: { spirit: 5, essence: 5, matter: 0, substance: 0 },
      written: 2,
      requested: 2,
    });

    expect(status).toBe(200);
    expect(body.result).toBe("credited");
    expect(body.written).toBe(2);
    expect(body.requested).toBe(2);
  });

  it("sends sourceType 'admin' and the operator's email as the description", async () => {
    const { detailed } = await callRoute({
      status: "credited",
      balances: { spirit: 5, essence: 5, matter: 0, substance: 0 },
      written: 2,
      requested: 2,
    });

    // "admin" is never in DAILY_YIELD_SOURCES — the fact the whole fix rests
    // on, since it is what makes the 23505 carve-out unreachable here.
    const [, , sourceType, opts] = detailed.mock.calls[0] as [
      string,
      unknown,
      string,
      { description: string },
    ];
    expect(sourceType).toBe("admin");
    expect(opts.description).toContain(ADMIN_EMAIL);
  });
});
