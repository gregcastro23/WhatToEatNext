/**
 * @jest-environment node
 *
 * Authorization on the food-diary Server Actions.
 *
 * Server Actions are PUBLIC endpoints — their action ids ship in the client
 * bundle because `useFoodDiary` imports them — so a `userId` parameter is a
 * claim from the caller, not identity. Before the guard, every one of these
 * read and wrote an arbitrary account's diary: `getEntries` turns the argument
 * straight into `WHERE user_id = $1`, and delete/update accepted it too. It
 * also routed around `/api/food-diary`, which authenticates properly.
 *
 * These tests poison the session getter rather than relying on ambient auth
 * state, and assert on whether the SERVICE was reached — a thrown error that
 * still queried the database would be no protection at all.
 */

// Stable delegates: jest `resetModules` re-runs mock factories per test, so the
// factories forward to these single instances.
const mockAuth = jest.fn();
const mockGetDayEntries = jest.fn();
const mockDeleteEntry = jest.fn();
const mockGetQuickFoodPresets = jest.fn();
const mockSearchFoods = jest.fn();

jest.mock("@/lib/auth/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: {
    getDayEntries: (...args: unknown[]) => mockGetDayEntries(...args),
    deleteEntry: (...args: unknown[]) => mockDeleteEntry(...args),
    getQuickFoodPresets: (...args: unknown[]) => mockGetQuickFoodPresets(...args),
    searchFoods: (...args: unknown[]) => mockSearchFoods(...args),
  },
}));

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: jest.fn(),
}));

import {
  getServerDayEntries,
  deleteServerEntry,
  searchServerFoods,
  getServerQuickFoodPresets,
} from "@/actions/foodDiary";

const OWNER = "11111111-1111-1111-1111-111111111111";
const VICTIM = "22222222-2222-2222-2222-222222222222";

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDayEntries.mockResolvedValue([{ id: "entry-1" }]);
  mockDeleteEntry.mockResolvedValue(true);
  mockGetQuickFoodPresets.mockResolvedValue([{ id: "preset-1" }]);
  mockSearchFoods.mockResolvedValue([]);
});

describe("food-diary Server Actions — caller-supplied userId is not identity", () => {
  it("rejects reading another user's diary, and never reaches the service", async () => {
    mockAuth.mockResolvedValue({ user: { id: OWNER } });

    await expect(getServerDayEntries(VICTIM, new Date())).rejects.toThrow(
      /not authorized/i,
    );

    // The assertion that matters: no query was issued for the victim.
    expect(mockGetDayEntries).not.toHaveBeenCalled();
  });

  it("rejects DELETING another user's entry, and never reaches the service", async () => {
    mockAuth.mockResolvedValue({ user: { id: OWNER } });

    await expect(deleteServerEntry(VICTIM, "entry-1")).rejects.toThrow(
      /not authorized/i,
    );
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });

  it("rejects a real user id when there is no session at all", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(getServerDayEntries(VICTIM, new Date())).rejects.toThrow(
      /not authorized/i,
    );
    expect(mockGetDayEntries).not.toHaveBeenCalled();
  });

  it("rejects when the session exists but carries no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });

    await expect(getServerDayEntries(VICTIM, new Date())).rejects.toThrow(
      /not authorized/i,
    );
    expect(mockGetDayEntries).not.toHaveBeenCalled();
  });

  it("does not leak whether the target id exists — same message either way", async () => {
    mockAuth.mockResolvedValue({ user: { id: OWNER } });
    const a = await getServerDayEntries(VICTIM, new Date()).catch(
      (e: Error) => e.message,
    );
    const b = await getServerDayEntries("no-such-user", new Date()).catch(
      (e: Error) => e.message,
    );
    // Assert they REJECTED before comparing. Comparing the two results alone
    // passes vacuously if neither throws (both become undefined) — which is
    // exactly the state this test exists to catch.
    expect(typeof a).toBe("string");
    expect(typeof b).toBe("string");
    expect(a).toBe(b);
  });
});

describe("the paths that must keep working", () => {
  it("allows a user to read their OWN diary", async () => {
    mockAuth.mockResolvedValue({ user: { id: OWNER } });

    await expect(getServerDayEntries(OWNER, new Date())).resolves.toEqual([
      { id: "entry-1" },
    ]);
    expect(mockGetDayEntries).toHaveBeenCalledTimes(1);
  });

  it("allows guest mode with no session — signed-out visitors still track food", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(searchServerFoods("guest", "apple")).resolves.toEqual([]);
    expect(mockSearchFoods).toHaveBeenCalledWith("guest", "apple");
    // Guest mode must not even consult the session; it is the signed-out path.
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("leaves the shared preset catalogue unguarded — it is not user data", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(getServerQuickFoodPresets()).resolves.toEqual([
      { id: "preset-1" },
    ]);
    expect(mockAuth).not.toHaveBeenCalled();
  });
});

describe("control — the mocks are actually wired", () => {
  it("proves the service mock is reachable, so 'not called' means blocked", async () => {
    // Without this, every `not.toHaveBeenCalled()` above would pass just as
    // happily against a mock nothing ever imports.
    mockAuth.mockResolvedValue({ user: { id: OWNER } });
    await getServerDayEntries(OWNER, new Date());
    expect(mockGetDayEntries).toHaveBeenCalledTimes(1);
  });

  it("proves the auth mock is reachable, so session poisoning is real", async () => {
    mockAuth.mockResolvedValue({ user: { id: OWNER } });
    await getServerDayEntries(OWNER, new Date());
    expect(mockAuth).toHaveBeenCalledTimes(1);
  });
});
