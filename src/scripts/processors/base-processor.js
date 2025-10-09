#!/usr/bin/env node

/**
 * BaseProcessor - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * Base class for all error processors with validation and safety checks
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class BaseProcessor {
  constructor(errorCode, errorName) {
    this.projectRoot = process.cwd();
    this.errorCode = errorCode;
    this.errorName = errorName;
  }

  /**
   * Get error count for specific error code
   */
  async getErrorCount(errorCode = this.errorCode) {
    try {
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      const count = (tscOutput.match(new RegExp(`error ${errorCode}:`, 'g')) || []).length;
      return count;
    } catch (error) {
      console.error(`Error getting error count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get total error count across all types
   */
  async getTotalErrorCount() {
    try {
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      const count = (tscOutput.match(/error TS\d+:/g) || []).length;
      return count;
    } catch (error) {
      console.error(`Error getting total error count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Validate that changes improved or maintained error count
   */
  async validateChanges(beforeCount, beforeTotal) {
    const afterCount = await this.getErrorCount();
    const afterTotal = await this.getTotalErrorCount();

    const targetReduction = beforeCount - afterCount;
    const totalChange = afterTotal - beforeTotal;

    const validation = {
      success: true,
      errors: [],
      beforeCount,
      afterCount,
      beforeTotal,
      afterTotal,
      targetReduction,
      totalChange
    };

    // Check 1: Did we reduce the target errors?
    if (afterCount >= beforeCount) {
      validation.success = false;
      validation.errors.push(`Target errors did not decrease (${beforeCount} → ${afterCount})`);
    }

    // Check 2: Did total errors increase significantly?
    if (totalChange > targetReduction * 0.5) {
      validation.success = false;
      validation.errors.push(`Total errors increased too much (+${totalChange} vs -${targetReduction} target)`);
    }

    // Check 3: Net improvement check
    const netImprovement = targetReduction - totalChange;
    if (netImprovement <= 0) {
      validation.success = false;
      validation.errors.push(`No net improvement (${netImprovement})`);
    }

    validation.netImprovement = netImprovement;

    return validation;
  }

  /**
   * Check brace/bracket/paren balance in content
   */
  checkBalance(content) {
    const chars = content.split('');
    const stack = [];
    const pairs = { '{': '}', '[': ']', '(': ')' };
    const closing = new Set(['}', ']', ')']);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      if (pairs[char]) {
        stack.push({ char, pos: i });
      } else if (closing.has(char)) {
        if (stack.length === 0) {
          return { balanced: false, issue: `Unmatched ${char} at position ${i}` };
        }
        const last = stack.pop();
        if (pairs[last.char] !== char) {
          return { balanced: false, issue: `Mismatched ${last.char} at ${last.pos} with ${char} at ${i}` };
        }
      }
    }

    if (stack.length > 0) {
      const unclosed = stack.map(s => `${s.char} at ${s.pos}`).join(', ');
      return { balanced: false, issue: `Unclosed: ${unclosed}` };
    }

    return { balanced: true };
  }

  /**
   * Safe file modification with balance checking
   */
  safeFileModify(filePath, modifier) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalBalance = this.checkBalance(originalContent);

    if (!originalBalance.balanced) {
      return {
        success: false,
        error: `File already has balance issues: ${originalBalance.issue}`,
        fixedCount: 0
      };
    }

    const { content: modifiedContent, fixedCount } = modifier(originalContent);

    if (modifiedContent === originalContent) {
      return { success: true, fixedCount: 0 };
    }

    const modifiedBalance = this.checkBalance(modifiedContent);

    if (!modifiedBalance.balanced) {
      return {
        success: false,
        error: `Modifications broke balance: ${modifiedBalance.issue}`,
        fixedCount: 0
      };
    }

    return {
      success: true,
      content: modifiedContent,
      fixedCount
    };
  }

  /**
   * Get errors for this processor's error code
   */
  async getErrors() {
    try {
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      const errors = [];
      const lines = tscOutput.split('\n');

      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match && match[4] === this.errorCode) {
          errors.push({
            filePath: path.resolve(this.projectRoot, match[1]),
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[5]
          });
        }
      }

      return errors;
    } catch (error) {
      console.error(`Error getting ${this.errorCode} errors:`, error.message);
      return [];
    }
  }

  /**
   * Group errors by file
   */
  groupByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.filePath]) {
        grouped[error.filePath] = [];
      }
      grouped[error.filePath].push(error);
    }
    return grouped;
  }

  /**
   * Get files with errors (for atomic executor)
   */
  async getFilesWithErrors() {
    const errors = await this.getErrors();
    return [...new Set(errors.map(e => e.filePath))];
  }
}

export default BaseProcessor;
