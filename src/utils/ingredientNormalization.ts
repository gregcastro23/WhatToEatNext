export const MATCH_STOPWORDS = new Set([
    "fresh",
    "dried",
    "dry",
    "ground",
    "minced",
    "chopped",
    "sliced",
    "diced",
    "whole",
    "boneless",
    "skinless",
    "large",
    "small",
    "medium",
    "extra",
    "virgin",
    "to",
    "taste",
    "for",
    "garnish",
    "optional",
    "organic",
    "ripe",
    "raw",
    "cooked",
    "warm",
    "cold",
    "split",
    "lightly",
    "toasted",
    "unsalted",
    "salted",
    "full",
    "fat",
    "juice",
    "oil",
    "sauce",
    "pepper",
    "powder",
]);

export function stripQuotes(text: string): string {
    return text.replace(/^["'`]|["'`]$/g, "");
}

export function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, " ")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function singularize(token: string): string {
    if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
    if (token.endsWith("oes") && token.length > 4) return token.slice(0, -2);
    if (token.endsWith("s") && token.length > 2 && !token.endsWith("ss")) return token.slice(0, -1);
    return token;
}

export function normalizedVariants(input: string, skipStopwordOnly: boolean = true): Set<string> {
    const out = new Set<string>();
    const raw = normalize(input);
    if (!raw) return out;

    // Manual canonical mappings
    const corrected = raw
        .replace(/\bgruye re\b/g, "gruyere")
        .replace(/\bgruy re\b/g, "gruyere")
        .replace(/\bcre me\b/g, "creme")
        .replace(/\bcr me\b/g, "creme")
        .replace(/\bpa tissie re\b/g, "patissiere")
        .replace(/\bp tissi re\b/g, "patissiere")
        .replace(/\bjalapen os\b/g, "jalapenos")
        .replace(/\bjalape os\b/g, "jalapenos")
        .replace(/\bnu o c\b/g, "nuoc")
        .replace(/\bn c\b/g, "nuoc")
        .replace(/\bma m\b/g, "mam")
        .replace(/\bthi t\b/g, "thit")
        .replace(/\bla u\b/g, "lau")
        .replace(/\bcha o\b/g, "chao")
        .replace(/\bch o\b/g, "chao")
        .replace(/\bpa te\b/g, "pate")
        .replace(/\bba nh mi\b/g, "banh mi")
        .replace(/\bb nh\b/g, "banh")
        .replace(/\bo p la\b/g, "op la")
        .replace(/\bm p la\b/g, "mi op la")
        .replace(/\bmi p la\b/g, "mi op la")
        .replace(/\bt u\b/g, "tau")
        .replace(/\bth i\b/g, "thai")
        .replace(/\bqua y\b/g, "quay")
        .replace(/\bqu y\b/g, "quay")
        .replace(/\bche ba ma u\b/g, "che ba mau")
        .replace(/\bch ba m u\b/g, "che ba mau")
        .replace(/\bch m\b/g, "cham")
        .replace(/\bm u\b/g, "mau")
        .replace(/\bta u\b/g, "tau")
        .replace(/\btha i\b/g, "thai")
        .replace(/foundation of th t kho t u/g, "thit kho tau")
        .replace(/foundation of thi t kho ta u/g, "thit kho tau")
        .replace(/foundation of l u th i/g, "lau thai")
        .replace(/foundation of la u tha i/g, "lau thai")
        .replace(/\bcha lu a\b/g, "cha lua")
        .replace(/\s+/g, " ")
        .trim();

    const addVariant = (v: string) => {
        const trimmed = v.trim();
        if (!trimmed) return;
        // If skipStopwordOnly is true, don't emit a variant that is strictly a stopword
        // unless the original input itself was exactly that stopword (e.g. they explicitly requested "oil").
        if (skipStopwordOnly && MATCH_STOPWORDS.has(trimmed) && trimmed !== raw) {
            return;
        }
        out.add(trimmed);
    };

    addVariant(raw);
    if (corrected !== raw) addVariant(corrected);

    const noParens = raw.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    addVariant(noParens);

    if (raw.startsWith("foundation of ")) addVariant(raw.replace(/^foundation of\s+/, ""));
    if (raw.startsWith("warm ")) addVariant(raw.replace(/^warm\s+/, ""));
    if (raw.startsWith("caramel sauce ")) addVariant(raw.replace(/^caramel sauce\s+/, ""));
    if (corrected.startsWith("foundation of ")) addVariant(corrected.replace(/^foundation of\s+/, ""));
    if (corrected.startsWith("warm ")) addVariant(corrected.replace(/^warm\s+/, ""));
    if (corrected.startsWith("caramel sauce ")) addVariant(corrected.replace(/^caramel sauce\s+/, ""));

    const splitOr = corrected.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
    if (splitOr.length > 1) {
        for (const part of splitOr) addVariant(part);
    }

    const tokens = raw.split(" ").map((t) => t.trim()).filter(Boolean);

    const droppedStops = tokens.filter((t) => !MATCH_STOPWORDS.has(t));
    if (droppedStops.length > 0) addVariant(droppedStops.join(" "));

    const singularTokens = droppedStops.map((t) => singularize(t));
    if (singularTokens.length > 0) addVariant(singularTokens.join(" "));

    return new Set([...out].filter(Boolean));
}

export function canonicalizeCoverageName(input: string): string {
    let name = input.toLowerCase().replace(/\s+/g, " ").trim();
    const replacements: Array<[RegExp, string]> = [
        [/\bgruy re\b/g, "gruyere"],
        [/\bgruye re\b/g, "gruyere"],
        [/\bcr me p tissi re\b/g, "creme patissiere"],
        [/\bcre me pa tissie re\b/g, "creme patissiere"],
        [/\bjalape o\b/g, "jalapeno"],
        [/\bjalape os\b/g, "jalapenos"],
        [/\bjalapen o\b/g, "jalapeno"],
        [/\bjalapen os\b/g, "jalapenos"],
        [/\bb nh\b/g, "banh"],
        [/\bm p\b/g, "mi p"],
        [/\bch o\b/g, "chao"],
        [/\bth t\b/g, "thit"],
        [/\bl u\b/g, "lau"],
        [/\bpa te\b/g, "pate"],
        [/\bnu o c\b/g, "nuoc"],
        [/\bn c\b/g, "nuoc"],
        [/\bma m\b/g, "mam"],
        [/\bch m\b/g, "cham"],
        [/\bm u\b/g, "mau"],
        [/\bqu y\b/g, "quay"],
        [/\bqua y\b/g, "quay"],
        [/\bcaf au lait\b/g, "cafe au lait"],
        [/\bcha lu a\b/g, "cha lua"],
        [/\bba nh mi o p la\b/g, "banh mi op la"],
        [/\bthi t kho ta u\b/g, "thit kho tau"],
        [/\bla u tha i\b/g, "lau thai"],
        [/\bche ba ma u\b/g, "che ba mau"],
    ];
    for (const [re, next] of replacements) {
        name = name.replace(re, next);
    }

    name = name
        .replace(/^foundation of\s+/, "")
        .replace(/^warm\s+/, "")
        .replace(/^caramel sauce\s+/, "")
        .replace(/\s+/g, " ")
        .trim();

    const splitOr = name.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
    if (splitOr.length > 1) {
        name = splitOr[0];
    }

    name = name.replace(/\s+/g, " ").trim();
    return name;
}

export function toSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/__+/g, "_");
}

export function inferCategory(name: string): "culinary_herb" | "spice" | "vegetable" | "fruit" | "protein" | "grain" | "dairy" | "oil" | "vinegar" | "seasoning" | "misc" {
    const n = name.toLowerCase();
    if (/(oil|ghee|butter)/.test(n)) return "oil";
    if (/(vinegar)/.test(n)) return "vinegar";
    if (/(tofu|beans|bean|lentil|pea|egg|chicken|beef|pork|fish|shrimp|sausage|seafood)/.test(n)) return "protein";
    if (/(rice|flour|bread|noodle|tortilla|yeast|cornstarch|starch|grain|oats|spaghetti)/.test(n)) return "grain";
    if (/(milk|cream|cheese|yogurt|labneh|quark|ricotta)/.test(n)) return "dairy";
    if (/(basil|mint|cilantro|parsley|oregano|thyme|dill|herb|leaf|leaves)/.test(n)) return "culinary_herb";
    if (/(pepper|chili|chile|masala|clove|cumin|cardamom|spice|harissa|curry|paprika)/.test(n)) return "spice";
    if (/(tomato|onion|garlic|radish|pepper|cabbage|potato|carrot|bamboo|corn|kale)/.test(n)) return "vegetable";
    if (/(lime|lemon|orange|berry|raisin|fruit)/.test(n)) return "fruit";
    return "misc";
}
