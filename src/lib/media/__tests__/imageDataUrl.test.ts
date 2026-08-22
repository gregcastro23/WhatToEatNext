/**
 * @jest-environment node
 *
 * The parser replaced five copies of one regex, so the thing worth testing is
 * not "does it accept a PNG" — it is "does it accept and reject EXACTLY what
 * the regex did". A behavioural difference here would silently change what five
 * upload paths let through.
 *
 * So the suite is differential: the original pattern is written out once, below,
 * and every case asserts the two agree. It is the only copy of that regex left
 * in the repo, and it is deliberately in a test rather than in shipping code.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { parseImageDataUrl } from "@/lib/media/imageDataUrl";

/** Verbatim from src/lib/profile/avatarStorage.ts before 2026-08-22. */
function original(dataUrl: string): { mime: string; b64: string } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
    dataUrl,
  );
  if (!match) return null;
  return { mime: match[1], b64: match[2] };
}

const CASES: string[] = [
  // accepted
  "data:image/png;base64,iVBORw0KGgo=",
  "data:image/jpeg;base64,/9j/4AAQ",
  "data:image/webp;base64,UklGRg==",
  "data:image/png;base64,YQ==YQ==",
  "data:image/png;base64,A",
  // rejected — wrong shape
  "https://evil.example/pic.png",
  "data:image/gif;base64,R0lGOD",
  "data:image/svg+xml;base64,PHN2Zz4=",
  "data:text/html;base64,PGh0bWw+",
  "data:image/png;base64,",
  "data:image/png;base64",
  "",
  // rejected — bad characters in the payload
  "data:image/png;base64,not$$base64",
  "data:image/png;base64,abc def",
  "data:image/png;base64,abc\ndef",
  "data:image/png;base64,YWJj%20",
  "data:image/png;base64,<script>",
  // rejected — surrounding whitespace
  "  data:image/png;base64,YQ==",
  "data:image/png;base64,YQ== ",
  "\ndata:image/png;base64,YQ==",
  // header must be anchored
  "xdata:image/png;base64,YQ==",
  "data:image/png;base64,YQ==data:image/png;base64,YQ==",
];

describe("parseImageDataUrl matches the regex it replaced", () => {
  it.each(CASES)("agrees on %j", (input) => {
    expect(parseImageDataUrl(input)).toEqual(original(input));
  });

  it("covers both outcomes — otherwise the suite proves nothing", () => {
    // Instrument check. If every case were rejected, a parser that returned
    // null unconditionally would pass all of the above.
    const results = CASES.map((c) => parseImageDataUrl(c));
    expect(results.filter(Boolean).length).toBeGreaterThan(0);
    expect(results.filter((r) => r === null).length).toBeGreaterThan(0);
  });
});

describe("the payload size that broke the original", () => {
  // 5 MB + 1 byte — the exact input that threw
  // `RangeError: Maximum call stack size exceeded at RegExp.exec` on Linux.
  const big = Buffer.alloc(5 * 1024 * 1024 + 1, 7).toString("base64");

  it("parses a payload past the 5MB cap without throwing", () => {
    const parsed = parseImageDataUrl(`data:image/jpeg;base64,${big}`);
    expect(parsed).not.toBeNull();
    expect(parsed?.mime).toBe("image/jpeg");
    expect(parsed?.b64.length).toBe(big.length);
  });

  it("still rejects an oversized payload that is not base64", () => {
    // The header is fine and the body is enormous; the invalid character must
    // still be found. A scan that gave up on long input would pass wrongly.
    expect(parseImageDataUrl(`data:image/jpeg;base64,${big}$`)).toBeNull();
  });

  it("leaves the size cap to the caller — it does not enforce one", () => {
    // Deliberate: MAX_BYTES and MAX_BYTES+1 encode to the SAME base64 length,
    // so size is undecidable here and every caller decodes and checks itself.
    expect(Buffer.alloc(5 * 1024 * 1024, 7).toString("base64").length).toBe(
      big.length,
    );
  });
});

/**
 * Structural guard: the vulnerable form must not come back.
 *
 * ⚠️ THIS TEST EXISTS BECAUSE THE SUITE ABOVE CANNOT DO IT. Mutation-testing
 * showed that reverting `parseImageDataUrl` to the original regex leaves all
 * 26 differential cases GREEN — they pin semantics, and the two forms have
 * identical semantics. That is the whole point of the migration, and it is also
 * why they are blind to the regression. The bug was never a wrong answer; it
 * was a stack overflow that does not reproduce on macOS at any stack size.
 *
 * The property that actually matters is structural: no shipping source file may
 * contain a greedy quantifier over the base64 class. That is checkable on every
 * platform, and it also stops a SIXTH copy being pasted in — this pattern was
 * duplicated five times before anyone noticed.
 */
describe("no source file re-introduces the backtracking base64 pattern", () => {
  const SRC = join(__dirname, "..", "..", "..");

  /** Every .ts/.tsx under src/, excluding tests. */
  function sources(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        // __tests__ is excluded because THIS FILE deliberately holds the last
        // copy of the original pattern, as the differential reference.
        if (entry === "__tests__" || entry === "node_modules") continue;
        sources(full, out);
      } else if (/\.tsx?$/.test(entry)) {
        out.push(full);
      }
    }
    return out;
  }

  const FORBIDDEN = /\[A-Za-z0-9\+\/=\]\+/;

  it("scans a realistic number of files", () => {
    // Instrument check: a walker that returned [] would make the guard vacuous.
    expect(sources(SRC).length).toBeGreaterThan(500);
  });

  /**
   * Comment lines are dropped before scanning.
   *
   * ⚠️ NOT AN OPTIMISATION — without it this test fails on its own subject
   * matter. Three files explain the fix by QUOTING the pattern they replaced,
   * so a naive scan reports `imageDataUrl.ts` as an offender against the very
   * rule it implements. The identical mistake was made earlier in
   * src/config/__tests__/middleware.matcher.test.ts, where a warning comment
   * naming a forbidden matcher was scraped as a live entry.
   *
   * Line-based rather than a block-comment strip: predictable, and it cannot
   * silently swallow real code the way an unbalanced comment regex can.
   */
  function code(text: string): string {
    return text
      .split("\n")
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .join("\n");
  }

  it("still sees code after comments are stripped", () => {
    // Instrument check: if `code()` returned "" the guard below is vacuous.
    const stripped = code(readFileSync(join(SRC, "lib/media/imageDataUrl.ts"), "utf8"));
    expect(stripped).toContain("export function parseImageDataUrl");
    expect(stripped).not.toContain("On the Linux CI runner");
  });

  it("finds no greedy base64 class in shipping code", () => {
    const offenders = sources(SRC)
      .filter((f) => FORBIDDEN.test(code(readFileSync(f, "utf8"))))
      .map((f) => f.slice(SRC.length + 1));
    // Use parseImageDataUrl from src/lib/media/imageDataUrl.ts instead.
    expect(offenders).toEqual([]);
  });
});
