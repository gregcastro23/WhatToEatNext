/**
 * Minimal Solana JSON-RPC reads for the admin surface. Server-only.
 *
 * Plain fetch + zod instead of @solana/web3.js: five read methods do not
 * justify pulling the SDK into the server bundle.
 *
 * @file src/services/admin/solanaRpc.ts
 */

import { z } from "zod";
import { readJson } from "@/lib/api/json";

const RPC_TIMEOUT_MS = 7_000;

export const DEVNET_RPC = process.env.SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com";
export const MAINNET_RPC = process.env.SOLANA_MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com";

const RpcEnvelopeSchema = z.object({
  result: z.unknown().optional(),
  error: z.object({ message: z.string() }).optional(),
});

export async function rpc<T>(url: string, method: string, params: unknown[], schema: z.ZodType<T>): Promise<T> {
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

/** Resolve to null instead of rejecting — one missing account must not sink the board. */
export async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

const AccountInfoSchema = z.object({
  value: z
    .object({
      data: z.tuple([z.string(), z.string()]),
      executable: z.boolean(),
      lamports: z.number(),
      owner: z.string(),
    })
    .nullable(),
});

export interface AccountRead {
  exists: boolean;
  owner: string | null;
  lamports: number;
  executable: boolean;
  data: Buffer;
}

export async function getAccount(
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

export const MultipleAccountsSchema = z.object({
  value: z.array(z.object({ owner: z.string(), executable: z.boolean(), lamports: z.number() }).nullable()),
});

export const TokenSupplySchema = z.object({
  value: z.object({ amount: z.string(), decimals: z.number(), uiAmountString: z.string() }),
});

export const LargestAccountsSchema = z.object({ value: z.array(z.object({ amount: z.string() })) });

export const BalanceSchema = z.object({ value: z.number() });

export const SignaturesSchema = z.array(
  z.object({
    signature: z.string(),
    slot: z.number(),
    blockTime: z.number().nullable(),
    err: z.unknown().optional(),
  }),
);

export async function solBalance(url: string, address: string): Promise<number | null> {
  const res = await settle(rpc(url, "getBalance", [address], BalanceSchema));
  return res ? res.value / 1e9 : null;
}

export function explorerUrl(kind: "address" | "tx", id: string, cluster: "devnet" | "mainnet-beta"): string {
  return `https://explorer.solana.com/${kind}/${id}${cluster === "devnet" ? "?cluster=devnet" : ""}`;
}
