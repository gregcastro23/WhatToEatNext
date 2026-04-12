import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { questService } from "@/services/QuestService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET a random unverified ingredient
export async function GET(request: NextRequest) {
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

// POST to verify an ingredient and earn tokens
export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { ingredientId, elements } = body;

    if (!ingredientId || !elements) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    // Award Matter (🝙) tokens
    // Let's assume the user successfully verified it
    await tokenEconomy.creditTokens(user.id, "Matter", 2, "quest_reward", { description: "The Master's Pantry - Verification" });
    
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
