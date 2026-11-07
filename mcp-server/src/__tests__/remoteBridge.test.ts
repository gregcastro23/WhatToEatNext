/** @jest-environment node */
/**
 * The stdio-to-hosted bridge, against an in-memory fake of the hosted endpoint handed in as `fetchImpl` (the jest setup
 * replaces the global fetch with a stub that refuses all network, so these tests open no socket at all) and in-memory
 * streams. A real process talking to a real loopback server is covered by the MCP_E2E stdio test.
 */
import { PassThrough } from "node:stream";
import {
  BridgeConfigError,
  DEFAULT_REMOTE_URL,
  MAX_MESSAGE_BYTES,
  parseSse,
  readApiKey,
  resolveBridgeConfig,
  runBridgeProcess,
  runRemoteBridge,
  selectMode,
} from "../remoteBridge";

const KEY = "sk_alchm_live_TEST_KEY_not_a_real_credential_123";
const URL_UNDER_TEST = new URL("https://alchm.kitchen/api/mcp");

interface Seen {
  url: string;
  headers: Record<string, string>;
  body: string;
  redirect: RequestRedirect | undefined;
}

type Handler = (seen: Seen, signal: AbortSignal | null | undefined, index: number) => Response | Promise<Response>;

function fakeServer(handler: Handler): { seen: Seen[]; fetchImpl: typeof fetch } {
  const seen: Seen[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const entry: Seen = {
      url: String(input),
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
      body: typeof init?.body === "string" ? init.body : "",
      redirect: init?.redirect,
    };
    seen.push(entry);
    return handler(entry, init?.signal, seen.length - 1);
  };
  return { seen, fetchImpl };
}

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

/** Never answers; rejects with the abort reason when the bridge gives up, as fetch does. */
const silence = (signal: AbortSignal | null | undefined): Promise<Response> =>
  new Promise((_resolve, reject) => signal?.addEventListener("abort", () => reject(signal.reason ?? new Error("aborted"))));

interface Run {
  lines: unknown[];
  stdout: string;
  stderr: string;
}

interface Extra {
  timeoutMs?: number;
  maxReplyBytes?: number;
  signal?: AbortSignal;
}

/** A bridge on in-memory streams, still observable once it has returned (a write that comes late shows up in stdout() / stderr()). */
function startBridge(fetchImpl: typeof fetch, extra: Extra = {}): { stdin: PassThrough; done: Promise<void>; stdout: () => string; stderr: () => string } {
  const stdin = new PassThrough();
  const out = new PassThrough();
  const err = new PassThrough();
  let stdout = "";
  let stderr = "";
  out.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
  err.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
  const done = runRemoteBridge({ url: URL_UNDER_TEST, apiKey: KEY, input: stdin, output: out, errors: err, userAgent: "alchm-mcp-bridge/test", fetchImpl, ...extra });
  return { stdin, done, stdout: () => stdout, stderr: () => stderr };
}

const jsonLines = (text: string): unknown[] => text.split("\n").filter(Boolean).map((line): unknown => JSON.parse(line));

async function bridge(fetchImpl: typeof fetch, input: string[], extra: Extra = {}): Promise<Run> {
  const running = startBridge(fetchImpl, extra);
  for (const line of input) running.stdin.write(`${line}\n`);
  running.stdin.end();
  await running.done;
  const stdout = running.stdout();
  const stderr = running.stderr();
  expect(`${stdout}${stderr}`).not.toContain(KEY);
  return { lines: jsonLines(stdout), stdout, stderr };
}

const request = (id: number, method = "tools/list", params: unknown = {}): string => JSON.stringify({ jsonrpc: "2.0", id, method, params });
const reply = (id: number, result: unknown = {}): unknown => ({ jsonrpc: "2.0", id, result });
const idOf = (seen: Seen): unknown => JSON.parse(seen.body).id;
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

describe("choosing the mode", () => {
  it.each([
    [{}, "in-process"],
    [{ MCP_USER_API_KEY: KEY }, "bridge"],
    [{ ALCHM_MCP_USER_API_KEY: KEY }, "bridge"],
    [{ MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://operator" }, "in-process"],
    [{ DATABASE_URL: "postgres://operator" }, "in-process"],
    [{ MCP_USER_API_KEY: "", ALCHM_MCP_USER_API_KEY: "", DATABASE_URL: "" }, "in-process"],
    [{ MCP_USER_API_KEY: "   " }, "bridge"],
    [{ ALCHM_MCP_REMOTE_URL: "https://example.com/mcp" }, "in-process"],
  ])("%j -> %s", (env, mode) => {
    expect(selectMode(env)).toBe(mode);
  });

  it("reads the same variables in the same order as the in-process server", () => {
    expect(readApiKey({ MCP_USER_API_KEY: "a", ALCHM_MCP_USER_API_KEY: "b" })).toBe("a");
    expect(readApiKey({ ALCHM_MCP_USER_API_KEY: "b" })).toBe("b");
    expect(readApiKey({})).toBeNull();
  });
});

describe("resolving the configuration", () => {
  it("defaults to the hosted endpoint and trims the key", () => {
    const config = resolveBridgeConfig({ MCP_USER_API_KEY: `  ${KEY}\n` });
    expect(config.url.href).toBe(DEFAULT_REMOTE_URL);
    expect(config.apiKey).toBe(KEY);
  });

  it("reads a blank ALCHM_MCP_REMOTE_URL (a client config that lists the variable with no value) as unset", () => {
    expect(resolveBridgeConfig({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "" }).url.href).toBe(DEFAULT_REMOTE_URL);
    expect(resolveBridgeConfig({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "  \n" }).url.href).toBe(DEFAULT_REMOTE_URL);
  });

  it.each(["https://staging.example.com/api/mcp", "http://localhost:3000/api/mcp", "http://127.0.0.1:8080/x", "http://[::1]:3000/api/mcp"])("accepts %s", (url) => {
    expect(resolveBridgeConfig({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: url }).url.href).toBe(new URL(url).href);
  });

  it.each([
    ["http://alchm.kitchen/api/mcp", /https/],
    ["ftp://alchm.kitchen/api/mcp", /https/],
    ["https://user:pw@alchm.kitchen/api/mcp", /credentials/],
    ["not a url", /not a URL/],
  ])("refuses %s", (url, why) => {
    expect(() => resolveBridgeConfig({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: url })).toThrow(BridgeConfigError);
    expect(() => resolveBridgeConfig({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: url })).toThrow(why);
  });

  it.each(['"sk_alchm_quoted"', "two words", " ", "sk_alchm_ünïcode"])("refuses the key %j, and never repeats it", (key) => {
    let message = "";
    try {
      resolveBridgeConfig({ MCP_USER_API_KEY: key });
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toMatch(/cannot have/);
    expect(message).not.toContain(key.trim() || "\u0000");
  });
});

describe("forwarding", () => {
  it("sends a request as it is, with the key as a bearer token, and writes the one-line answer", async () => {
    const server = fakeServer(() => jsonResponse(reply(7, { tools: [] })));
    const run = await bridge(server.fetchImpl, [request(7)]);
    expect(run.lines).toEqual([reply(7, { tools: [] })]);
    const [seen] = server.seen;
    expect(seen?.url).toBe(DEFAULT_REMOTE_URL);
    expect(seen?.body).toBe(request(7));
    expect(seen?.headers.authorization).toBe(`Bearer ${KEY}`);
    expect(seen?.headers.accept).toBe("application/json, text/event-stream");
    expect(seen?.headers["content-type"]).toBe("application/json");
    expect(seen?.headers["user-agent"]).toBe("alchm-mcp-bridge/test");
    expect(seen?.redirect).toBe("error"); // the key must never follow a redirect
  });

  it("sends a notification and writes nothing for the 202", async () => {
    const server = fakeServer(() => new Response(null, { status: 202 }));
    const run = await bridge(server.fetchImpl, [JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })]);
    expect(run.stdout).toBe("");
    expect(server.seen).toHaveLength(1);
  });

  it("forwards a batch whole and writes the array answer as one line", async () => {
    const batch = JSON.stringify([JSON.parse(request(1)), JSON.parse(request(2))]);
    const server = fakeServer(() => jsonResponse([reply(1), reply(2)]));
    const run = await bridge(server.fetchImpl, [batch]);
    expect(server.seen[0]?.body).toBe(batch);
    expect(run.lines).toEqual([[reply(1), reply(2)]]);
  });

  it("passes the server's own answer through, including an invalid-key tool result", async () => {
    const invalid = { jsonrpc: "2.0", id: 3, result: { isError: true, content: [{ type: "text", text: "API key authentication failed or is unavailable" }] } };
    const run = await bridge(fakeServer(() => jsonResponse(invalid)).fetchImpl, [request(3, "tools/call", { name: "get_user_allowance" })]);
    expect(run.lines).toEqual([invalid]);
  });

  it("reads a text/event-stream answer, one message per event", async () => {
    const notice = { jsonrpc: "2.0", method: "notifications/message", params: {} };
    const server = fakeServer(() => new Response(
      `event: message\ndata: ${JSON.stringify(reply(4))}\n\n: comment\n\ndata: ${JSON.stringify(notice)}\n\n`,
      { headers: { "content-type": "text/event-stream" } },
    ));
    expect((await bridge(server.fetchImpl, [request(4)])).lines).toEqual([reply(4), notice]);
  });

  it("parses event data spread over several data: lines, and skips events that are not JSON", () => {
    expect(parseSse('data: {"a":\ndata: 1}\n\ndata: not json\n\n')).toEqual([{ a: 1 }]);
  });

  it("answers several requests in flight at once, whatever order the server finishes in", async () => {
    const server = fakeServer(async (seen) => {
      const id = idOf(seen);
      await wait(id === 1 ? 120 : id === 2 ? 60 : 0);
      return jsonResponse(reply(Number(id)));
    });
    const run = await bridge(server.fetchImpl, [request(1), request(2), request(3)]);
    expect(run.lines).toEqual([reply(3), reply(2), reply(1)]);
  });

  it("handles a message that arrives in pieces, CRLF line ends and blank lines", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const stdin = new PassThrough();
    const out = new PassThrough();
    let stdout = "";
    out.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
    const done = runRemoteBridge({ url: URL_UNDER_TEST, apiKey: KEY, input: stdin, output: out, errors: new PassThrough(), userAgent: "t", fetchImpl: server.fetchImpl });
    const text = request(5);
    stdin.write(text.slice(0, 10));
    await wait(20);
    stdin.write(`${text.slice(10)}\r\n\r\n${request(6)}`);
    stdin.end();
    await done;
    expect(stdout.split("\n").filter(Boolean).map((line): unknown => JSON.parse(line))).toEqual([reply(5), reply(6)]);
  });

  it("carries the session id and the negotiated protocol version on later requests", async () => {
    const server = fakeServer((seen, _signal, index) =>
      index === 0
        ? jsonResponse(reply(1, { protocolVersion: "2025-03-26" }), 200, { "mcp-session-id": "sess-1" })
        : jsonResponse(reply(Number(idOf(seen)))));
    const stdin = new PassThrough();
    const out = new PassThrough();
    out.resume();
    const done = runRemoteBridge({ url: URL_UNDER_TEST, apiKey: KEY, input: stdin, output: out, errors: new PassThrough(), userAgent: "t", fetchImpl: server.fetchImpl });
    stdin.write(`${request(1, "initialize")}\n`);
    await wait(50);
    stdin.write(`${request(2)}\n`);
    stdin.end();
    await done;
    expect(server.seen[0]?.headers["mcp-session-id"]).toBeUndefined();
    expect(server.seen[1]?.headers["mcp-session-id"]).toBe("sess-1");
    expect(server.seen[1]?.headers["mcp-protocol-version"]).toBe("2025-03-26");
  });

  it("does not wait for input to end before answering", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const stdin = new PassThrough();
    const out = new PassThrough();
    const first = new Promise<string>((got) => out.once("data", (chunk: Buffer) => got(chunk.toString("utf8"))));
    const done = runRemoteBridge({ url: URL_UNDER_TEST, apiKey: KEY, input: stdin, output: out, errors: new PassThrough(), userAgent: "t", fetchImpl: server.fetchImpl });
    stdin.write(`${request(20)}\n`);
    expect(JSON.parse(await first)).toEqual(reply(20));
    stdin.end();
    await done;
  });
});

describe("failures", () => {
  it("re-addresses a JSON-RPC error body that could not know the request id", async () => {
    const body = { jsonrpc: "2.0", id: null, error: { code: -32603, message: "Internal server error handling MCP request" } };
    const run = await bridge(fakeServer(() => jsonResponse(body, 500)).fetchImpl, [request(8)]);
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 8, error: { code: -32603, message: "Internal server error handling MCP request" } }]);
  });

  it("describes a non-JSON error status, with Retry-After", async () => {
    const server = fakeServer(() => new Response("<html>down</html>", { status: 503, headers: { "retry-after": "30", "content-type": "text/html" } }));
    const run = await bridge(server.fetchImpl, [request(9)]);
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 9, error: { code: -32603, message: expect.stringMatching(/HTTP 503.*retry after 30/) } }]);
  });

  it("refuses a reply bigger than its limit, by declared length and by what actually arrives", async () => {
    const declared = fakeServer(() => new Response("{}", { headers: { "content-length": "5000", "content-type": "application/json" } }));
    expect((await bridge(declared.fetchImpl, [request(21)], { maxReplyBytes: 100 })).lines).toEqual([
      { jsonrpc: "2.0", id: 21, error: { code: -32603, message: expect.stringMatching(/larger than 100 bytes/) } },
    ]);
    const streamed = fakeServer(() => new Response(JSON.stringify({ jsonrpc: "2.0", id: 22, result: { pad: "x".repeat(500) } }), { headers: { "content-type": "application/json" } }));
    expect((await bridge(streamed.fetchImpl, [request(22)], { maxReplyBytes: 100 })).lines).toEqual([
      { jsonrpc: "2.0", id: 22, error: { code: -32603, message: expect.stringMatching(/larger than 100 bytes/) } },
    ]);
  });

  it("reads a multi-byte character split across two chunks of the reply", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify(reply(23, { text: "crème brûlée ☉" })));
    const server = fakeServer(() => new Response(new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(bytes.slice(0, 40)); controller.enqueue(bytes.slice(40)); controller.close(); },
    }), { headers: { "content-type": "application/json" } }));
    expect((await bridge(server.fetchImpl, [request(23)])).lines).toEqual([reply(23, { text: "crème brûlée ☉" })]);
  });

  it("answers a request that got a 200 with no message", async () => {
    const run = await bridge(fakeServer(() => new Response(null, { status: 200 })).fetchImpl, [request(10)]);
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 10, error: { code: -32603, message: expect.stringMatching(/no JSON-RPC message/) } }]);
  });

  describe("a 200 from something that is not an MCP server (a wrong ALCHM_MCP_REMOTE_URL)", () => {
    it.each([
      ["JSON that is not JSON-RPC", jsonResponse({ hello: "world" })],
      ["a bare JSON string", jsonResponse("hello")],
      ["a batch with something else in it", jsonResponse([reply(41), 7])],
      ["an empty batch", jsonResponse([])],
    ])("does not pass on %s: the request gets an error, stdout stays JSON-RPC, and stderr says what happened", async (_what, response) => {
      const run = await bridge(fakeServer(() => response.clone()).fetchImpl, [request(41)]);
      expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 41, error: { code: -32603, message: expect.stringMatching(/no JSON-RPC message/) } }]);
      expect(run.stderr).toContain("that are not JSON-RPC 2.0");
    });

    it("keeps the JSON-RPC messages of an event stream that also holds something else", async () => {
      const body = `data: ${JSON.stringify({ not: "rpc" })}\n\ndata: ${JSON.stringify(reply(42))}\n\n`;
      const run = await bridge(fakeServer(() => new Response(body, { headers: { "content-type": "text/event-stream" } })).fetchImpl, [request(42)]);
      expect(run.lines).toEqual([reply(42)]);
      expect(run.stderr).toContain("ignored 1 message(s)");
    });
  });

  it("answers every request id when the server cannot be reached, and logs without the key", async () => {
    const refused = fakeServer(() => Promise.reject(new TypeError("fetch failed", { cause: new Error("connect ECONNREFUSED 127.0.0.1:1") })));
    const run = await bridge(refused.fetchImpl, [request(11), request(12)]);
    expect(run.lines).toEqual([
      { jsonrpc: "2.0", id: 11, error: { code: -32603, message: "Could not reach https://alchm.kitchen/api/mcp: fetch failed: connect ECONNREFUSED 127.0.0.1:1" } },
      { jsonrpc: "2.0", id: 12, error: { code: -32603, message: "Could not reach https://alchm.kitchen/api/mcp: fetch failed: connect ECONNREFUSED 127.0.0.1:1" } },
    ]);
    expect(run.stderr).toContain("request to https://alchm.kitchen/api/mcp failed");
  });

  it("gives up on a server that never answers", async () => {
    const run = await bridge(fakeServer((_seen, signal) => silence(signal)).fetchImpl, [request(13)], { timeoutMs: 80 });
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 13, error: { code: -32603, message: expect.stringMatching(/no answer within 0\.08 s/) } }]);
  });

  it("refuses an oversized message itself, without contacting the server", async () => {
    const server = fakeServer(() => jsonResponse({}));
    const big = JSON.stringify({ jsonrpc: "2.0", id: 14, method: "tools/call", params: { pad: "x".repeat(MAX_MESSAGE_BYTES) } });
    const run = await bridge(server.fetchImpl, [big]);
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 14, error: { code: -32600, message: expect.stringMatching(/Payload Too Large/) } }]);
    expect(server.seen).toHaveLength(0);
  });

  it("answers a line that is not JSON with a parse error and carries on", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const run = await bridge(server.fetchImpl, ["{nope", request(15)]);
    expect(run.lines).toEqual(expect.arrayContaining([{ jsonrpc: "2.0", id: null, error: { code: -32700, message: expect.stringMatching(/Parse error/) } }, reply(15)]));
    expect(server.seen).toHaveLength(1);
  });

  // A notification has no id, so nobody is waiting for an answer: a client that gets `id: null` back treats it as a protocol error.
  const notification = JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" });

  it("does not answer a notification the server refused (it has no id), only logs it", async () => {
    const run = await bridge(fakeServer(() => jsonResponse({}, 500)).fetchImpl, [notification]);
    expect(run.stdout).toBe("");
    expect(run.stderr).toMatch(/HTTP 500/);
  });

  const unreachable = (): ReturnType<typeof fakeServer> =>
    fakeServer(() => Promise.reject(new TypeError("fetch failed", { cause: new Error("connect ECONNREFUSED 127.0.0.1:1") })));

  it.each([
    ["a notification", notification],
    ["a response of the client's own (an id and no method: not a request)", JSON.stringify({ jsonrpc: "2.0", id: 5, result: {} })],
  ])("does not answer %s it could not deliver, only logs it", async (_what, message) => {
    const run = await bridge(unreachable().fetchImpl, [message]);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("request to https://alchm.kitchen/api/mcp failed: fetch failed: connect ECONNREFUSED 127.0.0.1:1");
  });

  it("answers each request of a batch it could not deliver, string ids included, and none of its notifications", async () => {
    const batch = JSON.stringify([JSON.parse(request(1)), { jsonrpc: "2.0", id: "call-2", method: "ping" }, JSON.parse(notification)]);
    const run = await bridge(unreachable().fetchImpl, [batch]);
    expect(run.lines).toEqual([
      { jsonrpc: "2.0", id: 1, error: { code: -32603, message: expect.stringMatching(/Could not reach/) } },
      { jsonrpc: "2.0", id: "call-2", error: { code: -32603, message: expect.stringMatching(/Could not reach/) } },
    ]);
  });

  it("does not answer an oversized notification, never sends it, and says on stderr that it was dropped", async () => {
    const server = fakeServer(() => jsonResponse({}));
    const big = JSON.stringify({ jsonrpc: "2.0", method: "notifications/message", params: { pad: "x".repeat(MAX_MESSAGE_BYTES) } });
    const run = await bridge(server.fetchImpl, [big]);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("dropped a message over 256 KB");
    expect(server.seen).toHaveLength(0);
  });

  it("answers a line past what it will hold once, throws away the rest of that line, and carries on", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const running = startBridge(server.fetchImpl);
    running.stdin.write("x".repeat(4 * MAX_MESSAGE_BYTES + 1)); // no newline yet, and more than it holds
    await wait(20);
    running.stdin.write("y".repeat(1000)); // more of the same line: no second error for it
    await wait(20);
    running.stdin.write(`z\n${request(31)}\n`); // its end, then a real request
    await wait(20);
    running.stdin.write(`${request(32)}\n`); // and another one in a later chunk: nothing is skipped any more
    running.stdin.end();
    await running.done;
    expect(jsonLines(running.stdout())).toEqual([
      { jsonrpc: "2.0", id: null, error: { code: -32600, message: expect.stringMatching(/Message too long/) } },
      reply(31),
      reply(32),
    ]);
    expect(server.seen).toHaveLength(2);
  });

  it("ends, after answering what it was asked, when its input fails", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${request(40)}\n`);
    await wait(20);
    running.stdin.destroy(new Error("EIO"));
    await running.done;
    expect(jsonLines(running.stdout())).toEqual([reply(40)]);
  });
});

describe("being told to stop", () => {
  it("cancels what is in flight, and writes nothing more, not even a failure for it", async () => {
    let sent: AbortSignal | null | undefined;
    const server = fakeServer((_seen, signal) => {
      sent = signal;
      return silence(signal);
    });
    const stop = new AbortController();
    const running = startBridge(server.fetchImpl, { signal: stop.signal });
    running.stdin.write(`${request(17)}\n`);
    await wait(50);
    expect(sent?.aborted).toBe(false);
    stop.abort();
    await running.done;
    await wait(50); // the cancelled request settles after the bridge has returned
    expect(sent?.aborted).toBe(true);
    expect(running.stdout()).toBe("");
    expect(running.stderr()).toBe("");
  });

  it("writes nothing for an answer that was already on its way", async () => {
    let answer: (response: Response) => void = () => undefined;
    const server = fakeServer(() => new Promise<Response>((resolve) => { answer = resolve; })); // looks at no signal
    const stop = new AbortController();
    const running = startBridge(server.fetchImpl, { signal: stop.signal });
    running.stdin.write(`${request(18)}\n`);
    await wait(50);
    stop.abort();
    await running.done;
    answer(jsonResponse(reply(18)));
    await wait(50);
    expect(server.seen).toHaveLength(1);
    expect(running.stdout()).toBe("");
    expect(running.stderr()).toBe("");
  });

  it("sends nothing that arrives afterwards (the key goes nowhere)", async () => {
    const server = fakeServer(() => jsonResponse(reply(19)));
    const stop = new AbortController();
    const running = startBridge(server.fetchImpl, { signal: stop.signal });
    stop.abort();
    await running.done;
    running.stdin.write(`${request(19)}\n`);
    await wait(50);
    expect(server.seen).toHaveLength(0);
    expect(running.stdout()).toBe("");
  });

  it("returns at once, reading and sending nothing, when it is already stopped", async () => {
    const server = fakeServer(() => jsonResponse(reply(24)));
    const stop = new AbortController();
    stop.abort();
    const running = startBridge(server.fetchImpl, { signal: stop.signal });
    running.stdin.write(`${request(24)}\n`);
    expect(await Promise.race([running.done.then(() => "returned"), wait(200).then(() => "still waiting for input")])).toBe("returned");
    await wait(30);
    expect(server.seen).toHaveLength(0);
    expect(running.stdout()).toBe("");
  });
});

describe("the process wrapper", () => {
  async function runProcess(env: Record<string, string>): Promise<{ code: number; stdout: string; stderr: string }> {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    let out = "";
    let err = "";
    stdout.on("data", (chunk: Buffer) => { out += chunk.toString("utf8"); });
    stderr.on("data", (chunk: Buffer) => { err += chunk.toString("utf8"); });
    stdin.end();
    const code = await runBridgeProcess({ env, stdin, stdout, stderr }, "alchm-mcp-bridge/test");
    return { code, stdout: out, stderr: err };
  }

  it("says on stderr which mode it is in, without the key, and ends with 0 when stdin closes", async () => {
    const run = await runProcess({ MCP_USER_API_KEY: KEY });
    expect(run.code).toBe(0);
    expect(run.stderr).toContain("remote bridge to https://alchm.kitchen/api/mcp");
    expect(run.stderr).not.toContain(KEY);
    expect(run.stdout).toBe("");
  });

  it("names the configured endpoint, with its path and without any query string", async () => {
    const run = await runProcess({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "https://staging.example.com/api/mcp?token=hunter2" });
    expect(run.stderr).toContain("remote bridge to https://staging.example.com/api/mcp ");
    expect(run.stderr).not.toContain("hunter2");
  });

  it.each([
    [{ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "http://example.com/api/mcp" }, /must be https/],
    [{ MCP_USER_API_KEY: '"quoted"' }, /cannot have/],
  ])("refuses %j with exit code 1, the reason on stderr and nothing on stdout", async (env, why) => {
    const run = await runProcess(env);
    expect(run.code).toBe(1);
    expect(run.stderr).toMatch(why);
    expect(run.stdout).toBe("");
  });
});
