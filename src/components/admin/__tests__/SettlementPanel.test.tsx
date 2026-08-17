/**
 * An empty settlement queue is ambiguous: a rail that has settled thousands of
 * orders and a rail that has never carried one both return zero pending rows.
 * Showing a green "all clear" for the second case is a false reassurance —
 * the rail is unproven, not healthy. These tests pin that distinction.
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { makeDocumentVisible } from "@/__tests__/utils/pollingTestEnv";
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

describe("SettlementPanel empty states", () => {
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
