/**
 * Solana progress — devnet → mainnet, measured on-chain. Server-only.
 *
 * The program, mints, AMM pools, and Squads multisig live in the sibling repo
 * alchm-agents-solana, which records every deployment in `deployments/*.json`
 * (solanaManifests). Every address there is checked against the chain:
 *
 *   - devnet (solanaDevnetReader): genesis match, program + last deploy slot
 *     + upgrade authority, ProgramConfig pause flags and keys, live SPL supply,
 *     AMM reserves, multisig, deployer SOL, recent program transactions.
 *   - mainnet-beta: does the program exist yet? how many of the mints? — the
 *     migration's progress read from the chain, not from a status field.
 *   - the agents app's own /api/solana/health (sync/bridge queues, worker
 *     heartbeats) when INTERNAL_API_SECRET is shared between the apps.
 *   - repo activity: commits and open PRs in the Solana repo.
 *
 * @file src/services/admin/solanaProgressService.ts
 */

import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { memoize } from "@/lib/cache/memoryCache";
import { commitTitle, GithubCommitSchema, githubGet, GithubPullSchema, SOLANA_REPO } from "@/services/admin/githubClient";
import { readDevnet } from "@/services/admin/solanaDevnetReader";
import { readManifests, type SolanaManifests } from "@/services/admin/solanaManifests";
import { MAINNET_RPC, MultipleAccountsSchema, rpc } from "@/services/admin/solanaRpc";
import type { AsolHealth, MainnetState, SolanaProgress, SolanaRepoActivity } from "@/services/admin/solanaTypes";

const ASOL_BASE_URL = process.env.AGENTS_BASE_URL ?? process.env.NEXT_PUBLIC_AGENTS_URL ?? "https://agents.alchm.kitchen";

async function fetchAsolHealth(secret: string): Promise<AsolHealth> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7_000);
  try {
    const res = await fetch(`${ASOL_BASE_URL}/api/solana/health`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return { status: "unauthorized", detail: `${ASOL_BASE_URL} rejected INTERNAL_API_SECRET — the apps do not share it`, body: null };
    }
    // 503 is that route's own "unhealthy" verdict and still carries a body.
    const body = await readJson(res, { parse: (raw) => z.record(z.string(), z.unknown()).parse(raw) });
    return { status: "ok", detail: `HTTP ${res.status}`, body };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "request failed", body: null };
  } finally {
    clearTimeout(timer);
  }
}

async function readAsolHealth(): Promise<AsolHealth> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return { status: "not-configured", detail: "INTERNAL_API_SECRET not set in this deployment", body: null };
  return fetchAsolHealth(secret);
}

async function readSolanaRepo(): Promise<SolanaRepoActivity> {
  const [commits, pulls] = await Promise.all([
    githubGet(`/repos/${SOLANA_REPO}/commits?per_page=30`, z.array(GithubCommitSchema), 10 * 60_000),
    githubGet(`/repos/${SOLANA_REPO}/pulls?state=open&per_page=20`, z.array(GithubPullSchema), 10 * 60_000),
  ]);
  if (!commits.ok) {
    return { status: commits.reason, detail: commits.detail, commits: [], commits7d: 0, commits30d: 0, openPulls: [] };
  }
  const dated = commits.data.map((c) => ({
    sha: c.sha,
    title: commitTitle(c.commit.message),
    date: c.commit.committer?.date ?? c.commit.author?.date ?? "",
    url: c.html_url,
    author: c.author?.login ?? c.commit.author?.name ?? "unknown",
  }));
  const now = Date.now();
  const within = (days: number): number =>
    dated.filter((c) => c.date !== "" && now - new Date(c.date).getTime() <= days * 86_400_000).length;
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

async function readMainnet(manifest: SolanaManifests["mainnet"]): Promise<MainnetState> {
  const mintAddresses = manifest ? Object.values(manifest.mints).map((m) => m.address) : [];
  const state: MainnetState = {
    reachable: false,
    error: null,
    manifestStatus: manifest?.status ?? null,
    programDeployed: null,
    mintsCreated: null,
    mintsTotal: mintAddresses.length,
    upgradeAuthorityTransferred: manifest?.governance?.upgradeAuthorityTransferred ?? null,
  };
  if (!manifest) return state;
  try {
    const accounts = await rpc(
      MAINNET_RPC,
      "getMultipleAccounts",
      [[manifest.programId, ...mintAddresses], { encoding: "base64", dataSlice: { offset: 0, length: 0 } }],
      MultipleAccountsSchema,
    );
    const [program, ...mints] = accounts.value;
    return { ...state, reachable: true, programDeployed: program?.executable ?? false, mintsCreated: mints.filter((m) => m !== null).length };
  } catch (err) {
    return { ...state, error: err instanceof Error ? err.message : "mainnet RPC failed" };
  }
}

async function computeSolanaProgress(): Promise<SolanaProgress> {
  const manifests = await readManifests();
  const [devnet, mainnet, asolHealth, repo] = await Promise.all([
    readDevnet(manifests),
    readMainnet(manifests.mainnet),
    readAsolHealth(),
    readSolanaRepo(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    manifestSource: `github.com/${SOLANA_REPO}/tree/main/deployments`,
    manifestsFound: {
      devnet: manifests.devnet !== null,
      governance: manifests.governance !== null,
      audit: manifests.audit !== null,
      mainnet: manifests.mainnet !== null,
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
