import { NextResponse } from "next/server";
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import { applyPersonalizedPricing, getPersonalizedPricingContext } from "@/lib/economy/livePricing";
import { getCurrentSwapRates } from "@/lib/economy/swapRates";
import { buildMetadata, computeCommitments } from "@/lib/recipe-nft/content";
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  // Backend-sponsored on-chain mint (gated → pending_chain until deployed).
  const chainResult = await mintRecipeOnChain({
    recipient: defaultRecipient(),
    commitments,
    engineVersion: fingerprint.engineVersion,
    contentURI,
    metadataURI,
  });

  const record = await recipeNftMintService.recordMint({
    userId,
    recipeId: recipe.id,
    title: recipe.title,
    provenance: {
      creator: userId,
      source: parsed.complete ? "generated" : "scan",
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
  });

  return NextResponse.json({
    success: true,
    mintId: record?.id ?? null,
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
