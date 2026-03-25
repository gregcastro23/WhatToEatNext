import fs from 'fs';
import path from 'path';

// Need a way to extract ingredient summaries since it's a TS file
// We'll write a quick regex parser for it
const summariesContent = fs.readFileSync('src/data/ingredients/ingredientSummaries.ts', 'utf8');
const summaryMatches = summariesContent.matchAll(/([a-zA-Z0-9_]+):\s*`([^`]+)`/g);
const summaries = {};
for (const m of summaryMatches) {
  summaries[m[1]] = m[2];
}

const missing = JSON.parse(fs.readFileSync('missing_ingredients.json', 'utf8'));

// Group missing by file
const byFile = {};
for (const item of missing) {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
}

let modifiedFiles = 0;
let updatedCount = 0;

for (const [file, items] of Object.entries(byFile)) {
  let content = fs.readFileSync(file, 'utf8');
  // Process items in reverse order of blockStart so we don't mess up offsets
  items.sort((a, b) => b.blockStart - a.blockStart);
  
  let modified = false;
  for (const item of items) {
    let desc = summaries[item.key] || summaries[item.key.replace(/\s+/g, '_')];
    if (!desc) {
        // Create a generic fallback
        const cleanName = item.name.trim();
        desc = `${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} is a versatile ingredient used in various culinary applications.`;
    }
    
    // Clean up desc to be a single line string to avoid TS parsing issues with template literals if not needed, 
    // or just use template literals. Let's use template literals since descriptions can be long or have newlines.
    
    const blockStart = item.blockStart;
    
    // We want to insert `description: \`...\`,` right after the `name: "..."` line.
    // The block is from blockStart to blockEnd.
    // Let's find the `name:` property inside the block.
    
    // We can just use a regex on the content starting at blockStart
    const innerBlock = content.substring(blockStart, item.blockEnd + 1);
    
    // Check if it already has description
    if (innerBlock.includes('description:')) {
        // If it's an empty description, replace it
        if (innerBlock.match(/description:\s*["']["']/)) {
            const newInner = innerBlock.replace(/description:\s*["']["']/, `description: \`${desc.replace(/`/g, '\\`')}\``);
            content = content.substring(0, blockStart) + newInner + content.substring(item.blockEnd + 1);
            modified = true;
            updatedCount++;
        }
    } else {
        // Insert after name:
        const nameMatch = innerBlock.match(/name:\s*["'][^"']+["'],?/);
        if (nameMatch) {
            const insertIdx = nameMatch.index + nameMatch[0].length;
            const newInner = innerBlock.substring(0, insertIdx) + `\n    description: \`${desc.replace(/`/g, '\\`')}\`, ` + innerBlock.substring(insertIdx);
            content = content.substring(0, blockStart) + newInner + content.substring(item.blockEnd + 1);
            modified = true;
            updatedCount++;
        }
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
  }
}

console.log(`Updated ${updatedCount} ingredients in ${modifiedFiles} files.`);
