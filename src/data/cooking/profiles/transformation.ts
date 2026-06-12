/**
 * Alchemical profiles — transformation methods.
 * Smoking adapts the smoke-side content of the stitch "Combustion
 * (Grilling/Smoking)" design; the rest are authored in the same voice.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const transformationMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  smoking: {
    epithet: "The Phenolic Veil",
    classification: "PYROLYTIC_INFUSION",
    tagline:
      "Smoldering wood exhaled over suspended matter. A dense particle current of phenols and carbonyls settles onto the substrate, binding a preservative veil of flavor one molecular layer at a time.",
    stateChips: [
      { label: "PARTICLE_CURRENT", value: "45 CFM" },
      { label: "REGIME", value: "LOW_AND_SLOW" },
    ],
    kinetics: {
      voltage: "LOW / SMOLDERING",
      current: "DENSE (PARTICLE FLUX)",
      prose:
        "Voltage is deliberately suppressed — the wood must smolder, never flame — while the operative current is a high-density smoke particle flux. Energy arrives second-hand; chemistry arrives first.",
      equations: [
        {
          expression: "Q = mcΔT + Smoke_Infusion_Rate",
          label: "GOVERNING_EQUATION",
          note: "Total transformation couples slow thermal absorption with continuous particulate deposition.",
        },
      ],
    },
    elementalRoles: {
      Air: "Carrier Current",
      Fire: "Smolder Source",
      Earth: "Cured Body",
    },
    descriptorTags: ["Smoldering", "Deposited", "Preserving"],
    planetaryRulers: [
      { planet: "Mars", rank: "primary", governs: "FIRE DISCIPLINE, ENDURANCE" },
      { planet: "Jupiter", rank: "secondary", governs: "EXPANSIVE SMOKE, ABUNDANCE" },
    ],
    rulershipNote:
      "Orbital alignment dictates aggressive thermal application tempered by expansive smoke exposure.",
    molecularInteractions: [
      {
        title: "Phenolic Binding",
        prose:
          "Guaiacol and syringol deposition altering flavor profile matrices. Lignin pyrolysis releases the phenol family that defines smoke — each compound docking onto surface proteins as both preservative and signature.",
        formula: "C6H5OH → C7H8O2",
        tags: ["Guaiacol", "Syringol", "Lignin Pyrolysis"],
      },
      {
        title: "Pellicle Adhesion Layer",
        prose:
          "A tacky surface film of dissolved proteins — the pellicle — forms during pre-drying and becomes the binding site for the particle current. Without the veil's anchor, smoke slides off unclaimed.",
        tags: ["Pellicle", "Surface Chemistry"],
        dataPoint: { label: "SMOKE_RING_DEPTH", value: "≤ 8 mm" },
      },
      {
        title: "Nitric Oxide Penetration",
        prose:
          "Combustion gases carry NO into the outer myoglobin band, fixing the rosy smoke ring — a visible record of gas-phase chemistry written into the muscle itself.",
        temperatureRange: "< 60°C (ring formation window)",
      },
    ],
    image: "/images/methods/combustion.webp",
    imageAlt:
      "Scientific diagram of combustion smoking: thermal energy transfer from charcoal and wood with smoke particle infusion and phenolic compounds rendered as glowing ember alchemical symbols.",
    accent: "ember",
  },

  curing: {
    epithet: "The Saline Mummification",
    classification: "OSMOTIC_DESICCATION",
    tagline:
      "Salt applied as a slow crystalline siege. Water activity collapses below the threshold of decay, and the substrate is rewritten into a denser, older, immortal version of itself.",
    stateChips: [
      { label: "TARGET", value: "aW < 0.85" },
      { label: "FIELD", value: "HYPERTONIC" },
    ],
    kinetics: {
      voltage: "NULL / AMBIENT",
      current: "OSMOTIC (CRYSTALLINE)",
      prose:
        "No thermal voltage at all — the entire transformation runs on osmotic current. The hypertonic salt field pulls water outward grain by grain, a pressure differential measured in weeks.",
      equations: [
        {
          expression: "aW = p / p0",
          label: "WATER_ACTIVITY",
          note: "Vapor-pressure ratio — microbial life fails below ≈0.85; full cures push toward 0.75.",
        },
      ],
    },
    elementalRoles: {
      Earth: "Crystalline Agent",
      Air: "Drying Field",
      Water: "Expelled Phase",
    },
    descriptorTags: ["Hypertonic", "Patient", "Preserving"],
    planetaryRulers: [
      { planet: "Saturn", rank: "primary", governs: "TIME, PRESERVATION, STRUCTURE" },
      { planet: "Mars", rank: "secondary", governs: "SALT DISCIPLINE, IRON HUES" },
    ],
    molecularInteractions: [
      {
        title: "Osmotic Dehydration",
        prose:
          "The salt bed establishes a brutal concentration gradient across every cell membrane. Water migrates outward along it; salt and cure aromatics migrate in. Density rises, decay loses its medium.",
        tags: ["Osmosis", "Water Activity Collapse"],
      },
      {
        title: "Nitrosomyoglobin Fixation",
        prose:
          "Nitrite reduces to nitric oxide and binds myoglobin into the stable rose pigment of cured flesh — chemistry as embalming art, color as proof of preservation.",
        formula: "Mb + NO → MbNO",
        tags: ["Nitrite Chemistry", "Pigment Fixation"],
      },
    ],
    accent: "emerald",
  },

  dehydrating: {
    epithet: "The Solar Reduction",
    classification: "AEOLIAN_DESICCATION",
    tagline:
      "Sustained warm air drawn across matter until the water surrenders. What remains is the substrate's essence at quadruple concentration — flavor as a fossil of its former self.",
    stateChips: [
      { label: "AIRFLOW", value: "SUSTAINED" },
      { label: "TARGET", value: "MOISTURE < 20%" },
    ],
    kinetics: {
      voltage: "LOW / WARM",
      current: "AEOLIAN (AIR DRIVEN)",
      prose:
        "A whisper of thermal voltage paired with a relentless air current. The system never cooks — it escorts water molecules off the surface as fast as capillarity can deliver them.",
      equations: [
        {
          expression: "ṁ = h_m · A · (Cs − C∞)",
          label: "MASS_TRANSFER_EQUATION",
          note: "Evaporation rate scales with surface area and the humidity differential of the moving air.",
        },
      ],
    },
    elementalRoles: {
      Air: "Dominance",
      Fire: "Gentle Driver",
      Water: "Departing Phase",
    },
    descriptorTags: ["Arid", "Concentrated", "Shelf-Stable"],
    planetaryRulers: [
      { planet: "Sun", rank: "primary", governs: "DESICCATION, RADIANT PATIENCE" },
      { planet: "Mercury", rank: "secondary", governs: "AIRFLOW, EXCHANGE" },
    ],
    molecularInteractions: [
      {
        title: "Capillary Moisture Migration",
        prose:
          "Interior water wicks outward through cellular capillaries to replace what the air current claims. Run the voltage too high and the surface case-hardens, sealing moisture inside to spoil — the cardinal failure of the impatient.",
        tags: ["Capillarity", "Case Hardening"],
      },
      {
        title: "Flavor Concentration",
        prose:
          "Sugars, acids, and glutamates remain while their solvent departs — concentration factors of 4–6× rewrite the substrate's flavor signature into something denser and darker.",
        dataPoint: { label: "CONCENTRATION_FACTOR", value: "4–6×" },
      },
    ],
    accent: "solar",
  },

  infusing: {
    epithet: "The Essence Transfer",
    classification: "SOLVENT_EXTRACTION",
    tagline:
      "A carrier medium sent into aromatic matter to carry its soul back out. Volatile essences migrate down their gradients into oil, spirit, or water — presence transferred without the body.",
    stateChips: [
      { label: "MODE", value: "PARTITION" },
      { label: "CARRIER", value: "OIL / SPIRIT / WATER" },
    ],
    kinetics: {
      voltage: "MINIMAL / OPTIONAL",
      current: "DIFFUSIVE (SOLVENT)",
      prose:
        "Voltage is nearly irrelevant — warmth merely accelerates. The true current is solvent diffusion: aromatic molecules partitioning out of the source matrix into whichever carrier offers them better solubility.",
      equations: [
        {
          expression: "K = C_carrier / C_source",
          label: "PARTITION_COEFFICIENT",
          note: "Equilibrium ratio — lipophilic essences favor oil carriers, polar essences favor water or ethanol.",
        },
      ],
    },
    elementalRoles: {
      Water: "Carrier",
      Air: "Volatile Cargo",
    },
    descriptorTags: ["Diffusive", "Aromatic", "Subtle"],
    planetaryRulers: [
      { planet: "Neptune", rank: "primary", governs: "ESSENCE, PERMEATION" },
      { planet: "Venus", rank: "secondary", governs: "PERFUME, HARMONY" },
    ],
    molecularInteractions: [
      {
        title: "Volatile Partition Migration",
        prose:
          "Terpenes, capsaicinoids, and aromatic oils abandon ruptured cell structures for the surrounding carrier, obeying their partition coefficients. The infusion is complete when the gradient dies.",
        tags: ["Partition", "Terpene Transfer"],
      },
      {
        title: "Carrier Saturation Curve",
        prose:
          "Transfer velocity decays exponentially as the carrier approaches saturation — the first hour moves more essence than the next ten. Time beyond equilibrium extracts only bitterness.",
        tags: ["Saturation", "Diminishing Returns"],
      },
    ],
    accent: "violet",
  },

  distilling: {
    epithet: "The Spirit Extraction",
    classification: "VAPOR_SEPARATION",
    tagline:
      "The literal alchemical act: matter boiled until its spirit rises, the vapor caught and condensed apart from its body. Separation by volatility — the oldest transmutation still practiced.",
    stateChips: [
      { label: "MODE", value: "REFLUX / CONDENSE" },
      { label: "CUT", value: "HEARTS_ONLY" },
    ],
    kinetics: {
      voltage: "CONTROLLED (FRACTIONAL)",
      current: "ASCENDING (VAPOR)",
      catalyst: "CONDENSATION_GRADIENT",
      prose:
        "Voltage is tuned to the boiling point of the target fraction; the current is the vapor column itself, ascending, refluxing, and surrendering its cargo to the condenser. Each pass purifies.",
      equations: [
        {
          expression: "P_total = Σ xᵢ · Pᵢ°",
          label: "RAOULTS_LAW",
          note: "Vapor composition is enriched in the more volatile component — the principle every still exploits.",
        },
      ],
    },
    elementalRoles: {
      Fire: "Driver",
      Air: "Risen Spirit",
      Water: "Returned Body",
    },
    descriptorTags: ["Volatile", "Purified", "Ascendant"],
    planetaryRulers: [
      { planet: "Mercury", rank: "primary", governs: "VOLATILITY, REFINEMENT" },
      { planet: "Sun", rank: "secondary", governs: "FIRE OF SEPARATION" },
    ],
    molecularInteractions: [
      {
        title: "Fractional Volatility Separation",
        prose:
          "Methanol foreshots rise first, ethanol hearts follow, fusel tails lag behind — the column sorts molecules by boiling point, and the distiller's blade falls between fractions.",
        temperatureRange: "64.7°C – 78.4°C – 100°C",
        tags: ["Fractionation", "Boiling Points"],
      },
      {
        title: "Congener Concentration",
        prose:
          "Esters and aldehydes hitchhike with the hearts in trace amounts, carrying the source material's signature through the phase change. Spirit without congeners is mere solvent.",
        tags: ["Esters", "Aroma Carriage"],
      },
    ],
    accent: "violet",
  },

  marinating: {
    epithet: "The Surface Communion",
    classification: "ACID_ENZYME_BAPTISM",
    tagline:
      "Immersion in an active bath of acids, enzymes, and dissolved aromatics. The marinade negotiates with the outer millimeters — denaturing, tenderizing, and seasoning the frontier before fire ever arrives.",
    stateChips: [
      { label: "DEPTH", value: "≤ 5 mm" },
      { label: "FIELD", value: "ACID / ENZYME" },
    ],
    kinetics: {
      voltage: "NULL / COLD",
      current: "CHEMICAL (SURFACE)",
      prose:
        "Zero thermal voltage; the current is purely chemical. Hydrogen ions and proteolytic enzymes work the boundary layer while oil-borne aromatics queue behind them — a slow chemical siege of the surface.",
      equations: [
        {
          expression: "x = √(2Dt)",
          label: "PENETRATION_DEPTH",
          note: "Diffusion-limited — marinade chemistry advances millimeters per hour, never to the core.",
        },
      ],
    },
    elementalRoles: {
      Water: "Active Bath",
      Earth: "Bound Surface",
    },
    descriptorTags: ["Acidic", "Enzymatic", "Anticipatory"],
    planetaryRulers: [
      { planet: "Venus", rank: "primary", governs: "FLAVOR HARMONY, PREPARATION" },
      { planet: "Neptune", rank: "secondary", governs: "IMMERSION, PERMEATION" },
    ],
    molecularInteractions: [
      {
        title: "Acid Surface Denaturation",
        prose:
          "Citrus and vinegar acids unfold surface proteins exactly as heat would — ceviche is cooking by pH. Held too long, the same chemistry turns texture mealy: acid does not know when to stop.",
        tags: ["Acid Denaturation", "pH Chemistry"],
      },
      {
        title: "Proteolytic Tenderization",
        prose:
          "Bromelain, papain, and actinidin cleave peptide bonds in the outer matrix, pre-digesting the frontier. Enzymes from pineapple, papaya, and kiwi — biology lent to the knife's work.",
        tags: ["Bromelain", "Papain", "Peptide Cleavage"],
      },
    ],
    accent: "aqueous",
  },
};
