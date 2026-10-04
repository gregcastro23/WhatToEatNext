/**
 * Ingredient groups the quiz can ask about ("😍 / 🙂 / 🙅 avocado?") and filter
 * on ("hard no: cilantro"). A dish belongs to a group when any of its
 * ingredient names matches the group's pattern. Patterns run against the
 * accent-folded, lowercased ingredient name (see normalizeText).
 *
 * `kind` drives the dish tags: `protein` and `base` groups become the dish's
 * protein/base tags; the rest are flavor/produce groups for questions only.
 */

export type GroupKind = "protein" | "base" | "produce" | "flavor" | "dairy";

export interface IngredientGroup {
  id: string;
  label: string;
  emoji: string;
  kind: GroupKind;
  pattern: RegExp;
}

// One row per group keeps the table auditable at a glance.
// prettier-ignore
export const INGREDIENT_GROUPS: readonly IngredientGroup[] = [
  // Proteins
  { id: "beef", label: "Beef", emoji: "🥩", kind: "protein", pattern: /\b(beef|steak|brisket|sirloin|veal|oxtail|short ribs?|ground chuck)\b/ },
  { id: "pork", label: "Pork", emoji: "🐖", kind: "protein", pattern: /\b(pork|bacon|ham|pancetta|prosciutto|chorizo|sausages?|lardons?|guanciale)\b/ },
  { id: "lamb", label: "Lamb", emoji: "🐑", kind: "protein", pattern: /\b(lamb|mutton|goat)\b/ },
  { id: "chicken", label: "Chicken", emoji: "🍗", kind: "protein", pattern: /\b(chicken|turkey|duck|poultry|quail)\b(?! (stock|broth|bouillon))/ },
  { id: "fish", label: "Fish", emoji: "🐟", kind: "protein", pattern: /\b(fish|salmon|tuna|cod|halibut|mackerel|sardines?|anchov\w*|trout|tilapia|snapper|sea bass|haddock|catfish|herring|bonito)\b(?! sauce)/ },
  { id: "shellfish", label: "Shellfish", emoji: "🦐", kind: "protein", pattern: /\b(shrimp|prawns?|crab|lobster|clams?|mussels?|oysters?|scallops?|squid|calamari|octopus|crawfish)\b/ },
  { id: "egg", label: "Eggs", emoji: "🥚", kind: "protein", pattern: /\b(eggs?|egg yolks?|egg whites?)\b/ },
  { id: "tofu", label: "Tofu & tempeh", emoji: "🧈", kind: "protein", pattern: /\b(tofu|tempeh|seitan|edamame)\b/ },
  { id: "beans", label: "Beans & lentils", emoji: "🫘", kind: "protein", pattern: /\b(beans?|lentils?|chickpeas?|garbanzos?|dal|dahl|split peas|black-eyed peas)\b(?! sprouts)/ },
  // Bases
  { id: "rice", label: "Rice", emoji: "🍚", kind: "base", pattern: /\b(rice|risotto|arborio|basmati|jasmine rice|congee)\b(?! (flour|noodles?|vinegar|paper|wine))/ },
  { id: "noodles", label: "Noodles & pasta", emoji: "🍜", kind: "base", pattern: /\b(noodles?|pasta|spaghetti|linguine|fettuccine|penne|macaroni|ramen|udon|soba|vermicelli|lasagna|orzo|gnocchi|rigatoni|tagliatelle|rice sticks)\b/ },
  { id: "bread", label: "Bread", emoji: "🥖", kind: "base", pattern: /\b(bread|baguette|bun|buns|pita|naan|tortillas?|flatbread|brioche|sourdough|toast|roll|rolls|croutons|breadcrumbs|panko|lavash|crust)\b/ },
  { id: "potato", label: "Potatoes", emoji: "🥔", kind: "base", pattern: /\b(potato(es)?|yukon gold|russet)\b(?! starch)/ },
  { id: "corn", label: "Corn", emoji: "🌽", kind: "base", pattern: /\b(corn|masa|polenta|cornmeal|hominy|grits)\b(?! ?starch)/ },
  { id: "grains", label: "Hearty grains", emoji: "🌾", kind: "base", pattern: /\b(quinoa|barley|farro|bulgur|couscous|millet|buckwheat|kasha|oats?|oatmeal|amaranth|freekeh|wild rice)\b/ },
  // Dairy
  { id: "cheese", label: "Cheese", emoji: "🧀", kind: "dairy", pattern: /\b(cheese|parmesan|parmigiano|mozzarella|cheddar|feta|ricotta|gruyere|pecorino|halloumi|paneer|mascarpone|gouda|brie|goat cheese|queso|cotija)\b/ },
  { id: "cream", label: "Cream & butter", emoji: "🧈", kind: "dairy", pattern: /\b(cream|butter|ghee|creme fraiche|sour cream)\b(?! of tartar)/ },
  { id: "yogurt", label: "Yogurt", emoji: "🥛", kind: "dairy", pattern: /\b(yogh?urt|labneh|kefir|curd)\b/ },
  // Produce
  { id: "avocado", label: "Avocado", emoji: "🥑", kind: "produce", pattern: /\bavocados?\b/ },
  { id: "mushroom", label: "Mushrooms", emoji: "🍄", kind: "produce", pattern: /\b(mushrooms?|shiitake|porcini|chanterelles?|enoki|oyster mushrooms?|cremini|portobello|morels?)\b/ },
  { id: "tomato", label: "Tomatoes", emoji: "🍅", kind: "produce", pattern: /\b(tomato(es)?|passata|marinara)\b/ },
  { id: "eggplant", label: "Eggplant", emoji: "🍆", kind: "produce", pattern: /\b(eggplants?|aubergines?|brinjal)\b/ },
  { id: "greens", label: "Leafy greens", emoji: "🥬", kind: "produce", pattern: /\b(spinach|kale|chard|bok choy|collards?|lettuce|arugula|greens|watercress|cabbage|napa)\b/ },
  { id: "olives", label: "Olives", emoji: "🫒", kind: "produce", pattern: /\bolives\b|\bkalamata\b/ },
  { id: "beets", label: "Beets", emoji: "🟣", kind: "produce", pattern: /\b(beets?|beetroot)\b/ },
  { id: "squash", label: "Squash & pumpkin", emoji: "🎃", kind: "produce", pattern: /\b(squash|pumpkin|butternut|zucchini|courgettes?|kabocha)\b/ },
  { id: "berries", label: "Berries", emoji: "🍓", kind: "produce", pattern: /\b(berr(y|ies)|strawberr\w*|blueberr\w*|raspberr\w*|cranberr\w*|cherr(y|ies))\b/ },
  { id: "tropical", label: "Tropical fruit", emoji: "🥭", kind: "produce", pattern: /\b(mango(es)?|pineapple|papaya|banana|plantains?|passion fruit|guava|jackfruit)\b/ },
  { id: "coconut", label: "Coconut", emoji: "🥥", kind: "produce", pattern: /\bcoconut\b/ },
  { id: "onion-raw", label: "Raw onion", emoji: "🧅", kind: "produce", pattern: /\b(red onion|raw onion|shallots?|scallions?|green onions?|spring onions?)\b/ },
  // Flavors
  { id: "chili", label: "Chilies", emoji: "🌶️", kind: "flavor", pattern: /\b(chil(i|e|li)e?s?|cayenne|jalapenos?|habaneros?|serranos?|gochugaru|gochujang|sriracha|harissa|sambal|chipotles?|red pepper flakes|bird'?s eye|thai chil\w*|hot sauce|pepper flakes|aleppo|guajillo|ancho)\b/ },
  { id: "garlic", label: "Garlic", emoji: "🧄", kind: "flavor", pattern: /\bgarlic\b/ },
  { id: "ginger", label: "Ginger", emoji: "🫚", kind: "flavor", pattern: /\b(ginger|galangal)\b/ },
  { id: "citrus", label: "Citrus", emoji: "🍋", kind: "flavor", pattern: /\b(lemons?|limes?|orange|yuzu|grapefruit|citrus|lemongrass|kaffir|makrut)\b/ },
  { id: "cilantro", label: "Cilantro", emoji: "🌿", kind: "flavor", pattern: /\b(cilantro|coriander leaves|fresh coriander)\b/ },
  { id: "herbs", label: "Fresh herbs", emoji: "🌱", kind: "flavor", pattern: /\b(basil|mint|parsley|dill|chives|tarragon|thai basil|shiso|oregano leaves|fresh thyme|fresh rosemary)\b/ },
  { id: "warm-spice", label: "Warm spices", emoji: "🟤", kind: "flavor", pattern: /\b(cinnamon|cardamom|cloves?|star anise|nutmeg|allspice|garam masala|five[- ]spice|mace)\b/ },
  { id: "curry-spice", label: "Curry spices", emoji: "🍛", kind: "flavor", pattern: /\b(cumin|turmeric|curry|coriander seeds?|ground coriander|fenugreek|masala|ras el hanout|berbere)\b/ },
  { id: "ferment", label: "Funky & fermented", emoji: "🫙", kind: "flavor", pattern: /\b(kimchi|miso|fish sauce|doenjang|sauerkraut|pickled?|natto|shrimp paste|fermented|anchovy paste|blue cheese)\b/ },
  { id: "soy-sauce", label: "Soy & tamari", emoji: "🥢", kind: "flavor", pattern: /\b(soy sauce|tamari|shoyu|kecap manis|oyster sauce|hoisin)\b/ },
  { id: "nuts", label: "Nuts", emoji: "🥜", kind: "flavor", pattern: /\b(peanuts?|almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|pine nuts|macadamias?|nut butter)\b/ },
  { id: "sesame", label: "Sesame", emoji: "⚪", kind: "flavor", pattern: /\b(sesame|tahini)\b/ },
  { id: "chocolate", label: "Chocolate", emoji: "🍫", kind: "flavor", pattern: /\b(chocolate|cocoa|cacao)\b/ },
  { id: "honey-sweet", label: "Honey & syrup", emoji: "🍯", kind: "flavor", pattern: /\b(honey|maple|molasses|syrup|caramel|dulce de leche|condensed milk|jaggery|piloncillo)\b/ },
  { id: "smoke", label: "Smoky flavors", emoji: "🔥", kind: "flavor", pattern: /\b(smoked|smoky|chipotle|liquid smoke|barbecue|bbq)\b/ },
];

const GROUP_BY_ID = new Map(INGREDIENT_GROUPS.map((group) => [group.id, group]));

export function ingredientGroup(id: string): IngredientGroup | undefined {
  return GROUP_BY_ID.get(id);
}

/** Lowercase and fold accents so "sautéed jalapeño" matches "saute" / "jalapeno". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function groupsNamedBy(ingredientNames: readonly string[]): string[] {
  const names = ingredientNames.map(normalizeText);
  return INGREDIENT_GROUPS.filter((group) =>
    names.some((name) => group.pattern.test(name)),
  ).map((group) => group.id);
}
