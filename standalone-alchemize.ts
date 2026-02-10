import fs from "fs";

// Enhanced color output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message: string, color: keyof typeof colors = "reset"): void {
  console.log(colorize(message, color));
}

// Types
type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";
type PlanetaryPosition = {
  sign: ZodiacSign;
  degree: number;
  minute: number;
  isRetrograde: boolean;
};

type ElementalProperties = {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
};

type ThermodynamicProperties = {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
};

type StandardizedAlchemicalResult = {
  elementalProperties: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  kalchm: number;
  monica: number;
  score: number;
  normalized: boolean;
  confidence: number;
  metadata: {
    source: string;
    dominantElement: string;
    dominantModality: string;
    sunSign: string;
    chartRuler: string;
  };
};

// Function to convert sign names to lowercase ZodiacSign type
function normalizeSign(sign: string): ZodiacSign {
  const normalized = sign.toLowerCase();
  const validSigns: ZodiacSign[] = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];

  if (validSigns.includes(normalized as ZodiacSign)) {
    return normalized as ZodiacSign;
  }

  throw new Error(`Invalid zodiac sign: ${sign}`);
}

// Function to load and convert planetary positions
function loadPlanetaryPositions(): Record<string, PlanetaryPosition> {
  try {
    // Read the extracted planetary positions
    const rawData = fs.readFileSync(
      "extracted-planetary-positions.json",
      "utf8",
    );
    const positions = JSON.parse(rawData);

    // Convert to the format expected by alchemize
    const convertedPositions: Record<string, PlanetaryPosition> = {};

    for (const [planetName, planetData] of Object.entries(positions)) {
      const data = planetData as any;

      convertedPositions[planetName] = {
        sign: normalizeSign(data.sign),
        degree: data.degree,
        minute: data.minute,
        isRetrograde: data.isRetrograde || false,
      };
    }

    return convertedPositions;
  } catch (error) {
    log(`❌ Error loading planetary positions: ${error}`, "red");
    throw error;
  }
}

// Function to get real zodiac sign element
function getZodiacElement(sign: string): string {
  const elementMap: Record<string, string> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };
  return elementMap[sign.toLowerCase()] || "Air";
}

// Function to get real planetary dignities
function getPlanetaryDignity(planet: string, sign: string): number {
  const dignityMap: Record<string, Record<string, number>> = {
    Sun: {
      leo: 1,
      aries: 2,
      aquarius: -1,
      libra: -2,
    },
    Moon: {
      cancer: 1,
      taurus: 2,
      capricorn: -1,
      scorpio: -2,
    },
    Mercury: {
      gemini: 1,
      virgo: 3,
      sagittarius: 1,
      pisces: -3,
    },
    Venus: {
      libra: 1,
      taurus: 1,
      pisces: 2,
      aries: -1,
      scorpio: -1,
      virgo: -2,
    },
    Mars: {
      aries: 1,
      scorpio: 1,
      capricorn: 2,
      taurus: -1,
      libra: -1,
      cancer: -2,
    },
    Jupiter: {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2,
    },
    Saturn: {
      aquarius: 1,
      capricorn: 1,
      libra: 2,
      cancer: -1,
      leo: -1,
      aries: -2,
    },
    Uranus: {
      aquarius: 1,
      scorpio: 2,
      taurus: -3,
    },
    Neptune: {
      pisces: 1,
      cancer: 2,
      virgo: -1,
      capricorn: -2,
    },
    Pluto: {
      scorpio: 1,
      leo: 2,
      taurus: -1,
      aquarius: -2,
    },
  };

  return dignityMap[planet]?.[sign.toLowerCase()] || 0;
}

// Standalone alchemize function
function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
): StandardizedAlchemicalResult {
  log("🔬 Starting alchemize calculation...", "blue");

  // Initialize totals
  let totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };

  // Planetary alchemical properties
  const planetaryAlchemy: Record<
    string,
    { Spirit: number; Essence: number; Matter: number; Substance: number }
  > = {
    Sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.2, Substance: 0.1 },
    Moon: { Spirit: 0.2, Essence: 1.0, Matter: 0.8, Substance: 0.3 },
    Mercury: { Spirit: 0.8, Essence: 0.2, Matter: 0.1, Substance: 0.9 },
    Venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.7, Substance: 0.2 },
    Mars: { Spirit: 0.6, Essence: 0.8, Matter: 0.9, Substance: 0.1 },
    Jupiter: { Spirit: 0.9, Essence: 0.7, Matter: 0.2, Substance: 0.3 },
    Saturn: { Spirit: 0.7, Essence: 0.1, Matter: 0.9, Substance: 0.8 },
    Uranus: { Spirit: 0.4, Essence: 0.6, Matter: 0.3, Substance: 0.7 },
    Neptune: { Spirit: 0.2, Essence: 0.8, Matter: 0.4, Substance: 0.6 },
    Pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 },
  };

  // Process each planet
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    log(`Processing ${planet} in ${position.sign}`, "cyan");

    // Get planetary alchemical properties
    const alchemy = planetaryAlchemy[planet];
    if (alchemy) {
      // Apply dignity modifier
      const dignity = getPlanetaryDignity(planet, position.sign);
      const dignityMultiplier = Math.max(0.1, 1 + dignity * 0.2); // Dignity affects strength

      totals.Spirit += alchemy.Spirit * dignityMultiplier;
      totals.Essence += alchemy.Essence * dignityMultiplier;
      totals.Matter += alchemy.Matter * dignityMultiplier;
      totals.Substance += alchemy.Substance * dignityMultiplier;

      log(
        `  Alchemy: Spirit=${(alchemy.Spirit * dignityMultiplier).toFixed(2)}, Essence=${(alchemy.Essence * dignityMultiplier).toFixed(2)}, Matter=${(alchemy.Matter * dignityMultiplier).toFixed(2)}, Substance=${(alchemy.Substance * dignityMultiplier).toFixed(2)}`,
        "gray",
      );
    }

    // Add elemental contribution from sign
    const element = getZodiacElement(position.sign);
    const elementWeight = 1.0; // Base weight for sign element

    if (element === "Fire") totals.Fire += elementWeight;
    else if (element === "Water") totals.Water += elementWeight;
    else if (element === "Air") totals.Air += elementWeight;
    else if (element === "Earth") totals.Earth += elementWeight;

    log(`  Element: ${element} (+${elementWeight})`, "gray");
  }

  log("\n📊 Final Totals:", "bright");
  log(
    `  Alchemy: Spirit=${totals.Spirit.toFixed(2)}, Essence=${totals.Essence.toFixed(2)}, Matter=${totals.Matter.toFixed(2)}, Substance=${totals.Substance.toFixed(2)}`,
    "yellow",
  );
  log(
    `  Elements: Fire=${totals.Fire.toFixed(2)}, Water=${totals.Water.toFixed(2)}, Air=${totals.Air.toFixed(2)}, Earth=${totals.Earth.toFixed(2)}`,
    "yellow",
  );

  // Calculate thermodynamic metrics using the exact formulas
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } =
    totals;

  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = heatNum / (heatDen || 1); // Avoid division by zero

  // Entropy
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / (entropyDen || 1);

  // Reactivity
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / (reactivityDen || 1);

  // Greg's Energy
  const gregsEnergy = heat - entropy * reactivity;

  // Kalchm (K_alchm)
  const kalchm =
    (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
    (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));

  // Monica constant
  let monica = 1.0; // Default value
  if (kalchm > 0) {
    const lnK = Math.log(kalchm);
    if (lnK !== 0) {
      monica = -gregsEnergy / (reactivity * lnK);
    }
  }

  // Calculate dominant element
  const elements = { Fire, Water, Air, Earth };
  const dominantElement = Object.entries(elements).reduce((a, b) =>
    elements[a[0] as keyof typeof elements] >
    elements[b[0] as keyof typeof elements]
      ? a
      : b,
  )[0];

  // Calculate score based on total energy
  const score = Math.min(
    1.0,
    Math.max(
      0.0,
      (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20,
    ),
  );

  return {
    elementalProperties: {
      Fire: Fire / Math.max(1, Fire + Water + Air + Earth),
      Water: Water / Math.max(1, Fire + Water + Air + Earth),
      Earth: Earth / Math.max(1, Fire + Water + Air + Earth),
      Air: Air / Math.max(1, Fire + Water + Air + Earth),
    },
    thermodynamicProperties: {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
    },
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: "alchemize",
      dominantElement,
      dominantModality: "Cardinal", // Simplified for now
      sunSign: planetaryPositions["Sun"]?.sign || "",
      chartRuler: getZodiacElement(planetaryPositions["Sun"]?.sign || "aries"),
    },
  };
}

// Main function to demonstrate alchemize usage
async function demonstrateAlchemize() {
  log(
    "🔮 Demonstrating Standalone Alchemize Function with Real Planetary Positions",
    "bright",
  );
  log("=".repeat(70), "bright");

  try {
    // Step 1: Load the extracted planetary positions
    log("\n📂 Step 1: Loading extracted planetary positions...", "blue");
    const planetaryPositions = loadPlanetaryPositions();

    log("✅ Successfully loaded planetary positions:", "green");
    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      log(
        `   ${planet}: ${position.sign} ${position.degree}°${position.minute || 0}' ${position.isRetrograde ? "(R)" : ""}`,
        "cyan",
      );
    });

    // Step 2: Call the alchemize function
    log("\n🔬 Step 2: Calling alchemize function...", "blue");
    const result = alchemize(planetaryPositions);

    // Step 3: Display the results
    log("\n📊 Step 3: Alchemize Results", "bright");
    log("=".repeat(50), "bright");

    // Elemental Properties
    log("\n🌪️  Elemental Properties:", "cyan");
    Object.entries(result.elementalProperties).forEach(([element, value]) => {
      const percentage = (value * 100).toFixed(1);
      log(`   ${element}: ${percentage}%`, "yellow");
    });

    // Thermodynamic Properties
    log("\n⚗️  Thermodynamic Properties:", "cyan");
    log(`   Heat: ${result.thermodynamicProperties.heat.toFixed(4)}`, "yellow");
    log(
      `   Entropy: ${result.thermodynamicProperties.entropy.toFixed(4)}`,
      "yellow",
    );
    log(
      `   Reactivity: ${result.thermodynamicProperties.reactivity.toFixed(4)}`,
      "yellow",
    );
    log(
      `   Greg's Energy: ${result.thermodynamicProperties.gregsEnergy.toFixed(4)}`,
      "yellow",
    );

    // Alchemical Constants
    log("\n🧪 Alchemical Constants:", "cyan");
    log(`   Kalchm: ${result.kalchm.toFixed(4)}`, "yellow");
    log(`   Monica: ${result.monica.toFixed(4)}`, "yellow");

    // Overall Score
    log("\n🎯 Overall Alchemical Score:", "cyan");
    log(`   Score: ${result.score.toFixed(4)}`, "green");

    // Step 4: Save results to file
    log("\n💾 Step 4: Saving results...", "blue");
    const resultsFile = "alchemize-results.json";
    fs.writeFileSync(resultsFile, JSON.stringify(result, null, 2));
    log(`✅ Results saved to ${resultsFile}`, "green");

    // Step 5: Provide interpretation
    log("\n🔍 Step 5: Basic Interpretation", "bright");
    log("=".repeat(50), "bright");

    // Find dominant element
    const elements = result.elementalProperties;
    const dominantElement = Object.entries(elements).reduce((a, b) =>
      elements[a[0] as keyof typeof elements] >
      elements[b[0] as keyof typeof elements]
        ? a
        : b,
    )[0];

    log(`\n🌟 Dominant Element: ${dominantElement}`, "green");

    // Energy interpretation
    if (result.thermodynamicProperties.gregsEnergy > 0.5) {
      log("⚡ High Energy: Strong transformative potential", "green");
    } else if (result.thermodynamicProperties.gregsEnergy > 0.2) {
      log("⚡ Moderate Energy: Balanced transformative potential", "yellow");
    } else {
      log("⚡ Low Energy: Gentle, stabilizing influence", "blue");
    }

    // Reactivity interpretation
    if (result.thermodynamicProperties.reactivity > 0.7) {
      log("🔥 High Reactivity: Dynamic, change-oriented", "red");
    } else if (result.thermodynamicProperties.reactivity > 0.3) {
      log("🔥 Moderate Reactivity: Balanced dynamics", "yellow");
    } else {
      log("🔥 Low Reactivity: Stable, grounding influence", "blue");
    }

    log(
      "\n✅ Standalone alchemize demonstration completed successfully!",
      "green",
    );
  } catch (error) {
    log(`❌ Error in alchemize demonstration: ${error}`, "red");
    console.error(error);
  }
}

// Run the demonstration
demonstrateAlchemize();
