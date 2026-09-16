/**
 * Unit tests for 30-day absolute session lifetime and bounded legacy migration.
 *
 * @file src/lib/auth/__tests__/sessionLifetime.test.ts
 */

import {
  SESSION_MAX_AGE_SECONDS,
  CLOCK_SKEW_TOLERANCE_SECONDS,
  LEGACY_SESSION_MIGRATION_EPOCH_SECONDS,
  evaluateSessionLifetime,
} from "../sessionLifetime";

describe("sessionLifetime", () => {
  const BASE_NOW = 1789504380; // 2026-09-15T20:33:00Z (Phase 1 release)

  describe("Constants & Configuration", () => {
    it("pins SESSION_MAX_AGE_SECONDS to exactly 30 days (2,592,000s)", () => {
      expect(SESSION_MAX_AGE_SECONDS).toBe(30 * 24 * 60 * 60);
      expect(SESSION_MAX_AGE_SECONDS).toBe(2592000);
    });

    it("pins CLOCK_SKEW_TOLERANCE_SECONDS to 5 minutes (300s)", () => {
      expect(CLOCK_SKEW_TOLERANCE_SECONDS).toBe(300);
    });

    it("pins LEGACY_SESSION_MIGRATION_EPOCH_SECONDS to 2026-09-15T20:33:00Z (1789504380)", () => {
      expect(LEGACY_SESSION_MIGRATION_EPOCH_SECONDS).toBe(1789504380);
      const migrationDeadline =
        LEGACY_SESSION_MIGRATION_EPOCH_SECONDS + SESSION_MAX_AGE_SECONDS;
      expect(migrationDeadline).toBe(1792096380); // 2026-10-15T20:33:00Z
    });

  });

  describe("Initial Sign-In (Minting)", () => {
    it("mints current epoch seconds on initial sign-in", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: true,
        nowEpochSeconds: BASE_NOW,
      });

      expect(result).toEqual({
        valid: true,
        authTime: BASE_NOW,
      });
    });

    it("mints fresh epoch on initial sign-in even if old claim existed in payload", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: BASE_NOW - 100000,
        hasAuthTimeClaim: true,
        isInitialSignIn: true,
        nowEpochSeconds: BASE_NOW,
      });

      expect(result).toEqual({
        valid: true,
        authTime: BASE_NOW,
      });
    });
  });

  describe("30-Day Absolute Boundary Tests", () => {
    const authTime = 1700000000;

    it("allows active session at authTime + 30d - 1s (boundary: valid)", () => {
      const now = authTime + SESSION_MAX_AGE_SECONDS - 1;
      const result = evaluateSessionLifetime({
        tokenAuthTime: authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: true,
        authTime,
      });
    });

    it("rejects session at exact boundary authTime + 30d (boundary: expired)", () => {
      const now = authTime + SESSION_MAX_AGE_SECONDS;
      const result = evaluateSessionLifetime({
        tokenAuthTime: authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "expired",
      });
    });

    it("rejects session at authTime + 30d + 1s (boundary: expired)", () => {
      const now = authTime + SESSION_MAX_AGE_SECONDS + 1;
      const result = evaluateSessionLifetime({
        tokenAuthTime: authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "expired",
      });
    });
  });

  describe("Clock Skew Boundaries", () => {
    const now = 1700000000;

    it("allows authTime in future within exact tolerance (now + 300s)", () => {
      const authTime = now + CLOCK_SKEW_TOLERANCE_SECONDS;
      const result = evaluateSessionLifetime({
        tokenAuthTime: authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: true,
        authTime,
      });
    });

    it("rejects authTime in future beyond tolerance (now + 301s)", () => {
      const authTime = now + CLOCK_SKEW_TOLERANCE_SECONDS + 1;
      const result = evaluateSessionLifetime({
        tokenAuthTime: authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "future_clock_skew",
      });
    });

    it("rejects distant future timestamp (e.g. forged token)", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: now + 86400 * 365,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "future_clock_skew",
      });
    });
  });

  describe("Claim Presence & Malformed Values (P2 Distinction)", () => {
    const now = 1700000000;

    it("rejects explicit null as invalid claim (does not grant legacy migration)", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: null,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "invalid_auth_time",
      });
    });

    it("rejects non-integer float timestamps", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: 1700000000.5,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "invalid_auth_time",
      });
    });

    it("rejects string timestamps", () => {
      const result = evaluateSessionLifetime({
        tokenAuthTime: "1700000000",
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "invalid_auth_time",
      });
    });

    it("rejects boolean, object, or array claims", () => {
      expect(
        evaluateSessionLifetime({
          tokenAuthTime: true,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });

      expect(
        evaluateSessionLifetime({
          tokenAuthTime: {},
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });
    });

    it("rejects NaN and Infinity", () => {
      expect(
        evaluateSessionLifetime({
          tokenAuthTime: Number.NaN,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });

      expect(
        evaluateSessionLifetime({
          tokenAuthTime: Number.POSITIVE_INFINITY,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });
    });

    it("rejects zero and negative numbers", () => {
      expect(
        evaluateSessionLifetime({
          tokenAuthTime: 0,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });

      expect(
        evaluateSessionLifetime({
          tokenAuthTime: -500,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: now,
        }),
      ).toEqual({ valid: false, reason: "invalid_auth_time" });
    });

    it("rejects invalid injected clock or migration epoch", () => {
      expect(
        evaluateSessionLifetime({
          tokenAuthTime: now,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          nowEpochSeconds: -1,
        }),
      ).toEqual({ valid: false, reason: "invalid_clock" });

      expect(
        evaluateSessionLifetime({
          tokenAuthTime: now,
          hasAuthTimeClaim: true,
          isInitialSignIn: false,
          migrationEpochSeconds: Number.NaN,
        }),
      ).toEqual({ valid: false, reason: "invalid_clock" });
    });
  });

  describe("Bounded Legacy Token Migration (Policy Choice A)", () => {
    const migrationEpoch = LEGACY_SESSION_MIGRATION_EPOCH_SECONDS;
    const migrationDeadline = migrationEpoch + SESSION_MAX_AGE_SECONDS; // 2026-10-15T20:33:00Z

    it("grants legacy migration to unstamped token before deadline", () => {
      const now = migrationEpoch + 86400 * 5; // 5 days after Phase 1 release
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: true,
        authTime: migrationEpoch,
      });
    });

    it("grants legacy migration at 1 second before deadline", () => {
      const now = migrationDeadline - 1;
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: true,
        authTime: migrationEpoch,
      });
    });

    it("rejects unstamped legacy token at exact migration deadline", () => {
      const now = migrationDeadline;
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "legacy_migration_expired",
      });
    });

    it("rejects unstamped legacy token after migration deadline", () => {
      const now = migrationDeadline + 3600;
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: false,
        nowEpochSeconds: now,
      });

      expect(result).toEqual({
        valid: false,
        reason: "legacy_migration_expired",
      });
    });

    it("subsequent refreshes of migrated token expire strictly at the pinned deadline", () => {
      // Step 1: Token arrived unstamped at Day 5, was migrated to migrationEpoch
      const day5 = migrationEpoch + 86400 * 5;
      const step1 = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: false,
        nowEpochSeconds: day5,
      });
      expect(step1).toEqual({ valid: true, authTime: migrationEpoch });

      // Step 2: Same token refreshes on Day 25 with authTime already stamped
      const day25 = migrationEpoch + 86400 * 25;
      const step2 = evaluateSessionLifetime({
        tokenAuthTime: step1.authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: day25,
      });
      expect(step2).toEqual({ valid: true, authTime: migrationEpoch });

      // Step 3: Same token refreshes at Day 30 + 1s -> expires strictly
      const step3 = evaluateSessionLifetime({
        tokenAuthTime: step2.authTime,
        hasAuthTimeClaim: true,
        isInitialSignIn: false,
        nowEpochSeconds: migrationDeadline + 1,
      });
      expect(step3).toEqual({ valid: false, reason: "expired" });
    });

    it("fresh sign-ins after the migration deadline succeed normally", () => {
      const postDeadline = migrationDeadline + 86400 * 10;
      const result = evaluateSessionLifetime({
        tokenAuthTime: undefined,
        hasAuthTimeClaim: false,
        isInitialSignIn: true,
        nowEpochSeconds: postDeadline,
      });

      expect(result).toEqual({
        valid: true,
        authTime: postDeadline,
      });
    });
  });
});
