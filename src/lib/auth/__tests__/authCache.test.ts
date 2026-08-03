import fs from "fs";
import path from "path";

/**
 * The auth user-cache is keyed by a NORMALIZED email.
 *
 * `getCachedUser` keyed `userCache` and `pendingLookups` on the raw email, so
 * "Test.User@Example.COM" and "test.user@example.com" were two different cache
 * entries for one account — a duplicated DB lookup, a duplicated in-flight
 * promise, and a TIMEOUT_ERROR cached under only one of the spellings.
 *
 * ── Why this test reads the SOURCE ──────────────────────────────────────────
 *
 * `getCachedUser`, `userCache` and `pendingLookups` are all module-private, and
 * importing auth.ts pulls in the whole NextAuth handler chain. The property that
 * matters is structural anyway — that EVERY key site normalizes — and a single
 * missed site is exactly the defect. So the sites are asserted directly.
 *
 * ⚠️ The first version of this file imported from "bun:test", which this repo
 * does not run (jest), so the suite failed to collect outright: `Cannot find
 * module 'bun:test'`. Its one assertion was also
 * `expect(a.toLowerCase().trim()).toBe(b.toLowerCase().trim())` — a test of
 * String.prototype, true no matter what auth.ts does.
 */

const AUTH_TS = path.resolve(__dirname, "../auth.ts");
const src = fs.readFileSync(AUTH_TS, "utf8");

/** The body of getCachedUser — the function this fix is about. */
function getCachedUserBody(): string {
  const start = src.indexOf("async function getCachedUser(");
  const rest = src.slice(start);
  const end = rest.indexOf("\n}\n");
  return rest.slice(0, end);
}

describe("auth cache email normalization", () => {
  it("POSITIVE CONTROL: auth.ts was really read and getCachedUser is still there", () => {
    // Without this, every assertion below would pass vacuously against an empty
    // string if the path ever drifted.
    expect(src.length).toBeGreaterThan(5_000);
    expect(src).toContain("async function getCachedUser(");
    expect(src).toContain("const userCache");
    expect(src).toContain("const pendingLookups");
    expect(getCachedUserBody().length).toBeGreaterThan(200);
  });

  it("derives the normalized key once, from the raw argument", () => {
    expect(getCachedUserBody()).toMatch(
      /const normalizedEmail\s*=\s*email\.toLowerCase\(\)\.trim\(\)/,
    );
  });

  it("uses the NORMALIZED key at every cache and lookup site", () => {
    const body = getCachedUserBody();
    // Each of these was a raw-`email` site before the fix. One left
    // un-normalized reintroduces the split-key bug for that path only, which is
    // the hardest version to notice.
    for (const site of [
      "userCache.get(normalizedEmail)",
      "pendingLookups.has(normalizedEmail)",
      "pendingLookups.get(normalizedEmail)",
      "pendingLookups.set(normalizedEmail",
      "pendingLookups.delete(normalizedEmail)",
      "userDatabase.getUserByEmail(normalizedEmail)",
    ]) {
      expect(body).toContain(site);
    }
    // Both cache writes — the success path and the cached-TIMEOUT_ERROR path.
    expect(body.match(/userCache\.set\(normalizedEmail/g) ?? []).toHaveLength(2);
  });

  it("NEGATIVE CONTROL: no raw-email key survives in getCachedUser", () => {
    // The assertions above stay satisfiable while a raw site lingers alongside
    // them, so absence is asserted separately.
    const body = getCachedUserBody();
    expect(body).not.toMatch(/userCache\.(get|set|delete)\(email[,)]/);
    expect(body).not.toMatch(/pendingLookups\.(get|set|has|delete)\(email[,)]/);
    expect(body).not.toMatch(/getUserByEmail\(email\)/);
  });

  it("normalizes on the other cache-write paths too, not just getCachedUser", () => {
    // The jwt/signIn callbacks write the same cache via their own `normEmail` /
    // `normTokenEmail` locals. A raw `user.email` key there would desync with
    // getCachedUser's normalized reads — same bug, different door.
    expect(src).not.toMatch(/userCache\.set\(user\.email[,)]/);
    expect(src).not.toMatch(/userCache\.set\(token\.email[,)]/);
  });
});
