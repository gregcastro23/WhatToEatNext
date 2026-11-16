/** @jest-environment node */
import { BAKING_TABS, bakingHref, bakingTabFromParam, DEFAULT_BAKING_TAB, DEFAULT_GOOD_ID, goodFromParam, systemForTab, urlForBakingGood, urlForBakingTab } from "../bakingTabs";

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

describe("the ?good= contract of /kitchen-lab/baking", () => {
  it("names the default good when the parameter is absent or blank, and passes any id through trimmed", () => {
    expect(goodFromParam(null)).toBe(DEFAULT_GOOD_ID);
    expect(goodFromParam("  ")).toBe(DEFAULT_GOOD_ID);
    expect(goodFromParam(" brioche-loaf ")).toBe("brioche-loaf");
  });

  it("sets the good beside the tab, keeps every other parameter, and drops the default", () => {
    const recipe = "american-dessert-all-authentic-chocolate-chip-cookies";
    expect(urlForBakingGood("https://x.test/kitchen-lab/baking?tab=oven&a=1", recipe)).toBe(`https://x.test/kitchen-lab/baking?tab=oven&a=1&good=${recipe}`);
    expect(urlForBakingGood(`https://x.test/kitchen-lab/baking?good=${recipe}&tab=oven`, DEFAULT_GOOD_ID)).toBe("https://x.test/kitchen-lab/baking?tab=oven");
    expect(urlForBakingTab(`https://x.test/kitchen-lab/baking?good=${recipe}`, "swap")).toBe(`https://x.test/kitchen-lab/baking?good=${recipe}&tab=swap`);
  });

  it("switches from one non-default good or tab to another, never leaving the old one in the URL", () => {
    expect(urlForBakingGood("https://x.test/kitchen-lab/baking?good=a&tab=oven", "b")).toBe("https://x.test/kitchen-lab/baking?good=b&tab=oven");
    expect(urlForBakingTab("https://x.test/kitchen-lab/baking?good=a&tab=oven", "swap")).toBe("https://x.test/kitchen-lab/baking?good=a&tab=swap");
  });

  it("links a tab of a good in the same contract", () => {
    expect(bakingHref(DEFAULT_BAKING_TAB, DEFAULT_GOOD_ID)).toBe("/kitchen-lab/baking");
    expect(bakingHref("elements", DEFAULT_GOOD_ID)).toBe("/kitchen-lab/baking?tab=elements");
    expect(bakingHref("elements", "brioche-loaf")).toBe("/kitchen-lab/baking?good=brioche-loaf&tab=elements");
    expect(bakingHref(DEFAULT_BAKING_TAB, "brioche-loaf")).toBe("/kitchen-lab/baking?good=brioche-loaf");
  });
});
