/**
 * Stdio-to-hosted bridge for the npm package.
 *
 * `@alchm/mcp-server` runs the tools in-process. An API key is checked against the operator's database
 * (`DATABASE_URL`), which an external user does not have, so a key with no database makes every tool answer
 * "API key authentication failed or is unavailable" (src/lib/mcp/auth.ts: explicit credentials never fall back to
 * anonymous access). The hosted endpoint, https://alchm.kitchen/api/mcp, validates the same keys. So when the process has
 * a key and no `DATABASE_URL`, it forwards each JSON-RPC message there instead of running the tools itself.
 *
 *   key and DATABASE_URL: in-process, operator mode (unchanged)
 *   no key:               in-process, anonymous demo mode (unchanged)
 *   key, no DATABASE_URL: this bridge
 *
 * The hosted route is stateless Streamable HTTP: POST one message (or a batch), get one JSON reply (an SSE reply is
 * accepted too), 202 with no body for a notification. stdout carries only JSON-RPC 2.0 lines (a reply that is not one is
 * dropped, with a note on stderr); everything else goes to stderr. The key is never written anywhere but the Authorization
 * header, and redirects are refused so it cannot be re-sent to another host.
 */
import type { Readable, Writable } from "node:stream";

export const DEFAULT_REMOTE_URL = "https://alchm.kitchen/api/mcp";
/** The hosted route refuses a request body over 256 KB (413). */
export const MAX_MESSAGE_BYTES = 256 * 1024;
/** The hosted route's maxDuration is 60 s. */
export const DEFAULT_TIMEOUT_MS = 65_000;
/** A reply bigger than this is refused rather than held in memory (a misconfigured ALCHM_MCP_REMOTE_URL is the only way to get one). */
export const MAX_REPLY_BYTES = 16 * 1024 * 1024;
/** What the route's bearer parser accepts; anything else would be silently read as "no key". */
const KEY_PATTERN = /^[A-Za-z0-9_.~-]+$/;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

type Env = Record<string, string | undefined>;
type JsonRpcId = string | number;

export type Mode = "bridge" | "in-process";

export class BridgeConfigError extends Error {}

/** The key the in-process server would use (same variables and order as src/lib/mcp/auth.ts). */
export function readApiKey(env: Env): string | null {
  return env.MCP_USER_API_KEY || env.ALCHM_MCP_USER_API_KEY || null;
}

export function selectMode(env: Env): Mode {
  return readApiKey(env) && !env.DATABASE_URL ? "bridge" : "in-process";
}

export interface BridgeConfig {
  url: URL;
  apiKey: string;
}

export function resolveBridgeConfig(env: Env): BridgeConfig {
  const rawKey = readApiKey(env)?.trim() ?? "";
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

/** Ids of the requests in a message or batch: the ones that expect an answer (a method and an id; notifications have no id). */
function requestIds(message: unknown): JsonRpcId[] {
  if (Array.isArray(message)) return message.flatMap(requestIds);
  if (!isRecord(message) || typeof message.method !== "string") return [];
  const { id } = message;
  return typeof id === "string" || typeof id === "number" ? [id] : [];
}

function errorResponse(id: JsonRpcId | null, code: number, message: string): Record<string, unknown> {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return `${message}${cause}`.slice(0, 300);
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
      for (let at = buffer.indexOf("\n"); at >= 0; at = buffer.indexOf("\n")) {
        const line = buffer.slice(0, at).replace(/\r$/, "");
        buffer = buffer.slice(at + 1);
        if (line.trim()) onLine(line);
      }
      if (buffer.length > limit) {
        buffer = "";
        skipping = true;
        onOverflow();
      }
    },
    end(): void {
      const rest = buffer.replace(/\r$/, "");
      buffer = "";
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
  private readonly send: typeof fetch;
  private readonly target: string;

  constructor(private readonly options: BridgeOptions) {
    this.send = options.fetchImpl ?? fetch;
    this.target = `${options.url.origin}${options.url.pathname}`;
    options.signal?.addEventListener("abort", () => this.stopped.abort(), { once: true });
  }

  submit(line: string): void {
    const task: Promise<void> = this.handle(line).finally(() => this.pending.delete(task));
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
      if (!ids.length) this.options.errors.write(`alchm-mcp: dropped a message over ${MAX_MESSAGE_BYTES / 1024} KB; the hosted endpoint refuses those\n`);
      return this.fail(ids, -32600, `Payload Too Large: maximum allowed MCP request body is ${MAX_MESSAGE_BYTES / 1024} KB`);
    }
    try {
      for (const reply of await this.exchange(line, ids)) this.write(reply);
    } catch (error) {
      if (this.stopped.signal.aborted) return;
      this.options.errors.write(`alchm-mcp: request to ${this.target} failed: ${describe(error)}\n`);
      this.fail(ids, -32603, `Could not reach ${this.target}: ${describe(error)}`);
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
    const onStop = (): void => request.abort();
    this.stopped.signal.addEventListener("abort", onStop, { once: true });
    try {
      // redirect: "error" - the key is in the Authorization header, and a redirect is not something the hosted route does.
      const response = await this.send(this.options.url, { method: "POST", headers: this.headers(), body: line, signal: request.signal, redirect: "error" });
      this.sessionId = response.headers.get("mcp-session-id") ?? this.sessionId;
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
    if (usable.length < body.length) this.options.errors.write(`alchm-mcp: ignored ${body.length - usable.length} message(s) from ${this.target} that are not JSON-RPC 2.0\n`);
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
    const retry = response.headers.get("retry-after");
    const fallback = `The server answered HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}${retry ? ` (retry after ${retry} s)` : ""}`;
    if (!ids.length) {
      this.options.errors.write(`alchm-mcp: ${fallback}\n`);
      return [];
    }
    if (isRecord(sent) && isRecord(sent.error)) {
      const { code, message } = sent.error;
      return ids.map((id) => errorResponse(id, typeof code === "number" ? code : -32603, typeof message === "string" ? message : fallback));
    }
    return ids.map((id) => errorResponse(id, -32603, fallback));
  }

  private learnProtocolVersion(body: unknown[]): void {
    for (const message of body.flat()) {
      if (isRecord(message) && isRecord(message.result) && typeof message.result.protocolVersion === "string") {
        this.protocolVersion = message.result.protocolVersion;
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
  try {
    config = resolveBridgeConfig(proc.env);
  } catch (error) {
    proc.stderr.write(`alchm-mcp: ${describe(error)}\n`);
    return 1;
  }
  proc.stderr.write(`Alchm.kitchen MCP: remote bridge to ${config.url.origin}${config.url.pathname} (API key read from the environment, not shown)\n`);
  await runRemoteBridge({ ...config, input: proc.stdin, output: proc.stdout, errors: proc.stderr, userAgent, ...(signal ? { signal } : {}) });
  return 0;
}
