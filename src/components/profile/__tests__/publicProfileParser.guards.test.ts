/**
 * Envelope, required identity, nullable text, optional keys and issue aggregation
 * for `parsePublicProfileResponse`. The base is a literal copy of the DB-path
 * profile the route builds (route.ts:501-545); the REAL handler is exercised in
 * publicProfileParser.test.ts. Each case changes exactly one thing and the
 * unchanged base is asserted to parse first.
 */
import { isJsonRecord } from "@/lib/api/json";
import { parsePublicProfileResponse, type PublicProfile, type PublicProfileResponse } from "../publicProfileParser";

type Patch = (profile: Record<string, unknown>) => void;

const BASE = {
  userId: "u-1",
  handle: null,
  name: "Ada",
  isAgent: false,
  avatarUrl: null,
  social: { followers: 5, following: 3, commensals: 7, tablesHosted: 4, tablesJoined: 18, viewer: null },
  agentSlug: null,
  agentProfile: null,
  vessel: null,
  agentInteractions: [],
  agentActions: [],
  agentArtifacts: [],
  bio: "Cooks.",
  dominantElement: "Water",
  natalChart: { planets: {} },
  natalPositions: [{ planet: "Sun", sign: "scorpio", degree: 21.4 }],
  birthData: {},
  dietary_preferences: { restrictions: ["vegan"] },
  profile_layout: ["natalChart"],
  tasteGraph: null,
  createdAt: "2025-03-01T12:00:00.000Z",
  balances: { spirit: 1, essence: 2, matter: 3, substance: 4 },
  recentActivity: [{ id: "e1", eventType: "made_it", metadataPayload: null, createdAt: "2025-11-01T08:00:00.000Z" }],
};

function wire(patch?: Patch): unknown {
  const envelope: unknown = JSON.parse(JSON.stringify({ success: true, profile: BASE }));
  if (!isJsonRecord(envelope) || !isJsonRecord(envelope.profile)) throw new Error("base is not a record");
  patch?.(envelope.profile);
  return envelope;
}

function profileOf(value: unknown): { profile: PublicProfile; issues: string[] } {
  const parsed: PublicProfileResponse = parsePublicProfileResponse(value);
  if (parsed.kind !== "profile") throw new Error("expected a profile");
  return parsed;
}

const INF: unknown = JSON.parse("1e999");

describe("parsePublicProfileResponse guards", () => {
  it("CONTROL: the base parses with no issues, as plain mutable objects", () => {
    const { profile, issues } = profileOf(wire());
    expect(issues).toEqual([]);
    expect(profile.name).toBe("Ada");
    expect(Object.isFrozen(profile)).toBe(false);
    expect(Object.isFrozen(profile.balances)).toBe(false);
  });

  describe("the envelope", () => {
    it.each([["null", JSON.parse("null")], ["an array", []], ["a string", "x"], ["a number", 7], ["a boolean", true]])(
      "throws for a body that is %s",
      (_name, value) => {
        expect(() => parsePublicProfileResponse(value)).toThrow("was not a JSON object");
      },
    );
    it.each([
      ["success false", { success: false, message: "Profile not found" }, "Profile not found"],
      ["success missing", { message: "nope" }, "nope"],
      ["success 1", { success: 1, message: "odd", profile: {} }, "odd"],
      ["a non-string message", { success: false, message: 404 }, null],
      ["no message at all", { success: false }, null],
      ["profile missing", { success: true, message: "gone" }, "gone"],
      ["profile null", { success: true, profile: null }, null],
      ["profile an array", { success: true, profile: [] }, null],
      ["profile a string", { success: true, profile: "ada" }, null],
    ])("a refusal for %s", (_name, body, message) => {
      expect(parsePublicProfileResponse(body)).toEqual({ kind: "refused", message });
    });
  });

  describe("identity fields are required and throw by name", () => {
    it.each([
      ["userId missing", (r: Record<string, unknown>) => { delete r.userId; }, "userId string"],
      ["userId a number", (r: Record<string, unknown>) => { r.userId = 5; }, "userId string"],
      ["name missing", (r: Record<string, unknown>) => { delete r.name; }, "name string"],
      ["name null", (r: Record<string, unknown>) => { r.name = null; }, "name string"],
      ["isAgent missing", (r: Record<string, unknown>) => { delete r.isAgent; }, "isAgent boolean"],
      ["isAgent the string true", (r: Record<string, unknown>) => { r.isAgent = "true"; }, "isAgent boolean"],
      ["balances missing", (r: Record<string, unknown>) => { delete r.balances; }, "valid balances"],
      ["balances an array", (r: Record<string, unknown>) => { r.balances = []; }, "valid balances"],
      ["a balance a string", (r: Record<string, unknown>) => { r.balances = { spirit: "1", essence: 2, matter: 3, substance: 4 }; }, "valid balances"],
      ["a balance null", (r: Record<string, unknown>) => { r.balances = { spirit: 1, essence: null, matter: 3, substance: 4 }; }, "valid balances"],
      ["a balance Infinity", (r: Record<string, unknown>) => { r.balances = { spirit: 1, essence: 2, matter: INF, substance: 4 }; }, "valid balances"],
    ])("%s", (_name, patch, fragment) => {
      expect(() => parsePublicProfileResponse(wire(patch))).toThrow(fragment);
    });
  });

  describe("createdAt is a display label, not identity (users.created_at is nullable in the schema)", () => {
    it("a string is kept as sent", () => {
      expect(profileOf(wire()).profile.createdAt).toBe("2025-03-01T12:00:00.000Z");
    });
    it.each([
      ["null", (r: Record<string, unknown>) => { r.createdAt = null; }],
      ["missing", (r: Record<string, unknown>) => { delete r.createdAt; }],
      ["a number", (r: Record<string, unknown>) => { r.createdAt = 1731576000000; }],
    ])("%s degrades to an empty label and is reported, and the profile still parses", (_name, patch) => {
      const { profile, issues } = profileOf(wire(patch));
      expect(profile.createdAt).toBe("");
      expect(issues).toEqual(["createdAt: missing or not a string, set to empty"]);
    });
  });

  describe("nullable text the producer always sends", () => {
    it.each(["handle", "agentSlug", "bio", "dominantElement", "avatarUrl"])("%s: a string is kept, null and absent become null, a wrong type is reported", (key) => {
      expect(profileOf(wire((r) => { r[key] = "value"; })).profile).toHaveProperty(key, "value");
      expect(profileOf(wire((r) => { r[key] = null; })).profile).toHaveProperty(key, null);
      const absent = profileOf(wire((r) => { delete r[key]; }));
      expect(absent.profile).toHaveProperty(key, null);
      expect(absent.issues).toEqual([]);
      const wrong = profileOf(wire((r) => { r[key] = 5; }));
      expect(wrong.profile).toHaveProperty(key, null);
      expect(wrong.issues).toEqual([`${key}: not a string, set to null`]);
    });
  });

  describe("optional keys are omitted, never set to undefined or null", () => {
    it.each([
      ["shareIdentity true", (r: Record<string, unknown>) => { r.shareIdentity = true; }, "shareIdentity", true],
      ["shareIdentity false", (r: Record<string, unknown>) => { r.shareIdentity = false; }, "shareIdentity", false],
    ])("%s is kept", (_name, patch, key, expected) => {
      expect(profileOf(wire(patch)).profile).toHaveProperty(key, expected);
    });
    it("shareIdentity: absent is omitted silently, a non-boolean is omitted and reported", () => {
      expect(profileOf(wire()).profile).not.toHaveProperty("shareIdentity");
      const odd = profileOf(wire((r) => { r.shareIdentity = "yes"; }));
      expect(odd.profile).not.toHaveProperty("shareIdentity");
      expect(odd.issues).toEqual(["shareIdentity: not a boolean, dropped"]);
    });
    it.each(["vessel", "tasteGraph", "dietary_preferences", "profile_layout"])("%s: null and absent leave no key", (key) => {
      expect(profileOf(wire((r) => { r[key] = null; })).profile).not.toHaveProperty(key);
      expect(profileOf(wire((r) => { delete r[key]; })).profile).not.toHaveProperty(key);
    });
    it("the three agent feeds are always arrays, even when absent", () => {
      const { profile } = profileOf(wire((r) => { delete r.agentInteractions; delete r.agentActions; delete r.agentArtifacts; }));
      expect([profile.agentInteractions, profile.agentActions, profile.agentArtifacts]).toEqual([[], [], []]);
    });
  });

  describe("sections degrade without failing the profile, and their issues reach the caller in order", () => {
    it("two broken sections give two issues and a whole profile", () => {
      const { profile, issues } = profileOf(wire((r) => {
        r.natalPositions = { Sun: { sign: "scorpio" } };
        r.recentActivity = "none";
      }));
      expect(profile.name).toBe("Ada");
      expect(profile.natalPositions).toEqual([]);
      expect(profile.recentActivity).toEqual([]);
      expect(issues).toEqual(["natalPositions: not an array, ignored", "recentActivity: not an array, treated as empty"]);
    });
    it.each([
      ["social", (r: Record<string, unknown>) => { r.social = { followers: "x" }; }, "social: malformed, zero counts used"],
      ["agentInteractions", (r: Record<string, unknown>) => { r.agentInteractions = [{ id: 1 }]; }, "agentInteractions[0]: not a valid row"],
      ["agentActions", (r: Record<string, unknown>) => { r.agentActions = [{ id: 1 }]; }, "agentActions[0]: not a valid row"],
      ["agentArtifacts", (r: Record<string, unknown>) => { r.agentArtifacts = [{ id: 1 }]; }, "agentArtifacts[0]: not a valid row"],
      ["tasteGraph", (r: Record<string, unknown>) => { r.tasteGraph = "x"; }, "tasteGraph: not an object, dropped"],
      ["dietary_preferences", (r: Record<string, unknown>) => { r.dietary_preferences = "x"; }, "dietary_preferences: not an object, dropped"],
      ["profile_layout", (r: Record<string, unknown>) => { r.profile_layout = "x"; }, "profile_layout: not an array, default layout used"],
    ])("a malformed %s reaches the caller's issues (the sink is wired, not discarded)", (_name, patch, expected) => {
      expect(profileOf(wire(patch)).issues).toEqual([expected]);
    });
    it("a malformed agentProfile becomes null and is reported", () => {
      const { profile, issues } = profileOf(wire((r) => { r.agentProfile = { title: "no name" }; }));
      expect(profile.agentProfile).toBeNull();
      expect(issues.length).toBeGreaterThan(0);
    });
    it("a malformed vessel is omitted and reported", () => {
      const { profile, issues } = profileOf(wire((r) => { r.vessel = { level: "high" }; }));
      expect(profile).not.toHaveProperty("vessel");
      expect(issues).toContain("vessel: a required field is missing or mistyped");
    });
  });

  it("keys the parser does not model (natalChart, birthData, a producer's future key) ride along untouched", () => {
    const { profile } = profileOf(wire((p) => { p.futureKey = [1, { nested: true }]; }));
    expect(profile).toMatchObject({ natalChart: { planets: {} }, birthData: {}, futureKey: [1, { nested: true }] });
  });
});
