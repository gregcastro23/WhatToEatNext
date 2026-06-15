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
import type { JSX } from "react";

export const metadata = {
  title: "MCP Server",
  description:
    "Connect Claude Desktop, Cursor, or any MCP client to alchm.kitchen's three alchemical tools.",
};

const claudeDesktopConfig = `{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"
      ],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_…"
      }
    }
  }
}`;

const cursorConfig = `{
  "mcpServers": {
    "alchm-kitchen": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/WhatToEatNext-master/mcp-server/src/index.ts"
      ],
      "env": {
        "MCP_USER_API_KEY": "sk_alchm_live_…"
      }
    }
  }
}`;

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
    cost: "7.5 of each ESMS (30 total)",
    blurb:
      "Search the 579-recipe catalog by element, cuisine, and dietary needs.",
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
          server exposing three alchemical tools — live planetary transits,
          ingredient ESMS analysis, and cosmic recipe discovery — to Claude
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

      <Section title="Connecting Claude Desktop">
        <p>
          Edit{" "}
          <code>
            ~/Library/Application Support/Claude/claude_desktop_config.json
          </code>{" "}
          (macOS) or the equivalent on your platform, and add:
        </p>
        <CodeBlock>{claudeDesktopConfig}</CodeBlock>
        <p style={{ marginTop: 12 }}>
          Replace <code>/absolute/path/to/WhatToEatNext-master</code> with
          your local checkout path and{" "}
          <code>sk_alchm_live_…</code> with the key you minted above.
          Restart Claude Desktop after editing.
        </p>
      </Section>

      <Section title="Connecting Cursor">
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
