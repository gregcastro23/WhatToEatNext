/**
 * Keeps RPC credentials out of everything an admin client or a log can read.
 *
 * RPC providers put the API key INSIDE the URL: Alchemy and Infura in the path
 * (`/v2/<key>`), Helius and others in the query (`?api-key=<key>`), some in the
 * userinfo (`user:pass@`). The origin (scheme + host + port) is the only part
 * of an RPC URL that is not a credential, so it is the only part that is ever
 * shown. It is also all the admin page needs: it says WHICH endpoint was read,
 * not how to authenticate to it.
 *
 * Server-only.
 *
 * @file src/services/admin/rpcRedaction.ts
 */

const UNREADABLE = "(unreadable RPC URL)";
const REDACTED = "[redacted]";

/**
 * URL pieces shorter than this are not treated as credentials. A credential of
 * fewer than four characters would be guessable in one request, and shorter
 * pieces (`v2`, `rpc`) are path labels whose replacement would mangle unrelated
 * text such as an HTTP status code.
 */
const MIN_CREDENTIAL_LENGTH = 4;

/** Any absolute http(s) URL, wherever it appears in a message. */
const ANY_URL = /\bhttps?:\/\/[^\s"'<>]+/gi;

/** `scheme://host[:port]` of `url`, or a fixed placeholder when it does not parse. */
export function rpcOrigin(url: string): string {
  try {
    const { origin } = new URL(url);
    return origin === "null" ? UNREADABLE : origin;
  } catch {
    return UNREADABLE;
  }
}

/** Every piece of `url` that can carry a credential: userinfo, path segments, query values. */
function credentialParts(url: string): string[] {
  try {
    const parsed = new URL(url);
    const parts = [parsed.username, parsed.password, ...parsed.pathname.split("/")];
    parsed.searchParams.forEach((value) => parts.push(value));
    return parts.filter((part) => part.length >= MIN_CREDENTIAL_LENGTH);
  } catch {
    return [];
  }
}

/**
 * `message` with every trace of the given RPC URLs removed.
 *
 * `fetch` echoes its input in some failures ("Failed to parse URL from <url>"),
 * and providers echo URLs in JSON-RPC errors, so a raw `err.message` can carry
 * the key. Three passes: the configured URLs as written (this also catches one
 * that does not parse), their individual credential pieces, and finally any
 * other http(s) URL, cut down to its origin.
 */
export function redactRpcMessage(message: string, rpcUrls: readonly string[]): string {
  let text = message;
  for (const url of rpcUrls) {
    if (url === "") continue;
    text = text.split(url).join(rpcOrigin(url));
    for (const part of credentialParts(url)) text = text.split(part).join(REDACTED);
  }
  return text.replace(ANY_URL, (found) => rpcOrigin(found));
}
