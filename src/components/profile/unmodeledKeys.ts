/**
 * Pass-through for the public profile parsers.
 *
 * The owner's "Export JSON" (blocks/DataPrivacyBlock.tsx) downloads
 * `JSON.stringify(data)` of the page's profile state, and every registered block
 * receives that whole state. A parser that returned only the fields the page READS
 * would silently shrink the download. So each parser carries the keys it does not
 * model through untouched and lays its validated fields over them.
 */

/**
 * The entries of `raw` whose keys the parser does NOT model, as own data properties
 * (Object.fromEntries defines them, so even a literal "__proto__" key survives).
 * A modeled key is never copied raw: when its value is malformed the parser omits
 * the key, and the malformed value must not come back through here.
 */
export function unmodeledEntries(raw: Record<string, unknown>, modeled: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(raw).filter(([key]) => !modeled.includes(key)));
}
