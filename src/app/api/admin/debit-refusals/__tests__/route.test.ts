/**
 * @jest-environment node
 *
 * GET /api/admin/debit-refusals: admin-gated, window parsed and clamped, body validated by the
 * client schema the dashboard card will use.
 *
 * @file src/app/api/admin/debit-refusals/__tests__/route.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";

const mockValidateAdmin = jest.fn<(req: NextRequest) => Promise<{ error: NextResponse } | { user: object }>>();
const mockMemoize = jest.fn(<T,>(_key: string, _ttl: number, fn: () => Promise<T>) => fn());
const mockReport = jest.fn<(hours: number) => Promise<unknown>>();

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: (req: NextRequest) => mockValidateAdmin(req),
}));
jest.mock("@/lib/cache/memoryCache", () => ({
  memoize: (key: string, ttl: number, fn: () => Promise<unknown>) => mockMemoize(key, ttl, fn),
}));
jest.mock("@/services/debitRefusalService", () => {
  const actual = jest.requireActual<typeof import("@/services/debitRefusalService")>("@/services/debitRefusalService");
  return { ...actual, getDebitRefusalReport: (hours: number) => mockReport(hours) };
});

import { GET } from "../route";
import { DebitRefusalResponseSchema } from "@/lib/admin/schemas/debitRefusals";
import { buildReport } from "@/services/debitRefusalService";

const get = (query = "") => GET(new NextRequest(`http://localhost:3000/api/admin/debit-refusals${query}`));

beforeEach(() => {
  mockValidateAdmin.mockReset();
  mockValidateAdmin.mockResolvedValue({ user: {} });
  mockMemoize.mockClear();
  mockReport.mockReset();
  mockReport.mockImplementation(async (hours) =>
    buildReport(
      [{ hour: "2026-11-23T12:00:00.000Z", reason: "insufficient_value", refusals: 3, empty_basket: 1, shortfall_value_sum: 6, shortfall_value_n: 3 }],
      "2026-11-23T12:00:00.000Z",
      hours,
      Date.UTC(2026, 10, 23, 13, 0, 0),
    ),
  );
});

describe("GET /api/admin/debit-refusals", () => {
  it("answers the admin gate's own response and reads nothing when the caller is not an admin", async () => {
    mockValidateAdmin.mockResolvedValue({ error: NextResponse.json({ error: "forbidden" }, { status: 403 }) });

    const res = await get();

    expect(res.status).toBe(403);
    expect(mockReport).not.toHaveBeenCalled();
  });

  it("returns a body the client schema accepts, with success: true", async () => {
    const res = await get();
    const body: unknown = await res.json();

    expect(res.status).toBe(200);
    const parsed = DebitRefusalResponseSchema.parse(body);
    expect(parsed).toMatchObject({ success: true, live: true, total: 3, windowHours: 168 });
  });

  it("serves an unreadable table as 200 with live: false, which the schema also accepts", async () => {
    mockReport.mockResolvedValue({ ...buildReport([], null, 168, 0), live: false, note: "economy_debit_refusals could not be read (see the server log)" });

    const body: unknown = await (await get()).json();

    expect(DebitRefusalResponseSchema.parse(body)).toMatchObject({ live: false, total: 0 });
  });

  it.each([
    ["", 168],
    ["?hours=", 168],
    ["?hours=abc", 168],
    ["?hours=24", 24],
    ["?hours=0", 1],
    ["?hours=99999", 720],
    ["?hours=36.9", 36],
  ])("reads %j as a %i-hour window", async (query, hours) => {
    await get(query);

    expect(mockReport).toHaveBeenCalledWith(hours);
    expect(mockMemoize).toHaveBeenCalledWith(`admin:debit-refusals:${hours}`, 30_000, expect.any(Function));
  });
});
