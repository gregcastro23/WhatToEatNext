# 🐳 Docker Guide for WhatToEatNext

Complete Docker setup for the **Advanced Alchemical Food Recommendation System** with Next.js 15.3.4, React 19, and TypeScript.

## 📋 Prerequisites

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js 20.18.0+** (for local development)
- **Yarn 1.22.0+** package manager

## 🚀 Quick Start

### Production Build
```bash
# Build and run production container
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Development with Hot Reload
```bash
# Run development container with hot reload
docker-compose --profile dev up whattoeatnext-dev

# Or use the override file for development
docker-compose up
```

## 📁 Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `Dockerfile.dev` | Development with hot reload |
| `docker-compose.yml` | Production services configuration |
| `docker-compose.override.yml` | Development overrides |
| `.dockerignore` | Exclude files from build context |

## 🏗️ Build Configurations

### Production Build (Multi-stage)
- **Stage 1 (base)**: Node.js 20 Alpine with system dependencies
- **Stage 2 (deps)**: Install dependencies with frozen lockfile
- **Stage 3 (builder)**: Build the Next.js application
- **Stage 4 (runner)**: Minimal runtime with security user

### Development Build
- Full development dependencies
- Hot reload support
- Source code mounting
- Debug port exposure

## 🔧 Environment Variables

### Production
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
NEXT_PUBLIC_API_CACHE_TIME=3600
NEXT_PUBLIC_ENABLE_ASTRO_DEBUG=false
```

### Development
```bash
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
NEXT_PUBLIC_ENABLE_ASTRO_DEBUG=true
NEXT_PUBLIC_API_CACHE_TIME=60
```

## 📊 Health Monitoring

### Health Check Endpoint
- **URL**: `http://localhost:3000/api/health`
- **Method**: GET
- **Response**: System status, uptime, memory usage

### Health Check Configuration
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🛠️ Common Commands

### Build Commands
```bash
# Build production image
docker build -t whattoeatnext:latest .

# Build development image
docker build -f Dockerfile.dev -t whattoeatnext:dev .

# Build specific stage
docker build --target builder -t whattoeatnext:builder .
```

### Container Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps

# Follow logs
docker-compose logs -f whattoeatnext
```

### Development Workflow
```bash
# Start development with hot reload
docker-compose up whattoeatnext-dev

# Run specific service
docker-compose run --rm whattoeatnext-dev yarn test

# Execute commands in running container
docker-compose exec whattoeatnext sh
```

## 🔒 Security Features

### Container Security
- ✅ **Non-root user**: Runs as `nextjs` user (UID: 1001)
- ✅ **Minimal base image**: Alpine Linux reduces attack surface
- ✅ **Multi-stage build**: Only runtime files in final image
- ✅ **Health checks**: Monitor container health

### Network Security
- ✅ **Custom network**: Isolated container network
- ✅ **Port mapping**: Only expose necessary ports
- ✅ **Security headers**: Configured in Next.js config

## 📈 Performance Optimizations

### Build Optimizations
- **Layer caching**: Dependencies cached separately from source
- **Multi-stage build**: Smaller final image size
- **Frozen lockfile**: Reproducible dependency installation
- **Alpine Linux**: Lightweight base image

### Runtime Optimizations
- **Resource limits**: Memory and CPU constraints
- **Log rotation**: Prevents disk space issues
- **Health monitoring**: Automatic restart on failure

## 🐛 Troubleshooting

### Common Issues

#### Container won't start
```bash
# Check container logs
docker-compose logs whattoeatnext

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### Health check failing
```bash
# Test health endpoint manually
curl http://localhost:3000/api/health

# Check if Next.js is fully started
docker-compose logs -f whattoeatnext
```

#### Permission issues
```bash
# Check file ownership
ls -la

# Fix permissions (if needed)
sudo chown -R $(id -u):$(id -g) .
```

#### Build cache issues
```bash
# Clear Docker build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Memory Issues
```bash
# Check container memory usage
docker stats

# Adjust memory limits in docker-compose.yml
services:
  whattoeatnext:
    deploy:
      resources:
        limits:
          memory: 2G  # Increase if needed
```

## 🔄 Development Workflow

### Local Development with Docker
```bash
# 1. Start development container
docker-compose up whattoeatnext-dev

# 2. Make code changes (auto-reload active)
# Files are mounted from host to container

# 3. Run tests in container
docker-compose exec whattoeatnext-dev yarn test

# 4. Build for production testing
docker-compose up --build
```

### CI/CD Integration
```bash
# Build and test
docker build -t whattoeatnext:test .
docker run --rm whattoeatnext:test yarn test

# Push to registry
docker tag whattoeatnext:latest your-registry/whattoeatnext:latest
docker push your-registry/whattoeatnext:latest
```

## 📚 Additional Resources

### Useful Docker Commands
```bash
# Remove unused containers and images
docker system prune -a

# View container resource usage
docker stats

# Export container as tar
docker export container_name > whattoeatnext.tar

# Import image
docker import whattoeatnext.tar whattoeatnext:imported
```

### Next.js Specific
```bash
# Check Next.js build output
docker-compose exec whattoeatnext ls -la .next

# View Next.js logs
docker-compose logs -f whattoeatnext | grep "Next.js"
```

## 🎯 Production Deployment

### Environment Setup
1. Create `.env.production` file with production variables
2. Update `NEXTAUTH_URL` to your domain
3. Configure security headers for your domain
4. Set up reverse proxy (nginx/traefik) if needed

### Scaling
```bash
# Scale to multiple instances
docker-compose up --scale whattoeatnext=3

# Use with load balancer
# Configure nginx/haproxy to distribute traffic
```

---

## 🚀 Ready to Go!

Your WhatToEatNext application is now fully containerized with:
- ✅ **Production-ready multi-stage build**
- ✅ **Development hot-reload environment**
- ✅ **Health monitoring and logging**
- ✅ **Security best practices**
- ✅ **Performance optimizations**

Start with: `docker-compose up --build`

**Happy Dockerizing! 🐳✨** 