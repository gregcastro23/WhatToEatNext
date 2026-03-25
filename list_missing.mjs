import fs from 'fs';
import path from 'path';

const dir = 'src/data/ingredients';
const files = fs.readdirSync(dir, { recursive: true })
  .map(f => path.join(dir, f))
  .filter(f => f.endsWith('.ts'));

let missingCount = 0;
let totalCount = 0;
let missingItems = [];

const ignoredFiles = [
  'index.ts', 'types.ts', 'ingredients.ts', 'ingredientSummaries.ts',
  'flavorProfiles.ts', 'elementalProperties.ts', 'consolidated_vinegars.ts'
];

files.forEach(file => {
  if (ignoredFiles.some(ignored => file.endsWith(ignored))) return;
  const content = fs.readFileSync(file, 'utf8');
  
  // A regex to find the start of an ingredient object definition: e.g. "blueberry: {"
  // followed by an inner block containing 'name: "Blueberry"'
  // This is a simplistic approach but should be effective for the given file structure.
  
  // We match top-level keys in objects like `const rawBerries = { key: { name: "..." }, ... }`
  const matches = content.matchAll(/(\w+):\s*\{([^}]*?)name:\s*"([^"]+)"/g);
  for (const match of matches) {
    const key = match[1];
    const name = match[3];
    
    // We found an ingredient name definition. Let's trace its object block to see if it has a description.
    const blockStart = match.index + match[1].length + 1; // index of '{' roughly
    let braceCount = 0;
    let blockEnd = blockStart;
    let started = false;
    
    // search for the opening brace of the ingredient object
    let actualStart = -1;
    for(let i = blockStart; i < content.length; i++) {
        if(content[i] === '{') {
            actualStart = i;
            break;
        }
    }
    
    if(actualStart !== -1) {
        for (let i = actualStart; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                started = true;
            } else if (content[i] === '}') {
                braceCount--;
            }
            if (started && braceCount === 0) {
                blockEnd = i;
                break;
            }
        }
    }
    
    if (actualStart !== -1) {
        totalCount++;
        const block = content.substring(actualStart, blockEnd + 1);
        
        let isMissing = false;
        if (!block.includes('description:')) {
            isMissing = true;
        } else if (block.match(/description:\s*""/)) {
            isMissing = true;
        }
        
        if (isMissing) {
            missingCount++;
            missingItems.push({file, key, name, blockStart: actualStart, blockEnd});
        }
    }
  }
});

console.log(`Missing descriptions: ${missingCount}/${totalCount}`);
fs.writeFileSync('missing_ingredients.json', JSON.stringify(missingItems, null, 2));
