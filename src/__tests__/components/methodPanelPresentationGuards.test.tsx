/**
 * Presentation-layer guards for the cooking-method panels.
 *
 * The thermodynamics under these panels has 12+ test files; until now the
 * panels themselves had one (HooksCompliance). These tests pin the two
 * display invariants that file does not:
 *
 *   1. Absence renders a STATED REASON and never a number. The panels'
 *      contract (MethodPhysicsPanels.tsx header) is that a quantity which
 *      does not apply is explained in words — a plausible-looking figure
 *      with no basis is the worst available outcome.
 *   2. A missing operand SUPPRESSES its delta. A comparison with one real
 *      side and one fabricated zero is not a comparison; the pure layer
 *      returns null and the panel must gate on it.
 *
 * The third invariant of this family — humidity reaches panel text and
 * never the particle engine — is pinned mechanically on the engine side by
 * particleEngineHumidityGuardrail.test.ts (arity, input surface, back
 * channel). This file adds only its display half: a measured humidity DOES
 * render, an unmeasured one renders nothing rather than a default.
 *
 * These tests drive the REAL registry and the REAL pure layer
 * (buildMethodMetrics / localizedMedium) — no fixture methods, no mocked
 * physics — so a regression in either the data or the gate fails here.
 */
import React from "react";
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";

// ConditionsTab owns live telemetry via two hooks. The producer resolves
// geolocation and publishes to SpacetimeDB — inert stub. The observation
// hook is the seam under test: what it returns is exactly what the panel
// may show, so the mock swaps between "a real measurement" and "nothing
// measured" per test.
let mockReading: import("@/hooks/useEnvironmentalObservation").EnvironmentalReading | null = null;
jest.mock("@/hooks/useEnvironmentalProducer", () => ({
  useEnvironmentalProducer: () => {},
}));
jest.mock("@/hooks/useEnvironmentalObservation", () => ({
  useEnvironmentalObservation: () => mockReading,
}));

import { PhysicsTab, ConditionsTab } from "@/components/cooking-methods/MethodPhysicsPanels";
import { buildMethodMetrics, localizedMedium } from "@/lib/cooking/methodMetrics";

/** Bogotá: high enough that water's ceiling (~91 °C) sits well below a 100 °C medium. */
const BOGOTA_M = 2640;

const liveReading = (
  overrides: Partial<NonNullable<typeof mockReading>> = {},
): NonNullable<typeof mockReading> => ({
  elevationM: BOGOTA_M,
  elevationProvenance: "gps",
  elevationErrorM: 30,
  elevationTrustworthy: true,
  ambientTempC: 23.5,
  relativeHumidityPct: 47,
  stationPressureKpa: null,
  updatedAtMs: Date.now(),
  ...overrides,
});

afterEach(() => {
  mockReading = null;
});

describe("absence renders a stated reason and never a number", () => {
  // Fermentation is the registry's own absence case: h is null (microbes,
  // not heat transfer, set the pace) and the rate limiter is outside the
  // core-time family, so BOTH the h panel and the reference-time panel
  // must explain themselves in words.
  const metrics = buildMethodMetrics("fermentation")!;

  it("the registry really does make both quantities absent (precondition)", () => {
    expect(metrics.transfer).toBeNull();
    expect(metrics.reference.result).toBeNull();
    expect(typeof metrics.reference.unavailableReason).toBe("string");
    expect(metrics.reference.unavailableReason!.length).toBeGreaterThan(0);
  });

  it("an absent h renders the category-error explanation, not a coefficient", () => {
    const { container } = render(<PhysicsTab metrics={metrics} />);
    expect(container.textContent).toContain("Quoting an h here would be a category error");
    // The unit glyph exists only next to a printed coefficient — its absence
    // proves none was printed ANYWHERE on the tab, including the simulation
    // legend, which once presented its borrowed roasting-profile h as this
    // method's own.
    expect(container.textContent).not.toContain("W·m⁻²·K⁻¹");
    expect(container.textContent).toContain("Illustrative motion only");
  });

  it("no transfer coefficient means no z-score claim — not z = +0.00", () => {
    // `transfer?.z ?? 0` once rendered "z = +0.00" here: a typicality claim
    // about a coefficient that does not exist. Null and zero are different
    // facts and must render differently.
    const { container } = render(<PhysicsTab metrics={metrics} />);
    expect(container.textContent).not.toMatch(/z = [+-]?0\.00/);
    expect(container.textContent).toContain("no coefficient to standardise");
  });

  it("an absent reference time renders the pure layer's own authored reason", () => {
    const { container } = render(<PhysicsTab metrics={metrics} />);
    // Whatever reason methodMetrics authored is the one the user must see —
    // asserting the exact string ties panel text to the pure layer.
    expect(container.textContent).toContain(metrics.reference.unavailableReason!);
  });

  it("no branch leaks a NaN into the panel text", () => {
    const { container } = render(<PhysicsTab metrics={metrics} />);
    expect(container.textContent).not.toMatch(/NaN/);
  });
});

describe("a missing operand suppresses its delta", () => {
  it("sous vide at altitude: no reference time means coreTimeIncrease is null, not 0", () => {
    // sous_vide's 60 °C bath cannot carry the reference load to 60 °C core
    // (headroom rule), so seaLevelCoreMinutes is null. The delta over a
    // missing operand must be null — a 0 here would claim "measured: no
    // change", which is a fabrication.
    const lm = localizedMedium("sous_vide", BOGOTA_M)!;
    expect(lm.clamped).toBe(false);
    expect(lm.seaLevelCoreMinutes).toBeNull();
    expect(lm.coreMinutes).toBeNull();
    expect(lm.coreTimeIncrease).toBeNull();
  });

  it("boiling at altitude: with both operands real, the delta exists (control)", () => {
    // Proves the null above is a suppression, not a field that is never set.
    const lm = localizedMedium("boiling", BOGOTA_M)!;
    expect(lm.clamped).toBe(true);
    expect(typeof lm.seaLevelCoreMinutes).toBe("number");
    expect(typeof lm.coreMinutes).toBe("number");
    expect(typeof lm.coreTimeIncrease).toBe("number");
    expect(lm.coreTimeIncrease!).toBeGreaterThan(0);
  });

  it("the panel renders the +% comparison for the control…", () => {
    mockReading = liveReading();
    const { container } = render(<ConditionsTab metrics={buildMethodMetrics("boiling")!} />);
    expect(container.textContent).toContain("longer here");
    expect(container.textContent).toContain("at sea level");
  });

  it("…and renders no comparison at all when the operand is missing", () => {
    mockReading = liveReading();
    const { container } = render(<ConditionsTab metrics={buildMethodMetrics("sous_vide")!} />);
    expect(container.textContent).not.toContain("longer here");
    expect(container.textContent).not.toContain("at sea level versus");
  });

  it("the render gate checks null before the non-null assertions it licenses", () => {
    // The JSX uses `seaLevelCoreMinutes!` / `coreMinutes!` inside the block —
    // safe ONLY because the block is gated on `coreTimeIncrease !== null`.
    // Pin the ordering so a refactor cannot move the assertion above the gate.
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/cooking-methods/MethodPhysicsPanels.tsx"),
      "utf8",
    );
    const gate = source.indexOf("coreTimeIncrease !== null");
    const use = source.indexOf("coreTimeIncrease * 100");
    expect(gate).toBeGreaterThan(-1);
    expect(use).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(use);
  });
});

describe("humidity reaches panel text — and only when measured", () => {
  it("a measured room renders the live chip with the real figures", () => {
    mockReading = liveReading({ ambientTempC: 23.5, relativeHumidityPct: 47 });
    const { container } = render(<ConditionsTab metrics={buildMethodMetrics("boiling")!} />);
    expect(container.textContent).toContain("In your kitchen now");
    expect(container.textContent).toContain("47%");
    expect(container.textContent).toContain("74°F"); // cToF(23.5) = 74.3 → "74"
  });

  it("an unmeasured room renders no chip — not 21 °C / 50 % defaults", () => {
    mockReading = null;
    const { container } = render(<ConditionsTab metrics={buildMethodMetrics("boiling")!} />);
    expect(container.textContent).not.toContain("In your kitchen now");
    // The exact fabrication this replaced (see the guardrail comment in the
    // panel source): constants presented as a live reading.
    expect(container.textContent).not.toMatch(/50% RH|70°F air/);
  });

  it("a room measured for humidity only still shows humidity (per-field nulls)", () => {
    mockReading = liveReading({ ambientTempC: null, relativeHumidityPct: 47 });
    const { container } = render(<ConditionsTab metrics={buildMethodMetrics("boiling")!} />);
    expect(container.textContent).toContain("47%");
    expect(container.textContent).not.toContain("°F air");
  });
});
