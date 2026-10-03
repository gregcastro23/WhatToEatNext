import type { FeatureKey } from "./catalogContract";

/**
 * Term tables behind the computed dish features. A dish's raw score for a
 * feature is the sum of the weights of the terms its ingredient names (or,
 * where stated, its dish name / instructions) contain; dishFeatures.ts maps
 * that sum into [0, 1] with a saturating curve. Weights are relative
 * strengths within one table, so 1.0 means "on its own, a clear signal".
 */

export interface Term {
  pattern: RegExp;
  weight: number;
}

export type MethodId =
  | "deep-fry"
  | "fry"
  | "bake"
  | "roast"
  | "grill"
  | "char"
  | "smoke"
  | "braise"
  | "stew"
  | "slow-cook"
  | "simmer"
  | "boil"
  | "steam"
  | "poach"
  | "saute"
  | "stir-fry"
  | "sear"
  | "toast"
  | "broil"
  | "griddle"
  | "stovetop"
  | "raw"
  | "chill"
  | "freeze"
  | "blend"
  | "mash"
  | "knead"
  | "ferment"
  | "marinate";

/** Method verbs, matched in authored method lists and instruction text. */
// prettier-ignore
export const METHOD_PATTERNS: ReadonlyArray<{ id: MethodId; pattern: RegExp }> = [
  { id: "deep-fry", pattern: /\b(deep[- ]?fr(y|ied|ies|ying)|tempura)\b/ },
  { id: "fry", pattern: /\b(pan[- ]?fr(y|ied|ying)|fr(y|ied|ies|ying)|shallow[- ]fr\w*)\b/ },
  { id: "bake", pattern: /\b(bak(e|ed|es|ing)|oven)\b/ },
  { id: "roast", pattern: /\broast(ed|ing|s)?\b/ },
  { id: "grill", pattern: /\b(grill(ed|ing|s)?|barbecu\w*|bbq|skewers?)\b/ },
  { id: "char", pattern: /\b(char(red|ring|s)?|blacken(ed|ing)?|blister(ed|ing)?|torch(ed)?)\b/ },
  { id: "smoke", pattern: /\bsmok(e|ed|ing)\b/ },
  { id: "braise", pattern: /\brais(e|ed|es|ing)\b/ },
  { id: "stew", pattern: /\bstew(ed|ing|s)?\b/ },
  { id: "slow-cook", pattern: /\b(slow[- ]cook\w*|low and slow|several hours|overnight)\b/ },
  { id: "simmer", pattern: /\bsimmer(ed|ing|s)?\b/ },
  { id: "boil", pattern: /\bboil(ed|ing|s)?\b/ },
  { id: "steam", pattern: /\bsteam(ed|ing|er|s)?\b/ },
  { id: "poach", pattern: /\bpoach(ed|ing)?\b/ },
  { id: "saute", pattern: /\bsaut(e|ee|eed|eing|ed)\b/ },
  { id: "stir-fry", pattern: /\b(stir[- ]?fr\w*|wok)\b/ },
  { id: "sear", pattern: /\bsear(ed|ing|s)?\b/ },
  { id: "toast", pattern: /\btoast(ed|ing|s)?\b/ },
  { id: "broil", pattern: /\b(broil(ed|ing|er)?|salamander)\b/ },
  { id: "griddle", pattern: /\b(griddl\w*|comal|crepe pan|flat[- ]?top)\b/ },
  { id: "stovetop", pattern: /\b(cook (until|for|over|on)|heat (the|a|oil|until)|skillet|saucepan|frying pan|dutch oven|over (medium|high|low)[- ]?(high|low)? heat|bring to a boil)\b/ },
  { id: "raw", pattern: /\b(raw|no[- ]cook|uncooked)\b/ },
  { id: "chill", pattern: /\b(chill(ed|ing)?|refrigerat\w*|serve cold|cool completely)\b/ },
  { id: "freeze", pattern: /\b(freez(e|ing)|frozen|churn\w*)\b/ },
  { id: "blend", pattern: /\b(blend(ed|er|ing)?|pur(e|ee)e?d?|food processor)\b/ },
  { id: "mash", pattern: /\bmash(ed|ing)?\b/ },
  { id: "knead", pattern: /\bknead(ed|ing)?\b/ },
  { id: "ferment", pattern: /\bferment(ed|ing|ation)?\b/ },
  { id: "marinate", pattern: /\bmarinat(e|ed|ing)\b/ },
];

export const HEAT_METHODS: ReadonlySet<MethodId> = new Set<MethodId>([
  "deep-fry", "fry", "bake", "roast", "grill", "char", "smoke", "braise", "stew",
  "slow-cook", "simmer", "boil", "steam", "poach", "saute", "stir-fry", "sear",
  "toast", "broil", "griddle", "stovetop",
]);

/** What a cooking method does to texture and flavor, as feature points. */
// prettier-ignore
export const METHOD_EFFECTS: Readonly<Record<MethodId, Partial<Record<FeatureKey, number>>>> = {
  "deep-fry": { crunch: 1.4, richness: 1 },
  fry: { crunch: 0.8, richness: 0.5 },
  bake: { crunch: 0.3 },
  roast: { crunch: 0.4, smoky: 0.4, umami: 0.3 },
  grill: { smoky: 1, crunch: 0.3 },
  char: { smoky: 1.2, crunch: 0.3 },
  smoke: { smoky: 1.4 },
  braise: { tender: 1.2, umami: 0.4 },
  stew: { tender: 1, brothy: 0.5 },
  "slow-cook": { tender: 1.2 },
  simmer: { tender: 0.3, brothy: 0.15 },
  boil: { tender: 0.2 },
  steam: { tender: 0.5 },
  poach: { tender: 0.7 },
  saute: { umami: 0.1 },
  "stir-fry": { crunch: 0.4, smoky: 0.2 },
  sear: { crunch: 0.3, umami: 0.3, smoky: 0.2 },
  toast: { crunch: 0.6, smoky: 0.2 },
  broil: { crunch: 0.3, smoky: 0.5 },
  griddle: { crunch: 0.3 },
  stovetop: {},
  raw: { fresh: 0.6, crunch: 0.4 },
  chill: { fresh: 0.2 },
  freeze: { sweet: 0.2 },
  blend: { tender: 0.6 },
  mash: { tender: 1 },
  knead: {},
  ferment: { umami: 0.4 },
  marinate: { umami: 0.2 },
};

/** Terms read from INGREDIENT names. */
// prettier-ignore
export const INGREDIENT_TERMS: Readonly<Partial<Record<FeatureKey, readonly Term[]>>> = {
  richness: [
    { pattern: /\b(heavy cream|double cream|whipping cream|mascarpone|creme fraiche)\b/, weight: 1.2 },
    { pattern: /\b(butter|ghee|lard|duck fat|tallow)\b(?!nut)/, weight: 0.8 },
    { pattern: /\b(cheese|parmesan|mozzarella|cheddar|gruyere|ricotta|paneer|brie)\b/, weight: 0.7 },
    { pattern: /\b(coconut milk|coconut cream|cream)\b/, weight: 0.6 },
    { pattern: /\b(bacon|pork belly|pancetta|chorizo|sausages?)\b/, weight: 0.7 },
    { pattern: /\b(egg yolks?|mayonnaise|aioli|chocolate|peanut butter|tahini|avocados?)\b/, weight: 0.5 },
    { pattern: /\b(sour cream|yogh?urt|whole milk|condensed milk)\b/, weight: 0.4 },
  ],
  crunch: [
    { pattern: /\b(panko|breadcrumbs|croutons|tortilla chips|crackers|tempura)\b/, weight: 1 },
    { pattern: /\b(peanuts?|almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|pine nuts|seeds)\b/, weight: 0.6 },
    { pattern: /\b(cucumbers?|radish\w*|celery|jicama|bean sprouts|cabbage|lettuce|apples?|fennel bulb|snap peas)\b/, weight: 0.4 },
  ],
  tender: [
    { pattern: /\b(silken tofu|custard|ricotta|mascarpone|polenta|grits|congee|risotto|arborio)\b/, weight: 0.8 },
    { pattern: /\b(lentils?|split peas|dal|potato(es)?|sweet potato(es)?|squash|pumpkin|eggplants?)\b/, weight: 0.4 },
  ],
  fresh: [
    { pattern: /\b(lemons?|limes?|yuzu|lemon juice|lime juice|citrus)\b/, weight: 0.8 },
    { pattern: /\b(vinegar|pickled?|sumac|tamarind)\b/, weight: 0.5 },
    { pattern: /\b(cilantro|parsley|mint|basil|dill|chives|thai basil|shiso|scallions?|green onions?)\b/, weight: 0.5 },
    { pattern: /\b(cucumbers?|tomato(es)?|lettuce|arugula|radish\w*|bean sprouts)\b/, weight: 0.3 },
  ],
  umami: [
    { pattern: /\b(soy sauce|tamari|miso|fish sauce|oyster sauce|doenjang|gochujang|anchov\w*|dashi|bonito|kombu|msg|worcestershire|nutritional yeast)\b/, weight: 1 },
    { pattern: /\b(parmesan|parmigiano|pecorino|aged cheese)\b/, weight: 0.8 },
    { pattern: /\b(mushrooms?|shiitake|porcini|tomato paste|sun-dried tomato\w*|seaweed|nori|kimchi)\b/, weight: 0.6 },
    { pattern: /\b(stock|broth|bouillon|beef|pork|bacon|ham|lamb)\b/, weight: 0.4 },
  ],
  sweet: [
    { pattern: /\b(sugar|honey|maple|molasses|syrup|caramel|condensed milk|jaggery|piloncillo|dulce de leche|agave)\b/, weight: 0.6 },
    { pattern: /\b(chocolate|cocoa|jam|preserves|marshmallows?|vanilla)\b/, weight: 0.7 },
    { pattern: /\b(berr(y|ies)|mango(es)?|bananas?|apples?|pears?|dates|raisins|figs?|peach(es)?|pineapple|cherr(y|ies))\b/, weight: 0.4 },
  ],
  aromatic: [
    { pattern: /\b(cumin|coriander|cardamom|cinnamon|cloves?|star anise|turmeric|garam masala|five[- ]spice|saffron|fennel seeds?|sumac|za'?atar|ras el hanout|nutmeg|allspice|curry|berbere|fenugreek|szechuan|sichuan)\b/, weight: 0.5 },
    { pattern: /\b(lemongrass|galangal|kaffir|makrut|ginger|curry leaves|epazote|annatto)\b/, weight: 0.5 },
    { pattern: /\b(garlic|shallots?|rosemary|thyme|oregano|bay leaf|bay leaves|basil|mint)\b/, weight: 0.2 },
  ],
  smoky: [
    { pattern: /\b(smoked|chipotles?|liquid smoke|smoked paprika|bacon|lapsang|charcoal|mesquite)\b/, weight: 1 },
  ],
  green: [
    { pattern: /\b(spinach|kale|chard|bok choy|collards?|broccoli|cabbage|lettuce|arugula|watercress|peas|green beans|asparagus|zucchini|courgettes?|cucumbers?|celery|brussels sprouts|greens|herbs?|okra|edamame)\b/, weight: 1 },
    { pattern: /\b(carrots?|peppers?|tomato(es)?|cauliflower|eggplants?|squash|beets?|onions?|mushrooms?|corn|radish\w*|leeks?)\b/, weight: 0.6 },
  ],
  hearty: [
    { pattern: /\b(beef|pork|lamb|chicken|turkey|duck|sausages?|bacon|steak|brisket)\b/, weight: 0.9 },
    { pattern: /\b(rice|pasta|noodles?|bread|potato(es)?|tortillas?|beans?|lentils?|chickpeas?|quinoa|barley|farro|polenta|couscous|gnocchi)\b/, weight: 0.6 },
    { pattern: /\b(cheese|eggs?|tofu|tempeh|salmon|tuna|cod)\b/, weight: 0.4 },
  ],
};

/** Terms read from the DISH NAME, where the name itself states the format. */
// prettier-ignore
export const NAME_TERMS: Readonly<Partial<Record<FeatureKey, readonly Term[]>>> = {
  brothy: [
    { pattern: /\b(soup|stew|broth|pho|ramen|laksa|chowder|bisque|gumbo|congee|porridge|jook|hot ?pot|borscht|curry|dal|dahl|tom yum|tom kha|caldo|pozole|menudo|consomme|bouillabaisse|chili|minestrone|ribollita|shchi|solyanka|udon|tagine|harira|jjigae|tang|guk|sinigang|avgolemono|soto)\b/, weight: 1.4 },
  ],
  handheld: [
    { pattern: /\b(sandwich|burgers?|tacos?|burritos?|wraps?|quesadillas?|spring rolls?|egg rolls?|dumplings?|bao|buns?|empanadas?|samosas?|pizza|flatbread|toasts?|banh mi|gyros?|kebabs?|skewers?|sliders?|hot dogs?|arepas?|pitas?|onigiri|fritters?|pakoras?|falafel|tamales?|gozleme|pierogi|pelmeni|gyoza|mandu|jiaozi|bun|pastels?|calzone|crepes?|tostadas?|sopes?|elote|satay|yakitori|chimichangas?|enchiladas?|nachos|pirozhki|blini|bruschetta|spanakopita|borek)\b/, weight: 1.4 },
  ],
  fresh: [
    { pattern: /\b(salad|slaw|ceviche|crudo|tartare|poke|gazpacho|tabbouleh|fattoush|som tam|larb|summer rolls?|carpaccio|pico de gallo)\b/, weight: 1 },
  ],
  sweet: [
    { pattern: /\b(cake|pie|tart|pudding|cookies?|brownies?|ice cream|sorbet|mousse|flan|custard|pastry|cheesecake|tiramisu|baklava|halwa|halva|mochi|churros|donuts?|doughnuts?|crumble|cobbler|parfait|sweet|candy|fudge|macarons?|pancakes?|waffles?|french toast)\b/, weight: 1 },
  ],
  tender: [
    { pattern: /\b(braised|stew|confit|mash|mashed|risotto|congee|porridge|pudding|custard|puree|curry|dal|korma|stroganoff|ragu|bourguignon|carnitas|pulled)\b/, weight: 0.6 },
  ],
  crunch: [
    { pattern: /\b(crispy|crisp|crunchy|fried|tempura|katsu|karaage|schnitzel|chips|fritters?|pakoras?|tostadas?|nachos|brittle|croquettes?|tonkatsu)\b/, weight: 1 },
  ],
};

/** Dish names that are served cold even when a heat method appears. */
export const COLD_NAME =
  /\b(salad|slaw|ceviche|gazpacho|sushi|sashimi|tartare|poke|crudo|carpaccio|ice cream|sorbet|granita|parfait|chilled|cold|mousse|panna cotta|tiramisu|cheesecake|summer rolls?|naengmyeon|bingsu|paletas?|smoothie bowl|overnight oats|chia pudding|raita|tzatziki|hummus)\b/;
