/**
 * Route handler tests for POST /api/admin/users/[userId]/grant.
 *
 * @file src/app/api/admin/users/[userId]/grant/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  isMissingUserFailure: jest.fn(),
  tokenEconomy: {
    creditMultipleTokensDetailed: jest.fn(),
  },
}));

import { NextRequest, NextResponse } from "next/server";
import { POST } from "../route";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  isMissingUserFailure,
  tokenEconomy,
} from "@/services/TokenEconomyService";
import type { CreditResult } from "@/services/TokenEconomyService";

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);
const mockCreditMultipleTokensDetailed = jest.mocked(
  tokenEconomy.creditMultipleTokensDetailed,
);
const mockIsMissingUserFailure = jest.mocked(isMissingUserFailure);

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const TARGET_ID = "22222222-2222-2222-2222-222222222222";

function makeGrantRequest(userId: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/users/${userId}/grant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  mockValidateAdminRequest.mockReset();
  mockCreditMultipleTokensDetailed.mockReset();
  mockIsMissingUserFailure.mockReset();

  mockValidateAdminRequest.mockResolvedValue({
    user: {
      userId: ADMIN_ID,
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
});

describe("POST /api/admin/users/[userId]/grant", () => {
  it("returns auth error if not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "Spirit", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("400s on invalid userId format", async () => {
    const res = await POST(
      makeGrantRequest("short", {
        credits: [{ tokenType: "Spirit", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
      }),
      { params: Promise.resolve({ userId: "short" }) },
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid userId");
  });

  it("400s on invalid JSON body", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/admin/users/${TARGET_ID}/grant`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      },
    );
    const res = await POST(req, {
      params: Promise.resolve({ userId: TARGET_ID }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON");
  });

  it("400s on schema validation failure (missing idempotencyKey)", async () => {
    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "Spirit", amount: 10 }],
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("400s on invalid tokenType", async () => {
    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "UnknownToken", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("200s on successful token grant", async () => {
    const mockOutcome: CreditResult = {
      status: "credited",
      balances: { Spirit: 100, Essence: 50, Matter: 50, Substance: 50 },
      written: 1,
      requested: 1,
    };
    mockCreditMultipleTokensDetailed.mockResolvedValueOnce(mockOutcome);

    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "Spirit", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
        description: "Bonus grant",
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result).toBe("credited");
    expect(data.balances.Spirit).toBe(100);
    expect(mockCreditMultipleTokensDetailed).toHaveBeenCalledWith(
      TARGET_ID,
      [{ tokenType: "Spirit", amount: 10 }],
      "admin",
      {
        description: "Bonus grant",
        idempotencyKey: "admin-grant-12345",
      },
    );
  });

  it("200s on replayed idempotencyKey", async () => {
    const mockOutcome: CreditResult = {
      status: "replayed",
      balances: { Spirit: 100, Essence: 50, Matter: 50, Substance: 50 },
    };
    mockCreditMultipleTokensDetailed.mockResolvedValueOnce(mockOutcome);

    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "Spirit", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result).toBe("replayed");
  });

  it("404s when user is missing from database", async () => {
    const mockOutcome: CreditResult = {
      status: "failed",
      code: "23503",
      constraint: "token_balances_user_id_fkey",
    };
    mockCreditMultipleTokensDetailed.mockResolvedValueOnce(mockOutcome);
    mockIsMissingUserFailure.mockReturnValueOnce(true);

    const res = await POST(
      makeGrantRequest(TARGET_ID, {
        credits: [{ tokenType: "Spirit", amount: 10 }],
        idempotencyKey: "admin-grant-12345",
      }),
      { params: Promise.resolve({ userId: TARGET_ID }) },
    );

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.result).toBe("failed");
    expect(data.message).toContain("database rejected that user id");
  });
});
