# MCP Server Registry submission — alchm.kitchen

How to list the alchm.kitchen MCP server in the official MCP registry.

**Submission status:** ⏸ npm package published — registry listing pending `mcp-publisher` step below.

> ✅ **Approach corrected 2026-05-29.** The old plan here — open a PR adding an
> entry to a "third-party servers" list in `modelcontextprotocol/servers/README.md`
> — is **obsolete**. That repo is now *reference-servers only*. Servers are now
> published to **registry.modelcontextprotocol.io** via `mcp-publisher` + `server.json`.

---

## ✅ Done — npm package published

`@alchm/mcp-server@1.1.0` is on npm. Users install with:

```bash
bunx @alchm/mcp-server      # Bun (recommended)
npx -y @alchm/mcp-server    # Node / npx
```

The package is a self-contained `bun build --bundle --target node` output with
the shebang `#!/usr/bin/env node` so it runs under both runtimes. `pg` is kept
external (users supply `DATABASE_URL` at runtime); all other monorepo sources
are vendored into `dist/index.js`.

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

## Step 2 — Generate + fill `server.json`

`server.json` is already created at `mcp-server/server.json`. Run
`mcp-publisher init` to validate the schema, or publish directly:

```jsonc
// mcp-server/server.json — committed, schema-compliant draft
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "io.github.gregcastro23/alchm-kitchen",
  "description": "Live transits, ESMS ingredients, cosmic recipes, synastry & transit×natal overlays by alchm.kitchen",
  "version": "1.1.0",
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@alchm/mcp-server",
      "version": "1.1.0",
      "transport": { "type": "stdio" },
      "environmentVariables": [
        { "name": "MCP_USER_API_KEY", "isSecret": true, "isRequired": false },
        { "name": "DATABASE_URL",     "isSecret": true, "isRequired": false }
      ]
    }
  ]
}
```

## Step 3 — Verify before publishing

1. `MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts` — `tools/list`
   must return exactly these **5** tools:

   | Tool | Function |
   | --- | --- |
   | `get_live_sky_transits` | Current planetary positions + elemental balance for any coordinate. |
   | `alchemize_ingredients` | Spirit / Essence / Matter / Substance scores + thermodynamic indices for an ingredient list. |
   | `generate_cosmic_recipe` | Search the 579-recipe catalog by element, cuisine, or dietary need. |
   | `compute_synastry_overlay` | Inter-aspect ledger between two natal charts (tension / harmony / intensification). |
   | `get_transit_natal_overlay` | Live sky × one agent's natal chart, with continuous boost magnitude per planet. |

2. `bunx @alchm/mcp-server` starts and answers a `tools/list` handshake — i.e.
   the published npm package, not just the local checkout.
3. `curl -I https://alchm.kitchen/docs/mcp` → 200.
4. The announcement blog (`content/blog/announcing-alchm-mcp.md`) is published.

## Step 4 — Publish to the registry

```bash
cd mcp-server
mcp-publisher publish        # validates server.json against the live schema + pushes
```

Then verify: https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen

## Step 5 — After publish

- Flip this file's **Submission status** to ✅ with the registry URL.
- The `mcp-server/README.md` badges already link to the registry URL.

---

_Rewritten 2026-05-29 to target registry.modelcontextprotocol.io (the README-PR
path is obsolete). Updated 2026-05-29 to reflect npm packaging complete._
