# GitLab CI/CD Pipeline Setup Guide

## Overview

This GitLab CI/CD pipeline provides comprehensive automated testing, building, and deployment for the WhatToEatNext project with PostgreSQL 17 integration.

## Quick Start

1. **Push `.gitlab-ci.yml` to your GitLab repository**
2. **Configure CI/CD variables** in GitLab (Settings > CI/CD > Variables)
3. **Enable GitLab Runner** for your project
4. **Push code** to trigger the pipeline

## Pipeline Architecture

### Stages

1. **Setup** - Install dependencies and cache
2. **Validate** - Linting, TypeScript checking, formatting
3. **Test** - Unit tests and database integration tests with PostgreSQL 17
4. **Build** - Production build and Docker images
5. **Quality Gate** - Comprehensive quality validation
6. **Deploy** - Staging and production deployment

### PostgreSQL 17 Integration

The pipeline uses **PostgreSQL 17 Alpine** as a service for:

- Unit test database connections
- Integration test environments
- Quality gate database validation

Configuration:

```yaml
services:
  - name: postgres:17-alpine
    alias: postgres

variables:
  POSTGRES_DB: whattoeatnext
  POSTGRES_USER: user
  POSTGRES_PASSWORD: password
  DATABASE_URL: postgresql://user:password@postgres:5432/whattoeatnext
```

## Required GitLab CI/CD Variables

### Essential Variables (Already configured in `.gitlab-ci.yml`):

- `NODE_VERSION`: 20.18.0
- `POSTGRES_VERSION`: 17
- `NODE_ENV`: test
- `CI`: true

### Optional Variables (Configure in GitLab UI):

#### For Docker Registry (if using GitLab Container Registry):

```
CI_REGISTRY: registry.gitlab.com
CI_REGISTRY_USER: gitlab-ci-token
CI_REGISTRY_PASSWORD: <automatically provided>
CI_REGISTRY_IMAGE: registry.gitlab.com/<namespace>/<project>
```

#### For Deployment:

```
STAGING_URL: https://staging.whattoeatnext.com
PRODUCTION_URL: https://whattoeatnext.com
DEPLOYMENT_TOKEN: <your-deployment-token>
```

#### For External Services (if needed):

```
PLANETARY_AGENTS_API_KEY: <your-api-key>
NEXT_PUBLIC_API_URL: <your-api-url>
```

## Pipeline Jobs Breakdown

### 1. Setup Stage

#### `setup:dependencies`

- Installs Node.js 20.18.0
- Enables Yarn 4.x via Corepack
- Installs all dependencies
- Caches node_modules and .yarn-cache
- **Duration**: ~2-3 minutes
- **Triggers**: All branches, tags, merge requests

### 2. Validate Stage

#### `validate:lint`

- Runs ESLint with CI-optimized configuration
- Uses fast linting mode (no type-aware rules)
- Max warnings: 200
- **Duration**: ~30 seconds
- **Artifacts**: ESLint report (JUnit format)

#### `validate:typescript`

- TypeScript type checking with `tsc --noEmit`
- Skips library checks for speed
- **Allow failure**: true (informational)
- **Duration**: ~45 seconds

#### `validate:prettier`

- Checks code formatting consistency
- **Allow failure**: true (informational)
- **Duration**: ~15 seconds

### 3. Test Stage

#### `test:unit`

- Runs Jest unit tests with coverage
- **PostgreSQL 17 service** available
- Coverage threshold tracking
- **Duration**: ~1-2 minutes
- **Artifacts**: Coverage reports (7 days)

#### `test:database`

- Integration tests with real PostgreSQL 17
- Creates test databases (whattoeatnext, alchm_kitchen)
- Tests database connections and migrations
- **Allow failure**: true (optional)
- **Duration**: ~1-2 minutes

### 4. Build Stage

#### `build:production`

- Creates production Next.js build
- Generates optimized static assets
- **Triggers**: main, master, develop, MRs, tags
- **Duration**: ~3-4 minutes
- **Artifacts**: .next/, public/ (7 days)

#### `build:docker`

- Builds Docker images
- Tags with commit SHA and 'latest'
- **Manual trigger** (on main/master/tags)
- **Duration**: ~5-8 minutes

### 5. Quality Gate Stage

#### `quality-gate:comprehensive`

- TypeScript error threshold: <100 errors
- Build artifact validation
- Test coverage verification
- PostgreSQL 17 connectivity check
- Build size metrics
- **Blocks deployment if failed**

#### `quality-gate:linting`

- Linting campaign validation
- Deployment readiness check
- **Allow failure**: true (informational)

### 6. Deploy Stage

#### `deploy:staging`

- Deploys to staging environment
- **Manual trigger** (develop branch)
- Environment: staging

#### `deploy:production`

- Deploys to production environment
- **Manual trigger** (main/master/tags)
- Requires quality gate pass
- Environment: production

#### `deploy:docker`

- Pushes Docker images to GitLab Container Registry
- **Manual trigger** (main/master/tags)

## Caching Strategy

The pipeline uses aggressive caching for optimal performance:

```yaml
cache:
  key:
    files:
      - yarn.lock
  paths:
    - node_modules/
    - .yarn-cache/
    - .next/cache/
    - .eslintcache
```

**Benefits**:

- 60-80% faster dependency installation
- Faster linting (cache hits)
- Faster builds (Next.js cache)

## Performance Optimization

### Job Parallelization

- Validate jobs run in parallel
- Test jobs run in parallel
- Total pipeline time: ~6-8 minutes

### Resource Allocation

```yaml
NODE_OPTIONS: "--max-old-space-size=4096"
```

- 4GB memory allocation for Node.js
- Prevents OOM errors during build

### Test Optimization

```yaml
yarn test --maxWorkers=2
```

- Limits Jest workers for CI environment
- Prevents resource exhaustion

## Database Integration

### Automatic Database Setup

The pipeline automatically:

1. Starts PostgreSQL 17 Alpine container
2. Waits for database readiness
3. Creates required databases
4. Grants appropriate permissions

### Connection Testing

```bash
until pg_isready -h postgres -p 5432 -U user; do
  sleep 2
done
```

Ensures database is fully ready before tests run.

### Test Databases

The pipeline creates:

- `whattoeatnext` (main application database)
- `alchm_kitchen` (backend service database)

## Quality Gates

### TypeScript Error Threshold

```bash
if [ "$ERROR_COUNT" -gt 100 ]; then
  exit 1  # Fails pipeline
fi
```

### Coverage Requirements

- Unit test coverage tracked
- Coverage reports generated
- Cobertura format for GitLab integration

### Build Validation

- Ensures .next/ artifacts exist
- Validates build size
- Checks for critical errors

## Manual Deployment Controls

All deployment jobs require manual approval:

- `deploy:staging` - Manual (develop)
- `deploy:production` - Manual (main/master)
- `deploy:docker` - Manual (main/master/tags)
- `build:docker` - Manual (main/master/tags)

**Why manual?**

- Prevents accidental deployments
- Allows review of quality gates
- Provides deployment timing control

## Scheduled Jobs

### Nightly Full Validation

```yaml
nightly:full-validation:
  only:
    - schedules
```

**Configure in GitLab**: CI/CD > Schedules

- Runs comprehensive validation
- Full test suite with coverage
- Performance metrics collection
- Artifacts retained for 30 days

**Recommended schedule**: 2:00 AM daily

## Merge Request Integration

### Automatic Checks on MRs

- ✅ Linting validation
- ✅ TypeScript checking
- ✅ Unit tests with coverage
- ✅ Production build test

### MR Widget Integration

- Test coverage display
- Linting status
- Build status
- Quality gate results

## Troubleshooting

### Common Issues

#### 1. Yarn Installation Fails

```bash
Error: Unable to find corepack
```

**Solution**: Update to Node.js 20.18.0+ (includes Corepack)

#### 2. PostgreSQL Connection Timeout

```bash
Error: Connection refused to postgres:5432
```

**Solution**: Increase wait time or check service configuration

#### 3. Out of Memory During Build

```bash
JavaScript heap out of memory
```

**Solution**: Increase `NODE_OPTIONS` memory allocation

#### 4. Cache Issues

```bash
Error: node_modules inconsistent with lockfile
```

**Solution**: Clear cache in GitLab CI/CD settings

### Debug Commands

Add to any job for debugging:

```yaml
script:
  - echo "Node version:" && node --version
  - echo "Yarn version:" && yarn --version
  - echo "Environment:" && env
  - echo "Disk space:" && df -h
  - echo "Memory:" && free -h
```

## GitLab Runner Configuration

### Recommended Runner Specs

For optimal performance:

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Disk**: 50GB+ SSD
- **Docker**: Required for service containers

### Runner Tags (Optional)

Add tags for specific runners:

```yaml
tags:
  - docker
  - postgres
  - nodejs
```

## Integration with Existing Workflow

### Makefile Integration

The pipeline uses existing Makefile commands:

```yaml
- yarn lint:ci # make lint-ci
- yarn tsc --noEmit # make check
- yarn test # make test
- yarn build # make build
```

### Local Testing

Test pipeline jobs locally:

```bash
# Validate stage
make lint-ci
make check

# Test stage
make test

# Build stage
make build

# Quality gate
make ci-quality-gate
```

## Migration from GitHub Actions

### Key Differences

| Feature               | GitHub Actions            | GitLab CI/CD          |
| --------------------- | ------------------------- | --------------------- |
| Service containers    | `services:`               | `services:`           |
| Cache                 | `actions/cache`           | Built-in `cache:`     |
| Artifacts             | `actions/upload-artifact` | Built-in `artifacts:` |
| Environment variables | `env:`                    | `variables:`          |
| Manual approval       | `environment:`            | `when: manual`        |

### Advantages of GitLab CI/CD

1. **Built-in Docker Registry** - No external registry needed
2. **Integrated environments** - Staging/production tracking
3. **Better caching** - Automatic cache key generation
4. **Merge request widgets** - Rich MR integration
5. **Scheduled pipelines** - Built-in scheduling

## Security Best Practices

### 1. Protect Sensitive Variables

- Mark variables as "Masked" in GitLab UI
- Use "Protected" for production variables
- Never commit secrets to `.gitlab-ci.yml`

### 2. Branch Protection

- Protect `main` and `master` branches
- Require MR approvals
- Enforce quality gates

### 3. Docker Security

- Use official images only
- Pin image versions (postgres:17-alpine)
- Scan images with GitLab Container Scanning

### 4. Database Security

- Use `POSTGRES_HOST_AUTH_METHOD: trust` only in CI
- Don't expose database externally
- Rotate credentials regularly

## Monitoring and Alerts

### Pipeline Metrics

Monitor in GitLab:

- Pipeline success rate
- Average pipeline duration
- Job failure rates
- Cache hit rates

### Recommended Alerts

Set up notifications for:

- Pipeline failures on main/master
- Quality gate failures
- Deployment failures
- Nightly validation failures

## Next Steps

1. **Push `.gitlab-ci.yml` to GitLab**
2. **Configure CI/CD variables** (if needed)
3. **Set up GitLab Runner** (or use shared runners)
4. **Configure deployment** (update deploy jobs)
5. **Set up schedules** for nightly validation
6. **Enable merge request pipelines**
7. **Configure notifications** for team

## Support and Resources

- **GitLab CI/CD Docs**: https://docs.gitlab.com/ee/ci/
- **PostgreSQL 17 Docs**: https://www.postgresql.org/docs/17/
- **Next.js CI Docs**: https://nextjs.org/docs/deployment
- **Project Makefile**: `make help` for all commands

---

**Last Updated**: November 6, 2025
**PostgreSQL Version**: 17.6
**Node.js Version**: 20.18.0
**Next.js Version**: 15.3.4
