/**
 * @jest-environment node
 *
 * `summarizePath` must report the two kinds of non-2xx SEPARATELY.
 *
 * Every health verdict in `systemStatusService` now reads `serverErrorRate`,
 * and `systemStatusService.test.ts` proves the verdicts are right — but it does
 * so with hand-built `PathHealth` fixtures. Those fixtures cannot tell you that
 * the field is ever POPULATED. If `summarizePath` returned `serverErrorRate:
 * undefined`, `undefined >= 0.5` is false, every watched path would report OK
 * forever, and all 24 of those tests would still pass. That is a total, silent
 * loss of the alarm, and this file is the only thing standing in front of it.
 *
 * The distinction being pinned, from production:
 * `[MEASURED 2026-08-14]` in a 7-day window the request log held 9,819 requests,
 * 6,488 of them >= 400 and ZERO of them >= 500. 6,427 were `402
 * insufficient_funds` on `/api/economy/sync-debit` — an agent trying to spend
 * ESMS it does not hold, which is that route doing its job. Counting those as
 * failures raised 26 INCIDENT alerts in 7 days.
 *
 * Neither `DATABASE_URL` nor a browser global is set under jest, so
 * `recordRequest`'s durable mirror and the ring's hydration both no-op and this
 * exercises the real in-memory implementation with no mocking at all.
 */
import { recordRequest, summarizePath } from "@/lib/observability/requestLog";

/** The ring is module-global and shared across tests — give every case its own
 *  prefix so one case's traffic can never be summarised into another's. */
let n = 0;
const freshPrefix = () => `/api/__probe${n++}`;

function record(prefix: string, statuses: number[]): void {
  for (const status of statuses) {
    recordRequest({ method: "POST", path: `${prefix}/x`, status, latencyMs: 12 });
  }
}

describe("summarizePath separates client refusals from server failures", () => {
  it("populates serverErrorRate at all — the field the verdicts read", () => {
    // Control for the whole file: if this is undefined rather than a number,
    // every health check downstream silently reads OK forever.
    const p = freshPrefix();
    record(p, [200, 500]);
    const h = summarizePath(p);
    expect(typeof h.serverErrorRate).toBe("number");
    expect(Number.isFinite(h.serverErrorRate)).toBe(true);
  });

  it("counts a wall of 402s as zero server error — the production case", () => {
    // The 2026-08-13 20:01 alert window: 72 requests, all 402.
    const p = freshPrefix();
    record(p, Array<number>(72).fill(402));
    const h = summarizePath(p);

    expect(h.count).toBe(72);
    expect(h.errors4xx).toBe(72);
    expect(h.errors5xx).toBe(0);
    expect(h.errorRate).toBe(1); // what the old rule read
    expect(h.serverErrorRate).toBe(0); // what the verdict reads now
  });

  it("keeps the two rates DIFFERENT when both kinds are present", () => {
    // 60 refusals + 12 genuine 500s. If the two fields ever collapse onto one
    // implementation, this is where it shows.
    const p = freshPrefix();
    record(p, [
      ...Array<number>(60).fill(402),
      ...Array<number>(12).fill(500),
    ]);
    const h = summarizePath(p);

    expect(h.errors4xx).toBe(60);
    expect(h.errors5xx).toBe(12);
    expect(h.errorRate).toBe(1);
    expect(h.serverErrorRate).toBeCloseTo(12 / 72, 10);
    expect(h.serverErrorRate).not.toBe(h.errorRate);
  });

  it("counts 5xx over ALL requests, not over the non-refused ones", () => {
    // Pins the denominator. 30 of 100 requests 500'd; 70 were refused. The
    // documented choice is 30/100, the standard availability definition — NOT
    // 30/30. See the note in statusFromPathHealth.
    const p = freshPrefix();
    record(p, [
      ...Array<number>(70).fill(402),
      ...Array<number>(30).fill(500),
    ]);
    const h = summarizePath(p);

    expect(h.serverErrorRate).toBeCloseTo(0.3, 10);
    expect(h.serverErrorRate).not.toBeCloseTo(1, 2);
  });

  it("treats every 5xx family member as a server failure", () => {
    const p = freshPrefix();
    record(p, [500, 502, 503, 504, 200]);
    const h = summarizePath(p);
    expect(h.errors5xx).toBe(4);
    expect(h.serverErrorRate).toBeCloseTo(0.8, 10);
  });

  it("reports serverErrorRate 0 on an unobserved path, not NaN", () => {
    // The zero-traffic branch returns early with its own literal, so it is a
    // second implementation of this field and needs its own case. 0/0 is NaN,
    // and NaN >= 0.5 is false — it would read as healthy while meaning nothing.
    const h = summarizePath(freshPrefix());
    expect(h.observed).toBe(false);
    expect(h.serverErrorRate).toBe(0);
    expect(Number.isNaN(h.serverErrorRate)).toBe(false);
  });

  it("stays healthy on a clean path", () => {
    const p = freshPrefix();
    record(p, [200, 200, 201, 204]);
    const h = summarizePath(p);
    expect(h.errorRate).toBe(0);
    expect(h.serverErrorRate).toBe(0);
    expect(h.successRate).toBe(1);
  });
});
