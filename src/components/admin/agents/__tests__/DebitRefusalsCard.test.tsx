/**
 * Component and integration tests for DebitRefusalsCard & DebitRefusalsCardView.
 *
 * @file src/components/admin/agents/__tests__/DebitRefusalsCard.test.tsx
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { makeDocumentVisible } from "@/__tests__/helpers/pollingTestEnv";
import { DebitRefusalsCard, DebitRefusalsCardView } from "@/components/admin/agents/DebitRefusalsCard";
import type { DebitRefusalWindowHours } from "@/components/admin/agents/debitRefusalsView";
import type { DebitRefusalReportView } from "@/lib/admin/schemas/debitRefusals";

let restoreVisibility: (() => void) | null = null;

beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});

afterAll(() => {
  restoreVisibility?.();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function liveReport(overrides: Partial<DebitRefusalReportView> = {}): DebitRefusalReportView {
  return {
    live: true,
    note: null,
    generatedAt: "2026-11-23T21:52:00.000Z",
    windowHours: 168,
    recordingSince: "2026-11-23T21:00:00.000Z",
    total: 70,
    emptyBasket: 0,
    byReason: [
      {
        reason: "insufficient_value",
        refusals: 70,
        emptyBasket: 0,
        meanShortfallValue: 2.4987,
        shortfallKnown: 70,
      },
    ],
    byHour: [{ hour: "2026-11-23T21:00:00.000Z", refusals: 70, emptyBasket: 0 }],
    ...overrides,
  };
}

function apiEnvelope(report: DebitRefusalReportView): Record<string, unknown> {
  return { success: true, ...report };
}

describe("DebitRefusalsCardView", () => {
  it("renders live counters, shortfall, partial-window basis, responsive table semantics, and hourly chart", () => {
    const view = render(
      <DebitRefusalsCardView
        data={liveReport()}
        error={null}
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("Live · Counting")).toBeInTheDocument();
    expect(screen.getByText("Insufficient value")).toBeInTheDocument();
    expect(screen.getByText("2.50 tok")).toBeInTheDocument();
    expect(screen.getByText("(n=70)")).toBeInTheDocument();
    expect(screen.getByText("0 (0%)")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByText(/hours before that are unmeasured, not zero/i).length).toBeGreaterThanOrEqual(1);

    const region = screen.getByRole("region", { name: "Sync-debit 402 refusal breakdown by reason" });
    expect(region).toHaveAttribute("tabindex", "0");

    const table = within(region).getByRole("table");
    expect(within(table).getByText("Sync-debit 402 refusal breakdown by reason").tagName).toBe("CAPTION");
    expect(table.querySelectorAll('thead th[scope="col"]').length).toBe(5);
    expect(table.querySelectorAll('tbody th[scope="row"]').length).toBe(1);

    const chartFigure = view.container.querySelector('figure[aria-label="Sync-debit 402 refusals by UTC hour"]');
    if (!(chartFigure instanceof HTMLElement)) {
      throw new Error("expected hourly chart figure");
    }
    expect(within(chartFigure).getByRole("rowheader", { name: "11-23 21Z" })).toBeInTheDocument();
    expect(within(chartFigure).getByText("70 — 0 empty-basket")).toBeInTheDocument();
  });

  it("renders em-dash rather than zero when a reason has no measured shortfall", () => {
    const report = liveReport({
      total: 75,
      emptyBasket: 2,
      byReason: [
        {
          reason: "insufficient_value",
          refusals: 70,
          emptyBasket: 0,
          meanShortfallValue: 2.4987,
          shortfallKnown: 70,
        },
        {
          reason: "rates_unavailable",
          refusals: 5,
          emptyBasket: 2,
          meanShortfallValue: null,
          shortfallKnown: 0,
        },
      ],
    });

    render(
      <DebitRefusalsCardView
        data={report}
        error={null}
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    const ratesRow = screen.getByText("Rates unavailable").closest("tr");
    if (!ratesRow) {
      throw new Error("expected Rates unavailable row");
    }
    const cells = Array.from(ratesRow.querySelectorAll("td")).map((td) => (td.textContent ?? "").trim());
    expect(cells).toEqual(["5", "7%", "2", "—"]);
  });

  it("renders 0 Refused cleanly when live and zero refusals occurred", () => {
    render(
      <DebitRefusalsCardView
        data={liveReport({ total: 0, emptyBasket: 0, byReason: [], byHour: [], recordingSince: null })}
        error={null}
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("0 Refused")).toBeInTheDocument();
    expect(screen.getByText("No 402 refusals recorded in this window.")).toBeInTheDocument();
  });

  it("shows live: false note without rendering zero counts when the table is unavailable", () => {
    const note = "economy_debit_refusals does not exist yet (migration 107 not applied)";
    render(
      <DebitRefusalsCardView
        data={liveReport({ live: false, note, total: 0, emptyBasket: 0, byReason: [], byHour: [], recordingSince: null })}
        error={null}
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("Not live")).toBeInTheDocument();
    expect(screen.getByText(note)).toBeInTheDocument();
    expect(screen.queryByText("Total 402 refusals")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders error state with Retry button and zero fabricated counts", () => {
    const onRefresh = jest.fn();
    render(
      <DebitRefusalsCardView
        data={null}
        error="HTTP 500"
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={onRefresh}
      />,
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("HTTP 500")).toBeInTheDocument();
    expect(screen.queryByText("Total 402 refusals")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders loading status without fabricated zeros when data and error are null", () => {
    render(
      <DebitRefusalsCardView
        data={null}
        error={null}
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading debit refusal counters");
    expect(screen.queryByText("Total 402 refusals")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("preserves prior live rows and adds a stale pill when a later refresh fails", () => {
    render(
      <DebitRefusalsCardView
        data={liveReport()}
        error="HTTP 503"
        windowHours={168}
        onWindowChange={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("Last refresh failed")).toBeInTheDocument();
    expect(screen.getByText("Insufficient value")).toBeInTheDocument();
    expect(screen.getByText("2.50 tok")).toBeInTheDocument();
  });

  it("switches windows and updates aria-pressed attributes", () => {
    const onWindowChange = jest.fn<(hours: DebitRefusalWindowHours) => void>();
    render(
      <DebitRefusalsCardView
        data={liveReport()}
        error={null}
        windowHours={168}
        onWindowChange={onWindowChange}
        onRefresh={jest.fn()}
      />,
    );

    const btn24 = screen.getByRole("button", { name: "24h" });
    const btn7d = screen.getByRole("button", { name: "7d" });
    const btn30d = screen.getByRole("button", { name: "30d" });

    expect(btn24).toHaveAttribute("aria-pressed", "false");
    expect(btn7d).toHaveAttribute("aria-pressed", "true");
    expect(btn30d).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(btn24);
    fireEvent.click(btn7d);
    fireEvent.click(btn30d);

    expect(onWindowChange.mock.calls).toEqual([[24], [168], [720]]);
  });
});

describe("DebitRefusalsCard (stateful polling)", () => {
  it("fetches /api/admin/debit-refusals?hours=168 on mount and switches to 24h on click", async () => {
    const fetchMock = jest.fn(async (input: string) => {
      const hours = input.includes("hours=24") ? 24 : 168;
      return {
        ok: true,
        status: 200,
        json: async () => apiEnvelope(liveReport({ windowHours: hours })),
      };
    });
    installFetchMock(fetchMock);

    render(<DebitRefusalsCard />);

    await waitFor(() => {
      expect(screen.getByText("2.50 tok")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/debit-refusals?hours=168", { cache: "no-store" });

    fireEvent.click(screen.getByRole("button", { name: "24h" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/debit-refusals?hours=24", { cache: "no-store" });
    });
  });

  it("renders 'not authorized' on HTTP 403 without fabricated zeros", async () => {
    installFetchMock(jest.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ error: "forbidden" }) }));

    render(<DebitRefusalsCard />);

    await waitFor(() => {
      expect(screen.getByText("not authorized")).toBeInTheDocument();
    });
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Total 402 refusals")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it.each<[string, unknown]>([
    ["null JSON body", JSON.parse("null")],
    ["missing report fields", { success: true }],
  ])("rejects malformed payload (%s) via Zod without crashing or showing zeros", async (_label, payload) => {
    installFetchMock(jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload }));

    render(<DebitRefusalsCard />);

    await waitFor(() => {
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
    });
    expect(screen.queryByText("Total 402 refusals")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
