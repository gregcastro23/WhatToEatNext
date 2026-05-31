import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { feedDatabase } from "@/services/feedDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { TokenType, TransactionSourceType } from "@/types/economy";
import type { NextRequest} from "next/server";

/**
 * POST /api/economy/sync-credit
 * 
 * Internal server-to-server endpoint for syncing token credits from planetary-agents.
 * 
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 * 
 * Body:
 *   {
 *     userEmail: string,
 *     amounts: { spirit: string, essence: string, matter: string, substance: string },
 *     source: string,
 *     idempotencyKey: string
 *   }
 */
interface SyncCreditBody {
  userEmail: string;
  amounts: {
    spirit?: number | string;
    essence?: number | string;
    matter?: number | string;
    substance?: number | string;
  };
  source?: TransactionSourceType;
  idempotencyKey: string;
  /**
   * Optional context for user-visible airdrops (Sky Drops). When
   * source === 'transit_attunement' these populate the feed event + notification.
   */
  metadata?: {
    planet?: string;
    sign?: string;
    degree?: number;
    totalTokens?: number;
    degreeAgentId?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Sync Secret
    const authHeader = req.headers.get("X-Sync-Secret");
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

    if (!syncSecret || authHeader !== syncSecret) {
      return NextResponse.json(
        { ok: false, reason: "unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as SyncCreditBody;
    const { userEmail, amounts, source, idempotencyKey } = body;

    if (!userEmail || !amounts || !idempotencyKey) {
      return NextResponse.json(
        { ok: false, reason: "invalid_request", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Look up user ID by email — auto-provision agentic users
    let userResult = await executeQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
      if (!userEmail.toLowerCase().endsWith(AGENTIC_EMAIL_DOMAIN)) {
        return NextResponse.json(
          { ok: false, reason: "user_not_found" },
          { status: 404 }
        );
      }

      // Auto-provision agentic user
      userResult = await executeQuery<{ id: string }>(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified, is_agent, profile, preferences, login_count, created_at, updated_at)
         VALUES ($1, 'AGENT_NO_LOGIN', 'ALCHEMIST'::user_role, true, true, true, $2, '{}'::jsonb, 0, now(), now())
         ON CONFLICT (email) DO UPDATE SET is_agent = true
         RETURNING id`,
        [userEmail.toLowerCase(), JSON.stringify({ email: userEmail, isAgent: true })]
      );
    }

    const userId = userResult.rows[0].id;

    // 3. Check for existing idempotency hit (TokenEconomyService handles this in creditMultipleTokens, 
    // but the requirement says to check it explicitly)
    const existingTxn = await executeQuery(
      "SELECT id FROM token_transactions WHERE idempotency_key = $1 LIMIT 1",
      [idempotencyKey]
    );

    if (existingTxn.rows.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 4. Transform amounts to Credit array
    const credits: Array<{ tokenType: TokenType; amount: number }> = [
      { tokenType: "Spirit" as const, amount: Math.max(0, Number(amounts.spirit) || 0) },
      { tokenType: "Essence" as const, amount: Math.max(0, Number(amounts.essence) || 0) },
      { tokenType: "Matter" as const, amount: Math.max(0, Number(amounts.matter) || 0) },
      { tokenType: "Substance" as const, amount: Math.max(0, Number(amounts.substance) || 0) },
    ].filter(c => c.amount > 0);

    // 5. Apply credits
    const result = await tokenEconomy.creditMultipleTokens(
      userId,
      credits,
      source || "agents_yield",
      {
        idempotencyKey,
        description: `Sync: ${source || 'agents_yield'}`,
      }
    );

    if (!result) {
      // This might happen if idempotency was hit inside the service (race condition)
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 5b. Surface user-visible Sky Drops (automatic transit airdrops) in the
    // community feed + the notification bell. Best-effort: never block or fail
    // the credit on a surfacing error. PA routes only HUMAN transit_attunement
    // credits through this endpoint (agent attunements stay on the PA/Neon side),
    // so the feed actor is always a human and won't forward back to PA.
    if (source === "transit_attunement") {
      const total =
        body.metadata?.totalTokens ?? credits.reduce((s, c) => s + c.amount, 0);
      if (total > 0) {
        const { planet, sign, degree, degreeAgentId } = body.metadata ?? {};
        const where =
          planet && sign && degree !== undefined
            ? `${planet} at ${sign} ${Math.round(degree)}°`
            : planet ?? "an active transit";

        feedDatabase
          .createEvent(userId, "transit_attunement", {
            planet,
            sign,
            degree,
            totalTokens: total,
            degreeAgentId,
          })
          .catch((e) => console.error("[sync-credit] sky-drop feed event failed:", e));

        notificationDatabase
          .createNotification(
            userId,
            "transit_attunement",
            "🌠 Sky Drop received",
            `Your ${where} airdropped +${total.toFixed(1)} ESMS across Spirit, Essence, Matter & Substance.`,
            { metadata: { tokenType: "all", tokenAmount: total, planet, sign, degree } },
          )
          .catch((e) => console.error("[sync-credit] sky-drop notification failed:", e));
      }
    }

    // 6. Success Response
    return NextResponse.json({
      ok: true,
      balances: {
        spirit: result.spirit,
        essence: result.essence,
        matter: result.matter,
        substance: result.substance,
      },
    });

  } catch (error) {
    console.error("[sync-credit] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
