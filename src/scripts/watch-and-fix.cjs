#!/usr/bin/env node

/**
 * File Watcher for Automatic Linting
 * Watches for file saves and automatically applies linting fixes
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const AutoLintFixer = require('./auto-lint-fixer.cjs');

class WatchAndFix {
  constructor() {
    this.fixer = new AutoLintFixer();
    this.processing = new Set();
    this.log = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, ...args) => console.log(`[WATCH-FIX] ${msg}`, ...args),
      warn: (msg, ...args) => console.warn(`[WATCH-FIX WARN] ${msg}`, ...args),
      error: (msg, ...args) => console.error(`[WATCH-FIX ERROR] ${msg}`, ...args),
      success: (msg, ...args) => console.log(`[WATCH-FIX SUCCESS] ${msg}`, ...args),
    };
  }

  shouldProcessFile(filePath) {
    // Only process TypeScript and JavaScript files
    const ext = path.extname(filePath);
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

    if (!validExtensions.includes(ext)) {
      return false;
    }

    // Skip node_modules and build directories
    const skipDirs = ['node_modules', '.next', 'dist', 'build', '.git', '.lint-backups'];
    if (skipDirs.some(dir => filePath.includes(dir))) {
      return false;
    }

    // Skip if already processing
    if (this.processing.has(filePath)) {
      return false;
    }

    return true;
  }

  async handleFileChange(filePath) {
    if (!this.shouldProcessFile(filePath)) {
      return;
    }

    this.processing.add(filePath);

    try {
      this.log.info(`File changed: ${filePath}`);

      // Small delay to ensure file write is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await this.fixer.fixFile(filePath);

      if (result.success) {
        this.log.success(`Auto-fixed: ${path.basename(filePath)}`);
      } else {
        this.log.warn(
          `Fix failed for ${path.basename(filePath)}: ${result.reason || result.error}`,
        );
      }
    } catch (error) {
      this.log.error(`Error processing ${filePath}:`, error.message);
    } finally {
      this.processing.delete(filePath);
    }
  }

  start(watchPath = 'src') {
    this.log.info(`Starting file watcher on: ${watchPath}`);

    const watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on('change', filePath => this.handleFileChange(filePath))
      .on('error', error => this.log.error('Watcher error:', error))
      .on('ready', () => this.log.info('File watcher ready'));

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log.info('Shutting down file watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

// CLI interface
if (require.main === module) {
  const watchPath = process.argv[2] || 'src';
  const watcher = new WatchAndFix();
  watcher.start(watchPath);
}

module.exports = WatchAndFix;
