# CI/CD Pipeline Documentation

## Overview

The WhatToEatNext project includes a comprehensive CI/CD pipeline that
integrates build system repair, quality gates, automated testing, and deployment
workflows. This pipeline ensures reliable, high-quality deployments with
automated rollback capabilities.

## Pipeline Architecture

### 🔄 Complete CI/CD Workflow

```bash
make ci-validate → make ci-build → make ci-test → make ci-quality-gate → make deploy-pipeline
```

### 🛡️ Safety-First Approach

- **Build System Repair**: Automatic manifest file repair and validation
- **Quality Gates**: TypeScript error thresholds and test coverage requirements
- **Rollback Mechanisms**: Automated rollback procedures for failed deployments
- **Health Monitoring**: Continuous build system health monitoring

## CI/CD Commands

### Core Pipeline Commands

#### `make ci-validate`

**Purpose**: Complete CI validation workflow **Steps**:

1. Build system health check
2. TypeScript validation
3. Linting validation
4. Safe build with integrated repair

**Usage**:

```bash
make ci-validate
```

**Output Example**:

```
🔍 Running complete CI validation workflow...
Step 1: Build system health check...
✅ Build system is healthy
Step 2: TypeScript validation...
✅ TypeScript compilation successful
Step 3: Linting validation...
✅ Linting checks passed
Step 4: Build validation...
✅ Safe build completed
✅ CI validation completed successfully!
```

#### `make ci-build`

**Purpose**: CI-optimized build process with comprehensive repair **Steps**:

1. Clean previous build artifacts
2. Install fresh dependencies
3. Build system comprehensive repair
4. Production build

**Usage**:

```bash
make ci-build
```

#### `make ci-test`

**Purpose**: Comprehensive test execution with coverage **Steps**:

1. Unit tests execution
2. Test coverage analysis
3. Integration tests execution

**Usage**:

```bash
make ci-test
```

#### `make ci-quality-gate`

**Purpose**: Quality gate validation with configurable thresholds **Validation
Criteria**:

- TypeScript errors < 100 (configurable)
- Build stability check
- Test coverage requirements

**Usage**:

```bash
make ci-quality-gate
```

**Quality Gate Thresholds**:

```makefile
# Current thresholds (configurable)
TYPESCRIPT_ERROR_THRESHOLD=100
BUILD_STABILITY_REQUIRED=true
TEST_COVERAGE_REQUIRED=true
```

#### `make ci-deploy-check`

**Purpose**: Pre-deployment validation **Steps**:

1. Final build validation
2. Error count verification
3. Git status check
4. Docker build test

**Usage**:

```bash
make ci-deploy-check
```

### Deployment Pipeline Commands

#### `make deploy-pipeline`

**Purpose**: Complete deployment workflow **Steps**:

1. CI validation
2. CI build
3. CI testing
4. Quality gate validation
5. Pre-deployment check
6. Docker deployment

**Usage**:

```bash
make deploy-pipeline
```

#### `make deploy-rollback`

**Purpose**: Emergency rollback procedures **Steps**:

1. Stop current deployment
2. Check recent commits
3. Create rollback branch
4. Docker cleanup
5. Provide rollback instructions

**Usage**:

```bash
make deploy-rollback
```

## Integration with Build System Repair

### Automatic Build Repair

The CI/CD pipeline integrates seamlessly with the build system repair
functionality:

```bash
# CI pipeline automatically includes:
make build-health        # Health monitoring
make build-validate      # Validation checks
make build-comprehensive # Comprehensive repair
make build-safe          # Safe build with repair
```

### Build System Health Gates

- **Pre-build Health Check**: Validates build system before starting
- **Manifest Validation**: Ensures all required manifest files exist
- **Repair Integration**: Automatic repair of missing/corrupted files
- **Post-build Validation**: Confirms successful build artifact generation

## Quality Gates Configuration

### TypeScript Error Thresholds

```bash
# Current configuration
TYPESCRIPT_ERROR_THRESHOLD=100

# Quality gate check
if [ $ERROR_COUNT -gt 100 ]; then
    echo "❌ Quality gate failed: $ERROR_COUNT TypeScript errors (threshold: 100)"
    exit 1
fi
```

### Build Stability Requirements

```bash
# Build stability validation
yarn tsc --noEmit --skipLibCheck > /dev/null 2>&1 && echo "✅ Build stable" || exit 1
```

### Test Coverage Requirements

```bash
# Test coverage validation
make test-coverage > /dev/null 2>&1 && echo "✅ Tests passing" || exit 1
```

## GitHub Actions Integration

### Workflow Configuration

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  ci-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.18.0'
          cache: 'yarn'

      - name: Install dependencies
        run: make install

      - name: CI Validation
        run: make ci-validate

      - name: CI Build
        run: make ci-build

      - name: CI Test
        run: make ci-test

      - name: Quality Gate
        run: make ci-quality-gate

  deployment:
    needs: ci-validation
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.18.0'
          cache: 'yarn'

      - name: Deploy Pipeline
        run: make deploy-pipeline
```

### Branch Protection Rules

Configure branch protection with:

- Require status checks to pass
- Require CI validation before merging
- Require quality gate validation
- Dismiss stale reviews when new commits are pushed

## Local Development Integration

### Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run CI validation before commit
make ci-validate
```

### Pre-push Hooks

Add to `.husky/pre-push`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run quality gate before push
make ci-quality-gate
```

## Monitoring and Alerting

### Build Health Monitoring

```bash
# Continuous monitoring
make build-monitor

# Health status reporting
make build-status
```

### Pipeline Metrics

Track key metrics:

- Build success rate
- Test coverage percentage
- TypeScript error count trends
- Deployment frequency
- Mean time to recovery (MTTR)

### Alert Conditions

- Build failures
- Quality gate failures
- TypeScript error threshold exceeded
- Test coverage below threshold
- Deployment failures

## Environment-Specific Configurations

### Development Environment

```bash
# Development workflow
make dev
make build-health    # Regular health checks
make ci-validate     # Before commits
```

### Staging Environment

```bash
# Staging deployment
make ci-build
make ci-test
make ci-quality-gate
make deploy-pipeline
```

### Production Environment

```bash
# Production deployment
make ci-validate
make ci-build
make ci-test
make ci-quality-gate
make ci-deploy-check
make deploy-pipeline
```

## Rollback Procedures

### Automatic Rollback Triggers

- Build failures during deployment
- Health check failures
- Quality gate violations
- Test failures in production

### Manual Rollback Process

```bash
# Emergency rollback
make deploy-rollback

# Manual steps after rollback preparation:
# 1. Identify last stable commit
git log --oneline -10

# 2. Reset to stable state
git reset --hard <stable-commit-hash>

# 3. Redeploy
make deploy-pipeline
```

### Rollback Validation

```bash
# After rollback
make build-health     # Verify build system health
make ci-validate      # Validate system state
make ci-test          # Run tests to confirm stability
```

## Performance Optimization

### Build Performance

- Parallel test execution
- Incremental builds when possible
- Docker layer caching
- Dependency caching

### Pipeline Optimization

- Skip unnecessary steps for minor changes
- Conditional deployment based on changed files
- Parallel job execution where possible
- Efficient artifact management

## Security Considerations

### Secrets Management

- Use environment variables for sensitive data
- Rotate API keys regularly
- Secure Docker image scanning
- Dependency vulnerability scanning

### Access Control

- Limit deployment permissions
- Require code review for production deployments
- Audit deployment activities
- Implement least privilege access

## Troubleshooting

### Common Issues

#### Quality Gate Failures

```bash
# Check current error count
make errors

# Run comprehensive repair
make build-comprehensive

# Retry quality gate
make ci-quality-gate
```

#### Build Failures

```bash
# Check build system health
make build-health

# Run emergency repair
make build-emergency

# Retry build
make ci-build
```

#### Test Failures

```bash
# Run tests with detailed output
make test

# Check test coverage
make test-coverage

# Run integration tests separately
yarn test --testPathPattern="integration"
```

### Debug Commands

```bash
# Comprehensive status
make build-status

# Detailed error analysis
make errors-detail

# Git status check
make status-detailed
```

## Best Practices

### 1. Pipeline Design

- Keep pipelines fast and reliable
- Fail fast on critical issues
- Provide clear error messages
- Include comprehensive logging

### 2. Quality Gates

- Set realistic thresholds
- Monitor trends over time
- Adjust thresholds based on project maturity
- Include both automated and manual checks

### 3. Deployment Strategy

- Use blue-green deployments when possible
- Implement canary releases for major changes
- Maintain rollback capabilities
- Monitor post-deployment health

### 4. Maintenance

- Regularly update dependencies
- Monitor pipeline performance
- Review and update quality thresholds
- Maintain documentation

## Integration Points

### Build System Repair

- [Build System Repair Documentation](BUILD_SYSTEM_REPAIR.md)
- [Makefile Commands Reference](MAKEFILE_BUILD_SYSTEM_COMMANDS.md)

### Development Workflow

- [CLAUDE.md Development Guide](../CLAUDE.md)
- [Main Makefile](../Makefile)

### Testing Framework

- [Test System Stabilization](../src/__tests__/README.md)
- [Integration Tests](../src/__tests__/integration/)

## Summary

The CI/CD pipeline provides:

- **Comprehensive Validation**: Multi-stage validation with quality gates
- **Automated Repair**: Integration with build system repair tools
- **Reliable Deployment**: Safe deployment with rollback capabilities
- **Continuous Monitoring**: Health monitoring and alerting
- **Developer Experience**: Easy-to-use make commands for all operations
- **Production Ready**: Battle-tested pipeline for reliable deployments

This pipeline ensures that every deployment is validated, tested, and ready for
production while maintaining the ability to quickly rollback if issues arise.
