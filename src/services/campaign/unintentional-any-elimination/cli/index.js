#!/usr/bin/env node

/**
 * Unintentional Any Elimination CLI Suite
 *
 * Main entry point for all CLI tools
 */

const path = require('path');
const { execSync } = require('child_process');

// CLI tool paths
const CLI_TOOLS = {
  main: path.join(__dirname, 'unintentional-any-cli.cjs'),
  batch: path.join(__dirname, 'batch-processor.cjs'),
  monitor: path.join(__dirname, 'progress-monitor.cjs'),
  debug: path.join(__dirname, 'debug-tools.cjs')
};

// Help text
function showHelp() {
  console.log(`
Unintentional Any Elimination CLI Suite

USAGE:
  node cli/index.js <tool> <command> [options]

TOOLS:
  main      Main CLI interface with comprehensive commands
  batch     Specialized batch processing with safety controls
  monitor   Real-time progress monitoring and alerting
  debug     Debugging and diagnostic utilities

QUICK COMMANDS:
  analyze   Run comprehensive analysis (main analyze)
  classify  Classify any types (main classify)
  process   Run batch processing (batch process)
  watch     Start monitoring (monitor start)
  diagnose  Run system diagnostics (debug system)

EXAMPLES:
  # Run comprehensive analysis
  node cli/index.js analyze --files="src/**/*.ts"

  # Start batch processing with maximum safety
  node cli/index.js process --max-files=10 --safety=MAXIMUM

  # Start real-time monitoring
  node cli/index.js watch --interval=30

  # Run system diagnostics
  node cli/index.js diagnose

  # Use specific tool directly
  node cli/index.js main analyze --output=report.json
  node cli/index.js batch process --dry-run
  node cli/index.js monitor start --threshold=50
  node cli/index.js debug component --name=AnyTypeClassifier

TOOL-SPECIFIC HELP:
  node cli/index.js main help
  node cli/index.js batch
  node cli/index.js monitor
  node cli/index.js debug
  `);
}

// Execute CLI tool
function executeTool(toolName, args) {
  const toolPath = CLI_TOOLS[toolName];

  if (!toolPath) {
    console.error(`Unknown tool: ${toolName}`);
    console.error('Available tools: main, batch, monitor, debug');
    process.exit(1);
  }

  try {
    const command = `node "${toolPath}" ${args.join(' ')}`;
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Tool execution failed: ${error.message}`);
    process.exit(error.status || 1);
  }
}

// Main command dispatcher
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];
  const remainingArgs = args.slice(1);

  // Handle quick commands
  switch (command) {
    case 'analyze':
      executeTool('main', ['analyze', ...remainingArgs]);
      break;
    case 'classify':
      executeTool('main', ['classify', ...remainingArgs]);
      break;
    case 'process':
      executeTool('batch', ['process', ...remainingArgs]);
      break;
    case 'watch':
      executeTool('monitor', ['start', ...remainingArgs]);
      break;
    case 'diagnose':
      executeTool('debug', ['system', ...remainingArgs]);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      // Handle tool-specific commands
      if (CLI_TOOLS[command]) {
        executeTool(command, remainingArgs);
      } else {
        console.error(`Unknown command: ${command}`);
        console.error('Run "node cli/index.js help" for usage information');
        process.exit(1);
      }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  CLI_TOOLS,
  executeTool
};
