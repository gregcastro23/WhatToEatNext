/**
 * @jest-environment jsdom
 *
 * ComparisonPanel — the three-arrangement chain comparison.
 *
 * This file exists because of one specific defect. The panel used to call
 * `throw new Error(...)` from inside a `useMemo` when `stockpot_8qt` was absent
 * from the vessel registry, with no error boundary above it — so a registry
 * edit blanked the WHOLE Compare tab rather than the two cards that actually
 * need a pot. That is invisible to `tsc`, invisible in review, and invisible in
 * the browser as long as the registry happens to contain the pot.
 *
 * The guard is therefore the missing-vessel case, and it asserts the SURVIVING
 * column as much as the refused ones: "does not throw" alone would still pass
 * if the panel rendered nothing at all.
 */

import { render, screen, waitFor } from "@testing-library/react";

import { ComparisonPanel } from "../ComparisonPanel";

const realVessels = jest.requireActual<typeof import("@/data/cooking/vessels")>(
  "@/data/cooking/vessels",
);

/** Flipped per-test; the factory closes over it so a test can drop the pot. */
let potPresent = true;

jest.mock("@/data/cooking/vessels", () => ({
  ...jest.requireActual("@/data/cooking/vessels"),
  getVessel: (id: string) =>
    potPresent || id !== "stockpot_8qt"
      ? jest.requireActual<typeof import("@/data/cooking/vessels")>(
          "@/data/cooking/vessels",
        ).getVessel(id)
      : null,
}));

beforeEach(() => {
  potPresent = true;
});

describe("ComparisonPanel — the mock itself", () => {
  it("is live, and the registry really does contain the pot by default", () => {
    // An inert jest.mock is the classic way these suites pass while testing
    // nothing. Prove the seam works in BOTH positions before relying on it.
    const { getVessel } = jest.requireMock<typeof import("@/data/cooking/vessels")>(
      "@/data/cooking/vessels",
    );
    expect(getVessel("stockpot_8qt")).not.toBeNull();
    potPresent = false;
    expect(getVessel("stockpot_8qt")).toBeNull();
    // ...and an unrelated vessel is unaffected, so the mock is targeted.
    expect(getVessel("skillet_12in_carbon")).not.toBeNull();
    potPresent = true;
    expect(realVessels.getVessel("stockpot_8qt")).not.toBeNull();
  });
});

describe("ComparisonPanel — with the registry intact", () => {
  it("renders all three arrangements", async () => {
    render(<ComparisonPanel />);

    await waitFor(() => {
      expect(screen.getByText(/oven, on a rack/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/boiling water/i)).toBeInTheDocument();
    expect(screen.getByText(/empty pot/i)).toBeInTheDocument();
  });

  it("labels the engine that actually ran, not a constant", async () => {
    // jsdom cannot fetch public/wasm, so the TypeScript arm is the honest
    // answer here. A panel hardcoding "Rust · WASM" would fail this.
    render(<ComparisonPanel />);
    await waitFor(() => {
      expect(screen.getByText(/typescript fallback/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/rust · wasm/i)).not.toBeInTheDocument();
  });

  it("states the vessel wall thickness from the registry, not a written-down number", async () => {
    // The bar was captioned "3 mm" while its resistance was solved from the
    // registry's 4 mm base. Reading the real field is the fix; this pins it.
    const pot = realVessels.getVessel("stockpot_8qt");
    expect(pot).not.toBeNull();

    render(<ComparisonPanel />);
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`vessel wall, ${pot!.baseThicknessMm} mm`, "i")),
      ).toBeInTheDocument();
    });
    // And specifically NOT the old hardcoded figure.
    expect(screen.queryByText(/vessel wall, 3 mm/i)).not.toBeInTheDocument();
  });
});

describe("ComparisonPanel — with stockpot_8qt missing from the registry", () => {
  it("does not throw, and keeps rendering the column that needs no vessel", async () => {
    potPresent = false;

    expect(() => render(<ComparisonPanel />)).not.toThrow();

    // THE load-bearing assertion. Previously the whole tab went blank; the oven
    // arrangement has no vessel leg and must survive untouched.
    await waitFor(() => {
      expect(screen.getByText(/oven, on a rack/i)).toBeInTheDocument();
    });
  });

  it("refuses the two pot-bearing columns with a stated reason", async () => {
    potPresent = false;
    render(<ComparisonPanel />);

    await waitFor(() => {
      expect(screen.getAllByText(/no chain/i).length).toBeGreaterThanOrEqual(2);
    });
    expect(
      screen.getAllByText(/stockpot_8qt is not in the vessel registry/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("substitutes an em dash, never a zero or a placeholder", async () => {
    potPresent = false;
    const { container } = render(<ComparisonPanel />);

    await waitFor(() => {
      expect(screen.getAllByText(/no chain/i).length).toBeGreaterThanOrEqual(2);
    });

    // A refused resistance rendered as 0 would read as "no resistance", which
    // is the OPPOSITE of what a refusal means.
    const text = container.textContent ?? "";
    expect(text).toContain("—");
    expect(text).not.toMatch(/\bNaN\b/);
    expect(text).not.toMatch(/\bN\/A\b/);
  });
});
