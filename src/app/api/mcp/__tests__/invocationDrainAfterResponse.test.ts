/**
 * @file src/app/api/mcp/__tests__/invocationDrainAfterResponse.test.ts
 *
 * Regression: POST /api/mcp must hand pending `mcp_invocations` INSERTs to the
 * Next.js `after()` lifecycle. Returning the JSON-RPC response without doing so
 * left the INSERT frozen mid-socket between Vercel invocations (86s timeouts).
 */

jest.mock("@/lib/hooks/runAfterResponse", () => ({ runAfterResponse: jest.fn() }));
jest.mock("@/lib/mcp/invocationLog", () => ({
  drainMcpInvocations: jest.fn(async () => undefined),
  recordInvocation: jest.fn(async () => undefined),
}));

import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import { drainMcpInvocations } from "@/lib/mcp/invocationLog";
import { POST } from "../route";

const mockAfter = jest.mocked(runAfterResponse);
const mockDrain = jest.mocked(drainMcpInvocations);

function rpcRequest(body: string): Request {
  return new Request("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body,
  });
}

async function runScheduledTasks(): Promise<void> {
  for (const [, task] of mockAfter.mock.calls) {
    await task();
  }
}

describe("POST /api/mcp invocation drain", () => {
  beforeEach(() => {
    mockAfter.mockClear();
    mockDrain.mockClear();
  });

  it("schedules drainMcpInvocations after a JSON-RPC response", async () => {
    const res = await POST(
      rpcRequest(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })),
    );
    expect(res.status).toBe(200);
    expect(mockAfter).toHaveBeenCalledWith("mcp.drainInvocations", expect.any(Function));
    expect(mockDrain).not.toHaveBeenCalled();

    await runScheduledTasks();
    expect(mockDrain).toHaveBeenCalledWith(4_000);
  });

  it("does not schedule a drain for oversized payloads that never reach the server", async () => {
    const res = await POST(rpcRequest("x".repeat(256 * 1024 + 1)));
    expect(res.status).toBe(413);
    expect(mockAfter).not.toHaveBeenCalled();
  });
});
