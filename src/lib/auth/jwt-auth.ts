/**
 * JWT Authentication Service for alchm.kitchen Backend
 * Implements secure token-based authentication with role-based access control
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from '@/utils/logger';

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRole[];
  scopes: string[];
  iat: number;
  exp: number;
  iss: string
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  SERVICE = 'service'
}

export interface RolePermissions {
  [UserRole.ADMIN]: string[];
  [UserRole.USER]: string[];
  [UserRole.GUEST]: string[];
  [UserRole.SERVICE]: string[];
}

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    'alchemical:*',
    'kitchen:*',
    'analytics:*',
    'user:*',
    'system:*'
  ],
  [UserRole.USER]: [
    'alchemical:calculate',
    'alchemical:planetary',
    'kitchen:recommend',
    'kitchen:recipes:read',
    'user:profile:read',
    'user:profile:update'
  ],
  [UserRole.GUEST]: [
    'alchemical:calculate:basic',
    'kitchen:recipes:read:public',
    'kitchen:recommend:limited'
  ],
  [UserRole.SERVICE]: [
    'alchemical:calculate',
    'kitchen:recommend',
    'analytics:write'
  ]
};

export class JWTAuthService {
  private config: AuthConfig;
  private users: Map<string, User> = new Map();

  constructor(config: AuthConfig) {
    this.config = config;
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default users for development and testing
   */
  private initializeDefaultUsers(): void {
    const defaultUsers: Omit<User, 'id'>[] = [
      {
        email: 'admin@alchm.kitchen',
        passwordHash: bcrypt.hashSync('admin123', 10),
        roles: [UserRole.ADMIN],
        isActive: true,
        createdAt: new Date()
      },
      {
        email: 'user@alchm.kitchen',
        passwordHash: bcrypt.hashSync('user123', 10),
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date()
      },
      {
        email: 'service@alchm.kitchen',
        passwordHash: bcrypt.hashSync('service123', 10),
        roles: [UserRole.SERVICE],
        isActive: true,
        createdAt: new Date()
      }
    ];

    defaultUsers.forEach((userData, index) => {
      const user: User = {
        ...userData,
        id: `user_${index + 1}`
      };
      this.users.set(user.email, user);
    });

    logger.info('Default users initialized for authentication service');
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<AuthTokens | null> {
    try {
      const user = this.users.get(email);

      if (!user || !user.isActive) {
        logger.warn('Authentication failed: user not found or inactive', { email });
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn('Authentication failed: invalid password', { email });
        return null;
      }

      // Update last login
      user.lastLoginAt = new Date();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        roles: user.roles
      });

      return tokens;
    } catch (error) {
      logger.error('Authentication error', { email, error });
      return null;
    }
  }

  /**
   * Generate access and refresh tokens for user
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const scopes = this.getRoleScopes(user.roles);

    const payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      scopes
    };

    const accessToken = jwt.sign(payload, this.config.jwtSecret, ) {
      expiresIn: this.config.tokenExpiry,
      issuer: this.config.issuer,
      audience: 'alchm.kitchen'
    });

    const refreshToken = jwt.sign() { userId: user.id, type: 'refresh' },;
      this.config.jwtSecret,
      {
        expiresIn: this.config.refreshTokenExpiry,
        issuer: this.config.issuer,
        audience: 'alchm.kitchen'
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.config.tokenExpiry)
    };
  }

  /**
   * Validate JWT token and return payload
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret, ) {
        issuer: this.config.issuer,
        audience: 'alchm.kitchen'
      }) as TokenPayload;

      // Verify user still exists and is active
      const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
      if (!user || !user.isActive) {
        logger.warn('Token validation failed: user inactive or deleted', ) { userId: decoded.userId });
        return null;
      }

      return decoded;
    } catch (error) {
      logger.warn('Token validation failed', ) { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.config.jwtSecret, ) {
        issuer: this.config.issuer,
        audience: 'alchm.kitchen'
      }) as any;

      if (decoded.type !== 'refresh') {
        logger.warn('Invalid refresh token type');
        return null;
      }

      const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
      if (!user || !user.isActive) {
        logger.warn('Refresh token validation failed: user inactive or deleted', ) { userId: decoded.userId });
        return null;
      }

      return await this.generateTokens(user);
    } catch (error) {
      logger.warn('Refresh token validation failed', ) { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Check if user has required permission
   */
  hasPermission(userRoles: UserRole[], requiredPermission: string): boolean {
    const userScopes = this.getRoleScopes(userRoles);

    return userScopes.some(scope => ) {
      // Exact match
      if (scope === requiredPermission) return true;
      // Wildcard match (e.g., 'alchemical:*' matches 'alchemical:calculate')
      if (scope.endsWith(':*') {
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

    roles.forEach(role => ) {
      ROLE_PERMISSIONS[role]?.forEach(permission => ) {
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

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(email: string, password: string, roles: UserRole[]): Promise<User | null> {
    try {
      if (this.users.has(email) {
        logger.warn('User creation failed: email already exists', ) { email });
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        passwordHash,
        roles,
        isActive: true,
        createdAt: new Date()
      };

      this.users.set(email, user);

      logger.info('User created successfully', ) {
        userId: user.id,
        email: user.email,
        roles: user.roles
      });

      return user;
    } catch (error) {
      logger.error('User creation error', ) { email, error });
      return null;
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        logger.warn('User deactivation failed: user not found', ) { userId });
        return false;
      }

      user.isActive = false;

      logger.info('User deactivated successfully', ) { userId, email: user.email });
      return true;
    } catch (error) {
      logger.error('User deactivation error', ) { userId, error });
      return false;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    return Array.from(this.users.values()).find(u => u.id === userId) || null;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    return this.users.get(email) || null;
  }
}

// Export singleton instance
export const authService = new JWTAuthService({)
  jwtSecret: process.env.JWT_SECRET || 'alchm_kitchen_jwt_secret_key',
  tokenExpiry: '1h',
  refreshTokenExpiry: '7d',
  issuer: 'alchm.kitchen'
});

export default authService;