/**
 * GET    /api/account/privy — Retrieve current user's Privy link status
 * POST   /api/account/privy — Link user's account with Privy DID (verifying Privy JWT)
 * DELETE /api/account/privy — Unlink the current user's Privy identity
 *
 * Degrades gracefully when PRIVY_APP_SECRET is unset (POST returns 500 but the
 * route stays loadable). Cross-user DID conflicts surface as 409 via the unique
 * column index + the userDatabase guard.
 *
 * On link, the embedded EVM (Base) wallet address is resolved SERVER-SIDE from
 * the verified DID (never trusting a client-sent address) and stored alongside
 * the DID. Same Privy app ⇒ the same wallet address on alchm.kitchen and
 * agents.alchm.kitchen. Verification + wallet resolution live in
 * src/lib/privy/server.ts (mirrors PA's lib/privy/server.ts).
 *
 * @file src/app/api/account/privy/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPrivyClient, verifyPrivyToken, getPrivyWallet, maskDid } from "@/lib/privy/server";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    return NextResponse.json({
      success: true,
      connected: !!user.privyDid,
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

  // Graceful degradation when secret keys are unset — distinguish "unconfigured"
  // (500) from "bad token" (401) by checking the client before verifying.
  if (!getPrivyClient()) {
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
    // 1. Verify Privy access token → DID (null = invalid/expired token).
    const privyDid = await verifyPrivyToken(privyToken);
    if (!privyDid) {
      return NextResponse.json(
        { success: false, error: "Invalid Privy token" },
        { status: 401 }
      );
    }

    // 2. Resolve the embedded wallet server-side from the verified DID
    //    (authoritative). Non-fatal: a missing wallet still links the DID.
    const walletAddress = await getPrivyWallet(privyDid);

    // 3. Link via userDatabase (handles unique checks + transactional commit).
    await userDatabase.linkUserPrivyDid(userId, privyDid, walletAddress ?? undefined);

    return NextResponse.json({
      success: true,
      privyDid: maskDid(privyDid),
      walletAddress: walletAddress ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    // Cross-user DID conflict → 409
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
