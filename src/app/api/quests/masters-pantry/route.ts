import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";
import { questService } from "@/services/QuestService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT = { window: 60_000, max: 60, bucket: "quests-masters-pantry" };

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Assuming we check for ingredients where elemental_properties is null or lacks a specific key
    // For the sake of the quest, we just get any ingredient since our prompt says "lacks full elemental data"
    // Let's find one that might be missing data, or just pick a random one for the game loop
    const query = `
      SELECT id, name, description, elemental_properties 
      FROM ingredients 
      WHERE elemental_properties IS NULL 
         OR (elemental_properties->>'Fire') IS NULL
      ORDER BY RANDOM() 
      LIMIT 1
    `;
    const result = await executeQuery(query, []);
    
    if (result.rows.length === 0) {
      // Fallback: just return a random ingredient if all have data
      const fbResult = await executeQuery("SELECT id, name, description FROM ingredients ORDER BY RANDOM() LIMIT 1", []);
      if (fbResult.rows.length === 0) {
         return NextResponse.json({ success: false, error: "No ingredients found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, ingredient: fbResult.rows[0] });
    }

    return NextResponse.json({ success: true, ingredient: result.rows[0] });
  } catch (error) {
    console.error("[masters-pantry] GET Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch ingredient" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { ingredientId, elements } = body;

    if (!ingredientId || !elements) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    // Anti-farm guards: one reward per ingredient per day (idempotency key) and
    // a hard daily ceiling — previously this credited 2 Matter per POST at the
    // 60/min rate limit with no dedupe, i.e. ~120 Matter/min for a curl loop.
    const today = new Date().toISOString().slice(0, 10);
    const DAILY_VERIFICATION_CAP = 5;
    const capRes = await executeQuery(
      `SELECT COUNT(*)::int AS n FROM token_transactions
       WHERE user_id = $1 AND source_type = 'quest_reward' AND source_id = 'masters-pantry'
         AND created_at >= $2::date`,
      [user.id, today],
    ).catch(() => ({ rows: [{ n: 0 }] }));
    if ((capRes.rows[0]?.n ?? 0) >= DAILY_VERIFICATION_CAP) {
      return NextResponse.json(
        { success: false, error: "The Master's Pantry is closed for today — return tomorrow.", code: "daily_cap" },
        { status: 429 },
      );
    }

    // Award Matter (🝙) tokens
    const credited = await tokenEconomy.creditTokens(user.id, "Matter", 2, "quest_reward", {
      sourceId: "masters-pantry",
      description: "The Master's Pantry - Verification",
      idempotencyKey: `masters_pantry:${user.id}:${String(ingredientId)}:${today}`,
    });
    if (!credited) {
      return NextResponse.json({ success: false, error: "Verification could not be recorded" }, { status: 500 });
    }

    // Also report the event for the quest system
    await questService.reportEvent(user.id, "masters_pantry_verified");

    // Optional: update the ingredient in the database
    // await executeQuery("UPDATE ingredients SET elemental_properties = $1 WHERE id = $2", [elements, ingredientId]);

    const newBalances = await tokenEconomy.getBalances(user.id);

    return NextResponse.json({
      success: true,
      balances: newBalances,
      message: "Ingredient verified! You earned 2 🝙."
    });
  } catch (error) {
    console.error("[masters-pantry] POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit verification" }, { status: 500 });
  }
}
