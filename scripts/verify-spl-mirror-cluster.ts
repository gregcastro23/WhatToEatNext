#!/usr/bin/env bun
/**
 * Standalone SPL Token-2022 Mirror Cluster Prover
 *
 * Verifies on-chain Token-2022 mint accounts and all 5 required extensions:
 * 1. NonTransferable
 * 2. PermanentDelegate
 * 3. MetadataPointer
 * 4. TokenMetadata
 * 5. PermissionedBurn
 *
 * Usage:
 *   bun scripts/verify-spl-mirror-cluster.ts --cluster devnet
 *   bun scripts/verify-spl-mirror-cluster.ts --cluster mainnet-beta --rpc https://...
 */

export const PROGRAM_ID = "5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD";
export const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export const PROGRAM_AUTHORITY_PDA = "4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku";

export const DEVNET_MINTS = {
  spirit: "K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ",
  essence: "3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf",
  matter: "7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4",
  substance: "6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa",
} as const;

interface ExtensionInfo {
  extension: string;
  state?: Record<string, unknown>;
}

interface ParsedMintInfo {
  decimals: number;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  supply: string;
  isInitialized: boolean;
  extensions?: ExtensionInfo[];
}

interface ParsedAccountResponse {
  jsonrpc: string;
  result?: {
    context: {
      slot: number;
    };
    value: {
      owner: string;
      space: number;
      data: {
        program: string;
        parsed: {
          type: string;
          info: ParsedMintInfo;
        };
      };
    } | null;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface VerificationResult {
  coin: string;
  mint: string;
  ownerOk: boolean;
  decimalsOk: boolean;
  freezeNull: boolean;
  mintAuthorityOk: boolean;
  hasNonTransferable: boolean;
  hasPermanentDelegate: boolean;
  hasMetadataPointer: boolean;
  hasTokenMetadata: boolean;
  hasPermissionedBurn: boolean;
  allPassed: boolean;
  error?: string;
}

export async function verifyMintAccount(
  rpcUrl: string,
  coin: string,
  mintAddress: string,
): Promise<{ slot: number; result: VerificationResult }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [mintAddress, { encoding: "jsonParsed" }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} from RPC endpoint: ${rpcUrl}`);
    }

    const payload = (await res.json()) as ParsedAccountResponse;

    if (payload.error) {
      throw new Error(`Solana RPC Error (${payload.error.code}): ${payload.error.message}`);
    }

    const slot = payload.result?.context.slot ?? 0;
    const account = payload.result?.value;

    if (!account) {
      return {
        slot,
        result: {
          coin,
          mint: mintAddress,
          ownerOk: false,
          decimalsOk: false,
          freezeNull: false,
          mintAuthorityOk: false,
          hasNonTransferable: false,
          hasPermanentDelegate: false,
          hasMetadataPointer: false,
          hasTokenMetadata: false,
          hasPermissionedBurn: false,
          allPassed: false,
          error: "Account not found on cluster",
        },
      };
    }

    const ownerOk = account.owner === TOKEN_2022_PROGRAM_ID;
    const info = account.data.parsed?.info;

    if (!info) {
      return {
        slot,
        result: {
          coin,
          mint: mintAddress,
          ownerOk,
          decimalsOk: false,
          freezeNull: false,
          mintAuthorityOk: false,
          hasNonTransferable: false,
          hasPermanentDelegate: false,
          hasMetadataPointer: false,
          hasTokenMetadata: false,
          hasPermissionedBurn: false,
          allPassed: false,
          error: "Account is not a parsed Token-2022 mint",
        },
      };
    }

    const decimalsOk = info.decimals === 4;
    const freezeNull = info.freezeAuthority === null;
    const mintAuthorityOk = info.mintAuthority === PROGRAM_AUTHORITY_PDA;

    const extensionNames = (info.extensions ?? []).map((e) => e.extension);
    const hasNonTransferable = extensionNames.includes("nonTransferable");
    const hasPermanentDelegate = extensionNames.includes("permanentDelegate");
    const hasMetadataPointer = extensionNames.includes("metadataPointer");
    const hasTokenMetadata = extensionNames.includes("tokenMetadata");
    const hasPermissionedBurn =
      extensionNames.includes("permissionedBurnConfig") ||
      extensionNames.includes("permissionedBurn");

    const allPassed =
      ownerOk &&
      decimalsOk &&
      freezeNull &&
      mintAuthorityOk &&
      hasNonTransferable &&
      hasPermanentDelegate &&
      hasMetadataPointer &&
      hasTokenMetadata &&
      hasPermissionedBurn;

    return {
      slot,
      result: {
        coin,
        mint: mintAddress,
        ownerOk,
        decimalsOk,
        freezeNull,
        mintAuthorityOk,
        hasNonTransferable,
        hasPermanentDelegate,
        hasMetadataPointer,
        hasTokenMetadata,
        hasPermissionedBurn,
        allPassed,
      },
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`RPC connection failed for ${mintAddress}: ${message}`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let cluster = "devnet";
  let customRpc: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cluster" && args[i + 1]) {
      cluster = args[i + 1];
      i++;
    } else if (args[i] === "--rpc" && args[i + 1]) {
      customRpc = args[i + 1];
      i++;
    }
  }

  const rpcUrl =
    customRpc ??
    (cluster === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com");

  console.log(`\n🪐 SPL Token-2022 Mirror Cluster Prover`);
  console.log(`Cluster:  ${cluster}`);
  console.log(`RPC:      ${rpcUrl}`);
  console.log(`Program:  ${PROGRAM_ID}`);
  console.log(`Timestamp:${new Date().toISOString()}\n`);

  const mints = DEVNET_MINTS;
  const entries = Object.entries(mints);
  const results: VerificationResult[] = [];
  let latestSlot = 0;

  try {
    for (const [coin, mintAddress] of entries) {
      process.stdout.write(`Measuring ${coin.toUpperCase().padEnd(10)} [${mintAddress}] ... `);
      const { slot, result } = await verifyMintAccount(rpcUrl, coin, mintAddress);
      latestSlot = Math.max(latestSlot, slot);
      results.push(result);
      if (result.allPassed) {
        console.log(`✅ PASS (Slot ${slot})`);
      } else {
        console.log(`❌ FAIL: ${result.error ?? "Extension mismatch"}`);
      }
    }
  } catch (err) {
    console.error(`\n❌ Verification aborted due to network/RPC failure:`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  console.log("\n### On-Chain Extension Verification Table (Slot: " + latestSlot + ")\n");
  console.log(
    "| Token | Decimals | Freeze | Authority | NonTransfer | PermDelegate | MetaPointer | TokenMeta | PermBurn | Status |",
  );
  console.log(
    "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |",
  );

  for (const r of results) {
    const mark = (ok: boolean) => (ok ? "✅" : "❌");
    console.log(
      `| ${r.coin.toUpperCase().padEnd(9)} | ${mark(r.decimalsOk)} (4) | ${mark(r.freezeNull)} (null) | ${mark(r.mintAuthorityOk)} | ${mark(r.hasNonTransferable)} | ${mark(r.hasPermanentDelegate)} | ${mark(r.hasMetadataPointer)} | ${mark(r.hasTokenMetadata)} | ${mark(r.hasPermissionedBurn)} | ${r.allPassed ? "**VERIFIED**" : "**FAILED**"} |`,
    );
  }

  const passedCount = results.filter((r) => r.allPassed).length;
  console.log(`\nSummary: ${passedCount}/${results.length} Token-2022 mint accounts verified.`);

  if (passedCount < results.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (import.meta.main) {
  void main();
}
