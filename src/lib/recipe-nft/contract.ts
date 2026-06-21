/**
 * Recipe-NFT protocol wiring (RecipeRegistry + AlchmRightsRegistry on Base).
 *
 * Addresses are env-driven and the feature is gated OFF until the protocol is
 * deployed to Base Sepolia and the rights anchor (U.S. Copyright VA 2-434-962)
 * is registered — mirroring the on-chain ESMS rollout. Until then the UI shows
 * the mint mechanic in a "wiring after deploy" state.
 */

import { createPublicClient, http, type Address, type Hex } from "viem";
import { base, baseSepolia } from "viem/chains";

/** Genesis rights holder + first recipe recipient (chosen during design). */
export const RIGHTS_HOLDER: Address = "0x553C2a3f193d5E7F41cF50cEB32069dbc6951931";

/** ERC-2981 creator royalty: 5% (contract cap is 10% = 1000 bps). */
export const RECIPE_ROYALTY_BPS = 500;

/** The custom license the first recipes mint under. */
export const ALCHM_RECIPE_LICENSE = {
  name: "Alchm Recipe License",
  version: "1.0",
  /** Public, content-addressed manifest URI — set once the manifest is pinned. */
  uri: process.env.NEXT_PUBLIC_ALCHM_LICENSE_URI ?? "",
} as const;

/** Genesis copyright registration the recipe NFTs anchor to. */
export const ALCHM_REGISTRATION = {
  title: "Alchm Planetary-Food Algorithm",
  authority: "United States Copyright Office",
  registrationNumber: "VA 2-434-962",
} as const;

/** RecipeRegistry.Relation enum. */
export const RECIPE_RELATION = { Original: 0, Revision: 1, Fork: 2 } as const;

export const recipeRegistryAbi = [
  {
    type: "function",
    name: "mintRecipe",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "input",
        type: "tuple",
        components: [
          { name: "recipient", type: "address" },
          { name: "rightsId", type: "bytes32" },
          { name: "contentHash", type: "bytes32" },
          { name: "computationHash", type: "bytes32" },
          { name: "ingredientCatalogRoot", type: "bytes32" },
          { name: "licenseHash", type: "bytes32" },
          { name: "parentTokenId", type: "uint256" },
          { name: "engineVersion", type: "uint64" },
          { name: "relation", type: "uint8" },
          { name: "royaltyBps", type: "uint96" },
          { name: "contentURI", type: "string" },
          { name: "metadataURI", type: "string" },
        ],
      },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenForContentHash",
    stateMutability: "view",
    inputs: [{ name: "contentHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const rightsRegistryAbi = [
  {
    type: "function",
    name: "isAuthorized",
    stateMutability: "view",
    inputs: [
      { name: "anchorId", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "licenseHashOf",
    stateMutability: "view",
    inputs: [{ name: "anchorId", type: "bytes32" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "exists",
    stateMutability: "view",
    inputs: [{ name: "anchorId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function recipeNftChain() {
  return (process.env.NEXT_PUBLIC_RECIPE_NFT_CHAIN ?? "base-sepolia") === "base"
    ? base
    : baseSepolia;
}

export function recipeRegistryAddress(): Address | undefined {
  const a = process.env.NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS;
  return a && a.startsWith("0x") ? (a as Address) : undefined;
}

export function rightsRegistryAddress(): Address | undefined {
  const a = process.env.NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS;
  return a && a.startsWith("0x") ? (a as Address) : undefined;
}

/** The genesis rights anchor id, produced at deploy time. */
export function alchmRightsId(): Hex | undefined {
  const id = process.env.NEXT_PUBLIC_ALCHM_RIGHTS_ID;
  return id && id.startsWith("0x") ? (id as Hex) : undefined;
}

/**
 * True only when on-chain minting is fully wired: explicitly enabled AND both
 * registry addresses AND the rights id are configured. Off → the UI advertises
 * the mechanic but routes the actual mint to "coming soon".
 */
export function recipeNftEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_RECIPE_NFT_ENABLED === "true" &&
    !!recipeRegistryAddress() &&
    !!rightsRegistryAddress() &&
    !!alchmRightsId()
  );
}

function recipeNftRpcUrl(): string | undefined {
  return recipeNftChain().id === base.id
    ? process.env.BASE_RPC_URL
    : process.env.BASE_SEPOLIA_RPC_URL;
}

export function recipeNftPublicClient() {
  const chain = recipeNftChain();
  return createPublicClient({ chain, transport: http(recipeNftRpcUrl()) });
}
