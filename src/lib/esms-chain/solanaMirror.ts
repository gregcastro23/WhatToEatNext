/**
 * ESMS SPL mirror config — the Solana-side mints of the four tokens.
 *
 * WTEN's live chain is Base (soulbound ERC-1155); the SPL mints are deployed
 * from the sibling AlchmAgentsSolana project. This module exists so WTEN can
 * surface them HONESTLY: per the cryptoPromo doctrine ("never advertise a
 * crypto rail that isn't actually live"), everything here is presence-gated —
 * the mirror renders only when the master flag is literally "true" AND all
 * four mint addresses parse as base58. Unconfigured means absent, never a
 * placeholder address. (The sibling prototype rendered hardcoded fallback
 * mints as live, copyable, explorer-linked quotes — the defect class this
 * module makes inexpressible in WTEN.)
 *
 * NEXT_PUBLIC_* reads are literal property accesses so Next.js can inline
 * them client-side; a dynamic `process.env[key]` lookup would be undefined
 * in the browser.
 */

/** Base58 (no 0/O/I/l), 32–44 chars — the shape of a Solana address. */
const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export type SplCoinKey = "spirit" | "essence" | "matter" | "substance";

function validated(value: string | undefined): string | undefined {
  return value && BASE58_ADDRESS.test(value) ? value : undefined;
}

export function esmsSplMintAddress(coin: SplCoinKey): string | undefined {
  switch (coin) {
    case "spirit":
      return validated(process.env.NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT);
    case "essence":
      return validated(process.env.NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE);
    case "matter":
      return validated(process.env.NEXT_PUBLIC_ESMS_SPL_MINT_MATTER);
    case "substance":
      return validated(process.env.NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE);
  }
}

/** Testnet-safe default, matching the chain-selection convention. */
export function esmsSplCluster(): "devnet" | "mainnet-beta" {
  return process.env.NEXT_PUBLIC_ESMS_SPL_CLUSTER === "mainnet-beta"
    ? "mainnet-beta"
    : "devnet";
}

/**
 * Master gate: literal "true" flag AND all four mints valid. Any partial
 * configuration keeps the mirror off — four tokens with three links would
 * read as one token failing.
 */
export function esmsSplMirrorEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED === "true" &&
    Boolean(esmsSplMintAddress("spirit")) &&
    Boolean(esmsSplMintAddress("essence")) &&
    Boolean(esmsSplMintAddress("matter")) &&
    Boolean(esmsSplMintAddress("substance"))
  );
}

export function esmsSplExplorerUrl(mintAddress: string): string {
  const cluster = esmsSplCluster();
  const suffix = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/address/${mintAddress}${suffix}`;
}
