#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function optimizeESLintConfig() {
  console.log('🚀 ESLint Performance Optimization');
  console.log('===================================');

  // Create .eslintignore for build artifacts if it doesn't exist
  const eslintIgnoreContent = `
# Build artifacts
.next/
dist/
build/
out/
node_modules/

# Cache directories
.eslint-cache
.eslint-ts-cache/
.eslint-tsbuildinfo
.jest-cache/
.nx/cache/
.turbo/

# Performance optimization cache files
.eslint-performance-cache/
.eslint-incremental-cache/
.eslint-timing.json
.eslint-metrics.json

# TypeScript build info
*.tsbuildinfo
tsconfig.tsbuildinfo

# Backup and temporary files
.transformation-backups/
.lint-backup-*/
*.backup
*.tmp

# Lock files
yarn.lock
package-lock.json

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Logs
*.log
logs/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`.trim();

  if (!fs.existsSync('.eslintignore')) {
    fs.writeFileSync('.eslintignore', eslintIgnoreContent);
    console.log('✅ Created comprehensive .eslintignore file');
  } else {
    console.log('ℹ️  .eslintignore already exists');
  }

  // Create performance monitoring script
  const performanceScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function measureESLintPerformance() {
  console.log('📊 Measuring ESLint Performance...');

  const startTime = Date.now();

  try {
    // Run ESLint with timing
    const output = execSync('yarn lint --max-warnings=10000 --cache --cache-location=.eslint-cache', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(\`✅ ESLint completed in \${duration.toFixed(2)} seconds\`);

    // Save performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      duration: duration,
      target: 30, // seconds
      achieved: duration < 30,
      cacheUsed: true
    };

    fs.writeFileSync('.eslint-metrics.json', JSON.stringify(metrics, null, 2));

    if (duration < 30) {
      console.log('🎯 Performance target achieved (< 30 seconds)');
    } else {
      console.log(\`⚠️  Performance target missed by \${(duration - 30).toFixed(2)} seconds\`);
    }

    return duration;

  } catch (error) {
    console.error('❌ ESLint failed:', error.message);
    return -1;
  }
}

measureESLintPerformance();
`;

  fs.writeFileSync('scripts/measure-eslint-performance.cjs', performanceScript);
  fs.chmodSync('scripts/measure-eslint-performance.cjs', '755');
  console.log('✅ Created ESLint performance measurement script');

  // Create cache cleanup script
  const cacheCleanupScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function cleanupESLintCaches() {
  console.log('🧹 Cleaning ESLint Caches...');

  const cacheDirs = [
    '.eslint-cache',
    '.eslint-ts-cache',
    '.eslint-performance-cache',
    '.eslint-incremental-cache'
  ];

  const cacheFiles = [
    '.eslint-tsbuildinfo',
    '.eslint-timing.json',
    '.eslint-metrics.json',
    'tsconfig.tsbuildinfo'
  ];

  let cleaned = 0;

  // Clean cache directories
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(\`✅ Removed cache directory: \${dir}\`);
      cleaned++;
    }
  });

  // Clean cache files
  cacheFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(\`✅ Removed cache file: \${file}\`);
      cleaned++;
    }
  });

  if (cleaned === 0) {
    console.log('ℹ️  No cache files found to clean');
  } else {
    console.log(\`🎯 Cleaned \${cleaned} cache items\`);
  }
}

cleanupESLintCaches();
`;

  fs.writeFileSync('scripts/cleanup-eslint-cache.cjs', cacheCleanupScript);
  fs.chmodSync('scripts/cleanup-eslint-cache.cjs', '755');
  console.log('✅ Created ESLint cache cleanup script');

  return true;
}

function testPerformance() {
  console.log('\n📊 Testing ESLint Performance...');

  try {
    // Clean caches first for accurate measurement
    execSync('node scripts/cleanup-eslint-cache.cjs', { stdio: 'inherit' });

    // Measure performance
    const result = execSync('node scripts/measure-eslint-performance.cjs', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    console.log(result);

    // Check if metrics file was created
    if (fs.existsSync('.eslint-metrics.json')) {
      const metrics = JSON.parse(fs.readFileSync('.eslint-metrics.json', 'utf8'));
      return metrics.achieved;
    }

    return false;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

function main() {
  // Optimize configuration
  const optimized = optimizeESLintConfig();

  if (!optimized) {
    console.error('❌ Failed to optimize ESLint configuration');
    return;
  }

  // Test performance
  const performanceAchieved = testPerformance();

  console.log('\n📊 Optimization Summary:');
  console.log('========================');
  console.log('✅ Created comprehensive .eslintignore');
  console.log('✅ Created performance measurement script');
  console.log('✅ Created cache cleanup script');

  if (performanceAchieved) {
    console.log('🎯 Performance target achieved (< 30 seconds)');
  } else {
    console.log('⚠️  Performance target not yet achieved');
  }

  console.log('\n📌 Next Steps:');
  console.log('1. Run "node scripts/measure-eslint-performance.cjs" to test performance');
  console.log('2. Run "node scripts/cleanup-eslint-cache.cjs" to clean caches when needed');
  console.log('3. Monitor performance with regular measurements');
  console.log('4. Adjust configuration if performance degrades');
}

main();
