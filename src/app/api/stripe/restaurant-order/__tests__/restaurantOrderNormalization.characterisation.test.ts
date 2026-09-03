jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));

import { normalizeCustomerInfo } from "../helpers";

describe("restaurant-order normalizeCustomerInfo characterisation", () => {
  it("uses provided customer name when valid", () => {
    const info = normalizeCustomerInfo(
      { name: "Chef Gordon", phone: "123456", email: "gordon@kitchen.com" },
      { name: "Fallback Name", email: "fallback@kitchen.com" },
    );
    expect(info.name).toBe("Chef Gordon");
    expect(info.phone).toBe("123456");
    expect(info.email).toBe("gordon@kitchen.com");
  });

  it("falls back to fallback.name when provided name is empty or whitespace", () => {
    const info = normalizeCustomerInfo(
      { name: "   ", email: "" },
      { name: "Fallback Name", email: "fallback@kitchen.com" },
    );
    expect(info.name).toBe("Fallback Name");
    expect(info.email).toBe("fallback@kitchen.com");
    expect(info.phone).toBeUndefined();
  });

  it("falls back to fallback.email when both name and fallback.name are empty", () => {
    const info = normalizeCustomerInfo(
      { name: "" },
      { name: "", email: "fallback@kitchen.com" },
    );
    expect(info.name).toBe("fallback@kitchen.com");
  });

  it("falls back to 'Guest' when no names or emails are available", () => {
    const info = normalizeCustomerInfo(null, { name: null, email: null });
    expect(info.name).toBe("Guest");
    expect(info.email).toBeUndefined();
    expect(info.phone).toBeUndefined();
  });

  it("trims raw name and email fields", () => {
    const info = normalizeCustomerInfo(
      { name: "  Alice  ", email: "  alice@example.com  " },
      { name: null, email: null },
    );
    expect(info.name).toBe("Alice");
    expect(info.email).toBe("alice@example.com");
  });
});
