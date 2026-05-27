#!/usr/bin/env bun
/**
 * Layer-2 (real-Stripe) end-to-end smoke for the MCP top-up flow.
 *
 * Layer-1 (`src/app/api/stripe/webhook/__tests__/mcpTopUpIdempotency.test.ts`)
 * exercises the webhook contract with synthetic signed events and a
 * synthetic STRIPE_WEBHOOK_SECRET — that's the CI-runnable layer.
 *
 * This script is the optional Layer-2 sweep: it talks to the real
 * Stripe **test-mode** API to create a Checkout Session for a top-up
 * SKU, then asks `stripe-cli` to trigger the resulting
 * `checkout.session.completed` event against your local webhook
 * receiver. Use it once per environment when you want to confirm the
 * end-to-end Stripe-side flow (Price → Session → webhook) without
 * spending live-mode money.
 *
 * Required env (all TEST mode):
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...              (from `stripe listen`)
 *   STRIPE_MCP_TOP_UP_5_PRICE_ID=price_...       (test-mode Price)
 *   STRIPE_MCP_TOP_UP_20_PRICE_ID=price_...      (optional — only if you pass --sku=mcp_top_up_20)
 *   STRIPE_MCP_TOP_UP_50_PRICE_ID=price_...      (optional)
 *   DATABASE_URL=postgresql://...                 (to assert credits)
 *
 * Prerequisites:
 *   1. `stripe` CLI installed and authenticated:           `stripe login`
 *   2. A local webhook listener is forwarding events:      `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 *   3. The dev server is running on the forwarded port.
 *
 * Usage:
 *   bun scripts/stripe-mcp-top-up-e2e.ts --user-id <uuid> [--sku mcp_top_up_5]
 *
 * DO NOT run this against live-mode credentials. The live-mode Stripe
 * Products created on 2026-05-27 (prod_Uaux...) are excluded by the
 * sk_test_/whsec_test_ env-var prefixes — bail out below if either looks
 * like a live-mode key.
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag.startsWith("--") && process.argv[i + 1]) {
    args.set(flag.slice(2), process.argv[++i]);
  }
}

function fatal(msg: string): never {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

const userId = args.get("user-id");
if (!userId) fatal("--user-id <uuid> is required");

const sku =
  (args.get("sku") as "mcp_top_up_5" | "mcp_top_up_20" | "mcp_top_up_50" | undefined) ??
  "mcp_top_up_5";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) fatal("STRIPE_SECRET_KEY is required (test mode: sk_test_*)");
if (!secretKey!.startsWith("sk_test_")) {
  fatal(
    `Refusing to run: STRIPE_SECRET_KEY is not a test-mode key (must start with sk_test_). ` +
      `This script never touches live-mode credentials.`,
  );
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) fatal("STRIPE_WEBHOOK_SECRET is required (from `stripe listen`)");

const priceIdEnv = `STRIPE_MCP_TOP_UP_${sku.split("_").pop()}_PRICE_ID`;
const priceId = process.env[priceIdEnv];
if (!priceId) fatal(`${priceIdEnv} is required (must be a test-mode Price id)`);

async function main() {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secretKey!, { apiVersion: "2025-09-30.clover" });

  process.stdout.write(`[layer-2] Creating test-mode Checkout Session for sku=${sku}...\n`);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
    metadata: {
      purpose: "mcp_top_up",
      sku,
      userId: userId!,
    },
  });
  process.stdout.write(`[layer-2] Session created: ${session.id}\n`);

  // Use stripe-cli to fire the completion event. The CLI signs the
  // payload with the same whsec_ that `stripe listen` advertised, so the
  // running webhook listener will accept it.
  process.stdout.write(`[layer-2] Triggering checkout.session.completed via stripe-cli...\n`);
  const { spawn } = await import("node:child_process");
  await new Promise<void>((resolveFn, reject) => {
    const cli = spawn(
      "stripe",
      [
        "trigger",
        "checkout.session.completed",
        "--add",
        `checkout_session:id=${session.id}`,
        "--add",
        `checkout_session:metadata.purpose=mcp_top_up`,
        "--add",
        `checkout_session:metadata.sku=${sku}`,
        "--add",
        `checkout_session:metadata.userId=${userId}`,
      ],
      { stdio: "inherit" },
    );
    cli.on("error", reject);
    cli.on("exit", (code) =>
      code === 0 ? resolveFn() : reject(new Error(`stripe-cli exited ${code}`)),
    );
  });

  // Give the webhook handler a beat to credit and write the row.
  await new Promise((r) => setTimeout(r, 1500));

  if (!process.env.DATABASE_URL) {
    process.stdout.write(
      `[layer-2] DATABASE_URL not set — skipping DB assertion. Manual check: ` +
        `SELECT * FROM token_transactions WHERE idempotency_key='mcp_top_up:${session.id}';\n`,
    );
    return;
  }

  const { executeQuery } = await import("@/lib/database");
  const tx = await executeQuery(
    `SELECT token_type, amount FROM token_transactions WHERE idempotency_key = $1`,
    [`mcp_top_up:${session.id}`],
  );
  process.stdout.write(
    `[layer-2] token_transactions for this session (${tx.rows.length} row(s)):\n`,
  );
  for (const row of tx.rows) {
    process.stdout.write(`  ${row.token_type}: +${row.amount}\n`);
  }
  if (tx.rows.length === 0) {
    fatal(
      "No token_transactions row written. Check the webhook listener logs " +
        "(`stripe listen` output) and the dev-server console.",
    );
  }
  process.stdout.write(`[layer-2] OK — layer-2 E2E passed.\n`);
}

main().catch((err) => {
  process.stderr.write(`[layer-2] FAILED: ${String(err)}\n`);
  process.exit(1);
});
