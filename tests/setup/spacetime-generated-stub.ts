// Test-time stub for the SpacetimeDB codegen entrypoint (@/lib/spacetime/generated).
// The real generated/index.ts builds its schema by calling into the
// `spacetimedb` package's ESM-only build (dist/index.browser.mjs), which
// ts-jest's transform pipeline can't parse. SpacetimeContext is the only
// runtime (non-type-only) consumer of this module, and it only ever calls
// DbConnection.builder() inside a connection-establishing effect that's
// already wrapped in a try/catch — SpacetimeDB is an enhancement layer, not
// a hard dependency, so a chainable no-op is sufficient for tests.
class NoopConnectionBuilder {
  withUri() { return this; }
  withDatabaseName() { return this; }
  withToken() { return this; }
  onConnect() { return this; }
  onConnectError() { return this; }
  onDisconnect() { return this; }
  build(): never {
    throw new Error("spacetime-generated-stub: no real connection in tests");
  }
}

export class DbConnection {
  static builder() {
    return new NoopConnectionBuilder();
  }
}
