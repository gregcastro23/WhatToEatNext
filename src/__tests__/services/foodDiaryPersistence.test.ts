/**
 * @jest-environment node
 */
/**
 * Diary writes land in food_diary_entries or fail loudly, and a stored entry
 * can be edited from any server instance (owner ruling 2026-09-28).
 *
 * [MEASURED 2026-09-28, prod, read-only] The table held 0 rows. Every insert
 * bound `entry_<ms>_<random>` to its UUID `id` and failed; the service kept the
 * entry in one server instance's memory and answered 200. Update and delete
 * looked only in that memory.
 *
 * The statements themselves run against PostgreSQL, rolled back, in
 * scripts/checkFoodDiaryPersistenceSql.mjs. Here the database module is a
 * recorder, to pin the service around them.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import type { CreateFoodDiaryEntryInput } from "@/types/foodDiary";

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, params: unknown[]) => mockExecuteQuery(sql, params),
}));
jest.mock("@/services/questEventReporter", () => ({ reportQuestEventBestEffort: jest.fn() }));
jest.mock("@/services/TokenEconomyService", () => ({ tokenEconomy: { creditMultipleTokens: jest.fn() } }));

const USER = "7f3c1d2e-5a4b-4c3d-8e2f-1a2b3c4d5e6f";
const OTHER = "0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9";
const STORED = "3e4f5a6b-7c8d-49ea-8b0c-1d2e3f4a5b6c";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A banana from the quick-food presets: 358 mg potassium per 100 g, 118 g. */
const banana: CreateFoodDiaryEntryInput = {
  foodName: "Banana",
  foodSource: "quick",
  sourceId: "banana",
  date: new Date("2026-09-28T12:00:00Z"),
  mealType: "breakfast",
  time: "08:00",
  serving: { amount: 1, unit: "piece", grams: 118, description: "1 medium" },
  quantity: 1,
};

/** A row as pg returns it (NUMERIC as strings), written on another instance. */
const storedRow = {
  id: STORED, user_id: USER, food_name: "Banana", food_source: "quick", source_id: "banana",
  date: "2026-09-28", meal_type: "breakfast", time: "08:00:00", serving_amount: "1.000",
  serving_unit: "piece", serving_grams: "118.00", quantity: "1.000", calories: "105.00",
  potassium: "422.40", nutrition_confidence: "high", tags: [], is_favorite: false,
  created_at: "2026-09-28T08:00:00Z", updated_at: "2026-09-28T08:00:00Z",
};

let service: typeof import("@/services/FoodDiaryService").foodDiaryService;
beforeAll(async () => {
  process.env.DATABASE_URL = "postgres://recorder.invalid/db";
  ({ foodDiaryService: service } = await import("@/services/FoodDiaryService"));
});
beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 1 });
});

const insertCall = () => mockExecuteQuery.mock.calls.find(([sql]) => String(sql).includes("INSERT INTO food_diary_entries"));

describe("a diary write", () => {
  it("binds an id the UUID column accepts, and the potassium the entry carries", async () => {
    const entry = await service.createEntry(USER, banana);
    expect(entry.id).toMatch(UUID);
    expect(entry.nutrition.potassium).toBeCloseTo(422.4, 6);
    const [sql, params] = insertCall() ?? [];
    expect(String(sql)).toMatch(/\bpotassium\b/);
    expect(params).toContain(entry.nutrition.potassium);
  });

  it("that fails is an error, not an entry kept in one instance's memory", async () => {
    mockExecuteQuery.mockImplementation((sql: string) =>
      sql.includes("INSERT INTO food_diary_entries")
        ? Promise.reject(new Error('invalid input syntax for type uuid: "entry_1"'))
        : Promise.resolve({ rows: [], rowCount: 0 }),
    );
    await expect(service.createEntry(USER, banana)).rejects.toThrow(/uuid/);
  });
});

describe("a stored entry, not in this instance's memory", () => {
  beforeEach(() => {
    mockExecuteQuery.mockImplementation((sql: string, params: unknown[]) => {
      if (sql.includes("SELECT * FROM food_diary_entries WHERE id = $1")) return Promise.resolve({ rows: [storedRow] });
      if (sql.includes("DELETE FROM food_diary_entries")) return Promise.resolve({ rows: [], rowCount: params[1] === USER ? 1 : 0 });
      return Promise.resolve({ rows: [], rowCount: 1 });
    });
  });

  it("can be rated, and reads back its stored potassium", async () => {
    const updated = await service.updateEntry(USER, { id: STORED, rating: 4 });
    expect(updated?.rating).toBe(4);
    expect(updated?.nutrition.potassium).toBe(422.4);
  });

  it("can be deleted by its owner, and not by anyone else", async () => {
    expect(await service.deleteEntry(OTHER, STORED)).toBe(false);
    expect(await service.deleteEntry(USER, STORED)).toBe(true);
  });
});

describe("the entry schema", () => {
  it("accepts every source the app logs from, restaurant discovery included", async () => {
    const { CreateFoodDiaryEntrySchema } = await import("@/lib/validation/apiSchemas");
    const sources = ["recipe", "custom", "restaurant", "barcode", "search", "quick", "favorite"];
    const rejected = sources.filter((foodSource) => !CreateFoodDiaryEntrySchema.safeParse({ ...banana, foodSource }).success);
    expect(rejected).toEqual([]);
  });
});

describe("the day summary", () => {
  it("includes an entry logged after the day was first read", async () => {
    const day = new Date("2026-10-02T12:00:00Z");
    expect((await service.getDailySummary("guest", day)).entries).toHaveLength(0);
    await service.createEntry("guest", { ...banana, date: day });
    // It was cached as `daily_summary_guest_2026-10-02`; the entry must clear it.
    expect((await service.getDailySummary("guest", day)).entries).toHaveLength(1);
  });
});
