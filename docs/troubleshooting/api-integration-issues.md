# 🌐 API Integration Issues

This guide addresses common problems with external API integrations, including
astrological APIs, nutritional databases, MCP server connections, and fallback
mechanisms.

## 🎯 API Integration Overview

### External API Dependencies

```typescript
interface ExternalAPIs {
  astrological: {
    primary: "NASA JPL Horizons API";
    secondary: "Swiss Ephemeris API";
    tertiary: "TimeAndDate.com API";
    fallback: "Local March 2025 positions";
  };
  nutritional: {
    primary: "USDA Food Data Central";
    secondary: "Spoonacular API";
    fallback: "Local nutritional database";
  };
  recipes: {
    primary: "Spoonacular Recipe API";
    fallback: "Local recipe database";
  };
}
```

### Quick API Diagnostics

```bash
# Test all API connections
npm run test:api-connectivity

# Check API credentials
npm run check:api-credentials

# Test fallback mechanisms
npm run test:fallbacks

# Monitor API usage
npm run monitor:api-usage

# Check rate limits
npm run check:rate-limits
```

## 🌟 Astrological API Issues

### Common Astrological API Problems

#### Issue: Planetary Position API Failures

**Symptoms:**

```
"Failed to fetch planetary positions" errors
API timeouts or connection refused
Incorrect planetary positions returned
```

**Debugging Steps:**

```bash
# 1. Test API connectivity directly
curl -X GET "https://api.astronomyapi.com/api/v2/positions" \
  -H "Authorization: Basic $(echo -n 'app-id:app-secret' | base64)" \
  -H "Content-Type: application/json"

# 2. Check API credentials
echo $ASTRONOMY_API_KEY
echo $ASTRONOMY_API_SECRET

# 3. Test with different endpoints
npm run test:astronomy-endpoints

# 4. Check API status
curl -s https://status.astronomyapi.com/api/v2/status.json
```

**API Connection Testing:**

```typescript
// Test astrological API connections
class AstrologicalAPITester {
  private readonly APIs = {
    nasa: "https://ssd-api.jpl.nasa.gov/horizons_api.py",
    swissEph: "https://api.swissephemeris.com/v1",
    timeAndDate: "https://api.timeanddate.com/v1/astronomy",
  };

  async testAllAPIs() {
    console.log("🌟 Testing astrological API connections...");

    for (const [name, url] of Object.entries(this.APIs)) {
      await this.testAPI(name, url);
    }
  }

  async testAPI(name: string, baseUrl: string) {
    console.log(`Testing ${name} API...`);

    try {
      const startTime = Date.now();

      // Test basic connectivity
      const response = await fetch(`${baseUrl}/status`, {
        method: "GET",
        timeout: 5000,
        headers: {
          "User-Agent": "WhatToEatNext/1.0",
          Accept: "application/json",
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        console.log(`✅ ${name}: Connected (${responseTime}ms)`);

        // Test actual data endpoint
        await this.testDataEndpoint(name, baseUrl);
      } else {
        console.log(
          `❌ ${name}: HTTP ${response.status} - ${response.statusText}`,
        );
      }
    } catch (error) {
      console.log(`❌ ${name}: Connection failed - ${error.message}`);

      // Test fallback mechanism
      await this.testFallback(name);
    }
  }

  async testDataEndpoint(name: string, baseUrl: string) {
    try {
      const testDate = new Date().toISOString().split("T")[0];

      let endpoint;
      let headers = {};

      switch (name) {
        case "nasa":
          endpoint = `${baseUrl}?format=json&COMMAND='499'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${testDate}'&STOP_TIME='${testDate}'&STEP_SIZE='1d'`;
          break;
        case "swissEph":
          endpoint = `${baseUrl}/planets?date=${testDate}`;
          break;
        case "timeAndDate":
          endpoint = `${baseUrl}/astrodata?iso=${testDate}`;
          headers = {
            Authorization: `Bearer ${process.env.TIMEANDDATE_API_KEY}`,
          };
          break;
      }

      const response = await fetch(endpoint, { headers, timeout: 10000 });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${name}: Data endpoint working`);

        // Validate data structure
        if (this.validateAstronomicalData(data)) {
          console.log(`✅ ${name}: Data structure valid`);
        } else {
          console.log(`⚠️ ${name}: Data structure invalid`);
        }
      } else {
        console.log(
          `❌ ${name}: Data endpoint failed - HTTP ${response.status}`,
        );
      }
    } catch (error) {
      console.log(`❌ ${name}: Data endpoint error - ${error.message}`);
    }
  }

  validateAstronomicalData(data: any): boolean {
    // Basic validation of astronomical data structure
    if (!data || typeof data !== "object") return false;

    // Check for common astronomical data fields
    const hasPositions = data.positions || data.planets || data.ephemeris;
    const hasTimestamp = data.timestamp || data.date || data.time;

    return !!(hasPositions && hasTimestamp);
  }

  async testFallback(apiName: string) {
    console.log(`Testing fallback for ${apiName}...`);

    try {
      const fallbackPositions = await this.getFallbackPositions();

      if (this.validatePlanetaryPositions(fallbackPositions)) {
        console.log(`✅ ${apiName}: Fallback working`);
      } else {
        console.log(`❌ ${apiName}: Fallback data invalid`);
      }
    } catch (error) {
      console.log(`❌ ${apiName}: Fallback failed - ${error.message}`);
    }
  }

  async getFallbackPositions() {
    // Return March 2025 fallback positions
    return {
      timestamp: "2025-03-28T00:00:00Z",
      positions: {
        sun: { sign: "aries", degree: 8.5, exactLongitude: 8.5 },
        moon: { sign: "aries", degree: 1.57, exactLongitude: 1.57 },
        mercury: {
          sign: "aries",
          degree: 0.85,
          exactLongitude: 0.85,
          isRetrograde: true,
        },
        venus: {
          sign: "pisces",
          degree: 29.08,
          exactLongitude: 359.08,
          isRetrograde: true,
        },
        mars: { sign: "cancer", degree: 22.63, exactLongitude: 112.63 },
        jupiter: { sign: "gemini", degree: 15.52, exactLongitude: 75.52 },
        saturn: { sign: "pisces", degree: 24.12, exactLongitude: 354.12 },
        uranus: { sign: "taurus", degree: 24.62, exactLongitude: 54.62 },
        neptune: { sign: "pisces", degree: 29.93, exactLongitude: 359.93 },
        pluto: { sign: "aquarius", degree: 3.5, exactLongitude: 333.5 },
      },
    };
  }

  validatePlanetaryPositions(positions: any): boolean {
    if (!positions || !positions.positions) return false;

    const requiredPlanets = ["sun", "moon", "mercury", "venus", "mars"];

    for (const planet of requiredPlanets) {
      const planetData = positions.positions[planet];
      if (
        !planetData ||
        !planetData.sign ||
        typeof planetData.degree !== "number"
      ) {
        return false;
      }
    }

    return true;
  }
}
```

#### Issue: API Rate Limiting

**Symptoms:**

```
"Rate limit exceeded" errors
API calls failing after working initially
429 HTTP status codes
```

**Rate Limiting Solutions:**

```typescript
// Intelligent rate limiting and request management
class APIRateLimiter {
  private requestCounts: Map<string, number[]> = new Map();
  private rateLimits: Map<string, { requests: number; window: number }> =
    new Map();

  constructor() {
    // Configure rate limits for different APIs
    this.rateLimits.set("astronomy", { requests: 100, window: 60000 }); // 100/minute
    this.rateLimits.set("spoonacular", { requests: 150, window: 86400000 }); // 150/day
    this.rateLimits.set("usda", { requests: 1000, window: 3600000 }); // 1000/hour
  }

  async makeRequest<T>(
    apiName: string,
    requestFn: () => Promise<T>,
    fallbackFn?: () => Promise<T>,
  ): Promise<T> {
    // Check rate limit
    if (!this.canMakeRequest(apiName)) {
      console.warn(`Rate limit exceeded for ${apiName}, using fallback`);

      if (fallbackFn) {
        return await fallbackFn();
      } else {
        throw new Error(
          `Rate limit exceeded for ${apiName} and no fallback available`,
        );
      }
    }

    try {
      // Make the request
      const result = await requestFn();

      // Record successful request
      this.recordRequest(apiName);

      return result;
    } catch (error) {
      // Check if it's a rate limit error
      if (this.isRateLimitError(error)) {
        console.warn(`Rate limit hit for ${apiName}, backing off`);

        // Implement exponential backoff
        await this.backoff(apiName);

        // Try fallback if available
        if (fallbackFn) {
          return await fallbackFn();
        }
      }

      throw error;
    }
  }

  private canMakeRequest(apiName: string): boolean {
    const limit = this.rateLimits.get(apiName);
    if (!limit) return true;

    const requests = this.requestCounts.get(apiName) || [];
    const now = Date.now();

    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < limit.window);
    this.requestCounts.set(apiName, recentRequests);

    return recentRequests.length < limit.requests;
  }

  private recordRequest(apiName: string) {
    const requests = this.requestCounts.get(apiName) || [];
    requests.push(Date.now());
    this.requestCounts.set(apiName, requests);
  }

  private isRateLimitError(error: any): boolean {
    return (
      error.status === 429 ||
      error.message?.includes("rate limit") ||
      error.message?.includes("quota exceeded")
    );
  }

  private async backoff(apiName: string) {
    const requests = this.requestCounts.get(apiName) || [];
    const backoffTime = Math.min(1000 * Math.pow(2, requests.length), 30000); // Max 30 seconds

    console.log(`Backing off ${apiName} for ${backoffTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, backoffTime));
  }

  getUsageStats(apiName: string) {
    const limit = this.rateLimits.get(apiName);
    const requests = this.requestCounts.get(apiName) || [];

    if (!limit) return null;

    const now = Date.now();
    const recentRequests = requests.filter((time) => now - time < limit.window);

    return {
      used: recentRequests.length,
      limit: limit.requests,
      remaining: limit.requests - recentRequests.length,
      resetTime: new Date(now + limit.window),
    };
  }
}
```

#### Issue: API Authentication Problems

**Symptoms:**

```
401 Unauthorized errors
403 Forbidden responses
"Invalid API key" messages
```

**Authentication Debugging:**

```bash
# 1. Check environment variables
echo "Astronomy API Key: ${ASTRONOMY_API_KEY:0:10}..."
echo "Spoonacular API Key: ${SPOONACULAR_API_KEY:0:10}..."
echo "USDA API Key: ${USDA_API_KEY:0:10}..."

# 2. Test API key validity
npm run test:api-keys

# 3. Check API key permissions
npm run check:api-permissions

# 4. Validate API key format
npm run validate:api-key-format
```

**API Authentication Testing:**

```typescript
// Test API authentication
class APIAuthenticationTester {
  async testAllAuthentication() {
    console.log("🔐 Testing API authentication...");

    await this.testAstronomyAuth();
    await this.testSpoonacularAuth();
    await this.testUSDAAuth();
  }

  async testAstronomyAuth() {
    console.log("Testing Astronomy API authentication...");

    const apiKey = process.env.ASTRONOMY_API_KEY;
    const apiSecret = process.env.ASTRONOMY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.log("❌ Astronomy API credentials not found");
      return;
    }

    try {
      const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString(
        "base64",
      );

      const response = await fetch(
        "https://api.astronomyapi.com/api/v2/studio/moon-phase",
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        console.log("✅ Astronomy API authentication successful");
      } else {
        console.log(
          `❌ Astronomy API authentication failed: ${response.status} ${response.statusText}`,
        );

        if (response.status === 401) {
          console.log("Check API credentials");
        } else if (response.status === 403) {
          console.log("Check API permissions and subscription status");
        }
      }
    } catch (error) {
      console.log(`❌ Astronomy API authentication error: ${error.message}`);
    }
  }

  async testSpoonacularAuth() {
    console.log("Testing Spoonacular API authentication...");

    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      console.log("❌ Spoonacular API key not found");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=1`,
      );

      if (response.ok) {
        console.log("✅ Spoonacular API authentication successful");

        // Check remaining quota
        const quotaUsed = response.headers.get("X-API-Quota-Used");
        const quotaLeft = response.headers.get("X-API-Quota-Left");

        if (quotaUsed && quotaLeft) {
          console.log(
            `Spoonacular quota: ${quotaUsed} used, ${quotaLeft} remaining`,
          );
        }
      } else {
        console.log(
          `❌ Spoonacular API authentication failed: ${response.status} ${response.statusText}`,
        );

        if (response.status === 401) {
          console.log("Invalid API key");
        } else if (response.status === 402) {
          console.log("Quota exceeded - upgrade plan needed");
        }
      }
    } catch (error) {
      console.log(`❌ Spoonacular API authentication error: ${error.message}`);
    }
  }

  async testUSDAAuth() {
    console.log("Testing USDA API authentication...");

    const apiKey = process.env.USDA_API_KEY;

    if (!apiKey) {
      console.log("⚠️ USDA API key not found (optional for some endpoints)");
    }

    try {
      const url = apiKey
        ? `https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=${apiKey}`
        : "https://api.nal.usda.gov/fdc/v1/foods/search?query=apple";

      const response = await fetch(url);

      if (response.ok) {
        console.log("✅ USDA API access successful");
      } else {
        console.log(
          `❌ USDA API access failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.log(`❌ USDA API error: ${error.message}`);
    }
  }
}
```

## 🍽️ Nutritional API Issues

### Common Nutritional API Problems

#### Issue: USDA Food Data Central API Problems

**Symptoms:**

```
"Food not found" errors for common ingredients
Incomplete nutritional data
API response format changes
```

**USDA API Debugging:**

```typescript
// Debug USDA Food Data Central API
class USDAAPIDebugger {
  private baseUrl = "https://api.nal.usda.gov/fdc/v1";
  private apiKey = process.env.USDA_API_KEY;

  async debugUSDAAPI() {
    console.log("🥗 Debugging USDA Food Data Central API...");

    await this.testFoodSearch();
    await this.testFoodDetails();
    await this.testNutrientData();
    await this.validateDataStructure();
  }

  async testFoodSearch() {
    console.log("Testing USDA food search...");

    const testQueries = ["apple", "chicken breast", "brown rice", "spinach"];

    for (const query of testQueries) {
      try {
        const url = this.apiKey
          ? `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`
          : `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          if (data.foods && data.foods.length > 0) {
            console.log(`✅ Found ${data.foods.length} results for "${query}"`);

            // Check data quality
            const firstFood = data.foods[0];
            if (firstFood.foodNutrients && firstFood.foodNutrients.length > 0) {
              console.log(
                `✅ "${query}" has ${firstFood.foodNutrients.length} nutrients`,
              );
            } else {
              console.log(`⚠️ "${query}" has no nutrient data`);
            }
          } else {
            console.log(`⚠️ No results found for "${query}"`);
          }
        } else {
          console.log(`❌ Search failed for "${query}": ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Search error for "${query}": ${error.message}`);
      }
    }
  }

  async testFoodDetails() {
    console.log("Testing USDA food details...");

    // Test with known food ID
    const testFoodId = "169905"; // Apple, raw

    try {
      const url = this.apiKey
        ? `${this.baseUrl}/food/${testFoodId}?api_key=${this.apiKey}`
        : `${this.baseUrl}/food/${testFoodId}`;

      const response = await fetch(url);

      if (response.ok) {
        const food = await response.json();

        console.log(`✅ Food details retrieved: ${food.description}`);

        // Validate essential nutrients
        const essentialNutrients = [
          "Energy",
          "Protein",
          "Carbohydrate",
          "Total lipid (fat)",
        ];
        const foundNutrients =
          food.foodNutrients?.map((n) => n.nutrient.name) || [];

        for (const nutrient of essentialNutrients) {
          if (foundNutrients.some((n) => n.includes(nutrient))) {
            console.log(`✅ Found ${nutrient}`);
          } else {
            console.log(`⚠️ Missing ${nutrient}`);
          }
        }
      } else {
        console.log(`❌ Food details failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Food details error: ${error.message}`);
    }
  }

  async validateDataStructure() {
    console.log("Validating USDA data structure...");

    try {
      const response = await fetch(
        `${this.baseUrl}/foods/search?query=apple&pageSize=1`,
      );
      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];

        // Check required fields
        const requiredFields = ["fdcId", "description", "foodNutrients"];

        for (const field of requiredFields) {
          if (food[field] !== undefined) {
            console.log(`✅ Field "${field}" present`);
          } else {
            console.log(`❌ Field "${field}" missing`);
          }
        }

        // Check nutrient structure
        if (food.foodNutrients && food.foodNutrients.length > 0) {
          const nutrient = food.foodNutrients[0];
          const nutrientFields = ["nutrient", "amount", "unitName"];

          for (const field of nutrientFields) {
            if (nutrient[field] !== undefined) {
              console.log(`✅ Nutrient field "${field}" present`);
            } else {
              console.log(`❌ Nutrient field "${field}" missing`);
            }
          }
        }
      } else {
        console.log("❌ No food data to validate");
      }
    } catch (error) {
      console.log(`❌ Data structure validation error: ${error.message}`);
    }
  }
}
```

#### Issue: Spoonacular Recipe API Problems

**Symptoms:**

```
Recipe search returns no results
Missing recipe instructions or ingredients
API quota exceeded quickly
```

**Spoonacular API Debugging:**

```typescript
// Debug Spoonacular Recipe API
class SpoonacularAPIDebugger {
  private baseUrl = "https://api.spoonacular.com";
  private apiKey = process.env.SPOONACULAR_API_KEY;

  async debugSpoonacularAPI() {
    console.log("🍳 Debugging Spoonacular Recipe API...");

    await this.testRecipeSearch();
    await this.testRecipeDetails();
    await this.testIngredientSearch();
    await this.checkQuotaUsage();
  }

  async testRecipeSearch() {
    console.log("Testing Spoonacular recipe search...");

    const testQueries = [
      { query: "pasta", cuisine: "italian" },
      { query: "chicken", diet: "gluten-free" },
      { query: "vegetarian", type: "main course" },
    ];

    for (const searchParams of testQueries) {
      try {
        const params = new URLSearchParams({
          apiKey: this.apiKey,
          number: "5",
          ...searchParams,
        });

        const response = await fetch(
          `${this.baseUrl}/recipes/complexSearch?${params}`,
        );

        if (response.ok) {
          const data = await response.json();

          console.log(
            `✅ Found ${data.results?.length || 0} recipes for ${JSON.stringify(searchParams)}`,
          );

          // Check recipe data quality
          if (data.results && data.results.length > 0) {
            const recipe = data.results[0];

            if (recipe.id && recipe.title) {
              console.log(`✅ Recipe has required fields: ${recipe.title}`);
            } else {
              console.log(`⚠️ Recipe missing required fields`);
            }
          }
        } else {
          console.log(
            `❌ Recipe search failed: ${response.status} ${response.statusText}`,
          );

          if (response.status === 402) {
            console.log("⚠️ Quota exceeded - consider upgrading plan");
          }
        }
      } catch (error) {
        console.log(`❌ Recipe search error: ${error.message}`);
      }
    }
  }

  async testRecipeDetails() {
    console.log("Testing Spoonacular recipe details...");

    // First get a recipe ID
    try {
      const searchResponse = await fetch(
        `${this.baseUrl}/recipes/complexSearch?apiKey=${this.apiKey}&number=1`,
      );

      if (!searchResponse.ok) {
        console.log("❌ Cannot test recipe details - search failed");
        return;
      }

      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        console.log("❌ Cannot test recipe details - no recipes found");
        return;
      }

      const recipeId = searchData.results[0].id;

      // Get detailed recipe information
      const detailsResponse = await fetch(
        `${this.baseUrl}/recipes/${recipeId}/information?apiKey=${this.apiKey}&includeNutrition=true`,
      );

      if (detailsResponse.ok) {
        const recipe = await detailsResponse.json();

        console.log(`✅ Recipe details retrieved: ${recipe.title}`);

        // Check essential fields
        const essentialFields = [
          "instructions",
          "extendedIngredients",
          "readyInMinutes",
          "servings",
        ];

        for (const field of essentialFields) {
          if (recipe[field] !== undefined) {
            console.log(`✅ Recipe has ${field}`);
          } else {
            console.log(`⚠️ Recipe missing ${field}`);
          }
        }

        // Check nutrition data
        if (recipe.nutrition && recipe.nutrition.nutrients) {
          console.log(
            `✅ Recipe has nutrition data (${recipe.nutrition.nutrients.length} nutrients)`,
          );
        } else {
          console.log(`⚠️ Recipe missing nutrition data`);
        }
      } else {
        console.log(`❌ Recipe details failed: ${detailsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Recipe details error: ${error.message}`);
    }
  }

  async checkQuotaUsage() {
    console.log("Checking Spoonacular quota usage...");

    try {
      // Make a simple request to check headers
      const response = await fetch(
        `${this.baseUrl}/recipes/random?apiKey=${this.apiKey}&number=1`,
      );

      // Check quota headers
      const quotaUsed = response.headers.get("X-API-Quota-Used");
      const quotaLeft = response.headers.get("X-API-Quota-Left");
      const quotaLimit = response.headers.get("X-API-Quota-Limit");

      if (quotaUsed && quotaLeft && quotaLimit) {
        console.log(`📊 Quota Status:`);
        console.log(`   Used: ${quotaUsed}`);
        console.log(`   Remaining: ${quotaLeft}`);
        console.log(`   Limit: ${quotaLimit}`);

        const usagePercent = (parseInt(quotaUsed) / parseInt(quotaLimit)) * 100;

        if (usagePercent > 90) {
          console.log("🚨 Quota usage critical (>90%)");
        } else if (usagePercent > 75) {
          console.log("⚠️ Quota usage high (>75%)");
        } else {
          console.log("✅ Quota usage normal");
        }
      } else {
        console.log("⚠️ Quota information not available in headers");
      }
    } catch (error) {
      console.log(`❌ Quota check error: ${error.message}`);
    }
  }
}
```

## 🔄 Fallback Mechanism Issues

### Common Fallback Problems

#### Issue: Fallback Not Triggering

**Symptoms:**

```
API failures result in errors instead of fallback
Fallback data not being used when APIs are down
Timeout not triggering fallback mechanism
```

**Fallback Mechanism Debugging:**

```typescript
// Debug fallback mechanisms
class FallbackMechanismDebugger {
  async debugFallbackMechanisms() {
    console.log("🔄 Debugging fallback mechanisms...");

    await this.testTimeoutFallback();
    await this.testAPIFailureFallback();
    await this.testDataValidationFallback();
    await this.validateFallbackData();
  }

  async testTimeoutFallback() {
    console.log("Testing timeout fallback...");

    // Simulate slow API
    const slowAPICall = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ data: "slow response" }), 10000); // 10 second delay
      });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 5000); // 5 second timeout
    });

    try {
      const result = await Promise.race([slowAPICall(), timeoutPromise]);
      console.log(
        "❌ Timeout fallback failed - API call succeeded unexpectedly",
      );
    } catch (error) {
      if (error.message === "Timeout") {
        console.log("✅ Timeout triggered correctly");

        // Test fallback activation
        const fallbackData = await this.getFallbackData("planetary-positions");
        if (fallbackData) {
          console.log("✅ Fallback data retrieved after timeout");
        } else {
          console.log("❌ Fallback data not available after timeout");
        }
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }

  async testAPIFailureFallback() {
    console.log("Testing API failure fallback...");

    // Simulate API failure
    const failingAPICall = () => Promise.reject(new Error("API Error 500"));

    try {
      const result = await this.makeResilientAPICall(
        "test-api",
        failingAPICall,
        () => this.getFallbackData("test-data"),
      );

      if (result && result.source === "fallback") {
        console.log("✅ API failure fallback working");
      } else {
        console.log("❌ API failure fallback not working");
      }
    } catch (error) {
      console.log(`❌ Fallback mechanism failed: ${error.message}`);
    }
  }

  async makeResilientAPICall<T>(
    apiName: string,
    apiCall: () => Promise<T>,
    fallbackCall: () => Promise<T>,
  ): Promise<T> {
    try {
      const result = await apiCall();
      return { ...result, source: "api" } as T;
    } catch (error) {
      console.log(`API ${apiName} failed: ${error.message}, using fallback`);

      try {
        const fallbackResult = await fallbackCall();
        return { ...fallbackResult, source: "fallback" } as T;
      } catch (fallbackError) {
        console.log(`Fallback also failed: ${fallbackError.message}`);
        throw new Error(`Both API and fallback failed for ${apiName}`);
      }
    }
  }

  async getFallbackData(dataType: string): Promise<any> {
    switch (dataType) {
      case "planetary-positions":
        return {
          timestamp: "2025-03-28T00:00:00Z",
          positions: {
            sun: { sign: "aries", degree: 8.5 },
            moon: { sign: "aries", degree: 1.57 },
            // ... other planets
          },
        };

      case "nutritional-data":
        return {
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4,
        };

      case "test-data":
        return {
          message: "Fallback data",
          timestamp: new Date().toISOString(),
        };

      default:
        throw new Error(`No fallback data available for ${dataType}`);
    }
  }

  async validateFallbackData() {
    console.log("Validating fallback data integrity...");

    const fallbackTypes = ["planetary-positions", "nutritional-data"];

    for (const type of fallbackTypes) {
      try {
        const data = await this.getFallbackData(type);

        if (this.validateDataStructure(type, data)) {
          console.log(`✅ ${type} fallback data is valid`);
        } else {
          console.log(`❌ ${type} fallback data is invalid`);
        }
      } catch (error) {
        console.log(`❌ ${type} fallback data error: ${error.message}`);
      }
    }
  }

  validateDataStructure(type: string, data: any): boolean {
    switch (type) {
      case "planetary-positions":
        return !!(
          data &&
          data.positions &&
          data.positions.sun &&
          data.positions.moon &&
          typeof data.positions.sun.degree === "number"
        );

      case "nutritional-data":
        return !!(
          data &&
          typeof data.calories === "number" &&
          typeof data.protein === "number"
        );

      default:
        return !!data;
    }
  }
}
```

## 🔧 API Integration Maintenance

### Regular API Health Monitoring

```bash
#!/bin/bash
# api-health-monitor.sh

echo "🌐 API Health Monitoring"

# 1. Test all API connections
npm run test:api-connectivity

# 2. Check API quotas
npm run check:api-quotas

# 3. Validate fallback mechanisms
npm run test:fallbacks

# 4. Monitor API performance
npm run monitor:api-performance

# 5. Generate API health report
npm run generate:api-health-report

echo "✅ API health monitoring completed"
```

### API Integration Recovery

```bash
#!/bin/bash
# api-recovery.sh

echo "🚨 API Integration Recovery"

# 1. Stop all API-dependent processes
npm run stop:api-processes

# 2. Test API connectivity
npm run test:api-connectivity

# 3. Reset API rate limiters
npm run reset:rate-limiters

# 4. Clear API caches
npm run clear:api-caches

# 5. Restart with fallback mode
npm run start:fallback-mode

echo "✅ API integration recovery completed"
```

---

**Remember**: API integrations are inherently unreliable. Always implement
robust fallback mechanisms, monitor API health regularly, and have recovery
procedures ready. When APIs fail, fallback gracefully and notify users
appropriately. 🌐
