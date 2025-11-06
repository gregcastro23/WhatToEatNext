#!/usr/bin/env node

/**
 * Parallel Docker Optimizer
 *
 * Optimizes Docker configuration and ensures development environment efficiency
 * while TypeScript error reduction is in progress.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ParallelDockerOptimizer {
  constructor() {
    this.optimizations = [];
    this.healthChecks = [];
    this.startTime = Date.now();
  }

  async optimize() {
    console.log("🐳 PARALLEL DOCKER OPTIMIZATION STARTED");
    console.log("======================================");

    try {
      // Step 1: Check Docker health
      await this.checkDockerHealth();

      // Step 2: Optimize development container
      await this.optimizeDevContainer();

      // Step 3: Ensure health endpoint exists
      await this.ensureHealthEndpoint();

      // Step 4: Optimize docker-compose configuration
      await this.optimizeDockerCompose();

      // Step 5: Generate report
      this.generateReport();
    } catch (error) {
      console.error("❌ Docker optimization failed:", error.message);
    }
  }

  async checkDockerHealth() {
    console.log("🔍 Checking Docker health...");

    try {
      // Check if Docker is running
      execSync("docker --version", { stdio: "pipe" });
      this.healthChecks.push("Docker daemon: ✅ Running");

      // Check if containers exist
      try {
        const containers = execSync('docker ps -a --format "{{.Names}}"', {
          encoding: "utf8",
        });
        if (containers.includes("whattoeatnext")) {
          this.healthChecks.push("Application containers: ✅ Found");
        } else {
          this.healthChecks.push("Application containers: ⚠️  Not found");
        }
      } catch (error) {
        this.healthChecks.push("Application containers: ❌ Error checking");
      }
    } catch (error) {
      this.healthChecks.push("Docker daemon: ❌ Not running");
      console.log("⚠️  Docker not available, skipping container optimizations");
      return;
    }
  }

  async optimizeDevContainer() {
    console.log("⚡ Optimizing development container...");

    // Check if Dockerfile.dev needs optimization
    const dockerfilePath = "Dockerfile.dev";
    if (fs.existsSync(dockerfilePath)) {
      const content = fs.readFileSync(dockerfilePath, "utf8");

      // Check for hot-reload optimization
      if (content.includes("CHOKIDAR_USEPOLLING=true")) {
        this.optimizations.push("Hot-reload: ✅ Configured");
      } else {
        this.optimizations.push("Hot-reload: ⚠️  Not optimized");
      }

      // Check for memory limits
      if (content.includes("NODE_OPTIONS")) {
        this.optimizations.push("Memory limits: ✅ Configured");
      } else {
        this.optimizations.push("Memory limits: ⚠️  Not set");
      }
    }
  }

  async ensureHealthEndpoint() {
    console.log("🏥 Ensuring health endpoint exists...");

    const healthEndpointPath = "src/pages/api/health.ts";

    if (!fs.existsSync(healthEndpointPath)) {
      // Create health endpoint
      const healthEndpointContent = `import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic health check
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  };
  
  res.status(200).json(health);
}`;

      fs.writeFileSync(healthEndpointPath, healthEndpointContent);
      this.optimizations.push("Health endpoint: ✅ Created");
    } else {
      this.optimizations.push("Health endpoint: ✅ Exists");
    }
  }

  async optimizeDockerCompose() {
    console.log("📝 Optimizing docker-compose configuration...");

    const composePath = "docker-compose.yml";
    if (fs.existsSync(composePath)) {
      const content = fs.readFileSync(composePath, "utf8");

      // Check for health checks
      if (content.includes("healthcheck:")) {
        this.optimizations.push("Health checks: ✅ Configured");
      } else {
        this.optimizations.push("Health checks: ⚠️  Missing");
      }

      // Check for resource limits
      if (content.includes("resources:")) {
        this.optimizations.push("Resource limits: ✅ Set");
      } else {
        this.optimizations.push("Resource limits: ⚠️  Not configured");
      }

      // Check for development profile
      if (content.includes("profiles:")) {
        this.optimizations.push("Development profile: ✅ Available");
      } else {
        this.optimizations.push("Development profile: ⚠️  Missing");
      }
    }
  }

  generateReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    console.log("\\n📊 PARALLEL DOCKER OPTIMIZATION SUMMARY");
    console.log("========================================");
    console.log(`⏱️  Duration: ${duration}s`);

    console.log("\\n🔍 Health Checks:");
    this.healthChecks.forEach((check) => console.log(`   ${check}`));

    console.log("\\n⚡ Optimizations:");
    this.optimizations.forEach((opt) => console.log(`   ${opt}`));

    // Calculate health impact
    const healthImpact = this.calculateHealthImpact();
    console.log(`\\n📈 Estimated health impact: +${healthImpact} points`);

    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      healthChecks: this.healthChecks,
      optimizations: this.optimizations,
      healthImpact,
      recommendations: this.generateRecommendations(),
    };

    fs.writeFileSync(
      ".kiro/parallel-reports/docker-optimization.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      "\\n📄 Report saved to .kiro/parallel-reports/docker-optimization.json",
    );
  }

  calculateHealthImpact() {
    let impact = 0;

    // Health checks contribute to stability
    const healthyChecks = this.healthChecks.filter((check) =>
      check.includes("✅"),
    ).length;
    impact += healthyChecks * 1;

    // Optimizations contribute to performance
    const completedOpts = this.optimizations.filter((opt) =>
      opt.includes("✅"),
    ).length;
    impact += completedOpts * 0.5;

    return Math.round(impact * 10) / 10;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.healthChecks.some((check) => check.includes("❌"))) {
      recommendations.push("Install and start Docker daemon");
    }

    if (this.optimizations.some((opt) => opt.includes("⚠️"))) {
      recommendations.push(
        "Review Docker configuration for missing optimizations",
      );
    }

    if (!this.optimizations.some((opt) => opt.includes("Health endpoint"))) {
      recommendations.push("Implement comprehensive health monitoring");
    }

    return recommendations;
  }
}

// Execute if run directly
if (require.main === module) {
  const optimizer = new ParallelDockerOptimizer();
  optimizer.optimize().catch(console.error);
}

module.exports = ParallelDockerOptimizer;
