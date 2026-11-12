/**
 * Producer bodies: POST /api/tables (src/app/api/tables/route.ts:53, 66, 71,
 * 83, 95, 127, 133, 136). Network is blocked in Jest, so every body is a literal
 * fixture.
 */
import { parseCreateTableResponse } from "../createTableParser";

const TABLE = { id: "7", hostId: "u1", title: "Sunday Supper", status: "planned" };

describe("parseCreateTableResponse", (): void => {
  it("rejects a real JSON null body with a specific message", (): void => {
    const body: unknown = JSON.parse("null");
    expect(body).toBeNull();
    expect(() => parseCreateTableResponse(body)).toThrow("Create table response must be a JSON object");
  });

  it.each([[[]], ["text"], [7]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseCreateTableResponse(value)).toThrow("Create table response must be a JSON object");
  });

  it("keeps only the id of the producer's success body", (): void => {
    expect(parseCreateTableResponse({ success: true, table: TABLE })).toEqual({
      success: true,
      table: { id: "7" },
    });
  });

  it("keeps the message of a refusal and ignores validation details", (): void => {
    expect(
      parseCreateTableResponse({
        success: false,
        message: "Validation error",
        details: { title: ["title is required"] },
      }),
    ).toEqual({ success: false, message: "Validation error" });
  });

  it("keeps the message of the rate-limit 429 body", (): void => {
    expect(
      parseCreateTableResponse({ error: "rate_limit_exceeded", message: "Too many requests. Please try again shortly." }),
    ).toEqual({ message: "Too many requests. Please try again shortly." });
  });

  it("drops wrong-typed fields instead of coercing them", (): void => {
    const out = parseCreateTableResponse({ success: "true", message: 4, table: { id: 7 } });
    expect(out).toEqual({});
    // control: the identical keys with the right types are all kept
    expect(parseCreateTableResponse({ success: true, message: "m", table: { id: "7" } })).toEqual({
      success: true,
      message: "m",
      table: { id: "7" },
    });
  });

  it.each([[null], ["7"], [[]], [{}], [{ id: null }]])("drops a table that has no string id (%j)", (table): void => {
    expect(parseCreateTableResponse({ success: true, table })).toEqual({ success: true });
    // control: the same body with a string id keeps the table
    expect(parseCreateTableResponse({ success: true, table: { id: "7" } })).toEqual({
      success: true,
      table: { id: "7" },
    });
  });
});
