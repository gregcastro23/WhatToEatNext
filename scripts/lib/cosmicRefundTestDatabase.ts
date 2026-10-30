/** Refund proofs commit transactions: they may use only an explicit local test database. */
export function requireCosmicRefundTestDatabaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error("COSMIC_REFUND_TEST_DATABASE_URL must name a disposable loopback test database; no database was contacted");
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid disposable refund test database URL");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.search !== "" || url.hash !== "" ||
    !/^\/(?:cosmic_refund_test|phase45_test)(?:_[a-z0-9]+)*$/i.test(url.pathname)
  ) {
    throw new Error("Refund proofs require a disposable loopback cosmic_refund_test or phase45_test database");
  }
  return raw;
}
