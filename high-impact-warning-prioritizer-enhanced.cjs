#!/usr/bin/env node

/**
 * Enhanced High-Impact Warning Prioritizer
 *
 * Identifies and prioritizes high-impact ESLint warnings for immediate action
 * based on business impact, technical risk, and resolution feasibility.
 */

const fs = require("fs");

class HighImpactWarningPrioritizer {
  constructor() {
    this.highImpactWarnings = [];
    this.priorityQueue = [];
    this.immediateActions = [];
    this.quickWins = [];
    this.strategicFixes = [];
  }

  /**
   * Generate high-impact warning prioritization
   */
  async generateHighImpactPrioritization() {
    console.log("🎯 Generating high-impact warning prioritization...");

    try {
      // Load the enhanced report and severity categorization
      const reportPath = "enhanced-eslint-warning-report.json";
      const severityPath = "eslint-severity-categorization-detailed.json";

      if (!fs.existsSync(reportPath)) {
        throw new Error(`Enhanced report not found: ${reportPath}`);
      }

      if (!fs.existsSync(severityPath)) {
        throw new Error(`Severity categorization not found: ${severityPath}`);
      }

      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      const severityReport = JSON.parse(fs.readFileSync(severityPath, "utf8"));

      // Identify high-impact warnings
      console.log("🔍 Identifying high-impact warnings...");
      this.identifyHighImpactWarnings(report, severityReport);

      // Create priority queue
      console.log("📊 Creating priority queue...");
      this.createPriorityQueue(report, severityReport);

      // Generate immediate action items
      console.log("⚡ Generating immediate action items...");
      this.generateImmediateActions();

      // Identify quick wins
      console.log("🚀 Identifying quick wins...");
      this.identifyQuickWins();

      // Plan strategic fixes
      console.log("🎯 Planning strategic fixes...");
      this.planStrategicFixes();

      // Create comprehensive prioritization report
      const prioritizationReport = this.generatePrioritizationReport(
        report,
        severityReport,
      );

      // Save detailed report
      const detailedReportPath = "high-impact-warning-prioritization.json";
      fs.writeFileSync(
        detailedReportPath,
        JSON.stringify(prioritizationReport, null, 2),
      );

      // Generate markdown summary
      const summaryPath = "high-impact-warning-prioritization-summary.md";
      const markdownSummary =
        this.generatePrioritizationMarkdown(prioritizationReport);
      fs.writeFileSync(summaryPath, markdownSummary);

      console.log(`✅ High-impact warning prioritization generated:`);
      console.log(`   📊 JSON Report: ${detailedReportPath}`);
      console.log(`   📝 Summary: ${summaryPath}`);
      console.log(
        `   🎯 High-Impact Warnings: ${this.highImpactWarnings.length}`,
      );
      console.log(`   ⚡ Immediate Actions: ${this.immediateActions.length}`);
      console.log(`   🚀 Quick Wins: ${this.quickWins.length}`);
      console.log(`   🎯 Strategic Fixes: ${this.strategicFixes.length}`);

      return prioritizationReport;
    } catch (error) {
      console.error(
        "❌ Error generating high-impact prioritization:",
        error.message,
      );
      throw error;
    }
  }

  /**
   * Identify high-impact warnings based on multiple criteria
   */
  identifyHighImpactWarnings(report, severityReport) {
    // Define high-impact criteria
    const highImpactCriteria = {
      // Critical business impact
      criticalRules: [
        "no-undef",
        "no-redeclare",
        "no-const-assign",
        "no-case-declarations",
      ],

      // High-volume issues that affect many files
      highVolumeThreshold: 100,

      // Rules that affect core functionality
      coreRules: [
        "@typescript-eslint/no-unused-vars",
        "react-hooks/rules-of-hooks",
      ],

      // Files with concentrated issues
      fileIssueThreshold: 20,
    };

    // Identify high-impact warnings by rule criticality
    for (const [category, issues] of Object.entries(report.categories)) {
      for (const issue of issues) {
        let impactScore = 0;
        let impactReasons = [];

        // Critical rule impact
        if (highImpactCriteria.criticalRules.includes(issue.rule)) {
          impactScore += 10;
          impactReasons.push("Critical rule - prevents compilation");
        }

        // Core functionality impact
        if (highImpactCriteria.coreRules.includes(issue.rule)) {
          impactScore += 8;
          impactReasons.push("Core functionality rule");
        }

        // High-volume rule impact
        const ruleCount = report.ruleBreakdown[issue.rule] || 0;
        if (ruleCount >= highImpactCriteria.highVolumeThreshold) {
          impactScore += 6;
          impactReasons.push(`High volume rule (${ruleCount} occurrences)`);
        }

        // File concentration impact
        const fileIssueCount = report.fileBreakdown[issue.file] || 0;
        if (fileIssueCount >= highImpactCriteria.fileIssueThreshold) {
          impactScore += 4;
          impactReasons.push(`High-issue file (${fileIssueCount} issues)`);
        }

        // Domain-specific impact (astrological calculations)
        if (this.isAstrologicalFile(issue.file)) {
          impactScore += 3;
          impactReasons.push("Astrological calculation file");
        }

        // Campaign system impact
        if (this.isCampaignFile(issue.file)) {
          impactScore += 2;
          impactReasons.push("Campaign system file");
        }

        // Add to high-impact list if score is significant
        if (impactScore >= 6) {
          this.highImpactWarnings.push({
            ...issue,
            impactScore,
            impactReasons,
            category,
            ruleCount,
            fileIssueCount,
          });
        }
      }
    }

    // Sort by impact score
    this.highImpactWarnings.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Create priority queue based on impact and feasibility
   */
  createPriorityQueue(report, severityReport) {
    // Define feasibility factors
    const feasibilityFactors = {
      "no-console": { effort: 1, risk: 1, automation: 10 },
      "no-undef": { effort: 8, risk: 9, automation: 2 },
      "no-redeclare": { effort: 7, risk: 8, automation: 3 },
      "@typescript-eslint/no-unused-vars": {
        effort: 5,
        risk: 4,
        automation: 6,
      },
      "@typescript-eslint/no-explicit-any": {
        effort: 9,
        risk: 6,
        automation: 4,
      },
      "react-hooks/exhaustive-deps": { effort: 8, risk: 7, automation: 2 },
    };

    // Create priority items
    const ruleGroups = {};

    for (const warning of this.highImpactWarnings) {
      if (!ruleGroups[warning.rule]) {
        ruleGroups[warning.rule] = {
          rule: warning.rule,
          warnings: [],
          totalImpactScore: 0,
          affectedFiles: new Set(),
          categories: new Set(),
        };
      }

      ruleGroups[warning.rule].warnings.push(warning);
      ruleGroups[warning.rule].totalImpactScore += warning.impactScore;
      ruleGroups[warning.rule].affectedFiles.add(warning.file);
      ruleGroups[warning.rule].categories.add(warning.category);
    }

    // Calculate priority scores
    for (const [rule, group] of Object.entries(ruleGroups)) {
      const feasibility = feasibilityFactors[rule] || {
        effort: 5,
        risk: 5,
        automation: 3,
      };

      // Priority score calculation
      const impactWeight = 0.4;
      const feasibilityWeight = 0.3;
      const automationWeight = 0.2;
      const volumeWeight = 0.1;

      const normalizedImpact = Math.min(
        10,
        group.totalImpactScore / group.warnings.length,
      );
      const normalizedFeasibility =
        11 - feasibility.effort + (11 - feasibility.risk);
      const normalizedAutomation = feasibility.automation;
      const normalizedVolume = Math.min(10, group.warnings.length / 100);

      const priorityScore =
        normalizedImpact * impactWeight +
        normalizedFeasibility * feasibilityWeight +
        normalizedAutomation * automationWeight +
        normalizedVolume * volumeWeight;

      this.priorityQueue.push({
        rule,
        priorityScore,
        impactScore: normalizedImpact,
        feasibilityScore: normalizedFeasibility,
        automationScore: normalizedAutomation,
        volumeScore: normalizedVolume,
        warningCount: group.warnings.length,
        affectedFiles: Array.from(group.affectedFiles),
        categories: Array.from(group.categories),
        estimatedEffort: this.calculateEstimatedEffort(
          group.warnings,
          feasibility,
        ),
        businessImpact: this.getBusinessImpact(rule, group.warnings.length),
        recommendedApproach: this.getRecommendedApproach(rule, feasibility),
      });
    }

    // Sort by priority score
    this.priorityQueue.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Generate immediate action items
   */
  generateImmediateActions() {
    // Immediate actions are critical issues that must be fixed now
    const immediateRules = [
      "no-undef",
      "no-redeclare",
      "no-const-assign",
      "no-case-declarations",
    ];

    for (const item of this.priorityQueue) {
      if (immediateRules.includes(item.rule)) {
        this.immediateActions.push({
          ...item,
          urgency: "Critical",
          timeline: "Within 24 hours",
          reason: "Prevents compilation and breaks builds",
          assignee: "Senior Developer",
          blocksDeployment: true,
        });
      }
    }
  }

  /**
   * Identify quick wins
   */
  identifyQuickWins() {
    // Quick wins are high-automation, low-risk fixes
    for (const item of this.priorityQueue) {
      if (item.automationScore >= 8 && item.feasibilityScore >= 7) {
        this.quickWins.push({
          ...item,
          timeline: "Within 1 week",
          reason: "High automation potential with low risk",
          automationLevel: "High",
          manualReviewRequired:
            item.rule === "no-console" ? "Minimal" : "Moderate",
        });
      }
    }
  }

  /**
   * Plan strategic fixes
   */
  planStrategicFixes() {
    // Strategic fixes are high-impact but require careful planning
    const strategicRules = [
      "@typescript-eslint/no-explicit-any",
      "react-hooks/exhaustive-deps",
    ];

    for (const item of this.priorityQueue) {
      if (strategicRules.includes(item.rule) || item.warningCount >= 500) {
        this.strategicFixes.push({
          ...item,
          timeline: "2-6 weeks",
          reason:
            "High impact but requires careful analysis and domain expertise",
          phaseApproach: "Incremental",
          riskMitigation: this.getRiskMitigation(item.rule),
          successMetrics: this.getSuccessMetrics(item.rule),
        });
      }
    }
  }

  /**
   * Check if file is astrological calculation related
   */
  isAstrologicalFile(filePath) {
    const astrologicalPatterns = [
      "/calculations/",
      "/astrology",
      "/planetary",
      "/zodiac",
      "/elemental",
      "astrological",
      "alchemical",
    ];

    return astrologicalPatterns.some((pattern) => filePath.includes(pattern));
  }

  /**
   * Check if file is campaign system related
   */
  isCampaignFile(filePath) {
    return filePath.includes("/campaign/") || filePath.includes("campaign");
  }

  /**
   * Calculate estimated effort
   */
  calculateEstimatedEffort(warnings, feasibility) {
    const baseEffortPerWarning = {
      "no-console": 0.5,
      "no-undef": 5,
      "no-redeclare": 5,
      "@typescript-eslint/no-unused-vars": 3,
      "@typescript-eslint/no-explicit-any": 15,
      "react-hooks/exhaustive-deps": 10,
    };

    const baseEffort = baseEffortPerWarning[warnings[0]?.rule] || 5;
    const totalMinutes =
      warnings.length * baseEffort * (feasibility.effort / 5);

    return {
      minutes: totalMinutes,
      hours: Math.ceil(totalMinutes / 60),
      days: Math.ceil(totalMinutes / (60 * 8)),
    };
  }

  /**
   * Get business impact description
   */
  getBusinessImpact(rule, count) {
    const impacts = {
      "no-undef": "Critical - Application cannot compile or run",
      "no-redeclare": "Critical - Compilation errors and runtime conflicts",
      "no-console": "Low - Performance impact and information leakage",
      "@typescript-eslint/no-unused-vars":
        "Medium - Code bloat and maintenance overhead",
      "@typescript-eslint/no-explicit-any":
        "High - Type safety compromised, runtime errors possible",
      "react-hooks/exhaustive-deps":
        "High - Performance issues and infinite re-renders",
    };

    const baseImpact = impacts[rule] || "Medium - General code quality impact";
    const volumeImpact = count > 500 ? " (High volume amplifies impact)" : "";

    return baseImpact + volumeImpact;
  }

  /**
   * Get recommended approach
   */
  getRecommendedApproach(rule, feasibility) {
    const approaches = {
      "no-console":
        "Automated removal with preservation rules for intentional debug interfaces",
      "no-undef": "Manual fixes with careful import and declaration analysis",
      "no-redeclare": "Manual resolution of naming conflicts and scope issues",
      "@typescript-eslint/no-unused-vars":
        "Semi-automated with domain expert review for astrological variables",
      "@typescript-eslint/no-explicit-any":
        "Gradual type enhancement with careful analysis of each case",
      "react-hooks/exhaustive-deps":
        "Manual analysis of each hook with performance testing",
    };

    return approaches[rule] || "Manual review and case-by-case resolution";
  }

  /**
   * Get risk mitigation strategies
   */
  getRiskMitigation(rule) {
    const mitigations = {
      "@typescript-eslint/no-explicit-any": [
        "Preserve intentional any types with ESLint disable comments",
        "Test astrological calculations after each batch of changes",
        "Use incremental approach with small batches",
        "Maintain rollback capability",
      ],
      "react-hooks/exhaustive-deps": [
        "Performance testing after each change",
        "Monitor for infinite re-renders",
        "Use React DevTools for analysis",
        "Test user interactions thoroughly",
      ],
    };

    return (
      mitigations[rule] || [
        "Thorough testing",
        "Incremental changes",
        "Rollback capability",
      ]
    );
  }

  /**
   * Get success metrics
   */
  getSuccessMetrics(rule) {
    const metrics = {
      "@typescript-eslint/no-explicit-any": [
        "Reduced any type count by 70%",
        "No new TypeScript compilation errors",
        "Astrological calculations maintain accuracy",
        "Build time remains under 30 seconds",
      ],
      "react-hooks/exhaustive-deps": [
        "No infinite re-render issues",
        "Improved component performance",
        "Reduced unnecessary re-renders",
        "User experience remains smooth",
      ],
    };

    return (
      metrics[rule] || [
        "Issue count reduced",
        "No functionality broken",
        "Build stability maintained",
      ]
    );
  }

  /**
   * Generate comprehensive prioritization report
   */
  generatePrioritizationReport(originalReport, severityReport) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        basedOnReports: [
          "enhanced-eslint-warning-report.json",
          "eslint-severity-categorization-detailed.json",
        ],
        totalWarningsAnalyzed: originalReport.metadata.totalIssues,
        highImpactWarningsIdentified: this.highImpactWarnings.length,
      },
      executiveSummary: {
        totalHighImpactWarnings: this.highImpactWarnings.length,
        immediateActionsRequired: this.immediateActions.length,
        quickWinsAvailable: this.quickWins.length,
        strategicFixesNeeded: this.strategicFixes.length,
        estimatedTotalEffort: this.calculateTotalEffort(),
        businessRisk: this.assessBusinessRisk(),
        recommendedStartDate: new Date().toISOString().split("T")[0],
      },
      priorityQueue: this.priorityQueue,
      immediateActions: this.immediateActions,
      quickWins: this.quickWins,
      strategicFixes: this.strategicFixes,
      implementationPlan: this.generateImplementationPlan(),
      resourceRequirements: this.calculateResourceRequirements(),
    };
  }

  /**
   * Calculate total effort across all priorities
   */
  calculateTotalEffort() {
    const totalHours = this.priorityQueue.reduce(
      (sum, item) => sum + item.estimatedEffort.hours,
      0,
    );

    return {
      hours: totalHours,
      days: Math.ceil(totalHours / 8),
      weeks: Math.ceil(totalHours / 40),
    };
  }

  /**
   * Assess overall business risk
   */
  assessBusinessRisk() {
    const criticalCount = this.immediateActions.length;
    const highImpactCount = this.highImpactWarnings.length;

    if (criticalCount > 0) return "Critical";
    if (highImpactCount > 100) return "High";
    if (highImpactCount > 50) return "Medium";
    return "Low";
  }

  /**
   * Generate implementation plan
   */
  generateImplementationPlan() {
    const plan = [];

    // Phase 1: Immediate actions
    if (this.immediateActions.length > 0) {
      plan.push({
        phase: 1,
        name: "Critical Issue Resolution",
        duration: "1-3 days",
        items: this.immediateActions.length,
        description: "Fix all build-blocking and critical issues",
        resources: "Senior Developer (full-time)",
        deliverables: [
          "Application compiles successfully",
          "No critical errors remain",
        ],
      });
    }

    // Phase 2: Quick wins
    if (this.quickWins.length > 0) {
      plan.push({
        phase: plan.length + 1,
        name: "Quick Wins Implementation",
        duration: "1-2 weeks",
        items: this.quickWins.length,
        description: "Implement high-automation, low-risk fixes",
        resources: "Mid-level Developer (part-time)",
        deliverables: [
          "Automated fixes applied",
          "Code quality improved",
          "No regressions introduced",
        ],
      });
    }

    // Phase 3: Strategic fixes
    if (this.strategicFixes.length > 0) {
      plan.push({
        phase: plan.length + 1,
        name: "Strategic Improvements",
        duration: "3-6 weeks",
        items: this.strategicFixes.length,
        description: "Implement high-impact fixes requiring careful analysis",
        resources: "Senior Developer + Domain Expert",
        deliverables: [
          "Type safety improved",
          "Performance optimized",
          "Technical debt reduced",
        ],
      });
    }

    return plan;
  }

  /**
   * Calculate resource requirements
   */
  calculateResourceRequirements() {
    const totalEffort = this.calculateTotalEffort();

    return {
      seniorDeveloper: {
        hours: Math.ceil(totalEffort.hours * 0.6), // 60% senior work
        weeks: Math.ceil(totalEffort.weeks * 0.6),
        cost: Math.ceil(totalEffort.hours * 0.6) * 100, // $100/hour
      },
      midLevelDeveloper: {
        hours: Math.ceil(totalEffort.hours * 0.3), // 30% mid-level work
        weeks: Math.ceil(totalEffort.weeks * 0.3),
        cost: Math.ceil(totalEffort.hours * 0.3) * 75, // $75/hour
      },
      domainExpert: {
        hours: Math.ceil(totalEffort.hours * 0.1), // 10% domain expert review
        weeks: Math.ceil(totalEffort.weeks * 0.1),
        cost: Math.ceil(totalEffort.hours * 0.1) * 120, // $120/hour
      },
      totalCost:
        Math.ceil(totalEffort.hours * 0.6) * 100 +
        Math.ceil(totalEffort.hours * 0.3) * 75 +
        Math.ceil(totalEffort.hours * 0.1) * 120,
    };
  }

  /**
   * Generate prioritization markdown summary
   */
  generatePrioritizationMarkdown(report) {
    const {
      metadata,
      executiveSummary,
      priorityQueue,
      immediateActions,
      quickWins,
      strategicFixes,
      implementationPlan,
      resourceRequirements,
    } = report;

    return `# High-Impact ESLint Warning Prioritization

## Executive Summary

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Warnings Analyzed:** ${metadata.totalWarningsAnalyzed}
**High-Impact Warnings Identified:** ${metadata.highImpactWarningsIdentified}
**Business Risk Level:** ${executiveSummary.businessRisk}

### Action Items Summary
- **🚨 Immediate Actions Required:** ${executiveSummary.immediateActionsRequired}
- **🚀 Quick Wins Available:** ${executiveSummary.quickWinsAvailable}
- **🎯 Strategic Fixes Needed:** ${executiveSummary.strategicFixesNeeded}
- **⏱️ Total Estimated Effort:** ${executiveSummary.estimatedTotalEffort.hours} hours (${executiveSummary.estimatedTotalEffort.weeks} weeks)

## Priority Queue (Top 10)

${priorityQueue
  .slice(0, 10)
  .map(
    (
      item,
      index,
    ) => `### ${index + 1}. ${item.rule} (Priority Score: ${item.priorityScore.toFixed(2)})

**Warning Count:** ${item.warningCount}
**Affected Files:** ${item.affectedFiles.length}
**Estimated Effort:** ${item.estimatedEffort.hours} hours
**Business Impact:** ${item.businessImpact}
**Recommended Approach:** ${item.recommendedApproach}

**Scores:**
- Impact: ${item.impactScore.toFixed(1)}/10
- Feasibility: ${item.feasibilityScore.toFixed(1)}/10
- Automation: ${item.automationScore.toFixed(1)}/10
- Volume: ${item.volumeScore.toFixed(1)}/10`,
  )
  .join("\n\n")}

## Immediate Actions (Critical - Within 24 Hours)

${
  immediateActions.length > 0
    ? immediateActions
        .map(
          (action, index) => `### ${index + 1}. ${action.rule}

**Urgency:** ${action.urgency}
**Timeline:** ${action.timeline}
**Warning Count:** ${action.warningCount}
**Reason:** ${action.reason}
**Assignee:** ${action.assignee}
**Blocks Deployment:** ${action.blocksDeployment ? "Yes" : "No"}
**Estimated Effort:** ${action.estimatedEffort.hours} hours`,
        )
        .join("\n\n")
    : "No immediate critical actions required."
}

## Quick Wins (High ROI - Within 1 Week)

${
  quickWins.length > 0
    ? quickWins
        .map(
          (win, index) => `### ${index + 1}. ${win.rule}

**Timeline:** ${win.timeline}
**Warning Count:** ${win.warningCount}
**Automation Level:** ${win.automationLevel}
**Manual Review Required:** ${win.manualReviewRequired}
**Estimated Effort:** ${win.estimatedEffort.hours} hours
**Reason:** ${win.reason}`,
        )
        .join("\n\n")
    : "No quick wins identified."
}

## Strategic Fixes (High Impact - 2-6 Weeks)

${
  strategicFixes.length > 0
    ? strategicFixes
        .map(
          (fix, index) => `### ${index + 1}. ${fix.rule}

**Timeline:** ${fix.timeline}
**Warning Count:** ${fix.warningCount}
**Phase Approach:** ${fix.phaseApproach}
**Estimated Effort:** ${fix.estimatedEffort.hours} hours

**Risk Mitigation:**
${fix.riskMitigation.map((risk) => `- ${risk}`).join("\n")}

**Success Metrics:**
${fix.successMetrics.map((metric) => `- ${metric}`).join("\n")}`,
        )
        .join("\n\n")
    : "No strategic fixes identified."
}

## Implementation Plan

${implementationPlan
  .map(
    (phase) => `### Phase ${phase.phase}: ${phase.name}

**Duration:** ${phase.duration}
**Items to Address:** ${phase.items}
**Description:** ${phase.description}
**Resources:** ${phase.resources}

**Deliverables:**
${phase.deliverables.map((deliverable) => `- ${deliverable}`).join("\n")}`,
  )
  .join("\n\n")}

## Resource Requirements

### Senior Developer
- **Hours:** ${resourceRequirements.seniorDeveloper.hours}
- **Duration:** ${resourceRequirements.seniorDeveloper.weeks} weeks
- **Estimated Cost:** $${resourceRequirements.seniorDeveloper.cost.toLocaleString()}

### Mid-Level Developer
- **Hours:** ${resourceRequirements.midLevelDeveloper.hours}
- **Duration:** ${resourceRequirements.midLevelDeveloper.weeks} weeks
- **Estimated Cost:** $${resourceRequirements.midLevelDeveloper.cost.toLocaleString()}

### Domain Expert
- **Hours:** ${resourceRequirements.domainExpert.hours}
- **Duration:** ${resourceRequirements.domainExpert.weeks} weeks
- **Estimated Cost:** $${resourceRequirements.domainExpert.cost.toLocaleString()}

### Total Project Cost
**$${resourceRequirements.totalCost.toLocaleString()}**

## Next Steps

1. **Immediate (Today):** Begin critical issue resolution
2. **This Week:** Implement quick wins and automated fixes
3. **Next 2 Weeks:** Start strategic fix planning and resource allocation
4. **Ongoing:** Monitor progress and adjust priorities as needed

## Risk Assessment

**Current Risk Level:** ${executiveSummary.businessRisk}

${
  executiveSummary.businessRisk === "Critical"
    ? "⚠️ **CRITICAL**: Immediate action required to prevent deployment blocks and production issues."
    : executiveSummary.businessRisk === "High"
      ? "⚠️ **HIGH**: Significant technical debt and potential stability issues."
      : "✅ **MANAGEABLE**: Issues can be addressed through systematic improvement plan."
}

---

*High-impact prioritization generated by high-impact-warning-prioritizer-enhanced.cjs*
*Analysis completed at ${new Date().toLocaleString()}*
`;
  }
}

// Main execution
async function main() {
  const prioritizer = new HighImpactWarningPrioritizer();

  try {
    const report = await prioritizer.generateHighImpactPrioritization();

    console.log("\n🎯 High-Impact Warning Prioritization Complete!");
    console.log("\n📊 Summary:");
    console.log(`   Business Risk: ${report.executiveSummary.businessRisk}`);
    console.log(
      `   Immediate Actions: ${report.executiveSummary.immediateActionsRequired}`,
    );
    console.log(`   Quick Wins: ${report.executiveSummary.quickWinsAvailable}`);
    console.log(
      `   Strategic Fixes: ${report.executiveSummary.strategicFixesNeeded}`,
    );
    console.log(
      `   Total Effort: ${report.executiveSummary.estimatedTotalEffort.hours} hours`,
    );
    console.log(
      `   Implementation Phases: ${report.implementationPlan.length}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Prioritization failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HighImpactWarningPrioritizer };
