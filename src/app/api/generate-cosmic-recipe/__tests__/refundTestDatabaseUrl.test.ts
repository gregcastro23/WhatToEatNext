/** @jest-environment node */
import { requireCosmicRefundTestDatabaseUrl } from "../../../../../scripts/lib/cosmicRefundTestDatabase";

describe("disposable cosmic refund test database boundary", () => {
  it.each([
    "postgresql://postgres@127.0.0.1:55439/phase45_test",
    "postgres://postgres@localhost:5432/cosmic_refund_test",
    "postgresql://postgres@[::1]:5432/cosmic_refund_test_worker1",
  ])("accepts an explicitly named loopback test database", (url) => {
    expect(requireCosmicRefundTestDatabaseUrl(url)).toBe(url);
  });

  it.each([
    undefined,
    "not a URL",
    "postgresql://postgres@production.example/cosmic_refund_test",
    "postgresql://postgres@127.0.0.1:5432/production",
    "postgresql://postgres@localhost:6432/alchm_kitchen",
    "https://localhost/cosmic_refund_test",
    "postgresql://postgres@localhost/cosmic_refund_test?host=production.example",
    "postgresql://postgres@localhost/cosmic_refund_test?database=production",
  ])("rejects missing, remote, application, or non-PostgreSQL destinations before connection", (url) => {
    expect(() => requireCosmicRefundTestDatabaseUrl(url)).toThrow();
  });
});
