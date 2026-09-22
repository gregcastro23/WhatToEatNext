/**
 * Admin Chain Progress
 * GET /api/admin/chain
 *
 * Solana (devnet program/mints/pools/governance decoded live, mainnet
 * readiness, the agents app's own Solana health, repo activity) and Base
 * Sepolia (ESMS contract, operator gas, claim + recipe-NFT ledgers).
 * Response: `{ solana: SolanaProgress, base: BaseProgress }` from
 * src/services/admin/chainProgressService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getBaseProgress, getSolanaProgress } from "@/services/admin/chainProgressService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  // Both services memoize internally (Solana 60s, Base 30s).
  const [solana, base] = await Promise.all([getSolanaProgress(), getBaseProgress()]);
  return NextResponse.json({ success: true, generatedAt: new Date().toISOString(), solana, base });
}
