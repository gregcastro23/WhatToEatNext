/**
 * POST /api/astrological/recipe-recommendations-by-chart — the proxy accepts what its client sends,
 * forwards it to the backend it is configured for, and tells the browser nothing the backend said.
 *
 * The route validated `BirthDataSchema` (an ISO `dateTime`), but its only client,
 * `fetchAstrologicalRecipes`, sends `{ year, month, day, hour, minute, latitude, longitude }`,
 * which is also what the Python backend's `RecipeRecommendationRequest` requires. Every request
 * the client could make was answered 400 here, before it reached the backend.
 *
 * The Python half of the contract is read from the backend's source (the request model in
 * backend/alchm_kitchen/main.py and CHART_RANGES in backend/utils/by_chart_recommendations.py),
 * so the two cannot drift apart unnoticed.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { installFetchMock } from "../helpers/fetchMock";
import { POST } from "@/app/api/astrological/recipe-recommendations-by-chart/route";
import { _logger } from "@/lib/logger";
import { RecipeRecommendationRequestSchema } from "@/lib/validation/recipeRecommendationRequest";

jest.mock("@/lib/logger", () => ({ _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() } }));
const mockLogger = { error: jest.mocked(_logger.error) };

const CLIENT_BODY = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 12,
  minute: 30,
  latitude: 40.7498,
  longitude: -73.7976,
};
const BACKEND_REPLY = { recommendations: [], lunar_phase: null };
const BACKEND_PATH = "/api/astrological/recipe-recommendations-by-chart";

function request(body: unknown): NextRequest {
  return new NextRequest(`http://localhost${BACKEND_PATH}`, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function backendReturns(init: { ok: boolean; status: number; json: () => Promise<unknown> }): jest.Mock {
  return installFetchMock(jest.fn().mockResolvedValue({ statusText: "stub", ...init }));
}

const okBackend = () => backendReturns({ ok: true, status: 200, json: async () => BACKEND_REPLY });

/** CHART_RANGES from the Python backend: field -> [low, high]. */
function pythonChartRanges(): Record<string, [number, number]> {
  const source = readFileSync(path.join(process.cwd(), "backend/utils/by_chart_recommendations.py"), "utf8");
  const table = source.split("CHART_RANGES = {")[1]?.split("}")[0] ?? "";
  const rows = [...table.matchAll(/"(\w+)":\s*\(\s*(-?[\d.]+),\s*(-?[\d.]+)\s*\)/g)];
  return Object.fromEntries(rows.map((m): [string, [number, number]] => [m[1], [Number(m[2]), Number(m[3])]]));
}

/** The required and optional fields of `RecipeRecommendationRequest` in the Python backend. */
function backendFields(): { required: string[]; optional: string[] } {
  const source = readFileSync(path.join(process.cwd(), "backend/alchm_kitchen/main.py"), "utf8");
  const body = source.split("class RecipeRecommendationRequest(BaseModel):")[1]?.split(/\n\n/)[0] ?? "";
  const fields = [...body.matchAll(/^\s+(\w+):\s*([^=#\n]+?)\s*(=[^#\n]*)?(?:#.*)?$/gm)];
  return {
    required: fields.filter((f) => f[3] === undefined).map((f) => f[1]),
    optional: fields.filter((f) => f[3] !== undefined).map((f) => f[1]),
  };
}

describe("POST /api/astrological/recipe-recommendations-by-chart", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  beforeEach(() => {
    delete process.env.BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://backend.example";
    mockLogger.error.mockClear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  it("forwards the client's own request body to the backend with POST and a JSON content type", async () => {
    const fetchSpy = okBackend();

    const response = await POST(request(CLIENT_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(BACKEND_REPLY);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`https://backend.example${BACKEND_PATH}`);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual(CLIENT_BODY);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("does not pass the backend's optional fields through from a browser", async () => {
    const fetchSpy = okBackend();

    await POST(request({ ...CLIENT_BODY, secondary_chart_ids: ["someone-elses-chart"], include_lunar_data: true }));

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual(CLIENT_BODY);
  });

  it.each([
    ["the old BirthDataSchema shape", { dateTime: "1990-06-15T12:30:00Z", latitude: 40.7, longitude: -73.8 }],
    ["a string year", { ...CLIENT_BODY, year: "1990" }],
    ["a fractional day", { ...CLIENT_BODY, day: 1.5 }],
    ["a fractional year", { ...CLIENT_BODY, year: 1990.5 }],
    ["a missing minute", { ...CLIENT_BODY, minute: undefined }],
    ["February 30", { ...CLIENT_BODY, month: 2, day: 30 }],
    ["February 29 of a common year", { ...CLIENT_BODY, year: 2023, month: 2, day: 29 }],
    ["April 31", { ...CLIENT_BODY, month: 4, day: 31 }],
  ])("answers 400 and never calls the backend for %s", async (_label, body) => {
    const fetchSpy = okBackend();

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["month", { month: 13 }, /12/],
    ["day", { day: 32 }, /31/],
    ["year", { year: 1990.5 }, /int/],
    ["year", { year: 3001 }, /3000/],
    ["hour", { hour: 24 }, /23/],
    ["minute", { minute: 60 }, /59/],
    ["latitude", { latitude: 90.5 }, /90/],
    ["longitude", { longitude: -180.5 }, /180/],
  ])("blames %s, with its own range, for %j", async (field, change, range) => {
    okBackend();

    const response = await POST(request({ ...CLIENT_BODY, ...change }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details[field].join(" ")).toMatch(range);
  });

  it.each([
    ["February 29 of a leap year", { ...CLIENT_BODY, year: 2024, month: 2, day: 29 }],
    ["the first day of year 1", { ...CLIENT_BODY, year: 1, month: 1, day: 1 }],
    ["the last day of year 3000", { ...CLIENT_BODY, year: 3000, month: 12, day: 31 }],
  ])("accepts %s", async (_label, body) => {
    okBackend();

    expect((await POST(request(body))).status).toBe(200);
  });

  it("answers 400 for a body that is not JSON", async () => {
    const fetchSpy = okBackend();

    expect((await POST(request("{not json"))).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("passes a backend failure's status through but not its body, which goes to the log", async () => {
    const detail = 'Failed: (psycopg2.errors.InvalidTextRepresentation) SELECT ... WHERE id = $1 [parameters: ("x",)] host=db.internal';
    backendReturns({ ok: false, status: 500, json: async () => ({ detail }) });

    const response = await POST(request(CLIENT_BODY));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Failed to fetch recipe recommendations from backend" });
    expect(JSON.stringify(body)).not.toContain("psycopg2");
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("500"), { detail });
  });

  it("answers 500 without the error message when the backend cannot be reached", async () => {
    installFetchMock(jest.fn().mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.7:8000")));

    const response = await POST(request(CLIENT_BODY));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Internal Server Error" });
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("answers 504 when the backend does not answer in time", async () => {
    installFetchMock(jest.fn().mockRejectedValue(Object.assign(new Error("signal timed out"), { name: "TimeoutError" })));

    const response = await POST(request(CLIENT_BODY));

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({ message: "The recommendations backend did not answer in time" });
  });
});

describe("which backend the proxy calls", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  beforeEach(() => {
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    mockLogger.error.mockClear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  it("prefers BACKEND_URL, as the sibling routes do", async () => {
    process.env.BACKEND_URL = "https://private.example";
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://public.example";
    const fetchSpy = okBackend();

    await POST(request(CLIENT_BODY));

    expect(fetchSpy.mock.calls[0][0]).toBe(`https://private.example${BACKEND_PATH}`);
  });

  it("answers 503 and never calls itself when no backend is configured, whatever VERCEL_URL says", async () => {
    process.env.VERCEL_URL = "preview-123.vercel.app";
    const fetchSpy = okBackend();

    const response = await POST(request(CLIENT_BODY));

    expect(response.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("defaults to the local backend only in development", async () => {
    Object.assign(process.env, { NODE_ENV: "development" });
    const fetchSpy = okBackend();

    await POST(request(CLIENT_BODY));

    expect(fetchSpy.mock.calls[0][0]).toBe(`http://localhost:8001${BACKEND_PATH}`);
  });
});

describe("the request schema and the Python backend", () => {
  it("requires exactly the fields the backend requires", () => {
    const { required } = backendFields();
    expect(required.length).toBeGreaterThanOrEqual(7);
    expect(Object.keys(RecipeRecommendationRequestSchema.shape).sort()).toEqual([...required].sort());
  });

  it("leaves out the backend's optional fields on purpose", () => {
    const { optional } = backendFields();
    expect(optional).toEqual(expect.arrayContaining(["include_lunar_data", "secondary_chart_ids"]));
    for (const field of optional) {
      expect(Object.keys(RecipeRecommendationRequestSchema.shape)).not.toContain(field);
    }
  });

  it("has the backend's ranges: both edges are accepted, one step outside each is refused", () => {
    const ranges = pythonChartRanges();
    expect(Object.keys(ranges).sort()).toEqual(Object.keys(CLIENT_BODY).sort());
    // January has 31 days, so the edges of `day` and `year` are real dates.
    const valid = { ...CLIENT_BODY, month: 1, day: 1 };
    for (const [field, [low, high]] of Object.entries(ranges)) {
      const step = Number.isInteger(low) ? 1 : 0.0001;
      const base = field === "day" ? { ...valid, day: 1 } : valid;
      for (const inside of [low, high]) {
        expect(RecipeRecommendationRequestSchema.safeParse({ ...base, [field]: inside }).success).toBe(true);
      }
      for (const outside of [low - step, high + step]) {
        expect(RecipeRecommendationRequestSchema.safeParse({ ...base, [field]: outside }).success).toBe(false);
      }
    }
  });
});
