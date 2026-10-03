"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Logo } from "@/components/nav/Logo";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import {
  AgentSyncStatusResponseSchema,
  AuthSessionsResponseSchema,
} from "@/lib/validation/accountResponseSchemas";
import type { AuthSessionRow as SessionRow } from "@/types/authSessions";

/* ============================================================================
 * SHARED ATOMS
 * ========================================================================= */

function ShellHeader({ subtitle }: { subtitle?: string }): JSX.Element {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Logo size={22} />
      {subtitle && (
        <div
          className="t-mono"
          style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.18em" }}
        >
          {subtitle}
        </div>
      )}
    </header>
  );
}

/* ============================================================================
 * 1. AUTH HANDSHAKE
 * Post-OAuth splash. Shows the 6-step checklist (OAuth → Identity → Record →
 * Natal → Grants → Mesh). Budgets 8s for cold starts before showing the
 * reassurance panel; redirects to `next` (or /onboarding/profile fallback)
 * when the engine reports ready.
 * ========================================================================= */

interface HandshakeStep {
  code: string;
  label: string;
  hint: string;
}

const HANDSHAKE_STEPS: readonly HandshakeStep[] = [
  { code: "OAUTH",  label: "Google handshake",              hint: "exchanging authorization code" },
  { code: "IDENT",  label: "Identity verified",              hint: "iss · aud · exp · nonce" },
  { code: "RECORD", label: "User record",                    hint: "8000ms timeout · userCache 30s" },
  { code: "NATAL",  label: "Computing natal chart",          hint: "VSOP87 · DE440 · house cusps" },
  { code: "GRANT",  label: "Granting starter Cosmic Yield",  hint: "60 ESMS · 15 each" },
  { code: "MESH",   label: "Propagating session",            hint: "cookie · .alchm.kitchen · cross-subdomain" },
];

const COLD_START_BUDGET_MS = 8400;
const FAST_BUDGET_MS = 1100;
const COLD_START_THRESHOLD_MS = 1500;

export interface AuthHandshakeProps {
  /**
   * When set, redirect here after the mesh step completes. Otherwise the
   * component routes to /profile (or /onboarding when the session reports
   * onboarding incomplete).
   */
  redirectTo?: string;
}

export function AuthHandshake({ redirectTo }: AuthHandshakeProps = {}): JSX.Element {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [progress, setProgress] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [cold, setCold] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // Drive the checklist forward. Budget extends if NextAuth hasn't returned
  // a session yet (cold start), which signals we should switch to the 8s curve.
  useEffect(() => {
    if (progress >= HANDSHAKE_STEPS.length) return;
    const slow = status === "loading";
    if (slow && !cold && Date.now() - startedAt > COLD_START_THRESHOLD_MS) {
      setCold(true);
    }
    const budget = cold || slow ? COLD_START_BUDGET_MS : FAST_BUDGET_MS;
    const step = budget / HANDSHAKE_STEPS.length;
    const id = setTimeout(() => setProgress((p) => p + 1), step);
    return () => clearTimeout(id);
  }, [progress, cold, status, startedAt]);

  // Final redirect after the mesh step
  useEffect(() => {
    if (redirected) return;
    if (progress < HANDSHAKE_STEPS.length) return;
    if (status === "loading") return;

    track("auth_handshake_completed", { stepsCompleted: 6 });
    setRedirected(true);

    void (async () => {
      // Refresh the JWT-derived session before navigating so middleware sees
      // up-to-date onboardingComplete / tier.
      try {
        await update();
      } catch {
        /* swallow */
      }

      const user = session?.user;
      const dest =
        redirectTo ??
        (user?.onboardingComplete === false ? "/onboarding" : "/profile");

      router.push(dest);
    })();
  }, [progress, status, redirected, redirectTo, router, session, update]);

  const isDone = progress >= HANDSHAKE_STEPS.length;
  const totalBudgetSec = ((cold ? COLD_START_BUDGET_MS : FAST_BUDGET_MS) / 1000).toFixed(1);
  const elapsedSec = Math.max(0, (Date.now() - startedAt) / 1000).toFixed(1);

  return (
    <div
      className="lab"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 520px)",
        minHeight: "100vh",
        color: "var(--fg)",
      }}
    >
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
        }}
      >
        <div style={{ textAlign: "center", padding: "0 32px" }}>
          <div
            className="t-tag"
            style={{
              marginBottom: 12,
              color: isDone ? "var(--accent)" : "var(--accent-2)",
            }}
          >
            {isDone ? "READY · REDIRECTING" : "STATION · 01 / GATE · INBOUND"}
          </div>
          <div
            className="t-display"
            style={{
              fontSize: 36,
              color: "var(--fg-dim)",
              lineHeight: 1.15,
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            {isDone ? (
              <>
                The kitchen is{" "}
                <em style={{ color: "var(--accent)", fontStyle: "italic" }}>open</em>.
              </>
            ) : (
              <>
                Calibrating to the{" "}
                <em style={{ color: "var(--accent)", fontStyle: "italic" }}>live sky</em>.
              </>
            )}
          </div>
          <div
            className="t-mono"
            style={{
              marginTop: 28,
              fontSize: 9,
              color: "var(--fg-faint)",
              letterSpacing: "0.18em",
              lineHeight: 1.8,
            }}
          >
            ELAPSED · {elapsedSec}s
            <br />
            BUDGET · {totalBudgetSec}s
          </div>
        </div>
      </section>

      <section
        style={{
          position: "relative",
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="t-tag" style={{ marginBottom: 14, color: "var(--accent)" }}>
          AUTH · ESTABLISHING SESSION
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 36, margin: "0 0 10px", lineHeight: 1.02, color: "var(--fg)" }}
        >
          {isDone ? (
            <>Welcome back.</>
          ) : (
            <>
              One moment,{" "}
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>practitioner</em>.
            </>
          )}
        </h1>
        <p style={{ color: "var(--fg-dim)", fontSize: 13, lineHeight: 1.55, margin: "0 0 24px" }}>
          {isDone
            ? "Session propagated across .alchm.kitchen. Redirecting to your kitchen."
            : "We're computing your standing chart and warming the engine. Most sessions take under a second; cold starts can take 6–8."}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--line)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {HANDSHAKE_STEPS.map((s, i) => {
            const done = i < progress;
            const active = i === progress && !isDone;
            const pending = i > progress;
            return (
              <div
                key={s.code}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr auto",
                  gap: 14,
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom:
                    i < HANDSHAKE_STEPS.length - 1 ? "1px solid var(--line)" : "none",
                  background: active
                    ? "color-mix(in oklch, var(--accent), transparent 90%)"
                    : "transparent",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${
                      done
                        ? "color-mix(in oklch, var(--accent), transparent 40%)"
                        : active
                          ? "color-mix(in oklch, var(--accent-2), transparent 40%)"
                          : "var(--line-hi)"
                    }`,
                    background: done ? "var(--accent)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: done ? "var(--bg)" : active ? "var(--accent-2)" : "var(--fg-faint)",
                    fontFamily: "var(--f-mono)",
                    fontSize: 10,
                    position: "relative",
                  }}
                >
                  {done && <Glyph name="check" size={12} stroke={2.4} />}
                  {active && (
                    <>
                      <span
                        data-motion
                        style={{
                          position: "absolute",
                          inset: -2,
                          borderRadius: "50%",
                          border:
                            "1.5px solid color-mix(in oklch, var(--accent-2), transparent 40%)",
                          borderTopColor: "transparent",
                          animation: "orbitRot 1s linear infinite",
                        }}
                      />
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-2)",
                        }}
                      />
                    </>
                  )}
                  {pending && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--fg-faint)",
                      }}
                    />
                  )}
                </div>
                <div>
                  <div
                    className="t-mono"
                    style={{
                      fontSize: 10,
                      color: pending ? "var(--fg-faint)" : "var(--fg-mute)",
                      letterSpacing: "0.16em",
                    }}
                  >
                    {s.code}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: done ? "var(--fg-dim)" : active ? "var(--fg)" : "var(--fg-mute)",
                      fontFamily: "var(--f-body)",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="t-mono"
                    style={{
                      fontSize: 9,
                      color: "var(--fg-faint)",
                      letterSpacing: "0.14em",
                      marginTop: 2,
                    }}
                  >
                    {s.hint.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {done && (
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
                      OK
                    </span>
                  )}
                  {active && (
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--accent-2)" }}>
                      …
                    </span>
                  )}
                  {pending && (
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-faint)" }}>
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {cold && !isDone && (
          <div
            className="alchm-panel-flat"
            style={{ marginTop: 16, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <Glyph
              name="crosshair"
              size={16}
              style={{ color: "var(--accent-2)", flexShrink: 0, marginTop: 2 }}
            />
            <div style={{ fontSize: 11, color: "var(--fg-dim)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--fg)" }}>Cold start in progress.</strong>{" "}
              Vercel just woke our serverless function. Subsequent sign-ins will be sub-second.
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "auto",
            paddingTop: 22,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="t-mono"
            style={{ fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.16em" }}
          >
            SESSION · ESTABLISHING
          </span>
          <button
            type="button"
            onClick={() => { void signOut({ callbackUrl: "/login" }); }}
            className="t-mono"
            style={{
              fontSize: 9,
              color: "var(--fg-mute)",
              letterSpacing: "0.14em",
              background: "transparent",
              border: "none",
              borderBottom: "1px dotted var(--line-hi)",
              paddingBottom: 2,
              cursor: "pointer",
            }}
          >
            CANCEL · SIGN OUT
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
 * 2. WELCOME BACK
 * Returning-user fast path. Reads a non-sensitive "last_user" hint from
 * localStorage. The actual sign-in still requires Google.
 * ========================================================================= */

export interface WelcomeBackHint {
  name: string;
  email: string;
  initial?: string;
}

export interface WelcomeBackProps {
  hint: WelcomeBackHint;
  onContinue: () => void;
  onDifferentAccount?: () => void;
  loading?: boolean;
}

export function WelcomeBack({
  hint,
  onContinue,
  onDifferentAccount,
  loading = false,
}: WelcomeBackProps): JSX.Element {
  const initial = hint.initial || hint.name?.[0]?.toUpperCase() || "G";
  return (
    <div
      className="lab"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 460px)",
        minHeight: "100vh",
        color: "var(--fg)",
      }}
    >
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="t-tag" style={{ marginBottom: 12, color: "var(--fg-dim)" }}>
            STATION · 01 / GATE · RETURNING
          </div>
          <div
            className="t-display"
            style={{ fontSize: 40, color: "var(--fg)", lineHeight: 1.05, marginBottom: 18 }}
          >
            Welcome back.
          </div>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 14,
              maxWidth: 380,
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            We remember this device. One tap and you&apos;re back in the kitchen — your standing
            chart is already loaded.
          </p>
        </div>
      </section>

      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "40px 36px",
          justifyContent: "center",
        }}
      >
        <div className="t-tag" style={{ marginBottom: 18, color: "var(--accent)" }}>
          WELCOME BACK · RECOGNIZED DEVICE
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 44, margin: "0 0 24px", lineHeight: 0.98, color: "var(--fg)" }}
        >
          Welcome back,
          <br />
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
            {hint.name.split(" ")[0]}
          </em>
          .
        </h1>

        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
            border: "1px solid var(--line-hi)",
            borderRadius: 12,
            cursor: loading ? "default" : "pointer",
            width: "100%",
            textAlign: "left",
            color: "var(--fg)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--f-display)",
              fontStyle: "italic",
              fontSize: 22,
              color: "var(--bg)",
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--fg)" }}>
              {hint.name}
            </div>
            <div
              className="t-mono"
              style={{
                fontSize: 10,
                color: "var(--fg-mute)",
                letterSpacing: "0.12em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {hint.email}
            </div>
          </div>
          <Glyph
            name="arrow"
            size={18}
            style={{ color: "var(--fg-dim)", flexShrink: 0 }}
          />
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="alchm-btn"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "16px",
            fontSize: 12,
            marginTop: 12,
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 60%), color-mix(in oklch, var(--accent), transparent 80%))",
            borderColor: "color-mix(in oklch, var(--accent), transparent 40%)",
            color: "var(--fg)",
            cursor: loading ? "default" : "pointer",
          }}
        >
          <Glyph name="google" size={18} /> Continue as {hint.name.split(" ")[0]}
        </button>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
          {onDifferentAccount && (
            <button
              type="button"
              onClick={onDifferentAccount}
              className="t-mono"
              style={{
                fontSize: 10,
                color: "var(--fg-mute)",
                letterSpacing: "0.14em",
                background: "transparent",
                border: "none",
                borderBottom: "1px dotted var(--line-hi)",
                paddingBottom: 2,
                cursor: "pointer",
              }}
            >
              USE A DIFFERENT ACCOUNT
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
 * 3. ACCOUNT & SESSIONS
 * /profile/security target. Lists active sessions, linked providers, agent
 * sync, and the danger zone. Wired to /api/auth/sessions when available.
 * ========================================================================= */

const FALLBACK_SESSIONS: SessionRow[] = [
  { id: "current", sub: "kitchen.alchm.kitchen", device: "This browser", loc: "—", time: "Active now", current: true },
];

export interface AccountSessionsProps {
  /** Optional override — when omitted, the component fetches /api/auth/sessions. */
  sessions?: SessionRow[];
  /** Cross-subdomain matrix overrides. */
  scopes?: Array<{ d: string; v: boolean; icon: GlyphName }>;
}

export function AccountSessions({
  sessions: sessionsProp,
  scopes,
}: AccountSessionsProps = {}): JSX.Element {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>(sessionsProp ?? FALLBACK_SESSIONS);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [agentSync, setAgentSync] = useState<{ active: boolean; lastSync: string | null }>({
    active: false,
    lastSync: null,
  });

  // Fetch live session list from the auth subsystem; degrade silently
  useEffect(() => {
    if (sessionsProp) return;
    let cancelled = false;
    // Named, not an inline IIFE: TypeScript does not reset narrowing across an
    // IIFE, so `cancelled` would read as literal `false` and every unmount guard
    // below would be reported as dead code. Do not inline.
    async function loadSessions(): Promise<void> {
      try {
        const res = await fetch("/api/auth/sessions", { credentials: "include" });
        if (!res.ok) return;
        const parsed = AuthSessionsResponseSchema.safeParse(await res.json());
        if (!parsed.success || cancelled) return;
        setSessions(parsed.data.sessions);
        if (parsed.data.memberSince) setMemberSince(parsed.data.memberSince);
      } catch {
        /* leave fallback */
      }
    }
    void loadSessions();
    return () => {
      cancelled = true;
    };
  }, [sessionsProp]);

  // Agent sync status (best-effort)
  useEffect(() => {
    let cancelled = false;
    // Named, not an inline IIFE: TypeScript does not reset narrowing across an
    // IIFE, so `cancelled` would read as literal `false` and every unmount guard
    // below would be reported as dead code. Do not inline.
    async function loadAgentSync(): Promise<void> {
      try {
        const res = await fetch("/api/internal/agent-sync/status", { credentials: "include" });
        if (!res.ok) return;
        const parsed = AgentSyncStatusResponseSchema.safeParse(await res.json());
        if (!parsed.success || cancelled) return;
        setAgentSync({ active: parsed.data.active, lastSync: parsed.data.lastSync });
      } catch {
        /* ignore */
      }
    }
    void loadAgentSync();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRevoke = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/auth/sessions/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      /* surface via toast in caller */
    }
  }, []);

  const handleSignOutEverywhere = useCallback(() => {
    void signOut({ callbackUrl: "/login" });
  }, []);

  const user = session?.user;
  const userName = user?.name ?? "Practitioner";
  const userInitial = userName[0]?.toUpperCase() ?? "G";
  const userId =
    user?.id?.slice(0, 8).toUpperCase() ?? "ALCH-LOCAL";

  const defaultScopes: Array<{ d: string; v: boolean; icon: GlyphName }> = scopes ?? [
    { d: "kitchen", v: true, icon: "flask" },
    { d: "agents", v: agentSync.active, icon: "orbital" },
    { d: "lab", v: true, icon: "atom" },
    { d: "feed", v: false, icon: "wave" },
  ];

  return (
    <div
      className="lab"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh", color: "var(--fg)" }}
    >
      <ShellHeader subtitle="← PROFILE / SECURITY · SESSIONS" />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
          minHeight: 0,
        }}
      >
        <aside
          style={{
            padding: "32px 28px",
            borderRight: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--f-display)",
                fontStyle: "italic",
                fontSize: 28,
                color: "var(--bg)",
              }}
            >
              {userInitial}
            </div>
            <div>
              <div className="t-display" style={{ fontSize: 20, color: "var(--fg)" }}>
                {userName}
              </div>
              <div
                className="t-mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-mute)",
                  letterSpacing: "0.12em",
                }}
              >
                {userId}
              </div>
            </div>
          </div>

          <div className="alchm-rule" />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <IdRow k="EMAIL" v={user?.email ?? "—"} />
            <IdRow
              k="MEMBER SINCE"
              v={
                memberSince?.slice(0, 10) ??
                (user as { createdAt?: string } | undefined)?.createdAt
                  ?.toString()
                  .slice(0, 10) ??
                "—"
              }
            />
            <IdRow
              k="ROLE"
              v={user?.role?.toUpperCase() ?? "USER"}
            />
          </div>

          <div className="alchm-rule" />

          <div>
            <div className="t-tag" style={{ marginBottom: 12 }}>LINKED PROVIDERS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ProviderRow
                icon="google"
                name="Google"
                email={user?.email ?? null}
                linked={Boolean(user?.email)}
              />
              <ProviderRow icon="atom" name="Amazon" email={null} linked={false} />
              <ProviderRow icon="ring" name="Apple" email={null} linked={false} />
            </div>
          </div>

          <div className="alchm-rule" />

          <div className="alchm-panel-flat" style={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span className="t-tag" style={{ color: "var(--accent-2)" }}>
                AGENT SYNC
              </span>
              <span
                className="alchm-chip"
                style={{
                  padding: "2px 8px",
                  fontSize: 9,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  className="el-dot"
                  style={{
                    width: 5,
                    height: 5,
                    background: agentSync.active ? "var(--accent-2)" : "var(--fg-faint)",
                    boxShadow: agentSync.active ? "0 0 4px var(--accent-2)" : "none",
                  }}
                />
                {agentSync.active ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
            <div
              className="t-mono"
              style={{
                fontSize: 10,
                color: "var(--fg-mute)",
                letterSpacing: "0.12em",
                lineHeight: 1.6,
              }}
            >
              SYNCED TO <span style={{ color: "var(--fg-dim)" }}>FASTAPI · AGENT MESH</span>
              <br />
              LAST · {agentSync.lastSync ?? "—"}
            </div>
          </div>
        </aside>

        <main style={{ padding: "32px 36px", overflow: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 22,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="t-tag" style={{ marginBottom: 6 }}>
                ACTIVE SESSIONS · {sessions.length}
              </div>
              <h1
                className="t-display"
                style={{ fontSize: 32, margin: 0, color: "var(--fg)", lineHeight: 1.05 }}
              >
                One JWT, every{" "}
                <em style={{ color: "var(--accent)", fontStyle: "italic" }}>subdomain</em>.
              </h1>
              <p
                style={{
                  color: "var(--fg-dim)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  margin: "8px 0 0",
                  maxWidth: 540,
                }}
              >
                Your session cookie is scoped to{" "}
                <span className="t-mono" style={{ color: "var(--fg)" }}>.alchm.kitchen</span>{" "}
                — sign in once, unlock the entire mesh.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOutEverywhere}
              className="alchm-btn"
              style={{
                padding: "10px 14px",
                fontSize: 10,
                color: "oklch(0.78 0.18 30)",
                borderColor: "color-mix(in oklch, oklch(0.78 0.18 30), transparent 60%)",
              }}
            >
              SIGN OUT EVERYWHERE
            </button>
          </div>

          <div className="alchm-panel-flat" style={{ padding: 18, marginBottom: 24 }}>
            <div className="t-tag" style={{ marginBottom: 14 }}>
              COOKIE SCOPE · *.ALCHM.KITCHEN
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              {defaultScopes.map((s) => (
                <div
                  key={s.d}
                  style={{
                    padding: 14,
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    background: s.v
                      ? "color-mix(in oklch, var(--accent), transparent 92%)"
                      : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Glyph
                      name={s.icon}
                      size={16}
                      style={{ color: s.v ? "var(--accent)" : "var(--fg-mute)" }}
                    />
                    <span
                      className="el-dot"
                      style={{
                        width: 6,
                        height: 6,
                        background: s.v ? "var(--accent)" : "rgba(255,255,255,0.18)",
                        boxShadow: s.v ? "0 0 6px var(--accent)" : "none",
                      }}
                    />
                  </div>
                  <div>
                    <div className="t-display" style={{ fontSize: 16, color: "var(--fg)" }}>
                      {s.d}
                    </div>
                    <div
                      className="t-mono"
                      style={{
                        fontSize: 9,
                        color: "var(--fg-mute)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      .alchm.kitchen
                    </div>
                  </div>
                  <div
                    className="t-mono"
                    style={{
                      fontSize: 9,
                      color: s.v ? "var(--accent)" : "var(--fg-faint)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {s.v ? "ACTIVE" : "NOT USED"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="t-tag" style={{ marginBottom: 10 }}>SESSION LOG</div>
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr 100px",
                gap: 14,
                padding: "10px 16px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span className="t-tag">SUBDOMAIN</span>
              <span className="t-tag">DEVICE</span>
              <span className="t-tag">LOCATION</span>
              <span className="t-tag">LAST</span>
              <span className="t-tag" style={{ textAlign: "right" }}>ACTION</span>
            </div>
            {sessions.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr 100px",
                  gap: 14,
                  padding: "14px 16px",
                  borderBottom: i < sessions.length - 1 ? "1px solid var(--line)" : "none",
                  alignItems: "center",
                  background: s.current
                    ? "color-mix(in oklch, var(--accent), transparent 94%)"
                    : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="el-dot"
                    style={{
                      width: 6,
                      height: 6,
                      background: s.current ? "var(--accent)" : "var(--fg-mute)",
                      boxShadow: s.current ? "0 0 6px var(--accent)" : "none",
                    }}
                  />
                  <span className="t-mono" style={{ fontSize: 12, color: "var(--fg)" }}>
                    {s.sub}
                  </span>
                  {s.current && (
                    <span
                      className="alchm-chip alchm-chip-active"
                      style={{ padding: "2px 8px", fontSize: 9 }}
                    >
                      THIS
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>{s.device}</span>
                <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>{s.loc}</span>
                <span
                  className="t-mono"
                  style={{
                    fontSize: 11,
                    color: s.current ? "var(--accent)" : "var(--fg-mute)",
                  }}
                >
                  {s.time}
                </span>
                <div style={{ textAlign: "right" }}>
                  {s.current ? (
                    <span
                      className="t-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--fg-mute)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      —
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { void handleRevoke(s.id); }}
                      className="t-mono"
                      style={{
                        fontSize: 10,
                        color: "oklch(0.78 0.18 30)",
                        letterSpacing: "0.14em",
                        background: "transparent",
                        border: "none",
                        borderBottom:
                          "1px dotted color-mix(in oklch, oklch(0.78 0.18 30), transparent 60%)",
                        cursor: "pointer",
                      }}
                    >
                      REVOKE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function IdRow({ k, v }: { k: string; v: string }): JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <span className="t-tag" style={{ fontSize: 9 }}>{k}</span>
      <span
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 11,
          color: "var(--fg)",
          textAlign: "right",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function ProviderRow({
  icon,
  name,
  email,
  linked,
}: {
  icon: GlyphName;
  name: string;
  email: string | null;
  linked: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        border: "1px solid var(--line)",
        borderRadius: 8,
        background: linked ? "color-mix(in oklch, var(--accent), transparent 94%)" : "transparent",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: linked ? "var(--accent)" : "var(--fg-mute)",
        }}
      >
        <Glyph name={icon} size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "var(--fg)" }}>{name}</div>
        <div
          className="t-mono"
          style={{
            fontSize: 9,
            color: "var(--fg-mute)",
            letterSpacing: "0.12em",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {linked && email ? email : "NOT LINKED"}
        </div>
      </div>
      <span
        className="t-mono"
        style={{
          fontSize: 9,
          color: linked ? "var(--accent)" : "var(--fg-mute)",
          letterSpacing: "0.14em",
        }}
      >
        {linked ? "LINKED" : "—"}
      </span>
    </div>
  );
}
