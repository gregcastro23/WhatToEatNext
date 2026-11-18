/**
 * @jest-environment node
 *
 * Verifies that `resolveSyncedAgentElement` in `scripts/sync-agentic-users.ts`
 * keeps classical elements orthogonal to ESMS quantities (e.g., never falls back
 * to `"Spirit"` inside `dominant_element`).
 */

import { resolveSyncedAgentElement } from "../../sync-agentic-users";

describe("resolveSyncedAgentElement", () => {
  it.each(["Fire", "Water", "Earth", "Air"] as const)(
    "keeps classical element %s from consciousness.dominantElement",
    (element) => {
      expect(resolveSyncedAgentElement(element, "Earth")).toBe(element);
    },
  );

  it("falls back to dietMetadataElement when consciousnessElement is missing or a quantity", () => {
    expect(resolveSyncedAgentElement(undefined, "Water")).toBe("Water");
    expect(resolveSyncedAgentElement(null, "Air")).toBe("Air");
    expect(resolveSyncedAgentElement("Spirit", "Earth")).toBe("Earth");
    expect(resolveSyncedAgentElement("Essence", "Water")).toBe("Water");
  });

  it("defaults to Fire when both inputs are missing or ESMS quantities", () => {
    expect(resolveSyncedAgentElement(undefined, undefined)).toBe("Fire");
    expect(resolveSyncedAgentElement("Spirit", undefined)).toBe("Fire");
    expect(resolveSyncedAgentElement("Spirit", "Spirit")).toBe("Fire");
    expect(resolveSyncedAgentElement("Matter", "Substance")).toBe("Fire");
  });
});
