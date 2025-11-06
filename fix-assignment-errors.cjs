#!/usr/bin/env node

/**
 * Fix TS2779 errors - optional property access on left-hand side of assignments
 * These were introduced by the overly aggressive safe property access pattern
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class AssignmentErrorFixer {
  constructor() {
    this.fixedCount = 0;
    this.filesProcessed = 0;
  }

  run() {
    console.log("🔧 Fixing TS2779 Assignment Errors");

    // Get all TS2779 errors
    const errors = this.getAssignmentErrors();
    console.log(`Found ${errors.length} assignment errors to fix`);

    // Group errors by file
    const errorsByFile = this.groupErrorsByFile(errors);

    // Fix each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      this.fixFile(filePath, fileErrors);
    }

    console.log(
      `✅ Fixed ${this.fixedCount} errors in ${this.filesProcessed} files`,
    );
  }

  getAssignmentErrors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS2779"',
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        },
      );

      return output
        .trim()
        .split("\n")
        .map((line) => {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):/);
          if (match) {
            return {
              file: match[1],
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              fullLine: line,
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  groupErrorsByFile(errors) {
    return errors.reduce((acc, error) => {
      if (!acc[error.file]) {
        acc[error.file] = [];
      }
      acc[error.file].push(error);
      return acc;
    }, {});
  }

  fixFile(filePath, errors) {
    console.log(`\nProcessing ${filePath}...`);

    try {
      let content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      // Sort errors by line number in reverse order to avoid offset issues
      errors.sort((a, b) => b.line - a.line);

      for (const error of errors) {
        const lineIndex = error.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];

          // Fix pattern: change "obj?.prop?.nested +=" to "obj.prop.nested +="
          // But only for assignment operations
          const fixedLine = this.fixAssignmentLine(line);

          if (fixedLine !== line) {
            lines[lineIndex] = fixedLine;
            this.fixedCount++;
            console.log(
              `  Fixed line ${error.line}: ${line.trim()} → ${fixedLine.trim()}`,
            );
          }
        }
      }

      // Write back the fixed content
      fs.writeFileSync(filePath, lines.join("\n"));
      this.filesProcessed++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  fixAssignmentLine(line) {
    // Pattern to match optional chaining on left side of assignment
    // This matches things like: obj?.prop?.nested += value
    const assignmentPattern =
      /(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*(?:\?\.(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\[[^\]]+\]))*)\s*([+\-*\/]?=)/g;

    return line.replace(
      assignmentPattern,
      (match, indent, leftSide, operator) => {
        // Remove all ?. from the left side of assignment
        const fixedLeftSide = leftSide.replace(
          /\?\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
          ".$1",
        );
        const fixedLeftSide2 = fixedLeftSide.replace(/\?\.\[/g, "[");
        return indent + fixedLeftSide2 + " " + operator;
      },
    );
  }
}

// Run the fixer
const fixer = new AssignmentErrorFixer();
fixer.run();
