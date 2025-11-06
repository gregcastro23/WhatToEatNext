#!/usr/bin/env node

/**
 * ProcessorFactory - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 8, 2025
 *
 * Factory pattern for creating and managing error processors
 * Supports 13+ automated error processors for systematic error elimination
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Import all processors
import TS1003Processor from "../processors/identifier-processor.js";
import TS1005Processor from "../processors/ts1005-processor.js";
import TS1109Processor from "../processors/ts1109-processor.js";
import TS1121Processor from "../processors/octal-literal-processor.js";
import TS1128Processor from "../processors/ts1128-processor.js";
import TS1131Processor from "../processors/property-assignment-processor.js";
import TS1135Processor from "../processors/argument-expression-processor.js";
import TS1136Processor from "../processors/property-assignment-processor.js"; // Alias for TS1131
import TS1134Processor from "../processors/ts1134-processor.js";
import TS1180Processor from "../processors/ts1180-processor.js";
import TS1434Processor from "../processors/ts1434-processor.js";
import TS1442Processor from "../processors/ts1442-processor.js";

class ProcessorFactory {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../../../",
    );
    this.processors = {
      // Phase 3 Processors (9 total)
      TS1003: TS1003Processor,
      TS1005: TS1005Processor,
      TS1109: TS1109Processor,
      TS1121: TS1121Processor,
      TS1128: TS1128Processor,
      TS1131: TS1131Processor,
      TS1135: TS1135Processor,
      TS1136: TS1136Processor,

      // Phase 4 New Processors (4 total)
      TS1134: TS1134Processor,
      TS1180: TS1180Processor,
      TS1434: TS1434Processor,
      TS1442: TS1442Processor,
    };

    this.processorMetadata = {
      TS1003: {
        name: "Identifier Processor",
        category: "Phase 3",
        description: "Fixes identifier expected errors",
      },
      TS1005: {
        name: "Semicolon/Comma Processor",
        category: "Phase 3",
        description: "Fixes semicolon and comma syntax errors",
      },
      TS1109: {
        name: "Expression Processor",
        category: "Phase 3",
        description: "Fixes expression expected errors",
      },
      TS1121: {
        name: "Octal Literal Processor",
        category: "Phase 3",
        description: "Fixes octal literal syntax errors",
      },
      TS1128: {
        name: "Declaration Processor",
        category: "Phase 3",
        description: "Fixes declaration or statement expected errors",
      },
      TS1131: {
        name: "Property Assignment Processor",
        category: "Phase 3",
        description: "Fixes property assignment expected errors",
      },
      TS1135: {
        name: "Argument Expression Processor",
        category: "Phase 3",
        description: "Fixes argument expression expected errors",
      },
      TS1136: {
        name: "Property Assignment Processor (Alias)",
        category: "Phase 3",
        description: "Fixes property assignment expected errors",
      },
      TS1134: {
        name: "Variable Declaration Processor",
        category: "Phase 4",
        description: "Fixes variable declaration expected errors",
      },
      TS1180: {
        name: "Destructuring Processor",
        category: "Phase 4",
        description: "Fixes destructuring pattern expected errors",
      },
      TS1434: {
        name: "Keyword Processor",
        category: "Phase 4",
        description: "Fixes unexpected keyword or identifier errors",
      },
      TS1442: {
        name: "Token Processor",
        category: "Phase 4",
        description: "Fixes unexpected token errors",
      },
    };
  }

  /**
   * Create a processor instance for the given error code
   */
  static createProcessor(errorCode) {
    const factory = new ProcessorFactory();
    return factory.createProcessor(errorCode);
  }

  /**
   * Create a processor instance for the given error code
   */
  createProcessor(errorCode) {
    const ProcessorClass = this.processors[errorCode];
    if (!ProcessorClass) {
      throw new Error(`No processor available for error code: ${errorCode}`);
    }

    return new ProcessorClass();
  }

  /**
   * Get metadata for a specific error code
   */
  getProcessorMetadata(errorCode) {
    return (
      this.processorMetadata[errorCode] || {
        name: "Unknown Processor",
        category: "Unknown",
        description: "No metadata available",
      }
    );
  }

  /**
   * Get all available processors
   */
  getAvailableProcessors() {
    return Object.keys(this.processors);
  }

  /**
   * Get processors by category
   */
  getProcessorsByCategory(category) {
    return Object.entries(this.processorMetadata)
      .filter(([, metadata]) => metadata.category === category)
      .map(([code, metadata]) => ({ code, ...metadata }));
  }

  /**
   * Analyze current errors and recommend processors
   */
  async analyzeAndRecommend() {
    console.log("🔍 Analyzing current errors and recommending processors...\n");

    try {
      const tscOutput = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
        {
          cwd: this.projectRoot,
          encoding: "utf8",
          maxBuffer: 50 * 1024 * 1024,
        },
      );

      const errorCounts = {};
      const lines = tscOutput.split("\n");

      for (const line of lines) {
        const match = line.match(/error (TS\d+):/);
        if (match) {
          const errorCode = match[1];
          errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
        }
      }

      const recommendations = this.generateRecommendations(errorCounts);

      console.log("📊 Error Analysis Results:");
      console.log("=".repeat(50));
      console.log(
        `Total Errors: ${Object.values(errorCounts).reduce((a, b) => a + b, 0)}`,
      );
      console.log(`Error Types: ${Object.keys(errorCounts).length}`);

      console.log("\n🎯 Processor Recommendations:");
      recommendations.forEach((rec) => {
        console.log(
          `\n${rec.priority} - ${rec.errorCode}: ${rec.count} errors`,
        );
        console.log(`  ${rec.metadata.name}`);
        console.log(`  ${rec.metadata.description}`);
        console.log(`  Recommended Action: ${rec.action}`);
      });

      return { errorCounts, recommendations };
    } catch (error) {
      console.error("❌ Error during analysis:", error.message);
      throw error;
    }
  }

  /**
   * Generate processor recommendations based on error analysis
   */
  generateRecommendations(errorCounts) {
    const recommendations = [];

    Object.entries(errorCounts).forEach(([errorCode, count]) => {
      const metadata = this.getProcessorMetadata(errorCode);
      const hasProcessor = !!this.processors[errorCode];

      let priority = "❌ No Processor";
      let action = "Manual review required";

      if (hasProcessor) {
        if (count >= 100) {
          priority = "🔴 CRITICAL";
          action = "Immediate automated processing recommended";
        } else if (count >= 50) {
          priority = "🟠 HIGH";
          action = "Automated processing recommended";
        } else if (count >= 10) {
          priority = "🟡 MEDIUM";
          action = "Automated processing suggested";
        } else {
          priority = "🟢 LOW";
          action = "Optional automated processing";
        }
      }

      recommendations.push({
        errorCode,
        count,
        priority,
        action,
        metadata,
        hasProcessor,
      });
    });

    // Sort by priority and count
    return recommendations.sort((a, b) => {
      const priorityOrder = {
        "🔴 CRITICAL": 4,
        "🟠 HIGH": 3,
        "🟡 MEDIUM": 2,
        "🟢 LOW": 1,
        "❌ No Processor": 0,
      };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.count - a.count;
    });
  }

  /**
   * Execute automated processing for recommended errors
   */
  async executeAutomatedProcessing(dryRun = true) {
    console.log(
      `🚀 Executing automated error processing (Mode: ${dryRun ? "DRY RUN" : "LIVE"})...\n`,
    );

    const { recommendations } = await this.analyzeAndRecommend();

    const automatedRecommendations = recommendations.filter(
      (rec) => rec.hasProcessor,
    );

    console.log(
      `Processing ${automatedRecommendations.length} automated processors...\n`,
    );

    const results = [];

    for (const rec of automatedRecommendations) {
      console.log(`\n🔧 Processing ${rec.errorCode} (${rec.count} errors)`);

      try {
        const processor = this.createProcessor(rec.errorCode);
        const result = await processor.process(dryRun);

        results.push({
          errorCode: rec.errorCode,
          ...result,
          success: true,
        });

        console.log(`✅ ${rec.errorCode} processing complete`);
      } catch (error) {
        console.error(`❌ Error processing ${rec.errorCode}:`, error.message);
        results.push({
          errorCode: rec.errorCode,
          error: error.message,
          success: false,
        });
      }
    }

    const summary = {
      totalProcessors: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalFilesProcessed: results.reduce(
        (sum, r) => sum + (r.filesProcessed || 0),
        0,
      ),
      totalErrorsFixed: results.reduce(
        (sum, r) => sum + (r.errorsFixed || 0),
        0,
      ),
      dryRun,
    };

    console.log("\n📊 Processing Summary:");
    console.log("=".repeat(30));
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log(`Processors Executed: ${summary.totalProcessors}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Files Processed: ${summary.totalFilesProcessed}`);
    console.log(`Errors Fixed: ${summary.totalErrorsFixed}`);

    return { results, summary };
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const factory = new ProcessorFactory();

  switch (command) {
    case "analyze":
      await factory.analyzeAndRecommend();
      break;

    case "process-dry":
      await factory.executeAutomatedProcessing(true);
      break;

    case "process":
      const confirm = args.includes("--confirm");
      if (!confirm) {
        console.log("⚠️  WARNING: This will modify files!");
        console.log("Add --confirm flag to proceed with live processing");
        console.log("\nExample: node processor-factory.js process --confirm");
        process.exit(1);
      }
      await factory.executeAutomatedProcessing(false);
      break;

    case "list":
      console.log("📋 Available Processors:");
      console.log("=".repeat(30));
      Object.entries(factory.processorMetadata).forEach(([code, metadata]) => {
        console.log(`${code}: ${metadata.name} (${metadata.category})`);
        console.log(`  ${metadata.description}`);
      });
      break;

    default:
      console.log(`
ProcessorFactory - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 8, 2025

Usage: node src/scripts/quality-gates/processor-factory.js <command> [options]

Commands:
  analyze          - Analyze current errors and recommend processors
  process-dry      - Execute automated processing in dry-run mode
  process --confirm - Execute automated processing with live file changes
  list             - List all available processors

Examples:
  node src/scripts/quality-gates/processor-factory.js analyze
  node src/scripts/quality-gates/processor-factory.js process-dry
  node src/scripts/quality-gates/processor-factory.js process --confirm
  node src/scripts/quality-gates/processor-factory.js list

Processor Coverage: 13 error types supported
Phase 3: 9 processors (TS1003, TS1005, TS1109, TS1121, TS1128, TS1131, TS1135, TS1136)
Phase 4: 4 processors (TS1134, TS1180, TS1434, TS1442)
      `);
  }
}

export default ProcessorFactory;
