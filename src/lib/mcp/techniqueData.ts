/**
 * @file src/lib/mcp/techniqueData.ts
 *
 * Core culinary technique definitions, thermal targets, and sensory cues.
 */

export interface CulinaryTechniqueInfo {
  name: string;
  summary: string;
  targetTemperatures: string;
  scienceExplanation: string;
  sensoryCheckpoints: string[];
  commonMistakes: string[];
  idealDishes: string[];
}

export const CULINARY_TECHNIQUES: Record<string, CulinaryTechniqueInfo> = {
  "dry-brining": {
    name: "Dry Brining",
    summary: "Salting meat in advance (12-48h) uncovered on a wire rack in the refrigerator.",
    targetTemperatures: "Fridge at 34-38°F (1-3°C); cook to protein target",
    scienceExplanation:
      "Salt draws surface moisture via osmosis; moisture dissolves salt into concentrated brine; protein denaturation allows muscle fibers to reabsorb seasoned moisture deep into the core. Refrigerator air dries the exterior skin for maximum crispness and rapid Maillard browning.",
    sensoryCheckpoints: [
      "Initial 30 min: Surface beads with drawn-out liquid",
      "Hour 2-4: Liquid reabsorbed, surface looks moist and matte",
      "Hour 12-24: Skin turns taut, translucent, and bone-dry to the touch",
    ],
    commonMistakes: [
      "Covering with plastic wrap (traps humidity and prevents skin drying)",
      "Using table salt without adjusting volume (table salt is nearly 2x as dense as Diamond Crystal kosher salt)",
    ],
    idealDishes: ["Whole roast chicken", "Thick-cut ribeye", "Crispy-skin pork belly", "Roast turkey"],
  },
  emulsification: {
    name: "Emulsification",
    summary: "Forcefully suspending tiny droplets of fat/oil within an aqueous liquid using a surfactant.",
    targetTemperatures: "Cold/Room Temp for Mayo/Vinaigrette (60-70°F); 125-145°F for Hollandaise/Béarnaise",
    scienceExplanation:
      "Hydrophilic and lipophilic ends of surfactant molecules (lecithin in egg yolks, mustard, garlic) coat micro-droplets of oil, preventing them from coalescing into a separated greasy layer.",
    sensoryCheckpoints: [
      "Initial drops: Whisk until completely absorbed before adding next stream",
      "Midway: Viscosity increases noticeably with faint pale sheen",
      "Finish: Thick, glossy ribbons that hold shape for 2-3 seconds",
    ],
    commonMistakes: [
      "Pouring oil too quickly at the start before an emulsion nucleus forms",
      "Overheating warm emulsions (egg proteins curdle above 150°F, breaking sauce)",
    ],
    idealDishes: ["Aioli", "Classic vinaigrette", "Hollandaise", "Tahini sauce", "Pan sauce mount (beurre monté)"],
  },
  tempering: {
    name: "Tempering (Tadka / Chhonk / Blooming)",
    summary: "Heating whole or ground spices in hot oil or ghee to bloom their fat-soluble flavor compounds.",
    targetTemperatures: "320-350°F (160-175°C)",
    scienceExplanation:
      "Volatile aromatic oils in spices (curcumin, cinnamaldehyde, eugenol, cuminaldehyde) are fat-soluble rather than water-soluble. Flash-frying in fat releases and stabilizes these aromas while toasting raw starches.",
    sensoryCheckpoints: [
      "5-10 sec: Whole seeds (mustard, cumin) crackle and sputter vigorously",
      "15-20 sec: Chilies and curry leaves blister and turn translucent",
      "25-30 sec: Fragrance shifts from raw to nutty and toasted; remove from heat immediately",
    ],
    commonMistakes: [
      "Burning delicate ground spices (add ground turmeric/chili off-heat or in last 5 seconds)",
      "Using cold fat (seeds absorb oil without crackling or releasing volatile aromatics)",
    ],
    idealDishes: ["Dal tadka", "Sambar", "Curry base", "Spiced rice", "Chutney topping"],
  },
  searing: {
    name: "High-Heat Searing",
    summary: "Rapid browning of protein surfaces using intense dry heat to build savory flavor without overcooking the core.",
    targetTemperatures: "Pan surface: 400-450°F (205-230°C); smoke point of fat: >425°F",
    scienceExplanation:
      "The Maillard reaction cascades between amino acids and reducing sugars above 285°F (140°C), creating hundreds of new aromatic flavor molecules. Excess surface moisture buffers pan temperature at 212°F (steam), completely inhibiting browning until all surface water has vaporized.",
    sensoryCheckpoints: [
      "Pan preheat: Faint wisps of smoke rise from dry pan or oil shimmers with ripples",
      "Placement: Loud, steady sizzle immediately upon contact",
      "Flip signal: Meat releases effortlessly from the metal surface without tearing",
    ],
    commonMistakes: [
      "Putting wet meat into the pan (steams gray instead of forming a mahogany crust)",
      "Crowding the pan (drops pan thermal mass and traps steam)",
      "Moving or poking protein before a crust has established",
    ],
    idealDishes: ["Cast-iron steaks", "Scallops", "Crisp salmon fillets", "Stew meat browning"],
  },
  braising: {
    name: "Braising",
    summary: "Combination cooking: hard sear followed by gentle simmering tightly covered in flavorful liquid.",
    targetTemperatures: "Braising liquid: 185-195°F (85-90°C); Oven ambient: 275-300°F (135-150°C)",
    scienceExplanation:
      "Tough connective tissue (collagen) denatures and hydrolyzes into gelatin at 160-180°F over hours. Boiling (>212°F) wrings muscle fibers dry and tough; sub-simmer temperatures allow gelatin to melt into the meat and thicken the braising liquor.",
    sensoryCheckpoints: [
      "Hour 1: Meat tightens and firms up",
      "Hour 2: Collagen begins softening; sauce takes on glossy sheen",
      "Hour 2.5-3.5: Knife or cake tester slips into meat with zero resistance ('fork-tender')",
    ],
    commonMistakes: [
      "Rapid boiling instead of gentle bare simmer (creates stringy, dry meat)",
      "Submerging completely (braising liquid should reach only 1/3 to 1/2 up the sides)",
    ],
    idealDishes: ["Short ribs", "Pork carnitas", "Osso buco", "Bœuf bourguignon", "Braised cabbage"],
  },
};

