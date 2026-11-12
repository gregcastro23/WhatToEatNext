/**
 * Fixtures mirror the rows `geocodeLocation` really returns (Nominatim place
 * with a country, and a place with none and no resolvable zone). Every
 * rejection test is paired with a control: the same body with the one field
 * valid must pass, so a rejection can only come from the parser.
 */
import { parseLocationSearchResponse } from "../locationSearchParser";

const NO_MATCH = "No location search result matched the expected shape";
const NO_RESULTS = "Location search response had no results array";

const austin = {
  displayName: "Austin, Travis County, Texas, United States",
  latitude: 30.2711,
  longitude: -97.7437,
  type: "city",
  country: "United States",
  timezone: "America/Chicago",
};

const ocean = {
  displayName: "Pacific Ocean",
  latitude: 0.5,
  longitude: -160.25,
  type: "ocean",
  timezone: null,
};

function success(rows: unknown): Record<string, unknown> {
  return { success: true, results: rows };
}

describe("parseLocationSearchResponse", (): void => {
  it("rejects a real JSON null body", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseLocationSearchResponse(parsed)).toThrow(
      "Location search response was not a JSON object",
    );
  });

  it.each([[[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseLocationSearchResponse(value)).toThrow(
      "Location search response was not a JSON object",
    );
  });

  it("keeps the producer's real success body, including a row with no country", (): void => {
    const parsed = parseLocationSearchResponse(success([{ ...austin, extra: "ignored" }, ocean]));
    expect(parsed).toStrictEqual({ success: true, results: [austin, ocean] });
  });

  it("reads the route's refusal body as a refusal without parsing results", (): void => {
    const refusal = { success: false, message: "Query must be at least 2 characters" };
    expect(parseLocationSearchResponse(refusal)).toStrictEqual({ success: false });
    expect(parseLocationSearchResponse({ success: false, results: "junk" })).toStrictEqual({ success: false });
    // control: the same results value under success: true is rejected
    expect(() => parseLocationSearchResponse({ success: true, results: "junk" })).toThrow(NO_RESULTS);
  });

  it("reads a success flag of the wrong type as absent", (): void => {
    expect(parseLocationSearchResponse({ success: "true", results: [austin] })).toStrictEqual({});
    // control: the same body with a real boolean is parsed
    expect(parseLocationSearchResponse({ success: true, results: [austin] })).toStrictEqual({
      success: true,
      results: [austin],
    });
  });

  it("throws on success without a results array", (): void => {
    expect(() => parseLocationSearchResponse({ success: true })).toThrow(NO_RESULTS);
    expect(() => parseLocationSearchResponse({ success: true, results: null })).toThrow(NO_RESULTS);
  });

  it.each<[string, Record<string, unknown>]>([
    ["latitude as a string", { latitude: "30.27" }],
    ["latitude null (a NaN serialised by JSON)", { latitude: null }],
    ["longitude not finite", { longitude: Number.POSITIVE_INFINITY }],
    ["displayName of the wrong type", { displayName: 4 }],
    ["timezone omitted", { timezone: undefined }],
    ["timezone of the wrong type", { timezone: 5 }],
  ])("rejects a row with %s", (_label, patch): void => {
    // control: the unpatched row passes
    expect(() => parseLocationSearchResponse(success([austin]))).not.toThrow();
    expect(() => parseLocationSearchResponse(success([{ ...austin, ...patch }]))).toThrow(NO_MATCH);
  });

  it("drops a bad row and keeps the valid one", (): void => {
    const bad = { ...ocean, latitude: "0.5" };
    expect(parseLocationSearchResponse(success([bad, austin])).results).toStrictEqual([austin]);
    // control: the same row with a numeric latitude is kept
    expect(parseLocationSearchResponse(success([{ ...bad, latitude: 0.5 }, austin])).results).toStrictEqual([
      ocean,
      austin,
    ]);
  });

  it("does not drop a row for a mistyped country, the caller never reads it", (): void => {
    const parsed = parseLocationSearchResponse(success([{ ...austin, country: 4 }]));
    const { country: _country, ...withoutCountry } = austin;
    expect(parsed.results).toStrictEqual([withoutCountry]);
  });

  it.each<[string, Record<string, unknown>]>([
    ["type omitted", { type: undefined }],
    ["type null", { type: null }],
    ["type of the wrong type", { type: 4 }],
  ])("keeps a row with %s but drops the type, the caller shows it only when present", (_label, patch): void => {
    const { type: _type, ...withoutType } = austin;
    expect(parseLocationSearchResponse(success([{ ...austin, ...patch }])).results).toStrictEqual([withoutType]);
    // control: the same row with a string type keeps it
    expect(parseLocationSearchResponse(success([austin])).results).toStrictEqual([austin]);
  });

  it.each([[null], [[]], ["row"], [3]])("drops a row that is not an object (%j)", (item): void => {
    expect(parseLocationSearchResponse(success([item, austin])).results).toStrictEqual([austin]);
    expect(() => parseLocationSearchResponse(success([item]))).toThrow(NO_MATCH);
  });

  it("treats an empty results array as no rows, not as drift", (): void => {
    expect(parseLocationSearchResponse(success([]))).toStrictEqual({ success: true, results: [] });
  });
});
