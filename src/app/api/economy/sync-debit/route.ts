import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { agentMonicaWithMethod } from "@/utils/agentMonicaResolver";
import { normaliseNatalPositions } from "@/utils/fullChartMonica";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/economy/sync-debit
 *
 * Internal server-to-server endpoint for the planetary-agents action engine
 * to debit ESMS tokens from an agentic user when they perform an action
 * (feed post, transmutation, etc).
 *
 * Auth: X-Sync-Secret header matched against ALCHM_KITCHEN_SYNC_SECRET env var.
 *
 * Responses:
 *   200 { ok: true, transactionGroupId, balances }
 *   401 { error: "Unauthorized" }
 *   400 { ok: false, reason: "invalid_request", message }
 *   404 { ok: false, reason: "user_not_found" }
 *   402 { ok: false, reason: "insufficient_funds", balances }
 *   409 { ok: false, reason: "already_applied" }
 *   500 { ok: false, reason: "internal_error", message }
 */

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

function deriveAgentDisplayName(
  email: string,
  metadata: Record<string, unknown> | undefined,
): string {
  const fromMeta = typeof metadata?.agentName === "string" ? metadata.agentName.trim() : "";
  if (fromMeta) return fromMeta;
  const local = email.split("@")[0] ?? "";
  if (!local) return "Agent";
  return local
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ")
    .trim() || "Agent";
}

interface SyncDebitBody {
  userEmail: string;
  amounts: {
    spirit?: number | string;
    essence?: number | string;
    matter?: number | string;
    substance?: number | string;
  };
  operationType?: string;
  source?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("X-Sync-Secret");
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
  if (!syncSecret || authHeader !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncDebitBody;
  try {
    body = (await req.json()) as SyncDebitBody;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { userEmail, amounts, idempotencyKey, operationType, source, metadata } = body;
  if (!userEmail || !amounts || !idempotencyKey) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_request",
        message: "userEmail, amounts, and idempotencyKey are required",
      },
      { status: 400 },
    );
  }

  // Parse and validate amounts — pass as strings so pg sends text, avoiding
  // 'operator is not unique' on DECIMAL columns
  const spirit = Math.max(0, Number(amounts.spirit) || 0);
  const essence = Math.max(0, Number(amounts.essence) || 0);
  const matter = Math.max(0, Number(amounts.matter) || 0);
  const substance = Math.max(0, Number(amounts.substance) || 0);

  if (spirit + essence + matter + substance <= 0) {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "At least one token amount must be positive" },
      { status: 400 },
    );
  }

  // Pass amounts as fixed-point strings so pg treats them as text and Postgres
  // can unambiguously coerce to DECIMAL(12,4)
  const sSpirit = spirit.toFixed(4);
  const sEssence = essence.toFixed(4);
  const sMatter = matter.toFixed(4);
  const sSubstance = substance.toFixed(4);

  const email = userEmail.toLowerCase();
  const description = [
    operationType ? `Agent op: ${operationType}` : "Agent op",
    source ? `(${source})` : null,
    metadata && Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
  ].filter(Boolean).join(" ");

  try {
    // 1. Look up user — auto-provision agentic emails.
    //
    // `profile_name` is selected because the monica below MUST be resolved from
    // the name this row actually STORES. `checkAgentMonicaDrift.ts` re-derives
    // every value from `user_profiles.name`, so a writer that classified some
    // other string would be reported as drift on a row it wrote correctly.
    /** The name the row carries — the string the monica must be resolved from. */
    let storedName: string | null = null;
    let userResult = await executeQuery<{ id: string; profile_name: string | null }>(
      `SELECT u.id, up.name AS profile_name
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.email = $1 LIMIT 1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      if (!email.endsWith(AGENTIC_EMAIL_DOMAIN)) {
        return NextResponse.json({ ok: false, reason: "user_not_found" }, { status: 404 });
      }
      const displayName = deriveAgentDisplayName(email, metadata);
      storedName = displayName;
      userResult = await executeQuery<{ id: string; profile_name: string | null }>(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified, is_agent, name, profile, preferences, login_count, created_at, updated_at)
         VALUES ($1, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true, $2, $3, '{}'::jsonb, 0, now(), now())
         ON CONFLICT (email) DO UPDATE SET is_agent = true
         RETURNING id`,
        [email, displayName, JSON.stringify({ email, isAgent: true, name: displayName })],
      );
      // Create matching user_profiles row so feed/commensals lookups surface a name.
      // Done as a separate statement (with ON CONFLICT) so it's a no-op for concurrent inserts.
      await executeQuery(
        `INSERT INTO user_profiles (user_id, name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()`,
        [userResult.rows[0].id, displayName],
      );
    }
    const userId = userResult.rows[0].id;
    storedName ??= userResult.rows[0].profile_name;

    // 1.5 Update Agent Profile if metadata present.
    // Treat the payload as Record<string, unknown> — the planetary-agents
    // engine ships untyped JSON so we can't lean on the route's own interface.
    const agentProfileRaw = metadata?.agentProfile;
    if (agentProfileRaw && typeof agentProfileRaw === "object") {
      const ap = agentProfileRaw as Record<string, unknown>;

      // Ensure base user identity stays fresh
      if (ap.image || ap.name) {
        await executeQuery(
          `UPDATE users SET
             image = COALESCE($2, image),
             name = COALESCE($3, name)
           WHERE id = $1`,
          [userId, (ap.image as string) || null, (ap.name as string) || null],
        );
      }

      const bioCandidate =
        (ap.bio as string | undefined) ||
        (ap.monicaCreationStory as string | undefined) ||
        null;
      const dominantElementCandidate = (ap.dominantElement as string | undefined) ?? null;

      // §18e/§18h — WTEN owns the monica. It is computed here from the agent's
      // OWN name, never taken from the AlchmAgentsETH payload: the old
      // `COALESCE(payload.monicaConstant, ...)` is how 3600 rows came to hold
      // round (0,1) sentinels that were never a thermodynamic monica at all.
      // A name that resolves to no construction yields null, which the COALESCE
      // below reads as "leave the stored value alone".
      //
      // ── Two bugs lived in the two lines this replaces ────────────────────
      //
      //     const agentName = (ap.name as string | undefined) ?? null;
      //     const resolvedMonica = agentName ? agentMonicaFromName(agentName) : null;
      //
      // 1. WRONG INPUT. `ap.name` is an optional payload field, while the name
      //    this endpoint DERIVES and STORES comes from `deriveAgentDisplayName`
      //    (the email local-part, title-cased). When the producer omits
      //    `agentProfile.name` — which it evidently does — `agentName` was null,
      //    so no monica was computed, while `hasNatalChart` was evaluated from a
      //    different field and the chart WAS written. Hence rows with a chart, a
      //    perfectly resolvable stored name, and a NULL monica.
      // 2. MISSING CONSTRUCTION. `agentMonicaFromName` covers single-body only
      //    and returns null for a Moon-phase agent, so every phase agent was
      //    inserted unclassified even when a name was supplied.
      //
      // `[MEASURED 2026-07-28]` 110 agents were sitting unclassified: 92 phase
      // (bug 2), 16 single-body whose stored names resolve fine (bug 1), 2
      // genuinely unparseable. NONE of the 1506 agents in this family had EVER
      // been classified within five minutes of creation — every value they hold
      // came from a backfill.
      //
      // Resolution order is the stored name FIRST. `checkAgentMonicaDrift.ts`
      // re-derives from `user_profiles.name`, so classifying any other string
      // would report as drift on a row written correctly. `ap.name` remains a
      // fallback for the case where no profile name exists yet.
      const onUnclassifiedPhase = (error: unknown) =>
        console.warn(
          `[sync-debit] phase agent with an unclassifiable phase: ${storedName ?? "(no name)"} —` +
            ` left for the nightly backfill to surface. ${String(error)}`,
        );
      const resolved =
        (storedName ? agentMonicaWithMethod(storedName, onUnclassifiedPhase) : null) ??
        (typeof ap.name === "string" ? agentMonicaWithMethod(ap.name, onUnclassifiedPhase) : null);
      const resolvedMonica = resolved?.monica ?? null;
      const monicaCandidate = resolvedMonica?.combined ?? null;
      // Every one of these three is bound to a `$n::boolean` in the UPDATE
      // below, so each MUST be a real boolean. `||` and `&&` return the
      // *operand*, not a boolean — `ap.birthDate || ap.birthTime || ...`
      // evaluated to the birth date itself, and Postgres rejected it with
      // `invalid input syntax for type boolean: "1756-01-27"` (22P02). That
      // threw before the debit ran, so EVERY call carrying birth data 500'd and
      // no agent operation was charged. Boolean() is the whole fix; keep it on
      // all three so the next field added here can't reintroduce it.
      const hasNatalChart = Boolean(
        ap.natalChart && typeof ap.natalChart === "object" && Object.keys(ap.natalChart).length > 0,
      );
      // Strip the fabricated `longitude: 0` on the way in — see
      // normaliseNatalPositions. This endpoint is a live ingest path, so
      // cleaning stored rows without cleaning here would let the key return.
      const natalPositions = normaliseNatalPositions(ap.natalPositions);
      const hasNatalPositions = Boolean(
        Array.isArray(natalPositions) && (natalPositions as unknown[]).length > 0,
      );
      const hasBirthData = Boolean(ap.birthDate || ap.birthTime || ap.birthLocation);

      // COALESCE so a null/empty field in this fire never wipes a previously
      // written value — every tick keeps the row fresh without regression.
      //
      // ── §18o: each construction writes its OWN column ────────────────────
      //
      // Four CHECK constraints police this, and the previous statement satisfied
      // them only by accident. It wrote `monica_constant` plus
      // `monica_method='single-body'` and never `monica_single`, which
      // `monica_method_matches_column` REJECTS:
      //
      //   monica_constant_single_body_only  constant IS NULL OR method='single-body'
      //   monica_method_matches_column      method='X' requires monica_X NOT NULL
      //   monica_one_construction           at most ONE construction column set
      //
      // It never fired only because the resolution bug above left the method NULL.
      // Fixing the resolution ALONE would therefore have converted a silent NULL
      // into a failed debit on every agent-provisioning call — which is why this
      // is verified by executing it, not by reading it.
      //
      // Every write is gated on `monica_method IS NULL`, so this performs
      // FIRST-TIME classification only. Re-classification belongs to the backfill;
      // an unconditional write could set a second construction column on a row
      // that already has one (violating monica_one_construction) or overwrite the
      // hand-authored full-chart value of a chart-bearing agent.
      //
      // NB: SQL comments inside this template literal must not contain backticks —
      // a backtick terminates the literal and breaks the build.
      await executeQuery(
        `UPDATE user_profiles SET
           bio              = COALESCE($2, bio),
           natal_chart      = CASE WHEN $3::boolean THEN $4::jsonb ELSE natal_chart END,
           natal_positions  = CASE WHEN $5::boolean THEN $6::jsonb ELSE natal_positions END,
           dominant_element = COALESCE($7, dominant_element),
           -- See the note above this statement: value into its own construction
           -- column, first-time classification only.
           monica_constant  = CASE WHEN monica_method IS NULL AND $13 = 'single-body'
                                   THEN $8::numeric ELSE monica_constant END,
           monica_single    = CASE WHEN monica_method IS NULL AND $13 = 'single-body'
                                   THEN $8::numeric ELSE monica_single END,
           monica_two_body  = CASE WHEN monica_method IS NULL AND $13 = 'two-body'
                                   THEN $8::numeric ELSE monica_two_body END,
           monica_diurnal   = CASE WHEN monica_method IS NULL AND $13 IS NOT NULL
                                   THEN $11::numeric ELSE monica_diurnal END,
           monica_nocturnal = CASE WHEN monica_method IS NULL AND $13 IS NOT NULL
                                   THEN $12::numeric ELSE monica_nocturnal END,
           monica_method    = COALESCE(monica_method, $13),
           birth_data       = CASE WHEN $9::boolean THEN $10::jsonb ELSE birth_data END,
           updated_at       = now()
         WHERE user_id = $1`,
        [
          userId,
          bioCandidate,
          hasNatalChart,
          JSON.stringify(ap.natalChart || {}),
          hasNatalPositions,
          JSON.stringify(natalPositions || []),
          dominantElementCandidate,
          monicaCandidate,
          hasBirthData,
          JSON.stringify({
            date: ap.birthDate ?? null,
            time: ap.birthTime ?? null,
            location: ap.birthLocation ?? null,
          }),
          resolvedMonica?.diurnal ?? null,
          resolvedMonica?.nocturnal ?? null,
          // The construction that actually produced the value — 'two-body' for a
          // Moon-phase agent. Hardcoding 'single-body' here would have stamped a
          // phase agent with the wrong method, which `checkAgentMonicaDrift.ts`
          // reports as `wrong-method` and the §18o column constraint rejects.
          resolved?.method ?? null,
        ]
      );
    }

    // 2. Idempotency check
    const dup = await executeQuery(
      `SELECT 1 FROM token_transactions WHERE idempotency_key LIKE $1 LIMIT 1`,
      [`${idempotencyKey}:%`],
    );
    if (dup.rows.length > 0) {
      // Even on idempotency hit, return userId so the caller can persist the
      // alchm.kitchen UUID for downstream profile linking.
      return NextResponse.json(
        { ok: false, reason: "already_applied", userId },
        { status: 409 },
      );
    }

    // 3. Ensure balance row, read current balances
    await executeQuery(
      `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );
    const balRow = await executeQuery<{
      spirit: string; essence: string; matter: string; substance: string;
    }>(
      `SELECT spirit::text, essence::text, matter::text, substance::text FROM token_balances WHERE user_id = $1`,
      [userId],
    );
    const bal = balRow.rows[0] ?? { spirit: "0", essence: "0", matter: "0", substance: "0" };
    const curSpirit = parseFloat(bal.spirit) || 0;
    const curEssence = parseFloat(bal.essence) || 0;
    const curMatter = parseFloat(bal.matter) || 0;
    const curSubstance = parseFloat(bal.substance) || 0;

    if (curSpirit < spirit || curEssence < essence || curMatter < matter || curSubstance < substance) {
      return NextResponse.json(
        {
          ok: false,
          reason: "insufficient_funds",
          userId,
          balances: { spirit: curSpirit, essence: curEssence, matter: curMatter, substance: curSubstance },
        },
        { status: 402 },
      );
    }

    // 4. Atomic debit — UPDATE using text-cast params to avoid operator ambiguity.
    //    The amounts are passed as fixed-point strings (e.g. "2.0000"), which
    //    Postgres coerces to DECIMAL without ambiguity.
    const groupId = randomUUID();
    const updateRes = await executeQuery<{ spirit: string; essence: string; matter: string; substance: string }>(
      `UPDATE token_balances
       SET spirit    = spirit    - $2::decimal,
           essence   = essence   - $3::decimal,
           matter    = matter    - $4::decimal,
           substance = substance - $5::decimal,
           updated_at = now()
       WHERE user_id = $1
         AND spirit    >= $2::decimal
         AND essence   >= $3::decimal
         AND matter    >= $4::decimal
         AND substance >= $5::decimal
       RETURNING spirit::text, essence::text, matter::text, substance::text`,
      [userId, sSpirit, sEssence, sMatter, sSubstance],
    );

    if (updateRes.rows.length === 0) {
      // Race condition lost — re-read and return 402
      const cur2 = await executeQuery<{ spirit: string; essence: string; matter: string; substance: string }>(
        `SELECT spirit::text, essence::text, matter::text, substance::text FROM token_balances WHERE user_id = $1`,
        [userId],
      );
      const b2 = cur2.rows[0] ?? { spirit: "0", essence: "0", matter: "0", substance: "0" };
      return NextResponse.json(
        {
          ok: false,
          reason: "insufficient_funds",
          userId,
          balances: {
            spirit: parseFloat(b2.spirit) || 0,
            essence: parseFloat(b2.essence) || 0,
            matter: parseFloat(b2.matter) || 0,
            substance: parseFloat(b2.substance) || 0,
          },
        },
        { status: 402 },
      );
    }

    // 5. Write ledger rows — per non-zero token type, with child idempotency keys
    const tokenEntries: Array<{ type: string; amount: string }> = [
      { type: "Spirit", amount: sSpirit },
      { type: "Essence", amount: sEssence },
      { type: "Matter", amount: sMatter },
      { type: "Substance", amount: sSubstance },
    ].filter((e) => parseFloat(e.amount) > 0);

    for (const entry of tokenEntries) {
      await executeQuery(
        `INSERT INTO token_transactions
           (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
         VALUES ($1, $2, $3, -$4::decimal, 'agents_operation', $5, $6, $7)`,
        [
          groupId,
          userId,
          entry.type,
          entry.amount,
          operationType ?? null,
          description,
          `${idempotencyKey}:${entry.type}`,
        ],
      );
    }

    const final = updateRes.rows[0];
    return NextResponse.json({
      ok: true,
      userId,
      transactionGroupId: groupId,
      balances: {
        spirit: parseFloat(final.spirit) || 0,
        essence: parseFloat(final.essence) || 0,
        matter: parseFloat(final.matter) || 0,
        substance: parseFloat(final.substance) || 0,
      },
    });
  } catch (error) {
    // Unique-violation on idempotency_key (race condition) → 409
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json({ ok: false, reason: "already_applied" }, { status: 409 });
    }
    console.error("[sync-debit] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
