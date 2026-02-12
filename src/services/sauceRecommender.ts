// src/services/sauceRecommender.ts
import { cuisinesMap } from "@/data/cuisines";
import type { CuisineName } from "@/data/cuisines/index";

export class SauceRecommender {
  private static instance: SauceRecommender;

  private constructor() {}

  public static getInstance(): SauceRecommender {
    if (!SauceRecommender.instance) {
      SauceRecommender.instance = new SauceRecommender();
    }
    return SauceRecommender.instance;
  }

  public recommendSauce(
    cuisineName: CuisineName,
    criteria: {
      protein?: string;
      vegetable?: string;
      cookingMethod?: string;
    },
  ): string[] {
    const cuisine = cuisinesMap[cuisineName];
    if (!cuisine || !cuisine.sauceRecommender) {
      return [];
    }

    const { forProtein, forVegetable, forCookingMethod } =
      cuisine.sauceRecommender;
    const recommendations = new Set<string>();

    if (criteria.protein && forProtein && forProtein[criteria.protein]) {
      forProtein[criteria.protein].forEach((sauce) =>
        recommendations.add(sauce),
      );
    }

    if (
      criteria.vegetable &&
      forVegetable &&
      forVegetable[criteria.vegetable]
    ) {
      forVegetable[criteria.vegetable].forEach((sauce) =>
        recommendations.add(sauce),
      );
    }

    if (
      criteria.cookingMethod &&
      forCookingMethod &&
      forCookingMethod[criteria.cookingMethod]
    ) {
      forCookingMethod[criteria.cookingMethod].forEach((sauce) =>
        recommendations.add(sauce),
      );
    }

    return Array.from(recommendations);
  }
}

export const sauceRecommender = SauceRecommender.getInstance();
