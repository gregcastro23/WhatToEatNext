/**
 * Backend-sponsored recipe-NFT minting — SERVER ONLY.
 *
 * A server wallet (the rights holder, or an operator authorized via
 * AlchmRightsRegistry.setOperator) mints the NFT to the user after their
 * off-chain ESMS debit settles — so the user pays no gas and needs no wallet
 * interaction. Mirrors the ESMS claim-mint custody model.
 *
 * Until the protocol is deployed and `recipeNftEnabled()` is true, this returns
 * a `pending_chain` result and the off-chain ledger row stands as the receipt;
 * a backfill can mint pending rows once addresses are configured.
 */

import { createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  RECIPE_RELATION,
  RECIPE_ROYALTY_BPS,
  RIGHTS_HOLDER,
  alchmRightsId,
  recipeNftChain,
  recipeNftEnabled,
  recipeNftPublicClient,
  recipeRegistryAbi,
  recipeRegistryAddress,
  rightsRegistryAbi,
  rightsRegistryAddress,
} from "./contract";
import type { RecipeNftCommitments } from "./content";

export type MintStatus = "pending_chain" | "minted" | "failed";

export interface MintOnChainResult {
  status: MintStatus;
  chain?: string;
  tokenId?: string;
  txHash?: Hex;
  reason?: string;
}

export interface MintOnChainInput {
  recipient: Address;
  commitments: RecipeNftCommitments;
  engineVersion: number;
  contentURI: string;
  metadataURI: string;
}

function minterAccount() {
  const pk = process.env.RECIPE_MINTER_PRIVATE_KEY ?? process.env.MINTER_PRIVATE_KEY;
  if (!pk || !pk.startsWith("0x")) return null;
  return privateKeyToAccount(pk as Hex);
}

/**
 * Mint the recipe on-chain via the sponsor wallet. Heavily gated: returns
 * `pending_chain` (never throws) whenever the protocol isn't fully wired, so the
 * mint route can always settle the off-chain side and record an intent.
 */
export async function mintRecipeOnChain(input: MintOnChainInput): Promise<MintOnChainResult> {
  if (!recipeNftEnabled()) {
    return { status: "pending_chain", reason: "protocol-not-deployed" };
  }
  const registry = recipeRegistryAddress();
  const rights = rightsRegistryAddress();
  const rightsId = alchmRightsId();
  const account = minterAccount();
  if (!registry || !rights || !rightsId) {
    return { status: "pending_chain", reason: "addresses-missing" };
  }
  if (!account) {
    return { status: "pending_chain", reason: "sponsor-wallet-unconfigured" };
  }

  const chain = recipeNftChain();
  try {
    const publicClient = recipeNftPublicClient();

    // The mint's licenseHash MUST equal the anchor's, or the contract reverts.
    const licenseHash = (await publicClient.readContract({
      address: rights,
      abi: rightsRegistryAbi,
      functionName: "licenseHashOf",
      args: [rightsId],
    }));

    const walletClient = createWalletClient({ account, chain, transport: http() });

    const txHash = await walletClient.writeContract({
      address: registry,
      abi: recipeRegistryAbi,
      functionName: "mintRecipe",
      args: [
        {
          recipient: input.recipient,
          rightsId,
          contentHash: input.commitments.contentHash,
          computationHash: input.commitments.computationHash,
          ingredientCatalogRoot: input.commitments.ingredientCatalogRoot,
          licenseHash,
          parentTokenId: 0n,
          engineVersion: BigInt(input.engineVersion),
          relation: RECIPE_RELATION.Original,
          royaltyBps: BigInt(RECIPE_ROYALTY_BPS),
          contentURI: input.contentURI,
          metadataURI: input.metadataURI,
        },
      ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return { status: "failed", chain: chain.name, txHash, reason: "tx-reverted" };
    }
    // tokenId is emitted in the RecipeMinted event; the backfill/decoder fills it
    // from logs. We record the tx now and resolve the id asynchronously.
    return { status: "minted", chain: chain.name, txHash };
  } catch (err) {
    return {
      status: "failed",
      chain: chain.name,
      reason: err instanceof Error ? err.message : "mint-error",
    };
  }
}

/** The wallet that receives the minted token (the configured rights holder). */
export function defaultRecipient(): Address {
  return RIGHTS_HOLDER;
}
