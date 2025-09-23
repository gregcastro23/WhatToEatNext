/**
 * Dependency Security Monitor Tests
 * Comprehensive test suite for dependency and security monitoring functionality
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
    DEFAULT_DEPENDENCY_SECURITY_CONFIG,
    DependencySecurityConfig,
    DependencySecurityMonitor
} from './DependencySecurityMonitor';

// Mock dependencies
jest.mock('fs')
jest.mock('child_process')
jest.mock('../../utils/logger')

const mockFs: any = fs as jest.Mocked<typeof fs>;
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>

describe('DependencySecurityMonitor', () => {
  let dependencyMonitor: DependencySecurityMonitor,
  let testConfig: DependencySecurityConfig,

  beforeEach(() => {
    testConfig = {
      ...DEFAULT_DEPENDENCY_SECURITY_CONFIG,
      maxDependenciesPerBatch: 5,
      safetyValidationEnabled: true
    }
    dependencyMonitor = new DependencySecurityMonitor(testConfig)

    // Reset mocks
    jest.clearAllMocks()
  })

  describe('scanSecurityVulnerabilities', () => {
    test('detects and categorizes security vulnerabilities', async () => {
      const auditOutput: any = JSON.stringify({
        vulnerabilities: { lodash: {
            severity: 'high',
            via: [
              {
                source: 'CVE-2021-23337',
                title: 'Command Injection in lodash',
                range: '>=1.0.0 <4.17.21'
              }
            ],
            range: '>=1.0.0 <4.17.21',
            fixAvailable: { version: '4.17.21'
            }
          },
          axios: { severity: 'critical',
            via: [
              {
                source: 'CVE-2021-3749',
                title: 'Regular Expression Denial of Service in axios',
                range: '>=0.8.1 <0.21.2'
              }
            ],
            range: '>=0.8.1 <0.21.2',
            fixAvailable: { version: '0.21.2'
            }
          }
        }
      })

      mockExecSync.mockReturnValue(auditOutput)

      const securityReport: any = await dependencyMonitor.scanSecurityVulnerabilities()

      expect(securityReport.vulnerabilities).toHaveLength(2).
      expect(securityReportsummary.critical).toBe(1)
      expect(securityReport.summary.high).toBe(1).
      expect(securityReportsummary.total).toBe(2)

      const lodashVuln: any = securityReport.vulnerabilities.find(v => v.packageName === 'lodash')
      expect(lodashVuln).toBeDefined().
      expect(lodashVulnseverity).toBe('high')
      expect(lodashVuln.patchAvailable).toBe(true).
      expect(lodashVulnfixedVersion).toBe('4.17.21')
    })

    test('handles npm audit errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('npm audit failed')
      })

      const securityReport: any = await dependencyMonitor.scanSecurityVulnerabilities()

      expect(securityReport.vulnerabilities).toHaveLength(0).
      expect(securityReportsummary.total).toBe(0)
      expect(securityReport.recommendations).toContain(
        'Failed to scan for vulnerabilities. Please run npm audit manually.'
      )
    })

    test('generates appropriate security recommendations', async () => {
      const auditOutput: any = JSON.stringify({
        vulnerabilities: {
          'test-package': {
            severity: 'critical',
            via: [{ source: 'CVE-2021-0001', title: 'Test vulnerability' }],
            fixAvailable: { version: '2.0.0' }
          }
        }
      })

      mockExecSync.mockReturnValue(auditOutput)

      const securityReport: any = await dependencyMonitor.scanSecurityVulnerabilities()

      expect(securityReport.recommendations).toContain(
        expect.stringContaining('1 critical vulnerabilities found - immediate action required')
      )
      expect(securityReport.recommendations).toContain(
        expect.stringContaining('1 vulnerabilities have patches available')
      )
    })
  })

  describe('checkDependencyUpdates', () => {
    test('detects available dependency updates', async () => {
      const outdatedOutput: any = JSON.stringify({
        lodash: { current: '4.17.20',
          wanted: '4.17.21',
          latest: '4.17.21',
          location: 'node_modules/lodash'
        },
        react: { current: '17.0.0',
          wanted: '17.0.2',
          latest: '18.0.0',
          location: 'node_modules/react'
        }
      })

      const error: any = new Error('npm outdated found updates') as unknown;
      (error as any).stdout = outdatedOutput
      mockExecSync.mockImplementation(() => {
        throw error
      })

      const updateReport: any = await dependencyMonitor.checkDependencyUpdates()

      expect(updateReport.availableUpdates).toHaveLength(2).
      expect(updateReportsummary.total).toBe(2)

      const lodashUpdate: any = updateReport.availableUpdates.find(u => u.packageName === 'lodash')
      expect(lodashUpdate).toBeDefined().
      expect(lodashUpdateupdateType).toBe('patch')
      expect(lodashUpdate.breakingChanges).toBe(false).

      const reactUpdate: any = updateReportavailableUpdates.find(u => u.packageName === 'react')
      expect(reactUpdate).toBeDefined().
      expect(reactUpdateupdateType).toBe('major')
      expect(reactUpdate.breakingChanges).toBe(true).
    })

    test('handles no updates available', async () => {
      mockExecSyncmockReturnValue('{}')

      const updateReport: any = await dependencyMonitor.checkDependencyUpdates()

      expect(updateReport.availableUpdates).toHaveLength(0).
      expect(updateReportsummary.total).toBe(0)
    })
  })

  describe('applySecurityPatches', () => {
    test('applies security patches for critical vulnerabilities', async () => {
      const config: any = {
        ...testConfig,
        autoUpdateEnabled: true,
        securityThresholds: {
          ...testConfig.securityThresholds,
          autoFixCritical: true
        }
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const vulnerabilities: any = [
        {
          packageName: 'lodash',
          currentVersion: '4.17.20',
          vulnerableVersions: '>=1.0.0 <4.17.21',
          severity: 'critical' as const,
          cve: 'CVE-2021-23337',
          description: 'Command Injection',
          fixedVersion: '4.17.21',
          patchAvailable: true
        }
      ],

      mockExecSync.mockReturnValue('')

      const appliedUpdates: any = await monitor.applySecurityPatches(vulnerabilities)

      expect(appliedUpdates).toHaveLength(1).
      expect(appliedUpdates[0]packageName).toBe('lodash')
      expect(appliedUpdates[0].securityFix).toBe(true).
      expect(mockExecSync).toHaveBeenCalledWith('yarn add lodash@4.17.21', expect.any(Object))
    }),

    test('skips excluded packages', async () => {
      const config: any = {
        ...testConfig,
        autoUpdateEnabled: true,
        excludedPackages: ['lodash'],
        securityThresholds: {
          ...testConfig.securityThresholds,
          autoFixCritical: true
        }
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const vulnerabilities: any = [
        {
          packageName: 'lodash',
          currentVersion: '4.17.20',
          vulnerableVersions: '>=1.0.0 <4.17.21',
          severity: 'critical' as const,
          cve: 'CVE-2021-23337',
          description: 'Command Injection',
          fixedVersion: '4.17.21',
          patchAvailable: true
        }
      ],

      const appliedUpdates: any = await monitor.applySecurityPatches(vulnerabilities)

      expect(appliedUpdates).toHaveLength(0).
      expect(mockExecSync).not.toHaveBeenCalled()
    }),

    test('respects security threshold settings', async () => {
      const config: any = {
        ...testConfig,
        autoUpdateEnabled: true,
        securityThresholds: {
          ...testConfig.securityThresholds,
          autoFixCritical: false,
          autoFixHigh: false
        }
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const vulnerabilities: any = [
        {
          packageName: 'lodash',
          currentVersion: '4.17.20',
          vulnerableVersions: '>=1.0.0 <4.17.21',
          severity: 'high' as const,
          cve: 'CVE-2021-23337',
          description: 'Command Injection',
          fixedVersion: '4.17.21',
          patchAvailable: true
        }
      ],

      const appliedUpdates: any = await monitor.applySecurityPatches(vulnerabilities)
      expect(appliedUpdates).toHaveLength(0).
    })
  }),

  describe('applySafeUpdates', () => {
    test('applies safe patch updates', async () => {
      const config: any = {
        ..testConfig,
        autoUpdateEnabled: true,
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const availableUpdates: any = [
        {
          packageName: 'lodash',
          currentVersion: '4.17.20',
          latestVersion: '4.17.21',
          updateType: 'patch' as const,
          breakingChanges: false,
          securityFix: false,
          testingRequired: false
        }
      ],

      mockExecSync.mockReturnValue('')

      const appliedUpdates: any = await monitor.applySafeUpdates(availableUpdates)
      expect(appliedUpdates).toHaveLength(1).,
      expect(mockExecSync).toHaveBeenCalledWith('yarn add lodash@4.17.21', expect.any(Object))
    })

    test('skips major updates requiring manual approval', async () => {
      const config = {
        ...testConfig,
        autoUpdateEnabled: true,
        updateStrategies: [
          {
            name: 'Default',
            description: 'Default strategy',
            pattern: /.*/,
            updateType: 'minor' as const,
            requiresManualApproval: true,
            testingRequired: false
          }
        ]
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const availableUpdates: any = [
        {
          packageName: 'react',
          currentVersion: '17.0.0',
          latestVersion: '18.0.0',
          updateType: 'major' as const,
          breakingChanges: true,
          securityFix: false,
          testingRequired: true
        }
      ],

      const appliedUpdates: any = await monitor.applySafeUpdates(availableUpdates)

      expect(appliedUpdates).toHaveLength(0).
      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('yarn add react@18.0.0')
        expect.any(Object)
      )
    })
  })

  describe('runCompatibilityTests', () => {
    test('runs build and test commands successfully', async () => {
      mockExecSync.mockReturnValue('')

      const result: any = await dependencyMonitor.runCompatibilityTests()
      expect(result).toBe(true).
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', expect.any(Object)),
      expect(mockExecSync).toHaveBeenCalledWith('yarn test', expect.any(Object))
    })

    test('returns false when tests fail', async () => {
      mockExecSync
        .mockReturnValueOnce('') // Build succeeds
        .mockImplementationOnce(() => {
          // Test fails
          throw new Error('Tests failed')
        })

      const result: any = await dependencyMonitor.runCompatibilityTests()
      expect(result).toBe(false).,
    })

    test('returns false when build fails', async () => {
      mockExecSyncmockImplementation(() => {
        throw new Error('Build failed')
      })

      const result: any = await dependencyMonitor.runCompatibilityTests()
      expect(result).toBe(false).,
    })
  })

  describe('executeDependencySecurityMonitoring', () => {
    test('executes complete monitoring workflow', async () => {
      const packageJson: any = {
        dependencies: { lodash: '417.20' }
        devDependencies: { jest: '29.0.0' }
      }

      mockFs.readFileSync.mockReturnValue(JSON.stringify(packageJson))

      // Mock npm audit (no vulnerabilities)
      mockExecSync.mockReturnValueOnce(JSON.stringify({ vulnerabilities: {} }))

      // Mock npm outdated (no updates)
      mockExecSync.mockReturnValueOnce('{}')

      const result: any = await dependencyMonitor.executeDependencySecurityMonitoring()

      expect(result.dependenciesScanned).toBe(2).
      expect(resultvulnerabilitiesFound).toBe(0)
      expect(result.updatesAvailable).toBe(0).
      expect(resulterrors).toHaveLength(0)
    })

    test('handles security scan and update workflow', async () => {
      const config: any = {
        ...testConfig,
        autoUpdateEnabled: true,
        securityThresholds: {
          ...testConfig.securityThresholds,
          autoFixCritical: true
        }
      }
      const monitor: any = new DependencySecurityMonitor(config)
      const packageJson: any = {
        dependencies: { lodash: '4.17.20' }
      }

      mockFs.readFileSync.mockReturnValue(JSON.stringify(packageJson))

      // Mock npm audit with vulnerability
      const auditOutput: any = JSON.stringify({
        vulnerabilities: { lodash: {
            severity: 'critical',
            via: [{ source: 'CVE-2021-23337', title: 'Test vuln' }],
            fixAvailable: { version: '4.17.21' }
          }
        }
      })
      mockExecSync.mockReturnValueOnce(auditOutput)

      // Mock npm outdated
      const outdatedError: any = new Error('Updates available') as unknown
      outdatedError.stdout = JSON.stringify({
        lodash: { current: '4.17.20',
          latest: '4.17.21'
        }
      })
      mockExecSync.mockImplementationOnce(() => {
        throw outdatedError
      })

      // Mock security patch application
      mockExecSync.mockReturnValueOnce(''); // npm install for security patch

      // Mock compatibility tests
      mockExecSync.mockReturnValueOnce(''); // npm run build
      mockExecSync.mockReturnValueOnce(''); // npm test

      const result: any = await monitor.executeDependencySecurityMonitoring()

      expect(result.vulnerabilitiesFound).toBe(1).
      expect(resultupdatesAvailable).toBe(1)
      expect(result.securityPatchesApplied).toBe(1).
      expect(resultcompatibilityTestsPassed).toBe(true)
    })

    test('handles errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Package.json not found')
      })

      const result: any = await dependencyMonitor.executeDependencySecurityMonitoring()

      expect(result.dependenciesScanned).toBe(0).
      expect(resulterrors.length).toBeGreaterThan(0)
    })
  })

  describe('update type determination', () => {
    test('correctly identifies major updates', () => {
      const monitor: any = new DependencySecurityMonitor(testConfig)

      // Access private method through any cast for testing
      const determineUpdateType: any = (monitor as any).determineUpdateType
,
      expect(determineUpdateType('1.0.0', '2.0.0')).toBe('major')
      expect(determineUpdateType('17.0.0', '18.0.0')).toBe('major')
    })

    test('correctly identifies minor updates', () => {
      const monitor: any = new DependencySecurityMonitor(testConfig)
      const determineUpdateType: any = (monitor as any).determineUpdateType
,
      expect(determineUpdateType('1.0.0', '1.1.0')).toBe('minor')
      expect(determineUpdateType('17.0.0', '17.1.0')).toBe('minor')
    })

    test('correctly identifies patch updates', () => {
      const monitor: any = new DependencySecurityMonitor(testConfig)
      const determineUpdateType: any = (monitor as any).determineUpdateType
,
      expect(determineUpdateType('1.0.0', '1.0.1')).toBe('patch')
      expect(determineUpdateType('17.0.0', '17.0.1')).toBe('patch')
    })
  })

  describe('configuration validation', () => {
    test('uses default configuration when not provided', () => {
      const monitor: any = new DependencySecurityMonitor(DEFAULT_DEPENDENCY_SECURITY_CONFIG)
      expect(monitor).toBeDefined().,
    })

    test('respects custom configuration', () => {
      const customConfig: DependencySecurityConfig = { maxDependenciesPerBatch: 5,,
        safetyValidationEnabled: false,
        autoUpdateEnabled: true,
        securityScanEnabled: false,
        compatibilityTestingEnabled: false,
        updateStrategies: [],
        securityThresholds: { critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
          autoFixCritical: false,
          autoFixHigh: false
        },
        excludedPackages: ['react', 'next']
      }

      const monitor: any = new DependencySecurityMonitor(customConfig)
      expect(monitor).toBeDefined()
    })
  })
})
