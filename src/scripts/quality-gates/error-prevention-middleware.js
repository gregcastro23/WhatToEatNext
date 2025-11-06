#!/usr/bin/env node

/**
 * Error Prevention Middleware - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 8, 2025
 *
 * Real-time error detection and prevention system
 * Analyzes code patterns to prevent common TypeScript errors before they occur
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

class ErrorPreventionMiddleware {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../../../",
    );
    this.preventionRules = this.loadPreventionRules();
    this.patternCache = new Map();
    this.analysisCache = new Map();
  }

  loadPreventionRules() {
    return {
      // TS1005 Prevention Rules
      semicolonErrors: [
        {
          pattern: /^(\s*)(const|let|var)\s+(\w+)\s*=\s*[^;]*$/gm,
          message: "Missing semicolon after variable declaration",
          fix: (match, indent, keyword, varName) =>
            `${indent}${keyword} ${varName} = ...;`,
          prevention: "Add semicolon after variable assignments",
        },
        {
          pattern: /^(\s*)(return|throw|break|continue)\s+[^;]*$/gm,
          message: "Missing semicolon after control statement",
          fix: (match, indent, keyword, rest) => `${indent}${keyword} ${rest};`,
          prevention: "Add semicolon after return, throw, break, continue",
        },
      ],

      // TS1003 Prevention Rules
      identifierErrors: [
        {
          pattern: /^(\s*)\w+\s*\.\s*$/gm,
          message: "Incomplete property access - identifier expected",
          fix: (match, indent) => `${indent}object.property;`,
          prevention: "Complete property access with valid identifier",
        },
        {
          pattern: /^(\s*)\w+\s*\[\s*\]\s*$/gm,
          message: "Empty array access - identifier expected",
          fix: (match, indent) => `${indent}array[index];`,
          prevention: "Provide valid array index",
        },
      ],

      // TS1128 Prevention Rules
      declarationErrors: [
        {
          pattern: /^(\s*)function\s*\([^)]*$/gm,
          message: "Incomplete function declaration",
          fix: (match, indent) => `${indent}function name(parameters) {`,
          prevention: "Complete function declaration with name and parameters",
        },
        {
          pattern: /^(\s*)class\s*$/gm,
          message: "Incomplete class declaration",
          fix: (match, indent) => `${indent}class ClassName {`,
          prevention: "Provide class name after class keyword",
        },
      ],

      // TS1134 Prevention Rules (New)
      variableDeclarationErrors: [
        {
          pattern: /^(\s*)(const|let|var)\s+\w+\s+\w+\s*=\s*[^;]*$/gm,
          message: "Malformed variable declaration with extra keyword",
          fix: (match, indent, keyword, varName, extra) =>
            `${indent}${keyword} ${varName} = ...;`,
          prevention: "Remove extra keywords from variable declarations",
        },
        {
          pattern: /^(\s*)\w+\s*\([^)]*\)\s*\{[^}]*$/gm,
          message: "Function call looks like function declaration",
          fix: (match, indent) => `${indent}object.method();`,
          prevention: "Ensure function calls have proper object reference",
        },
      ],

      // TS1180 Prevention Rules (New)
      destructuringErrors: [
        {
          pattern: /^(\s*)\{\s*\w+\s*\w+\s*\}/gm,
          message: "Missing comma in object destructuring",
          fix: (match, indent) => `${indent}{ property1, property2 }`,
          prevention: "Add commas between destructured properties",
        },
        {
          pattern: /^(\s*)\[\s*\w+\s*\w+\s*\]/gm,
          message: "Missing comma in array destructuring",
          fix: (match, indent) => `${indent}[ item1, item2 ]`,
          prevention: "Add commas between array elements",
        },
      ],

      // TS1434 Prevention Rules (New)
      keywordErrors: [
        {
          pattern: /^(\s*)function\s+class\s+\w+/gm,
          message: "Incorrect keyword order in class declaration",
          fix: (match, indent, className) => `${indent}class ${className}`,
          prevention: 'Use "class" keyword instead of "function class"',
        },
        {
          pattern: /^(\s*)class\s+interface\s+\w+/gm,
          message: "Incorrect keyword for interface declaration",
          fix: (match, indent, interfaceName) =>
            `${indent}interface ${interfaceName}`,
          prevention: 'Use "interface" keyword instead of "class interface"',
        },
        {
          pattern: /^(\s*)const\s+function\s+\w+/gm,
          message: "Incorrect keyword for function declaration",
          fix: (match, indent, functionName) =>
            `${indent}function ${functionName}`,
          prevention: 'Use "function" keyword instead of "const function"',
        },
      ],

      // TS1442 Prevention Rules (New)
      tokenErrors: [
        {
          pattern: /^(\s*)\w+\s*\([^)]*\)\s*\([^)]*\)/gm,
          message: "Double function call syntax error",
          fix: (match, indent) => `${indent}result = function();`,
          prevention:
            "Fix function call syntax - likely missing assignment or semicolon",
        },
        {
          pattern: /^(\s*)\w+\s*\.\s*\w+\s*\([^)]*\)\s*\([^)]*\)/gm,
          message: "Double method call on same line",
          fix: (match, indent) =>
            `${indent}object.method1();\n${indent}object.method2();`,
          prevention: "Split chained method calls onto separate lines",
        },
      ],

      // Import/Export Prevention
      importErrors: [
        {
          pattern: /^(\s*)import\s+\{[^}]*[^}]*$/gm,
          message: "Incomplete import statement",
          fix: (match, indent) => `${indent}import { module } from 'package';`,
          prevention: "Complete import statement with proper closing brace",
        },
        {
          pattern: /^(\s*)export\s+(const|let|var|function)\s*$/gm,
          message: "Incomplete export declaration",
          fix: (match, indent, keyword) =>
            `${indent}export ${keyword} name = value;`,
          prevention:
            "Complete export statement with variable/function declaration",
        },
      ],

      // Type Annotation Prevention
      typeErrors: [
        {
          pattern: /^(\s*)\w+\s*:\s*$/gm,
          message: "Incomplete type annotation",
          fix: (match, indent) => `${indent}variable: Type;`,
          prevention: "Complete type annotation with valid TypeScript type",
        },
        {
          pattern: /^(\s*)\w+\s*<\s*>?\s*$/gm,
          message: "Incomplete generic type",
          fix: (match, indent) => `${indent}Type<GenericType>;`,
          prevention: "Complete generic type parameter",
        },
      ],
    };
  }

  /**
   * Analyze code for potential errors
   */
  analyzeCode(code, filePath = "unknown") {
    const cacheKey = this.getCacheKey(code, filePath);

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const issues = [];
    const lines = code.split("\n");

    // Analyze each prevention rule category
    Object.entries(this.preventionRules).forEach(([category, rules]) => {
      rules.forEach((rule) => {
        let match;
        const regex = new RegExp(rule.pattern);

        while ((match = regex.exec(code)) !== null) {
          const lineNumber = this.getLineNumber(code, match.index);
          const lineContent = lines[lineNumber - 1] || "";

          issues.push({
            category,
            type: rule.message,
            line: lineNumber,
            column: match.index - code.lastIndexOf("\n", match.index) + 1,
            code: code.substr(match.index, match[0].length),
            lineContent: lineContent.trim(),
            prevention: rule.prevention,
            suggestedFix: rule.fix(match[0], match[1] || ""),
            severity: this.getSeverity(category),
            confidence: this.calculateConfidence(match[0], rule.pattern),
          });
        }
      });
    });

    const result = {
      filePath,
      totalLines: lines.length,
      issues: issues.sort((a, b) => a.line - b.line),
      summary: {
        totalIssues: issues.length,
        bySeverity: this.groupBySeverity(issues),
        byCategory: this.groupByCategory(issues),
        riskLevel: this.calculateRiskLevel(issues),
      },
    };

    this.analysisCache.set(cacheKey, result);
    return result;
  }

  /**
   * Analyze staged files for potential errors
   */
  async analyzeStagedFiles() {
    console.log("🔍 Analyzing staged files for potential errors...");

    try {
      const stagedFiles = execSync("git diff --cached --name-only", {
        cwd: this.projectRoot,
        encoding: "utf8",
      })
        .trim()
        .split("\n")
        .filter((f) => f.length > 0);

      const results = [];

      for (const file of stagedFiles) {
        if (this.isSupportedFile(file)) {
          const filePath = path.join(this.projectRoot, file);
          const content = fs.readFileSync(filePath, "utf8");
          const analysis = this.analyzeCode(content, file);
          results.push(analysis);
        }
      }

      return this.generateStagedAnalysisReport(results);
    } catch (error) {
      console.error("❌ Error analyzing staged files:", error.message);
      return { error: error.message };
    }
  }

  /**
   * Analyze file content directly
   */
  async analyzeFile(filePath) {
    try {
      const absolutePath = path.resolve(this.projectRoot, filePath);
      const content = fs.readFileSync(absolutePath, "utf8");
      return this.analyzeCode(content, filePath);
    } catch (error) {
      return { error: error.message, filePath };
    }
  }

  /**
   * Generate preventive suggestions
   */
  generateSuggestions(analysis) {
    const suggestions = [];

    analysis.issues.forEach((issue) => {
      suggestions.push({
        type: "prevention",
        message: issue.prevention,
        location: `${analysis.filePath}:${issue.line}:${issue.column}`,
        code: issue.code,
        suggestedFix: issue.suggestedFix,
        severity: issue.severity,
        confidence: issue.confidence,
      });
    });

    return suggestions;
  }

  /**
   * Check if file type is supported for analysis
   */
  isSupportedFile(filePath) {
    const supportedExtensions = [".ts", ".tsx", ".js", ".jsx"];
    const ext = path.extname(filePath);
    return supportedExtensions.includes(ext);
  }

  /**
   * Get line number from code index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split("\n").length;
  }

  /**
   * Get severity level for category
   */
  getSeverity(category) {
    const severityMap = {
      semicolonErrors: "high",
      identifierErrors: "critical",
      declarationErrors: "critical",
      variableDeclarationErrors: "high",
      destructuringErrors: "medium",
      keywordErrors: "high",
      tokenErrors: "high",
      importErrors: "high",
      typeErrors: "medium",
    };
    return severityMap[category] || "medium";
  }

  /**
   * Calculate confidence score for detection
   */
  calculateConfidence(code, pattern) {
    // Higher confidence for exact pattern matches
    // Lower confidence for generic patterns
    const specificityIndicators = [
      /\b(const|let|var|function|class|interface)\b/g, // Keywords
      /[{}[\]()]/g, // Brackets
      /[;,:]/g, // Punctuation
      /\s+/g, // Whitespace patterns
    ];

    let score = 0.5; // Base confidence

    specificityIndicators.forEach((indicator) => {
      if (indicator.test(code)) {
        score += 0.1;
      }
    });

    // Boost confidence for longer matches
    if (code.length > 20) score += 0.1;
    if (code.length > 50) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate overall risk level
   */
  calculateRiskLevel(issues) {
    const criticalCount = issues.filter(
      (i) => i.severity === "critical",
    ).length;
    const highCount = issues.filter((i) => i.severity === "high").length;

    if (criticalCount > 0) return "critical";
    if (highCount > 2) return "high";
    if (highCount > 0) return "medium";
    if (issues.length > 0) return "low";
    return "none";
  }

  /**
   * Group issues by severity
   */
  groupBySeverity(issues) {
    return issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group issues by category
   */
  groupByCategory(issues) {
    return issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Generate staged files analysis report
   */
  generateStagedAnalysisReport(results) {
    const allIssues = results.flatMap((r) => r.issues || []);
    const totalIssues = allIssues.length;

    return {
      summary: {
        filesAnalyzed: results.length,
        totalIssues,
        riskLevel: this.calculateRiskLevel(allIssues),
        bySeverity: this.groupBySeverity(allIssues),
        byCategory: this.groupByCategory(allIssues),
      },
      files: results,
      recommendations: this.generateStagedRecommendations(allIssues),
      prevention:
        totalIssues > 0
          ? "Address potential errors before committing"
          : "No issues detected - safe to commit",
    };
  }

  /**
   * Generate recommendations for staged files
   */
  generateStagedRecommendations(issues) {
    const recommendations = [];

    if (issues.length === 0) {
      recommendations.push({
        priority: "info",
        message: "✅ No potential errors detected in staged files",
      });
      return recommendations;
    }

    const criticalIssues = issues.filter((i) => i.severity === "critical");
    const highIssues = issues.filter((i) => i.severity === "high");

    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: "critical",
        message: `🚨 ${criticalIssues.length} critical issues detected - fix before committing`,
        issues: criticalIssues.slice(0, 5),
      });
    }

    if (highIssues.length > 0) {
      recommendations.push({
        priority: "high",
        message: `⚠️ ${highIssues.length} high-priority issues detected - review recommended`,
        issues: highIssues.slice(0, 5),
      });
    }

    recommendations.push({
      priority: "info",
      message: `💡 Run 'node src/scripts/quality-gates/error-prevention-middleware.js analyze-staged' for detailed analysis`,
    });

    return recommendations;
  }

  /**
   * Get cache key for analysis
   */
  getCacheKey(code, filePath) {
    const hash = this.simpleHash(code + filePath);
    return `${filePath}:${hash}`;
  }

  /**
   * Simple hash function for caching
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Real-time analysis for IDE integration
   */
  async analyzeRealtime(code, filePath) {
    const analysis = this.analyzeCode(code, filePath);
    return {
      diagnostics: analysis.issues.map((issue) => ({
        range: {
          start: { line: issue.line - 1, character: issue.column - 1 },
          end: {
            line: issue.line - 1,
            character: issue.column - 1 + issue.code.length,
          },
        },
        severity: this.mapSeverityToDiagnostic(issue.severity),
        source: "Error Prevention Middleware",
        message: `${issue.type} - ${issue.prevention}`,
        code: issue.category,
      })),
      summary: analysis.summary,
    };
  }

  /**
   * Map severity to diagnostic level
   */
  mapSeverityToDiagnostic(severity) {
    const mapping = {
      critical: 1, // Error
      high: 2, // Warning
      medium: 3, // Information
      low: 4, // Hint
    };
    return mapping[severity] || 3;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const middleware = new ErrorPreventionMiddleware();

  switch (command) {
    case "analyze-staged":
      const stagedResult = await middleware.analyzeStagedFiles();
      console.log("📊 Staged Files Analysis:");
      console.log("=".repeat(40));
      console.log(`Files Analyzed: ${stagedResult.summary.filesAnalyzed}`);
      console.log(`Total Issues: ${stagedResult.summary.totalIssues}`);
      console.log(
        `Risk Level: ${stagedResult.summary.riskLevel.toUpperCase()}`,
      );

      if (stagedResult.summary.bySeverity) {
        console.log("\nBy Severity:");
        Object.entries(stagedResult.summary.bySeverity).forEach(
          ([severity, count]) => {
            console.log(`  ${severity}: ${count}`);
          },
        );
      }

      console.log("\n💡 Recommendations:");
      stagedResult.recommendations.forEach((rec) => {
        console.log(`  ${rec.priority.toUpperCase()}: ${rec.message}`);
        if (rec.issues) {
          rec.issues.forEach((issue) => {
            console.log(`    • Line ${issue.line}: ${issue.type}`);
          });
        }
      });
      break;

    case "analyze-file":
      const filePath = args[1];
      if (!filePath) {
        console.log("❌ File path required");
        process.exit(1);
      }
      const fileResult = await middleware.analyzeFile(filePath);
      console.log("📄 File Analysis:", filePath);
      console.log("=".repeat(40));
      if (fileResult.error) {
        console.log("❌ Error:", fileResult.error);
      } else {
        console.log(`Lines: ${fileResult.totalLines}`);
        console.log(`Issues: ${fileResult.issues.length}`);
        fileResult.issues.forEach((issue) => {
          console.log(
            `  Line ${issue.line}: ${issue.type} (${issue.severity})`,
          );
          console.log(`    ${issue.prevention}`);
        });
      }
      break;

    case "realtime":
      // For IDE integration - expects code via stdin
      const stdin = process.stdin;
      let code = "";
      stdin.on("data", (chunk) => {
        code += chunk;
      });
      stdin.on("end", () => {
        const filePath = args[1] || "stdin";
        middleware.analyzeRealtime(code, filePath).then((result) => {
          console.log(JSON.stringify(result, null, 2));
        });
      });
      break;

    default:
      console.log(`
Error Prevention Middleware - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 8, 2025

Usage: node src/scripts/quality-gates/error-prevention-middleware.js <command> [args]

Commands:
  analyze-staged    - Analyze all staged files for potential errors
  analyze-file      - Analyze a specific file for potential errors
  realtime          - Real-time analysis for IDE integration (reads from stdin)

Examples:
  node src/scripts/quality-gates/error-prevention-middleware.js analyze-staged
  node src/scripts/quality-gates/error-prevention-middleware.js analyze-file src/utils/file.ts
  echo "const x =" | node src/scripts/quality-gates/error-prevention-middleware.js realtime

This middleware analyzes code patterns to prevent TypeScript errors before they occur,
providing real-time feedback and preventive suggestions.
      `);
  }
}

export default ErrorPreventionMiddleware;
