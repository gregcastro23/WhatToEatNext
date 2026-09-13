/**
 * @jest-environment node
 */

delete process.env.DATABASE_URL;

import { userDatabase, type UserWithProfile } from "@/services/userDatabaseService";

describe("userDatabaseService in-memory unlink and profile mapping", () => {
  it("deletes privyDid and walletAddress from in-memory user when unlinking", async () => {
    const userId = `test-user-${Date.now()}`;
    const initialUser: UserWithProfile = {
      id: userId,
      email: "test@example.com",
      roles: ["user"],
      isActive: true,
      privyDid: "did:privy:12345",
      walletAddress: "0x1234567890abcdef",
      createdAt: new Date(),
      profile: {
        userId,
        email: "test@example.com",
        preferences: {},
        dietaryPreferences: {},
        onboardingComplete: true,
        diningGroups: [],
      },
    };

    // Populate in-memory map
    const usersMap: Map<string, UserWithProfile> = Reflect.get(userDatabase, "users");
    usersMap.set(userId, initialUser);

    expect("privyDid" in initialUser).toBe(true);
    expect("walletAddress" in initialUser).toBe(true);

    // Unlink
    await userDatabase.unlinkUserPrivyDid(userId);

    const userAfter = usersMap.get(userId);
    expect(userAfter).toBeDefined();
    if (!userAfter) throw new Error("userAfter should be defined");
    // Keys must be completely removed from the object, not left with value undefined
    expect("privyDid" in userAfter).toBe(false);
    expect("walletAddress" in userAfter).toBe(false);
    expect(userAfter.privyDid).toBeUndefined();
    expect(userAfter.walletAddress).toBeUndefined();
  });

  it("omits empty optional fields in rowToUserWithProfile", () => {
    const row = {
      id: "row-123",
      email: "row@example.com",
      password_hash: "hash",
      role: "USER",
      is_active: true,
      is_agent: false,
      privy_did: null,
      wallet_address: null,
      created_at: new Date().toISOString(),
      last_login_at: null,
      profile_name: null,
      name: null,
      preferences: null,
      dietary_preferences: null,
      onboarding_completed: false,
      birth_data: null,
      natal_chart: null,
      group_members: null,
      dining_groups: null,
    };

    const rowToUser: (
      row: Record<string, unknown>,
    ) => UserWithProfile = Reflect.get(userDatabase, "rowToUserWithProfile");
    const user = rowToUser.call(userDatabase, row);

    expect("privyDid" in user).toBe(false);
    expect("walletAddress" in user).toBe(false);
    expect("lastLoginAt" in user).toBe(false);
    expect("name" in user.profile).toBe(false);
    expect("birthData" in user.profile).toBe(false);
    expect("natalChart" in user.profile).toBe(false);
    expect(user.profile.onboardingComplete).toBe(false);
  });
});
