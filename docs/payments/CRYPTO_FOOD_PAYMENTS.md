# Crypto Food Payments

Research and implementation decision as of June 14, 2026.

## Executive decision

Use the existing Stripe Checkout, Stripe Connect, restaurant order intent, and
Deliverect fulfillment pipeline for the first production pilot.

- **Card:** existing USD Checkout path.
- **USDC:** Stripe stablecoin Checkout, explicitly selected by the customer.
- **ESMS:** closed-loop Spirit/Essence/Matter/Substance redemption. Alchm debits
  the internal ledger and pays the connected restaurant from a funded Stripe
  platform balance.

Do not market ESMS as withdrawable USDC. There is no current ESMS reserve
contract, public cash-redemption promise, or onchain redemption mechanism in
this repository. A direct ESMS-to-USDC off-ramp would add treasury, fraud,
consumer disclosure, tax, sanctions, and potentially money-transmission duties.

## What the Git history shows

The recent work already supplied most of the required system:

| Date | Commit | Relevant capability |
| --- | --- | --- |
| May 12, 2026 | `f95980ac` | Restaurant discovery and partner menu flow |
| May 12, 2026 | `04eb1b32` | Stripe Connect, order intents, webhook reconciliation, Deliverect fulfillment |
| June 2, 2026 | `e2f77757` | Privy identity linking |
| June 2, 2026 | `93eb4205` | Embedded Base wallet persistence and cross-site wallet polish |
| June 9, 2026 | `8f521d11` | SpacetimeDB live meal-plan and cart state |
| June 11, 2026 | `85c90414` to `cd889505` | Current cooking-method redesign branch |

The payment integration therefore extends the working restaurant route instead
of creating a second order system.

## Implemented flows

### USDC

1. Customer selects USDC on a restaurant order.
2. `POST /api/stripe/restaurant-order` creates a crypto-only Stripe Checkout
   Session with USD-priced line items.
3. Stripe redirects the customer to its wallet payment experience.
4. The signed Stripe webhook waits for `payment_status=paid`.
5. The existing Connect transfer pays the restaurant.
6. The existing fulfillment service injects the paid order into Deliverect.
7. Payment metadata records the wallet address, network, token, and transaction
   hash when Stripe supplies them on the expanded Charge.

Stripe currently supports USDC on Ethereum, Solana, Polygon, and Base, plus
USDP and USDG on narrower network sets. Completed payments settle to the Stripe
balance in USD. Stablecoin acceptance is currently limited to US businesses,
and Stripe lists a USD 10,000 per-transaction limit.

### ESMS

1. Customer selects ESMS on a priced partner menu.
2. The app computes a deterministic, equal four-axis basket.
3. A PostgreSQL transaction locks the order, verifies all four balances, debits
   them atomically, and writes immutable ledger entries.
4. Alchm transfers the restaurant payout from its Stripe platform balance.
5. Only after settlement is created does the order become paid and enter
   Deliverect fulfillment.

ESMS is intentionally restricted to authenticated users and Stripe-connected
restaurant partners. External restaurant links cannot receive reserve-backed
ESMS settlement.

## ESMS economics

The pilot configuration is `1 ESMS = $0.01` of closed-loop food value, split as
evenly as possible across Spirit, Essence, Matter, and Substance. A $20 order is
therefore 500 of each axis.

This is below every current top-up acquisition rate:

| Bundle | Total ESMS | Acquisition cost per ESMS |
| --- | ---: | ---: |
| $5 top-up: 50 per axis | 200 | $0.0250 |
| $20 top-up: 250 per axis | 1,000 | $0.0200 |
| $50 top-up: 750 per axis | 3,000 | $0.0167 |

That prevents a simple buy-and-redeem arbitrage, but earned ESMS still creates
a real platform liability. Before enabling the flag in production:

- Fund and monitor a dedicated restaurant settlement reserve.
- Cap per-user and aggregate daily redemption.
- Publish the redemption rate and change policy before users rely on it.
- Reconcile token debits, Stripe transfers, refunds, and failed fulfillment.
- Add an operator retry/refund workflow for `settlement_pending` orders.
- Obtain legal and accounting review before advertising monetary value.

## Provider research

### Stripe stablecoin payments: selected

Best fit because the codebase already relies on Checkout, signed webhooks,
Connect transfers, and Stripe-hosted restaurant onboarding.

- 1.5% of transaction amount in USD on Stripe's current US pricing page.
- Conversion to fiat, wallet/AML screening, fraud prevention, and gas
  sponsorship are included.
- Checkout and Connect are supported.
- Refunds return stablecoins to the original wallet.
- Connected accounts need the `crypto_payments` capability active.

Sources:

- [Stripe stablecoin payments](https://docs.stripe.com/payments/stablecoin-payments)
- [Accept stablecoin payments](https://docs.stripe.com/payments/accept-stablecoin-payments)
- [Stripe pricing](https://stripe.com/pricing)
- [Separate charges and transfers](https://docs.stripe.com/connect/separate-charges-and-transfers)

### Coinbase Business Checkouts: strong second adapter

Coinbase Business Checkouts supports USDC payment requests, Base, webhooks,
idempotency, redirect URLs, and a sandbox. It is attractive if Alchm later wants
to retain USDC or use Coinbase treasury/payout APIs. It is not the first adapter
because it would duplicate the existing Stripe webhook, Connect, refund, and
merchant reconciliation path.

Sources:

- [Coinbase Business Checkouts migration overview](https://docs.cdp.coinbase.com/coinbase-business/checkout-apis/migrate/overview)
- [Checkout API schema](https://docs.cdp.coinbase.com/coinbase-business/checkout-apis/migrate/api-schema-mapping)
- [Checkout sandbox](https://docs.cdp.coinbase.com/coinbase-business/checkout-apis/sandbox)
- [Coinbase payment acceptance](https://docs.cdp.coinbase.com/payments/payment-acceptance/overview)

### BitPay: broad merchant and payout coverage

BitPay supports merchant invoices, a food and restaurant directory, gift cards,
and payouts with USDC among its ledger currencies. It is useful for broad coin
acceptance or a payout adapter, but it would also introduce a parallel invoice
and webhook lifecycle.

Sources:

- [BitPay restaurant directory](https://www.bitpay.com/directory/restaurants-food-beverages)
- [BitPay payout API](https://developer.bitpay.com/reference/create-a-payout)

### Bitrefill: useful indirect fallback

Bitrefill sells US DoorDash, Uber Eats, and Instacart-style food-delivery gift
cards for crypto. This can help users spend crypto where a direct merchant
integration is unavailable. Gift cards do not provide Alchm with restaurant
menu ingestion, order status, refunds, delivery tracking, or payout control.

Sources:

- [US food-delivery gift cards](https://www.bitrefill.com/us/en/gift-cards/food-delivery/)
- [DoorDash US gift card](https://www.bitrefill.com/us/en/gift-cards/doordash-usa/)
- [Uber Eats US gift card](https://www.bitrefill.com/us/en/gift-cards/uber-eats-usa/)

### Direct Privy/Base transfer: later phase

The shared Privy app and embedded Base wallet make a native USDC transfer
possible, but a safe direct implementation still needs token allowlists,
decimals and chain validation, quote expiry, transaction monitoring,
reorganizations, sanctions screening, refunds, treasury management, and a
merchant payout adapter. Stripe already supplies these controls for the pilot.

## Production checklist

1. Request and receive Stripe Stablecoins and Crypto approval for the US
   platform account.
2. Enable Crypto in Stripe payment-method settings.
3. Activate `crypto_payments` on every participating connected account.
4. Configure the signed Stripe webhook and verify `checkout.session.completed`.
5. Fund the Stripe platform balance used for ESMS restaurant transfers.
6. Set the feature flags only after the account and reserve are ready.
7. Test card, USDC testnet, insufficient ESMS, successful ESMS settlement,
   duplicate webhook, transfer failure, refund, and Deliverect failure paths.
8. Start with one partner restaurant and explicit daily limits.

```dotenv
NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED=true
NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED=true
NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN=1
# Only after the EsmsToken contract is deployed + verified on-chain:
NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED=true
```

The homepage promo (`src/components/home/Promotion.tsx`) advertises each crypto
rail **only** when its flag is on, via `src/lib/payments/cryptoPromo.ts`:
`NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED` gates the "Pay for Food with
USDC" card + CTA, and `NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED` gates the "On-Chain
ESMS / claim to your Base wallet" copy. With every flag off (the default) the
homepage shows only the off-chain ESMS welcome grant + token economy, which are
live regardless. Never flip `NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED` on until the
contract address resolves to real bytecode on the target chain.

## Follow-up controls

The code deliberately marks an uncertain reserve transfer as
`settlement_pending` and tells the customer not to resubmit. Before a public
launch, add an authenticated operator action that retries the same Stripe
idempotency key or refunds the exact ESMS transaction group after confirming no
transfer exists.

Consumer rewards guidance also favors clear, durable redemption disclosures;
materially changing promised value after users earn or buy rewards creates
consumer-protection risk. See the [CFPB rewards circular](https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2024-07-design-marketing-and-administration-of-credit-card-rewards-programs/).

