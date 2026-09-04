/**
 * @jest-environment jsdom
 *
 * BoundaryTransferCanvas — lifecycle and honesty.
 *
 * ## Why this needs a stubbed 2D context
 *
 * jsdom does not implement `getContext("2d")`, so it returns null and the draw
 * effect early-returns BEFORE arming requestAnimationFrame. A lifecycle test
 * written without a stub would therefore assert that nothing leaks from a loop
 * that never started — green, and meaningless. The stub exists so the animation
 * path is genuinely entered and the cleanup genuinely has something to cancel.
 *
 * The stub records nothing about DRAWING; pixel output is not testable here and
 * is not what this file claims to cover. What it covers is that the component
 * starts, stops, and tells the truth about which engine it ran.
 */

import { render, screen, waitFor } from "@testing-library/react";

import { BoundaryTransferCanvas } from "../BoundaryTransferCanvas";

/** Minimal 2D context: every method the component actually calls, no-ops. */
function stubContext(): CanvasRenderingContext2D {
  const noop = (): void => undefined;
  const ctx: Partial<CanvasRenderingContext2D> = {
    arc: noop, beginPath: noop, clearRect: noop, closePath: noop,
    createLinearGradient: () => ({ addColorStop: noop }) as CanvasGradient,
    fill: noop, fillRect: noop, fillText: noop, lineTo: noop,
    measureText: () => ({ width: 40 }) as TextMetrics,
    moveTo: noop, setLineDash: noop, setTransform: noop, stroke: noop,
    strokeRect: noop,
    fillStyle: "", strokeStyle: "", font: "", lineJoin: "round",
    lineWidth: 1, textAlign: "left", textBaseline: "top",
  };
  return ctx as CanvasRenderingContext2D;
}

let reduceMotion = false;

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => stubContext(),
  });
});

/**
 * Assignment, not defineProperty.
 *
 * tests/setup/jest.setup.ts already installs a global matchMedia as
 * `writable: true` WITHOUT `configurable`, so redefining it throws
 * "Cannot redefine property". Assigning over a writable property is allowed,
 * and re-assigning per test keeps `reduceMotion` readable by the closure after
 * `restoreAllMocks` has run.
 */
/**
 * A deterministic animation clock.
 *
 * jsdom provides no requestAnimationFrame at all (probed: `undefined` on both
 * `window` and `globalThis`), so without this the component takes its
 * cannot-animate path and every lifecycle assertion below would be vacuous —
 * proving that nothing leaks from a loop that never started.
 *
 * Frames are driven by setTimeout so a test can advance them, and both
 * functions are real spies so "was a frame scheduled?" and "was it cancelled?"
 * are directly observable rather than inferred.
 */
function installAnimationClock(): { raf: jest.Mock; caf: jest.Mock } {
  const raf = jest.fn((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(16), 16),
  );
  const caf = jest.fn((id: number) => window.clearTimeout(id));
  window.requestAnimationFrame = raf;
  window.cancelAnimationFrame = caf;
  return { raf, caf };
}

function installMatchMedia(): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    onchange: null,
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  reduceMotion = false;
  jest.restoreAllMocks();
  installMatchMedia();
});

describe("the stubs themselves", () => {
  it("give the component a real context and a working media query", () => {
    // Instrument check. If getContext still returned null every lifecycle
    // assertion below would pass by never starting anything.
    const canvas = document.createElement("canvas");
    expect(canvas.getContext("2d")).not.toBeNull();
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(false);
    reduceMotion = true;
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  });
});

describe("BoundaryTransferCanvas — honesty", () => {
  it("reports the engine that actually ran", async () => {
    // jsdom cannot fetch public/wasm, so TypeScript is the truthful answer.
    render(<BoundaryTransferCanvas />);
    // getAllByText, not getByText: the label appears twice on purpose — once in
    // the visual badge and once in the text alternative a screen reader gets.
    // getByText throws on multiple matches, which would read as "the label is
    // missing" when the truth is the opposite.
    await waitFor(() => {
      expect(screen.getAllByText(/typescript fallback/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryAllByText(/rust · wasm/i)).toHaveLength(0);
  });

  it("publishes the solved scalars as text, not only as pixels", async () => {
    // A canvas is opaque to assistive tech and to this test. The component
    // carries a text alternative; these are the golden values for DEFAULT_CHAIN,
    // independently reproduced from the TypeScript solver.
    const { container } = render(<BoundaryTransferCanvas />);
    await waitFor(() => {
      expect(container.textContent).toMatch(/0\.2615/);
    });
    const text = container.textContent ?? "";
    expect(text).toMatch(/3\.824/);
    expect(text).toMatch(/374\.8/);
    expect(text).toMatch(/18\.18/);
    expect(text).toMatch(/food surface → core/);
    expect(text).not.toMatch(/\bNaN\b/);
  });
});

describe("BoundaryTransferCanvas — lifecycle", () => {
  it("cancels its animation frame on unmount", async () => {
    const { raf, caf } = installAnimationClock();
    const { container, unmount } = render(<BoundaryTransferCanvas />);

    await waitFor(() => {
      expect(container.querySelector("canvas")).toBeInTheDocument();
    });
    // CONTROL: the loop must genuinely be running, or the cancel below is a
    // claim about a loop that never started.
    await waitFor(() => {
      expect(raf).toHaveBeenCalled();
    });

    unmount();
    expect(caf).toHaveBeenCalled();
  });

  it("stops scheduling frames once unmounted", async () => {
    const { raf } = installAnimationClock();
    const { container, unmount } = render(<BoundaryTransferCanvas />);
    await waitFor(() => {
      expect(container.querySelector("canvas")).toBeInTheDocument();
    });
    await waitFor(() => expect(raf).toHaveBeenCalled());

    unmount();
    const afterUnmount = raf.mock.calls.length;
    // Let any frame already in flight land. A step() that re-arms without
    // checking `disposed` would keep the loop alive forever on a dead node.
    await new Promise((r) => setTimeout(r, 80));
    expect(raf.mock.calls.length).toBe(afterUnmount);
  });

  it("does not schedule frames at all under prefers-reduced-motion", async () => {
    reduceMotion = true;
    const { raf } = installAnimationClock();

    const { container } = render(<BoundaryTransferCanvas />);
    await waitFor(() => {
      expect(container.querySelector("canvas")).toBeInTheDocument();
    });
    // PREVENTED, not slowed: a reduced-motion setting that merely lowered the
    // frame rate would still animate, which is the thing the setting forbids.
    expect(raf).not.toHaveBeenCalled();
    // ...and the static frame still carries the numbers.
    expect(container.textContent).toMatch(/0\.2615/);
  });

  it("survives an unmount immediately after mount", async () => {
    // The solver resolves asynchronously; unmounting before it settles must not
    // produce a setState-after-unmount warning or an unhandled rejection.
    const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(<BoundaryTransferCanvas />);
    unmount();
    await new Promise((r) => setTimeout(r, 50));
    expect(err).not.toHaveBeenCalled();
  });
});
