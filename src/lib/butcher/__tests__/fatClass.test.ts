/**
 * @jest-environment node
 *
 * The fat class every label shows is derived from the cut's USDA fat, on one
 * declared scale (6 / 12 / 20 g per 100 g).
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_COLOR, fatClassFor } from "@/lib/butcher/science/fatClass";
import { OVERLAY_COLOR_LEGEND, colorHexForOverlay } from "@/lib/butcher/stage/overlayLegend";

describe("fat class", () => {
  it("bands USDA fat at 6, 12 and 20 g, lower bounds inclusive", () => {
    expect([0, 5.99, 6, 11.99, 12, 19.99, 20, 53].map(fatClassFor)).toEqual([
      "lean", "lean", "moderate", "moderate", "high", "high", "very-high", "very-high",
    ]);
  });

  it("is never set by hand: every cut's class is its fat's class", () => {
    for (const cut of BUTCHER_CUTS) {
      expect({ id: cut.id, cls: cut.fatClass }).toEqual({ id: cut.id, cls: fatClassFor(cut.proximate.fatG) });
    }
  });

  it("labels the cuts the audit flagged by their USDA fat", () => {
    expect(getCutById("leg-of-lamb")?.fatClass).toBe("high");
    expect(getCutById("flat-iron")?.fatClass).toBe("moderate");
    const salmon = ["collar-kama", "loin-top", "center-fillet", "belly-toro", "tail-piece"].map((id) => getCutById(id)?.fatClass);
    expect(new Set(salmon)).toEqual(new Set(["high"]));
  });

  it("colours the 3D overlay and its legend from the same scale", () => {
    for (const cut of BUTCHER_CUTS) {
      expect(colorHexForOverlay(cut, "marbling")).toBe(FAT_CLASS_COLOR[cut.fatClass]);
    }
    expect(OVERLAY_COLOR_LEGEND.marbling.map((s) => s.colorHex)).toEqual([
      FAT_CLASS_COLOR["very-high"], FAT_CLASS_COLOR.high, FAT_CLASS_COLOR.moderate, FAT_CLASS_COLOR.lean,
    ]);
  });
});
