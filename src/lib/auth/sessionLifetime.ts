/**
 * 30-Day Absolute Session Lifetime & Auth Architecture
 *
 * Enforces an absolute lifetime cap on WTEN Auth.js sessions. Every session token
 * has an `authTime` claim (Unix epoch seconds) minted on initial sign-in.
 * Sessions expire strictly at `authTime + 30 days` regardless of ongoing
 * activity, rolling JWT exp, or token refreshes.
 *
 * For legacy tokens issued before this policy, the baseline is pinned to
 * `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS` (2026-09-15T20:33:00Z). Legacy tokens
 * expire strictly on 2026-10-15T20:33:00Z and cannot perpetually restart grace.
 *
 * @file src/lib/auth/sessionLifetime.ts
 */

export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days = 2,592,000 seconds
export const CLOCK_SKEW_TOLERANCE_SECONDS = 300; // 5 minutes = 300 seconds

/**
 * Pinned deployment epoch for legacy session migration (Unix epoch seconds).
 * Baseline: 2026-09-15T20:33:00Z (Phase 1 release, commit q8dv3cm3y).
 * Intentionally selected migration deadline: 2026-10-15T20:33:00Z (1792096380).
 */
export const LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380;


export type SessionLifetimeEvaluation =
  | { valid: true; authTime: number }
  | {
      valid: false;
      reason:
        | "expired"
        | "invalid_auth_time"
        | "future_clock_skew"
        | "legacy_migration_expired"
        | "invalid_clock";
    };

export interface EvaluateSessionLifetimeParams {
  tokenAuthTime: unknown;
  hasAuthTimeClaim: boolean;
  isInitialSignIn: boolean;
  nowEpochSeconds?: number;
  migrationEpochSeconds?: number;
}

/**
 * Pure evaluator for 30-day absolute session lifetime.
 *
 * Distinguishes absent claims (eligible for legacy migration) from present but
 * invalid/corrupted claims (e.g. explicit null, strings, floats, NaN, negative).
 * Returns a typed evaluation result without mutating input objects.
 */
export function evaluateSessionLifetime(
  params: EvaluateSessionLifetimeParams,
): SessionLifetimeEvaluation {
  const { tokenAuthTime, hasAuthTimeClaim, isInitialSignIn } = params;

  // Validate clock if explicitly injected
  let now: number;
  if (params.nowEpochSeconds !== undefined) {
    if (
      !Number.isSafeInteger(params.nowEpochSeconds) ||
      params.nowEpochSeconds <= 0
    ) {
      return { valid: false, reason: "invalid_clock" };
    }
    now = params.nowEpochSeconds;
  } else {
    now = Math.floor(Date.now() / 1000);
  }

  // Validate migration epoch if explicitly injected
  let migrationEpoch: number;
  if (params.migrationEpochSeconds !== undefined) {
    if (
      !Number.isSafeInteger(params.migrationEpochSeconds) ||
      params.migrationEpochSeconds <= 0
    ) {
      return { valid: false, reason: "invalid_clock" };
    }
    migrationEpoch = params.migrationEpochSeconds;
  } else {
    migrationEpoch = LEGACY_SESSION_MIGRATION_EPOCH_SECONDS;
  }

  // Initial sign-in: always mints fresh authTime claim
  if (isInitialSignIn) {
    return { valid: true, authTime: now };
  }

  // Absent claim (undefined or property absent): eligible for legacy migration
  if (!hasAuthTimeClaim || tokenAuthTime === undefined) {
    if (now >= migrationEpoch + SESSION_MAX_AGE_SECONDS) {
      return { valid: false, reason: "legacy_migration_expired" };
    }
    return { valid: true, authTime: migrationEpoch };
  }

  // Present claim: validate type and numeric range (rejects explicit null, floats, NaN, strings, etc.)
  if (
    typeof tokenAuthTime !== "number" ||
    !Number.isSafeInteger(tokenAuthTime) ||
    tokenAuthTime <= 0
  ) {
    return { valid: false, reason: "invalid_auth_time" };
  }

  // Reject future timestamps exceeding clock skew tolerance
  if (tokenAuthTime > now + CLOCK_SKEW_TOLERANCE_SECONDS) {
    return { valid: false, reason: "future_clock_skew" };
  }

  // Strict boundary: expired if now >= authTime + 30 days
  if (now >= tokenAuthTime + SESSION_MAX_AGE_SECONDS) {
    return { valid: false, reason: "expired" };
  }

  // Valid active session: preserve original authTime
  return { valid: true, authTime: tokenAuthTime };
}
