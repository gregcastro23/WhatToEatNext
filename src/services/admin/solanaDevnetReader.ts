/**
 * Live devnet state for every address in the ASOL deployment manifests.
 * Server-only, read-only. Each reader resolves on its own, so one failing
 * account read shows as a gap instead of blanking the section.
 *
 * @file src/services/admin/solanaDevnetReader.ts
 */

import { z } from "zod";
import { _logger } from "@/lib/logger";
import { decodeConstellationPool, decodeProgramConfig, decodeProgramDataHeader } from "@/services/admin/solanaDecode";
import type { SolanaManifests } from "@/services/admin/solanaManifests";
import {
  DEVNET_RPC,
  explorerUrl,
  getAccount,
  LargestAccountsSchema,
  rpc,
  settle,
  SignaturesSchema,
  solBalance,
  TokenSupplySchema,
} from "@/services/admin/solanaRpc";
import type {
  DevnetActivity,
  DevnetGovernance,
  DevnetProgram,
  DevnetState,
  SolanaMintLive,
  SolanaPoolLive,
} from "@/services/admin/solanaTypes";

type Devnet = NonNullable<SolanaManifests["devnet"]>;

/** Deployer/fee-payer below this many SOL is flagged. */
const LOW_SOL_THRESHOLD = 1;
const ELEMENTS = ["Spirit", "Essence", "Matter", "Substance"];

async function readProgram(m: Devnet): Promise<DevnetProgram> {
  const [program, data] = await Promise.all([
    settle(getAccount(DEVNET_RPC, m.programId)),
    settle(getAccount(DEVNET_RPC, m.programDataAddress, { offset: 0, length: 45 })),
  ]);
  const header = data ? decodeProgramDataHeader(data.data) : null;
  return {
    id: m.programId,
    deployed: program?.exists ?? false,
    executable: program?.executable ?? false,
    lastDeploySlot: header?.lastDeploySlot ?? null,
    upgradeAuthority: header?.upgradeAuthority ?? null,
    explorerUrl: explorerUrl("address", m.programId, "devnet"),
  };
}

async function readConfig(m: Devnet): Promise<DevnetState["config"]> {
  const acct = await settle(getAccount(DEVNET_RPC, m.programConfigPda));
  // Only trust bytes owned by the program — anything else is not its config.
  const decoded = acct?.exists && acct.owner === m.programId ? decodeProgramConfig(acct.data) : null;
  return decoded ? { ...decoded, pda: m.programConfigPda } : null;
}

async function readMint(mint: Devnet["mints"][number]): Promise<SolanaMintLive> {
  const [supply, largest] = await Promise.all([
    settle(rpc(DEVNET_RPC, "getTokenSupply", [mint.address], TokenSupplySchema)),
    settle(rpc(DEVNET_RPC, "getTokenLargestAccounts", [mint.address], LargestAccountsSchema)),
  ]);
  return {
    symbol: mint.symbol,
    address: mint.address,
    decimals: mint.decimals,
    supply: supply?.value.uiAmountString ?? null,
    holdersTop20: largest ? largest.value.filter((a) => a.amount !== "0").length : null,
    explorerUrl: explorerUrl("address", mint.address, "devnet"),
  };
}

async function readPool(ref: { pda: string }, programId: string): Promise<SolanaPoolLive | null> {
  const acct = await settle(getAccount(DEVNET_RPC, ref.pda));
  const decoded = acct?.exists && acct.owner === programId ? decodeConstellationPool(acct.data) : null;
  if (!decoded) return null;
  const pair = `${ELEMENTS[decoded.elementA] ?? decoded.elementA}/${ELEMENTS[decoded.elementB] ?? decoded.elementB}`;
  return { ...decoded, pda: ref.pda, pair, explorerUrl: explorerUrl("address", ref.pda, "devnet") };
}

async function readGovernance(gov: SolanaManifests["governance"]): Promise<DevnetGovernance | null> {
  if (!gov) return null;
  const [multisig, vaultSol] = await Promise.all([
    settle(getAccount(DEVNET_RPC, gov.multisigPda)),
    solBalance(DEVNET_RPC, gov.vaultPda),
  ]);
  return {
    multisigPda: gov.multisigPda,
    vaultPda: gov.vaultPda,
    threshold: gov.threshold,
    members: gov.members.length,
    multisigExists: multisig ? multisig.exists : null,
    vaultSol,
    drillStatus: gov.lifecycleDrill?.status ?? null,
  };
}

async function readActivity(programId: string): Promise<DevnetActivity | null> {
  const sigs = await settle(rpc(DEVNET_RPC, "getSignaturesForAddress", [programId, { limit: 100 }], SignaturesSchema));
  if (!sigs) return null;
  const nowSec = Date.now() / 1000;
  const within = (secs: number): number => sigs.filter((s) => s.blockTime !== null && nowSec - s.blockTime <= secs).length;
  const iso = (t: number | null): string | null => (t === null ? null : new Date(t * 1000).toISOString());
  return {
    recent: sigs.slice(0, 12).map((s) => ({
      signature: s.signature,
      at: iso(s.blockTime),
      ok: (s.err ?? null) === null,
      explorerUrl: explorerUrl("tx", s.signature, "devnet"),
    })),
    last24h: within(86_400),
    last7d: within(7 * 86_400),
    failedRecent: sigs.filter((s) => (s.err ?? null) !== null).length,
    lastTxAt: iso(sigs[0]?.blockTime ?? null),
  };
}

function emptyDevnet(manifests: SolanaManifests): DevnetState {
  const { audit } = manifests;
  return {
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
    auditReceipt: audit ? { at: audit.timestamp, status: audit.status, errors: audit.errors?.length ?? 0 } : null,
  };
}

async function readLiveDevnet(m: Devnet, manifests: SolanaManifests): Promise<Partial<DevnetState>> {
  const [slot, genesis] = await Promise.all([
    rpc(DEVNET_RPC, "getSlot", [{ commitment: "finalized" }], z.number()),
    rpc(DEVNET_RPC, "getGenesisHash", [], z.string()),
  ]);
  const [program, config, sol, mints, pools, governance, activity] = await Promise.all([
    readProgram(m),
    readConfig(m),
    solBalance(DEVNET_RPC, m.deployer),
    Promise.all(m.mints.map(readMint)),
    Promise.all((manifests.audit?.ammPools ?? []).map((ref) => readPool(ref, m.programId))),
    readGovernance(manifests.governance),
    readActivity(m.programId),
  ]);
  return {
    reachable: true,
    slot,
    genesisMatch: genesis === m.genesisHash,
    program,
    config,
    deployer: { address: m.deployer, sol, low: sol !== null && sol < LOW_SOL_THRESHOLD },
    mints,
    pools: pools.filter((p): p is SolanaPoolLive => p !== null),
    governance,
    activity,
  };
}

export async function readDevnet(manifests: SolanaManifests): Promise<DevnetState> {
  const base = emptyDevnet(manifests);
  if (!manifests.devnet) {
    return { ...base, error: "deployments/solana-devnet.json unavailable from the Solana repo" };
  }
  try {
    return { ...base, ...(await readLiveDevnet(manifests.devnet, manifests)) };
  } catch (err) {
    _logger.error("[admin/chain] devnet read failed:", err);
    return { ...base, error: err instanceof Error ? err.message : "devnet RPC failed" };
  }
}
