/**
 * @file src/app/docs/mcp/MultiAgentSnippetsSection.tsx
 *
 * Copy-pasteable connection snippets for Google Gemini / ADK, Anthropic
 * Messages API & Claude Desktop, OpenAI Responses API & Custom GPT Actions,
 * and Meta Muse.
 */

import type { JSX, ReactNode } from "react";

const geminiCliConfig = `{
  "mcpServers": {
    "alchm-kitchen": {
      "httpUrl": "https://alchm.kitchen/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_alchm_live_…"
      }
    },
    "planetary-agents": {
      "httpUrl": "https://agents.alchm.kitchen/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_alchm_live_…"
      }
    }
  }
}`;

const geminiAdkPythonSnippet = `from google import genai
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

# 8 read-only tools work with zero API key; pass Authorization for paid tools
headers = {"Authorization": "Bearer sk_alchm_live_..."}
async with streamablehttp_client("https://alchm.kitchen/api/mcp", headers=headers) as (r, w, _):
    async with ClientSession(r, w) as session:
        await session.initialize()
        client = genai.Client()
        res = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents="Check live sky transits and suggest an alchemical substitute for heavy cream.",
            config=genai.types.GenerateContentConfig(tools=[session]),
        )
        print(res.text)`;

const anthropicMessagesSnippet = `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "anthropic-beta: mcp-client-2025-04-04" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "mcp_servers": [
      {
        "type": "url",
        "url": "https://alchm.kitchen/api/mcp",
        "name": "alchm-kitchen",
        "authorization_token": "sk_alchm_live_..."
      },
      {
        "type": "url",
        "url": "https://agents.alchm.kitchen/api/mcp",
        "name": "planetary-agents",
        "authorization_token": "sk_alchm_live_..."
      }
    ],
    "messages": [{"role": "user", "content": "Alchemize garlic, lemon, and olive oil under current transits."}]
  }'`;

const openaiResponsesSnippet = `import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-4.1",
  tools: [
    {
      type: "mcp",
      server_label: "alchm_kitchen",
      server_url: "https://alchm.kitchen/api/mcp",
      headers: { Authorization: "Bearer sk_alchm_live_..." },
      require_approval: "never",
    },
    {
      type: "mcp",
      server_label: "planetary_agents",
      server_url: "https://agents.alchm.kitchen/api/mcp",
      require_approval: "never",
    },
  ],
  input: "Match my dinner to today's planetary transits and a historical mentor.",
});`;

const museSettingsSnippet = `{
  "mcp_servers": {
    "alchm-kitchen": {
      "url": "https://alchm.kitchen/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_alchm_live_…"
      }
    },
    "planetary-agents": {
      "url": "https://agents.alchm.kitchen/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_alchm_live_…"
      }
    }
  }
}`;

function SnippetBox({ code }: { code: string }): JSX.Element {
  return (
    <pre
      style={{
        background: "var(--bg-elev, rgba(255,255,255,0.04))",
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "12px 14px",
        fontFamily: "var(--f-mono, monospace)",
        fontSize: 12,
        lineHeight: 1.5,
        overflowX: "auto",
        color: "var(--fg)",
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

function SubHeading({ children }: { children: ReactNode }): JSX.Element {
  return (
    <h3
      className="t-display"
      style={{
        fontSize: 16,
        marginTop: 22,
        marginBottom: 8,
        color: "var(--fg)",
      }}
    >
      {children}
    </h3>
  );
}

function TierOverviewBlock(): JSX.Element {
  return (
    <>
      <p>
        Both <code>https://alchm.kitchen/api/mcp</code> (Culinary &amp; ESMS
        Nutrition) and <code>https://agents.alchm.kitchen/api/mcp</code>{" "}
        (72 Historical Mentors, Natal-Sky Bi-Wheel &amp; PVR 25–99 OVR) support
        standard <strong>Streamable HTTP</strong> and an{" "}
        <strong>OpenAPI 3.1.0 REST Bridge</strong>:
      </p>
      <ul style={{ paddingLeft: 20, margin: "8px 0 16px", lineHeight: 1.65 }}>
        <li>
          <strong>Free Tier (0 ESMS, no API key required):</strong> All 8{" "}
          <code>readOnlyHint: true</code> tools (
          <code>get_live_sky_transits</code>, <code>alchemize_ingredients</code>
          , <code>substitute_ingredient</code>,{" "}
          <code>build_consolidated_grocery_list</code>,{" "}
          <code>get_user_allowance</code>,{" "}
          <code>compute_synastry_overlay</code>,{" "}
          <code>get_transit_natal_overlay</code>,{" "}
          <code>compute_triplicate_synastry</code>), plus all static resources,
          RFC 6570 resource templates, and prompts.
        </li>
        <li>
          <strong>
            Authenticated / Metered ESMS Tier (
            <code>Authorization: Bearer sk_alchm_...</code>):
          </strong>{" "}
          Required for full recipe search &amp; composite recommendations (
          <code>what_to_cook_now</code> — 10 ESMS,{" "}
          <code>generate_cosmic_recipe</code> — 10 ESMS,{" "}
          <code>create_evidence_snapshot</code> — 10 ESMS,{" "}
          <code>submit_recipe_reflection</code> — 0.4 ESMS) and persistent
          account memory (<code>update_culinary_profile</code>).
        </li>
      </ul>
    </>
  );
}

export function MultiAgentSnippetsSection(): JSX.Element {
  return (
    <div>
      <TierOverviewBlock />
      <SubHeading>
        1. Google Gemini CLI / Antigravity &amp; Google ADK (google-genai)
      </SubHeading>
      <p>
        Add to <code>~/.gemini/settings.json</code> (Gemini CLI / Antigravity)
        or invoke via Python <code>google-genai</code>:
      </p>
      <SnippetBox code={geminiCliConfig} />
      <div style={{ marginTop: 10 }}>
        <SnippetBox code={geminiAdkPythonSnippet} />
      </div>

      <SubHeading>2. Anthropic Messages API (Remote MCP Connector)</SubHeading>
      <SnippetBox code={anthropicMessagesSnippet} />

      <SubHeading>
        3. OpenAI Responses API &amp; Custom GPT Actions (OpenAPI 3.1.0 Bridge)
      </SubHeading>
      <SnippetBox code={openaiResponsesSnippet} />
      <p style={{ marginTop: 10 }}>
        For <strong>OpenAI Custom GPT Actions</strong> or{" "}
        <strong>Google Vertex AI Extensions</strong>, import our OpenAPI 3.1.0
        schema URLs (<code>https://alchm.kitchen/api/mcp/openapi.json</code> and{" "}
        <code>https://agents.alchm.kitchen/api/mcp/openapi.json</code>), which
        execute via <code>POST /api/mcp/rest/[toolName]</code>.
      </p>

      <SubHeading>4. Meta Muse (~/.config/muse/settings.json)</SubHeading>
      <SnippetBox code={museSettingsSnippet} />
    </div>
  );
}
