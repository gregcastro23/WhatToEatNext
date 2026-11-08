/**
 * /docs/mcp — public MCP onboarding doc.
 *
 * Mirrors `mcp-server/README.md` but framed for end users: what the
 * server does, what tools cost, how to mint a key, and copy-paste
 * configs for Claude Desktop + Cursor.
 *
 * @file src/app/docs/mcp/page.tsx
 */

import Link from "next/link";
import { MultiAgentSnippetsSection } from "./MultiAgentSnippetsSection";
import type { JSX } from "react";

export const metadata = {
  title: "MCP Server",
  description:
    "Connect Claude Desktop, Cursor, or any MCP client to alchm.kitchen's three alchemical tools.",
};

const claudeDesktopConfig = `{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "npx",
      "args": ["-y", "@alchm/mcp-server"],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_…"
      }
    }
  }
}`;

const cursorConfig = `{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "npx",
      "args": ["-y", "@alchm/mcp-server"],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_…"
      }
    }
  }
}`;

const rawCurlExample = `curl -X POST https://alchm.kitchen/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -H "Authorization: Bearer sk_alchm_live_…" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_user_allowance",
      "arguments": {}
    }
  }'`;

interface ToolRow {
  name: string;
  cost: string;
  blurb: string;
}

const TOOLS: ToolRow[] = [
  {
    name: "get_live_sky_transits",
    cost: "Free",
    blurb:
      "Current planetary positions and elemental balance for any coordinate.",
  },
  {
    name: "alchemize_ingredients",
    cost: "Free",
    blurb:
      "Spirit / Essence / Matter / Substance scores and thermodynamic indices for a list of ingredients.",
  },
  {
    name: "generate_cosmic_recipe",
    cost: "2.5 of each ESMS (10 total)",
    blurb:
      "Search the 579-recipe catalog by element, cuisine, and dietary needs.",
  },
  {
    name: "compute_synastry_overlay",
    cost: "Free",
    blurb:
      "Inter-chart aspects, tension, harmony, and recommended stance.",
  },
  {
    name: "get_transit_natal_overlay",
    cost: "Free",
    blurb:
      "Sky-to-natal planetary aspects and continuous per-element boosts for an agent.",
  },
  {
    name: "compute_triplicate_synastry",
    cost: "Free",
    blurb:
      "Evaluate natal charts against the sky for resonance quotes and fee rebates.",
  },
  {
    name: "create_evidence_snapshot",
    cost: "2.5 of each ESMS (10 total)",
    blurb:
      "Bundle transits, ingredient analysis, and recipe candidates in one atomic call.",
  },
  {
    name: "submit_recipe_reflection",
    cost: "0.1 of each ESMS (0.4 total)",
    blurb:
      "Save a culinary reflection and mirror to feed & community tips.",
  },
  {
    name: "get_user_allowance",
    cost: "Free",
    blurb:
      "Pre-flight check for calling agents to inspect ESMS balance and tool cost schedule.",
  },
  {
    name: "substitute_ingredient",
    cost: "Free",
    blurb:
      "Dish-context-aware culinary ingredient swaps with exact ratios, flavor/texture impacts, and elemental shifts.",
  },
  {
    name: "build_consolidated_grocery_list",
    cost: "Free",
    blurb:
      "Aisle-grouped consolidated shopping list across multiple recipes with serving multipliers and pantry subtraction.",
  },
  {
    name: "what_to_cook_now",
    cost: "2.5 of each ESMS (10 total)",
    blurb:
      "Single-call composite meal recommender matching pantry ingredients, active prep times, mood/craving, and celestial weather.",
  },
  {
    name: "update_culinary_profile",
    cost: "Free",
    blurb:
      "Safely patch persistent culinary memory (allergens, dislikes, dietary frameworks, spice tolerance, kitchen equipment).",
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        className="t-display"
        style={{
          fontSize: 22,
          marginTop: 0,
          marginBottom: 12,
          color: "var(--fg)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "var(--fg-mute)",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }): JSX.Element {
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
      <code>{children}</code>
    </pre>
  );
}

export default function McpDocsPage(): JSX.Element {
  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "48px 24px 80px",
        color: "var(--fg)",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <div
          className="t-tag"
          style={{ color: "var(--fg-mute)", marginBottom: 6 }}
        >
          ← DOCS / MCP SERVER
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 40, margin: 0, marginBottom: 10 }}
        >
          Alchm.kitchen MCP server
        </h1>
        <p
          style={{
            color: "var(--fg-mute)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          A{" "}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent, #c69cff)" }}
          >
            Model Context Protocol
          </a>{" "}
          server exposing thirteen alchemical tools — live planetary transits,
          ingredient ESMS analysis, cosmic recipe discovery, dish-context substitutions,
          multi-recipe grocery consolidation, single-call meal recommendations,
          and safe culinary profile management — to Meta Muse, Claude
          Desktop, Cursor, Google Antigravity, the Claude Agent SDK, or any
          other MCP client.
        </p>
      </header>

      <div
        style={{
          border: "1px solid var(--accent, #c69cff)",
          background: "rgba(198, 156, 255, 0.06)",
          padding: "16px 20px",
          borderRadius: 8,
          marginBottom: 36,
        }}
      >
        <div
          className="t-display"
          style={{ fontSize: 16, marginBottom: 6 }}
        >
          Mint an API key to get started
        </div>
        <p
          style={{
            color: "var(--fg-mute)",
            fontSize: 13,
            margin: "0 0 12px",
            lineHeight: 1.5,
          }}
        >
          Anonymous calls work for free tools but the cosmic recipe tool
          requires a key bound to a paid ESMS balance. Keys are scoped,
          revocable, and shown exactly once at mint time.
        </p>
        <Link
          href="/profile/api-keys"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--accent, #c69cff)",
            color: "var(--bg, #0a0a0a)",
            padding: "10px 16px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Mint your key →
        </Link>
      </div>

      <Section title="Tools">
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr",
          }}
        >
          {TOOLS.map((t) => (
            <div
              key={t.name}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "12px 14px",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <div
                  className="t-mono"
                  style={{ fontSize: 13, color: "var(--fg)" }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--fg-mute)",
                    marginTop: 4,
                  }}
                >
                  {t.blurb}
                </div>
              </div>
              <div
                className="t-mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-mute)",
                  whiteSpace: "nowrap",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                {t.cost}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Connect Gemini, Claude, OpenAI, Meta Muse & Remote Agents">
        <MultiAgentSnippetsSection />
        <h3
          className="t-display"
          style={{ fontSize: 16, marginTop: 20, marginBottom: 8, color: "var(--fg)" }}
        >
          Raw HTTP Callers &amp; Content Negotiation
        </h3>
        <p>
          Per the official MCP 2026-07-28 Streamable HTTP specification, POST requests MUST specify both MIME types in the <code>Accept</code> header:
        </p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 12px", lineHeight: 1.6 }}>
          <li><code>Content-Type: application/json</code></li>
          <li><code>Accept: application/json, text/event-stream</code></li>
        </ul>
        <p style={{ marginBottom: 8 }}>
          Omitting <code>text/event-stream</code> from the <code>Accept</code> header will cause strict MCP SDK transports to reject the call with <code>406 Not Acceptable</code>. Example raw curl invocation:
        </p>
        <CodeBlock>{rawCurlExample}</CodeBlock>

        <p style={{ marginTop: 16 }}>
          Modern agents can also auto-discover our capabilities and security metadata at standard endpoints:
        </p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0", lineHeight: 1.7 }}>
          <li>
            <strong>OpenAPI 3.1.0 REST Spec (Custom GPTs &amp; Vertex AI):</strong>{" "}
            <code>/api/mcp/openapi.json</code>
          </li>
          <li>
            <strong>OAuth 2.0 Protected Resource Metadata (RFC 9728):</strong>{" "}
            <code>/.well-known/oauth-protected-resource</code>
          </li>
          <li>
            <strong>OAuth 2.0 Authorization Server (RFC 8414):</strong>{" "}
            <code>/.well-known/oauth-authorization-server</code>
          </li>
          <li>
            <strong>Meta Muse Connector Descriptor:</strong>{" "}
            <code>/.well-known/muse/connector.json</code>
          </li>
        </ul>
      </Section>

      <Section title="Prompts, Resources & Parameterized Templates">
        <p>
          In addition to tools, our MCP server exposes structured <strong>Prompts</strong> (actionable blueprints for meal planning and alchemical analysis), 
          static <strong>Resources</strong>, persistent account memory, and zero-token <strong>RFC 6570 Resource Templates</strong>:
        </p>
        <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg)", margin: "16px 0 8px" }}>
          Prompt Blueprints (prompts/list &amp; prompts/get)
        </h4>
        <ul style={{ paddingLeft: 20, margin: "8px 0 16px", lineHeight: 1.7 }}>
          <li><code>cosmic_meal_planning</code>: End-to-end prompt guiding agents from celestial weather to recipe discovery and grocery lists.</li>
          <li><code>fast_pantry_dinner</code>: Rapid single-call workflow pairing pantry ingredients and time limits with <code>what_to_cook_now</code>.</li>
          <li><code>pantry_alchemical_balance</code>: Prompt guiding agents through ESMS analysis, substitutions, and flavor balancing.</li>
          <li><code>historical_culinary_council</code>: Prompt to consult canonical personas like Leonardo da Vinci or Hildegard von Bingen.</li>
        </ul>
        <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg)", margin: "16px 0 8px" }}>
          Resources &amp; RFC 6570 URI Templates (resources/list &amp; resources/read)
        </h4>
        <ul style={{ paddingLeft: 20, margin: "8px 0", lineHeight: 1.7 }}>
          <li><code>alchm://ingredients/&#123;slug&#125;</code>: Deep nutritional metrics, elemental properties, seasonality, and pairings for 1,002 ingredients.</li>
          <li><code>alchm://recipes/&#123;id&#125;</code>: Full structured JSON-LD recipe payloads with metric/US volume scaling, timers, and beverage pairings.</li>
          <li><code>alchm://techniques/&#123;slug&#125;</code>: Culinary technique guide cards (sear, braise, ferment, confit, reduce, clarify).</li>
          <li><code>alchm://account/culinary-profile</code>: Authenticated caller hard allergens, dietary frameworks, spice tolerance, and kitchen equipment.</li>
          <li><code>alchm://account/allowance</code>: Live ESMS balance, rate limits, and tool cost schedule for the calling account.</li>
          <li><code>alchm://catalog/cuisines</code> &amp; <code>alchm://catalog/diets</code>: Reference lists of supported tags.</li>
          <li><code>alchm://ontology/esms</code>: Spirit, Essence, Matter, Substance philosophical and thermodynamic framework.</li>
        </ul>
      </Section>

      <Section title="Connecting Claude Desktop (Local stdio)">
        <p>
          Edit{" "}
          <code>
            ~/Library/Application Support/Claude/claude_desktop_config.json
          </code>{" "}
          (macOS) or the equivalent on your platform, and add:
        </p>
        <CodeBlock>{claudeDesktopConfig}</CodeBlock>
        <p style={{ marginTop: 12 }}>
          Replace <code>sk_alchm_live_…</code> with the key you minted above.
          Restart Claude Desktop after editing.
        </p>
      </Section>

      <Section title="Connecting Cursor (Local stdio)">
        <p>
          Add to <code>~/.cursor/mcp.json</code> or the project-local{" "}
          <code>.cursor/mcp.json</code>:
        </p>
        <CodeBlock>{cursorConfig}</CodeBlock>
      </Section>

      <Section title="Per-call auth">
        <p>
          Every tool accepts an optional <code>_meta</code> field on its
          arguments:
        </p>
        <CodeBlock>{`{
  "name": "generate_cosmic_recipe",
  "arguments": {
    "prompt": "spicy",
    "cuisine": "thai",
    "_meta": {
      "apiKey": "sk_alchm_live_…",
      "caller": "claude-desktop"
    }
  }
}`}</CodeBlock>
        <p style={{ marginTop: 12 }}>
          <code>_meta.apiKey</code> resolves to a row in your account,
          which is debited for any tool with an ESMS cost.{" "}
          <code>_meta.caller</code> is a free-form identifier (e.g.{" "}
          <code>&quot;claude-desktop&quot;</code>,{" "}
          <code>&quot;cursor&quot;</code>) that appears on the invocation
          row for observability.
        </p>
        <p>
          If <code>MCP_USER_API_KEY</code> is set in the server&apos;s
          environment, it is used as the default for every call —
          convenient for single-user installs.
        </p>
      </Section>

      <Section title="Quotas, telemetry, revocation">
        <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
          <li>
            Every successful or failed tool call writes a row to{" "}
            <code>mcp_invocations</code>.
          </li>
          <li>
            Insufficient ESMS balance returns a structured{" "}
            <code>QUOTA</code> error. Refill at{" "}
            <Link
              href="/account/billing/mcp"
              style={{ color: "var(--accent, #c69cff)" }}
            >
              /account/billing/mcp
            </Link>{" "}
            — one-shot bundles in $5 / $20 / $50 tiers.
          </li>
          <li>
            Keys can be revoked at any time from{" "}
            <Link
              href="/profile/api-keys"
              style={{ color: "var(--accent, #c69cff)" }}
            >
              /profile/api-keys
            </Link>{" "}
            — the next call from a revoked key returns 401.
          </li>
        </ul>
      </Section>
    </div>
  );
}
