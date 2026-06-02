/**
 * User Database Service
 * Manages user profiles with birth data, natal charts, and preferences
 * Uses PostgreSQL for persistent storage with in-memory fallback
 */

import { randomUUID } from "crypto";
import type { UserProfile } from "@/contexts/UserContext";
import type { User, UserRole } from "@/lib/auth/jwt-auth";
import { _logger } from "@/lib/logger";
import { safeJsonParse } from "@/utils/typeGuards";

// Extended User type with profile data
export interface UserWithProfile extends User {
  profile: UserProfile;
  isAgent?: boolean;
}

// Check if we should use database (only in server-side contexts with DB available)
const isServerWithDB = (): boolean => {
  return typeof window === "undefined" && !!process.env.DATABASE_URL;
};

// Lazy-load database module to avoid build-time issues
let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch (_error) {
      _logger.warn("Database module not available, using in-memory storage");
    }
  }
  return dbModule;
};

class UserDatabaseService {
  // In-memory fallback storage
  private users: Map<string, UserWithProfile> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private initialized = false;

  constructor() {
    // Initialize is called lazily to avoid build-time issues
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Create a new user with profile
   */
  async createUser(data: {
    email: string;
    name: string;
    image?: string;
    passwordHash?: string;
    roles?: UserRole[];
    profile?: Partial<UserProfile>;
  }): Promise<UserWithProfile> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const email = data.email.toLowerCase();

    // The email check is now handled atomically by the database constraint below.

    const userId = randomUUID();
    const now = new Date();

    const user: UserWithProfile = {
      id: userId,
      email,
      passwordHash: data.passwordHash || "TEMP_NO_PASSWORD",
      roles: data.roles || ["user" as UserRole],
      isActive: true,
      createdAt: now,
      profile: {
        userId,
        name: data.name,
        email,
        preferences: {},
        groupMembers: [],
        diningGroups: [],
        ...data.profile,
      },
    };

    // Try PostgreSQL first
    if (db) {
      // Flag set inside the transaction when email already exists (race/cache-miss).
      // We resolve it AFTER the transaction to avoid a nested pool-connection inside
      // an open transaction (which could deadlock under pool exhaustion).
      let conflictOccurred = false;

      try {
        // Uses single 'role' ENUM column per migration 07
        const primaryRole = user.roles.includes("admin" as UserRole)
          ? "ADMIN"
          : "USER";
        await db.withTransaction(async (client) => {
          // email_verified + login_count are NOT NULL in prod with no DEFAULT —
          // omitting them violates the not-null constraint and blocks signup.
          const insertUserResult = await client.query(
            `INSERT INTO users (id, email, name, image, password_hash, role, is_active, email_verified, login_count, profile, preferences, created_at)
             VALUES ($1, $2, $3, $4, $5, $6::user_role, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (email) DO NOTHING RETURNING id`,
            [
              userId,
              email,
              data.name,
              data.image || null,
              user.passwordHash,
              primaryRole,
              true,
              true,
              0,
              JSON.stringify(user.profile),
              JSON.stringify(user.profile.preferences || {}),
              now,
            ],
          );

          if (!insertUserResult || insertUserResult.rowCount === 0) {
            // The email already exists (concurrent sign-in race or auth-cache miss).
            // Set the flag and return — withTransaction will COMMIT the no-op cleanly.
            conflictOccurred = true;
            return;
          }

          await client.query(
            `INSERT INTO user_profiles (user_id, name, dietary_preferences, birth_data, natal_chart, group_members, dining_groups)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id) DO UPDATE SET
               name = EXCLUDED.name,
               dietary_preferences = EXCLUDED.dietary_preferences,
               updated_at = CURRENT_TIMESTAMP`,
            [
              userId,
              data.name,
              JSON.stringify(data.profile?.dietaryPreferences || {}),
              JSON.stringify(data.profile?.birthData || {}),
              JSON.stringify(data.profile?.natalChart || {}),
              JSON.stringify(data.profile?.groupMembers || []),
              JSON.stringify(data.profile?.diningGroups || []),
            ],
          );

          // Seed token_balances and user_streaks per audit issue #9
          await client.query(
            `INSERT INTO token_balances (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
          await client.query(
            `INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
        });

        if (!conflictOccurred) {
          _logger.info("User created in PostgreSQL:", {
            userId,
            email: data.email,
          });
        }
      } catch (error) {
        _logger.error(
          "PostgreSQL user creation failed:",
          error,
        );
        throw new Error("Failed to create user in database", { cause: error });
      }

      // Resolve conflict outside the transaction to avoid nested pool connections.
      if (conflictOccurred) {
        const existing = await this.getUserByEmail(data.email);
        if (existing) {
          this.users.set(existing.id, existing);
          this.emailIndex.set(email, existing.id);
          _logger.info("createUser: conflict resolved — returned existing user:", { email });
          return existing;
        }
        throw new Error("createUser: conflict detected but existing user not found in DB");
      }
    }

    // Always update in-memory cache
    this.users.set(userId, user);
    this.emailIndex.set(email, userId);

    _logger.info("User created:", { userId, email });
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT u.*, up.name as profile_name, up.birth_data, up.natal_chart,
                  up.dietary_preferences, up.group_members, up.dining_groups, up.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.id = $1::uuid`,
          [userId],
        );

        if (result.rows.length > 0) {
          const row = result.rows[0];
          return this.rowToUserWithProfile(row);
        }
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error);
      }
    }

    // Fallback to in-memory
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();
    const normalizedEmail = email.toLowerCase();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT u.*, up.name as profile_name, up.birth_data, up.natal_chart,
                  up.dietary_preferences, up.group_members, up.dining_groups, up.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.email = $1`,
          [normalizedEmail],
        );

        if (result.rows.length > 0) {
          return this.rowToUserWithProfile(result.rows[0]);
        }
        return null; // Return null explicitly if not found in DB
      } catch (error) {
        _logger.error("PostgreSQL query failed in getUserByEmail:", error);
        throw new Error("Database lookup failed", { cause: error });
      }
    }

    // Fallback to in-memory
    const userId = this.emailIndex.get(normalizedEmail);
    return userId ? this.users.get(userId) || null : null;
  }

  /**
   * Idempotent upsert of an @agentic.alchm.kitchen agent identity.
   *
   * Mirrors the canonical Python implementation at
   * backend/alchm_kitchen/main.py POST /api/internal/agent-sync so a feed
   * POST and a sign-in fan-out produce identical DB state. Used by the
   * /api/feed POST handler to provision PA-emitted agents that haven't
   * been synced yet.
   *
   * Throws when called with an email outside the agentic namespace —
   * callers must guard before invoking.
   */
  async ensureAgent(
    email: string,
    displayName?: string,
  ): Promise<UserWithProfile> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith("@agentic.alchm.kitchen")) {
      throw new Error(
        `ensureAgent: refusing to auto-provision outside @agentic.alchm.kitchen namespace (got: ${normalizedEmail})`,
      );
    }

    const resolvedName =
      displayName?.trim() ||
      normalizedEmail
        .split("@")[0]
        .split("-")
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ") ||
      "Agent";

    if (!db) {
      // No DATABASE_URL — fall through to in-memory cache (build/test path).
      const existingId = this.emailIndex.get(normalizedEmail);
      if (existingId) {
        const existing = this.users.get(existingId);
        if (existing) {
          existing.isAgent = true;
          existing.profile.name ||= resolvedName;
          return existing;
        }
      }
      const userId = randomUUID();
      const now = new Date();
      const user: UserWithProfile = {
        id: userId,
        email: normalizedEmail,
        passwordHash: "AGENT_NO_LOGIN",
        roles: ["user" as UserRole],
        isActive: true,
        isAgent: true,
        createdAt: now,
        profile: {
          userId,
          name: resolvedName,
          email: normalizedEmail,
          preferences: {},
          groupMembers: [],
          diningGroups: [],
        },
      };
      this.users.set(userId, user);
      this.emailIndex.set(normalizedEmail, userId);
      return user;
    }

    const generatedId = randomUUID();
    try {
      await db.withTransaction(async (client) => {
        const insertUser = await client.query(
          `INSERT INTO users
             (id, email, password_hash, role, is_active, email_verified, is_agent,
              name, profile, preferences, login_count, created_at, updated_at)
           VALUES
             ($1, $2, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
              $3, $4::jsonb, '{}'::jsonb, 0, now(), now())
           ON CONFLICT (email) DO UPDATE
             SET is_agent   = true,
                 name       = COALESCE(EXCLUDED.name, users.name),
                 updated_at = now()
           RETURNING id`,
          [
            generatedId,
            normalizedEmail,
            resolvedName,
            JSON.stringify({
              email: normalizedEmail,
              isAgent: true,
              name: resolvedName,
            }),
          ],
        );
        if (insertUser.rowCount === 0) {
          throw new Error("ensureAgent: upsert returned no row");
        }
        const finalId = insertUser.rows[0].id as string;
        await client.query(
          `INSERT INTO user_profiles (user_id, name)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE
             SET name = COALESCE(EXCLUDED.name, user_profiles.name),
                 updated_at = CURRENT_TIMESTAMP`,
          [finalId, resolvedName],
        );
      });

      const fresh = await this.getUserByEmail(normalizedEmail);
      if (!fresh) {
        throw new Error(
          "ensureAgent: upsert succeeded but lookup returned no user",
        );
      }
      _logger.info("ensureAgent: agent provisioned/refreshed", {
        email: normalizedEmail,
        userId: fresh.id,
      });
      return fresh;
    } catch (error) {
      _logger.error("ensureAgent: failed to upsert agent", error);
      throw new Error("Failed to provision agent", { cause: error });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>,
    fallbackEmail?: string,
  ): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Get existing user
    const user = await this.getUserById(userId);
    if (!user) {
      // Fallback: try resolving by email (handles Google sub vs DB id mismatch)
      if (fallbackEmail) {
        const byEmail = await this.getUserByEmail(fallbackEmail);
        if (byEmail) {
          return this.updateUserProfile(byEmail.id, profileData, fallbackEmail);
        }
      }
      return null;
    }

    // Merge profile data
    const updatedProfile = {
      ...user.profile,
      ...profileData,
      userId, // Ensure userId doesn't change
    };
    updatedProfile.onboardingComplete =
      profileData.onboardingComplete ??
      updatedProfile.onboardingComplete ??
      !!(updatedProfile.birthData && updatedProfile.natalChart);
    user.profile = updatedProfile;

    // Try PostgreSQL first
    if (db) {
      try {
        // Only touch dietary_preferences when the caller actually provided one,
        // so general-preferences callers don't clobber the dietary column.
        const hasDietaryUpdate = Object.prototype.hasOwnProperty.call(
          profileData,
          "dietaryPreferences",
        );
        const onboardingComplete = updatedProfile.onboardingComplete === true;

        await db.withTransaction(async (client) => {
          await client.query(
            `UPDATE users SET profile = $2, preferences = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid`,
            [
              userId,
              JSON.stringify(updatedProfile),
              JSON.stringify(updatedProfile.preferences || {}),
            ],
          );

          if (hasDietaryUpdate) {
            await client.query(
              `INSERT INTO user_profiles (user_id, name, birth_data, natal_chart, dietary_preferences, group_members, dining_groups, onboarding_completed)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (user_id) DO UPDATE SET
                 name = EXCLUDED.name,
                 birth_data = EXCLUDED.birth_data,
                 natal_chart = EXCLUDED.natal_chart,
                 dietary_preferences = EXCLUDED.dietary_preferences,
                 group_members = EXCLUDED.group_members,
                 dining_groups = EXCLUDED.dining_groups,
                 onboarding_completed = EXCLUDED.onboarding_completed,
                 onboarding_completed_at = CASE WHEN EXCLUDED.onboarding_completed AND NOT COALESCE(user_profiles.onboarding_completed, false) THEN CURRENT_TIMESTAMP ELSE user_profiles.onboarding_completed_at END,
                 updated_at = CURRENT_TIMESTAMP`,
              [
                userId,
                updatedProfile.name || "",
                JSON.stringify(updatedProfile.birthData || {}),
                JSON.stringify(updatedProfile.natalChart || {}),
                JSON.stringify(updatedProfile.dietaryPreferences || {}),
                JSON.stringify(updatedProfile.groupMembers || []),
                JSON.stringify(updatedProfile.diningGroups || []),
                onboardingComplete,
              ],
            );
          } else {
            await client.query(
              `INSERT INTO user_profiles (user_id, name, birth_data, natal_chart, group_members, dining_groups, onboarding_completed)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (user_id) DO UPDATE SET
                 name = EXCLUDED.name,
                 birth_data = EXCLUDED.birth_data,
                 natal_chart = EXCLUDED.natal_chart,
                 group_members = EXCLUDED.group_members,
                 dining_groups = EXCLUDED.dining_groups,
                 onboarding_completed = EXCLUDED.onboarding_completed,
                 onboarding_completed_at = CASE WHEN EXCLUDED.onboarding_completed AND NOT COALESCE(user_profiles.onboarding_completed, false) THEN CURRENT_TIMESTAMP ELSE user_profiles.onboarding_completed_at END,
                 updated_at = CURRENT_TIMESTAMP`,
              [
                userId,
                updatedProfile.name || "",
                JSON.stringify(updatedProfile.birthData || {}),
                JSON.stringify(updatedProfile.natalChart || {}),
                JSON.stringify(updatedProfile.groupMembers || []),
                JSON.stringify(updatedProfile.diningGroups || []),
                onboardingComplete,
              ],
            );
          }
        });

        _logger.info("User profile updated in PostgreSQL:", { userId });
      } catch (error) {
        _logger.error("PostgreSQL profile update failed:", error);
        throw new Error("Failed to update profile in database", { cause: error });
      }
    }

    // Update in-memory cache
    this.users.set(userId, user);
    _logger.info("User profile updated:", { userId });
    return user;
  }

  /**
   * Update user authentication data
   */
  async updateUserAuth(
    userId: string,
    authData: { passwordHash?: string; lastLoginAt?: Date },
  ): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    if (authData.passwordHash) {
      user.passwordHash = authData.passwordHash;
    }
    if (authData.lastLoginAt) {
      user.lastLoginAt = authData.lastLoginAt;
    }

    // Try PostgreSQL first
    if (db) {
      try {
        const updates: string[] = [];
        const params: any[] = [userId];
        let paramIndex = 2;

        if (authData.passwordHash) {
          updates.push(`password_hash = $${paramIndex++}`);
          params.push(authData.passwordHash);
        }
        if (authData.lastLoginAt) {
          updates.push(`last_login_at = $${paramIndex++}`);
          params.push(authData.lastLoginAt);
          updates.push(`login_count = login_count + 1`);
        }

        if (updates.length > 0) {
          await db.executeQuery(
            `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            params,
          );
        }
      } catch (error) {
        _logger.error("PostgreSQL auth update failed:", error);
      }
    }

    // Update in-memory cache
    this.users.set(userId, user);
    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const user = await this.getUserById(userId);
    if (!user) {
      return false;
    }

    // Try PostgreSQL first
    if (db) {
      try {
        const primaryRole = (role as string).toUpperCase();
        await db.executeQuery(
          `UPDATE users SET role = $2::user_role, updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
          [userId, primaryRole],
        );
        _logger.info("User role updated in PostgreSQL:", { userId, role });
      } catch (error) {
        _logger.error("PostgreSQL role update failed:", error);
        return false;
      }
    }

    // Update in-memory cache
    user.roles = [role, "user" as UserRole];
    this.users.set(userId, user);
    return true;
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT onboarding_completed FROM user_profiles WHERE user_id = $1`,
          [userId],
        );
        if (result.rows.length > 0) {
          return result.rows[0].onboarding_completed === true;
        }
      } catch (error) {
        _logger.warn("PostgreSQL query failed:", error);
      }
    }

    // Fallback to in-memory
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    return !!(user.profile.birthData && user.profile.natalChart);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<boolean> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const user = await this.getUserById(userId);
    if (!user) {
      return false;
    }

    // Try PostgreSQL first
    if (db) {
      try {
        await db.executeQuery(
          `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [userId],
        );
      } catch (error) {
        _logger.error("PostgreSQL deactivation failed:", error);
      }
    }

    // Update in-memory
    user.isActive = false;
    this.users.set(userId, user);
    _logger.info("User deactivated:", { userId });
    return true;
  }

  /**
   * Get the total number of active users
   */
  async getUserCount(): Promise<number> {
    await this.ensureInitialized();
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          "SELECT COUNT(*) as count FROM users WHERE is_active = true",
        );
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        _logger.warn("PostgreSQL count failed:", error);
      }
    }

    return this.users.size;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserWithProfile[]> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT u.*, up.name as profile_name, up.birth_data, up.natal_chart,
                  up.dietary_preferences, up.group_members, up.dining_groups, up.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.is_active = true
           ORDER BY u.created_at DESC`,
        );

        return result.rows.map((row: any) => this.rowToUserWithProfile(row));
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error);
      }
    }

    // Fallback to in-memory
    return Array.from(this.users.values());
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    await this.ensureInitialized();
    const db = await getDbModule();
    const normalizedEmail = email.toLowerCase();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
          [normalizedEmail],
        );
        return result.rows.length > 0;
      } catch (error) {
        _logger.warn("PostgreSQL query failed:", error);
      }
    }

    // Fallback to in-memory
    return this.emailIndex.has(normalizedEmail);
  }

  /**
   * Get user by Privy DID
   */
  async getUserByPrivyDid(privyDid: string): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT u.*, up.name as profile_name, up.birth_data, up.natal_chart,
                  up.dietary_preferences, up.group_members, up.dining_groups, up.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.privy_did = $1`,
          [privyDid],
        );

        if (result.rows.length > 0) {
          return this.rowToUserWithProfile(result.rows[0]);
        }
        return null;
      } catch (error) {
        _logger.error("PostgreSQL query failed in getUserByPrivyDid:", error);
        throw new Error("Database lookup by Privy DID failed", { cause: error });
      }
    }

    // Fallback to in-memory
    return Array.from(this.users.values()).find((u) => u.privyDid === privyDid) || null;
  }

  /**
   * Link a user with a Privy DID
   */
  async linkUserPrivyDid(userId: string, privyDid: string): Promise<void> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Check for existing linkage to a different user
    const existingUser = await this.getUserByPrivyDid(privyDid);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Conflict: Privy DID is already linked to a different account");
    }

    if (db) {
      try {
        await db.executeQuery(
          `UPDATE users SET privy_did = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
          [userId, privyDid],
        );
        _logger.info("Privy DID linked in PostgreSQL:", { userId, privyDid });
      } catch (error) {
        _logger.error("PostgreSQL linking failed in linkUserPrivyDid:", error);
        throw new Error("Failed to link Privy DID in database", { cause: error });
      }
    }

    // Always update in-memory fallback
    const user = this.users.get(userId);
    if (user) {
      user.privyDid = privyDid;
    }
  }

  /**
   * Convert database row to UserWithProfile object
   */
  private rowToUserWithProfile(row: any): UserWithProfile {
    // Guarded JSON parsing: these are JSONB columns (node-postgres usually returns
    // them pre-parsed), but a text-typed or double-encoded value would otherwise
    // throw here and turn one corrupt row into a silent auth/profile-load outage.
    const birthData =
      typeof row.birth_data === "string"
        ? safeJsonParse(row.birth_data)
        : row.birth_data;
    const natalChart =
      typeof row.natal_chart === "string"
        ? safeJsonParse(row.natal_chart)
        : row.natal_chart;
    const dietaryPreferences =
      typeof row.dietary_preferences === "string"
        ? safeJsonParse(row.dietary_preferences, {})
        : row.dietary_preferences || {};
    // users.preferences is the canonical store for general preferences.
    // For legacy rows where general prefs were written to dietary_preferences,
    // fall back to that column if users.preferences is empty.
    const rawUserPrefs =
      typeof row.preferences === "string"
        ? safeJsonParse(row.preferences, {})
        : row.preferences || {};
    const preferences =
      Object.keys(rawUserPrefs || {}).length > 0
        ? rawUserPrefs
        : dietaryPreferences;
    const groupMembers =
      typeof row.group_members === "string"
        ? safeJsonParse(row.group_members, [])
        : row.group_members || [];
    const diningGroups =
      typeof row.dining_groups === "string"
        ? safeJsonParse(row.dining_groups, [])
        : row.dining_groups || [];

    // Map single 'role' ENUM column back to roles array
    const dbRole = (row.role || "USER").toUpperCase();
    const roles =
      dbRole === "ADMIN" ? ["admin", "user"] : ["user"];

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      roles: roles as UserRole[],
      isActive: row.is_active,
      isAgent: row.is_agent === true,
      privyDid: row.privy_did || undefined,
      createdAt: new Date(row.created_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      profile: {
        userId: row.id,
        name: row.profile_name || row.name,
        email: row.email,
        preferences,
        dietaryPreferences,
        onboardingComplete: row.onboarding_completed === true,
        birthData:
          Object.keys(birthData || {}).length > 0 ? birthData : undefined,
        natalChart:
          Object.keys(natalChart || {}).length > 0 ? natalChart : undefined,
        groupMembers,
        diningGroups,
      },
    };
  }
}

// Export singleton instance
export const userDatabase = new UserDatabaseService();
