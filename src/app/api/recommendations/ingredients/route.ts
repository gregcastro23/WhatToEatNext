/**
 * GET /api/recommendations/ingredients
 *
 * Ranks ingredients by `match_score(transit_position, ingredient)` against the
 * live sky and returns the top N. Match is the dot product between current
 * elemental sky weights (derived from planetary positions) and each
 * ingredient's elemental signature.
 *
 * Response contract: RecommendedIngredientsResponseSchema in
 * src/lib/schemas/dashboard.ts. The schema is `.parse()`d before responding so
 * drift between this route and consumers fails loudly.
 */

import { NextResponse } from "next/server";
import { calculatePlanetaryHoursInfluence } from "@/calculations/core/planetaryInfluences";
import { unifiedIngredients } from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import { isBoilerplateCoverageIngredient } from "@/lib/ingredients/coverageQuality";
import { rateLimit } from "@/lib/rateLimit";
import {
  RecommendedIngredientsResponseSchema,
  type RecommendedIngredient,
} from "@/lib/schemas/dashboard";
import type { ElementalProperties } from "@/types/alchemy";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateElementalInfluences } from "@/utils/recommendation/ingredientRecommendation";

export const dynamic = "force-dynamic";

const ELEMENT_KEYS = ["Fire", "Water", "Earth", "Air"] as const;
type ElementKey = (typeof ELEMENT_KEYS)[number];

function dominantElement(props: ElementalProperties | undefined): ElementKey {
  if (!props) return "Fire";
  let best: ElementKey = "Fire";
  let bestVal = -Infinity;
  for (const k of ELEMENT_KEYS) {
    const v = (props as Record<string, number>)[k] ?? 0;
    if (v > bestVal) {
      bestVal = v;
      best = k;
    }
  }
  return best;
}

function dotElemental(
  sky: ElementalProperties,
  ing: ElementalProperties | undefined,
): number {
  if (!ing) return 0;
  let sum = 0;
  for (const k of ELEMENT_KEYS) {
    sum += (sky[k] ?? 0) * ((ing as Record<string, number>)[k] ?? 0);
  }
  return sum;
}

/** Deterministic hue 0-360 from a string. djb2 modulo 360. */
function hueFromName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickPlanet(ingredient: UnifiedIngredient): string {
  const planet =
    ingredient.planetaryRuler ?? ingredient.astrologicalProfile?.rulingPlanets?.[0];
  return typeof planet === "string" && planet.length > 0 ? planet : "Sun";
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, {
    window: 60_000,
    max: 60,
    bucket: "recommendations-ingredients",
  });
  if (!rl.allowed) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") ?? "8", 10);
    const limit = Math.max(1, Math.min(48, Number.isFinite(limitParam) ? limitParam : 8));

    const now = new Date();
    const positions = getAccuratePlanetaryPositions(now);

    // calculateElementalInfluences expects {sign, degree} per planet
    const alignment: Record<string, { sign: string; degree: number }> = {};
    for (const [planet, data] of Object.entries(positions)) {
      if (!data) continue;
      alignment[planet] = {
        sign: String((data as { sign?: string }).sign ?? "aries"),
        degree: Number((data as { degree?: number }).degree ?? 0),
      };
    }

    const skyWeights = calculateElementalInfluences(alignment);
    const { hourRuler } = calculatePlanetaryHoursInfluence(now);

    // Score every unified ingredient against the live sky. Auto-generated
    // recipe-coverage entries that still carry the boilerplate description
    // (dish names, recipe fragments, e.g. "thit kho tau") are excluded — they
    // exist only for recipe→ingredient mapping and must not surface as
    // recommended ingredients. This mirrors the browse surfaces, which already
    // hide them via the same predicate.
    const scored = Object.values(unifiedIngredients)
      .filter((ing) => !isBoilerplateCoverageIngredient(ing))
      .map((ing) => {
      const elemental: ElementalProperties = ing.elementalProperties ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };

      // Dot product is in [0,1] when both vectors are probability distributions
      // (max ~1.0 when both put all weight on the same element).
      const score = dotElemental(skyWeights, elemental);

      // Optional planetary affinity boost: +10% if any ruling planet matches
      // the current hour ruler.
      const rulers = (ing.astrologicalProfile?.rulingPlanets ?? []) as string[];
      const boost = rulers.includes(hourRuler) ? 1.1 : 1.0;

      const match = Math.max(0, Math.min(1, score * boost));

      return { ing, match };
    });

    scored.sort((a, b) => b.match - a.match);

    const items: RecommendedIngredient[] = scored.slice(0, limit).map(({ ing, match }) => {
      const dom = dominantElement(ing.elementalProperties);
      const alch = ing.alchemicalProperties ?? {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25,
      };
      const rawImage =
        (ing as { image_url?: unknown }).image_url ??
        (ing as { imageUrl?: unknown }).imageUrl ??
        (ing as { image?: unknown }).image;
      return {
        id: slugify(ing.name),
        name: ing.name,
        category: ing.category ?? "other",
        elemental_affinity: dom.toLowerCase() as RecommendedIngredient["elemental_affinity"],
        planet: pickPlanet(ing),
        hue: hueFromName(ing.name),
        match_score: Number(match.toFixed(4)),
        thermo: {
          spirit: Number((alch.Spirit ?? 0).toFixed(4)),
          essence: Number((alch.Essence ?? 0).toFixed(4)),
          matter: Number((alch.Matter ?? 0).toFixed(4)),
          substance: Number((alch.Substance ?? 0).toFixed(4)),
        },
        image_url: typeof rawImage === "string" && rawImage.trim().length > 0 ? rawImage : undefined,
      };
    });

    const body = RecommendedIngredientsResponseSchema.parse({
      generated_at: now.toISOString(),
      hour_ruler: hourRuler,
      ingredients: items,
    });

    return NextResponse.json(body);
  } catch (error) {
    console.error("[recommendations/ingredients] Error:", error);
    return NextResponse.json(
      { error: "Failed to compute ingredient recommendations" },
      { status: 500 },
    );
  }
}
