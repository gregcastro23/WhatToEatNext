/**
 * @jest-environment node
 *
 * Physics invariants for the coupled 1D heat-moisture-denaturation trajectory
 * kernel (`simulateCoupledCutTrajectory`).
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import {
  TRAJECTORY_METHODS,
  simulateCoupledCutTrajectory,
} from "@/lib/butcher/science/coupledMeatTrajectory";

describe("Coupled 1D Meat Heat-Moisture-Denaturation Trajectory", () => {
  it("gives reverse-sear and sous-vide strictly thinner gray bands than direct high-heat sear on a 38 mm ribeye", () => {
    const ribeye = getCutById("ribeye");
    expect(ribeye).not.toBeNull();
    if (!ribeye) return;

    const seared = simulateCoupledCutTrajectory(ribeye, {
      method: "searing",
      targetCoreTempC: 54,
      thicknessMm: 38,
    });
    const reverseSeared = simulateCoupledCutTrajectory(ribeye, {
      method: "reverse-sear",
      targetCoreTempC: 54,
      thicknessMm: 38,
    });
    const sousVide = simulateCoupledCutTrajectory(ribeye, {
      method: "sous-vide",
      targetCoreTempC: 54,
      thicknessMm: 38,
    });

    expect(sousVide.grayBandMm).toBe(0);
    expect(sousVide.maillardOnsetMin).toBeNull();
    expect(sousVide.crustDepthMm).toBe(0);

    expect(reverseSeared.grayBandMm).toBeLessThan(seared.grayBandMm);
    expect(reverseSeared.maillardOnsetMin).not.toBeNull();
    expect(seared.grayBandMm).toBeGreaterThan(0);
    expect(seared.crustDepthMm).toBeGreaterThan(0);
    expect(seared.carryoverRiseC).toBeGreaterThan(0);
  });

  it("reproduces a 65-78 C evaporative BBQ stall and monotonic collagen hydrolysis during smoking + rest", () => {
    const brisket = getCutById("brisket-flat");
    expect(brisket).not.toBeNull();
    if (!brisket) return;

    const noHold = simulateCoupledCutTrajectory(brisket, {
      method: "smoking",
      targetCoreTempC: 93,
      holdMinutes: 0,
    });
    const hold60 = simulateCoupledCutTrajectory(brisket, {
      method: "smoking",
      targetCoreTempC: 93,
      holdMinutes: 60,
    });
    const hold180 = simulateCoupledCutTrajectory(brisket, {
      method: "smoking",
      targetCoreTempC: 93,
      holdMinutes: 180,
    });

    expect(noHold.stallDurationMin).toBeGreaterThanOrEqual(15);
    expect(noHold.stallPlateauTempC).not.toBeNull();
    expect(noHold.stallPlateauTempC ?? 0).toBeGreaterThanOrEqual(65);
    expect(noHold.stallPlateauTempC ?? 0).toBeLessThanOrEqual(78);

    expect(noHold.gelatinConversionPct).toBeGreaterThan(0);
    expect(hold60.gelatinConversionPct).toBeGreaterThan(noHold.gelatinConversionPct);
    expect(hold180.gelatinConversionPct).toBeGreaterThanOrEqual(hold60.gelatinConversionPct);
    expect(noHold.restGelatinGainPct).toBeGreaterThan(0);
  });

  it("reports Maillard onset cleanly on dry searing/roasting and excludes crust on wet braising/sous-vide", () => {
    const strip = getCutById("ny-strip");
    const shortRibs = getCutById("short-ribs");
    expect(strip && shortRibs).toBeTruthy();
    if (!strip || !shortRibs) return;

    const sear = simulateCoupledCutTrajectory(strip, { method: "searing", targetCoreTempC: 54 });
    const braise = simulateCoupledCutTrajectory(shortRibs, {
      method: "braising",
      targetCoreTempC: 93,
      holdMinutes: 120,
    });

    expect(sear.maillardOnsetMin).not.toBeNull();
    expect(sear.maillardOnsetMin ?? 0).toBeGreaterThan(0);
    expect(braise.maillardOnsetMin).toBeNull();
    expect(braise.crustDepthMm).toBe(0);
    expect(braise.surfaceEventSummary).toBe("No crust (wet medium)");
  });

  it("captures finfish myocommata hydrolysis near 51 C and flags albumin gray band past 60 C", () => {
    const bellyToro = getCutById("belly-toro");
    expect(bellyToro).not.toBeNull();
    if (!bellyToro) return;

    const gentleFish = simulateCoupledCutTrajectory(bellyToro, {
      method: "sous-vide",
      targetCoreTempC: 51,
      holdMinutes: 15,
    });
    const searedFish = simulateCoupledCutTrajectory(bellyToro, {
      method: "searing",
      targetCoreTempC: 52,
    });

    expect(gentleFish.gelatinConversionPct).toBeGreaterThan(40);
    expect(gentleFish.grayBandMm).toBe(0);
    expect(searedFish.grayBandMm).toBeGreaterThan(0);
  });

  it("produces finite, non-negative, depth-conserving bands across all 52 cuts", () => {
    for (const cut of BUTCHER_CUTS) {
      const res = simulateCoupledCutTrajectory(cut, {
        method: TRAJECTORY_METHODS[0]?.id ?? "searing",
      });
      expect(Number.isFinite(res.grayBandMm)).toBe(true);
      expect(Number.isFinite(res.crustDepthMm)).toBe(true);
      expect(Number.isFinite(res.idealCoreMm)).toBe(true);
      expect(Number.isFinite(res.gelatinConversionPct)).toBe(true);
      expect(Number.isFinite(res.moistureRetentionPct)).toBe(true);
      expect(res.grayBandMm).toBeGreaterThanOrEqual(0);
      expect(res.crustDepthMm).toBeGreaterThanOrEqual(0);
      expect(res.idealCoreMm).toBeGreaterThanOrEqual(0);
      expect(res.crustDepthMm + res.grayBandMm + res.idealCoreMm).toBeCloseTo(res.halfThicknessMm, 1);
    }
  });
});
