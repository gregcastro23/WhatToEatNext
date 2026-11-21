/**
 * @jest-environment node
 *
 * Tests for `runAfterResponse`: Next.js `after()` registration inside a request
 * scope, fallback execution outside a request scope (when `after()` throws),
 * and error containment for both sync and async tasks.
 */

const registeredTasks: Array<() => Promise<void>> = [];
let shouldThrowOutsideScope = false;
const mockLoggerError = jest.fn();

jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: (task: () => Promise<void>) => {
    if (shouldThrowOutsideScope) {
      throw new Error("after() called outside request scope");
    }
    registeredTasks.push(task);
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: (...args: unknown[]) => mockLoggerError(...args),
    debug: jest.fn(),
  },
}));

import { runAfterResponse } from "../runAfterResponse";

describe("runAfterResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registeredTasks.length = 0;
    shouldThrowOutsideScope = false;
  });

  it("defers async work inside Next.js after() and awaits completion when invoked", async () => {
    let completed = false;
    let release = (): void => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    runAfterResponse("test.async", async () => {
      await gate;
      completed = true;
    });

    expect(registeredTasks).toHaveLength(1);
    expect(completed).toBe(false);

    const [task] = registeredTasks;
    expect(task).toBeDefined();
    const running = task ? task() : Promise.resolve();
    await new Promise((r) => setImmediate(r));
    expect(completed).toBe(false);

    release();
    await running;
    expect(completed).toBe(true);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("supports synchronous void tasks inside after()", async () => {
    let ran = false;
    runAfterResponse("test.sync", () => {
      ran = true;
    });

    expect(registeredTasks).toHaveLength(1);
    expect(ran).toBe(false);

    const [task] = registeredTasks;
    if (task) await task();
    expect(ran).toBe(true);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("executes immediately when after() throws outside a Next.js request scope", async () => {
    shouldThrowOutsideScope = true;

    let ran = false;
    runAfterResponse("test.fallback", async () => {
      ran = true;
    });

    await new Promise((r) => setImmediate(r));
    expect(ran).toBe(true);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("contains async rejections and sync throws in both after() and fallback modes", async () => {
    const asyncErr = new Error("async boom");
    const syncErr = new Error("sync boom");

    runAfterResponse("test.asyncReject", async () => {
      throw asyncErr;
    });
    const [afterCb] = registeredTasks;
    if (afterCb) await afterCb();

    expect(mockLoggerError).toHaveBeenCalledWith(
      "[afterResponse] task test.asyncReject failed:",
      asyncErr,
    );

    shouldThrowOutsideScope = true;
    runAfterResponse("test.syncThrow", () => {
      throw syncErr;
    });
    await new Promise((r) => setImmediate(r));

    expect(mockLoggerError).toHaveBeenCalledWith(
      "[afterResponse] task test.syncThrow failed:",
      syncErr,
    );
  });
});
