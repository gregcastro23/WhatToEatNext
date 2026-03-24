/**
 * JWT Validation Utility for Next.js API Routes
 * Validates authentication tokens from cookies or Authorization header.
 * Uses NextAuth session as primary auth and legacy JWT as fallback.
 *
 * @file src/lib/auth/validateRequest.ts
 */

import { jwtVerify, type JWTPayload, errors as JOSEerrors } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dynamic import for auth to avoid pulling in Node.js deps at bundle time
// This allows edge routes to use validateRequest when auth callbacks aren't needed
const getAuth = async () => {
  try {
    const { auth } = await import("@/lib/auth/auth");
    return auth;
  } catch {
    return null;
  }
};

// Dynamic import for userDatabase to support edge runtime
// Edge routes will gracefully skip DB lookups
const getUserDatabase = async () => {
  try {
    const { userDatabase } = await import("@/services/userDatabaseService");
    return userDatabase;
  } catch {
    return null;
  }
};

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
    // Return a dummy secret to prevent immediate crash if not required
    return new TextEncoder().encode("dummy-secret-not-for-production");
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
    // Validate using legacy JWT
    const { payload } = await jwtVerify(token, getJWTSecret(), {
      algorithms: ["HS256"],
    });

    const decoded = payload as unknown as TokenPayload;

    // Try to verify user still exists and is active (skipped on edge runtime)
    const userDatabase = await getUserDatabase();
    if (userDatabase) {
      const user = await userDatabase.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        return {
          valid: false,
          error: "User account is inactive or deleted",
          statusCode: 401,
        };
      }
    }
    // On edge runtime, skip DB check and trust the JWT

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
    return {
      valid: false,
      error: "Token validation failed",
      statusCode: 401,
    };
  }
}

/**
 * Validate request and return user or error response.
 * Checks NextAuth session first, then falls back to legacy JWT.
 */
export async function validateRequest(
  request: NextRequest,
): Promise<{ user: TokenPayload } | { error: NextResponse }> {
  // 1. Try NextAuth session first (dynamically imported for edge compatibility)
  try {
    const auth = await getAuth();
    if (auth) {
      const session = await auth();
      if (session?.user) {
        const sessionRole = session.user.role || "user";
        const roles =
          sessionRole === "admin" ? ["admin", "user"] : ["user"];
        return {
          user: {
            userId: session.user.id || "",
            email: session.user.email || "",
            roles,
            scopes: [],
            iat: 0,
            exp: 0,
            iss: "next-auth",
          },
        };
      }
    }
  } catch {
    // NextAuth session check failed, fall through to JWT
  }

  // 2. Fall back to legacy JWT token
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
 * Helper to get userId from request (from NextAuth session, token, or query param)
 */
export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  // Try NextAuth session first (dynamically imported for edge compatibility)
  try {
    const auth = await getAuth();
    if (auth) {
      const session = await auth();
      if (session?.user?.id) {
        return session.user.id;
      }
    }
  } catch {
    // Fall through
  }

  // Try token
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

/**
 * Helper to get the actual UserWithProfile from the database, resolving ID mismatches.
 * Tries userId first, then falls back to session email.
 */
export async function getDatabaseUserFromRequest(
  request: NextRequest,
) {
  const userId = await getUserIdFromRequest(request);
  let user = null;
  
  const userDb = await getUserDatabase();
  if (!userDb) return null;

  if (userId) {
    user = await userDb.getUserById(userId);
  }

  // If userId lookup failed (e.g. Google sub vs DB id mismatch), try email
  if (!user) {
    try {
      const auth = await getAuth();
      if (auth) {
        const session = await auth();
        if (session?.user?.email) {
          user = await userDb.getUserByEmail(session.user.email);
        }
      }
    } catch {
      // Auth session unavailable
    }
  }

  return user;
}

export default {
  extractToken,
  validateToken,
  validateRequest,
  validateAdminRequest,
  getUserIdFromRequest,
  getDatabaseUserFromRequest,
};
