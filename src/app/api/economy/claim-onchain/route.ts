/**
 * ESMS claim-to-chain bridge.
 *
 * GET  /api/economy/claim-onchain — wallet panel status: link state, off-chain
 *      vs on-chain balances, the in-flight claim (if any), recent claim history.
 * POST /api/economy/claim-onchain — move the user's entire off-chain balance
 *      on-chain: atomically debit all four coins from the Postgres ledger, then
 *      mint the same amounts to the user's linked Privy wallet via
 *      EsmsToken.claimMint (backend-sponsored — the user pays no gas).
 *
 * Safety model: the bytes32 claim_id is enforced unique BY THE CONTRACT, so a
 * pending claim can always be retried or reconciled without double-minting.
 * The debit commits before the mint; a mint that may have broadcast is never
 * refunded — the claim stays pending and the next POST reconciles it against
 * claimed(claim_id). Refunds only happen after the chain confirms the claim
 * was never minted (reverted receipt + claimed() false).
 */

import { NextResponse } from "next/server";
import { formatUnits } from "viem";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import {
  esmsChain,
  esmsContractAddress,
  esmsOnchainConfigured,
  esmsPublicClient,
  readEsmsBalances,
  readEsmsClaimed,
} from "@/lib/esms-chain/contract";
import { mintEsmsClaim, minterConfigured } from "@/lib/esms-chain/minter";
import { rateLimit } from "@/lib/rateLimit";
import {
  esmsOnchainClaimService,
  type EsmsClaimAmounts,
  type EsmsOnchainClaim,
} from "@/services/esmsOnchainClaimService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";
import type { Address, Hex } from "viem";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Debit + mint + receipt wait can straddle two Base blocks plus RPC retries.
export const maxDuration = 60;

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/** Resolve the user's linked wallet: session field first, then the users row. */
async function resolveWallet(user: { id: string; walletAddress?: string | null }): Promise<Address | null> {
  const fromSession = user.walletAddress;
  if (fromSession && EVM_ADDRESS.test(fromSession)) return fromSession as Address;
  try {
    const res = await executeQuery<{ wallet_address: string | null }>(
      "SELECT wallet_address FROM users WHERE id = $1",
      [user.id],
    );
    const addr = res.rows[0]?.wallet_address;
    return addr && EVM_ADDRESS.test(addr) ? (addr as Address) : null;
  } catch {
    return null;
  }
}

function chainMeta() {
  const chain = esmsChain();
  return {
    chainId: chain.id,
    chainName: chain.name,
    testnet: chain.testnet ?? false,
    contractAddress: esmsOnchainConfigured() ? esmsContractAddress() : null,
    explorerBaseUrl: chain.blockExplorers?.default?.url ?? null,
  };
}

async function readOnchainOrNull(wallet: Address) {
  try {
    const b = await readEsmsBalances(wallet);
    return {
      spirit: Number(formatUnits(b.spirit, 18)),
      essence: Number(formatUnits(b.essence, 18)),
      matter: Number(formatUnits(b.matter, 18)),
      substance: Number(formatUnits(b.substance, 18)),
    };
  } catch (err) {
    console.warn("[economy/claim-onchain] on-chain balance read failed:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const configured = esmsOnchainConfigured() && minterConfigured();
  const wallet = await resolveWallet(user);
  const [offchain, pending, recent, onchain] = await Promise.all([
    tokenEconomy.getBalances(user.id),
    esmsOnchainClaimService.findPending(user.id),
    esmsOnchainClaimService.listRecent(user.id, 10),
    wallet && esmsOnchainConfigured() ? readOnchainOrNull(wallet) : Promise.resolve(null),
  ]);

  return NextResponse.json({
    success: true,
    configured,
    walletAddress: wallet,
    walletLinked: Boolean(wallet),
    offchain: {
      spirit: offchain.spirit,
      essence: offchain.essence,
      matter: offchain.matter,
      substance: offchain.substance,
    },
    onchain,
    pendingClaim: pending,
    recentClaims: recent,
    chain: chainMeta(),
  });
}

/** Floor to the ledger's 4-dp precision so debit and mint agree exactly. */
function floor4(n: number): number {
  return Math.floor(n * 10_000) / 10_000;
}

function claimToResponse(claim: EsmsOnchainClaim, extra?: Record<string, unknown>) {
  const meta = chainMeta();
  return {
    claimId: claim.claimId,
    amounts: claim.amounts,
    status: claim.status,
    txHash: claim.txHash,
    explorerUrl:
      claim.txHash && meta.explorerBaseUrl ? `${meta.explorerBaseUrl}/tx/${claim.txHash}` : null,
    ...extra,
  };
}

/**
 * Confirm a sent claim mint: wait for the receipt, fall back to claimed() when
 * the receipt times out. Marks the row and returns the final status.
 */
async function confirmMint(claim: EsmsOnchainClaim, txHash: Hex): Promise<"minted" | "pending" | "reverted"> {
  await esmsOnchainClaimService.recordTxHash(claim.id, txHash);
  try {
    const receipt = await esmsPublicClient().waitForTransactionReceipt({
      hash: txHash,
      timeout: 45_000,
    });
    if (receipt.status === "success") {
      await esmsOnchainClaimService.markMinted(claim.id, txHash);
      return "minted";
    }
    return "reverted";
  } catch {
    // Timeout / RPC error — the tx may still mine. claimed() is the tiebreaker;
    // if it is not yet visible the claim stays pending and reconciles later.
    try {
      if (await readEsmsClaimed(claim.claimId)) {
        await esmsOnchainClaimService.markMinted(claim.id, txHash);
        return "minted";
      }
    } catch {
      // chain unreadable — stay pending
    }
    await esmsOnchainClaimService.recordError(claim.id, "receipt timeout — reconciling on next request");
    return "pending";
  }
}

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 3,
    bucket: "economy-claim-onchain",
    identifier: user.id,
  });
  if (!rl.allowed) return rl.response!;

  if (!esmsOnchainConfigured()) {
    return NextResponse.json(
      { success: false, error: "On-chain ESMS is not deployed.", code: "onchain_unconfigured" },
      { status: 503 },
    );
  }
  if (!minterConfigured()) {
    return NextResponse.json(
      { success: false, error: "ESMS claim minter is not configured.", code: "minter_unconfigured" },
      { status: 503 },
    );
  }

  const wallet = await resolveWallet(user);
  if (!wallet) {
    return NextResponse.json(
      {
        success: false,
        error: "Link your Privy wallet before claiming ESMS on-chain.",
        code: "no_wallet",
      },
      { status: 400 },
    );
  }

  // ── Reconcile any in-flight claim before opening a new one ────────────────
  const pending = await esmsOnchainClaimService.findPending(user.id);
  if (pending) {
    let alreadyClaimed = false;
    try {
      alreadyClaimed = await readEsmsClaimed(pending.claimId);
    } catch {
      return NextResponse.json(
        { success: false, error: "Could not reach the chain to reconcile your pending claim.", code: "chain_unavailable" },
        { status: 502 },
      );
    }

    if (alreadyClaimed) {
      await esmsOnchainClaimService.markMinted(pending.id);
      return NextResponse.json({
        success: true,
        reconciled: true,
        claim: claimToResponse({ ...pending, status: "minted" }),
      });
    }

    // Not on-chain yet → retry the SAME claim id (contract-safe). Mint to the
    // user's current wallet — the claim id carries no recipient commitment.
    try {
      const txHash = await mintEsmsClaim({
        to: wallet,
        claimId: pending.claimId,
        amounts: {
          spirit: String(pending.amounts.spirit),
          essence: String(pending.amounts.essence),
          matter: String(pending.amounts.matter),
          substance: String(pending.amounts.substance),
        },
      });
      const status = await confirmMint(pending, txHash);
      if (status === "minted") {
        return NextResponse.json({
          success: true,
          retried: true,
          claim: claimToResponse({ ...pending, status: "minted", txHash }),
        });
      }
      if (status === "pending") {
        return NextResponse.json(
          { success: false, code: "mint_pending", retryable: true, claim: claimToResponse({ ...pending, txHash }) },
          { status: 202 },
        );
      }
      // Reverted with claimed() false → the debit never produced on-chain value.
      await tokenEconomy.creditMultipleTokens(
        user.id,
        [
          { tokenType: "Spirit", amount: pending.amounts.spirit },
          { tokenType: "Essence", amount: pending.amounts.essence },
          { tokenType: "Matter", amount: pending.amounts.matter },
          { tokenType: "Substance", amount: pending.amounts.substance },
        ],
        "onchain_claim_refund",
        {
          sourceId: pending.id,
          description: "Refund — on-chain ESMS claim reverted",
          idempotencyKey: `onchain_claim_refund:${pending.id}`,
        },
      );
      await esmsOnchainClaimService.markRefunded(pending.id, "claimMint reverted");
      return NextResponse.json(
        { success: false, error: "The on-chain claim reverted; your tokens were returned.", code: "mint_reverted", refunded: true },
        { status: 502 },
      );
    } catch (err) {
      // The tx may or may not have broadcast — never refund here. Stay pending.
      await esmsOnchainClaimService.recordError(pending.id, err instanceof Error ? err.message : String(err));
      return NextResponse.json(
        { success: false, error: "Claim mint could not be sent — try again.", code: "mint_failed", retryable: true },
        { status: 502 },
      );
    }
  }

  // ── Open a new claim for the full off-chain balance ───────────────────────
  const balances = await tokenEconomy.getBalances(user.id);
  const amounts: EsmsClaimAmounts = {
    spirit: floor4(balances.spirit),
    essence: floor4(balances.essence),
    matter: floor4(balances.matter),
    substance: floor4(balances.substance),
  };
  const total = amounts.spirit + amounts.essence + amounts.matter + amounts.substance;
  if (total <= 0) {
    return NextResponse.json(
      { success: false, error: "No ESMS to claim — earn some first.", code: "nothing_to_claim" },
      { status: 400 },
    );
  }

  const claim = await esmsOnchainClaimService.createPending({
    userId: user.id,
    walletAddress: wallet,
    amounts,
  });
  if (!claim) {
    // Most likely the one-pending-claim-per-user index raced — reconcile next call.
    return NextResponse.json(
      { success: false, error: "A claim is already in progress — try again.", code: "claim_in_progress", retryable: true },
      { status: 409 },
    );
  }

  const debit = await tokenEconomy.debitAllTokens(user.id, amounts, "onchain_claim", {
    sourceId: claim.id,
    description: `Claimed to wallet ${wallet}`,
    idempotencyKey: `onchain_claim:${claim.id}`,
  });
  if (!debit.success) {
    // Nothing was debited (single-statement CTE) — close the claim row.
    await esmsOnchainClaimService.markRefunded(claim.id, `debit failed: ${debit.reason}`);
    const status = debit.reason === "insufficient_funds" ? 409 : 503;
    return NextResponse.json(
      { success: false, error: "Could not reserve your off-chain balance.", code: debit.reason },
      { status },
    );
  }
  await esmsOnchainClaimService.attachDebit(claim.id, debit.transactionGroupId);

  try {
    const txHash = await mintEsmsClaim({
      to: wallet,
      claimId: claim.claimId,
      amounts: {
        spirit: String(amounts.spirit),
        essence: String(amounts.essence),
        matter: String(amounts.matter),
        substance: String(amounts.substance),
      },
    });
    const status = await confirmMint(claim, txHash);
    if (status === "minted") {
      const onchain = await readOnchainOrNull(wallet);
      return NextResponse.json({
        success: true,
        claim: claimToResponse({ ...claim, status: "minted", txHash }),
        offchain: {
          spirit: debit.balances.spirit,
          essence: debit.balances.essence,
          matter: debit.balances.matter,
          substance: debit.balances.substance,
        },
        onchain,
      });
    }
    if (status === "pending") {
      return NextResponse.json(
        { success: false, code: "mint_pending", retryable: true, claim: claimToResponse({ ...claim, txHash }) },
        { status: 202 },
      );
    }
    // Reverted — verify never-claimed, then refund the debit.
    let claimedOnchain = false;
    try {
      claimedOnchain = await readEsmsClaimed(claim.claimId);
    } catch {
      // unreadable — keep pending, reconcile later
    }
    if (!claimedOnchain) {
      await tokenEconomy.creditMultipleTokens(
        user.id,
        [
          { tokenType: "Spirit", amount: amounts.spirit },
          { tokenType: "Essence", amount: amounts.essence },
          { tokenType: "Matter", amount: amounts.matter },
          { tokenType: "Substance", amount: amounts.substance },
        ],
        "onchain_claim_refund",
        {
          sourceId: claim.id,
          description: "Refund — on-chain ESMS claim reverted",
          idempotencyKey: `onchain_claim_refund:${claim.id}`,
        },
      );
      await esmsOnchainClaimService.markRefunded(claim.id, "claimMint reverted");
      return NextResponse.json(
        { success: false, error: "The on-chain claim reverted; your tokens were returned.", code: "mint_reverted", refunded: true },
        { status: 502 },
      );
    }
    await esmsOnchainClaimService.markMinted(claim.id, txHash);
    return NextResponse.json({ success: true, claim: claimToResponse({ ...claim, status: "minted", txHash }) });
  } catch (err) {
    // Send failed — the tx may or may not have broadcast. Never refund blind:
    // the claim stays pending and the next POST reconciles against claimed().
    await esmsOnchainClaimService.recordError(claim.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      {
        success: false,
        error: "Claim mint could not be confirmed — your balance is reserved and the claim will retry.",
        code: "mint_failed",
        retryable: true,
        claim: claimToResponse(claim),
      },
      { status: 502 },
    );
  }
}
