/**
 * launchReadinessService — presence-only configuration readiness for the
 * revenue + on-chain "moving pieces" that ship alongside the core app.
 *
 * Every subsystem here (Stripe Pro, restaurant crypto-food payments, the
 * on-chain ESMS economy, Recipe-NFT minting, Privy server wallets, the Amazon
 * Fresh affiliate sink, the cross-project agent network, transactional email)
 * is gated behind environment variables. This service reports, per subsystem,
 * WHICH of those env vars are configured — as booleans only. It never reads a
 * secret's value; `Boolean(process.env.X)` collapses the value to a presence
 * flag before it leaves the server. The API route that wraps this is admin-
 * guarded, and the payload is safe to render in the admin UI.
 *
 * It also surfaces the one live operational signal that determines whether the
 * restaurant payment rail is safe to leave running: the settlement backlog
 * (orders where ESMS was debited but the restaurant transfer isn't confirmed).
 *
 * @file src/services/launchReadinessService.ts
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";

/** A single env-driven config check. `ok` is the only value that leaves here. */
export interface ReadinessCheck {
  /** Human label, e.g. "Stripe secret key". */
  label: string;
  /** The env var backing it, e.g. "STRIPE_SECRET_KEY" — name only, no value. */
  source: string;
  /** Whether the var is configured (secrets) or enabled (flags). */
  ok: boolean;
  /**
   * "flag"   → must equal "true" to count as ok (feature toggles),
   * "secret" → server-only credential, present when non-empty,
   * "config" → non-secret setting (price id, chain, country), present when set.
   */
  kind: "flag" | "secret" | "config";
  /** true for NEXT_PUBLIC_* vars — resolved at build time, not runtime. */
  isPublic: boolean;
}

export type ReadinessStatus = "READY" | "PARTIAL" | "OFF";

export interface SubsystemReadiness {
  key: string;
  label: string;
  description: string;
  status: ReadinessStatus;
  configured: number;
  total: number;
  checks: ReadinessCheck[];
}

export interface SettlementBacklog {
  /** Orders awaiting settlement (debited, transfer unconfirmed). */
  pending: number;
  /** false when restaurant_order_intents is absent or the query failed. */
  live: boolean;
}

export interface LaunchReadinessReport {
  subsystems: SubsystemReadiness[];
  settlement: SettlementBacklog;
  /** Count of subsystems fully READY. */
  readyCount: number;
  generatedAt: string;
}

// ── env helpers ─────────────────────────────────────────────────────────────
// Both collapse the value to a boolean immediately — a secret's contents never
// escape this module.
const isSet = (name: string): boolean => Boolean(process.env[name]?.trim());
const isEnabled = (name: string): boolean =>
  process.env[name]?.trim().toLowerCase() === "true";

function check(
  label: string,
  source: string,
  kind: ReadinessCheck["kind"],
): ReadinessCheck {
  return {
    label,
    source,
    kind,
    ok: kind === "flag" ? isEnabled(source) : isSet(source),
    isPublic: source.startsWith("NEXT_PUBLIC_"),
  };
}

/** anyOf — one check that passes if ANY of the given vars is set (e.g. the
 * mainnet OR testnet RPC url). */
function anyOf(
  label: string,
  sources: string[],
  kind: ReadinessCheck["kind"],
): ReadinessCheck {
  return {
    label,
    source: sources.join(" / "),
    kind,
    ok: sources.some((s) => (kind === "flag" ? isEnabled(s) : isSet(s))),
    isPublic: sources.every((s) => s.startsWith("NEXT_PUBLIC_")),
  };
}

function subsystem(
  key: string,
  label: string,
  description: string,
  checks: ReadinessCheck[],
): SubsystemReadiness {
  const configured = checks.filter((c) => c.ok).length;
  const total = checks.length;
  const status: ReadinessStatus =
    configured === total ? "READY" : configured === 0 ? "OFF" : "PARTIAL";
  return { key, label, description, status, configured, total, checks };
}

async function getSettlementBacklog(): Promise<SettlementBacklog> {
  try {
    const result = await executeQuery<{ count: string }>(
      `SELECT COUNT(*)::integer AS count
         FROM restaurant_order_intents
        WHERE status = 'settlement_pending'
           OR transfer_status = 'retry_required'`,
    );
    return { pending: Number(result.rows[0]?.count ?? 0), live: true };
  } catch (error) {
    _logger.warn("[launchReadiness] settlement backlog query failed:", error);
    return { pending: 0, live: false };
  }
}

/**
 * Build the readiness report. Config checks are synchronous env reads; only the
 * settlement backlog touches the database.
 */
export async function getLaunchReadiness(): Promise<LaunchReadinessReport> {
  const subsystems: SubsystemReadiness[] = [
    subsystem(
      "stripe-pro",
      "Stripe · Pro subscriptions",
      "Recurring Pro-tier billing + webhook reconciliation.",
      [
        check("Secret key", "STRIPE_SECRET_KEY", "secret"),
        check("Webhook signing secret", "STRIPE_WEBHOOK_SECRET", "secret"),
        check("Publishable key", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "config"),
        check("Pro price id", "NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID", "config"),
      ],
    ),
    subsystem(
      "restaurant-esms",
      "Restaurant · crypto-food payments",
      "Pay a restaurant bill in ESMS; Stripe transfer settles the fiat leg.",
      [
        check(
          "Payments enabled",
          "NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED",
          "flag",
        ),
        check(
          "Stripe crypto rail enabled",
          "NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED",
          "flag",
        ),
        check("Connect country", "STRIPE_RESTAURANT_CONNECT_COUNTRY", "config"),
        check("Order price id", "STRIPE_RESTAURANT_ORDER_PRICE_ID", "config"),
        check(
          "Cents-per-token rate",
          "NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN",
          "config",
        ),
      ],
    ),
    subsystem(
      "onchain-esms",
      "On-chain · ESMS economy",
      "Soulbound ESMS balances mirrored on Base.",
      [
        check("On-chain enabled", "NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED", "flag"),
        check("Chain", "NEXT_PUBLIC_ESMS_CHAIN", "config"),
        check("Token contract", "ESMS_CONTRACT_ADDRESS", "config"),
        anyOf("RPC endpoint", ["BASE_RPC_URL", "BASE_SEPOLIA_RPC_URL"], "config"),
        check("Minter key", "MINTER_PRIVATE_KEY", "secret"),
      ],
    ),
    subsystem(
      "recipe-nft",
      "On-chain · Recipe NFT minting",
      "Spend ESMS to mint a recipe as an on-chain NFT.",
      [
        check("Minting enabled", "NEXT_PUBLIC_RECIPE_NFT_ENABLED", "flag"),
        check("Chain", "NEXT_PUBLIC_RECIPE_NFT_CHAIN", "config"),
        check("Recipe registry", "NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS", "config"),
        check("Rights registry", "NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS", "config"),
        check("Rights id", "NEXT_PUBLIC_ALCHM_RIGHTS_ID", "config"),
        check("Recipe minter key", "RECIPE_MINTER_PRIVATE_KEY", "secret"),
      ],
    ),
    subsystem(
      "privy",
      "Privy · server wallets",
      "Embedded EVM wallets + social login for on-chain actions.",
      [
        check("App id", "NEXT_PUBLIC_PRIVY_APP_ID", "config"),
        check("App secret", "PRIVY_APP_SECRET", "secret"),
        check("Authorization key", "PRIVY_AUTHORIZATION_PRIVATE_KEY", "secret"),
        check("Minter wallet id", "PRIVY_MINTER_WALLET_ID", "config"),
        check("Redeemer wallet id", "PRIVY_REDEEMER_WALLET_ID", "config"),
      ],
    ),
    subsystem(
      "amazon-fresh",
      "Amazon · affiliate grocery sink",
      "Turns ingredient lists into affiliate Amazon Fresh carts.",
      [
        check("Associate tag", "NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG", "config"),
        check("PA-API access key", "AMAZON_PAAPI_ACCESS_KEY", "secret"),
        check("PA-API secret key", "AMAZON_PAAPI_SECRET_KEY", "secret"),
        check("PA-API partner tag", "AMAZON_PAAPI_PARTNER_TAG", "config"),
      ],
    ),
    subsystem(
      "agent-network",
      "Agents · cross-project sync",
      "Signed channel to the Planetary Agents backend.",
      [check("Internal API secret", "INTERNAL_API_SECRET", "secret")],
    ),
    subsystem(
      "email",
      "Email · transactional",
      "Transit updates, meal-plan digests, bulletins.",
      [check("Resend API key", "RESEND_API_KEY", "secret")],
    ),
  ];

  const settlement = await getSettlementBacklog();

  return {
    subsystems,
    settlement,
    readyCount: subsystems.filter((s) => s.status === "READY").length,
    generatedAt: new Date().toISOString(),
  };
}
