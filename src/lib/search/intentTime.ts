/**
 * A time in a query: "quick", "under 30 min", "30-minute", "in 20 minutes",
 * "under an hour", "2 hrs". The result is a ceiling on prep plus cook.
 */
import { HOUR_WORDS, MINUTE_WORDS, QUICK_MINUTES, QUICK_PHRASES, TIME_LEADS } from "./intentLexicon";
import { stemToken } from "./text";

export interface TimeIntent {
  /** Prep plus cook, at most. */
  minutes: number;
  /** Asked as "quick", which is the named rule QUICK_MINUTES. */
  quick: boolean;
}

/** A day of cooking; a larger number is not a time someone asks for. */
const MAX_MINUTES = 24 * 60;
const JOINED = /^(\d{1,4})(mins?|minutes?|hrs?|hours?)$/;

function phraseStems(phrase: string): string[] {
  return phrase.split(" ").map(stemToken);
}

const QUICK = QUICK_PHRASES.map(phraseStems);
const LEADS = TIME_LEADS.map(phraseStems);

function startsWith(stems: readonly string[], at: number, words: readonly string[]): boolean {
  return words.every((word, i) => stems[at + i] === word);
}

/** Length of the lead phrase at `at` ("under", "less than"), or 0. */
function leadLength(stems: readonly string[], at: number): number {
  return LEADS.reduce((best, words) => (startsWith(stems, at, words) && words.length > best ? words.length : best), 0);
}

function unitMinutes(word: string | undefined): number | null {
  if (word === undefined) return null;
  if (MINUTE_WORDS.includes(word)) return 1;
  return HOUR_WORDS.includes(word) ? 60 : null;
}

function bounded(minutes: number): number | null {
  return minutes > 0 && minutes <= MAX_MINUTES ? minutes : null;
}

/** "30 min", "30min", "an hour" at `at`: minutes and words used. */
function amountAt(tokens: readonly string[], at: number): { minutes: number; length: number } | null {
  const word = tokens[at] ?? "";
  const joined = JOINED.exec(word);
  if (joined) {
    const minutes = bounded(Number(joined[1]) * (unitMinutes(joined[2]) ?? 0));
    return minutes === null ? null : { minutes, length: 1 };
  }
  const count = /^\d{1,4}$/.test(word) ? Number(word) : word === "an" || word === "a" ? 1 : null;
  const unit = unitMinutes(tokens[at + 1]);
  if (count === null || unit === null || (count === 1 && unit === 1 && !/^\d/.test(word))) return null;
  const minutes = bounded(count * unit);
  return minutes === null ? null : { minutes, length: 2 };
}

/** The time phrase starting at `at`, with how many tokens it used. */
export function timeAt(tokens: readonly string[], stems: readonly string[], at: number): { length: number; intent: TimeIntent } | null {
  const quick = QUICK.reduce((best, words) => (startsWith(stems, at, words) && words.length > best ? words.length : best), 0);
  if (quick > 0) return { length: quick, intent: { minutes: QUICK_MINUTES, quick: true } };
  const lead = leadLength(stems, at);
  const amount = amountAt(tokens, at + lead);
  return amount ? { length: lead + amount.length, intent: { minutes: amount.minutes, quick: false } } : null;
}
