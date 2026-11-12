/**
 * Fixtures mirror the rows `src/app/api/amazon/search/route.ts` really builds
 * (static ASIN map, low-confidence PA-API with a reason, no-credentials
 * fallback). Every rejection test is paired with a control: the same body with
 * the one field valid must pass, so a rejection can only come from the parser.
 */
import { parseAmazonSearchResponse, parseAmazonSearchResults } from "../searchResponseParser";

const CONFIGURED = { paapi: true, creators: false };
const SEARCH_URL = "https://www.amazon.com/s?k=olive+oil&i=amazonfresh&tag=test-20";
const NO_MATCH = "No Amazon search result matched the expected shape";
const NO_RESULTS = "Amazon search response had no results array";
const NO_CONFIGURED = "Amazon search response had no valid configured flags";

const staticRow = {
  ingredient: "Olive Oil",
  normalized: "olive oil",
  amazonOptimizedSearchString: "extra virgin olive oil",
  amazonCategoryNode: "pantry",
  primaryBrandSelected: "California Olive Ranch",
  chakraAlignment: "sacral",
  alternateBrands: ["Bertolli"],
  asin: "B000XYZ123",
  searchUrl: SEARCH_URL,
  source: "verified_static_asin_map",
  matchConfidence: "high",
  inStock: true,
};

const lowConfidenceRow = {
  ingredient: "Saffron",
  normalized: "saffron",
  asin: null,
  searchUrl: SEARCH_URL,
  title: "Saffron Threads",
  inStock: true,
  source: "amazon_paapi_low_confidence",
  matchConfidence: "low",
  reason: "Catalog result title did not match ingredient tokens.",
};

const noCredentialsRow = {
  ingredient: "Za'atar",
  asin: null,
  searchUrl: SEARCH_URL,
  source: "no_live_catalog_credentials",
  matchConfidence: "low",
};

function body(rows: unknown, configured: unknown = CONFIGURED): Record<string, unknown> {
  return { results: rows, configured };
}

describe("parseAmazonSearchResponse", (): void => {
  it("rejects a real JSON null body", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseAmazonSearchResponse(parsed)).toThrow(
      "Amazon search response was not a JSON object",
    );
  });

  it.each([[[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseAmazonSearchResponse(value)).toThrow(
      "Amazon search response was not a JSON object",
    );
  });

  it("keeps the fields the callers read from the producer's real success body", (): void => {
    const parsed = parseAmazonSearchResponse(
      body([staticRow, lowConfidenceRow, noCredentialsRow]),
    );
    expect(parsed).toStrictEqual({
      results: [
        { ingredient: "Olive Oil", asin: "B000XYZ123", searchUrl: SEARCH_URL, source: "verified_static_asin_map" },
        {
          ingredient: "Saffron",
          asin: null,
          searchUrl: SEARCH_URL,
          source: "amazon_paapi_low_confidence",
          reason: "Catalog result title did not match ingredient tokens.",
        },
        { ingredient: "Za'atar", asin: null, searchUrl: SEARCH_URL, source: "no_live_catalog_credentials" },
      ],
      configured: CONFIGURED,
    });
  });

  it("reads the route's refusal body as drift, not as an empty result list", (): void => {
    expect(() => parseAmazonSearchResponse({ error: "Missing ingredients array" })).toThrow(NO_RESULTS);
    expect(() => parseAmazonSearchResponse({ results: "none", configured: CONFIGURED })).toThrow(NO_RESULTS);
    // control: the same envelope with an array of rows passes
    expect(parseAmazonSearchResponse(body([noCredentialsRow])).results).toHaveLength(1);
  });

  it("drops a mistyped row and keeps the valid one", (): void => {
    const bad = { ...lowConfidenceRow, asin: 7 };
    expect(parseAmazonSearchResponse(body([staticRow])).results).toHaveLength(1);
    const mixed = parseAmazonSearchResponse(body([bad, staticRow]));
    expect(mixed.results.map((row) => row.ingredient)).toEqual(["Olive Oil"]);
    expect(() => parseAmazonSearchResponse(body([bad]))).toThrow(NO_MATCH);
    // control: the identical row with a valid asin is kept
    expect(parseAmazonSearchResponse(body([{ ...bad, asin: "B000AAA111" }])).results).toHaveLength(1);
  });

  it.each<[string, Record<string, unknown>]>([
    ["asin of the wrong type", { asin: 7 }],
    ["asin omitted", { asin: undefined }],
    ["ingredient of the wrong type", { ingredient: 4 }],
    ["searchUrl of the wrong type", { searchUrl: null }],
    ["source omitted", { source: undefined }],
    ["reason of the wrong type", { reason: 4 }],
  ])("rejects a row with %s", (_label, patch): void => {
    // control: the unpatched row passes
    expect(() => parseAmazonSearchResponse(body([lowConfidenceRow]))).not.toThrow();
    expect(() => parseAmazonSearchResponse(body([{ ...lowConfidenceRow, ...patch }]))).toThrow(NO_MATCH);
  });

  it.each([[null], [[]], ["row"], [3]])("drops a row that is not an object (%j)", (item): void => {
    expect(parseAmazonSearchResponse(body([item, staticRow])).results).toHaveLength(1);
    expect(() => parseAmazonSearchResponse(body([item]))).toThrow(NO_MATCH);
  });

  it("treats an empty results array as no rows, not as drift", (): void => {
    expect(parseAmazonSearchResponse(body([]))).toStrictEqual({ results: [], configured: CONFIGURED });
  });

  it("requires both configured flags to be booleans", (): void => {
    expect(parseAmazonSearchResponse(body([staticRow], { paapi: false, creators: true })).configured).toStrictEqual({
      paapi: false,
      creators: true,
    });
    expect(() => parseAmazonSearchResponse(body([staticRow], { paapi: true, creators: "yes" }))).toThrow(
      NO_CONFIGURED,
    );
    // `body(rows, undefined)` would fall back to the default, so omit the key outright
    expect(() => parseAmazonSearchResponse({ results: [staticRow] })).toThrow(NO_CONFIGURED);
    expect(() => parseAmazonSearchResponse(body([staticRow], null))).toThrow(NO_CONFIGURED);
  });
});

describe("parseAmazonSearchResults (the cart's rows-only reader)", (): void => {
  it("returns the same rows as the full parser for the producer's real body", (): void => {
    const full = body([staticRow, lowConfidenceRow, noCredentialsRow]);
    expect(parseAmazonSearchResults(full)).toStrictEqual(parseAmazonSearchResponse(full).results);
  });

  it("does not depend on `configured`, which the cart never reads", (): void => {
    const noFlags = { results: [staticRow] };
    const badFlags = body([staticRow], { paapi: true, creators: "yes" });
    expect(parseAmazonSearchResults(noFlags)).toHaveLength(1);
    expect(parseAmazonSearchResults(badFlags)).toHaveLength(1);
    // control: the full parser rejects the very same bodies, so the cart's
    // tolerance is the rows-only reader's doing and not a test that cannot fail
    expect(() => parseAmazonSearchResponse(noFlags)).toThrow(NO_CONFIGURED);
    expect(() => parseAmazonSearchResponse(badFlags)).toThrow(NO_CONFIGURED);
  });

  it("still treats drift in the rows as drift", (): void => {
    const parsedNull: unknown = JSON.parse("null");
    expect(() => parseAmazonSearchResults(parsedNull)).toThrow("Amazon search response was not a JSON object");
    expect(() => parseAmazonSearchResults({ error: "Missing ingredients array" })).toThrow(NO_RESULTS);
    expect(() => parseAmazonSearchResults(body([{ ...lowConfidenceRow, asin: 7 }]))).toThrow(NO_MATCH);
    // control: the same body with a valid asin passes
    expect(parseAmazonSearchResults(body([{ ...lowConfidenceRow, asin: "B000AAA111" }]))).toHaveLength(1);
  });
});
