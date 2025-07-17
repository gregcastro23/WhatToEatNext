#!/usr/bin/env node

/**
 * Build Status Checker for WhatToEatNext
 * Checks build health and cache status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

function checkFileExists(filePath) {
  return fs.existsSync(path.join(projectRoot, filePath));
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(path.join(projectRoot, filePath));
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkDirectorySize(dirPath) {
  try {
    if (!fs.existsSync(path.join(projectRoot, dirPath))) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(path.join(projectRoot, dirPath));
    
    for (const file of files) {
      const filePath = path.join(projectRoot, dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch {
    return 0;
  }
}

console.log('🔍 WhatToEatNext Build Status Check');
console.log('=====================================\n');

// Check essential files
console.log('📁 Essential Files:');
console.log(`  package.json: ${checkFileExists('package.json') ? '✅' : '❌'}`);
console.log(`  next.config.js: ${checkFileExists('next.config.js') ? '✅' : '❌'}`);
console.log(`  tsconfig.json: ${checkFileExists('tsconfig.json') ? '✅' : '❌'}`);
console.log(`  .env.local: ${checkFileExists('.env.local') ? '✅' : '❌'}`);

// Check cache directories
console.log('\n📦 Cache Status:');
const nextCacheSize = checkDirectorySize('.next');
console.log(`  .next/: ${nextCacheSize > 0 ? '📁' : '❌'} ${formatBytes(nextCacheSize)}`);

const nodeModulesCacheSize = checkDirectorySize('node_modules/.cache');
console.log(`  node_modules/.cache/: ${nodeModulesCacheSize > 0 ? '📁' : '❌'} ${formatBytes(nodeModulesCacheSize)}`);

const tsBuildInfoSize = getFileSize('.tsbuildinfo');
console.log(`  .tsbuildinfo: ${tsBuildInfoSize > 0 ? '📄' : '❌'} ${formatBytes(tsBuildInfoSize)}`);

const eslintCacheSize = getFileSize('.eslintcache');
console.log(`  .eslintcache: ${eslintCacheSize > 0 ? '📄' : '❌'} ${formatBytes(eslintCacheSize)}`);

// Check build artifacts
console.log('\n🏗️ Build Artifacts:');
console.log(`  .next/static/: ${checkFileExists('.next/static') ? '✅' : '❌'}`);
console.log(`  .next/server/: ${checkFileExists('.next/server') ? '✅' : '❌'}`);
console.log(`  .next/trace: ${checkFileExists('.next/trace') ? '✅' : '❌'}`);

// Check dependencies
console.log('\n📚 Dependencies:');
console.log(`  node_modules/: ${checkFileExists('node_modules') ? '✅' : '❌'}`);
console.log(`  yarn.lock: ${checkFileExists('yarn.lock') ? '✅' : '❌'}`);

// Recommendations
console.log('\n💡 Recommendations:');

if (nextCacheSize > 500 * 1024 * 1024) { // 500MB
  console.log('  ⚠️  Next.js cache is large (>500MB). Consider clearing with: yarn cache:clear');
}

if (nodeModulesCacheSize > 200 * 1024 * 1024) { // 200MB
  console.log('  ⚠️  Node modules cache is large (>200MB). Consider clearing with: rm -rf node_modules/.cache');
}

if (tsBuildInfoSize > 50 * 1024 * 1024) { // 50MB
  console.log('  ⚠️  TypeScript cache is large (>50MB). Consider clearing with: rm -rf .tsbuildinfo');
}

if (!checkFileExists('.next')) {
  console.log('  🔄 No build cache found. Run: yarn build');
}

if (!checkFileExists('node_modules')) {
  console.log('  📦 No dependencies found. Run: yarn install');
}

console.log('\n🚀 Quick Actions:');
console.log('  yarn cache:clear    - Clear all caches');
console.log('  yarn build:clean    - Clean build with cache clearing');
console.log('  yarn install:clean  - Clean install with cache clearing');

console.log('\n✅ Build status check complete!'); 