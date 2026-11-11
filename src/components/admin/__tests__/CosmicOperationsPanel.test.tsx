import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import CosmicOperationsPanel from "@/components/admin/CosmicOperationsPanel";
import { makeDocumentVisible } from "@/utils/testing/pollingTestEnv";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => restoreVisibility());

const STRANDED_ROW = {
  operationKey: "op-expired-101",
  userId: "11111111-1111-4111-8111-111111111111",
  status: "debited",
  requestFingerprint: "fp-cosmic-101",
  recipeId: null,
  debitTxId: "22222222-2222-4222-8222-222222222222",
  refundTxId: null,
  errorMessage: null,
  createdAt: "2026-11-10T10:00:00.000Z",
  updatedAt: "2026-11-10T10:00:10.000Z",
  expiresAt: "2026-11-10T10:01:30.000Z",
};

describe("CosmicOperationsPanel", () => {
  it("renders cannot-read EmptyState when the diagnostic query fails", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );
    render(<CosmicOperationsPanel />);

    await waitFor(() =>
      expect(screen.getByText("Cosmic operations unavailable")).toBeInTheDocument(),
    );
    expect(screen.getByText(/HTTP 503/)).toBeInTheDocument();
  });

  it("distinguishes never-used (total=0) from all-clear (total>0, stranded=0)", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-10T12:00:00.000Z",
          totals: {
            total: 0,
            activeLocks: 0,
            expiredStranded: 0,
            completed: 0,
            refunded: 0,
            failed: 0,
          },
          strandedOperations: [],
        }),
      }),
    );
    const { unmount } = render(<CosmicOperationsPanel />);
    await waitFor(() =>
      expect(
        screen.getByText("No cosmic generation operations recorded yet"),
      ).toBeInTheDocument(),
    );
    unmount();

    installFetchMock(
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-10T12:00:00.000Z",
          totals: {
            total: 12,
            activeLocks: 1,
            expiredStranded: 0,
            completed: 10,
            refunded: 1,
            failed: 0,
          },
          strandedOperations: [],
        }),
      }),
    );
    render(<CosmicOperationsPanel />);
    await waitFor(() =>
      expect(screen.getByText("No expired or stranded cosmic leases")).toBeInTheDocument(),
    );
  });

  it("renders stranded operations and triggers a live reconciliation sweep", async () => {
    const fetchMock = jest.fn((_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            dryRun: false,
            scanned: 1,
            outcomes: [
              {
                userId: STRANDED_ROW.userId,
                operationKey: STRANDED_ROW.operationKey,
                previousStatus: "debited",
                nextStatus: "refunded",
                refunded: true,
                refundTxId: "33333333-3333-4333-8333-333333333333",
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-10T12:00:00.000Z",
          totals: {
            total: 5,
            activeLocks: 0,
            expiredStranded: 1,
            completed: 3,
            refunded: 1,
            failed: 0,
          },
          strandedOperations: [STRANDED_ROW],
        }),
      });
    });
    installFetchMock(fetchMock);

    render(<CosmicOperationsPanel />);

    await waitFor(() =>
      expect(screen.getByText("op-expired-101")).toBeInTheDocument(),
    );
    const reconcileBtn = screen.getByRole("button", { name: "Reconcile Stranded" });
    fireEvent.click(reconcileBtn);

    await waitFor(() =>
      expect(
        screen.getByText(/Reconciled 1 expired row\(s\) \(1 refunded\)/),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/op-expired-101→refunded/)).toBeInTheDocument();
  });
});

