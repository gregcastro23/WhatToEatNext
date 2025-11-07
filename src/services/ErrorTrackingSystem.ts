import { _logger } from "@/lib/logger";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface TypeScriptError {
  code: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  category: string;
  timestamp: Date;
  resolved: boolean;
}

export interface LintingViolation {
  rule: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  fixable: boolean;
  timestamp: Date;
  resolved: boolean;
}

export interface BuildFailure {
  type: "typescript" | "webpack" | "next" | "eslint" | "test";
  message: string;
  stack?: string;
  file?: string;
  timestamp: Date;
  duration: number;
  resolved: boolean;
  rootCause?: string;
}

export interface ErrorTrend {
  errorType: string;
  count: number;
  trend: "increasing" | "decreasing" | "stable";
  changePercentage: number;
  timeframe: "1h" | "1d" | "1w" | "1m";
}

export interface ErrorPattern {
  pattern: string;
  frequency: number;
  files: string[];
  suggestedFix: string;
  automatable: boolean;
  priority: "low" | "medium" | "high" | "critical";
}

export interface QualityMetrics {
  totalErrors: number;
  totalWarnings: number;
  errorRate: number;
  warningRate: number;
  codeQualityScore: number;
  technicalDebtScore: number;
  maintainabilityIndex: number;
  timestamp: Date;
}

class ErrorTrackingSystem {
  private typeScriptErrors: TypeScriptError[] = [];
  private lintingViolations: LintingViolation[] = [];
  private buildFailures: BuildFailure[] = [];
  private errorPatterns: ErrorPattern[] = [];
  private qualityHistory: QualityMetrics[] = [];
  private readonly subscribers: Set<
    (
      data: TypeScriptError | LintingViolation | BuildFailure | QualityMetrics,
    ) => void
  > = new Set();
  // Error categorization mappings
  private readonly ERROR_CATEGORIES = {
    TS2304: "Missing Imports",
    TS2352: "Missing Imports",
    TS2345: "Type Mismatch",
    TS2322: "Type Assignment",
    TS2339: "Property Access",
    TS2698: "Spread Syntax",
    TS2362: "Assignment Error",
    TS2440: "Import Error",
    TS7053: "Index Signature",
    TS2571: "Union Type",
  };
  private readonly PRIORITY_MAPPING = {
    TS2304: "high",
    TS2352: "high",
    TS2345: "medium",
    TS2322: "medium",
    TS2339: "high",
    TS2698: "low",
    TS2362: "medium",
    TS2440: "critical",
    TS7053: "low",
    TS2571: "medium",
  };

  constructor() {
    this.loadHistoricalData();
    this.startPeriodicAnalysis();
  }

  private loadHistoricalData() {
    try {
      const dataPath = path.join(
        process.cwd(),
        ".kiro",
        "metrics",
        "error-tracking.json",
      );
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        this.typeScriptErrors = data.typeScriptErrors || [];
        this.lintingViolations = data.lintingViolations || [];
        this.buildFailures = data.buildFailures || [];
        this.errorPatterns = data.errorPatterns || [];
        this.qualityHistory = data.qualityHistory || [];
      }
    } catch (error) {
      _logger.warn(
        "[Error Tracking System] Failed to load historical data: ",
        error,
      );
    }
  }

  private saveHistoricalData() {
    try {
      const metricsDir = path.join(process.cwd(), ".kiro", "metrics");
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }

      const dataPath = path.join(metricsDir, "error-tracking.json");
      const data = {
        typeScriptErrors: this.typeScriptErrors.slice(-1000), // Keep last 1000 errors,
        lintingViolations: this.lintingViolations.slice(-1000), // Keep last 1000 violations,
        buildFailures: this.buildFailures.slice(-100), // Keep last 100 failures,
        errorPatterns: this.errorPatterns.slice(-50), // Keep last 50 patterns,
        qualityHistory: this.qualityHistory.slice(-200), // Keep last 200 quality snapshots
      };

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      _logger.error(
        "[Error Tracking System] Failed to save historical data: ",
        error,
      );
    }
  }

  private startPeriodicAnalysis() {
    // Analyze errors every 10 minutes
    setInterval(
      () => {
        this.analyzeCurrentErrors();
        this.detectErrorPatterns();
        this.updateQualityMetrics();
        this.saveHistoricalData();
        this.notifySubscribers();
      },
      10 * 60 * 1000,
    );
  }

  public async analyzeTypeScriptErrors(): Promise<TypeScriptError[]> {
    try {
      const result = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });

      // If no errors, clear existing errors
      this.markErrorsAsResolved("typescript");
      return [];
    } catch (error) {
      const output =
        (error as { stdout?: string; stderr?: string }).stdout ||
        (error as { stderr?: string }).stderr ||
        "";
      const errors = this.parseTypeScriptErrors(output);

      // Mark existing errors as resolved if they're not in the new set
      this.updateTypeScriptErrors(errors);
      return errors;
    }
  }

  private parseTypeScriptErrors(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = output.split("\n");
    for (const line of lines) {
      const errorMatch = line.match(
        /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/,
      );
      if (errorMatch) {
        const [, file, lineStr, columnStr, severity, code, message] =
          errorMatch;

        errors.push({
          code,
          message: message.trim(),
          file: file.trim(),
          line: parseInt(lineStr),
          column: parseInt(columnStr),
          severity: severity as "error" | "warning",
          category: this.ERROR_CATEGORIES[code] || "Other",
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    return errors;
  }

  private updateTypeScriptErrors(newErrors: TypeScriptError[]) {
    // Mark existing errors as resolved if they're not in the new set
    const newErrorKeys = new Set(
      newErrors.map((e) => `${e.file}:${e.line}:${e.column}:${e.code}`),
    );

    for (const existingError of this.typeScriptErrors) {
      const key = `${existingError.file}: ${existingError.line}:${existingError.column}:${existingError.code}`;
      if (!newErrorKeys.has(key) && !existingError.resolved) {
        existingError.resolved = true;
      }
    }

    // Add new errors
    for (const newError of newErrors) {
      const key = `${newError.file}: ${newError.line}:${newError.column}:${newError.code}`;
      const existingIndex = this.typeScriptErrors.findIndex(
        (e) =>
          `${e.file}:${e.line}:${e.column}:${e.code}` === key && !e.resolved,
      );

      if (existingIndex === -1) {
        this.typeScriptErrors.push(newError);
      }
    }
  }

  public async analyzeLintingViolations(): Promise<LintingViolation[]> {
    try {
      const result = execSync("yarn lint --format json", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const lintResults = JSON.parse(result);
      const violations = this.parseLintingResults(lintResults);

      this.updateLintingViolations(violations);
      return violations;
    } catch (error) {
      // ESLint returns non-zero exit code when violations are found
      const output = (error as { stdout?: string }).stdout || "";

      try {
        const lintResults = JSON.parse(output);
        const violations = this.parseLintingResults(lintResults);
        this.updateLintingViolations(violations);
        return violations;
      } catch (parseError) {
        _logger.error(
          "[Error Tracking] Failed to parse linting results: ",
          parseError,
        );
        return [];
      }
    }
  }

  private parseLintingResults(
    lintResults: Array<{
      filePath?: string;
      messages?: Array<{
        ruleId?: string;
        message?: string;
        line?: number;
        column?: number;
        severity?: number;
        fix?: unknown;
      }>;
    }>,
  ): LintingViolation[] {
    const violations: LintingViolation[] = [];

    for (const fileResult of lintResults) {
      const { filePath } = fileResult;

      for (const message of fileResult.messages) {
        violations.push({
          rule: message.ruleId || "unknown",
          message: (message.message as string) || "",
          file: (filePath as string) || "",
          line: message.line || 0,
          column: message.column || 0,
          severity: this.mapLintSeverity(message.severity as any),
          fixable: message.fix !== undefined,
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    return violations;
  }

  private mapLintSeverity(severity: number): "error" | "warning" | "info" {
    switch (severity) {
      case 2:
        return "error";
      case 1:
        return "warning";
      default:
        return "info";
    }
  }

  private updateLintingViolations(newViolations: LintingViolation[]) {
    // Mark existing violations as resolved if they're not in the new set
    const newViolationKeys = new Set(
      newViolations.map((v) => `${v.file}:${v.line}:${v.column}:${v.rule}`),
    );

    for (const existingViolation of this.lintingViolations) {
      const key = `${existingViolation.file}: ${existingViolation.line}:${existingViolation.column}:${existingViolation.rule}`;
      if (!newViolationKeys.has(key) && !existingViolation.resolved) {
        existingViolation.resolved = true;
      }
    }

    // Add new violations
    for (const newViolation of newViolations) {
      const key = `${newViolation.file}: ${newViolation.line}:${newViolation.column}:${newViolation.rule}`;
      const existingIndex = this.lintingViolations.findIndex(
        (v) =>
          `${v.file}:${v.line}:${v.column}:${v.rule}` === key && !v.resolved,
      );

      if (existingIndex === -1) {
        this.lintingViolations.push(newViolation);
      }
    }
  }

  public recordBuildFailure(failure: Omit<BuildFailure, "timestamp">): void {
    const buildFailure: BuildFailure = {
      ...failure,
      timestamp: new Date(),
    };

    this.buildFailures.push(buildFailure);

    // Analyze root cause
    buildFailure.rootCause = this.analyzeRootCause(buildFailure);
    _logger.error("[Build Failure]", buildFailure);
  }

  private analyzeRootCause(failure: BuildFailure): string {
    const message = failure.message.toLowerCase();
    const stack = (failure.stack || "").toLowerCase();
    // Common root cause patterns
    if (
      message.includes("cannot find module") ||
      message.includes("module not found")
    ) {
      return "Missing dependency or incorrect import path";
    }
    if (message.includes("typescript") && message.includes("error")) {
      return "TypeScript compilation errors";
    }
    if (
      message.includes("syntax error") ||
      message.includes("unexpected token")
    ) {
      return "JavaScript/TypeScript syntax error";
    }
    if (message.includes("memory") || message.includes("heap")) {
      return "Memory allocation issue";
    }
    if (message.includes("timeout") || message.includes("timed out")) {
      return "Build process timeout";
    }
    if (stack.includes("eslint") || message.includes("linting")) {
      return "ESLint configuration or rule violation";
    }
    return "Unknown build issue - requires manual investigation";
  }

  private analyzeCurrentErrors() {
    // Analyze TypeScript errors
    this.analyzeTypeScriptErrors().catch((error) => {
      _logger.error(
        "[Error Tracking] Failed to analyze TypeScript errors: ",
        error,
      );
    });

    // Analyze linting violations
    this.analyzeLintingViolations().catch((error) => {
      _logger.error(
        "[Error Tracking] Failed to analyze linting violations: ",
        error,
      );
    });
  }

  private detectErrorPatterns() {
    const patterns: Map<string, ErrorPattern> = new Map();

    // Analyze TypeScript error patterns
    const activeTypeScriptErrors = this.typeScriptErrors.filter(
      (e) => !e.resolved,
    );
    for (const error of activeTypeScriptErrors) {
      const patternKey = `TS: ${error.code}`;

      if (patterns.has(patternKey)) {
        const pattern = patterns.get(patternKey);
        if (pattern) {
          pattern.frequency++;
          if (!pattern.files.includes(error.file)) {
            pattern.files.push(error.file);
          }
        }
      } else {
        patterns.set(patternKey, {
          pattern: `TypeScript ${error.code}: ${error.category}`,
          frequency: 1,
          files: [error.file],
          suggestedFix: this.getSuggestedFix(error.code),
          automatable: this.isAutomatable(error.code),
          priority: this.PRIORITY_MAPPING[error.code] || "medium",
        });
      }
    }

    // Analyze linting violation patterns
    const activeLintingViolations = this.lintingViolations.filter(
      (v) => !v.resolved,
    );
    for (const violation of activeLintingViolations) {
      const patternKey = `LINT: ${violation.rule}`;

      if (patterns.has(patternKey)) {
        const pattern = patterns.get(patternKey);
        if (pattern) {
          pattern.frequency++;
          if (!pattern.files.includes(violation.file)) {
            pattern.files.push(violation.file);
          }
        }
      } else {
        patterns.set(patternKey, {
          pattern: `ESLint ${violation.rule}`,
          frequency: 1,
          files: [violation.file],
          suggestedFix: this.getLintingSuggestedFix(violation.rule),
          automatable: violation.fixable,
          priority: violation.severity === "error" ? "high" : "medium",
        });
      }
    }

    // Sort patterns by frequency and priority
    this.errorPatterns = Array.from(patterns.values()).sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.frequency - a.frequency;
    });
  }

  private getSuggestedFix(errorCode: string): string {
    const fixes = {
      TS2304: "Add missing import statement or install required dependency",
      TS2352: "Add missing import statement or check variable declaration",
      TS2345: "Check argument types and function signature compatibility",
      TS2322: "Verify type compatibility or add type assertion",
      TS2339: "Check property name spelling or add property to type definition",
      TS2698: "Fix spread syntax usage or add proper type annotations",
      TS2362: "Check assignment target and ensure it's not readonly",
      TS2440: "Fix import statement syntax or check module resolution",
      TS7053: "Add index signature to type or use bracket notation",
      TS2571: "Narrow union type or add type guards",
    };
    return (
      fixes[errorCode] || "Review error message and TypeScript documentation"
    );
  }

  private getLintingSuggestedFix(rule: string): string {
    const fixes = {
      "@typescript-eslint/no-unused-vars":
        "Remove unused variables or prefix with underscore",
      "@typescript-eslint/no-explicit-any":
        "Replace any with specific type annotations",
      "react-hooks/exhaustive-deps":
        "Add missing dependencies to useEffect dependency array",
      "prefer-const":
        "Use const instead of let for variables that are not reassigned",
      "no-console": "Remove console statements or use proper logging",
      "@typescript-eslint/no-non-null-assertion":
        "Add null checks or use optional chaining",
      "react/no-unescaped-entities": "Escape HTML entities in JSX text",
      "@typescript-eslint/ban-ts-comment":
        "Remove @ts-ignore comments and fix underlying issues",
    };
    return fixes[rule] || "Review ESLint rule documentation for fix guidance";
  }

  private isAutomatable(errorCode: string): boolean {
    const automatableErrors = [
      "TS2304", // Often fixable with imports
      "TS2352", // Often fixable with imports
      "TS2698", // Spread syntax issues
      "TS7053", // Index signature issues
    ];

    return automatableErrors.includes(errorCode);
  }

  private updateQualityMetrics() {
    const activeErrors = this.typeScriptErrors.filter((e) => !e.resolved);
    const activeWarnings = this.lintingViolations.filter(
      (v) => !v.resolved && v.severity === "warning",
    );
    const activeLintErrors = this.lintingViolations.filter(
      (v) => !v.resolved && v.severity === "error",
    );

    const totalFiles = this.getTotalFileCount();
    const errorRate =
      totalFiles > 0
        ? (activeErrors.length + activeLintErrors.length) / totalFiles
        : 0;
    const warningRate = totalFiles > 0 ? activeWarnings.length / totalFiles : 0;

    const codeQualityScore = this.calculateCodeQualityScore(
      activeErrors,
      activeWarnings,
      activeLintErrors,
    );
    const technicalDebtScore = this.calculateTechnicalDebtScore();
    const maintainabilityIndex = this.calculateMaintainabilityIndex();

    const metrics: QualityMetrics = {
      totalErrors: activeErrors.length + activeLintErrors.length,
      totalWarnings: activeWarnings.length,
      errorRate,
      warningRate,
      codeQualityScore,
      technicalDebtScore,
      maintainabilityIndex,
      timestamp: new Date(),
    };

    this.qualityHistory.push(metrics);
  }

  private getTotalFileCount(): number {
    try {
      const result = execSync(
        'find src -name "*.ts" -o -name "*.tsx" | wc -l',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private calculateCodeQualityScore(
    errors: TypeScriptError[],
    warnings: LintingViolation[],
    lintErrors: LintingViolation[],
  ): number {
    let score = 100;

    // Deduct for errors (more severe);
    score -= Math.min(50, (errors.length + lintErrors.length) * 2);

    // Deduct for warnings (less severe)
    score -= Math.min(30, ((warnings as any)?.length || 0) * 0.2);

    // Bonus for resolved issues
    const recentlyResolved = this.typeScriptErrors.filter(
      (e) =>
        e.resolved && Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000,
    ).length;
    score += Math.min(10, recentlyResolved);

    return Math.max(0, Math.min(100, score));
  }

  private calculateTechnicalDebtScore(): number {
    let debtScore = 0;

    // High-priority errors contribute more to technical debt
    const highPriorityPatterns = this.errorPatterns.filter(
      (p) => p.priority === "high" || p.priority === "critical",
    );
    debtScore += highPriorityPatterns.reduce(
      (sum, p) => sum + p.frequency * 20,
      0,
    );
    // Long-standing errors contribute to debt
    const oldErrors = this.typeScriptErrors.filter(
      (e) =>
        !e.resolved &&
        Date.now() - e.timestamp.getTime() > 7 * 24 * 60 * 60 * 1000,
    );
    debtScore += oldErrors.length * 3;

    // Build failures contribute to debt
    const recentFailures = this.buildFailures.filter(
      (f) =>
        !f.resolved && Date.now() - f.timestamp.getTime() < 24 * 60 * 60 * 1000,
    );
    debtScore += recentFailures.length * 5;

    return Math.min(100, debtScore);
  }

  private calculateMaintainabilityIndex(): number {
    // Simplified maintainability calculation based on error patterns and trends
    let index = 100;

    // Reduce for error complexity
    const complexPatterns = this.errorPatterns.filter(
      (p) => p.files.length > 5,
    );
    index -= complexPatterns.length * 5;

    // Reduce for error frequency
    const frequentPatterns = this.errorPatterns.filter((p) => p.frequency > 10);
    index -= frequentPatterns.length * 3;

    // Improve for automation potential
    const automatablePatterns = this.errorPatterns.filter((p) => p.automatable);
    index += automatablePatterns.length * 2;
    return Math.max(0, Math.min(100, index));
  }

  private markErrorsAsResolved(type: "typescript" | "linting") {
    if (type === "typescript") {
      for (const error of this.typeScriptErrors) {
        if (!error.resolved) {
          error.resolved = true;
        }
      }
    } else if (type === "linting") {
      for (const violation of this.lintingViolations) {
        if (!violation.resolved) {
          violation.resolved = true;
        }
      }
    }
  }

  private notifySubscribers() {
    const data = {
      typeScriptErrors: this.typeScriptErrors
        .filter((e) => !e.resolved)
        .slice(-50),
      lintingViolations: this.lintingViolations
        .filter((v) => !v.resolved)
        .slice(-50),
      buildFailures: this.buildFailures.filter((f) => !f.resolved).slice(-10),
      errorPatterns: this.errorPatterns.slice(-20),
      qualityMetrics: this.qualityHistory.slice(-1)[0],
      trends: this.calculateErrorTrends(),
      summary: this.getErrorSummary(),
    };

    this.subscribers.forEach((callback) => {
      try {
        callback(data as any);
      } catch (error) {
        _logger.error("[Error Tracking System] Subscriber error: ", error);
      }
    });
  }

  private calculateErrorTrends(): ErrorTrend[] {
    const trends: ErrorTrend[] = [];
    const timeframes = ["1h", "1d", "1w"] as const;

    for (const timeframe of timeframes) {
      const cutoffTime = this.getTimeframeCutoff(timeframe);

      // TypeScript error trends
      const recentTSErrors = this.typeScriptErrors.filter(
        (e) => e.timestamp >= cutoffTime,
      );
      const olderTSErrors = this.typeScriptErrors.filter(
        (e) =>
          e.timestamp < cutoffTime &&
          e.timestamp >=
            new Date(cutoffTime.getTime() - this.getTimeframeMs(timeframe)),
      );

      if (olderTSErrors.length > 0) {
        const changePercentage =
          ((recentTSErrors.length - olderTSErrors.length) /
            olderTSErrors.length) *
          100;
        trends.push({
          errorType: "TypeScript Errors",
          count: recentTSErrors.length,
          trend:
            changePercentage > 10
              ? "increasing"
              : changePercentage < -10
                ? "decreasing"
                : "stable",
          changePercentage,
          timeframe,
        });
      }

      // Linting violation trends
      const recentLintViolations = this.lintingViolations.filter(
        (v) => v.timestamp >= cutoffTime,
      );
      const olderLintViolations = this.lintingViolations.filter(
        (v) =>
          v.timestamp < cutoffTime &&
          v.timestamp >=
            new Date(cutoffTime.getTime() - this.getTimeframeMs(timeframe)),
      );

      if (olderLintViolations.length > 0) {
        const changePercentage =
          ((recentLintViolations.length - olderLintViolations.length) /
            olderLintViolations.length) *
          100;
        trends.push({
          errorType: "Linting Violations",
          count: recentLintViolations.length,
          trend:
            changePercentage > 10
              ? "increasing"
              : changePercentage < -10
                ? "decreasing"
                : "stable",
          changePercentage,
          timeframe,
        });
      }
    }

    return trends;
  }

  private getTimeframeCutoff(timeframe: "1h" | "1d" | "1w" | "1m"): Date {
    const now = new Date();
    switch (timeframe) {
      case "1h":
        return new Date(now.getTime() - 60 * 60 * 1000);
      case "1d":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "1w":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "1m":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getTimeframeMs(timeframe: "1h" | "1d" | "1w" | "1m"): number {
    switch (timeframe) {
      case "1h":
        return 60 * 60 * 1000;
      case "1d":
        return 24 * 60 * 60 * 1000;
      case "1w":
        return 7 * 24 * 60 * 60 * 1000;
      case "1m":
        return 30 * 24 * 60 * 60 * 1000;
    }
  }

  // Public API methods
  public subscribe(
    callback: (
      data: TypeScriptError | LintingViolation | BuildFailure | QualityMetrics,
    ) => void,
  ) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public getActiveErrors(): TypeScriptError[] {
    return this.typeScriptErrors.filter((e) => !e.resolved);
  }

  public getActiveLintingViolations(): LintingViolation[] {
    return this.lintingViolations.filter((v) => !v.resolved);
  }

  public getRecentBuildFailures(): BuildFailure[] {
    return this.buildFailures.filter((f) => !f.resolved);
  }

  public getErrorPatterns(): ErrorPattern[] {
    return this.errorPatterns;
  }

  public getCurrentQualityMetrics(): QualityMetrics | undefined {
    return this.qualityHistory.slice(-1)[0];
  }

  public getQualityHistory(limit = 50): QualityMetrics[] {
    return this.qualityHistory.slice(-limit);
  }

  public getErrorSummary() {
    const activeErrors = this.getActiveErrors();
    const activeLintViolations = this.getActiveLintingViolations();
    const recentFailures = this.getRecentBuildFailures();
    const currentMetrics = this.getCurrentQualityMetrics();

    return {
      totalActiveErrors: activeErrors.length,
      totalActiveLintViolations: activeLintViolations.length,
      totalRecentFailures: recentFailures.length,
      topErrorCategories: this.getTopErrorCategories(activeErrors),
      topLintRules: this.getTopLintRules(activeLintViolations),
      codeQualityScore: currentMetrics?.codeQualityScore || 0,
      technicalDebtScore: currentMetrics?.technicalDebtScore || 0,
      maintainabilityIndex: currentMetrics?.maintainabilityIndex || 0,
      automationOpportunities: this.errorPatterns.filter((p) => p.automatable)
        .length,
      criticalIssues: this.errorPatterns.filter(
        (p) => p.priority === "critical",
      ).length,
    };
  }

  private getTopErrorCategories(
    errors: TypeScriptError[],
  ): Array<{ category: string; count: number }> {
    const categories = new Map<string, number>();

    for (const error of errors) {
      categories.set(error.category, (categories.get(error.category) || 0) + 1);
    }

    return Array.from(categories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopLintRules(
    violations: LintingViolation[],
  ): Array<{ rule: string; count: number }> {
    const rules = new Map<string, number>();

    for (const violation of violations) {
      rules.set(violation.rule, (rules.get(violation.rule) || 0) + 1);
    }

    return Array.from(rules.entries())
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  public reset() {
    this.typeScriptErrors = [];
    this.lintingViolations = [];
    this.buildFailures = [];
    this.errorPatterns = [];
    this.qualityHistory = [];
    this.saveHistoricalData();
  }
}

export const _errorTrackingSystem = new ErrorTrackingSystem();
export default ErrorTrackingSystem;
