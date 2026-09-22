/**
 * Chain progress — Solana devnet → mainnet, and the Base Sepolia ESMS rail.
 * Server-only, read-only.
 *
 * SOLANA. The program, mints, AMM pools, and Squads multisig live in the
 * sibling repo alchm-agents-solana, which records every deployment in
 * `deployments/*.json`. Those manifests are the address book — read from
 * GitHub, never copied into this repo — and every address in them is then
 * checked against the chain itself:
 *
 *   - devnet: genesis match, program executable + last deploy slot + upgrade
 *     authority (ProgramData), ProgramConfig decoded (admin / attestor /
 *     pauser / pause flags), live SPL supply per mint, AMM pool reserves
 *     decoded, multisig/vault existence, deployer SOL, recent program txs.
 *   - mainnet-beta: does the program exist yet? do the mints? — the
 *     migration's progress measured on-chain rather than from a status field.
 *   - the ASOL app's own /api/solana/health (sync/bridge queues, worker
 *     heartbeats) when INTERNAL_API_SECRET is shared between the apps.
 *
 * Account layouts are the Anchor structs in
 * programs/asol_program/src/state{.rs,/amm.rs} (8-byte discriminator, borsh).
 *
 * BASE. ESMS (ERC-1155) and the recipe registries on Base Sepolia: latest
 * block, operator wallet gas (addresses derived from the configured keys —
 * the keys themselves never leave this function), the on-chain claim ledger,
 * and recipe-NFT mints.
 *
 * @file src/services/admin/chainProgressService.ts
 */

import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  commitTitle,
  GithubCommitSchema,
  githubGet,
  GithubPullSchema,
  githubRawFile,
  SOLANA_REPO,
} from "@/services/admin/githubClient";
import { isMissingRelation } from "@/services/admin/trafficAnalyticsService";

const RPC_TIMEOUT_MS = 7_000;
const DEVNET_RPC = process.env.SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com";
const MAINNET_RPC = process.env.SOLANA_MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const ASOL_BASE_URL =
  process.env.AGENTS_BASE_URL ?? process.env.NEXT_PUBLIC_AGENTS_URL ?? "https://agents.alchm.kitchen";

/** Deployer/fee-payer below this many SOL is flagged. Devnet airdrops are free, mainnet is not. */
const LOW_SOL_THRESHOLD = 1;
/** Operator EOA below this many ETH is flagged — a mint costs ~0.00002–0.0001 on Base Sepolia. */
const LOW_ETH_THRESHOLD = 0.005;

// ─── base58 (for decoded pubkeys) ───────────────────────────────────────────

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i += 1) {
    let carry = bytes[i] ?? 0;
    for (let j = 0; j < digits.length; j += 1) {
      carry += (digits[j] ?? 0) << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => B58[d]).join("");
}

// ─── Anchor account decoders ────────────────────────────────────────────────

export interface DecodedPool {
  version: number;
  poolId: number;
  elementA: number;
  elementB: number;
  feeBps: number;
  reserveA: string;
  reserveB: string;
  totalShares: string;
  bootstrapped: boolean;
  paused: boolean;
}

/** ConstellationPool: disc(8) u8 u16 u8 u8 u16 u64 u64 u64 bool bool u8 = 42 bytes. */
export function decodeConstellationPool(data: Buffer): DecodedPool | null {
  if (data.length < 42) return null;
  return {
    version: data.readUInt8(8),
    poolId: data.readUInt16LE(9),
    elementA: data.readUInt8(11),
    elementB: data.readUInt8(12),
    feeBps: data.readUInt16LE(13),
    reserveA: data.readBigUInt64LE(15).toString(),
    reserveB: data.readBigUInt64LE(23).toString(),
    totalShares: data.readBigUInt64LE(31).toString(),
    bootstrapped: data.readUInt8(39) === 1,
    paused: data.readUInt8(40) === 1,
  };
}

export interface DecodedConfig {
  version: number;
  admin: string;
  attestor: string;
  pauser: string;
  pauseClaims: boolean;
  pauseRedemptions: boolean;
}

/** ProgramConfig: disc(8) u8 pubkey×3 [u8;32] bool bool u8 = 140 bytes. */
export function decodeProgramConfig(data: Buffer): DecodedConfig | null {
  if (data.length < 140) return null;
  return {
    version: data.readUInt8(8),
    admin: base58Encode(data.subarray(9, 41)),
    attestor: base58Encode(data.subarray(41, 73)),
    pauser: base58Encode(data.subarray(73, 105)),
    pauseClaims: data.readUInt8(137) === 1,
    pauseRedemptions: data.readUInt8(138) === 1,
  };
}

/** BPF upgradeable ProgramData header: u32 tag(=3) u64 slot Option<Pubkey>. */
export function decodeProgramDataHeader(
  data: Buffer,
): { lastDeploySlot: number; upgradeAuthority: string | null } | null {
  if (data.length < 13 || data.readUInt32LE(0) !== 3) return null;
  const slot = Number(data.readBigUInt64LE(4));
  const hasAuthority = data.readUInt8(12) === 1 && data.length >= 45;
  return {
    lastDeploySlot: slot,
    upgradeAuthority: hasAuthority ? base58Encode(data.subarray(13, 45)) : null,
  };
}

// ─── Solana JSON-RPC ────────────────────────────────────────────────────────

const RpcEnvelopeSchema = z
  .object({
    result: z.unknown().optional(),
    error: z.object({ message: z.string() }).passthrough().optional(),
  })
  .passthrough();

async function rpc<T>(url: string, method: string, params: unknown[], schema: z.ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
    const envelope = await readJson(res, { parse: (raw) => RpcEnvelopeSchema.parse(raw) });
    if (envelope.error) throw new Error(`${method}: ${envelope.error.message}`);
    return schema.parse(envelope.result);
  } finally {
    clearTimeout(timer);
  }
}

const AccountInfoSchema = z
  .object({
    value: z
      .object({
        data: z.tuple([z.string(), z.string()]),
        executable: z.boolean(),
        lamports: z.number(),
        owner: z.string(),
      })
      .passthrough()
      .nullable(),
  })
  .passthrough();

interface AccountRead {
  exists: boolean;
  owner: string | null;
  lamports: number;
  executable: boolean;
  data: Buffer;
}

async function getAccount(
  url: string,
  address: string,
  dataSlice?: { offset: number; length: number },
): Promise<AccountRead> {
  const res = await rpc(
    url,
    "getAccountInfo",
    [address, { encoding: "base64", commitment: "confirmed", ...(dataSlice ? { dataSlice } : {}) }],
    AccountInfoSchema,
  );
  if (!res.value) return { exists: false, owner: null, lamports: 0, executable: false, data: Buffer.alloc(0) };
  return {
    exists: true,
    owner: res.value.owner,
    lamports: res.value.lamports,
    executable: res.value.executable,
    data: Buffer.from(res.value.data[0], "base64"),
  };
}

const MultipleAccountsSchema = z
  .object({
    value: z.array(
      z.object({ owner: z.string(), executable: z.boolean(), lamports: z.number() }).passthrough().nullable(),
    ),
  })
  .passthrough();

const TokenSupplySchema = z
  .object({
    value: z.object({ amount: z.string(), decimals: z.number(), uiAmountString: z.string() }).passthrough(),
  })
  .passthrough();

const LargestAccountsSchema = z
  .object({ value: z.array(z.object({ amount: z.string() }).passthrough()) })
  .passthrough();

const BalanceSchema = z.object({ value: z.number() }).passthrough();

const SignaturesSchema = z.array(
  z
    .object({
      signature: z.string(),
      slot: z.number(),
      blockTime: z.number().nullable(),
      err: z.unknown().nullable(),
      memo: z.string().nullable().optional(),
    })
    .passthrough(),
);

// ─── Manifests (from the ASOL repo) ─────────────────────────────────────────

const ManifestMintSchema = z
  .object({
    element: z.string().optional(),
    name: z.string().optional(),
    symbol: z.string(),
    address: z.string(),
    decimals: z.number(),
    metadataUri: z.string().optional(),
  })
  .passthrough();

const DevnetManifestSchema = z
  .object({
    cluster: z.string(),
    genesisHash: z.string(),
    programId: z.string(),
    programConfigPda: z.string(),
    programDataAddress: z.string(),
    deployer: z.string(),
    mints: z.array(ManifestMintSchema),
    status: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();

const GovernanceManifestSchema = z
  .object({
    squadsProgramId: z.string(),
    multisigPda: z.string(),
    vaultPda: z.string(),
    threshold: z.number(),
    members: z.array(z.object({ role: z.string(), address: z.string() }).passthrough()),
    lifecycleDrill: z.object({ status: z.string() }).passthrough().optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();

const AuditReceiptSchema = z
  .object({
    timestamp: z.string(),
    status: z.string(),
    errors: z.array(z.unknown()).optional(),
    ammPools: z
      .array(
        z.object({ poolId: z.number(), elementA: z.number(), elementB: z.number(), pda: z.string() }).passthrough(),
      )
      .optional(),
  })
  .passthrough();

const MainnetManifestSchema = z
  .object({
    status: z.string(),
    programId: z.string(),
    mints: z.record(z.string(), z.object({ address: z.string(), symbol: z.string() }).passthrough()),
    governance: z.object({ upgradeAuthorityTransferred: z.boolean() }).passthrough().optional(),
    verifiableBuild: z.object({ anchorVersion: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

async function manifest<T>(file: string, schema: z.ZodType<T>): Promise<T | null> {
  const raw = await githubRawFile(SOLANA_REPO, "main", `deployments/${file}`, 10 * 60_000);
  if (!raw.ok) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(raw.data));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// ─── Solana payload ─────────────────────────────────────────────────────────

const ELEMENTS = ["Spirit", "Essence", "Matter", "Substance"] as const;

export interface SolanaMintLive {
  symbol: string;
  address: string;
  decimals: number;
  supply: string | null;
  holdersTop20: number | null;
  explorerUrl: string;
}

export interface SolanaPoolLive extends DecodedPool {
  pda: string;
  pair: string;
  explorerUrl: string;
}

export interface SolanaTx {
  signature: string;
  at: string | null;
  ok: boolean;
  explorerUrl: string;
}

export interface SolanaProgress {
  generatedAt: string;
  manifestSource: string;
  manifestsFound: { devnet: boolean; governance: boolean; audit: boolean; mainnet: boolean };
  devnet: {
    reachable: boolean;
    error: string | null;
    rpc: string;
    slot: number | null;
    genesisMatch: boolean | null;
    program: {
      id: string;
      deployed: boolean;
      executable: boolean;
      lastDeploySlot: number | null;
      upgradeAuthority: string | null;
      explorerUrl: string;
    } | null;
    config: (DecodedConfig & { pda: string }) | null;
    deployer: { address: string; sol: number | null; low: boolean } | null;
    mints: SolanaMintLive[];
    pools: SolanaPoolLive[];
    governance: {
      multisigPda: string;
      vaultPda: string;
      threshold: number;
      members: number;
      multisigExists: boolean | null;
      vaultSol: number | null;
      drillStatus: string | null;
    } | null;
    activity: {
      recent: SolanaTx[];
      last24h: number;
      last7d: number;
      failedRecent: number;
      lastTxAt: string | null;
    } | null;
    auditReceipt: { at: string; status: string; errors: number } | null;
  };
  mainnet: {
    reachable: boolean;
    error: string | null;
    manifestStatus: string | null;
    programDeployed: boolean | null;
    mintsCreated: number | null;
    mintsTotal: number;
    upgradeAuthorityTransferred: boolean | null;
  };
  asolHealth: {
    status: "ok" | "unauthorized" | "not-configured" | "error";
    detail: string | null;
    body: Record<string, unknown> | null;
  };
  repo: {
    status: "live" | "rate-limited" | "error" | "not-found";
    detail: string | null;
    commits: Array<{ sha: string; title: string; date: string; url: string; author: string }>;
    commits7d: number;
    commits30d: number;
    openPulls: Array<{ number: number; title: string; url: string; draft: boolean }>;
  };
}

function explorer(kind: "address" | "tx", id: string, cluster: "devnet" | "mainnet-beta"): string {
  return `https://explorer.solana.com/${kind}/${id}${cluster === "devnet" ? "?cluster=devnet" : ""}`;
}

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

async function readAsolHealth(): Promise<SolanaProgress["asolHealth"]> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return { status: "not-configured", detail: "INTERNAL_API_SECRET not set in this deployment", body: null };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(`${ASOL_BASE_URL}/api/solana/health`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return {
        status: "unauthorized",
        detail: `${ASOL_BASE_URL} rejected INTERNAL_API_SECRET — the two apps do not share it`,
        body: null,
      };
    }
    // 503 is the health route's own "unhealthy" verdict and still carries a body.
    const body = await readJson(res, {
      parse: (raw) => z.record(z.string(), z.unknown()).parse(raw),
    });
    return { status: "ok", detail: `HTTP ${res.status}`, body };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "request failed", body: null };
  } finally {
    clearTimeout(timer);
  }
}

async function readSolanaRepo(): Promise<SolanaProgress["repo"]> {
  const [commits, pulls] = await Promise.all([
    githubGet(`/repos/${SOLANA_REPO}/commits?per_page=30`, z.array(GithubCommitSchema), 10 * 60_000),
    githubGet(`/repos/${SOLANA_REPO}/pulls?state=open&per_page=20`, z.array(GithubPullSchema), 10 * 60_000),
  ]);
  if (!commits.ok) {
    return { status: commits.reason, detail: commits.detail, commits: [], commits7d: 0, commits30d: 0, openPulls: [] };
  }
  const now = Date.now();
  const dated = commits.data.map((c) => ({
    sha: c.sha,
    title: commitTitle(c.commit.message),
    date: c.commit.committer?.date ?? c.commit.author?.date ?? "",
    url: c.html_url,
    author: c.author?.login ?? c.commit.author?.name ?? "unknown",
  }));
  const within = (days: number): number =>
    dated.filter((c) => c.date && now - new Date(c.date).getTime() <= days * 86_400_000).length;
  return {
    status: "live",
    detail: null,
    commits: dated.slice(0, 10),
    commits7d: within(7),
    commits30d: within(30),
    openPulls: pulls.ok
      ? pulls.data.map((p) => ({ number: p.number, title: p.title, url: p.html_url, draft: p.draft ?? false }))
      : [],
  };
}

async function computeSolanaProgress(): Promise<SolanaProgress> {
  const [devnetManifest, governance, audit, mainnetManifest, asolHealth, repo] = await Promise.all([
    manifest("solana-devnet.json", DevnetManifestSchema),
    manifest("solana-devnet-governance.json", GovernanceManifestSchema),
    manifest("solana-devnet-audit-receipt.json", AuditReceiptSchema),
    manifest("solana-mainnet.json", MainnetManifestSchema),
    readAsolHealth(),
    readSolanaRepo(),
  ]);

  const devnet: SolanaProgress["devnet"] = {
    reachable: false,
    error: null,
    rpc: DEVNET_RPC.replace(/\?.*$/, ""),
    slot: null,
    genesisMatch: null,
    program: null,
    config: null,
    deployer: null,
    mints: [],
    pools: [],
    governance: null,
    activity: null,
    auditReceipt: audit
      ? { at: audit.timestamp, status: audit.status, errors: audit.errors?.length ?? 0 }
      : null,
  };

  if (devnetManifest) {
    try {
      const [slot, genesis] = await Promise.all([
        rpc(DEVNET_RPC, "getSlot", [{ commitment: "finalized" }], z.number()),
        rpc(DEVNET_RPC, "getGenesisHash", [], z.string()),
      ]);
      devnet.reachable = true;
      devnet.slot = slot;
      devnet.genesisMatch = genesis === devnetManifest.genesisHash;

      const poolRefs = audit?.ammPools ?? [];
      const [programAcct, programData, configAcct, deployerBal, supplies, largest, poolAccts, sigs, multisig, vaultBal] =
        await Promise.all([
          settle(getAccount(DEVNET_RPC, devnetManifest.programId)),
          settle(getAccount(DEVNET_RPC, devnetManifest.programDataAddress, { offset: 0, length: 45 })),
          settle(getAccount(DEVNET_RPC, devnetManifest.programConfigPda)),
          settle(rpc(DEVNET_RPC, "getBalance", [devnetManifest.deployer], BalanceSchema)),
          Promise.all(
            devnetManifest.mints.map((m) => settle(rpc(DEVNET_RPC, "getTokenSupply", [m.address], TokenSupplySchema))),
          ),
          Promise.all(
            devnetManifest.mints.map((m) =>
              settle(rpc(DEVNET_RPC, "getTokenLargestAccounts", [m.address], LargestAccountsSchema)),
            ),
          ),
          Promise.all(poolRefs.map((p) => settle(getAccount(DEVNET_RPC, p.pda)))),
          settle(rpc(DEVNET_RPC, "getSignaturesForAddress", [devnetManifest.programId, { limit: 100 }], SignaturesSchema)),
          governance ? settle(getAccount(DEVNET_RPC, governance.multisigPda)) : Promise.resolve(null),
          governance ? settle(rpc(DEVNET_RPC, "getBalance", [governance.vaultPda], BalanceSchema)) : Promise.resolve(null),
        ]);

      const header = programData ? decodeProgramDataHeader(programData.data) : null;
      devnet.program = {
        id: devnetManifest.programId,
        deployed: programAcct?.exists ?? false,
        executable: programAcct?.executable ?? false,
        lastDeploySlot: header?.lastDeploySlot ?? null,
        upgradeAuthority: header?.upgradeAuthority ?? null,
        explorerUrl: explorer("address", devnetManifest.programId, "devnet"),
      };
      const config =
        configAcct?.exists && configAcct.owner === devnetManifest.programId
          ? decodeProgramConfig(configAcct.data)
          : null;
      devnet.config = config ? { ...config, pda: devnetManifest.programConfigPda } : null;
      const sol = deployerBal ? deployerBal.value / 1e9 : null;
      devnet.deployer = {
        address: devnetManifest.deployer,
        sol,
        low: sol !== null && sol < LOW_SOL_THRESHOLD,
      };
      devnet.mints = devnetManifest.mints.map((m, i) => ({
        symbol: m.symbol,
        address: m.address,
        decimals: m.decimals,
        supply: supplies[i]?.value.uiAmountString ?? null,
        holdersTop20: largest[i] ? largest[i].value.filter((a) => a.amount !== "0").length : null,
        explorerUrl: explorer("address", m.address, "devnet"),
      }));
      devnet.pools = poolRefs.flatMap((ref, i) => {
        const acct = poolAccts[i];
        const decoded = acct?.exists && acct.owner === devnetManifest.programId ? decodeConstellationPool(acct.data) : null;
        if (!decoded) return [];
        return [
          {
            ...decoded,
            pda: ref.pda,
            pair: `${ELEMENTS[decoded.elementA] ?? decoded.elementA}/${ELEMENTS[decoded.elementB] ?? decoded.elementB}`,
            explorerUrl: explorer("address", ref.pda, "devnet"),
          },
        ];
      });
      if (governance) {
        devnet.governance = {
          multisigPda: governance.multisigPda,
          vaultPda: governance.vaultPda,
          threshold: governance.threshold,
          members: governance.members.length,
          multisigExists: multisig ? multisig.exists : null,
          vaultSol: vaultBal ? vaultBal.value / 1e9 : null,
          drillStatus: governance.lifecycleDrill?.status ?? null,
        };
      }
      if (sigs) {
        const now = Date.now() / 1000;
        devnet.activity = {
          recent: sigs.slice(0, 12).map((s) => ({
            signature: s.signature,
            at: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
            ok: s.err === null,
            explorerUrl: explorer("tx", s.signature, "devnet"),
          })),
          last24h: sigs.filter((s) => s.blockTime && now - s.blockTime <= 86_400).length,
          last7d: sigs.filter((s) => s.blockTime && now - s.blockTime <= 7 * 86_400).length,
          failedRecent: sigs.filter((s) => s.err !== null).length,
          lastTxAt: sigs[0]?.blockTime ? new Date(sigs[0].blockTime * 1000).toISOString() : null,
        };
      }
    } catch (err) {
      devnet.error = err instanceof Error ? err.message : "devnet RPC failed";
      _logger.error("[admin/chain] devnet read failed:", err);
    }
  } else {
    devnet.error = `deployments/solana-devnet.json unavailable from ${SOLANA_REPO}`;
  }

  const mintAddresses = mainnetManifest ? Object.values(mainnetManifest.mints).map((m) => m.address) : [];
  const mainnet: SolanaProgress["mainnet"] = {
    reachable: false,
    error: null,
    manifestStatus: mainnetManifest?.status ?? null,
    programDeployed: null,
    mintsCreated: null,
    mintsTotal: mintAddresses.length,
    upgradeAuthorityTransferred: mainnetManifest?.governance?.upgradeAuthorityTransferred ?? null,
  };
  if (mainnetManifest) {
    try {
      const accounts = await rpc(
        MAINNET_RPC,
        "getMultipleAccounts",
        [[mainnetManifest.programId, ...mintAddresses], { encoding: "base64", dataSlice: { offset: 0, length: 0 } }],
        MultipleAccountsSchema,
      );
      mainnet.reachable = true;
      const [program, ...mints] = accounts.value;
      mainnet.programDeployed = Boolean(program?.executable);
      mainnet.mintsCreated = mints.filter((m) => m !== null).length;
    } catch (err) {
      mainnet.error = err instanceof Error ? err.message : "mainnet RPC failed";
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    manifestSource: `github.com/${SOLANA_REPO}/tree/main/deployments`,
    manifestsFound: {
      devnet: devnetManifest !== null,
      governance: governance !== null,
      audit: audit !== null,
      mainnet: mainnetManifest !== null,
    },
    devnet,
    mainnet,
    asolHealth,
    repo,
  };
}

/** Public RPCs rate-limit hard; one fleet-wide read per minute is plenty. */
export async function getSolanaProgress(): Promise<SolanaProgress> {
  return memoize("admin:solana-progress", 60_000, computeSolanaProgress);
}

// ─── Base Sepolia ───────────────────────────────────────────────────────────

export interface OperatorWallet {
  role: "minter" | "redeemer" | "recipe-minter";
  address: string | null;
  eth: number | null;
  low: boolean;
  configured: boolean;
}

export interface BaseProgress {
  generatedAt: string;
  chain: string;
  chainId: number;
  explorer: string;
  reachable: boolean;
  error: string | null;
  blockNumber: string | null;
  esmsContract: string | null;
  recipeRegistry: string | null;
  recipeNftEnabled: boolean;
  wallets: OperatorWallet[];
  claims: {
    status: "live" | "missing-table" | "error";
    byStatus: Record<string, number>;
    last30d: number;
    oldestPendingHours: number | null;
    totals: { spirit: number; essence: number; matter: number; substance: number } | null;
    recent: Array<{ at: string; status: string; txHash: string | null; chain: string | null }>;
  };
  recipeMints: { status: "live" | "missing-table" | "error"; byStatus: Record<string, number>; last30d: number };
}

async function operatorWallets(publicClient: {
  getBalance: (a: { address: `0x${string}` }) => Promise<bigint>;
}): Promise<OperatorWallet[]> {
  const { privateKeyToAccount } = await import("viem/accounts");
  const roles: Array<{ role: OperatorWallet["role"]; key: string | undefined }> = [
    { role: "minter", key: process.env.MINTER_PRIVATE_KEY },
    { role: "redeemer", key: process.env.REDEEMER_PRIVATE_KEY },
    { role: "recipe-minter", key: process.env.RECIPE_MINTER_PRIVATE_KEY },
  ];
  return Promise.all(
    roles.map(async ({ role, key }): Promise<OperatorWallet> => {
      if (!key) return { role, address: null, eth: null, low: false, configured: false };
      let address: `0x${string}`;
      try {
        const normalized = (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`;
        ({ address } = privateKeyToAccount(normalized));
      } catch {
        return { role, address: null, eth: null, low: false, configured: true };
      }
      const wei = await settle(publicClient.getBalance({ address }));
      const eth = wei === null ? null : Number(wei) / 1e18;
      return { role, address, eth, low: eth !== null && eth < LOW_ETH_THRESHOLD, configured: true };
    }),
  );
}

async function computeBaseProgress(): Promise<BaseProgress> {
  const { esmsChain, esmsPublicClient } = await import("@/lib/esms-chain/contract");
  const { recipeRegistryAddress, recipeNftEnabled } = await import("@/lib/recipe-nft/contract");
  const chain = esmsChain();
  const result: BaseProgress = {
    generatedAt: new Date().toISOString(),
    chain: chain.name,
    chainId: chain.id,
    explorer: chain.blockExplorers?.default.url ?? "",
    reachable: false,
    error: null,
    blockNumber: null,
    esmsContract: process.env.ESMS_CONTRACT_ADDRESS ?? null,
    recipeRegistry: recipeRegistryAddress() ?? null,
    recipeNftEnabled: recipeNftEnabled(),
    wallets: [],
    claims: { status: "error", byStatus: {}, last30d: 0, oldestPendingHours: null, totals: null, recent: [] },
    recipeMints: { status: "error", byStatus: {}, last30d: 0 },
  };

  const client = esmsPublicClient();
  const [block, wallets] = await Promise.all([
    settle(client.getBlockNumber()),
    operatorWallets(client).catch((err: unknown) => {
      _logger.error("[admin/chain] operator wallets failed:", err);
      return [];
    }),
  ]);
  result.reachable = block !== null;
  result.blockNumber = block === null ? null : block.toString();
  if (block === null) result.error = `${chain.name} RPC unreachable`;
  result.wallets = wallets;

  try {
    const [byStatus, agg, recent] = await Promise.all([
      executeQuery<{ status: string; n: number }>(
        `SELECT status, COUNT(*)::int AS n FROM esms_onchain_claims GROUP BY status`,
      ),
      executeQuery<{
        last30d: number;
        oldest_pending_hours: number | null;
        spirit: string | null;
        essence: string | null;
        matter: string | null;
        substance: string | null;
      }>(
        `SELECT COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last30d,
                EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'pending'))) / 3600.0 AS oldest_pending_hours,
                SUM(spirit) FILTER (WHERE status = 'minted')::text AS spirit,
                SUM(essence) FILTER (WHERE status = 'minted')::text AS essence,
                SUM(matter) FILTER (WHERE status = 'minted')::text AS matter,
                SUM(substance) FILTER (WHERE status = 'minted')::text AS substance
           FROM esms_onchain_claims`,
      ),
      executeQuery<{ created_at: Date; status: string; tx_hash: string | null; target_chain: string | null }>(
        `SELECT created_at, status, tx_hash, target_chain
           FROM esms_onchain_claims ORDER BY created_at DESC LIMIT 10`,
      ),
    ]);
    const [a] = agg.rows;
    result.claims = {
      status: "live",
      byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, Number(r.n)])),
      last30d: Number(a?.last30d ?? 0),
      oldestPendingHours: a?.oldest_pending_hours == null ? null : Number(a.oldest_pending_hours),
      totals: {
        spirit: Number(a?.spirit ?? 0),
        essence: Number(a?.essence ?? 0),
        matter: Number(a?.matter ?? 0),
        substance: Number(a?.substance ?? 0),
      },
      recent: recent.rows.map((r) => ({
        at: new Date(r.created_at).toISOString(),
        status: r.status,
        txHash: r.tx_hash,
        chain: r.target_chain,
      })),
    };
  } catch (err) {
    result.claims.status = isMissingRelation(err) ? "missing-table" : "error";
    if (result.claims.status === "error") _logger.error("[admin/chain] claims query failed:", err);
  }

  try {
    const mints = await executeQuery<{ status: string; n: number; last30d: number }>(
      `SELECT status, COUNT(*)::int AS n,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last30d
         FROM recipe_nft_mints GROUP BY status`,
    );
    result.recipeMints = {
      status: "live",
      byStatus: Object.fromEntries(mints.rows.map((r) => [r.status, Number(r.n)])),
      last30d: mints.rows.reduce((s, r) => s + Number(r.last30d), 0),
    };
  } catch (err) {
    result.recipeMints.status = isMissingRelation(err) ? "missing-table" : "error";
    if (result.recipeMints.status === "error") _logger.error("[admin/chain] recipe mints query failed:", err);
  }

  return result;
}

export async function getBaseProgress(): Promise<BaseProgress> {
  return memoize("admin:base-progress", 30_000, computeBaseProgress);
}
