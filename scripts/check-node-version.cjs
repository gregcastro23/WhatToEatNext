#!/usr/bin/env node

// Node.js version compatibility check for WhatToEatNext
const currentVersion = process.version;
const majorVersion = parseInt(currentVersion.slice(1).split('.')[0], 10);

console.log(`🔍 Checking Node.js version compatibility...`);
console.log(`   Current: ${currentVersion}`);
console.log(`   Required: >=18.0.0`);

if (majorVersion < 18) {
  console.error(`❌ Node.js version ${currentVersion} is not compatible.`);
  console.error(`   Please upgrade to Node.js 18.0.0 or higher.`);
  console.error(`   Recommended: Use Node.js 20+ for optimal performance.`);
  process.exit(1);
}

console.log(`✅ Node.js version ${currentVersion} is compatible!`);
console.log(`🚀 Starting WhatToEatNext development server...`);