/**
 * Identity resolver — the privacy-sensitive heart of the identity flip.
 *
 * The matrix below is EXHAUSTIVE across event kind (legacy / stamped-default /
 * stamped-explicit, share true/false) × the actor's CURRENT share_identity
 * (true / false / null-no-row) × agenthood. The invariants under test:
 *   - legacy events are frozen under the old opt-in rule forever;
 *   - a later opt-out CONCEALS default-named posts but never retracts an
 *     explicit per-post opt-in;
 *   - nothing a user did later can REVEAL a post stamped anonymous;
 *   - agents are always named.
 */

import {
  buildIdentityStamp,
  defaultShareIdentity,
  normalizeFeedMetadata,
  readIdentityStamp,
  resolveFeedActorReveal,
  shareIdentityForPost,
  type IdentityStamp,
} from "@/lib/feed/identity";

const stamp = (share: boolean, explicit: boolean): { identity: IdentityStamp } => ({
  identity: { v: 2, share, explicit },
});

afterEach(() => {
  delete process.env.IDENTITY_DEFAULT_ANONYMOUS;
});

describe("resolveFeedActorReveal — the full matrix", () => {
  // Each row: [description, metadata, currentShareIdentity, expected]
  const CASES: Array<[string, unknown, boolean | null | undefined, boolean]> = [
    // ── LEGACY events (no stamp): frozen old rule — shareName === true only ──
    ["legacy opt-in stays revealed (setting on)", { shareName: true }, true, true],
    ["legacy opt-in stays revealed (setting off — freeze beats setting)", { shareName: true }, false, true],
    ["legacy opt-in stays revealed (no profile row)", { shareName: true }, null, true],
    ["legacy default stays anonymous (setting on — flip can't de-anonymize)", { shareName: false }, true, false],
    ["legacy default stays anonymous (setting off)", { shareName: false }, false, false],
    ["legacy default stays anonymous (no profile row)", { shareName: false }, null, false],
    ["legacy without any shareName stays anonymous (setting on)", {}, true, false],
    ["legacy without any shareName stays anonymous (setting off)", {}, false, false],
    ["legacy without any shareName stays anonymous (no profile row)", {}, undefined, false],
    ["legacy null metadata stays anonymous", null, true, false],
    ["legacy string 'true' shareName does NOT reveal (strict ===)", { shareName: "true" }, true, false],

    // ── STAMPED share=false (per-post anonymous): permanent, all settings ──
    ["stamped anonymous stays concealed (setting on)", stamp(false, false), true, false],
    ["stamped anonymous stays concealed (setting off)", stamp(false, false), false, false],
    ["stamped anonymous stays concealed (no profile row)", stamp(false, false), null, false],
    ["stamped EXPLICIT anonymous stays concealed (setting on)", stamp(false, true), true, false],
    ["stamped EXPLICIT anonymous stays concealed (setting off)", stamp(false, true), false, false],
    ["stamped EXPLICIT anonymous stays concealed (no profile row)", stamp(false, true), null, false],

    // ── STAMPED share=true explicit: the user chose — survives later opt-out ──
    ["explicit named stays revealed (setting on)", stamp(true, true), true, true],
    ["explicit named stays revealed (setting off — explicit beats opt-out)", stamp(true, true), false, true],
    ["explicit named stays revealed (no profile row)", stamp(true, true), null, true],

    // ── STAMPED share=true default: honors the CURRENT setting (rule 5) ──
    ["default-named revealed while setting on", stamp(true, false), true, true],
    ["default-named CONCEALED by a later opt-out", stamp(true, false), false, false],
    ["default-named revealed with no profile row (null = true)", stamp(true, false), null, true],
    ["default-named revealed with undefined setting", stamp(true, false), undefined, true],
  ];

  it.each(CASES)("%s", (_desc, metadata, currentShareIdentity, expected) => {
    expect(
      resolveFeedActorReveal({ isAgent: false, metadata, currentShareIdentity }),
    ).toBe(expected);
  });

  it("agents are ALWAYS revealed, whatever the stamp or setting says", () => {
    for (const [, metadata, currentShareIdentity] of CASES) {
      expect(
        resolveFeedActorReveal({ isAgent: true, metadata, currentShareIdentity }),
      ).toBe(true);
    }
  });

  it("accepts JSON-string metadata (both read paths store JSONB-as-text)", () => {
    expect(
      resolveFeedActorReveal({
        isAgent: false,
        metadata: JSON.stringify(stamp(true, true)),
        currentShareIdentity: false,
      }),
    ).toBe(true);
    expect(
      resolveFeedActorReveal({
        isAgent: false,
        metadata: JSON.stringify({ shareName: true }),
        currentShareIdentity: false,
      }),
    ).toBe(true);
    expect(
      resolveFeedActorReveal({ isAgent: false, metadata: "not json{", currentShareIdentity: true }),
    ).toBe(false);
  });

  it("treats a malformed stamp as LEGACY (the conservative rule)", () => {
    // Wrong version → legacy path → shareName decides.
    expect(
      resolveFeedActorReveal({
        isAgent: false,
        metadata: { identity: { v: 1, share: true }, shareName: false },
        currentShareIdentity: true,
      }),
    ).toBe(false);
    // Non-boolean share → legacy path.
    expect(
      resolveFeedActorReveal({
        isAgent: false,
        metadata: { identity: { v: 2, share: "yes" }, shareName: false },
        currentShareIdentity: true,
      }),
    ).toBe(false);
  });
});

describe("readIdentityStamp", () => {
  it("round-trips a valid stamp and rejects malformed ones", () => {
    expect(readIdentityStamp(stamp(true, false))).toEqual({ v: 2, share: true, explicit: false });
    expect(readIdentityStamp({ identity: { v: 2, share: false, explicit: true } })).toEqual({
      v: 2,
      share: false,
      explicit: true,
    });
    expect(readIdentityStamp({})).toBeNull();
    expect(readIdentityStamp({ identity: "v2" })).toBeNull();
    expect(readIdentityStamp({ identity: { v: 2 } })).toBeNull();
    expect(readIdentityStamp(null)).toBeNull();
  });

  it("normalizes explicit to a strict boolean", () => {
    expect(
      readIdentityStamp({ identity: { v: 2, share: true, explicit: "yes" } })?.explicit,
    ).toBe(false);
  });
});

describe("buildIdentityStamp (write side)", () => {
  it("stamps the profile default when the caller didn't choose", () => {
    expect(buildIdentityStamp(undefined, true)).toEqual({ v: 2, share: true, explicit: false });
    expect(buildIdentityStamp(undefined, false)).toEqual({ v: 2, share: false, explicit: false });
    // No profile row = shared by default (the flip).
    expect(buildIdentityStamp(undefined, null)).toEqual({ v: 2, share: true, explicit: false });
  });

  it("marks per-post choices explicit in both directions", () => {
    expect(buildIdentityStamp({ share: true }, false)).toEqual({ v: 2, share: true, explicit: true });
    expect(buildIdentityStamp({ share: false }, true)).toEqual({ v: 2, share: false, explicit: true });
  });

  it("IDENTITY_DEFAULT_ANONYMOUS=1 flips the DEFAULT only — explicit choices unaffected", () => {
    process.env.IDENTITY_DEFAULT_ANONYMOUS = "1";
    expect(buildIdentityStamp(undefined, true)).toEqual({ v: 2, share: false, explicit: false });
    expect(buildIdentityStamp(undefined, null)).toEqual({ v: 2, share: false, explicit: false });
    expect(buildIdentityStamp({ share: true }, true)).toEqual({ v: 2, share: true, explicit: true });
  });

  it("defaultShareIdentity mirrors rule 5's null-row semantics", () => {
    expect(defaultShareIdentity(true)).toBe(true);
    expect(defaultShareIdentity(null)).toBe(true);
    expect(defaultShareIdentity(undefined)).toBe(true);
    expect(defaultShareIdentity(false)).toBe(false);
  });
});

describe("shareIdentityForPost (composer helper)", () => {
  it("checked 'Post anonymously' → explicit per-post anonymous", () => {
    expect(shareIdentityForPost(true, true)).toBe(false);
    expect(shareIdentityForPost(true, false)).toBe(false);
  });

  it("unchecked against a global opt-out → explicit named", () => {
    expect(shareIdentityForPost(false, false)).toBe(true);
  });

  it("unchecked with the default on → undefined (stays revocable later)", () => {
    expect(shareIdentityForPost(false, true)).toBeUndefined();
  });
});

describe("normalizeFeedMetadata", () => {
  it("handles objects, JSON strings, and garbage", () => {
    expect(normalizeFeedMetadata({ a: 1 })).toEqual({ a: 1 });
    expect(normalizeFeedMetadata('{"a":1}')).toEqual({ a: 1 });
    expect(normalizeFeedMetadata("nope{")).toEqual({});
    expect(normalizeFeedMetadata(null)).toEqual({});
    expect(normalizeFeedMetadata(42)).toEqual({});
    expect(normalizeFeedMetadata("[1,2]")).toEqual([1, 2]);
  });
});
