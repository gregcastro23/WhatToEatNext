/**
 * Script to check if the current Node.js version meets the requirements
 * specified in the package.json engines field.
 */
const fs = require('fs');
const path = require('path');
const semver = require('semver');

// Read the .nvmrc file for the required Node.js version
let requiredVersion;
try {
  requiredVersion = fs.readFileSync(path.join(__dirname, '..', '.nvmrc'), 'utf8').trim();
} catch (err) {
  console.error('Error reading .nvmrc file:', err.message);
  process.exit(1);
}

// Current Node.js version
const currentVersion = process.version;

// Check if the current version satisfies the required version
if (!semver.satisfies(currentVersion, `>=${requiredVersion}`)) {
  console.error('\x1b[31m%s\x1b[0m', '╔════════════════════════════════════════════════════════════╗');
  console.error('\x1b[31m%s\x1b[0m', '║                       NODE.JS VERSION ERROR                ║');
  console.error('\x1b[31m%s\x1b[0m', '╠════════════════════════════════════════════════════════════╣');
  console.error('\x1b[31m%s\x1b[0m', `║ Required Node.js version: ${requiredVersion} or higher                 ║`);
  console.error('\x1b[31m%s\x1b[0m', `║ Current Node.js version: ${currentVersion}                           ║`);
  console.error('\x1b[31m%s\x1b[0m', '║                                                            ║');
  console.error('\x1b[31m%s\x1b[0m', '║ Please update your Node.js version using one of these:     ║');
  console.error('\x1b[31m%s\x1b[0m', '║ - If using nvm: nvm install 20.18.0                        ║');
  console.error('\x1b[31m%s\x1b[0m', '║ - If using Homebrew: brew upgrade node                     ║');
  console.error('\x1b[31m%s\x1b[0m', '║ - Download installer from https://nodejs.org               ║');
  console.error('\x1b[31m%s\x1b[0m', '╚════════════════════════════════════════════════════════════╝');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', `✓ Using Node.js ${currentVersion} (required: ${requiredVersion})`);
} 