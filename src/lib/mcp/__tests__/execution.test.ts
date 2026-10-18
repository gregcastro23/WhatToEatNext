import {
  correlationIdFor,
  getMcpInvocationContext,
  MAX_CONCURRENT_MCP_CALLS,
  MCP_CALL_TIMEOUT_MS,
  runMcpInvocation,
} from "@/lib/mcp/execution";

function deferred<T>() {
  const controls: {
    resolve?: (value: T | PromiseLike<T>) => void;
  } = {};
  const promise = new Promise<T>((resolve) => { controls.resolve = resolve; });
  return {
    promise,
    resolve(value: T) {
      if (!controls.resolve) throw new Error("Deferred promise was not initialized");
      controls.resolve(value);
    },
  };
}

describe("MCP invocation execution", () => {
  afterEach(() => jest.useRealTimers());

  it("runs four actual pending calls and immediately rejects a fifth without queuing it", async () => {
    expect(MAX_CONCURRENT_MCP_CALLS).toBe(4);
    const gates = Array.from({ length: 4 }, () => deferred<number>());
    const contexts: string[] = [];
    const running = gates.map((gate, index) => runMcpInvocation({ correlationId: `call:${index}` }, async () => {
      const invocation = getMcpInvocationContext();
      if (!invocation) throw new Error("Missing invocation context");
      contexts.push(invocation.correlationId);
      return await gate.promise;
    }));
    const fifthWork = jest.fn(async () => 5);

    try {
      expect(contexts).toEqual(["call:0", "call:1", "call:2", "call:3"]);
      expect(await runMcpInvocation({}, fifthWork)).toBeNull();
      expect(fifthWork).not.toHaveBeenCalled();

      gates[0]?.resolve(0);
      expect(await running[0]).toBe(0);
      expect(await runMcpInvocation({}, fifthWork)).toBe(5);
      expect(fifthWork).toHaveBeenCalledTimes(1);
      expect(getMcpInvocationContext()).toBeUndefined();
    } finally {
      gates.forEach((gate, index) => gate.resolve(index));
      await Promise.allSettled(running);
    }
  });

  it("releases the failed call's slot when its work rejects", async () => {
    const gates = Array.from({ length: 3 }, () => deferred<number>());
    const running = gates.map((gate) => runMcpInvocation({}, () => gate.promise));

    try {
      await expect(runMcpInvocation({}, async () => {
        throw new Error("source failed");
      })).rejects.toThrow("source failed");

      expect(await runMcpInvocation({}, async () => "slot released")).toBe("slot released");
    } finally {
      gates.forEach((gate, index) => gate.resolve(index));
      await Promise.allSettled(running);
    }
  });

  it("propagates caller cancellation through the scoped signal with the original reason", async () => {
    const caller = new AbortController();
    const observed: { signal?: AbortSignal; correlationId?: string } = {};
    const pending = runMcpInvocation({ signal: caller.signal, correlationId: "request:123" }, async () => {
      const invocation = getMcpInvocationContext();
      if (!invocation) throw new Error("Missing invocation context");
      observed.signal = invocation.signal;
      observed.correlationId = invocation.correlationId;
      return await new Promise<string>((_resolve, reject) => {
        invocation.signal.addEventListener("abort", () => reject(invocation.signal.reason), { once: true });
      });
    });
    const reason = new Error("caller disconnected");
    const rejected = expect(pending).rejects.toBe(reason);

    expect(observed.signal?.aborted).toBe(false);
    expect(observed.correlationId).toBe("request:123");
    caller.abort(reason);
    await rejected;

    expect(observed.signal?.aborted).toBe(true);
    expect(observed.signal?.reason).toBe(reason);
    expect(getMcpInvocationContext()).toBeUndefined();
    expect(await runMcpInvocation({}, async () => "next call")).toBe("next call");
  });

  it("exposes an already-aborted caller signal before work begins", async () => {
    const caller = new AbortController();
    const reason = new Error("already cancelled");
    caller.abort(reason);

    const result = await runMcpInvocation({ signal: caller.signal }, async () => {
      const invocation = getMcpInvocationContext();
      return { aborted: invocation?.signal.aborted, reason: invocation?.signal.reason };
    });

    expect(result).toEqual({ aborted: true, reason });
  });

  it("aborts at the deadline so cooperative work rejects and releases its slot", async () => {
    jest.useFakeTimers();
    const observed: { signal?: AbortSignal } = {};
    const pending = runMcpInvocation({}, async () => {
      const invocation = getMcpInvocationContext();
      if (!invocation) throw new Error("Missing invocation context");
      observed.signal = invocation.signal;
      return await new Promise<string>((_resolve, reject) => {
        invocation.signal.addEventListener("abort", () => reject(invocation.signal.reason), { once: true });
      });
    });
    const rejected = expect(pending).rejects.toThrow("MCP request deadline exceeded");

    jest.advanceTimersByTime(MCP_CALL_TIMEOUT_MS - 1);
    expect(observed.signal?.aborted).toBe(false);
    jest.advanceTimersByTime(1);
    expect(observed.signal?.aborted).toBe(true);
    await rejected;

    expect(jest.getTimerCount()).toBe(0);
    expect(await runMcpInvocation({}, async () => "deadline slot released")).toBe("deadline slot released");
  });

  it("keeps timed-out but unfinished work in its slot until the promise settles", async () => {
    jest.useFakeTimers();
    const gates = Array.from({ length: 4 }, () => deferred<number>());
    const signals: AbortSignal[] = [];
    const running = gates.map((gate) => runMcpInvocation({}, async () => {
      const invocation = getMcpInvocationContext();
      if (!invocation) throw new Error("Missing invocation context");
      signals.push(invocation.signal);
      return await gate.promise;
    }));

    try {
      jest.advanceTimersByTime(MCP_CALL_TIMEOUT_MS);
      expect(signals).toHaveLength(4);
      expect(signals.every((signal) => signal.aborted)).toBe(true);
      expect(await runMcpInvocation({}, async () => "would exceed active work limit")).toBeNull();

      gates[0]?.resolve(0);
      await running[0];
      expect(await runMcpInvocation({}, async () => "slot available")).toBe("slot available");
    } finally {
      gates.forEach((gate, index) => gate.resolve(index));
      await Promise.allSettled(running);
    }
    expect(jest.getTimerCount()).toBe(0);
  });

  it("preserves bounded safe correlation IDs and replaces unsafe values with UUIDs", () => {
    const valid = "recipe.1:attempt-2_3";
    expect(correlationIdFor(valid)).toBe(valid);
    expect(correlationIdFor("x".repeat(128))).toBe("x".repeat(128));
    for (const invalid of [undefined, null, "", "\nforged-header", "contains spaces", "x".repeat(129), {}, []]) {
      expect(correlationIdFor(invalid)).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    }
  });
});
