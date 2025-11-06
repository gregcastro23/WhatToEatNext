/**
 * ESLint Plugin - Phase 4 Processor Patterns
 * WhatToEatNext - October 9, 2025
 *
 * Detects error patterns at development time using Phase 4 processor patterns
 * Provides immediate feedback to prevent errors from being committed
 */

const fs = require("fs");
const path = require("path");

/**
 * Create an ESLint rule from processor patterns
 */
function createProcessorRule(processorName, patterns) {
  return {
    meta: {
      type: "problem",
      docs: {
        description: `Detect ${processorName} error patterns`,
        category: "Phase 4 Quality",
        recommended: true,
      },
      fixable: "code",
      schema: [],
      messages: {
        patternDetected: "{{message}}",
      },
    },
    create(context) {
      return {
        Program(node) {
          const sourceCode = context.getSourceCode();
          const text = sourceCode.getText();

          patterns.forEach((pattern) => {
            // Reset regex lastIndex for global patterns
            if (pattern.regex.global) {
              pattern.regex.lastIndex = 0;
            }

            let match;
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

            while ((match = regex.exec(text)) !== null) {
              try {
                const loc = sourceCode.getLocFromIndex(match.index);

                const report = {
                  loc,
                  messageId: "patternDetected",
                  data: {
                    message: pattern.message,
                  },
                };

                // Add fixer if pattern provides one
                if (pattern.fix) {
                  report.fix = function (fixer) {
                    try {
                      const fixed = pattern.fix(match);
                      if (fixed && fixed !== match[0]) {
                        return fixer.replaceTextRange(
                          [match.index, match.index + match[0].length],
                          fixed,
                        );
                      }
                    } catch (error) {
                      // Fixer failed, report without fix
                      return null;
                    }
                  };
                }

                context.report(report);
              } catch (error) {
                // Skip this match if location calculation fails
                continue;
              }
            }
          });
        },
      };
    },
  };
}

// Export ESLint rules based on Phase 4 processor patterns
module.exports = {
  rules: {
    // TS1005 - Semicolon or comma expected
    "semicolon-expected": createProcessorRule("TS1005", [
      {
        regex: /^(\s*)(const|let|var)\s+\w+\s*=\s*[^;{}\n]*$/gm,
        message: "Missing semicolon after variable declaration",
        fix: (match) => match[0] + ";",
      },
      {
        regex: /^(\s*)(return|break|continue)\s+[^;\n]+$/gm,
        message: "Missing semicolon after statement",
        fix: (match) => match[0] + ";",
      },
    ]),

    // TS1003 - Identifier expected
    "identifier-expected": createProcessorRule("TS1003", [
      {
        regex: /\.\s*$/gm,
        message: "Incomplete property access - identifier expected after dot",
      },
      {
        regex: /\[\s*$/gm,
        message: "Incomplete array access - identifier expected in brackets",
      },
    ]),

    // TS1128 - Declaration or statement expected
    "declaration-expected": createProcessorRule("TS1128", [
      {
        regex: /^(\s*)}[^;,}\n]*$/gm,
        message: "Orphaned closing brace - check for removed code blocks",
      },
      {
        regex: /^(\s*)}\s*,\s*$/gm,
        message:
          "Orphaned closing brace with comma - likely from removed object property",
      },
    ]),

    // TS1134 - Variable declaration expected
    "variable-declaration-expected": createProcessorRule("TS1134", [
      {
        regex: /^(\s*)for\s*\(\s*;/gm,
        message: "Missing variable declaration in for loop initializer",
      },
      {
        regex: /^(\s*)for\s*\(\s*\)/gm,
        message: "Empty for loop - declaration expected",
      },
    ]),

    // TS1180 - Destructuring pattern expected
    "destructuring-pattern-expected": createProcessorRule("TS1180", [
      {
        regex: /const\s+{\s*}\s*=/gm,
        message: "Empty destructuring pattern - add properties or remove",
      },
      {
        regex: /const\s+\[\s*\]\s*=/gm,
        message: "Empty array destructuring - add elements or remove",
      },
    ]),

    // TS1434 - Unexpected keyword or identifier
    "unexpected-keyword": createProcessorRule("TS1434", [
      {
        regex: /^(\s*)function\s+class\s+(\w+)/gm,
        message: 'Use "class" keyword instead of "function class"',
        fix: (match) => {
          const indent = match[1];
          const className = match[2];
          return `${indent}class ${className}`;
        },
      },
      {
        regex: /^(\s*)const\s+function\s+(\w+)/gm,
        message: 'Use "function" or "const" but not both',
        fix: (match) => {
          const indent = match[1];
          const funcName = match[2];
          return `${indent}function ${funcName}`;
        },
      },
    ]),

    // TS1442 - Unexpected token
    "unexpected-token": createProcessorRule("TS1442", [
      {
        regex: /,,+/g,
        message: "Multiple consecutive commas detected",
        fix: (match) => ",",
      },
      {
        regex: /;;+/g,
        message: "Multiple consecutive semicolons detected",
        fix: (match) => ";",
      },
    ]),

    // Quote escaping issues
    "quote-escaping": createProcessorRule("Quote Escaping", [
      {
        regex: /'[^']*'[a-z]/gi,
        message:
          "Potential apostrophe escaping issue - check for unescaped quotes in strings",
      },
      {
        regex: /\u2018|\u2019|\u201C|\u201D/g,
        message: "Smart quotes detected - use straight quotes in code",
      },
    ]),
  },

  configs: {
    recommended: {
      plugins: ["phase4"],
      rules: {
        "phase4/semicolon-expected": "warn",
        "phase4/identifier-expected": "error",
        "phase4/declaration-expected": "error",
        "phase4/variable-declaration-expected": "warn",
        "phase4/destructuring-pattern-expected": "warn",
        "phase4/unexpected-keyword": "error",
        "phase4/unexpected-token": "error",
        "phase4/quote-escaping": "warn",
      },
    },
    strict: {
      plugins: ["phase4"],
      rules: {
        "phase4/semicolon-expected": "error",
        "phase4/identifier-expected": "error",
        "phase4/declaration-expected": "error",
        "phase4/variable-declaration-expected": "error",
        "phase4/destructuring-pattern-expected": "error",
        "phase4/unexpected-keyword": "error",
        "phase4/unexpected-token": "error",
        "phase4/quote-escaping": "error",
      },
    },
  },
};
