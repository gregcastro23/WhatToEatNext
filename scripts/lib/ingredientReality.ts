/**
 * Real-vs-default detection for ingredient cards.
 *
 * The completeness rubric (auditIngredients) scores whether a field is PRESENT.
 * These markers detect when a present field is actually a placeholder/default
 * rather than real, curated/sourced data — so the campaign can drive the
 * "non-real" count to 0, not just "presence" to 100%.
 *
 * Each marker is matched against an ingredient card's raw source text, so it
 * works AST-free and is trivial to unit-test.
 */
export interface RealityMarker {
  key: string;
  label: string;
  re: RegExp;
}

export const REALITY_MARKERS: RealityMarker[] = [
  {
    key: "generated_stub",
    label: "Auto-generated coverage stub (provenance:generated)",
    re: /provenance:\s*["']generated["']/,
  },
  {
    key: "nutrition_placeholder",
    label: "Placeholder/default nutrition source",
    re: /"category default"|Recipe-derived coverage entry|"category estimate"/,
  },
  {
    key: "description_boilerplate",
    label: "Boilerplate description",
    re: /recipe-linked ingredient captured|standardized baseline metadata|placeholder profile|refine with domain curation/i,
  },
  {
    key: "qualities_placeholder",
    label: "Placeholder qualities array",
    re: /qualities:\s*\[\s*["']recipe-linked["']\s*,\s*["']standardized["']\s*\]/,
  },
  {
    key: "elemental_uniform_default",
    label: "Uniform 0.25 elemental default",
    re: /Fire:\s*0\.25\s*,\s*Water:\s*0\.25\s*,\s*Earth:\s*0\.25\s*,\s*Air:\s*0\.25/,
  },
];

/**
 * Returns the keys of every non-real marker present in an ingredient card's
 * source text. Empty array == no placeholder/default values detected (real).
 */
export function detectNonRealFlags(cardText: string): string[] {
  return REALITY_MARKERS.filter((m) => m.re.test(cardText)).map((m) => m.key);
}
