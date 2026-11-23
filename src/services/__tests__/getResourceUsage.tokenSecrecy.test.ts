/**
 * @jest-environment node
 *
 * End to end through the REAL reader: a Railway failure that echoes the API
 * token must reach neither the dashboard payload nor a log line, and the
 * payload must say "token set, call failed" rather than "token unset". Only
 * `fetch` is stubbed. The token is a FAKE value.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
  checkDatabaseHealth: jest.fn(),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { loggedText } from "@/__tests__/helpers/loggedText";
import { _logger } from "@/lib/logger";
import { getResourceUsage } from "@/services/dashboardPanelsService";

const TOKEN = "rwy-FAKE-TOKEN-0123456789";
const realFetch = global.fetch;

describe("getResourceUsage never carries the Railway token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAILWAY_API_TOKEN = TOKEN;
  });
  afterEach(() => {
    delete process.env.RAILWAY_API_TOKEN;
    global.fetch = realFetch;
  });

  it("payload + logs are token-free when Railway echoes the token, and the state is `call-failed`", async () => {
    const fetchMock = installFetchMock(
      jest.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ errors: [{ message: `Not Authorized (token ${TOKEN})` }] }),
      })),
    );

    const payload = await getResourceUsage();

    expect(payload).toMatchObject({ live: false, status: "call-failed", items: [] });
    expect(payload.failure).toBe("Not Authorized (token [redacted]) on usage");
    expect(JSON.stringify(payload)).not.toContain(TOKEN);
    expect(loggedText(jest.mocked(_logger.error).mock.calls)).not.toContain(TOKEN);
    // Witness: the token was really sent, so its absence above means something.
    expect(JSON.stringify(fetchMock.mock.calls)).toContain(`Bearer ${TOKEN}`);
  });

  it("control: with the token unset the payload says `token-unset`, makes no request and logs nothing", async () => {
    delete process.env.RAILWAY_API_TOKEN;
    const fetchMock = installFetchMock(jest.fn());

    const payload = await getResourceUsage();

    expect(payload).toMatchObject({ live: false, status: "token-unset", failure: null, items: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(_logger.error).not.toHaveBeenCalled();
  });
});
