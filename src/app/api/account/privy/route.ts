/**
 * GET  /api/account/privy — Retrieve current user's Privy link status
 * POST /api/account/privy — Link user's account with Privy DID (verifying Privy JWT)
 *
 * Designed to degrade gracefully if PRIVY_APP_SECRET is unset (returning 500 on write,
 * but keeping client modal operable). Combats race conflicts via transactional constraints
 * and unique column indexes.
 *
 * @file src/app/api/account/privy/route.ts
 */

import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
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

    // 2. Perform linking via userDatabase service (handles unique checks and transactional commits)
    await userDatabase.linkUserPrivyDid(userId, privyDid);

    return NextResponse.json({
      success: true,
      privyDid: maskDid(privyDid),
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
