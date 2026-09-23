/**
 * @jest-environment node
 *
 * Vercel webhook verification against an INDEPENDENT implementation: the
 * expected signature below was produced by the OpenSSL CLI, not by node:crypto,
 *
 *   printf '%s' "$BODY" | openssl dgst -sha1 -hmac 'whsec_test_secret'
 *
 * so a wrong algorithm, key handling, or encoding in our code cannot also be
 * baked into the expectation.
 */

import { toVercelHookEvent, verifyVercelSignature } from "@/lib/hooks/vercel/vercelEvent";

const SECRET = "whsec_test_secret";
const BODY =
  '{"id":"evt_test_1","type":"deployment.error","createdAt":1790125000000,"payload":{"deployment":{"id":"dpl_abc","url":"alchm-kitchen-x.vercel.app","meta":{"githubCommitSha":"d8deec3603c1cdf631ac4add096fa9ec2b013f41","githubCommitMessage":"feat: x\\n\\nbody","githubCommitAuthorName":"Someone"}},"target":"production","project":{"id":"prj_FkAq08tNvdiV7rawfC49MezqzZQE"},"links":{"deployment":"https://vercel.com/x/y/dpl_abc"}},"region":"iad1"}';
const OPENSSL_SIGNATURE = "eae2b63ac093335a481c68b64cd18665a8fce408";

describe("verifyVercelSignature", () => {
  it("accepts the signature OpenSSL computes for the raw body", () => {
    expect(verifyVercelSignature(BODY, OPENSSL_SIGNATURE, SECRET)).toBe(true);
    expect(verifyVercelSignature(BODY, OPENSSL_SIGNATURE.toUpperCase(), SECRET)).toBe(true);
  });

  it("rejects a changed body, a wrong secret, a malformed header, and a missing secret", () => {
    expect(verifyVercelSignature(`${BODY} `, OPENSSL_SIGNATURE, SECRET)).toBe(false);
    expect(verifyVercelSignature(BODY, OPENSSL_SIGNATURE, "whsec_other")).toBe(false);
    expect(verifyVercelSignature(BODY, "sha1=" + OPENSSL_SIGNATURE, SECRET)).toBe(false);
    expect(verifyVercelSignature(BODY, OPENSSL_SIGNATURE.slice(0, 39), SECRET)).toBe(false);
    expect(verifyVercelSignature(BODY, null, SECRET)).toBe(false);
    expect(verifyVercelSignature(BODY, OPENSSL_SIGNATURE, undefined)).toBe(false);
  });
});

describe("toVercelHookEvent", () => {
  it("keys the event by Vercel's event id and the deployment as its subject", () => {
    const event = toVercelHookEvent(BODY);
    expect(event?.source).toBe("vercel");
    expect(event?.id).toBe("evt_test_1");
    expect(event?.type).toBe("deployment.error");
    expect(event?.subjectId).toBe("dpl_abc");
    expect(event?.occurredAt?.toISOString()).toBe(new Date(1790125000000).toISOString());
    expect(event?.data.target).toBe("production");
  });

  it("stores a curated summary: commit title only, no author or commit body", () => {
    const summary = toVercelHookEvent(BODY)?.summary ?? {};
    expect(summary).toEqual({
      type: "deployment.error",
      deploymentId: "dpl_abc",
      url: "alchm-kitchen-x.vercel.app",
      target: "production",
      projectId: "prj_FkAq08tNvdiV7rawfC49MezqzZQE",
      inspectUrl: "https://vercel.com/x/y/dpl_abc",
      commitSha: "d8deec3603c1cdf631ac4add096fa9ec2b013f41",
      commitRef: null,
      commitTitle: "feat: x",
    });
    expect(JSON.stringify(summary)).not.toContain("Someone");
  });

  it("returns null for anything that is not a Vercel envelope", () => {
    expect(toVercelHookEvent("not json")).toBeNull();
    expect(toVercelHookEvent('{"type":"deployment.ready"}')).toBeNull();
  });
});
