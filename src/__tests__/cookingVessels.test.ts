/**
 * Vessel registry — geometry, thermal mass, and what a lid does.
 *
 * @file src/__tests__/cookingVessels.test.ts
 */
import { getCookware } from "@/data/cooking/cookwareMaterials";
import {
  SHAPE_CAPACITY_FACTOR,
  VAPOUR_ESCAPE_FRACTION,
  VESSELS,
  VESSELS_DERIVED,
  deriveVessel,
  getVessel,
  splitEvaporation,
  vesselHeatingShare,
  type Vessel,
} from "@/data/cooking/vessels";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";

describe("vessel registry", () => {
  it("is populated — an empty registry would pass everything below vacuously", () => {
    expect(VESSELS.length).toBeGreaterThan(0);
    expect(VESSELS_DERIVED.length).toBe(VESSELS.length);
  });

  it("composes a real material for every vessel and every lid", () => {
    // A vessel naming a material that does not exist would otherwise be a pan
    // made of nothing, with a thermal mass of zero and no error anywhere.
    for (const v of VESSELS) {
      expect(getCookware(v.materialId)).not.toBeNull();
      if (v.lid) expect(getCookware(v.lid.materialId)).not.toBeNull();
    }
  });

  it("REFUSES a vessel whose material does not exist", () => {
    const bogus: Vessel = {
      ...VESSELS[0],
      id: "bogus",
      materialId: "unobtainium",
    };
    expect(() => deriveVessel(bogus)).toThrow(/unobtainium/);
    const bogusLid: Vessel = {
      ...VESSELS[0],
      id: "bogus_lid",
      lid: { materialId: "unobtainium", thicknessMm: 2, seal: "tight" },
    };
    expect(() => deriveVessel(bogusLid)).toThrow(/unobtainium/);
  });

  it("carries a stated basis and a character note on every entry", () => {
    // Dimensions are representative of a class, so the example they came from
    // has to be named or a reader cannot judge them.
    for (const v of VESSELS) {
      expect(v.basisNote.length).toBeGreaterThan(0);
      expect(v.characterNote.length).toBeGreaterThan(0);
    }
  });

  it("derives positive geometry and mass for every vessel", () => {
    for (const v of VESSELS_DERIVED) {
      expect(v.rimAreaM2).toBeGreaterThan(0);
      expect(v.capacityLitres).toBeGreaterThan(0);
      expect(v.thermalMassJperK).toBeGreaterThan(0);
      expect(v.lidThermalMassJperK).toBeGreaterThanOrEqual(0);
      // A lidless vessel must contribute no lid mass at all.
      if (!v.lid) expect(v.lidThermalMassJperK).toBe(0);
    }
  });
});

describe("shape is not cosmetic", () => {
  it("holds less in a bowl than in the cylinder that encloses it", () => {
    // `[MEASURED 2026-08-18]` Treating every vessel as a cylinder gave a 14 in
    // wok 8.91 L. It is a bowl and holds about two thirds of that.
    expect(SHAPE_CAPACITY_FACTOR.cylindrical).toBe(1);
    expect(SHAPE_CAPACITY_FACTOR.bowl).toBeLessThan(1);
    expect(SHAPE_CAPACITY_FACTOR.sloped).toBeLessThan(1);
    expect(SHAPE_CAPACITY_FACTOR.bowl).toBeLessThan(SHAPE_CAPACITY_FACTOR.sloped);
  });

  it("keeps a cylinder's liquid surface constant at every fill", () => {
    const pot = getVessel("stockpot_8qt")!;
    const shallow = pot.liquidSurfaceAreaM2(0.5);
    const deep = pot.liquidSurfaceAreaM2(8);
    expect(shallow).toBeCloseTo(deep, 9);
    expect(shallow).toBeCloseTo(pot.rimAreaM2, 9);
  });

  it("SHRINKS a bowl's liquid surface as the level falls", () => {
    // The whole reason shape had to exist. Evaporation acts on the LIQUID
    // surface, and in a wok that is far smaller than the rim at any real fill.
    const wok = getVessel("wok_14in_carbon")!;
    const low = wok.liquidSurfaceAreaM2(0.5);
    const mid = wok.liquidSurfaceAreaM2(2);
    const full = wok.liquidSurfaceAreaM2(wok.capacityLitres);
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(full);
    expect(full).toBeCloseTo(wok.rimAreaM2, 6);
    // At a working fill the rim overstates the evaporating area about twofold.
    expect(wok.rimAreaM2 / mid).toBeGreaterThan(1.8);
    expect(wok.rimAreaM2 / mid).toBeLessThan(2.4);
  });

  it("refuses a fill the vessel cannot hold", () => {
    const wok = getVessel("wok_14in_carbon")!;
    expect(() => wok.liquidSurfaceAreaM2(99)).toThrow(RangeError);
    expect(() => wok.liquidSurfaceAreaM2(-1)).toThrow(RangeError);
  });

  it("separates a reducing pan from a holding pot by surface per litre", () => {
    // The number that predicts which vessel reduces a sauce and which holds it.
    const sheet = getVessel("sheet_pan_half")!;
    const stockpot = getVessel("stockpot_8qt")!;
    expect(sheet.surfaceToVolumeM2PerL).toBeGreaterThan(stockpot.surfaceToVolumeM2PerL * 5);
  });
});

describe("the lid", () => {
  it("grades vapour escape rather than switching it off", () => {
    // "Cracked" is a real culinary state, and no domestic lid is gas-tight.
    expect(VAPOUR_ESCAPE_FRACTION.none).toBe(1);
    expect(VAPOUR_ESCAPE_FRACTION.cracked).toBeLessThan(VAPOUR_ESCAPE_FRACTION.none);
    expect(VAPOUR_ESCAPE_FRACTION.loose).toBeLessThan(VAPOUR_ESCAPE_FRACTION.cracked);
    expect(VAPOUR_ESCAPE_FRACTION.tight).toBeLessThan(VAPOUR_ESCAPE_FRACTION.loose);
    expect(VAPOUR_ESCAPE_FRACTION.tight).toBeGreaterThan(0);
  });

  it("RETURNS condensate rather than merely suppressing a loss", () => {
    // The mechanism of braising. A lid is not just less evaporation — it hands
    // most of the latent heat back, which is why a covered pot holds
    // temperature so stubbornly.
    const L = latentHeatVaporisation(100);
    const open = getVessel("skillet_12in_carbon")!;
    const braiser = getVessel("dutch_oven_55qt")!;

    const openSplit = splitEvaporation(open, 0.16, L);
    expect(openSplit.returnedKg).toBe(0);
    expect(openSplit.returnedLatentJ).toBe(0);
    expect(openSplit.escapedKg).toBeCloseTo(0.16, 9);

    const braisedSplit = splitEvaporation(braiser, 0.16, L);
    expect(braisedSplit.returnedLatentJ).toBeGreaterThan(braisedSplit.netLatentLossJ * 5);
    // Mass is conserved either way.
    expect(braisedSplit.escapedKg + braisedSplit.returnedKg).toBeCloseTo(0.16, 9);
  });

  it("keeps escape and return complementary for every vessel", () => {
    for (const v of VESSELS_DERIVED) {
      expect(v.vapourEscapeFraction + v.condensateReturnFraction).toBeCloseTo(1, 12);
    }
    expect(() => splitEvaporation(VESSELS_DERIVED[0], -1, 2.26e6)).toThrow(RangeError);
  });

  it("adds real thermal mass — a heavy lid is not free", () => {
    const braiser = getVessel("dutch_oven_55qt")!;
    const saucepan = getVessel("saucepan_3qt_clad")!;
    expect(braiser.lidThermalMassJperK).toBeGreaterThan(saucepan.lidThermalMassJperK * 3);
  });
});

describe("the pan takes a share of the heating", () => {
  it("ranks vessels the way a cook experiences recovery", () => {
    // 2 kg of stock, ~8,100 J/K. A Dutch oven and its lid absorb a large share
    // of the input; a sheet pan absorbs almost none. This is "why did my wok
    // recover instantly and my Dutch oven take five minutes".
    const batchJperK = 8100;
    const sheet = vesselHeatingShare(getVessel("sheet_pan_half")!, batchJperK);
    const wok = vesselHeatingShare(getVessel("wok_14in_carbon")!, batchJperK);
    const braiser = vesselHeatingShare(getVessel("dutch_oven_55qt")!, batchJperK);
    expect(sheet).toBeLessThan(wok);
    expect(wok).toBeLessThan(braiser);
    // Every share is a fraction of the total, so strictly inside (0, 1).
    for (const share of [sheet, wok, braiser]) {
      expect(share).toBeGreaterThan(0);
      expect(share).toBeLessThan(1);
    }
    // The braiser's share is large enough to matter, not a rounding.
    expect(braiser).toBeGreaterThan(0.25);
  });

  it("refuses a non-positive batch heat capacity", () => {
    expect(() => vesselHeatingShare(VESSELS_DERIVED[0], 0)).toThrow(RangeError);
  });
});
