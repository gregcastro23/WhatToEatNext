#!/usr/bin/env node

/**
 * Replace Console Statements Script
 *
 * This script replaces console.log statements with proper logging
 * while preserving console.warn and console.error statements.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ConsoleReplacement {
  file: string;
  line: number;
  original: string;
  replacement: string;
}

class ConsoleStatementReplacer {
  private readonly srcDir = path.join(process.cwd(), "src");
  private readonly backupDir = path.join(
    process.cwd(),
    ".console-replacement-backup",
  );
  private processedFiles = 0;
  private replacements: ConsoleReplacement[] = [];

  constructor() {
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private createBackup(filePath: string): void {
    const relativePath = path.relative(this.srcDir, filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(filePath, backupPath);
  }

  private getAllTypeScriptFiles(): string[] {
    const files: string[] = [];

    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules"
        ) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(this.srcDir);
    return files;
  }

  private shouldPreserveConsoleStatement(line: string): boolean {
    const trimmed = line.trim();

    // Preserve console.warn and console.error
    if (trimmed.includes("console.warn") || trimmed.includes("console.error")) {
      return true;
    }

    // Preserve in test files
    if (
      trimmed.includes("jest.") ||
      trimmed.includes("expect(") ||
      trimmed.includes("describe(") ||
      trimmed.includes("it(")
    ) {
      return true;
    }

    // Preserve in development/debug contexts
    if (trimmed.includes("DEBUG") || trimmed.includes("development")) {
      return true;
    }

    return false;
  }

  private replaceConsoleStatements(filePath: string): boolean {
    try {
      this.createBackup(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let hasChanges = false;

      // Check if this is a script file (preserve console statements in scripts)
      const isScriptFile =
        filePath.includes("/scripts/") || filePath.includes("/campaign/");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip if this is a script file or should be preserved
        if (isScriptFile || this.shouldPreserveConsoleStatement(line)) {
          continue;
        }

        // Replace console.log statements
        if (trimmed.includes("console.log(")) {
          const replacement = line.replace(/console\.log\(/g, "logger.info(");

          // Add logger import if not present
          if (!content.includes("import") || !content.includes("logger")) {
            // We'll handle logger import separately
          }

          this.replacements.push({
            file: filePath,
            line: i + 1,
            original: line,
            replacement: replacement,
          });

          lines[i] = replacement;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        // Add logger import at the top if console.log was replaced
        const hasLoggerImport =
          content.includes("from '@/services/LoggingService'") ||
          content.includes('from "@/services/LoggingService"');

        if (
          !hasLoggerImport &&
          this.replacements.some((r) => r.file === filePath)
        ) {
          // Find the best place to add the import
          let importInsertIndex = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith("import ")) {
              importInsertIndex = i + 1;
            } else if (lines[i].trim() === "" && importInsertIndex > 0) {
              break;
            } else if (
              !lines[i].trim().startsWith("import ") &&
              importInsertIndex > 0
            ) {
              break;
            }
          }

          lines.splice(
            importInsertIndex,
            0,
            "import { logger } from '@/services/LoggingService';",
          );
        }

        fs.writeFileSync(filePath, lines.join("\n"));
        this.processedFiles++;
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `⚠️ Failed to process ${filePath}:`,
        (error as Error).message,
      );
      return false;
    }
  }

  private createLoggingService(): void {
    const loggingServicePath = path.join(
      this.srcDir,
      "services",
      "LoggingService.ts",
    );

    if (!fs.existsSync(loggingServicePath)) {
      const loggingServiceContent = `/**
 * Centralized Logging Service
 * 
 * Provides structured logging capabilities to replace console.log statements
 * while maintaining console.warn and console.error for debugging.
 */

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void
}

class LoggingService implements Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(\`[INFO] \${message}\`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(\`[WARN] \${message}\`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(\`[ERROR] \${message}\`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(\`[DEBUG] \${message}\`, ...args);
    }
  }
}

export const logger = new LoggingService();
export default logger;
`;

      fs.writeFileSync(loggingServicePath, loggingServiceContent);
      console.log("✅ Created LoggingService.ts");
    }
  }

  private generateReport(): void {
    const report = `;
# Console Statement Replacement Report

## Summary
- **Files Processed**: ${this.processedFiles}
- **Total Replacements**: ${this.replacements.length}

## Replacements Made
${this.replacements
  .map(
    (r) =>
      `- **${path.relative(this.srcDir, r.file)}:${r.line}**
  - Before: \`${r.original.trim()}\`
  - After: \`${r.replacement.trim()}\``,
  )
  .join("\n")}

## Backup Location
Backups created in: ${this.backupDir}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync("console-replacement-report.md", report);
    console.log("📊 Report generated: console-replacement-report.md");
  }

  public async run(): Promise<void> {
    console.log("🚀 Starting Console Statement Replacement");
    console.log("=".repeat(60));

    try {
      // Step 1: Create logging service
      this.createLoggingService();

      // Step 2: Process all TypeScript files
      const files = this.getAllTypeScriptFiles();
      console.log(`📁 Found ${files.length} TypeScript files`);

      for (const file of files) {
        this.replaceConsoleStatements(file);
      }

      // Step 3: Generate report
      this.generateReport();

      console.log("=".repeat(60));
      console.log(`✅ Console statement replacement completed!`);
      (console.log(`   Files processed: ${this.processedFiles}`),
        console.log(`   Statements replaced: ${this.replacements.length}`),
        console.log(`   Backup location: ${this.backupDir}`));
    } catch (error) {
      console.error("❌ Console statement replacement failed:", error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const replacer = new ConsoleStatementReplacer();
  replacer.run().catch(console.error);
}

export default ConsoleStatementReplacer;
