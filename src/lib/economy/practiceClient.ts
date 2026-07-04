/**
 * Client half of the invisible reward layer.
 *
 * Surfaces never render reward UI of their own — they either (a) call
 * firePractice() for client-observed acts (visiting the feed, discovering a
 * surface, acting on a recommendation) or (b) receive a `reward` object from a
 * server route that recognized the act itself (cooked-it) and hand it to
 * revealPracticeReward(). Either way the globally-mounted PracticeDelightHost
 * does the revealing: toast + token rain + balance-bar refresh.
 *
 * Everything here is fire-and-forget and silent on failure: an act that
 * doesn't pay must never surface an error — invisibility cuts both ways.
 */

export const PRACTICE_REWARD_EVENT = "practice:reward";

export interface PracticeReward {
  tokenType: string;
  amount: number;
  hint: string;
}

/** Hand a server-granted reward to the delight host. */
export function revealPracticeReward(reward: PracticeReward): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PRACTICE_REWARD_EVENT, { detail: reward }));
}

// Session-scoped dedupe so repeat client events don't even hit the network;
// the server's practice ledger stays the authority.
const firedThisSession = new Set<string>();

// After a 401 (signed-out visitor) stop posting for the rest of the page
// session — anon acts can't earn, so the traffic is pure waste.
let anonDisabled = false;

/** Report a client-observed act. Silent, deduped, never throws. */
export function firePractice(type: string, targetId?: string): void {
  if (typeof window === "undefined" || anonDisabled) return;
  const key = `${type}:${targetId ?? "-"}`;
  if (firedThisSession.has(key)) return;
  firedThisSession.add(key);

  void fetch("/api/economy/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, targetId }),
  })
    .then(async (res) => {
      if (res.status === 401) {
        anonDisabled = true;
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as {
        rewarded?: boolean;
        tokenType?: string;
        amount?: number;
        hint?: string;
      };
      if (json.rewarded && json.tokenType && json.amount && json.hint) {
        revealPracticeReward({ tokenType: json.tokenType, amount: json.amount, hint: json.hint });
      }
    })
    .catch(() => {
      /* invisible — a missed reward is not an error */
    });
}

const DISCOVERED_CACHE_KEY = "alchm:practice:discovered";

function discoveredCache(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DISCOVERED_CACHE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function rememberDiscovered(surface: string): void {
  try {
    const cache = discoveredCache();
    cache.add(surface);
    window.localStorage.setItem(DISCOVERED_CACHE_KEY, JSON.stringify([...cache]));
  } catch {
    /* private mode etc. — the server dedupes authoritatively */
  }
}

/**
 * First-ever visit to a surface quietly pays once. localStorage keeps repeat
 * visits off the network; the server's once-ever dedupe is the real gate.
 */
export function discoverSurface(surface: string): void {
  if (typeof window === "undefined") return;
  if (discoveredCache().has(surface)) return;
  rememberDiscovered(surface);
  firePractice("surface_discovered", surface);
}
