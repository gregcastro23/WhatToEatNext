#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Parallel Development Accelerator
 * Orchestrates multiple improvement processes simultaneously while maintaining Docker robustness
 */

class ParallelDevelopmentAccelerator {
  constructor(options = {}) {
    this.enableDockerOptimization = options.enableDockerOptimization !== false;
    this.enableParallelProcessing = options.enableParallelProcessing !== false;
    this.enableContinuousImprovement = options.enableContinuousImprovement !== false;
    this.maxParallelTasks = options.maxParallelTasks || 4;
    this.dockerHealthChecks = options.dockerHealthChecks !== false;
    this.buildValidation = options.buildValidation !== false;
    
    this.activeProcesses = new Map();
    this.metrics = {
      startTime: Date.now(),
      tasksCompleted: 0,
      tasksRunning: 0,
      dockerOptimizations: 0,
      buildImprovements: 0,
      codeQualityFixes: 0
    };
  }

  async accelerateParallelDevelopment() {
    console.log('🚀 Starting Parallel Development Accelerator...');
    
    try {
      // Initialize system state
      await this.initializeSystemState();
      
      // Start parallel processes
      const parallelTasks = await this.orchestrateParallelTasks();
      
      // Monitor and optimize Docker
      if (this.enableDockerOptimization) {
        await this.optimizeDockerEnvironment();
      }
      
      // Execute parallel improvements
      await this.executeParallelImprovements(parallelTasks);
      
      // Generate comprehensive report
      await this.generateAccelerationReport();
      
      console.log('✅ Parallel Development Acceleration completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Parallel Development Acceleration failed:', error.message);
      await this.handleAccelerationError(error);
      return false;
    }
  }

  async initializeSystemState() {
    console.log('🔍 Initializing system state...');
    
    // Check current project health
    const systemHealth = await this.assessSystemHealth();
    
    // Ensure Docker environment is ready
    if (this.enableDockerOptimization) {
      await this.ensureDockerReadiness();
    }
    
    // Create necessary directories
    await this.ensureDirectoryStructure();
    
    console.log(`✅ System initialized - Health Score: ${systemHealth.score}/100`);
  }

  async assessSystemHealth() {
    const health = {
      score: 0,
      typescript: { errors: 0, status: 'unknown' },
      linting: { warnings: 0, status: 'unknown' },
      build: { status: 'unknown' },
      docker: { status: 'unknown' },
      tests: { status: 'unknown' }
    };

    try {
      // TypeScript health
      health.typescript.errors = await this.getTypeScriptErrorCount();
      health.typescript.status = health.typescript.errors < 100 ? 'good' : 
                                 health.typescript.errors < 500 ? 'warning' : 'critical';
      
      // Linting health
      health.linting.warnings = await this.getLintingWarningCount();
      health.linting.status = health.linting.warnings < 100 ? 'good' : 
                             health.linting.warnings < 1000 ? 'warning' : 'critical';
      
      // Build health
      health.build.status = await this.checkBuildHealth();
      
      // Docker health
      if (this.enableDockerOptimization) {
        health.docker.status = await this.checkDockerHealth();
      }
      
      // Calculate overall score
      health.score = this.calculateHealthScore(health);
      
    } catch (error) {
      console.warn('⚠️ Health assessment incomplete:', error.message);
    }

    return health;
  }

  async getTypeScriptErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return error.status === 1 ? 0 : -1;
    }
  }

  async getLintingWarningCount() {
    try {
      const output = execSync('yarn eslint src --config eslint.config.cjs --format json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      const results = JSON.parse(output);
      return results.reduce((total, file) => total + file.warningCount, 0);
    } catch (error) {
      return -1;
    }
  }

  async checkBuildHealth() {
    try {
      execSync('yarn build:health', { stdio: 'pipe' });
      return 'good';
    } catch (error) {
      return 'needs-repair';
    }
  }

  async checkDockerHealth() {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      execSync('docker-compose --version', { stdio: 'pipe' });
      return 'good';
    } catch (error) {
      return 'unavailable';
    }
  }

  calculateHealthScore(health) {
    let score = 0;
    
    // TypeScript score (30 points max)
    if (health.typescript.status === 'good') score += 30;
    else if (health.typescript.status === 'warning') score += 20;
    else if (health.typescript.status === 'critical') score += 10;
    
    // Linting score (25 points max)
    if (health.linting.status === 'good') score += 25;
    else if (health.linting.status === 'warning') score += 15;
    else if (health.linting.status === 'critical') score += 5;
    
    // Build score (25 points max)
    if (health.build.status === 'good') score += 25;
    else if (health.build.status === 'needs-repair') score += 10;
    
    // Docker score (20 points max)
    if (health.docker.status === 'good') score += 20;
    else if (health.docker.status === 'unavailable') score += 0;
    
    return Math.min(100, score);
  }

  async ensureDockerReadiness() {
    console.log('🐳 Ensuring Docker environment readiness...');
    
    try {
      // Check if Docker is running
      execSync('docker info', { stdio: 'pipe' });
      
      // Optimize Docker configuration
      await this.optimizeDockerConfiguration();
      
      // Ensure images are built
      await this.ensureDockerImages();
      
      console.log('✅ Docker environment ready');
      
    } catch (error) {
      console.warn('⚠️ Docker optimization skipped:', error.message);
    }
  }

  async optimizeDockerConfiguration() {
    // Check and optimize docker-compose.yml
    const composePath = path.join(process.cwd(), 'docker-compose.yml');
    
    if (fs.existsSync(composePath)) {
      let composeContent = fs.readFileSync(composePath, 'utf8');
      
      // Add development optimizations if not present
      const optimizations = [
        'CHOKIDAR_USEPOLLING=true',
        'WATCHPACK_POLLING=true',
        'FAST_REFRESH=true'
      ];
      
      let modified = false;
      optimizations.forEach(opt => {
        if (!composeContent.includes(opt)) {
          // Add to development service environment
          composeContent = composeContent.replace(
            /(whattoeatnext-dev:[\s\S]*?environment:[\s\S]*?)(\n\s*volumes:)/,
            `$1      - ${opt}$2`
          );
          modified = true;
        }
      });
      
      if (modified) {
        // Create backup
        fs.copyFileSync(composePath, `${composePath}.backup.${Date.now()}`);
        fs.writeFileSync(composePath, composeContent);
        console.log('🔧 Docker Compose optimized for development');
        this.metrics.dockerOptimizations++;
      }
    }
  }

  async ensureDockerImages() {
    try {
      // Check if images exist
      const images = execSync('docker images --format "{{.Repository}}:{{.Tag}}"', {
        encoding: 'utf8'
      }).split('\n').filter(Boolean);
      
      const hasMainImage = images.some(img => img.includes('whattoeatnext:latest'));
      const hasDevImage = images.some(img => img.includes('whattoeatnext:dev'));
      
      // Build missing images in parallel
      const buildPromises = [];
      
      if (!hasMainImage) {
        buildPromises.push(this.buildDockerImage('production'));
      }
      
      if (!hasDevImage) {
        buildPromises.push(this.buildDockerImage('development'));
      }
      
      if (buildPromises.length > 0) {
        console.log(`🏗️ Building ${buildPromises.length} Docker image(s)...`);
        await Promise.all(buildPromises);
        this.metrics.dockerOptimizations += buildPromises.length;
      }
      
    } catch (error) {
      console.warn('⚠️ Docker image check failed:', error.message);
    }
  }

  async buildDockerImage(type) {
    return new Promise((resolve, reject) => {
      const dockerfile = type === 'development' ? 'Dockerfile.dev' : 'Dockerfile';
      const tag = type === 'development' ? 'whattoeatnext:dev' : 'whattoeatnext:latest';
      
      const buildProcess = spawn('docker', ['build', '-f', dockerfile, '-t', tag, '.'], {
        stdio: 'pipe'
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${type} Docker image built successfully`);
          resolve();
        } else {
          reject(new Error(`Docker build failed with code ${code}`));
        }
      });
      
      buildProcess.on('error', reject);
    });
  }

  async ensureDirectoryStructure() {
    const requiredDirs = [
      'logs/parallel-acceleration',
      '.kiro/parallel-reports',
      '.kiro/docker-optimizations',
      'temp/parallel-processing'
    ];
    
    requiredDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async orchestrateParallelTasks() {
    console.log('🎯 Orchestrating parallel tasks...');
    
    const tasks = [
      {
        id: 'import-optimization',
        priority: 'high',
        description: 'Optimize import statements across codebase',
        command: 'node src/services/campaign/importOptimizer.js',
        estimatedTime: 30000, // 30 seconds
        category: 'code-quality'
      },
      {
        id: 'lint-auto-fix',
        priority: 'high',
        description: 'Auto-fix linting issues',
        command: 'yarn lint:fix --fix-type suggestion,layout',
        estimatedTime: 45000, // 45 seconds
        category: 'code-quality'
      },
      {
        id: 'build-system-repair',
        priority: 'medium',
        description: 'Repair and optimize build system',
        command: 'yarn build:comprehensive',
        estimatedTime: 60000, // 1 minute
        category: 'build-optimization'
      },
      {
        id: 'docker-health-check',
        priority: 'medium',
        description: 'Comprehensive Docker health check and optimization',
        command: 'make docker-health',
        estimatedTime: 20000, // 20 seconds
        category: 'docker-optimization',
        enabled: this.enableDockerOptimization
      },
      {
        id: 'test-memory-optimization',
        priority: 'low',
        description: 'Optimize test memory configuration',
        command: 'node src/services/campaign/testMemoryGuardian.js',
        estimatedTime: 15000, // 15 seconds
        category: 'test-optimization'
      },
      {
        id: 'planetary-data-validation',
        priority: 'low',
        description: 'Validate and refresh planetary data cache',
        command: 'node src/services/campaign/planetaryDataRefresh.js',
        estimatedTime: 25000, // 25 seconds
        category: 'data-optimization'
      }
    ];
    
    // Filter enabled tasks and sort by priority
    const enabledTasks = tasks
      .filter(task => task.enabled !== false)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    
    console.log(`📋 ${enabledTasks.length} parallel tasks orchestrated`);
    return enabledTasks;
  }

  async executeParallelImprovements(tasks) {
    console.log('⚡ Executing parallel improvements...');
    
    // Execute tasks in batches to respect maxParallelTasks limit
    const batches = this.createTaskBatches(tasks, this.maxParallelTasks);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔄 Executing batch ${i + 1}/${batches.length} (${batch.length} tasks)`);
      
      const batchPromises = batch.map(task => this.executeTask(task));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process batch results
      batchResults.forEach((result, index) => {
        const task = batch[index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${task.description} completed`);
          this.metrics.tasksCompleted++;
          this.updateCategoryMetrics(task.category);
        } else {
          console.log(`❌ ${task.description} failed: ${result.reason.message}`);
        }
      });
      
      // Brief pause between batches
      if (i < batches.length - 1) {
        await this.sleep(2000);
      }
    }
    
    console.log(`✅ Parallel improvements completed: ${this.metrics.tasksCompleted} tasks`);
  }

  createTaskBatches(tasks, batchSize) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }
    return batches;
  }

  async executeTask(task) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Starting: ${task.description}`);
      this.metrics.tasksRunning++;
      
      const startTime = Date.now();
      const process = spawn('sh', ['-c', task.command], {
        stdio: 'pipe',
        timeout: task.estimatedTime * 2 // Double the estimated time as timeout
      });
      
      this.activeProcesses.set(task.id, process);
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        this.activeProcesses.delete(task.id);
        this.metrics.tasksRunning--;
        
        const duration = Date.now() - startTime;
        
        if (code === 0) {
          this.logTaskSuccess(task, duration, output);
          resolve({ task, duration, output });
        } else {
          this.logTaskFailure(task, duration, errorOutput);
          reject(new Error(`Task ${task.id} failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        this.activeProcesses.delete(task.id);
        this.metrics.tasksRunning--;
        this.logTaskFailure(task, Date.now() - startTime, error.message);
        reject(error);
      });
    });
  }

  updateCategoryMetrics(category) {
    switch (category) {
      case 'code-quality':
        this.metrics.codeQualityFixes++;
        break;
      case 'build-optimization':
        this.metrics.buildImprovements++;
        break;
      case 'docker-optimization':
        this.metrics.dockerOptimizations++;
        break;
    }
  }

  logTaskSuccess(task, duration, output) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      description: task.description,
      category: task.category,
      priority: task.priority,
      duration,
      status: 'success',
      output: output.slice(-500) // Last 500 chars
    };
    
    this.appendToLog('task-successes.log', logEntry);
  }

  logTaskFailure(task, duration, errorOutput) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      description: task.description,
      category: task.category,
      priority: task.priority,
      duration,
      status: 'failure',
      error: errorOutput.slice(-500) // Last 500 chars
    };
    
    this.appendToLog('task-failures.log', logEntry);
  }

  async optimizeDockerEnvironment() {
    console.log('🐳 Optimizing Docker environment...');
    
    try {
      // Clean up unused Docker resources
      await this.cleanupDockerResources();
      
      // Optimize Docker Compose configuration
      await this.optimizeDockerCompose();
      
      // Ensure health check endpoints
      await this.ensureHealthCheckEndpoints();
      
      console.log('✅ Docker environment optimized');
      
    } catch (error) {
      console.warn('⚠️ Docker optimization partially failed:', error.message);
    }
  }

  async cleanupDockerResources() {
    try {
      // Remove unused containers, networks, images, and build cache
      execSync('docker system prune -f', { stdio: 'pipe' });
      console.log('🧹 Docker resources cleaned up');
    } catch (error) {
      console.warn('⚠️ Docker cleanup failed:', error.message);
    }
  }

  async optimizeDockerCompose() {
    const composePath = path.join(process.cwd(), 'docker-compose.yml');
    
    if (!fs.existsSync(composePath)) return;
    
    let composeContent = fs.readFileSync(composePath, 'utf8');
    let modified = false;
    
    // Add performance optimizations
    const optimizations = {
      'NEXT_PUBLIC_API_CACHE_TIME': '3600',
      'NODE_OPTIONS': '--max-old-space-size=2048',
      'NEXT_TELEMETRY_DISABLED': '1'
    };
    
    Object.entries(optimizations).forEach(([key, value]) => {
      if (!composeContent.includes(key)) {
        composeContent = composeContent.replace(
          /(environment:[\s\S]*?)(\n\s*volumes:)/,
          `$1      - ${key}=${value}$2`
        );
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(composePath, composeContent);
      console.log('🔧 Docker Compose performance optimized');
      this.metrics.dockerOptimizations++;
    }
  }

  async ensureHealthCheckEndpoints() {
    const healthCheckPath = path.join(process.cwd(), 'src/app/api/health/route.ts');
    
    if (!fs.existsSync(healthCheckPath)) {
      const healthCheckDir = path.dirname(healthCheckPath);
      if (!fs.existsSync(healthCheckDir)) {
        fs.mkdirSync(healthCheckDir, { recursive: true });
      }
      
      const healthCheckContent = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}`;
      
      fs.writeFileSync(healthCheckPath, healthCheckContent);
      console.log('🏥 Health check endpoint created');
      this.metrics.buildImprovements++;
    }
  }

  async generateAccelerationReport() {
    console.log('📊 Generating acceleration report...');
    
    const finalHealth = await this.assessSystemHealth();
    const duration = Date.now() - this.metrics.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      durationFormatted: this.formatDuration(duration),
      systemHealth: {
        initial: this.initialHealth || { score: 0 },
        final: finalHealth,
        improvement: finalHealth.score - (this.initialHealth?.score || 0)
      },
      metrics: this.metrics,
      recommendations: this.generateRecommendations(finalHealth),
      nextActions: this.generateNextActions(finalHealth)
    };
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), '.kiro/parallel-reports', `acceleration-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save latest report
    const latestPath = path.join(process.cwd(), '.kiro/parallel-reports', 'latest-acceleration.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
    // Display summary
    this.displayReportSummary(report);
    
    console.log(`📊 Acceleration report saved: ${reportPath}`);
  }

  generateRecommendations(health) {
    const recommendations = [];
    
    if (health.typescript.errors > 100) {
      recommendations.push('Continue TypeScript error reduction campaign');
    }
    
    if (health.linting.warnings > 500) {
      recommendations.push('Increase linting auto-fix frequency');
    }
    
    if (health.build.status !== 'good') {
      recommendations.push('Run comprehensive build system repair');
    }
    
    if (health.docker.status !== 'good') {
      recommendations.push('Investigate Docker configuration issues');
    }
    
    return recommendations;
  }

  generateNextActions(health) {
    const actions = [];
    
    if (health.score < 70) {
      actions.push('Schedule intensive improvement session');
    }
    
    if (this.metrics.codeQualityFixes > 0) {
      actions.push('Validate code quality improvements');
    }
    
    if (this.metrics.dockerOptimizations > 0) {
      actions.push('Test Docker deployment pipeline');
    }
    
    actions.push('Continue parallel development acceleration');
    
    return actions;
  }

  displayReportSummary(report) {
    console.log('\n🎯 PARALLEL DEVELOPMENT ACCELERATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${report.durationFormatted}`);
    console.log(`📈 Health Score: ${report.systemHealth.initial.score} → ${report.systemHealth.final.score} (${report.systemHealth.improvement >= 0 ? '+' : ''}${report.systemHealth.improvement})`);
    console.log(`✅ Tasks Completed: ${report.metrics.tasksCompleted}`);
    console.log(`🔧 Code Quality Fixes: ${report.metrics.codeQualityFixes}`);
    console.log(`🏗️  Build Improvements: ${report.metrics.buildImprovements}`);
    console.log(`🐳 Docker Optimizations: ${report.metrics.dockerOptimizations}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    if (report.nextActions.length > 0) {
      console.log('\n🚀 NEXT ACTIONS:');
      report.nextActions.forEach(action => console.log(`  • ${action}`));
    }
    
    console.log('='.repeat(50));
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  appendToLog(filename, entry) {
    const logPath = path.join(process.cwd(), 'logs/parallel-acceleration', filename);
    const logDir = path.dirname(logPath);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleAccelerationError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      metrics: this.metrics,
      activeProcesses: Array.from(this.activeProcesses.keys())
    };
    
    this.appendToLog('acceleration-errors.log', errorLog);
    
    // Cleanup active processes
    this.activeProcesses.forEach((process, id) => {
      try {
        process.kill();
        console.log(`🛑 Killed process: ${id}`);
      } catch (killError) {
        console.warn(`⚠️ Could not kill process ${id}:`, killError.message);
      }
    });
    
    this.activeProcesses.clear();
  }
}

// Main execution function
async function accelerateParallelDevelopment() {
  const accelerator = new ParallelDevelopmentAccelerator({
    enableDockerOptimization: process.env.ENABLE_DOCKER_OPTIMIZATION !== 'false',
    enableParallelProcessing: process.env.ENABLE_PARALLEL_PROCESSING !== 'false',
    enableContinuousImprovement: process.env.ENABLE_CONTINUOUS_IMPROVEMENT !== 'false',
    maxParallelTasks: parseInt(process.env.MAX_PARALLEL_TASKS) || 4,
    dockerHealthChecks: process.env.DOCKER_HEALTH_CHECKS !== 'false',
    buildValidation: process.env.BUILD_VALIDATION !== 'false'
  });
  
  return await accelerator.accelerateParallelDevelopment();
}

// Run if called directly
if (require.main === module) {
  accelerateParallelDevelopment().catch(console.error);
}

module.exports = { ParallelDevelopmentAccelerator, accelerateParallelDevelopment };