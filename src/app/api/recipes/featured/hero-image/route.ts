import { NextResponse } from "next/server";
import { featuredRecipe } from "@/data/featuredRecipe";
import { generateRecipeImage } from "@/lib/recipe-nft/image";

export const runtime = "nodejs";

/**
 * Hero image for the featured recipe — resolved via the live nanobanana pipeline
 * (Redis-cached 7d). Lightweight: just the image URL for the Promo card.
 */
export async function GET() {
  const url = await generateRecipeImage({
    id: featuredRecipe.id,
    title: featuredRecipe.title,
    description: featuredRecipe.short_description,
    cuisine: featuredRecipe.cuisine,
  });
  // Cache a resolved image URL; never cache a null (the image may appear later).
  const cacheControl = url
    ? "public, max-age=3600, stale-while-revalidate=86400"
    : "no-store";
  return NextResponse.json({ url: url ?? null }, { headers: { "Cache-Control": cacheControl } });
}
