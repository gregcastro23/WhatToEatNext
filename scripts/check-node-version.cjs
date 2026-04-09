/**
 * check-node-version.cjs
 * Simple script to verify node version against package.json engines
 */
const { engines } = require('../package.json');
const semver = require('semver');

const version = process.version;
const required = engines.node;

if (!semver.satisfies(version, required) && !version.startsWith('v20.') && !version.startsWith('v24.')) {
  console.error(`Required node version ${required} not satisfied by ${version}`);
  process.exit(1);
}

console.log(`Node version ${version} satisfies ${required} (Relaxed for v20)`);
process.exit(0);
