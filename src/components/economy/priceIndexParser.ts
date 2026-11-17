/**
 * Wire parser for GET /api/economy/price-index, consumed by LivePriceTicker.
 *
 * Producer contract, read from every return path of
 * `src/app/api/economy/price-index/route.ts`:
 * - 200 (route.ts:113-130): `{ success: true, live: true, generatedAt,
 *   ...PriceIndexSnapshot, railsUsd, supply }`, CDN-cached (route.ts:127).
 *   - The snapshot spread is `buildPriceIndexSnapshot`'s return
 *     (`src/lib/economy/priceIndex.ts:467-484`, reached through
 *     `getLivePriceIndexSnapshot`, priceIndex.ts:513-522). Every field the
 *     ticker reads is unconditional there, including `degraded`
 *     (`string[] | null`, priceIndex.ts:477) and `basis` (priceIndex.ts:478).
 *   - `railsUsd` is `getUsdRails()` (`src/lib/economy/usdRails.ts:34-54`): both
 *     rates are always present and are `number | null`.
 *   - `supply` is attached to every CURRENT response (route.ts:106-120), with
 *     `live: false` and zeros when the DB or Redis is down (route.ts:37-43,
 *     84-86, 110). The route is CDN-cached with stale-while-revalidate
 *     (route.ts:127), so a payload cached from before `supply` existed has no
 *     `supply` key. The wire type declares it required; that is the lie
 *     `LiveTickerPayload` corrects, and why `supply` is optional below.
 * - 503 (route.ts:96-103): `{ success: false, live: false, message }`,
 *   `Cache-Control: no-store`, never any quote values.
 *
 * Only what LivePriceTicker reads is validated. Rows that cannot be read are
 * dropped, and a quote list whose every row was unreadable throws, so drift
 * never reads as "no quotes". Numbers must be finite: `1e999` parses to
 * `Infinity`, and `NaN` crosses the wire as `null`, so neither may reach
 * `toFixed` unchallenged.
 *
 * Client-safe: server types come in through `import type`, and the only
 * runtime imports are `isJsonRecord` and the already-shipped token list.
 */

import { isJsonRecord } from "@/lib/api/json";
import type {
  EsmsSupplyBlock,
  PriceIndexApiPayload,
  TokenIndexQuote,
} from "@/lib/economy/priceIndex";
import { TOKEN_VISUALS } from "@/lib/economy/tokenVisual";
import type { UsdRails } from "@/lib/economy/usdRails";

type CoinAmounts = Pick<EsmsSupplyBlock, "spirit" | "essence" | "matter" | "substance">;

/** The ledger-supply block as the ticker reads it: amounts exist only when live. */
export type LiveTickerSupply = { live: false } | ({ live: true } & CoinAmounts);

/**
 * Exactly the fields LivePriceTicker reads, derived from the server's wire type
 * so renaming one server-side fails `tsc` here, not at render time.
 */
export interface LiveTickerPayload
  extends Pick<
    PriceIndexApiPayload,
    | "aNumber" | "multiplier" | "isDiurnal" | "sunSign" | "dominantElement"
    | "tokens" | "compositeIndex" | "composite24hPct" | "degraded"
  > {
  basis: Pick<PriceIndexApiPayload["basis"], "model" | "engine">;
  railsUsd: Pick<UsdRails, "mintPerTokenUsd" | "redeemPerTokenUsd">;
  /** Absent on a payload cached from before supply existed, or when unreadable. */
  supply?: LiveTickerSupply;
}

export interface PriceIndexResponse {
  /** Non-null only for a `success: true, live: true` body that passed every check. */
  payload: LiveTickerPayload | null;
  /** The refusal's own `message`, when it carried a string one (the 503 body does). */
  message: string | null;
  /** Partial-drift diagnostics when a live payload dropped unreadable quote rows or supply. */
  issues: string[];
}

function invalid(detail: string): Error {
  return new Error(`Invalid price-index response: ${detail}`);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRate(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function readNumber(record: Record<string, unknown>, field: string): number {
  const { [field]: value } = record;
  if (!isFiniteNumber(value)) throw invalid(`${field} must be a finite number`);
  return value;
}

function readString(record: Record<string, unknown>, field: string): string {
  const { [field]: value } = record;
  if (!isString(value)) throw invalid(`${field} must be a string`);
  return value;
}

function readBoolean(record: Record<string, unknown>, field: string): boolean {
  const { [field]: value } = record;
  if (typeof value !== "boolean") throw invalid(`${field} must be a boolean`);
  return value;
}

/** Every element must satisfy `keep`; one bad element makes the whole list unreadable. */
function parseList<T>(raw: unknown, keep: (item: unknown) => item is T): T[] | null {
  if (!Array.isArray(raw)) return null;
  const items: readonly unknown[] = raw;
  const out: T[] = [];
  for (const item of items) {
    if (!keep(item)) return null;
    out.push(item);
  }
  return out;
}

function parseTokenType(value: unknown): TokenIndexQuote["token"] | null {
  const visual = TOKEN_VISUALS.find((candidate) => candidate.token === value);
  return visual === undefined ? null : visual.token;
}

function parseQuote(row: unknown): TokenIndexQuote | null {
  if (!isJsonRecord(row)) return null;
  const { token, index, change24hPct, weight, sparkline } = row;
  const tokenType = parseTokenType(token);
  const points = parseList(sparkline, isFiniteNumber);
  if (
    tokenType === null ||
    points === null ||
    !isFiniteNumber(index) ||
    !isFiniteNumber(change24hPct) ||
    !isFiniteNumber(weight)
  ) {
    return null;
  }
  return { token: tokenType, index, change24hPct, weight, sparkline: points };
}

function parseTokens(raw: unknown, issues: string[]): TokenIndexQuote[] {
  if (!Array.isArray(raw)) throw invalid("tokens must be an array");
  const rows: readonly unknown[] = raw;
  const quotes: TokenIndexQuote[] = [];
  for (const row of rows) {
    const quote = parseQuote(row);
    if (quote !== null) quotes.push(quote);
  }
  if (rows.length > 0 && quotes.length === 0) {
    throw invalid("tokens arrived but no row was a readable quote");
  }
  const dropped = rows.length - quotes.length;
  if (dropped > 0) issues.push(`tokens: dropped ${dropped} unreadable quote row(s)`);
  return quotes;
}

function parseDegraded(raw: unknown): string[] | null {
  if (raw === null) return null;
  const reasons = parseList(raw, isString);
  if (reasons === null) throw invalid("degraded must be a string array or null");
  return reasons;
}

function parseBasis(raw: unknown): LiveTickerPayload["basis"] {
  if (!isJsonRecord(raw)) throw invalid("basis must be an object");
  const { model, engine } = raw;
  if (!isString(model) || !isString(engine)) {
    throw invalid("basis.model and basis.engine must be strings");
  }
  return { model, engine };
}

function parseRails(raw: unknown): LiveTickerPayload["railsUsd"] {
  if (!isJsonRecord(raw)) throw invalid("railsUsd must be an object");
  const { mintPerTokenUsd, redeemPerTokenUsd } = raw;
  if (!isRate(mintPerTokenUsd) || !isRate(redeemPerTokenUsd)) {
    throw invalid("railsUsd rates must each be a finite number or null");
  }
  return { mintPerTokenUsd, redeemPerTokenUsd };
}

/**
 * `null` means "no usable supply block", which the ticker renders as absence
 * (no ledger line), exactly as it does for a payload that never had one. A
 * block that claims `live: true` with an unreadable amount is dropped rather
 * than rendered as `NaN`.
 */
function parseSupply(raw: unknown): LiveTickerSupply | null {
  if (!isJsonRecord(raw)) return null;
  const { live, spirit, essence, matter, substance } = raw;
  if (live === false) return { live: false };
  if (live !== true) return null;
  if (
    !isFiniteNumber(spirit) ||
    !isFiniteNumber(essence) ||
    !isFiniteNumber(matter) ||
    !isFiniteNumber(substance)
  ) {
    return null;
  }
  return { live: true, spirit, essence, matter, substance };
}

function parseLivePayload(body: Record<string, unknown>, issues: string[]): LiveTickerPayload {
  const { tokens, degraded, basis, railsUsd, supply: rawSupply } = body;
  const payload: LiveTickerPayload = {
    aNumber: readNumber(body, "aNumber"),
    multiplier: readNumber(body, "multiplier"),
    isDiurnal: readBoolean(body, "isDiurnal"),
    sunSign: readString(body, "sunSign"),
    dominantElement: readString(body, "dominantElement"),
    tokens: parseTokens(tokens, issues),
    compositeIndex: readNumber(body, "compositeIndex"),
    composite24hPct: readNumber(body, "composite24hPct"),
    degraded: parseDegraded(degraded),
    basis: parseBasis(basis),
    railsUsd: parseRails(railsUsd),
  };
  const supply = parseSupply(rawSupply);
  if (supply !== null) payload.supply = supply;
  else if (rawSupply !== undefined) issues.push("supply: malformed supply block dropped");
  return payload;
}

/**
 * `parse` for `readJson` in LivePriceTicker's poll(). A `success: true,
 * live: true` body is validated in full and returned as `payload`; any other
 * object (the 503 refusal, or a body that is simply not a quote) comes back
 * with `payload: null` so the caller keeps its HTTP-status fallback. Anything
 * that is not a JSON object, or a live body that does not hold up, throws and
 * takes the caller's existing "Network unreachable" path.
 */
export function parsePriceIndexResponse(value: unknown): PriceIndexResponse {
  if (!isJsonRecord(value)) throw invalid("expected a JSON object");
  if (value.success !== true || value.live !== true) {
    const { message } = value;
    return { payload: null, message: isString(message) ? message : null, issues: [] };
  }
  const issues: string[] = [];
  return { payload: parseLivePayload(value, issues), message: null, issues };
}
