/**
 * Tests for validateRequest.ts - authentication and identity resolution.
 * Verifies resilient user ID resolution against DB-based drift.
 */
// Mock next/server before anything else
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method?: string;
    body?: any;
    headers: { get: (name: string) => string | null };
    cookies: { get: (name: string) => { value: string } | undefined };
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method;
      this.body = init?.body;
      const headersMap = new Map(Object.entries(init?.headers || {}));
      this.headers = { get: (name: string) => (headersMap.get(name.toLowerCase()) as any) || null };
      this.cookies = { get: () => undefined };
    }
    get nextUrl() {
      return new URL(this.url);
    }
    async json() {
      return this.body ? JSON.parse(this.body) : null;
    }
  },
}));

// Mock jose before anything else
jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  errors: {
    JWTExpired: class extends Error {},
    JWSInvalid: class extends Error {},
    JWTInvalid: class extends Error {},
  },
}));

// Mock auth and dependencies using the SAME paths used in dynamic imports
import { jwtVerify } from "jose";
import { _logger } from "@/lib/logger";
import {
  __resetValidateRequestTestLoaders,
  __setValidateRequestTestLoaders,
  getUserIdFromRequest,
  validateToken,
} from "../validateRequest";

import { NextRequest } from "next/server";

describe("validateRequest: getUserIdFromRequest", () => {
  const mockReq = new NextRequest("http://localhost:3000/api/test");
  const auth = jest.fn();
  const userDb = {
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    __setValidateRequestTestLoaders({
      authLoader: async () => auth,
      userDatabaseLoader: async () => userDb,
    });
  });

  afterEach(() => {
    __resetValidateRequestTestLoaders();
    consoleErrorSpy.mockRestore();
  });

  it("should return null when no session exists", async () => {
    auth.mockResolvedValue(null);
    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBeNull();
  });

  it("should resolve user ID directly when ID matches a database user", async () => {
    const mockSession = { user: { id: "uuid-123", email: "test@test.com" } };
    auth.mockResolvedValue(mockSession);
    userDb.getUserById.mockResolvedValue({ id: "uuid-123" });

    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBe("uuid-123");
    expect(userDb.getUserById).toHaveBeenCalledWith("uuid-123");
  });

  it("should fallback to email lookup when session ID is a non-DB identifier (e.g. OAuth sub)", async () => {
    const mockSession = { user: { id: "oauth-sub-456", email: "test@test.com" } };
    auth.mockResolvedValue(mockSession);
    
    // ID lookup fails (not a UUID)
    userDb.getUserById.mockResolvedValue(null);
    
    // Email lookup succeeds
    userDb.getUserByEmail.mockResolvedValue({ id: "uuid-from-email-789" });

    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBe("uuid-from-email-789");
    expect(userDb.getUserByEmail).toHaveBeenCalledWith("test@test.com");
  });

  it("should fallback to raw session ID when database lookup fails/errors to ensure basic identity", async () => {
    const mockSession = { user: { id: "fallback-id", email: "test@test.com" } };
    auth.mockResolvedValue(mockSession);
    
    // DB error
    userDb.getUserById.mockRejectedValue(new Error("DB_OFFLINE"));

    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBe("fallback-id");
  });

  it("should resolve user ID from email when session has no ID but does have email", async () => {
    auth.mockResolvedValue({ user: { email: "test@test.com" } });
    userDb.getUserByEmail.mockResolvedValue({ id: "uuid-email-only" });

    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBe("uuid-email-only");
    expect(userDb.getUserById).not.toHaveBeenCalled();
    expect(userDb.getUserByEmail).toHaveBeenCalledWith("test@test.com");
  });

  it("should return null when session is present but has no user ID or email", async () => {
    auth.mockResolvedValue({ user: {} });
    const userId = await getUserIdFromRequest(mockReq);
    expect(userId).toBeNull();
  });

  it("SECURITY REGRESSION: must NOT trust a ?userId= query param as identity when there is no session, token, or agents-bridge cookie", async () => {
    auth.mockResolvedValue(null);
    const spoofedReq = new NextRequest(
      "http://localhost:3000/api/test?userId=00000000-0000-4000-8000-000000000000",
    );

    const userId = await getUserIdFromRequest(spoofedReq);

    expect(userId).toBeNull();
    expect(userDb.getUserById).not.toHaveBeenCalled();
  });
});

describe("validateRequest: validateToken DB error isolation", () => {
  const mockedJwtVerify = jest.mocked(jwtVerify);
  const originalJwtSecret = process.env.JWT_SECRET;
  const userDb = {
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    isUserActiveById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "unit-test-secret-0123456789abcdef";
    __setValidateRequestTestLoaders({
      userDatabaseLoader: async () => userDb,
    });
  });

  afterEach(() => {
    __resetValidateRequestTestLoaders();
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  const verifiedJwt = {
    payload: {
      userId: "user-123",
      email: "probe@alchm.kitchen",
      roles: ["user"],
      scopes: [],
      iat: 1,
      exp: 9_999_999_999,
      iss: "alchm",
    },
    protectedHeader: { alg: "HS256" },
    key: new Uint8Array(),
  };

  it("returns statusCode 503 instead of 401 when the DB lookup throws/times out", async () => {
    mockedJwtVerify.mockResolvedValue(verifiedJwt);
    userDb.isUserActiveById.mockRejectedValue(new Error("Database read timeout"));

    const result = await validateToken("valid.jwt.token");
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(userDb.getUserById).not.toHaveBeenCalled();
  });

  it("returns statusCode 401 when user is inactive or deleted", async () => {
    mockedJwtVerify.mockResolvedValue(verifiedJwt);
    userDb.isUserActiveById.mockResolvedValue(false);

    const result = await validateToken("valid.jwt.token");
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(401);
  });

  it("succeeds via lightweight isUserActiveById when user is active", async () => {
    mockedJwtVerify.mockResolvedValue(verifiedJwt);
    userDb.isUserActiveById.mockResolvedValue(true);

    const result = await validateToken("valid.jwt.token");
    expect(result.valid).toBe(true);
    expect(result.user?.userId).toBe("user-123");
  });
});

describe("validateRequest: validateToken fail-closed JWT_SECRET guard", () => {
  const mockedJwtVerify = jest.mocked(jwtVerify);
  const originalJwtSecret = process.env.JWT_SECRET;
  const userDb = {
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    isUserActiveById: jest.fn(),
  };
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    __resetValidateRequestTestLoaders();
    __setValidateRequestTestLoaders({
      userDatabaseLoader: async () => userDb,
    });
    loggerErrorSpy = jest.spyOn(_logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    __resetValidateRequestTestLoaders();
    loggerErrorSpy.mockRestore();
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  it("returns statusCode 503 and skips jwtVerify when JWT_SECRET is unset", async () => {
    delete process.env.JWT_SECRET;

    const result = await validateToken("any.jwt.token");
    expect(result).toEqual({
      valid: false,
      error: "Authentication service misconfigured",
      statusCode: 503,
    });
    expect(mockedJwtVerify).not.toHaveBeenCalled();
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("returns statusCode 503 and skips jwtVerify when JWT_SECRET is whitespace-only", async () => {
    process.env.JWT_SECRET = "   ";

    const result = await validateToken("any.jwt.token");
    expect(result).toEqual({
      valid: false,
      error: "Authentication service misconfigured",
      statusCode: 503,
    });
    expect(mockedJwtVerify).not.toHaveBeenCalled();
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("fails closed with 503 after cache reset when JWT_SECRET is subsequently deleted", async () => {
    process.env.JWT_SECRET = "unit-test-secret-0123456789abcdef";
    mockedJwtVerify.mockResolvedValue({
      payload: {
        userId: "user-123",
        email: "probe@alchm.kitchen",
        roles: ["user"],
        scopes: [],
        iat: 1,
        exp: 9_999_999_999,
        iss: "alchm",
      },
      protectedHeader: { alg: "HS256" },
      key: new Uint8Array(),
    });
    userDb.isUserActiveById.mockResolvedValue(true);

    const first = await validateToken("valid.jwt.token");
    expect(first.valid).toBe(true);

    __resetValidateRequestTestLoaders();
    delete process.env.JWT_SECRET;

    const second = await validateToken("valid.jwt.token");
    expect(second).toEqual({
      valid: false,
      error: "Authentication service misconfigured",
      statusCode: 503,
    });
    expect(mockedJwtVerify).toHaveBeenCalledTimes(1);
  });
});
