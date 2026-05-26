import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import parent codebase alchemical/astrological/culinary services
import { calculateNatalChart } from "../../src/services/natalChartService.js";
import { ingredientService } from "../../src/services/IngredientService.js";
import { recipeService } from "../../src/services/RecipeService.js";
import { alchemicalService } from "../../src/services/AlchemicalService.js";

const server = new Server(
  {
    name: "alchm-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Declare Exposed Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_live_sky_transits",
        description: "Calculate live astronomical transits, planetary degree alignments, and active elements for any coordinates under the vault.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate of target location (default NYC: 40.7498)",
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate of target location (default NYC: -73.7976)",
            },
          },
        },
      },
      {
        name: "alchemize_ingredients",
        description: "Ingests an array of raw food items, looks up their elemental values, and translates them into Spirit (Fire), Essence (Water), Matter (Earth), and Substance (Air) ratios, calculating overall thermodynamic metrics and alchemical harmony.",
        inputSchema: {
          type: "object",
          properties: {
            ingredients: {
              type: "array",
              items: { type: "string" },
              description: "List of ingredients in the pantry/fridge (e.g. ['tomato', 'basil', 'garlic'])",
            },
          },
          required: ["ingredients"],
        },
      },
      {
        name: "generate_cosmic_recipe",
        description: "Queries the complete 579 alchemical recipe database to discover cosmic, cosmos-aligned dishes matching specific keyword prompts, cuisines, elements, and dietary restrictions.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Keyword search term (e.g. 'soup', 'pasta', 'roasted')",
            },
            cuisine: {
              type: "string",
              description: "Target cuisine type (e.g. 'italian', 'french', 'indian', 'mexican')",
            },
            dietary: {
              type: "array",
              items: { type: "string" },
              description: "Dietary restrictions, options: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']",
            },
            dominantElement: {
              type: "string",
              enum: ["Fire", "Water", "Earth", "Air"],
              description: "Target dominant cosmic element of the recipe",
            },
          },
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ─── TOOL: get_live_sky_transits ───
    if (name === "get_live_sky_transits") {
      const lat = (args?.latitude as number) ?? 40.7498;
      const lon = (args?.longitude as number) ?? -73.7976;

      const birthData = {
        dateTime: new Date().toISOString(),
        latitude: lat,
        longitude: lon,
        timezone: "UTC",
      };

      const chart = await calculateNatalChart(birthData);
      
      // Determine dominant element
      let dominant = "None";
      let maxVal = -1;
      Object.entries(chart.elementalBalance).forEach(([el, val]) => {
        if (val > maxVal) {
          maxVal = val;
          dominant = el;
        }
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              timestamp: birthData.dateTime,
              coordinates: { latitude: lat, longitude: lon },
              elementalBalance: chart.elementalBalance,
              dominantElement: dominant,
              planetaryPositions: chart.planetaryPositions,
            }, null, 2),
          },
        ],
      };
    }

    // ─── TOOL: alchemize_ingredients ───
    if (name === "alchemize_ingredients") {
      const inputIngredients = (args?.ingredients as string[]) || [];
      if (inputIngredients.length === 0) {
        return {
          isError: true,
          content: [{ type: "text", text: "No ingredients provided." }],
        };
      }

      const analyzed = inputIngredients.map((name) => {
        const item = ingredientService.getIngredientByName(name);
        const props = item?.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        
        // Translate elements to ESMS
        const spirit = Math.round(props.Fire * 100);
        const essence = Math.round(props.Water * 100);
        const matter = Math.round(props.Earth * 100);
        const substance = Math.round(props.Air * 100);

        return {
          name,
          resolvedName: item?.name || "Unknown Alchemical Flora",
          category: item?.category || "uncategorized",
          esms: { spirit, essence, matter, substance },
          elementalProperties: props,
          planetaryRuler: item?.planetaryRuler || "none",
        };
      });

      // Calculate averages and harmony
      const averageProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
      analyzed.forEach((item) => {
        averageProps.Fire += item.elementalProperties.Fire;
        averageProps.Water += item.elementalProperties.Water;
        averageProps.Earth += item.elementalProperties.Earth;
        averageProps.Air += item.elementalProperties.Air;
      });

      const len = analyzed.length;
      averageProps.Fire /= len;
      averageProps.Water /= len;
      averageProps.Earth /= len;
      averageProps.Air /= len;

      const harmony = alchemicalService.analyzeAlchemicalHarmony(
        analyzed.map((a) => a.elementalProperties)
      );

      const thermo = alchemicalService.calculateThermodynamicProperties(averageProps);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ingredientCount: len,
              ingredients: analyzed,
              aggregateBalances: {
                spirit: Math.round(averageProps.Fire * 100),
                essence: Math.round(averageProps.Water * 100),
                matter: Math.round(averageProps.Earth * 100),
                substance: Math.round(averageProps.Air * 100),
              },
              overallHarmony: harmony.overallHarmony,
              dominantElement: harmony.dominantElement,
              thermodynamics: thermo,
              recommendations: harmony.recommendations,
            }, null, 2),
          },
        ],
      };
    }

    // ─── TOOL: generate_cosmic_recipe ───
    if (name === "generate_cosmic_recipe") {
      const prompt = (args?.prompt as string)?.toLowerCase() || "";
      const cuisine = args?.cuisine as string | undefined;
      const dietary = args?.dietary as string[] | undefined;
      const domElem = args?.dominantElement as string | undefined;

      const criteria: any = {
        cuisine,
        dietaryRestrictions: dietary,
        limit: 50, // Grab a larger search pool to filter
      };

      const rawRecipes = await recipeService.searchRecipes(criteria);
      
      let filtered = [...rawRecipes];

      // Keyword match
      if (prompt) {
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(prompt) ||
            (r.description || "").toLowerCase().includes(prompt)
        );
      }

      // Dominant element match
      if (domElem) {
        filtered = filtered.filter((r) => {
          const props = r.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
          let maxVal = -1;
          let activeDom = "Fire";
          Object.entries(props).forEach(([el, val]) => {
            if (val > maxVal) {
              maxVal = val;
              activeDom = el;
            }
          });
          return activeDom === domElem;
        });
      }

      // Slice final result set
      const finalRecipes = filtered.slice(0, 5).map((r) => {
        const props = r.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          cuisine: r.cuisine || "Cosmic",
          prepTime: r.timeToMake || "30 MIN",
          servings: r.numberOfServings || 2,
          esms: {
            spirit: Math.round(props.Fire * 100),
            essence: Math.round(props.Water * 100),
            matter: Math.round(props.Earth * 100),
            substance: Math.round(props.Air * 100),
          },
          isVegetarian: r.isVegetarian,
          isVegan: r.isVegan,
          isGlutenFree: r.isGlutenFree,
          isDairyFree: r.isDairyFree,
          ingredients: r.ingredients.map((ing) => `${ing.amount} ${ing.unit} ${ing.name} ${ing.preparation ? `(${ing.preparation})` : ""}`),
          instructions: r.instructions,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalMatching: filtered.length,
              returnedCount: finalRecipes.length,
              recipes: finalRecipes,
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing tool: ${error.message || error}`,
        },
      ],
    };
  }
});

// Ignite Server on Stdio Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Use console.error for logs since stdout is standard transport channel for StdioServerTransport
  console.error("\n================ ALCHM.KITCHEN MCP SERVER STARTED ================");
  console.error("Engine: Bun v1.3.13 / Native TypeScript Support");
  console.error("Communication Protocol: Model Context Protocol (Stdio)");
  console.error("Tools Loaded: get_live_sky_transits, alchemize_ingredients, generate_cosmic_recipe");
  console.error("==================================================================\n");
}

main().catch((err) => {
  console.error("MCP Server Crash:", err);
  process.exit(1);
});
