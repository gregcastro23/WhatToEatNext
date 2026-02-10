#!/usr/bin/env node
// parse-errors-only.cjs - Get files with actual parsing errors only

const { execSync } = require('child_process');

try {
  // Run lint and get JSON output
  const output = execSync('yarn lint --format json 2>&1', {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Parse JSON output
  let results = [];
  try {
    results = JSON.parse(output);
  } catch (e) {
    // If not valid JSON, try to extract JSON from output
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      results = JSON.parse(jsonMatch[0]);
    }
  }

  // Collect files with parsing errors
  const filesWithParseErrors = new Map();

  results.forEach(file => {
    if (file.messages && file.messages.length > 0) {
      const parseErrors = file.messages.filter(msg =>
        msg.message && msg.message.includes('Parsing error')
      );

      if (parseErrors.length > 0) {
        filesWithParseErrors.set(file.filePath, {
          count: parseErrors.length,
          errors: parseErrors.map(e => ({
            line: e.line,
            column: e.column,
            message: e.message
          }))
        });
      }
    }
  });

  // Sort by error count (ascending)
  const sorted = Array.from(filesWithParseErrors.entries())
    .sort((a, b) => a[1].count - b[1].count);

  // Output results
  console.log(`\n=== FILES WITH PARSING ERRORS ===`);
  console.log(`Total files: ${sorted.length}`);
  console.log(`Total errors: ${sorted.reduce((sum, [, data]) => sum + data.count, 0)}\n`);

  // Show files with 1-5 errors (easy targets)
  const easyFiles = sorted.filter(([, data]) => data.count >= 1 && data.count <= 5);
  console.log(`=== EASY TARGETS (1-5 errors): ${easyFiles.length} files ===`);
  easyFiles.forEach(([path, data]) => {
    const relPath = path.replace('/Users/GregCastro/Desktop/WhatToEatNext/', '');
    console.log(`${data.count}: ${relPath}`);
    data.errors.slice(0, 3).forEach(err => {
      console.log(`  - Line ${err.line}:${err.column} - ${err.message}`);
    });
  });

  console.log(`\n=== MEDIUM (6-15 errors): ${sorted.filter(([, d]) => d.count >= 6 && d.count <= 15).length} files ===`);
  sorted.filter(([, d]) => d.count >= 6 && d.count <= 15).forEach(([path, data]) => {
    const relPath = path.replace('/Users/GregCastro/Desktop/WhatToEatNext/', '');
    console.log(`${data.count}: ${relPath}`);
  });

  console.log(`\n=== HARD (16+ errors): ${sorted.filter(([, d]) => d.count >= 16).length} files ===`);
  sorted.filter(([, d]) => d.count >= 16).forEach(([path, data]) => {
    const relPath = path.replace('/Users/GregCastro/Desktop/WhatToEatNext/', '');
    console.log(`${data.count}: ${relPath}`);
  });

} catch (error) {
  console.error('Error running lint:', error.message);
  process.exit(1);
}
