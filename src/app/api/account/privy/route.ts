/**
 * GET    /api/account/privy — Retrieve current user's Privy link status
 * POST   /api/account/privy — Link user's account with Privy DID (verifying Privy JWT)
 * DELETE /api/account/privy — Unlink the current user's Privy identity
 *
 * Designed to degrade gracefully if PRIVY_APP_SECRET is unset (returning 500 on write,
 * but keeping client modal operable). Combats race conflicts via transactional constraints
 * and unique column indexes.
 *
 * On link, the embedded EVM (Base) wallet address is resolved SERVER-SIDE from the
 * verified DID — never trusting a client-sent address — and stored alongside the DID.
 * Same Privy app ⇒ the same wallet address on alchm.kitchen and agents.alchm.kitchen.
 *
 * @file src/app/api/account/privy/route.ts
 */

import { PrivyClient } from "@privy-io/server-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lazy initialize Privy Client so the app compiles and launches even if unconfigured
let privyClient: PrivyClient | null = null;
function getPrivyClient(): PrivyClient | null {
  if (privyClient) return privyClient;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (appId && appSecret) {
    privyClient = new PrivyClient(appId, appSecret);
  }
  return privyClient;
}

/** Helper to mask Decentralized Identifier (DID) for secure exposure */
function maskDid(did: string): string {
  if (did.length > 20) {
    return `${did.slice(0, 16)}…${did.slice(-4)}`;
  }
  return did;
}

/**
 * Resolve the user's embedded EVM (Privy) wallet address from their verified DID —
 * server authoritative (don't trust a client-sent address). Returns null if none /
 * on error. Mirrors PA's getPrivyWallet() so both sites resolve the same address.
 */
async function resolvePrivyWallet(client: PrivyClient, did: string): Promise<string | null> {
  try {
    const user = await client.getUser(did);
    const accounts = ((user as { linkedAccounts?: unknown[] }).linkedAccounts || []) as Array<
      Record<string, unknown>
    >;
    const embedded = accounts.find(
      (a) =>
        a?.type === "wallet" &&
        a?.walletClientType === "privy" &&
        a?.chainType === "ethereum",
    );
    const anyWallet = accounts.find((a) => a?.type === "wallet");
    const address = (embedded?.address ?? anyWallet?.address ?? null) as string | null;
    return address;
  } catch (err) {
    console.warn("[account/privy] wallet resolution failed:", err);
    return null;
  }
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    const connected = !!user.privyDid;
    return NextResponse.json({
      success: true,
      connected,
      privyDid: user.privyDid ? maskDid(user.privyDid) : null,
      walletAddress: user.walletAddress ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve account connection status",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Graceful degradation when secret keys are unset
  const client = getPrivyClient();
  if (!client) {
    return NextResponse.json(
      {
        success: false,
        error: "Privy server integration is unconfigured",
        detail: "PRIVY_APP_SECRET or NEXT_PUBLIC_PRIVY_APP_ID environment variable is missing on the server.",
      },
      { status: 500 }
    );
  }

  let body: { privyToken?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const privyToken = typeof body.privyToken === "string" ? body.privyToken.trim() : "";
  if (!privyToken) {
    return NextResponse.json(
      { success: false, error: "`privyToken` is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Verify Privy access token and extract user claims / DID
    const verifiedClaims = await client.verifyAuthToken(privyToken);
    const privyDid = verifiedClaims.userId; // claims.userId contains the Privy DID

    if (!privyDid) {
      return NextResponse.json(
        { success: false, error: "Failed to extract identity from token" },
        { status: 400 }
      );
    }

    // 2. Resolve the embedded wallet server-side from the verified DID (authoritative).
    //    Non-fatal: a missing wallet still links the DID.
    const walletAddress = await resolvePrivyWallet(client, privyDid);

    // 3. Perform linking via userDatabase service (handles unique checks and transactional commits)
    await userDatabase.linkUserPrivyDid(userId, privyDid, walletAddress ?? undefined);

    return NextResponse.json({
      success: true,
      privyDid: maskDid(privyDid),
      walletAddress: walletAddress ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    // Detect 409 conflict
    if (message.includes("Conflict") || message.includes("already linked")) {
      return NextResponse.json(
        { success: false, error: "This Privy identity is already linked to a different account." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to link Privy identity",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await userDatabase.unlinkUserPrivyDid(userId);
    return NextResponse.json({ success: true, connected: false });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unlink Privy identity",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 }
    );
  }
}
