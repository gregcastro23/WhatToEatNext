/**
 * Alchemical profiles — raw methods.
 * Authored in the voice of the stitch "Alchemical Culinary Kinetics" design
 * package — the null transmutation, where the prima materia is preserved.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const rawMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  raw: {
    epithet: "The Unfired Prima Materia",
    classification: "NULL_TRANSMUTATION",
    tagline:
      "The transmutation that refuses the fire. The substrate is held in its first matter — enzymes alive, cell walls whole, color and volatile spirit intact — and where structure must change, the work is done by acid and salt rather than heat.",
    stateChips: [
      { label: "STATE", value: "PRIMA MATERIA" },
      { label: "FIELD", value: "< 48°C ENZYME-SAFE" },
    ],
    kinetics: {
      voltage: "NULL / AMBIENT",
      current: "ENZYMATIC (LATENT)",
      prose:
        "Zero thermal voltage is applied; the only current is the latent enzymatic activity native to the substrate. Transformation is permitted to proceed at its own un-forced rate, or arrested entirely beneath the denaturation threshold.",
      equations: [
        {
          expression: "k = A · e^(−Ea / RT)",
          label: "ARRHENIUS_EQUATION",
          note: "At ambient T the rate constant k stays low — native enzymes act slowly and survive intact below ~48°C, where heat-driven denaturation would otherwise begin.",
        },
      ],
    },
    elementalRoles: {
      Air: "Vitality",
      Water: "Lifeblood",
      Earth: "Substance",
    },
    descriptorTags: ["Living", "Pristine", "Unaltered"],
    planetaryRulers: [
      { planet: "Mercury", rank: "primary", governs: "VITALITY, ENZYMATIC FLUX" },
      { planet: "Moon", rank: "secondary", governs: "FRESHNESS, WATER CONTENT" },
    ],
    rulershipNote:
      "Mercury keeps the living enzymes quick and the matter unfixed; the Moon governs the high water content and the perishable freshness that the method exists to preserve.",
    molecularInteractions: [
      {
        title: "Acid Denaturation",
        prose:
          "In ceviche and crudo the heat of the fire is replaced by the heat of the proton. A flood of citric acid drops the pH past the protein's tolerance, unfolding the tertiary structure and opacifying the flesh — a cold cooking, identical in result, alien in cause.",
        formula: "−COO⁻ + H⁺ → −COOH",
        tags: ["pH Collapse", "Cold Denaturation"],
      },
      {
        title: "Enzymatic Preservation",
        prose:
          "Below the denaturation threshold the substrate's native enzymes remain catalytically alive, carrying ripening, flavor genesis, and digestive aid forward where heat would have annihilated them.",
        dataPoint: { label: "ENZYME_RETENTION", value: "0.99 ρ" },
        temperatureRange: "< 48°C",
      },
      {
        title: "Osmotic Cure",
        prose:
          "Salt and sugar fields draw water across the cell membrane by osmosis, firming texture and concentrating flavor without a single degree of applied heat.",
        tags: ["Osmosis", "Moisture Migration"],
      },
    ],
    checklist: [
      "Heat-sensitive vitamins (C, B-complex) retained near maximum",
      "Living probiotic and enzyme cultures preserved",
      "Native color pigments and volatile aromatics unaltered",
    ],
    accent: "emerald",
  },
};
