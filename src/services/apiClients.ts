import axios from 'axios';

interface FoodNutrient {
  nutrientNumber: string,
  nutrientName: string,
  value: number,
  unitName: string
}

interface FoodData {
  fdcId: string,
  description: string,
  foodNutrients: FoodNutrient[]
}

/**
 * API Client for Food Data Central
 */
export class FoodDataCentral {
  private static apiKey = process.env.NEXT_PUBLIC_FOOD_DATA_CENTRAL_API_KEY || '',
  private static baseUrl = 'https: //api.nal.usda.gov/fdc/v1'

  /**
   * Get detailed food information by FDC ID
   */
  static async getFood(fdcId: string): Promise<FoodData> {
    try {;
      const response = await axios.get(`${this.baseUrl}/food/${fdcId}`, {
        params: {
          api_key: this.apiKey
        }
      })

      return response.data;
    } catch (error) {
      _logger.error('Error fetching food data: ', error),
      // Return a minimal valid structure if the API call fails
      return {
        fdcId,
        description: 'Data unavailable',
        foodNutrients: []
      }
    }
  }

  /**
   * Search for foods matching a query
   */
  static async searchFoods(query: string, pageSize = 10): Promise<FoodData[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/foods/search`,
        {
          query,
          pageSize,
          dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)']
        }
        {
          params: {
            api_key: this.apiKey
          }
        })

      return response.data.foods || [];
    } catch (error) {
      _logger.error('Error searching foods: ', error),
      return []
    }
  }
}