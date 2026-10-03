/**
 * The live admin pages must never draw a failed read as a measured zero, and
 * must label test-mode Stripe data as test data. These pin both.
 *
 * @file src/app/admin/__tests__/LiveAdminHonesty.test.tsx
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { BaseKpis, OperatorWallets } from "@/app/admin/chain/_components/BaseSections";
import { SolanaMilestones } from "@/app/admin/chain/_components/SolanaMilestones";
import { JobsKpis } from "@/app/admin/jobs/_components/JobsSummary";
import { JobsTable } from "@/app/admin/jobs/_components/JobsTable";
import { ModeBanner, RevenueKpis } from "@/app/admin/revenue/_components/RevenueSections";
import { TrafficStatusNotice } from "@/app/admin/traffic/_components/TrafficSections";
import type { BaseView, SolanaView } from "@/lib/admin/schemas/chain";
import type { JobsView } from "@/lib/admin/schemas/jobs";
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

describe("Base chain status", () => {
  it("shows a wrong RPC chain and leaves wallet gas unknown", () => {
    const base: BaseView = {
      generatedAt: "2026-09-30T00:00:00Z",
      chain: "Base Sepolia",
      chainId: 84532,
      explorer: "https://sepolia.basescan.org",
      reachable: false,
      error: "ESMS RPC reports eip155:8453; configured chain is eip155:84532",
      blockNumber: null,
      esmsContract: "0x124ECa1bb1E106D3614A22A256f9A412FfeEAd8F",
      contractCheck: {
        status: "rpc-chain-mismatch",
        address: "0x124ECa1bb1E106D3614A22A256f9A412FfeEAd8F",
        expectedChainId: 84532,
        rpcChainId: 8453,
        message: "ESMS RPC reports eip155:8453; configured chain is eip155:84532",
      },
      recipeRegistry: null,
      recipeNftEnabled: false,
      wallets: [{ role: "redeemer", address: "0x0000000000000000000000000000000000000001", eth: null, low: false, configured: true }],
      claims: { status: "error", byStatus: {}, last30d: 0, oldestPendingHours: null, totals: null, recent: [] },
      recipeMints: { status: "error", byStatus: {}, last30d: 0 },
    };
    render(<><BaseKpis base={base} /><OperatorWallets base={base} /></>);
    expect(screen.getByText("wrong chain")).toBeTruthy();
    expect(screen.getByText("blocked")).toBeTruthy();
    expect(screen.getByText("unknown")).toBeTruthy();
    expect(screen.queryByText("funded")).toBeNull();
    expect(screen.queryByText("refill")).toBeNull();
  });
});

describe("Jobs & probes", () => {
  const base: JobsView = {
    generatedAt: "2026-09-22T00:00:00Z",
    live: false,
    alertsLive: false,
    errors: ["run history: Query read timeout"],
    jobs: [],
    minuteLoad: [],
    alerts: [],
    alertWindowDays: 7,
  };

  it("says the run table is unreadable instead of listing jobs with zero runs", () => {
    render(<JobsTable data={base} />);
    expect(screen.getByText(/Run history unreadable/)).toBeTruthy();
    expect(screen.getByText(/Query read timeout/)).toBeTruthy();
  });

  it("renders missed runs and alert emails as unknown, not 0, when they could not be measured", () => {
    render(<JobsKpis data={base} />);
    expect(screen.getAllByText("run history unreadable")).toHaveLength(5);
    expect(screen.getByText("alert history unreadable")).toBeTruthy();
    expect(screen.getAllByText("—")).toHaveLength(6);
    // No fabricated fleet health from an empty list.
    expect(screen.queryByText("0/0")).toBeNull();
    expect(screen.queryByText("every job healthy")).toBeNull();
  });
});
