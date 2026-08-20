/**
 * An empty settlement queue is ambiguous: a rail that has settled thousands of
 * orders and a rail that has never carried one both return zero pending rows.
 * Showing a green "all clear" for the second case is a false reassurance —
 * the rail is unproven, not healthy. These tests pin that distinction.
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { makeDocumentVisible } from "@/utils/testing/pollingTestEnv";
import SettlementPanel from "@/components/admin/SettlementPanel";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => restoreVisibility());

function mockFetch(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  }) as unknown as typeof fetch;
}

/** A failing read — the case none of the original three tests covered. */
function mockFailedFetch(status: number) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  }) as unknown as typeof fetch;
}

describe("SettlementPanel empty states", () => {
  it("does not report an all-clear when it could not read the queue", async () => {
    // On a failed first read the panel kept `loaded=false`, `orders=[]` and
    // `lifetime=null`. The spinner guard (`!loaded && !error`) was dead
    // because `error` was set, `orders.length === 0` was true, and the
    // never-used tie-break `lifetime?.orders === 0` was FALSE because
    // `lifetime` was null — so control fell through to a green
    // "No orders awaiting settlement" over a real-money queue whose state was
    // entirely unknown. All three original tests pass with or without the fix.
    mockFailedFetch(500);
    render(<SettlementPanel />);

    await waitFor(() =>
      expect(
        screen.getByText("Cannot read the settlement queue"),
      ).toBeInTheDocument(),
    );

    // THE defect.
    expect(
      screen.queryByText("No orders awaiting settlement"),
    ).not.toBeInTheDocument();
    // And it must not borrow the other honest-but-wrong empty state either.
    expect(screen.queryByText("Rail not yet in use")).not.toBeInTheDocument();

    // The header must not assert LIVE over data it never received.
    expect(screen.getByText("NO SOURCE")).toBeInTheDocument();
  });

  it("does not claim the rail is clear when no order has ever been placed", async () => {
    mockFetch({
      success: true,
      pending: [],
      lifetime: { orders: 0, restaurants: 0 },
    });
    render(<SettlementPanel />);

    await waitFor(() =>
      expect(screen.getByText("Rail not yet in use")).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/no restaurants are onboarded/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not a sign that settlements are healthy/),
    ).toBeInTheDocument();

    // The false-reassurance state must be absent.
    expect(
      screen.queryByText("No orders awaiting settlement"),
    ).not.toBeInTheDocument();
  });

  it("reports a genuinely clear rail once it has settled orders", async () => {
    mockFetch({
      success: true,
      pending: [],
      lifetime: { orders: 42, restaurants: 3 },
    });
    render(<SettlementPanel />);

    await waitFor(() =>
      expect(
        screen.getByText("No orders awaiting settlement"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/42 orders settled to date/)).toBeInTheDocument();
    expect(screen.queryByText("Rail not yet in use")).not.toBeInTheDocument();
  });

  it("omits the lifetime claim entirely when the total is unknown", async () => {
    mockFetch({ success: true, pending: [], lifetime: null });
    render(<SettlementPanel />);

    await waitFor(() =>
      expect(
        screen.getByText("No orders awaiting settlement"),
      ).toBeInTheDocument(),
    );
    // Unknown must not be rendered as "0 orders settled to date".
    expect(screen.queryByText(/settled to date/)).not.toBeInTheDocument();
    expect(screen.queryByText("Rail not yet in use")).not.toBeInTheDocument();
  });
});
