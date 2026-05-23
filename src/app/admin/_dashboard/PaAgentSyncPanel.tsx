"use client";

/**
 * PA Agent Sync Panel — admin control to manually re-sync agents to the
 * planetary_agents backend.
 *
 * Backed by POST /api/admin/agent-sync (validateAdminRequest enforces auth).
 * Two modes:
 *   - "all": pushes every is_agent=true user from the WTEN DB to PA in
 *     batches of 4. Use for first-time backfill or drift repair.
 *   - "one": single user by email. Use for spot fixes after a profile edit.
 *
 * Designed to render inside src/app/admin/_dashboard/agents.tsx alongside the
 * existing AgentFeedControlRoom card.
 */

import React, { useState } from "react";

interface SyncResult {
  agentId: string;
  email: string;
  ok: boolean;
  status?: number;
  error?: string;
}

interface SyncResponse {
  success: boolean;
  synced?: number;
  failed?: number;
  results?: SyncResult[];
  note?: string;
  error?: string;
}

const AGENTIC_DOMAIN = "@agentic.alchm.kitchen";

export function PaAgentSyncPanel() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"all" | "one" | null>(null);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function trigger(body: Record<string, unknown>, mode: "all" | "one") {
    setBusy(mode);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/admin/agent-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await resp.json()) as SyncResponse;
      if (!resp.ok || !data.success) {
        setError(data.error || `HTTP ${resp.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const failures = (result?.results ?? []).filter((r) => !r.ok);

  return (
    <section
      style={{
        marginBottom: 14,
        border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
        borderRadius: 10,
        background: "rgba(0,0,0,0.18)",
        padding: 12,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div>
          <div className="t-tag" style={{ color: "var(--accent)", fontSize: 9 }}>
            PA RE-SYNC · MANUAL
          </div>
          <div className="t-display" style={{ fontSize: 14, marginTop: -2 }}>
            push WTEN is_agent=true users to api.agents.alchm.kitchen
          </div>
        </div>
        <button
          type="button"
          onClick={() => void trigger({ all: true }, "all")}
          disabled={busy !== null}
          style={{
            background:
              busy === "all"
                ? "color-mix(in oklch, var(--accent), transparent 40%)"
                : "var(--accent)",
            border: "none",
            color: "var(--bg)",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: busy ? "wait" : "pointer",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          {busy === "all" ? "SYNCING…" : "SYNC ALL"}
        </button>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="email"
          placeholder={`agent${AGENTIC_DOMAIN}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy !== null}
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid color-mix(in oklch, var(--fg-mute), transparent 60%)",
            color: "var(--fg)",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = email.trim();
            if (!trimmed.endsWith(AGENTIC_DOMAIN)) {
              setError(`email must end in ${AGENTIC_DOMAIN}`);
              return;
            }
            void trigger({ email: trimmed }, "one");
          }}
          disabled={busy !== null || email.trim().length === 0}
          style={{
            background:
              busy === "one"
                ? "color-mix(in oklch, var(--accent-2), transparent 40%)"
                : "var(--accent-2)",
            border: "none",
            color: "var(--bg)",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: busy ? "wait" : "pointer",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          {busy === "one" ? "SYNCING…" : "SYNC ONE"}
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "var(--el-fire)",
            fontSize: 11,
            padding: "6px 10px",
            background: "color-mix(in oklch, var(--el-fire), transparent 88%)",
            borderRadius: 6,
            marginBottom: 6,
          }}
        >
          error: {error}
        </div>
      )}

      {result && (
        <div style={{ fontSize: 11, color: "var(--fg-mute)" }}>
          {result.note ? (
            <span>{result.note}</span>
          ) : (
            <span>
              <strong style={{ color: "var(--el-earth)" }}>
                {result.synced ?? 0} synced
              </strong>
              {" · "}
              <strong
                style={{
                  color: (result.failed ?? 0) > 0 ? "var(--el-fire)" : "var(--fg-mute)",
                }}
              >
                {result.failed ?? 0} failed
              </strong>
            </span>
          )}
          {failures.length > 0 && (
            <details style={{ marginTop: 6 }}>
              <summary style={{ cursor: "pointer", color: "var(--accent)" }}>
                show {failures.length} failure{failures.length === 1 ? "" : "s"}
              </summary>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {failures.slice(0, 10).map((f) => (
                  <li key={f.agentId}>
                    <code>{f.email}</code>: {f.status ?? "—"} {f.error ?? ""}
                  </li>
                ))}
                {failures.length > 10 && (
                  <li>…and {failures.length - 10} more</li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
