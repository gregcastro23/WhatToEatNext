/**
 * GET  /api/account/api-keys — list the caller's keys (never the plaintext)
 * POST /api/account/api-keys — mint a new key, returning the plaintext ONCE
 *
 * Plaintext appears only in the POST response body. Lookups (in
 * `src/lib/mcp/auth.ts`) re-hash inbound keys and look them up by
 * `key_hash`, so the plaintext is never recoverable after this call.
 *
 * Rate-limited per IP under bucket `api-keys` to throttle scripted abuse;
 * the bucket is separate from per-key MCP-invoke limits.
 *
 * @file src/app/api/account/api-keys/route.ts
 */

import { NextResponse } from "next/server";
import { listUserApiKeys, mintApiKey } from "@/lib/api-keys/queries";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LIST_LIMIT = { window: 60_000, max: 60, bucket: "api-keys:list" };
const MINT_LIMIT = { window: 60_000, max: 10, bucket: "api-keys:mint" };

async function resolveUserId(request: Request): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (user?.id) return user.id;

  // Bearer JWT fallback so headless API clients (and tests) can hit the
  // route without a NextAuth cookie. Cookie path stays primary for real users.
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const { validateToken } = await import("@/lib/auth/validateRequest");
      const result = await validateToken(authHeader.slice(7));
      if (result.valid && result.user) return result.user.userId;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, LIST_LIMIT);
  if (!rl.allowed) return rl.response!;

  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const rows = await listUserApiKeys(userId);
    return NextResponse.json({ success: true, keys: rows });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list api keys",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const rl = await rateLimit(request, MINT_LIMIT);
  if (!rl.allowed) return rl.response!;

  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: { name?: unknown; scopes?: unknown; expiresAt?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length === 0) {
    return NextResponse.json(
      { success: false, error: "`name` is required" },
      { status: 400 },
    );
  }

  try {
    const minted = await mintApiKey({
      userId,
      name,
      scopes: body.scopes,
      expiresAt: body.expiresAt,
    });
    // The ONLY response that ever carries the plaintext. Client must
    // surface it immediately and discard.
    return NextResponse.json(
      { success: true, key: minted.row, plaintext: minted.plaintext },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    const isUserError = message === "name must be non-empty";
    return NextResponse.json(
      {
        success: false,
        error: isUserError ? message : "Failed to mint api key",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: isUserError ? 400 : 500 },
    );
  }
}
