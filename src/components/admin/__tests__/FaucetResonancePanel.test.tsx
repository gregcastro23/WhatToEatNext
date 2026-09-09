/**
 * The panel is admin-gated, so it cannot be eyeballed without a session. These
 * render it directly against mocked payloads instead — covering the two states
 * that matter operationally (honest empty vs live) and the rail-pressure
 * warning, which is the whole reason the panel exists.
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FaucetResonancePanel } from "@/components/admin/FaucetResonancePanel";

const livePayload = {
  success: true,
  live: true,
  reason: null,
  windowDays: 30,
  claims: 120,
  claimants: 40,
  buckets: [
    { from: 3, to: 6, claims: 10 },
    { from: 6, to: 9, claims: 20 },
    { from: 9, to: 12, claims: 30 },
    { from: 12, to: 15, claims: 30 },
    { from: 15, to: 18, claims: 20 },
    { from: 18, to: 21, claims: 8 },
    { from: 21, to: 24, claims: 2 },
  ],
  atMin: 4,
  atMax: 2,
  railShare: 0.05,
  meanTotal: 12.1,
  minTotal: 3,
  maxTotal: 24,
  meanRatio: 1.008,
  annualPace: 4416.5,
  annualTarget: 4380,
  baselineVersions: ["synastry-annual-v2:2026"],
};

/**
 * A minimal stub rather than a real `Response`. The cast is the standard way to
 * stand in for `fetch`; `jest.spyOn(globalThis, "fetch")` with a real Response
 * would avoid it, and is worth revisiting.
 */
function mockFetch(payload: unknown, ok = true): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => payload,
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("FaucetResonancePanel", () => {
  beforeAll(() => {
    // This jsdom config reports visibilityState "prerender" / hidden true, and
    // useHardenedPolling deliberately does not poll a hidden document — so
    // without this every panel here would sit on its loading spinner forever
    // and each assertion would fail for the wrong reason.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders band occupancy and emission pace from a live payload", async () => {
    mockFetch(livePayload);
    render(<FaucetResonancePanel />);

    await waitFor(() => expect(screen.getByText("Band occupancy")).toBeTruthy());
    expect(screen.getByText("Emission pace")).toBeTruthy();
    // Annual pace is rendered as a rounded, localised integer.
    expect(screen.getByText("4,417")).toBeTruthy();
    // 4416.5 vs 4380 is +0.8% — inside the ±5% the calibration promises.
    expect(screen.getByText("+0.8%")).toBeTruthy();
    expect(screen.getByText("5.0% on a rail")).toBeTruthy();
    expect(screen.queryByText("Rail pressure")).toBeNull();
  });

  it("warns when claims pile up on a rail", async () => {
    mockFetch({ ...livePayload, atMin: 40, atMax: 20, railShare: 0.5 });
    render(<FaucetResonancePanel />);

    // The signal the panel exists to surface: the band, not the resonance,
    // is deciding what people earn.
    await waitFor(() => expect(screen.getByText("Rail pressure")).toBeTruthy());
    expect(screen.getByText("50.0% on a rail")).toBeTruthy();
  });

  it("says so honestly when there is no source, rather than rendering zeros", async () => {
    mockFetch({
      ...livePayload,
      live: false,
      reason: "Resonance source unavailable (is migration 84 applied?).",
      claims: 0,
      buckets: [],
      meanTotal: null,
      annualPace: null,
    });
    render(<FaucetResonancePanel />);

    await waitFor(() =>
      expect(screen.getByText("No resonance recorded yet")).toBeTruthy(),
    );
    expect(
      screen.getByText("Resonance source unavailable (is migration 84 applied?)."),
    ).toBeTruthy();
    // A zeroed panel must never claim to be showing measurements.
    expect(screen.queryByText("Band occupancy")).toBeNull();
    expect(screen.queryByText("Emission pace")).toBeNull();
  });

  it("does not render a malformed payload as if it were data", async () => {
    // meanTotal as a string is the shape a schema change would produce.
    mockFetch({ ...livePayload, meanTotal: "12.1" });
    render(<FaucetResonancePanel />);

    await waitFor(() =>
      expect(screen.getByText(/payload malformed/i)).toBeTruthy(),
    );
    expect(screen.queryByText("Band occupancy")).toBeNull();
  });
});
