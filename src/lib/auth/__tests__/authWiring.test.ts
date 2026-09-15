const mockHandleSignOutSession = jest.fn();
const mockScheduleSessionTouch = jest.fn();

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  })),
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
}));

import { onSignOutEvent } from "../auth";
import { onAuthMiddlewareRequest } from "@/middleware";
import { scheduleTouchFromSessionResponse } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

describe("Auth wiring tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("onSignOutEvent in auth.ts", () => {
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

  describe("onAuthMiddlewareRequest in middleware.ts", () => {
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

  describe("scheduleTouchFromSessionResponse in [...nextauth]/route.ts", () => {
    it("schedules session touch when /api/auth/session response contains sessionId", async () => {
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

      // Allow background microtask to execute
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockScheduleSessionTouch).toHaveBeenCalledWith(
        "session-route-999",
        request,
      );
    });

    it("does not schedule touch when response has no sessionId", async () => {
      const response = new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

      const request = new NextRequest("https://alchm.kitchen/api/auth/session");

      scheduleTouchFromSessionResponse(response, request);

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(mockScheduleSessionTouch).not.toHaveBeenCalled();
    });
  });
});
