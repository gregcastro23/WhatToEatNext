import { alchmAPI } from "@/lib/api/alchm-client";
import { _logger } from "@/lib/logger";

interface CuisineSauceMapping {
  sauceRecommender?: {
    forProtein?: Record<string, string[]>;
    forVegetable?: Record<string, string[]>;
    forCookingMethod?: Record<string, string[]>;
  };
}

export class SauceRecommender {
  private static instance: SauceRecommender;

  private constructor() {}

  public static getInstance(): SauceRecommender {
    if (!SauceRecommender.instance) {
      SauceRecommender.instance = new SauceRecommender();
    }
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
    let cuisinesMap: Record<string, CuisineSauceMapping>;
    try {
      cuisinesMap = (await alchmAPI.getCuisines()) as Record<
        string,
        CuisineSauceMapping
      >;
    } catch (err) {
      _logger.error("[SauceRecommender] cuisines fetch failed, skipping:", err);
      return [];
    }
    const cuisine = cuisinesMap[cuisineName];
    if (!cuisine?.sauceRecommender) {
      return [];
    }

    const { forProtein, forVegetable, forCookingMethod } =
      cuisine.sauceRecommender;
    const recommendations = new Set<string>();

    if (criteria.protein && forProtein?.[criteria.protein]) {
      forProtein[criteria.protein].forEach((sauce: string) =>
        recommendations.add(sauce),
      );
    }

    if (
      criteria.vegetable &&
      forVegetable?.[criteria.vegetable]
    ) {
      forVegetable[criteria.vegetable].forEach((sauce: string) =>
        recommendations.add(sauce),
      );
    }

    if (
      criteria.cookingMethod &&
      forCookingMethod?.[criteria.cookingMethod]
    ) {
      forCookingMethod[criteria.cookingMethod].forEach((sauce: string) =>
        recommendations.add(sauce),
      );
    }

    return Array.from(recommendations);
  }
}

export const sauceRecommender = SauceRecommender.getInstance();
