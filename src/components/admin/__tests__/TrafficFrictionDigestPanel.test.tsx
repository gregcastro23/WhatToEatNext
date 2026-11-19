/**
 * Component tests for TrafficFrictionDigestPanel & TrafficFrictionDigestSections.
 *
 * @file src/components/admin/__tests__/TrafficFrictionDigestPanel.test.tsx
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { makeDocumentVisible } from "@/__tests__/helpers/pollingTestEnv";
import TrafficFrictionDigestPanel from "../TrafficFrictionDigestPanel";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => {
  restoreVisibility?.();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function samplePayload(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    generatedAt: "2026-11-18T17:30:00.000Z",
    range: "24h",
    live: true,
    synthesisMode: "ai",
    model: "gpt-4o-mini",
    fallbackReason: null,
    narrative: {
      headline: "Attention needed: rage clicks on /menu-planner",
      severity: "action_needed",
      executiveSummary: "88 human views (+46.7%), 4 rage clicks on /menu-planner, +150% instant_plan lift.",
      topFindings: [
        {
          category: "friction",
          title: "Rage clicks on /menu-planner",
          detail: "4 rage clicks recorded across 2 sessions.",
          severity: "critical",
          actionHref: "/admin/traffic?preset=friction",
        },
      ],
      recommendedActions: [
        {
          priority: "P0",
          action: "Inspect /menu-planner button responsiveness",
          rationale: "Prevent mobile drop-off on FastStartCard.",
          targetPath: "/admin/traffic?preset=friction",
        },
      ],
    },
    facts: {
      range: "24h",
      liveSources: 7,
      totalSources: 7,
      degradedSources: [],
      totals: {
        pageviews: 88,
        visitors: 31,
        sessions: 34,
        signedInUsers: 9,
        bounceRate: 0.21,
        pagesPerSession: 2.59,
      },
      previous: {
        pageviews: 60,
        visitors: 24,
        sessions: 26,
        signedInUsers: 6,
        bounceRate: 0.27,
        pagesPerSession: 2.31,
      },
      pageviewsDeltaPct: 46.7,
      activationRatePct: 0.52,
      frustrationRatePct: 0.12,
      dauCount: 31,
      wauCount: 84,
      topRoutes: [
        {
          path: "/menu-planner",
          views: 36,
          sessions: 21,
          bounceRatePct: 0.14,
          avgDwellMs: 49_000,
          frictionCount: 4,
        },
      ],
      frictionSummary: {
        rageClicks: 4,
        deadClicks: 1,
        quickBacks: 0,
        slowCwvHits: 1,
        errorSessions60m: 0,
        errorBurstTriggered: false,
        topErrorTag: null,
        topZeroResultQuery: { slug: "cardamom", sessions: 2 },
        activeReviewerCount: 0,
      },
      frictionSignals: [
        {
          tag: "friction:rage_click",
          label: "Rage Click",
          tone: "friction",
          totalCount: 4,
          uniqueSessions: 2,
          topPath: "/menu-planner",
        },
      ],
      experiment: {
        experimentKey: "fast_start_cta",
        variants: [
          {
            variant: "variant:fast_start_cta=control",
            sessions: 20,
            activatedSessions: 5,
            activationRatePct: 0.25,
            frustratedSessions: 1,
            frustrationRatePct: 0.05,
            liftVsControlPct: null,
            confidenceLabel: "Trending",
          },
          {
            variant: "variant:fast_start_cta=instant_plan",
            sessions: 20,
            activatedSessions: 12,
            activationRatePct: 0.6,
            frustratedSessions: 1,
            frustrationRatePct: 0.05,
            liftVsControlPct: 140,
            confidenceLabel: "Statistically Significant (95%+)",
          },
        ],
        leaderVariant: "variant:fast_start_cta=instant_plan",
        liftVsControlPct: 140,
        confidenceLabel: "Statistically Significant (95%+)",
      },
      openFeedbackCount: 1,
      openLowRatingCount: 1,
      openFeedback: [
        {
          id: "fb-1",
          at: "2026-11-18T17:10:00.000Z",
          path: "/menu-planner",
          rating: 2,
          note: "Planner filter button unresponsive",
          refTag: null,
          sessionId: "sess-1",
        },
      ],
    },
    ...overrides,
  };
}

describe("TrafficFrictionDigestPanel", () => {
  it("renders synthesized brief, severity, AI pill, findings, actions, and expandable disclosures", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => samplePayload(),
    });
    installFetchMock(fetchMock);

    render(<TrafficFrictionDigestPanel />);

    await waitFor(() => {
      expect(screen.getByText("Attention needed: rage clicks on /menu-planner")).toBeInTheDocument();
    });

    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("ACTION NEEDED")).toBeInTheDocument();
    expect(screen.getByText("AI · gpt-4o-mini")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("+140% lift")).toBeInTheDocument();
    expect(screen.getByText("Inspect /menu-planner button responsiveness")).toBeInTheDocument();

    // Disclosures contain Top Routes, Active Friction, A/B Lift, Open Feedback
    expect(screen.getByText("Top Routes (1)")).toBeInTheDocument();
    expect(screen.getByText("A/B Variant Lift (2 arms)")).toBeInTheDocument();
    expect(screen.getByText("Open User Feedback (1)")).toBeInTheDocument();
    expect(screen.getByText("Planner filter button unresponsive")).toBeInTheDocument();

    // Switch window to 7d and wait for panel re-render before clicking Re-synthesize
    fireEvent.click(screen.getByRole("button", { name: "7d" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/traffic-digest?range=7d",
        { cache: "no-store" },
      );
    });

    const refreshBtn = await screen.findByRole("button", { name: "Re-synthesize" });
    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/traffic-digest?range=7d&refresh=1",
        { cache: "no-store" },
      );
    });
  });

  it("renders em-dashes and PARTIAL provenance when telemetry sources degrade", async () => {
    const partial = samplePayload({
      synthesisMode: "deterministic",
      model: null,
      fallbackReason: "OPENAI_API_KEY not configured",
      facts: {
        ...samplePayload().facts,
        liveSources: 5,
        degradedSources: ["totals", "activation"],
        activationRatePct: null,
      },
    });
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => partial }),
    );

    render(<TrafficFrictionDigestPanel />);

    await waitFor(() => {
      expect(screen.getByText("PARTIAL 5/7")).toBeInTheDocument();
    });
    expect(screen.getByText("RULE-BASED")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("totals offline")).toBeInTheDocument();
  });

  it("renders honest EmptyState on HTTP failure", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ success: false }) }),
    );

    render(<TrafficFrictionDigestPanel />);

    await waitFor(() => {
      expect(screen.getByText("Could not load AI Traffic & Friction Digest")).toBeInTheDocument();
    });
  });
});
