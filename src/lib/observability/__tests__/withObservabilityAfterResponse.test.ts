/**
 * @jest-environment node
 *
 * The request recording must be registered with `after()`, and must last
 * until its database insert settles.
 *
 * `withObservability` used to start the recording with a bare `void`. On
 * Vercel, work nothing waits for is suspended with the instance once the
 * response is sent. [MEASURED 2026-09-25, production] every one of 48
 * "Query read timeout" errors in a 77-minute window was this path (the user
 * lookup, and the `request_log_entries` insert), with a median executionTime
 * of 67 s against a 6 s query timeout, each holding a pool connection while
 * suspended.
 */
import { NextRequest } from "next/server";

const mockAfterTasks: Array<() => Promise<void>> = [];
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: (task: () => Promise<void>) => {
    mockAfterTasks.push(task);
  },
}));

let mockReleaseInsert: () => void = () => undefined;
const mockExecuteQuery = jest.fn(
  () =>
    new Promise<void>((resolve) => {
      mockReleaseInsert = resolve;
    }),
);
jest.mock("@/lib/database/connection", () => ({ executeQuery: mockExecuteQuery }));

// eslint-disable-next-line import/order -- must load after the mocks above
import { withObservability } from "@/lib/observability/withObservability";

describe("withObservability after-response recording", () => {
  const savedUrl = process.env.DATABASE_URL;
  beforeEach(() => {
    mockAfterTasks.length = 0;
    mockExecuteQuery.mockClear();
    // The durable mirror only runs with a database configured.
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/test";
  });
  afterAll(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  });

  it("registers the recording with after() instead of leaving it floating", async () => {
    const handler = withObservability({ routeName: "/api/test", skipUserResolution: true }, async () =>
      new Response("ok"),
    );
    await handler(new NextRequest("https://alchm.kitchen/api/test"));

    expect(mockAfterTasks).toHaveLength(1);
    // Nothing touched the database on the request path.
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("keeps the after() task alive until the request_log_entries insert settles", async () => {
    const handler = withObservability({ routeName: "/api/test", skipUserResolution: true }, async () =>
      new Response("ok"),
    );
    await handler(new NextRequest("https://alchm.kitchen/api/test"));

    let settled = false;
    const task = mockAfterTasks[0]!().then(() => {
      settled = true;
    });
    // Let the dynamic import and the insert dispatch.
    for (let i = 0; i < 10 && mockExecuteQuery.mock.calls.length === 0; i++) {
      await new Promise((r) => setImmediate(r));
    }
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO request_log_entries"),
      expect.any(Array),
    );
    await new Promise((r) => setImmediate(r));
    expect(settled).toBe(false);

    mockReleaseInsert();
    await task;
    expect(settled).toBe(true);
  });
});
