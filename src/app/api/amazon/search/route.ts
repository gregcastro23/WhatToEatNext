import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function GET(request: Request) {
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

  // 2. PA-API Fallback (Amazon Search)
  if (!process.env.AMAZON_PAAPI_ACCESS_KEY) {
    // No PA-API keys configured — return null so the client does not apply a fake ASIN
    return NextResponse.json({
      ingredient: ingredient,
      normalized: normalizedIngredient,
      asin: null,
      source: "no_paapi_key"
    });
  }

  // Real PA-API logic would go here
  // ...

  return NextResponse.json({ error: "PA-API integration not fully implemented" }, { status: 501 });
}
