/**
 * @jest-environment node
 *
 * Provenance guards for the Butcher Shop's USDA composition basis.
 *
 * The first table cited FDC ids that named other foods. These tests make the
 * values reproducible from their source: the generated module must equal the
 * evidence file the fetch script wrote, and every cut must say whether its
 * record is the cut itself or a stated proxy.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { BUTCHER_CUTS } from "@/data/butcher/cutsCatalogue";
import { FDC_BUTCHER_RECORDS } from "@/data/butcher/fdcButcherRecords";
import { USDA_BUTCHER_RECORDS } from "@/data/butcher/usdaButcherRecords";

const EvidenceSchema = z.object({
  records: z.array(
    z.object({
      fdcId: z.number().int(),
      ndbNumber: z.number().int(),
      description: z.string(),
      dataType: z.string(),
      per100g: z.object({
        waterG: z.number(),
        proteinG: z.number(),
        fatG: z.number(),
        ashG: z.number(),
      }),
    }),
  ),
});

const evidence = EvidenceSchema.parse(
  JSON.parse(readFileSync(join(process.cwd(), "scripts", "data", "usda-butcher.json"), "utf8")),
);

describe("Butcher Shop USDA provenance", () => {
  it("generated module equals the FDC evidence file, record for record", () => {
    const generated = Object.values(USDA_BUTCHER_RECORDS);
    expect(generated).toHaveLength(evidence.records.length);
    for (const ev of evidence.records) {
      expect(USDA_BUTCHER_RECORDS[ev.fdcId]).toEqual({
        fdcId: ev.fdcId,
        ndbNumber: ev.ndbNumber,
        dataType: ev.dataType,
        description: ev.description,
        ...ev.per100g,
      });
    }
  });

  it("every cut's proximates are its USDA record's values, verbatim", () => {
    for (const cut of BUTCHER_CUTS) {
      const record = FDC_BUTCHER_RECORDS[cut.id];
      expect(record).toBeDefined();
      if (!record) continue;
      expect(record.fdcId).toBe(cut.fdcId);
      const usda = USDA_BUTCHER_RECORDS[cut.fdcId];
      expect(cut.proximate).toEqual({
        waterG: usda.waterG,
        proteinG: usda.proteinG,
        fatG: usda.fatG,
        ashG: usda.ashG,
        collagenG: record.collagenG,
      });
    }
  });

  it("covers exactly the catalogue's cuts and uses every fetched record", () => {
    expect(Object.keys(FDC_BUTCHER_RECORDS).sort()).toEqual(BUTCHER_CUTS.map((c) => c.id).sort());
    const used = new Set(Object.values(FDC_BUTCHER_RECORDS).map((r) => r.fdcId));
    expect([...used].sort()).toEqual(Object.keys(USDA_BUTCHER_RECORDS).map(Number).sort());
  });

  it("uses raw records only and explains every proxy", () => {
    for (const [cutId, record] of Object.entries(FDC_BUTCHER_RECORDS)) {
      expect({ cutId, raw: /, raw$/.test(record.description) }).toEqual({ cutId, raw: true });
      if (record.match === "PROXY") {
        expect({ cutId, note: (record.matchNote ?? "").length > 20 }).toEqual({ cutId, note: true });
      }
    }
  });
});
