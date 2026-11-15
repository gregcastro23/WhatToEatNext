/**
 * What a visitor sees when the aspects request fails.
 *
 * `PlanetaryAspectsDisplay` used to render `Error: {e.message}`, so a malformed
 * body put the parser's internal wording (planetaryAspectsParser.ts) on the page,
 * next to raw browser text for network failures. Every failure now shows ONE
 * fixed sentence and the detail goes to `_logger.error`.
 *
 * Each failing case is paired with a control inside the test: the wording that
 * must NOT reach the page is asserted to reach the logger, so a clean page
 * cannot come from a fixture that never produced the wording in the first place.
 * The valid body is the further control: the same component, same mocks, renders
 * the aspects and logs nothing, so the failures above are the request's doing.
 */
import React from "react";
import { render, waitFor } from "@testing-library/react";
import PlanetaryAspectsDisplay from "@/components/PlanetaryAspectsDisplay";
import type { AspectsData } from "@/components/planetaryAspectsParser";

const mockLogged: unknown[][] = [];

jest.mock("@/lib/logger", () => ({
  _logger: {
    info: () => undefined,
    warn: () => undefined,
    error: (...args: unknown[]) => {
      mockLogged.push(args);
    },
  },
}));
jest.mock("@/hooks/useTransitGroupChat", () => ({
  useTransitGroupChat: () => ({ open: () => Promise.resolve(), pending: false }),
}));
jest.mock("@/lib/questReporter", () => ({ reportQuestEvent: () => undefined }));

const UNAVAILABLE = "Aspects are unavailable right now.";
const NO_ARRAY = "Aspects response had no aspects array";
const NOT_OBJECT = "Aspects response was not a JSON object";
const NO_MATCH = "No aspect in the response matched the expected shape";
const HTTP_FAILURE = "Failed to fetch aspects";
const BROWSER_TEXT = "NetworkError when attempting to fetch resource.";

const VALID: AspectsData = {
  timestamp: "2026-11-12T09:30:00.000Z",
  aspects: [
    {
      planet1: "Sun",
      planet2: "Mercury",
      type: "conjunction",
      aspectAngle: 0,
      orbDegrees: 1.75,
      strength: 0.78,
      applying: true,
      daysToExact: 1.5,
    },
  ],
};

const originalFetch = globalThis.fetch;

function answerWith(body: string, status = 200): void {
  globalThis.fetch = (): Promise<Response> =>
    Promise.resolve(
      new Response(body, { status, headers: { "Content-Type": "application/json" } }),
    );
}

function failWith(error: Error): void {
  globalThis.fetch = (): Promise<Response> => Promise.reject(error);
}

async function renderSettled(): Promise<HTMLElement> {
  const { container } = render(<PlanetaryAspectsDisplay />);
  await waitFor(() => {
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
  return container;
}

function loggedDetailMessages(): string[] {
  return mockLogged.flatMap((args) => {
    const detail = args[1];
    return detail instanceof Error ? [detail.message] : [];
  });
}

function expectFixedSentenceOnly(container: HTMLElement, wording: string): void {
  expect(container.textContent).toBe(UNAVAILABLE);
  expect(container.textContent).not.toContain(wording);
  expect(loggedDetailMessages()).toContain(wording);
}

beforeEach(() => {
  mockLogged.length = 0;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("PlanetaryAspectsDisplay load failures", () => {
  it("CONTROL: a valid body renders the aspects and logs nothing", async () => {
    answerWith(JSON.stringify(VALID));
    const container = await renderSettled();
    expect(container.textContent).toContain("All (1)");
    expect(container.textContent).not.toContain(UNAVAILABLE);
    expect(mockLogged).toHaveLength(0);
  });

  it("a body with no aspects array shows only the fixed sentence", async () => {
    answerWith('{"success":true}');
    expectFixedSentenceOnly(await renderSettled(), NO_ARRAY);
  });

  it("a JSON null body shows only the fixed sentence", async () => {
    answerWith("null");
    expectFixedSentenceOnly(await renderSettled(), NOT_OBJECT);
  });

  it("rows that all miss the expected shape show only the fixed sentence", async () => {
    answerWith(JSON.stringify({ timestamp: VALID.timestamp, aspects: [{ planet1: 1 }] }));
    expectFixedSentenceOnly(await renderSettled(), NO_MATCH);
  });

  it("an HTTP failure shows only the fixed sentence", async () => {
    answerWith('{"error":"boom"}', 500);
    expectFixedSentenceOnly(await renderSettled(), HTTP_FAILURE);
  });

  it("a network failure shows only the fixed sentence, not the browser text", async () => {
    failWith(new TypeError(BROWSER_TEXT));
    expectFixedSentenceOnly(await renderSettled(), BROWSER_TEXT);
  });

  it("the logger call names the component and carries the thrown error itself", async () => {
    answerWith('{"success":true}');
    await renderSettled();
    expect(mockLogged).toHaveLength(1);
    const [message, detail] = mockLogged[0] ?? [];
    expect(message).toBe("PlanetaryAspectsDisplay: could not load aspects:");
    expect(detail).toBeInstanceOf(TypeError);
  });
});
