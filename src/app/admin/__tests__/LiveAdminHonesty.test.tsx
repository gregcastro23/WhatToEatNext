/**
 * The live admin pages must never draw a failed read as a measured zero, and
 * must label test-mode Stripe data as test data. These pin both.
 *
 * @file src/app/admin/__tests__/LiveAdminHonesty.test.tsx
 */

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { BaseKpis, OperatorWallets } from "@/app/admin/chain/_components/BaseSections";
import { SolanaMilestones } from "@/app/admin/chain/_components/SolanaMilestones";
import { JobsKpis } from "@/app/admin/jobs/_components/JobsSummary";
import { JobsTable } from "@/app/admin/jobs/_components/JobsTable";
import { ModeBanner, RevenueKpis } from "@/app/admin/revenue/_components/RevenueSections";
import { RecentVisits } from "@/app/admin/traffic/_components/RecentVisits";
import {
  ActivationStickinessStrip,
  InteractionTallyPanel,
  RouteFlowMatrixPanel,
  TrafficStatusNotice,
} from "@/app/admin/traffic/_components/TrafficSections";
import AdminCommandPalette, {
  buildCommandPaletteItems,
} from "@/components/admin/AdminCommandPalette";
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

  it("groups flat visits into clickable Visitor Journeys with dwell time, ref tags, and step trails", () => {
    const nowIso = new Date().toISOString();
    render(
      <RecentVisits
        visits={[
          {
            id: "2",
            at: nowIso,
            path: "/menu-planner",
            referrerHost: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-123456",
            visitorHash: "a4f9c2889900112233445566",
            durationMs: 45_000,
            refTag: "friend-feedback",
            interactions: ["planner:draft-week:balanced"],
            user: null,
          },
          {
            id: "1",
            at: new Date(Date.now() - 60_000).toISOString(),
            path: "/",
            referrerHost: "reddit.com",
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-123456",
            visitorHash: "a4f9c2889900112233445566",
            durationMs: 60_000,
            refTag: "friend-feedback",
            interactions: [],
            user: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Visitor #a4f9c2")).toBeTruthy();
    expect(screen.getAllByText("ref:friend-feedback").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("(2p)")).toBeTruthy();

    // Expand the session journey drawer
    fireEvent.click(screen.getByText("Journey ▼"));
    expect(screen.getByText(/Session Journey \(2 views\)/)).toBeTruthy();
    expect(screen.getByText(/planner:draft-week:balanced/)).toBeTruthy();
  });

  it("renders ?ref= attribution rollups, returning visitor badges, stuck/error diagnostics, and auto-expands deep-linked sessions", () => {
    const now = Date.now();
    render(
      <RecentVisits
        initialSessionKey="sess-second"
        refRollups={[
          {
            refTag: "alex-feedback",
            visitors: 4,
            sessions: 5,
            pageviews: 14,
            engagedSessions: 4,
            engagedRate: 0.8,
            medianDwellMs: 85_000,
            avgPagesPerSession: 2.8,
            signedInUsers: 2,
          },
        ]}
        visits={[
          {
            id: "v2",
            at: new Date(now - 10_000).toISOString(),
            path: "/menu-planner",
            referrerHost: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-second",
            visitorHash: "a4f9c2889900112233445566",
            durationMs: 30_000,
            refTag: "alex-feedback",
            interactions: ["conversion:cart_handoff", "error:api_500:amazon_search"],
            user: null,
          },
          {
            id: "v1",
            at: new Date(now - 3_600_000).toISOString(),
            path: "/menu-planner",
            referrerHost: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-first",
            visitorHash: "a4f9c2889900112233445566",
            durationMs: 65_000,
            refTag: "alex-feedback",
            interactions: [],
            user: null,
          },
        ]}
      />,
    );

    // ?ref= Attribution rollup table
    expect(screen.getByText("Share-link (?ref=) attribution & conversion")).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy();

    // Returning visitor badge (sess-second is the 2nd visit for visitor #a4f9c2)
    expect(screen.getByText("Returning (2nd visit)")).toBeTruthy();

    // Stuck & Error diagnostic badges
    expect(screen.getByText("⚠️ stuck")).toBeTruthy();
    expect(screen.getByText("🚨 error")).toBeTruthy();

    // Deep-linked session `sess-second` auto-expanded its Journey Drawer
    expect(screen.getByText(/conversion:cart_handoff/)).toBeTruthy();
    expect(screen.getByText(/error:api_500:amazon_search/)).toBeTruthy();
  });

  it("switches to Every Site View ledger with Entry/Step/Exit badges and clickable interaction pills", () => {
    const now = Date.now();
    render(
      <RecentVisits
        visits={[
          {
            id: "v-exit",
            viewId: "vid-exit",
            at: new Date(now - 5_000).toISOString(),
            lastSeenAt: new Date(now - 2_000).toISOString(),
            path: "/menu-planner",
            referrerHost: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-ledger-1",
            visitorHash: "c0ffee112233445566778899",
            durationMs: 32_000,
            refTag: null,
            interactions: ["plan:fill_week"],
            stepIndex: 2,
            stepCount: 2,
            isEntry: false,
            isExit: true,
            isEngaged: true,
            isLive: true,
            user: null,
          },
          {
            id: "v-entry",
            viewId: "vid-entry",
            at: new Date(now - 45_000).toISOString(),
            path: "/",
            referrerHost: "google.com",
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-ledger-1",
            visitorHash: "c0ffee112233445566778899",
            durationMs: 12_000,
            refTag: null,
            interactions: ["filter:param:tab=prep"],
            stepIndex: 1,
            stepCount: 2,
            isEntry: true,
            isExit: false,
            isEngaged: true,
            isLive: false,
            user: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Every Site View \(2\)/i }));

    expect(screen.getByText("Entry")).toBeTruthy();
    expect(screen.getByText("Exit")).toBeTruthy();
    expect(screen.getByText("Step 1/2")).toBeTruthy();
    expect(screen.getByText("Step 2/2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /plan:fill_week/i }));
    expect(screen.getByText("⚡ Interaction: plan:fill_week ×")).toBeTruthy();
    expect(screen.getByText("1 views")).toBeTruthy();
  });

  it("renders InteractionTallyPanel category pills, counts, and fires onSelectInteraction on drill-down", () => {
    const onSelectInteraction = jest.fn();
    render(
      <InteractionTallyPanel
        activeInteraction=""
        onSelectInteraction={onSelectInteraction}
        tallies={{
          totalInteractions: 14,
          totalSessionsWithInteractions: 6,
          categories: [
            { category: "plan", totalCount: 9, uniqueSessions: 5, sessionReachPct: 0.5 },
            { category: "conversion", totalCount: 5, uniqueSessions: 3, sessionReachPct: 0.3 },
          ],
          rows: [
            {
              tag: "plan:fill_week",
              category: "plan",
              tone: "feature",
              totalCount: 9,
              uniqueViews: 6,
              uniqueSessions: 5,
              uniqueVisitors: 4,
              sessionReachPct: 0.5,
              avgDwellMs: 42_000,
              topPath: "/menu-planner",
              lastSeenAt: "2026-11-16T02:00:00Z",
            },
            {
              tag: "conversion:cart_handoff",
              category: "conversion",
              tone: "conversion",
              totalCount: 5,
              uniqueViews: 4,
              uniqueSessions: 3,
              uniqueVisitors: 3,
              sessionReachPct: 0.3,
              avgDwellMs: 61_000,
              topPath: "/menu-planner",
              lastSeenAt: "2026-11-16T01:55:00Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Site-wide interaction tally")).toBeTruthy();
    expect(screen.getByRole("button", { name: /plan.*9 \(50%\)/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /conversion.*5 \(30%\)/i })).toBeTruthy();

    const filterButtons = screen.getAllByRole("button", { name: "Filter Views →" });
    expect(filterButtons).toHaveLength(2);
    const [firstFilterButton] = filterButtons;
    if (firstFilterButton) fireEvent.click(firstFilterButton);
    expect(onSelectInteraction).toHaveBeenCalledWith("plan:fill_week");
  });

  it("renders ActivationStickinessStrip and RouteFlowMatrixPanel with friction drill-down", () => {
    const onSelectPath = jest.fn();
    const onSelectFriction = jest.fn();

    render(
      <>
        <ActivationStickinessStrip
          summary={{
            totalVisitors: 100,
            newVisitors: 70,
            returningVisitors: 30,
            returningRatePct: 0.3,
            activatedSessions: 45,
            activationRatePct: 0.45,
            avgTimeToFirstActionMs: 12_000,
            frustratedSessions: 5,
            frustrationRatePct: 0.05,
            dauCount: 25,
            wauCount: 100,
            stickinessRatioPct: 0.25,
          }}
        />
        <RouteFlowMatrixPanel
          rows={[
            {
              path: "/menu-planner",
              totalViews: 40,
              uniqueSessions: 25,
              entryCount: 15,
              entryRatePct: 0.6,
              exitCount: 10,
              exitRatePct: 0.4,
              singlePageBounceRatePct: 0.2,
              avgDwellMs: 55_000,
              frictionCount: 4,
              topNextPaths: [{ path: "/recipes", count: 9 }],
            },
          ]}
          onSelectPath={onSelectPath}
          onSelectFriction={onSelectFriction}
        />
      </>,
    );

    expect(screen.getByText("Activation Rate")).toBeTruthy();
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByText("DAU / WAU Stickiness")).toBeTruthy();
    expect(screen.getByText("Route pathfinder & exit matrix")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "/menu-planner" }));
    expect(onSelectPath).toHaveBeenCalledWith("/menu-planner");

    fireEvent.click(screen.getByRole("button", { name: /🔥 4/ }));
    expect(onSelectFriction).toHaveBeenCalledWith("/menu-planner");
  });

  it("supports Frustrated preset, Copy Session JSON, and inline Mark Resolved triage in RecentVisits", () => {
    const origFetch = globalThis.fetch;
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
      configurable: true,
      writable: true,
    });

    const now = Date.now();
    render(
      <RecentVisits
        initialSessionKey="sess-frustrated"
        visits={[
          {
            id: "vf-1",
            viewId: "vid-f1",
            at: new Date(now - 10_000).toISOString(),
            path: "/menu-planner",
            referrerHost: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            sessionId: "sess-frustrated",
            visitorHash: "deadbeef1122334455667788",
            durationMs: 25_000,
            refTag: null,
            interactions: ["friction:rage_click:/menu-planner:generate"],
            user: null,
          },
        ]}
        sessions={[
          {
            sessionKey: "sess-frustrated",
            visitorHash: "deadbeef1122334455667788",
            sessionId: "sess-frustrated",
            startedAt: new Date(now - 25_000).toISOString(),
            lastSeenAt: new Date(now - 2_000).toISOString(),
            totalDurationMs: 25_000,
            pageCount: 1,
            engaged: true,
            activeNow: true,
            liveNow90s: true,
            isStuck: false,
            hasError: false,
            hasFriction: true,
            entryPath: "/menu-planner",
            exitPath: "/menu-planner",
            referrerHost: null,
            utmSource: null,
            refTag: null,
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "desktop",
            browser: "Chrome",
            os: "macOS",
            user: null,
            steps: [
              {
                id: "vf-1",
                at: new Date(now - 10_000).toISOString(),
                path: "/menu-planner",
                durationMs: 25_000,
                refTag: null,
                interactions: ["friction:rage_click:/menu-planner:generate"],
              },
            ],
            feedback: [
              {
                id: "42",
                at: new Date(now - 5_000).toISOString(),
                viewId: "vid-f1",
                sessionId: "sess-frustrated",
                visitorHash: "deadbeef1122334455667788",
                path: "/menu-planner",
                refTag: null,
                rating: 3,
                note: "Button did not respond on first clicks",
                status: "open",
                resolvedAt: null,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /🔥 Frustrated \(Rage \/ Dead Click \/ Quick Back\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /💬 Has Open Feedback/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Copy Session JSON" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("sess-frustrated");

    fireEvent.click(screen.getByRole("button", { name: "Mark Resolved" }));
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/admin/feedback",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ id: "42", status: "resolved" }),
      }),
    );
    expect(screen.getByRole("button", { name: "Reopen" })).toBeTruthy();
    Object.defineProperty(globalThis, "fetch", {
      value: origFetch,
      configurable: true,
      writable: true,
    });
  });

  it("renders UI experiment variant cohorts in ActivationStickinessStrip and AdminCommandPalette ⌘K jumps", () => {
    mockPush.mockReset();

    render(
      <>
        <ActivationStickinessStrip
          summary={{
            totalVisitors: 50,
            newVisitors: 40,
            returningVisitors: 10,
            returningRatePct: 0.2,
            activatedSessions: 25,
            activationRatePct: 0.5,
            avgTimeToFirstActionMs: 9_000,
            frustratedSessions: 2,
            frustrationRatePct: 0.04,
            dauCount: 20,
            wauCount: 50,
            stickinessRatioPct: 0.4,
            variants: [
              {
                variant: "variant:planner=compact",
                sessions: 15,
                activatedSessions: 9,
                activationRatePct: 0.6,
                frustratedSessions: 1,
                frustrationRatePct: 0.07,
              },
            ],
          }}
        />
        <AdminCommandPalette />
      </>,
    );

    expect(screen.getByText("Active UI Experiment Variants")).toBeTruthy();
    expect(screen.getByText("variant:planner=compact")).toBeTruthy();
    expect(screen.getByText("60% act")).toBeTruthy();

    // Synthesize dynamic ⌘K jump routes
    expect(buildCommandPaletteItems("#a4f9c2")[0]?.href).toBe("/admin/traffic?q=a4f9c2");
    expect(buildCommandPaletteItems("ref:prod-smoke")[0]?.href).toBe("/admin/traffic?ref=prod-smoke");
    expect(buildCommandPaletteItems("preset:open_feedback")[0]?.href).toBe("/admin/traffic?preset=open_feedback");
    expect(buildCommandPaletteItems("/menu-planner")[0]?.href).toBe("/admin/traffic?q=%2Fmenu-planner&view=views");

    // Trigger Cmd+K shortcut and select Open Feedback Triage preset
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog", { name: "Admin Jump Command Palette" })).toBeTruthy();

    fireEvent.click(screen.getByText("Open Feedback Triage"));
    expect(mockPush).toHaveBeenCalledWith("/admin/traffic?preset=open_feedback");
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
