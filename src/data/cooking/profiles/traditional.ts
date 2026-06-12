/**
 * Alchemical profiles — traditional methods.
 * Fermentation content transcribed from the stitch "Alchemical Culinary
 * Kinetics" design package (alchemical_profile_fermentation); pickling
 * authored in the same voice.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const traditionalMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  fermentation: {
    epithet: "The Temporal Synthesis",
    classification: "BIOLOGICAL_TRANSMUTATION",
    tagline:
      "A gradual transmutation conducted by living agents. Microbial colonies metabolize the substrate over extended temporal phases, exchanging raw matter for acids, gases, and profound umami signatures.",
    stateChips: [
      { label: "STATE", value: "ACTIVE" },
      { label: "PHASE", value: "ANAEROBIC" },
    ],
    kinetics: {
      voltage: "LOW / BIOLOGICAL",
      current: "ENZYMATIC (SUSTAINED)",
      prose:
        "Low-voltage biological decay and enzymatic current (I) over extended time. The transmutation occurs gradually, relying on microbial agents rather than thermal combustion.",
      equations: [
        {
          expression: "Reaction_Rate = k[Enzyme][Substrate]",
          label: "FUNDAMENTAL_EQUATION",
        },
      ],
    },
    elementalRoles: {
      Water: "Solvent",
      Earth: "Substrate",
      Air: "Gas Exchange",
    },
    planetaryRulers: [
      { planet: "Venus", rank: "primary", governs: "CULTURE, HARMONIC BALANCE" },
      { planet: "Saturn", rank: "secondary", governs: "TIME, PRESERVATION" },
    ],
    molecularInteractions: [
      {
        title: "Lactic Acid Production",
        prose:
          "The conversion of simple sugars into lactic acid via Lactobacillus activity. This creates an acidic environment hostile to putrefaction, preserving the substrate while transforming its flavor profile.",
        formula: "C6H12O6 → 2 CH3CHOHCOOH",
      },
      {
        title: "Protein Pre-digestion",
        prose:
          "Enzymatic cleavage of complex peptide bonds into free amino acids. This biological breakdown increases bioavailability and generates profound umami signatures.",
        tags: ["Protease Activity", "Peptide Cleavage"],
      },
    ],
    image: "/images/methods/fermentation.webp",
    imageAlt:
      "Scientific diagram of fermentation: microbial activity and enzymatic breakdown over time, with lactic acid production and protein pre-digestion shown as glowing alchemical symbols.",
    accent: "emerald",
  },

  pickling: {
    epithet: "The Acidic Stasis",
    classification: "IONIC_PRESERVATION",
    tagline:
      "Suspension of decay through ionic immersion. The substrate is sealed within an acid or brine field, where osmotic exchange and pH collapse hold organic matter in indefinite stasis.",
    stateChips: [
      { label: "STATE", value: "SUSPENDED" },
      { label: "FIELD", value: "ACIDIC < pH 4.6" },
    ],
    kinetics: {
      voltage: "NULL / AMBIENT",
      current: "IONIC (DIFFUSION)",
      prose:
        "Zero thermal voltage; the operative current is ionic. Hydrogen ions and dissolved salts migrate along concentration gradients into the cellular matrix, displacing water and arresting microbial metabolism.",
      equations: [
        {
          expression: "J = −D (dC/dx)",
          label: "DIFFUSION_EQUATION",
          note: "Fick's first law — brine ions flux along the concentration gradient into the substrate.",
        },
      ],
    },
    elementalRoles: {
      Water: "Brine Field",
      Earth: "Matrix",
    },
    descriptorTags: ["Osmotic", "Sealed", "Indefinite"],
    planetaryRulers: [
      { planet: "Saturn", rank: "primary", governs: "STASIS, STRUCTURE" },
      { planet: "Moon", rank: "secondary", governs: "BRINE, FLUID EXCHANGE" },
    ],
    molecularInteractions: [
      {
        title: "Acidification",
        prose:
          "Acetic or lactic acid floods the medium, collapsing pH below the survival threshold of spoilage organisms. Cellular enzymes denature in the acid field, locking texture and color in place.",
        formula: "CH3COOH ⇌ CH3COO⁻ + H⁺",
      },
      {
        title: "Osmotic Exchange",
        prose:
          "The hypertonic brine draws cellular water outward while salt and aromatic ions migrate inward. Turgor collapses then re-equilibrates, yielding the signature dense, snapping crunch.",
        tags: ["Osmosis", "Ion Migration", "Turgor Exchange"],
      },
    ],
    accent: "aqueous",
  },
};
