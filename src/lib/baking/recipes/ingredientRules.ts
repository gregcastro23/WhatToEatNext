/**
 * The ordered rules that read a recipe's ingredient NAME as a Baking Lab
 * vector — or as a stated reason it cannot be one.
 *
 * Order is the contract: the first rule whose pattern matches the normalised
 * name wins, so a specific rule ("whole wheat pastry flour") sits above the
 * general one it would otherwise fall into ("flour"). A rule that names a
 * finished product (bread crumbs, phyllo) sits above the flour rule for the
 * same reason: "phyllo dough" contains no word "flour", but "graham cracker
 * crumbs" must not reach the cracker-free sugar rule either.
 *
 * Nothing here guesses. A rule maps only where the vector IS that food; where
 * it reads a near-synonym (unspecified "flour" as all-purpose) the rule says
 * so in `note`, and the converter reports that note as a DECLARED assumption.
 *
 * @file src/lib/baking/recipes/ingredientRules.ts
 */

export type MatchOutcome =
  | { kind: "matched"; vectorId: string; note: string | null }
  | { kind: "unmatched"; reason: string; structural: boolean };

export interface IngredientRule {
  pattern: RegExp;
  outcome: MatchOutcome;
}

function to(vectorId: string, note: string | null = null): MatchOutcome {
  return { kind: "matched", vectorId, note };
}

function miss(reason: string): MatchOutcome {
  return { kind: "unmatched", reason, structural: false };
}

/** A miss on the ingredient that would form the structure: the good cannot be simulated without it. */
function structuralMiss(reason: string): MatchOutcome {
  return { kind: "unmatched", reason, structural: true };
}

const FINISHED = "a finished baked product, not a raw ingredient: its composition after baking is unknown";
const PREPARED_DOUGH = "a prepared dough with no vector: its layered fat and flour are not one homogeneous batter";

/** Finished products and prepared doughs — checked before any flour rule. */
const PRODUCT_RULES: readonly IngredientRule[] = [
  { pattern: /\b(bread ?crumbs?|panko|croutons?|crackers?|graham(?! flour)|cookies?|wafers?|ladyfingers?|cake mix|croissants?|biscotti|sponge cake|pound cake|cookie crumbs|(flour |corn )?tortillas?)\b/, outcome: miss(FINISHED) },
  { pattern: /\b(phyllo|filo|fillo|kataifi|puff pastry|pastry dough|pastry sheets?|pie doughs?|pie crusts?|pie shells?|shortcrust|pate brisee|pate sucree|sweet pastry|tart shells?|crusts?)\b/, outcome: structuralMiss(PREPARED_DOUGH) },
  { pattern: /^(?!.*\bflour\b).*\b(bread|loaf|baguette|rolls?|buns?|pita|tortillas?|naan|brioche|challah|ciabatta|bagels?)\b/, outcome: miss(FINISHED) },
];

const FLOUR_RULES: readonly IngredientRule[] = [
  { pattern: /\bwhole[- ]?wheat pastry flour\b|\bwhole[- ]?grain pastry flour\b/, outcome: to("whole-wheat-pastry-flour") },
  { pattern: /\b(whole[- ]?wheat|whole[- ]?grain|wholemeal|graham)\b.*\bflour\b/, outcome: to("whole-wheat-flour") },
  { pattern: /\b(bread|high[- ]?gluten|hi[- ]?gluten|strong|manitoba|panettone)\b.*\bflour\b/, outcome: to("bread-flour") },
  { pattern: /\bcake\b.*\bflour\b/, outcome: to("cake-flour") },
  { pattern: /\bpastry\b.*\bflour\b/, outcome: to("cake-flour", "white pastry flour read as the cake/pastry flour vector (FDC cake flour); pastry flour runs a little higher in protein") },
  { pattern: /\bself[- ]?rising\b|\bself[- ]?raising\b/, outcome: structuralMiss("self-rising flour carries baking powder and salt in unstated amounts: no vector") },
  { pattern: /\bspelt\b/, outcome: to("spelt-flour") },
  { pattern: /\b(semolina|durum)\b/, outcome: to("semolina") },
  { pattern: /\b(corn ?meal|polenta)\b/, outcome: to("cornmeal") },
  { pattern: /\bcorn flour\b/, outcome: to("cornmeal", "\"corn flour\" read in the US sense, finely ground whole corn (the UK sense is cornstarch)") },
  { pattern: /\boat (milk|beverage|drink)\b/, outcome: to("oat-milk") },
  { pattern: /\boat flour\b/, outcome: to("rolled-oats", "oat flour read as ground rolled oats (the same FDC composition); FDC weighed the flakes, so a cup of the flour is not weighed") },
  { pattern: /\b(rolled |old[- ]fashioned |quick |instant |steel[- ]cut )?oats\b|\boatmeal\b/, outcome: to("rolled-oats") },
  { pattern: /\bbrown rice flour\b/, outcome: to("brown-rice-flour") },
  { pattern: /\b(white )?(sweet|glutinous) rice flour\b|\bmochiko\b/, outcome: to("sweet-rice-flour") },
  { pattern: /\b(white )?rice flour\b/, outcome: to("rice-flour") },
  { pattern: /\b(tapioca|cassava) (starch|flour)\b|\btapioca\b/, outcome: to("tapioca-starch") },
  { pattern: /\bsorghum flour\b/, outcome: to("sorghum-flour") },
  { pattern: /\bbuckwheat flour\b/, outcome: to("buckwheat-flour") },
  { pattern: /\bbarley (flour|meal)\b/, outcome: to("barley-flour") },
  { pattern: /\brye flour\b/, outcome: to("rye-flour") },
  { pattern: /\b(arrowroot|arrowroot (flour|starch|powder))\b/, outcome: to("arrowroot-starch") },
  { pattern: /\b(kuzu|kudzu)\b/, outcome: to("arrowroot-starch", "kuzu (kudzu root starch) read as arrowroot starch (FDC 170684, a root starch of like composition)") },
  { pattern: /\bbulgur( wheat)?\b/, outcome: to("bulgur") },
  { pattern: /\balmond (flour|meal)\b|\bground almonds\b/, outcome: to("almond-flour") },
  { pattern: /\bcorn ?starch\b|\bcornflour\b/, outcome: to("cornstarch") },
  { pattern: /\b(gluten[- ]free|flour blend|1:1|cup ?4 ?cup)\b/, outcome: structuralMiss("a proprietary flour blend with no stated composition") },
  { pattern: /\b(teff|millet|chickpea|garbanzo|coconut|potato|quinoa|amaranth|nut) (flour|starch)\b/, outcome: structuralMiss("no vector for this flour or starch") },
  { pattern: /^(unbleached |sifted |un-?sifted )?flour$/, outcome: to("all-purpose-flour", "unspecified \"flour\" read as all-purpose flour") },
  { pattern: /^(unbleached )?(white )?(all[- ]?purpose|plain|white|00|tipo 00|ap)( white)? flour$/, outcome: to("all-purpose-flour") },
  // Any other flour has no vector: hazelnut, chestnut, carob, einkorn, pea… are never read as wheat.
  { pattern: /\bflour\b/, outcome: structuralMiss("no vector for this flour") },
];

const FAT_RULES: readonly IngredientRule[] = [
  { pattern: /\bshortening\b/, outcome: to("vegetable-shortening") },
  { pattern: /\bbrown(ed)? butter\b|\bbeurre noisette\b/, outcome: to("brown-butter") },
  { pattern: /\bghee\b|\bclarified butter\b/, outcome: to("ghee") },
  { pattern: /\bpeanut butter (chips|morsels|cups)\b/, outcome: miss("a flavoured confection: no vector") },
  { pattern: /\bpeanut butter\b/, outcome: to("peanut-butter") },
  { pattern: /\b(almond|cashew|nut|seed|sunflower seed|cocoa|apple|shea|vegan|plant[- ]based|dairy[- ]free) butter\b|\bmargarine\b|\bearth balance\b|\bbuttery spread\b/, outcome: miss("a spread or nut butter: no vector") },
  { pattern: /\bbutter\b(?!milk)/, outcome: to("butter") },
  { pattern: /\b(vegetable|canola|rapeseed|sunflower|safflower|grapeseed|neutral|corn|avocado|peanut|light olive|mild|no[- ]taste|flavou?rless|unflavou?red) oil\b|^oil$|^canola$/, outcome: to("vegetable-oil") },
  { pattern: /\bolive oil\b/, outcome: to("olive-oil") },
  { pattern: /\bcoconut oil\b/, outcome: to("coconut-oil") },
  { pattern: /\blard\b/, outcome: to("lard") },
];

const SWEET_RULES: readonly IngredientRule[] = [
  { pattern: /\b(powdered|confectioners?|icing) sugar\b/, outcome: to("powdered-sugar") },
  { pattern: /\b(brown|muscovado) sugar\b/, outcome: to("brown-sugar") },
  { pattern: /\bmaple (sugar|crystals|granules|flakes)\b/, outcome: to("maple-sugar") },
  { pattern: /\bdate sugar\b/, outcome: to("date-sugar") },
  { pattern: /\b(coconut|palm) sugar\b/, outcome: to("coconut-sugar") },
  { pattern: /\bjaggery\b|\bpiloncillo\b|\bsucanat\b/, outcome: miss("an unrefined sugar: no vector") },
  { pattern: /\b(demerara|turbinado|raw) sugar\b/, outcome: to("granulated-sugar", "demerara/turbinado read as granulated sucrose; their trace molasses is not modelled") },
  { pattern: /\b(granulated|white|caster|castor|superfine|cane|organic cane|organic)? ?sugar\b/, outcome: to("granulated-sugar") },
  { pattern: /\bhoney\b/, outcome: to("honey") },
  { pattern: /\bmaple syrup\b/, outcome: to("maple-syrup") },
  { pattern: /\b(pomegranate|date|grape|carob) molasses\b/, outcome: miss("a fruit molasses (a reduced juice), not cane molasses: no vector") },
  { pattern: /\bmolasses\b|\btreacle\b/, outcome: to("molasses") },
  { pattern: /\b(brown )?rice syrup\b/, outcome: to("brown-rice-syrup") },
  { pattern: /\b(light |dark )?corn syrup\b/, outcome: to("corn-syrup") },
  { pattern: /\binvert (sugar|syrup)\b/, outcome: to("invert-sugar-syrup") },
  { pattern: /\ballulose\b/, outcome: to("allulose") },
];

const DAIRY_EGG_RULES: readonly IngredientRule[] = [
  { pattern: /\bbuttermilk\b/, outcome: to("buttermilk") },
  { pattern: /\bsour cream\b/, outcome: to("sour-cream") },
  { pattern: /\b(heavy|whipping|double|thickened) (whipping )?cream\b/, outcome: to("heavy-cream") },
  { pattern: /\balmond (milk|beverage)\b/, outcome: to("almond-milk") },
  { pattern: /\bsoy ?(milk|beverage)\b/, outcome: to("soy-milk") },
  { pattern: /\boat (milk|beverage|drink)\b/, outcome: to("oat-milk") },
  { pattern: /\bcoconut milk\b/, outcome: to("coconut-milk") },
  { pattern: /\b(rice|cashew|hemp|plant|non[- ]?dairy) milk\b|\bmilk substitute\b/, outcome: miss("plant milk: no vector") },
  { pattern: /\b(evaporated|condensed|powdered|dry|skim|skimmed|nonfat|non[- ]fat|low[- ]?fat|2%|1%|reduced[- ]fat) milk\b|\bmilk powder\b/, outcome: miss("no vector for this milk (only whole milk has one)") },
  { pattern: /^(whole )?milk$|\bwhole milk\b|^(warm|cold|scalded|lukewarm) milk$/, outcome: to("whole-milk") },
  { pattern: /\b(plain |greek )?yogh?urt\b/, outcome: to("plain-yogurt") },
  { pattern: /\begg ?whites?\b|\balbumen\b/, outcome: to("egg-white") },
  { pattern: /\b(egg )?yolks?\b/, outcome: to("egg-yolk") },
  { pattern: /\b(flax|chia|vegan) eggs?\b|\begg replacer\b|\begg substitute\b/, outcome: miss("an egg replacer: no vector") },
  { pattern: /\beggs?\b/, outcome: to("whole-egg") },
  { pattern: /\baquafaba\b|\bchickpea (liquid|brine)\b/, outcome: to("aquafaba") },
];

const INCLUSION_RULES: readonly IngredientRule[] = [
  { pattern: /\bwalnuts?\b/, outcome: to("walnuts") },
  { pattern: /\bpecans?\b/, outcome: to("pecans") },
  { pattern: /\balmonds?\b(?! (milk|extract|butter|paste))/, outcome: to("almonds") },
  { pattern: /\bpistachios?\b/, outcome: to("pistachios") },
  { pattern: /\bcashews?\b(?! (milk|butter))/, outcome: to("cashews") },
  { pattern: /\b(golden )?raisins?\b|\bsultanas?\b/, outcome: to("raisins") },
  { pattern: /\b(dried |zante )?currants\b/, outcome: to("raisins", "dried (Zante) currants are small dried grapes: read as raisins") },
  { pattern: /\bapple (juice|cider)\b/, outcome: to("apple-juice") },
  { pattern: /\borange juice\b/, outcome: to("orange-juice") },
  { pattern: /\bapple ?sauce\b/, outcome: to("applesauce") },
  { pattern: /\bapples?\b(?! (juice|cider|sauce|butter|vinegar))/, outcome: to("apple") },
  { pattern: /\bpears?\b/, outcome: to("pear") },
  { pattern: /\bbananas?\b/, outcome: to("banana") },
  { pattern: /\bdried cranberries\b|\bcraisins\b/, outcome: to("dried-cranberries") },
  { pattern: /\bcranberries\b/, outcome: to("fresh-cranberries") },
  { pattern: /\bblueberries\b/, outcome: to("blueberries") },
  { pattern: /\b(shredded |desiccated |flaked )?coconut( flakes| meat)?\b(?! (oil|milk|sugar|water|flour|cream|butter))/, outcome: to("shredded-coconut") },
  { pattern: /\bcarrots?\b/, outcome: to("grated-carrot") },
  { pattern: /\bzucchinis?\b/, outcome: to("zucchini") },
  { pattern: /\bpotato(es)?\b(?! (starch|flour))/, outcome: to("potato") },
  { pattern: /\b(dried )?figs?\b/, outcome: to("dried-figs") },
  { pattern: /\bdates?\b(?! (sugar|syrup|molasses))/, outcome: to("pitted-dates") },
  { pattern: /\bdried apricots?\b/, outcome: to("dried-apricots") },
  { pattern: /\bdried cherries\b/, outcome: to("dried-cherries") },
  { pattern: /\bolives?\b(?! oil)/, outcome: to("olives") },
  { pattern: /\bpoppy ?seeds?\b/, outcome: to("poppy-seeds") },
  { pattern: /\bsesame ?seeds?\b/, outcome: to("sesame-seeds") },
  { pattern: /\bsunflower ?seeds?\b/, outcome: to("sunflower-seeds") },
  { pattern: /\bflax ?seeds?\b|\bflaxmeal\b/, outcome: to("flaxseed") },
];

const OTHER_RULES: readonly IngredientRule[] = [
  { pattern: /\b(baking soda|bicarbonate of soda|sodium bicarbonate|bicarb)\b/, outcome: to("baking-soda") },
  { pattern: /\bbaking powder\b/, outcome: to("baking-powder") },
  { pattern: /\bcream of tartar\b/, outcome: to("cream-of-tartar") },
  { pattern: /\b(fresh|cake|compressed) yeast\b/, outcome: miss("fresh yeast is about 70 % water: no vector (the yeast vector is dry yeast)") },
  { pattern: /\byeast\b/, outcome: to("instant-yeast") },
  { pattern: /\b(sourdough )?(starter|levain)\b|\bmother dough\b/, outcome: to("sourdough-levain") },
  { pattern: /\b(celery|garlic|onion|seasoned|smoked|truffle) salt\b/, outcome: miss("a seasoning salt: no vector") },
  { pattern: /\bsalt\b/, outcome: to("salt") },
  { pattern: /\bvanilla extract\b|^vanilla$/, outcome: to("vanilla-extract") },
  { pattern: /\b(dutch|dutched|dutch[- ]process(ed)?|alkali[sz]ed) cocoa\b|\bcocoa\b.*\bdutch/, outcome: to("cocoa-dutch") },
  { pattern: /\b(cocoa|cacao) nibs\b|\bcocoa butter\b/, outcome: miss("no vector") },
  { pattern: /\b(cocoa|cacao) powder\b|^(unsweetened )?cocoa$/, outcome: to("cocoa-natural") },
  { pattern: /\b(milk|white|unsweetened|baking) chocolate\b/, outcome: miss("no vector for this chocolate") },
  { pattern: /\b(dark|bittersweet|70%|extra dark) chocolate\b/, outcome: to("dark-chocolate-70") },
  { pattern: /\b(semi[- ]?sweet )?chocolate (chips?|morsels|chunks)\b|\bsemi[- ]?sweet chocolate\b|^chocolate$/, outcome: to("semisweet-chocolate") },
  { pattern: /\bxanthan\b/, outcome: to("xanthan-gum") },
  { pattern: /\bpsyllium\b/, outcome: to("psyllium-husk") },
  { pattern: /\blemon juice\b/, outcome: to("lemon-juice") },
  { pattern: /\b(rose|orange blossom|orange flower|coconut|sparkling|soda) water\b/, outcome: miss("a flavoured water: no vector") },
  { pattern: /\bwater\b/, outcome: to("water") },
];

export const INGREDIENT_RULES: readonly IngredientRule[] = [
  ...PRODUCT_RULES,
  ...FLOUR_RULES,
  ...FAT_RULES,
  ...SWEET_RULES,
  ...DAIRY_EGG_RULES,
  ...INCLUSION_RULES,
  ...OTHER_RULES,
];

export const NO_VECTOR = "no baking vector for this ingredient";
