#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * TypeScript Error Monitor Script
 * Checks current TypeScript error count and triggers campaign if needed
 */

async function checkTypeScriptErrors() {
  console.log('🔍 Checking TypeScript errors...');
  
  try {
    // Get current error count
    const errorCount = await getTypeScriptErrorCount();
    console.log(`📊 Current TypeScript errors: ${errorCount}`);
    
    // Get error breakdown for analysis
    const errorBreakdown = await getTypeScriptErrorBreakdown();
    console.log('📋 Error breakdown:', errorBreakdown);
    
    // Check if campaign should be triggered
    const threshold = process.env.TS_ERROR_THRESHOLD || 100;
    
    if (errorCount > threshold) {
      console.log(`🚨 Error count (${errorCount}) exceeds threshold (${threshold})`);
      
      // Log campaign trigger
      await logCampaignTrigger(errorCount, errorBreakdown);
      
      // Check if campaign system is available
      if (await isCampaignSystemAvailable()) {
        console.log('🚀 Triggering TypeScript error reduction campaign...');
        await triggerErrorReductionCampaign(errorCount, errorBreakdown);
      } else {
        console.log('⚠️ Campaign system not available, logging for manual review');
        await createManualReviewTask(errorCount, errorBreakdown);
      }
    } else {
      console.log('✅ TypeScript error count within acceptable range');
    }
    
  } catch (error) {
    console.error('❌ Error checking TypeScript errors:', error.message);
    process.exit(1);
  }
}

async function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    // Handle grep exit code 1 (no matches = 0 errors)
    return error.status === 1 ? 0 : -1;
  }
}

async function getTypeScriptErrorBreakdown() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed \'s/.*error //\' | cut -d\':\' -f1 | sort | uniq -c | sort -nr',
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const breakdown = {};
    const lines = output.trim().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        breakdown[match[2].trim()] = parseInt(match[1]);
      }
    }
    
    return breakdown;
  } catch (error) {
    console.warn('Could not get error breakdown:', error.message);
    return {};
  }
}

async function logCampaignTrigger(errorCount, errorBreakdown) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    trigger: 'typescript-error-threshold',
    errorCount,
    errorBreakdown,
    threshold: process.env.TS_ERROR_THRESHOLD || 100
  };
  
  const logPath = path.join(process.cwd(), 'logs', 'campaign-triggers.log');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append log entry
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
}

async function isCampaignSystemAvailable() {
  try {
    const campaignControllerPath = path.join(process.cwd(), 'src/services/campaign/CampaignController.ts');
    return fs.existsSync(campaignControllerPath);
  } catch (error) {
    return false;
  }
}

async function triggerErrorReductionCampaign(errorCount, errorBreakdown) {
  try {
    // Create campaign configuration
    const campaignConfig = {
      type: 'typescript-error-elimination',
      priority: 'high',
      errorCount,
      errorBreakdown,
      safetyLevel: 'MAXIMUM',
      batchSize: 15,
      validationFrequency: 5
    };
    
    // Write campaign trigger file
    const triggerPath = path.join(process.cwd(), '.kiro', 'campaign-triggers', `ts-errors-${Date.now()}.json`);
    const triggerDir = path.dirname(triggerPath);
    
    if (!fs.existsSync(triggerDir)) {
      fs.mkdirSync(triggerDir, { recursive: true });
    }
    
    fs.writeFileSync(triggerPath, JSON.stringify(campaignConfig, null, 2));
    console.log(`📝 Campaign trigger created: ${triggerPath}`);
    
  } catch (error) {
    console.error('Failed to trigger campaign:', error.message);
    throw error;
  }
}

async function createManualReviewTask(errorCount, errorBreakdown) {
  const taskPath = path.join(process.cwd(), '.kiro', 'manual-tasks', `ts-errors-review-${Date.now()}.md`);
  const taskDir = path.dirname(taskPath);
  
  if (!fs.existsSync(taskDir)) {
    fs.mkdirSync(taskDir, { recursive: true });
  }
  
  const taskContent = `# TypeScript Error Review Task

**Generated**: ${new Date().toISOString()}
**Error Count**: ${errorCount}
**Threshold**: ${process.env.TS_ERROR_THRESHOLD || 100}

## Error Breakdown

${Object.entries(errorBreakdown)
  .map(([errorType, count]) => `- **${errorType}**: ${count} errors`)
  .join('\n')}

## Recommended Actions

1. Review high-frequency error types
2. Consider running targeted error reduction campaign
3. Update error threshold if appropriate
4. Validate error patterns for systematic fixes

## Campaign Configuration

\`\`\`json
{
  "type": "typescript-error-elimination",
  "errorCount": ${errorCount},
  "safetyLevel": "MAXIMUM",
  "batchSize": 15
}
\`\`\`
`;
  
  fs.writeFileSync(taskPath, taskContent);
  console.log(`📋 Manual review task created: ${taskPath}`);
}

// Run if called directly
if (require.main === module) {
  checkTypeScriptErrors().catch(console.error);
}

module.exports = { checkTypeScriptErrors, getTypeScriptErrorCount, getTypeScriptErrorBreakdown };