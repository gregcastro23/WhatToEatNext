/**
 * JWT Validation Utility for Next.js API Routes
 * Validates authentication tokens from cookies or Authorization header
 *
 * @file src/lib/auth/validateRequest.ts
 * @created 2026-02-03
 */

import { jwtVerify, JWTPayload } from "jose";
import { TextEncoder } from "util";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { userDatabase } from "@/services/userDatabaseService";
import { logger } from "@/utils/logger";

// JWT Secret - lazy initialization
let _jwtSecret: string | null = null;
function getJWTSecret(): string {
  if (_jwtSecret) return _jwtSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "JWT_SECRET environment variable is not set. This may cause authentication issues in development/preview environments.",
      );
    }
    throw new Error("JWT_SECRET environment variable is required");
  }
  _jwtSecret = secret;
  return secret;
}

/**
 * Token payload structure
 */
export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  scopes: string[];
  iat: number;
  exp: number;
  iss: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  user?: TokenPayload;
  error?: string;
  statusCode?: number;
}

/**
 * Extract JWT token from request
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookies
  const cookieToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Validate JWT token and return user payload
 */
export async function validateToken(token: string): Promise<ValidationResult> {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as TokenPayload;

    // Verify user still exists and is active
    const user = await userDatabase.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return {
        valid: false,
        error: "User account is inactive or deleted",
        statusCode: 401,
      };
    }

    return {
      valid: true,
      user: decoded,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: "Token has expired",
        statusCode: 401,
      };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: "Invalid token",
        statusCode: 401,
      };
    }
    return {
      valid: false,
      error: "Token validation failed",
      statusCode: 500,
    };
  }
}

/**
 * Validate request and return user or error response
 */
export async function validateRequest(
  request: NextRequest,
): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  const token = extractToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const result = await validateToken(token);

  if (!result.valid || !result.user) {
    return {
      error: NextResponse.json(
        { success: false, message: result.error || "Unauthorized" },
        { status: result.statusCode || 401 },
      ),
    };
  }

  return { user: result.user };
}

/**
 * Validate request requires admin role
 */
export async function validateAdminRequest(
  request: NextRequest,
): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  const result = await validateRequest(request);

  if ("error" in result) {
    return result;
  }

  if (!result.user.roles.includes("admin")) {
    return {
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return result;
}

/**
 * Helper to get userId from request (from token or query param as fallback)
 */
export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  // Try token first
  const token = extractToken(request);
  if (token) {
    const result = await validateToken(token);
    if (result.valid && result.user) {
      return result.user.userId;
    }
  }

  // Fallback to query param (for development/testing)
  const { searchParams } = new URL(request.url);
  return searchParams.get("userId");
}

export default {
  extractToken,
  validateToken,
  validateRequest,
  validateAdminRequest,
  getUserIdFromRequest,
};
