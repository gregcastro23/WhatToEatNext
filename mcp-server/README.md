# Alchm.kitchen MCP Server

[![Listed on MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.gregcastro23%2Falchm--kitchen-blueviolet)](https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen)
[![npm](https://img.shields.io/npm/v/@alchm/mcp-server)](https://www.npmjs.com/package/@alchm/mcp-server)

Version **1.4.0** exposes eight tools over **stdio**: live transits, curated ingredient analysis, recipe search, natal overlays, triplicate pricing, evidence snapshots and recipe reflections. It uses the maintained MCP TypeScript SDK v1 line and supports existing MCP initialization handshakes. It does not expose an HTTP/SSE server.

## Install or run

```bash
bunx @alchm/mcp-server
# Node.js alternative (Node 18+)
npx -y @alchm/mcp-server

# From this repository
bun install --cwd mcp-server
bun run mcp-server/src/index.ts

# Distributable Node bundle and standalone Bun sidecar
bun run --cwd mcp-server build
bun run --cwd mcp-server build:binary
```

The bundle is `mcp-server/dist/index.js`; the sidecar is `mcp-server/bin/alchm-mcp`. The binary build disables working-directory dotenv/bunfig autoloading and repairs/verifies its ad-hoc signature on macOS. Building prepares local artifacts; publishing npm, registry metadata and sidecar releases are separate release steps.

## Tools

| Tool                          | Authenticated cost           | Behavior                                                                                                                                            |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_live_sky_transits`       | Free                         | Current planetary positions and elemental balance for an observer.                                                                                  |
| `alchemize_ingredients`       | Free                         | Curated elemental/ESMS data and thermodynamic indices for up to 100 ingredients. Missing ESMS quantities remain `null`.                             |
| `generate_cosmic_recipe`      | 2.5 of each ESMS (10 total)  | Search the whole recipe catalog by keywords, element, cuisine and diet. Returns 5 matches by default; `limit` and `offset` (no maximum) page through every match. Charged only when the search succeeds. |
| `compute_synastry_overlay`    | Free                         | Inter-chart aspects, scores and stance. `cacheStrategy: "write"` updates the optional database cache and requires a matching internal probe secret. |
| `get_transit_natal_overlay`   | Free                         | Sky-to-natal aspects and continuous per-element boosts for one agent.                                                                               |
| `compute_triplicate_synastry` | Free                         | Quote resonance, potential rebates and a cooldown window key; does not execute a trade or pay a rebate.                                             |
| `create_evidence_snapshot`    | 2.5 of each ESMS (10 total)  | Bundle transits, optional ingredients and recipe candidates in one call. Charged only for a complete snapshot.                                      |
| `submit_recipe_reflection`    | 0.1 of each ESMS (0.4 total) | Save a `proposed` reflection and its debit in one transaction, then attempt feed publication; requires an authenticated, non-synthetic caller.     |

Anonymous callers can use read tools in demo mode. Recipe search and evidence snapshots debit authenticated callers; reflection publication requires authentication. Invalid supplied credentials are rejected. An operator must configure `DATABASE_URL` to validate API keys and apply billing. An API key alone does not connect this stdio process to a hosted authentication service.

Tool annotations identify paid calls and reflection publication as mutations. The catalog declares bounded inputs; validation runs before authentication, billing and handler work. Coordinates must be within latitude/longitude bounds, ingredient lists contain 1–100 strings, reflections are 1–4000 characters (the stored column's limit), and natal charts/amounts/timestamps must match their published schema.

### Billing and safe retries

Paid reads are charged on delivery: the tool runs first, and only a successful result is settled. A failed search or a partial snapshot (an error) is never charged, a caller that cancels before settlement is not charged, and a refused settlement withholds the result (`QUOTA`, or `UNAVAILABLE` when billing cannot be reached). A reflection's debit and its `recipe_reflections` row commit in one transaction, so a caller is never charged for a reflection that was not stored. Feed publication runs inside the same transaction behind a savepoint: if it fails, the reflection and its charge stand and the receipt reports `published: false`.

Without an idempotency key every call charges again and every reflection call stores another reflection. Pass `_meta.idempotencyKey` (1–200 characters from `A-Z a-z 0-9 . _ : ~ -`) to make a paid call safe to retry:

- A retry with identical arguments within 24 hours is not charged again (`billing.status: "replayed"`). A recipe search or snapshot is recomputed, so a replayed snapshot carries a new `snapshotId` and observation time; a reflection retry returns the stored reflection (`replayed: true`) and re-attempts a feed publication that previously failed, unless the reflection has since been moderated (hidden, deleted or rejected).
- Reusing a key with different arguments, or after 24 hours, returns `CONFLICT`. Credentials and correlation fields in `_meta` are not part of the comparison.
- Keys are scoped to the paying account and tool, and concurrent retries of one key wait for the first attempt and then replay it. The ESMS ledger stores the key only as a hash; invocation telemetry keeps the raw key with the call's other arguments for its seven-day retention.

Once a paid call reaches settlement, its result reports what happened in a `billing` field (errors before that point, such as invalid arguments, authentication failures or `BUSY`, carry none): `status` (`charged`, `replayed` or `not_charged`, with a `reason` such as `anonymous-caller`, `synthetic-probe-exempt` or `not-delivered`), the `amounts` debited by this call, and the echoed `idempotencyKey`.

### Results

Results include both `structuredContent` and the same JSON serialized in a text content block, with a `correlationId`. Every tool publishes an `outputSchema` that accepts its success payload or the shared error envelope, so clients that validate structured results (the TypeScript and Python SDK clients do) accept both. Failed evidence snapshots retain available data and component provenance under the error payload's `data` field. Tool failures set `isError: true` with a stable `errorCode` and `message`; `RATE_LIMIT` and `BUSY` include `retryAfterSec`. Diagnostic output goes to stderr; stdout contains JSON-RPC messages only. SIGINT, SIGTERM and stdin closure perform a bounded one-second telemetry drain before exit.

## Configuration

```bash
ALCHM_MCP_BACKEND_URL=https://alchm.kitchen
MCP_USER_API_KEY=sk_alchm_...
# ALCHM_MCP_USER_API_KEY is also accepted for sanitized Planetary Agents environments.
DATABASE_URL=postgresql://...  # operator-only: key validation, billing, cache and telemetry
```

Chart/transit requests POST to `<base>/api/astrologize`. Explicit `ALCHM_MCP_BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`, `SITE_URL` or Vercel URL settings take precedence. Bundled/compiled artifacts default to `https://alchm.kitchen`; source runs default to `http://localhost:3000`. Source development therefore needs the local app running or an explicit reachable backend URL.

Mint and revoke API keys at [`/profile/api-keys`](https://alchm.kitchen/profile/api-keys). Keys are stored as SHA-256 hashes; plaintext is shown once when created.

Every tool accepts `_meta` inside its arguments:

```json
{
  "name": "generate_cosmic_recipe",
  "arguments": {
    "prompt": "spicy",
    "cuisine": "thai",
    "_meta": {
      "apiKey": "sk_alchm_live_REPLACE_ME",
      "caller": "claude-desktop",
      "correlationId": "dinner-plan-123",
      "idempotencyKey": "dinner-plan-123-search"
    }
  }
}
```

The environment key supplies a default for single-user installs. Legacy `_meta.authKey`, `_authKey` and `_apiKey` argument aliases remain supported. Synthetic probes supply `_meta.internalSecret` matching the server's `INTERNAL_API_SECRET`; `SYNTHETIC_PROBE_USER_ID` is optional attribution. Setting the server secret alone never authenticates an external call as a probe. Synthetic calls cannot publish reflections.

## Connect Claude Desktop or Cursor

Use the same `mcpServers` configuration shape in Claude Desktop's `claude_desktop_config.json` or Cursor's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "npx",
      "args": ["-y", "@alchm/mcp-server"],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_REPLACE_ME"
      }
    }
  }
}
```

For a local source checkout use `"command": "bun"` and `"args": ["run", "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"]`. Database configuration belongs to the operator running the server. See the source-run templates in [`claude-desktop.config.example.json`](./claude-desktop.config.example.json) and [`cursor.mcp.example.json`](./cursor.mcp.example.json).

## Verification and operations

```bash
bun run --cwd mcp-server typecheck
bun run jest src/lib/mcp/__tests__/ --runInBand
bun run --cwd mcp-server test:stdio
MCP_E2E=1 MCP_E2E_ENTRY=mcp-server/dist/index.js bun test mcp-server/src/__tests__/
MCP_E2E=1 MCP_E2E_ENTRY=mcp-server/bin/alchm-mcp bun test mcp-server/src/__tests__/
```

The stdio tests spawn real source/bundle/binary processes, initialize a session, send `notifications/initialized`, inspect all eight tools, call local tools, and exercise validation and errors. They reject any non-JSON-RPC stdout line and do not require a live database or production backend. `sdkClient.test.ts` repeats the calls through the official SDK client, which validates every result, errors included, against the advertised `outputSchema`.

Settlement has a real-PostgreSQL proof: `src/lib/mcp/__tests__/settlement.postgres.test.ts` runs the ledger, idempotent replay, concurrent retries and the reflection transaction (including recovery from a failed feed insert) against a disposable database holding every migration. Its header lists the setup; it is skipped unless `MCP_TEST_DATABASE_URL` names a loopback `mcp_test*` database.

Database-backed invocations feed `mcp_invocations`, the admin MCP status surface, agent telemetry and the synthetic MCP probe. Telemetry is best effort; calls still work when logging is unavailable. Retention is seven days via the observability prune job. Per-key rate limits and a four-call process concurrency cap bound workload; calls receive a cancellation signal after 20 seconds and receive MCP cancellation signals. A timeout does not guarantee that already-started downstream side effects have rolled back.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for ownership and data flow.
