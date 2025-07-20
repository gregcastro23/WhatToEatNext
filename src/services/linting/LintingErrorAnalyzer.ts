/**
 * LintingErrorAnalyzer - Automated linting error analysis and categorization system
 * 
 * This class implements comprehensive error analysis, categorization, and resolution
 * strategy generation for ESLint issues across the WhatToEatNext codebase.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Core interfaces for error analysis
export interface LintingIssue {
  id: string;
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
  category: IssueCategory;
  autoFixable: boolean;
  domainContext?: DomainContext;
  resolutionStrategy: ResolutionStrategy;
}

export interface IssueCategory {
  primary: 'import' | 'typescript' | 'react' | 'style' | 'domain';
  secondary: string;
  priority: 1 | 2 | 3 | 4;
}

export interface DomainContext {
  isAstrologicalCalculation: boolean;
  isCampaignSystem: boolean;
  isTestFile: boolean;
  isScriptFile: boolean;
  requiresSpecialHandling: boolean;
}

export interface ResolutionStrategy {
  type: 'auto-fix' | 'manual-review' | 'rule-adjustment' | 'ignore';
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  requiredValidation: ValidationRequirement[];
  estimatedEffort: number; // minutes
  dependencies: string[]; // Other issues that must be resolved first
}

export interface ValidationRequirement {
  type: 'build' | 'test' | 'type-check' | 'manual-review';
  description: string;
  automated: boolean;
}

export interface CategorizedErrors {
  total: number;
  errors: number;
  warnings: number;
  byCategory: Record<string, LintingIssue[]>;
  byPriority: Record<number, LintingIssue[]>;
  byFile: Record<string, LintingIssue[]>;
  autoFixable: LintingIssue[];
  requiresManualReview: LintingIssue[];
}

export interface ResolutionPlan {
  phases: ResolutionPhase[];
  totalEstimatedTime: number;
  riskAssessment: RiskAssessment;
  successProbability: number;
}

export interface ResolutionPhase {
  id: string;
  name: string;
  issues: LintingIssue[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  factors: string[];
  mitigations: string[];
}

/**
 * Main LintingErrorAnalyzer class
 */
export class LintingErrorAnalyzer {
  private workspaceRoot: string;
  private eslintConfigPath: string;
  private domainPatterns: Record<string, RegExp[]>;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.eslintConfigPath = path.join(workspaceRoot, 'eslint.config.cjs');
    
    // Define domain-specific file patterns
    this.domainPatterns = {
      astrological: [
        /\/calculations\//,
        /\/data\/planets\//,
        /reliableAstronomy/,
        /planetaryConsistencyCheck/,
        /Astrological/,
        /Alchemical/
      ],
      campaign: [
        /\/services\/campaign\//,
        /\/types\/campaign/,
        /Campaign/,
        /Progress/
      ],
      test: [
        /\.test\./,
        /\.spec\./,
        /__tests__/
      ],
      script: [
        /\/scripts\//,
        /\.config\./,
        /\.setup\./
      ]
    };
  }

  /**
   * Analyze all linting issues in the codebase
   */
  async analyzeAllIssues(): Promise<CategorizedErrors> {
    console.log('🔍 Starting comprehensive linting error analysis...');
    
    try {
      // Run ESLint to get all issues
      const eslintOutput = await this.runESLint();
      const rawIssues = this.parseESLintOutput(eslintOutput);
      
      console.log(`📊 Found ${rawIssues.length} total linting issues`);
      
      // Categorize and analyze each issue
      const analyzedIssues = rawIssues.map(issue => this.analyzeIssue(issue));
      
      // Categorize issues
      const categorized = this.categorizeIssues(analyzedIssues);
      
      console.log('✅ Linting error analysis complete');
      this.logAnalysisSummary(categorized);
      
      return categorized;
      
    } catch (error) {
      console.error('❌ Error during linting analysis:', error);
      throw error;
    }
  }

  /**
   * Generate resolution strategies for categorized errors
   */
  generateResolutionPlan(categorizedErrors: CategorizedErrors): ResolutionPlan {
    console.log('🎯 Generating resolution plan...');
    
    const phases: ResolutionPhase[] = [];
    let totalTime = 0;
    
    // Phase 1: Auto-fixable issues (low risk)
    if (categorizedErrors.autoFixable.length > 0) {
      const autoFixPhase: ResolutionPhase = {
        id: 'auto-fix',
        name: 'Automated Fixes',
        issues: categorizedErrors.autoFixable,
        estimatedTime: Math.ceil(categorizedErrors.autoFixable.length * 0.1), // 0.1 min per issue
        riskLevel: 'low',
        dependencies: []
      };
      phases.push(autoFixPhase);
      totalTime += autoFixPhase.estimatedTime;
    }
    
    // Phase 2: Import and style issues (medium risk)
    const importStyleIssues = [
      ...(categorizedErrors.byCategory['import'] || []),
      ...(categorizedErrors.byCategory['style'] || [])
    ].filter(issue => issue.resolutionStrategy.type !== 'auto-fix');
    
    if (importStyleIssues.length > 0) {
      const importStylePhase: ResolutionPhase = {
        id: 'import-style',
        name: 'Import and Style Fixes',
        issues: importStyleIssues,
        estimatedTime: Math.ceil(importStyleIssues.length * 0.5), // 0.5 min per issue
        riskLevel: 'medium',
        dependencies: ['auto-fix']
      };
      phases.push(importStylePhase);
      totalTime += importStylePhase.estimatedTime;
    }
    
    // Phase 3: TypeScript issues (high risk)
    const typescriptIssues = categorizedErrors.byCategory['typescript'] || [];
    if (typescriptIssues.length > 0) {
      const typescriptPhase: ResolutionPhase = {
        id: 'typescript',
        name: 'TypeScript Fixes',
        issues: typescriptIssues,
        estimatedTime: Math.ceil(typescriptIssues.length * 2), // 2 min per issue
        riskLevel: 'high',
        dependencies: ['auto-fix', 'import-style']
      };
      phases.push(typescriptPhase);
      totalTime += typescriptPhase.estimatedTime;
    }
    
    // Phase 4: React issues (medium risk)
    const reactIssues = categorizedErrors.byCategory['react'] || [];
    if (reactIssues.length > 0) {
      const reactPhase: ResolutionPhase = {
        id: 'react',
        name: 'React Fixes',
        issues: reactIssues,
        estimatedTime: Math.ceil(reactIssues.length * 1), // 1 min per issue
        riskLevel: 'medium',
        dependencies: ['typescript']
      };
      phases.push(reactPhase);
      totalTime += reactPhase.estimatedTime;
    }
    
    // Phase 5: Domain-specific issues (varies by context)
    const domainIssues = categorizedErrors.byCategory['domain'] || [];
    if (domainIssues.length > 0) {
      const domainPhase: ResolutionPhase = {
        id: 'domain',
        name: 'Domain-Specific Fixes',
        issues: domainIssues,
        estimatedTime: Math.ceil(domainIssues.length * 3), // 3 min per issue (requires domain knowledge)
        riskLevel: 'high',
        dependencies: ['typescript', 'react']
      };
      phases.push(domainPhase);
      totalTime += domainPhase.estimatedTime;
    }
    
    // Calculate risk assessment
    const riskAssessment = this.assessResolutionRisk(categorizedErrors, phases);
    
    // Calculate success probability based on issue types and complexity
    const successProbability = this.calculateSuccessProbability(categorizedErrors);
    
    const plan: ResolutionPlan = {
      phases,
      totalEstimatedTime: totalTime,
      riskAssessment,
      successProbability
    };
    
    console.log(`📋 Resolution plan generated: ${phases.length} phases, ${totalTime} minutes estimated`);
    
    return plan;
  }

  /**
   * Run ESLint and capture output
   */
  private async runESLint(): Promise<string> {
    try {
      const command = `npx eslint --config ${this.eslintConfigPath} src --format json --max-warnings=10000`;
      const output = execSync(command, {
        encoding: 'utf8',
        cwd: this.workspaceRoot,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      return output;
    } catch (error: any) {
      // ESLint returns non-zero exit code when issues are found
      if (error.stdout) {
        return error.stdout;
      }
      throw error;
    }
  }

  /**
   * Parse ESLint JSON output into raw issues
   */
  private parseESLintOutput(output: string): any[] {
    try {
      const results = JSON.parse(output);
      const issues: any[] = [];
      
      for (const fileResult of results) {
        for (const message of fileResult.messages) {
          issues.push({
            ...message,
            filePath: fileResult.filePath
          });
        }
      }
      
      return issues;
    } catch (error) {
      console.error('Failed to parse ESLint output:', error);
      return [];
    }
  }

  /**
   * Analyze individual issue and determine resolution strategy
   */
  private analyzeIssue(rawIssue: any): LintingIssue {
    const file = rawIssue.filePath.replace(this.workspaceRoot, '').replace(/^\//, '');
    const domainContext = this.detectDomainContext(file);
    const category = this.categorizeIssue(rawIssue, domainContext);
    const resolutionStrategy = this.determineResolutionStrategy(rawIssue, category, domainContext);
    
    const issue: LintingIssue = {
      id: `${file}:${rawIssue.line}:${rawIssue.column}:${rawIssue.ruleId}`,
      file,
      line: rawIssue.line,
      column: rawIssue.column,
      rule: rawIssue.ruleId || 'unknown',
      message: rawIssue.message,
      severity: rawIssue.severity === 2 ? 'error' : 'warning',
      category,
      autoFixable: Boolean(rawIssue.fix),
      domainContext,
      resolutionStrategy
    };
    
    return issue;
  }

  /**
   * Detect domain context for a file
   */
  private detectDomainContext(filePath: string): DomainContext {
    const context: DomainContext = {
      isAstrologicalCalculation: false,
      isCampaignSystem: false,
      isTestFile: false,
      isScriptFile: false,
      requiresSpecialHandling: false
    };
    
    // Check astrological patterns
    context.isAstrologicalCalculation = this.domainPatterns.astrological.some(pattern => 
      pattern.test(filePath)
    );
    
    // Check campaign system patterns
    context.isCampaignSystem = this.domainPatterns.campaign.some(pattern => 
      pattern.test(filePath)
    );
    
    // Check test file patterns
    context.isTestFile = this.domainPatterns.test.some(pattern => 
      pattern.test(filePath)
    );
    
    // Check script file patterns
    context.isScriptFile = this.domainPatterns.script.some(pattern => 
      pattern.test(filePath)
    );
    
    // Determine if special handling is required
    context.requiresSpecialHandling = context.isAstrologicalCalculation || 
                                     context.isCampaignSystem ||
                                     context.isTestFile ||
                                     context.isScriptFile;
    
    return context;
  }

  /**
   * Categorize individual issue
   */
  private categorizeIssue(rawIssue: any, domainContext: DomainContext): IssueCategory {
    const rule = rawIssue.ruleId || '';
    
    // Import-related issues
    if (rule.startsWith('import/')) {
      return {
        primary: 'import',
        secondary: rule.replace('import/', ''),
        priority: 2
      };
    }
    
    // TypeScript-related issues
    if (rule.startsWith('@typescript-eslint/')) {
      return {
        primary: 'typescript',
        secondary: rule.replace('@typescript-eslint/', ''),
        priority: rule.includes('no-explicit-any') ? 3 : 1
      };
    }
    
    // React-related issues
    if (rule.startsWith('react') || rule.startsWith('react-hooks')) {
      return {
        primary: 'react',
        secondary: rule.replace(/^react(-hooks)?\//, ''),
        priority: rule.includes('exhaustive-deps') ? 2 : 1
      };
    }
    
    // Domain-specific issues
    if (domainContext.requiresSpecialHandling) {
      return {
        primary: 'domain',
        secondary: domainContext.isAstrologicalCalculation ? 'astrological' :
                  domainContext.isCampaignSystem ? 'campaign' :
                  domainContext.isTestFile ? 'test' : 'script',
        priority: 4
      };
    }
    
    // Style and formatting issues
    return {
      primary: 'style',
      secondary: rule,
      priority: 4
    };
  }

  /**
   * Determine resolution strategy for an issue
   */
  private determineResolutionStrategy(
    rawIssue: any, 
    category: IssueCategory, 
    domainContext: DomainContext
  ): ResolutionStrategy {
    const rule = rawIssue.ruleId || '';
    const hasAutoFix = Boolean(rawIssue.fix);
    
    // Auto-fixable issues with low risk
    if (hasAutoFix && this.isLowRiskAutoFix(rule)) {
      return {
        type: 'auto-fix',
        confidence: 0.9,
        riskLevel: 'low',
        requiredValidation: [
          { type: 'build', description: 'Verify build still passes', automated: true }
        ],
        estimatedEffort: 0.1,
        dependencies: []
      };
    }
    
    // Import issues - usually safe to auto-fix
    if (category.primary === 'import') {
      return {
        type: hasAutoFix ? 'auto-fix' : 'manual-review',
        confidence: hasAutoFix ? 0.8 : 0.6,
        riskLevel: 'medium',
        requiredValidation: [
          { type: 'build', description: 'Verify imports resolve correctly', automated: true },
          { type: 'type-check', description: 'Verify TypeScript compilation', automated: true }
        ],
        estimatedEffort: hasAutoFix ? 0.2 : 1.0,
        dependencies: []
      };
    }
    
    // TypeScript issues - require careful handling
    if (category.primary === 'typescript') {
      const isExplicitAny = rule.includes('no-explicit-any');
      return {
        type: isExplicitAny ? 'manual-review' : 'auto-fix',
        confidence: isExplicitAny ? 0.4 : 0.7,
        riskLevel: isExplicitAny ? 'high' : 'medium',
        requiredValidation: [
          { type: 'type-check', description: 'Verify TypeScript compilation', automated: true },
          { type: 'test', description: 'Run relevant tests', automated: true }
        ],
        estimatedEffort: isExplicitAny ? 5.0 : 1.0,
        dependencies: []
      };
    }
    
    // React issues - moderate risk
    if (category.primary === 'react') {
      const isExhaustiveDeps = rule.includes('exhaustive-deps');
      return {
        type: isExhaustiveDeps ? 'manual-review' : 'auto-fix',
        confidence: isExhaustiveDeps ? 0.5 : 0.8,
        riskLevel: isExhaustiveDeps ? 'high' : 'medium',
        requiredValidation: [
          { type: 'build', description: 'Verify React components render', automated: true },
          { type: 'test', description: 'Run component tests', automated: true }
        ],
        estimatedEffort: isExhaustiveDeps ? 3.0 : 0.5,
        dependencies: []
      };
    }
    
    // Domain-specific issues - require special handling
    if (domainContext.requiresSpecialHandling) {
      return {
        type: 'manual-review',
        confidence: 0.3,
        riskLevel: 'high',
        requiredValidation: [
          { type: 'manual-review', description: 'Domain expert review required', automated: false },
          { type: 'test', description: 'Run domain-specific tests', automated: true }
        ],
        estimatedEffort: 10.0,
        dependencies: []
      };
    }
    
    // Default strategy for other issues
    return {
      type: hasAutoFix ? 'auto-fix' : 'rule-adjustment',
      confidence: 0.6,
      riskLevel: 'low',
      requiredValidation: [
        { type: 'build', description: 'Verify build passes', automated: true }
      ],
      estimatedEffort: hasAutoFix ? 0.5 : 2.0,
      dependencies: []
    };
  }

  /**
   * Check if a rule is safe for auto-fixing
   */
  private isLowRiskAutoFix(rule: string): boolean {
    const lowRiskRules = [
      'import/order',
      'import/newline-after-import',
      'semi',
      'quotes',
      'comma-dangle',
      'trailing-comma',
      'indent',
      'no-trailing-spaces',
      'eol-last'
    ];
    
    return lowRiskRules.some(lowRiskRule => rule.includes(lowRiskRule));
  }

  /**
   * Categorize all analyzed issues
   */
  private categorizeIssues(issues: LintingIssue[]): CategorizedErrors {
    const categorized: CategorizedErrors = {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      byCategory: {},
      byPriority: {},
      byFile: {},
      autoFixable: issues.filter(i => i.autoFixable),
      requiresManualReview: issues.filter(i => i.resolutionStrategy.type === 'manual-review')
    };
    
    // Group by category
    for (const issue of issues) {
      const categoryKey = issue.category.primary;
      if (!categorized.byCategory[categoryKey]) {
        categorized.byCategory[categoryKey] = [];
      }
      categorized.byCategory[categoryKey].push(issue);
    }
    
    // Group by priority
    for (const issue of issues) {
      const priority = issue.category.priority;
      if (!categorized.byPriority[priority]) {
        categorized.byPriority[priority] = [];
      }
      categorized.byPriority[priority].push(issue);
    }
    
    // Group by file
    for (const issue of issues) {
      if (!categorized.byFile[issue.file]) {
        categorized.byFile[issue.file] = [];
      }
      categorized.byFile[issue.file].push(issue);
    }
    
    return categorized;
  }

  /**
   * Assess risk of resolution plan
   */
  private assessResolutionRisk(categorized: CategorizedErrors, phases: ResolutionPhase[]): RiskAssessment {
    const factors: string[] = [];
    const mitigations: string[] = [];
    
    // Check for high-risk factors
    if (categorized.byCategory['typescript']?.length > 50) {
      factors.push('High number of TypeScript issues');
      mitigations.push('Implement gradual TypeScript fixes with validation');
    }
    
    if (categorized.byCategory['domain']?.length > 0) {
      factors.push('Domain-specific issues require expert knowledge');
      mitigations.push('Manual review by domain experts required');
    }
    
    if (categorized.requiresManualReview.length > categorized.autoFixable.length) {
      factors.push('More manual fixes than automated fixes');
      mitigations.push('Prioritize automated fixes first to reduce workload');
    }
    
    // Determine overall risk
    const highRiskPhases = phases.filter(p => p.riskLevel === 'high').length;
    const overall = highRiskPhases > 2 ? 'high' : 
                   highRiskPhases > 0 ? 'medium' : 'low';
    
    return { overall, factors, mitigations };
  }

  /**
   * Calculate success probability based on issue complexity
   */
  private calculateSuccessProbability(categorized: CategorizedErrors): number {
    let baseScore = 0.8; // Start with 80% confidence
    
    // Reduce confidence for complex issues
    const complexIssues = categorized.requiresManualReview.length;
    const totalIssues = categorized.total;
    
    if (totalIssues > 0) {
      const complexityRatio = complexIssues / totalIssues;
      baseScore -= complexityRatio * 0.3; // Reduce up to 30% for complexity
    }
    
    // Increase confidence for auto-fixable issues
    const autoFixRatio = categorized.autoFixable.length / totalIssues;
    baseScore += autoFixRatio * 0.1; // Increase up to 10% for auto-fixes
    
    return Math.max(0.3, Math.min(0.95, baseScore)); // Clamp between 30% and 95%
  }

  /**
   * Log analysis summary
   */
  private logAnalysisSummary(categorized: CategorizedErrors): void {
    console.log('\n📊 LINTING ANALYSIS SUMMARY');
    console.log('============================');
    console.log(`Total Issues: ${categorized.total}`);
    console.log(`Errors: ${categorized.errors}`);
    console.log(`Warnings: ${categorized.warnings}`);
    console.log(`Auto-fixable: ${categorized.autoFixable.length}`);
    console.log(`Manual Review Required: ${categorized.requiresManualReview.length}`);
    
    console.log('\n📋 BY CATEGORY:');
    Object.entries(categorized.byCategory).forEach(([category, issues]) => {
      console.log(`  ${category}: ${issues.length} issues`);
    });
    
    console.log('\n🎯 BY PRIORITY:');
    Object.entries(categorized.byPriority).forEach(([priority, issues]) => {
      console.log(`  Priority ${priority}: ${issues.length} issues`);
    });
    
    console.log('============================\n');
  }
}