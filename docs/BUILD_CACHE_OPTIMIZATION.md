# Build Cache Optimization Guide for WhatToEatNext

## 🎯 Overview

This guide provides comprehensive strategies for addressing build cache issues
and achieving cleaner, faster builds in the WhatToEatNext project.

## 🧹 Cache Clearing Strategies

### Quick Cache Clear

```bash
# Clear basic caches
yarn cache:clean

# Clear all caches and rebuild
yarn cache:clear
```

### Complete Cache Reset

```bash
# Full cache clearing with reinstall
yarn install:clean

# Clean build with cache clearing
yarn build:clean
```

## 📦 Cache Types and Locations

### 1. Next.js Build Cache

- **Location**: `.next/`
- **Purpose**: Stores compiled pages, chunks, and build artifacts
- **Clear**: `rm -rf .next`

### 2. Node Modules Cache

- **Location**: `node_modules/.cache/`
- **Purpose**: Stores module resolution and compilation cache
- **Clear**: `rm -rf node_modules/.cache`

### 3. Yarn Cache

- **Location**: `~/.yarn/cache/` (global) or `.yarn/cache/` (local)
- **Purpose**: Stores downloaded package tarballs
- **Clear**: `yarn cache clean`

### 4. TypeScript Cache

- **Location**: `.tsbuildinfo` or `tsconfig.tsbuildinfo`
- **Purpose**: Stores incremental compilation data
- **Clear**: `rm -rf .tsbuildinfo tsconfig.tsbuildinfo`

### 5. ESLint Cache

- **Location**: `.eslintcache`
- **Purpose**: Stores linting results for faster re-runs
- **Clear**: `rm -rf .eslintcache`

## 🚀 Build Optimization Strategies

### 1. Use Optimized Configuration

```bash
# Use the optimized Next.js config
cp next.config.optimized.js next.config.js
yarn build
```

### 2. Environment-Specific Builds

```bash
# Production build with optimizations
yarn build:optimized

# Development build with debugging
NODE_ENV=development yarn build
```

### 3. Incremental Builds

```bash
# Enable TypeScript incremental compilation
# Add to tsconfig.json:
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

## 🔧 Advanced Cache Management

### 1. Selective Cache Clearing

```bash
# Clear only Next.js cache
rm -rf .next

# Clear only TypeScript cache
rm -rf .tsbuildinfo

# Clear only ESLint cache
rm -rf .eslintcache
```

### 2. Cache Validation

```bash
# Check cache integrity
yarn cache list

# Verify cache location
yarn cache dir
```

### 3. Persistent Cache Configuration

```javascript
// In next.config.js
const nextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, ".next/cache"),
        compression: "gzip",
        maxAge: 172800000, // 2 days
      };
    }
    return config;
  },
};
```

## 🐛 Common Cache Issues and Solutions

### 1. Stale Module Cache

**Symptoms**: Build errors about missing modules or incorrect imports
**Solution**:

```bash
rm -rf node_modules/.cache
yarn install
```

### 2. TypeScript Compilation Errors

**Symptoms**: Type errors that persist after code changes **Solution**:

```bash
rm -rf .tsbuildinfo
yarn build
```

### 3. ESLint Cache Issues

**Symptoms**: Linting errors that don't reflect current code **Solution**:

```bash
rm -rf .eslintcache
yarn lint
```

### 4. Next.js Build Cache Corruption

**Symptoms**: Build failures or missing pages **Solution**:

```bash
rm -rf .next
yarn build
```

## 📊 Performance Monitoring

### 1. Build Time Tracking

```bash
# Time your builds
time yarn build

# Compare build times
yarn build:clean
time yarn build
```

### 2. Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true yarn build

# Check bundle contents
npx @next/bundle-analyzer
```

### 3. Cache Hit Rates

```bash
# Monitor cache effectiveness
yarn build 2>&1 | grep -i cache
```

## 🛠️ Automated Cache Management

### 1. Pre-build Cache Clearing

```json
{
  "scripts": {
    "prebuild": "yarn cache:clean && node scripts/check-node-version.cjs"
  }
}
```

### 2. Scheduled Cache Maintenance

```bash
# Add to crontab for weekly cache clearing
0 2 * * 0 cd /path/to/project && yarn cache:clear
```

### 3. CI/CD Cache Optimization

```yaml
# GitHub Actions example
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      node_modules
      .next/cache
    key: ${{ runner.os }}-deps-${{ hashFiles('**/yarn.lock') }}
```

## 🎯 Best Practices

### 1. Regular Cache Maintenance

- Clear caches weekly during development
- Clear caches before major releases
- Monitor cache sizes and clean when needed

### 2. Environment Consistency

- Use same Node.js version across environments
- Keep package versions consistent
- Use same build configuration

### 3. Incremental Development

- Enable TypeScript incremental compilation
- Use ESLint caching for faster feedback
- Leverage Next.js build caching

### 4. Monitoring and Alerts

- Track build times and cache hit rates
- Set up alerts for build failures
- Monitor cache disk usage

## 🔍 Troubleshooting

### Build Fails After Cache Clear

1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Check for TypeScript configuration issues
4. Review ESLint configuration

### Slow Builds

1. Enable incremental compilation
2. Optimize webpack configuration
3. Use appropriate cache settings
4. Consider parallel builds

### Cache Corruption

1. Clear all caches completely
2. Reinstall dependencies
3. Check for disk space issues
4. Verify file permissions

## 📈 Performance Metrics

### Target Build Times

- **Development**: < 30 seconds
- **Production**: < 2 minutes
- **Cache Hit Rate**: > 80%

### Cache Size Guidelines

- **Next.js Cache**: < 500MB
- **Node Modules Cache**: < 200MB
- **TypeScript Cache**: < 50MB

## 🎉 Success Indicators

- ✅ Consistent build times
- ✅ No cache-related errors
- ✅ Fast development feedback
- ✅ Reliable production builds
- ✅ Efficient CI/CD pipelines

---

**Last Updated**: January 2025 **Version**: 1.0.0
