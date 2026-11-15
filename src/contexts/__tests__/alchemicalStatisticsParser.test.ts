/**
 * The statistics wire parser against the REAL producer. `GET` is the real route
 * handler over the real 1821-sample file, run in-process, so the body is what
 * production serialises. Only `fetch`, the network edge of the host tests, is
 * pointed at a Response (the real handler's, or a producer-shaped refusal).
 */
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { GET } from "@/app/api/alchm-quantities/statistics/route";
import {
  AlchemicalStatisticsProvider,
  useAlchemicalStatistics,
} from "@/contexts/AlchemicalStatisticsContext";
import { isJsonRecord, readJson } from "@/lib/api/json";
import {
  getAllPeriodStatistics,
  getSampleFileMeta,
} from "@/utils/alchemicalSampleLookup";
import { parseAllPeriodsResponse } from "../alchemicalStatisticsParser";

const DAY_MS = 86_400_000;
const { startMs, endMs, generatedAt, intervalHours, count } = getSampleFileMeta();
const MIDDLE_MS = Math.floor((startMs + endMs) / 2);

/** [label, reference ms, how many of the six period slots the producer sends as null]. */
const REFS: Array<[string, number, number]> = [
  ["a day before the file", startMs - DAY_MS, 6],
  ["the first sample (one sample per window)", startMs, 6],
  ["first sample + 3 days", startMs + 3 * DAY_MS, 0],
  ["the middle", MIDDLE_MS, 0],
  ["the last sample", endMs, 0],
  ["last + 2 days", endMs + 2 * DAY_MS, 1],
  ["last + 40 days", endMs + 40 * DAY_MS, 3],
  ["last + 100 days", endMs + 100 * DAY_MS, 4],
  ["last + 500 days", endMs + 500 * DAY_MS, 5],
  ["2026-11-14, a production day past the file", Date.parse("2026-11-14T12:00:00.000Z"), 3],
];

function getAt(ms: number): Promise<Response> {
  const ref = encodeURIComponent(new Date(ms).toISOString());
  return GET(new Request(`http://localhost/api/alchm-quantities/statistics?all=true&ref=${ref}`));
}

function sumNulls(children: unknown[]): number {
  return children.reduce<number>((sum, child) => sum + countNulls(child), 0);
}

function countNulls(value: unknown): number {
  if (value === null) return 1;
  if (Array.isArray(value)) return sumNulls(value);
  if (isJsonRecord(value)) return sumNulls(Object.values(value));
  return 0;
}

describe("statistics wire parser against the real route", () => {
  it.each(REFS)("round-trips every field of the real body: %s", async (_label, ms, nullSlots) => {
    const res = await getAt(ms);
    expect(res.status).toBe(200);
    const wire: unknown = JSON.parse(await res.clone().text());
    const parsed = await readJson(res, parseAllPeriodsResponse);
    const expected: unknown = JSON.parse(JSON.stringify(getAllPeriodStatistics(new Date(ms))));
    expect(parsed.periods).toStrictEqual(expected);
    expect(parsed.file).toStrictEqual({ generatedAt, intervalHours, count });
    expect(Object.values(parsed.periods).filter((slot) => slot === null)).toHaveLength(nullSlots);
    // The measured wire: the only nulls are the empty period slots, never a number.
    expect(countNulls(wire)).toBe(nullSlots);
  });

});

describe("the real producer and route beyond the fixed dates", () => {
  it("loses nothing on the wire across a sweep of 41 reference dates", () => {
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const memory = getAllPeriodStatistics(new Date(startMs + Math.round(((endMs - startMs) * i) / steps)));
      const wire: unknown = JSON.parse(JSON.stringify(memory));
      // toStrictEqual tells NaN and Infinity (null on the wire), undefined (dropped) and -0 from what survives.
      expect(wire).toStrictEqual(memory);
      const body = { success: true, file: getSampleFileMeta(), periods: wire };
      expect(parseAllPeriodsResponse(body).periods).toStrictEqual(memory);
    }
  });

  it("parses the live default-reference body whatever today is", async () => {
    const res = await GET(new Request("http://localhost/api/alchm-quantities/statistics?all=true"));
    const parsed = await readJson(res, parseAllPeriodsResponse);
    expect(parsed.periods.all).not.toBeNull();
    expect(parsed.file?.count).toBe(count);
  });

  it("serialises six file keys while the context declares three", async () => {
    const wire: unknown = JSON.parse(await (await getAt(MIDDLE_MS)).text());
    const file = isJsonRecord(wire) ? wire.file : null;
    expect(Object.keys(isJsonRecord(file) ? file : {}).sort()).toStrictEqual(
      ["count", "endMs", "generatedAt", "intervalHours", "startMs", "version"],
    );
  });

  it("keeps the one-bin histograms that constant series produce", async () => {
    const parsed = await readJson(await getAt(MIDDLE_MS), parseAllPeriodsResponse);
    const rows = Object.values(parsed.periods.all?.perPlanet ?? {});
    const quantities = rows.flatMap((row) => [
      ...Object.values(row.esms),
      ...Object.values(row.elements),
    ]);
    const constant = quantities.filter((q) => q.hist.binWidth === 0);
    expect(quantities).toHaveLength(80);
    expect(constant.length).toBeGreaterThan(0);
    expect(constant.every((q) => q.hist.counts.length === 1 && q.hist.edges.length === 2)).toBe(true);
  });
});

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  return createElement(AlchemicalStatisticsProvider, null, children);
}

describe("AlchemicalStatisticsProvider over the parser", () => {
  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  async function settle(
    response: Response,
  ): Promise<ReturnType<typeof useAlchemicalStatistics>> {
    globalThis.fetch = jest.fn(() => Promise.resolve(response));
    const hook = renderHook(() => useAlchemicalStatistics(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook.result.current;
  }

  it("publishes periods and file meta from the real body", async () => {
    const state = await settle(await getAt(MIDDLE_MS));
    expect(state.error).toBeNull();
    expect(state.allPeriods?.all).not.toBeNull();
    expect(state.active).toStrictEqual(state.allPeriods?.month);
    expect(state.fileMeta).toStrictEqual({ generatedAt, intervalHours, count });
  });

  it("answers a non-ok response with its HTTP status, before any parsing", async () => {
    const body = JSON.stringify({ error: "rate_limit_exceeded", retryAfter: 60 });
    const state = await settle(new Response(body, { status: 429 }));
    expect(state.error).toBe("HTTP 429");
    expect(state.allPeriods).toBeNull();
  });

  it("surfaces a JSON null body as the context error instead of crashing", async () => {
    const state = await settle(new Response("null", { status: 200 }));
    expect(state.error).toBe("Invalid statistics response: expected a JSON object");
    expect(state.allPeriods).toBeNull();
    expect(state.fileMeta).toBeNull();
  });

  it("keeps the old message for a 200 that reports failure", async () => {
    const state = await settle(new Response('{"success":false,"error":"x"}', { status: 200 }));
    expect(state.error).toBe("API reported failure");
    expect(state.allPeriods).toBeNull();
  });
});
