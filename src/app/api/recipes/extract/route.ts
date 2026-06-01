/**
 * POST /api/recipes/extract
 *
 * Recipe ingestion: turn pasted text OR uploaded photo(s) into structured,
 * alchemized recipe(s) for the user's Lab Book. Returns the extracted recipes
 * (NOT yet saved) so the client can preview/edit before persisting via
 * POST /api/users/me/recipes/custom.
 *
 * Token-gated like /api/recipes/refine: a live-priced Essence debit is the
 * economic throttle. The debit is refunded if extraction throws or finds
 * nothing, so a flaky LLM call never costs the user tokens.
 *
 * Input:
 *   - application/json:        { text: string }
 *   - multipart/form-data:     images[] (File, up to 4) and/or text
 */
import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import {
  applyPersonalizedPricing,
  getPersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { OPERATION_COSTS } from "@/lib/economy/operationCosts";
import { alchemizeExtractedRecipe } from "@/lib/recipes/alchemizeExtractedRecipe";
import {
  extractRecipesFromImages,
  extractRecipesFromText,
} from "@/lib/recipes/extractRecipe";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT = 20_000;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB each
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // ── Parse input (JSON {text} or multipart images[]/text) ──────────────
    const contentType = request.headers.get("content-type") ?? "";
    let text = "";
    const imageDataUrls: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const t = form.get("text");
      if (typeof t === "string") text = t;

      const files = form
        .getAll("images")
        .filter((f): f is File => f instanceof File);
      if (files.length > MAX_IMAGES) {
        return NextResponse.json(
          { success: false, error: `Too many images (max ${MAX_IMAGES}).` },
          { status: 400 },
        );
      }
      for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          return NextResponse.json(
            { success: false, error: `Unsupported image type: ${file.type}` },
            { status: 400 },
          );
        }
        if (file.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Each image must be under 6 MB." },
            { status: 400 },
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        imageDataUrls.push(`data:${file.type};base64,${buffer.toString("base64")}`);
      }
    } else {
      const body = (await request.json().catch(() => ({}))) as { text?: unknown };
      if (typeof body.text === "string") text = body.text;
    }

    text = text.slice(0, MAX_TEXT);
    const hasImages = imageDataUrls.length > 0;
    const hasText = text.trim().length > 0;
    if (!hasImages && !hasText) {
      return NextResponse.json(
        { success: false, error: "Provide recipe text or at least one image." },
        { status: 400 },
      );
    }

    // ── Token gate (live-priced Essence), mirroring /api/recipes/refine ───
    const baseEssence = OPERATION_COSTS.ingest_recipe.essence ?? 0;
    const natalPositions = getCapitalizedNatalPositions(user.profile?.natalChart);
    const pricing = await getPersonalizedPricingContext(natalPositions);
    const { essence: liveEssence } = applyPersonalizedPricing(
      { spirit: 0, essence: baseEssence, matter: 0, substance: 0 },
      pricing,
    );

    const debited = await tokenEconomy.debitTokens(
      user.id,
      "Essence",
      liveEssence,
      "recipe_ingestion",
      {
        description: pricing.personalized
          ? `Recipe ingestion (live x${pricing.multiplier.toFixed(2)} · personalized)`
          : `Recipe ingestion (live x${pricing.multiplier.toFixed(2)})`,
      },
    );
    if (!debited) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient Essence (🜔) tokens. Ingesting a recipe costs ${liveEssence.toFixed(2)} Essence right now${pricing.personalized ? " (your chart's rate)" : ""}.`,
          liveCost: { essence: liveEssence },
          pricing,
        },
        { status: 402 },
      );
    }

    // Refund helper — never let a failed/empty extraction cost tokens.
    const refund = (reason: string) =>
      tokenEconomy
        .creditTokens(user.id, "Essence", liveEssence, "recipe_ingestion", {
          description: `Refund — ${reason}`,
        })
        .catch((e) => console.error("[recipes/extract] refund failed:", e));

    // ── Extract ───────────────────────────────────────────────────────────
    let extracted;
    try {
      extracted = hasImages
        ? await extractRecipesFromImages(imageDataUrls)
        : await extractRecipesFromText(text);
    } catch (err) {
      await refund("extraction failed");
      console.error("[recipes/extract] extraction error:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Extraction failed. Your Essence was refunded — please try again.",
        },
        { status: 502 },
      );
    }

    if (!extracted || extracted.length === 0) {
      await refund("no recipe detected");
      const balances = await tokenEconomy.getBalances(user.id);
      return NextResponse.json({
        success: true,
        recipes: [],
        balances,
        message: "No recipe detected — your Essence was refunded.",
      });
    }

    // ── Alchemize + return for preview (saving is a separate, free step) ──
    const recipes = extracted.map(alchemizeExtractedRecipe);
    const balances = await tokenEconomy.getBalances(user.id);
    return NextResponse.json({ success: true, recipes, balances });
  } catch (error) {
    console.error("[recipes/extract] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to ingest recipe" },
      { status: 500 },
    );
  }
}
