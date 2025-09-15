#!/usr/bin/env npx tsx

/**
 * Monitoring Validation Script
 *
 * Validates that monitoring and alerting systems are properly configured
 * and functioning correctly.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

/**
 * Validate monitoring setup
 */
async function validateMonitoring(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Check monitoring directories
  results.push(validateDirectories());

  // Check configuration files
  results.push(validateConfiguration());

  // Check monitoring service
  results.push(validateMonitoringService());

  // Check dashboard
  results.push(validateDashboard());

  // Check startup scripts
  results.push(validateStartupScripts());

  // Check health check endpoints
  results.push(...(await validateHealthChecks()));

  return results;
}

/**
 * Validate monitoring directories exist
 */
function validateDirectories(): ValidationResult {
  const requiredDirs = ['.kiro/logs', '.kiro/metrics', '.kiro/monitoring', '.kiro/alerts'];

  const missingDirs = requiredDirs.filter(dir => !existsSync(dir));

  if (missingDirs.length === 0) {;
    return {
      component: 'Directories',
      status: 'pass',
      message: 'All monitoring directories exist'
    };
  } else {
    return {
      component: 'Directories',
      status: 'fail',
      message: `Missing directories: ${missingDirs.join(', ')}`,
      details: 'Run setup-monitoring.ts to create missing directories'
    };
  }
}

/**
 * Validate configuration files
 */
function validateConfiguration(): ValidationResult {
  const configPath = '.kiro/monitoring/monitoring-config.json';

  if (!existsSync(configPath)) {
    return {
      component: 'Configuration',
      status: 'fail',
      message: 'Monitoring configuration file not found',
      details: `Expected: ${configPath}`
    };
  }

  try {
    const configContent = readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    // Validate required sections
    const requiredSections = ['metrics', 'alerts', 'logging', 'healthChecks'];
    const missingSections = requiredSections.filter(section => !config[section]);

    if (missingSections.length > 0) {
      return {
        component: 'Configuration',
        status: 'fail',
        message: `Missing configuration sections: ${missingSections.join(', ')}`
      };
    }

    // Validate metrics configuration
    if (!config.metrics.enabled) {
      return {
        component: 'Configuration',
        status: 'warning',
        message: 'Metrics collection is disabled'
      };
    }

    // Validate alerts configuration
    if (!config.alerts.enabled) {
      return {
        component: 'Configuration',
        status: 'warning',
        message: 'Alerts are disabled'
      };
    }

    return {
      component: 'Configuration',
      status: 'pass',
      message: 'Monitoring configuration is valid'
    };
  } catch (error) {
    return {
      component: 'Configuration',
      status: 'fail',
      message: 'Invalid monitoring configuration JSON',
      details: String(error)
    };
  }
}

/**
 * Validate monitoring service
 */
function validateMonitoringService(): ValidationResult {
  const servicePath = '.kiro/monitoring/UnintentionalAnyMonitoringService.ts';

  if (!existsSync(servicePath)) {
    return {
      component: 'Monitoring Service',
      status: 'fail',
      message: 'Monitoring service file not found',
      details: `Expected: ${servicePath}`
    };
  }

  try {
    // Try to compile the service (basic syntax check)
    execSync(`npx tsc --noEmit ${servicePath}`, { stdio: 'pipe' });

    return {
      component: 'Monitoring Service',
      status: 'pass',
      message: 'Monitoring service is valid'
    };
  } catch (error) {
    return {
      component: 'Monitoring Service',
      status: 'fail',
      message: 'Monitoring service has compilation errors',
      details: String(error)
    };
  }
}

/**
 * Validate dashboard
 */
function validateDashboard(): ValidationResult {
  const dashboardPath = '.kiro/monitoring/dashboard.ts';

  if (!existsSync(dashboardPath)) {
    return {
      component: 'Dashboard',
      status: 'fail',
      message: 'Monitoring dashboard not found',
      details: `Expected: ${dashboardPath}`
    };
  }

  try {
    // Try to compile the dashboard (basic syntax check)
    execSync(`npx tsc --noEmit ${dashboardPath}`, { stdio: 'pipe' });

    return {
      component: 'Dashboard',
      status: 'pass',
      message: 'Monitoring dashboard is valid'
    };
  } catch (error) {
    return {
      component: 'Dashboard',
      status: 'fail',
      message: 'Dashboard has compilation errors',
      details: String(error)
    };
  }
}

/**
 * Validate startup scripts
 */
function validateStartupScripts(): ValidationResult {
  const startupScript = '.kiro/monitoring/start-monitoring.sh';

  if (!existsSync(startupScript)) {
    return {
      component: 'Startup Scripts',
      status: 'fail',
      message: 'Monitoring startup script not found',
      details: `Expected: ${startupScript}`
    };
  }

  try {
    // Check if script is accessible (basic check)
    const _stats = statSync(startupScript);
    // Note: This is a basic check, actual executable permission checking is platform-specific

    return {
      component: 'Startup Scripts',
      status: 'pass',
      message: 'Startup scripts are available'
    };
  } catch (error) {
    return {
      component: 'Startup Scripts',
      status: 'warning',
      message: 'Could not validate startup script permissions',
      details: String(error)
    };
  }
}

/**
 * Validate health check endpoints
 */
async function validateHealthChecks(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Load configuration to get health check endpoints
  const configPath = '.kiro/monitoring/monitoring-config.json';
  if (!existsSync(configPath)) {
    return [
      {
        component: 'Health Checks',
        status: 'fail',
        message: 'Cannot validate health checks - configuration not found'
      }
    ];
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const healthChecks = config.healthChecks?.endpoints || [];

    if (healthChecks.length === 0) {;
      return [
        {
          component: 'Health Checks',
          status: 'warning',
          message: 'No health check endpoints configured'
        }
      ];
    }

    // Test each health check endpoint
    for (const endpoint of healthChecks) {
      try {
        const command = `${endpoint.command} ${endpoint.args.join(' ')}`;
        execSync(command, {
          stdio: 'pipe',
          timeout: Math.min(endpoint.timeout, 30000), // Cap at 30 seconds for validation
        });

        results.push({
          component: `Health Check: ${endpoint.name}`,
          status: 'pass',
          message: `Health check endpoint is responding`
        });
      } catch (error) {
        results.push({
          component: `Health Check: ${endpoint.name}`,
          status: 'fail',
          message: `Health check endpoint failed`,
          details: String(error)
        });
      }
    }
  } catch (error) {
    results.push({
      component: 'Health Checks',
      status: 'fail',
      message: 'Error validating health checks',
      details: String(error)
    });
  }

  return results;
}

/**
 * Display validation results
 */
function displayResults(results: ValidationResult[]): void {
  // console.log('='.repeat(80));
  // console.log('  MONITORING VALIDATION RESULTS');
  // console.log('='.repeat(80));

  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';

    // console.log(`\n${icon} ${result.component}: ${result.message}`);

    if (result.details) {
      // console.log(`   Details: ${result.details}`);
    }

    switch (result.status) {
      case 'pass':
        passCount++;
        break;
      case 'fail':
        failCount++;
        break;
      case 'warning':
        warningCount++;
        break;
    }
  }

  // console.log('\n' + '='.repeat(80));
  // console.log(`SUMMARY: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`);

  if (failCount > 0) {
    // console.log('\n❌ Monitoring validation FAILED');
    // console.log('Please fix the issues above before proceeding with deployment.');
    process.exit(1);
  } else if (warningCount > 0) {
    // console.log('\n⚠️  Monitoring validation passed with WARNINGS');
    // console.log('Consider addressing the warnings for optimal monitoring.');
  } else {
    // console.log('\n✅ Monitoring validation PASSED');
    // console.log('All monitoring components are properly configured.');
  }
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  // console.log('Validating monitoring and alerting setup...\n');

  try {
    const results = await validateMonitoring();
    displayResults(results);
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {;
  main();
}

export { validateMonitoring };
