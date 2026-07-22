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
/**
 * Sources that are once-per-user-per-UTC-day BY DEFINITION, and therefore get
 * the semantic daily guard in §3b plus the chart requirement in §2b.
 *
 * `agents_yield` is also the value `source` defaults to when a caller omits it,
 * so an omitted source lands here too — deliberately, since that is exactly what
 * Planetary Agents' push does.
 *
 * Everything else routed through this endpoint (transit_attunement / Sky Drops,
 * and the rest) is legitimately multi-per-day and must NOT be day-capped.
 */
const DAILY_YIELD_SOURCES: ReadonlySet<string> = new Set([
  "agents_yield",
  "daily_yield",
]);

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
        { ok: false, reason: "unauthorized", error: "Unauthorized" },
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

    // `source` defaults to agents_yield when the caller omits it, so the
    // resolved value — not the raw field — decides which rules apply below.
    const resolvedSource = source || "agents_yield";
    const isDailyYield = DAILY_YIELD_SOURCES.has(resolvedSource);

    // 2. Look up user ID by email.
    let userResult = await executeQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
      if (!userEmail.toLowerCase().endsWith(AGENTIC_EMAIL_DOMAIN)) {
        return NextResponse.json(
          { ok: false, reason: "user_not_found", error: "user_not_found" },
          { status: 404 }
        );
      }

      // A daily-yield credit must never CREATE the account it pays. Auto-
      // provisioning here minted paid, chart-less users for any unrecognised
      // @agentic.alchm.kitchen address — which is how two 2026-07-19 smoke-test
      // vessels ended up drawing daily yield. Identity creation belongs to the
      // agent-creation path (which builds a chart); this endpoint only credits
      // identities that already exist.
      if (isDailyYield) {
        return NextResponse.json(
          {
            ok: false,
            reason: "user_not_found",
            error: "user_not_found",
            message:
              "Daily yield cannot auto-provision an account. Create the agent first.",
          },
          { status: 404 }
        );
      }

      // Auto-provision agentic user (non-yield sources only)
      userResult = await executeQuery<{ id: string }>(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified, is_agent, profile, preferences, login_count, created_at, updated_at)
         VALUES ($1, 'AGENT_NO_LOGIN', 'ALCHEMIST'::user_role, true, true, true, $2, '{}'::jsonb, 0, now(), now())
         ON CONFLICT (email) DO UPDATE SET is_agent = true
         RETURNING id`,
        [userEmail.toLowerCase(), JSON.stringify({ email: userEmail, isAgent: true })]
      );
    }

    const userId = userResult.rows[0].id;

    // 2b. Daily yield requires a chart — the SAME eligibility predicate the
    // in-repo cron uses (agentDailyYield.ts: non-empty `natal_positions`). Two
    // producers paying the same population must agree on who that population
    // is, or the one with the looser rule silently defines it.
    if (isDailyYield) {
      const chart = await executeQuery<{ ok: boolean }>(
        `SELECT (up.natal_positions IS NOT NULL
                 AND up.natal_positions::text NOT IN ('[]', 'null', '{}')) AS ok
           FROM user_profiles up WHERE up.user_id = $1 LIMIT 1`,
        [userId]
      );
      if (!chart.rows[0]?.ok) {
        return NextResponse.json(
          {
            ok: false,
            reason: "no_chart",
            message:
              "Daily yield requires a natal chart (matches the agents-daily-yield cron predicate).",
          },
          { status: 422 }
        );
      }
    }

    // 3. Idempotency pre-check. creditMultipleTokens stores per-axis keys suffixed
    // with the token type (`<key>:Spirit` …), so probing the raw key alone would
    // miss a prior credit — the replay would then fall through to a 200 and (for
    // transit_attunement) re-fire the Sky Drop feed/bell every hour the engine
    // re-checks. Probe the raw key AND the four suffixed forms so a replay is
    // reliably caught here → 409, no double credit, no duplicate surfacing.
    const idempotencyVariants = [
      idempotencyKey,
      ...(["Spirit", "Essence", "Matter", "Substance"] as const).map(
        (t) => `${idempotencyKey}:${t}`,
      ),
    ];
    const existingTxn = await executeQuery(
      "SELECT id FROM token_transactions WHERE idempotency_key = ANY($1::text[]) LIMIT 1",
      [idempotencyVariants]
    );

    if (existingTxn.rows.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 3b. SEMANTIC daily guard — the one that actually stops the double-credit.
    //
    // Key-based idempotency cannot catch this class of duplicate. Two producers
    // pay the same daily yield under structurally non-colliding namespaces:
    //   in-repo cron   DailyYieldService.ts:330  `daily:agents:<uuid>:<date>`
    //   this endpoint  caller-supplied           `agentic:yield:<email>:<date>`
    // Different strings for the same economic event, so §3 above can never
    // return 409 no matter how many key variants it probes. Measured
    // 2026-07-19..21: 30 agents/day paid twice, ~240 tokens/day of excess.
    //
    // Daily yield is once-per-user-per-UTC-day BY DEFINITION, so check that
    // invariant directly instead of trying to make the key strings agree. This
    // is deliberately scoped to the daily-yield sources — transit attunement,
    // Sky Drops and the other sync sources are legitimately multi-per-day.
    if (isDailyYield) {
      const sameDay = await executeQuery<{ id: string }>(
        `SELECT id FROM token_transactions
          WHERE user_id = $1
            AND source_type = $2
            AND (created_at AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date
          LIMIT 1`,
        [userId, resolvedSource]
      );
      if (sameDay.rows.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            reason: "already_applied",
            message: `${resolvedSource} already credited for this UTC day`,
          },
          { status: 409 }
        );
      }
    }

    // 4. Transform amounts to Credit array
    const credits: Array<{ tokenType: TokenType; amount: number }> = [
      { tokenType: "Spirit" as const, amount: Math.max(0, Number(amounts.spirit) || 0) },
      { tokenType: "Essence" as const, amount: Math.max(0, Number(amounts.essence) || 0) },
      { tokenType: "Matter" as const, amount: Math.max(0, Number(amounts.matter) || 0) },
      { tokenType: "Substance" as const, amount: Math.max(0, Number(amounts.substance) || 0) },
    ].filter(c => c.amount > 0);

    // 5. Apply credits. `resolvedSource` (not a third copy of the `source ||
    // "agents_yield"` fallback) — the value that was GUARDED above must be the
    // value that is WRITTEN, or a future edit to one can silently desync them.
    const result = await tokenEconomy.creditMultipleTokens(
      userId,
      credits,
      resolvedSource,
      {
        idempotencyKey,
        description: `Sync: ${resolvedSource}`,
      }
    );

    if (!result) {
      // This might happen if idempotency was hit inside the service (race condition)
      return NextResponse.json(
        { ok: false, reason: "already_applied" },
        { status: 409 }
      );
    }

    // 5a. Stamp the daily-claim timestamp, so the guard works in BOTH
    // directions. §3b stops this endpoint double-paying after the cron; this
    // stops the CRON double-paying after this endpoint, by reusing the check it
    // already performs (`tokenEconomy.hasClaimedToday`, which reads
    // last_daily_claim_agents_at). Without it the fix would be one-sided and
    // hold only by scheduling luck — the cron fires at 00:30 UTC and PA has so
    // far trickled in later, but nothing guarantees that ordering.
    if (isDailyYield) {
      await tokenEconomy.updateDailyClaimTimestamp(
        userId,
        resolvedSource === "agents_yield" ? "agents" : "main",
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
