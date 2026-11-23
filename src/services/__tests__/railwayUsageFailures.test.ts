/**
 * @jest-environment node
 *
 * A Railway usage failure must be VISIBLE and must not leak the token.
 *
 * `_logger.warn` is silent in production (only `.error` is ungated), and the
 * reader used to log failures with `warn`, so a production failure left no
 * trace and the panel blamed a missing token. These tests pin: every failure is
 * one `_logger.error` line (status or first GraphQL error, plus the query),
 * never `warn`, and the token appears in no log line or outcome. The token
 * here is a FAKE value.
 */

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { loggedText } from "@/__tests__/helpers/loggedText";
import { _logger } from "@/lib/logger";
import { readRailwayResourceUsage } from "@/services/railwayUsageService";

const TOKEN = "rwy-FAKE-TOKEN-0123456789";
const mockError = jest.mocked(_logger.error);
const mockWarn = jest.mocked(_logger.warn);
const realFetch = global.fetch;

interface Reply {
  ok: boolean;
  status: number;
  body: unknown;
}

/** Answer `usage` and `estimatedUsage` separately (they are two requests). */
function stubRailway(usage: Reply | Error, estimated: Reply | Error): jest.Mock {
  return installFetchMock(
    jest.fn(async (_url: unknown, init: unknown) => {
      const isEstimated = typeof init === "object" && init !== null && "body" in init && String(init.body).includes("estimatedUsage");
      const reply = isEstimated ? estimated : usage;
      if (reply instanceof Error) throw reply;
      return { ok: reply.ok, status: reply.status, json: async () => reply.body };
    }),
  );
}

const GOOD_USAGE: Reply = { ok: true, status: 200, body: { data: { usage: [{ measurement: "MEMORY_USAGE_GB", value: 100 }] } } };
const GOOD_ESTIMATE: Reply = { ok: true, status: 200, body: { data: { estimatedUsage: [{ measurement: "MEMORY_USAGE_GB", estimatedValue: 200 }] } } };

describe("Railway usage failures are logged and token-free", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAILWAY_API_TOKEN = TOKEN;
  });
  afterEach(() => {
    delete process.env.RAILWAY_API_TOKEN;
    global.fetch = realFetch;
  });

  it("logs an HTTP failure as ONE `_logger.error` line naming the status and the query, never as `warn`", async () => {
    stubRailway({ ok: false, status: 401, body: {} }, GOOD_ESTIMATE);

    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "HTTP 401 on usage" });
    expect(mockError.mock.calls).toEqual([["[railwayUsage] HTTP 401 on usage"]]);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("logs the first GraphQL error message and the query", async () => {
    stubRailway({ ok: true, status: 200, body: { errors: [{ message: "Not Authorized" }, { message: "second" }] } }, GOOD_ESTIMATE);

    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "Not Authorized on usage" });
    expect(mockError.mock.calls).toEqual([["[railwayUsage] Not Authorized on usage"]]);
  });

  it("logs a response that carries neither data nor errors as 'no data'", async () => {
    stubRailway({ ok: true, status: 200, body: {} }, GOOD_ESTIMATE);

    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "no data on usage" });
  });

  it("names a timeout as a timeout", async () => {
    stubRailway(Object.assign(new Error("This operation was aborted"), { name: "AbortError" }), GOOD_ESTIMATE);

    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "timed out after 6s on usage" });
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  it("keeps a malformed payload's reason to one bounded line", async () => {
    // Five bad rows: the schema error is a long multi-line dump, so BOTH the
    // newline collapse and the length bound are exercised.
    const badRows = Array.from({ length: 5 }, () => ({ value: "not a measurement" }));
    stubRailway({ ok: true, status: 200, body: { data: { usage: badRows } } }, GOOD_ESTIMATE);

    const outcome = await readRailwayResourceUsage();
    expect(outcome.status).toBe("failed");
    const reason = outcome.status === "failed" ? outcome.reason : "";
    expect(reason).not.toMatch(/\n/);
    expect(reason.length).toBe(200);
    expect(mockError.mock.calls[0]?.[0]).toBe(`[railwayUsage] ${reason}`);
  });

  it("a failed best-effort projection is logged too, but the outcome stays ok (MTD is real)", async () => {
    stubRailway(GOOD_USAGE, { ok: false, status: 502, body: {} });

    const outcome = await readRailwayResourceUsage();
    expect(outcome.status).toBe("ok");
    expect(mockError.mock.calls).toEqual([["[railwayUsage] HTTP 502 on estimatedUsage"]]);
  });

  it("control: a fully healthy read logs nothing", async () => {
    stubRailway(GOOD_USAGE, GOOD_ESTIMATE);

    expect((await readRailwayResourceUsage()).status).toBe("ok");
    expect(mockError).not.toHaveBeenCalled();
    expect(mockWarn).not.toHaveBeenCalled();
  });

  describe("the token never appears in a log line or an outcome, even when Railway or the network echoes it", () => {
    const echoes: Array<[string, Reply | Error]> = [
      ["a GraphQL error message", { ok: true, status: 200, body: { errors: [{ message: `Invalid token ${TOKEN}` }] } }],
      ["a network error message", new TypeError(`request failed, Authorization: Bearer ${TOKEN}`)],
    ];

    it.each(echoes)("echoed in %s", async (_label, usage) => {
      const fetchMock = stubRailway(usage, GOOD_ESTIMATE);
      const outcome = await readRailwayResourceUsage();

      expect(outcome.status).toBe("failed");
      expect(JSON.stringify(outcome)).not.toContain(TOKEN);
      expect(loggedText(mockError.mock.calls)).not.toContain(TOKEN);
      expect(loggedText(mockError.mock.calls)).toContain("[redacted]");
      // Witness: the token really was sent, so its absence above is not vacuous.
      expect(JSON.stringify(fetchMock.mock.calls)).toContain(`Bearer ${TOKEN}`);
    });
  });
});
