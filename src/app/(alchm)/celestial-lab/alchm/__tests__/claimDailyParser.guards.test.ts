/**
 * Companion to claimDailyParser.test.ts (kept apart because that file sits near the
 * line ceiling). It pins the finite-number guard on EACH yield field the page reads
 * (the four distribution values and streakCount) against each wire value that is not
 * a finite number, one case per field x value. A 200 body means the server has already
 * minted the tokens, so a bad yield must parse to `{ success, message }` with no
 * `yield`, and the parser must never throw. Every rejection is paired with a control:
 * the identical body with that one field valid keeps the full yield.
 *
 * Bodies are JSON TEXT run through JSON.parse, so `1e999` / `-1e999` become real
 * Infinity / -Infinity (JSON.stringify would have turned them into null).
 */
import { parseClaimDailyResponse } from "../claimDailyParser";

type Outcome = ReturnType<typeof parseClaimDailyResponse>;

const MESSAGE = "Cosmic Yield collected!";
interface YieldNumbers {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  streakCount: number;
}
const NUMBERS: YieldNumbers = { spirit: 3.4, essence: 2.9, matter: 3.1, substance: 3.1, streakCount: 4 };
const FIELDS: Array<keyof YieldNumbers> = ["spirit", "essence", "matter", "substance", "streakCount"];
/** [label, JSON literal]: the values that are not finite numbers. */
const BAD_LITERALS: Array<[string, string]> = [
  ["null", "null"],
  ["the string \"7\"", "\"7\""],
  ["true", "true"],
  ["1e999 (Infinity)", "1e999"],
  ["-1e999 (-Infinity)", "-1e999"],
];
const CASES: Array<[string, string, string]> = FIELDS.flatMap((field) =>
  BAD_LITERALS.map((bad): [string, string, string] => [field, bad[0], bad[1]]),
);

/** The success body (route.ts:117-121) as JSON text, with one field's JSON literal replaced. */
function bodyText(field: string, literal: string): string {
  const text: Record<string, string> = {};
  for (const key of FIELDS) text[key] = field === key ? literal : String(NUMBERS[key]);
  return (
    `{"success":true,"message":"${MESSAGE}","yield":{"distribution":{"spirit":${text.spirit},` +
    `"essence":${text.essence},"matter":${text.matter},"substance":${text.substance}},` +
    `"streakCount":${text.streakCount}}}`
  );
}

function parseText(text: string): Outcome {
  const wire: unknown = JSON.parse(text);
  return parseClaimDailyResponse(wire);
}

/** The outcome for a body whose only change is `field` set to the finite `value`. */
function keptWith(field: string, value: number): Outcome {
  const numbers = { ...NUMBERS, [field]: value };
  return {
    success: true,
    message: MESSAGE,
    yield: {
      distribution: {
        spirit: numbers.spirit,
        essence: numbers.essence,
        matter: numbers.matter,
        substance: numbers.substance,
      },
      streakCount: numbers.streakCount,
    },
  };
}

describe("parseClaimDailyResponse: the 1e999 fixtures are real", (): void => {
  it("JSON.parse turns 1e999 and -1e999 text into real infinities", (): void => {
    const parsed: unknown = JSON.parse("[1e999,-1e999]");
    expect(parsed).toEqual([Infinity, -Infinity]);
    expect(JSON.stringify(parsed)).toBe("[null,null]");
  });

  it("builds the all-valid body that is the control for every case below", (): void => {
    expect(parseText(bodyText("none", "0"))).toEqual(keptWith("none", 0));
    expect(keptWith("none", 0).yield?.streakCount).toBe(4);
  });
});

describe("parseClaimDailyResponse: a non-finite yield field drops the yield, never throws", (): void => {
  it.each(CASES)("%s = %s: parses to { success, message } with no yield", (field, _label, literal): void => {
    const out = parseText(bodyText(field, literal));
    expect(out).toStrictEqual({ success: true, message: MESSAGE });
  });

  it.each(FIELDS)("%s: the same body with a valid value keeps the full yield (the control)", (field): void => {
    expect(parseText(bodyText(field, "1.5"))).toStrictEqual(keptWith(field, 1.5));
  });

  it.each(FIELDS)("%s: zero is a number, not absence, so a zero value keeps the yield", (field): void => {
    expect(parseText(bodyText(field, "0"))).toStrictEqual(keptWith(field, 0));
  });
});
