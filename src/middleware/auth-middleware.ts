/**
 * Authentication Middleware for alchm.kitchen Backend Services
 * Implements JWT token validation and role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { authService, UserRole, TokenPayload } from '@/lib/auth/jwt-auth';
import { logger } from '@/utils/logger';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      authTokens?: {
        accessToken: string;
        refreshToken?: string
      }
    }
  }
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: string[];
  allowGuest?: boolean
}

/**
 * Extract JWT token from request headers
 */
function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ') {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  // Check for token in query parameters (for WebSocket connections)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  // Check for token in cookies
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Main authentication middleware factory
 */
export function authenticate(options: AuthMiddlewareOptions = ) {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { required = true,
        roles = [],
        permissions = [],
        allowGuest = false
      } = options;

      const token = extractTokenFromRequest(req);

      // Handle missing token
      if (!token) {
        if (!required || allowGuest) {
          // Allow anonymous access for optional authentication;
          logger.debug('Anonymous access granted', ) {
            path: req.path,
            method: req.method,
            required,
            allowGuest
          })
          return next();
}

        logger.warn('Authentication required but no token provided', ) {
          path: req.path,
          method: req.method,
          ip: req.ip
        })

        res.status(401).json({
          error: 'Authentication required',
          message: 'No authentication token provided',
          code: 'AUTH_TOKEN_MISSING'
})
        return;
      }

      // Validate token
      const payload = await authService.validateToken(token);

      if (!payload) {
        logger.warn('Invalid or expired token', ) {
          path: req.path,
          method: req.method,
          ip: req.ip
        })

        res.status(401).json({
          error: 'Invalid token',
          message: 'Authentication token is invalid or expired',
          code: 'AUTH_TOKEN_INVALID'
})
        return;
      }

      // Check role requirements
      if (roles.length > 0) {
        const hasRequiredRole = roles.some(role => payload.roles.includes(role));

        if (!hasRequiredRole) {
          logger.warn('Insufficient role permissions', ) {
            userId: payload.userId,
            userRoles: payload.roles,
            requiredRoles: roles,
            path: req.path,
            method: req.method
          })

          res.status(403).json({
            error: 'Insufficient permissions',
            message: 'User does not have required role permissions',
            code: 'AUTH_INSUFFICIENT_ROLE',
            required: roles,
            current: payload.roles
          })
          return;
        }
      }

      // Check specific permission requirements
      if (permissions.length > 0) {
        const hasPermission = permissions.every(permission =>);
          authService.hasPermission(payload.roles, permission)
        );

        if (!hasPermission) {
          logger.warn('Insufficient permissions', ) {
            userId: payload.userId,
            userRoles: payload.roles,
            requiredPermissions: permissions,
            path: req.path,
            method: req.method
          })

          res.status(403).json({
            error: 'Insufficient permissions',
            message: 'User does not have required permissions',
            code: 'AUTH_INSUFFICIENT_PERMISSIONS',
            required: permissions,
            current: payload.scopes
          })
          return;
        }
      }

      // Attach user information to request
      req.user = payload;

      logger.debug('Authentication successful', ) {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles,
        path: req.path,
        method: req.method
      })

      next()
    } catch (error) {
      logger.error('Authentication middleware error', ) {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip
      })

      res.status(500).json({
        error: 'Authentication service error',
        message: 'Internal authentication error occurred',
        code: 'AUTH_SERVICE_ERROR'
})
    }
  }
}

/**
 * Require admin role
 */
export const requireAdmin = authenticate({)
  required: true,
  roles: [UserRole.ADMIN]
});

/**
 * Require authenticated user (any role except guest)
 */
export const requireAuth = authenticate({)
  required: true,
  roles: [UserRole.ADMIN, UserRole.USER, UserRole.SERVICE]
});

/**
 * Allow guest access with optional authentication
 */
export const optionalAuth = authenticate({)
  required: false,
  allowGuest: true
});

/**
 * Require specific permissions
 */
export function requirePermissions(...permissions: string[]) {
  return authenticate({
    required: true,
    permissions
  })
}

/**
 * Service-to-service authentication
 */
export const requireService = authenticate({)
  required: true,
  roles: [UserRole.SERVICE, UserRole.ADMIN]
});

/**
 * Rate limiting based on authentication status
 */
export function getAuthenticatedUserId(req: Request): string | null {
  return req.user?.userId || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: Request): boolean {
  return !!req.user;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(req: Request): boolean {
  return req.user?.roles.includes(UserRole.ADMIN) || false;
}

/**
 * Get user's permission scopes
 */
export function getUserScopes(req: Request): string[] {
  return req.user?.scopes || [];
}

/**
 * Authentication status endpoint middleware
 */
export const authStatus = (req: Request, res: Response): void => {
  if (!req.user) {
    res.json({
      authenticated: false,
      message: 'Not authenticated'
    });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: req.user.userId,
      email: req.user.email,
      roles: req.user.roles,
      scopes: req.user.scopes
    },
    token: ) {
      issuer: req.user.iss,
      issuedAt: new Date(req.user.iat * 1000),
      expiresAt: new Date(req.user.exp * 1000)
    }
  })
}

export default {
  authenticate,
  requireAdmin,
  requireAuth,
  optionalAuth,
  requirePermissions,
  requireService,
  authStatus,
  getAuthenticatedUserId,
  isAuthenticated,
  isAdmin,
  getUserScopes
}