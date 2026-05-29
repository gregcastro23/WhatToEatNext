# MCP Server Registry submission — alchm.kitchen

Submission prep for [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).
This file is the canonical local copy of what we plan to submit upstream
— operator can lift content verbatim into the GitHub PR.

**Submission status:** ⏸ not yet submitted. File the PR once Item 6's
load test passes and the blog post is live.

---

## Step 1 — Decide which list we're submitting to

The MCP servers repo has three lists in `README.md`:

| List | Criteria | Our fit |
| --- | --- | --- |
| 🔌 **Reference servers** | Anthropic-maintained examples. | ❌ Not us. |
| 🌎 **Third-party servers** | Anyone, official or community. | ✅ This is the slot. |
| 🚀 **Community servers** | Unofficial / experimental. | ⏸ Fallback if third-party reviewers push back. |

We target the **third-party servers** list. The README sorts that list
alphabetically by company/project name — we land under `A` (alchm).

---

## Step 2 — Entry to add

Append to the third-party servers section of
`README.md` (alphabetical insertion under `A`):

```markdown
- **[alchm.kitchen](https://alchm.kitchen)** — Live planetary transits,
  ingredient ESMS analysis, cosmic recipe search, synastry overlays,
  and transit×natal overlays. Powers alchemy-aware food + ritual
  recommendations.
  [Source](https://github.com/gregcastro23/WhatToEatNext/tree/master/mcp-server)
  · [Docs](https://alchm.kitchen/docs/mcp)
```

---

## Step 3 — PR template

```markdown
## Add alchm.kitchen MCP server

Adds the alchm.kitchen MCP server (5 tools) to the third-party servers
list.

### Tools exposed

| Tool | Function |
| --- | --- |
| `get_live_sky_transits` | Current planetary positions + elemental balance for any coordinate. |
| `alchemize_ingredients` | Spirit / Essence / Matter / Substance scores + thermodynamic indices for an ingredient list. |
| `generate_cosmic_recipe` | Search the 579-recipe catalog by element, cuisine, or dietary need. |
| `compute_synastry_overlay` | Inter-aspect ledger between two natal charts (tension / harmony / intensification). |
| `get_transit_natal_overlay` | Live sky × one agent's natal chart, with continuous boost magnitude per planet. |

### Where it lives

- **Source:** https://github.com/gregcastro23/WhatToEatNext/tree/master/mcp-server
- **Docs:** https://alchm.kitchen/docs/mcp
- **Connector config examples (Claude Desktop, Cursor, Cline):** in the
  source `README.md`.

### Auth model

Public users mint per-key API keys at `/profile/api-keys`. Keys are
sha256-hashed at rest. Tool-call telemetry is attributed via
`_meta.apiKey` on the JSON-RPC argument envelope. Anonymous calls are
allowed but receive degraded responses for paid tools.

### Operational health

- Synthetic-probe heartbeat every 30 min (`mcp_invocations` table)
- Per-tool latency + error rate visible on
  `https://alchm.kitchen/admin` (operator-only)
- Public status checks via the standard `tools/list` handshake.

### Checklist

- [x] Source link works and points at the actual server entrypoint.
- [x] Docs link works and resolves to a public connector guide.
- [x] Tools listed are the actual `tools/list` output (verified
      `MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts`).
- [x] No credentials required to install — users mint their own.
- [x] License: MIT (matches the repo).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Step 4 — Verification before filing

1. `MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts` — the
   five tool names returned by `tools/list` must match the table above
   exactly.
2. `curl -I https://alchm.kitchen/docs/mcp` returns 200.
3. `curl -I https://github.com/gregcastro23/WhatToEatNext/tree/master/mcp-server`
   returns 200.
4. Blog post `content/blog/announcing-alchm-mcp.md` has been published
   to a public URL (or has a no-link variant ready — reviewers
   sometimes ask for a hosted overview).

---

## Step 5 — Filing the PR

```bash
gh repo fork modelcontextprotocol/servers --clone --remote
cd servers
git checkout -b add-alchm-kitchen
# edit README.md per Step 2 above
git add README.md
git commit -m "Add alchm.kitchen MCP server to third-party servers"
git push -u origin add-alchm-kitchen
gh pr create --repo modelcontextprotocol/servers \
  --title "Add alchm.kitchen MCP server" \
  --body-file <path-to-rendered-step-3>
```

---

## Step 6 — After merge

- Add a "Listed on the MCP server registry" line to
  `mcp-server/README.md`.
- Record the merged registry PR link in this file's **Submission status**
  header, and flip it to ✅.

---

_Drafted 2026-05-27. Re-verify all URLs the morning of submission — the
registry reviewers will reject any PR with a broken link._
