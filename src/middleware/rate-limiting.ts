/**
 * Rate Limiting Middleware for alchm.kitchen Backend Services
 * Implements authentication-aware rate limiting with different tiers
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';
import { getAuthenticatedUserId, isAdmin } from './auth-middleware';
import { UserRole } from '@/lib/auth/jwt-auth';
import { logger } from '@/utils/logger';

export interface RateLimitTier {
  windowMs: number,
  max: number,
  message: string,
  standardHeaders: boolean,
  legacyHeaders: boolean
}

/**
 * Rate limit configurations for different user tiers
 */
export const rateLimitTiers: Record<string, RateLimitTier> = {
  // Anonymous/guest users - most restrictive
  anonymous: {
    windowMs: 15 * 60 * 1000, // 15 minutes,
    max: 50, // 50 requests per 15 minutes,
    message: 'Rate limit exceeded for anonymous users. Please authenticate for higher limits.',
    standardHeaders: true,
    legacyHeaders: false
},
  // Authenticated users - moderate limits
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes,
    max: 500, // 500 requests per 15 minutes,
    message: 'Rate limit exceeded for authenticated users.',
    standardHeaders: true,
    legacyHeaders: false
},
  // Premium/paying users - higher limits
  premium: {
    windowMs: 15 * 60 * 1000, // 15 minutes,
    max: 2000, // 2000 requests per 15 minutes,
    message: 'Rate limit exceeded for premium users.',
    standardHeaders: true,
    legacyHeaders: false
},
  // Admin users - very high limits
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes,
    max: 10000, // 10000 requests per 15 minutes,
    message: 'Rate limit exceeded for admin users.',
    standardHeaders: true,
    legacyHeaders: false
},
  // Service-to-service communication - highest limits
  service: {
    windowMs: 15 * 60 * 1000, // 15 minutes,
    max: 50000, // 50000 requests per 15 minutes,
    message: 'Rate limit exceeded for service communication.',
    standardHeaders: true,
    legacyHeaders: false
},
  // Strict limits for sensitive operations
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hour,
    max: 10, // 10 requests per hour,
    message: 'Rate limit exceeded for sensitive operations.',
    standardHeaders: true,
    legacyHeaders: false
}
}

/**
 * Endpoint-specific rate limits
 */
export const endpointLimits: Record<string, Partial<RateLimitTier>> = {
  // Authentication endpoints - prevent brute force
  '/auth/login': {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes,
    message: 'Too many login attempts. Please try again later.'
},
  '/auth/register': {
    windowMs: 60 * 60 * 1000,
    max: 3, // 3 registration attempts per hour,
    message: 'Too many registration attempts. Please try again later.'
}

  // Password reset - prevent abuse
  '/auth/reset-password': {
    windowMs: 60 * 60 * 1000,
    max: 3, // 3 password reset attempts per hour,
    message: 'Too many password reset attempts. Please try again later.'
}

  // Heavy computation endpoints
  '/calculate/complex': {
    windowMs: 60 * 1000,
    max: 10, // 10 complex calculations per minute,
    message: 'Too many complex calculations. Please wait before trying again.'
}

  // Recipe recommendations - moderate limits
  '/recommend/recipes': {
    windowMs: 60 * 1000,
    max: 30, // 30 recommendations per minute,
    message: 'Too many recommendation requests. Please wait before trying again.'
}
}

/**
 * Create a key generator that considers authentication status
 */
function createKeyGenerator() {
  return (req: Request): string => {
    const userId = getAuthenticatedUserId(req);
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    if (userId) {
      return `auth: ${userId}`
}

    return `anon: ${ip}`
}
}

/**
 * Determine rate limit tier based on user authentication and roles
 */
function determineRateLimitTier(req: Request): RateLimitTier {
  const user = req.user;

  if (!user) {
    return rateLimitTiers.anonymous;
  }

  // Check for admin role
  if (user.roles.includes(UserRole.ADMIN)) {
    return rateLimitTiers.admin;
  }

  // Check for service role
  if (user.roles.includes(UserRole.SERVICE)) {
    return rateLimitTiers.service;
  }

  // Check for premium user (could be determined by subscription status)
  // For now, treat all authenticated users as premium
  if (user.roles.includes(UserRole.USER)) {
    return rateLimitTiers.premium;
  }

  return rateLimitTiers.authenticated;
}

/**
 * Create adaptive rate limiter that adjusts based on authentication
 */
export function createAdaptiveRateLimit(baseTier?: string): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // Default window,
    max: (req: Request) => {
      const tier = baseTier ? rateLimitTiers[baseTier] : determineRateLimitTier(req);
      return tier.max;
    },
    message: (req: Request) => {
      const tier = baseTier ? rateLimitTiers[baseTier] : determineRateLimitTier(req)
      return {;
        error: 'Rate limit exceeded',
        message: tier.message,
        retryAfter: Math.ceil(tier.windowMs / 1000),
        limit: tier.max,
        userTier: req.user ? 'authenticated' : 'anonymous'
}
    },
    keyGenerator: createKeyGenerator(),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      const userId = getAuthenticatedUserId(req)
      const tier = baseTier ? rateLimitTiers[baseTier] : determineRateLimitTier(req)
;
      logger.warn('Rate limit exceeded', {
        userId: userId || 'anonymous'
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        limit: tier.max,
        window: tier.windowMs
      })

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: tier.message,
        retryAfter: Math.ceil(tier.windowMs / 1000),
        limit: tier.max,
        userTier: req.user ? 'authenticated' : 'anonymous',
        upgradeMessage: req.user ? null : 'Authenticate for higher rate limits'
})
    }
  })
}

/**
 * Create endpoint-specific rate limiter
 */
export function createEndpointRateLimit(endpoint: string): RateLimitRequestHandler {
  const endpointConfig = endpointLimits[endpoint];

  if (!endpointConfig) {
    return createAdaptiveRateLimit()
  }

  return rateLimit({
    windowMs: endpointConfig.windowMs || 15 * 60 * 1000,
    max: endpointConfig.max || 100,
    message: {
      error: 'Rate limit exceeded',
      message: endpointConfig.message || 'Too many requests for this endpoint'
      endpoint
    },
    keyGenerator: createKeyGenerator(),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      const userId = getAuthenticatedUserId(req)
;
      logger.warn('Endpoint rate limit exceeded', {
        userId: userId || 'anonymous'
        ip: req.ip,
        endpoint,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      })

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: endpointConfig.message || 'Too many requests for this endpoint'
        endpoint,
        retryAfter: Math.ceil((endpointConfig.windowMs || 15 * 60 * 1000) / 1000)
      })
    }
  })
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // General API rate limiting;
  general: createAdaptiveRateLimit(),

  // Strict rate limiting for sensitive operations
  strict: createAdaptiveRateLimit('strict'),

  // Authentication endpoints
  auth: createEndpointRateLimit('/auth/login'),

  // Heavy computation endpoints
  computation: rateLimit({
    windowMs: 60 * 1000, // 1 minute,
    max: (req: Request) => {
      if (isAdmin(req)) return 100,
      if (getAuthenticatedUserId(req)) return 20,
      return 5;
    },
    message: {
      error: 'Computation rate limit exceeded',
      message: 'Too many computation requests. Please wait before trying again.' },
        keyGenerator: createKeyGenerator(),
    standardHeaders: true,
    legacyHeaders: false
}),

  // WebSocket connection rate limiting
  websocket: rateLimit({
    windowMs: 60 * 1000, // 1 minute,
    max: (req: Request) => {
      if (isAdmin(req)) return 50,
      if (getAuthenticatedUserId(req)) return 10,
      return 3;
    },
    message: {
      error: 'WebSocket connection rate limit exceeded',
      message: 'Too many WebSocket connection attempts.' },
        keyGenerator: createKeyGenerator(),
    standardHeaders: true,
    legacyHeaders: false
})
}

/**
 * Global rate limiting configuration
 */
export const globalRateLimit = createAdaptiveRateLimit()

/**
 * Rate limit status endpoint
 */;
export function rateLimitStatus(req: Request, res: Response): void {
  const userId = getAuthenticatedUserId(req)
  const tier = determineRateLimitTier(req)

  res.json({,
    userId: userId || null,
    tier: {
      name: userId ? (isAdmin(req) ? 'admin' : 'authenticated') : 'anonymous',
      windowMs: tier.windowMs,
      maxRequests: tier.max,
      message: tier.message
    },
    recommendations: {
      authenticate: !userId ? 'Authenticate for higher rate limits' : null,
      upgrade: userId && !isAdmin(req) ? 'Upgrade to premium for higher limits' : null
    }
  })
}

export default {
  createAdaptiveRateLimit,
  createEndpointRateLimit,
  rateLimiters,
  globalRateLimit,
  rateLimitStatus,
  rateLimitTiers,
  endpointLimits
}