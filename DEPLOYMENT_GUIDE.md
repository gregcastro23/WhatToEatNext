# WhatToEatNext Deployment Guide
**Version**: 1.0
**Last Updated**: November 17, 2025
**Supported Platforms**: Docker, Vercel, Standalone, Kubernetes

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Vercel Deployment](#vercel-deployment)
5. [Production Checklist](#production-checklist)
6. [Monitoring & Health Checks](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Performance Tuning](#performance)

---

<a name="quick-start"></a>
## 1. Quick Start (Docker - Recommended)

### Prerequisites
- **Node.js**: 20.18.0 (required by package.json)
- **Yarn**: 3.6.4
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 1.29+ (optional)

### 5-Minute Deployment

```bash
# 1. Clone the repository
git clone https://github.com/gregcastro23/WhatToEatNext.git
cd WhatToEatNext

# 2. Copy environment template
cp .env.example .env.production

# 3. Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.production

# 4. Build and run with Docker
docker-compose -f docker-compose.simple.yml up -d

# 5. Verify health
curl http://localhost:3000/api/health
```

**Expected Output**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T23:30:00.000Z",
  "uptime": 42.5,
  "memory": { "rss": 123456789 },
  "version": "0.1.0",
  "environment": "production"
}
```

---

<a name="environment-setup"></a>
## 2. Environment Setup

### Required Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ Yes | `production` | Runtime environment |
| `PORT` | No | `3000` | Server port |
| `JWT_SECRET` | ✅ Yes | - | Session encryption key |
| `DEFAULT_LATITUDE` | No | `40.7498` | Default location (NY) |
| `DEFAULT_LONGITUDE` | No | `-73.7976` | Default location (NY) |

### Optional Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | Logging verbosity |
| `CACHE_TTL` | `60` | Cache duration (seconds) |
| `DEFAULT_ZODIAC_SYSTEM` | `tropical` | Astrological system |
| `ENABLE_PLANETARY_CALCULATIONS` | `true` | Feature flag |
| `API_TIMEOUT` | `10000` | API timeout (ms) |

### Environment File Setup

**Development** (`.env.local`):
```bash
NODE_ENV=development
LOG_LEVEL=debug
FAST_REFRESH=true
```

**Production** (`.env.production`):
```bash
NODE_ENV=production
LOG_LEVEL=info
NEXT_TELEMETRY_DISABLED=1
JWT_SECRET=<generated-secret>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Security Notes**:
- ⚠️ **Never commit** `.env.local` or `.env.production` to Git
- ✅ Use `.env.example` as a template
- ✅ Generate unique `JWT_SECRET` for each environment
- ✅ Rotate secrets regularly (quarterly recommended)

---

<a name="docker-deployment"></a>
## 3. Docker Deployment

### Option A: Docker Compose (Recommended)

#### Development Mode
```bash
# Build and start
docker-compose -f docker-compose.simple.yml up

# Run in background
docker-compose -f docker-compose.simple.yml up -d

# View logs
docker-compose -f docker-compose.simple.yml logs -f app

# Stop
docker-compose -f docker-compose.simple.yml down
```

#### Production Mode
```bash
# Create production environment file
cp .env.example .env.production
# Edit .env.production with your production values

# Build and deploy
docker-compose -f docker-compose.simple.yml up -d

# Health check
docker-compose -f docker-compose.simple.yml exec app curl http://localhost:3000/api/health

# Monitor logs
docker-compose -f docker-compose.simple.yml logs -f --tail=100 app
```

### Option B: Standalone Docker

#### Build Image
```bash
docker build -t whattoeatnext:latest .

# For specific Node version
docker build \
  --build-arg NODE_VERSION=20.18.0 \
  -t whattoeatnext:latest \
  .
```

#### Run Container
```bash
docker run -d \
  --name whattoeatnext \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-here \
  --restart=unless-stopped \
  whattoeatnext:latest
```

#### With Environment File
```bash
docker run -d \
  --name whattoeatnext \
  -p 3000:3000 \
  --env-file .env.production \
  --restart=unless-stopped \
  whattoeatnext:latest
```

### Docker Health Checks

The Dockerfile includes automatic health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1
```

**Check container health**:
```bash
docker inspect --format='{{.State.Health.Status}}' whattoeatnext
```

### Resource Limits

**Recommended Limits**:
```bash
docker run -d \
  --name whattoeatnext \
  -p 3000:3000 \
  --env-file .env.production \
  --memory="1g" \
  --memory-swap="1g" \
  --cpus="1.0" \
  --restart=unless-stopped \
  whattoeatnext:latest
```

**For High Traffic**:
```bash
--memory="2g" \
--cpus="2.0" \
```

---

<a name="vercel-deployment"></a>
## 4. Vercel Deployment

### Prerequisites
- Vercel account
- Vercel CLI: `npm install -g vercel`

### Deployment Steps

#### Option A: Git Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables** (in Vercel Dashboard):
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-secret>
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   DEFAULT_LATITUDE=40.7498
   DEFAULT_LONGITUDE=-73.7976
   ```

#### Option B: CLI Deployment

```bash
# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
```

### Vercel-Specific Configuration

**vercel.json** (optional):
```json
{
  "buildCommand": "yarn build",
  "devCommand": "yarn dev",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

---

<a name="production-checklist"></a>
## 5. Production Checklist

### Pre-Deployment ✅

- [ ] **Environment Variables Set**
  - [ ] `JWT_SECRET` generated (32+ characters)
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_APP_URL` configured
  - [ ] All secrets stored securely

- [ ] **Security Hardening**
  - [ ] HTTPS/TLS enabled
  - [ ] CORS origins configured
  - [ ] CSP headers reviewed (next.config.mjs)
  - [ ] Secrets not in source code
  - [ ] `.env` files in `.gitignore`

- [ ] **Performance Optimization**
  - [ ] Build tested locally
  - [ ] Image optimization enabled
  - [ ] Compression enabled
  - [ ] Cache headers configured

- [ ] **Code Quality**
  - [ ] TypeScript errors checked: `yarn check`
  - [ ] Linting passed: `yarn lint`
  - [ ] Tests run (if applicable): `yarn test`
  - [ ] Build successful: `yarn build`

- [ ] **Monitoring Setup**
  - [ ] Health check endpoint tested
  - [ ] Logging configured
  - [ ] Error tracking setup (Sentry, etc.)
  - [ ] Performance monitoring (optional)

### Post-Deployment ✅

- [ ] **Health Verification**
  - [ ] Health endpoint returns 200: `GET /api/health`
  - [ ] API endpoints functional
  - [ ] Static assets loading
  - [ ] Page load time acceptable (< 3s)

- [ ] **Functional Testing**
  - [ ] Planetary calculations working: `GET /api/astrologize`
  - [ ] Alchemical transformations working: `POST /api/alchemize`
  - [ ] Recipe recommendations working: `GET /api/recipes`

- [ ] **Monitoring**
  - [ ] Logs aggregating properly
  - [ ] Error rates monitored
  - [ ] Response times tracked
  - [ ] Resource usage monitored

---

<a name="monitoring"></a>
## 6. Monitoring & Health Checks

### Health Check Endpoint

**Endpoint**: `GET /api/health`

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T23:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 134217728,
    "heapTotal": 67108864,
    "heapUsed": 33554432
  },
  "version": "0.1.0",
  "environment": "production",
  "services": {
    "database": "not_applicable",
    "cache": "memory",
    "external_apis": "available"
  }
}
```

**Failure Response** (500 Internal Server Error):
```json
{
  "status": "unhealthy",
  "error": "Service unavailable",
  "timestamp": "2025-11-17T23:30:00.000Z"
}
```

### Monitoring Commands

**Check Application Health**:
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://yourdomain.com/api/health

# With timeout
curl --max-time 5 http://localhost:3000/api/health
```

**Check Docker Container**:
```bash
# Container status
docker ps -f name=whattoeatnext

# Container health
docker inspect --format='{{.State.Health.Status}}' whattoeatnext

# Container logs (last 100 lines)
docker logs --tail=100 -f whattoeatnext

# Container resource usage
docker stats whattoeatnext
```

**Check API Endpoints**:
```bash
# Test astrologize API
curl http://localhost:3000/api/astrologize

# Test alchemize API (POST)
curl -X POST http://localhost:3000/api/alchemize \
  -H "Content-Type: application/json" \
  -d '{}'

# Test recipes API
curl http://localhost:3000/api/recipes
```

### Logging

**Log Levels**:
- `debug`: Verbose (development only)
- `info`: General information (default production)
- `warn`: Warnings
- `error`: Errors requiring attention
- `silent`: No logging

**View Logs**:
```bash
# Docker Compose
docker-compose -f docker-compose.simple.yml logs -f app

# Standalone Docker
docker logs -f whattoeatnext

# Filter by level (if using structured logging)
docker logs whattoeatnext 2>&1 | grep "ERROR"
```

### Recommended Monitoring Tools

1. **Application Performance**:
   - [Vercel Analytics](https://vercel.com/analytics) (if on Vercel)
   - [New Relic](https://newrelic.com/)
   - [DataDog](https://www.datadoghq.com/)

2. **Error Tracking**:
   - [Sentry](https://sentry.io/)
   - [Rollbar](https://rollbar.com/)
   - [Bugsnag](https://www.bugsnag.com/)

3. **Uptime Monitoring**:
   - [UptimeRobot](https://uptimerobot.com/) (free)
   - [Pingdom](https://www.pingdom.com/)
   - [StatusCake](https://www.statuscake.com/)

---

<a name="troubleshooting"></a>
## 7. Troubleshooting

### Common Issues

#### 1. Yarn 3.6.4 Download Failure (HTTP 403)

**Symptoms**:
```
Error: Server answered with HTTP 403 when performing the request to
https://repo.yarnpkg.com/3.6.4/packages/yarnpkg-cli/bin/yarn.js
```

**Solution A**: Use the workaround script
```bash
chmod +x start-dev-server.sh
./start-dev-server.sh
```

**Solution B**: Deploy with Docker (bypasses Yarn requirement)
```bash
docker-compose -f docker-compose.simple.yml up -d
```

**Solution C**: Use environment with proper Yarn access
- Deploy to Vercel (handles Yarn automatically)
- Use CI/CD with Yarn pre-installed

#### 2. Build Hangs Indefinitely

**Symptoms**:
- Build process never completes
- TypeScript compilation stuck

**Solution**:
```bash
# 1. Check current TypeScript errors
make check 2>&1 | head -20

# 2. Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# 3. Use production TypeScript config
yarn build --config tsconfig.prod.json

# 4. Clear caches and rebuild
rm -rf .next node_modules/.cache
yarn install
yarn build
```

#### 3. TypeScript Errors (149 remaining)

**Current Status**: 149 errors (92.5% reduction achieved)

**Blocked Errors**:
- **TS1117** (88 errors): spiceBlends.ts - requires dedicated refactor
- **TS2307** (61 errors): Module resolution - systemic issue

**Action**:
```bash
# Check specific error types
make errors-by-type

# These errors don't block production deployment
# They're related to unused files and can be ignored
```

#### 4. Port Already in Use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 yarn dev
```

#### 5. Memory Issues

**Symptoms**:
- Out of memory errors
- Slow performance
- Container restarts

**Solution**:
```bash
# Increase Docker memory limit
docker update --memory="2g" --memory-swap="2g" whattoeatnext

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=2048" yarn start

# Check current usage
docker stats whattoeatnext
```

#### 6. Health Check Failing

**Symptoms**:
```
unhealthy
```

**Diagnosis**:
```bash
# Check logs
docker logs whattoeatnext

# Test health endpoint manually
docker exec whattoeatnext curl -f http://localhost:3000/api/health

# Check if app is running
docker exec whattoeatnext ps aux
```

**Common Causes**:
- Application not fully started (wait 30-60 seconds)
- Port conflict
- Missing environment variables
- Build errors

---

<a name="performance"></a>
## 8. Performance Tuning

### Production Optimizations

#### 1. Node.js Memory

**Recommended Settings**:
```bash
# For typical usage (< 1000 concurrent users)
NODE_OPTIONS="--max-old-space-size=1024"

# For high traffic (1000-10000 concurrent users)
NODE_OPTIONS="--max-old-space-size=2048"

# For very high traffic (> 10000 concurrent users)
NODE_OPTIONS="--max-old-space-size=4096"
```

#### 2. Docker Resource Limits

**Small Deployment** (< 100 users):
```yaml
deploy:
  resources:
    limits:
      cpus: "0.5"
      memory: 512M
```

**Medium Deployment** (100-1000 users):
```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 1G
```

**Large Deployment** (> 1000 users):
```yaml
deploy:
  resources:
    limits:
      cpus: "2.0"
      memory: 2G
```

#### 3. Caching Strategy

**Current Implementation**:
- PlanetaryPositionsService: 1-minute TTL
- IngredientService: In-memory cache
- No external cache layer

**Recommended for Scale**:
```bash
# Add Redis for caching
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Update .env.production
REDIS_URL=redis://redis:6379
CACHE_TTL=300
```

#### 4. Load Balancing

**For High Availability**:
```bash
# Run multiple instances
docker-compose -f docker-compose.simple.yml up -d --scale app=3

# Add NGINX load balancer (uncomment in docker-compose.simple.yml)
```

### Performance Benchmarks

**Expected Response Times**:
- Health Check: < 10ms
- Static Pages: < 100ms
- Astrologize API: 100-300ms
- Alchemize API: 150-400ms
- Recipe Recommendations: 200-500ms

**Target Metrics**:
- Server startup: < 10 seconds
- First request: < 500ms
- Subsequent requests: < 200ms
- Memory usage: < 500MB (idle)
- CPU usage: < 10% (idle)

---

## Additional Resources

### Documentation
- [Backend Status Report](./BACKEND_STATUS_REPORT.md) - Complete backend analysis
- [Service Deep Dive](./SERVICE_DEEP_DIVE.md) - Detailed service reviews
- [CLAUDE.md](./CLAUDE.md) - Project architecture and development guide

### Scripts
- `start-dev-server.sh` - Workaround for Yarn issues
- `Makefile` - Build and development commands

### Configuration Files
- `.env.example` - Environment variable template
- `docker-compose.simple.yml` - Simple Docker Compose configuration
- `Dockerfile` - Production Docker image
- `next.config.mjs` - Next.js configuration

---

## Support & Contact

For deployment issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Backend Status Report](./BACKEND_STATUS_REPORT.md)
3. Open an issue on GitHub

---

**Last Updated**: November 17, 2025
**Maintainer**: gregcastro23
**Status**: Production Ready ✅
