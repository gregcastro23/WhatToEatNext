/** @jest-environment node */
import {
  isZeroResultSearch,
  listZeroResultSearchGaps,
  normalizeZeroResultQuery,
  recordZeroResultSearchGap,
  resetSearchGapDebounceForTests,
  resolveZeroResultSearchGap,
  scrubSearchQueryPii,
} from "../searchGaps";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

describe("Omnibar Phase 7 — Zero-Result Search Gap Capture", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    resetSearchGapDebounceForTests();
  });

  describe("scrubSearchQueryPii & normalizeZeroResultQuery", () => {
    it("strips emails, phone numbers, and 4+ digit numeric tokens", () => {
      const raw =
        "chef@example.com 555-234-5678 +1 (800) 555-0199 9876543210 yuzu kosho paste";
      expect(scrubSearchQueryPii(raw)).toBe("yuzu kosho paste");

      const normalized = normalizeZeroResultQuery(raw);
      expect(normalized).toEqual({
        normalizedQuery: "yuzu kosho paste",
        sampleRawQuery: "yuzu kosho paste",
      });
    });

    it("folds accents, lowercases, trims, and caps at 64 chars", () => {
      const raw = "   Crème   Brûlée   with   Sichuan   Peppercorn   ";
      const normalized = normalizeZeroResultQuery(raw);
      expect(normalized).toEqual({
        normalizedQuery: "creme brulee with sichuan peppercorn",
        sampleRawQuery: "Crème Brûlée with Sichuan Peppercorn",
      });

      const veryLong = `exotic ingredient ${"a".repeat(80)}`;
      const longResult = normalizeZeroResultQuery(veryLong);
      expect(longResult?.normalizedQuery.length).toBeLessThanOrEqual(64);
    });

    it("rejects queries shorter than 3 chars or purely numeric/PII inputs", () => {
      expect(normalizeZeroResultQuery("")).toBeNull();
      expect(normalizeZeroResultQuery("ab")).toBeNull();
      expect(normalizeZeroResultQuery("123456789")).toBeNull();
      expect(normalizeZeroResultQuery("user@domain.org 555-123-4567")).toBeNull();
    });
  });

  describe("isZeroResultSearch", () => {
    it("returns true only when hero, containing, coverage, and all kind totals are 0", () => {
      expect(
        isZeroResultSearch({
          hero: null,
          recipesContainingTotal: 0,
          coverage: null,
          total: { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 },
        }),
      ).toBe(true);

      expect(
        isZeroResultSearch({
          hero: { name: "Spinach" },
          recipesContainingTotal: 0,
          coverage: null,
          total: { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 },
        }),
      ).toBe(false);

      expect(
        isZeroResultSearch({
          hero: null,
          recipesContainingTotal: 0,
          coverage: null,
          total: { ingredient: 0, recipe: 1, cuisine: 0, method: 0, sauce: 0 },
        }),
      ).toBe(false);
    });
  });

  describe("recordZeroResultSearchGap & admin listing", () => {
    it("upserts normalized query, deduplicates within debounce window, and lists gaps", async () => {
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const firstWrite = await recordZeroResultSearchGap(
        "  Black Garlic Mole 99999 ",
        ["diet:vegan", "diet:vegan"],
        { nowMs: 1_000 },
      );
      expect(firstWrite).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      expect(mockExecuteQuery.mock.calls[0]?.[1]).toEqual([
        "black garlic mole",
        "Black Garlic Mole",
        JSON.stringify(["diet:vegan"]),
      ]);

      // Immediate duplicate within 10s debounce window is skipped
      const debouncedWrite = await recordZeroResultSearchGap(
        "black garlic mole",
        [],
        { nowMs: 5_000 },
      );
      expect(debouncedWrite).toBe(false);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);

      // After debounce window, increments counter again
      const laterWrite = await recordZeroResultSearchGap(
        "black garlic mole",
        [],
        { nowMs: 15_000 },
      );
      expect(laterWrite).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });

    it("lists and resolves search gaps for admin overview", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: "gap-1",
              normalized_query: "yuzu kosho",
              sample_raw_query: "Yuzu Kosho",
              hit_count: "7",
              first_seen_at: "2026-11-10T10:00:00.000Z",
              last_seen_at: "2026-11-10T12:00:00.000Z",
              top_filters: ["diet:vegan"],
              resolved_at: null,
              resolved_entity_slug: null,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              unresolved_queries: "1",
              unresolved_hits: "7",
              resolved_queries: "2",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "gap-1" }],
        });

      const summary = await listZeroResultSearchGaps({ limit: 10 });
      expect(summary.totals).toEqual({
        unresolvedQueries: 1,
        unresolvedHits: 7,
        resolvedQueries: 2,
      });
      expect(summary.gaps[0]?.normalizedQuery).toBe("yuzu kosho");
      expect(summary.gaps[0]?.hitCount).toBe(7);

      const resolved = await resolveZeroResultSearchGap("yuzu kosho", "yuzu-kosho");
      expect(resolved).toBe(true);
    });
  });
});

