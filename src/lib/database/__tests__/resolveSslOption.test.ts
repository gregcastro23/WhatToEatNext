/**
 * Regression test for the PgBouncer SSL trap.
 *
 * getDatabaseConfig() in rawPool.ts destructures the connection URL into
 * discrete pg fields, which drops the query string — so `?sslmode=disable` was
 * read by nothing and every remote host got forced TLS. Railway's PgBouncer
 * refuses TLS, so the app could never route through the pooler; setting
 * DATABASE_URL to the pooler would fail the handshake and take the database
 * offline on the next rebuild.
 *
 * The load-bearing case is "remote host + sslmode=disable". Under the previous
 * behaviour that returned `{ rejectUnauthorized: false }`; it must now be
 * `false`. The other cases pin the behaviour that must NOT change, so a future
 * edit can't quietly drop TLS for ordinary connections.
 */

import { resolveSslOption } from "@/lib/database/config";

const PGBOUNCER = "postgresql://u:p@zephyr.proxy.rlwy.net:40200/railway";
const DIRECT = "postgresql://u:p@tramway.proxy.rlwy.net:35670/railway";

describe("resolveSslOption", () => {
  it("disables TLS for a remote host when sslmode=disable is present", () => {
    // The whole point: this is what makes PgBouncer reachable.
    expect(resolveSslOption(new URL(`${PGBOUNCER}?sslmode=disable`))).toBe(
      false,
    );
  });

  it("still forces TLS for a remote host with no sslmode", () => {
    expect(resolveSslOption(new URL(DIRECT))).toEqual({
      rejectUnauthorized: false,
    });
  });

  it("does not disable TLS for other sslmode values", () => {
    for (const mode of ["require", "verify-ca", "verify-full", "prefer"]) {
      expect(resolveSslOption(new URL(`${DIRECT}?sslmode=${mode}`))).toEqual({
        rejectUnauthorized: false,
      });
    }
  });

  it("finds sslmode alongside other query parameters", () => {
    expect(
      resolveSslOption(
        new URL(`${PGBOUNCER}?application_name=alchm&sslmode=disable&foo=1`),
      ),
    ).toBe(false);
  });

  it("leaves local connections unencrypted", () => {
    expect(resolveSslOption(new URL("postgresql://u:p@localhost:5432/db"))).toBe(
      false,
    );
    expect(resolveSslOption(new URL("postgresql://u:p@127.0.0.1:5432/db"))).toBe(
      false,
    );
  });
});
