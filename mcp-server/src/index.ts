#!/usr/bin/env node
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

// ─── Backend URL for chart/transit self-fetches ───────────────────────
//
// The chart-dependent tools (get_live_sky_transits, get_transit_natal_overlay)
// build a natal chart by POSTing to `${base}/api/astrologize`, a route served
// by the alchm.kitchen Next.js app. Inside that app `base` resolves to the
// Vercel alias — but this server runs STANDALONE (Claude Desktop, the npm
// package, or the Bun-compiled desktop sidecar) with no co-located Next
// backend, so the inherited `http://localhost:3000` default is unreachable on
// an end-user machine → "fetch failed".
//
// Mirror the PA sidecar fix (planetary_agents `_resolve_url`): an explicit env
// always wins; a bundled/compiled artifact (no local backend) falls back to
// PROD; a from-source dev run falls back to localhost. The chart fetch reads
// `ALCHM_MCP_BACKEND_URL` first (see natalChartService.getAstrologizeApiUrl()).
const PROD_BACKEND_URL = "https://alchm.kitchen";
const DEV_BACKEND_URL = "http://localhost:3000";

/**
 * True when this process is a distributable artifact — the npm `dist/index.js`
 * bundle or the `bun build --compile` binary — rather than a raw
 * `bun run src/index.ts`. The build scripts bake `ALCHM_MCP_BUNDLED=1` via
 * `--define`; the `$bunfs` check is a runtime fallback for a compiled binary
 * built without that flag (Bun executables resolve their entry inside the
 * embedded "$bunfs" virtual filesystem; a from-source run resolves a real path).
 */
function isBundledSidecar(): boolean {
  if (process.env.ALCHM_MCP_BUNDLED === "1") return true;
  const bunMain = (globalThis as { Bun?: { main?: string } }).Bun?.main ?? "";
  return bunMain.includes("/$bunfs/");
}

// Explicit backend env (any of these) wins and is left untouched. Only when
// none is set do we choose a default: prod for bundled artifacts, localhost for
// from-source dev runs.
const hasExplicitBackend = Boolean(
  process.env.ALCHM_MCP_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim(),
);
if (!hasExplicitBackend) {
  process.env.ALCHM_MCP_BACKEND_URL = isBundledSidecar()
    ? PROD_BACKEND_URL
    : DEV_BACKEND_URL;
}

const server = new Server(
  {
    name: "alchm-mcp-server",
    version: "1.1.2",
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
      {
        name: "compute_synastry_overlay",
        description: `Compute the inter-aspect ledger between two agents' natal charts: pairwise planet-to-planet aspects (conjunction, sextile, square, trine, opposition) with orb/exactness, plus tension / harmony / intensification scores and a recommended target stance (clash | absorb | mirror). Drives the desktop Jing Arena's counter-move pool selection. Pure math; pg cache used when seeded. ${META_DOC}`,
        inputSchema: {
          type: "object",
          required: ["agentA", "agentB"],
          properties: {
            agentA: {
              type: "object",
              required: ["id", "natalChart"],
              properties: {
                id: { type: "string", description: "Stable agent identifier" },
                natalChart: {
                  type: "object",
                  description: "Natal chart with planets keyed by name, each having {sign, degree, retrograde?, house?}",
                },
              },
            },
            agentB: {
              type: "object",
              required: ["id", "natalChart"],
              properties: {
                id: { type: "string" },
                natalChart: { type: "object" },
              },
            },
            focusPlanets: {
              type: "array",
              items: { type: "string" },
              description: "Planets to include (default: Sun, Moon, Mercury, Venus, Mars, Saturn, Jupiter)",
            },
            cacheStrategy: {
              type: "string",
              enum: ["read", "write", "bypass"],
              description: "read = use synastry_scores if present; write = compute and upsert; bypass = compute, skip pg. Default: read.",
            },
          },
        },
      },
      {
        name: "get_transit_natal_overlay",
        description: `Compute the current sky × one agent's natal chart: which transiting planets are activating which natal points, with aspect type/orb/exactness, dominant boost element, and continuous boost magnitude (0..1). Replaces the global 'Transit Active' badge with per-agent overlays. ${META_DOC}`,
        inputSchema: {
          type: "object",
          required: ["agent"],
          properties: {
            agent: {
              type: "object",
              required: ["id", "natalChart"],
              properties: {
                id: { type: "string" },
                natalChart: { type: "object" },
              },
            },
            transitTime: {
              type: "string",
              description: "ISO 8601 timestamp for the transit moment (default: now)",
            },
            latitude: {
              type: "number",
              description: "Latitude for the transit chart (default: 40.7498 NYC)",
            },
            longitude: {
              type: "number",
              description: "Longitude for the transit chart (default: -73.7976 NYC)",
            },
            focusPlanets: {
              type: "array",
              items: { type: "string" },
              description: "Transiting planets to include (default: Sun, Moon, Mars, Saturn, Jupiter, Pluto)",
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
  console.error("Tools Loaded: get_live_sky_transits, alchemize_ingredients, generate_cosmic_recipe, compute_synastry_overlay, get_transit_natal_overlay");
  console.error(
    `Auth: ${process.env.MCP_USER_API_KEY ? "MCP_USER_API_KEY env" : "_meta.apiKey per call"}`,
  );
  console.error(
    `DB:   ${process.env.DATABASE_URL ? "live" : "local-fallback (no telemetry, no token gate)"}`,
  );
  console.error(
    `Backend (chart/transit /api/astrologize): ${process.env.ALCHM_MCP_BACKEND_URL ?? "app self-URL (SITE_URL / VERCEL_URL)"}${isBundledSidecar() ? " [bundled]" : ""}`,
  );
  console.error("==================================================================\n");
}

main().catch((err) => {
  console.error("MCP Server Crash:", err);
  process.exit(1);
});
