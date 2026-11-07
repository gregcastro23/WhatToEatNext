# MCP Server Registry submission — alchm.kitchen

How to list the alchm.kitchen MCP server in the official Model Context Protocol (MCP) registry.

**Submission status:** ⏸ npm package published (`@alchm/mcp-server@1.5.0`) — registry listing pending `mcp-publisher` step below.

> ✅ **Modern Registry Model.** Servers are published to **registry.modelcontextprotocol.io**
> via `mcp-publisher` + `server.json`. Both the local stdio bundle and the remote
> Streamable HTTP gateway (`https://alchm.kitchen/api/mcp`) implement the official MCP specifications.

---

## ✅ Package Published & Transports

`@alchm/mcp-server@1.5.0` is published to npm and deployed remotely:

```bash
# 1. Local stdio transport (Claude Desktop, Cursor, local tools)
bunx @alchm/mcp-server      # Bun (recommended)
npx -y @alchm/mcp-server    # Node / npx

# 2. Remote Streamable HTTP gateway (Meta Muse, Cursor remote, Claude remote)
https://alchm.kitchen/api/mcp
```

The package is a self-contained `bun build --bundle --target node` output with the shebang `#!/usr/bin/env node` so it runs under both runtimes. `pg` is kept external (operators supply `DATABASE_URL` at runtime); all 579 catalog recipes, 1,002 alchemical ingredient matrices, and astronomy-engine calculations are vendored directly into `dist/index.js`.

---

## Step 1 — Namespace + auth

The registry validates namespace ownership against a GitHub identity. Publish
under **`io.github.gregcastro23/alchm-kitchen`** (the `io.github.<user>/<name>`
namespace), authenticated as `gregcastro23`:

```bash
mcp-publisher login github          # opens browser; auth as gregcastro23
```

(For CI publishing, a GitHub Action running on a gregcastro23-owned repo can
authenticate instead.)

---

## Step 2 — Generate + fill `server.json`

`server.json` is maintained at `mcp-server/server.json`:

```jsonc
// mcp-server/server.json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "io.github.gregcastro23/alchm-kitchen",
  "description": "Thirteen culinary & food tools: transits, ingredients, recipes, synastry, grocery lists, substitutions, pantry recommendations, evidence snapshots and reflections.",
  "version": "1.5.0",
  "repository": {
    "url": "https://github.com/gregcastro23/WhatToEatNext",
    "source": "github",
    "subfolder": "mcp-server"
  },
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@alchm/mcp-server",
      "version": "1.5.0",
      "transport": {
        "type": "stdio"
      },
      "environmentVariables": [
        {
          "name": "MCP_USER_API_KEY",
          "description": "Optional alchm.kitchen API key. Requires operator DATABASE_URL for validation and billing. Anonymous read tools run in demo mode; reflection publication and profile updates require authentication.",
          "isSecret": true,
          "isRequired": false
        },
        {
          "name": "ALCHM_MCP_USER_API_KEY",
          "description": "Alias for MCP_USER_API_KEY, supported in sanitized Planetary Agents client environments.",
          "isSecret": true,
          "isRequired": false
        },
        {
          "name": "DATABASE_URL",
          "description": "Operator PostgreSQL connection string for API-key validation, ESMS billing, optional cache and telemetry. Without it, only anonymous demo reads are available.",
          "isSecret": true,
          "isRequired": false
        },
        {
          "name": "ALCHM_MCP_BACKEND_URL",
          "description": "Backend origin serving /api/astrologize. Bundled artifacts default to https://alchm.kitchen; source runs default to http://localhost:3000.",
          "isSecret": false,
          "isRequired": false
        }
      ]
    }
  ]
}
```

---

## Step 3 — Verify before publishing

1. `MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts` — `tools/list`
   must return all **13** tools:

   | Tool | Function | Cost (ESMS) | Annotations |
   | --- | --- | --- | --- |
   | `get_live_sky_transits` | Current planetary positions + elemental balance for any coordinate. | Free | `readOnlyHint: true` |
   | `alchemize_ingredients` | Spirit / Essence / Matter / Substance scores + thermodynamic indices for an ingredient list. | Free | `readOnlyHint: true` |
   | `generate_cosmic_recipe` | Search the 579-recipe catalog by element, cuisine, or dietary need. | 10 ESMS | `readOnlyHint: false` |
   | `compute_synastry_overlay` | Inter-aspect ledger between two natal charts (tension / harmony / intensification). | Free | `readOnlyHint: true` |
   | `get_transit_natal_overlay` | Live sky × one agent's natal chart, with continuous boost magnitude per planet. | Free | `readOnlyHint: true` |
   | `compute_triplicate_synastry` | Triplicate harmonic resonance evaluation for maker + taker + sky transits. | Free | `readOnlyHint: true` |
   | `create_evidence_snapshot` | Verifiable atomic snapshot of transits, catalog matches, and elemental vectors. | 10 ESMS | `readOnlyHint: false` |
   | `submit_recipe_reflection` | Post a verified culinary review to the alchemical feed with author signature. | 0.4 ESMS | `readOnlyHint: false` |
   | `get_user_allowance` | Check live ESMS balances and fee schedule across all 13 tools. | Free | `readOnlyHint: true` |
   | `substitute_ingredient` | Context-aware culinary substitutions with ratios, texture impacts, and elemental shifts. | Free | `readOnlyHint: true` |
   | `build_consolidated_grocery_list` | 10-aisle consolidated shopping list with unit conversions, pantry coverage, and actionable search queries. | Free | `readOnlyHint: true` |
   | `what_to_cook_now` | Pantry-first recipe matching scoring available ingredients against tastes, prep time, Solar Return ephemeris, and planetary weather. | Free | `readOnlyHint: true` |
   | `update_culinary_profile` | Persist caller allergen guardrails, dietary frameworks, disliked ingredients, and kitchen gear. | Free | `readOnlyHint: false` |

2. Verify Full MCP Triad:
   - **4 Prompts**: `cosmic_meal_planning`, `pantry_alchemical_balance`, `historical_culinary_council`, `fast_pantry_dinner`
   - **4 Resources**: `alchm://sky/now`, `alchm://catalog/cuisines`, `alchm://account/allowance`, `alchm://account/culinary-profile`
   - **4 Resource Templates**: `alchm://ingredients/{slug}`, `alchm://techniques/{slug}`, `alchm://recipes/{id}`, `alchm://solar-return/{year}`
   - **Interactive Autocomplete**: `completion/complete` for ingredients, techniques, and prompt arguments.

3. `bunx @alchm/mcp-server` starts and answers a `tools/list` handshake.
4. `curl -I https://alchm.kitchen/docs/mcp` → 200.
5. The announcement blog (`content/blog/announcing-alchm-mcp.md`) is published.

---

## Step 4 — Publish to the registry

```bash
cd mcp-server
mcp-publisher publish        # validates server.json against the live schema + pushes
```

Then verify: https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen

---

## Step 5 — After publish

- Flip this file's **Submission status** to ✅ with the registry URL.
- The `mcp-server/README.md` badges already link to the registry URL.
