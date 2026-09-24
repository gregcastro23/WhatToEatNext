const fs = require('fs');
const path = require('path');
const {
  DEFAULT_THRESHOLDS,
  getLayoutKeysForPage,
  pageKeyToRoute,
  routeToPageKey,
  calculateTrueRouteSizes,
  parseBuildLog,
  evaluateRouteSizes,
} = require('./lib/routeSizes.cjs');

function runCli() {
  let logContent = '';
  if (process.argv[2] && fs.existsSync(process.argv[2])) {
    logContent = fs.readFileSync(process.argv[2], 'utf-8');
  } else if (fs.existsSync('.next-build.log')) {
    logContent = fs.readFileSync('.next-build.log', 'utf-8');
  } else {
    try {
      logContent = fs.readFileSync(0, 'utf-8'); // read from stdin
    } catch {
      logContent = '';
    }
  }

  const nextDir = process.env.NEXT_DIR || path.join(process.cwd(), '.next');
  const manifestPath = path.join(nextDir, 'app-build-manifest.json');
  const pathRoutesPath = path.join(nextDir, 'app-path-routes-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ .next/app-build-manifest.json not found at ${manifestPath}!`);
    console.error('   Run `next build` before running route size checks.');
    process.exit(1);
  }

  let appBuildManifest = null;
  try {
    appBuildManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to parse ${manifestPath}: ${err.message}`);
    process.exit(1);
  }

  let appPathRoutesManifest = null;
  if (fs.existsSync(pathRoutesPath)) {
    try {
      appPathRoutesManifest = JSON.parse(fs.readFileSync(pathRoutesPath, 'utf-8'));
    } catch {
      appPathRoutesManifest = null;
    }
  }

  const result = evaluateRouteSizes({
    logContent,
    appBuildManifest,
    appPathRoutesManifest,
    nextDir,
    thresholds: DEFAULT_THRESHOLDS,
  });

  for (const success of result.successes) {
    console.log(`✅ ${success}`);
  }

  for (const error of result.errors) {
    console.error(`❌ ${error}`);
  }

  if (!result.ok) {
    process.exit(1);
  } else {
    console.log('✅ All targeted routes passed bundle size checks (both Next table and true layout first-load).');
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  thresholds: DEFAULT_THRESHOLDS,
  DEFAULT_THRESHOLDS,
  getLayoutKeysForPage,
  pageKeyToRoute,
  routeToPageKey,
  calculateTrueRouteSizes,
  parseBuildLog,
  evaluateRouteSizes,
  runCli,
};
