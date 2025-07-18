# Build System Repair Documentation

## Overview

The Build System Repair functionality provides comprehensive tools for diagnosing, repairing, and maintaining the Next.js build system. This system addresses critical build failures, missing manifest files, and build configuration issues to ensure reliable application deployment.

## Features

### 🔍 Build Validation
- Validates existence of required build artifacts
- Checks manifest file integrity and structure
- Detects missing or corrupted build files
- Provides detailed validation reports

### 🔧 Automatic Repair
- Creates missing manifest files with minimal content
- Repairs corrupted JSON files
- Ensures proper directory structure
- Fixes common build configuration issues

### 🏗️ Build Recovery
- Rebuilds application with error recovery mechanisms
- Implements retry logic with exponential backoff
- Cleans and recreates build artifacts when needed
- Provides comprehensive error reporting

### 🏥 Health Monitoring
- Monitors build system health continuously
- Tracks build size and performance metrics
- Reports last build time and status
- Identifies potential issues before they cause failures

## CLI Usage

### Available Commands

```bash
# Validate build system
yarn build:validate
node scripts/build-system-repair.cjs validate

# Repair missing or corrupted files
yarn build:repair
node scripts/build-system-repair.cjs repair

# Rebuild with error recovery
yarn build:rebuild
node scripts/build-system-repair.cjs rebuild

# Comprehensive repair (recommended)
yarn build:comprehensive
node scripts/build-system-repair.cjs comprehensive

# Quick repair for common issues
yarn build:quick
node scripts/build-system-repair.cjs quick

# Check build system health
yarn build:health
node scripts/build-system-repair.cjs health

# Emergency recovery (cleans and rebuilds)
yarn build:emergency
node scripts/build-system-repair.cjs emergency

# Show help
node scripts/build-system-repair.cjs help
```

### Example Output

```bash
$ yarn build:health
🏥 Checking build system health...

📊 Health Report (2025-07-18T03:57:29.503Z):
  Build exists: ✅
  Manifests valid: ✅
  Build size: 1628.37 MB
  Last build: 2025-07-18T03:50:37.576Z
```

## Architecture

### Core Components

#### BuildValidator Class
- **Location**: `src/utils/BuildValidator.ts`
- **Purpose**: Validates build artifacts and manifest files
- **Key Methods**:
  - `validateBuild()`: Comprehensive build validation
  - `repairBuild()`: Repairs missing or corrupted files
  - `rebuildWithRecovery()`: Rebuilds with retry logic
  - `monitorBuildHealth()`: Health monitoring and reporting

#### NextConfigOptimizer Class
- **Location**: `src/utils/nextConfigOptimizer.ts`
- **Purpose**: Optimizes Next.js configuration for build stability
- **Key Methods**:
  - `optimizeConfig()`: Optimizes configuration settings
  - `fixCommonIssues()`: Fixes common configuration problems
  - `validateAndOptimizeExistingConfig()`: Validates existing config

#### BuildSystemRepair Class
- **Location**: `src/utils/buildSystemRepair.ts`
- **Purpose**: Orchestrates comprehensive build system repair
- **Key Methods**:
  - `performComprehensiveRepair()`: Full system repair
  - `quickRepair()`: Quick fix for common issues
  - `emergencyRecovery()`: Emergency recovery procedures

### Required Manifest Files

The system ensures the following manifest files exist and are valid:

```
.next/
├── build-manifest.json
├── app-build-manifest.json
├── react-loadable-manifest.json
└── server/
    ├── pages-manifest.json
    ├── app-paths-manifest.json
    ├── next-font-manifest.json
    └── middleware-manifest.json
```

### Default Manifest Content

When creating missing manifest files, the system uses minimal valid content:

```json
// pages-manifest.json
{}

// app-paths-manifest.json
{}

// next-font-manifest.json
{
  "pages": {},
  "app": {},
  "appUsingSizeAdjust": false,
  "pagesUsingSizeAdjust": false
}

// middleware-manifest.json
{
  "sortedMiddleware": [],
  "middleware": {},
  "functions": {},
  "version": 2
}
```

## Integration with Test System

The build system repair integrates with the test system stabilization to ensure:

- Tests can run without build failures
- Memory-efficient build processes
- Proper error handling during test execution
- Validation of build artifacts before test runs

### Memory Management

The build system includes memory optimization features:

- Limits build worker processes to prevent memory exhaustion
- Implements garbage collection hints
- Monitors memory usage during builds
- Provides memory-efficient retry mechanisms

### Error Recovery

Comprehensive error recovery includes:

- Automatic rollback on build failures
- Progressive retry with increasing delays
- Clean build directory recreation
- Dependency reinstallation when needed

## Testing

### Unit Tests
- **Location**: `src/__tests__/utils/BuildValidator.test.ts`
- **Coverage**: Core BuildValidator functionality
- **Mocking**: File system operations and child processes

### Integration Tests
- **Location**: `src/__tests__/integration/buildSystemIntegration.test.ts`
- **Coverage**: End-to-end CLI functionality
- **Real Testing**: Actual command execution and validation

### Test Commands

```bash
# Run unit tests
yarn test src/__tests__/utils/BuildValidator.test.ts

# Run integration tests
yarn test src/__tests__/integration/buildSystemIntegration.test.ts

# Run all build system tests
yarn test --testPathPattern="(BuildValidator|buildSystemIntegration)"
```

## Troubleshooting

### Common Issues

#### Build Directory Missing
```bash
# Symptoms
❌ Build system has issues:
  Missing files: 1

# Solution
yarn build:repair
```

#### Corrupted Manifest Files
```bash
# Symptoms
🔧 Corrupted files:
  - .next/server/pages-manifest.json

# Solution
yarn build:comprehensive
```

#### Build Failures
```bash
# Symptoms
Build failed after multiple attempts

# Solution
yarn build:emergency
```

#### Memory Issues
```bash
# Symptoms
JavaScript heap out of memory

# Solution
# The system automatically handles memory constraints
# But you can also manually clean and rebuild
yarn build:emergency
```

### Debug Information

Enable debug logging by setting environment variables:

```bash
DEBUG=build-system yarn build:comprehensive
NODE_OPTIONS="--max-old-space-size=4096" yarn build:rebuild
```

## Configuration

### Next.js Configuration Optimization

The system automatically optimizes Next.js configuration for:

- Proper manifest generation
- Build stability
- Memory efficiency
- Error recovery

### Recommended Settings

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false, // Enable for stability
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable for quality
  },
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
};
```

## Performance Metrics

The system tracks and reports:

- Build completion time
- Build artifact size
- Memory usage during builds
- Success/failure rates
- Recovery attempt statistics

## Future Enhancements

Planned improvements include:

- Automated build optimization suggestions
- Integration with CI/CD pipelines
- Advanced performance monitoring
- Predictive failure detection
- Build cache optimization

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Run `yarn build:health` to get current status
3. Use `yarn build:comprehensive` for most issues
4. Check the integration tests for expected behavior
5. Review the source code in `src/utils/` for implementation details

## Requirements Fulfilled

This implementation addresses all requirements from the test system stabilization specification:

- **3.1**: ✅ Fix Next.js configuration to properly generate manifest files
- **3.2**: ✅ Implement BuildValidator class to check for required build artifacts
- **3.3**: ✅ Create missing manifest files with minimal content when needed
- **3.4**: ✅ Add build error recovery and retry mechanisms
- **3.5**: ✅ Add build error recovery and retry mechanisms (comprehensive monitoring)

The system provides a robust, tested, and well-documented solution for build system stability and repair.