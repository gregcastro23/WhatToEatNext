interface FoodNutrient {
  nutrientNumber: string;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface FoodData {
  fdcId: string;
  description: string;
  foodNutrients: FoodNutrient[];
}

/**
 * API Client for Food Data Central
 */
export class FoodDataCentral {
  private static readonly apiKey =
    process.env.NEXT_PUBLIC_FOOD_DATA_CENTRAL_API_KEY || "";
  private static readonly baseUrl = "https://api.nal.usda.gov/fdc/v1";

  /**
   * Get detailed food information by FDC ID
   */
  static async getFood(fdcId: string): Promise<FoodData> {
    try {
      const url = new URL(`${this.baseUrl}/food/${fdcId}`);
      url.searchParams.append("api_key", this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching food data:", error);
      // Return a minimal valid structure if the API call fails
      return {
        fdcId,
        description: "Data unavailable",
        foodNutrients: [],
      };
    }
  }

  /**
   * Search for foods matching a query
   */
  static async searchFoods(query: string, pageSize = 10): Promise<FoodData[]> {
    try {
      const url = new URL(`${this.baseUrl}/foods/search`);
      url.searchParams.append("api_key", this.apiKey);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          pageSize,
          dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error("Error searching foods:", error);
      return [];
    }
  }
}
