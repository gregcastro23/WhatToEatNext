# MCP Server Registry submission — alchm.kitchen

How to list the alchm.kitchen MCP server in the official MCP registry.

**Submission status:** ⏸ not yet submitted. Gated on (a) the announcement
blog being live and (b) the packaging prerequisite below.

> ⚠️ **Approach corrected 2026-05-29.** The old plan here — open a PR adding an
> entry to a "third-party servers" list in `modelcontextprotocol/servers/README.md`
> — is **obsolete**. That repo is now *reference-servers only*; its README states:
> *"If you are looking for a list of MCP servers, you can browse published servers
> on [the MCP Registry](https://registry.modelcontextprotocol.io/). The repository
> served by this README is dedicated to housing just the small number of reference
> servers maintained by the MCP steering group."* A README PR there would be closed.
> Servers are now published to **registry.modelcontextprotocol.io** via the
> `mcp-publisher` CLI + a `server.json`.

---

## ⛔ Prerequisite — package the server first (blocker)

The registry catalogs **installable** servers — an npm/PyPI/Docker package or a
remote (HTTP) endpoint. Our server today runs via `bun run /abs/path/.../mcp-server/src/index.ts`
(a local stdio process), which the registry **cannot** reference. Before we can
publish, pick one:

- **Option A (recommended): publish `mcp-server/` to npm** as e.g.
  `@alchm/mcp-server` with a `bin` so `npx -y @alchm/mcp-server` (or `bunx`)
  launches it. Then `server.json` references the npm package. Requires: an npm
  `package.json` with `bin` + `files`, an npm org/account, `npm publish`. The
  server imports from `../../src/lib/mcp/*`, so packaging must bundle those (or
  the npm build must vendor them) — non-trivial; scope this as its own task.
- **Option B: host a remote MCP endpoint** (HTTP/SSE) and register it as a
  `remotes` entry. The server is stdio-only today, so this is also new work.

Until one of these exists, the steps below cannot complete the `publish`.

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

`mcp-publisher init` writes a schema-valid `server.json` template — start from
it (don't hand-author the schema; it drifts). Fill in our values:

```jsonc
// DRAFT — reconcile field names/shape with `mcp-publisher init` output + the
// live $schema before publishing. Assumes Option A (npm package) above.
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "io.github.gregcastro23/alchm-kitchen",
  "description": "Live planetary transits, ingredient ESMS analysis, cosmic recipe search, synastry + transit×natal overlays — alchemy-aware food & ritual recommendations.",
  "version": "1.1.0",
  "repository": {
    "url": "https://github.com/gregcastro23/WhatToEatNext",
    "source": "github",
    "subfolder": "mcp-server"
  },
  "packages": [
    {
      "registryType": "npm",
      "identifier": "@alchm/mcp-server",
      "version": "1.1.0",
      "transport": { "type": "stdio" },
      "environmentVariables": [
        { "name": "MCP_USER_API_KEY", "description": "alchm.kitchen API key minted at /profile/api-keys (optional; unlocks per-user quotas)", "isSecret": true, "isRequired": false },
        { "name": "DATABASE_URL", "description": "Optional; enables the token gate + invocation telemetry. Omit for anonymous mode.", "isSecret": true, "isRequired": false }
      ]
    }
  ]
}
```

Notes:
- `version` (1.1.0) matches `mcp-server/package.json` + the server's `serverInfo`.
- No credentials are required to install — users mint their own API key; both
  env vars are optional (anonymous mode works).

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

2. `npx -y @alchm/mcp-server` (the published package) starts and answers a
   `tools/list` handshake — i.e. the npm package, not just the local checkout.
3. `curl -I https://alchm.kitchen/docs/mcp` → 200 (the public connector guide).
4. The announcement blog (`content/blog/announcing-alchm-mcp.md`) is published.

## Step 4 — Publish

```bash
mcp-publisher publish        # validates server.json against the live schema + pushes
```

Then verify the listing resolves on https://registry.modelcontextprotocol.io/.

## Step 5 — After publish

- Add a "Listed on the MCP registry" line + the registry URL to
  `mcp-server/README.md`.
- Record the published namespace/version in this file's **Submission status**
  header and flip it to ✅.

---

_Rewritten 2026-05-29 to target registry.modelcontextprotocol.io (the README-PR
path is obsolete). The `server.json` above is a DRAFT — validate against
`mcp-publisher init` + the live `$schema` at publish time._
