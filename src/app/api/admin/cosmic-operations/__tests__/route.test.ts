/** @jest-environment node */
import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { GET, POST } from "../route";

const mockExecuteQuery = jest.fn();
const mockCreditMultipleTokensDetailed = jest.fn();

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokensDetailed: (...args: unknown[]) =>
      mockCreditMultipleTokensDetailed(...args),
  },
}));

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);

function allowAdmin(): void {
  mockValidateAdminRequest.mockResolvedValueOnce({
    user: {
      userId: "admin-1",
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
}

describe("/api/admin/cosmic-operations", () => {
  beforeEach(() => {
    mockValidateAdminRequest.mockReset();
    mockExecuteQuery.mockReset();
    mockCreditMultipleTokensDetailed.mockReset();
  });

  it("returns 403 when admin validation fails", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await GET(
      new NextRequest("http://localhost:3000/api/admin/cosmic-operations"),
    );
    expect(res.status).toBe(403);
  });

  it("GET surfaces active and expired stranded operations", async () => {
    allowAdmin();
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            total: 10,
            active_locks: 1,
            expired_stranded: 2,
            completed: 5,
            refunded: 1,
            failed: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            operation_key: "stranded-op-1",
            user_id: "11111111-1111-4111-8111-111111111111",
            status: "generating",
            request_fingerprint: "a".repeat(64),
            recipe_id: null,
            debit_tx_id: "22222222-2222-4222-8222-222222222222",
            refund_tx_id: null,
            error_message: null,
            created_at: "2026-11-10T10:00:00.000Z",
            updated_at: "2026-11-10T10:00:00.000Z",
            expires_at: "2026-11-10T10:01:30.000Z",
          },
        ],
      });

    const res = await GET(
      new NextRequest(
        "http://localhost:3000/api/admin/cosmic-operations?limit=10",
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.totals).toEqual({
      total: 10,
      activeLocks: 1,
      expiredStranded: 2,
      completed: 5,
      refunded: 1,
      failed: 1,
    });
    expect(body.strandedOperations).toHaveLength(1);
    expect(body.strandedOperations[0]?.operationKey).toBe("stranded-op-1");
  });

  it("POST auto-settles expired stranded rows using exact ledger debit legs and fails undebited claims", async () => {
    allowAdmin();
    const userIdA = "11111111-1111-4111-8111-111111111111";
    const debitTxA = "22222222-2222-4222-8222-222222222222";
    const userIdB = "33333333-3333-4333-8333-333333333333";

    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: userIdA,
            operation_key: "stranded-debited",
            previous_status: "generating",
            debit_tx_id: debitTxA,
            refund_tx_id: null,
          },
          {
            user_id: userIdB,
            operation_key: "stranded-claimed-only",
            previous_status: "claimed",
            debit_tx_id: null,
            refund_tx_id: null,
          },
        ],
      }) // claimStrandedRows
      .mockResolvedValueOnce({
        rows: [{ token_type: "Spirit", amount: 5 }],
      }) // readDebitLegs
      .mockResolvedValueOnce({ rows: [] }); // failCosmicGenerationOperation

    mockCreditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "credited",
      written: 1,
      requested: 1,
      balances: null,
    });

    const res = await POST(
      new NextRequest("http://localhost:3000/api/admin/cosmic-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      success: true,
      dryRun: false,
      scanned: 2,
      outcomes: [
        {
          userId: userIdA,
          operationKey: "stranded-debited",
          previousStatus: "generating",
          nextStatus: "refunded",
          refunded: true,
          refundTxId: `cosmic_recipe_refund:${debitTxA}`,
        },
        {
          userId: userIdB,
          operationKey: "stranded-claimed-only",
          previousStatus: "claimed",
          nextStatus: "failed",
          refunded: false,
          refundTxId: null,
        },
      ],
    });
  });

  it("POST parks debited rows as refund_pending when ledger debit legs cannot be proven", async () => {
    allowAdmin();
    const userId = "11111111-1111-4111-8111-111111111111";
    const debitTx = "22222222-2222-4222-8222-222222222222";

    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: userId,
            operation_key: "stranded-unprovable",
            previous_status: "debited",
            debit_tx_id: debitTx,
            refund_tx_id: null,
          },
        ],
      }) // claimStrandedRows
      .mockResolvedValueOnce({ rows: [] }); // readDebitLegs returns empty

    const res = await POST(
      new NextRequest("http://localhost:3000/api/admin/cosmic-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 5 }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.outcomes).toEqual([
      {
        userId,
        operationKey: "stranded-unprovable",
        previousStatus: "debited",
        nextStatus: "refund_pending",
        refunded: false,
        refundTxId: null,
      },
    ]);
    expect(mockCreditMultipleTokensDetailed).not.toHaveBeenCalled();
  });
});

