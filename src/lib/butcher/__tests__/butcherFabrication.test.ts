/**
 * @jest-environment node
 *
 * V2-3: fabrication tickets, primal-to-retail yield telemetry, and the Cut
 * Comparison drawer's rows.
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import { estimatedBoneSharePct, fabricationYieldForCut, orderYieldTelemetry } from "@/data/butcher/fabricationYields";
import { LITERATURE_YIELDS } from "@/data/butcher/literatureYields";
import { getTicketForTier, getTicketsForTier, isFabricationTicket, scoreOrderFulfillment } from "@/lib/butcher/science/butcherGame";
import { buildCutComparison, togglePinnedCut } from "@/lib/butcher/science/cutComparison";
import type { AnatomicalCut, ButcherOrderTicket, FabricationPick } from "@/lib/butcher/types";

function cutOrThrow(id: string): AnatomicalCut {
  const cut = getCutById(id);
  if (!cut) throw new Error(`missing cut ${id}`);
  return cut;
}

function fabTicket(id: string): ButcherOrderTicket {
  const ticket = getTicketsForTier("master").find((t) => t.id === id);
  if (!ticket) throw new Error(`missing ticket ${id}`);
  return ticket;
}

const BASE_SUBMISSION = { selectedCutId: "tenderloin-filet", sliceAngleDeg: 90, portionMassG: 220, selectedMethod: "high-heat-sear", selectedCoreTempC: 54 } as const;

describe("fabrication tickets", () => {
  it("keeps the original master tickets first and appends fabrication orders with valid steps", () => {
    expect(getTicketForTier("master", 0).id).toBe("mst-collagen-braise");
    const fabs = getTicketsForTier("master").filter(isFabricationTicket);
    expect(fabs.length).toBeGreaterThanOrEqual(3);
    for (const t of fabs) {
      const steps = t.fabricationSteps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps[0]?.expectedCutId).toBe(t.expectedCutId);
      for (const step of steps) expect(cutOrThrow(step.expectedCutId).speciesId).toBe(t.speciesId);
    }
  });

  it("passes a clean two-pull breakdown and reports one yield per pull", () => {
    const ticket = fabTicket("mst-fab-short-loin");
    const picks: FabricationPick[] = [
      { selectedCutId: "tenderloin-filet", sliceAngleDeg: 90, portionMassG: 220 },
      { selectedCutId: "ny-strip", sliceAngleDeg: 90, portionMassG: 350 },
    ];
    const score = scoreOrderFulfillment(ticket, { ...BASE_SUBMISSION, fabricationPicks: picks });
    expect(score.passed).toBe(true);
    expect(score.grade).toBe("S");
    expect(score.stepScores.map((s) => s.cutAccuracyScore)).toEqual([100, 100]);
    expect(score.yields.map((y) => y.cutId)).toEqual(["tenderloin-filet", "ny-strip"]);
    expect(score.feedback).toHaveLength(2);
  });

  it("fails when a pull is the wrong cut or missing, even with a high mean", () => {
    const ticket = fabTicket("mst-fab-short-loin");
    const wrong = scoreOrderFulfillment(ticket, {
      ...BASE_SUBMISSION,
      fabricationPicks: [
        { selectedCutId: "tenderloin-filet", sliceAngleDeg: 90, portionMassG: 220 },
        { selectedCutId: "porterhouse", sliceAngleDeg: 90, portionMassG: 350 },
      ],
    });
    expect(wrong.stepScores[1]?.cutAccuracyScore).toBe(45);
    expect(wrong.passed).toBe(false);

    const missing = scoreOrderFulfillment(ticket, { ...BASE_SUBMISSION, fabricationPicks: [{ selectedCutId: "tenderloin-filet", sliceAngleDeg: 90, portionMassG: 220 }] });
    expect(missing.stepScores[1]?.stepScore).toBe(0);
    expect(missing.passed).toBe(false);
    expect(missing.feedback[1]).toMatch(/not pulled yet/i);
  });

  it("penalises a parallel knife on one pull", () => {
    const ticket = fabTicket("mst-fab-packer-brisket");
    const good = scoreOrderFulfillment(ticket, { ...BASE_SUBMISSION, fabricationPicks: [
      { selectedCutId: "brisket-flat", sliceAngleDeg: 90, portionMassG: 300 },
      { selectedCutId: "brisket-point", sliceAngleDeg: 90, portionMassG: 250 },
    ] });
    const parallel = scoreOrderFulfillment(ticket, { ...BASE_SUBMISSION, fabricationPicks: [
      { selectedCutId: "brisket-flat", sliceAngleDeg: 5, portionMassG: 300 },
      { selectedCutId: "brisket-point", sliceAngleDeg: 90, portionMassG: 250 },
    ] });
    expect(parallel.totalScore).toBeLessThan(good.totalScore);
    expect(parallel.stepScores[0]?.grainAngleScore ?? 100).toBeLessThan(40);
  });
});

describe("fabrication yields", () => {
  it("gives every cut a closed yield row with a named basis", () => {
    for (const cut of BUTCHER_CUTS) {
      const row = fabricationYieldForCut(cut);
      const sum = row.usableYieldPct + row.trimFatPct + row.boneWastePct + row.otherLossPct;
      expect(sum).toBeCloseTo(100, 0);
      expect(row.usableYieldPct).toBeGreaterThan(25);
      expect(row.usableYieldPct).toBeLessThanOrEqual(100);
      expect(row.source.length).toBeGreaterThan(10);
      expect(row.basis === "LITERATURE").toBe(cut.id in LITERATURE_YIELDS);
      if (!cut.geometry3d.hasBone && row.basis === "MODEL ESTIMATE") expect(row.boneWastePct).toBe(0);
    }
  });

  it("computes larger bone shares for thin meat on thick bone", () => {
    const shortRibs = estimatedBoneSharePct(cutOrThrow("short-ribs"));
    const primeRib = estimatedBoneSharePct(cutOrThrow("prime-rib"));
    expect(shortRibs).toBeGreaterThan(primeRib);
    expect(primeRib).toBeGreaterThan(0);
    expect(estimatedBoneSharePct(cutOrThrow("t-bone"))).toBeGreaterThan(0);
    expect(estimatedBoneSharePct(cutOrThrow("tenderloin-filet"))).toBe(0);
  });

  it("converts a portion into the as-purchased mass a butcher must buy", () => {
    const telemetry = orderYieldTelemetry("porterhouse", 500);
    expect(telemetry).not.toBeNull();
    if (!telemetry) return;
    expect(telemetry.asPurchasedG).toBe(Math.round(500 / (telemetry.usableYieldPct / 100)));
    expect(telemetry.boneG).toBeGreaterThan(0);
    expect(orderYieldTelemetry("not-a-cut", 100)).toBeNull();
  });

  it("attaches yield telemetry to single-cut tickets", () => {
    const score = scoreOrderFulfillment(getTicketForTier("apprentice", 0), {
      selectedCutId: "ny-strip", sliceAngleDeg: 90, portionMassG: 350, selectedMethod: "high-heat-sear", selectedCoreTempC: 55,
    });
    expect(score.yields).toHaveLength(1);
    expect(score.yields[0]?.cutId).toBe("ny-strip");
    expect(score.stepScores).toEqual([]);
  });
});

describe("cut comparison", () => {
  it("builds six rows and flags the higher side numerically", () => {
    const rows = buildCutComparison(cutOrThrow("ribeye"), cutOrThrow("ny-strip"));
    expect(rows.map((r) => r.id)).toEqual(["fat", "collagen", "method", "gray-band", "core-temp", "thickness"]);
    expect(rows.find((r) => r.id === "fat")?.higher).toBe("a");
    expect(rows.find((r) => r.id === "method")?.higher).toBeNull();
    const flatPoint = buildCutComparison(cutOrThrow("brisket-flat"), cutOrThrow("brisket-point"));
    expect(flatPoint.find((r) => r.id === "fat")?.higher).toBe("b");
  });

  it("toggles pins and keeps at most the two most recent", () => {
    expect(togglePinnedCut([], "ribeye")).toEqual(["ribeye"]);
    expect(togglePinnedCut(["ribeye"], "ribeye")).toEqual([]);
    expect(togglePinnedCut(["ribeye", "ny-strip"], "picanha")).toEqual(["ny-strip", "picanha"]);
  });
});
