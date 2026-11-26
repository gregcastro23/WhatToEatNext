/**
 * A small, valid food guide for tests. Its text and numbers are placeholders
 * for shape only, never served.
 */
import type { FoodGuide, GuideMethodId, SafetyClass } from "@/lib/cooking/foodGuides/schema";

export function fixtureGuide(
  id: string,
  name: string,
  aliases: string[],
  methods: GuideMethodId[],
  catalogKeys: string[] = [],
  safetyClass: SafetyClass = "none",
): FoodGuide {
  const claim = (text: string): { text: string; sources: string[] } => ({ text, sources: ["test-source"] });
  return {
    id,
    name,
    aliases,
    catalogKeys,
    safetyClass,
    summary: claim(`${name} test summary.`),
    selection: [],
    storage: [claim("Keep it cold in tests.")],
    preparation: [],
    substitutions: [],
    safety: [],
    methods: methods.map((method, at) => ({
      id: method,
      label: `${method} label`,
      best: at === 0,
      why: claim("Test reason."),
      quantities: [],
      equipment: [],
      steps: [claim("First test step."), claim("Second test step.")],
      tips: [],
      doneness: [],
    })),
    sources: [{ id: "test-source", publisher: "Test", title: "Test page", url: "https://example.org/test", retrieved: "2026-11-25" }],
  };
}
