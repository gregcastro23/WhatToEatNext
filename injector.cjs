const fs = require('fs');
const path = require('path');

function injectRecipes(cuisineName, category, newRecipes) {
  const filePath = path.join(__dirname, `src/data/cuisines/${cuisineName}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Find where to inject: e.g. `dinner: {\n      all: [`
  const targetStr = `${category}: {\n      all: [`;
  const idx = content.indexOf(targetStr);
  if (idx === -1) {
    console.error(`Target string not found in ${cuisineName}.ts for ${category}`);
    return;
  }

  const insertPos = idx + targetStr.length;
  
  // Format the objects back to TS strings
  let toInsert = '';
  for (const r of newRecipes) {
    toInsert += '\n        ' + JSON.stringify(r, null, 2).replace(/\n/g, '\n        ') + ',';
  }

  const newContent = content.slice(0, insertPos) + toInsert + content.slice(insertPos);
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully injected ${newRecipes.length} recipes into ${cuisineName}.ts (${category})`);
}

module.exports = { injectRecipes };
