# Stripe — required Dashboard and Vercel actions

Everything in the **codebase** is done. This is the half that lives in Stripe's
Dashboard and Vercel's settings, which no PR can change.

Findings below are measured against the live platform account (US,
`charges_enabled: true`, `payouts_enabled: true`,
`capabilities.crypto_payments: **active**`) on 2026-08-10, read-only via
`webhookEndpoints.list()`.

**Do these in order.** Action 4 turns on a money path, and it is only safe after
action 1.

---

## 1 · Add three missing webhook events ← the one that matters

Endpoint `https://alchm.kitchen/api/stripe/webhook` is `enabled` with **5 events**.
Three events the code handles are **not among them**:

| Event | What silently breaks today |
|---|---|
| `checkout.session.async_payment_succeeded` | **The only signal that a crypto order was paid.** Customer is charged, the Connect transfer to the restaurant never runs, fulfilment never fires. |
| `checkout.session.async_payment_failed` | A failed crypto order is never marked terminal. |
| `account.updated` | **Connect onboarding state has never synced.** A restaurant that finished onboarding still reads `pending` locally and cannot be paid out. |

`account.updated` deserves emphasis: the handler has existed all along. Stripe
was simply never sending the event, so it has never once run. That is the
characteristic failure of webhooks — the missing half raises no error anywhere,
because from the application's point of view the event never happened.

**Do:** Stripe Dashboard → Developers → Webhooks → that endpoint → *Update
details* → add the three events above.

---

## 2 · Align the endpoint's API version

| | |
|---|---|
| Endpoint sends | `2026-02-25.clover` |
| SDK + code expect | `2026-04-22.dahlia` |

The endpoint serialises event payloads at the **older** version, so payload
shapes can differ from what the types promise. The code currently defends itself
— `getSubscriptionPeriod` and `getInvoiceSubscriptionId` read fields defensively
with fallbacks, which is almost certainly a scar from this exact skew — but
relying on that indefinitely means every future field move is a live incident.

**Do:** set the endpoint's API version to `2026-04-22.dahlia`, then re-run the
verification in §6. Keep this in step with `apiVersion` in
[src/lib/stripe/stripe.ts](../../src/lib/stripe/stripe.ts) whenever the SDK is upgraded.

---

## 3 · Mark the Stripe secrets Sensitive in Vercel

```
STRIPE_SECRET_KEY      Non-sensitive   ← live-mode key, readable in plaintext
STRIPE_WEBHOOK_SECRET  Non-sensitive   ← readable in plaintext
```

Both currently pull as **plaintext** for anyone who can run `vercel env pull`.
`STRIPE_SECRET_KEY` is a **live-mode** key (`sk_live_…`) with full account
access. This is the same exposure class as the database password found on
2026-08-08, and the same fix.

**Do:** Vercel → Settings → Environment Variables → edit each → mark
**Sensitive**.

> Once Sensitive they can no longer be read back, so a by-value scan cannot see
> them — they become a by-NAME surface for any future rotation. See
> [rotate-database-credential.md](../runbooks/rotate-database-credential.md).

Worth deciding separately: whether to rotate `STRIPE_SECRET_KEY` outright. It has
been readable plaintext for an unknown period. Rotating is a Dashboard action
(*Developers → API keys → roll*), followed by updating Vercel and a **git-based**
rebuild — `vercel redeploy` reuses the old build's env snapshot.

---

## 4 · Only then: enable crypto restaurant payments

`NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED` is **not set** in Vercel
production, so `restaurantCryptoPaymentsEnabled()` returns false and the crypto
option is hidden.

**That flag is the only thing that has prevented stranded paid orders.** The
platform account already has `crypto_payments: active`, and until this PR the
code could not settle an async payment. Setting it before action 1 would take
real customer money into a state nothing advances.

**Do (after §1 is confirmed):** add
`NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED=true`, then redeploy — it is
`NEXT_PUBLIC_`, so it is inlined at **build** time and a redeploy of the existing
build will not pick it up.

---

## 5 · Housekeeping

- `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` is set in Vercel and checked by
  `launchReadinessService`, but **read by no code**. It becomes fully dead with
  the premium removal; remove it then, not before, to keep the diffs separate.
- `STRIPE_RESTAURANT_ORDER_PRICE_ID` and `STRIPE_RESTAURANT_SPLIT_MODE` are unset
  and that is **fine** — the split mode falls back to
  `separate_charges_and_transfers`, which is the intended default. Listed here
  only so their absence is not mistaken for a gap.

---

## 6 · Verify (no guessing)

The check is now in the code and on the admin board, so this is not a trust
exercise. **Admin → System Status → Payments · Stripe** shows a
**"Webhook events"** metric:

- `all covered` — every handled event is enabled
- `N missing` — with an issue naming the exact events, and the flow escalated to
  **INCIDENT** if any missing event is one that costs money or fulfilment
- `no source` — Stripe was unreachable; deliberately *not* reported as healthy

The declared event list lives in
[src/lib/stripe/handledEvents.ts](../../src/lib/stripe/handledEvents.ts), and a unit test
parses the webhook's `switch` to guarantee the list cannot drift from what the
route actually handles.

### Expected state once §1 and §2 are done

```
Webhook events : all covered
Payments flow  : OK
endpoint       : https://alchm.kitchen/api/stripe/webhook   enabled
api_version    : 2026-04-22.dahlia
```

### End-to-end, in test mode

An event-coverage check proves Stripe *will send* the event; it does not prove
the handler works. For that:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.async_payment_succeeded
```

The order should move to `paid`, a transfer should be created with idempotency
key `restaurant_order_transfer_<orderId>`, and fulfilment should fire once.
