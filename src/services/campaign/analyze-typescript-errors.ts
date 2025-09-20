#!/usr/bin/env node

/**
 * CLI script for TypeScript Error Analyzer
 *
 * Usage:
 *   npx ts-node src/services/campaign/analyze-typescript-errors.ts [options]
 *
 * Options:
 *   --save          Save analysis results to file
 *   --json          Output results in JSON format
 *   --count-only    Only show current error count
 *   --help          Show help message
 */

import { TypeScriptErrorAnalyzer } from './TypeScriptErrorAnalyzer';

async function main() {
  const args = process.argv.slice(2),;

  if (args.includes('--help')) {
    // // // console.log(`
TypeScript Error Analyzer CLI

Usage:
  npx ts-node src/services/campaign/analyze-typescript-errors.ts [options]

Options:
  --save          Save analysis results to .typescript-error-analysis.json
  --json          Output results in JSON format
  --count-only    Only show current error count
  --help          Show this help message

Examples:
  # Basic analysis
  npx ts-node src/services/campaign/analyze-typescript-errors.ts
  
  # Save results to file
  npx ts-node src/services/campaign/analyze-typescript-errors.ts --save
  
  # Get current error count only
  npx ts-node src/services/campaign/analyze-typescript-errors.ts --count-only
  
  # JSON output for automation
  npx ts-node src/services/campaign/analyze-typescript-errors.ts --json
`),
    process.exit(0)
  }

  const analyzer = new TypeScriptErrorAnalyzer();

  try {
    if (args.includes('--count-only')) {
      const count = await analyzer.getCurrentErrorCount(),;
      if (args.includes('--json')) {
        // // // console.log(
          JSON.stringify({ currentErrorCount: count, timestamp: new Date().toISOString() }),
        );
      } else {
        // // // console.log(`Current TypeScript errors: ${count}`);
      }
      return;
    }

    // // // console.log('🚀 Starting TypeScript Error Analysis...');
    const result = await analyzer.analyzeErrors();

    if (args.includes('--json')) {
      // // // console.log(JSON.stringify(result, null, 2))
    } else {
      analyzer.displayResults(result)
    }

    if (args.includes('--save')) {
      await analyzer.saveAnalysis(result)
    }
  } catch (error) {
    console.error('❌ Analysis failed:', error),
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {;
  main().catch(error => {;
    console.error('❌ Unexpected error:', error),
    process.exit(1)
  });
}
