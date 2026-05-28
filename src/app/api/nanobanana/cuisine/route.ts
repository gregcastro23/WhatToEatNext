import { createHash } from "crypto";
import { getServiceUrl } from "@/lib/serviceUrls";
import { NextResponse } from "next/server";
import { getCuisineData, CUISINES_METADATA } from "@/data/cuisines/index";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import { redisGet, redisSet } from "@/lib/redis";
import type { Cuisine } from "@/types/cuisine";
import type { NextRequest } from "next/server";

const RATE_LIMIT = { window: 60_000, max: 10, bucket: "nanobanana-generate" };
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// Extractor helper to gather traditional dishes to feed into our image generator
function extractDishes(cuisine: Cuisine): string[] {
  const list: string[] = [];
  if (!cuisine.dishes) return list;
  for (const mealType of ["breakfast", "lunch", "dinner", "dessert"]) {
    const seasons = cuisine.dishes[mealType as keyof typeof cuisine.dishes];
    if (!seasons) continue;
    for (const season of ["all", "spring", "summer", "autumn", "winter"]) {
      const recipes = seasons[season as keyof typeof seasons];
      if (Array.isArray(recipes)) {
        for (const r of recipes) {
          if (r && typeof r === "object" && "name" in r && typeof r.name === "string") {
            list.push(r.name);
          } else if (r && typeof r === "string") {
            list.push(r);
          }
          if (list.length >= 6) return list;
        }
      }
    }
  }
  return list;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(req, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const body = await req.json();
    const { cuisine: cuisineInput } = body;

    if (!cuisineInput) {
      return NextResponse.json({ error: "Missing cuisine name." }, { status: 400 });
    }

    // Match input with our CUISINES_METADATA keys case-insensitively
    const cuisineKey = Object.keys(CUISINES_METADATA).find(
      (k) => k.toLowerCase() === cuisineInput.toLowerCase() ||
             k.replace(/\s+/g, "").toLowerCase() === cuisineInput.replace(/\s+/g, "").toLowerCase()
    );

    if (!cuisineKey) {
      return NextResponse.json({ error: `Cuisine '${cuisineInput}' is not a recognized cosmic cuisine.` }, { status: 404 });
    }

    const metadata = CUISINES_METADATA[cuisineKey];
    const cuisineName = metadata.name ?? cuisineKey;

    // Load full cuisine data dynamically (contains dishes list)
    const cuisineData = await getCuisineData(cuisineKey);
    if (!cuisineData) {
      return NextResponse.json({ error: `Failed to load cuisine data for ${cuisineName}` }, { status: 500 });
    }

    const dishesList = extractDishes(cuisineData);
    const elements = cuisineData.elementalProperties || { Fire: 0.25, Earth: 0.25, Water: 0.25, Air: 0.25 };
    const fire = elements.Fire ?? 0;
    const water = elements.Water ?? 0;
    const earth = elements.Earth ?? 0;
    const air = elements.Air ?? 0;

    let elementalLighting = "";
    if (fire > 0.35) {
      elementalLighting = "The banquet table is bathed in warm, glowing amber light, with dramatic shadows and a lively, energetic dining atmosphere. Carved meats and caramelized surfaces glisten beautifully under the ambient heat.";
    } else if (water > 0.35) {
      elementalLighting = "The setting has a cool, refreshing, and serene atmosphere, with soft morning light reflecting off elegant glass carafes and fresh, dew-kissed seafood platters.";
    } else if (earth > 0.35) {
      elementalLighting = "The dining scene is grounded and rustic, using textured hand-thrown ceramic tableware on a solid dark oak banquet table. Hearty whole grains, roasted root vegetables, and deep forest-green accents enrich the presentation.";
    } else if (air > 0.35) {
      elementalLighting = "The composition is light, airy, and expansive, featuring delicate fresh herb garnishes and high-key, natural diffused sunlight casting soft, bright highlights across the feast.";
    } else {
      elementalLighting = "The table is balanced and harmonious, lit with even, naturalistic daylight that gives equal weight to every dish — neither dramatic nor stark, a poised culinary still life.";
    }

    const dishesSection = dishesList.length > 0 
      ? `Staple traditional dishes are featured prominently, including: ${dishesList.slice(0, 4).join(", ") || ""}.` 
      : "";

    const imagePrompt = [
      `A magnificent, high-end food photography feast representing authentic ${cuisineName} cuisine.`,
      `A spectacular, abundant smorgasbord of classic ${cuisineName} staple dishes arranged elegantly in a family-style banquet on a large table.`,
      dishesSection,
      cuisineData.description ? `${cuisineData.description}` : "",
      elementalLighting,
      "Beautifully plated, restaurant-quality, professional food styling, natural lighting, macro details, shallow depth of field, sharp focus, 8k resolution. No text, labels, or watermarks."
    ].filter(Boolean).join(" ");

    // Content-address the cache by the generated prompt: when the dishes, elemental
    // lighting, or description change, the hash changes and the image regenerates
    // instead of serving a stale 7-day entry keyed only by cuisine name.
    const promptHash = createHash("sha256").update(imagePrompt).digest("hex").slice(0, 16);
    const cacheKey = `gen_image_cuisine:${cuisineKey.toLowerCase()}:${promptHash}`;

    // Try to get cached result
    try {
      const cached = await redisGet<{ url: string }>(cacheKey);
      if (cached) {
        console.debug(`[NanoBanana-Cuisine] Serving cached image result for ${cuisineName}`);
        return NextResponse.json(cached);
      }
    } catch (err) {
      console.warn("[NanoBanana-Cuisine] Redis read failed:", err);
    }

    const agentBaseUrl = getServiceUrl("planetaryAgentsApi");

    console.log(`[NanoBanana-Cuisine] Calling PA image generation with prompt: ${imagePrompt}`);

    const response = await fetch(`${agentBaseUrl}/api/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Cache the successful result
    if (data.url) {
      await redisSet(cacheKey, data, CACHE_TTL).catch((err) =>
        console.warn("[NanoBanana-Cuisine] Redis write failed:", err),
      );
    }

    return NextResponse.json(data);
  } catch (_err) {
    console.error("[NanoBanana-Cuisine] Generation failed:", _err);
    return NextResponse.json({ error: "Failed to generate cuisine image" }, { status: 500 });
  }
}
