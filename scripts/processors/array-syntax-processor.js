#!/usr/bin/env node

/**
 * Array Syntax Processor - Phase 3 Wave 1
 * Fixes array literal syntax errors
 */

import fs from "fs";
import path from "path";

class ArraySyntaxProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.arraysFixed = 0;
    this.bracketsFixed = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase3", "arrays");
  }

  async process() {
    console.log("🔧 Processing array syntax errors...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with array syntax errors
    const filesWithErrors = await this.getFilesWithArrayErrors();

    console.log(
      `Found ${filesWithErrors.length} files with array syntax errors`,
    );

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      arraysFixed: this.arraysFixed,
      bracketsFixed: this.bracketsFixed,
      success: true,
    };
  }

  async getFilesWithArrayErrors() {
    // Files that may have array syntax issues
    const errorFiles = [
      "src/utils/testIngredientMapping.ts",
      "src/utils/withRenderTracking.tsx",
      // Add more from error analysis
    ];

    return errorFiles.filter((file) => {
      const fullPath = path.join(this.projectRoot, file);
      return fs.existsSync(fullPath);
    });
  }

  async processFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    console.log(`Processing ${filePath}...`);

    // Backup original
    const backupPath = path.join(
      this.backupDir,
      path.basename(filePath) + ".backup",
    );
    fs.copyFileSync(fullPath, backupPath);

    let content = fs.readFileSync(fullPath, "utf8");
    let localArrays = 0;
    let localBrackets = 0;

    // Fix missing commas in array literals
    const commaResult = this.fixArrayCommas(content);
    content = commaResult.content;
    localArrays += commaResult.fixes;

    // Fix bracket balance
    const bracketResult = this.fixBracketBalance(content);
    content = bracketResult.content;
    localBrackets += bracketResult.fixes;

    // Fix array element syntax
    const elementResult = this.fixArrayElements(content);
    content = elementResult.content;
    localArrays += elementResult.fixes;

    if (localArrays > 0 || localBrackets > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.arraysFixed += localArrays;
      this.bracketsFixed += localBrackets;
      console.log(`  ✓ Fixed ${localArrays} arrays, ${localBrackets} brackets`);
    }
  }

  fixArrayCommas(content) {
    let fixes = 0;

    // Fix missing commas between array elements
    // Pattern: [item1 item2] -> [item1, item2]
    content = content.replace(/\[([^\]]*)\]/g, (match, inside) => {
      if (inside.includes(" ") && !inside.includes(",")) {
        const fixed = inside.replace(/\s+/g, ", ");
        fixes++;
        return `[${fixed}]`;
      }
      return match;
    });

    return { content, fixes };
  }

  fixBracketBalance(content) {
    let fixes = 0;
    const lines = content.split("\n");

    // Check for unbalanced brackets
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Count brackets in line
      const openCount = (line.match(/\[/g) || []).length;
      const closeCount = (line.match(/\]/g) || []).length;

      if (openCount > closeCount) {
        // Missing closing bracket - look ahead for where to add it
        let j = i + 1;
        let added = false;
        while (j < lines.length && !added) {
          if (
            lines[j].trim() &&
            !lines[j].includes("[") &&
            !lines[j].includes("{")
          ) {
            lines.splice(j, 0, "  ],");
            fixes++;
            added = true;
          }
          j++;
        }
      }
    }

    return { content: lines.join("\n"), fixes };
  }

  fixArrayElements(content) {
    let fixes = 0;

    // Fix octal literal issues (0 prefix)
    // Pattern: .slice(05) -> .slice(5)
    content = content.replace(/slice\(0(\d+)\)/g, (match, num) => {
      fixes++;
      return `slice(${num})`;
    });

    // Fix other octal literals
    content = content.replace(/\(0(\d+)\)/g, (match, num) => {
      if (!match.includes("0o")) {
        fixes++;
        return `(${num})`;
      }
      return match;
    });

    return { content, fixes };
  }
}

export default ArraySyntaxProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new ArraySyntaxProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Array syntax processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Arrays fixed: ${result.arraysFixed}`);
      console.log(`Brackets fixed: ${result.bracketsFixed}`);
    })
    .catch(console.error);
}
