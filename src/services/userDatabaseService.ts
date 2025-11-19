/**
 * User Database Service
 * Manages user profiles with birth data, natal charts, and preferences
 * Currently uses in-memory storage; can be upgraded to a real database
 */

import type { UserProfile } from "@/contexts/UserContext";
import type { User, UserRole } from "@/lib/auth/jwt-auth";
import { _logger } from "@/lib/logger";

// Extended User type with profile data
export interface UserWithProfile extends User {
  profile: UserProfile;
}

class UserDatabaseService {
  private users: Map<string, UserWithProfile> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  constructor() {
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default users (including admin)
   */
  private initializeDefaultUsers(): void {
    const currentTime = new Date();

    // Admin user: xalchm@gmail.com
    const adminUser: UserWithProfile = {
      id: "user_admin_001",
      email: "xalchm@gmail.com",
      passwordHash: "TEMP_NO_PASSWORD", // Will be set during onboarding
      roles: ["admin" as UserRole, "user" as UserRole],
      isActive: true,
      createdAt: currentTime,
      profile: {
        userId: "user_admin_001",
        name: "Admin User",
        email: "xalchm@gmail.com",
        preferences: {},
        // Birth data will be set during onboarding
      },
    };

    this.users.set(adminUser.id, adminUser);
    this.emailIndex.set(adminUser.email, adminUser.id);

    _logger.info("User database initialized with admin user");
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
    // Check if email already exists
    if (this.emailIndex.has(data.email)) {
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

    this.users.set(userId, user);
    this.emailIndex.set(data.email, userId);

    _logger.info("User created:", { userId, email: data.email });
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserWithProfile | null> {
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserWithProfile | null> {
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
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    user.profile = {
      ...user.profile,
      ...profileData,
      userId, // Ensure userId doesn't change
    };

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
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    if (authData.passwordHash) {
      user.passwordHash = authData.passwordHash;
    }
    if (authData.lastLoginAt) {
      user.lastLoginAt = authData.lastLoginAt;
    }

    this.users.set(userId, user);
    return user;
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    // User has completed onboarding if they have birth data
    return !!(user.profile.birthData && user.profile.natalChart);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    user.isActive = false;
    this.users.set(userId, user);
    _logger.info("User deactivated:", { userId });
    return true;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserWithProfile[]> {
    return Array.from(this.users.values());
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.emailIndex.has(email);
  }
}

// Export singleton instance
export const userDatabase = new UserDatabaseService();
