/**
 * The live admin pages must never draw a failed read as a measured zero, and
 * must label test-mode Stripe data as test data. These pin both.
 *
 * @file src/app/admin/__tests__/LiveAdminHonesty.test.tsx
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { SolanaMilestones } from "@/app/admin/chain/_components/SolanaMilestones";
import { ModeBanner, RevenueKpis } from "@/app/admin/revenue/_components/RevenueSections";
import { TrafficStatusNotice } from "@/app/admin/traffic/_components/TrafficSections";
import type { SolanaView } from "@/lib/admin/schemas/chain";
import type { RevenueView } from "@/lib/admin/schemas/revenue";
import type { TrafficSummaryView } from "@/lib/admin/schemas/traffic";

function revenue(overrides: Partial<RevenueView>): RevenueView {
  return {
    generatedAt: "2026-09-22T00:00:00Z",
    configured: true,
    mode: "live",
    errors: [],
    balance: null,
    subscriptions: null,
    charges: null,
    checkout: null,
    events: null,
    webhookCoverage: null,
    ...overrides,
  };
}

describe("Revenue", () => {
  it("renders an em-dash, not $0.00, when Stripe could not be read", () => {
    render(<RevenueKpis data={revenue({ errors: ["subscriptions: timeout"] })} />);
    expect(screen.queryByText("$0.00")).toBeNull();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(6);
  });

  it("renders a measured zero as $0.00 when Stripe answered with no subscriptions", () => {
    render(
      <RevenueKpis
        data={revenue({
          subscriptions: { mrr: [], byStatus: {}, active: 0, newLast30d: 0, canceledLast30d: 0, truncated: false },
        })}
      />,
    );
    expect(screen.getByText("$0.00")).toBeTruthy();
  });

  it("labels test-mode data as test payments", () => {
    render(<ModeBanner data={revenue({ mode: "test" })} />);
    expect(screen.getByText(/test payments, not revenue/i)).toBeTruthy();
  });
});

describe("Traffic", () => {
  it("explains a missing page_views table instead of showing zero visitors", () => {
    const totals = { pageviews: 0, visitors: 0, sessions: 0, signedInUsers: 0, bounceRate: null, pagesPerSession: null };
    const data: TrafficSummaryView = {
      generatedAt: "2026-09-22T00:00:00Z", range: "24h", status: "missing-table", detail: "page_views does not exist yet",
      trackingSince: null, totalPageviewsAllTime: 0, activeNow: { visitors: 0, pages: [] }, totals, previous: totals,
      series: [], bucketUnit: "hour", topPages: [], entryPages: [], referrers: [], utmSources: [], countries: [],
      devices: [], browsers: [], operatingSystems: [], bots: 0, recent: [],
    };
    render(<TrafficStatusNotice data={data} />);
    expect(screen.getByText("Not yet recording")).toBeTruthy();
  });
});

describe("Solana milestones", () => {
  it("marks unreadable steps unknown rather than done or not done", () => {
    const solana: SolanaView = {
      generatedAt: "2026-09-22T00:00:00Z",
      manifestSource: "test",
      manifestsFound: { devnet: true, governance: false, audit: false, mainnet: true },
      asolHealth: { status: "not-configured", detail: null, body: null },
      repo: { status: "error", detail: "offline", commits: [], commits7d: 0, commits30d: 0, openPulls: [] },
      devnet: {
        reachable: false, error: "timeout", rpc: "x", slot: null, genesisMatch: null, program: null, config: null,
        deployer: null, mints: [], pools: [], governance: null, activity: null, auditReceipt: null,
      },
      mainnet: {
        reachable: false, error: "timeout", manifestStatus: null, programDeployed: null, mintsCreated: null,
        mintsTotal: 4, upgradeAuthorityTransferred: null,
      },
    };
    render(<SolanaMilestones solana={solana} />);
    expect(screen.getAllByText("unknown").length).toBeGreaterThanOrEqual(6);
    expect(screen.queryByText("done")).toBeNull();
  });
});
