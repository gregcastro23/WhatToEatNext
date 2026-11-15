/**
 * @jest-environment node
 *
 * Rejections and degradations for `parseAgentVessel`. Every body is ONE real
 * vessel (the real progression + appearance resolvers, same projection as
 * agentVesselParser.test.ts) with exactly one thing changed, so a rejection can
 * only be the parser's: the unchanged body is asserted to parse first.
 * Non-finite numbers come from JSON TEXT (`1e999`), because
 * `JSON.stringify(Infinity)` is `null` and would test a different case.
 */
import { computeAgentProgression } from "@/lib/agents/levelingService";
import { resolveAgentAppearance } from "@/lib/agents/vessel-appearance-manifest";
import { isJsonRecord } from "@/lib/api/json";
import { parseAgentVessel } from "../agentVesselParser";

const REQUIRED = "vessel: a required field is missing or mistyped";
const SCALARS = ["level", "totalXp", "levelBoost", "baseOverall", "trainedOverall", "currentOverall", "transitDelta"];
const WRONG: Array<[string, () => unknown]> = [
  ["a string", () => "7"],
  ["null", () => null],
  ["Infinity from 1e999", () => JSON.parse("1e999")],
];

const progression = computeAgentProgression(
  { id: "isaac-newton", name: "isaac-newton", consciousness: {} },
  { now: Date.parse("2026-11-12T09:30:00.000Z") },
);
const BASE_JSON = JSON.stringify({
  level: progression.vesselLevel,
  totalXp: progression.totalXp,
  xpToNextLevel: progression.xpToNextLevel,
  levelBoost: progression.levelBoost,
  baseOverall: progression.baseOverall,
  trainedOverall: progression.trainedOverall,
  currentOverall: progression.currentOverall,
  transitDelta: progression.transitDelta,
  progressionStatus: progression.progressionStatus,
  archetype: progression.archetype,
  stats: progression.stats,
  statDeltas: progression.statDeltas,
  appearance: resolveAgentAppearance("isaac-newton"),
});

function body(patch: (vessel: Record<string, unknown>) => void): unknown {
  const parsed: unknown = JSON.parse(BASE_JSON);
  if (!isJsonRecord(parsed)) throw new Error("base vessel is not a record");
  patch(parsed);
  return parsed;
}

function child(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = parent[key];
  if (!isJsonRecord(value)) throw new Error(`${key} is not a record in the base vessel`);
  return value;
}

function run(value: unknown): { vessel: ReturnType<typeof parseAgentVessel>; issues: string[] } {
  const issues: string[] = [];
  return { vessel: parseAgentVessel(value, issues), issues };
}

describe("parseAgentVessel guards", () => {
  it("CONTROL: the unchanged real vessel parses with no issues", () => {
    const { vessel, issues } = run(body(() => undefined));
    expect(vessel).not.toBeNull();
    expect(issues).toEqual([]);
  });

  describe.each(SCALARS)("required scalar %s", (key) => {
    it.each(WRONG)("rejects %s", (_name, make) => {
      const { vessel, issues } = run(body((v) => { v[key] = make(); }));
      expect(vessel).toBeNull();
      expect(issues).toContain(REQUIRED);
    });
    it("rejects when missing", () => {
      const { vessel, issues } = run(body((v) => { delete v[key]; }));
      expect(vessel).toBeNull();
      expect(issues).toContain(REQUIRED);
    });
  });

  describe("xpToNextLevel", () => {
    it("CONTROL: null (the capped level) is a real answer and is kept as null", () => {
      const { vessel, issues } = run(body((v) => { v.xpToNextLevel = null; }));
      expect(vessel?.xpToNextLevel).toBeNull();
      expect(issues).toEqual([]);
    });
    it.each([["a string", "9"], ["Infinity from 1e999", JSON.parse("1e999")]])("rejects %s", (_name, bad) => {
      const { vessel } = run(body((v) => { v.xpToNextLevel = bad; }));
      expect(vessel).toBeNull();
    });
    it("rejects when missing (the producer always sends the key)", () => {
      expect(run(body((v) => { delete v.xpToNextLevel; })).vessel).toBeNull();
    });
  });

  describe("progressionStatus", () => {
    it.each([["live"], ["estimated"], ["unavailable"]])("accepts %s", (status) => {
      expect(run(body((v) => { v.progressionStatus = status; })).vessel?.progressionStatus).toBe(status);
    });
    it.each([["bogus"], [3], [null]])("rejects %j", (status) => {
      expect(run(body((v) => { v.progressionStatus = status; })).vessel).toBeNull();
    });
  });

  describe("archetype and stats", () => {
    it.each([
      ["archetype missing", (v: Record<string, unknown>) => { delete v.archetype; }],
      ["archetype.title a number", (v: Record<string, unknown>) => { child(v, "archetype").title = 4; }],
      ["archetype.secondary missing", (v: Record<string, unknown>) => { delete child(v, "archetype").secondary; }],
      ["stats missing", (v: Record<string, unknown>) => { delete v.stats; }],
      ["stats an array", (v: Record<string, unknown>) => { v.stats = []; }],
    ])("rejects: %s", (_name, patch) => {
      const { vessel, issues } = run(body(patch));
      expect(vessel).toBeNull();
      expect(issues).toContain(REQUIRED);
    });

    it("a non-finite stat entry is dropped and reported; the rest of the vessel survives", () => {
      const first = Object.keys(child(JSON.parse(BASE_JSON), "stats"))[0] ?? "";
      const { vessel, issues } = run(body((v) => { child(v, "stats")[first] = JSON.parse("1e999"); }));
      expect(vessel).not.toBeNull();
      expect(vessel?.stats).not.toHaveProperty(first);
      expect(issues).toEqual([`vessel.stats.${first}: not a finite number`]);
    });

    it("statDeltas: absent is fine; a non-object is dropped and reported", () => {
      expect(run(body((v) => { delete v.statDeltas; })).issues).toEqual([]);
      const { vessel, issues } = run(body((v) => { v.statDeltas = "none"; }));
      expect(vessel).not.toBeNull();
      expect(vessel).not.toHaveProperty("statDeltas");
      expect(issues).toEqual(["vessel.statDeltas: not an object, dropped"]);
    });
  });

  describe("appearance degrades to absent without losing the vessel", () => {
    it.each([
      ["era outside the closed union", (a: Record<string, unknown>) => { a.era = "medieval"; }],
      ["era a number", (a: Record<string, unknown>) => { a.era = 2; }],
      ["signatureRelic a number", (a: Record<string, unknown>) => { a.signatureRelic = 2; }],
      ["headSilhouette missing", (a: Record<string, unknown>) => { delete a.headSilhouette; }],
      ["crownStyle a number", (a: Record<string, unknown>) => { child(a, "headSilhouette").crownStyle = 1; }],
      ["faceProportion.jawWidth a string", (a: Record<string, unknown>) => { child(child(a, "headSilhouette"), "faceProportion").jawWidth = "x"; }],
      ["faceProportion.browDepth a string", (a: Record<string, unknown>) => { child(child(a, "headSilhouette"), "faceProportion").browDepth = "x"; }],
      ["faceProportion.cranialHeight missing", (a: Record<string, unknown>) => { delete child(child(a, "headSilhouette"), "faceProportion").cranialHeight; }],
      ["garmentSilhouette.mantleStyle a number", (a: Record<string, unknown>) => { child(a, "garmentSilhouette").mantleStyle = 1; }],
      ["garmentSilhouette.collarStyle missing", (a: Record<string, unknown>) => { delete child(a, "garmentSilhouette").collarStyle; }],
      ["paletteOverrides.hairOrCrownHex a number", (a: Record<string, unknown>) => { child(a, "paletteOverrides").hairOrCrownHex = 1; }],
      ["paletteOverrides.skinOrMaterialToneHex missing", (a: Record<string, unknown>) => { delete child(a, "paletteOverrides").skinOrMaterialToneHex; }],
    ])("%s", (_name, patch) => {
      const { vessel, issues } = run(body((v) => patch(child(v, "appearance"))));
      expect(vessel).not.toBeNull();
      expect(vessel).not.toHaveProperty("appearance");
      expect(issues).toEqual(["vessel.appearance: malformed, dropped"]);
    });

    it("a wrong-typed optional url is dropped and reported; the appearance is kept", () => {
      const { vessel, issues } = run(body((v) => { child(v, "appearance").portraitUrl = 5; }));
      expect(vessel?.appearance).toBeDefined();
      expect(vessel?.appearance).not.toHaveProperty("portraitUrl");
      expect(issues).toEqual(["vessel.appearance.portraitUrl: not a string"]);
    });

    it("appearance: null is reported (the producer never sends it); absent is silent", () => {
      expect(run(body((v) => { v.appearance = null; })).issues).toEqual(["vessel.appearance: malformed, dropped"]);
      expect(run(body((v) => { delete v.appearance; })).issues).toEqual([]);
    });
  });

  describe("shape of the whole value", () => {
    it.each([[[]], ["vessel"], [7]])("a non-object %j is null and reported", (value) => {
      const { vessel, issues } = run(value);
      expect(vessel).toBeNull();
      expect(issues).toEqual(["vessel: not an object"]);
    });
    it("unknown keys are not copied", () => {
      const { vessel } = run(body((v) => { v.surprise = 1; }));
      expect(vessel).not.toHaveProperty("surprise");
    });
  });
});
