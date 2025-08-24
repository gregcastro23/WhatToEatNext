#!/usr/bin/env node

/**
 * Fix unknown type assertions in test files
 * Targets common patterns like msg filtering and error handling
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files in linting directory
const testFiles = glob.sync('src/__tests__/linting/**/*.test.ts', {
  cwd: '/Users/GregCastro/Desktop/WhatToEatNext',
  absolute: true
});

let totalFixed = 0;

testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;

  // Fix pattern 1: msg filtering with inline casting
  const msgPattern1 = /\(msg: unknown\) => \(msg as unknown\)\.(\w+)/g;
  if (msgPattern1.test(content)) {
    content = content.replace(msgPattern1, (match, prop) => {
      fixCount++;
      return `(msg: unknown) => {\n              const message = msg as { ${prop}: any; [key: string]: any };\n              return message.${prop}`;
    });
  }

  // Fix pattern 2: msg filtering with property access
  const msgPattern2 = /\(msg: unknown\) => msg\.(\w+)/g;
  if (msgPattern2.test(content)) {
    content = content.replace(msgPattern2, (match, prop) => {
      fixCount++;
      return `(msg: unknown) => {\n              const message = msg as { ${prop}: any; [key: string]: any };\n              return message.${prop}`;
    });
  }

  // Fix pattern 3: error handling in catch blocks
  const errorPattern = /catch \(error: unknown\) \{\s*if \(error\./g;
  if (errorPattern.test(content)) {
    content = content.replace(errorPattern, (match) => {
      fixCount++;
      return `catch (error: unknown) {\n        const err = error as { [key: string]: any };\n        if (err.`;
    });
  }

  // Fix pattern 4: error property access after catch
  const errorAccessPattern = /catch \(error: unknown\) \{([^}]*?)error\.(\w+)/g;
  if (errorAccessPattern.test(content)) {
    content = content.replace(errorAccessPattern, (match, before, prop) => {
      if (!before.includes('const err =')) {
        fixCount++;
        return `catch (error: unknown) {${before}const err = error as any;\n        err.${prop}`;
      }
      return match;
    });
  }

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixCount} issues in ${path.basename(filePath)}`);
    totalFixed += fixCount;
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);