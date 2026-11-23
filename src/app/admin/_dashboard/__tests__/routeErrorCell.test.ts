/**
 * @file src/app/admin/_dashboard/__tests__/routeErrorCell.test.ts
 *
 * The route heatmap's error cell showed `errors5xx + errors4xx`, so a route whose
 * only non-2xx responses were expected 402/409 refusals read as a failing route.
 */
import { routeErrorCell } from "@/app/admin/_dashboard/routeErrorCell";

describe("routeErrorCell", () => {
  it("shows server errors only: 5,346 client responses and 0 server errors reads as 0", () => {
    expect(routeErrorCell(0, 5346).text).toBe("0");
  });

  it("shows the server error count when there is one", () => {
    expect(routeErrorCell(3, 5346).text).toBe("3");
  });

  it("keeps the 4xx visible: in the tooltip, and as an amber tint, so a 401 or 404 storm is not hidden", () => {
    const cell = routeErrorCell(0, 5346);
    expect(cell.title).toContain("5346 4xx");
    expect(cell.title).toContain("402 insufficient_funds and 409 already_applied are expected outcomes");
    expect(cell.color).toBe("var(--accent-2)");
  });

  it("is red for any server error, muted for none (a control: unchanged colour rules)", () => {
    expect(routeErrorCell(1, 0).color).toBe("var(--el-fire)");
    expect(routeErrorCell(1, 50).color).toBe("var(--el-fire)");
    expect(routeErrorCell(0, 0).color).toBe("var(--fg-mute)");
  });
});
