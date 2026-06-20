import { NextResponse } from 'next/server'
import { keccak256, toHex } from 'viem'
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import {
  buildRedeemAuthChallenge,
  esmsOnchainConfigured,
  readEsmsBalances,
  readEsmsRedeemed,
} from '@/lib/esms-chain/contract'
import {
  redeemEsmsFor,
  redeemerConfigured,
  toOnchainAmounts,
  verifyRedeem,
} from '@/lib/esms-chain/redeemer'
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { Address, Hex } from 'viem'

export const dynamic = 'force-dynamic'

const TX_PATTERN = /^0x[0-9a-f]{64}$/i

export async function POST(request: Request) {
  const user = await getDatabaseUserFromRequest(request as any);
  const userId = user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const shopItemSlug = body.itemId;
  if (!shopItemSlug) return NextResponse.json({ error: 'Unknown item' }, { status: 404 })

  const item = await tokenEconomy.getShopItem(shopItemSlug);
  if (!item) return NextResponse.json({ error: 'Unknown item' }, { status: 404 })

  const isOneTime = item.isOneTime ?? true;

  if (isOneTime && await tokenEconomy.hasActivePurchase(userId, shopItemSlug)) {
    return NextResponse.json({ ok: true, alreadyOwned: true, itemId: shopItemSlug })
  }

  if (!esmsOnchainConfigured()) {
    return NextResponse.json(
      { error: 'On-chain ESMS is not deployed.', code: 'onchain_unconfigured' },
      { status: 503 }
    )
  }

  // Find user's privy wallet address
  // In WTEN, the `user` object might not have `privyWalletAddress` mapped cleanly
  // If not, we will fallback to query token_balances / user table
  let wallet = (user as any).walletAddress as Address | undefined;
  if (!wallet) {
    const dbModule = await import("@/lib/database");
    const db = dbModule;
    if(db && typeof db.executeQuery === 'function') {
      const uRes = await db.executeQuery("SELECT wallet_address FROM users WHERE id = $1", [userId]);
      if(uRes && uRes.rows && uRes.rows[0]) {
        wallet = uRes.rows[0].wallet_address as Address;
      }
    }
  }

  if (!wallet) {
    return NextResponse.json(
      { error: 'Connect your wallet and claim ESMS to chain before spending.', code: 'no_wallet' },
      { status: 400 }
    )
  }

  // Deterministic bytes32 order id, mirroring the Agents shopOrderId (keccak256 of a
  // stable string). One-time items key on (user, item) so a re-purchase reconciles to
  // the same order; repeatable items fold in a nonce. The same id guards the on-chain
  // burn (EsmsToken.redeemedOrders) AND the off-chain entitlement, so retries never
  // double-burn or double-grant.
  //
  // NOTE: the previous Buffer.from(...).slice(0,64) construction was broken — a userId
  // UUID alone is 72 hex chars, so the slice dropped the slug/nonce and every item the
  // same user bought collided to one orderId (free unlocks after the first burn).
  const safeNonce = isOneTime ? '' : String(body.nonce || '');
  const orderId = keccak256(toHex(`shop:${userId}:${shopItemSlug}:${safeNonce}`));
  
  const amounts = {
    spirit: String(item.costSpirit || 0),
    essence: String(item.costEssence || 0),
    matter: String(item.costMatter || 0),
    substance: String(item.costSubstance || 0)
  };

  // Record the entitlement. user_purchases.transaction_group_id is UUID NOT NULL, so we
  // mint a fresh uuid (the on-chain {Redeemed} event + orderId are the canonical spend
  // record; there is no tx-hash column here). Idempotent on (user, item) via WHERE NOT
  // EXISTS so a retry / reconcile never inserts a duplicate row. Errors are swallowed:
  // the on-chain burn is canonical, and the redeemedOrders reconcile branch re-grants on
  // the next attempt if this write fails.
  //
  // NOTE: the previous insert passed the tx hash (or null) into a UUID NOT NULL column,
  // so the entitlement write threw on every path and the unlock never persisted.
  const grantPurchase = async () => {
    try {
      const dbModule = await import("@/lib/database");
      const db = dbModule;
      if (db && typeof db.executeQuery === 'function') {
        await db.executeQuery(
          `INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id)
           SELECT $1, $2, uuid_generate_v4()
           WHERE NOT EXISTS (
             SELECT 1 FROM user_purchases WHERE user_id = $1 AND shop_item_id = $2
           )`,
          [userId, item.id]
        );
      }
    } catch (err) {
      console.error('[api/shop/purchase] grantPurchase failed:', err);
    }
  };

  try {
    if (await readEsmsRedeemed(orderId)) {
      await grantPurchase();
      return NextResponse.json({ ok: true, itemId: shopItemSlug, orderId, reconciled: true })
    }
  } catch (err) {
    console.warn('[api/shop/purchase] redeemedOrders read failed:', err)
  }

  const txHash = typeof body.txHash === 'string' && TX_PATTERN.test(body.txHash) ? (body.txHash as Hex) : null
  if (txHash) {
    const ok = await verifyRedeem({ txHash, orderId, from: wallet })
    if (!ok) {
      return NextResponse.json({ error: 'Could not verify the on-chain ESMS burn.', code: 'verify_failed' }, { status: 502 })
    }
    await grantPurchase();
    return NextResponse.json({ ok: true, itemId: shopItemSlug, orderId, txHash })
  }

  if (!redeemerConfigured()) {
    return NextResponse.json({ error: 'ESMS settlement wallet not configured.', code: 'redeemer_unconfigured' }, { status: 503 })
  }

  // Liveness check: fail fast with 502 if the chain RPC is unreachable, before we hand
  // the buyer a signing challenge they couldn't settle anyway.
  try {
    await readEsmsBalances(wallet)
  } catch {
    return NextResponse.json({ error: 'Could not read on-chain ESMS balance.', code: 'balance_unavailable' }, { status: 502 })
  }

  const sig = typeof body.signature === 'string' && /^0x[0-9a-fA-F]+$/.test(body.signature) ? (body.signature as Hex) : null
  if (!sig || body.deadline === undefined) {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
    return NextResponse.json({
      mode: 'sign',
      itemId: shopItemSlug,
      orderId,
      deadline: deadline.toString(),
      challenge: buildRedeemAuthChallenge({ from: wallet, orderId, values: toOnchainAmounts(amounts), deadline })
    })
  }

  try {
    const burnTx = await redeemEsmsFor({ from: wallet, orderId, amounts, deadline: BigInt(String(body.deadline)), sig })
    await grantPurchase();
    return NextResponse.json({ ok: true, itemId: shopItemSlug, orderId, txHash: burnTx })
  } catch (err) {
    console.error('[api/shop/purchase] sponsored burn failed:', err)
    return NextResponse.json({ error: 'On-chain ESMS burn failed.', code: 'burn_failed', retryable: true }, { status: 502 })
  }
}
