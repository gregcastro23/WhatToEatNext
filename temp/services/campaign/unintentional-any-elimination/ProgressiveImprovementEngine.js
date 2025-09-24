"use strict";
/**
 * Progressive Improvement Engine
 * Orchestrates batch processing with adaptive strategies and progress tracking
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveImprovementEngine = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AnyTypeClassifier_1 = require("./AnyTypeClassifier");
const DomainContextAnalyzer_1 = require("./DomainContextAnalyzer");
const SafeTypeReplacer_1 = require("./SafeTypeReplacer");
class ProgressiveImprovementEngine {
    constructor(initialConfig) {
        this.processedFiles = new Set();
        this.batchCounter = 0;
        this.batchHistory = [];
        this.safetyCheckpoints = new Map();
        this.classifier = new AnyTypeClassifier_1.AnyTypeClassifier();
        this.replacer = new SafeTypeReplacer_1.SafeTypeReplacer();
        this.analyzer = new DomainContextAnalyzer_1.DomainContextAnalyzer();
        // Initialize adaptive configuration with defaults
        this.adaptiveConfig = {
            maxFilesPerBatch: initialConfig?.maxFilesPerBatch || 15,
            targetReductionPercentage: initialConfig?.targetReductionPercentage || 15,
            confidenceThreshold: initialConfig?.confidenceThreshold || 0.8,
            enableDomainAnalysis: initialConfig?.enableDomainAnalysis ?? true,
            enableDocumentation: initialConfig?.enableDocumentation ?? true,
            safetyLevel: initialConfig?.safetyLevel || 'MODERATE',
            validationFrequency: initialConfig?.validationFrequency || 5
        };
    }
    /**
     * Adapt strategy based on recent batch performance
     */
    adaptStrategy() {
        if (this.batchHistory.length < 2)
            return;
        const recentBatches = this.batchHistory.slice(-3);
        const averageSuccessRate = recentBatches.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / recentBatches.length;
        const averageSafetyScore = recentBatches.reduce((sum, batch) => sum + batch.safetyScore, 0) / recentBatches.length;
        console.log(`Adapting strategy - Success rate: ${(averageSuccessRate * 100).toFixed(1)}%, Safety score: ${averageSafetyScore.toFixed(2)}`);
        // Adapt batch size based on safety score
        if (averageSafetyScore < 0.7) {
            // Reduce batch size for safety
            this.adaptiveConfig.maxFilesPerBatch = Math.max(5, Math.floor(this.adaptiveConfig.maxFilesPerBatch * 0.7));
            this.adaptiveConfig.confidenceThreshold = Math.min(0.95, this.adaptiveConfig.confidenceThreshold + 0.1);
            console.log(`Reduced batch size to ${this.adaptiveConfig.maxFilesPerBatch} and increased confidence threshold to ${this.adaptiveConfig.confidenceThreshold}`);
        }
        else if (averageSafetyScore > 0.9 && averageSuccessRate > 0.8) {
            // Increase batch size for efficiency
            this.adaptiveConfig.maxFilesPerBatch = Math.min(25, Math.floor(this.adaptiveConfig.maxFilesPerBatch * 1.2));
            this.adaptiveConfig.confidenceThreshold = Math.max(0.7, this.adaptiveConfig.confidenceThreshold - 0.05);
            console.log(`Increased batch size to ${this.adaptiveConfig.maxFilesPerBatch} and decreased confidence threshold to ${this.adaptiveConfig.confidenceThreshold}`);
        }
        // Adapt confidence threshold based on success rate
        if (averageSuccessRate < 0.5) {
            this.adaptiveConfig.confidenceThreshold = Math.min(0.95, this.adaptiveConfig.confidenceThreshold + 0.1);
            console.log(`Low success rate, increased confidence threshold to ${this.adaptiveConfig.confidenceThreshold}`);
        }
        // Adapt validation frequency based on safety
        if (averageSafetyScore < 0.8) {
            this.adaptiveConfig.validationFrequency = Math.max(3, this.adaptiveConfig.validationFrequency - 1);
            console.log(`Increased validation frequency to every ${this.adaptiveConfig.validationFrequency} files`);
        }
    }
    /**
     * Create a safety checkpoint
     */
    async createSafetyCheckpoint() {
        const progress = await this.getCurrentProgress();
        this.safetyCheckpoints.set(this.batchCounter, progress);
        console.log(`Safety checkpoint created at batch ${this.batchCounter}`);
    }
    /**
     * Get comprehensive progress metrics
     */
    async getProgressMetrics() {
        return await this.getCurrentProgress();
    }
    /**
     * Get batch execution history
     */
    getBatchHistory() {
        return [...this.batchHistory];
    }
    /**
     * Get current adaptive configuration
     */
    getAdaptiveConfig() {
        return { ...this.adaptiveConfig };
    }
    /**
     * Set realistic targets based on historical success rates and codebase analysis
     */
    async setRealisticTargets() {
        const currentProgress = await this.getCurrentProgress();
        const candidateFiles = await this.findFilesWithAnyTypes();
        // Analyze file types and complexity
        const fileAnalysis = await this.analyzeFileComplexity(candidateFiles.slice(0, 20));
        // Calculate base success rate expectations
        const baseSuccessRate = this.calculateExpectedSuccessRate(fileAnalysis);
        // Historical data shows previous attempts achieved 1.7% reduction (30 fixes)
        // Target 10x improvement = 17% reduction (300 fixes)
        // But be realistic based on file analysis
        let recommendedTarget = 15; // Default 15% as per requirements
        const reasoning = [];
        // Adjust based on file complexity
        if (fileAnalysis.testFilePercentage > 30) {
            reasoning.push(`${fileAnalysis.testFilePercentage.toFixed(1)}% of files are test files - focusing on non-test files first`);
            recommendedTarget = Math.max(12, recommendedTarget - 3);
        }
        if (fileAnalysis.arrayTypePercentage > 20) {
            reasoning.push(`${fileAnalysis.arrayTypePercentage.toFixed(1)}% are array types with historically 100% success rate`);
            recommendedTarget = Math.min(20, recommendedTarget + 2);
        }
        if (fileAnalysis.recordTypePercentage > 15) {
            reasoning.push(`${fileAnalysis.recordTypePercentage.toFixed(1)}% are Record types with mixed success - being selective`);
            recommendedTarget = Math.max(10, recommendedTarget - 2);
        }
        if (fileAnalysis.functionParamPercentage > 25) {
            reasoning.push(`${fileAnalysis.functionParamPercentage.toFixed(1)}% are function parameters with high failure rate - being conservative`);
            recommendedTarget = Math.max(8, recommendedTarget - 5);
        }
        // Adjust based on historical batch performance if available
        if (this.batchHistory.length > 0) {
            const avgSuccessRate = this.batchHistory.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / this.batchHistory.length;
            if (avgSuccessRate > 0.8) {
                reasoning.push(`High historical success rate (${(avgSuccessRate * 100).toFixed(1)}%) - increasing target`);
                recommendedTarget = Math.min(25, recommendedTarget + 3);
            }
            else if (avgSuccessRate < 0.5) {
                reasoning.push(`Low historical success rate (${(avgSuccessRate * 100).toFixed(1)}%) - reducing target`);
                recommendedTarget = Math.max(5, recommendedTarget - 5);
            }
        }
        // Create realistic milestones
        const milestones = [
            {
                percentage: Math.floor(recommendedTarget * 0.25),
                description: 'Initial progress - focus on high-confidence array types',
                estimatedBatches: Math.ceil(candidateFiles.length * 0.1 / this.adaptiveConfig.maxFilesPerBatch)
            },
            {
                percentage: Math.floor(recommendedTarget * 0.5),
                description: 'Mid-point - expand to Record types and simple patterns',
                estimatedBatches: Math.ceil(candidateFiles.length * 0.3 / this.adaptiveConfig.maxFilesPerBatch)
            },
            {
                percentage: Math.floor(recommendedTarget * 0.75),
                description: 'Advanced progress - tackle more complex patterns',
                estimatedBatches: Math.ceil(candidateFiles.length * 0.6 / this.adaptiveConfig.maxFilesPerBatch)
            },
            {
                percentage: recommendedTarget,
                description: 'Target achievement - complete remaining high-confidence cases',
                estimatedBatches: Math.ceil(candidateFiles.length * 0.8 / this.adaptiveConfig.maxFilesPerBatch)
            }
        ];
        reasoning.push(`Recommended target: ${recommendedTarget}% reduction (${Math.floor(currentProgress.totalAnyTypes * recommendedTarget / 100)} fixes)`);
        reasoning.push(`Based on analysis of ${candidateFiles.length} files with any types`);
        // Update adaptive config with realistic target
        this.adaptiveConfig.targetReductionPercentage = recommendedTarget;
        return {
            recommendedTarget,
            reasoning,
            milestones
        };
    }
    /**
     * Monitor progress with realistic milestone tracking
     */
    async monitorProgress() {
        const currentProgress = await this.getCurrentProgress();
        const targetInfo = await this.setRealisticTargets();
        // Check milestone achievements
        const milestoneStatus = targetInfo.milestones.map(milestone => ({
            milestone: milestone.percentage,
            achieved: currentProgress.reductionPercentage >= milestone.percentage,
            description: milestone.description
        }));
        const recommendations = [];
        let needsManualIntervention = false;
        // Analyze if we need manual intervention
        if (this.batchHistory.length >= 5) {
            const recentBatches = this.batchHistory.slice(-5);
            const avgSuccessRate = recentBatches.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / recentBatches.length;
            const avgSafetyScore = recentBatches.reduce((sum, batch) => sum + batch.safetyScore, 0) / recentBatches.length;
            if (avgSuccessRate < 0.3) {
                needsManualIntervention = true;
                recommendations.push('Low success rate detected - consider manual review of remaining any types');
                recommendations.push('Focus on documenting intentional any types instead of replacement');
            }
            if (avgSafetyScore < 0.7) {
                needsManualIntervention = true;
                recommendations.push('Safety concerns detected - pause automated processing');
                recommendations.push('Review recent changes and consider rollback if necessary');
            }
            // Check for stagnation
            const recentProgress = recentBatches.reduce((sum, batch) => sum + batch.replacementsSuccessful, 0);
            if (recentProgress < 5 && recentBatches.length >= 3) {
                needsManualIntervention = true;
                recommendations.push('Progress has stagnated - remaining any types may require manual analysis');
                recommendations.push('Consider switching to documentation mode for remaining types');
            }
        }
        // Provide strategic recommendations based on current state
        if (currentProgress.reductionPercentage < 5) {
            recommendations.push('Early stage - focus on array types (any[]) for quick wins');
            recommendations.push('Increase confidence threshold to 0.9 for maximum safety');
        }
        else if (currentProgress.reductionPercentage < 10) {
            recommendations.push('Good progress - expand to Record<string, any> patterns');
            recommendations.push('Consider enabling domain-specific analysis for better suggestions');
        }
        else if (currentProgress.reductionPercentage >= targetInfo.recommendedTarget * 0.8) {
            recommendations.push('Approaching target - focus on documentation for remaining intentional types');
            recommendations.push('Consider manual review for complex remaining cases');
        }
        return {
            currentProgress,
            milestoneStatus,
            recommendations,
            needsManualIntervention
        };
    }
    /**
     * Analyze success rate and adapt strategy accordingly
     */
    analyzeSuccessRateAndAdapt() {
        if (this.batchHistory.length < 2) {
            return {
                currentSuccessRate: 0,
                trend: 'stable',
                adaptations: ['Insufficient data for trend analysis']
            };
        }
        const recentBatches = this.batchHistory.slice(-5);
        const currentSuccessRate = recentBatches.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / recentBatches.length;
        // Determine trend
        let trend = 'stable';
        const adaptations = [];
        if (recentBatches.length >= 3) {
            const firstHalf = recentBatches.slice(0, Math.floor(recentBatches.length / 2));
            const secondHalf = recentBatches.slice(Math.floor(recentBatches.length / 2));
            const firstHalfRate = firstHalf.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / firstHalf.length;
            const secondHalfRate = secondHalf.reduce((sum, batch) => sum + (batch.replacementsSuccessful / Math.max(1, batch.replacementsAttempted)), 0) / secondHalf.length;
            if (secondHalfRate > firstHalfRate + 0.1) {
                trend = 'improving';
                adaptations.push('Success rate improving - consider increasing batch size');
            }
            else if (secondHalfRate < firstHalfRate - 0.1) {
                trend = 'declining';
                adaptations.push('Success rate declining - reducing batch size and increasing confidence threshold');
                // Apply adaptations
                this.adaptiveConfig.maxFilesPerBatch = Math.max(5, Math.floor(this.adaptiveConfig.maxFilesPerBatch * 0.8));
                this.adaptiveConfig.confidenceThreshold = Math.min(0.95, this.adaptiveConfig.confidenceThreshold + 0.1);
            }
        }
        // Success rate based adaptations
        if (currentSuccessRate < 0.3) {
            adaptations.push('Very low success rate - switching to documentation mode recommended');
            adaptations.push('Consider manual review of remaining any types');
        }
        else if (currentSuccessRate < 0.5) {
            adaptations.push('Low success rate - increasing confidence threshold to 0.9');
            this.adaptiveConfig.confidenceThreshold = Math.min(0.95, this.adaptiveConfig.confidenceThreshold + 0.1);
        }
        else if (currentSuccessRate > 0.8) {
            adaptations.push('High success rate - can afford to be more aggressive');
            this.adaptiveConfig.confidenceThreshold = Math.max(0.7, this.adaptiveConfig.confidenceThreshold - 0.05);
        }
        return {
            currentSuccessRate,
            trend,
            adaptations
        };
    }
    /**
     * Execute a single batch of improvements with adaptive sizing
     */
    async executeBatch(config) {
        const startTime = Date.now();
        this.batchCounter++;
        // Use adaptive config if no config provided, or merge with provided config
        const effectiveConfig = config ? { ...this.adaptiveConfig, ...config } : this.adaptiveConfig;
        const batchMetrics = {
            batchNumber: this.batchCounter,
            filesProcessed: 0,
            anyTypesAnalyzed: 0,
            replacementsAttempted: 0,
            replacementsSuccessful: 0,
            compilationErrors: 0,
            rollbacksPerformed: 0,
            executionTime: 0,
            safetyScore: 1.0
        };
        try {
            // Create safety checkpoint before starting
            await this.createSafetyCheckpoint();
            // Get initial TypeScript error count for safety monitoring
            const initialErrorCount = await this.getTypeScriptErrorCount();
            // Find files with explicit any types
            const candidateFiles = await this.findFilesWithAnyTypes();
            const filesToProcess = candidateFiles
                .filter(file => !this.processedFiles.has(file))
                .slice(0, effectiveConfig.maxFilesPerBatch);
            if (filesToProcess.length === 0) {
                console.log('No more files to process in this batch');
                batchMetrics.executionTime = Date.now() - startTime;
                this.batchHistory.push(batchMetrics);
                return batchMetrics;
            }
            console.log(`Processing batch ${this.batchCounter}: ${filesToProcess.length} files (adaptive batch size: ${effectiveConfig.maxFilesPerBatch})`);
            // Process each file
            for (const filePath of filesToProcess) {
                try {
                    const fileResult = await this.processFile(filePath, effectiveConfig);
                    batchMetrics.filesProcessed++;
                    batchMetrics.anyTypesAnalyzed += fileResult.anyTypesAnalyzed;
                    batchMetrics.replacementsAttempted += fileResult.replacementsAttempted;
                    batchMetrics.replacementsSuccessful += fileResult.replacementsSuccessful;
                    if (fileResult.rollbackPerformed) {
                        batchMetrics.rollbacksPerformed++;
                    }
                    this.processedFiles.add(filePath);
                    // Validate build every few files based on adaptive config
                    if (batchMetrics.filesProcessed % effectiveConfig.validationFrequency === 0) {
                        console.log(`Safety checkpoint: validating build after ${batchMetrics.filesProcessed} files`);
                        const currentErrorCount = await this.getTypeScriptErrorCount();
                        // Safety check: ensure we're not increasing errors significantly
                        if (currentErrorCount > initialErrorCount + 5) { // Allow small increase for temporary states
                            console.warn(`Error count increased from ${initialErrorCount} to ${currentErrorCount}, pausing batch`);
                            batchMetrics.compilationErrors = currentErrorCount - initialErrorCount;
                            batchMetrics.safetyScore = Math.max(0, 1 - (batchMetrics.compilationErrors / 10));
                            break;
                        }
                    }
                }
                catch (error) {
                    console.error(`Failed to process file ${filePath}:`, error);
                    batchMetrics.rollbacksPerformed++;
                }
            }
            // Final safety validation
            const finalErrorCount = await this.getTypeScriptErrorCount();
            if (finalErrorCount > initialErrorCount) {
                batchMetrics.compilationErrors = finalErrorCount - initialErrorCount;
                batchMetrics.safetyScore = Math.max(0, 1 - (batchMetrics.compilationErrors / 20));
            }
            batchMetrics.executionTime = Date.now() - startTime;
            // Store batch metrics for adaptive strategy
            this.batchHistory.push(batchMetrics);
            // Calculate success rate for this batch
            const successRate = batchMetrics.replacementsAttempted > 0
                ? batchMetrics.replacementsSuccessful / batchMetrics.replacementsAttempted
                : 0;
            console.log(`Batch ${this.batchCounter} completed:`, {
                filesProcessed: batchMetrics.filesProcessed,
                replacementsSuccessful: batchMetrics.replacementsSuccessful,
                successRate: `${(successRate * 100).toFixed(1)}%`,
                safetyScore: batchMetrics.safetyScore.toFixed(2),
                executionTime: `${(batchMetrics.executionTime / 1000).toFixed(1)}s`
            });
            // Adapt strategy based on performance
            this.adaptStrategy();
            return batchMetrics;
        }
        catch (error) {
            console.error(`Batch ${this.batchCounter} failed:`, error);
            batchMetrics.executionTime = Date.now() - startTime;
            batchMetrics.safetyScore = 0;
            this.batchHistory.push(batchMetrics);
            return batchMetrics;
        }
    }
    /**
     * Execute the full campaign with progressive improvement and adaptive strategies
     */
    async executeFullCampaign(config) {
        const campaignStart = Date.now();
        // Use adaptive config if no config provided, or merge with provided config
        const effectiveConfig = config ? { ...this.adaptiveConfig, ...config } : this.adaptiveConfig;
        const initialProgress = await this.getCurrentProgress();
        console.log('Starting Unintentional Any Elimination Campaign');
        console.log(`Initial state: ${initialProgress.totalAnyTypes} any types found`);
        console.log(`Target: ${effectiveConfig.targetReductionPercentage}% reduction`);
        console.log(`Initial batch size: ${effectiveConfig.maxFilesPerBatch}, confidence threshold: ${effectiveConfig.confidenceThreshold}`);
        const result = {
            totalAnyTypesAnalyzed: 0,
            intentionalTypesIdentified: 0,
            unintentionalTypesReplaced: 0,
            documentationAdded: 0,
            reductionAchieved: 0,
            safetyEvents: [],
            validationResults: []
        };
        let batchCount = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;
        const maxBatches = 50; // Safety limit
        while (batchCount < maxBatches && consecutiveFailures < maxConsecutiveFailures) {
            try {
                console.log(`\n--- Starting batch ${batchCount + 1} ---`);
                const batchMetrics = await this.executeBatch();
                batchCount++;
                result.totalAnyTypesAnalyzed += batchMetrics.anyTypesAnalyzed;
                result.unintentionalTypesReplaced += batchMetrics.replacementsSuccessful;
                // Check if we should continue
                if (batchMetrics.filesProcessed === 0) {
                    console.log('No more files to process, campaign complete');
                    break;
                }
                // Safety check with adaptive response
                if (batchMetrics.safetyScore < 0.7) {
                    console.warn(`Low safety score (${batchMetrics.safetyScore.toFixed(2)}), adapting strategy`);
                    consecutiveFailures++;
                    result.safetyEvents.push({
                        type: 'LOW_SAFETY_SCORE',
                        timestamp: new Date(),
                        description: `Safety score ${batchMetrics.safetyScore.toFixed(2)} below threshold`,
                        severity: 'warning',
                        batchNumber: batchCount
                    });
                }
                else {
                    consecutiveFailures = 0;
                }
                // Check progress towards target with detailed reporting
                const currentProgress = await this.getCurrentProgress();
                const reductionAchieved = initialProgress.totalAnyTypes > 0
                    ? ((initialProgress.totalAnyTypes - currentProgress.totalAnyTypes) / initialProgress.totalAnyTypes) * 100
                    : 0;
                console.log(`\nProgress Report:`);
                console.log(`  Reduction achieved: ${reductionAchieved.toFixed(1)}% (target: ${effectiveConfig.targetReductionPercentage}%)`);
                console.log(`  Types replaced: ${result.unintentionalTypesReplaced}`);
                console.log(`  Batches completed: ${batchCount}`);
                console.log(`  Current batch size: ${this.adaptiveConfig.maxFilesPerBatch}`);
                console.log(`  Current confidence threshold: ${this.adaptiveConfig.confidenceThreshold.toFixed(2)}`);
                if (reductionAchieved >= effectiveConfig.targetReductionPercentage) {
                    console.log('\n🎉 Target reduction achieved!');
                    break;
                }
                // Brief pause between batches for system stability
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            catch (error) {
                console.error(`Campaign batch ${batchCount + 1} failed:`, error);
                consecutiveFailures++;
                result.safetyEvents.push({
                    type: 'BATCH_FAILURE',
                    timestamp: new Date(),
                    description: `Batch ${batchCount + 1} failed: ${error.message}`,
                    severity: 'error',
                    batchNumber: batchCount + 1
                });
            }
        }
        // Calculate final results with comprehensive metrics
        const finalProgress = await this.getCurrentProgress();
        result.reductionAchieved = initialProgress.totalAnyTypes > 0
            ? ((initialProgress.totalAnyTypes - finalProgress.totalAnyTypes) / initialProgress.totalAnyTypes) * 100
            : 0;
        result.intentionalTypesIdentified = finalProgress.classifiedIntentional;
        // Calculate average success rate from batch history
        const totalAttempted = this.batchHistory.reduce((sum, batch) => sum + batch.replacementsAttempted, 0);
        const totalSuccessful = this.batchHistory.reduce((sum, batch) => sum + batch.replacementsSuccessful, 0);
        const overallSuccessRate = totalAttempted > 0 ? (totalSuccessful / totalAttempted) * 100 : 0;
        const campaignTime = Date.now() - campaignStart;
        console.log(`\n=== Campaign Summary ===`);
        console.log(`Duration: ${(campaignTime / 1000).toFixed(1)}s`);
        console.log(`Batches processed: ${batchCount}`);
        console.log(`Files processed: ${this.processedFiles.size}`);
        console.log(`Reduction achieved: ${result.reductionAchieved.toFixed(1)}%`);
        console.log(`Types replaced: ${result.unintentionalTypesReplaced}`);
        console.log(`Overall success rate: ${overallSuccessRate.toFixed(1)}%`);
        console.log(`Safety events: ${result.safetyEvents.length}`);
        console.log(`Final batch size: ${this.adaptiveConfig.maxFilesPerBatch}`);
        console.log(`Final confidence threshold: ${this.adaptiveConfig.confidenceThreshold.toFixed(2)}`);
        return result;
    }
    async processFile(filePath, config) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        // Find all any type usages in the file
        const anyTypeContexts = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.containsAnyType(line)) {
                const context = {
                    filePath,
                    lineNumber: i + 1,
                    codeSnippet: line,
                    surroundingLines: this.getSurroundingLines(lines, i, 2),
                    hasExistingComment: this.hasCommentAbove(lines, i),
                    existingComment: this.getCommentAbove(lines, i),
                    isInTestFile: this.isTestFile(filePath),
                    domainContext: await this.analyzer.analyzeDomain({
                        filePath,
                        lineNumber: i + 1,
                        codeSnippet: line,
                        surroundingLines: this.getSurroundingLines(lines, i, 2),
                        hasExistingComment: false,
                        isInTestFile: this.isTestFile(filePath),
                        domainContext: { domain: 'utility', intentionalityHints: [], suggestedTypes: [], preservationReasons: [] }
                    })
                };
                anyTypeContexts.push(context);
            }
        }
        if (anyTypeContexts.length === 0) {
            return {
                anyTypesAnalyzed: 0,
                replacementsAttempted: 0,
                replacementsSuccessful: 0,
                rollbackPerformed: false
            };
        }
        // Classify all any types in the file
        const classifications = await this.classifier.classifyBatch(anyTypeContexts);
        // Create replacements for unintentional any types
        const replacements = [];
        for (let i = 0; i < classifications.length; i++) {
            const classification = classifications[i];
            const context = anyTypeContexts[i];
            if (!classification.isIntentional &&
                classification.confidence >= config.confidenceThreshold &&
                classification.suggestedReplacement) {
                replacements.push({
                    original: 'any',
                    replacement: classification.suggestedReplacement,
                    filePath: context.filePath,
                    lineNumber: context.lineNumber,
                    confidence: classification.confidence,
                    validationRequired: true
                });
            }
        }
        // Apply replacements
        let replacementsSuccessful = 0;
        let rollbackPerformed = false;
        if (replacements.length > 0) {
            const result = await this.replacer.processBatch(replacements);
            replacementsSuccessful = result.appliedReplacements.length;
            rollbackPerformed = result.rollbackPerformed;
        }
        return {
            anyTypesAnalyzed: anyTypeContexts.length,
            replacementsAttempted: replacements.length,
            replacementsSuccessful,
            rollbackPerformed
        };
    }
    async findFilesWithAnyTypes() {
        try {
            // Use grep to find files with explicit any types, excluding node_modules and test files initially
            const output = (0, child_process_1.execSync)('grep -r -l ":\\s*any" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules | head -100', { encoding: 'utf8', stdio: 'pipe' });
            return output.trim().split('\n').filter(line => line.trim().length > 0);
        }
        catch (error) {
            console.warn('Failed to find files with any types, using fallback method');
            return this.findFilesWithAnyTypesFallback();
        }
    }
    findFilesWithAnyTypesFallback() {
        const files = [];
        const srcDir = path.join(process.cwd(), 'src');
        const walkDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    walkDir(fullPath);
                }
                else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes(': any') || content.includes('any[]') || content.includes('Record<string, any>')) {
                            files.push(fullPath);
                        }
                    }
                    catch (error) {
                        // Skip files that can't be read
                    }
                }
            }
        };
        if (fs.existsSync(srcDir)) {
            walkDir(srcDir);
        }
        return files.slice(0, 100); // Limit to prevent overwhelming
    }
    containsAnyType(line) {
        // Match various any type patterns
        const anyPatterns = [
            /:\s*any(?=\s*[=;,\)\]\}])/,
            /:\s*any\[\]/,
            /:\s*Array<any>/,
            /:\s*Record<\w+,\s*any>/,
            /\[key:\s*\w+\]:\s*any/ // [key: string]: any
        ];
        return anyPatterns.some(pattern => pattern.test(line));
    }
    getSurroundingLines(lines, index, radius) {
        const start = Math.max(0, index - radius);
        const end = Math.min(lines.length, index + radius + 1);
        return lines.slice(start, end);
    }
    hasCommentAbove(lines, index) {
        if (index === 0)
            return false;
        const prevLine = lines[index - 1].trim();
        return prevLine.startsWith('//') || prevLine.startsWith('/*') || prevLine.includes('*/');
    }
    getCommentAbove(lines, index) {
        if (!this.hasCommentAbove(lines, index))
            return undefined;
        return lines[index - 1].trim();
    }
    isTestFile(filePath) {
        return filePath.includes('test') ||
            filePath.includes('spec') ||
            filePath.includes('__tests__') ||
            filePath.endsWith('.test.ts') ||
            filePath.endsWith('.test.tsx') ||
            filePath.endsWith('.spec.ts') ||
            filePath.endsWith('.spec.tsx');
    }
    async getTypeScriptErrorCount() {
        try {
            const output = (0, child_process_1.execSync)('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            return parseInt(output.trim()) || 0;
        }
        catch (error) {
            // If grep finds no matches, it returns exit code 1, but that means 0 errors
            const errorData = error;
            if (errorData.status === 1) {
                return 0;
            }
            console.warn('Could not get TypeScript error count:', error);
            return -1; // Indicates measurement failure
        }
    }
    /**
     * Analyze file complexity to set realistic expectations
     */
    async analyzeFileComplexity(files) {
        let testFiles = 0;
        let arrayTypes = 0;
        let recordTypes = 0;
        let functionParams = 0;
        let totalAnyTypes = 0;
        for (const filePath of files) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                if (this.isTestFile(filePath)) {
                    testFiles++;
                }
                for (const line of lines) {
                    if (this.containsAnyType(line)) {
                        totalAnyTypes++;
                        if (line.includes('any[]') || line.includes('Array<any>')) {
                            arrayTypes++;
                        }
                        else if (line.includes('Record<') && line.includes('any>')) {
                            recordTypes++;
                        }
                        else if (line.includes('(') && line.includes(': any') && line.includes(')')) {
                            functionParams++;
                        }
                    }
                }
            }
            catch (error) {
                // Skip files that can't be read
            }
        }
        const testFilePercentage = files.length > 0 ? (testFiles / files.length) * 100 : 0;
        const arrayTypePercentage = totalAnyTypes > 0 ? (arrayTypes / totalAnyTypes) * 100 : 0;
        const recordTypePercentage = totalAnyTypes > 0 ? (recordTypes / totalAnyTypes) * 100 : 0;
        const functionParamPercentage = totalAnyTypes > 0 ? (functionParams / totalAnyTypes) * 100 : 0;
        // Calculate complexity score (0-1, where 1 is most complex)
        const complexityScore = Math.min(1, (testFilePercentage * 0.1 + // Test files are easier
            functionParamPercentage * 0.4 + // Function params are harder
            recordTypePercentage * 0.2) / 100 // Record types are moderate
        );
        return {
            testFilePercentage,
            arrayTypePercentage,
            recordTypePercentage,
            functionParamPercentage,
            complexityScore
        };
    }
    /**
     * Calculate expected success rate based on file analysis
     */
    calculateExpectedSuccessRate(analysis) {
        // Base success rate expectations based on historical data
        let expectedRate = 0.6; // 60% base expectation
        // Array types have historically 100% success rate
        expectedRate += (analysis.arrayTypePercentage / 100) * 0.4;
        // Record types have mixed results - moderate boost
        expectedRate += (analysis.recordTypePercentage / 100) * 0.1;
        // Function parameters have high failure rate - penalty
        expectedRate -= (analysis.functionParamPercentage / 100) * 0.3;
        // Test files are generally easier but less impactful
        expectedRate += (analysis.testFilePercentage / 100) * 0.1;
        return Math.max(0.2, Math.min(0.9, expectedRate));
    }
    async getCurrentProgress() {
        const totalFiles = await this.findFilesWithAnyTypes();
        let totalAnyTypes = 0;
        // Count total any types across all files (sample for performance)
        const sampleSize = Math.min(30, totalFiles.length);
        for (const filePath of totalFiles.slice(0, sampleSize)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                totalAnyTypes += lines.filter(line => this.containsAnyType(line)).length;
            }
            catch (error) {
                // Skip files that can't be read
            }
        }
        // Estimate total based on sample
        const estimatedTotal = sampleSize > 0
            ? Math.floor((totalAnyTypes / sampleSize) * totalFiles.length)
            : 0;
        // Calculate metrics from batch history
        const totalReplacements = this.batchHistory.reduce((sum, batch) => sum + batch.replacementsSuccessful, 0);
        const totalAttempted = this.batchHistory.reduce((sum, batch) => sum + batch.replacementsAttempted, 0);
        const averageSuccessRate = totalAttempted > 0 ? totalReplacements / totalAttempted : 0;
        // Calculate reduction percentage
        const reductionPercentage = estimatedTotal > 0 ? (totalReplacements / estimatedTotal) * 100 : 0;
        // Get current TypeScript error count for comprehensive metrics
        const currentTSErrors = await this.getTypeScriptErrorCount();
        return {
            totalAnyTypes: estimatedTotal,
            classifiedIntentional: 0,
            classifiedUnintentional: totalAttempted,
            successfulReplacements: totalReplacements,
            documentedIntentional: 0,
            remainingUnintentional: Math.max(0, estimatedTotal - totalReplacements),
            reductionPercentage,
            targetReductionPercentage: this.adaptiveConfig.targetReductionPercentage,
            batchesCompleted: this.batchCounter,
            averageSuccessRate,
            // Base ProgressMetrics properties
            typeScriptErrors: {
                current: currentTSErrors >= 0 ? currentTSErrors : 0,
                target: 0,
                reduction: 0,
                percentage: 0
            },
            lintingWarnings: { current: 0, target: 0, reduction: 0, percentage: 0 },
            buildPerformance: { currentTime: 0, targetTime: 0, cacheHitRate: 0, memoryUsage: 0 },
            enterpriseSystems: { current: 0, target: 0, transformedExports: 0 }
        };
    }
}
exports.ProgressiveImprovementEngine = ProgressiveImprovementEngine;
