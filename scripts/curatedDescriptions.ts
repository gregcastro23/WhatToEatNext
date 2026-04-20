/**
 * Upgrade generic default descriptions for the most recipe-referenced
 * ingredients to curated, culturally/technically rich versions.
 *
 * Only replaces descriptions that match the known "category default"
 * pattern, preserving any author-written or summary-harvested prose.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

// Signatures of auto-generated default descriptions (to detect & replace)
const DEFAULT_SIGNATURES = [
  "A cereal or pseudo-cereal product,",
  "A fresh plant food,",
  "An aromatic culinary herb,",
  "A dried aromatic spice,",
  "A foundational seasoning,",
  "A culinary fat,",
  "An acidic condiment,",
  "A liquid consumable,",
  "A pantry staple,",
  "A dairy product,",
  "A sweet edible plant product,",
  "A protein-rich ingredient,",
];

// Curated descriptions — rich, single-paragraph (no markdown), each ≥80 words
const CURATED: Record<string, string> = {
  rice:
    "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",

  flour:
    "The powder produced by milling raw grains, roots, beans, nuts, or seeds — most commonly wheat (*Triticum aestivum*). Its behavior in baking is governed by protein content: high-protein bread flour (12–14%) develops strong gluten networks for chewy yeasted breads, while low-protein cake flour (7–9%) yields tender, delicate crumb. Whole-grain flours include the bran and germ, adding fiber, fat, and perishability that demands cool storage to prevent rancidity.",

  all_purpose_flour:
    "A mid-protein (10–12%) wheat flour blended from hard and soft varieties to perform acceptably across most baked goods — the Swiss Army knife of American baking. Less chewy than bread flour and less tender than cake flour, it sits in the middle of the gluten spectrum. Bleached versions cook more predictably in cakes; unbleached has slightly more protein and a mellower cream color. Store airtight in cool, dry conditions; refrigerate for long-term use to deter pantry pests.",

  salt:
    "The mineral sodium chloride (NaCl), the single most important culinary seasoning — amplifier of sweetness, suppressor of bitterness, enabler of fermentation, and the substance without which most cooking falls flat. Form matters: table salt dissolves fast for baking; kosher has large flakes that coat meats evenly; fleur de sel and Maldon finish with crunch and bright brine. Salt early in cooking for penetration, at the end for texture; sprinkle deliberately rather than reflexively.",

  kosher_salt:
    "Coarse-grained sodium chloride milled without iodine or anti-caking agents, named for its traditional use in koshering meat via surface dehydration. Its large, irregular flakes cling well to food surfaces, dissolve at a measured pace, and allow cooks to feel the amount they're pinching — a tactile advantage over fine table salt. Diamond Crystal and Morton brands differ significantly in density per teaspoon; recipes calibrated for one may over-salt with the other.",

  sugar:
    "Refined sucrose crystallized from sugarcane (*Saccharum officinarum*) or sugar beets (*Beta vulgaris*) — the default sweetener of Western cooking and a critical functional ingredient beyond taste. In baking sugar tenderizes by competing for water, stabilizes foams, browns via Maillard and caramelization, and preserves by binding water activity. Granulated, superfine (caster), confectioners', turbinado, and demerara differ in crystal size, moisture, and residual molasses — each behaving differently in creaming, dissolving, or finishing.",

  water:
    "The universal solvent and culinary liquid — mineral content and temperature both matter more than is usually recognized. Hard water (high calcium, magnesium) inhibits yeast and affects coffee extraction; filtered or bottled water produces cleaner stock and clearer broth. Ice-cold water relaxes doughs; just-off-boil water extracts tea; room-temperature water shortens rest times in pastry. Recipe measurements assume volumetric consistency — weigh water (1 mL = 1 g) for precision in baking.",

  onion:
    "A foundational aromatic (*Allium cepa*) that builds savory depth in nearly every global cuisine. Its concentric layers contain sulfur compounds which, when exposed to heat, undergo Maillard reaction to create sweet, complex flavors ranging from sharp when raw to deeply caramel when slow-cooked. Yellow is the all-purpose workhorse; sweet (Vidalia, Walla Walla) for quick raw use; red for salads and pickling; pearl and cipollini for whole-roasting. Slice with a sharp blade to minimize enzymatic tear-gas release.",

  onions:
    "Foundational aromatics (*Allium cepa*) that build savory depth across global cuisines. Their concentric layers contain sulfur compounds which, under heat, undergo Maillard reactions to create complex flavors from sharp when raw to deeply caramel when slow-cooked. Yellow onions are the all-purpose workhorse for mirepoix and stocks; sweet varieties for raw eating; red for salads and quick pickles; pearl for whole-braising. Always use a sharp knife to minimize the enzymatic release that causes tears.",

  garlic:
    "A pungent bulb (*Allium sativum*) belonging to the onion genus, prized globally for its intense, savory flavor and aroma. When its cells are crushed or chopped, an enzyme reaction produces allicin, the compound responsible for its signature bite and potent antimicrobial properties. This sharpness mellows dramatically into deep, sweet nuttiness when roasted whole or slow-sautéed in fat. Look for firm, heavy bulbs with dry, unbroken papery skins and no green shoots — green means sprouting and bitterness.",

  eggs:
    "The reproductive ovum of *Gallus gallus domesticus* — one of cooking's most versatile ingredients, delivering structure, aeration, emulsification, binding, and thickening in a single package. Yolks carry fat, lecithin (an emulsifier), and most of the flavor; whites are primarily water and coagulable proteins (ovalbumin, ovotransferrin) that unfold and bond when heated or whipped. Fresh eggs peel poorly when hard-boiled; slightly older eggs shed shells cleanly. Store pointed-end-down at 35–40°F.",

  egg:
    "The reproductive ovum of *Gallus gallus domesticus* — one of cooking's most versatile ingredients, delivering structure, aeration, emulsification, binding, and thickening. The yolk carries fat, lecithin (an emulsifier), and most of the flavor; the white is water plus coagulable proteins that unfold and bond when heated or whipped. Temperature control matters: yolks coagulate ~149°F, whites ~145°F, so gentle heat and timing dictate whether you get a silky custard or a rubbery scramble.",

  butter:
    "Cultured or sweet-cream dairy fat churned until the butterfat separates from buttermilk, yielding a ~80% fat emulsion. European-style butters have higher fat (82–86%) and richer flavor from cultured cream; American-style is typically 80% fat with a cleaner profile. Salted butter extends shelf life; unsalted is the baker's standard for precise seasoning control. Cold butter laminates pastry; soft butter creams into cakes; melted butter binds doughs; browned butter (*beurre noisette*) adds toasted-hazelnut depth.",

  unsalted_butter:
    "Pure dairy fat (~80%) churned from cream without added salt — the baker's default for precise seasoning control, since salt levels in salted butter vary by brand. Its flavor is pure cream without the distraction of salt, letting the cook decide exact seasoning. Freshness matters more than in salted versions, since salt is a preservative; store unsalted butter refrigerated 1–2 months or frozen up to 6 months. Softened to cool room temperature (65°F), it creams air into cakes and cookies.",

  milk:
    "Fresh liquid from lactating dairy cattle, standardized to a fat percentage (whole ~3.25%, 2% reduced-fat, 1%, or skim) and typically pasteurized and homogenized. Beyond drinking, milk is structural in baking (gluten development, tender crumb), enriches sauces (béchamel, bread pudding), and tenderizes meats via slow protein digestion (*milk-braised pork*). Heat above 180°F denatures whey proteins and can cause skin formation; acid or long reduction curdles it. Store sealed at 35–40°F.",

  whole_milk:
    "Dairy milk with its naturally occurring ~3.25% butterfat retained after standardization. The fat carries flavor and fat-soluble vitamins (A, D, E, K), contributes richness and body, and gives whole milk a rounder mouthfeel than reduced-fat versions. Indispensable in café culture for steaming a stable microfoam, in baking for tender crumb, and in homemade cheese-making where fat content affects yield and texture. Ultra-pasteurized whole milk has a longer shelf life but slightly cooked flavor.",

  olive_oil:
    "Oil pressed from the fruit of *Olea europaea*, the Mediterranean's cornerstone fat. Extra-virgin olive oil (EVOO) is cold-pressed with free acidity below 0.8% — aromatic, green-peppery, best used raw or at moderate heat. Virgin grades allow higher acidity; refined 'olive oil' or 'pure' grades are heat-extracted and neutral-flavored, suited for high-heat cooking. Smoke points: EVOO ~375°F, refined ~470°F. Store in dark glass away from light and heat; oxidation dulls flavor within months.",

  soy_sauce:
    "A fermented condiment originating in Han-dynasty China, made from soybeans, wheat (usually), salt, and *Aspergillus oryzae* koji culture, aged for months to develop deep umami, salt, and roasted aromatics. Japanese shoyu is lighter and sweeter; Chinese light soy is saltier and clearer; dark soy is thickened with molasses for color. Tamari is wheat-free, drawn off miso production. Use as seasoning, marinade base, or finishing umami boost; reduce by simmering to concentrate without adding raw sharpness.",

  fish_sauce:
    "A pungent, amber-brown condiment fermented from anchovies or other small fish with salt over 6–24 months, ancient in Southeast Asian and Mediterranean cuisines (*garum* in Rome, *nam pla* in Thailand, *nước mắm* in Vietnam). Its depth comes from free glutamates and nucleotides developed during proteolysis — the umami equivalent of aged cheese. Good brands list only fish and salt. Use sparingly as a seasoning (1 tsp lifts a curry or vinaigrette) or as a finishing touch after cooking.",

  black_pepper:
    "The dried unripe fruit (*peppercorns*) of *Piper nigrum*, native to the Malabar Coast of India and one of the oldest globally traded spices. Its heat comes from piperine, less intense than capsaicin and more aromatic. Freshly cracked pepper releases volatile terpenes absent in pre-ground; grind at use for best flavor. Tellicherry and Malabar are prized estate grades; white pepper is the same fruit with the black skin removed — earthier and more prized in French white sauces and Asian cuisines.",

  ginger:
    "The rhizome of *Zingiber officinale*, pungent with gingerols that convert to sweeter, warmer shogaols on cooking. Fresh ginger is sharp, citrusy, and essential in East and Southeast Asian cuisines; dried ground ginger is mellower and more baking-friendly. Young ('spring') ginger has thin, tender skin and mild flavor; mature ginger develops tough fibers and deeper heat. Peel with a spoon (easier than a knife), and grate on a microplane for maximum juice extraction. Pickled (gari) and crystallized forms add versatility.",

  lemon:
    "The oval yellow citrus fruit (*Citrus × limon*) delivering 5–6% citric acid plus fragrant d-limonene in the peel — essentially a complete seasoning of acid, aroma, and brightness in one package. Meyer lemons are sweeter with floral notes; Eureka and Lisbon are standard supermarket varieties. Use the whole fruit: zest for aroma (before juicing — the tool ruins the peel otherwise), juice for acid, rind for preserved lemons. Rolling the lemon before cutting breaks internal membranes and yields more juice.",

  tomatoes:
    "The fruit of *Solanum lycopersicum*, botanically a berry, culinarily a vegetable — packed with glutamic acid that makes them the umami champion among garden produce. Flavor peaks when fully ripe and at room temperature; refrigeration below 55°F permanently damages aromatic compounds. Paste and plum varieties reduce well into sauces; beefsteak and heirloom eat best raw; cherry and grape tomatoes caramelize beautifully whole. Salt sliced tomatoes 20 min before serving to draw out water and concentrate flavor.",

  tomato:
    "The fruit of *Solanum lycopersicum*, botanically a berry, culinarily a vegetable — packed with glutamic acid that makes it the umami champion among garden produce. Flavor peaks when fully ripe and at room temperature; refrigeration below 55°F permanently damages aromatic compounds. Paste and plum varieties reduce into sauces; beefsteak and heirloom eat best raw; cherry and grape tomatoes caramelize whole. Sun-dried tomatoes concentrate sweetness and umami dramatically; rehydrate in warm water or oil.",

  carrot:
    "A sweet, crunchy root vegetable (*Daucus carota*) renowned for its high beta-carotene content, which the body converts into Vitamin A. Its natural sugars concentrate during roasting or caramelizing, making it a versatile foundational ingredient for mirepoix and sweet baking alike. Look for firm, brightly colored carrots with smooth skin; if green tops are attached, they should be fresh and vibrant. Remove tops before storing — they draw moisture from the root — and keep in plastic in the crisper drawer up to three weeks.",

  vegetable_oil:
    "A generic neutral-flavored cooking oil, typically soybean, canola, corn, sunflower, or a blend — refined for high smoke point (~400–450°F) and minimal flavor interference. Its neutrality makes it the default for deep-frying, baking, and dressings where you don't want the fat to contribute taste. Choose fresher oils when possible; polyunsaturated oils oxidize faster than monounsaturated. Store in a cool, dark pantry; discard when it smells painty, rancid, or bitter.",

  vegetables:
    "Any edible plant material — leaves, roots, stems, tubers, flowers, fruits used as savory ingredients — delivering fiber, vitamins, phytochemicals, and the flavor backbone of non-meat-forward cooking. Treat by structural group: hard roots (carrots, beets) need more heat and time; leafy greens cook in seconds; fungi need dry heat to develop depth; brassicas reward high heat for caramelization and charring. Freshness matters more than variety — a peak-season common vegetable beats an out-of-season rare one.",
};

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

const files: string[] = [];
function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (
      entry.name.endsWith(".ts") &&
      ![
        "index.ts",
        "types.ts",
        "ingredients.ts",
        "ingredientSummaries.ts",
        "flavorProfiles.ts",
        "elementalProperties.ts",
      ].includes(entry.name)
    ) {
      files.push(p);
    }
  }
}
walk(INGREDIENTS_DIR);

function isDefault(text: string): boolean {
  return DEFAULT_SIGNATURES.some((sig) => text.startsWith(sig));
}

let replaced = 0;
let filesModified = 0;

for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let modified = false;

  for (const decl of sf.getVariableDeclarations()) {
    const rootObj = decl
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!rootObj) continue;

    for (const prop of rootObj.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      let ingObj = pa
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!ingObj) {
        const callExpr = pa
          .getInitializer()
          ?.asKind(SyntaxKind.CallExpression);
        if (callExpr) {
          const args = callExpr.getArguments();
          const objArg = args.find(
            (a) => a.getKind() === SyntaxKind.ObjectLiteralExpression,
          );
          if (objArg) ingObj = objArg.asKind(SyntaxKind.ObjectLiteralExpression);
        }
      }
      if (!ingObj) continue;
      if (!ingObj.getProperty("name")) continue;

      const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
      const curated = CURATED[slug];
      if (!curated) continue;

      const descProp = ingObj
        .getProperty("description")
        ?.asKind(SyntaxKind.PropertyAssignment);
      if (!descProp) continue;

      const currentText = descProp.getInitializer()?.getText() ?? "";
      const cleaned = currentText.replace(/^["'`]|["'`]$/g, "");
      if (!isDefault(cleaned)) continue;

      const escaped = curated.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      descProp.setInitializer(`"${escaped}"`);
      replaced++;
      modified = true;
    }
  }

  if (modified) {
    sf.saveSync();
    filesModified++;
  } else {
    project.removeSourceFile(sf);
  }
}

console.log(
  `Curated descriptions: ${replaced} entries upgraded across ${filesModified} files.`,
);
