import { render, screen } from "@testing-library/react";
import { FALLBACK_DATA } from "@/app/admin/_dashboard/data";
import { ResourceUsage } from "@/app/admin/_dashboard/extras";
import type { ResourceUsageData } from "@/services/dashboardPanelsService";

const NO_ITEMS: Pick<ResourceUsageData, "items" | "provider" | "periodLabel" | "live"> = {
  items: [],
  provider: "Railway",
  periodLabel: "",
  live: false,
};
const SET_TOKEN_HINT = "set RAILWAY_API_TOKEN to populate";

describe("Resource Usage panel tells the cause of 'no data' truthfully", () => {
  it("token unset → says to set the token", () => {
    render(<ResourceUsage data={{ ...NO_ITEMS, status: "token-unset", failure: null }} />);

    expect(screen.getByText(SET_TOKEN_HINT)).toBeTruthy();
    // subtitle + empty-state headline
    expect(screen.getAllByText("Railway usage not connected")).toHaveLength(2);
    expect(screen.getByText("○ NO SOURCE")).toBeTruthy();
  });

  it("token set but the call failed → shows the failure and does NOT tell the operator to set the token", () => {
    render(<ResourceUsage data={{ ...NO_ITEMS, status: "call-failed", failure: "HTTP 401 on usage" }} />);

    expect(
      screen.getByText("RAILWAY_API_TOKEN is set, but the Railway call failed: HTTP 401 on usage"),
    ).toBeTruthy();
    expect(screen.getAllByText("Railway usage unavailable")).toHaveLength(2);
    expect(screen.queryByText(SET_TOKEN_HINT)).toBeNull();
    expect(screen.queryByText("Railway usage not connected")).toBeNull();
    expect(screen.getByText("○ NO SOURCE")).toBeTruthy();
    expect(screen.queryByText(/% of projected/)).toBeNull();
  });

  it("the dashboard's loading fallback is neither 'token unset' nor 'failed'", () => {
    render(<ResourceUsage data={FALLBACK_DATA.resourceUsage} />);

    expect(FALLBACK_DATA.resourceUsage.status).toBe("unread");
    expect(screen.getAllByText("Railway usage not loaded")).toHaveLength(2);
    expect(screen.queryByText(SET_TOKEN_HINT)).toBeNull();
    expect(screen.queryByText(/call failed/)).toBeNull();
  });

  it("no data prop at all is the same unread state", () => {
    render(<ResourceUsage />);

    expect(screen.getAllByText("Railway usage not loaded")).toHaveLength(2);
    expect(screen.queryByText(SET_TOKEN_HINT)).toBeNull();
  });

  it("control: live data renders its rows and none of the no-source copy", () => {
    const live: ResourceUsageData = {
      items: [
        { resource: "Memory", measurement: "MEMORY_USAGE_GB", unit: "GB·hr", mtdValue: 100, projectedValue: 200, pct: 0.5 },
      ],
      provider: "Railway",
      periodLabel: "Jun 2026 MTD",
      live: true,
      status: "live",
      failure: null,
    };
    render(<ResourceUsage data={live} />);

    expect(screen.getByText("● LIVE")).toBeTruthy();
    expect(screen.getByText(/50% of projected/)).toBeTruthy();
    expect(screen.queryByText(SET_TOKEN_HINT)).toBeNull();
    expect(screen.queryByText(/call failed/)).toBeNull();
  });
});
