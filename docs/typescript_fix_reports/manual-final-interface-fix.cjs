#!/usr/bin/env node

/**
 * Manual Final Interface Fix
 */

const fs = require('fs');

const filesToFix = [
  'src/calculations/alchemicalEngine.ts',
  'src/calculations/core/alchemicalEngine.ts'
];

for (const filePath of filesToFix) {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the specific interface syntax errors
    content = content.replace(/timeOfDay: string,,/g, 'timeOfDay: string,');
    content = content.replace(/sunSign: any,/g, 'sunSign: any,');
    content = content.replace(/degreesInSign: number,/g, 'degreesInSign: number');
    content = content.replace(/moonPhase: LunarPhaseWithSpaces,/g, 'moonPhase: LunarPhaseWithSpaces,');

    // Remove any double commas
    content = content.replace(/,,/g, ',');

    // Fix trailing commas in interfaces
    content = content.replace(/,(\s*\n\s*})/g, '$1');

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
}

// Test build
const { execSync } = require('child_process');
try {
  console.log('\nTesting build...');
  execSync('yarn build', { stdio: 'pipe', timeout: 60000 });
  console.log('🎉 Build successful!');
} catch (error) {
  console.log('❌ Build still has issues');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  console.log('First 30 lines of error:');
  console.log(errorOutput.split('\n').slice(0, 30).join('\n'));
}
