/**
 * Types for the Solana section of /admin/chain.
 *
 * @file src/services/admin/solanaTypes.ts
 */

import type { DecodedConfig, DecodedPool } from "@/services/admin/solanaDecode";

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

export interface DevnetProgram {
  id: string;
  deployed: boolean;
  executable: boolean;
  lastDeploySlot: number | null;
  upgradeAuthority: string | null;
  explorerUrl: string;
}

export interface DevnetGovernance {
  multisigPda: string;
  vaultPda: string;
  threshold: number;
  members: number;
  multisigExists: boolean | null;
  vaultSol: number | null;
  drillStatus: string | null;
}

export interface DevnetActivity {
  recent: SolanaTx[];
  last24h: number;
  last7d: number;
  failedRecent: number;
  lastTxAt: string | null;
}

export interface DevnetState {
  reachable: boolean;
  error: string | null;
  rpc: string;
  slot: number | null;
  genesisMatch: boolean | null;
  program: DevnetProgram | null;
  config: (DecodedConfig & { pda: string }) | null;
  deployer: { address: string; sol: number | null; low: boolean } | null;
  mints: SolanaMintLive[];
  pools: SolanaPoolLive[];
  governance: DevnetGovernance | null;
  activity: DevnetActivity | null;
  auditReceipt: { at: string; status: string; errors: number } | null;
}

export interface MainnetState {
  reachable: boolean;
  error: string | null;
  manifestStatus: string | null;
  programDeployed: boolean | null;
  mintsCreated: number | null;
  mintsTotal: number;
  upgradeAuthorityTransferred: boolean | null;
}

export interface AsolHealth {
  status: "ok" | "unauthorized" | "not-configured" | "error";
  detail: string | null;
  body: Record<string, unknown> | null;
}

export interface SolanaRepoActivity {
  status: "live" | "rate-limited" | "error" | "not-found";
  detail: string | null;
  commits: Array<{ sha: string; title: string; date: string; url: string; author: string }>;
  commits7d: number;
  commits30d: number;
  openPulls: Array<{ number: number; title: string; url: string; draft: boolean }>;
}

export interface SolanaProgress {
  generatedAt: string;
  manifestSource: string;
  manifestsFound: { devnet: boolean; governance: boolean; audit: boolean; mainnet: boolean };
  devnet: DevnetState;
  mainnet: MainnetState;
  asolHealth: AsolHealth;
  repo: SolanaRepoActivity;
}
