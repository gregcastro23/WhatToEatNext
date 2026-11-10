# MCP Server Registry submission — alchm.kitchen

How to list the alchm.kitchen MCP server in the official Model Context Protocol (MCP) registry.

**Submission status:** ⏸ npm package ready (`@alchm/mcp-server@1.5.2`) — registry listing pending `mcp-publisher` step below.

> ✅ **Modern Registry Model.** Servers are published to **registry.modelcontextprotocol.io**
> via `mcp-publisher` + `server.json`. Both the local stdio bundle and the remote
> Streamable HTTP gateway (`https://alchm.kitchen/api/mcp`, plus the OpenAPI 3.1.0 REST bridge at `https://alchm.kitchen/api/mcp/rest/[tool]`) implement the official MCP specifications.

---

## ✅ Package Published & Transports

`@alchm/mcp-server@1.5.2` is packaged for npm (`29.2 kB` tarball) and deployed remotely:

```bash
# 1. Local stdio transport (Claude Desktop, Cursor, local tools)
bunx @alchm/mcp-server      # Bun (recommended)
npx -y @alchm/mcp-server    # Node / npx

# 2. Remote Streamable HTTP gateway (Meta Muse, Cursor remote, Claude remote)
https://alchm.kitchen/api/mcp

# 3. OpenAPI 3.1.0 REST bridge (automatic stdio HTTP fallback when DATABASE_URL is absent)
https://alchm.kitchen/api/mcp/openapi.json
https://alchm.kitchen/api/mcp/rest/{tool}
```

The package is a self-contained `bun build --bundle --target node` output with the shebang `#!/usr/bin/env node` so it runs under both runtimes. `pg` is kept external (operators supply `DATABASE_URL` at runtime; key-only installs automatically bridge to the hosted endpoint); all 579 catalog recipes, 1,002 alchemical ingredient matrices, and astronomy-engine calculations are vendored directly into `dist/index.js`.

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
  "version": "1.5.2",
  "repository": {
    "url": "https://github.com/gregcastro23/WhatToEatNext",
    "source": "github",
    "subfolder": "mcp-server"
  },
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@alchm/mcp-server",
      "version": "1.5.2",
      "transport": {
        "type": "stdio"
      },
      "environmentVariables": [
        {
          "name": "MCP_USER_API_KEY",
          "description": "Optional alchm.kitchen API key (mint at https://alchm.kitchen/profile/api-keys). Without DATABASE_URL the server forwards each call to the hosted endpoint, which validates the key and applies billing. Without a key, read tools run locally in demo mode; reflection publication requires a key.",
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
          "description": "Operator-only PostgreSQL connection string. Setting it runs the tools in-process and validates keys and ESMS billing locally; leave it unset to use the hosted service (with a key) or demo mode (without).",
          "isSecret": true,
          "isRequired": false
        },
        {
          "name": "ALCHM_MCP_MODE",
          "description": "Optional. auto (the default): with an API key and no DATABASE_URL the server forwards to the hosted endpoint, otherwise it runs in-process. remote: always forward to the hosted endpoint, even if an unrelated DATABASE_URL is set in the environment (needs MCP_USER_API_KEY). local: always run in-process (with a key and no DATABASE_URL, tool calls still go to the hosted REST endpoint under ALCHM_MCP_BACKEND_URL).",
          "isSecret": false,
          "isRequired": false
        },
        {
          "name": "ALCHM_MCP_REMOTE_URL",
          "description": "Optional. The hosted MCP endpoint a key-only install forwards to, and the place your API key is sent: set it only to a host you trust. Defaults to https://alchm.kitchen/api/mcp; must be https (http is accepted only for localhost).",
          "isSecret": false,
          "isRequired": false
        },
        {
          "name": "ALCHM_MCP_BACKEND_URL",
          "description": "Backend origin serving /api/astrologize. Bundled artifacts default to https://alchm.kitchen; source runs default to http://localhost:3000. It is also where the in-process server sends a keyed tool call when it has no database (ALCHM_MCP_MODE=local), so it is where your API key goes then: https, or http only for localhost, 127.0.0.1 and [::1], without credentials, a query string or a fragment.",
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
   must return all **13** registered MCP tools (plus the companion kitchen-lab / adaptation calculators `calculate_batch_circuit` and `compile_adaptation` exposed on the WTEN web surface):

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
   | `what_to_cook_now` | Pantry-first recipe matching scoring available ingredients against tastes, prep time, Solar Return ephemeris, and planetary weather. | 10 ESMS | `readOnlyHint: false` |
   | `update_culinary_profile` | Persist caller allergen guardrails, dietary frameworks, disliked ingredients, and kitchen gear. | Free | `readOnlyHint: false` |

   Companion WTEN deterministic kitchen engines (surfaced via `/cooking-methods/tilt-skillet` and `/api/recipes/[recipeId]/adapt` alongside the MCP catalog):
   - **`calculate_batch_circuit`** (`src/utils/tiltSkilletCircuitCore.ts`): 4-stage thermal batch circuit planner (zone assignment, surface fill ratio, steam recovery, and sequenced pour schedules).
   - **`compile_adaptation`** (`src/utils/dietaryAdaptation.ts` & `src/lib/recipes/savedAdaptationService.ts`): Deterministic multi-persona dietary swap compiler with inline instruction rewriting, elemental/nutrition recomputation, and verified receipt persistence.

2. Verify Full MCP Triad:
   - **4 Prompts**: `cosmic_meal_planning`, `pantry_alchemical_balance`, `historical_culinary_council`, `fast_pantry_dinner`
   - **7 Static Resources**: `alchm://sky/now`, `alchm://catalog/cuisines`, `alchm://catalog/dietary-restrictions`, `alchm://ontology/esms`, `alchm://agents/roster`, `alchm://economy/tool-costs`, `alchm://account/allowance`, `alchm://account/culinary-profile`
   - **4 Resource Templates**: `alchm://ingredients/{slug}`, `alchm://techniques/{slug}`, `alchm://recipes/{id}`, `alchm://solar-return/{year}`
   - **Interactive Autocomplete**: `completion/complete` for ingredients, techniques, and prompt arguments.

3. `bunx @alchm/mcp-server` starts and answers a `tools/list` handshake.
4. `curl -I https://alchm.kitchen/docs/mcp` → 200.
5. The announcement blog (`content/blog/announcing-alchm-mcp.md`) is published.

---

## Step 4 — Publish to npm & the Official MCP Registry

```bash
cd mcp-server
npm publish --access public
mcp-publisher login github
mcp-publisher publish        # validates server.json against the live schema + pushes
```

Then verify:
- `https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen`
- `https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.gregcastro23/alchm-kitchen`

---

## Step 5 — After publish

- Flip this file's **Submission status** to ✅ with the registry URL.
- The `mcp-server/README.md` badges already link to the registry URL.
