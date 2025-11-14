import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import type { NextRequest } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// JWT Secret - REQUIRED in production
// Lazy initialization to avoid accessing env vars at build time
let _jwtSecret: string | null = null;
function getJWTSecret(): string {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required. Set this to a secure random string in production.",
    );
  }
  _jwtSecret = secret;
  return secret;
}

const getJWTExpiry = () => process.env.JWT_EXPIRY || "24h";

/**
 * Mock user database - in production this would be a real database
 */
const mockUsers = [
  {
    id: "1",
    email: "user@alchm.kitchen",
    passwordHash: "$2a$10$example.hash.here", // This is a bcrypt hash for 'password'
    roles: ["user"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date(),
  },
  {
    id: "2",
    email: "admin@alchm.kitchen",
    passwordHash: "$2a$10$example.hash.here", // This is a bcrypt hash for 'password'
    roles: ["admin", "user"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date(),
  },
];

/**
 * GET /api/auth/session - Get current session status
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: "No authentication token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, getJWTSecret()) as any;

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          roles: decoded.roles,
          scopes: decoded.scopes,
        },
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      });
    } catch (jwtError) {
      logger.warn("Invalid JWT token:", jwtError);
      return NextResponse.json(
        {
          authenticated: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      );
    }
  } catch (error) {
    logger.error("Session check error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        message: "Session check failed",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/auth/session - Create new session (login)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    // Find user (mock implementation)
    const user = mockUsers.find((u) => u.email === email && u.isActive);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    // In a real implementation, you would verify the password hash here
    // For now, we'll accept any password for demo purposes

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      scopes: ["read:cuisine", "write:recommendations"],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      iss: "alchm.kitchen",
    };

    const accessToken = jwt.sign(tokenPayload, getJWTSecret());

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      accessToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });

    // Set HTTP-only cookie for additional security
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/session - Logout (invalidate session)
 */
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear the authentication cookie
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    logger.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 },
    );
  }
}
