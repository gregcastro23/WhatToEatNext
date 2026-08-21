/**
 * Waitlist API Route — alchm.kitchen (WhatToEatNext)
 * POST /api/waitlist — find-or-create a user from an email address alone.
 *
 * This is the receiving half of the "All Aboard" kiosk that runs at
 * `ondeck.alchm.kitchen/All-Aboard`. Someone at a booth types an email; the
 * OnDeck server calls this endpoint and the sibling endpoint on
 * agents.alchm.kitchen, so one address lands in both databases.
 *
 * Accepts: { email, name?, source?, event? }
 * Returns: { ok, created, userId, welcomeEmailSent }
 *
 * Auth: server-to-server only. Requires the shared secret as either
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *   Authorization: Bearer <ALCHM_KITCHEN_SYNC_SECRET>
 * — the same secret `/api/internal/agent-sync` already uses. There is no public
 * signup-by-email path on this site and this route does not create one: without
 * the secret it is a 401, so it cannot be used to spray the users table.
 *
 * Idempotent. An address we already know returns `created: false` and sends no
 * second welcome email, so the kiosk can re-send a queued submission safely.
 *
 * @file src/app/api/waitlist/route.ts
 */

import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import emailService from "@/services/emailService";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Same shape rule the kiosk applies client-side, re-checked at the boundary. */
const EMAIL_PATTERN = /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\"]+\.[A-Za-z]{2,}$/;

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;

/** A row created within this window is genuinely new (vs. one createUser
 *  returned after losing a concurrent insert race). */
const FRESH_WINDOW_MS = 60_000;

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Fail closed: with no secret configured this returns false in every
 * environment, so a missing env var turns the route off rather than opening it.
 */
function isAuthorized(request: NextRequest): boolean {
  const expected =
    process.env.ALCHM_KITCHEN_SYNC_SECRET ?? process.env.INTERNAL_API_SECRET;
  if (!expected) {
    console.error(
      "[waitlist] ALCHM_KITCHEN_SYNC_SECRET is not configured — refusing all requests."
    );
    return false;
  }

  const bearer = (request.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const sync = request.headers.get("x-sync-secret") ?? "";

  return (
    constantTimeEquals(sync, expected) || constantTimeEquals(bearer, expected)
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    name?: unknown;
    source?: unknown;
    event?: unknown;
  } | null;

  const rawEmail = typeof body?.email === "string" ? body.email : "";
  const email = rawEmail.trim().replace(/^<|>$/g, "").toLowerCase();

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { ok: false, message: "A valid email is required" },
      { status: 400 },
    );
  }

  const providedName =
    typeof body?.name === "string"
      ? body.name.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH)
      : "";
  const source = typeof body?.source === "string" ? body.source.slice(0, 64) : "all-aboard";
  const event = typeof body?.event === "string" ? body.event.slice(0, 120) : null;

  try {
    // Fast path: we already know this person. No duplicate row, no second
    // welcome email — the kiosk retries queued submissions and must be able to
    // do so without spamming anyone.
    const existing = await userDatabase.getUserByEmail(email);
    if (existing) {
      console.log(`[waitlist] ${email} already on the list (${source})`);
      return NextResponse.json({
        ok: true,
        created: false,
        userId: existing.id,
        welcomeEmailSent: false,
      });
    }

    // `createUser` seeds user_profiles, token_balances, user_streaks AND the
    // signup token grant inside one transaction, and returns the existing row
    // if it loses a concurrent insert — so there is nothing else to call here.
    const name = providedName || email.split("@")[0];
    const user = await userDatabase.createUser({
      email,
      name,
      profile: {
        preferences: {
          signupSource: source,
          signupEvent: event,
          signupAt: new Date().toISOString(),
        },
      },
    });

    // Distinguish "we made this row" from "we lost the race and got the
    // existing one back" — the only case the pre-check above misses, since
    // `createUser` returns the existing user on an email conflict rather than
    // throwing. `rowToUserWithProfile` always populates `createdAt`, so this is
    // readable on both paths; an unreadable one resolves to NOT created, because
    // a duplicate welcome email to an existing member is worse than a missing
    // one on a race that all but cannot happen at kiosk pace.
    const createdAt = new Date(user.createdAt).getTime();
    const created =
      Number.isFinite(createdAt) && Date.now() - createdAt < FRESH_WINDOW_MS;

    let welcomeEmailSent = false;
    if (created) {
      emailService.ensureInitialized();
      if (emailService.isConfigured()) {
        // Awaited so the kiosk can honestly tell the person to check their
        // inbox — but never allowed to fail the signup itself.
        welcomeEmailSent = await emailService
          .sendWelcomeEmail(email, name)
          .catch((error: unknown) => {
            console.error(`[waitlist] welcome email failed for ${email}:`, error);
            return false;
          });
      } else {
        console.warn(
          "[waitlist] email service not configured — no welcome email sent."
        );
      }
    }

    console.log(
      `[waitlist] ${created ? "created" : "existing"} ${email} via ${source}${event ? ` @ ${event}` : ""}`
    );

    return NextResponse.json({
      ok: true,
      created,
      userId: user.id,
      welcomeEmailSent,
    });
  } catch (error) {
    console.error(`[waitlist] enrolment failed for ${email}:`, error);
    return NextResponse.json(
      { ok: false, message: "Could not add that address right now" },
      { status: 500 },
    );
  }
}
