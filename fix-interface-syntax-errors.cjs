#!/usr/bin/env node

/**
 * Fix Interface Syntax Errors - Final Critical Fix
 *
 * Fixes remaining interface syntax errors preventing compilation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class InterfaceSyntaxFixer {
  constructor() {
    this.backupDir = `.interface-syntax-backup-${Date.now()}`;
    this.logFile = `interface-syntax-fixes-${Date.now()}.md`;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    this.log("Interface Syntax Fixer Started");
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logEntry);
  }

  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath.replace(/\//g, "_"));
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  fixInterfaceSyntax(filePath) {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    this.createBackup(filePath);

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    let fixCount = 0;

    // Fix interface property syntax errors

    // 1. Fix semicolon followed by comma (;,)
    const semicolonCommaPattern = /(\w+:\s*[^;,\n}]+);,/g;
    if (semicolonCommaPattern.test(content)) {
      content = content.replace(semicolonCommaPattern, "$1;");
      fixCount++;
      this.log(
        `  ✅ Fixed semicolon-comma syntax in ${path.basename(filePath)}`,
      );
    }

    // 2. Fix colon followed by comma (:,)
    const colonCommaPattern = /(\w+):\s*([^,\n}]+),\s*\n/g;
    if (colonCommaPattern.test(content)) {
      content = content.replace(colonCommaPattern, "$1: $2;\n");
      fixCount++;
      this.log(`  ✅ Fixed colon-comma syntax in ${path.basename(filePath)}`);
    }

    // 3. Fix property declarations with trailing commas in interfaces
    const interfacePropertyPattern = /(\s+)(\w+):\s*([^,;\n}]+),(\s*\n)/g;
    if (interfacePropertyPattern.test(content)) {
      content = content.replace(interfacePropertyPattern, "$1$2: $3;$4");
      fixCount++;
      this.log(
        `  ✅ Fixed interface property commas in ${path.basename(filePath)}`,
      );
    }

    // 4. Fix type definitions with trailing commas
    const typeDefPattern =
      /(type\s+\w+\s*=\s*{[^}]*?)(\w+:\s*[^,;\n}]+),(\s*\n)/g;
    if (typeDefPattern.test(content)) {
      content = content.replace(typeDefPattern, "$1$2;$3");
      fixCount++;
      this.log(
        `  ✅ Fixed type definition commas in ${path.basename(filePath)}`,
      );
    }

    // 5. Fix object literal syntax in interfaces
    const objectLiteralPattern =
      /(\s+)(\w+):\s*{([^}]*?)(\w+:\s*[^,;\n}]+),(\s*\n\s*})/g;
    if (objectLiteralPattern.test(content)) {
      content = content.replace(objectLiteralPattern, "$1$2: {$3$4$5");
      fixCount++;
      this.log(
        `  ✅ Fixed object literal syntax in ${path.basename(filePath)}`,
      );
    }

    // 6. Fix export interface syntax
    const exportInterfacePattern =
      /(export\s+interface\s+\w+\s*{[^}]*?)(\w+:\s*[^,;\n}]+),(\s*\n)/g;
    if (exportInterfacePattern.test(content)) {
      content = content.replace(exportInterfacePattern, "$1$2;$3");
      fixCount++;
      this.log(
        `  ✅ Fixed export interface syntax in ${path.basename(filePath)}`,
      );
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.log(
        `  ✅ Fixed ${fixCount} interface syntax issues in ${path.basename(filePath)}`,
      );
      return true;
    }

    return false;
  }

  findFilesWithInterfaceErrors() {
    const files = [];

    try {
      // Get build output to find files with interface errors
      execSync("yarn build", { stdio: "pipe", timeout: 30000 });
    } catch (error) {
      const errorOutput =
        error.stdout?.toString() || error.stderr?.toString() || "";

      // Extract file paths from error messages
      const fileMatches = errorOutput.match(/\.\/src\/[^\s]+\.tsx?/g);
      if (fileMatches) {
        const uniqueFiles = [
          ...new Set(fileMatches.map((f) => f.replace("./", ""))),
        ];
        files.push(...uniqueFiles);
      }
    }

    return files;
  }

  validateBuild() {
    try {
      this.log("Validating build...");
      execSync("yarn build", { stdio: "pipe", timeout: 60000 });
      this.log("✅ Build validation passed");
      return true;
    } catch (error) {
      this.log("❌ Build validation failed");
      return false;
    }
  }

  execute() {
    this.log("Starting Interface Syntax Error Fixes");

    // Get files with interface errors from build output
    const errorFiles = this.findFilesWithInterfaceErrors();

    if (errorFiles.length === 0) {
      this.log("No interface syntax errors detected in build output");
      return this.validateBuild();
    }

    this.log(
      `Found ${errorFiles.length} files with potential interface errors`,
    );

    let totalFixed = 0;

    for (const filePath of errorFiles) {
      if (fs.existsSync(filePath)) {
        this.log(`Fixing interface syntax in: ${filePath}`);
        if (this.fixInterfaceSyntax(filePath)) {
          totalFixed++;
        }
      }
    }

    this.log(`\nFixed interface syntax in ${totalFixed} files`);

    // Final build validation
    const buildValid = this.validateBuild();

    if (buildValid) {
      this.log("\n🎉 All interface syntax errors fixed successfully!");
      this.log("✅ Build is now stable");
      return true;
    } else {
      this.log("\n⚠️ Some build issues may still remain");
      this.log(`Backup available at: ${this.backupDir}`);
      return false;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new InterfaceSyntaxFixer();
  const success = fixer.execute();
  process.exit(success ? 0 : 1);
}

module.exports = InterfaceSyntaxFixer;
