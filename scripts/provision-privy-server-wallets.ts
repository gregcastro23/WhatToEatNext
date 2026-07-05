/**
 * Provision the Privy SERVER wallets that take over ESMS operator custody
 * from the raw env keys (one of which leaked in chat — testnet-only, but the
 * mainnet path requires no raw keys at all).
 *
 * Creates (idempotently, via fixed idempotency keys) two app-owned Ethereum
 * server wallets — MINTER (claimMint) and REDEEMER (redeemFor) — then either
 * grants MINTER_ROLE/BURNER_ROLE on the EsmsToken automatically (when
 * ESMS_ADMIN_PRIVATE_KEY is provided) or prints the exact `cast` commands for
 * whoever holds the admin key.
 *
 * The chain code already PREFERS these wallets: minter.ts/redeemer.ts try
 * PRIVY_MINTER_WALLET_ID / PRIVY_REDEEMER_WALLET_ID before any raw key, so
 * custody flips by setting the printed env vars — no deploy-time code change.
 *
 * SAFE BY DEFAULT: dry-run (creates nothing). Pass --apply to create wallets
 * (and grant roles when the admin key is present).
 *
 * Requires: NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET
 *           (+ PRIVY_AUTHORIZATION_PRIVATE_KEY if the app has an
 *            authorization keypair registered in the Privy Dashboard).
 * Optional: ESMS_CONTRACT_ADDRESS + ESMS_ADMIN_PRIVATE_KEY (+ BASE_SEPOLIA_RPC_URL)
 *           to grant roles in the same run.
 *
 * Usage:
 *   bun scripts/provision-privy-server-wallets.ts            # dry-run
 *   bun scripts/provision-privy-server-wallets.ts --apply    # create + grant
 *
 * @file scripts/provision-privy-server-wallets.ts
 */
import { PrivyClient } from "@privy-io/server-auth";
import { createWalletClient, createPublicClient, http, keccak256, toHex, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const APPLY = process.argv.includes("--apply");

const ROLE_ABI = [
  {
    type: "function",
    name: "grantRole",
    stateMutability: "nonpayable",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

async function main() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    console.error("NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET are required.");
    process.exit(1);
  }
  const authKey = process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY;
  const privy = new PrivyClient(
    appId,
    appSecret,
    authKey ? { walletApi: { authorizationPrivateKey: authKey } } : undefined,
  );

  console.log(`Mode: ${APPLY ? "APPLY" : "dry-run (pass --apply to create)"}\n`);

  const wallets: Array<{ role: "MINTER" | "REDEEMER"; envVar: string; id?: string; address?: string }> = [
    { role: "MINTER", envVar: "PRIVY_MINTER_WALLET_ID" },
    { role: "REDEEMER", envVar: "PRIVY_REDEEMER_WALLET_ID" },
  ];

  for (const w of wallets) {
    if (!APPLY) {
      console.log(`[dry-run] would create app-owned ethereum server wallet for ${w.role}`);
      continue;
    }
    // Fixed idempotency key per role: re-running never creates duplicates.
    const res = await privy.walletApi.createWallet({
      chainType: "ethereum",
      idempotencyKey: `alchm-esms-${w.role.toLowerCase()}-v1`,
    });
    w.id = res.id;
    w.address = res.address;
    console.log(`${w.role} server wallet: id=${res.id} address=${res.address}`);
  }

  if (!APPLY) {
    console.log("\nAfter --apply, set the printed ids in Vercel prod + .env.local, e.g.:");
    console.log("  PRIVY_MINTER_WALLET_ID=<minter id>");
    console.log("  PRIVY_REDEEMER_WALLET_ID=<redeemer id>");
    return;
  }

  console.log("\nEnv to set (Vercel production + .env.local):");
  for (const w of wallets) console.log(`  ${w.envVar}=${w.id}`);

  // ── Role grants on EsmsToken ──────────────────────────────────────────────
  const contract = process.env.ESMS_CONTRACT_ADDRESS as Address | undefined;
  if (!contract) {
    console.log("\nESMS_CONTRACT_ADDRESS unset — skipping role grants.");
    return;
  }
  const MINTER_ROLE = keccak256(toHex("MINTER_ROLE"));
  const BURNER_ROLE = keccak256(toHex("BURNER_ROLE"));
  const grants: Array<{ role: Hex; label: string; account: Address }> = [
    { role: MINTER_ROLE, label: "MINTER_ROLE", account: wallets[0].address as Address },
    { role: BURNER_ROLE, label: "BURNER_ROLE", account: wallets[1].address as Address },
  ];

  const adminKey = process.env.ESMS_ADMIN_PRIVATE_KEY as Hex | undefined;
  const chain = (process.env.NEXT_PUBLIC_ESMS_CHAIN || "base-sepolia") === "base" ? base : baseSepolia;
  const rpc = chain.id === base.id ? process.env.BASE_RPC_URL : process.env.BASE_SEPOLIA_RPC_URL;

  if (!adminKey) {
    console.log("\nESMS_ADMIN_PRIVATE_KEY unset — run these as the contract admin:");
    for (const g of grants) {
      console.log(
        `  cast send ${contract} "grantRole(bytes32,address)" ${g.role} ${g.account} --rpc-url ${rpc ?? chain.rpcUrls.default.http[0]} --private-key <ADMIN_KEY>`,
      );
    }
    return;
  }

  const admin = privateKeyToAccount(adminKey);
  const publicClient = createPublicClient({ chain, transport: http(rpc) });
  const walletClient = createWalletClient({ account: admin, chain, transport: http(rpc) });
  for (const g of grants) {
    const has = await publicClient.readContract({
      address: contract,
      abi: ROLE_ABI,
      functionName: "hasRole",
      args: [g.role, g.account],
    });
    if (has) {
      console.log(`${g.label} already granted to ${g.account}`);
      continue;
    }
    const tx = await walletClient.writeContract({
      address: contract,
      abi: ROLE_ABI,
      functionName: "grantRole",
      args: [g.role, g.account],
    });
    console.log(`${g.label} → ${g.account} tx=${tx}`);
    await publicClient.waitForTransactionReceipt({ hash: tx, timeout: 60_000 });
  }
  console.log("\nDone. Custody flips once the PRIVY_*_WALLET_ID env vars are deployed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
