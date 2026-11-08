# Alchm.kitchen MCP Server

[![Listed on MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.gregcastro23%2Falchm--kitchen-blueviolet)](https://registry.modelcontextprotocol.io/servers/io.github.gregcastro23/alchm-kitchen)
[![npm](https://img.shields.io/npm/v/@alchm/mcp-server)](https://www.npmjs.com/package/@alchm/mcp-server)

Version **1.5.0** exposes thirteen tools over **stdio** and hosted **Streamable HTTP** (`https://alchm.kitchen/api/mcp`), along with the full MCP triad (tools, prompts, resources, and RFC 6570 resource templates). It includes live planetary transits, curated ingredient analysis, cosmic recipe search, synastry overlays, triplicate pricing, evidence snapshots, recipe reflections, pre-flight allowances, dish-context substitutions, multi-recipe grocery consolidation, single-call pantry meal recommendations (`what_to_cook_now`), and safe culinary profile management. It uses the maintained MCP TypeScript SDK v1 line and supports standard MCP initialization handshakes.

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

Anonymous callers can use read tools in demo mode. Recipe search and evidence snapshots debit authenticated callers; reflection publication requires authentication. Invalid supplied credentials are rejected. Where the key is checked depends on how the process starts: with `DATABASE_URL` (operator mode) it validates keys and applies billing itself; with an API key and no `DATABASE_URL` (the usual install) it forwards each call to the hosted endpoint, `https://alchm.kitchen/api/mcp`, which validates the key and applies billing, so the key is sent there over https as `Authorization: Bearer`; with neither it runs everything locally in demo mode. `ALCHM_MCP_MODE` overrides that choice: `remote` always forwards to the hosted endpoint (it needs a key, and ignores `DATABASE_URL`), `local` always runs in-process, and `auto` (the default, also when it is unset or empty) is the rule above. Any other value stops the process at startup.

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
MCP_USER_API_KEY=sk_alchm_...  # with no DATABASE_URL: calls are forwarded to the hosted endpoint, which checks the key and bills
# ALCHM_MCP_USER_API_KEY is also accepted for sanitized Planetary Agents environments.
ALCHM_MCP_REMOTE_URL=https://alchm.kitchen/api/mcp  # optional: where a key-only install forwards (https; http only for localhost)
ALCHM_MCP_MODE=auto  # optional: auto (default), remote (always the hosted service, even if DATABASE_URL is set) or local (always in-process)
DATABASE_URL=postgresql://...  # operator-only: runs the tools in-process, so keys are checked and billed locally; leave it unset otherwise
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

With only a key, as above, this package is a thin client of the hosted service: each request goes to `https://alchm.kitchen/api/mcp` and a key the service does not recognise is reported there, with where to mint a new one. Leave the key out and the tools run on your machine in demo mode (live sky data still comes from alchm.kitchen). If the key has a stray space or quote the process refuses to start and says so on stderr.

Troubleshooting a key-only install:

- **Every tool says the authentication service or database is unreachable, and stderr says `An API key and DATABASE_URL are both set`.** Many clients pass on the environment of the shell that started them, and `DATABASE_URL` is a common name, so the process took the operator path. Set `"ALCHM_MCP_MODE": "remote"` in this server's `env` block to use the hosted service whatever `DATABASE_URL` says (setting `"DATABASE_URL": ""` has the same effect).
- **`the server answered with a redirect`.** The bridge never follows a redirect, because the key would go wherever it points. Put the final URL in `ALCHM_MCP_REMOTE_URL` (check a trailing slash, `http` against `https`, `www`).
- **Behind an HTTP proxy.** Node's `fetch` ignores `HTTP_PROXY` and `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1` is set (Node 22.21 or 24 and later); older Node cannot use one. Where a proxy is honoured (Bun, or Node with that variable), a plain `http://localhost` URL would send the key through it in clear text, so add the host to `NO_PROXY`; the process warns on stderr when it sees this.
- **`ALCHM_MCP_REMOTE_URL` is where your key is sent.** Set it only to a host you trust. A project-scoped MCP configuration in a repository you cloned can set it too, so read those before approving them.
- **Limits.** A request over 256 KB is refused locally, a call gets 65 s, and at most 64 requests are on the wire at once. Nothing is retried automatically, because a retried paid call is charged again; send `_meta.idempotencyKey` (see Billing and safe retries) to retry safely. `notifications/cancelled` is forwarded but does not cancel the request in flight.

For a local source checkout use `"command": "bun"` and `"args": ["run", "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"]`. Database configuration belongs to the operator running the server, and setting `DATABASE_URL` switches the process back to running the tools in-process unless `ALCHM_MCP_MODE=remote` says otherwise. See the source-run templates in [`claude-desktop.config.example.json`](./claude-desktop.config.example.json) and [`cursor.mcp.example.json`](./cursor.mcp.example.json).

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
