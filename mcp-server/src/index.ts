/**
 * Alchm MCP Server — stdio entry
 *
 * Thin wrapper around the registered tool handlers in `./tools.ts`. The
 * MCP transport, schema declaration, and JSON-RPC routing live here;
 * all alchemy logic + auth + invocation logging lives in `./tools.ts`
 * and its sibling modules so the same code path is exercised by:
 *
 *   - External LLM clients (Claude Desktop, Cursor, Antigravity).
 *   - The in-process synthetic probe (src/services/syntheticProbeService).
 *   - The mcp-server test harness.
 *
 * @file mcp-server/src/index.ts
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { invokeTool, type ToolName } from "../../src/lib/mcp/tools.js";

const server = new Server(
  {
    name: "alchm-mcp-server",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const META_DOC =
  "Optional `_meta.apiKey` (your alchm.kitchen API key) and `_meta.caller` (your client identifier, e.g. 'claude-desktop') unlock per-user quotas and invocation telemetry.";

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_live_sky_transits",
        description: `Calculate live astronomical transits, planetary degree alignments, and active elements for any coordinates under the vault. ${META_DOC}`,
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
        description: `Ingests an array of raw food items, looks up their elemental values, and translates them into Spirit (Fire), Essence (Water), Matter (Earth), and Substance (Air) ratios, calculating overall thermodynamic metrics and alchemical harmony. ${META_DOC}`,
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
        description: `Queries the complete 579 alchemical recipe database to discover cosmic, cosmos-aligned dishes matching specific keyword prompts, cuisines, elements, and dietary restrictions. Costs 7.5 of each ESMS token when called with an authenticated _meta.apiKey. ${META_DOC}`,
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await invokeTool(name as ToolName, (args ?? {}) as Record<string, unknown>);

  if (!result.ok) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              errorCode: result.errorCode ?? "INTERNAL",
              message: result.errorMessage ?? "Tool failed",
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result.data, null, 2),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("\n================ ALCHM.KITCHEN MCP SERVER STARTED ================");
  console.error("Engine: Bun v1.3.13 / Native TypeScript Support");
  console.error("Communication Protocol: Model Context Protocol (Stdio)");
  console.error("Tools Loaded: get_live_sky_transits, alchemize_ingredients, generate_cosmic_recipe");
  console.error(
    `Auth: ${process.env.MCP_USER_API_KEY ? "MCP_USER_API_KEY env" : "_meta.apiKey per call"}`,
  );
  console.error(
    `DB:   ${process.env.DATABASE_URL ? "live" : "local-fallback (no telemetry, no token gate)"}`,
  );
  console.error("==================================================================\n");
}

main().catch((err) => {
  console.error("MCP Server Crash:", err);
  process.exit(1);
});
