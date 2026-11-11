import { parseAsinSearchResults } from "../asinSearchParser";

describe("parseAsinSearchResults", (): void => {
  it("returns rows, mapping a missing asin to null", (): void => {
    const out = parseAsinSearchResults({
      results: [
        { ingredient: "flour", asin: "B001", rateLimited: false },
        { ingredient: "salt", asin: null },
        { ingredient: "pepper" },
      ],
    });
    expect(out).toEqual([
      { ingredient: "flour", asin: "B001" },
      { ingredient: "salt", asin: null },
      { ingredient: "pepper", asin: null },
    ]);
  });

  it("returns undefined when results is absent (the old early return)", (): void => {
    expect(parseAsinSearchResults({})).toBeUndefined();
    expect(parseAsinSearchResults({ results: null })).toBeUndefined();
  });

  it("drops a row with no ingredient rather than discarding the batch", (): void => {
    expect(parseAsinSearchResults({ results: [{ asin: "B1" }, { ingredient: "oil", asin: "B2" }] })).toEqual([
      { ingredient: "oil", asin: "B2" },
    ]);
  });

  it("throws on a non-object body or a non-array results", (): void => {
    expect(() => parseAsinSearchResults(null)).toThrow(TypeError);
    expect(() => parseAsinSearchResults({ results: { a: 1 } })).toThrow(TypeError);
  });
});
