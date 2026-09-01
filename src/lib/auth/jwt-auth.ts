/**
 * JWT Authentication Service for alchm.kitchen Backend
 * Implements secure token-based authentication with role-based access control
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "@/utils/logger";
import { UserRole, ROLE_PERMISSIONS } from "./roles";

// Re-export so existing consumers don't break
export { UserRole, ROLE_PERMISSIONS };
export type { RolePermissions } from "./roles";

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRole[];
  scopes: string[];
  iat: number;
  exp: number;
  iss: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  isActive: boolean;
  privyDid?: string;
  walletAddress?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class JWTAuthService {
  private readonly config: AuthConfig;
  private readonly users: Map<string, User> = new Map();

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(
    email: string,
    password: string,
  ): Promise<AuthTokens | null> {
    try {
      const user = this.users.get(email);

      if (!user?.isActive) {
        logger.warn("Authentication failed: user not found or inactive", {
          email,
        });
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn("Authentication failed: invalid password", { email });
        return null;
      }

      // Update last login
      user.lastLoginAt = new Date();

      // Generate tokens
      const tokens = this.generateTokens(user);

      logger.info("User authenticated successfully", {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      return tokens;
    } catch (error) {
      logger.error("Authentication error", { email, error });
      return null;
    }
  }

  /**
   * Generate access and refresh tokens for user
   */
  generateTokens(user: User): AuthTokens {
    const scopes = this.getRoleScopes(user.roles);

    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      scopes,
    };

    const accessToken = jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.tokenExpiry as jwt.SignOptions["expiresIn"],
      issuer: this.config.issuer,
      audience: "alchm.kitchen",
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: "refresh" },
      this.config.jwtSecret,
      {
        expiresIn: this.config.refreshTokenExpiry as jwt.SignOptions["expiresIn"],
        issuer: this.config.issuer,
        audience: "alchm.kitchen",
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.config.tokenExpiry),
    };
  }

  /**
   * Validate JWT token and return payload
   */
  validateToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret, {
        issuer: this.config.issuer,
        audience: "alchm.kitchen",
      }) as unknown as TokenPayload;

      // Verify user still exists and is active
      const user = Array.from(this.users.values()).find(
        (u) => u.id === decoded.userId,
      );
      if (!user?.isActive) {
        logger.warn("Token validation failed: user inactive or deleted", {
          userId: decoded.userId,
        });
        return null;
      }

      return decoded;
    } catch (error) {
      logger.warn("Token validation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): AuthTokens | null {
    try {
      const decoded = jwt.verify(refreshToken, this.config.jwtSecret, {
        issuer: this.config.issuer,
        audience: "alchm.kitchen",
      }) as unknown as { userId?: string; type?: string };

      if (decoded.type !== "refresh" || !decoded.userId) {
        logger.warn("Invalid refresh token type");
        return null;
      }

      const user = Array.from(this.users.values()).find(
        (u) => u.id === decoded.userId,
      );
      if (!user?.isActive) {
        logger.warn(
          "Refresh token validation failed: user inactive or deleted",
          { userId: decoded.userId },
        );
        return null;
      }

      return this.generateTokens(user);
    } catch (error) {
      logger.warn("Refresh token validation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Check if user has required permission
   */
  hasPermission(userRoles: UserRole[], requiredPermission: string): boolean {
    const userScopes = this.getRoleScopes(userRoles);

    return userScopes.some((scope) => {
      // Exact match
      if (scope === requiredPermission) return true;
      // Wildcard match (e.g., 'alchemical:*' matches 'alchemical:calculate')
      if (scope.endsWith(":*")) {
        const prefix = scope.slice(0, -1); // Remove '*'
        return requiredPermission.startsWith(prefix);
      }

      return false;
    });
  }

  /**
   * Get all scopes for given roles
   */
  private getRoleScopes(roles: UserRole[]): string[] {
    const scopes = new Set<string>();

    roles.forEach((role) => {
      ROLE_PERMISSIONS[role].forEach((permission) => {
        scopes.add(permission);
      });
    });

    return Array.from(scopes);
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const [, rawValue, unit] = match;
    if (rawValue === undefined) return 3600;
    const value = parseInt(rawValue, 10);

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 3600;
    }
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(
    email: string,
    password: string,
    roles: UserRole[],
  ): Promise<User | null> {
    try {
      if (this.users.has(email)) {
        logger.warn("User creation failed: email already exists", { email });
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        passwordHash,
        roles,
        isActive: true,
        createdAt: new Date(),
      };

      this.users.set(email, user);

      logger.info("User created successfully", {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      return user;
    } catch (error) {
      logger.error("User creation error", { email, error });
      return null;
    }
  }

  /**
   * Deactivate user (admin only)
   */
  deactivateUser(userId: string): boolean {
    try {
      const user = Array.from(this.users.values()).find((u) => u.id === userId);
      if (!user) {
        logger.warn("User deactivation failed: user not found", { userId });
        return false;
      }

      user.isActive = false;

      logger.info("User deactivated successfully", {
        userId,
        email: user.email,
      });
      return true;
    } catch (error) {
      logger.error("User deactivation error", { userId, error });
      return false;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    return Array.from(this.users.values()).find((u) => u.id === userId) ?? null;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    return this.users.get(email) ?? null;
  }
}

// Export singleton instance with lazy initialization
let _authService: JWTAuthService | null = null;

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required. Set this to a secure random string in production.",
    );
  }
  return secret;
}

function getAuthService(): JWTAuthService {
  _authService ??= new JWTAuthService({
    jwtSecret: getJWTSecret(),
    tokenExpiry: "1h",
    refreshTokenExpiry: "7d",
    issuer: "alchm.kitchen",
  });
  return _authService;
}

export const authService = new Proxy({} as JWTAuthService, {
  get(_target, prop, receiver): unknown {
    const service = getAuthService();
    const value = Reflect.get(service, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(service);
    }
    return value;
  },
});

export default authService;
