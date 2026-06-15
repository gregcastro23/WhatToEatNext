/**
 * Reverse cross-site session bridge: let alchm.kitchen (WTEN) recognize a user
 * who is signed in only on the agents app (agents.alchm.kitchen).
 *
 * Mirror image of the agents-side bridge (AlchmAgentsETH `lib/auth-bridge.ts`):
 * WTEN runs Auth.js v5 (cookie `authjs.session-token`); the agents app runs
 * NextAuth v4 (cookie `next-auth.session-token`). Both cookies are scoped to the
 * shared parent domain `.alchm.kitchen`, so the agents cookie already reaches
 * WTEN on every request — WTEN just never read it. Rather than have WTEN decode
 * a foreign v4 cookie, we ask the agents app's own `/api/auth/session` who the
 * forwarded cookies belong to and trust the resulting email; callers resolve
 * that email to a WTEN user.
 *
 * This closes the food-bridge gap: an agents-native user who clicks the Bazaar
 * "Food" tab lands on alchm.kitchen/restaurants and can pay with ESMS without a
 * second login.
 *
 * IMPORTANT: this is deliberately wired only into food-bridge entry points
 * (economy balance + ESMS checkout), NOT into WTEN's own `/api/auth/session`
 * route — doing the latter would recurse against the agents→WTEN forward bridge,
 * which already calls WTEN's `/api/auth/session`.
 *
 * Safety: every failure path returns null and the network call is time-boxed.
 * The agents app being slow or down must never block or change WTEN auth — a
 * bridged identity is purely additive on top of WTEN's own session check.
 *
 * @file src/lib/auth/agentsBridge.ts
 */

// Trusted, fixed default. Only ever an alchm.kitchen-owned host; never derived
// from request input.
const AGENTS_BASE_URL = (
  process.env.AGENTS_BASE_URL ||
  process.env.NEXT_PUBLIC_AGENTS_URL ||
  "https://agents.alchm.kitchen"
).replace(/\/$/, "");

const SESSION_FETCH_TIMEOUT_MS = 2500;

export interface AgentsBridgeUser {
  /** Lower-cased email from the agents session — the cross-site identity key. */
  email: string;
  name: string | null;
  image: string | null;
  /** The agents app's own user id, if it exposes one on the session. */
  agentsUserId: string | null;
}

// Only the agents app sets a `next-auth.session-token` cookie (optionally with
// the `__Secure-`/`__Host-` prefix in prod). If it isn't present there's nothing
// to bridge — skip the network hop so normal WTEN-only traffic pays no cost.
function hasAgentsSessionCookie(cookieHeader: string): boolean {
  return /(?:^|;\s*)(?:__Secure-|__Host-)?next-auth\.session-token=/.test(
    cookieHeader,
  );
}

/**
 * Resolve the agents-app session user for the forwarded cookie header, or null
 * if there is no agents session / it is unreachable. Never throws.
 */
export async function resolveAgentsBridgeUser(
  cookieHeader: string | null | undefined,
): Promise<AgentsBridgeUser | null> {
  if (!cookieHeader || !hasAgentsSessionCookie(cookieHeader)) return null;

  try {
    const res = await fetch(`${AGENTS_BASE_URL}/api/auth/session`, {
      method: "GET",
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      user?: {
        id?: string | null;
        email?: string | null;
        name?: string | null;
        image?: string | null;
      } | null;
    };
    const user = data?.user;
    if (!user?.email) return null;

    return {
      email: user.email.trim().toLowerCase(),
      name: user.name ?? null,
      image: user.image ?? null,
      agentsUserId: user.id ?? null,
    };
  } catch {
    // Timeout, network error, or malformed JSON — degrade silently to "no
    // bridged session" so WTEN auth behaves exactly as before.
    return null;
  }
}
