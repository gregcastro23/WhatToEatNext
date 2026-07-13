/**
 * Feed identity resolution (PR 4 — the identity-default flip).
 *
 * PRINCIPLE: identity is stamped at write time; the reader never REVEALS more
 * than the stamp allows, but may CONCEAL more. The five rules, in order:
 *
 *   1. Agents are always named (existing behavior).
 *   2. No v2 stamp (LEGACY event) → the old rule, frozen forever:
 *      `metadata.shareName === true`. The flip can never de-anonymize a
 *      pre-existing row because every pre-flip row lacks the stamp.
 *   3. stamp.share === false → concealed, permanently (per-post anonymous).
 *   4. stamp.explicit → revealed (the user actively chose to be named on
 *      this post; a later global opt-out does not retract an explicit choice).
 *   5. Otherwise (default-named) → the actor's CURRENT setting decides, so a
 *      later opt-out retroactively conceals default-named posts. Missing
 *      profile row (null/undefined) counts as true.
 *
 * Net effect: the per-user opt-out is honored everywhere including
 * retroactively — but only in the privacy-safe direction (conceal, never
 * reveal).
 */

/** Written into metadata_payload.identity by feedDatabaseService.createEvent. */
export interface IdentityStamp {
  v: 2;
  /** Render the actor's real name/avatar (subject to rules 3–5 above). */
  share: boolean;
  /** The user explicitly chose `share` on this post (vs. inherited default). */
  explicit: boolean;
}

/** Parse metadata_payload (object or JSON string) into a plain object. */
export function normalizeFeedMetadata(metadata: unknown): Record<string, unknown> {
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
}

/**
 * The v2 identity stamp carried by a metadata payload, or null for legacy
 * events. Strict about shape: a malformed stamp is treated as legacy (rule 2)
 * rather than guessed at — the legacy rule is the conservative one.
 */
export function readIdentityStamp(metadata: unknown): IdentityStamp | null {
  const meta = normalizeFeedMetadata(metadata);
  const raw = meta.identity;
  if (!raw || typeof raw !== "object") return null;
  const stamp = raw as Partial<IdentityStamp>;
  if (stamp.v !== 2 || typeof stamp.share !== "boolean") return null;
  return { v: 2, share: stamp.share, explicit: stamp.explicit === true };
}

export interface ResolveFeedActorRevealArgs {
  isAgent: boolean;
  /** metadata_payload — object or JSON string, resolver normalizes. */
  metadata: unknown;
  /** user_profiles.share_identity as read NOW (null/undefined = no row = true). */
  currentShareIdentity: boolean | null | undefined;
}

/** True → render real name + avatar. False → "Anonymous Alchemist", no image. */
export function resolveFeedActorReveal({
  isAgent,
  metadata,
  currentShareIdentity,
}: ResolveFeedActorRevealArgs): boolean {
  // Rule 1: agents are always named.
  if (isAgent) return true;

  const meta = normalizeFeedMetadata(metadata);
  const stamp = readIdentityStamp(meta);

  // Rule 2: legacy events keep rendering under the rule they were posted with.
  if (!stamp) return meta.shareName === true;

  // Rule 3: per-post anonymous is permanent.
  if (stamp.share === false) return false;

  // Rule 4: an explicit per-post opt-in survives a later global opt-out.
  if (stamp.explicit) return true;

  // Rule 5: default-named posts honor the CURRENT setting (later opt-out
  // conceals; missing row counts as shared).
  return currentShareIdentity !== false;
}

/**
 * The default `share` value for a NEW event when the caller didn't choose.
 * `IDENTITY_DEFAULT_ANONYMOUS=1` is the emergency lever: it flips the default
 * back to anonymous without a redeploy — stamps stay coherent because events
 * written under the lever are stamped share=false like any other.
 */
export function defaultShareIdentity(
  profileShareIdentity: boolean | null | undefined,
): boolean {
  if (process.env.IDENTITY_DEFAULT_ANONYMOUS === "1") return false;
  return profileShareIdentity !== false;
}

/**
 * Build the stamp createEvent writes. `requested.share` is the per-post
 * choice (composer checkbox / API field); absent means "inherit the default".
 */
export function buildIdentityStamp(
  requested: { share?: boolean; explicit?: boolean } | undefined,
  profileShareIdentity: boolean | null | undefined,
): IdentityStamp {
  const explicit = requested?.explicit ?? requested?.share !== undefined;
  const share = requested?.share ?? defaultShareIdentity(profileShareIdentity);
  return { v: 2, share, explicit };
}

/**
 * Composer helper — maps the "Post anonymously" opt-out checkbox to the
 * shareIdentity API field:
 *   - checked                          → false (explicit per-post anonymous)
 *   - unchecked, global default OFF    → true  (the user actively un-checked
 *                                        against their own opt-out — explicit)
 *   - unchecked, global default ON     → undefined (default-named; a later
 *                                        global opt-out still conceals it)
 */
export function shareIdentityForPost(
  postAnonymously: boolean,
  shareByDefault: boolean,
): boolean | undefined {
  if (postAnonymously) return false;
  if (!shareByDefault) return true;
  return undefined;
}
