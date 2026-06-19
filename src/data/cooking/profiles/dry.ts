/**
 * Alchemical profiles — dry-heat methods.
 * Roasting, grilling (combustion), and stir-frying (sautéing) content
 * transcribed from the stitch "Alchemical Culinary Kinetics" design package;
 * frying and broiling authored in the same voice.
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

export const dryMethodProfiles: Record<string, AlchemicalMethodProfile> = {
  roasting: {
    epithet: "The Solar Desiccation",
    classification: "RADIANT_DESICCATION",
    tagline:
      "A high-voltage thermal transmutation process relying on radiant and convective heat to achieve complex surface reactions while desiccating the outer membrane.",
    stateChips: [
      { label: "FLUX", value: "RADIANT / CONVECTIVE" },
      { label: "SHIFT", value: "+FIRE / −AIR" },
    ],
    kinetics: {
      voltage: "HIGH (RADIATION FLUX)",
      current: "MODERATE (CONVECTION FLOW)",
      prose:
        "High radiation-flux voltage (V) sustained by a moderate convective current (I). As bound moisture is driven off, the elemental ledger swings hard positive toward Fire while hydrous Air is expelled as a negative flux.",
      equations: [
        {
          expression: "V(t) = High [Radiation Flux]",
          label: "VOLTAGE_FUNCTION",
        },
        {
          expression: "I(c) = Moderate [Convection Flow]",
          label: "CURRENT_FUNCTION",
        },
      ],
    },
    elementalRoles: {
      Fire: "Thermal Driver",
      Air: "Desiccant",
      Earth: "Crust Matrix",
    },
    descriptorTags: ["Radiant", "Desiccating", "Concentrating"],
    planetaryRulers: [
      { planet: "Sun", rank: "primary", governs: "RADIANT FLUX, DESICCATION" },
      { planet: "Mars", rank: "secondary", governs: "SEARING, AGGRESSION" },
    ],
    molecularInteractions: [
      {
        title: "Protein Denaturation",
        prose:
          "Unfolding of tertiary structures, exposing hydrophobic cores. Structural matrix tightens, expelling hydrous elements.",
        temperatureRange: "120°C – 160°C",
      },
      {
        title: "Maillard Reaction",
        prose:
          "Non-enzymatic browning. Amino acids interact with reducing sugars to create complex melanoidins and volatile aromatic compounds.",
        temperatureRange: "> 140°C",
      },
    ],
    image: "/images/methods/roasting.webp",
    imageAlt:
      "Scientific diagram of roasting: radiant and convective heat transfer vectors striking a dense organic matrix, with surface desiccation and Maillard browning zones annotated in glowing solar orange.",
    accent: "solar",
  },

  grilling: {
    epithet: "The Pyrolytic Transmutation",
    classification: "PYROLYTIC_TRANSMUTATION",
    tagline:
      "Intense thermal energy transfer from live ember to exposed substrate. Surface carbonization proceeds beneath a high-density smoke particle current, formulating complex phenolic compounds through pyrolysis.",
    stateChips: [
      { label: "STATUS", value: "ACTIVE" },
      { label: "PHASE", value: "CARBONIZATION" },
    ],
    kinetics: {
      voltage: "HIGH / 850°F THERMAL",
      current: "PARTICLE (45 CFM SMOKE)",
      prose:
        "High-voltage thermal energy (V) interacting with a high-density smoke particle current (I).",
      equations: [
        {
          expression: "Q = mcΔT + Smoke_Infusion_Rate",
          label: "GOVERNING_EQUATION",
        },
      ],
    },
    elementalRoles: {
      Fire: "Combustion",
      Air: "Smoke Current",
    },
    descriptorTags: ["Pyrolytic", "Smoldering", "Primal"],
    planetaryRulers: [
      { planet: "Mars", rank: "primary", governs: "THERMAL AGGRESSION, IGNITION" },
      { planet: "Jupiter", rank: "secondary", governs: "SMOKE EXPANSION" },
    ],
    rulershipNote:
      "Orbital alignment dictates aggressive thermal application tempered by expansive smoke exposure.",
    molecularInteractions: [
      {
        title: "Carbonization",
        prose:
          "Maillard reaction acceleration yielding melanoidin structures across the contact surface.",
        tags: ["Maillard Acceleration", "Melanoidins"],
      },
      {
        title: "Phenolic Binding",
        prose:
          "Guaiacol and syringol deposition altering flavor profile matrices at the surface layer.",
        formula: "C6H5OH → C7H8O2",
        tags: ["Guaiacol", "Syringol"],
      },
    ],
    image: "/images/methods/combustion.webp",
    imageAlt:
      "A high-fidelity scientific diagram of Combustion (Grilling/Smoking). Showing intense thermal energy transfer from charcoal/wood to food. Molecular level inset showing carbonization, smoke particle infusion, and complex phenolic compounds forming as glowing volcanic orange and deep charcoal alchemical symbols.",
    accent: "ember",
  },

  stir_frying: {
    displayName: "Stir-Frying",
    epithet: "The Kinetic Impulse",
    classification: "CONDUCTION_IMPULSE",
    tagline:
      "A high-velocity conductive assault delivered through a thin lipid film. Constant agitation cycles every surface across the searing contact zone before interior moisture can migrate.",
    stateChips: [
      { label: "VELOCITY", value: "HIGH" },
      { label: "MAILLARD_THRESHOLD", value: "T > 160°C" },
    ],
    kinetics: {
      voltage: "INTENSE (CONTACT)",
      current: "RAPID (LIPID FLUX)",
      catalyst: "THERMAL_SHOCK",
      prose:
        "Intense contact voltage (V) discharged through a rapid lipid-flux current (I), catalyzed by thermal shock. The impulse is brief by design — energy transfer outruns moisture migration, locking structure and color in place.",
      equations: [
        {
          expression: "q = −k∇T",
          label: "CONDUCTION_EQUATION",
          note: "Fourier's law — heat flux flows down the steep thermal gradient at the metal–substrate contact plane.",
        },
      ],
    },
    elementalRoles: {
      Fire: "Impulse Driver",
      Air: "Agitation",
    },
    descriptorTags: ["Kinetic", "Volatile", "Instantaneous"],
    planetaryRulers: [
      { planet: "Mercury", rank: "primary", governs: "VELOCITY, VOLATILE TRANSFER" },
    ],
    molecularInteractions: [
      {
        title: "Rapid Lipid Interaction",
        prose:
          "The application of intense localized heat induces Rapid Lipid Interaction. Fats denature and form complex volatile aromatic compounds instantly upon surface contact.",
        tags: ["Volatile Aromatics", "Surface Contact"],
      },
      {
        title: "Caramelization",
        prose:
          "Sucrose fragments under dry contact heat, shedding water and recombining into caramelans and volatile furans at the searing interface.",
        formula: "C12H22O11 → C12H20O10 + H2O",
        temperatureRange: "> 160°C",
      },
    ],
    image: "/images/methods/sauteing.webp",
    imageAlt:
      "Scientific diagram of sautéing: intense conductive contact heat transmitted through a thin lipid film, with rapid tossing vectors, evaporation plumes, and caramelization thresholds annotated in glowing emerald and cyan.",
    accent: "emerald",
  },

  tilt_skillet: {
    displayName: "Tilt Skillet",
    epithet: "The Foundry Plate",
    classification: "BROAD_CONDUCTION_FOUNDRY",
    tagline:
      "A wide steel floor delivers a sustained conductive sear across an entire batch, then the lid drops and the plate pivots into a covered braise — one vessel cycling from dry foundry heat to moist convective transmutation.",
    stateChips: [
      { label: "MODE", value: "SEAR ⇄ BRAISE" },
      { label: "SCALE", value: "BATCH / HIGH-VOLUME" },
    ],
    kinetics: {
      voltage: "HIGH (BROAD CONTACT)",
      current: "DISTRIBUTED (FLAT FLOOR)",
      catalyst: "PHASE_TILT",
      prose:
        "A high contact voltage (V) is spread as a distributed current (I) across the full floor — broad rather than wok-extreme, but sustained by a large thermal mass. On the tilt, the lid converts dry conduction into moist convection: Fire recedes, Water rises, and collagen yields to gelatin.",
      equations: [
        {
          expression: "q = −k∇T  (sear)  →  q = h·A·(T_liq − T_s)  (braise)",
          label: "DUAL_PHASE_TRANSFER",
          note: "Fourier conduction during the sear gives way to Newtonian convective transfer once liquid and lid are introduced.",
        },
        {
          expression: "C_th = m·c  (large)",
          label: "THERMAL_MASS",
          note: "The heavy steel floor stores enough energy to hold temperature when a full batch is loaded.",
        },
      ],
    },
    elementalRoles: {
      Fire: "Sear Driver",
      Water: "Braise Medium",
      Earth: "Thermal Mass",
    },
    descriptorTags: ["Broad", "Dual-Phase", "Industrial"],
    planetaryRulers: [
      { planet: "Mars", rank: "primary", governs: "SEARING DRIVE, FOND IGNITION" },
      { planet: "Saturn", rank: "secondary", governs: "SLOW BRAISE, STRUCTURE, TIME" },
    ],
    rulershipNote:
      "Martian sear opened, then handed to Saturnine patience — aggression set down into the long, structured braise.",
    molecularInteractions: [
      {
        title: "Fond Development",
        prose:
          "Maillard browning on the broad contact floor lays down a fond of caramelized proteins and sugars that later dissolves into the braising liquid as the flavor backbone of the batch.",
        tags: ["Maillard", "Caramelization"],
        temperatureRange: "150°C – 200°C",
      },
      {
        title: "Collagen → Gelatin",
        prose:
          "Under the lid's moist convective heat, tough collagen hydrolyzes into gelatin over time, transmuting structure into silky body across the whole batch.",
        formula: "collagen + H2O → gelatin",
        temperatureRange: "70°C – 95°C",
      },
      {
        title: "Reduction & Concentration",
        prose:
          "Tilting opens the plate to evaporation; the braising liquid concentrates as water leaves, intensifying the dissolved fond into a glaze.",
        dataPoint: { label: "PHASE_SHIFT", value: "−FIRE / +WATER → −WATER" },
      },
    ],
    image: "/images/methods/tilt_skillet.webp",
    imageAlt:
      "Scientific diagram of the Tilt Skillet as the Foundry Plate: a broad steel floor cycling from distributed conductive sear to covered convective braise, with Maillard fond development and collagen-to-gelatin hydrolysis rendered as glowing volcanic orange and deep charcoal alchemical symbols on an obsidian field.",
    accent: "ember",
  },

  frying: {
    epithet: "The Lipid Crucible",
    classification: "LIPID_IMMERSION",
    tagline:
      "Total submersion in a superheated lipid medium. Oil floods every exposed surface simultaneously as a dielectric heat-transfer fluid, while violent steam efflux holds the crucible at bay and forges the crust.",
    stateChips: [
      { label: "MEDIUM", value: "LIPID 170–190°C" },
      { label: "BARRIER", value: "STEAM EFFLUX" },
    ],
    kinetics: {
      voltage: "HIGH / ISOTROPIC",
      current: "DENSE (LIPID CONVECTION)",
      prose:
        "The bath applies high voltage uniformly from all sides; convective current density in oil dwarfs air-based transfer. Outbound steam runs as a counter-current, throttling oil ingress while the crust resistor forms.",
      equations: [
        {
          expression: "q = h·A·(T_oil − T_s)",
          label: "CONVECTION_EQUATION",
          note: "Newton's law of cooling — the convective coefficient h of hot oil exceeds that of air by an order of magnitude.",
        },
        {
          expression: "k = A·e^(−Ea/RT)",
          label: "BROWNING_KINETICS",
          note: "Arrhenius — Maillard and acrylamide formation rates climb exponentially with bath temperature.",
        },
      ],
    },
    elementalRoles: {
      Fire: "Crucible",
      Air: "Steam Efflux",
    },
    descriptorTags: ["Immersive", "Shattering", "Sealed"],
    planetaryRulers: [
      { planet: "Mars", rank: "primary", governs: "THERMAL VIOLENCE, IMMERSION" },
      { planet: "Saturn", rank: "secondary", governs: "CRUST, STRUCTURAL SEAL" },
    ],
    molecularInteractions: [
      {
        title: "Steam-Barrier Crust Formation",
        prose:
          "Surface water flashes to vapor on immersion, and the outward steam flux repels oil ingress. A dehydration front recedes into the substrate; once surface moisture collapses, starches and proteins vitrify into the glassy crust.",
        formula: "H2O(l) → H2O(g)",
        dataPoint: { label: "VAPOR_EXPANSION", value: "×1700 v/v" },
      },
      {
        title: "Maillard / Acrylamide Kinetics",
        prose:
          "Arrhenius-governed browning accelerates across the dehydrated face. Asparagine condenses with reducing sugars along the acrylamide pathway, trading color and aroma against thermal overexposure.",
        tags: ["Asparagine Pathway", "Melanoidins"],
        temperatureRange: "160°C – 190°C",
      },
      {
        title: "Lipid Oxidation & Polymerization",
        prose:
          "The medium itself transmutes under sustained thermal stress. Triacylglycerols cleave into free fatty acids and volatile aldehydes, then polymerize — each service cycle lowers the smoke point of the crucible.",
        tags: ["Triacylglycerol Cleavage", "Volatile Aldehydes"],
      },
    ],
    image: "/images/methods/frying.webp",
    imageAlt:
      "Scientific diagram of frying as the Lipid Crucible: a dense matrix totally submerged in superheated oil with isotropic convective heat vectors and a violent steam-efflux barrier, the molecular inset annotating steam-barrier crust vitrification and Maillard-acrylamide browning kinetics in glowing volcanic orange and deep charcoal alchemical symbols on an obsidian field.",
    accent: "ember",
  },

  broiling: {
    epithet: "The Inverted Sun",
    classification: "INFRARED_IRRADIATION",
    tagline:
      "Pure radiant assault from above. An incandescent element irradiates the exposed face with infrared flux scaling to the fourth power of its temperature, searing the zenith plane while the body below remains in shadow.",
    stateChips: [
      { label: "VECTOR", value: "OVERHEAD / RADIANT" },
      { label: "FLUX", value: "∝ T⁴" },
    ],
    kinetics: {
      voltage: "EXTREME (RADIANT)",
      current: "LINE-OF-SIGHT (PHOTON)",
      prose:
        "Voltage is near-maximal — the element glows past 800°C — but current flows only along the line of sight; shadowed faces receive almost nothing. Distance is the resistor: flux falls off sharply with every centimeter from the element.",
      equations: [
        {
          expression: "j* = εσT⁴",
          label: "STEFAN_BOLTZMANN_LAW",
          note: "Where σ = 5.67×10⁻⁸ W·m⁻²·K⁻⁴ — radiant exitance scales with the fourth power of element temperature.",
        },
        {
          expression: "q = εσA(T₁⁴ − T₂⁴)",
          label: "RADIATIVE_EXCHANGE",
          note: "Net transfer between glowing element and substrate surface.",
        },
      ],
    },
    elementalRoles: {
      Fire: "Dominance",
    },
    descriptorTags: ["Radiant", "Unidirectional", "Searing"],
    planetaryRulers: [
      { planet: "Sun", rank: "primary", governs: "RADIANT FLUX, EMISSION" },
      { planet: "Mars", rank: "secondary", governs: "SEARING FORCE" },
    ],
    molecularInteractions: [
      {
        title: "Surface Maillard Cascade",
        prose:
          "Radiant flux drives the exposed face past the browning threshold in seconds while the interior lags far behind. Amino acids and reducing sugars cascade into melanoidins across the irradiated plane only.",
        temperatureRange: "140°C – 180°C",
      },
      {
        title: "Radiant Fat Rendering",
        prose:
          "Surface lipids liquefy and migrate under direct infrared exposure, basting the zenith face. Rendered fat approaching its smoke point flares volatile aromatics — the signature broiler char.",
        dataPoint: { label: "SMOKE_POINT", value: "≈ 205°C (RENDERED FAT)" },
      },
      {
        title: "Myofibrillar Contraction",
        prose:
          "Myosin and actin denature in sequence under the steep one-sided gradient, contracting the protein lattice and expelling juices if exposure outruns the thin-cut envelope.",
        tags: ["Myosin Denaturation", "Actin Denaturation"],
        temperatureRange: "50°C – 73°C",
      },
    ],
    image: "/images/methods/broiling.webp",
    imageAlt:
      "Scientific diagram of broiling, the inverted sun: an incandescent overhead element raining unidirectional infrared flux down onto an exposed zenith plane, with the surface Maillard cascade and radiant fat rendering rendered as glowing solar orange and gold alchemical symbols on an obsidian field.",
    accent: "solar",
  },
};
