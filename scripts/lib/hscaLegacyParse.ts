/**
 * The HSCA importer's ingredient parser as it stood on 2026-10-04 (after #937's whole-word unit
 * fix), frozen. It is NOT used to build anything: it is the witness for repairing rows in
 * Postgres. A live ingredient line is replaced only when it is exactly what this function made of
 * its source line, so a line someone edited by hand, or one written by something else, is left
 * alone. The importer's own parser is `parseIngredientString` in hscaDish.ts, which has since
 * been corrected; do not edit this copy.
 */

export function legacyParseIngredientString(ingStr: string) {
  ingStr = ingStr.trim();
  let amount = 1;
  let unit = "piece";
  let name = "";
  let notes = "";

  // Strip leading words like "approximately", "about", "around"
  let cleanStr = ingStr.replace(/^(approximately|about|around)\s+/i, "");

  // Match mixed numbers like "1 1/2" or "2 3/4"
  const mixedMatch = cleanStr.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  // Match fractions like "1/2" or "3/4"
  const fracMatch = cleanStr.match(/^(\d+)\/(\d+)\s*(.*)$/);
  // Match decimals like "1.5" or "0.25"
  const decMatch = cleanStr.match(/^(\d+\.\d+)\s*(.*)$/);
  // Match simple integers like "6"
  const intMatch = cleanStr.match(/^(\d+)\s*(.*)$/);
  // Match textual numbers
  const textNumMatch = cleanStr.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s*(.*)$/i);

  let remaining = cleanStr;

  if (mixedMatch && mixedMatch[1] && mixedMatch[2] && mixedMatch[3]) {
    amount = parseInt(mixedMatch[1], 10) + parseInt(mixedMatch[2], 10) / parseInt(mixedMatch[3], 10);
    remaining = mixedMatch[4] ?? "";
  } else if (fracMatch && fracMatch[1] && fracMatch[2]) {
    amount = parseInt(fracMatch[1], 10) / parseInt(fracMatch[2], 10);
    remaining = fracMatch[3] ?? "";
  } else if (decMatch && decMatch[1]) {
    amount = parseFloat(decMatch[1]);
    remaining = decMatch[2] ?? "";
  } else if (intMatch && intMatch[1]) {
    amount = parseInt(intMatch[1], 10);
    remaining = intMatch[2] ?? "";
  } else if (textNumMatch && textNumMatch[1]) {
    const word = textNumMatch[1].toLowerCase();
    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    amount = wordMap[word] || 1;
    remaining = textNumMatch[2] ?? "";
  }

  // Unit patterns
  const units = [
    "cups?", "teaspoons?", "tsps?", "tablespoons?", "tbsps?", "ounces?", "ozs?", "pounds?", "lbs?", "grams?", "g",
    "cloves?", "cans?", "pinches?", "sprigs?", "stalks?", "pieces?", "slices?", "fillets?", "heads?", "bunches?",
    "pints?", "quarts?", "gallons?", "bottles?", "jars?", "packages?", "bags?", "handfuls?", "cans?"
  ];

  // A unit must be a whole word: without the lookahead "4 Granny Smith apples"
  // read as 4 g of "ranny smith apples", and "Canola oil" as a can of "ola oil".
  const unitRegex = new RegExp(`^(${units.join("|")})(?![a-z])\\s*(.*)$`, "i");
  const unitMatch = remaining.match(unitRegex);

  if (unitMatch && unitMatch[1]) {
    unit = unitMatch[1].toLowerCase();
    remaining = unitMatch[2] ?? "";
  }

  // Split on first comma for notes
  const commaIdx = remaining.indexOf(",");
  if (commaIdx !== -1) {
    notes = remaining.substring(commaIdx + 1).trim();
    name = remaining.substring(0, commaIdx).trim();
  } else {
    name = remaining.trim();
  }

  // Extract parentheses in name to notes
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const parenContent = parenMatch[1];
    notes = notes ? `${parenContent}; ${notes}` : parenContent;
    name = name.replace(/\([^)]+\)/g, "").trim();
  }

  // Final sanitization of ingredient name
  name = name.toLowerCase().replace(/\s+/g, " ").trim();

  // Try to clean common adjectives for better matching
  let cleanName = name
    .replace(/^(organic|fresh|large|medium|small|dry|dried|powdered|raw|extra-virgin|sifted)\s+/gi, "")
    .trim();

  return { amount, unit, name: cleanName, rawName: name, notes };
}
