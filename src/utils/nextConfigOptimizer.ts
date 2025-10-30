import { _logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

/**
 * Next.js Configuration Optimizer
 * Requirement 3.1: Fix Next.js configuration to properly generate manifest files
 */
export class NextConfigOptimizer {
  private readonly configPath: string;
  private readonly logger: (message: string, ...args: unknown[]) => void;

  constructor(
    configPath: string = 'next.config.js',
    logger: (message: string, ...args: unknown[]) => void = _logger.info
  ) {
    this.configPath = configPath;
    this.logger = logger;
  }

  /**
   * Optimizes Next.js configuration for better build stability
   */
  optimizeConfig(): void {
    try {
      // Check if we have multiple config files and consolidate
      const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
      const existingConfigs = configFiles.filter(file => fs.existsSync(file));

      if (existingConfigs.length > 1) {
        this.logger(`Warning: Multiple Next.js config files found: ${existingConfigs.join(', ')}`);
        this.logger('Consider consolidating to a single configuration file');
      }

      // Use the primary config file (next.config.js or next.config.mjs)
      const primaryConfig =
        existingConfigs.find(file => file === 'next.config.js') ||
        existingConfigs.find(file => file === 'next.config.mjs') ||
        existingConfigs[0];

      if (!primaryConfig) {
        this.createDefaultConfig();
        return;
      }

      this.validateAndOptimizeExistingConfig(primaryConfig);
    } catch (error) {
      this.logger('Error optimizing Next.js configuration: ', error);
    }
  }

  /**
   * Creates a default optimized Next.js configuration
   */
  private createDefaultConfig(): void {
    const defaultConfig = `/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  // Build optimization for manifest generation
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enable for production stability
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false, // Enable for production stability
    dirs: ['src']
  },
  // Experimental features for better build stability
  experimental: {
    typedRoutes: true
  },
  // Webpack optimization for manifest generation
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src')
    };

    // Optimize for server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
  // Generate proper build ID for consistent builds
  generateBuildId: async () => {
    return process.env.BUILD_ID || ` + "`build-${Date.now()}`" + `;
  }
};

module.exports = nextConfig;
`;

    fs.writeFileSync(this.configPath, defaultConfig);
    this.logger('Created optimized Next.js configuration');
  }

  /**
   * Validates and optimizes existing configuration
   */
  private validateAndOptimizeExistingConfig(configPath: string): void {
    const content = fs.readFileSync(configPath, 'utf8');

    // Check for essential configurations
    const checks: Array<{ pattern: RegExp; recommendation: string }> = [
      {
        pattern: /output\s*:/,
        recommendation: "Add output: 'standalone' for better build optimization",
      },
      {
        pattern: /generateBuildId\s*:/,
        recommendation: 'Add generateBuildId function for consistent builds',
      },
      {
        pattern: /typescript\s*:/,
        recommendation: 'Add TypeScript configuration for build stability',
      },
      {
        pattern: /eslint\s*:/,
        recommendation: 'Add ESLint configuration for build validation',
      },
    ];

    const recommendations: string[] = [];

    for (const check of checks) {
      if (!check.pattern.test(content)) {
        recommendations.push(check.recommendation);
      }
    }

    if (recommendations.length > 0) {
      this.logger('Next.js configuration recommendations: ');
      recommendations.forEach(rec => this.logger(`- ${rec}`));
    } else {
      this.logger('Next.js configuration looks good');
    }
  }

  /**
   * Fixes common Next.js configuration issues
   */
  fixCommonIssues(): void {
    const configFiles = ['next.config.js', 'next.config.mjs'];
    const existingConfig = configFiles.find(file => fs.existsSync(file));

    if (!existingConfig) {
      this.logger('No Next.js configuration found, creating default');
      this.createDefaultConfig();
      return;
    }

    let content = fs.readFileSync(existingConfig, 'utf8');
    let modified = false;

    // Fix common issues
    const fixes: Array<{ issue: RegExp; fix: string; description: string }> = [
      {
        issue: /ignoreBuildErrors\s*:\s*true/g,
        fix: 'ignoreBuildErrors: false',
        description: 'Enable TypeScript error checking for build stability',
      },
      {
        issue: /ignoreDuringBuilds\s*:\s*true/g,
        fix: 'ignoreDuringBuilds: false',
        description: 'Enable ESLint checking for build stability',
      },
    ];

    for (const fix of fixes) {
      if (fix.issue.test(content)) {
        content = content.replace(fix.issue, fix.fix);
        modified = true;
        this.logger(`Fixed: ${fix.description}`);
      }
    }

    if (modified) {
      // Create backup
      fs.writeFileSync(`${existingConfig}.backup`, fs.readFileSync(existingConfig));
      fs.writeFileSync(existingConfig, content);
      this.logger(`Updated ${existingConfig} (backup created)`);
    }
  }
}

// Export default instance
export const _nextConfigOptimizer = new NextConfigOptimizer();