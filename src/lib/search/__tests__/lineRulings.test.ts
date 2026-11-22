import type { LineAudit } from "../lineAudit";
import { AUDIT_FLAG_ALLOWLIST, auditAllowlistGaps } from "../lineAuditAllowlist";
import {
  extractParentheses,
  matchClassHead,
  matchFalseCompound,
  matchMeatCut,
  stripParentheses,
} from "../lineRulings";

describe("lineRulings matchers", () => {
  it("matches curated false-compound aliases across clauses and plurals", () => {
    expect(matchFalseCompound("ripe mission or brown turkey figs")).toMatchObject({
      phrase: "brown turkey figs",
      target: "fig",
    });
    expect(matchFalseCompound("pickled mustard greens")).toMatchObject({
      phrase: "mustard greens",
      target: null,
    });
    expect(matchFalseCompound("water spinach")).toMatchObject({
      phrase: "water spinach",
      target: null,
    });
    expect(matchFalseCompound("unbleached white bread flour")).toMatchObject({
      phrase: "white bread flour",
      target: "flour",
    });
    expect(matchFalseCompound("pomegranate molasses")).toMatchObject({
      phrase: "pomegranate molasses",
      target: "pomegranate",
    });
  });

  it("matches curated class heads across hyphens, accents, and plurals", () => {
    expect(matchClassHead("jalapeño peppers")?.winner).toBe("jalapenos");
    expect(matchClassHead("grated parmesan cheese")?.winner).toBe("parmesan");
    expect(matchClassHead("fine semolina flour")?.winner).toBe("semolina");
    expect(matchClassHead("pistachio nuts")?.winner).toBe("pistachios");
    expect(matchClassHead("honey-mustard yogurt")?.winner).toBe("yogurt");
    expect(matchClassHead("plain whole-milk yogurt")?.winner).toBe("yogurt");
    expect(matchClassHead("mellow barley miso")?.winner).toBe("miso");
    expect(matchClassHead("aged napa cabbage kimchi, with juice")?.winner).toBe("kimchi");
  });

  it("matches meat cuts without dedicated cards", () => {
    expect(matchMeatCut("ribeye steak")?.target).toBe("beef");
    expect(matchMeatCut("ox leg and knuckle bones")?.target).toBe("beef");
    expect(matchMeatCut("cooked ham")?.target).toBe("ham");
    expect(matchMeatCut("salmon fillet")?.target).toBe("atlantic_salmon");
    expect(matchMeatCut("lamb chops")).toBeNull();
  });

  it("strips and extracts parenthetical glosses for Ruling 15", () => {
    expect(stripParentheses("gochujang (korean chili paste)")).toBe("gochujang");
    expect(stripParentheses("sashimi-grade salmon (sake)")).toBe("sashimi-grade salmon");
    expect(extractParentheses("besan (chickpea flour)")).toEqual(["chickpea flour"]);
    expect(extractParentheses("empty () and (valid gloss)")).toEqual(["valid gloss"]);
  });
});

describe("auditAllowlistGaps (Rulings 17 & 20)", () => {
  const sampleAllowlist = AUDIT_FLAG_ALLOWLIST.slice(0, 2);

  it("reports zero unruled and zero stale rows on an exact flagged match", () => {
    const audits: LineAudit[] = [
      { line: "spinach", keys: ["spinach"], derived: [], flags: [] },
      { line: "date sugar", keys: ["sugar"], derived: [], flags: ["generic"] },
      { line: "ice water", keys: ["water"], derived: [], flags: ["generic"] },
    ];
    const report = auditAllowlistGaps(audits, sampleAllowlist);
    expect(report.ruled).toHaveLength(2);
    expect(report.unruled).toEqual([]);
    expect(report.stale).toEqual([]);
  });

  it("surfaces unruled flags, key drift, flag drift, and stale allowlist entries", () => {
    const audits: LineAudit[] = [
      { line: "date sugar", keys: ["dates"], derived: [], flags: ["generic"] },
      { line: "ice water", keys: ["water"], derived: [], flags: ["modifier"] },
      { line: "mystery spice blend", keys: ["spice"], derived: [], flags: ["modifier"] },
    ];
    const report = auditAllowlistGaps(audits, sampleAllowlist);
    expect(report.ruled).toEqual([]);
    expect(report.unruled.map((a) => a.line)).toEqual([
      "date sugar",
      "ice water",
      "mystery spice blend",
    ]);
    expect(report.stale.map((r) => r.line)).toEqual(["date sugar", "ice water"]);
  });

  it("surfaces stale allowlist rows when a flagged line stops flagging", () => {
    const audits: LineAudit[] = [
      { line: "date sugar", keys: ["sugar"], derived: [], flags: ["generic"] },
      { line: "ice water", keys: ["water"], derived: [], flags: [] },
    ];
    const report = auditAllowlistGaps(audits, sampleAllowlist);
    expect(report.unruled).toEqual([]);
    expect(report.stale.map((r) => r.line)).toEqual(["ice water"]);
  });
});
