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
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { RecipeCritiqueResponseSchema } from "@/lib/validation/recipeCritiqueResponse";
import { feedDatabase } from "@/services/feedDatabaseService";
import { generateHistoricalReflection } from "@/services/recipes/historicalRecipeReflection";

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

    const { text: critiqueText, contentState } = await generateHistoricalReflection({
      agentSlug, agentName: cleanName, diet, cuisine, recipeName, recipeId,
      dominantElement: agent.dominant_element,
    });

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
