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
import {
  __resetValidateRequestTestLoaders,
  __setValidateRequestTestLoaders,
  getUserIdFromRequest,
} from "../validateRequest";

describe("validateRequest: getUserIdFromRequest", () => {
  const mockReq = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/test");
  const auth = jest.fn();
  const userDb = {
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
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
});
