/**
 * @jest-environment node
 *
 * getRecommendations spends its own database queries on the user's signals
 * before it reads the bundled catalog. With the database down, the read of
 * which bundled recipes are unpublished must begin beside those queries, not
 * after they have failed [MEASURED 2026-11-02, real 5 s timeouts: the first
 * call in an outage took 10.8 s where it took 5.8 s before the rule existed].
 * The signals' query is left pending here, and only whether the read began,
 * and when, is observed.
 */
const mockStartRead = jest.fn();

jest.mock("@/lib/recipes/unpublishedCopies", () => ({ startPublicationRead: () => mockStartRead() }));
jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: {
    getEntries: () => new Promise(() => undefined),
    getFavorites: () => new Promise(() => undefined),
  },
}));

import { EnhancedRecommendationService } from "../EnhancedRecommendationService";

const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("EnhancedRecommendationService.getRecommendations", () => {
  it("begins the read of the unpublished recipes while the user's signals are still being gathered", async () => {
    void EnhancedRecommendationService.getRecommendations({ userId: "u1" });
    await settle();
    expect(mockStartRead).toHaveBeenCalledTimes(1);
  });
});
