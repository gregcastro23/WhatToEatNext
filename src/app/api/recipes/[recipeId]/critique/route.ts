/**
 * POST /api/recipes/[recipeId]/critique
 *
 * Request an on-demand culinary critique and alchemical pairing reflection
 * from a canonical historical agent (e.g. Leonardo da Vinci, Socrates, Carl Jung,
 * Cleopatra, Hildegard von Bingen, Isaac Newton, Aristotle, Paracelsus).
 *
 * Persists the reflection to `feed_events` (with dual-write to `user_recipe_interactions`)
 * so it permanently joins Community Tips on the recipe view.
 */

import { NextResponse, type NextRequest } from "next/server";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { feedDatabase } from "@/services/feedDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
}

interface AgentLookupRow {
  id: string;
  email: string;
  name: string | null;
  dominant_element: string | null;
  bio: string | null;
  dietary_preferences: any;
}

const HISTORICAL_LORE_CRITIQUES: Record<string, (recipeName: string, cuisine?: string) => string> = {
  "leonardo-da-vinci": (name) =>
    `The body should never be a tomb for other living creatures. In "${name}", observe the mathematical harmony of botanical essences — when vegetables and pure oils are united with geometric balance, the dish nourishes both the inventive intellect and vital spirit.`,
  socrates: (name) =>
    `We must examine what we consume: do we eat to live, or live to eat? "${name}" offers sustenance without decadent ostentation. When approached with temperance and mindful savoring, even a humble dish becomes a teacher of virtuous living.`,
  "carl-jung": (name) =>
    `Every recipe is an archetypal mandala of transformation. In preparing "${name}", the heat of the hearth mirrors the psychological crucible where shadow and light integrate. Notice how the fermented and layered notes evoke the collective unconscious of human culinary memory.`,
  cleopatra: (name) =>
    `True culinary mastery honors the sacred waters and aromatic gifts of the earth. "${name}" carries the royal harmony prized in Alexandria — fragrant herbs and radiant oils that revitalize the skin and elevate the palace table into a temple of vitality.`,
  "hildegard-of-bingen": (name) =>
    `Let the viriditas — the green life force instilled by the Divine — flourish through this meal. In "${name}", the warming spices and nourishing herbs calm melancholy of the bile and infuse the soul with celestial vitality and inner calm.`,
  "isaac-newton": (name) =>
    `Culinary transformation obeys immutable natural laws. The thermal conduction applied to "${name}" creates an equilibrium of chemical extraction. When crystalline salt and volatile aromas are measured with precision, harmony is mathematically inevitable.`,
  aristotle: (name) =>
    `Excellence is not an act, but a habit of moderation. In "${name}", the golden mean between dry and moist, heating and cooling, is preserved. When neither seasoning nor heat is taken to excess, true culinary eudaimonia is attained.`,
  paracelsus: (name) =>
    `The dose makes the poison and the remedy alike. Within "${name}", the three alchemical primes — Salt, Sulphur, and Mercury — dance between the fire and the vessel. Savor its volatile oils, for food is the daily medicine of the living alchemist.`,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
): Promise<NextResponse> {
  const { recipeId } = await params;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      agentSlug?: string;
      focus?: string;
      recipeName?: string;
    };

    const agentSlug = (body.agentSlug ?? "leonardo-da-vinci").toLowerCase().trim();

    // 1. Resolve Recipe
    let recipeName = body.recipeName ?? "Alchemical Dish";
    let cuisine = "Classical";

    const recipeResult = await executeQuery<RecipeRow>(
      `SELECT id, name, description, cuisine::text
       FROM recipes
       WHERE id::text = $1
       LIMIT 1`,
      [recipeId],
    );

    if (recipeResult.rows.length > 0) {
      const r = recipeResult.rows[0]!;
      recipeName = r.name || recipeName;
      cuisine = r.cuisine || cuisine;
    }

    // 2. Resolve Agent User
    const agentResult = await executeQuery<AgentLookupRow>(
      `SELECT u.id, u.email, COALESCE(up.name, u.name) AS name, up.dominant_element,
              up.bio, up.dietary_preferences
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.is_agent = true
         AND (
           LOWER(u.email) = LOWER($1) || '@agentic.alchm.kitchen'
           OR LOWER(u.email) = LOWER($1)
           OR u.id::text = $1
         )
       ORDER BY (LOWER(u.email) LIKE '%@agentic.alchm.kitchen') DESC
       LIMIT 1`,
      [agentSlug],
    );

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Historical agent "${agentSlug}" not found` },
        { status: 404 },
      );
    }

    const agent = agentResult.rows[0]!;
    const cleanName = agent.name ?? agentSlug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const diet = agent.dietary_preferences ?? {};

    // 3. Generate Critique Reflection
    let critiqueText = "";

    // Try live gateway reasoning first
    try {
      const gatewayRes = await planetaryAgentsGateway.chatWithAgent({
        agentId: agentSlug,
        userMessage: `As ${cleanName}, please provide an authentic 2-3 sentence culinary critique and pairing tip for "${recipeName}". Emphasize your historical dietary philosophy (${diet.dietaryPhilosophy || "alchemical nourishment"}) and cultural perspective (${diet.culturalCuisine || cuisine}).`,
        culinaryContext: {
          selectedRecipeId: recipeId,
          cuisine,
        },
      });

      if (gatewayRes.content && gatewayRes.content.trim().length > 20) {
        critiqueText = gatewayRes.content.trim();
      }
    } catch (gatewayErr) {
      _logger.warn(`[recipe-critique] Gateway chat failed for ${agentSlug}, falling back to curated lore:`, gatewayErr);
    }

    // Fallback to authentic dietary lore
    if (!critiqueText) {
      const loreGenerator = HISTORICAL_LORE_CRITIQUES[agentSlug];
      if (loreGenerator) {
        critiqueText = loreGenerator(recipeName, cuisine);
      } else {
        const element = agent.dominant_element ?? "Fire";
        const philosophy = diet.dietaryPhilosophy
          ? ` As I have always observed: "${diet.dietaryPhilosophy.slice(0, 120)}..."`
          : "";
        critiqueText = `In observing "${recipeName}", the ${element} element harmonizes the culinary transformation.${philosophy} A balanced preparation that honors both bodily constitution and culinary heritage.`;
      }
    }

    // 4. Record to feed_events (Dual-writes into user_recipe_interactions)
    await feedDatabase.createEvent(
      agent.id,
      "recipe_review",
      {
        recipeId,
        recipeName,
        rating: 5,
        review: critiqueText,
        source: "catalog_review",
        agentSlug,
        agentName: cleanName,
        dominantElement: agent.dominant_element ?? "Spirit",
        madeIt: true,
        made_it: true,
      },
      false,
      { share: true, explicit: true },
    );

    return NextResponse.json({
      success: true,
      review: {
        author: cleanName,
        rating: 5,
        tip: critiqueText,
        agentSlug,
        dominantElement: agent.dominant_element,
        postedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    _logger.error(`[POST /api/recipes/${recipeId}/critique] failed:`, error);
    return NextResponse.json(
      { success: false, message: msg || "Failed to generate critique" },
      { status: 500 },
    );
  }
}
