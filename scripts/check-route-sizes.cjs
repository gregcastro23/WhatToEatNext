const fs = require('fs');

let logContent = '';
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  logContent = fs.readFileSync(process.argv[2], 'utf-8');
} else {
  try {
    logContent = fs.readFileSync(0, 'utf-8'); // read from stdin
  } catch {
    logContent = '';
  }
}

const lines = logContent.split('\n');

const thresholds = {
  '/': { maxRouteKb: 150, maxFirstLoadKb: 250 },
  '/menu-planner': { maxRouteKb: 400, maxFirstLoadKb: 950 },
  '/recipe-builder': { maxRouteKb: 150, maxFirstLoadKb: 250 },
  '/recipe-generator': { maxRouteKb: 150, maxFirstLoadKb: 250 },
  '/recipes/[recipeId]': { maxRouteKb: 150, maxFirstLoadKb: 400 },
};

let failed = false;
let foundAny = false;

for (const [route, limits] of Object.entries(thresholds)) {
  const escapedRoute = route.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`(?:\\s|^)${escapedRoute}(?:\\s|$)`);
  const line = lines.find(l => regex.test(l));
  if (line) {
    foundAny = true;
    const tokens = line.trim().split(/\s+/);
    // Format: [prefix..., route, routeSize, routeUnit, firstLoadSize, firstLoadUnit]
    const flUnit = tokens.pop();
    const flSizeStr = tokens.pop();
    const rUnit = tokens.pop();
    const rSizeStr = tokens.pop();

    let routeKb = parseFloat(rSizeStr);
    if (rUnit === 'MB') routeKb *= 1024;
    else if (rUnit === 'B') routeKb /= 1024;

    let firstLoadKb = parseFloat(flSizeStr);
    if (flUnit === 'MB') firstLoadKb *= 1024;
    else if (flUnit === 'B') firstLoadKb /= 1024;

    if (isNaN(routeKb) || isNaN(firstLoadKb)) {
      console.warn(`⚠️ Route ${route} found but could not parse sizes from line: ${line.trim()}`);
      continue;
    }

    if (routeKb > limits.maxRouteKb) {
      console.error(`❌ Route ${route} exceeded route size threshold! Size: ${routeKb.toFixed(1)} kB (Max: ${limits.maxRouteKb} kB)`);
      failed = true;
    } else if (firstLoadKb > limits.maxFirstLoadKb) {
      console.error(`❌ Route ${route} exceeded First Load JS threshold! First Load: ${firstLoadKb.toFixed(1)} kB (Max: ${limits.maxFirstLoadKb} kB)`);
      failed = true;
    } else {
      console.log(`✅ Route ${route} is within threshold: ${routeKb.toFixed(1)} kB route / ${firstLoadKb.toFixed(1)} kB first-load (Max: ${limits.maxRouteKb} kB / ${limits.maxFirstLoadKb} kB)`);
    }
  } else {
    console.warn(`⚠️ Route ${route} not found in build log.`);
  }
}

if (!foundAny && logContent.trim().length > 0) {
  console.warn('⚠️ No targeted routes were matched in the provided build output.');
}

if (failed) {
  process.exit(1);
} else {
  console.log('✅ All targeted routes passed bundle size checks.');
}

