import { NextResponse } from "next/server";
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import { applyPersonalizedPricing, getPersonalizedPricingContext } from "@/lib/economy/livePricing";
import { getCurrentSwapRates } from "@/lib/economy/swapRates";
import { getPrivyWallet } from "@/lib/privy/server";
import { buildMetadata, computeCommitments } from "@/lib/recipe-nft/content";
import { recipeNftEnabled } from "@/lib/recipe-nft/contract";
import { baseMintCost, elementToCoin, redistributeTowardDominant } from "@/lib/recipe-nft/cost";
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
import { generateRecipeImage } from "@/lib/recipe-nft/image";
import { parseRecipeForMint } from "@/lib/recipe-nft/mintableRecipe";
import { defaultRecipient, mintRecipeOnChain } from "@/lib/recipe-nft/minter";
import { recipeNftMintService } from "@/services/recipeNftMintService";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";
import { getDominantElementFromPositions } from "@/utils/astrology/signElement";
import { getSelfBaseUrl } from "@/utils/urlUtils";
import type { NextRequest } from "next/server";
import type { Address } from "viem";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** A 20-byte EVM address (case-insensitive). */
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * Mint a recipe as an NFT — backend-sponsored. The user spends ESMS (all four
 * coins, equal to the recipe's quantity-weighted fingerprint, priced live by
 * sky × chart; premium members get chart-weighted redistribution). A sponsor
 * wallet then mints the token on their behalf (gas-free) once the protocol is
 * deployed; until then the off-chain debit + ledger row stand as the receipt.
 *
 * The cost is computed from the SERVER-validated recipe — client-sent ESMS is
 * never trusted.
 */
export async function POST(request: NextRequest) {
  const access = await gateDemoOrAuth(request, { dailyDemoQuota: 0, feature: "mint recipe nft" });
  if (access.mode !== "auth") {
    if (access.mode === "denied") return access.blocked;
    return NextResponse.json({ error: "Sign in to mint a recipe NFT." }, { status: 401 });
  }
  const userId = access.userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRecipeForMint((body as { recipe?: unknown })?.recipe);
  if (!parsed.ok || !parsed.recipe) {
    return NextResponse.json({ error: "Invalid recipe payload.", detail: parsed.error }, { status: 400 });
  }
  const recipe = parsed.recipe;

  // Authoritative fingerprint + on-chain commitments (server-computed).
  const fingerprint = computeRecipeFingerprint(recipe);
  const commitments = computeCommitments(recipe, fingerprint);

  // One token per unique recipe content (mirrors on-chain ContentAlreadyRegistered).
  const existing = await recipeNftMintService.findByContentHash(commitments.contentHash);
  if (existing) {
    return NextResponse.json(
      { error: "already_minted", mintId: existing.id, status: existing.status },
      { status: 409 },
    );
  }

  // Cost = recipe ESMS × live (sky × chart). Premium → chart-weighted redistribution.
  const { userDatabase } = await import("@/services/userDatabaseService");
  const dbUser = await userDatabase.getUserById(userId);
  const natalPositions = getCapitalizedNatalPositions(dbUser?.profile?.natalChart);
  const pricing = await getPersonalizedPricingContext(natalPositions);
  let cost = applyPersonalizedPricing(baseMintCost(fingerprint), pricing);

  const sub = await subscriptionService.getUserSubscription(userId);
  const isPremium = sub?.tier === "premium";
  let weightedToCoin: string | null = null;
  if (isPremium && natalPositions && Object.keys(natalPositions).length > 0) {
    const coin = elementToCoin(getDominantElementFromPositions(natalPositions));
    cost = redistributeTowardDominant(cost, coin, getCurrentSwapRates());
    weightedToCoin = coin;
  }

  // Atomic four-coin debit.
  const purchase = await tokenEconomy.purchaseShopItem(userId, "recipe-nft-mint", {
    overrideCosts: cost,
    descriptionSuffix: `Recipe NFT: ${recipe.title}`,
  });
  if (!purchase.success) {
    if (purchase.reason === "insufficient_funds") {
      return NextResponse.json(
        { error: "insufficient_funds", cost, recipeAsharp: fingerprint.aSharp },
        { status: 402 },
      );
    }
    if (purchase.reason === "item_not_found") {
      // The recipe-nft-mint shop row is absent — migration 55 hasn't been
      // applied to this environment. Surface a clear, diagnosable reason.
      return NextResponse.json(
        { error: "mint_unavailable", detail: "Recipe minting isn't configured on this server yet." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: purchase.reason }, { status: 503 });
  }

  // Pin display metadata: generate the hero image (live nanobanana, cached) and
  // build absolute content/metadata URIs served from our own infra (no IPFS).
  const imageUrl =
    (await generateRecipeImage({
      id: recipe.id,
      title: recipe.title,
      description: recipe.short_description,
      cuisine: recipe.cuisine,
      elemental: fingerprint.elemental,
    })) ?? "";
  const base = getSelfBaseUrl();
  const contentURI = `${base}/api/recipes/nft/content/${commitments.contentHash}`;
  const metadataURI = `${base}/api/recipes/nft/metadata/${commitments.contentHash}`;
  const metadata = buildMetadata(recipe, fingerprint, { imageUrl, externalUrl: `${base}/recipe-builder` });

  // Recipient = the user's own linked Base wallet when known, else the rights
  // holder (custody, matching the gas-free claim-mint model). Resolved purely
  // server-side from the authenticated user — a client-sent address is never
  // trusted. The live Privy lookup only runs once on-chain minting is enabled,
  // since the recipient is otherwise unused (pending_chain).
  let recipient: Address = defaultRecipient();
  const storedWallet = dbUser?.walletAddress;
  if (storedWallet && EVM_ADDRESS.test(storedWallet)) {
    recipient = storedWallet as Address;
  } else if (dbUser?.privyDid && recipeNftEnabled()) {
    const liveWallet = await getPrivyWallet(dbUser.privyDid);
    if (liveWallet && EVM_ADDRESS.test(liveWallet)) recipient = liveWallet as Address;
  }

  // Backend-sponsored on-chain mint (gated → pending_chain until deployed).
  const chainResult = await mintRecipeOnChain({
    recipient,
    commitments,
    engineVersion: fingerprint.engineVersion,
    contentURI,
    metadataURI,
  });

  if (chainResult.status === "failed") {
    // Refund the debited tokens immediately since the mint failed on-chain
    await tokenEconomy.creditMultipleTokens(
      userId,
      [
        { tokenType: "Spirit", amount: cost.spirit },
        { tokenType: "Essence", amount: cost.essence },
        { tokenType: "Matter", amount: cost.matter },
        { tokenType: "Substance", amount: cost.substance },
      ],
      "mint_refund",
      {
        sourceId: purchase.transactionGroupId,
        description: `Refund — mint failed on-chain: ${recipe.title}`,
        idempotencyKey: `mint_refund:${purchase.transactionGroupId}`,
      },
    );

    return NextResponse.json(
      {
        error: "mint_failed",
        reason: chainResult.reason,
        refunded: true,
      },
      { status: 500 },
    );
  }

  const ledgerRow = {
    userId,
    recipeId: recipe.id,
    title: recipe.title,
    provenance: {
      creator: userId,
      source: parsed.complete ? ("generated" as const) : ("scan" as const),
      parentRecipeId: null,
      createdAt: new Date().toISOString(),
    },
    commitments,
    engineVersion: fingerprint.engineVersion,
    aggregationMode: fingerprint.aggregationMode,
    aSharp: fingerprint.aSharp,
    cost,
    transactionGroupId: purchase.transactionGroupId,
    chainResult,
    metadataUri: metadataURI,
    recipeJson: recipe,
    imageUrl,
  };
  let record = await recipeNftMintService.recordMint(ledgerRow);

  // A real on-chain token was minted but the ledger write failed: the user HOLDS
  // the asset, so we must never refund. Retry the write once to recover.
  const mintedOnChain = chainResult.status === "minted" && !!chainResult.txHash;
  if (!record && mintedOnChain) {
    record = await recipeNftMintService.recordMint(ledgerRow);
    if (!record) {
      // Surface the tx loudly so it can be reconciled into the ledger — refunding
      // here would hand the user both the NFT and their ESMS back.
      console.error(
        "recipe-nft mint: on-chain token minted but ledger write failed — needs reconciliation",
        {
          userId,
          contentHash: commitments.contentHash,
          txHash: chainResult.txHash,
          tokenId: chainResult.tokenId ?? null,
          transactionGroupId: purchase.transactionGroupId,
        },
      );
      return NextResponse.json(
        {
          success: true,
          reconcile: true,
          status: chainResult.status,
          contentHash: commitments.contentHash,
          chain: chainResult.chain ?? null,
          txHash: chainResult.txHash,
          tokenId: chainResult.tokenId ?? null,
          cost,
        },
        { status: 200 },
      );
    }
  }

  // No row written AND no on-chain token → the user got nothing: either a
  // concurrent mint of this exact content won the content_hash race, or the
  // write failed before any chain mint. Refund the debit (idempotent per debit)
  // to keep the off-chain spend exactly-once.
  if (!record) {
    await tokenEconomy.creditMultipleTokens(
      userId,
      [
        { tokenType: "Spirit", amount: cost.spirit },
        { tokenType: "Essence", amount: cost.essence },
        { tokenType: "Matter", amount: cost.matter },
        { tokenType: "Substance", amount: cost.substance },
      ],
      "mint_refund",
      {
        sourceId: purchase.transactionGroupId,
        description: `Refund — mint not recorded: ${recipe.title}`,
        // Key by the debit, NOT the content hash: token_transactions.idempotency_key
        // is GLOBALLY unique, so multiple racers losing the same content_hash would
        // share a content-keyed key and only the first would be refunded. The
        // transaction group id is unique per debit, so every loser is refunded once.
        idempotencyKey: `mint_refund:${purchase.transactionGroupId}`,
      },
    );
    const dupe = await recipeNftMintService.findByContentHash(commitments.contentHash);
    if (dupe) {
      return NextResponse.json(
        { error: "already_minted", mintId: dupe.id, status: dupe.status, refunded: true },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "mint_record_failed", refunded: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    mintId: record.id,
    status: chainResult.status,
    pending: chainResult.status === "pending_chain",
    reason: chainResult.reason,
    cost,
    weightedToCoin,
    contentHash: commitments.contentHash,
    metadataUri: metadataURI,
    imageUrl,
    metadataAttributes: metadata.attributes,
    balances: purchase.balances,
    chain: chainResult.chain ?? null,
    txHash: chainResult.txHash ?? null,
  });
}
