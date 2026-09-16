const mockHandleSignOutSession = jest.fn();
const mockScheduleSessionTouch = jest.fn();
const mockTouchSession = jest.fn();

interface CapturedOptions {
  events?: { signOut?: unknown };
  callbacks?: {
    jwt?: (params: {
      token: Record<string, unknown>;
      user?: unknown;
      account?: unknown;
      trigger?: string;
      session?: unknown;
    }) => Promise<Record<string, unknown> | null>;
    signIn?: unknown;
  };
}

let capturedAuthOptions: CapturedOptions | null = null;
let capturedMiddlewareHandler: unknown = null;

const mockNextAuthAuth = jest.fn((handler: unknown) => {
  capturedMiddlewareHandler = handler;
});

const mockNextAuthHandlers = {
  GET: jest.fn(),
  POST: jest.fn(),
};

const isCapturedOptions = (opt: unknown): opt is CapturedOptions =>
  Boolean(opt && typeof opt === "object" && "events" in opt);

const mockNextAuth = jest.fn((options: unknown) => {
  if (isCapturedOptions(options)) {
    capturedAuthOptions = options;
  }
  return {
    handlers: mockNextAuthHandlers,
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: mockNextAuthAuth,
  };
});

jest.mock("next-auth", () => ({
  __esModule: true,
  default: mockNextAuth,
}));

jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: "google", name: "Google", type: "oauth" })),
}));

jest.mock("../signOutSession", () => ({
  handleSignOutSession: (...args: unknown[]) => mockHandleSignOutSession(...args),
}));

jest.mock("../sessionTouch", () => ({
  scheduleSessionTouch: (...args: unknown[]) => mockScheduleSessionTouch(...args),
  touchSession: (...args: unknown[]) => mockTouchSession(...args),
}));

import { onSignOutEvent } from "../auth";
import { onAuthMiddlewareRequest } from "@/middleware";
import { GET } from "@/app/api/auth/[...nextauth]/route";
import { scheduleTouchFromSessionResponse } from "../sessionResponseTouch";
import { authConfig } from "../auth.config";
import { LEGACY_SESSION_MIGRATION_EPOCH_SECONDS } from "../sessionLifetime";
import { NextRequest } from "next/server";

describe("Auth wiring tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("NextAuth events.signOut wiring in auth.ts", () => {
    it("wires NextAuth signOut event to onSignOutEvent during configuration", () => {
      expect(capturedAuthOptions).toEqual(
        expect.objectContaining({
          events: expect.objectContaining({
            signOut: onSignOutEvent,
          }),
        }),
      );
    });

    it("calls handleSignOutSession with token when token is present in message", async () => {
      const token = {
        sessionId: "session-wiring-123",
        userId: "user-wiring-456",
        email: "test@alchm.kitchen",
      };

      await onSignOutEvent({ token });

      expect(mockHandleSignOutSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSignOutSession).toHaveBeenCalledWith(token);
    });

    it("calls handleSignOutSession with undefined when token is missing in message", async () => {
      await onSignOutEvent({ session: {} });

      expect(mockHandleSignOutSession).toHaveBeenCalledTimes(1);
      expect(mockHandleSignOutSession).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Middleware .auth wiring in middleware.ts", () => {
    it("wires onAuthMiddlewareRequest to NextAuth(...).auth", () => {
      expect(capturedMiddlewareHandler).toBe(onAuthMiddlewareRequest);
    });

    it("schedules session touch when sessionId is present on auth user", () => {
      const headers = new Headers({ "user-agent": "TestBrowser" });
      onAuthMiddlewareRequest({
        auth: {
          user: {
            sessionId: "session-middleware-789",
          },
        },
        headers,
      });

      expect(mockScheduleSessionTouch).toHaveBeenCalledTimes(1);
      expect(mockScheduleSessionTouch).toHaveBeenCalledWith("session-middleware-789", headers);
    });

    it("does not schedule session touch when auth user is missing or sessionId is not string", () => {
      onAuthMiddlewareRequest({});
      onAuthMiddlewareRequest({ auth: null });
      onAuthMiddlewareRequest({ auth: { user: null } });
      onAuthMiddlewareRequest({ auth: { user: { sessionId: 12345 } } });

      expect(mockScheduleSessionTouch).not.toHaveBeenCalled();
    });
  });

  describe("GET route handler wiring in [...nextauth]/route.ts", () => {
    it("schedules session touch when GET /api/auth/session succeeds with sessionId", async () => {
      mockNextAuthHandlers.GET.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: {
              name: "Test User",
              sessionId: "session-via-get-endpoint",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");
      const response = await GET(request);

      expect(response.status).toBe(200);

      // Allow background microtask / after() fallback to run
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).toHaveBeenCalledWith(
        "session-via-get-endpoint",
        request,
      );
    });

    it("does not schedule touch when GET route is not /session", async () => {
      mockNextAuthHandlers.GET.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ csrfToken: "csrf-token-abc" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

      const request = new NextRequest("https://alchm.kitchen/api/auth/csrf");
      const response = await GET(request);

      expect(response.status).toBe(200);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).not.toHaveBeenCalled();
    });

    it("does not schedule touch when GET response is not ok", async () => {
      mockNextAuthHandlers.GET.mockResolvedValueOnce(
        new Response("Server Error", { status: 500 }),
      );

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");
      const response = await GET(request);

      expect(response.status).toBe(500);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).not.toHaveBeenCalled();
    });

    it("scheduleTouchFromSessionResponse calls touchSession directly", async () => {
      const responseBody = JSON.stringify({
        user: {
          name: "Test User",
          sessionId: "session-route-999",
        },
      });

      const response = new Response(responseBody, {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");

      scheduleTouchFromSessionResponse(response, request);

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).toHaveBeenCalledWith(
        "session-route-999",
        request,
      );
    });

    it("scheduleTouchFromSessionResponse does not call touchSession when response has no sessionId", async () => {
      const response = new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");

      scheduleTouchFromSessionResponse(response, request);

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).not.toHaveBeenCalled();
    });

    it("does not schedule session touch when session response has null user (e.g. expired session)", async () => {
      mockNextAuthHandlers.GET.mockResolvedValueOnce(
        new Response(JSON.stringify({ user: null }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");
      const response = await GET(request);

      expect(response.status).toBe(200);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockTouchSession).not.toHaveBeenCalled();
    });
  });

  describe("authConfig edge JWT callback (middleware)", () => {
    it("rejects token when authTime is expired (> 30 days)", async () => {
      const edgeJwt = authConfig.callbacks?.jwt;
      expect(edgeJwt).toBeDefined();
      if (!edgeJwt) return;

      const expiredAuthTime = Math.floor(Date.now() / 1000) - 31 * 86400;
      const token = {
        sub: "user-edge-123",
        email: "test@alchm.kitchen",
        authTime: expiredAuthTime,
      };

      const result = await edgeJwt({ token });
      expect(result).toBeNull();
    });

    it("stamps legacy token with migration epoch if within grace period", async () => {
      const edgeJwt = authConfig.callbacks?.jwt;
      expect(edgeJwt).toBeDefined();
      if (!edgeJwt) return;

      const token = {
        sub: "user-legacy-123",
        email: "test@alchm.kitchen",
      };

      const result = await edgeJwt({ token });
      expect(result).not.toBeNull();
      expect(result?.authTime).toBe(LEGACY_SESSION_MIGRATION_EPOCH_SECONDS);
    });

    it("preserves valid authTime on active token", async () => {
      const edgeJwt = authConfig.callbacks?.jwt;
      expect(edgeJwt).toBeDefined();
      if (!edgeJwt) return;

      const validAuthTime = Math.floor(Date.now() / 1000) - 86400;
      const token = {
        sub: "user-valid-123",
        email: "test@alchm.kitchen",
        authTime: validAuthTime,
      };

      const result = await edgeJwt({ token });
      expect(result).not.toBeNull();
      expect(result?.authTime).toBe(validAuthTime);
    });
  });

  describe("auth.ts server-side JWT callback", () => {
    it("rejects token when authTime is expired even if rolling exp is valid", async () => {
      const jwtCallback = capturedAuthOptions?.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();
      if (!jwtCallback) return;

      const now = Math.floor(Date.now() / 1000);
      const expiredAuthTime = now - 31 * 86400;
      const token = {
        email: "test@alchm.kitchen",
        authTime: expiredAuthTime,
        exp: now + 86400 * 15, // rolling exp still valid
      };

      const result = await jwtCallback({ token });
      expect(result).toBeNull();
    });

    it("mints authTime on initial sign-in (when user is present)", async () => {
      const jwtCallback = capturedAuthOptions?.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();
      if (!jwtCallback) return;

      const token: Record<string, unknown> = {};
      const user = { email: "newuser@alchm.kitchen", name: "New User" };

      const before = Math.floor(Date.now() / 1000);
      const result = await jwtCallback({ token, user });
      const after = Math.floor(Date.now() / 1000);

      expect(result).not.toBeNull();
      const minted = result?.authTime;
      expect(typeof minted).toBe("number");
      if (typeof minted === "number") {
        expect(minted).toBeGreaterThanOrEqual(before);
        expect(minted).toBeLessThanOrEqual(after);
      }
    });

    it("preserves authTime during session update and ignores client attempts to overwrite authTime", async () => {
      const jwtCallback = capturedAuthOptions?.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();
      if (!jwtCallback) return;

      const originalAuthTime = Math.floor(Date.now() / 1000) - 86400 * 5;
      const token = {
        email: "test@alchm.kitchen",
        authTime: originalAuthTime,
        userId: "user-existing",
      };

      const sessionUpdate = {
        authTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        recipesGeneratedToday: 5,
      };

      const result = await jwtCallback({
        token,
        trigger: "update",
        session: sessionUpdate,
      });

      expect(result).not.toBeNull();
      expect(result?.authTime).toBe(originalAuthTime);
      expect(result?.recipesGeneratedToday).toBe(5);
    });

    it("rejects corrupted authTime (explicit null or NaN) immediately without DB lookups", async () => {
      const jwtCallback = capturedAuthOptions?.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();
      if (!jwtCallback) return;

      const tokenNull = {
        email: "test@alchm.kitchen",
        authTime: null,
      };

      const resultNull = await jwtCallback({ token: tokenNull });
      expect(resultNull).toBeNull();

      const tokenNaN = {
        email: "test@alchm.kitchen",
        authTime: Number.NaN,
      };

      const resultNaN = await jwtCallback({ token: tokenNaN });
      expect(resultNaN).toBeNull();
    });
  });
});
