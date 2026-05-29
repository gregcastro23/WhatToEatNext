# Alchm.kitchen MCP Server

[![Listed on MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.gregcastro23%2Falchm--kitchen-blueviolet)](https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen)
[![npm](https://img.shields.io/npm/v/@alchm/mcp-server)](https://www.npmjs.com/package/@alchm/mcp-server)

An [MCP server](https://modelcontextprotocol.io) exposing five alchemical tools — live sky transits, ingredient ESMS analysis, cosmic recipe discovery, synastry overlays, and transit×natal overlays — to any LLM client that speaks MCP (Claude Desktop, Cursor, Google Antigravity, Claude Agent SDK, etc.).

## Install

```bash
# Bun (recommended)
bunx @alchm/mcp-server

# Node / npx
npx -y @alchm/mcp-server
```

Or install globally:

```bash
bun add -g @alchm/mcp-server
alchm-mcp-server
```

## Tools

| Tool | Cost | Description |
| --- | --- | --- |
| `get_live_sky_transits` | Free | Current planetary positions + elemental balance for any coordinate. |
| `alchemize_ingredients` | Free | Spirit / Essence / Matter / Substance scores + thermodynamic indices for a list of ingredients. |
| `generate_cosmic_recipe` | 7.5 of each ESMS (30 total) | Search the 579-recipe catalog by element, cuisine, dietary needs. |
| `compute_synastry_overlay` | Free | Inter-aspect ledger between two natal charts — tension / harmony / intensification scores + a recommended stance. |
| `get_transit_natal_overlay` | Free | Live sky × one agent's natal chart — which transiting planets activate which natal points, with continuous boost magnitude. |

`generate_cosmic_recipe` debits tokens only when called with a valid `_meta.apiKey`. Anonymous callers receive a `QUOTA` error rather than a free recipe. The other four tools are free.

## Mint an API key

End users mint, list, and revoke their own keys at [`/profile/api-keys`](https://alchm.kitchen/profile/api-keys). The plaintext is shown exactly once — paste it into the MCP client config immediately. The public onboarding doc lives at [`/docs/mcp`](https://alchm.kitchen/docs/mcp).

Keys are stored as `sha256(plaintext)` in the `api_keys` table; the only place the plaintext ever appears is the `POST /api/account/api-keys` response body.

## Run from source

```bash
bun run mcp-server/src/index.ts
```

Optional env:

```bash
DATABASE_URL=postgres://...           # enables token gate + invocation telemetry
MCP_USER_API_KEY=sk_alchm_...         # single-user setups (Claude Desktop)
INTERNAL_API_SECRET=...               # synthetic-probe exempt path (set by Vercel cron)
SYNTHETIC_PROBE_USER_ID=<uuid>        # attribute synthetic-probe invocations to this user
```

When `DATABASE_URL` is absent the server still runs — all calls become anonymous, the token gate skips, and invocations are not logged.

## Per-call auth

Every tool accepts an optional `_meta` field on its arguments:

```json
{
  "name": "generate_cosmic_recipe",
  "arguments": {
    "prompt": "spicy",
    "cuisine": "thai",
    "_meta": {
      "apiKey": "sk_alchm_live_xxx",
      "caller": "claude-desktop"
    }
  }
}
```

- `_meta.apiKey` resolves to an `api_keys` row → bound user → ESMS debit happens against that user's balance.
- `_meta.caller` is a free-form identifier (e.g. `"claude-desktop"`, `"cursor"`, `"pa-mcp"`) persisted on the invocation row.

If `MCP_USER_API_KEY` is set in the environment, it is used as the default `apiKey` for every call — convenient for single-user installs.

## Connecting Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent on your platform:

```json
{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"
      ],
      "env": {
        "DATABASE_URL": "postgres://...",
        "MCP_USER_API_KEY": "sk_alchm_live_xxx"
      }
    }
  }
}
```

See `claude-desktop.config.example.json` in this directory for a copy-paste template.

## Connecting Cursor

Add to `~/.cursor/mcp.json` or the project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_xxx"
      }
    }
  }
}
```

## Telemetry & Operations

Every successful or failed tool call writes a row to `mcp_invocations` (Postgres). Surfaces:

- **Admin dashboard** — `/admin` System Status panel now includes an `MCP Tool Surface` flow showing call rate, error rate, p95 latency, and the synthetic probe verdict.
- **Agent Telemetry** — `mcpInvocationRate` joins `transmutationRate`, `spiritualEntropy`, and `agentHarmony` as a live metric on the High Alchemist dashboard.
- **Synthetic probe** — `/api/cron/synthetic-mcp` exercises the tool layer every 30 minutes; failures downgrade the dashboard verdict to `INCIDENT` even with zero organic MCP traffic.

## Testing

- `bun test src/lib/mcp/__tests__/tools.test.ts` — unit tests for the tool handlers + auth gate.
- `MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts` — spawns the actual server and verifies the JSON-RPC handshake + `tools/list` + a `tools/call` round-trip.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the two-server topology (Alchm MCP + PA MCP) and the cross-server bridge that lets PA personas ground their responses in live alchm.kitchen state.
