/**
 * Stdio-to-hosted bridge for the npm package.
 *
 * `@alchm/mcp-server` runs the tools in-process. An API key is checked against the operator's database
 * (`DATABASE_URL`), which an external user does not have, so in 1.5.0 a key with no database made every tool answer
 * "API key authentication failed or is unavailable" (src/lib/mcp/auth.ts: explicit credentials never fall back to
 * anonymous access). The hosted endpoint, https://alchm.kitchen/api/mcp, validates the same keys. So when the process has
 * a key and no `DATABASE_URL`, it forwards each JSON-RPC message there instead of running the tools itself. (Since 1.5.1 the
 * in-process server also sends a keyed tool call to the hosted REST endpoint when it has no database, see
 * src/lib/mcp/stdioRemoteFallback.ts; ALCHM_MCP_MODE=local gets that path.)
 *
 *   ALCHM_MCP_MODE unset or auto:
 *     key and DATABASE_URL: in-process, operator mode (unchanged)
 *     no key:               in-process, anonymous demo mode (unchanged)
 *     key, no DATABASE_URL: this bridge
 *   ALCHM_MCP_MODE=remote:  this bridge, whatever DATABASE_URL says (a shell often exports an unrelated one); needs a key
 *   ALCHM_MCP_MODE=local:   in-process, whatever the key and DATABASE_URL say (keyed tool calls go to the REST fallback if no database)
 *
 * The hosted route is stateless Streamable HTTP: POST one message, get one JSON reply (an SSE reply is accepted too), 202
 * with no body for a notification. A JSON-RPC batch is forwarded as it is, but the hosted route refuses one (400), and each
 * request in it is then answered with that error. stdout carries only JSON-RPC 2.0 lines (a reply that is not one is
 * dropped, with a note on stderr); everything else goes to stderr. The key is never written anywhere but the Authorization
 * header, redirects are refused so it cannot be re-sent to another host, and error text from the runtime is scrubbed of the
 * key and the configured query string before it is shown.
 *
 * Not done, on purpose: notifications/cancelled is forwarded but does not cancel the request in flight (the late reply is
 * still written, which a strict client ignores); no retries (a retried paid call would be charged twice unless the caller
 * sends _meta.idempotencyKey); the backlog behind the in-flight limit is not throttled.
 */
import type { Readable, Writable } from "node:stream";

export const DEFAULT_REMOTE_URL = "https://alchm.kitchen/api/mcp";
/** The hosted route refuses a request body over 256 KB (413). */
export const MAX_MESSAGE_BYTES = 256 * 1024;
/** The hosted route's maxDuration is 60 s. */
export const DEFAULT_TIMEOUT_MS = 65_000;
/** A reply bigger than this is refused rather than held in memory (a misconfigured ALCHM_MCP_REMOTE_URL is the only way to get one). */
export const MAX_REPLY_BYTES = 16 * 1024 * 1024;
/** Requests on the wire at once. A client sends a handful; this keeps a burst from opening more sockets than the process may have (EMFILE). The rest wait their turn. */
export const MAX_IN_FLIGHT = 64;
/** How long the process may stay alive after the bridge has finished before it is ended anyway. */
export const FINISH_GRACE_MS = 10_000;
/** The longest error text shown for one failure. */
const MAX_ERROR_CHARS = 300;
/** What the route's bearer parser accepts; anything else would be silently read as "no key". */
const KEY_PATTERN = /^[A-Za-z0-9_.~-]+$/;
/** What an MCP protocol version looks like (2025-03-26, DRAFT-2026-v1). It is copied into a header, so nothing else is kept. */
const VERSION_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;
/** A session id is visible ASCII (the MCP spec's own rule). It is copied into a header, so nothing else is kept. */
const SESSION_PATTERN = /^[\x21-\x7e]{1,256}$/;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

type Env = Record<string, string | undefined>;
type JsonRpcId = string | number;

export type Mode = "bridge" | "in-process";

export class BridgeConfigError extends Error {}

/** The key the in-process server would use (same variables and order as src/lib/mcp/auth.ts). */
export function readApiKey(env: Env): string | null {
  return env.MCP_USER_API_KEY || env.ALCHM_MCP_USER_API_KEY || null;
}

/** What ALCHM_MCP_MODE asks for. `auto` (the default) lets the key and DATABASE_URL decide. */
export type ModeSetting = "auto" | "remote" | "local";

/**
 * Reads ALCHM_MCP_MODE (case and surrounding blanks do not matter; unset or empty is `auto`). Anything else is refused
 * rather than guessed at, and the message does not repeat the value: it may be a key pasted into the wrong variable.
 */
export function modeSetting(env: Env): ModeSetting {
  const written = env.ALCHM_MCP_MODE?.trim().toLowerCase() ?? "";
  if (written === "" || written === "auto") return "auto";
  if (written === "remote" || written === "local") return written;
  throw new BridgeConfigError("ALCHM_MCP_MODE must be remote, local or auto");
}

/** Throws BridgeConfigError for an ALCHM_MCP_MODE that is none of remote, local and auto. */
export function selectMode(env: Env): Mode {
  const setting = modeSetting(env);
  if (setting === "remote") return "bridge";
  if (setting === "local") return "in-process";
  return readApiKey(env) && !env.DATABASE_URL ? "bridge" : "in-process";
}

/**
 * A line for stderr when the in-process server starts with an API key, saying which mode that is and how to change it, or
 * null when there is nothing to say. Many clients pass on the environment of the shell that started them, and DATABASE_URL
 * is a common name: without this, a developer with an unrelated one gets "unavailable" from every tool and no reason.
 */
export function inProcessNote(env: Env): string | null {
  if (!readApiKey(env)) return null;
  const setting = modeSetting(env);
  if (setting === "auto" && env.DATABASE_URL) {
    return "An API key and DATABASE_URL are both set, so this process checks keys against that database (operator mode). To use the hosted service instead, set ALCHM_MCP_MODE=remote in this server's env block (or unset DATABASE_URL).";
  }
  return null;
}

export interface BridgeConfig {
  url: URL;
  apiKey: string;
}

export function resolveBridgeConfig(env: Env): BridgeConfig {
  const rawKey = readApiKey(env)?.trim() ?? "";
  if (!rawKey) {
    throw new BridgeConfigError("No API key: set MCP_USER_API_KEY (mint one at https://alchm.kitchen/profile/api-keys); the hosted service needs one");
  }
  if (!KEY_PATTERN.test(rawKey)) {
    throw new BridgeConfigError(
      "MCP_USER_API_KEY is empty or contains characters an API key cannot have (spaces, quotes); copy the key again from https://alchm.kitchen/profile/api-keys",
    );
  }
  const written = env.ALCHM_MCP_REMOTE_URL?.trim() || DEFAULT_REMOTE_URL;
  let url: URL;
  try {
    url = new URL(written);
  } catch {
    throw new BridgeConfigError("ALCHM_MCP_REMOTE_URL is not a URL");
  }
  if (url.username || url.password) {
    throw new BridgeConfigError("ALCHM_MCP_REMOTE_URL must not contain credentials; the key travels in the Authorization header");
  }
  const local = url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !local) {
    throw new BridgeConfigError("ALCHM_MCP_REMOTE_URL must be https (http is accepted only for localhost): the API key would travel in clear text");
  }
  return { url, apiKey: rawKey };
}

/**
 * Plain http is accepted only for localhost, but a proxy in the environment may carry that request elsewhere, key and all:
 * Bun and Node with NODE_USE_ENV_PROXY=1 honour HTTP_PROXY. A warning for that case, or null.
 */
export function proxyWarning(env: Env, url: URL): string | null {
  if (url.protocol !== "http:" || !(env.HTTP_PROXY || env.http_proxy)) return null;
  const bare = (host: string): string => host.toLowerCase().replace(/^\[|\]$/g, "");
  const exempt = (env.NO_PROXY ?? env.no_proxy ?? "").split(",").map((entry) => bare(entry.trim())).filter(Boolean);
  if (exempt.some((entry) => entry === "*" || entry === bare(url.hostname))) return null;
  return `HTTP_PROXY is set and ${url.origin} is plain http: where the runtime honours it (Bun, or Node with NODE_USE_ENV_PROXY=1) the API key would go through the proxy in clear text. Add ${bare(url.hostname)} to NO_PROXY.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** What may reach stdout from the server: a JSON-RPC 2.0 message, or a batch of them. Anything else would be read by the client as a protocol error. */
function isJsonRpc(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0 && value.every((item) => isRecord(item) && item.jsonrpc === "2.0");
  return isRecord(value) && value.jsonrpc === "2.0";
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/**
 * Ids of the requests in a message or batch: the ones that expect an answer (a method and an id; notifications have no id).
 * A batch is one level deep, so there is no recursion: an array inside a batch is not a message, and a line of nested
 * brackets cannot overflow the stack.
 */
function requestIds(message: unknown): JsonRpcId[] {
  return (Array.isArray(message) ? message : [message]).flatMap((item): JsonRpcId[] => {
    if (!isRecord(item) || typeof item.method !== "string") return [];
    const { id } = item;
    return typeof id === "string" || typeof id === "number" ? [id] : [];
  });
}

function errorResponse(id: JsonRpcId | null, code: number, message: string): Record<string, unknown> {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** Why a fetch failed: the cause's message, else (Node tries every address of a host, and an AggregateError has no message) the messages of its errors, else its code. */
function causeDetail(error: unknown): string {
  if (!(error instanceof Error) || !(error.cause instanceof Error)) return "";
  const { cause } = error;
  const inner = cause instanceof AggregateError ? [...new Set(cause.errors.map((item: unknown) => (item instanceof Error ? item.message : String(item))))].join("; ") : "";
  const code = "code" in cause && typeof cause.code === "string" ? cause.code : "";
  const detail = cause.message || inner || code;
  return detail ? `: ${detail}` : "";
}

/** The whole text of a failure, not yet clipped: the caller scrubs it first, so a clip can never cut a secret in two and leave half of it showing. */
function describe(error: unknown): string {
  return `${error instanceof Error ? error.message : String(error)}${causeDetail(error)}`;
}

const clip = (text: string): string => text.slice(0, MAX_ERROR_CHARS);

/** A redirect is refused on purpose (the key would go wherever it points), and "unexpected redirect" alone does not say what to do. */
function redirectHint(detail: string): string {
  return /redirect/i.test(detail)
    ? " (the server answered with a redirect, which the bridge never follows because the API key would go wherever it points: put the final URL in ALCHM_MCP_REMOTE_URL; check a trailing slash, http or https, and www)"
    : "";
}

/** The body as text, refusing (and cancelling the read) once it passes `limit` bytes. */
async function readBounded(response: Response, limit: number): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new Error(`the reply is larger than ${limit} bytes`);
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  for (let part = await reader.read(); !part.done; part = await reader.read()) {
    size += part.value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error(`the reply is larger than ${limit} bytes`);
    }
    text += decoder.decode(part.value, { stream: true });
  }
  return text + decoder.decode();
}

/** The JSON-RPC messages in a text/event-stream body: one per event, from its `data:` lines. */
export function parseSse(text: string): unknown[] {
  const messages: unknown[] = [];
  for (const event of text.split(/\r?\n\r?\n/)) {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).replace(/^ /, ""));
    const parsed = data.length ? parseJson(data.join("\n")) : { ok: false as const };
    if (parsed.ok) messages.push(parsed.value);
  }
  return messages;
}

function lineSplitter(onLine: (line: string) => void, limit: number, onOverflow: () => void) {
  let buffer = "";
  // buffer[0..scanned) holds no newline, so a new chunk is searched from there: a long line arriving in tiny writes would otherwise be rescanned from its start every time (quadratic).
  let scanned = 0;
  // True inside a line that already passed `limit`: the rest of it, up to its newline, is thrown away (one error per line, not per chunk).
  let skipping = false;
  return {
    push(chunk: string): void {
      let text = chunk;
      if (skipping) {
        const at = text.indexOf("\n");
        if (at < 0) return;
        skipping = false;
        text = text.slice(at + 1);
      }
      buffer += text;
      for (let at = buffer.indexOf("\n", scanned); at >= 0; at = buffer.indexOf("\n", scanned)) {
        const line = buffer.slice(0, at).replace(/\r$/, "");
        buffer = buffer.slice(at + 1);
        scanned = 0;
        if (line.trim()) onLine(line);
      }
      scanned = buffer.length;
      if (buffer.length > limit) {
        buffer = "";
        scanned = 0;
        skipping = true;
        onOverflow();
      }
    },
    end(): void {
      const rest = buffer.replace(/\r$/, "");
      buffer = "";
      scanned = 0;
      if (rest.trim()) onLine(rest);
    },
  };
}

export interface BridgeOptions extends BridgeConfig {
  input: Readable;
  output: Writable;
  errors: Writable;
  userAgent: string;
  timeoutMs?: number;
  maxReplyBytes?: number;
  fetchImpl?: typeof fetch;
  /** Abort to stop: in-flight requests are cancelled and nothing more is written. */
  signal?: AbortSignal;
}

class Bridge {
  private sessionId: string | null = null;
  private protocolVersion: string | null = null;
  private readonly pending = new Set<Promise<void>>();
  private readonly stopped = new AbortController();
  private active = 0;
  private readonly waiting: Array<() => void> = [];
  private readonly send: typeof fetch;
  private readonly target: string;
  /** What error text from the runtime must never show: the configured query string, the values in it, and the key. */
  private readonly secrets: string[];

  constructor(private readonly options: BridgeOptions) {
    this.send = options.fetchImpl ?? fetch;
    this.target = `${options.url.origin}${options.url.pathname}`;
    const queryValues = [...options.url.searchParams.values()].filter((value) => value.length >= 8);
    this.secrets = [options.url.search, ...queryValues, options.apiKey].filter(Boolean);
    options.signal?.addEventListener("abort", () => this.stop(), { once: true });
  }

  /** Cancel what is in flight and write nothing more. */
  stop(): void {
    this.stopped.abort();
  }

  /**
   * Text from the runtime about a failure, with the configured URL shortened to host and path and the secrets removed.
   * Bun quotes the whole URL, query string and all, in some fetch errors; Node does not.
   */
  private scrub(text: string): string {
    let clean = text.split(this.options.url.href).join(this.target);
    for (const secret of this.secrets) clean = clean.split(secret).join("***");
    return clean;
  }

  /** A line on stderr. Best effort: a stderr that has gone away must not fail the request that wanted to log. */
  report(text: string): void {
    try {
      this.options.errors.write(`alchm-mcp: ${this.scrub(text)}\n`);
    } catch {
      // stderr is gone as well: there is nobody left to tell
    }
  }

  private async acquire(): Promise<void> {
    if (this.active < MAX_IN_FLIGHT) {
      this.active += 1;
      return;
    }
    await new Promise<void>((turn) => this.waiting.push(turn)); // release() hands its slot over, so `active` stays counted
  }

  private release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.active -= 1;
  }

  submit(line: string): void {
    const task: Promise<void> = this.handle(line)
      .catch((error: unknown) => this.report(`internal error: ${clip(this.scrub(describe(error)))}`)) // whatever goes wrong in handle() must not become an unhandled rejection, which ends the process and every request in flight
      .finally(() => this.pending.delete(task));
    this.pending.add(task);
  }

  async drain(): Promise<void> {
    while (this.pending.size) await Promise.allSettled([...this.pending]);
  }

  reportOverflow(): void {
    this.write(errorResponse(null, -32600, "Message too long: no newline within the size limit"));
  }

  private write(message: unknown): void {
    if (!this.stopped.signal.aborted) this.options.output.write(`${JSON.stringify(message)}\n`);
  }

  private fail(ids: JsonRpcId[], code: number, message: string): void {
    for (const id of ids) this.write(errorResponse(id, code, message));
  }

  private async handle(line: string): Promise<void> {
    if (this.stopped.signal.aborted) return; // told to stop: nothing more is sent, and the key goes nowhere
    const parsed = parseJson(line);
    if (!parsed.ok) return this.write(errorResponse(null, -32700, "Parse error: the message is not valid JSON"));
    const ids = requestIds(parsed.value);
    if (Buffer.byteLength(line, "utf8") > MAX_MESSAGE_BYTES) {
      // A request is answered with its id; a notification has nobody to tell, so stderr is the only trace.
      if (!ids.length) this.report(`dropped a message over ${MAX_MESSAGE_BYTES / 1024} KB; the hosted endpoint refuses those`);
      return this.fail(ids, -32600, `Payload Too Large: maximum allowed MCP request body is ${MAX_MESSAGE_BYTES / 1024} KB`);
    }
    await this.acquire();
    try {
      if (this.stopped.signal.aborted) return; // told to stop while it waited for a slot
      for (const reply of await this.exchange(line, ids)) this.write(reply);
    } catch (error) {
      if (this.stopped.signal.aborted) return;
      const detail = clip(this.scrub(describe(error)));
      this.report(`request to ${this.target} failed: ${detail}${redirectHint(detail)}`);
      this.fail(ids, -32603, `Could not reach ${this.target}: ${detail}${redirectHint(detail)}`);
    } finally {
      this.release();
    }
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${this.options.apiKey}`,
      "user-agent": this.options.userAgent,
    };
    if (this.sessionId) headers["mcp-session-id"] = this.sessionId;
    if (this.protocolVersion) headers["mcp-protocol-version"] = this.protocolVersion;
    return headers;
  }

  private async exchange(line: string, ids: JsonRpcId[]): Promise<unknown[]> {
    const request = new AbortController();
    const timer = setTimeout(() => request.abort(new Error(`no answer within ${(this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS) / 1000} s`)), this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    timer.unref(); // the request in flight keeps the process alive; the clock must not
    const onStop = (): void => request.abort();
    this.stopped.signal.addEventListener("abort", onStop, { once: true });
    try {
      // redirect: "error" - the key is in the Authorization header, and a redirect is not something the hosted route does.
      const response = await this.send(this.options.url, { method: "POST", headers: this.headers(), body: line, signal: request.signal, redirect: "error" });
      this.learnSession(response);
      return this.messages(response, await readBounded(response, this.options.maxReplyBytes ?? MAX_REPLY_BYTES), ids);
    } finally {
      clearTimeout(timer);
      this.stopped.signal.removeEventListener("abort", onStop);
    }
  }

  private messages(response: Response, text: string, ids: JsonRpcId[]): unknown[] {
    const sse = (response.headers.get("content-type") ?? "").includes("text/event-stream");
    const body: unknown[] = !text.trim() ? [] : sse ? parseSse(text) : this.jsonBody(text);
    if (!response.ok) return this.httpFailure(response, body, ids);
    // A 200 from something that is not an MCP server (a wrong ALCHM_MCP_REMOTE_URL) must not reach the client as if it were one.
    const usable = body.filter(isJsonRpc);
    if (usable.length < body.length) this.report(`ignored ${body.length - usable.length} message(s) from ${this.target} that are not JSON-RPC 2.0`);
    if (!usable.length) return ids.length ? ids.map((id) => errorResponse(id, -32603, `The server answered ${response.status} with no JSON-RPC message`)) : [];
    this.learnProtocolVersion(usable);
    return usable;
  }

  private jsonBody(text: string): unknown[] {
    const parsed = parseJson(text);
    return parsed.ok ? [parsed.value] : [];
  }

  /** A non-2xx answer: keep a JSON-RPC error the server sent (re-addressed to the request, it cannot know the id), else describe the status. */
  private httpFailure(response: Response, body: unknown[], ids: JsonRpcId[]): unknown[] {
    const sent = body.find((message) => isRecord(message) && isRecord(message.error));
    const retry = response.headers.get("retry-after")?.trim();
    // Retry-After is a number of seconds or an HTTP date.
    const later = retry ? ` (${/^\d+$/.test(retry) ? `retry after ${retry} s` : `Retry-After: ${retry.slice(0, 40)}`})` : "";
    const fallback = this.scrub(`The server answered HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}${later}`);
    if (!ids.length) {
      this.report(fallback);
      return [];
    }
    if (isRecord(sent) && isRecord(sent.error)) {
      const { code, message } = sent.error;
      return ids.map((id) => errorResponse(id, typeof code === "number" ? code : -32603, typeof message === "string" ? message : fallback));
    }
    return ids.map((id) => errorResponse(id, -32603, fallback));
  }

  private learnSession(response: Response): void {
    const session = response.headers.get("mcp-session-id");
    if (session === null) return;
    // It goes into a header of every later request: a value that cannot be a header would make all of them fail.
    if (SESSION_PATTERN.test(session)) this.sessionId = session;
    else this.report(`ignored an mcp-session-id from ${this.target} that is not a session id`);
  }

  private learnProtocolVersion(body: unknown[]): void {
    for (const message of body.flat()) {
      if (isRecord(message) && isRecord(message.result) && typeof message.result.protocolVersion === "string") {
        const { protocolVersion } = message.result;
        if (VERSION_PATTERN.test(protocolVersion)) this.protocolVersion = protocolVersion;
        else this.report(`ignored a protocolVersion from ${this.target} that is not a version string`);
      }
    }
  }
}

/** Forward every JSON-RPC line on `input` to the hosted endpoint; resolves when input has ended and every reply is written. */
export function runRemoteBridge(options: BridgeOptions): Promise<void> {
  if (options.signal?.aborted) return Promise.resolve(); // told to stop before it began: read nothing, send nothing
  const bridge = new Bridge(options);
  return new Promise((resolve) => {
    const lines = lineSplitter((line) => bridge.submit(line), 4 * MAX_MESSAGE_BYTES, () => bridge.reportOverflow());
    const finish = (): void => {
      lines.end();
      void bridge.drain().then(resolve);
    };
    // Diagnostics are best effort: a stderr that has gone away must not take the bridge down with an unhandled 'error' event.
    options.errors.on("error", () => undefined);
    // The client hung up its end of stdout (EPIPE): nothing more can be delivered, so stop what is in flight and end.
    options.output.on("error", (error: Error) => {
      bridge.report(`stdout is closed (${clip(describe(error))}); stopping`);
      bridge.stop();
      resolve();
    });
    options.input.setEncoding("utf8");
    options.input.on("data", (chunk: string) => lines.push(chunk));
    options.input.once("end", finish);
    options.input.once("error", finish);
    options.signal?.addEventListener("abort", () => resolve(), { once: true });
  });
}

/** What `index.ts` runs in bridge mode: validates the environment, tells stderr which mode this is, and bridges stdio. */
export async function runBridgeProcess(proc: { env: Env; stdin: Readable; stdout: Writable; stderr: Writable }, userAgent: string, signal?: AbortSignal): Promise<number> {
  let config: BridgeConfig;
  let setting: ModeSetting;
  try {
    setting = modeSetting(proc.env);
    config = resolveBridgeConfig(proc.env);
  } catch (error) {
    proc.stderr.write(`alchm-mcp: ${clip(describe(error))}\n`);
    return 1;
  }
  proc.stderr.write(`Alchm.kitchen MCP: remote bridge to ${config.url.origin}${config.url.pathname} (API key read from the environment, not shown)\n`);
  if (proc.env.DATABASE_URL && setting === "remote") {
    proc.stderr.write("alchm-mcp: ALCHM_MCP_MODE=remote, so DATABASE_URL is not used\n");
  }
  const warning = proxyWarning(proc.env, config.url);
  if (warning) proc.stderr.write(`alchm-mcp: warning: ${warning}\n`);
  await runRemoteBridge({ ...config, input: proc.stdin, output: proc.stdout, errors: proc.stderr, userAgent, ...(signal ? { signal } : {}) });
  return 0;
}

/** The part of `process` that `runBridgeMain` uses. */
export interface BridgeMainProcess {
  env: Env;
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
  on(event: "SIGINT" | "SIGTERM", listener: () => void): unknown;
  exit(code?: number): unknown;
}

/**
 * What `index.ts` runs in bridge mode: `runBridgeProcess`, plus how the process ends. The first SIGINT or SIGTERM stops what
 * is in flight. One that comes after the bridge has finished (its replies still draining to a client that is not reading)
 * ends the process at once, instead of being swallowed. At the end of input it does not call exit() itself: that drops
 * whatever stdout has not written yet (Bun cuts a reply of more than one pipe buffer, 64 KiB, when stdin closes right after
 * the request). It stops reading stdin and returns the exit code, so the event loop empties on its own once stdout is
 * flushed; the timer is only a net for something else keeping the loop alive, and does not keep it alive itself.
 */
export async function runBridgeMain(proc: BridgeMainProcess, userAgent: string, graceMs: number = FINISH_GRACE_MS): Promise<number> {
  const stop = new AbortController();
  let finished = false;
  const onSignal = (): void => {
    if (finished) proc.exit(0);
    else stop.abort();
  };
  proc.on("SIGINT", onSignal);
  proc.on("SIGTERM", onSignal);
  const code = await runBridgeProcess(proc, userAgent, stop.signal);
  finished = true;
  proc.stdin.pause();
  setTimeout(() => proc.exit(code), graceMs).unref();
  return code;
}
