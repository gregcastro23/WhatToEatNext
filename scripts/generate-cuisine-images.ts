import { CUISINES_METADATA, getCuisineData } from "../src/data/cuisines/index";
import type { Cuisine } from "../src/types/cuisine";
import * as fs from "fs";
import * as path from "path";

// Helper to extract dishes
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

async function run() {
  console.log("=== Cosmic Cuisine Image Generator ===");
  const keys = Object.keys(CUISINES_METADATA);
  console.log(`Found ${keys.length} cuisines to generate:`, keys.join(", "));

  const agentBaseUrl =
    process.env.PLANETARY_AGENTS_API_URL ||
    process.env.NEXT_PUBLIC_PLANETARY_AGENTS_URL ||
    "https://api.agents.alchm.kitchen";

  const outputPath = path.join(__dirname, "../src/data/cuisines/images.json");
  let existingImages: Record<string, string> = {};
  if (fs.existsSync(outputPath)) {
    try {
      existingImages = JSON.parse(fs.readFileSync(outputPath, "utf8"));
      console.log("Loaded existing image map with", Object.keys(existingImages).length, "images.");
    } catch (e) {
      console.warn("Failed to parse existing images.json, starting fresh.");
    }
  }

  for (const key of keys) {
    const name = CUISINES_METADATA[key].name || key;
    if (existingImages[key]) {
      console.log(`[${name}] Already has image URL: ${existingImages[key]}. Skipping.`);
      continue;
    }

    console.log(`\n[${name}] Loading full cuisine details...`);
    const cuisineData = await getCuisineData(key);
    if (!cuisineData) {
      console.error(`[${name}] Failed to load details!`);
      continue;
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
    } else {
      elementalLighting = "The composition is light, airy, and expansive, featuring delicate fresh herb garnishes and high-key, natural diffused sunlight casting soft, bright highlights across the feast.";
    }

    const dishesSection = dishesList.length > 0 
      ? `Staple traditional dishes are featured prominently, including: ${dishesList.slice(0, 4).join(", ") || ""}.` 
      : "";

    const imagePrompt = [
      `A magnificent, high-end food photography feast representing authentic ${name} cuisine.`,
      `A spectacular, abundant smorgasbord of classic ${name} staple dishes arranged elegantly in a family-style banquet on a large table.`,
      dishesSection,
      cuisineData.description ? `${cuisineData.description}` : "",
      elementalLighting,
      "Beautifully plated, restaurant-quality, professional food styling, natural lighting, macro details, shallow depth of field, sharp focus, 8k resolution. No text, labels, or watermarks."
    ].filter(Boolean).join(" ");

    console.log(`[${name}] Prompt compiled (${imagePrompt.split(" ").length} words):`);
    console.log(`  -> "${imagePrompt.substring(0, 120)}..."`);

    try {
      console.log(`[${name}] Requesting image from PA backend...`);
      const response = await fetch(`${agentBaseUrl}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as { url?: string };
      if (data.url) {
        console.log(`[${name}] SUCCESS: ${data.url}`);
        existingImages[key] = data.url;
        // Save incremental progress in case of rate limits or errors
        fs.writeFileSync(outputPath, JSON.stringify(existingImages, null, 2), "utf8");
      } else {
        console.warn(`[${name}] Generation did not return a URL:`, data);
      }
    } catch (e) {
      console.error(`[${name}] Failed to generate image:`, e);
    }

    // Delay to respect PA API limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n=== Cuisine Image Generation Complete ===");
  console.log(`Saved output map at ${outputPath}`);
}

run().catch((e) => {
  console.error("Execution failed:", e);
});
