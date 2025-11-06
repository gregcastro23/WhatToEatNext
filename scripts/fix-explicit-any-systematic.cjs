#!/usr/bin/env node

/**
 * Systematic Explicit-Any Type Elimination Script
 *
 * This script systematically replaces explicit 'any' types with proper TypeScript types:
 * - Analyzes usage patterns to determine appropriate types
 * - Creates domain-specific type interfaces for service layers
 * - Preserves necessary any types in astronomical integrations
 * - Targets 50% reduction in explicit-any usage
 * - Uses proven automated fix patterns from previous campaigns
 *
 * Phase 9.3 of Linting Excellence Campaign
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ExplicitAnyEliminator {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
    this.dryRun = process.argv.includes("--dry-run");
    this.verbose = process.argv.includes("--verbose");
    this.preserveAstronomical = true; // Always preserve astronomical integrations
    this.targetReduction = 0.5; // 50% reduction target
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async analyzeExplicitAnyUsage() {
    this.log("🔍 Analyzing explicit-any usage patterns...");

    try {
      const eslintOutput = execSync(
        'npx eslint src --format=json --rule "@typescript-eslint/no-explicit-any: error" 2>/dev/null || echo "[]"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      let results = [];
      try {
        results = JSON.parse(eslintOutput);
      } catch (error) {
        // Fallback to text parsing
        const textOutput = execSync(
          'npx eslint src --format=compact 2>/dev/null | grep "no-explicit-any" || true',
          {
            encoding: "utf8",
            stdio: "pipe",
          },
        );

        const lines = textOutput
          .split("\n")
          .filter((line) => line.includes("no-explicit-any"));
        results = lines
          .map((line) => {
            const match = line.match(/^([^:]+):(\d+):(\d+):/);
            return match
              ? {
                  filePath: match[1],
                  line: parseInt(match[2]),
                  column: parseInt(match[3]),
                  message: line,
                }
              : null;
          })
          .filter(Boolean);
      }

      const analysis = {
        totalIssues: 0,
        fileBreakdown: {},
        patterns: {
          functionParameters: 0,
          returnTypes: 0,
          variableDeclarations: 0,
          propertyTypes: 0,
          arrayTypes: 0,
          objectTypes: 0,
        },
      };

      if (Array.isArray(results)) {
        results.forEach((result) => {
          if (result.messages) {
            result.messages.forEach((message) => {
              if (message.ruleId === "@typescript-eslint/no-explicit-any") {
                analysis.totalIssues++;
                const filePath = result.filePath;
                analysis.fileBreakdown[filePath] =
                  (analysis.fileBreakdown[filePath] || 0) + 1;
              }
            });
          } else if (result.message) {
            analysis.totalIssues++;
            analysis.fileBreakdown[result.filePath] =
              (analysis.fileBreakdown[result.filePath] || 0) + 1;
          }
        });
      }

      this.log(
        `Found ${analysis.totalIssues} explicit-any issues across ${Object.keys(analysis.fileBreakdown).length} files`,
      );
      return analysis;
    } catch (error) {
      this.log(`Error analyzing explicit-any usage: ${error.message}`, "error");
      return { totalIssues: 0, fileBreakdown: {}, patterns: {} };
    }
  }

  shouldPreserveAnyInFile(filePath) {
    // Preserve any types in astronomical integrations
    const astronomicalPatterns = [
      "astronomy",
      "ephemeris",
      "planetary",
      "celestial",
      "astrological",
      "swiss-ephemeris",
      "astronomia",
    ];

    const fileName = path.basename(filePath).toLowerCase();
    const dirPath = path.dirname(filePath).toLowerCase();

    return astronomicalPatterns.some(
      (pattern) => fileName.includes(pattern) || dirPath.includes(pattern),
    );
  }

  createDomainSpecificTypes(content, filePath) {
    let newContent = content;
    const addedTypes = [];

    // Service layer types
    if (filePath.includes("services/")) {
      const serviceTypes = `
// Domain-specific service types
interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface ServiceConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  [key: string]: unknown;
}

interface ServiceContext {
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  [key: string]: unknown;
}
`;

      // Add types at the top of the file if not already present
      if (
        !newContent.includes("ServiceResponse") &&
        newContent.includes(": any")
      ) {
        const importIndex = newContent.lastIndexOf("import ");
        const insertIndex =
          importIndex > -1 ? newContent.indexOf("\n", importIndex) + 1 : 0;

        newContent =
          newContent.slice(0, insertIndex) +
          serviceTypes +
          newContent.slice(insertIndex);
        addedTypes.push("ServiceResponse", "ServiceConfig", "ServiceContext");
      }
    }

    // Component types
    if (filePath.includes("components/") && filePath.includes(".tsx")) {
      const componentTypes = `
// Domain-specific component types
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface EventHandlerProps {
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent) => void;
  [key: string]: unknown;
}
`;

      if (
        !newContent.includes("ComponentProps") &&
        newContent.includes(": any")
      ) {
        const importIndex = newContent.lastIndexOf("import ");
        const insertIndex =
          importIndex > -1 ? newContent.indexOf("\n", importIndex) + 1 : 0;

        newContent =
          newContent.slice(0, insertIndex) +
          componentTypes +
          newContent.slice(insertIndex);
        addedTypes.push("ComponentProps", "EventHandlerProps");
      }
    }

    return { content: newContent, addedTypes };
  }

  fixExplicitAnyTypes(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // Skip if this file should preserve astronomical any types
    if (this.shouldPreserveAnyInFile(filePath)) {
      if (this.verbose) {
        this.log(
          `  Preserving astronomical any types in ${path.basename(filePath)}`,
        );
      }
      return { content: newContent, fixed: false, appliedFixes: [] };
    }

    // Common any type replacements
    const anyReplacements = [
      // Function parameters
      {
        from: /\(([^)]*): any\)/g,
        to: "($1: unknown)",
        description: "Function parameters any → unknown",
        validate: (match) =>
          !match[0].includes("astronomia") && !match[0].includes("ephemeris"),
      },

      // Variable declarations
      {
        from: /: any(\s*=)/g,
        to: ": unknown$1",
        description: "Variable declarations any → unknown",
      },

      // Array types
      {
        from: /: any\[\]/g,
        to: ": unknown[]",
        description: "Array types any[] → unknown[]",
      },

      // Object property types
      {
        from: /:\s*any;/g,
        to: ": unknown;",
        description: "Object properties any → unknown",
      },

      // Generic constraints
      {
        from: /<([^>]*): any>/g,
        to: "<$1: unknown>",
        description: "Generic constraints any → unknown",
      },

      // Return types
      {
        from: /\):\s*any\s*{/g,
        to: "): unknown {",
        description: "Return types any → unknown",
      },

      // Promise types
      {
        from: /Promise<any>/g,
        to: "Promise<unknown>",
        description: "Promise<any> → Promise<unknown>",
      },

      // Record types
      {
        from: /Record<string,\s*any>/g,
        to: "Record<string, unknown>",
        description: "Record<string, any> → Record<string, unknown>",
      },
    ];

    // Apply replacements
    anyReplacements.forEach((replacement) => {
      const matches = [...newContent.matchAll(replacement.from)];
      if (matches.length > 0) {
        const validMatches = replacement.validate
          ? matches.filter((match) => replacement.validate(match))
          : matches;

        if (validMatches.length > 0) {
          newContent = newContent.replace(replacement.from, replacement.to);
          fixed = true;
          appliedFixes.push(
            `${replacement.description} (${validMatches.length} occurrences)`,
          );
        }
      }
    });

    // Context-specific replacements
    if (filePath.includes("test") || filePath.includes("spec")) {
      // Test-specific any replacements
      const testReplacements = [
        {
          from: /jest\.fn\(\):\s*any/g,
          to: "jest.fn(): jest.MockedFunction<any>",
          description: "Jest mock function types",
        },
        {
          from: /expect\(([^)]+)\)\.toEqual\(([^)]+): any\)/g,
          to: "expect($1).toEqual($2 as unknown)",
          description: "Test assertion types",
        },
      ];

      testReplacements.forEach((replacement) => {
        if (replacement.from.test(newContent)) {
          newContent = newContent.replace(replacement.from, replacement.to);
          fixed = true;
          appliedFixes.push(replacement.description);
        }
      });
    }

    if (this.verbose && appliedFixes.length > 0) {
      this.log(
        `  Fixed in ${path.basename(filePath)}: ${appliedFixes.join(", ")}`,
      );
    }

    return { content: newContent, fixed, appliedFixes };
  }

  fixSpecificPatterns(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // API response patterns
    const apiPatterns = [
      {
        from: /response\.data:\s*any/g,
        to: "response.data: unknown",
        description: "API response data types",
      },
      {
        from: /axios\.get<any>/g,
        to: "axios.get<unknown>",
        description: "Axios generic types",
      },
      {
        from: /fetch\([^)]+\)\.then\(([^)]+): any\)/g,
        to: "fetch($1).then($1: Response)",
        description: "Fetch response types",
      },
    ];

    // Event handler patterns
    const eventPatterns = [
      {
        from: /event:\s*any/g,
        to: "event: Event",
        description: "Event handler types",
      },
      {
        from: /onChange=\{([^}]+): any\}/g,
        to: "onChange={$1: React.ChangeEvent<HTMLInputElement>}",
        description: "React event handler types",
      },
    ];

    // Configuration object patterns
    const configPatterns = [
      {
        from: /config:\s*any/g,
        to: "config: Record<string, unknown>",
        description: "Configuration object types",
      },
      {
        from: /options:\s*any/g,
        to: "options: Record<string, unknown>",
        description: "Options object types",
      },
    ];

    const allPatterns = [...apiPatterns, ...eventPatterns, ...configPatterns];

    allPatterns.forEach((pattern) => {
      if (pattern.from.test(newContent)) {
        newContent = newContent.replace(pattern.from, pattern.to);
        fixed = true;
        appliedFixes.push(pattern.description);
      }
    });

    if (this.verbose && appliedFixes.length > 0) {
      this.log(
        `  Fixed patterns in ${path.basename(filePath)}: ${appliedFixes.join(", ")}`,
      );
    }

    return { content: newContent, fixed, appliedFixes };
  }

  async fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, "utf8");
      let currentContent = originalContent;
      let totalFixed = false;
      const allFixes = [];

      // Create domain-specific types first
      const typeResult = this.createDomainSpecificTypes(
        currentContent,
        filePath,
      );
      if (typeResult.addedTypes.length > 0) {
        currentContent = typeResult.content;
        totalFixed = true;
        allFixes.push(
          `Added domain types: ${typeResult.addedTypes.join(", ")}`,
        );
      }

      // Apply all fixes
      const fixes = [
        this.fixExplicitAnyTypes(currentContent, filePath),
        this.fixSpecificPatterns(currentContent, filePath),
      ];

      // Chain the fixes
      for (const fix of fixes) {
        if (fix.fixed) {
          currentContent = fix.content;
          totalFixed = true;
          allFixes.push(...fix.appliedFixes);
        }
      }

      if (totalFixed) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, currentContent, "utf8");
        }

        this.fixedFiles.push({
          path: filePath,
          fixes: allFixes,
        });

        this.log(
          `${this.dryRun ? "[DRY RUN] " : ""}Fixed explicit-any types in ${path.basename(filePath)}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, "error");
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  async validateFixes() {
    this.log("🔍 Validating fixes with ESLint...");

    try {
      const eslintOutput = execSync(
        'npx eslint src --format=compact 2>/dev/null | grep "no-explicit-any" | wc -l || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const remainingAnyIssues = parseInt(eslintOutput.trim()) || 0;

      this.log(
        `Validation: ${remainingAnyIssues} explicit-any issues remaining`,
      );

      return { remainingAnyIssues };
    } catch (error) {
      this.log(`Validation error: ${error.message}`, "error");
      return { remainingAnyIssues: -1 };
    }
  }

  async createTypeDefinitionFiles() {
    this.log("📝 Creating domain-specific type definition files...");

    // Service layer types
    const serviceTypes = `/**
 * Domain-specific service layer types
 * Generated by explicit-any elimination script
 */

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  [key: string]: unknown;
}

export interface ServiceContext {
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export interface APIResponse<T = unknown> {
  status: number;
  data: T;
  headers?: Record<string, string>;
  error?: string;
}

export interface DatabaseRecord {
  id: string | number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
`;

    // Component types
    const componentTypes = `/**
 * Domain-specific component types
 * Generated by explicit-any elimination script
 */

import { ReactNode, MouseEvent, ChangeEvent, FormEvent } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface EventHandlerProps {
  onClick?: (event: MouseEvent) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: FormEvent) => void;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface LoadingProps {
  isLoading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}
`;

    // Astrological types (preserve any where needed)
    const astrologicalTypes = `/**
 * Astrological calculation types
 * Preserves necessary any types for astronomical integrations
 */

export interface PlanetaryPosition {
  planet: string;
  longitude: number;
  latitude: number;
  distance: number;
  // Preserve any for astronomical library compatibility
  rawData?: any;
}

export interface AstronomicalCalculation {
  date: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  // Preserve any for Swiss Ephemeris integration
  ephemerisData?: any;
}

export interface ElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface CulinaryRecommendation {
  ingredients: string[];
  cookingMethod: string;
  timing: string;
  elementalBalance: ElementalProperties;
}
`;

    const typeFiles = [
      { path: "src/types/serviceTypes.ts", content: serviceTypes },
      { path: "src/types/componentTypes.ts", content: componentTypes },
      { path: "src/types/astrologicalTypes.ts", content: astrologicalTypes },
    ];

    const createdFiles = [];
    for (const typeFile of typeFiles) {
      if (!this.dryRun) {
        // Ensure directory exists
        const dir = path.dirname(typeFile.path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Only create if file doesn't exist
        if (!fs.existsSync(typeFile.path)) {
          fs.writeFileSync(typeFile.path, typeFile.content, "utf8");
          createdFiles.push(typeFile.path);
        }
      } else {
        createdFiles.push(typeFile.path);
      }
    }

    if (createdFiles.length > 0) {
      this.log(
        `${this.dryRun ? "[DRY RUN] " : ""}Created type definition files: ${createdFiles.join(", ")}`,
      );
    }

    return createdFiles;
  }

  async run() {
    this.log(
      "🚀 Starting Systematic Explicit-Any Type Elimination (Phase 9.3)",
    );
    this.log(`Mode: ${this.dryRun ? "DRY RUN" : "LIVE EXECUTION"}`);
    this.log(
      `Target: ${this.targetReduction * 100}% reduction in explicit-any usage`,
    );

    // Analyze current usage
    const analysis = await this.analyzeExplicitAnyUsage();
    const initialCount = analysis.totalIssues;

    if (initialCount === 0) {
      this.log("✅ No explicit-any issues found!");
      return;
    }

    // Get files to process (prioritize high-impact files)
    const filesToProcess = Object.keys(analysis.fileBreakdown)
      .sort((a, b) => analysis.fileBreakdown[b] - analysis.fileBreakdown[a])
      .slice(0, Math.ceil(Object.keys(analysis.fileBreakdown).length * 0.7)); // Process top 70% of files

    this.log(
      `🔧 Processing ${filesToProcess.length} files with highest any usage...`,
    );
    let fixedCount = 0;

    for (const filePath of filesToProcess) {
      if (fs.existsSync(filePath)) {
        const wasFixed = await this.fixFile(filePath);
        if (wasFixed) fixedCount++;
      }
    }

    // Create type definition files
    await this.createTypeDefinitionFiles();

    // Validate fixes
    const validation = await this.validateFixes();
    const finalCount =
      validation.remainingAnyIssues >= 0
        ? validation.remainingAnyIssues
        : initialCount;
    const reduction =
      initialCount > 0 ? (initialCount - finalCount) / initialCount : 0;

    // Report results
    this.log("\\n📊 Fix Summary:");
    this.log(`   Initial explicit-any issues: ${initialCount}`);
    this.log(`   Files processed: ${filesToProcess.length}`);
    this.log(`   Files fixed: ${fixedCount}`);
    this.log(`   Errors encountered: ${this.errors.length}`);

    if (validation.remainingAnyIssues >= 0) {
      this.log(`   Remaining explicit-any issues: ${finalCount}`);
      this.log(`   Reduction achieved: ${(reduction * 100).toFixed(1)}%`);
      this.log(`   Target reduction: ${this.targetReduction * 100}%`);

      if (reduction >= this.targetReduction) {
        this.log("🎯 Target reduction achieved!");
      } else {
        this.log(
          `⚠️  Target not yet reached (${((this.targetReduction - reduction) * 100).toFixed(1)}% remaining)`,
        );
      }
    }

    if (this.fixedFiles.length > 0) {
      this.log("\\n✅ Fixed files:");
      this.fixedFiles.slice(0, 10).forEach((file) => {
        this.log(`   ${file.path}`);
        if (this.verbose && file.fixes.length > 0) {
          file.fixes.forEach((fix) => this.log(`     - ${fix}`));
        }
      });

      if (this.fixedFiles.length > 10) {
        this.log(`   ... and ${this.fixedFiles.length - 10} more files`);
      }
    }

    if (this.errors.length > 0) {
      this.log("\\n❌ Errors encountered:");
      this.errors.forEach((error) => {
        this.log(`   ${error.file}: ${error.error}`);
      });
    }

    this.log(
      `\\n${this.dryRun ? "🔍 DRY RUN COMPLETE" : "✅ EXPLICIT-ANY TYPE ELIMINATION COMPLETE"}`,
    );

    if (!this.dryRun && reduction >= this.targetReduction) {
      this.log("🎉 Target explicit-any reduction achieved!");
    }
  }
}

// Run the eliminator
if (require.main === module) {
  const eliminator = new ExplicitAnyEliminator();
  eliminator.run().catch((error) => {
    console.error("❌ Critical error:", error);
    process.exit(1);
  });
}

module.exports = ExplicitAnyEliminator;
