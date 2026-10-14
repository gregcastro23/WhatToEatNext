/**
 * POST /api/recipes/[recipeId]/critique
 *
 * Request an on-demand culinary critique and alchemical pairing reflection
 * from a canonical historical agent (e.g. Leonardo da Vinci, Socrates, Carl Jung,
 * Cleopatra, Hildegard von Bingen, Isaac Newton, Aristotle, Paracelsus).
 *
 * Publication confirms the feed event only. Unrated reflections do not become
 * rated Community Tips or cooking attestations.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { RecipeCritiqueResponseSchema } from "@/lib/validation/recipeCritiqueResponse";
import { feedDatabase } from "@/services/feedDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RecipeCritiquePayloadSchema = z
  .object({
    agentSlug: z.string().optional(),
    focus: z.string().optional(),
    recipeName: z.string().optional(),
  })
  .passthrough();

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
  dietary_preferences: Record<string, unknown> | null;
}

const HISTORICAL_LORE_CRITIQUES: Record<
  string,
  (recipeName: string, cuisine?: string) => string
> = {
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
    // 0. Authentication Check (NextAuth session, JWT token, or INTERNAL_API_SECRET bearer)
    const authHeader = req.headers.get("authorization");
    const isInternalService = bearerMatches(
      authHeader,
      process.env.INTERNAL_API_SECRET,
    );
    const userId = isInternalService
      ? "internal-service"
      : await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to request critique",
        },
        { status: 401 },
      );
    }

    // 0b. Actor Rate Limiting (10 requests per minute per actor)
    const rl = await rateLimit(req, {
      window: 60_000,
      max: 10,
      bucket: "recipe-critique",
      identifier: userId,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded for recipe critiques" },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rl.resetMs / 1000).toString(),
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body" },
        { status: 400 },
      );
    }
    const parseResult = RecipeCritiquePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          errors: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }
    const validatedBody = parseResult.data;
    const agentSlug = (validatedBody.agentSlug ?? "leonardo-da-vinci")
      .toLowerCase()
      .trim();

    // 1. Authoritative Recipe Lookup
    const recipeResult = await executeQuery<RecipeRow>(
      `SELECT id, name, description, cuisine::text
       FROM recipes
       WHERE id::text = $1
       LIMIT 1`,
      [recipeId],
    );

    const [r] = recipeResult.rows;
    if (!r) {
      return NextResponse.json(
        {
          success: false,
          message: `Recipe "${recipeId}" not found in catalog`,
        },
        { status: 404 },
      );
    }

    const recipeName = r.name;
    const cuisine = r.cuisine ?? "Classical";

    // 2. Authoritative Agent Lookup
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

    const [agent] = agentResult.rows;
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          message: `Historical agent "${agentSlug}" not found`,
        },
        { status: 404 },
      );
    }

    const cleanName =
      agent.name ??
      agentSlug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
    const diet = agent.dietary_preferences ?? {};

    // 3. Generate Critique Reflection with 3 distinct content states:
    //    "live" | "gateway-degraded" | "curated"
    let critiqueText = "";
    let contentState: "live" | "gateway-degraded" | "curated" = "curated";

    // Try live gateway reasoning first
    try {
      const gatewayRes = await planetaryAgentsGateway.chatWithAgent({
        agentId: agentSlug,
        userMessage: `As ${cleanName}, please provide an authentic 2-3 sentence culinary critique and pairing tip for "${recipeName}". Emphasize your historical dietary philosophy (${diet.dietaryPhilosophy ?? "alchemical nourishment"}) and cultural perspective (${diet.culturalCuisine ?? cuisine}).`,
        culinaryContext: {
          selectedRecipeId: recipeId,
          cuisine,
        },
      });

      if (
        gatewayRes.status === "live" &&
        gatewayRes.content &&
        gatewayRes.content.trim().length > 20
      ) {
        critiqueText = gatewayRes.content.trim();
        contentState = "live";
      } else if (
        gatewayRes.status === "degraded" &&
        gatewayRes.content &&
        gatewayRes.content.trim().length > 20
      ) {
        critiqueText = gatewayRes.content.trim();
        contentState = "gateway-degraded";
        _logger.error(
          `[recipe-critique] Gateway chat returned degraded state for ${agentSlug}`,
        );
      }
    } catch (gatewayErr) {
      _logger.error(
        `[recipe-critique] Gateway chat failed for ${agentSlug}, falling back to curated lore:`,
        gatewayErr,
      );
    }

    // Fallback to authentic curated lore if live gateway was not available
    if (!critiqueText) {
      contentState = "curated";
      const loreGenerator = HISTORICAL_LORE_CRITIQUES[agentSlug];
      if (loreGenerator) {
        critiqueText = loreGenerator(recipeName, cuisine);
      } else {
        const element = agent.dominant_element ?? "Fire";
        const rawPhil =
          typeof diet.dietaryPhilosophy === "string"
            ? diet.dietaryPhilosophy
            : undefined;
        const philosophy = rawPhil
          ? ` As I have always observed: "${rawPhil.slice(0, 120)}..."`
          : "";
        critiqueText = `In observing "${recipeName}", the ${element} element harmonizes the culinary transformation.${philosophy} A balanced preparation that honors both bodily constitution and culinary heritage.`;
      }
      _logger.error(
        `[recipe-critique] Used curated lore fallback for ${agentSlug}`,
      );
    }

    // 4. Record to feed_events (Dual-writes into user_recipe_interactions)
    // Separates generated content from confirmed save/publication failure.
    // Removes invented 5-star rating, madeIt: true, and made_it: true.
    let published = false;
    let persistedAt: string | undefined;

    try {
      published = await feedDatabase.createEvent(
        agent.id,
        "recipe_review",
        {
          recipeId,
          recipeName,
          review: critiqueText,
          source: "catalog_critique",
          agentSlug,
          agentName: cleanName,
          dominantElement: agent.dominant_element ?? "Spirit",
          contentState,
        },
        false,
        { share: true, explicit: true },
      );
      if (published) {
        persistedAt = new Date().toISOString();
      }
    } catch (persistErr) {
      _logger.error(
        `[recipe-critique] Failed to persist critique to feed for recipe ${recipeId}:`,
        persistErr,
      );
      published = false;
    }

    const responsePayload = {
      success: true,
      critique: {
        author: cleanName,
        tip: critiqueText,
        agentSlug,
        dominantElement: agent.dominant_element,
        contentState,
        published,
        ...(persistedAt ? { persistedAt } : {}),
      },
      review: {
        author: cleanName,
        tip: critiqueText,
        agentSlug,
        dominantElement: agent.dominant_element,
        contentState,
        published,
        ...(persistedAt ? { postedAt: persistedAt } : {}),
      },
    };

    // Validate response payload against contract
    RecipeCritiqueResponseSchema.parse(responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    _logger.error(`[POST /api/recipes/${recipeId}/critique] failed:`, error);
    return NextResponse.json(
      { success: false, message: msg || "Failed to generate critique" },
      { status: 500 },
    );
  }
}
