/**
 * JWT Validation Utility for Next.js API Routes
 * Validates authentication tokens from cookies or Authorization header
 *
 * @file src/lib/auth/validateRequest.ts
 * @created 2026-02-03
 */

import { jwtVerify, type JWTPayload, errors as JOSEerrors } from "jose";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { userDatabase } from "@/services/userDatabaseService";
import { logger } from "@/utils/logger";

// JWT Secret - lazy initialization
let _jwtSecret: Uint8Array | null = null;
function getJWTSecret(): Uint8Array {
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
  // jose expects a Uint8Array for the secret
  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
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
    const { payload } = await jwtVerify(token, getJWTSecret(), {
      algorithms: ["HS256"], // Specify the algorithm if known, e.g., HS256
    });

    // Ensure payload matches TokenPayload interface
    const decoded = payload as unknown as TokenPayload;

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
    // Handle JOSE specific errors
    if (error instanceof JOSEerrors.JWTExpired) {
      return {
        valid: false,
        error: "Token has expired",
        statusCode: 401,
      };
    }
    if (
      error instanceof JOSEerrors.JWSInvalid ||
      error instanceof JOSEerrors.JWTInvalid
    ) {
      return {
        valid: false,
        error: "Invalid token",
        statusCode: 401,
      };
    }
    console.error("Token validation failed with unknown error:", error); // Log unexpected errors
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
