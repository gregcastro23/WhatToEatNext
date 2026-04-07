const fs = require('fs');

const logContent = fs.readFileSync(0, 'utf-8'); // read from stdin
const lines = logContent.split('\n');

const thresholds = {
  '/': 150,
  '/menu-planner': 400,
  '/recipe-builder': 150,
  '/recipe-generator': 150,
  '/recipes/[recipeId]': 150
};

let failed = false;

for (const [route, maxKb] of Object.entries(thresholds)) {
  // Find line containing the route, exactly ending with a space before the size column
  const line = lines.find(l => l.includes(` ${route} `));
  if (line) {
    const tokens = line.trim().split(/\s+/);
    const unit = tokens.pop();
    const sizeStr = tokens.pop();
    let sizeKb = parseFloat(sizeStr);
    if (unit === 'MB') sizeKb *= 1024;
    
    if (sizeKb > maxKb) {
      console.error(`❌ Route ${route} exceeded threshold! Size: ${sizeKb} ${unit} (Max: ${maxKb} kB)`);
      failed = true;
    } else {
      console.log(`✅ Route ${route} is within threshold: ${sizeKb} ${unit} (Max: ${maxKb} kB)`);
    }
  } else {
    console.warn(`⚠️ Route ${route} not found in build log.`);
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('✅ All targeted routes passed bundle size checks.');
}
