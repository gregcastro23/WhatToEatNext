/**
 * Guards the honesty contract for the reliability surface.
 *
 * The panel exists because three sources were being collected and never read.
 * Two failure modes would make it worse than useless:
 *   - rendering `live: false` as a zero (a fabricated "0 failures" reads as
 *     healthy when the truth is "we could not measure"), and
 *   - showing that an alert fired without showing it reached nobody.
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { makeDocumentVisible } from "@/utils/testing/pollingTestEnv";
import ReliabilityPanel from "@/components/admin/ReliabilityPanel";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";

// jsdom reports `document.hidden === true` under this jest config, which trips
// useHardenedPolling's visibility guard and means the panel never fetches.
let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => restoreVisibility());

function payload(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    generatedAt: "2026-08-17T18:00:00.000Z",
    health: {
      points: [
        { capturedAt: "2026-08-17T17:00:00.000Z", overall: "INCIDENT" },
        { capturedAt: "2026-08-17T18:00:00.000Z", overall: "OK" },
      ],
      windowHours: 168,
      uptimePct: 50,
      drift: {
        thisWeekBadRate: 0.826,
        lastWeekBadRate: 0.144,
        delta: 0.682,
        thisWeekSamples: 167,
        lastWeekSamples: 167,
      },
      live: true,
    },
    probes: {
      probes: [
        {
          probeName: "cosmic-recipe",
          runs: 167,
          failures: 16,
          failureRate: 16 / 167,
          p50LatencyMs: 2651,
          p95LatencyMs: 10002,
          maxLatencyMs: 10005,
          lastRunAt: "2026-08-17T18:00:22.248Z",
          lastStatus: "success",
          lastError: "Probe timed out after 10000ms",
        },
      ],
      windowDays: 7,
      totalRuns: 167,
      totalFailures: 16,
      live: true,
    },
    alerts: {
      windowDays: 30,
      alertsFired: 176,
      suppressed: 0,
      channels: [
        {
          channel: "slack",
          attempted: 176,
          delivered: 0,
          failed: 176,
          deliveryRate: 0,
          lastError: "ALERT_SLACK_WEBHOOK_URL not set",
          lastFailureAt: "2026-08-17T18:00:43.942Z",
        },
        {
          channel: "email",
          attempted: 176,
          delivered: 176,
          failed: 0,
          deliveryRate: 1,
          lastError: null,
          lastFailureAt: null,
        },
      ],
      live: true,
    },
    ...overrides,
  };
}

function mockFetch(body: unknown, ok = true) {
  installFetchMock(
    jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body }),
  );
}

describe("ReliabilityPanel honesty", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("names the channel an alert failed to reach instead of only saying it fired", async () => {
    mockFetch(payload());
    render(<ReliabilityPanel />);

    // The count sits in its own <span>, so match on the container's text.
    await waitFor(() =>
      expect(
        screen.getByText(
          (_, el) =>
            el?.tagName === "P" &&
            /176\s*alerts fired in 30d/.test(el.textContent ?? ""),
        ),
      ).toBeInTheDocument(),
    );

    // The whole point: 176 fired, 0 reached Slack.
    expect(
      screen.getByText("Never delivered — every attempt failed"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ALERT_SLACK_WEBHOOK_URL not set"),
    ).toBeInTheDocument();
    expect(screen.getByText("0/176")).toBeInTheDocument();
    // ...while the working channel is not smeared with the same warning.
    expect(screen.getByText("176/176")).toBeInTheDocument();
  });

  it("reports a probe's failure rate across the window, not just its last run", async () => {
    mockFetch(payload());
    render(<ReliabilityPanel />);

    await waitFor(() =>
      expect(screen.getByText("cosmic-recipe")).toBeInTheDocument(),
    );

    // Last run was a success; the window says otherwise.
    expect(screen.getByText("9.6%")).toBeInTheDocument();
    expect(
      screen.getByText("Probe timed out after 10000ms"),
    ).toBeInTheDocument();
  });

  it("surfaces week-over-week drift so a multi-day degradation is visible", async () => {
    mockFetch(payload());
    render(<ReliabilityPanel />);

    await waitFor(() =>
      expect(screen.getByText(/degrading/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/14\.4% → 82\.6% unhealthy/)).toBeInTheDocument();
  });

  it("renders an unreadable source as 'no source', never as a zero", async () => {
    mockFetch(
      payload({
        health: {
          points: [],
          windowHours: 168,
          uptimePct: null,
          drift: null,
          live: false,
        },
        probes: {
          probes: [],
          windowDays: 7,
          totalRuns: 0,
          totalFailures: 0,
          live: false,
        },
        alerts: {
          windowDays: 30,
          alertsFired: 0,
          suppressed: 0,
          channels: [],
          live: false,
        },
      }),
    );
    render(<ReliabilityPanel />);

    await waitFor(() =>
      expect(screen.getAllByText("No source")).toHaveLength(3),
    );
    expect(
      screen.getAllByText(/This is not a zero — the value is unknown/),
    ).toHaveLength(3);

    // A failed read must never render as a healthy-looking 0%/100%.
    expect(screen.queryByText("0.0%")).not.toBeInTheDocument();
    expect(screen.queryByText("100.0%")).not.toBeInTheDocument();
  });

  it("distinguishes a measured-empty window from an unreadable one", async () => {
    mockFetch(
      payload({
        alerts: {
          windowDays: 30,
          alertsFired: 0,
          suppressed: 0,
          channels: [],
          // live: true + zero rows === genuinely nothing happened.
          live: true,
        },
      }),
    );
    render(<ReliabilityPanel />);

    await waitFor(() =>
      expect(
        screen.getByText("No alerts fired in the last 30d."),
      ).toBeInTheDocument(),
    );
    // That is a real zero, so it must NOT claim the source was unreadable.
    expect(screen.queryByText("Alert delivery records")).not.toBeInTheDocument();
  });
});
