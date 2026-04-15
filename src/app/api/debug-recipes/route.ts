import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const q1 = await executeQuery("SELECT column_name FROM information_schema.columns WHERE table_name = 'recipes'", []);
    let q2;
    try {
      q2 = await executeQuery("SELECT id, cuisine_type, is_public, popularity_score FROM recipes LIMIT 1", []);
    } catch (innerE) {
      q2 = { error: String(innerE) };
    }
    
    let LocalRecipeServiceTest;
    try {
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");
      const mapped = await LocalRecipeService.getAllRecipes();
      LocalRecipeServiceTest = { count: mapped.length };
    } catch (innerE2) {
      LocalRecipeServiceTest = { error: String(innerE2) };
    }

    return NextResponse.json({ 
      columns: q1.rows.map((r: any) => r.column_name), 
      sample: q2, 
      LocalRecipeServiceTest 
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}
