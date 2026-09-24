const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Standard thresholds for budgeted routes.
 * Defensible-values standard: every threshold documents its measured basis on master (20346bc9).
 * - maxRouteKb: route-specific chunk size reported by Next build table.
 * - maxFirstLoadKb: page-entry-only gzip size reported by Next build table.
 * - maxTotalFirstLoadKb: true first-load gzip size (page + all ancestor layouts deduplicated @ gzip -9).
 */
const DEFAULT_THRESHOLDS = {
  '/': {
    maxRouteKb: 50,
    maxFirstLoadKb: 220,
    maxTotalFirstLoadKb: 740,
    // Basis: Measured on master @ 20346bc9: route 27.7 kB, Next FL 199.0 kB (199,816 B = 195.1 KiB),
    // true first-load with layouts 726,019 B = 709.0 KiB. Budget 740 KiB gives ~31 KiB (+4.4%) headroom.
  },
  '/menu-planner': {
    maxRouteKb: 60,
    maxFirstLoadKb: 320,
    maxTotalFirstLoadKb: 775,
    // Basis: Measured on master @ 20346bc9: route 43.8 kB, Next FL 289.0 kB (290,804 B = 284.0 KiB),
    // true first-load with layouts 756,770 B = 739.0 KiB. Budget 775 KiB gives ~36 KiB (+4.9%) headroom.
  },
  '/recipe-builder': {
    maxRouteKb: 50,
    maxFirstLoadKb: 200,
    maxTotalFirstLoadKb: 710,
    // Basis: Measured on master @ 20346bc9: route 5.5 kB, Next FL 184.0 kB (184,873 B = 180.5 KiB),
    // true first-load with layouts 695,031 B = 678.7 KiB. Budget 710 KiB gives ~31.3 KiB (+4.6%) headroom.
  },
  '/recipe-generator': {
    maxRouteKb: 50,
    maxFirstLoadKb: 220,
    maxTotalFirstLoadKb: 745,
    // Basis: Measured on master @ 20346bc9: route 10.8 kB, Next FL 203.0 kB (204,427 B = 199.6 KiB),
    // true first-load with layouts 730,630 B = 713.5 KiB. Budget 745 KiB gives ~31.5 KiB (+4.4%) headroom.
  },
  '/recipes/[recipeId]': {
    maxRouteKb: 80,
    maxFirstLoadKb: 350,
    maxTotalFirstLoadKb: 860,
    // Basis: Measured on master @ 20346bc9: route 52.0 kB, Next FL 332.0 kB (332,889 B = 325.1 KiB),
    // true first-load with layouts 843,542 B = 823.8 KiB. Budget 860 KiB gives ~36.2 KiB (+4.4%) headroom.
  },
  '/shop': {
    maxRouteKb: 15,
    maxFirstLoadKb: 120,
    maxTotalFirstLoadKb: 715,
    // Basis: Measured on master @ 20346bc9: route 2.5 kB, Next FL 109.0 kB (109,312 B = 106.8 KiB),
    // true first-load with layouts 700,780 B = 684.4 KiB. Budget 715 KiB gives ~30.6 KiB (+4.5%) headroom.
  },
  '/account': {
    maxRouteKb: 15,
    maxFirstLoadKb: 125,
    maxTotalFirstLoadKb: 715,
    // Basis: Measured on master @ 20346bc9: route 2.5 kB, Next FL 109.0 kB (109,337 B = 106.8 KiB),
    // true first-load with layouts 700,805 B = 684.4 KiB. Budget 715 KiB gives ~30.6 KiB (+4.5%) headroom.
  },
  '/ingredients/[slug]': {
    maxRouteKb: 20,
    maxFirstLoadKb: 175,
    maxTotalFirstLoadKb: 735,
    // Basis: Measured on master @ 20346bc9: route 4.4 kB, Next FL 155.0 kB (155,203 B = 151.6 KiB),
    // true first-load with layouts 721,247 B = 704.3 KiB. Budget 735 KiB gives ~30.7 KiB (+4.4%) headroom.
  },
};

/**
 * Returns the layout keys that apply to a given page key, in order from root to leaf.
 * E.g. "/(alchm)/page" -> ["/layout", "/(alchm)/layout"]
 * E.g. "/recipes/[recipeId]/page" -> ["/layout", "/recipes/layout", "/recipes/[recipeId]/layout"]
 *
 * @param {string} pageKey
 * @returns {string[]}
 */
function getLayoutKeysForPage(pageKey) {
  if (!pageKey || typeof pageKey !== 'string') return ['/layout'];
  const layouts = ['/layout'];
  const parts = pageKey.split('/').filter(Boolean);
  if (parts.length > 0 && parts[parts.length - 1] === 'page') {
    parts.pop();
  }
  let current = '';
  for (const part of parts) {
    current += '/' + part;
    layouts.push(current + '/layout');
  }
  return layouts;
}

/**
 * Derives the public route path from an internal App Router page key.
 * Strips route group segments (e.g. `(alchm)`).
 * E.g. "/(alchm)/page" -> "/"
 * E.g. "/(alchm)/account/page" -> "/account"
 * E.g. "/recipes/[recipeId]/page" -> "/recipes/[recipeId]"
 *
 * @param {string} pageKey
 * @returns {string | null}
 */
function pageKeyToRoute(pageKey) {
  if (!pageKey || typeof pageKey !== 'string') return null;
  if (!pageKey.endsWith('/page') && pageKey !== '/page') return null;
  const parts = pageKey.split('/').filter(Boolean);
  if (parts.length > 0 && parts[parts.length - 1] === 'page') {
    parts.pop();
  }
  const publicParts = parts.filter(p => !(p.startsWith('(') && p.endsWith(')')));
  return '/' + publicParts.join('/');
}

/**
 * Resolves a public route to its internal page key in app-build-manifest.
 *
 * @param {string} route
 * @param {Record<string, string[]>} manifestPages
 * @param {Record<string, string>} [appPathRoutes]
 * @returns {string | null}
 */
function routeToPageKey(route, manifestPages, appPathRoutes) {
  if (appPathRoutes) {
    for (const [pk, r] of Object.entries(appPathRoutes)) {
      if (r === route && pk.endsWith('/page')) {
        return pk;
      }
    }
  }
  if (!manifestPages) return null;
  // Fallback: derive public route for every manifest page key
  for (const pk of Object.keys(manifestPages)) {
    if (pageKeyToRoute(pk) === route) {
      return pk;
    }
  }
  return null;
}

/**
 * Computes true route sizes by reading app-build-manifest.json and gzipping (level 9)
 * the union of .js files from the page entry and all ancestor layouts.
 *
 * @param {object} options
 * @param {object} options.appBuildManifest - parsed app-build-manifest.json
 * @param {object} [options.appPathRoutesManifest] - parsed app-path-routes-manifest.json
 * @param {string[]} [options.routes] - routes to measure (defaults to Object.keys(thresholds))
 * @param {Record<string, any>} [options.thresholds]
 * @param {string} [options.nextDir] - path to .next directory
 * @param {function(string): number} [options.getFileGzipSize] - custom sizing function (relPath -> bytes)
 * @returns {Array<object>}
 */
function calculateTrueRouteSizes(options = {}) {
  const appBuildManifest = options.appBuildManifest;
  if (!appBuildManifest || !appBuildManifest.pages) {
    throw new Error('Invalid or missing appBuildManifest (must have .pages property)');
  }
  const manifestPages = appBuildManifest.pages;
  const appPathRoutesManifest = options.appPathRoutesManifest || null;
  const thresholds = options.thresholds || DEFAULT_THRESHOLDS;
  const routes = options.routes || Object.keys(thresholds);
  const nextDir = options.nextDir || path.join(process.cwd(), '.next');

  // Gzip cache so deduplicated files are only compressed once
  const gzCache = new Map();
  const getGzSize = options.getFileGzipSize || ((relPath) => {
    if (gzCache.has(relPath)) return gzCache.get(relPath);
    const fullPath = path.join(nextDir, relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Bundle chunk file not found on disk: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath);
    const gzipped = zlib.gzipSync(content, { level: 9 });
    gzCache.set(relPath, gzipped.length);
    return gzipped.length;
  });

  const results = [];

  for (const route of routes) {
    const pageKey = routeToPageKey(route, manifestPages, appPathRoutesManifest);
    if (!pageKey || !manifestPages[pageKey]) {
      results.push({
        route,
        found: false,
        error: `Page key for route '${route}' not found in app-build-manifest`,
      });
      continue;
    }

    const candidateLayoutKeys = getLayoutKeysForPage(pageKey);
    const matchedLayoutKeys = candidateLayoutKeys.filter(k => Array.isArray(manifestPages[k]));

    // Page-only files (.js only)
    const pageJsFiles = new Set((manifestPages[pageKey] || []).filter(f => f.endsWith('.js')));
    let pageOnlyBytes = 0;
    for (const file of pageJsFiles) {
      pageOnlyBytes += getGzSize(file);
    }

    // Union of page + all ancestor layout files (.js only)
    const unionFiles = new Set(pageJsFiles);
    for (const lk of matchedLayoutKeys) {
      for (const file of manifestPages[lk] || []) {
        if (file.endsWith('.js')) {
          unionFiles.add(file);
        }
      }
    }

    let totalBytes = 0;
    for (const file of unionFiles) {
      totalBytes += getGzSize(file);
    }

    results.push({
      route,
      found: true,
      pageKey,
      matchedLayoutKeys,
      pageFileCount: pageJsFiles.size,
      unionFileCount: unionFiles.size,
      pageOnlyBytes,
      pageOnlyKb: pageOnlyBytes / 1024,
      totalBytes,
      totalKb: totalBytes / 1024,
    });
  }

  return results;
}

/**
 * Parses Next 15 build log text to extract route size and First Load JS.
 *
 * @param {string} logContent
 * @returns {Map<string, { routeKb: number, firstLoadKb: number }>}
 */
function parseBuildLog(logContent) {
  const map = new Map();
  if (!logContent || typeof logContent !== 'string') return map;
  const lines = logContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.endsWith('kB') && !trimmed.endsWith('MB') && !trimmed.endsWith('B')) continue;
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 5) continue;

    const flUnit = tokens.pop();
    const flSizeStr = tokens.pop();
    const rUnit = tokens.pop();
    const rSizeStr = tokens.pop();
    const routeToken = tokens.pop();

    if (!routeToken || !routeToken.startsWith('/')) continue;

    let routeKb = parseFloat(rSizeStr);
    if (rUnit === 'MB') routeKb *= 1024;
    else if (rUnit === 'B') routeKb /= 1024;

    let firstLoadKb = parseFloat(flSizeStr);
    if (flUnit === 'MB') firstLoadKb *= 1024;
    else if (flUnit === 'B') firstLoadKb /= 1024;

    if (!isNaN(routeKb) && !isNaN(firstLoadKb)) {
      map.set(routeToken, { routeKb, firstLoadKb });
    }
  }
  return map;
}

/**
 * Evaluates route sizes against thresholds for both Next's build table
 * and true layout-inclusive first-load calculations.
 *
 * @param {object} options
 * @param {string} [options.logContent]
 * @param {object} options.appBuildManifest
 * @param {object} [options.appPathRoutesManifest]
 * @param {string} [options.nextDir]
 * @param {function(string): number} [options.getFileGzipSize]
 * @param {Record<string, any>} [options.thresholds]
 * @returns {{ ok: boolean, errors: string[], successes: string[] }}
 */
function evaluateRouteSizes(options = {}) {
  const thresholds = options.thresholds || DEFAULT_THRESHOLDS;
  const errors = [];
  const successes = [];

  // 1. Build log checks (if logContent provided)
  const logMap = options.logContent ? parseBuildLog(options.logContent) : null;

  // 2. True layout union calculation
  let manifestResults = [];
  if (options.appBuildManifest) {
    manifestResults = calculateTrueRouteSizes({
      appBuildManifest: options.appBuildManifest,
      appPathRoutesManifest: options.appPathRoutesManifest,
      thresholds,
      nextDir: options.nextDir,
      getFileGzipSize: options.getFileGzipSize,
    });
  }

  const manifestMap = new Map(manifestResults.map(r => [r.route, r]));

  for (const [route, limits] of Object.entries(thresholds)) {
    let routeOk = true;

    // Check build log (page-only & route size)
    const logData = logMap ? logMap.get(route) : null;
    if (logMap && !logData) {
      errors.push(`Route ${route} not found in build log.`);
      routeOk = false;
    } else if (logData) {
      if (limits.maxRouteKb != null && logData.routeKb > limits.maxRouteKb) {
        errors.push(`Route ${route} exceeded route size threshold! Size: ${logData.routeKb.toFixed(1)} kB (Max: ${limits.maxRouteKb} kB)`);
        routeOk = false;
      }
      if (limits.maxFirstLoadKb != null && logData.firstLoadKb > limits.maxFirstLoadKb) {
        errors.push(`Route ${route} exceeded First Load JS threshold! First Load: ${logData.firstLoadKb.toFixed(1)} kB (Max: ${limits.maxFirstLoadKb} kB)`);
        routeOk = false;
      }
    }

    // Check true layout first-load
    const manifestData = manifestMap.get(route);
    if (!manifestData) {
      errors.push(`Route ${route} not evaluated in app-build-manifest.`);
      routeOk = false;
    } else if (!manifestData.found) {
      errors.push(`Route ${route} error in app-build-manifest: ${manifestData.error}`);
      routeOk = false;
    } else if (limits.maxTotalFirstLoadKb != null && manifestData.totalKb > limits.maxTotalFirstLoadKb) {
      errors.push(
        `Route ${route} exceeded true total first-load threshold! ` +
        `Size: ${manifestData.totalKb.toFixed(1)} kB (${manifestData.totalBytes.toLocaleString()} B) ` +
        `(Max: ${limits.maxTotalFirstLoadKb} kB)`
      );
      routeOk = false;
    }

    if (routeOk && manifestData && manifestData.found) {
      const logPart = logData
        ? `${logData.routeKb.toFixed(1)} kB route / ${logData.firstLoadKb.toFixed(1)} kB page-only (Max: ${limits.maxRouteKb} kB / ${limits.maxFirstLoadKb} kB) | `
        : `${manifestData.pageOnlyKb.toFixed(1)} kB page-only | `;
      const truePart = `${manifestData.totalKb.toFixed(1)} kB true first-load with layouts [${manifestData.totalBytes.toLocaleString()} B] (Max: ${limits.maxTotalFirstLoadKb} kB)`;
      successes.push(`Route ${route} is within threshold: ${logPart}${truePart}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    successes,
  };
}

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
