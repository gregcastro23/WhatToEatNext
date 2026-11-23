/**
 * @file src/app/admin/_dashboard/__tests__/APIHeatmapErrors.test.tsx
 *
 * The route heatmap on /admin/dashboard showed `errors5xx + errors4xx` under "ERR",
 * so `/api/economy/sync-debit`, whose every non-2xx over 7 days was an expected
 * 402 insufficient_funds, read as 5,346 errors. `routeErrorCell` has its own unit
 * test; this proves the card actually renders through it.
 */
import { render } from "@testing-library/react";
import React from "react";
import { APIHeatmap } from "@/app/admin/_dashboard/extras";
import type { RouteHeatmapData } from "@/services/dashboardPanelsService";

const buckets = (): number[] => Array.from({ length: 12 }, (_, i) => i);

function heatmapFor(errors5xx: number, errors4xx: number): RouteHeatmapData {
  return {
    windowHours: 24,
    bucketLabels: Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, "0")}:00`),
    routes: [
      { path: "/api/economy/sync-debit", buckets: buckets(), totalRequests: 6752, p95Ms: 120, errors5xx, errors4xx },
    ],
    canonicalRoutes: [],
    live: true,
  };
}

/** The cell the heatmap row renders for the route's error count (found by its tooltip). */
function errorCell(container: HTMLElement): HTMLElement {
  const cell = Array.from(container.querySelectorAll<HTMLElement>("span[title]")).find((el) =>
    (el.getAttribute("title") ?? "").includes(" 5xx (server errors)"),
  );
  if (!cell) throw new Error("the heatmap row has no error cell");
  return cell;
}

describe("APIHeatmap error column", () => {
  it("counts server errors only: 5,346 expected 402 responses and no 5xx reads as 0", () => {
    const { container } = render(<APIHeatmap routeHeatmap={heatmapFor(0, 5346)} />);

    const cell = errorCell(container);
    expect(cell.textContent).toBe("0");
    expect(cell.getAttribute("title")).toContain("5346 4xx");
  });

  it("shows the server error count when there is one (a control)", () => {
    const { container } = render(<APIHeatmap routeHeatmap={heatmapFor(3, 5346)} />);

    expect(errorCell(container).textContent).toBe("3");
  });

  it("labels the column 5XX, not ERR", () => {
    const { container } = render(<APIHeatmap routeHeatmap={heatmapFor(0, 0)} />);

    const labels = Array.from(container.querySelectorAll(".t-tag")).map((el) => (el.textContent ?? "").trim());
    expect(labels).toContain("5XX");
    expect(labels).not.toContain("ERR");
  });
});
