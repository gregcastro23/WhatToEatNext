/**
 * Bundle Size Optimizer Tests
 * Perfect Codebase Campaign - Phase 4 Implementation Tests
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { BundleSizeOptimizer } from './BundleSizeOptimizer';

// Mock external dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('BundleSizeOptimizer', () => {
  let bundleOptimizer: BundleSizeOptimizer;

  beforeEach(() => {
    bundleOptimizer = new BundleSizeOptimizer();
    jest.clearAllMocks();
  });

  describe('analyzeBundleSize', () => {
    it('should analyze Next.js bundle size': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === '.next' || path === '.next/static/chunks';
      });

      mockFs.readFileSync.mockImplementation((path: string) => {
        if (path === 'package.json') {
          return JSON.stringify({
            dependencies: { react: '^18.0.0',
              '@next/bundle-analyzer': '^13.0.0',
            },
          });
        }
        return '';
      });

      mockFs.readdirSync.mockReturnValue(['main.js', 'vendor.js', 'lazy-component.js'] as any[]);
      mockFs.statSync.mockReturnValue({ size: 50 * 1024 } as any.Stats); // 50kB files

      mockExecSync.mockReturnValue('400\n'); // 400kB total

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.totalSize).toBe(400);
      expect(analysis.compressedSize).toBe(280); // 70% compression
      expect(analysis.chunks).toHaveLength(3);
      expect(analysis.chunks.[0].name).toBe('main.js');
      expect(analysis.chunks.[2].isLazyLoaded).toBe(true); // lazy-component.js
    });

    it('should analyze generic build directory': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === 'dist';
      });

      mockExecSync.mockReturnValue('350\n'); // 350kB total

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.totalSize).toBe(350);
      expect(analysis.compressedSize).toBe(245); // 70% compression
    });

    it('should estimate bundle size from source code': any, async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('200000\n'); // 200kB source code

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.totalSize).toBe(293); // Math.round(200000 / 1024 * 1.5) = 293
    });

    it('should handle bundle analysis errors gracefully': any, async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.totalSize).toBe(400); // Conservative estimate fallback
      // The error is caught in estimateBundleSize, so recommendations will be generated normally
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('validateLazyLoading', () => {
    it('should validate lazy loading implementation': any, async () => {
      mockExecSync
        .mockReturnValueOnce('25\n') // 25 components
        .mockReturnValueOnce('10\n') // 10 lazy loaded
        .mockReturnValueOnce('src/components/LargeComponent.tsx\nsrc/pages/HeavyPage.tsx\n') // potential lazy components
        .mockReturnValueOnce('15\n') // useEffect count
        .mockReturnValueOnce('5\n'); // useSWR count

      const validation: any = await bundleOptimizer.validateLazyLoading();

      expect(validation.componentsAnalyzed).toBe(25);
      expect(validation.lazyLoadedComponents).toBe(10);
      expect(validation.score).toBe(40); // 10/25 * 100
      expect(validation.potentialLazyComponents).toHaveLength(2);
      expect(validation.dataFetchingOptimizations).toContain(
        'Consider using SWR or React Query for data fetching optimization',
      );
    });

    it('should handle lazy loading validation errors': any, async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const validation: any = await bundleOptimizer.validateLazyLoading();

      expect(validation.componentsAnalyzed).toBe(0);
      expect(validation.lazyLoadedComponents).toBe(0);
      expect(validation.score).toBe(0);
    });
  });

  describe('bundle size alerts', () => {
    it('should generate alert when bundle size exceeds target': any, async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('500000\n'); // Large source code resulting in 732kB bundle

      await bundleOptimizer.analyzeBundleSize();

      const alerts: any = bundleOptimizer.getCurrentAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const sizeAlert: any = alerts.find(alert => alert.type === 'size_exceeded');
      expect(sizeAlert).toBeDefined();
      expect(sizeAlert.severity).toBe('critical'); // > 420 * 1.2
      expect(sizeAlert.currentValue).toBe(732); // Math.round(500000 / 1024 * 1.5) = 732
      expect(sizeAlert.targetValue).toBe(420);
    });

    it('should generate alert for large chunks': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === '.next' || path === '.next/static/chunks';
      });

      mockFs.readdirSync.mockReturnValue(['large-chunk.js'] as any[]);
      mockFs.statSync.mockReturnValue({ size: 150 * 1024 } as any.Stats); // 150kB chunk
      mockExecSync.mockReturnValue('400\n');

      await bundleOptimizer.analyzeBundleSize();

      const alerts: any = bundleOptimizer.getCurrentAlerts();
      const chunkAlert: any = alerts.find(alert => alert.type === 'chunk_too_large');

      expect(chunkAlert).toBeDefined();
      expect(chunkAlert.message).toContain('large-chunk.js');
      expect(chunkAlert.currentValue).toBe(150);
      expect(chunkAlert.targetValue).toBe(100);
    });

    it('should generate alert for unused dependencies': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === 'package.json';
      });
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: { lodash: '^4.0.0',
            moment: '^2.0.0',
          },
        }),
      );

      mockExecSync.mockReturnValue('300000\n'); // Source size

      await bundleOptimizer.analyzeBundleSize();

      const alerts: any = bundleOptimizer.getCurrentAlerts();
      const depAlert: any = alerts.find(alert => alert.type === 'unused_dependency');

      expect(depAlert).toBeDefined();
      expect(depAlert.message).toContain('optional dependency');
    });
  });

  describe('generateOptimizationReport', () => {
    it('should generate comprehensive optimization report': any, async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync
        .mockReturnValueOnce('280000\n') // Source size (410kB bundle)
        .mockReturnValueOnce('20\n') // Components
        .mockReturnValueOnce('8\n') // Lazy loaded
        .mockReturnValueOnce('src/components/Heavy.tsx\n') // Potential lazy
        .mockReturnValueOnce('10\n') // useEffect
        .mockReturnValueOnce('3\n'); // useSWR

      const report: any = await bundleOptimizer.generateOptimizationReport();

      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.analysis.totalSize).toBe(410); // Math.round(280000 / 1024 * 1.5) = 410
      expect(report.lazyLoadingValidation.score).toBe(40); // 8/20 * 100
      expect(report.overallScore).toBe(70); // (100 + 40) / 2
      expect(report.targetCompliance).toBe(true); // 410 <= 420
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should indicate non-compliance when bundle exceeds target': any, async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync
        .mockReturnValueOnce('350000\n') // Source size (513kB bundle)
        .mockReturnValueOnce('15\n') // Components
        .mockReturnValueOnce('3\n') // Lazy loaded
        .mockReturnValueOnce('') // No potential lazy
        .mockReturnValueOnce('5\n') // useEffect
        .mockReturnValueOnce('2\n'); // useSWR

      const report: any = await bundleOptimizer.generateOptimizationReport();

      expect(report.analysis.totalSize).toBe(513); // Math.round(350000 / 1024 * 1.5) = 513
      expect(report.targetCompliance).toBe(false);
      expect(report.recommendations.[0]).toContain('Reduce bundle size by 93kB'); // 513 - 420 = 93
    });
  });

  describe('asset analysis', () => {
    it('should analyze assets correctly': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === 'public';
      });

      // Mock getAllFiles method behavior
      const mockGetAllFiles: any = jest
        .fn()
        .mockReturnValue(['public/image.png', 'public/style.css', 'public/script.js', 'public/font.woff2']);

      (bundleOptimizer as any).getAllFiles = mockGetAllFiles;

      mockFs.statSync.mockImplementation((path: string) => {
        const sizes: Record<string, number> = {
          'public/image.png': 100 * 1024, // 100kB
          'public/style.css': 20 * 1024, // 20kB
          'public/script.js': 50 * 1024, // 50kB
          'public/font.woff2': 30 * 1024, // 30kB
        };
        return { size: sizes[path] || 1024 } as any.Stats;
      });

      mockExecSync.mockReturnValue('300000\n');

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.assets).toHaveLength(4);
      expect(analysis.assets.[0].size).toBe(100); // Largest first
      expect(analysis.assets.[0].type).toBe('image');
      expect(analysis.assets.find(a => a.type === 'css')).toBeDefined();
      expect(analysis.assets.find(a => a.type === 'js')).toBeDefined();
      expect(analysis.assets.find(a => a.type === 'font')).toBeDefined();
    });
  });

  describe('dependency analysis', () => {
    it('should analyze dependencies for bundle impact': any, async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === 'package.json';
      });
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: { react: '^18.0.0',
            'react-dom': '^18.0.0',
            lodash: '^4.0.0',
            'chart.js': '^3.0.0',
          },
        }),
      );

      mockExecSync.mockReturnValue('300000\n');

      const analysis: any = await bundleOptimizer.analyzeBundleSize();

      expect(analysis.dependencies).toHaveLength(4);
      expect(analysis.dependencies.[0].name).toBe('react-dom'); // Largest first (130kB)
      expect(analysis.dependencies.find(d => d.name === 'react')?.usage).toBe('critical');
      expect(analysis.dependencies.find(d => d.name === 'lodash')?.alternatives).toContain('ramda (functional)');
    });
  });

  describe('alert management', () => {
    it('should manage alerts correctly', () => {
      const initialAlerts: any = bundleOptimizer.getCurrentAlerts();
      expect(initialAlerts).toHaveLength(0);

      // Trigger alert by analyzing large bundle
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('500000\n'); // Large bundle

      return bundleOptimizer.analyzeBundleSize().then(() => {
        const alertsAfterAnalysis: any = bundleOptimizer.getCurrentAlerts();
        expect(alertsAfterAnalysis.length).toBeGreaterThan(0);

        bundleOptimizer.clearAlerts();

        const alertsAfterClear: any = bundleOptimizer.getCurrentAlerts();
        expect(alertsAfterClear).toHaveLength(0);
      });
    });
  });

  describe('data export', () => {
    it('should export bundle data to file': any, async () => {
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync
        .mockReturnValueOnce('300000\n') // Bundle analysis
        .mockReturnValueOnce('15\n') // Components
        .mockReturnValueOnce('5\n') // Lazy loaded
        .mockReturnValueOnce('') // Potential lazy
        .mockReturnValueOnce('8\n') // useEffect
        .mockReturnValueOnce('3\n'); // useSWR

      await bundleOptimizer.exportBundleData('./test-bundle-data.json');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './test-bundle-data.json',
        expect.stringContaining('"timestamp"'),
      );
    });

    it('should handle export errors gracefully': any, async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(bundleOptimizer.exportBundleData('./test-bundle-data.json')).rejects.toThrow(
        'Failed to export bundle data',
      );
    });
  });

  describe('helper methods', () => {
    it('should identify heavy dependencies correctly', () => {
      const isHeavy: any = (bundleOptimizer as any).isLikelyHeavyDependency;

      expect(isHeavy('@chakra-ui/react')).toBe(true);
      expect(isHeavy('react-table')).toBe(true);
      expect(isHeavy('chart-library')).toBe(true);
      expect(isHeavy('simple-util')).toBe(false);
    });

    it('should estimate dependency sizes correctly': any, async () => {
      const estimateSize: any = (bundleOptimizer as any).estimateDependencySize;

      expect(await estimateSize('react')).toBe(45);
      expect(await estimateSize('react-dom')).toBe(130);
      expect(await estimateSize('unknown-package')).toBe(20); // Default
    });

    it('should analyze dependency usage correctly', () => {
      const analyzeUsage: any = (bundleOptimizer as any).analyzeDependencyUsage;

      expect(analyzeUsage('react')).toBe('critical');
      expect(analyzeUsage('@chakra-ui/react')).toBe('important');
      expect(analyzeUsage('lodash')).toBe('optional');
    });

    it('should suggest alternatives correctly', () => {
      const suggestAlternatives: any = (bundleOptimizer as any).suggestAlternatives;

      expect(suggestAlternatives('lodash')).toContain('ramda (functional)');
      expect(suggestAlternatives('moment')).toContain('date-fns (smaller)');
      expect(suggestAlternatives('unknown-package')).toEqual([]);
    });
  });
});
