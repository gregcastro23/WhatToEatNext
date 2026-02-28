/**
 * User Database Service
 * Manages user profiles with birth data, natal charts, and preferences
 * Uses PostgreSQL for persistent storage with in-memory fallback
 */

import type { UserProfile } from "@/contexts/UserContext";
import type { User, UserRole } from "@/lib/auth/jwt-auth";
import { _logger } from "@/lib/logger";

// Extended User type with profile data
export interface UserWithProfile extends User {
  profile: UserProfile;
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
    } catch (error) {
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
    passwordHash?: string;
    roles?: UserRole[];
    profile?: Partial<UserProfile>;
  }): Promise<UserWithProfile> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Check if email already exists
    if (await this.emailExists(data.email)) {
      throw new Error("User with this email already exists");
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const user: UserWithProfile = {
      id: userId,
      email: data.email,
      passwordHash: data.passwordHash || "TEMP_NO_PASSWORD",
      roles: data.roles || ["user" as UserRole],
      isActive: true,
      createdAt: now,
      profile: {
        userId,
        name: data.name,
        email: data.email,
        preferences: {},
        groupMembers: [],
        diningGroups: [],
        ...data.profile,
      },
    };

    // Try PostgreSQL first
    if (db) {
      try {
        // Insert into users table (uses single 'role' ENUM column per migration 07)
        const primaryRole = user.roles.includes("admin" as UserRole)
          ? "ADMIN"
          : "USER";
        await db.executeQuery(
          `INSERT INTO users (id, email, password_hash, role, is_active, profile, preferences, created_at)
           VALUES ($1, $2, $3, $4::user_role, $5, $6, $7, $8)`,
          [
            userId,
            data.email,
            user.passwordHash,
            primaryRole,
            true,
            JSON.stringify(user.profile),
            JSON.stringify(user.profile.preferences || {}),
            now,
          ],
        );

        // Insert into user_profiles table
        await db.executeQuery(
          `INSERT INTO user_profiles (user_id, name, dietary_preferences, birth_data, natal_chart, group_members, dining_groups)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO UPDATE SET
             name = EXCLUDED.name,
             dietary_preferences = EXCLUDED.dietary_preferences,
             updated_at = CURRENT_TIMESTAMP`,
          [
            userId,
            data.name,
            JSON.stringify(user.profile.preferences || {}),
            JSON.stringify(data.profile?.birthData || {}),
            JSON.stringify(data.profile?.natalChart || {}),
            JSON.stringify(data.profile?.groupMembers || []),
            JSON.stringify(data.profile?.diningGroups || []),
          ],
        );

        _logger.info("User created in PostgreSQL:", {
          userId,
          email: data.email,
        });
      } catch (error) {
        _logger.error(
          "PostgreSQL user creation failed, using in-memory:",
          error as any,
        );
        // Fall through to in-memory storage
      }
    }

    // Always update in-memory cache
    this.users.set(userId, user);
    this.emailIndex.set(data.email, userId);

    _logger.info("User created:", { userId, email: data.email });
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
           WHERE u.id = $1`,
          [userId],
        );

        if (result.rows.length > 0) {
          const row = result.rows[0];
          return this.rowToUserWithProfile(row);
        }
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error as any);
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

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT u.*, up.name as profile_name, up.birth_data, up.natal_chart,
                  up.dietary_preferences, up.group_members, up.dining_groups, up.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.email = $1`,
          [email],
        );

        if (result.rows.length > 0) {
          return this.rowToUserWithProfile(result.rows[0]);
        }
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error as any);
      }
    }

    // Fallback to in-memory
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserWithProfile | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Get existing user
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    // Merge profile data
    const updatedProfile = {
      ...user.profile,
      ...profileData,
      userId, // Ensure userId doesn't change
    };
    user.profile = updatedProfile;

    // Try PostgreSQL first
    if (db) {
      try {
        // Update users table profile JSONB
        await db.executeQuery(
          `UPDATE users SET profile = $2, preferences = $3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [
            userId,
            JSON.stringify(updatedProfile),
            JSON.stringify(updatedProfile.preferences || {}),
          ],
        );

        // Update user_profiles table
        await db.executeQuery(
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
             onboarding_completed_at = CASE WHEN EXCLUDED.onboarding_completed AND NOT user_profiles.onboarding_completed THEN CURRENT_TIMESTAMP ELSE user_profiles.onboarding_completed_at END,
             updated_at = CURRENT_TIMESTAMP`,
          [
            userId,
            updatedProfile.name || "",
            JSON.stringify(updatedProfile.birthData || {}),
            JSON.stringify(updatedProfile.natalChart || {}),
            JSON.stringify(updatedProfile.preferences || {}),
            JSON.stringify(updatedProfile.groupMembers || []),
            JSON.stringify(updatedProfile.diningGroups || []),
            !!(updatedProfile.birthData && updatedProfile.natalChart),
          ],
        );

        _logger.info("User profile updated in PostgreSQL:", { userId });
      } catch (error) {
        _logger.error("PostgreSQL profile update failed:", error as any);
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
        _logger.error("PostgreSQL auth update failed:", error as any);
      }
    }

    // Update in-memory cache
    this.users.set(userId, user);
    return user;
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
        _logger.warn("PostgreSQL query failed:", error as any);
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
        _logger.error("PostgreSQL deactivation failed:", error as any);
      }
    }

    // Update in-memory
    user.isActive = false;
    this.users.set(userId, user);
    _logger.info("User deactivated:", { userId });
    return true;
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
        _logger.warn("PostgreSQL query failed, using in-memory:", error as any);
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

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
          [email],
        );
        return result.rows.length > 0;
      } catch (error) {
        _logger.warn("PostgreSQL query failed:", error as any);
      }
    }

    // Fallback to in-memory
    return this.emailIndex.has(email);
  }

  /**
   * Convert database row to UserWithProfile object
   */
  private rowToUserWithProfile(row: any): UserWithProfile {
    const birthData =
      typeof row.birth_data === "string"
        ? JSON.parse(row.birth_data)
        : row.birth_data;
    const natalChart =
      typeof row.natal_chart === "string"
        ? JSON.parse(row.natal_chart)
        : row.natal_chart;
    const preferences =
      typeof row.dietary_preferences === "string"
        ? JSON.parse(row.dietary_preferences)
        : row.dietary_preferences || row.preferences || {};
    const groupMembers =
      typeof row.group_members === "string"
        ? JSON.parse(row.group_members)
        : row.group_members || [];
    const diningGroups =
      typeof row.dining_groups === "string"
        ? JSON.parse(row.dining_groups)
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
      createdAt: new Date(row.created_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      profile: {
        userId: row.id,
        name: row.profile_name || row.name,
        email: row.email,
        preferences,
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
