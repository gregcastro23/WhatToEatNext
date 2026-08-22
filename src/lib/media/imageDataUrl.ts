/**
 * One parser for `data:image/...;base64,...` URLs.
 *
 * ## Why this exists
 *
 * `[MEASURED 2026-08-22]` the same regex was copy-pasted into five places:
 *
 *   src/lib/profile/avatarStorage.ts   storeAvatar
 *   src/lib/feed/cookPhotoStorage.ts   storeCookPhoto, storeTablePhoto, storeChatPhoto
 *   src/lib/chat/enforcement.ts        checkPhotoDataUrl
 *
 * and every copy ended in `([A-Za-z0-9+/=]+)$`. On the Linux CI runner that
 * threw
 *
 *     RangeError: Maximum call stack size exceeded
 *         at RegExp.exec
 *
 * for an oversized upload: the cap is 5 MB everywhere, and 5 MB is ~6.99 MB of
 * base64, which is enough greedy backtracking to exhaust the regex stack. It
 * does not reproduce on macOS at any stack size, which is how five copies of it
 * stayed green locally.
 *
 * The throw is worse than a rejection. Every caller is written to return
 * `null`/`false` for a malformed or oversized payload so the route can answer a
 * clean client error; a `RangeError` escaping instead surfaces as a 500. So a
 * large enough image was a way to make an upload route throw.
 *
 * ## Why it is not a length pre-check
 *
 * Because that cannot work. `MAX_BYTES` and `MAX_BYTES + 1` encode to the SAME
 * base64 length — 6990508 characters either way — so size is undecidable
 * before decoding, and a pre-check placed before the regex would never fire.
 * That was measured, not assumed.
 *
 * ## What it does instead
 *
 * Anchored fixed-width header match, then a search for the first INVALID
 * character. A negated class with no quantifier has no backtrack stack to
 * exhaust and scans linearly, so the input size stops mattering.
 *
 * Semantics are byte-for-byte those of the regex it replaces: header, then at
 * least one base64 character, and nothing that is not a base64 character
 * through to the end. Pinned by src/lib/media/__tests__/imageDataUrl.test.ts,
 * which differential-tests it against the original pattern.
 */

/** The header this accepts, and the only one. Mirrors the five originals. */
const IMAGE_DATA_URL_HEADER = /^data:(image\/(?:jpeg|png|webp));base64,/;

/** Any character that is not base64. No quantifier — see the note above. */
const NON_BASE64 = /[^A-Za-z0-9+/=]/;

export interface ParsedImageDataUrl {
  /** e.g. `image/png` — the full media type, as the callers key their extension maps on. */
  readonly mime: string;
  /** The base64 payload, header stripped. Never empty. */
  readonly b64: string;
}

/**
 * Parse and validate an image data URL.
 *
 * Returns `null` for anything that is not `data:image/{jpeg,png,webp};base64,`
 * followed by a non-empty run of base64 characters. Does NOT decode, and does
 * NOT enforce a size cap — callers differ on the cap and on whether they can
 * afford to decode, so that stays with them.
 */
export function parseImageDataUrl(dataUrl: string): ParsedImageDataUrl | null {
  const header = IMAGE_DATA_URL_HEADER.exec(dataUrl);
  if (!header) return null;

  const b64 = dataUrl.slice(header[0].length);
  if (b64.length === 0 || NON_BASE64.test(b64)) return null;

  return { mime: header[1], b64 };
}
