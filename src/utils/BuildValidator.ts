import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * BuildValidator class for checking and repairing build artifacts
 * Implements requirements 3.1, 3.2, 3.3, 3.4, 3.5 from test system stabilization
 */
export class BuildValidator {
  private readonly buildDir: string;
  private readonly serverDir: string;
  private readonly requiredManifests: string[];
  private readonly logger: (message: string, ...args: unknown[]) => void;

  constructor(buildDir = '.next', logger = console.log) {
    this.buildDir = buildDir;
    this.serverDir = path.join(buildDir, 'server');
    this.logger = logger;

    // Required manifest files for Next.js build
    this.requiredManifests = [
      'pages-manifest.json',
      'app-paths-manifest.json',
      'next-font-manifest.json',
      'middleware-manifest.json',
    ];
  }

  /**
   * Validates the build artifacts and checks for required files
   * Requirement 3.2: Implement BuildValidator class to check for required build artifacts
   */
  async validateBuild(): Promise<BuildValidationResult> {
    const result: BuildValidationResult = {
      isValid: true,
      missingFiles: [],
      corruptedFiles: [],
      repairActions: [],
    };

    try {
      // Check if build directory exists
      if (!fs.existsSync(this.buildDir)) {
        result.isValid = false;
        result.missingFiles.push(this.buildDir);
        result.repairActions.push({
          type: 'create',
          target: this.buildDir,
          description: 'Create build directory',
        });
        return result;
      }

      // Check if server directory exists
      if (!fs.existsSync(this.serverDir)) {
        result.isValid = false;
        result.missingFiles.push(this.serverDir);
        result.repairActions.push({
          type: 'create',
          target: this.serverDir,
          description: 'Create server directory',
        });
      }

      // Check required manifest files
      for (const manifest of this.requiredManifests) {
        const manifestPath = path.join(this.serverDir, manifest);

        if (!fs.existsSync(manifestPath)) {
          result.isValid = false;
          result.missingFiles.push(manifestPath);
          result.repairActions.push({
            type: 'create',
            target: manifestPath,
            description: `Create missing manifest file: ${manifest}`,
          });
        } else {
          // Check if file is corrupted (empty or invalid JSON)
          try {
            const content = fs.readFileSync(manifestPath, 'utf8');
            if (content.trim() === '') {
              result.corruptedFiles.push(manifestPath);
              result.repairActions.push({
                type: 'fix',
                target: manifestPath,
                description: `Fix empty manifest file: ${manifest}`,
              });
            } else if (manifest.endsWith('.json')) {
              JSON.parse(content); // Validate JSON
            }
          } catch (error) {
            result.isValid = false;
            result.corruptedFiles.push(manifestPath);
            result.repairActions.push({
              type: 'fix',
              target: manifestPath,
              description: `Fix corrupted manifest file: ${manifest}`,
            });
          }
        }
      }

      // Check for essential build files
      const essentialFiles = [
        'build-manifest.json',
        'app-build-manifest.json',
        'react-loadable-manifest.json',
      ];

      for (const file of essentialFiles) {
        const filePath = path.join(this.buildDir, file);
        if (!fs.existsSync(filePath)) {
          result.isValid = false;
          result.missingFiles.push(filePath);
          result.repairActions.push({
            type: 'create',
            target: filePath,
            description: `Create missing build file: ${file}`,
          });
        }
      }

      this.logger(
        `Build validation completed. Valid: ${result.isValid}, Missing: ${result.missingFiles.length}, Corrupted: ${result.corruptedFiles.length}`,
      );
    } catch (error) {
      this.logger('Build validation failed:', error);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Repairs the build by creating missing manifest files with minimal content
   * Requirement 3.3: Create missing manifest files with minimal content when needed
   */
  async repairBuild(): Promise<void> {
    const validation = await this.validateBuild();

    if (validation.isValid) {
      this.logger('Build is valid, no repairs needed');
      return;
    }

    this.logger(`Starting build repair. ${validation.repairActions.length} actions to perform.`);

    // Create directories if needed
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
      this.logger(`Created build directory: ${this.buildDir}`);
    }

    if (!fs.existsSync(this.serverDir)) {
      fs.mkdirSync(this.serverDir, { recursive: true });
      this.logger(`Created server directory: ${this.serverDir}`);
    }

    // Create missing manifest files with minimal content
    const manifestDefaults = this.getManifestDefaults();

    for (const action of validation.repairActions) {
      if (action.type === 'create' || action.type === 'fix') {
        const filename = path.basename(action.target);

        if (manifestDefaults[filename]) {
          fs.writeFileSync(action.target, JSON.stringify(manifestDefaults[filename], null, 2));
          this.logger(`${action.type === 'create' ? 'Created' : 'Fixed'} ${filename}`);
        }
      }
    }

    this.logger('Build repair completed');
  }

  /**
   * Attempts to rebuild the application with error recovery
   * Requirement 3.4: Add build error recovery and retry mechanisms
   */
  async rebuildWithRecovery(maxRetries = 3): Promise<boolean> {
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      this.logger(`Build attempt ${attempt}/${maxRetries}`);

      try {
        // Clean build directory before retry
        if (attempt > 1) {
          await this.cleanBuild();
          await this.repairBuild();
        }

        // Attempt build
        execSync('yarn build', {
          stdio: 'pipe',
          timeout: 300000, // 5 minute timeout
        });

        // Validate build after completion
        const validation = await this.validateBuild();
        if (validation.isValid) {
          this.logger(`Build successful on attempt ${attempt}`);
          return true;
        } else {
          this.logger(`Build completed but validation failed on attempt ${attempt}`);
          await this.repairBuild();
        }
      } catch (error) {
        this.logger(`Build failed on attempt ${attempt}:`, error);

        if (attempt < maxRetries) {
          this.logger(`Retrying build in 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    this.logger(`Build failed after ${maxRetries} attempts`);
    return false;
  }

  /**
   * Cleans the build directory
   */
  async cleanBuild(): Promise<void> {
    try {
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
        this.logger('Build directory cleaned');
      }
    } catch (error) {
      this.logger('Error cleaning build directory:', error);
    }
  }

  /**
   * Gets default content for manifest files
   * Requirement 3.3: Create missing manifest files with minimal content when needed
   */
  private getManifestDefaults(): Record<string, unknown> {
    return {
      'pages-manifest.json': {},
      'app-paths-manifest.json': {},
      'next-font-manifest.json': {
        pages: {},
        app: {},
        appUsingSizeAdjust: false,
        pagesUsingSizeAdjust: false,
      },
      'middleware-manifest.json': {
        sortedMiddleware: [],
        middleware: {},
        functions: {},
        version: 2,
      },
      'build-manifest.json': {
        devFiles: [],
        ampDevFiles: [],
        polyfillFiles: [],
        lowPriorityFiles: [],
        rootMainFiles: [],
        pages: {},
        ampFirstPages: [],
      },
      'app-build-manifest.json': {
        pages: {},
      },
      'react-loadable-manifest.json': {},
    };
  }

  /**
   * Checks if Next.js configuration is properly set up
   * Requirement 3.1: Fix Next.js configuration to properly generate manifest files
   */
  validateNextConfig(): NextConfigValidationResult {
    const result: NextConfigValidationResult = {
      isValid: true,
      issues: [],
      recommendations: [],
    };

    try {
      // Check if next.config.js exists
      const configPaths = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
      const existingConfig = configPaths.find(path => fs.existsSync(path));

      if (!existingConfig) {
        result.isValid = false;
        result.issues.push('No Next.js configuration file found');
        result.recommendations.push('Create next.config.js with proper build settings');
        return result;
      }

      // Read and validate configuration
      const configContent = fs.readFileSync(existingConfig, 'utf8');

      // Check for essential configuration options
      const essentialConfigs = ['output', 'typescript', 'eslint'];

      for (const config of essentialConfigs) {
        if (!configContent.includes(config)) {
          result.recommendations.push(
            `Consider adding ${config} configuration for better build stability`,
          );
        }
      }

      // Check for build optimization settings
      if (!configContent.includes('webpack')) {
        result.recommendations.push('Consider adding webpack configuration for build optimization');
      }

      this.logger(
        `Next.js config validation completed. Valid: ${result.isValid}, Issues: ${result.issues.length}`,
      );
    } catch (error) {
      result.isValid = false;
      result.issues.push(`Error reading Next.js configuration: ${error}`);
    }

    return result;
  }

  /**
   * Monitors build health and performance
   * Requirement 3.5: Add build error recovery and retry mechanisms
   */
  async monitorBuildHealth(): Promise<BuildHealthReport> {
    const report: BuildHealthReport = {
      timestamp: new Date(),
      buildExists: fs.existsSync(this.buildDir),
      manifestsValid: false,
      buildSize: 0,
      lastBuildTime: null,
      issues: [],
    };

    try {
      if (report.buildExists) {
        // Calculate build size
        report.buildSize = this.calculateDirectorySize(this.buildDir);

        // Check manifest validity
        const validation = await this.validateBuild();
        report.manifestsValid = validation.isValid;

        if (!validation.isValid) {
          report.issues.push(...validation.missingFiles.map(file => `Missing: ${file}`));
          report.issues.push(...validation.corruptedFiles.map(file => `Corrupted: ${file}`));
        }

        // Get last build time
        const buildManifestPath = path.join(this.buildDir, 'build-manifest.json');
        if (fs.existsSync(buildManifestPath)) {
          const stats = fs.statSync(buildManifestPath);
          report.lastBuildTime = stats.mtime;
        }
      } else {
        report.issues.push('Build directory does not exist');
      }
    } catch (error) {
      report.issues.push(`Health check error: ${error}`);
    }

    return report;
  }

  /**
   * Calculates directory size recursively
   */
  private calculateDirectorySize(dirPath: string): number {
    let size = 0;

    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          size += this.calculateDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible files
    }

    return size;
  }
}

// Type definitions
export interface BuildValidationResult {
  isValid: boolean,
  missingFiles: string[],
  corruptedFiles: string[],
  repairActions: RepairAction[],
}

export interface RepairAction {
  type: 'create' | 'fix' | 'remove',
  target: string,
  description: string
}

export interface NextConfigValidationResult {
  isValid: boolean,
  issues: string[],
  recommendations: string[]
}

export interface BuildHealthReport {
  timestamp: Date,
  buildExists: boolean,
  manifestsValid: boolean,
  buildSize: number,
  lastBuildTime: Date | null,
  issues: string[],
}

// Export default instance
export const _buildValidator = new BuildValidator();
