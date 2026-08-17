/**
 * `refreshNow` is a legitimate effect dependency — `_dashboard/agents.tsx`
 * refetches through it when a filter changes. That only works if its identity
 * is stable. When the hook returned a fresh closure each render, those effects
 * became self-triggering: refresh → setState → re-render → new identity →
 * refresh, with no interval in the loop at all.
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import { makeDocumentVisible } from "@/utils/testing/pollingTestEnv";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => restoreVisibility());

describe("useHardenedPolling refreshNow identity", () => {
  it("keeps a stable identity across re-renders", async () => {
    const identities = new Set<unknown>();

    function Probe() {
      const [tick, setTick] = React.useState(0);
      const { refreshNow } = useHardenedPolling(
        React.useCallback(async () => ({ ok: true }), []),
        { baseIntervalMs: 60_000 },
      );
      identities.add(refreshNow);
      // Force a bounded number of re-renders, as a polling panel does when
      // data lands. Bound on `tick`, never on `identities.size` — the latter
      // stays 1 when the hook is correct, which is itself an infinite loop.
      React.useEffect(() => {
        if (tick < 3) setTick((t) => t + 1);
      }, [tick]);
      return null;
    }

    render(<Probe />);

    await waitFor(() => expect(identities.size).toBeGreaterThan(0));
    // One identity no matter how many renders happened.
    expect(identities.size).toBe(1);
  });
});
