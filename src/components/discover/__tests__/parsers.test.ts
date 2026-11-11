import { parseDiscoverPeopleResponse, parseDiscoverTablesResponse } from "../parsers";

const tableCard = {
  id: "t1",
  title: "Sunday supper",
  scheduledAt: "2026-11-15T18:00:00.000Z",
  status: "open",
  venue: { type: "home" },
  host: { id: "u1", name: "Ada", avatarUrl: null, dominantElement: "Fire" },
  joinedCount: 2,
  seatCap: 6,
  seatsLeft: 4,
  compatibility: null,
  dominantElement: null,
};

const personCard = {
  id: "u2",
  name: "Grace",
  avatarUrl: null,
  bio: null,
  dominantElement: "Water",
  isAgent: false,
  compatibility: 81,
  mutualCommensals: 3,
  isCommensal: true,
  followState: null,
};

describe("discover wire parsers", (): void => {
  it("keeps a well-formed tables page and its cursor", (): void => {
    const out = parseDiscoverTablesResponse({ success: true, tables: [tableCard], nextCursor: "abc" });
    expect(out).toEqual({ success: true, tables: [tableCard], nextCursor: "abc" });
  });

  it("keeps optional card fields the server omits as absent", (): void => {
    const withGeo = { ...tableCard, distanceKm: 1.5, photoUrl: "https://x/y.jpg", venue: { type: "cafe", name: "Blue" } };
    expect(parseDiscoverTablesResponse({ success: true, tables: [withGeo], nextCursor: null }).tables).toEqual([withGeo]);
  });

  it("drops a malformed card instead of letting it crash the list", (): void => {
    const broken = { ...tableCard, id: "t2", host: { id: "u1" } };
    expect(parseDiscoverTablesResponse({ success: true, tables: [tableCard, broken] }).tables).toEqual([tableCard]);
  });

  it("throws when cards arrived and none matched, so drift is not read as an empty page", (): void => {
    const broken = { ...tableCard, host: { id: "u1" } };
    expect(() => parseDiscoverTablesResponse({ success: true, tables: [broken, { ...broken, id: "t3" }] })).toThrow(TypeError);
    expect(() => parseDiscoverPeopleResponse({ success: true, people: [{ id: "u9" }] })).toThrow(TypeError);
  });

  it("control: a genuinely empty list is still an empty page, not an error", (): void => {
    expect(parseDiscoverTablesResponse({ success: true, tables: [], nextCursor: null }).tables).toEqual([]);
    expect(parseDiscoverPeopleResponse({ success: true, people: [] }).people).toEqual([]);
  });

  it("passes the server's failure envelope through with its empty list", (): void => {
    const out = parseDiscoverTablesResponse({ success: false, message: "Failed to load tables", tables: [], nextCursor: null });
    expect(out).toEqual({ success: false, message: "Failed to load tables", tables: [], nextCursor: null });
  });

  it("throws (into the hook's catch) on a non-object body or non-array list", (): void => {
    expect(() => parseDiscoverTablesResponse(null)).toThrow(TypeError);
    expect(() => parseDiscoverTablesResponse([])).toThrow(TypeError);
    expect(() => parseDiscoverTablesResponse({ success: true, tables: { a: 1 } })).toThrow(TypeError);
  });

  it("treats envelope fields of the wrong type as absent", (): void => {
    expect(parseDiscoverTablesResponse({ success: "yes", message: 4, nextCursor: 7 })).toEqual({});
  });

  it("parses people, including a null follow state", (): void => {
    const out = parseDiscoverPeopleResponse({ success: true, people: [personCard, { ...personCard, id: "u3", followState: "following" }] });
    expect(out.people?.map((p) => p.followState)).toEqual([null, "following"]);
    // A card with a non-boolean isAgent is rejected: dropped beside a valid neighbour, a throw when it is all there is.
    const bad = { ...personCard, id: "u4", isAgent: 1 };
    expect(parseDiscoverPeopleResponse({ success: true, people: [personCard, bad] }).people).toEqual([personCard]);
    expect(() => parseDiscoverPeopleResponse({ success: true, people: [bad] })).toThrow(TypeError);
  });
});
