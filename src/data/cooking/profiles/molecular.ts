/**
 * Alchemical profiles — molecular methods.
 * Emulsification content transcribed from the stitch "Alchemical Culinary
 * Kinetics" design package (alchemical_profile_coagulation); spherification,
 * gelification, and cryo_cooking authored in the same voice.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const molecularMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  emulsification: {
    epithet: "The Unified Matrix",
    classification: "MATRIX_BINDING",
    tagline:
      "The synthesis of disparate elements into a unified structure via high-voltage binding protocols. Immiscible phases are driven into one another and held — a standing union maintained against every thermodynamic objection.",
    stateChips: [
      { label: "STATUS", value: "V1.0.4 [STABLE]" },
      { label: "SYS_OK", value: "TELEMETRY_LINK_ESTABLISHED" },
    ],
    kinetics: {
      voltage: "240.5 mV (BINDING)",
      current: "12.8 mA (STABILIZATION)",
      prose:
        "A binding voltage applied across the phase boundary sustains a steady stabilization current. The emulsion charges like a capacitor — structural order stored in the interfacial lattice, discharged only when the matrix breaks.",
      equations: [
        {
          expression: "Binding_Energy = k · (Eg / δ)",
          label: "GOVERNING_EQUATION",
          note: "Where k = binding constant, Eg = interfacial energy gap, δ = phase boundary thickness.",
        },
      ],
    },
    elementalRoles: {
      Earth: "Matrix",
      Water: "Carrier",
    },
    planetaryRulers: [
      { planet: "Saturn", rank: "primary", governs: "STRUCTURE, BINDING" },
      { planet: "Venus", rank: "secondary", governs: "COHESION, UNION" },
    ],
    molecularInteractions: [
      {
        title: "Protein Cross-Linking",
        prose:
          "The systematic alignment of denatured peptide chains, creating a stable macroscopic lattice. This structural foundation is critical for resisting thermal degradation during subsequent transmutative phases.",
        dataPoint: { label: "LATTICE_DENSITY", value: "0.84 ρ" },
      },
      {
        title: "Lipid Stabilization",
        prose:
          "Encapsulation of hydrophobic elements within the hydrophilic matrix. The resulting emulsion exhibits anomalous resistance to phase separation, maintaining unity under extreme esoteric stress.",
        dataPoint: { label: "MICELLE_RADIUS", value: "4.2 nm" },
      },
    ],
    image: "/images/methods/coagulation.webp",
    imageAlt:
      "Scientific diagram of emulsification as matrix binding: disparate elements synthesized into a unified structure, with protein cross-linking and lipid stabilization rendered as glowing emerald and silver alchemical symbols on an obsidian field.",
    accent: "emerald",
  },

  spherification: {
    epithet: "The Liquid Reliquary",
    classification: "IONIC_ENCAPSULATION",
    tagline:
      "Liquid essence sealed within a self-assembling gel reliquary. Calcium ions cross-link alginate polymers at the droplet boundary, raising a semi-permeable wall around a core that remains forever liquid.",
    stateChips: [
      { label: "MEMBRANE", value: "SEMI-PERMEABLE" },
      { label: "CORE", value: "LIQUID" },
    ],
    kinetics: {
      voltage: "NULL / CHEMICAL",
      current: "IONIC (INTERFACIAL)",
      prose:
        "No thermal voltage is applied; the operative current is a flux of divalent calcium ions across the droplet boundary. Gelation proceeds from the outside inward, halting as the shell's own resistance chokes the ionic current.",
      equations: [
        {
          expression: "∂C/∂t = D ∇²C",
          label: "DIFFUSION_EQUATION",
          note: "Fick's second law — calcium penetration governs membrane thickness, which grows with the square root of bath time.",
        },
      ],
    },
    elementalRoles: {
      Water: "Essence",
      Air: "Levity",
    },
    descriptorTags: ["Encapsulated", "Bursting", "Pristine"],
    planetaryRulers: [
      { planet: "Neptune", rank: "primary", governs: "FLUID ILLUSION, MEMBRANES" },
      { planet: "Uranus", rank: "secondary", governs: "SUDDEN NOVELTY, RUPTURE" },
    ],
    molecularInteractions: [
      {
        title: "Ionic Cross-Linking",
        prose:
          "Divalent calcium displaces sodium along the alginate chains, zipping guluronate blocks into the egg-box configuration. The gel wall assembles only where bath meets droplet — the interior is never touched.",
        formula: "2 NaAlg + Ca²⁺ → Ca(Alg)₂ + 2 Na⁺",
        tags: ["Egg-Box Model", "Divalent Bridging"],
      },
      {
        title: "Membrane Genesis",
        prose:
          "The shell thickens from the outside inward until its own bulk strangles the ion current. Timing is the whole craft: seconds separate a trembling membrane from a solid bead.",
        dataPoint: { label: "BATH_WINDOW", value: "30–180 s" },
      },
      {
        title: "The pH Gate",
        prose:
          "Below the gate the carboxyl groups protonate and the alginate refuses to gel. Acidic essences must be buffered with citrate before they may be enclosed.",
        dataPoint: { label: "pH_FLOOR", value: "3.8" },
      },
    ],
    image: "/images/methods/spherification.webp",
    imageAlt:
      "Scientific diagram of spherification as ionic encapsulation: a forever-liquid core sealed within a self-assembling gel reliquary, with divalent calcium cross-linking alginate into the egg-box configuration and a semi-permeable membrane thickening from the boundary inward, rendered as glowing electric magenta and cyan plasma alchemical symbols on an obsidian field.",
    accent: "plasma",
  },

  gelification: {
    epithet: "The Crystalline Architecture",
    classification: "SOL_GEL_TRANSMUTATION",
    tagline:
      "Liquid chaos disciplined into standing structure. Dissolved polymer chains cool into helices and junction zones, raising a three-dimensional scaffold that holds an ocean of water motionless.",
    stateChips: [
      { label: "PHASE", value: "SOL → GEL" },
      { label: "NETWORK", value: "POLYMER 3D" },
    ],
    kinetics: {
      voltage: "MODERATE / TRANSIENT",
      current: "GRADUAL (POLYMERIC)",
      prose:
        "A brief thermal voltage dissolves the lattice-to-be; as the charge bleeds away, the current condenses into structure rather than dissipating. The set gel is a capacitor of texture — energy stored as standing architecture.",
      equations: [
        {
          expression: "p_c = 1 / (f − 1)",
          label: "GELATION_THRESHOLD",
          note: "Flory–Stockmayer criterion — the critical bond fraction at which an infinite network emerges from the sol; f = polymer functionality.",
        },
      ],
    },
    elementalRoles: {
      Earth: "Scaffold",
      Water: "Captive",
    },
    descriptorTags: ["Elastic", "Translucent", "Thermoreversible"],
    planetaryRulers: [
      { planet: "Saturn", rank: "primary", governs: "STRUCTURE, CRYSTALLINE ORDER" },
      { planet: "Mercury", rank: "secondary", governs: "PRECISION, RATIO" },
    ],
    molecularInteractions: [
      {
        title: "Junction Zone Formation",
        prose:
          "On cooling, dissolved polysaccharide coils wind into double helices that aggregate into junction zones — the rivets of the standing network. Between them, water is held captive in nanoscale chambers.",
        tags: ["Helix-Coil Transition", "Hydrogen Bonding"],
        temperatureRange: "35°C – 40°C",
      },
      {
        title: "Water Imprisonment",
        prose:
          "A vanishing fraction of polymer disciplines an overwhelming mass of solvent. The architecture is almost entirely its prisoner — remove the scaffold and the structure collapses back to liquid.",
        dataPoint: { label: "WATER_FRACTION", value: "> 99 %" },
      },
      {
        title: "Syneresis",
        prose:
          "An over-tightened lattice weeps: junction zones contract over time and expel their captive water. The architect's failure mode, countered by co-polymer synergy and exact concentration.",
        tags: ["Network Contraction", "Water Expulsion"],
      },
    ],
    image: "/images/methods/gelification.webp",
    imageAlt:
      "Scientific diagram of gelification as crystalline architecture: dissolved polymer chains cooling into a three-dimensional scaffold that holds an ocean of water motionless, with junction-zone double helices and hydrogen-bonded captive water rendered as glowing emerald green and silver alchemical symbols on an obsidian field.",
    accent: "emerald",
  },

  cryo_cooking: {
    epithet: "The Vitreous Arrest",
    classification: "CRYOGENIC_VITRIFICATION",
    tagline:
      "Transformation by absolute cold. Liquid nitrogen at −196°C extracts thermal energy faster than crystals can organize, arresting the substrate in a glass-like instant.",
    stateChips: [
      { label: "FIELD", value: "−196°C LN₂" },
      { label: "STATE", value: "VITRIFIED" },
    ],
    kinetics: {
      voltage: "EXTREME (INVERTED)",
      current: "MASSIVE (HEAT EXTRACTION)",
      catalyst: "LEIDENFROST_FILM",
      prose:
        "The circuit runs in reverse: an extreme negative voltage between substrate and cryogen drives a violent extraction current outward. Nucleation is outpaced — water has no time to crystallize and sets as glass.",
      equations: [
        {
          expression: "dT/dt = −(hA / mc) · (T − T∞)",
          label: "COOLING_LAW",
          note: "Newton's law of cooling — with T∞ = −196°C the gradient is steep enough to outrun crystal growth.",
        },
        {
          expression: "J = J₀ · e^(−ΔG*/kᴮT)",
          label: "NUCLEATION_RATE",
          note: "Classical nucleation theory — flash extraction denies water the time to organize into large lattices.",
        },
      ],
    },
    elementalRoles: {
      Air: "Cryogen",
      Water: "Vitrified",
    },
    descriptorTags: ["Instant", "Vitreous", "Shattering"],
    planetaryRulers: [
      { planet: "Uranus", rank: "primary", governs: "SHOCK, INSTANTANEOUS ARREST" },
      { planet: "Saturn", rank: "secondary", governs: "COLD, STASIS" },
    ],
    molecularInteractions: [
      {
        title: "Ice-Crystal Suppression",
        prose:
          "Heat is extracted faster than water molecules can assemble into large hexagonal lattices. Only micro-crystals form, leaving cell walls unpunctured and texture intact upon the return to warmth.",
        tags: ["Nucleation Bypass", "Microcrystalline Ice"],
        dataPoint: { label: "CRYSTAL_SCALE", value: "< 5 µm" },
      },
      {
        title: "Matrix Vitrification",
        prose:
          "Below the glass-transition threshold the concentrated sugar-water phase ceases to flow, setting as amorphous glass rather than crystal. Molecular motion is arrested; decay is suspended.",
        dataPoint: { label: "Tg′ (SUCROSE)", value: "≈ −32 °C" },
      },
      {
        title: "Leidenfrost Sheath",
        prose:
          "On contact the cryogen flash-boils, wrapping the substrate in an insulating nitrogen vapor film. The sheath meters the extraction, preventing surface fracture before the core has set.",
        formula: "N₂(l) → N₂(g)  (ΔH_vap = 199 kJ/kg)",
      },
    ],
    checklist: [
      "Ice crystal diameter held below cellular rupture threshold",
      "Volatile aromatics locked at full potency",
      "All nitrogen fully vaporized before service",
    ],
    image: "/images/methods/cryo_cooking.webp",
    imageAlt:
      "Scientific diagram of cryogenic vitrification (The Vitreous Arrest): an inverted heat-extraction circuit driving liquid nitrogen to flash-freeze a substrate, with ice-crystal suppression and a Leidenfrost vapor sheath rendered as glowing electric magenta and cyan plasma alchemical symbols on an obsidian field.",
    accent: "plasma",
  },
};
