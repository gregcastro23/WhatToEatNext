import {
  DbConnection,
  DbConnectionBuilder,
  tables,
  reducers,
  procedures,
} from "@/lib/spacetime/generated";

describe("SpacetimeDB Generated Module Smoke Tests", () => {
  it("exports core runtime objects and builders", () => {
    expect(DbConnection).toBeDefined();
    expect(typeof DbConnection.builder).toBe("function");
    expect(tables).toBeDefined();
    expect(reducers).toBeDefined();
    expect(procedures).toBeDefined();
  });

  it("constructs a DbConnectionBuilder without throwing", () => {
    const builder = DbConnection.builder();
    expect(builder).toBeInstanceOf(DbConnectionBuilder);
    expect(typeof builder.withUri).toBe("function");
    expect(typeof builder.withDatabaseName).toBe("function");
    expect(typeof builder.build).toBe("function");
  });

  it("exposes expected table and reducer accessor shapes", () => {
    expect(typeof tables).toBe("object");
    expect(typeof reducers).toBe("object");
    // Verify a sample of known reducers exist as function accessors
    expect(reducers).toHaveProperty("postFeedEvent");
    expect(reducers).toHaveProperty("createCommensalSession");
    expect(reducers).toHaveProperty("upsertMealPlanSlot");
  });
});
