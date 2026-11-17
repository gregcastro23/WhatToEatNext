/**
 * Verifies that useHardenedPolling pauses when `document.visibilityState === "hidden"`
 * and skips polling entirely when `enabled: false` (multiplexed mode).
 *
 * @file src/hooks/__tests__/useHardenedPolling.visibility.test.tsx
 */

import { renderHook } from "@testing-library/react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

describe("useHardenedPolling visibility & enabled guards", () => {
  let hidden = false;
  let visibilityState: DocumentVisibilityState = "visible";

  beforeEach(() => {
    jest.useFakeTimers();
    hidden = false;
    visibilityState = "visible";
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("skips network ticks while document.visibilityState is hidden and resumes on visible", async () => {
    hidden = true;
    visibilityState = "hidden";
    const poll = jest.fn().mockResolvedValue({ ok: true });

    renderHook(() => useHardenedPolling(poll, { baseIntervalMs: 1_000 }));
    expect(poll).not.toHaveBeenCalled();

    hidden = false;
    visibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    expect(poll).toHaveBeenCalledTimes(1);
  });

  it("does not poll when enabled is false", () => {
    const poll = jest.fn().mockResolvedValue({ ok: true });
    renderHook(() => useHardenedPolling(poll, { baseIntervalMs: 1_000, enabled: false }));
    jest.advanceTimersByTime(5_000);
    expect(poll).not.toHaveBeenCalled();
  });
});
