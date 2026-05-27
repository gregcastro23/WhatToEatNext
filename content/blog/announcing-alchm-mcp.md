---
title: "Announcing the Alchm MCP server"
slug: announcing-alchm-mcp
date: 2026-05-27
draft: true
authors:
  - alchm.kitchen
tags:
  - launch
  - mcp
  - claude
  - cursor
summary: >
  Five alchemical tools — live sky transits, ingredient ESMS analysis,
  cosmic recipe discovery, synastry overlays, and transit×natal overlays
  — are now available to any LLM that speaks Model Context Protocol.
  Mint a key, paste a config, and your chat assistant gains a working
  hand on the alchm.kitchen pipeline.
---

> **DRAFT — not yet published.** Marketing pass + final pricing
> language before going live. The technical details and config snippets
> are sourced from `mcp-server/README.md` and `docs/mcp-launch-checklist.md`
> and have been verified end-to-end against the live MCP server.

The chat assistants people are running today — Claude Desktop, Cursor,
Cline, Antigravity, anything built on the [Claude Agent
SDK](https://docs.anthropic.com/en/docs/build-with-claude/agent-sdk) —
are powerful but blind to anything outside their context window.
**[Model Context Protocol](https://modelcontextprotocol.io)** changes
that: an open standard, sponsored by Anthropic, that lets any MCP server
hand structured tools to any compliant client.

Today we're shipping the **alchm.kitchen MCP server** — five tools that
let your chat assistant ground its food and ritual recommendations in
live planetary data, real recipe metadata, and the full ESMS alchemical
balance model that powers alchm.kitchen itself.

## The tools

| Tool | What it does | Cost |
| --- | --- | --- |
| `get_live_sky_transits` | Current planetary positions + elemental balance for any coordinate. | Free |
| `alchemize_ingredients` | Spirit / Essence / Matter / Substance scores + thermodynamic indices for a list of ingredients. | Free |
| `generate_cosmic_recipe` | Search the 579-recipe catalog by element, cuisine, or dietary need. | 7.5 of each ESMS axis (30 total per call) |
| `compute_synastry_overlay` | Inter-aspect ledger between two natal charts — tension, harmony, intensification scores, recommended stance. | Free |
| `get_transit_natal_overlay` | Live sky × one agent's natal chart — which transiting planets activate which natal points, with continuous boost magnitude. | Free |

Every tool returns a structured JSON payload — the assistant on the
other side can quote it directly, reformat it for the user, or chain it
into a follow-up question without a single round-trip back through the
public API.

## Install in 2 minutes

### Claude Desktop

Add this to `~/Library/Application Support/Claude/claude_desktop_config.json`
on macOS (the path on Windows is in the docs):

```json
{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"],
      "env": {
        "DATABASE_URL": "postgres://...",
        "MCP_USER_API_KEY": "sk_alchm_live_xxx"
      }
    }
  }
}
```

Restart Claude Desktop, open a new chat, and type `/mcp` — you'll see
the five tools listed.

### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project):

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

### Cline (VS Code) and other clients

Cline's config lives in `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`.
The shape is identical to Claude Desktop above. For anything else MCP-
compliant — Antigravity, your own Agent SDK build — point it at the
same `bun run mcp-server/src/index.ts` and pass your key via
`MCP_USER_API_KEY` (single-user installs) or `_meta.apiKey` (per-call,
multi-user setups).

## Mint a key

Sign in to alchm.kitchen and visit
[**`/profile/api-keys`**](https://alchm.kitchen/profile/api-keys). Click
"Mint a key", name it after the client (`Claude Desktop`, `Cursor`,
whatever you'll recognize in the audit log), and copy the plaintext.

> The plaintext is shown **exactly once**. Paste it into the MCP client
> config immediately — there's no way to recover it later. If you lose
> it, just revoke and mint another; old keys retain their ESMS
> attribution but can no longer be used.

Keys are stored as `sha256(plaintext)` server-side. Revoke any key at
any time from the same page; revocation is a soft delete (`is_active =
false`) so your invocation history stays attributed.

## Buying ESMS top-ups

The two transit/synastry/overlay tools are free forever. The recipe
generator (`generate_cosmic_recipe`) spends ESMS — 7.5 from each of
the four axes per call. Your monthly subscription tops you up; if you
need more, [`/account/billing/mcp`](https://alchm.kitchen/account/billing/mcp)
sells one-shot bundles:

| SKU | Price | ESMS / axis |
| --- | --- | --- |
| Starter | $5 | +50 |
| Builder | $20 | +250 |
| Adept | $50 | +750 |

Stripe handles the checkout; the credit hits your `token_balances` row
within seconds of the webhook firing. Idempotency-key dedupe is in
place — even if Stripe retries the webhook, you'll never be
double-credited.

## Known limitations (be honest with your assistant)

We'd rather have these on the front page than buried in a postmortem:

- **Per-key rate limits.** Apprentice (free-tier) keys get 60 RPM;
  Alchemist (premium-tier) keys get 300 RPM. Hitting the cap returns
  a `RATE_LIMIT` error with a `retryAfterSec` field — well-behaved
  clients should honor it.
- **Cold-start latency.** First call after a quiet period can take
  1–2 seconds while the local Bun process and Postgres pool warm up.
  Subsequent calls land in the 100–250ms range.
- **Cross-server view is incomplete.** alchm.kitchen MCP and Planetary
  Agents MCP run as separate servers today. A unified `/admin/mcp`
  topology view that shows both is in progress; for now, each server
  reports its own telemetry.

## What's next

We're building out the cross-server admin panel, finishing the load
test at 100 RPM, and listing on the [MCP server
registry](https://github.com/modelcontextprotocol/servers). If you find
a rough edge, [open an issue](https://github.com/gregcastro23/WhatToEatNext/issues)
or ping us — operator feedback in the first week of a launch is the
most valuable kind.

Mint a key, open a chat, and try:

> Use alchm-kitchen to find me three vegetarian dinners that lean Fire
> and respect tonight's transits.

Let us know what your assistant comes back with. 🜂
