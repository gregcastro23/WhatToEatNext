/**
 * @file src/app/admin/mcp/__tests__/McpSourceBanner.test.tsx
 *
 * `/admin/mcp` printed "Planetary Agents status healthy" over whatever the proxy
 * returned, including WTEN's own tables when Planetary Agents could not be read. The
 * wording now follows `source`; the last block renders the real page with the service
 * mocked, so a page that stops using the banner is caught.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import McpAdminPage from "@/app/admin/mcp/page";
import { McpSourceBanner, mcpSourceNotice, mcpStatusLine } from "@/app/admin/mcp/McpSourceBanner";
import type { McpNetworkSummary } from "@/services/mcpNetworkService";

const mockGetSummary = jest.fn<Promise<McpNetworkSummary>, [number?]>();

jest.mock("@/services/mcpNetworkService", () => ({
  getMcpNetworkSummary: (windowMinutes?: number) => mockGetSummary(windowMinutes),
}));

const BASE: McpNetworkSummary = {
  live: true,
  generatedAt: "2026-11-23T03:00:00.000Z",
  windowMinutes: 60,
  verdict: "OK",
  totals: { calls: 12, success: 12, failures: 0, errorRate: 0, p50LatencyMs: 40, p95LatencyMs: 90, p99LatencyMs: 120 },
  byTool: [],
  byAgent: [],
  byCaller: [],
  syntheticProbe: { verdict: "OK", lastCalledAt: null, lastSuccess: null, consecutiveFailures: 0 },
};

describe("mcpStatusLine", () => {
  it("says Planetary Agents is healthy only for Planetary Agents' own data", () => {
    expect(mcpStatusLine({ ...BASE, source: "pa" })).toContain("Planetary Agents status healthy");
    expect(mcpStatusLine(BASE)).toContain("Planetary Agents status healthy"); // an older payload with no source
  });

  it("calls WTEN's own tables WTEN-local, never Planetary Agents", () => {
    const line = mcpStatusLine({ ...BASE, source: "wten-local" });

    expect(line).toContain("WTEN-local telemetry");
    expect(line).not.toContain("Planetary Agents");
  });

  it("keeps the stale wording when the read is not live (a control: unchanged behaviour)", () => {
    expect(mcpStatusLine({ ...BASE, live: false })).toContain("currently unreachable");
  });
});

describe("mcpSourceNotice", () => {
  it("is null for Planetary Agents' data, or when no source was recorded", () => {
    expect(mcpSourceNotice({ source: "pa" })).toBeNull();
    expect(mcpSourceNotice({})).toBeNull();
  });

  it("says the numbers are WTEN's own and why Planetary Agents was not used", () => {
    const notice = mcpSourceNotice({ source: "wten-local", fallbackReason: "http_401" });

    expect(notice?.headline).toContain("not Planetary Agents'");
    expect(notice?.detail).toContain("it answered HTTP 401");
    expect(notice?.detail).toContain("mcp_invocations");
  });
});

describe("McpSourceBanner", () => {
  it("renders a status notice for local data and nothing for Planetary Agents' data", () => {
    const local = render(<McpSourceBanner summary={{ source: "wten-local", fallbackReason: "timeout" }} />);
    expect(local.getByRole("status").textContent).toContain("the call timed out");
    local.unmount();

    const pa = render(<McpSourceBanner summary={{ source: "pa" }} />);
    expect(pa.queryByRole("status")).toBeNull();
  });
});

describe("the /admin/mcp page", () => {
  beforeEach(() => {
    mockGetSummary.mockReset();
  });

  it("shows the banner and not 'Planetary Agents status healthy' over WTEN's own data", async () => {
    mockGetSummary.mockResolvedValue({ ...BASE, source: "wten-local", fallbackReason: "http_401" });

    const view = render(<McpAdminPage />);

    expect(await screen.findByText("Showing WTEN's own MCP telemetry, not Planetary Agents'")).toBeTruthy();
    expect(view.container.textContent).not.toContain("Planetary Agents status healthy");
    view.unmount();
  });

  it("shows 'Planetary Agents status healthy' and no banner for Planetary Agents' own data (a control)", async () => {
    mockGetSummary.mockResolvedValue({ ...BASE, source: "pa" });

    const view = render(<McpAdminPage />);

    expect(await screen.findByText(/Planetary Agents status healthy/)).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    view.unmount();
  });
});
