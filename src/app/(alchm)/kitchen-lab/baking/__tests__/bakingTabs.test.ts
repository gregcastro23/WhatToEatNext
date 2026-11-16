/** @jest-environment node */
import { BAKING_TABS, bakingTabFromParam, DEFAULT_BAKING_TAB, systemForTab, urlForBakingTab } from "../bakingTabs";

describe("the ?tab= contract of /kitchen-lab/baking", () => {
  it("parses every tab and falls back to the formula on anything else", () => {
    for (const [id] of BAKING_TABS) expect(bakingTabFromParam(id)).toBe(id);
    expect(bakingTabFromParam(null)).toBe(DEFAULT_BAKING_TAB);
    expect(bakingTabFromParam("bogus")).toBe(DEFAULT_BAKING_TAB);
  });

  it("drops the parameter for the default tab and keeps other parameters", () => {
    expect(urlForBakingTab("https://x.test/kitchen-lab/baking?tab=oven&a=1", "formula")).toBe("https://x.test/kitchen-lab/baking?a=1");
    expect(urlForBakingTab("https://x.test/kitchen-lab/baking", "oven")).toBe("https://x.test/kitchen-lab/baking?tab=oven");
  });

  it("puts the alchm reading on exactly one tab, so no tab mixes the two systems", () => {
    expect(BAKING_TABS.filter(([id]) => systemForTab(id) === "alchm").map(([id]) => id)).toEqual(["elements"]);
  });
});
