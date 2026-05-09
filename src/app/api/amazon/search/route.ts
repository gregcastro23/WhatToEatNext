import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { isPaapiConfigured, searchItem } from "@/lib/amazon/paapi";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const rl = rateLimit(request, { window: 60_000, max: 30, bucket: "amazon-search" });
  if (!rl.allowed) return rl.response!;

  const { searchParams } = new URL(request.url);
  const ingredient = searchParams.get("ingredient");

  if (!ingredient) {
    return NextResponse.json({ error: "Missing ingredient parameter" }, { status: 400 });
  }

  let normalizedIngredient = ingredient;

  // 1. LLM-Powered Normalization
  try {
    if (process.env.OPENAI_API_KEY) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You are a culinary expert. Your job is to extract the core grocery ingredient from a messy string. For example, '1 lb Fresh Phyllo Dough (thawed)' should become 'phyllo dough'. '2 cups diced organic carrots' should become 'carrots'. Return ONLY the normalized ingredient name, all lowercase, singular or plural as appropriate for grocery shopping.",
        prompt: `Normalize this ingredient: "${ingredient}"`,
      });
      normalizedIngredient = text.trim().toLowerCase();
    }
  } catch (error) {
    console.warn("LLM normalization failed or OpenAI key missing, falling back to raw ingredient", error);
  }

  // 2. PA-API v5 SearchItems
  if (!isPaapiConfigured()) {
    return NextResponse.json({
      ingredient,
      normalized: normalizedIngredient,
      asin: null,
      source: "no_paapi_key",
    });
  }

  try {
    const item = await searchItem(normalizedIngredient);
    if (!item) {
      return NextResponse.json({
        ingredient,
        normalized: normalizedIngredient,
        asin: null,
        source: "paapi_no_match",
      });
    }

    return NextResponse.json({
      ingredient,
      normalized: normalizedIngredient,
      asin: item.asin,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
      detailPageUrl: item.detailPageUrl,
      source: "paapi",
    });
  } catch (error) {
    console.error("[api/amazon/search] PA-API call failed:", error);
    return NextResponse.json(
      {
        ingredient,
        normalized: normalizedIngredient,
        asin: null,
        source: "paapi_error",
        error: error instanceof Error ? error.message : "Unknown PA-API error",
      },
      { status: 502 },
    );
  }
}
