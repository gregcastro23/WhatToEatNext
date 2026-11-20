/**
 * @jest-environment node
 *
 * Tests for Butcher's Block game tickets, scoring, Master physics constraints,
 * and `/kitchen-lab/butcher` tab/URL contracts.
 */
import {
  BUTCHER_TABS,
  DEFAULT_BUTCHER_TAB,
  DEFAULT_CUT_ID,
  DEFAULT_SPECIES_ID,
  butcherHref,
  butcherTabFromParam,
  resolveSpeciesAndCutFromParams,
  systemForTab,
  urlForButcherCut,
  urlForButcherTab,
} from "@/app/(alchm)/kitchen-lab/butcher/butcherTabs";
import {
  getTicketForTier,
  getTicketsForTier,
  scoreOrderFulfillment,
} from "@/lib/butcher/science/butcherGame";
import { computeButcherElementalReading } from "@/lib/butcher/science/butcherElemental";
import { getCutById } from "@/data/butcher/cutsCatalogue";

describe("Butcher's Block order tickets & scoring", () => {
  it("provides tickets across Apprentice, Journeyman, and Master tiers", () => {
    expect(getTicketsForTier("apprentice").length).toBeGreaterThanOrEqual(3);
    expect(getTicketsForTier("journeyman").length).toBeGreaterThanOrEqual(3);
    expect(getTicketsForTier("master").length).toBeGreaterThanOrEqual(3);
  });

  it("rewards accurate cross-grain slicing on Journeyman skirt steak orders and penalizes parallel cuts", () => {
    const skirtTicket = getTicketForTier("journeyman", 0);
    expect(skirtTicket.expectedCutId).toBe("outside-skirt");

    const passing = scoreOrderFulfillment(skirtTicket, {
      selectedCutId: "outside-skirt",
      sliceAngleDeg: 90,
      portionMassG: 225,
      selectedMethod: "high-heat-sear",
      selectedCoreTempC: 55,
    });
    expect(passing.passed).toBe(true);
    expect(passing.totalScore).toBeGreaterThanOrEqual(95);
    expect(passing.grade).toBe("S");

    const parallelFail = scoreOrderFulfillment(skirtTicket, {
      selectedCutId: "outside-skirt",
      sliceAngleDeg: 0,
      portionMassG: 225,
      selectedMethod: "high-heat-sear",
      selectedCoreTempC: 55,
    });
    expect(parallelFail.grainAngleScore).toBeLessThan(35);
    expect(parallelFail.totalScore).toBeLessThan(75);
    expect(parallelFail.passed).toBe(false);
  });

  it("accepts any qualifying high-collagen cut on Master Butcher physics tickets", () => {
    const masterBraise = getTicketForTier("master", 0);
    expect(masterBraise.physicsConstraint?.minCollagenG).toBe(2.2);

    // Short ribs satisfy >=2.2 g collagen/100g beef braise constraint even though expectedCutId is osso-buco-shank
    const shortRibPass = scoreOrderFulfillment(masterBraise, {
      selectedCutId: "short-ribs",
      sliceAngleDeg: 90,
      portionMassG: 450,
      selectedMethod: "collagen-braise",
      selectedCoreTempC: 93,
    });
    expect(shortRibPass.cutAccuracyScore).toBe(100);
    expect(shortRibPass.passed).toBe(true);

    // Tenderloin has only 0.42 g collagen and must fail the constraint
    const tenderloinFail = scoreOrderFulfillment(masterBraise, {
      selectedCutId: "tenderloin-filet",
      sliceAngleDeg: 90,
      portionMassG: 450,
      selectedMethod: "collagen-braise",
      selectedCoreTempC: 93,
    });
    expect(tenderloinFail.cutAccuracyScore).toBeLessThan(50);
    expect(tenderloinFail.passed).toBe(false);
  });

  it("computes bounded one-way alchm elemental readings", () => {
    const ribeye = getCutById("ribeye");
    expect(ribeye).not.toBeNull();
    if (!ribeye) return;
    const reading = computeButcherElementalReading(ribeye);
    const shareSum =
      reading.shares.Fire +
      reading.shares.Water +
      reading.shares.Earth +
      reading.shares.Air;
    expect(shareSum).toBeCloseTo(1.0, 5);
  });
});

describe("the ?tab=, ?species=, and ?cut= contracts of /kitchen-lab/butcher", () => {
  it("isolates alchm strictly to the elements tab", () => {
    expect(
      BUTCHER_TABS.filter(([id]) => systemForTab(id) === "alchm").map(([id]) => id),
    ).toEqual(["elements"]);
    expect(butcherTabFromParam(null)).toBe(DEFAULT_BUTCHER_TAB);
    expect(butcherTabFromParam("invalid")).toBe(DEFAULT_BUTCHER_TAB);
    expect(butcherTabFromParam("game")).toBe("game");
  });

  it("preserves sibling params when updating tab or cut URLs", () => {
    expect(
      urlForButcherTab("https://x.test/kitchen-lab/butcher?species=pork&cut=pork-belly", "game"),
    ).toBe("https://x.test/kitchen-lab/butcher?species=pork&cut=pork-belly&tab=game");

    expect(
      urlForButcherTab("https://x.test/kitchen-lab/butcher?tab=game&species=pork", "breakdown"),
    ).toBe("https://x.test/kitchen-lab/butcher?species=pork");

    expect(
      urlForButcherCut("https://x.test/kitchen-lab/butcher?tab=thermal", "beef", "flank-steak"),
    ).toBe("https://x.test/kitchen-lab/butcher?tab=thermal&species=beef&cut=flank-steak");

    expect(butcherHref(DEFAULT_BUTCHER_TAB, DEFAULT_SPECIES_ID, DEFAULT_CUT_ID)).toBe(
      "/kitchen-lab/butcher",
    );
    expect(butcherHref("elements", "lamb", "rack-of-lamb")).toBe(
      "/kitchen-lab/butcher?species=lamb&cut=rack-of-lamb&tab=elements",
    );
  });

  it("resolves species from cut param even if species param is omitted", () => {
    expect(resolveSpeciesAndCutFromParams(null, "pork-belly")).toEqual({
      speciesId: "pork",
      cutId: "pork-belly",
    });
    expect(resolveSpeciesAndCutFromParams("finfish", null)).toEqual({
      speciesId: "finfish",
      cutId: "center-fillet",
    });
  });
});
