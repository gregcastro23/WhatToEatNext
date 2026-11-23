/**
 * @file src/components/admin/agents/__tests__/ActionMetricsTable.test.tsx
 *
 * "Fail (4xx)" used to be every status >= 400, so agent debits refused with 402
 * insufficient_funds showed as thousands of failures. Refusals now have their own
 * column and "Fail (4xx)" counts only 4xx that are not 402/409.
 */
import { render, within } from "@testing-library/react";
import React from "react";
import { ActionMetricsTable } from "@/components/admin/agents/ActionsSection";
import type { AdminAgentsView } from "@/lib/admin/schemas/agents";

type Metric = AdminAgentsView["actions"]["actionMetrics"][number];

const DEBIT: Metric = {
  action: "debit",
  label: "Agent Debit",
  path: "/api/economy/sync-debit",
  calls24h: 575,
  successes24h: 410,
  clientFailures24h: 0,
  refusals24h: 165,
  serverFailures24h: 0,
  p50Ms: 40,
  p95Ms: 120,
  lastSeenAt: "2026-11-23T03:28:00.000Z",
};

/** The body cells of the row for `label`, keyed by the column header above each. */
function cellsFor(label: string, metrics: Metric[]): Record<string, string> {
  const view = render(<ActionMetricsTable actionMetrics={metrics} />);
  const headers = Array.from(view.container.querySelectorAll("th")).map((th) => (th.textContent ?? "").trim());
  const row = within(view.container).getByText(label).closest("tr");
  if (!row) throw new Error(`no row for ${label}`);
  const cells = Array.from(row.querySelectorAll("td")).map((td) => (td.textContent ?? "").trim());
  return Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]));
}

describe("ActionMetricsTable", () => {
  it("shows the 165 refused debits under 'Refused (402/409)', not under any failure column", () => {
    const row = cellsFor("Agent Debit", [DEBIT]);

    expect(row["Refused (402/409)"]).toBe("165");
    expect(row["Fail (4xx)"]).toBe("0");
    expect(row["Fail (5xx)"]).toBe("0");
    expect(row["Success"]).toBe("410");
  });

  it("still shows a real client failure under 'Fail (4xx)' (a control)", () => {
    const row = cellsFor("Agent Debit", [{ ...DEBIT, clientFailures24h: 7, refusals24h: 0 }]);

    expect(row["Fail (4xx)"]).toBe("7");
    expect(row["Refused (402/409)"]).toBe("0");
  });

  it("shows a dash, not a zero, for an outcome that could not be read (a control)", () => {
    const row = cellsFor("Agent Debit", [
      { ...DEBIT, calls24h: null, successes24h: null, clientFailures24h: null, refusals24h: null, serverFailures24h: null },
    ]);

    expect(row["Refused (402/409)"]).toBe("—");
    expect(row["Fail (4xx)"]).toBe("—");
  });
});
