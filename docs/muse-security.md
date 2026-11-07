# Meta Muse Security Architecture & Threat Model

This document specifies the security controls, threat mitigations, and configuration guardrails for users and autonomous agents connecting to the **Alchm Kitchen Model Context Protocol (MCP) Streamable HTTP Gateway** (`https://alchm.kitchen/api/mcp`) via **Meta Muse** (`platform.muse.ai`).

---

## 1. Threat Model & Risk Mitigation Matrix

| Security Risk | Threat Vector | Alchm Mitigation Control | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **Host Header Poisoning** | Attacker poisons discovery cache on `/.well-known/muse/connector.json` with arbitrary `Host` or `X-Forwarded-Host`, tricking Muse clients into leaking Bearer tokens to an attacker endpoint. | **Strict Host Whitelist**: All host candidates are validated against trusted domains (`alchm.kitchen`, `www.alchm.kitchen`, `whattoeatnext.com`, `agents.alchm.kitchen`). Untrusted hosts fall back strictly to `https://alchm.kitchen`. | `src/lib/mcp/httpSecurity.ts` (`getTrustedOrigin`) & `Vary: Host, Origin` |
| **CORS & Origin Spoofing** | Malicious third-party websites attempt cross-origin `fetch()` requests against `/api/mcp` to hijack user session tokens or trigger state changes. | **Origin Isolation**: CORS headers only reflect approved domains (`*.muse.ai`, `*.meta.ai`, `*.alchm.kitchen`, `*.whattoeatnext.com`). Untrusted origins are rejected with `403 Forbidden` on preflight OPTIONS and receive non-permissive headers on POST. | `src/lib/mcp/httpSecurity.ts` (`isTrustedOrigin`, `buildCorsHeaders`) |
| **Prompt Injection / Allergen Stripping** | Malicious external prompts manipulate the autonomous Muse agent into calling `update_culinary_profile` to delete life-saving allergens (e.g. `removeAllergens: ["peanuts"]`). | **Caller Authentication & Allergen Audit**: Profile mutations require an authenticated user (`caller.userId`). Any removal of active allergens generates a critical `securityAudit` warning alerting the caller and human user immediately. | `src/lib/mcp/culinaryProfileSecurity.ts` (`auditAllergenRemoval`) |
| **Unbounded Payload Bloat** | Runaway agent loops send massive arrays or multi-megabyte payloads in tool calls to cause database DoS. | **Payload Cap & String Sanitization**: Request bodies are capped at 256 KB (`413 Payload Too Large`). All profile input strings are normalized, trimmed, stripped of HTML/control characters, and arrays are clamped to safe maximums (max 30 items, 64 chars). | `src/app/api/mcp/route.ts` & `src/lib/mcp/culinaryProfileSecurity.ts` |
| **Credential & Key Leakage** | `sk_alchm_...` API keys or Bearer headers leak into serverless runtime logs (Vercel/CloudWatch) or tool error responses. | **Automated Secret Redaction**: All error envelopes and runtime stderr logs filter `sk_alchm_*`, Bearer tokens, and credential key-values before output. | `src/lib/mcp/httpSecurity.ts` (`redactSensitiveString`) & `src/lib/mcp/invocationLog.ts` |
| **Replay & Double-Debit** | Network retries or replayed agent tool calls for paid tools (`submit_recipe_reflection`, `create_evidence_snapshot`) double-charge user ESMS balances. | **24-Hour Scoped Idempotency Ledger**: Tool invocations accept `_meta.idempotencyKey` or `Idempotency-Key` headers, verified against argument fingerprints under advisory locks. Retries replay without re-debiting. | `src/lib/mcp/billing.ts` (`settlePayment`) |
| **Runaway Agent Loops** | Autonomous Muse agents get stuck in recursive tool execution loops, exhausting user rate limits. | **Sliding-Window Rate Limiting**: Per-API-key sliding-window limiters cap requests per minute according to tier (`rpmForTier`). Returns standard `Retry-After` and `X-RateLimit-*` headers exposed via CORS. | `src/lib/mcp/rateLimit.ts` & `src/lib/mcp/tools.ts` |

---

## 2. Meta Muse Configuration

### A. Connector Discovery (`platform.muse.ai`)
Meta Muse automatically discovers the Alchm Kitchen connector via standard discovery:
```
https://alchm.kitchen/.well-known/muse/connector.json
```

### B. User Settings File (`~/.config/muse/settings.json`)
Users running Muse CLI or desktop agents configure Alchm Kitchen as follows:

```json
{
  "mcpServers": {
    "alchm-kitchen": {
      "url": "https://alchm.kitchen/api/mcp",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer sk_alchm_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

> **Security Tip**: Never commit `~/.config/muse/settings.json` to public version control. Mint scoped API keys from [https://alchm.kitchen/profile/api-keys](https://alchm.kitchen/profile/api-keys).

---

## 3. Supported Scopes & Tool Permissions

| Scope | Description | Associated Tools / Resources | Access Tier |
| :--- | :--- | :--- | :--- |
| `mcp:read` | Read planetary ephemeris, cosmic transit weather, and ingredient substitutions | `get_current_sky_transits`, `substitute_ingredient`, `build_consolidated_grocery_list`, `alchm://sky/now` | Free / Unmetered |
| `mcp:recipes` | Search catalog recipes, match pantry ingredients, and Solar Return synergy | `what_to_cook_now`, `search_catalog_recipes`, `alchm://recipes/{id}`, `alchm://solar-return/{year}` | Free / Unmetered |
| `mcp:invoke` | Advanced alchemical meal planning and synastry overlays | `compute_synastry_overlay`, `compute_triplicate_synastry`, `get_transit_natal_overlay` | Free / Metered |
| `mcp:profile` | Manage caller allergen guardrails and kitchen settings | `update_culinary_profile`, `get_user_allowance`, `alchm://account/culinary-profile` | Authenticated Only |
| `mcp:reflections` | Submit culinary reflections and generate immutable evidence snapshots | `submit_recipe_reflection`, `create_evidence_snapshot` | Paid (ESMS Debits) |

---

## 4. Physical Safety: Allergen Guardrails

Culinary applications carry unique real-world safety implications. When an autonomous Muse agent executes `update_culinary_profile`, Alchm Kitchen enforces:

1. **Authentication Requirement**: Anonymous callers cannot modify culinary profiles under any circumstance.
2. **Two-Step Confirmation Guardrail**: Removing allergens requires `confirmAllergenRemoval: true`. If an agent or prompt injection attempts `removeAllergens` without explicit confirmation, the existing allergens remain completely untouched in the database, and a remediation message is returned in `securityAudit` instructing the agent to ask the human user for explicit confirmation first:
   ```json
   {
     "securityAudit": {
       "blocked": true,
       "warning": "Allergen removal blocked: Attempted to remove [peanuts] without confirmation.",
       "criticalNotice": "Physical safety protection: Removing allergens requires explicit confirmation. Set 'confirmAllergenRemoval: true' after obtaining explicit user consent.",
       "removedAllergens": []
     }
   }
   ```
3. **Bypass Transparency**: If `what_to_cook_now` is called with `ignoreSavedProfile: true` by an authenticated caller with saved restrictions, a `securityNotice` is appended to the results to remind the agent and user that allergen safeguards were bypassed.

