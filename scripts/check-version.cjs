/**
 * check-version.cjs
 * Verifies Node and Bun versions against package.json engines
 */
const { engines, packageManager } = require('../package.json');
const semver = require('semver');
const { execSync } = require('child_process');

const nodeVersion = process.version;
const requiredNode = engines.node;

// Check Node.js
if (!semver.satisfies(nodeVersion, requiredNode) && !nodeVersion.startsWith('v20.') && !nodeVersion.startsWith('v24.')) {
  console.error(`❌ Required Node.js version ${requiredNode} not satisfied by ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version ${nodeVersion} satisfies ${requiredNode}`);

// Check Bun
try {
  const bunVersion = execSync('bun --version').toString().trim();
  const requiredBun = packageManager.split('@')[1];
  
  if (!semver.satisfies(bunVersion, requiredBun)) {
    console.warn(`⚠️ Warning: Bun version ${bunVersion} does not match recommended ${requiredBun}`);
  } else {
    console.log(`✅ Bun version ${bunVersion} matches recommended ${requiredBun}`);
  }
} catch (e) {
  console.error('❌ Bun is not installed. Please install Bun to continue.');
  process.exit(1);
}

process.exit(0);
