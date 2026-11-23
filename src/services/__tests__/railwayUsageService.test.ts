/**
 * @jest-environment node
 *
 * Tests the Railway resource-usage reader that backs the dashboard's
 * "Resource Usage · MTD" panel. Query shapes were verified against the live
 * Railway GraphQL API; these lock the mapping + the fail-open contract so a
 * missing token or API error degrades to an honest, DISTINCT state (`no-token`
 * vs `failed` + reason) rather than fabricating numbers. Failure logging and
 * token secrecy: railwayUsageFailures.test.ts.
 */

import { readRailwayResourceUsage, type RailwayResourceUsage, type RailwayUsageOutcome } from "@/services/railwayUsageService";
import { asFetch } from "@/__tests__/helpers/fetchMock";

const ORIGINAL_ENV = process.env;

/** The usage of an `ok` outcome; any other outcome fails the test with what it was. */
function okUsage(outcome: RailwayUsageOutcome): RailwayResourceUsage {
  if (outcome.status !== "ok") throw new Error(`expected an ok outcome, got ${JSON.stringify(outcome)}`);
  return outcome.usage;
}

function mockFetch(body: unknown, ok = true, status = 200) {
  return jest.spyOn(global, "fetch").mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response);
}

describe("readRailwayResourceUsage", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it("reports `no-token` and does NOT call the API when RAILWAY_API_TOKEN is unset", async () => {
    delete process.env.RAILWAY_API_TOKEN;
    const fetchSpy = jest.spyOn(global, "fetch");
    expect(await readRailwayResourceUsage()).toEqual({ status: "no-token" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps MTD + projected into per-measurement items with pct = mtd/projected", async () => {
    process.env.RAILWAY_API_TOKEN = "tok";
    // `usage` and `estimatedUsage` are two separate requests; answer each by
    // inspecting the query body.
    jest.spyOn(global, "fetch").mockImplementation(
      asFetch(
        jest.fn((_url: unknown, init: { body?: unknown }) => {
          const body = String(init?.body ?? "");
          const data = body.includes("estimatedUsage")
            ? {
                data: {
                  estimatedUsage: [
                    { measurement: "MEMORY_USAGE_GB", estimatedValue: 200 },
                    { measurement: "NETWORK_TX_GB", estimatedValue: 20 },
                  ],
                },
              }
            : {
                data: {
                  usage: [
                    { measurement: "MEMORY_USAGE_GB", value: 100 },
                    { measurement: "NETWORK_TX_GB", value: 5 },
                  ],
                },
              };
          return Promise.resolve({ ok: true, status: 200, json: async () => data } as Response);
        }),
      ),
    );

    const res = okUsage(await readRailwayResourceUsage());
    expect(res.provider).toBe("Railway");
    expect(res.items).toHaveLength(4); // CPU, Memory, Disk, Egress always present

    expect(res.items.find((i) => i.measurement === "MEMORY_USAGE_GB")).toMatchObject(
      { resource: "Memory", mtdValue: 100, projectedValue: 200, pct: 0.5 },
    );
    expect(res.items.find((i) => i.measurement === "NETWORK_TX_GB")).toMatchObject(
      { resource: "Egress", mtdValue: 5, projectedValue: 20, pct: 0.25 },
    );
    // A measurement absent from the API response defaults to 0 (no fabrication).
    expect(res.items.find((i) => i.measurement === "CPU_USAGE")).toMatchObject(
      { mtdValue: 0, projectedValue: 0, pct: 0 },
    );
  });

  it("reports `failed` with Railway's first GraphQL error and the query on a GraphQL error payload", async () => {
    process.env.RAILWAY_API_TOKEN = "tok";
    mockFetch({ errors: [{ message: "unauthorized" }] });
    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "unauthorized on usage" });
  });

  it("reports `failed` with the HTTP status on a non-OK response", async () => {
    process.env.RAILWAY_API_TOKEN = "tok";
    mockFetch({}, false, 500);
    expect(await readRailwayResourceUsage()).toEqual({ status: "failed", reason: "HTTP 500 on usage" });
  });
});
