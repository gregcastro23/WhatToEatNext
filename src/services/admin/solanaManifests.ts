/**
 * Deployment manifests from the sibling alchm-agents-solana repo — the
 * address book for every on-chain read on /admin/chain. Read from GitHub
 * (raw CDN, 10-minute cache), never copied into this repo, so a redeploy over
 * there is picked up here without a code change.
 *
 * @file src/services/admin/solanaManifests.ts
 */

import { z } from "zod";
import { githubRawFile, SOLANA_REPO } from "@/services/admin/githubClient";

const ManifestMintSchema = z.object({
  symbol: z.string(),
  address: z.string(),
  decimals: z.number(),
});

export const DevnetManifestSchema = z.object({
  genesisHash: z.string(),
  programId: z.string(),
  programConfigPda: z.string(),
  programDataAddress: z.string(),
  deployer: z.string(),
  mints: z.array(ManifestMintSchema),
});

export const GovernanceManifestSchema = z.object({
  multisigPda: z.string(),
  vaultPda: z.string(),
  threshold: z.number(),
  members: z.array(z.object({ role: z.string(), address: z.string() })),
  lifecycleDrill: z.object({ status: z.string() }).optional(),
});

export const AuditReceiptSchema = z.object({
  timestamp: z.string(),
  status: z.string(),
  errors: z.array(z.unknown()).optional(),
  ammPools: z.array(z.object({ poolId: z.number(), pda: z.string() })).optional(),
});

export const MainnetManifestSchema = z.object({
  status: z.string(),
  programId: z.string(),
  mints: z.record(z.string(), z.object({ address: z.string(), symbol: z.string() })),
  governance: z.object({ upgradeAuthorityTransferred: z.boolean() }).optional(),
});

export interface SolanaManifests {
  devnet: z.infer<typeof DevnetManifestSchema> | null;
  governance: z.infer<typeof GovernanceManifestSchema> | null;
  audit: z.infer<typeof AuditReceiptSchema> | null;
  mainnet: z.infer<typeof MainnetManifestSchema> | null;
}

function parseJson<T>(text: string, schema: z.ZodType<T>): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function manifest<T>(file: string, schema: z.ZodType<T>): Promise<T | null> {
  const raw = await githubRawFile(SOLANA_REPO, "main", `deployments/${file}`, 10 * 60_000);
  return raw.ok ? parseJson(raw.data, schema) : null;
}

export async function readManifests(): Promise<SolanaManifests> {
  const [devnet, governance, audit, mainnet] = await Promise.all([
    manifest("solana-devnet.json", DevnetManifestSchema),
    manifest("solana-devnet-governance.json", GovernanceManifestSchema),
    manifest("solana-devnet-audit-receipt.json", AuditReceiptSchema),
    manifest("solana-mainnet.json", MainnetManifestSchema),
  ]);
  return { devnet, governance, audit, mainnet };
}
