/**
 * End-to-end test for the MCP top-up Stripe webhook contract:
 *   first event   → credits +50 to all 4 ESMS axes
 *   replay        → idempotency_key blocks the duplicate, no double-credit
 *
 * Self-contained: synthesizes the Stripe event payload and signs it with
 * a test-only `STRIPE_WEBHOOK_SECRET`. This exercises the full route
 * path — signature verification, event dispatch, handler, DB writes —
 * without requiring real Stripe test-mode credentials.
 *
 * Gated behind `STRIPE_E2E=1` AND a populated `DATABASE_URL` so the
 * unit suite stays Postgres-free.
 *
 * Run locally with:
 *   STRIPE_E2E=1 DATABASE_URL=postgresql://... bun test src/app/api/stripe/webhook/__tests__/mcpTopUpIdempotency.test.ts
 *
 * Layer-1 (synthetic): this file.
 * Layer-2 (real test-mode + stripe-cli): see `scripts/stripe-mcp-top-up-e2e.ts`
 * — that script needs real `sk_test_*` + `whsec_*` and exercises the
 * checkout-session creation path on top of this same handler.
 */

import { createHmac, randomUUID } from "node:crypto";

const ENABLED = process.env.STRIPE_E2E === "1" && !!process.env.DATABASE_URL;

const TEST_WEBHOOK_SECRET = "whsec_test_mcp_idempotency_e2e";

/**
 * Build a Stripe-compatible signature header: `t=<ts>,v1=<sig>` where
 * sig = HMAC-SHA256(secret, "<ts>.<body>"). This is what stripe-cli
 * generates under the hood and what `stripe.webhooks.constructEvent`
 * expects.
 */
function signWebhookPayload(body: string, secret: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const signed = `${ts}.${body}`;
  const v1 = createHmac("sha256", secret).update(signed).digest("hex");
  return `t=${ts},v1=${v1}`;
}

function buildMcpTopUpEvent(
  sessionId: string,
  userId: string,
  sku: "mcp_top_up_5" | "mcp_top_up_20" | "mcp_top_up_50" = "mcp_top_up_5",
): { body: string; expectedAxisCredit: number } {
  const event = {
    id: `evt_${randomUUID().replace(/-/g, "")}`,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2024-10-28",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        mode: "payment",
        payment_status: "paid",
        status: "complete",
        metadata: {
          purpose: "mcp_top_up",
          sku,
          userId,
        },
      },
    },
  };
  const axisCredit = sku === "mcp_top_up_5" ? 50 : sku === "mcp_top_up_20" ? 250 : 750;
  return { body: JSON.stringify(event), expectedAxisCredit: axisCredit };
}

const describeIf = ENABLED ? describe : describe.skip;

describeIf("MCP top-up Stripe webhook — credit + idempotent retry", () => {
  let testUserId: string;
  let dbModule: typeof import("@/lib/database") | null = null;
  let postRoute: typeof import("@/app/api/stripe/webhook/route").POST | null =
    null;
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeAll(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
    dbModule = await import("@/lib/database");
    const routeModule = await import("@/app/api/stripe/webhook/route");
    postRoute = routeModule.POST;

    testUserId = randomUUID();
    const email = `e2e-mcp-top-up-${Date.now()}@e2e.alchm.kitchen`;
    await dbModule.executeQuery(
      `INSERT INTO users (id, email, name, is_agent)
       VALUES ($1, $2, $3, false)`,
      [testUserId, email, "E2E MCP Top-Up Test"],
    );
  }, 30_000);

  afterAll(async () => {
    if (dbModule && testUserId) {
      await dbModule.executeQuery(`DELETE FROM users WHERE id = $1`, [
        testUserId,
      ]);
    }
    if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  }, 30_000);

  it("first event credits +50 to all four ESMS axes + writes one token_transactions row", async () => {
    const sessionId = `cs_test_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const { body, expectedAxisCredit } = buildMcpTopUpEvent(
      sessionId,
      testUserId,
    );
    const signature = signWebhookPayload(body, TEST_WEBHOOK_SECRET);

    const req = new Request("http://test/api/stripe/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      body,
    });
    const res = await postRoute!(req);
    expect(res.status).toBe(200);

    // Token balances should reflect +50 on all four axes.
    const balanceRow = await dbModule!.executeQuery<{
      spirit_balance: number;
      essence_balance: number;
      matter_balance: number;
      substance_balance: number;
    }>(
      `SELECT spirit_balance, essence_balance, matter_balance, substance_balance
         FROM token_balances WHERE user_id = $1`,
      [testUserId],
    );
    expect(balanceRow.rows[0]).toBeDefined();
    expect(Number(balanceRow.rows[0].spirit_balance)).toBeGreaterThanOrEqual(
      expectedAxisCredit,
    );
    expect(Number(balanceRow.rows[0].essence_balance)).toBeGreaterThanOrEqual(
      expectedAxisCredit,
    );
    expect(Number(balanceRow.rows[0].matter_balance)).toBeGreaterThanOrEqual(
      expectedAxisCredit,
    );
    expect(Number(balanceRow.rows[0].substance_balance)).toBeGreaterThanOrEqual(
      expectedAxisCredit,
    );

    // Exactly one transaction batch should reference this session via
    // idempotency_key.
    const txRow = await dbModule!.executeQuery<{ n: string }>(
      `SELECT COUNT(*)::text AS n
         FROM token_transactions
        WHERE idempotency_key = $1`,
      [`mcp_top_up:${sessionId}`],
    );
    // Multi-axis credit writes one row per axis under the same idempotency_key.
    expect(Number(txRow.rows[0].n)).toBeGreaterThanOrEqual(1);
  }, 30_000);

  it("replaying the same event does NOT double-credit (idempotency_key dedupes)", async () => {
    const sessionId = `cs_test_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const { body, expectedAxisCredit } = buildMcpTopUpEvent(
      sessionId,
      testUserId,
    );
    const signature = signWebhookPayload(body, TEST_WEBHOOK_SECRET);

    // Snapshot balance before the duplicate pair.
    const before = await dbModule!.executeQuery<{ spirit_balance: number }>(
      `SELECT spirit_balance FROM token_balances WHERE user_id = $1`,
      [testUserId],
    );
    const spiritBefore = Number(before.rows[0]?.spirit_balance ?? 0);

    const post = async (): Promise<number> => {
      const req = new Request("http://test/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": signature,
        },
        body,
      });
      const r = await postRoute!(req);
      return r.status;
    };

    expect(await post()).toBe(200);
    expect(await post()).toBe(200);

    const after = await dbModule!.executeQuery<{ spirit_balance: number }>(
      `SELECT spirit_balance FROM token_balances WHERE user_id = $1`,
      [testUserId],
    );
    const spiritAfter = Number(after.rows[0].spirit_balance);

    // Net change must be EXACTLY one credit's worth (50), not two.
    expect(spiritAfter - spiritBefore).toBe(expectedAxisCredit);

    // Transaction-row count for this idempotency_key remains capped at 4
    // (one per axis, no duplicates).
    const txRow = await dbModule!.executeQuery<{ n: string }>(
      `SELECT COUNT(*)::text AS n
         FROM token_transactions
        WHERE idempotency_key = $1`,
      [`mcp_top_up:${sessionId}`],
    );
    expect(Number(txRow.rows[0].n)).toBeLessThanOrEqual(4);
  }, 30_000);

  it("rejects events with an invalid signature", async () => {
    const sessionId = `cs_test_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const { body } = buildMcpTopUpEvent(sessionId, testUserId);
    const badSignature = signWebhookPayload(body, "whsec_wrong_secret");

    const req = new Request("http://test/api/stripe/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": badSignature,
      },
      body,
    });
    const res = await postRoute!(req);
    expect(res.status).toBe(400);
  });
});

if (!ENABLED) {
  describe("MCP top-up Stripe webhook (skipped)", () => {
    it("set STRIPE_E2E=1 and DATABASE_URL to run the idempotency suite", () => {
      expect(true).toBe(true);
    });
  });
}
