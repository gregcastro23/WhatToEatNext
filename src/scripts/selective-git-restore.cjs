#!/usr/bin/env node

/**
 * Selective Git Restore Strategy
 *
 * Analyzes and selectively restores files that may have been corrupted
 * during previous campaigns, focusing on files with suspicious error patterns.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class SelectiveGitRestore {
  constructor() {
    this.restoredFiles = [];
    this.skippedFiles = [];
    this.analysisResults = [];
  }

  async executeRestoreAnalysis() {
    console.log("🔄 Starting Selective Git Restore Analysis");
    console.log("Analyzing files for potential corruption patterns\n");

    // Identify suspicious files
    const suspiciousFiles = await this.identifySuspiciousFiles();
    console.log(`🔍 Found ${suspiciousFiles.length} suspicious files\n`);

    // Analyze each file
    for (const file of suspiciousFiles) {
      await this.analyzeFile(file);
    }

    // Generate recommendations
    this.generateRestoreRecommendations();
  }

  async identifySuspiciousFiles() {
    const suspiciousFiles = [];

    // Get files with high error density
    const highErrorFiles = this.getHighErrorDensityFiles();
    suspiciousFiles.push(...highErrorFiles);

    // Get files with recent campaign modifications
    const campaignModifiedFiles = this.getCampaignModifiedFiles();
    suspiciousFiles.push(...campaignModifiedFiles);

    // Get files with specific error patterns
    const patternFiles = this.getSpecificPatternFiles();
    suspiciousFiles.push(...patternFiles);

    // Remove duplicates
    return [...new Set(suspiciousFiles)];
  }

  getHighErrorDensityFiles() {
    try {
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });
      return [];
    } catch (error) {
      const errorsByFile = {};
      const errorLines = error.stdout
        .split("\n")
        .filter((line) => line.includes("error TS"));

      for (const line of errorLines) {
        const match = line.match(/^(.+?)\(/);
        if (match) {
          const filePath = match[1].trim();
          errorsByFile[filePath] = (errorsByFile[filePath] || 0) + 1;
        }
      }

      // Return files with >20 errors (likely corrupted)
      return Object.entries(errorsByFile)
        .filter(([, count]) => count > 20)
        .map(([filePath]) => filePath);
    }
  }

  getCampaignModifiedFiles() {
    const campaignFiles = [];

    try {
      // Files modified by campaigns in the last week
      const recentCommits = execSync(
        'git log --oneline --since="1 week ago" --name-only',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const modifiedFiles = recentCommits
        .split("\n")
        .filter((line) => line.includes(".ts") || line.includes(".tsx"))
        .filter(
          (line) => !line.includes("commit ") && !line.includes("Author:"),
        );

      campaignFiles.push(...modifiedFiles);
    } catch (error) {
      console.warn("Could not analyze git history");
    }

    return campaignFiles;
  }

  getSpecificPatternFiles() {
    // Files with known problematic patterns
    const problematicPatterns = [
      "src/app/alchemicalEngine.ts",
      "src/app/test/migrated-components/",
      "src/services/campaign/",
      "src/__tests__/linting/",
    ];

    const matchingFiles = [];

    for (const pattern of problematicPatterns) {
      try {
        if (pattern.endsWith("/")) {
          // Directory pattern
          const files = execSync(
            `find ${pattern} -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`,
            {
              encoding: "utf8",
              stdio: "pipe",
            },
          )
            .split("\n")
            .filter(Boolean);
          matchingFiles.push(...files);
        } else {
          // File pattern
          if (fs.existsSync(pattern)) {
            matchingFiles.push(pattern);
          }
        }
      } catch (error) {
        // Pattern not found
      }
    }

    return matchingFiles;
  }

  async analyzeFile(filePath) {
    console.log(`🔍 Analyzing: ${filePath}`);

    const analysis = {
      filePath,
      exists: fs.existsSync(filePath),
      errorCount: 0,
      suspiciousPatterns: [],
      gitHistory: null,
      recommendation: "KEEP",
    };

    if (!analysis.exists) {
      analysis.recommendation = "SKIP";
      analysis.reason = "File does not exist";
      this.analysisResults.push(analysis);
      return;
    }

    // Count errors in this file
    analysis.errorCount = this.countErrorsInFile(filePath);

    // Check for suspicious patterns
    analysis.suspiciousPatterns = this.findSuspiciousPatterns(filePath);

    // Analyze git history
    analysis.gitHistory = this.analyzeGitHistory(filePath);

    // Generate recommendation
    analysis.recommendation = this.generateRecommendation(analysis);

    this.analysisResults.push(analysis);

    console.log(`  Errors: ${analysis.errorCount}`);
    console.log(`  Suspicious patterns: ${analysis.suspiciousPatterns.length}`);
    console.log(`  Recommendation: ${analysis.recommendation}`);
    console.log("");
  }

  countErrorsInFile(filePath) {
    try {
      const output = execSync(
        `yarn tsc --noEmit --skipLibCheck 2>&1 | grep "${filePath}(" | wc -l`,
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  findSuspiciousPatterns(filePath) {
    const patterns = [];

    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Check for suspicious patterns
      const suspiciousPatterns = [
        { name: "Empty objects", regex: /:\s*\{\s*\}/g },
        { name: "Excessive any usage", regex: /:\s*any/g },
        { name: "Unknown type assertions", regex: /as\s+unknown/g },
        { name: "Missing imports", regex: /Cannot find name/g },
        { name: "Undefined properties", regex: /Property.*does not exist/g },
      ];

      for (const pattern of suspiciousPatterns) {
        const matches = content.match(pattern.regex);
        if (matches && matches.length > 5) {
          patterns.push({
            name: pattern.name,
            count: matches.length,
          });
        }
      }
    } catch (error) {
      patterns.push({ name: "File read error", count: 1 });
    }

    return patterns;
  }

  analyzeGitHistory(filePath) {
    try {
      const history = execSync(`git log --oneline -5 -- "${filePath}"`, {
        encoding: "utf8",
        stdio: "pipe",
      });

      const commits = history.split("\n").filter(Boolean);

      return {
        recentCommits: commits.length,
        lastModified: commits[0] || "Unknown",
        hasCampaignChanges: commits.some(
          (commit) =>
            commit.includes("campaign") ||
            commit.includes("fix") ||
            commit.includes("automated"),
        ),
      };
    } catch (error) {
      return {
        recentCommits: 0,
        lastModified: "Unknown",
        hasCampaignChanges: false,
      };
    }
  }

  generateRecommendation(analysis) {
    // High error count + suspicious patterns = restore candidate
    if (analysis.errorCount > 50 && analysis.suspiciousPatterns.length > 3) {
      return "RESTORE";
    }

    // Recent campaign changes with many errors = restore candidate
    if (analysis.gitHistory?.hasCampaignChanges && analysis.errorCount > 30) {
      return "RESTORE";
    }

    // Specific problematic files
    if (
      analysis.filePath.includes("alchemicalEngine.ts") &&
      analysis.errorCount > 10
    ) {
      return "RESTORE";
    }

    // Test files with excessive errors
    if (analysis.filePath.includes("__tests__") && analysis.errorCount > 20) {
      return "RESTORE";
    }

    // Medium priority files
    if (analysis.errorCount > 20 || analysis.suspiciousPatterns.length > 2) {
      return "CONSIDER";
    }

    return "KEEP";
  }

  generateRestoreRecommendations() {
    const restoreFiles = this.analysisResults.filter(
      (a) => a.recommendation === "RESTORE",
    );
    const considerFiles = this.analysisResults.filter(
      (a) => a.recommendation === "CONSIDER",
    );
    const keepFiles = this.analysisResults.filter(
      (a) => a.recommendation === "KEEP",
    );

    console.log("\n" + "=".repeat(80));
    console.log("📋 SELECTIVE GIT RESTORE RECOMMENDATIONS");
    console.log("=".repeat(80));

    console.log(`\n🔄 RESTORE (${restoreFiles.length} files):`);
    for (const file of restoreFiles) {
      console.log(`  ${file.filePath} (${file.errorCount} errors)`);
    }

    console.log(`\n🤔 CONSIDER (${considerFiles.length} files):`);
    for (const file of considerFiles.slice(0, 10)) {
      console.log(`  ${file.filePath} (${file.errorCount} errors)`);
    }

    console.log(`\n✅ KEEP (${keepFiles.length} files)`);

    // Generate restore commands
    if (restoreFiles.length > 0) {
      console.log("\n🚀 Recommended restore commands:");
      console.log("\n# Create backup first:");
      console.log('git stash push -m "Before selective restore"');

      console.log("\n# Restore specific files:");
      for (const file of restoreFiles) {
        console.log(`git checkout HEAD~5 -- "${file.filePath}"`);
      }

      console.log("\n# Or restore from a specific good commit:");
      console.log("# git checkout <good-commit-hash> -- <file-path>");
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      analysis: "Selective Git Restore",
      summary: {
        total: this.analysisResults.length,
        restore: restoreFiles.length,
        consider: considerFiles.length,
        keep: keepFiles.length,
      },
      files: this.analysisResults,
    };

    fs.writeFileSync(
      "selective-restore-analysis.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      `\n📄 Detailed analysis saved to: selective-restore-analysis.json`,
    );
    console.log("=".repeat(80));
  }
}

// Execute restore analysis
async function main() {
  const restorer = new SelectiveGitRestore();
  await restorer.executeRestoreAnalysis();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SelectiveGitRestore };
