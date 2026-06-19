/**
 * Alchemical profiles — wet methods.
 * Braising and steaming content transcribed from the stitch "Alchemical
 * Culinary Kinetics" design package (alchemical_profile_braising,
 * alchemical_profile_sublimation); remaining methods authored in the
 * same voice.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const wetMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  braising: {
    epithet: "The Aqueous Transmutation",
    classification: "AQUEOUS_TRANSMUTATION",
    tagline:
      "The methodical synthesis of moisture and sustained thermal energy, inducing deep structural breakdown of dense organic matrices.",
    stateChips: [
      { label: "VOLTAGE", value: "LOW / CONSTANT" },
      { label: "TELEMETRY", value: "CONVECTIVE_FLUID_DYNAMICS" },
    ],
    kinetics: {
      voltage: "LOW / CONSTANT",
      current: "FLUID (CONVECTION)",
      prose:
        "A low, constant thermal voltage drives a fluid convective current through the sealed vessel. Energy delivery is patient and total: the medium cycles endlessly, carrying heat into the densest matrices without scorching the boundary layer.",
      equations: [
        {
          expression: "ΔT = Q / (m · c)",
          label: "THERMAL_EQUATION",
          note: "Temperature rise of the braising medium per unit of absorbed energy.",
        },
        {
          expression: "Rate = k[H2O][Organic]",
          label: "HYDROLYSIS_RATE",
        },
      ],
    },
    elementalRoles: {
      Water: "Dominance",
      Earth: "Softening",
      Fire: "Initiator",
    },
    planetaryRulers: [
      { planet: "Moon", rank: "primary", governs: "FLUID CYCLES, IMMERSION" },
      { planet: "Saturn", rank: "secondary", governs: "TIME, STRUCTURAL YIELD" },
    ],
    molecularInteractions: [
      {
        title: "Collagen Breakdown & Hydration",
        prose:
          "Prolonged thermal exposure in an aqueous medium initiates the hydrolysis of dense connective tissues. Triple-helix collagen structures denature, unraveling into hydrophilic gelatin chains, profoundly altering textural integrity.",
        tags: ["Hydrolysis", "Denaturation"],
        temperatureRange: "71°C – 85°C",
      },
      {
        title: "Bidirectional Flavor Exchange",
        prose:
          "The sealed convective loop runs an equivalent exchange: soluble compounds leach outward into the braising liquor while aromatic volatiles infiltrate the loosened matrix. Neither phase survives unchanged.",
        tags: ["Diffusion", "Osmotic Exchange"],
      },
    ],
    image: "/images/methods/braising.webp",
    imageAlt:
      "Scientific diagram of braising: slow convective heat circulating through a sealed vessel, with collagen hydrolysis shown as glowing cyan alchemical symbols.",
    accent: "aqueous",
  },

  steaming: {
    epithet: "The Ethereal Phase Shift",
    classification: "VAPOR_TRANSMUTATION",
    tagline:
      "A high-velocity transmutation from solid matrix to ethereal vapor. This process circumvents the liquid phase, allowing for delicate preservation of molecular structures and gentle tissue expansion through aqueous atmosphere.",
    stateChips: [
      { label: "STATE_VELOCITY", value: "HIGH_V" },
      { label: "TEMP_DELTA", value: "ΔT > 100°C" },
    ],
    kinetics: {
      voltage: "HIGH (PHASE SHIFT)",
      current: "GENTLE (VAPOR)",
      prose:
        "Steaming is characterized by a high-velocity phase shift voltage (V) paired with a gentle, consistent vapor current (I). The resulting kinetic energy transfer ensures rapid yet non-destructive penetration of the primary matrix.",
      equations: [
        {
          expression: "Phase_Shift_Energy = L · m",
          label: "THERMODYNAMIC_EQUATION",
          note: "Where L = Latent Heat of Vaporization, m = Mass.",
        },
      ],
    },
    elementalRoles: {
      Air: "Carrier",
      Water: "Phase Medium",
    },
    descriptorTags: ["Vaporous", "Expanding", "Ascending"],
    planetaryRulers: [
      { planet: "Moon", rank: "primary", governs: "FLUID DYNAMICS, RECEPTIVITY" },
      {
        planet: "Mercury",
        rank: "secondary",
        governs: "VOLATILITY, TRANSFER",
      },
    ],
    molecularInteractions: [
      {
        title: "Gentle Tissue Expansion",
        prose:
          "The ethereal nature of this phase shift facilitates supreme nutrient preservation. As the aqueous vapor permeates the solid matrix, it induces a gentle tissue expansion. This swelling opens molecular pathways without rupturing cellular walls, unlike aggressive thermal agitation (boiling) or direct radiant heat (roasting).",
        tags: ["Condensation Transfer", "Cellular Integrity"],
      },
      {
        title: "Latent Heat Delivery",
        prose:
          "Each gram of condensing vapor surrenders its full latent reserve directly onto the substrate surface — an energy density no liquid bath can match, delivered at a fixed, incorruptible 100°C ceiling.",
        formula: "H2O(g) → H2O(l) + 2257 J/g",
      },
    ],
    checklist: [
      "Cellular integrity maintained >94%",
      "Hydrophilic compound retention optimized",
      "Minimal thermal degradation of volatile aromatics",
    ],
    image: "/images/methods/sublimation.webp",
    imageAlt:
      "Scientific diagram of steam vaporization: vapor current trajectory and gentle tissue expansion rendered as glowing cyan alchemical symbols.",
    accent: "plasma",
  },

  boiling: {
    epithet: "The Turbulent Dissolution",
    classification: "CONVECTIVE_AGITATION",
    tagline:
      "Full immersion in water driven to its phase ceiling. Nucleate vapor columns hammer the substrate in rolling turbulence, dissolving structure at maximum aqueous velocity.",
    stateChips: [
      { label: "CEILING", value: "100°C / 212°F" },
      { label: "REGIME", value: "NUCLEATE_TURBULENT" },
    ],
    kinetics: {
      voltage: "FIXED (PHASE CEILING)",
      current: "TURBULENT (ROLLING)",
      prose:
        "Voltage is capped at the boiling point — no skill can raise it — while the current runs maximally turbulent. Vapor nucleation sites detonate continuously along the vessel floor, churning the medium into a violent convective engine.",
      equations: [
        {
          expression: "q = h · A · (Ts − T∞)",
          label: "CONVECTION_EQUATION",
          note: "Newton's law of cooling — heat flux scales with the surface/medium differential.",
        },
      ],
    },
    elementalRoles: {
      Water: "Dominance",
      Fire: "Driver",
    },
    planetaryRulers: [
      { planet: "Moon", rank: "primary", governs: "IMMERSION, TIDAL MOTION" },
      { planet: "Neptune", rank: "secondary", governs: "DISSOLUTION, DEPTH" },
    ],
    molecularInteractions: [
      {
        title: "Starch Gelatinization",
        prose:
          "Above 60°C, crystalline starch granules drink the surrounding medium and swell into amorphous gels. The turbulent bath delivers water and heat simultaneously — the canonical engine for pasta, grains, and tubers.",
        temperatureRange: "60°C – 80°C",
        tags: ["Gelatinization", "Amylose Leaching"],
      },
      {
        title: "Solute Extraction",
        prose:
          "Rolling convection strips soluble vitamins, minerals, and flavor compounds into the liquid phase. The dissolution is indiscriminate: what the substrate loses, the broth inherits — equivalent exchange in its purest culinary form.",
        tags: ["Leaching", "Thermal Diffusion"],
      },
    ],
    image: "/images/methods/boiling.webp",
    imageAlt:
      "Scientific diagram of boiling, the turbulent dissolution: nucleate vapor columns and rolling convective turbulence hammering a submerged substrate, with starch gelatinization swelling granules into amorphous gels and indiscriminate solute extraction leaching into the broth, annotated in glowing aqueous blue and teal alchemical symbols on an obsidian field.",
    accent: "aqueous",
  },

  poaching: {
    epithet: "The Tender Suspension",
    classification: "SUB_THERMAL_IMMERSION",
    tagline:
      "Suspension in a bath held deliberately below the boil. Proteins set in silence — no turbulence, no violence — only a barely-trembling medium coaxing structure into place.",
    stateChips: [
      { label: "WINDOW", value: "71–82°C" },
      { label: "SURFACE", value: "TREMBLING" },
    ],
    kinetics: {
      voltage: "GENTLE / SUB-CRITICAL",
      current: "LAMINAR (WHISPER)",
      prose:
        "The lowest workable voltage in the aqueous family, paired with a laminar current that never breaks into turbulence. Heat seeps rather than strikes; the substrate is persuaded, not conquered.",
      equations: [
        {
          expression: "T_bath ∈ [71°C, 82°C]",
          label: "OPERATING_WINDOW",
          note: "Below nucleation threshold — convection remains laminar.",
        },
      ],
    },
    elementalRoles: {
      Water: "Cradle",
      Air: "Subtle Convection",
    },
    descriptorTags: ["Laminar", "Delicate", "Suspended"],
    planetaryRulers: [
      { planet: "Venus", rank: "primary", governs: "HARMONY, TENDERNESS" },
      { planet: "Neptune", rank: "secondary", governs: "SUBTLETY, IMMERSION" },
    ],
    molecularInteractions: [
      {
        title: "Gentle Protein Coagulation",
        prose:
          "Albumins and globulins unfold and re-knit at the precise threshold of denaturation, never tightening into rubber. The egg poached at 63°C is the proof-text: white set, yolk fluid, structure held in suspension.",
        temperatureRange: "62°C – 70°C",
        tags: ["Denaturation", "Soft Set"],
      },
      {
        title: "Aromatic Court-Bouillon Exchange",
        prose:
          "The still medium permits deliberate seasoning of the bath itself — wine acids, mirepoix volatiles, and saline gradients migrate inward at diffusion pace, perfuming without erosion.",
        tags: ["Diffusion", "Infusion"],
      },
    ],
    image: "/images/methods/poaching.webp",
    imageAlt:
      "Scientific diagram of poaching as tender suspension: an organic matrix cradled in a sub-boil bath with laminar whisper convection coaxing structure into place, gentle protein coagulation and diffusion-pace court-bouillon infusion rendered as glowing aqueous blue and teal alchemical symbols on an obsidian field.",
    accent: "aqueous",
  },

  simmering: {
    epithet: "The Patient Convection",
    classification: "THRESHOLD_CONVECTION",
    tagline:
      "The discipline of the threshold: a medium held at the very edge of the boil, where single bubbles rise slowly and extraction proceeds without destruction.",
    stateChips: [
      { label: "WINDOW", value: "85–96°C" },
      { label: "REGIME", value: "SUB_BOIL" },
    ],
    kinetics: {
      voltage: "MODERATE / EDGE-HELD",
      current: "STEADY (SLOW ROLL)",
      prose:
        "Voltage rides just beneath the phase ceiling; current circulates in slow, continuous loops. The system is a controlled extraction column — energetic enough to dissolve, restrained enough to clarify.",
      equations: [
        {
          expression: "k = A · e^(−Ea/RT)",
          label: "EXTRACTION_KINETICS",
          note: "Arrhenius — extraction rate climbs with temperature yet stays below the agitation that clouds the medium.",
        },
      ],
    },
    elementalRoles: {
      Water: "Extractor",
      Fire: "Restraint",
    },
    planetaryRulers: [
      { planet: "Moon", rank: "primary", governs: "SLOW TIDES, PATIENCE" },
      { planet: "Venus", rank: "secondary", governs: "HARMONIC BLENDING" },
    ],
    molecularInteractions: [
      {
        title: "Stock Clarification",
        prose:
          "At the sub-boil, coagulated proteins raft on the surface instead of being churned back into suspension. The column below runs clear — the difference between consommé and cloud is a handful of degrees.",
        temperatureRange: "85°C – 96°C",
        tags: ["Protein Rafting", "Clarity"],
      },
      {
        title: "Slow Collagen Conversion",
        prose:
          "Hours at the threshold convert connective tissue to gelatin without shredding muscle fibers — the long braise's open-vessel sibling, trading enclosure for evaporative concentration.",
        tags: ["Gelatin Conversion", "Reduction"],
      },
    ],
    image: "/images/methods/simmering.webp",
    imageAlt:
      "Scientific diagram of simmering, the patient convection: a medium held at the sub-boil threshold with single bubbles rising in slow convection loops, extraction proceeding without destruction, protein rafting toward clarity and slow collagen-to-gelatin conversion rendered as glowing aqueous blue and teal alchemical symbols on an obsidian field.",
    accent: "aqueous",
  },

  pressure_cooking: {
    epithet: "The Sealed Acceleration",
    classification: "BAROMETRIC_OVERDRIVE",
    tagline:
      "A hermetic vessel that abolishes the boiling ceiling. Pressure rewrites the phase diagram: water superheats past 120°C, and hours of transformation collapse into minutes.",
    stateChips: [
      { label: "PRESSURE", value: "+15 PSI" },
      { label: "CEILING", value: "≈121°C / 250°F" },
    ],
    kinetics: {
      voltage: "ELEVATED (SUPERHEATED)",
      current: "FORCED (SATURATED STEAM)",
      catalyst: "PRESSURE_FIELD",
      prose:
        "The sealed field raises the attainable voltage beyond any open vessel, while saturated steam delivers current at maximum density. Every reaction obeying Arrhenius runs multiples faster inside the lock.",
      equations: [
        {
          expression: "ln(P2/P1) = −(ΔHvap/R)(1/T2 − 1/T1)",
          label: "CLAUSIUS_CLAPEYRON",
          note: "The pressure/boiling-point exchange rate — +15 psi buys ≈21°C of ceiling.",
        },
      ],
    },
    elementalRoles: {
      Water: "Superheated Medium",
      Fire: "Compressed Driver",
      Earth: "Vessel Seal",
    },
    descriptorTags: ["Hermetic", "Accelerated", "Saturated"],
    planetaryRulers: [
      { planet: "Mars", rank: "primary", governs: "FORCE, ACCELERATION" },
      { planet: "Saturn", rank: "secondary", governs: "CONTAINMENT, LIMITS" },
    ],
    molecularInteractions: [
      {
        title: "Accelerated Collagen Hydrolysis",
        prose:
          "At 121°C the gelatin conversion that demands an afternoon at the simmer completes inside forty minutes. The superheated medium drives water into the triple helix at overdrive rates.",
        temperatureRange: "115°C – 121°C",
        tags: ["Hydrolysis", "Rate Multiplication"],
      },
      {
        title: "Closed-Loop Volatile Retention",
        prose:
          "Nothing escapes the lock. Aromatics that an open pot exhales are condensed and returned, cycling through the substrate in a sealed distillation of its own essence.",
        tags: ["Volatile Retention", "Reflux"],
      },
    ],
    image: "/images/methods/pressure_cooking.webp",
    imageAlt:
      "Scientific diagram of pressure cooking as sealed acceleration: a hermetic vessel abolishing the boiling ceiling with superheated saturated steam, showing accelerated collagen hydrolysis and closed-loop volatile reflux rendered as glowing electric magenta and cyan plasma alchemical symbols on an obsidian field.",
    accent: "plasma",
  },

  sous_vide: {
    epithet: "The Hermetic Equilibrium",
    classification: "ISOTHERMAL_PRECISION",
    tagline:
      "Matter sealed in vacuum and lowered into a bath that is exactly — not approximately — the target temperature. Gradient abolished, time dilated, the transformation arrives at equilibrium and simply stops.",
    stateChips: [
      { label: "GRADIENT", value: "ΔT → 0" },
      { label: "FIELD", value: "VACUUM_SEALED" },
    ],
    kinetics: {
      voltage: "EXACT / SETPOINT",
      current: "TOTAL (CONFORMAL CONTACT)",
      prose:
        "Voltage equals the desired final state — no more — while the circulating bath supplies a perfectly conformal current through the vacuum interface. The system asymptotically approaches its setpoint and holds there indefinitely: kinetics as a controlled equilibrium rather than a race.",
      equations: [
        {
          expression: "T_core(t) = T_bath − ΔT0 · e^(−t/τ)",
          label: "EQUILIBRIUM_APPROACH",
          note: "Exponential convergence of core temperature to the bath setpoint.",
        },
      ],
    },
    elementalRoles: {
      Water: "Isothermal Field",
      Earth: "Structural Hold",
    },
    descriptorTags: ["Isothermal", "Sealed", "Exact"],
    planetaryRulers: [
      { planet: "Mercury", rank: "primary", governs: "PRECISION, MEASUREMENT" },
      { planet: "Saturn", rank: "secondary", governs: "STABILITY, CONTROL" },
    ],
    molecularInteractions: [
      {
        title: "Threshold-Exact Denaturation",
        prose:
          "Each protein has its own unfolding temperature — myosin at 50°C, actin at 66°C. The bath is set between thresholds, denaturing precisely the targets and nothing else. Edge-to-edge doneness with zero gradient.",
        temperatureRange: "50°C – 66°C",
        tags: ["Selective Denaturation", "Zero Gradient"],
      },
      {
        title: "Anaerobic Flavor Conservation",
        prose:
          "The vacuum strips the oxidative atmosphere. Volatiles cannot escape and oxygen cannot intrude — the sealed pouch becomes a closed thermodynamic system conserving every aromatic mole.",
        tags: ["Anaerobic", "Volatile Conservation"],
      },
    ],
    checklist: [
      "Core/surface gradient eliminated",
      "Moisture loss <5% versus ~25% conventional",
      "Oxidative degradation nullified by vacuum",
    ],
    image: "/images/methods/sous_vide.webp",
    imageAlt:
      "Scientific diagram of sous vide as hermetic equilibrium: a vacuum-sealed organic matrix held at an exact isothermal setpoint with its thermal gradient abolished, threshold-exact protein denaturation and anaerobic volatile conservation rendered as glowing electric magenta and cyan plasma alchemical symbols on an obsidian field.",
    accent: "plasma",
  },

  stewing: {
    epithet: "The Unified Dissolution",
    classification: "TOTAL_IMMERSION_SYNTHESIS",
    tagline:
      "Small matter, fully submerged, surrendered to the medium over hours. Substrate and liquid abandon their separate identities and converge into a single unified body.",
    stateChips: [
      { label: "IMMERSION", value: "TOTAL" },
      { label: "PHASE", value: "CONVERGENT" },
    ],
    kinetics: {
      voltage: "LOW / SUSTAINED",
      current: "ENVELOPING (FULL CONTACT)",
      prose:
        "A low sustained voltage applied through a current that touches every surface at once — total immersion means no shadowed faces, no gradients of exposure. The exchange runs to completion in both directions.",
      equations: [
        {
          expression: "C_broth(t) → C_solid(t)",
          label: "CONVERGENCE_RELATION",
          note: "Solute concentrations of medium and substrate converge as t → hours.",
        },
      ],
    },
    elementalRoles: {
      Water: "Unifier",
      Earth: "Body",
      Fire: "Patient Driver",
    },
    planetaryRulers: [
      { planet: "Moon", rank: "primary", governs: "ABSORPTION, NOURISHMENT" },
      { planet: "Saturn", rank: "secondary", governs: "DURATION, REDUCTION" },
    ],
    molecularInteractions: [
      {
        title: "Mutual Saturation",
        prose:
          "Cut small and drowned deep, the substrate's full surface area trades with the medium until neither holds an advantage. The stew is the only preparation where the liquid is not a vehicle but a co-equal product.",
        tags: ["Equilibration", "Surface Maximization"],
      },
      {
        title: "Starch-Bound Emulsion",
        prose:
          "Leached starches and dissolved gelatin thicken the medium into a colloidal body that suspends fat droplets and flavor compounds alike — the broth literally binds the dish together.",
        tags: ["Colloid Formation", "Viscosity"],
      },
    ],
    image: "/images/methods/stewing.webp",
    imageAlt:
      "Scientific diagram of stewing as the Unified Dissolution: fully submerged matter and its enveloping medium converging into a single body through total immersion, with mutual saturation equilibrium and a starch-bound colloidal emulsion rendered as glowing aqueous blue and teal alchemical symbols on an obsidian field.",
    accent: "aqueous",
  },
};
