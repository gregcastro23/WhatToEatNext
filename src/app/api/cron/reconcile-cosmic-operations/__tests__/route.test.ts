/** @jest-environment node */
import { NextRequest } from "next/server";
import { getCosmicOperationsSummary } from "@/lib/cooking/cosmicOperationReconciler";
import { GET, POST } from "../route";

const mockExecuteQuery = jest.fn();
const mockCreditMultipleTokensDetailed = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokensDetailed: (...args: unknown[]) =>
      mockCreditMultipleTokensDetailed(...args),
  },
}));

describe("/api/cron/reconcile-cosmic-operations", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockCreditMultipleTokensDetailed.mockReset();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("rejects unauthorized requests without Bearer CRON_SECRET", async () => {
    const res = await POST(
      new NextRequest("http://localhost:3000/api/cron/reconcile-cosmic-operations", {
        method: "POST",
      }),
    );
    expect(res.status).toBe(401);

    const getRes = await GET(
      new NextRequest("http://localhost:3000/api/cron/reconcile-cosmic-operations"),
    );
    expect(getRes.status).toBe(401);
  });

  it("POST sweeps expired rows, records heartbeat audit logs, and surfaces lastAutomatedRun", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const debitTx = "22222222-2222-4222-8222-222222222222";

    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: userId,
            operation_key: "cron-stranded-1",
            previous_status: "generating",
            debit_tx_id: debitTx,
            refund_tx_id: null,
          },
        ],
      }) // claimStrandedRows
      .mockResolvedValueOnce({
        rows: [{ token_type: "Spirit", amount: 5 }],
      }) // readDebitLegs
      .mockResolvedValueOnce({ rows: [] }) // failCosmicGenerationOperation
      .mockResolvedValueOnce({ rows: [] }); // recordCronRun

    mockCreditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "credited",
      written: 1,
      requested: 1,
      balances: null,
    });

    const res = await POST(
      new NextRequest("http://localhost:3000/api/cron/reconcile-cosmic-operations", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-cron-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 15 }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      success: true,
      dryRun: false,
      scanned: 1,
      refundedCount: 1,
      failedCount: 0,
      pendingCount: 0,
    });

    // Verify getCosmicOperationsSummary surfaces the recorded automated run
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            total: 1,
            active_locks: 0,
            expired_stranded: 0,
            completed: 0,
            refunded: 1,
            failed: 0,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    const summary = await getCosmicOperationsSummary(10);
    expect(summary.lastAutomatedRun).toMatchObject({
      status: "success",
      scanned: 1,
      refundedCount: 1,
      failedCount: 0,
      pendingCount: 0,
    });
  });
});

