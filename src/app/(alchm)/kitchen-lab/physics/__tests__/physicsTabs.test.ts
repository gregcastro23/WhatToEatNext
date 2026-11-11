/**
 * @jest-environment node
 */
import { DEFAULT_PHYSICS_TAB, PHYSICS_TABS, tabFromParam, urlForTab } from "../physicsTabs";

describe("physics ?tab= contract", () => {
  it("opens the tab the query names — the tilt-skillet redirect depends on ?tab=vessel", () => {
    expect(tabFromParam("vessel")).toBe("vessel");
    expect(tabFromParam("latent")).toBe("latent");
  });

  it("falls back to the solver for an absent or unknown tab", () => {
    expect(DEFAULT_PHYSICS_TAB).toBe("solver");
    expect(tabFromParam(null)).toBe("solver");
    expect(tabFromParam("")).toBe("solver");
    expect(tabFromParam("tilt-skillet")).toBe("solver");
  });

  it("every tab id is unique and round-trips through its own URL", () => {
    const ids = PHYSICS_TABS.map(([id]) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      const url = new URL(urlForTab("https://alchm.kitchen/kitchen-lab/physics", id));
      expect(tabFromParam(url.searchParams.get("tab"))).toBe(id);
    }
  });

  it("drops ?tab for the default tab and keeps other parameters", () => {
    expect(urlForTab("https://alchm.kitchen/kitchen-lab/physics?tab=vessel&x=1", "solver")).toBe(
      "https://alchm.kitchen/kitchen-lab/physics?x=1",
    );
    expect(urlForTab("https://alchm.kitchen/kitchen-lab/physics?x=1", "vessel")).toBe(
      "https://alchm.kitchen/kitchen-lab/physics?x=1&tab=vessel",
    );
  });
});
