/**
 * Bundle Size Optimization System
 * Perfect Codebase Campaign - Phase 4 Implementation
 *
 * Implements comprehensive bundle size optimization with:
 * - Bundle analysis system maintaining 420kB target
 * - Lazy loading validation for selective data fetching
 * - Bundle optimization alerts when size exceeds targets
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface BundleAnalysis {
  totalSize: number,
  compressedSize: number,
  chunks: BundleChunk[],
  assets: BundleAsset[],
  dependencies: DependencyAnalysis[],
  recommendations: string[]
}

export interface BundleChunk {
  name: string,
  size: number,
  compressedSize: number,
  modules: string[],
  isLazyLoaded: boolean
}

export interface BundleAsset {
  name: string,
  size: number,
  type: 'js' | 'css' | 'image' | 'font' | 'other',
  optimized: boolean
}

export interface DependencyAnalysis {
  name: string,
  size: number,
  version: string,
  usage: 'critical' | 'important' | 'optional',
  alternatives: string[]
}

export interface LazyLoadingValidation {
  componentsAnalyzed: number,
  lazyLoadedComponents: number,
  potentialLazyComponents: string[],
  dataFetchingOptimizations: string[],
  score: number
}

export interface BundleOptimizationAlert {
  type: 'size_exceeded' | 'chunk_too_large' | 'unused_dependency' | 'lazy_loading_opportunity',
  severity: 'warning' | 'critical',
  message: string,
  currentValue: number,
  targetValue: number,
  recommendations: string[],
  timestamp: Date
}

export interface BundleOptimizationReport {
  timestamp: Date,
  analysis: BundleAnalysis,
  lazyLoadingValidation: LazyLoadingValidation,
  alerts: BundleOptimizationAlert[],
  overallScore: number,
  targetCompliance: boolean,
  recommendations: string[]
}

export class BundleSizeOptimizer {
  private readonly TARGET_BUNDLE_SIZE = 420; // kB
  private readonly TARGET_CHUNK_SIZE = 100; // kB
  private readonly COMPRESSION_RATIO = 0.7, // Typical gzip compression;
  private alerts: BundleOptimizationAlert[] = [];
  private analysisHistory: BundleAnalysis[] = [];

  constructor() {}

  /**
   * Analyze bundle size and composition
   */
  async analyzeBundleSize(): Promise<BundleAnalysis> {
    try {
      // // console.log('📦 Analyzing bundle size...');

      // Get bundle information from build output
      const bundleInfo = await this.getBundleInformation();
      const chunks = await this.analyzeChunks();
      const assets = await this.analyzeAssets();
      const dependencies = await this.analyzeDependencies();

      const totalSize = bundleInfo.totalSize;
      const compressedSize = Math.round(totalSize * this.COMPRESSION_RATIO);

      // Generate recommendations based on analysis
      const recommendations = this.generateBundleRecommendations(;
        totalSize,
        chunks,
        assets,
        dependencies,
      ),

      const analysis: BundleAnalysis = {
        totalSize,
        compressedSize,
        chunks,
        assets,
        dependencies,
        recommendations
      };

      // Store in history
      this.analysisHistory.push(analysis);
      if (this.analysisHistory.length > 20) {
        this.analysisHistory = this.analysisHistory.slice(-10);
      }

      // Check for alerts
      await this.checkBundleSizeAlerts(analysis);

      // // console.log(
        `📦 Bundle analysis complete: ${totalSize}kB total, ${compressedSize}kB compressed`,
      );
      return analysis;
    } catch (error) {
      console.warn(`⚠️  Bundle analysis failed: ${(error as any).message || 'Unknown error'}`);

      // Return fallback analysis
      return {
        totalSize: 0,
        compressedSize: 0,
        chunks: [],
        assets: [],
        dependencies: [],
        recommendations: ['Bundle analysis failed - check build configuration']
      };
    }
  }

  /**
   * Get bundle information from build system
   */
  private async getBundleInformation(): Promise<{ totalSize: number }> {
    try {
      // Check for Next.js build output
      if (fs.existsSync('.next')) {
        return await this.getNextJsBundleInfo();
      }

      // Check for other build outputs
      const buildDirs = ['dist', 'build', 'out'];
      for (const dir of buildDirs) {
        if (fs.existsSync(dir)) {
          return await this.getGenericBundleInfo(dir);
        }
      }

      // Fallback: estimate from source code
      return await this.estimateBundleSize();
    } catch (error) {
      throw new Error(
        `Failed to get bundle information: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get Next.js specific bundle information
   */
  private async getNextJsBundleInfo(): Promise<{ totalSize: number }> {
    try {
      // Run Next.js build analyzer if available
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')),
        if (packageJson.dependencies?.['@next/bundle-analyzer']) {
          // Use bundle analyzer
          const output = execSync('yarn analyze 2>/dev/null || echo 'analyzer not available'', {
            encoding: 'utf8',
            stdio: 'pipe'
          });

          if (!output.includes('analyzer not available')) {
            // Parse analyzer output (simplified)
            const sizeMatch = output.match(/Total bundle size: (\d+(?:\.\d+)?)\s*kB/);
            if (sizeMatch) {
              return { totalSize: parseFloat(sizeMatch[1]) };
            }
          }
        }
      }

      // Fallback: calculate from .next directory
      const output = execSync('du -sk .next/static | cut -f1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const sizeKB = parseInt(output.trim()) || 0;
      return { totalSize: sizeKB };
    } catch (error) {
      throw new Error(
        `Failed to get Next.js bundle info: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get generic bundle information from build directory
   */
  private async getGenericBundleInfo(buildDir: string): Promise<{ totalSize: number }> {
    try {
      const output = execSync(`du -sk ${buildDir} | cut -f1`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const sizeKB = parseInt(output.trim()) || 0;
      return { totalSize: sizeKB };
    } catch (error) {
      throw new Error(
        `Failed to get bundle info from ${buildDir}: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Estimate bundle size from source code
   */
  private async estimateBundleSize(): Promise<{ totalSize: number }> {
    try {
      // Calculate source code size as rough estimate
      const output = execSync(;
        'find src -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | xargs wc -c | tail -1 | awk \'{print 1}\'',
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      const sourceBytes = parseInt(output.trim()) || 0;
      const estimatedKB = Math.round((sourceBytes / 1024) * 1.5); // Rough estimate with bundling overhead

      // // console.log(`📦 Estimated bundle size from source: ${estimatedKB}kB`);
      return { totalSize: estimatedKB };
    } catch (error) {
      console.warn(
        `⚠️  Bundle size estimation failed: ${(error as any).message || 'Unknown error'}`,
      );
      return { totalSize: 400 }; // Conservative estimate
    }
  }

  /**
   * Analyze bundle chunks
   */
  private async analyzeChunks(): Promise<BundleChunk[]> {
    try {
      const chunks: BundleChunk[] = [];

      // Check for Next.js chunks
      if (fs.existsSync('.next/static/chunks')) {
        const chunkFiles = fs.readdirSync('.next/static/chunks');

        for (const file of chunkFiles) {
          if (file.endsWith('.js')) {
            const filePath = path.join('.next/static/chunks', file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);

            chunks.push({
              name: file,
              size: sizeKB,
              compressedSize: Math.round(sizeKB * this.COMPRESSION_RATIO),
              modules: [], // Would need webpack stats for detailed module info
              isLazyLoaded: file.includes('lazy') || file.includes('dynamic')
            });
          }
        }
      }

      return chunks;
    } catch (error) {
      console.warn(`⚠️  Chunk analysis failed: ${(error as any).message || 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Analyze bundle assets
   */
  private async analyzeAssets(): Promise<BundleAsset[]> {
    try {
      const assets: BundleAsset[] = [];

      // Check for static assets
      const assetDirs = ['.next/static', 'public', 'dist/assets', 'build/static'];

      for (const dir of assetDirs) {
        if (fs.existsSync(dir)) {
          const files = this.getAllFiles(dir);

          for (const file of files) {
            const stats = fs.statSync(file);
            const sizeKB = Math.round(stats.size / 1024);
            const ext = path.extname(file).toLowerCase();

            let type: BundleAsset['type'] = 'other';
            if (['.js', '.mjs'].includes(ext)) type = 'js';
            else if (ext === '.css') type = 'css';
            else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext))
              type = 'image';
            else if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) type = 'font',

            assets.push({
              name: path.relative(process.cwd(), file),
              size: sizeKB,
              type,
              optimized: this.isAssetOptimized(file, type)
            });
          }
        }
      }

      return assets.sort((ab) => b.size - a.size); // Sort by size descending
    } catch (error) {
      console.warn(`⚠️  Asset analysis failed: ${(error as any).message || 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Analyze dependencies for bundle impact
   */
  private async analyzeDependencies(): Promise<DependencyAnalysis[]> {
    try {
      const dependencies: DependencyAnalysis[] = [];

      if (!fs.existsSync('package.json')) {
        return dependencies
      }

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Analyze major dependencies that impact bundle size
      const heavyDependencies = [
        'react',
        'react-dom',
        'next',
        '@chakra-ui/react',
        'framer-motion',
        'lodash',
        'moment',
        'axios',
        'three',
        'chart.js'
      ];

      for (const [name, version] of Object.entries(deps)) {
        if (heavyDependencies.includes(name) || this.isLikelyHeavyDependency(name)) {
          const size = await this.estimateDependencySize(name);
          const usage = this.analyzeDependencyUsage(name);
          const alternatives = this.suggestAlternatives(name);

          dependencies.push({
            name,
            size,
            version: version,
            usage,
            alternatives
          });
        }
      }

      return dependencies.sort((ab) => b.size - a.size);
    } catch (error) {
      console.warn(`⚠️  Dependency analysis failed: ${(error as any).message || 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Validate lazy loading implementation
   */
  async validateLazyLoading(): Promise<LazyLoadingValidation> {
    try {
      // // console.log('🔄 Validating lazy loading implementation...');

      const componentsAnalyzed = await this.countComponents();
      const lazyLoadedComponents = await this.countLazyLoadedComponents();
      const potentialLazyComponents = await this.identifyPotentialLazyComponents();
      const dataFetchingOptimizations = await this.identifyDataFetchingOptimizations();

      const score = Math.round((lazyLoadedComponents / Math.max(componentsAnalyzed, 1)) * 100),

      // // console.log(
        `🔄 Lazy loading validation complete: ${lazyLoadedComponents}/${componentsAnalyzed} components lazy loaded (${score}%)`,
      );

      return {
        componentsAnalyzed,
        lazyLoadedComponents,
        potentialLazyComponents,
        dataFetchingOptimizations,
        score
      };
    } catch (error) {
      console.warn(
        `⚠️  Lazy loading validation failed: ${(error as any).message || 'Unknown error'}`,
      );

      return {
        componentsAnalyzed: 0,
        lazyLoadedComponents: 0,
        potentialLazyComponents: [],
        dataFetchingOptimizations: [],
        score: 0
      };
    }
  }

  /**
   * Check for bundle size alerts
   */
  private async checkBundleSizeAlerts(analysis: BundleAnalysis): Promise<void> {
    // Check total bundle size
    if (analysis.totalSize > this.TARGET_BUNDLE_SIZE) {
      this.addAlert({
        type: 'size_exceeded',
        severity: analysis.totalSize > this.TARGET_BUNDLE_SIZE * 1.2 ? 'critical' : 'warning',
        message: `Bundle size (${analysis.totalSize}kB) exceeds target (${this.TARGET_BUNDLE_SIZE}kB)`,
        currentValue: analysis.totalSize,
        targetValue: this.TARGET_BUNDLE_SIZE,
        recommendations: [
          'Enable code splitting for large components',
          'Implement lazy loading for non-critical features',
          'Review and optimize large dependencies',
          'Enable tree shaking for unused code elimination'
        ],
        timestamp: new Date()
      });
    }

    // Check individual chunks
    for (const chunk of analysis.chunks) {
      if (chunk.size > this.TARGET_CHUNK_SIZE) {
        this.addAlert({
          type: 'chunk_too_large',
          severity: 'warning',
          message: `Chunk ${chunk.name} (${chunk.size}kB) exceeds recommended size (${this.TARGET_CHUNK_SIZE}kB)`,
          currentValue: chunk.size,
          targetValue: this.TARGET_CHUNK_SIZE,
          recommendations: [
            'Split large chunk into smaller modules',
            'Implement dynamic imports for heavy components',
            'Review chunk splitting configuration'
          ],
          timestamp: new Date()
        });
      }
    }

    // Check for unused dependencies
    for (const dep of analysis.dependencies) {
      if (dep.usage === 'optional' && dep.size > 50) {
        this.addAlert({
          type: 'unused_dependency',
          severity: 'warning',
          message: `Large optional dependency ${dep.name} (${dep.size}kB) may be removable`,
          currentValue: dep.size,
          targetValue: 0,
          recommendations: [
            `Consider removing ${dep.name} if not essential`,
            ...dep.alternatives.map(alt => `Consider lighter alternative: ${alt}`),,
          ],
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Generate comprehensive bundle optimization report
   */
  async generateOptimizationReport(): Promise<BundleOptimizationReport> {
    const analysis = await this.analyzeBundleSize();
    const lazyLoadingValidation = await this.validateLazyLoading();

    // Calculate overall score (0-100)
    const sizeScore = Math.max(;
      0,
      Math.min(100, (this.TARGET_BUNDLE_SIZE / Math.max(analysis.totalSize, 1)) * 100),
    );
    const lazyLoadingScore = lazyLoadingValidation.score;
    const overallScore = Math.round((sizeScore + lazyLoadingScore) / 2);

    const targetCompliance = analysis.totalSize <= this.TARGET_BUNDLE_SIZE;

    // Generate comprehensive recommendations
    const recommendations: string[] = [];

    if (!targetCompliance) {
      recommendations.push(
        `Reduce bundle size by ${analysis.totalSize - this.TARGET_BUNDLE_SIZE}kB to meet target`,
      );
    }

    if (lazyLoadingScore < 50) {
      recommendations.push(
        'Implement lazy loading for more components to improve initial load time',
      )
    }

    recommendations.push(...analysis.recommendations);

    return {
      timestamp: new Date(),
      analysis,
      lazyLoadingValidation,
      alerts: [...this.alerts],
      overallScore,
      targetCompliance,
      recommendations
    };
  }

  // Helper methods

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }

    return files;
  }

  private isAssetOptimized(filePath: string, type: BundleAsset['type']): boolean {
    const fileName = path.basename(filePath);

    switch (type) {
      case 'image':
        return fileName.includes('.webp') || fileName.includes('optimized');
      case 'js':
        return fileName.includes('.min.') || !fileName.includes('dev');
      case 'css':
        return fileName.includes('.min.') || !fileName.includes('dev');
      default:
        return true
    }
  }

  private isLikelyHeavyDependency(name: string): boolean {
    const heavyPatterns = ['ui', 'chart', 'graph', 'editor', 'calendar', 'table', 'grid'],
    return heavyPatterns.some(pattern => name.toLowerCase().includes(pattern));
  }

  private async estimateDependencySize(name: string): Promise<number> {
    // Simplified size estimation based on common dependencies
    const knownSizes: Record<string, number> = {
      react: 45,
      'react-dom': 130,
      next: 200,
      '@chakra-ui/react': 150,
      'framer-motion': 100,
      lodash: 70,
      moment: 65,
      axios: 15,
      three: 600,
      'chart.js': 80
    };

    return knownSizes[name] || 20; // Default estimate
  }

  private analyzeDependencyUsage(name: string): DependencyAnalysis['usage'] {
    // Simplified usage analysis
    const critical = ['react', 'react-dom', 'next'];
    const important = ['@chakra-ui/react', 'framer-motion'];

    if (critical.includes(name)) return 'critical';
    if (important.includes(name)) return 'important';
    return 'optional'
  }

  private suggestAlternatives(name: string): string[] {
    const alternatives: Record<string, string[]> = {
      lodash: ['ramda (functional)', 'native ES6 methods'],
      moment: ['date-fns (smaller)', 'dayjs (2kB)'],
      axios: ['fetch API (native)', 'ky (smaller)'],
      'chart.js': ['recharts (React-specific)', 'victory (modular)']
    };

    return alternatives[name] || [];
  }

  private async countComponents(): Promise<number> {
    try {
      const output = execSync('find src -name '*.tsx' -o -name '*.jsx' | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  private async countLazyLoadedComponents(): Promise<number> {
    try {
      const output = execSync(;
        'grep -r 'lazy\\|dynamic' src --include='*.tsx' --include='*.jsx' | wc -l',,
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0
    }
  }

  private async identifyPotentialLazyComponents(): Promise<string[]> {
    try {
      // Find large components that could benefit from lazy loading
      const output = execSync(;
        'find src -name '*.tsx' -exec wc -l {} + | sort -nr | head -10 | awk \'{print 2}\'',
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      return output
        .trim()
        .split('\n')
        .filter(line => line.trim());
    } catch (error) {
      return []
    }
  }

  private async identifyDataFetchingOptimizations(): Promise<string[]> {
    const optimizations: string[] = [];

    try {
      // Check for potential data fetching optimizations
      const hasUseEffect = execSync(;
        'grep -r 'useEffect' src --include='*.tsx' --include='*.jsx' | wc -l',,
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      const hasUseSWR = execSync(;
        'grep -r 'useSWR\\|useQuery' src --include='*.tsx' --include='*.jsx' | wc -l',,
        {
          encoding: 'utf8',
          stdio: 'pipe'
        },
      );

      const effectCount = parseInt(hasUseEffect.trim()) || 0;
      const swr = parseInt(hasUseSWR.trim()) || 0;

      if (effectCount > swr * 2) {
        optimizations.push('Consider using SWR or React Query for data fetching optimization');
      }

      if (effectCount > 20) {
        optimizations.push('Implement data prefetching for frequently accessed data');
        optimizations.push('Consider implementing virtual scrolling for large lists');
      }
    } catch (error) {
      // Ignore errors in optimization detection
    }

    return optimizations;
  }

  private generateBundleRecommendations(
    totalSize: number,
    chunks: BundleChunk[],
    assets: BundleAsset[],
    dependencies: DependencyAnalysis[],
  ): string[] {
    const recommendations: string[] = [];

    if (totalSize > this.TARGET_BUNDLE_SIZE) {
      recommendations.push(
        `Bundle size exceeds target by ${totalSize - this.TARGET_BUNDLE_SIZE}kB`,
      );
    }

    const largeChunks = chunks.filter(chunk => chunk.size > this.TARGET_CHUNK_SIZE);
    if (largeChunks.length > 0) {
      recommendations.push(
        `${largeChunks.length} chunks exceed recommended size - consider code splitting`,
      );
    }

    const unoptimizedAssets = assets.filter(asset => !asset.optimized && asset.size > 10);
    if (unoptimizedAssets.length > 0) {
      recommendations.push(
        `${unoptimizedAssets.length} assets could be optimized for better compression`,
      );
    }

    const heavyDependencies = dependencies.filter(dep => dep.size > 100);
    if (heavyDependencies.length > 0) {
      recommendations.push(
        `Consider alternatives for ${heavyDependencies.length} heavy dependencies`,
      );
    }

    return recommendations;
  }

  private addAlert(alert: BundleOptimizationAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-25);
    }

    // Log alert
    const severityIcon = alert.severity === 'critical' ? '🚨' : '⚠️';
    // // console.log(`${severityIcon} Bundle Alert: ${alert.message}`);
  }

  /**
   * Get current alerts
   */
  getCurrentAlerts(): BundleOptimizationAlert[] {
    return [...this.alerts]
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    // // console.log('📦 Bundle optimization alerts cleared');
  }

  /**
   * Export bundle analysis data
   */
  async exportBundleData(filePath: string): Promise<void> {
    try {
      const report = await this.generateOptimizationReport();
      const exportData = {
        timestamp: new Date().toISOString();
        report,
        history: this.analysisHistory,
        alerts: this.alerts
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
      // // console.log(`📦 Bundle analysis data exported to: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to export bundle data: ${(error as any).message || 'Unknown error'}`);
    }
  }
}
