import { getCuisineData, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { _logger } from "@/lib/logger";
import type { Cuisine } from "@/types/cuisine";

export class SauceRecommender {
  private static instance: SauceRecommender | undefined;

  private constructor() {}

  public static getInstance(): SauceRecommender {
    SauceRecommender.instance ??= new SauceRecommender();
    return SauceRecommender.instance;
  }

  public async recommendSauce(
    cuisineName: string,
    criteria: {
      protein?: string;
      vegetable?: string;
      cookingMethod?: string;
    },
  ): Promise<string[]> {
    const normalized = cuisineName.trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (!normalized) {
      return [];
    }
    const matchedKey = PRIMARY_CUISINE_KEYS.find(
      (key) => key.toLowerCase().replace(/[\s_-]+/g, "") === normalized,
    );
    if (!matchedKey) {
      return [];
    }

    let cuisine: Cuisine | null;
    try {
      cuisine = await getCuisineData(matchedKey);
    } catch (err) {
      _logger.error("[SauceRecommender] static cuisine load failed, skipping:", err);
      return [];
    }
    if (!cuisine?.sauceRecommender) {
      return [];
    }

    const { forProtein, forVegetable, forCookingMethod } =
      cuisine.sauceRecommender;
    const recommendations = new Set<string>();
    const pairs: Array<[string | undefined, Record<string, string[]> | undefined]> = [
      [criteria.protein, forProtein],
      [criteria.vegetable, forVegetable],
      [criteria.cookingMethod, forCookingMethod],
    ];
    for (const [key, map] of pairs) {
      if (!key || !map) continue;
      const sauces = map[key];
      if (sauces) {
        sauces.forEach((sauce: string) => recommendations.add(sauce));
      }
    }

    return Array.from(recommendations);
  }
}

export const sauceRecommender = SauceRecommender.getInstance();
