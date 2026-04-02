const fs = require('fs');

const content = fs.readFileSync('src/data/ingredients/ingredientSummaries.ts', 'utf8');

const prefix = `/**
 * Scientific and culinary summaries for ingredients to display on cards.
 * These provide accessible, scientific blurbs about what the ingredient is,
 * how it works, and how to select/store it.
 */
export const ingredientSummaries: Record<string, string> = {`;

const suffixMatch = content.match(/\};\s*\/\*\*[\s\S]*$/);
const suffix = suffixMatch ? suffixMatch[0] : `};\n\nexport function getIngredientSummary(ingredientName: string): string | null {\n  const key = ingredientName.toLowerCase().replace(/\\s+/g, '_');\n  return ingredientSummaries[key] || null;\n}`;

// Extract the object body
const bodyStart = content.indexOf('{') + 1;
const bodyEnd = content.lastIndexOf('};');
const bodyStr = content.substring(bodyStart, bodyEnd);

// Use a regex to match `"key": `value`,`
const regex = /^\s*"([^"]+)":\s*`([\s\S]*?)`,?/gm;
const map = new Map();

let match;
while ((match = regex.exec(bodyStr)) !== null) {
  map.set(match[1], match[2]);
}

let newBody = '';
for (const [key, value] of map.entries()) {
  newBody += `\n  "${key}": \`${value}\`,`;
}

const newContent = prefix + newBody + '\n' + suffix;
fs.writeFileSync('src/data/ingredients/ingredientSummaries.ts', newContent);
console.log('Deduplication complete. Unique keys:', map.size);
