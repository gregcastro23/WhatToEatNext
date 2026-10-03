/**
 * Tests for `defaultRateLimitTier` (Item 3) — the api_keys.rate_limit_tier a
 * newly minted key gets. Operators (admin role plus an allowlisted email) get
 * `alchemist`, every other account `apprentice`; a failed lookup falls through
 * to `authenticated`. The retired subscription tier plays no part (owner
 * ruling 2026-09-28).
 */

const mockGetUserById = jest.fn();

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { getUserById: (...a: unknown[]) => mockGetUserById(...a) },
}));

import { defaultRateLimitTier } from "@/lib/api-keys/queries";
import { ADMIN_EMAILS } from "@/lib/auth/adminEmails";

const USER_ID = "11111111-1111-1111-1111-111111111111";
const OPERATOR_EMAIL = ADMIN_EMAILS[1] ?? "missing-admin-email";

function storedUser(roles: string[], email: string): Record<string, unknown> {
  return { id: USER_ID, email, roles, profile: {} };
}

describe("defaultRateLimitTier", () => {
  beforeEach(() => {
    mockGetUserById.mockReset();
  });

  it("returns alchemist for an operator", async () => {
    mockGetUserById.mockResolvedValueOnce(storedUser(["admin", "user"], OPERATOR_EMAIL));
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("alchemist");
  });

  it.each([
    ["an ordinary account", ["user"], "someone@example.com"],
    ["the admin role without an allowlisted email", ["admin", "user"], "someone@example.com"],
    ["an allowlisted email without the admin role", ["user"], OPERATOR_EMAIL],
  ])("returns apprentice for %s", async (_label, roles, email) => {
    mockGetUserById.mockResolvedValueOnce(storedUser(roles, email));
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("apprentice");
  });

  it("falls back to authenticated when the user is not found", async () => {
    mockGetUserById.mockResolvedValueOnce(null);
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("authenticated");
  });

  it("falls back to authenticated when the lookup throws", async () => {
    mockGetUserById.mockRejectedValueOnce(new Error("db down"));
    await expect(defaultRateLimitTier(USER_ID)).resolves.toBe("authenticated");
  });
});
