#!/usr/bin/env node

/**
 * Extract unused function parameters from lint output
 */

const { execSync } = require('child_process');
const fs = require('fs');

function extractUnusedParameters() {
  try {
    // Get full lint output
    const output = execSync('yarn lint --max-warnings=10000 2>&1', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const lines = output.split('\n');
    const parameterFiles = {};

    for (const line of lines) {
      // Look for lines with "args must match"
      if (line.includes('args must match')) {
        // Extract file path and parameter name
        const match = line.match(/^(.+?):\d+:\d+\s+error\s+'([^']+)'/);
        if (match) {
          const [, filePath, paramName] = match;
          if (!parameterFiles[filePath]) {
            parameterFiles[filePath] = [];
          }
          parameterFiles[filePath].push(paramName);
        }
      }
    }

    console.log('Files with unused function parameters:');
    console.log('=====================================');

    let totalParams = 0;
    for (const [filePath, params] of Object.entries(parameterFiles)) {
      console.log(`\n${filePath}:`);
      params.forEach(param => {
        console.log(`  - ${param}`);
        totalParams++;
      });
    }

    console.log(`\nTotal unused function parameters: ${totalParams}`);
    console.log(`Files affected: ${Object.keys(parameterFiles).length}`);

    // Save to file for processing
    fs.writeFileSync('unused-function-parameters.json', JSON.stringify(parameterFiles, null, 2));
    console.log('\nSaved to unused-function-parameters.json');

    return parameterFiles;

  } catch (error) {
    console.error('Error extracting parameters:', error.message);
    return {};
  }
}

if (require.main === module) {
  extractUnusedParameters();
}

module.exports = extractUnusedParameters;
