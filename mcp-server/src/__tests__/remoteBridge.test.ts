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
  DEFAULT_TIMEOUT_MS,
  FINISH_GRACE_MS,
  inProcessNote,
  MAX_IN_FLIGHT,
  MAX_MESSAGE_BYTES,
  MAX_REPLY_BYTES,
  modeSetting,
  parseSse,
  proxyWarning,
  readApiKey,
  resolveBridgeConfig,
  runBridgeMain,
  runBridgeProcess,
  runRemoteBridge,
  selectMode,
} from "../remoteBridge";

const KEY = "sk_alchm_live_TEST_KEY_not_a_real_credential_123";
const URL_UNDER_TEST = new URL("https://alchm.kitchen/api/mcp");

interface Seen {
  url: string;
  method: string | undefined;
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
      method: init?.method,
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

/** A reply that arrives in pieces, as a real body does. With `stall` it then waits, and fails with the abort reason when the request is abandoned, as a real fetch body does. */
function streamed(chunks: Uint8Array[], options: { signal?: AbortSignal | null | undefined; stall?: boolean; onCancel?: () => void } = {}): Response {
  const { signal, stall = false, onCancel } = options;
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        if (!stall) controller.close();
        else signal?.addEventListener("abort", () => controller.error(signal.reason ?? new Error("aborted")));
      },
      cancel() {
        onCancel?.();
      },
    }),
    { headers: { "content-type": "application/json" } },
  );
}

interface Run {
  lines: unknown[];
  stdout: string;
  stderr: string;
}

interface Extra {
  url?: URL;
  timeoutMs?: number;
  maxReplyBytes?: number;
  signal?: AbortSignal;
}

/** A bridge on in-memory streams, still observable once it has returned (a write that comes late shows up in stdout() / stderr()). */
function startBridge(fetchImpl: typeof fetch, extra: Extra = {}): { stdin: PassThrough; out: PassThrough; err: PassThrough; done: Promise<void>; stdout: () => string; stderr: () => string } {
  const stdin = new PassThrough();
  const out = new PassThrough();
  const err = new PassThrough();
  let stdout = "";
  let stderr = "";
  out.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
  err.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
  const done = runRemoteBridge({ url: URL_UNDER_TEST, apiKey: KEY, input: stdin, output: out, errors: err, userAgent: "alchm-mcp-bridge/test", fetchImpl, ...extra });
  return { stdin, out, err, done, stdout: () => stdout, stderr: () => stderr };
}

const jsonLines = (text: string): unknown[] => text.split("\n").filter(Boolean).map((line): unknown => JSON.parse(line));
const answeredIds = (text: string): number[] =>
  jsonLines(text).flatMap((line) => (typeof line === "object" && line !== null && "id" in line && typeof line.id === "number" ? [line.id] : []));

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
    [{ MCP_USER_API_KEY: KEY, DATABASE_URL: "" }, "bridge"], // the way to opt back in when a shell exports an unrelated DATABASE_URL: set it to an empty string in the client's env block
    [{ DATABASE_URL: "postgres://operator" }, "in-process"],
    [{ MCP_USER_API_KEY: "", ALCHM_MCP_USER_API_KEY: "", DATABASE_URL: "" }, "in-process"],
    [{ MCP_USER_API_KEY: "   " }, "bridge"],
    [{ ALCHM_MCP_REMOTE_URL: "https://example.com/mcp" }, "in-process"],
    // ALCHM_MCP_MODE=remote: the hosted service whatever DATABASE_URL says (a shell often exports an unrelated one)
    [{ ALCHM_MCP_MODE: "remote", MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://unrelated" }, "bridge"],
    [{ ALCHM_MCP_MODE: "  REMOTE ", MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://unrelated" }, "bridge"],
    [{ ALCHM_MCP_MODE: "remote" }, "bridge"], // chosen, then refused at startup for want of a key
    // ALCHM_MCP_MODE=local: in-process whatever the key and DATABASE_URL say
    [{ ALCHM_MCP_MODE: "local", MCP_USER_API_KEY: KEY }, "in-process"],
    [{ ALCHM_MCP_MODE: "Local", MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://operator" }, "in-process"],
    // auto, empty and blank are the default rule
    [{ ALCHM_MCP_MODE: "auto", MCP_USER_API_KEY: KEY }, "bridge"],
    [{ ALCHM_MCP_MODE: "AUTO", MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://operator" }, "in-process"],
    [{ ALCHM_MCP_MODE: "", MCP_USER_API_KEY: KEY }, "bridge"],
    [{ ALCHM_MCP_MODE: "   ", MCP_USER_API_KEY: KEY }, "bridge"],
  ])("%j -> %s", (env, mode) => {
    expect(selectMode(env)).toBe(mode);
  });

  it.each([
    ["is auto when unset", {}, "auto"],
    ["is auto when empty or blank", { ALCHM_MCP_MODE: "  " }, "auto"],
    ["reads remote", { ALCHM_MCP_MODE: "remote" }, "remote"],
    ["reads local", { ALCHM_MCP_MODE: "local" }, "local"],
    ["ignores case and surrounding blanks", { ALCHM_MCP_MODE: " LoCaL\n" }, "local"],
  ])("ALCHM_MCP_MODE %s", (_what, env, setting) => {
    expect(modeSetting(env)).toBe(setting);
  });

  it.each(["hosted", "remtoe", "in-process", "0", "sk_alchm_live_TEST_KEY_pasted_into_the_wrong_variable"])("refuses ALCHM_MCP_MODE=%j, and never repeats the value (it could be a key)", (value) => {
    let message = "";
    try {
      selectMode({ ALCHM_MCP_MODE: value, MCP_USER_API_KEY: KEY });
    } catch (error) {
      expect(error).toBeInstanceOf(BridgeConfigError);
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toBe("ALCHM_MCP_MODE must be remote, local or auto");
    expect(message).not.toContain(value);
  });

  it("reads the same variables in the same order as the in-process server", () => {
    expect(readApiKey({ MCP_USER_API_KEY: "a", ALCHM_MCP_USER_API_KEY: "b" })).toBe("a");
    expect(readApiKey({ ALCHM_MCP_USER_API_KEY: "b" })).toBe("b");
    expect(readApiKey({})).toBeNull();
  });
});

describe("what the in-process server says about its mode (inProcessNote)", () => {
  const operator = "postgres://operator";

  it.each([
    ["there is no key", { DATABASE_URL: operator }],
    ["there is no key, whatever the mode", { ALCHM_MCP_MODE: "local", DATABASE_URL: operator }],
    ["the key has no database and the bridge will run", { MCP_USER_API_KEY: KEY }],
    ["local was asked for with a database: that is a choice, not a surprise", { ALCHM_MCP_MODE: "local", MCP_USER_API_KEY: KEY, DATABASE_URL: operator }],
    ["remote was asked for: the bridge runs, not the in-process server", { ALCHM_MCP_MODE: "remote", MCP_USER_API_KEY: KEY, DATABASE_URL: operator }],
    // since 1.5.1 the in-process server sends a keyed tool call to the hosted REST endpoint when it has no database, so this works
    ["local was asked for with a key and no database: the in-process server's REST fallback takes the keyed calls", { ALCHM_MCP_MODE: "local", MCP_USER_API_KEY: KEY }],
  ])("says nothing when %s", (_what, env) => {
    expect(inProcessNote(env)).toBeNull();
  });

  it("explains operator mode, and how to use the hosted service, when a key meets a DATABASE_URL", () => {
    const note = inProcessNote({ MCP_USER_API_KEY: KEY, DATABASE_URL: operator });
    expect(note).toContain("operator mode");
    expect(note).toContain("ALCHM_MCP_MODE=remote");
    expect(note).not.toContain(KEY);
    expect(note).not.toContain(operator);
  });

  it("also fires for the other key variable and for an explicit auto", () => {
    expect(inProcessNote({ ALCHM_MCP_USER_API_KEY: KEY, DATABASE_URL: operator, ALCHM_MCP_MODE: "auto" })).toContain("operator mode");
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

  it.each([{}, { MCP_USER_API_KEY: "" }, { MCP_USER_API_KEY: "   \n" }])("says there is no key, and where to get one, for %j", (env) => {
    expect(() => resolveBridgeConfig(env)).toThrow(BridgeConfigError);
    expect(() => resolveBridgeConfig(env)).toThrow(/No API key.*https:\/\/alchm\.kitchen\/profile\/api-keys/);
  });

  it.each(['"sk_alchm_quoted"', "two words", "sk_alchm_ünïcode"])("refuses the key %j, and never repeats it", (key) => {
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
    expect(seen?.method).toBe("POST");
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

  it("takes a line for event data only when it starts with data:, not when the text merely contains it", () => {
    expect(parseSse('abcde{"jsonrpc":"2.0","id":1,"result":{"note":"data:"}}\n\n')).toEqual([]);
  });

  it("joins data lines with a newline, as the format says: a newline inside a JSON string makes the event invalid", () => {
    expect(parseSse('data: {"a":"x\ndata: y"}\n\n')).toEqual([]);
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
    expect(server.seen.map((entry) => entry.body)).toEqual([request(5), request(6)]); // the CR of a CRLF line is not forwarded
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

  describe("the protocol version it learns from initialize", () => {
    async function twoRequests(version: string): Promise<{ server: ReturnType<typeof fakeServer>; running: ReturnType<typeof startBridge> }> {
      const server = fakeServer((seen, _signal, index) => (index === 0 ? jsonResponse(reply(1, { protocolVersion: version })) : jsonResponse(reply(Number(idOf(seen))))));
      const running = startBridge(server.fetchImpl);
      running.stdin.write(`${request(1, "initialize")}\n`);
      await wait(30);
      running.stdin.write(`${request(2)}\n`);
      running.stdin.end();
      await running.done;
      return { server, running };
    }

    it.each(["2025-03-26", "2025-06-18", "DRAFT-2026-v1"])("is carried on later requests when it is %s", async (version) => {
      const { server } = await twoRequests(version);
      expect(server.seen[1]?.headers["mcp-protocol-version"]).toBe(version);
    });

    // The value goes into a header of every later request; a server that sends one that cannot be a header must not make them all fail.
    it.each([
      ["a CR/LF injection", "2025-03-26\r\nx-injected: 1"],
      ["longer than any version", "A".repeat(65)],
      ["empty", ""],
      ["made of words", "2025 03 26"],
    ])("is ignored, with a note on stderr, when it is %s: later requests still go out", async (_what, hostile) => {
      const { server, running } = await twoRequests(hostile);
      expect(jsonLines(running.stdout())).toEqual([reply(1, { protocolVersion: hostile }), reply(2)]);
      expect(server.seen[1]?.headers["mcp-protocol-version"]).toBeUndefined();
      expect(running.stderr()).toContain("ignored a protocolVersion");
    });
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

    it("reads an event stream whose content type carries a charset", async () => {
      const server = fakeServer(() => new Response(`data: ${JSON.stringify(reply(43))}\n\n`, { headers: { "content-type": "text/event-stream; charset=utf-8" } }));
      expect((await bridge(server.fetchImpl, [request(43)])).lines).toEqual([reply(43)]);
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

describe("a burst of requests", () => {
  const total = MAX_IN_FLIGHT + 36;
  const feed = (running: ReturnType<typeof startBridge>, from = 1, count = total): void => {
    for (let id = from; id < from + count; id += 1) running.stdin.write(`${request(id)}\n`);
  };
  const settles = (done: Promise<void>): Promise<string> => Promise.race([done.then(() => "done"), wait(3000).then(() => "stuck")]);

  it("keeps at most MAX_IN_FLIGHT on the wire, lets the rest wait their turn, answers every one, and leaks no slot", async () => {
    let onWire = 0;
    let peak = 0;
    const held: Array<() => void> = [];
    const server = fakeServer(async (seen) => {
      onWire += 1;
      peak = Math.max(peak, onWire);
      await new Promise<void>((go) => held.push(go));
      onWire -= 1;
      return jsonResponse(reply(Number(idOf(seen))));
    });
    const running = startBridge(server.fetchImpl);
    const answerUntil = async (count: number): Promise<void> => {
      for (let spin = 0; spin < 100 && jsonLines(running.stdout()).length < count; spin += 1) {
        while (held.length) held.shift()?.();
        await wait(5);
      }
    };
    feed(running);
    await wait(50);
    expect(onWire).toBe(MAX_IN_FLIGHT);
    expect(server.seen).toHaveLength(MAX_IN_FLIGHT);
    await answerUntil(total);
    expect(peak).toBe(MAX_IN_FLIGHT);
    // A second burst, on the same bridge: every slot must be free again, so a full MAX_IN_FLIGHT goes on the wire at once.
    feed(running, 1001, MAX_IN_FLIGHT);
    await wait(50);
    expect(onWire).toBe(MAX_IN_FLIGHT);
    await answerUntil(total + MAX_IN_FLIGHT);
    running.stdin.end();
    expect(await settles(running.done)).toBe("done");
    const expected = [...Array.from({ length: total }, (_, i) => i + 1), ...Array.from({ length: MAX_IN_FLIGHT }, (_, i) => 1001 + i)];
    expect(answeredIds(running.stdout()).sort((a, b) => a - b)).toEqual(expected);
  });

  it("frees a slot when a request fails, so a burst of failures is all answered", async () => {
    const down = fakeServer(() => Promise.reject(new TypeError("fetch failed")));
    const running = startBridge(down.fetchImpl);
    feed(running);
    running.stdin.end();
    expect(await settles(running.done)).toBe("done");
    expect(jsonLines(running.stdout())).toHaveLength(total);
  });

  it("sends nothing that was still waiting for a slot when told to stop", async () => {
    const server = fakeServer((_seen, signal) => silence(signal));
    const stop = new AbortController();
    const running = startBridge(server.fetchImpl, { signal: stop.signal });
    feed(running);
    await wait(50);
    expect(server.seen).toHaveLength(MAX_IN_FLIGHT);
    stop.abort();
    await running.done;
    await wait(80); // the cancelled requests settle and hand their slots to the waiting ones
    expect(server.seen).toHaveLength(MAX_IN_FLIGHT);
    expect(running.stdout()).toBe("");
  });
});

describe("the client closing a pipe", () => {
  it("stops, cancelling what is in flight, and says so on stderr, when stdout is closed (EPIPE)", async () => {
    let second: AbortSignal | null | undefined;
    const server = fakeServer((seen, signal) => {
      if (idOf(seen) === 1) return jsonResponse(reply(1));
      second = signal;
      return silence(signal);
    });
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${request(1)}\n${request(2)}\n`);
    await wait(30);
    expect(jsonLines(running.stdout())).toEqual([reply(1)]);
    running.out.destroy(new Error("write EPIPE"));
    expect(await Promise.race([running.done.then(() => "returned"), wait(300).then(() => "still running")])).toBe("returned");
    await wait(30);
    expect(second?.aborted).toBe(true);
    expect(running.stderr()).toContain("stdout is closed (write EPIPE); stopping");
  });

  it("does not put the key on stderr even when the closed stream's own error mentions it", async () => {
    const running = startBridge(fakeServer(() => jsonResponse(reply(1))).fetchImpl);
    running.out.destroy(new Error(`write EPIPE (Authorization: Bearer ${KEY})`));
    await running.done;
    expect(running.stderr()).toContain("stdout is closed");
    expect(running.stderr()).not.toContain(KEY);
  });

  it("keeps answering when stderr goes away under it", async () => {
    const server = fakeServer((seen) => (idOf(seen) === undefined ? jsonResponse({}, 500) : jsonResponse(reply(Number(idOf(seen))))));
    const running = startBridge(server.fetchImpl);
    running.err.destroy(new Error("write EPIPE"));
    await wait(10);
    running.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n${request(5)}\n`); // the refused notification wants to log
    running.stdin.end();
    await running.done;
    expect(jsonLines(running.stdout())).toEqual([reply(5)]);
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
    running.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/message", params: { pad: "x".repeat(MAX_MESSAGE_BYTES) } })}\n`);
    await wait(50);
    expect(server.seen).toHaveLength(0);
    expect(running.stdout()).toBe("");
    expect(running.stderr()).toBe(""); // not even a note that an oversized message was dropped
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

const errorMessage = (line: unknown): string =>
  typeof line === "object" && line !== null && "error" in line && typeof line.error === "object" && line.error !== null && "message" in line.error && typeof line.error.message === "string"
    ? line.error.message
    : "";

describe("limits and defaults", () => {
  it("keeps the limits the hosted route imposes", () => {
    expect(MAX_MESSAGE_BYTES).toBe(256 * 1024); // the route answers 413 above this
    expect(DEFAULT_TIMEOUT_MS).toBe(65_000); // just past the route's 60 s maxDuration
    expect(MAX_REPLY_BYTES).toBe(16 * 1024 * 1024);
  });

  it("passes on a reply of a megabyte with the default reply cap", async () => {
    const big = { jsonrpc: "2.0", id: 70, result: { pad: "x".repeat(1024 * 1024) } };
    expect((await bridge(fakeServer(() => jsonResponse(big)).fetchImpl, [request(70)])).lines).toEqual([big]);
  });

  describe("the request size limit", () => {
    const shell = (pad: string): string => JSON.stringify({ jsonrpc: "2.0", id: 50, method: "tools/call", params: { pad } });
    const ofBytes = (bytes: number): string => shell("x".repeat(bytes - Buffer.byteLength(shell(""))));
    const tooLarge = { jsonrpc: "2.0", id: 50, error: { code: -32600, message: expect.stringMatching(/Payload Too Large/) } };

    it("forwards a message of exactly the limit and refuses one a byte over", async () => {
      expect(Buffer.byteLength(ofBytes(MAX_MESSAGE_BYTES))).toBe(MAX_MESSAGE_BYTES);
      const server = fakeServer(() => jsonResponse(reply(50)));
      const run = await bridge(server.fetchImpl, [ofBytes(MAX_MESSAGE_BYTES), ofBytes(MAX_MESSAGE_BYTES + 1)]);
      expect(server.seen).toHaveLength(1);
      expect(run.lines).toEqual(expect.arrayContaining([reply(50), tooLarge]));
    });

    it("counts the limit in bytes, not characters", async () => {
      const count = Math.ceil((MAX_MESSAGE_BYTES - Buffer.byteLength(shell(""))) / 3) + 1;
      const line = shell("€".repeat(count)); // one character, three bytes
      expect(line.length).toBeLessThan(MAX_MESSAGE_BYTES);
      expect(Buffer.byteLength(line)).toBeGreaterThan(MAX_MESSAGE_BYTES);
      const server = fakeServer(() => jsonResponse(reply(50)));
      const run = await bridge(server.fetchImpl, [line]);
      expect(server.seen).toHaveLength(0);
      expect(run.lines).toEqual([tooLarge]);
    });

    it("holds a line past the request limit while its newline has not come, then refuses it by its id", async () => {
      const line = ofBytes(MAX_MESSAGE_BYTES + 40_000);
      const running = startBridge(fakeServer(() => jsonResponse(reply(50))).fetchImpl);
      running.stdin.write(line.slice(0, 280_000));
      await wait(20);
      expect(running.stdout()).toBe(""); // held, not thrown away as "too long"
      running.stdin.write(`${line.slice(280_000)}\n`);
      running.stdin.end();
      await running.done;
      expect(jsonLines(running.stdout())).toEqual([tooLarge]);
    });

    it("holds a line of exactly the hold limit (a megabyte) too", async () => {
      const running = startBridge(fakeServer(() => jsonResponse(reply(50))).fetchImpl);
      running.stdin.write("x".repeat(4 * MAX_MESSAGE_BYTES));
      await wait(20);
      expect(running.stdout()).toBe("");
      running.stdin.write("\n");
      running.stdin.end();
      await running.done;
      expect(jsonLines(running.stdout())).toEqual([{ jsonrpc: "2.0", id: null, error: { code: -32700, message: expect.stringMatching(/Parse error/) } }]);
    });
  });
});

describe("reading stdin", () => {
  it.each([
    ["the two bytes of è", "è", 1],
    ["the three bytes of ☉", "☉", 1],
    ["the four bytes of 🍲", "🍲", 2],
  ])("decodes a character split between two chunks: inside %s", async (_what, character, offset) => {
    const line = JSON.stringify({ jsonrpc: "2.0", id: 80, method: "tools/call", params: { text: `crème brûlée ☉ 🍲 ${character}` } });
    const bytes = Buffer.from(`${line}\n`);
    const cut = bytes.indexOf(Buffer.from(character)) + offset;
    const server = fakeServer(() => jsonResponse(reply(80)));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(bytes.subarray(0, cut));
    await wait(20);
    running.stdin.write(bytes.subarray(cut));
    running.stdin.end();
    await running.done;
    expect(server.seen[0]?.body).toBe(line);
  });

  it("takes a message written one character at a time, with the CR and the LF in separate writes", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const running = startBridge(server.fetchImpl);
    for (const character of `${request(81)}\r\n${request(82)}`) running.stdin.write(character);
    running.stdin.end();
    await running.done;
    expect(server.seen.map((entry) => entry.body)).toEqual([request(81), request(82)]);
  });

  it("does not forward a last line that is only blanks", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${request(83)}\n   `);
    running.stdin.end();
    await running.done;
    expect(server.seen).toHaveLength(1);
    expect(jsonLines(running.stdout())).toEqual([reply(83)]); // and no parse error for the blanks
  });
});

describe("state carried between requests", () => {
  async function run(replies: Array<(seen: Seen) => Response>, count: number): Promise<ReturnType<typeof fakeServer>> {
    const server = fakeServer((seen, _signal, index) => (replies[index] ?? replies[replies.length - 1] ?? (() => jsonResponse({})))(seen));
    const running = startBridge(server.fetchImpl);
    for (let id = 1; id <= count; id += 1) {
      running.stdin.write(`${request(id, id === 1 ? "initialize" : "tools/list")}\n`);
      await wait(20);
    }
    running.stdin.end();
    await running.done;
    return server;
  }

  it("keeps the session id when a later reply has none", async () => {
    const server = await run([
      (seen) => jsonResponse(reply(Number(idOf(seen))), 200, { "mcp-session-id": "sess-1" }),
      (seen) => jsonResponse(reply(Number(idOf(seen)))),
    ], 3);
    expect(server.seen[1]?.headers["mcp-session-id"]).toBe("sess-1");
    expect(server.seen[2]?.headers["mcp-session-id"]).toBe("sess-1");
  });

  it("keeps the protocol version when a later reply has none, or something that is not a string", async () => {
    const server = await run([
      (seen) => jsonResponse(reply(Number(idOf(seen)), { protocolVersion: "2025-03-26" })),
      (seen) => jsonResponse(reply(Number(idOf(seen)))),
      (seen) => jsonResponse(reply(Number(idOf(seen)), { protocolVersion: 5 })),
    ], 4);
    expect(server.seen.slice(1).map((entry) => entry.headers["mcp-protocol-version"])).toEqual(["2025-03-26", "2025-03-26", "2025-03-26"]);
  });

  it("learns the protocol version from an initialize result inside a batch reply", async () => {
    const server = fakeServer((seen, _signal, index) => (index === 0 ? jsonResponse([reply(1, { protocolVersion: "2025-06-18" })]) : jsonResponse(reply(Number(idOf(seen))))));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${JSON.stringify([JSON.parse(request(1, "initialize"))])}\n`);
    await wait(30);
    running.stdin.write(`${request(2)}\n`);
    running.stdin.end();
    await running.done;
    expect(server.seen[1]?.headers["mcp-protocol-version"]).toBe("2025-06-18");
  });

  it("ignores a session id that cannot be a header value, with a note on stderr, and keeps going", async () => {
    const server = fakeServer((seen, _signal, index) => jsonResponse(reply(Number(idOf(seen))), 200, index === 0 ? { "mcp-session-id": "two words" } : {}));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${request(1)}\n`);
    await wait(30);
    running.stdin.write(`${request(2)}\n`);
    running.stdin.end();
    await running.done;
    expect(server.seen[1]?.headers["mcp-session-id"]).toBeUndefined();
    expect(running.stderr()).toContain("ignored an mcp-session-id");
    expect(jsonLines(running.stdout())).toEqual([reply(1), reply(2)]);
  });
});

describe("what the server and the runtime say when something goes wrong", () => {
  const tokenUrl = new URL("https://staging.example.com/api/mcp?x-bypass=QSECRET_hunter2&other=1");
  const failing = (message: string, name = "Error"): ReturnType<typeof fakeServer> =>
    fakeServer(() => Promise.reject(new TypeError("fetch failed", { cause: Object.assign(new Error(message), { name }) })));
  const notification = JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" });

  it.each([
    ["quotes the whole URL, as Bun does", `UnexpectedRedirect fetching "${tokenUrl.href}". For more information, pass verbose: true`],
    ["quotes the query string alone", "bad request near ?x-bypass=QSECRET_hunter2&other=1"],
    ["quotes one value from the query", "token QSECRET_hunter2 was refused"],
    ["quotes the API key", `Authorization: Bearer ${KEY} was refused`],
  ])("never shows the configured query string or the key when the runtime %s", async (_what, message) => {
    const run = await bridge(failing(message).fetchImpl, [request(60)], { url: tokenUrl });
    const shown = `${run.stdout}${run.stderr}`;
    expect(shown).not.toContain("QSECRET_hunter2");
    expect(shown).not.toContain("x-bypass");
    expect(run.stderr).toContain("request to https://staging.example.com/api/mcp failed");
  });

  it("shortens a URL the runtime quotes to its host and path", async () => {
    const run = await bridge(failing(`UnexpectedRedirect fetching "${tokenUrl.href}".`).fetchImpl, [request(60)], { url: tokenUrl });
    expect(run.stderr).toContain('fetching "https://staging.example.com/api/mcp".');
  });

  it("still sends the configured query with the request", async () => {
    const server = fakeServer(() => jsonResponse(reply(61)));
    await bridge(server.fetchImpl, [request(61)], { url: tokenUrl });
    expect(server.seen[0]?.url).toBe(tokenUrl.href);
  });

  it("clips a long error text", async () => {
    const run = await bridge(failing("x".repeat(1000)).fetchImpl, [request(62)]);
    expect(errorMessage(run.lines[0]).length).toBeLessThanOrEqual("Could not reach https://alchm.kitchen/api/mcp: ".length + 300);
  });

  it("clips after removing a secret, so a cut can never leave half of one showing", async () => {
    // "fetch failed: " + 238 characters + a space put the 300-character cut twelve characters into the query string
    const message = `${"y".repeat(238)} ${tokenUrl.href} ${"z".repeat(100)}`;
    const run = await bridge(failing(message).fetchImpl, [request(62)], { url: tokenUrl });
    expect(`${run.stdout}${run.stderr}`).not.toContain("QSECRET");
    expect(`${run.stdout}${run.stderr}`).not.toContain("x-bypass");
  });

  it("says why a connection failed when the cause is an AggregateError with no message (Node tries every address of a host)", async () => {
    const aggregate = new AggregateError([new Error("connect ECONNREFUSED 127.0.0.1:1"), new Error("connect ECONNREFUSED ::1:1"), new Error("connect ECONNREFUSED 127.0.0.1:1")], "");
    const run = await bridge(fakeServer(() => Promise.reject(new TypeError("fetch failed", { cause: aggregate }))).fetchImpl, [request(63)]);
    expect(errorMessage(run.lines[0])).toBe("Could not reach https://alchm.kitchen/api/mcp: fetch failed: connect ECONNREFUSED 127.0.0.1:1; connect ECONNREFUSED ::1:1");
  });

  it("falls back to the code of a cause that has no message, and to nothing when there is no cause", async () => {
    const coded = fakeServer(() => Promise.reject(new TypeError("fetch failed", { cause: Object.assign(new Error(""), { code: "ECONNREFUSED" }) })));
    expect(errorMessage((await bridge(coded.fetchImpl, [request(63)])).lines[0])).toBe("Could not reach https://alchm.kitchen/api/mcp: fetch failed: ECONNREFUSED");
    const bare = fakeServer(() => Promise.reject(new TypeError("fetch failed")));
    expect(errorMessage((await bridge(bare.fetchImpl, [request(63)])).lines[0])).toBe("Could not reach https://alchm.kitchen/api/mcp: fetch failed");
  });

  it.each([
    ["in Node's words", "unexpected redirect", "Error"],
    ["in Bun's words", `UnexpectedRedirect fetching "https://alchm.kitchen/api/mcp"`, "Error"],
  ])("explains a refused redirect %s", async (_what, message, name) => {
    const run = await bridge(failing(message, name).fetchImpl, [request(66)]);
    expect(errorMessage(run.lines[0])).toContain("never follows");
    expect(run.stderr).toContain("never follows");
  });

  it("shows Retry-After in seconds as seconds and as a date as a date, and the status text", async () => {
    const seconds = fakeServer(() => new Response("down", { status: 503, headers: { "retry-after": "30" } }));
    expect(errorMessage((await bridge(seconds.fetchImpl, [request(64)])).lines[0])).toBe("The server answered HTTP 503 (retry after 30 s)");
    const date = fakeServer(() => new Response("down", { status: 503, headers: { "retry-after": "Wed, 21 Oct 2026 07:28:00 GMT" } }));
    expect(errorMessage((await bridge(date.fetchImpl, [request(64)])).lines[0])).toBe("The server answered HTTP 503 (Retry-After: Wed, 21 Oct 2026 07:28:00 GMT)");
    const named = fakeServer(() => new Response("bad", { status: 502, statusText: "Bad Gateway" }));
    expect(errorMessage((await bridge(named.fetchImpl, [request(64)])).lines[0])).toBe("The server answered HTTP 502 Bad Gateway");
  });

  it("does not repeat the key when a server puts it in the status text or in Retry-After", async () => {
    const echoing = fakeServer(() => new Response("bad", { status: 502, statusText: KEY, headers: { "retry-after": KEY } }));
    const run = await bridge(echoing.fetchImpl, [request(67), JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })]); // the helper fails if the key shows anywhere
    expect(errorMessage(run.lines[0])).toContain("The server answered HTTP 502");
  });

  it("keeps a server's JSON-RPC error code and message only when they have the right types", async () => {
    const odd = { jsonrpc: "2.0", id: null, error: { code: "E_BAD", message: 42 } };
    const run = await bridge(fakeServer(() => jsonResponse(odd, 500)).fetchImpl, [request(65)]);
    expect(run.lines).toEqual([{ jsonrpc: "2.0", id: 65, error: { code: -32603, message: "The server answered HTTP 500" } }]);
  });

  it("answers each request of a batch the server refused, as the hosted route does (it takes no batches)", async () => {
    const refused = { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error: Invalid JSON-RPC message" } };
    const batch = JSON.stringify([JSON.parse(request(1)), JSON.parse(request(2)), JSON.parse(notification)]);
    const run = await bridge(fakeServer(() => jsonResponse(refused, 400)).fetchImpl, [batch]);
    expect(run.lines).toEqual([
      { jsonrpc: "2.0", id: 1, error: { code: -32700, message: "Parse error: Invalid JSON-RPC message" } },
      { jsonrpc: "2.0", id: 2, error: { code: -32700, message: "Parse error: Invalid JSON-RPC message" } },
    ]);
  });

  it("puts the bridge's own prefix on what it logs", async () => {
    const run = await bridge(failing("boom").fetchImpl, [notification]);
    expect(run.stderr).toContain("alchm-mcp: request to https://alchm.kitchen/api/mcp failed: fetch failed: boom");
  });
});

describe("a reply that arrives in pieces", () => {
  const chunk = new Uint8Array(40).fill(97); // 40 bytes of "a"

  it("counts the reply cap across the pieces, each of which is under it", async () => {
    const run = await bridge(fakeServer(() => streamed([chunk, chunk, chunk])).fetchImpl, [request(90)], { maxReplyBytes: 100 });
    expect(errorMessage(run.lines[0])).toMatch(/larger than 100 bytes/);
  });

  it("cancels the rest of a reply that is over the cap", async () => {
    let cancelled = false;
    const server = fakeServer(() => streamed([chunk, chunk, chunk], { stall: true, onCancel: () => { cancelled = true; } }));
    await bridge(server.fetchImpl, [request(90)], { maxReplyBytes: 100 });
    expect(cancelled).toBe(true);
  });

  it("cuts off a body that stalls after its headers, with the same timeout", async () => {
    const server = fakeServer((_seen, signal) => streamed([new TextEncoder().encode('{"jsonrpc":"2.0","id":91,')], { signal, stall: true }));
    const run = await bridge(server.fetchImpl, [request(91)], { timeoutMs: 80 });
    expect(errorMessage(run.lines[0])).toMatch(/no answer within 0\.08 s/);
  });
});

describe("a failure inside the bridge itself", () => {
  const unhandled: unknown[] = [];
  const record = (reason: unknown): void => {
    unhandled.push(reason);
  };
  beforeEach(() => {
    unhandled.length = 0;
    process.on("unhandledRejection", record);
  });
  afterEach(() => {
    process.off("unhandledRejection", record);
  });

  it("logs an error it did not expect instead of letting it end the process", async () => {
    const server = fakeServer((seen) => jsonResponse(reply(Number(idOf(seen)))));
    const running = startBridge(server.fetchImpl);
    running.out.write = (): boolean => {
      throw new Error("write exploded");
    };
    running.stdin.write(`${request(95)}\n`);
    await wait(40); // the failure comes while the input is still open
    running.stdin.end();
    await running.done;
    expect(running.stderr()).toContain("alchm-mcp: internal error: write exploded");
    expect(unhandled).toEqual([]);
  });

  it("keeps answering when writing to stderr throws", async () => {
    const server = fakeServer((seen) => (idOf(seen) === undefined ? jsonResponse({}, 500) : jsonResponse(reply(Number(idOf(seen))))));
    const running = startBridge(server.fetchImpl);
    running.err.write = (): boolean => {
      throw new Error("stderr exploded");
    };
    running.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`); // the refused notification wants to log
    await wait(30);
    running.stdin.write(`${request(97)}\n`);
    running.stdin.end();
    await running.done;
    expect(jsonLines(running.stdout())).toEqual([reply(97)]);
    expect(unhandled).toEqual([]);
  });

  it("is not stopped by a line that nests brackets thousands deep", async () => {
    const server = fakeServer((seen) => (Array.isArray(JSON.parse(seen.body))
      ? jsonResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400)
      : jsonResponse(reply(Number(idOf(seen))))));
    const running = startBridge(server.fetchImpl);
    running.stdin.write(`${"[".repeat(5000)}${"]".repeat(5000)}\n`);
    await wait(40);
    running.stdin.write(`${request(96)}\n`);
    running.stdin.end();
    await running.done;
    expect(jsonLines(running.stdout())).toEqual([reply(96)]);
    expect(running.stderr()).not.toContain("internal error");
    expect(unhandled).toEqual([]);
  });
});

describe("a proxy in the environment", () => {
  const local = new URL("http://localhost:3000/api/mcp");
  const proxy = { HTTP_PROXY: "http://proxy.corp:3128" };

  it.each([
    ["there is no proxy", {}, local],
    ["the URL is https, which a proxy only tunnels", proxy, new URL("https://alchm.kitchen/api/mcp")],
    ["NO_PROXY lists the host", { ...proxy, NO_PROXY: "example.com, localhost" }, local],
    ["no_proxy lists the host in capitals", { http_proxy: "http://proxy.corp:3128", no_proxy: "LOCALHOST" }, local],
    ["NO_PROXY is *", { ...proxy, NO_PROXY: "*" }, local],
    ["NO_PROXY lists an IPv6 host in brackets", { ...proxy, NO_PROXY: "[::1]" }, new URL("http://[::1]:3000/api/mcp")],
  ])("says nothing when %s", (_what, env, url) => {
    expect(proxyWarning(env, url)).toBeNull();
  });

  it.each([
    ["HTTP_PROXY", proxy, local, "localhost"],
    ["a lower-case http_proxy", { http_proxy: "http://proxy.corp:3128" }, local, "localhost"],
    ["a NO_PROXY that lists another host", { ...proxy, NO_PROXY: "127.0.0.1" }, local, "localhost"],
    ["an IPv6 host", proxy, new URL("http://[::1]:3000/api/mcp"), "::1"],
  ])("warns, naming the host to add to NO_PROXY, for plain http with %s", (_what, env, url, host) => {
    const warning = proxyWarning(env, url);
    expect(warning).toContain("clear text");
    expect(warning).toContain(`Add ${host} to NO_PROXY`);
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

  it("says that DATABASE_URL is not used when remote was asked for with one set, and only then", async () => {
    const forced = await runProcess({ MCP_USER_API_KEY: KEY, ALCHM_MCP_MODE: "remote", DATABASE_URL: "postgres://unrelated" });
    expect(forced.code).toBe(0);
    expect(forced.stderr).toContain("remote bridge to https://alchm.kitchen/api/mcp");
    expect(forced.stderr).toContain("ALCHM_MCP_MODE=remote, so DATABASE_URL is not used");
    expect(forced.stderr).not.toContain("postgres://unrelated");
    expect((await runProcess({ MCP_USER_API_KEY: KEY, ALCHM_MCP_MODE: "remote" })).stderr).not.toContain("DATABASE_URL is not used");
    expect((await runProcess({ MCP_USER_API_KEY: KEY })).stderr).not.toContain("DATABASE_URL is not used");
    // the wrapper run directly with a database and the default mode (index.ts would not start it): the note is about remote
    expect((await runProcess({ MCP_USER_API_KEY: KEY, DATABASE_URL: "postgres://unrelated" })).stderr).not.toContain("DATABASE_URL is not used");
  });

  it("stops when the signal it was given aborts, though stdin is still open", async () => {
    const stop = new AbortController();
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const done = runBridgeProcess({ env: { MCP_USER_API_KEY: KEY }, stdin, stdout, stderr }, "alchm-mcp-bridge/test", stop.signal);
    await wait(20);
    stop.abort();
    expect(await Promise.race([done, wait(300).then(() => "still running")])).toBe(0);
  });

  it("warns on stderr, after the banner, when plain http may go through a proxy", async () => {
    const run = await runProcess({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "http://localhost:3000/api/mcp", HTTP_PROXY: "http://proxy.corp:3128" });
    expect(run.code).toBe(0);
    expect(run.stderr).toMatch(/remote bridge to http:\/\/localhost:3000\/api\/mcp[^\n]*\n[^\n]*warning: HTTP_PROXY is set/);
  });

  it("names the configured endpoint, with its path and without any query string", async () => {
    const run = await runProcess({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "https://staging.example.com/api/mcp?token=hunter2" });
    expect(run.stderr).toContain("remote bridge to https://staging.example.com/api/mcp ");
    expect(run.stderr).not.toContain("hunter2");
  });

  it.each([
    [{ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "http://example.com/api/mcp" }, /must be https/],
    [{ MCP_USER_API_KEY: '"quoted"' }, /cannot have/],
    [{ ALCHM_MCP_MODE: "remote" }, /No API key/],
    [{ ALCHM_MCP_MODE: "remtoe", MCP_USER_API_KEY: KEY }, /must be remote, local or auto/],
  ])("refuses %j with exit code 1, the reason on stderr and nothing on stdout", async (env, why) => {
    const run = await runProcess(env);
    expect(run.code).toBe(1);
    expect(run.stderr).toMatch(why);
    expect(run.stdout).toBe("");
  });
});

describe("how the process ends (runBridgeMain)", () => {
  function fake(env: Record<string, string>) {
    const listeners = new Map<string, () => void>();
    const exits: Array<number | undefined> = [];
    const stdin = new PassThrough();
    const proc = {
      env,
      stdin,
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      on(event: "SIGINT" | "SIGTERM", listener: () => void): void {
        listeners.set(event, listener);
      },
      exit(code?: number): void {
        exits.push(code);
      },
    };
    return { proc, listeners, exits, stdin };
  }
  const working = { MCP_USER_API_KEY: KEY };
  const settled = (promise: Promise<number>): Promise<number | string> => Promise.race([promise, wait(300).then(() => "still running")]);

  it("keeps the grace period well over the time a client needs to read a reply", () => {
    expect(FINISH_GRACE_MS).toBe(10_000);
  });

  it("listens for SIGINT and for SIGTERM", () => {
    const { proc, listeners, stdin } = fake(working);
    void runBridgeMain(proc, "alchm-mcp-bridge/test", 60_000);
    expect([...listeners.keys()].sort()).toEqual(["SIGINT", "SIGTERM"]);
    stdin.end();
  });

  it.each(["SIGINT", "SIGTERM"] as const)("a %s before it has finished stops it, returns 0, and does not end the process itself", async (signal) => {
    const { proc, listeners, exits } = fake(working);
    const done = runBridgeMain(proc, "alchm-mcp-bridge/test", 60_000);
    await wait(20);
    listeners.get(signal)?.();
    expect(await settled(done)).toBe(0);
    expect(exits).toEqual([]);
  });

  it("at the end of input it stops reading stdin and returns 0, and does not call exit() (that would drop queued output)", async () => {
    const { proc, exits, stdin } = fake(working);
    const done = runBridgeMain(proc, "alchm-mcp-bridge/test", 60_000);
    stdin.end();
    expect(await settled(done)).toBe(0);
    expect(stdin.isPaused()).toBe(true);
    expect(exits).toEqual([]);
  });

  it.each(["SIGINT", "SIGTERM"] as const)("a %s after it has finished ends the process at once, with 0", async (signal) => {
    const { proc, listeners, exits, stdin } = fake(working);
    const done = runBridgeMain(proc, "alchm-mcp-bridge/test", 60_000);
    stdin.end();
    await settled(done);
    listeners.get(signal)?.();
    expect(exits).toEqual([0]);
  });

  it("ends the process after the grace period, with its exit code, if the event loop is still alive", async () => {
    const ok = fake(working);
    const finished = runBridgeMain(ok.proc, "alchm-mcp-bridge/test", 40);
    ok.stdin.end();
    await settled(finished);
    expect(ok.exits).toEqual([]);
    await wait(120);
    expect(ok.exits).toEqual([0]);

    const refused = fake({ MCP_USER_API_KEY: '"quoted"' });
    expect(await settled(runBridgeMain(refused.proc, "alchm-mcp-bridge/test", 40))).toBe(1);
    await wait(120);
    expect(refused.exits).toEqual([1]);
  });
});
