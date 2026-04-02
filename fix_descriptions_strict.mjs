import fs from 'fs';
import path from 'path';

const summariesContent = fs.readFileSync('src/data/ingredients/ingredientSummaries.ts', 'utf8');
const summaryMatches = summariesContent.matchAll(/([a-zA-Z0-9_]+):\s*`([^`]+)`/g);
const summaries = {};
for (const m of summaryMatches) {
  summaries[m[1]] = m[2];
}

const missing = JSON.parse(fs.readFileSync('missing_ingredients.json', 'utf8'));

const byFile = {};
for (const item of missing) {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item);
}

let modifiedFiles = 0;
let updatedCount = 0;
let stillMissingCount = 0;

for (const [file, items] of Object.entries(byFile)) {
  let content = fs.readFileSync(file, 'utf8');
  items.sort((a, b) => b.blockStart - a.blockStart);
  
  let modified = false;
  for (const item of items) {
    let desc = summaries[item.key] || summaries[item.key.toLowerCase().replace(/\s+/g, '_')];
    if (!desc) {
        stillMissingCount++;
        continue;
    }
    
    const blockStart = item.blockStart;
    const innerBlock = content.substring(blockStart, item.blockEnd + 1);
    
    if (innerBlock.includes('description:')) {
        if (innerBlock.match(/description:\s*["']["']/)) {
            const newInner = innerBlock.replace(/description:\s*["']["']/, `description: \`${desc.replace(/`/g, '\\`')}\``);
            content = content.substring(0, blockStart) + newInner + content.substring(item.blockEnd + 1);
            modified = true;
            updatedCount++;
        }
    } else {
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

console.log(`Successfully added descriptions to ${updatedCount} ingredients using existing summaries.`);
console.log(`${stillMissingCount} ingredients are still missing descriptions.`);
