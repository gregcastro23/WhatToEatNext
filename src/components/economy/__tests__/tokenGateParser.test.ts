/**
 * TokenGate treats any body without `success === true` as "locked" and never
 * rejects one, so this parser must never throw on an object and must only keep
 * a field that has the type TokenGate reads it as.
 */
import { parseTokenGateResponse } from "../tokenGateParser";

describe("parseTokenGateResponse", (): void => {
  it("keeps a full success body", (): void => {
    const body = { success: true, hasAccess: true, item: { isOneTime: true }, extra: "ignored" };
    expect(parseTokenGateResponse(body)).toEqual({ success: true, hasAccess: true, item: { isOneTime: true } });
  });

  it("keeps a refusal and its message", (): void => {
    expect(parseTokenGateResponse({ success: false, message: "Insufficient balance" })).toEqual({
      success: false,
      message: "Insufficient balance",
    });
  });

  it("drops fields of the wrong type instead of coercing them", (): void => {
    const out = parseTokenGateResponse({ success: "true", hasAccess: 1, message: 4, item: { isOneTime: null } });
    expect(out).toEqual({ item: {} });
    // control: the same keys with the right types are all kept
    expect(parseTokenGateResponse({ success: true, hasAccess: false, message: "m", item: { isOneTime: false } })).toEqual({
      success: true,
      hasAccess: false,
      message: "m",
      item: { isOneTime: false },
    });
  });

  it.each([[null], [[]], ["text"], [7], [undefined]])("reads a non-object body (%j) as locked, without throwing", (value): void => {
    expect(parseTokenGateResponse(value)).toEqual({});
  });
});
