# Docker Build Pipeline Walkthrough

## GitLab CI/CD Configuration for WhatToEatNext

**Date**: November 6, 2025
**Pipeline Version**: Multi-service Docker build
**Services**: Frontend (Next.js) + Backend (Python alchm-kitchen)

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Understanding the Template](#understanding-the-template)
3. [Your Current Configuration](#your-current-configuration)
4. [Adding Docker Build Jobs](#adding-docker-build-jobs)
5. [Configuration Walkthrough](#configuration-walkthrough)
6. [GitLab Variables Setup](#gitlab-variables-setup)
7. [Testing the Pipeline](#testing-the-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Pipeline Overview

### What is the GitLab Docker Template?

The template you referenced is a **basic Docker build template** that:

- Builds Docker images using Docker-in-Docker (DinD)
- Pushes images to GitLab Container Registry
- Tags images with branch names and `latest` tag

### Your Project's Needs

Your WhatToEatNext project has **two services** that need Docker builds:

1. **Frontend**: Next.js 15 application (Dockerfile at root)
2. **Backend**: Python alchm-kitchen service (Dockerfile.production in backend/alchm_kitchen/)

---

## Understanding the Template

Let's break down the GitLab Docker template:

```yaml
docker-build:
  # Use the official docker image
  image: docker:cli
  stage: build
  services:
    - docker:dind
  variables:
    DOCKER_IMAGE_NAME: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  script:
    - docker build --pull -t "$DOCKER_IMAGE_NAME" .
    - docker push "$DOCKER_IMAGE_NAME"
    - |
      if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
        docker tag "$DOCKER_IMAGE_NAME" "$CI_REGISTRY_IMAGE:latest"
        docker push "$CI_REGISTRY_IMAGE:latest"
      fi
  rules:
    - if: $CI_COMMIT_BRANCH
      exists:
        - Dockerfile
```

### Key Components Explained

#### 1. **Image and Services**

```yaml
image: docker:cli # Uses Docker CLI image
services:
  - docker:dind # Docker-in-Docker service
```

- **image**: The Docker image that runs your job
- **docker:dind**: Enables building Docker images inside a Docker container

#### 2. **GitLab Predefined Variables**

```yaml
$CI_REGISTRY_IMAGE      # Your GitLab registry path (auto-populated)
$CI_COMMIT_REF_SLUG     # Branch name (sanitized for Docker tags)
$CI_REGISTRY_USER       # GitLab registry username (auto-populated)
$CI_REGISTRY_PASSWORD   # GitLab registry password (auto-populated)
$CI_DEFAULT_BRANCH      # Default branch (usually 'main' or 'master')
```

#### 3. **Docker Login**

```yaml
before_script:
  - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
```

Authenticates with GitLab Container Registry before building.

#### 4. **Build and Push**

```yaml
script:
  - docker build --pull -t "$DOCKER_IMAGE_NAME" .
  - docker push "$DOCKER_IMAGE_NAME"
```

- `--pull`: Ensures base image is up-to-date
- `-t`: Tags the image
- `.`: Build context (current directory)

#### 5. **Conditional Latest Tag**

```yaml
if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
docker tag "$DOCKER_IMAGE_NAME" "$CI_REGISTRY_IMAGE:latest"
docker push "$CI_REGISTRY_IMAGE:latest"
fi
```

Only tags as `latest` when building from the default branch.

#### 6. **Rules**

```yaml
rules:
  - if: $CI_COMMIT_BRANCH
    exists:
      - Dockerfile
```

Only runs if:

- Building from a branch (not a tag or pipeline schedule)
- A `Dockerfile` exists in the repository root

---

## Your Current Configuration

Your existing `.gitlab-ci.yml` has:

✅ **Stages**:

- setup
- validate
- test
- build
- quality-gate
- deploy

✅ **PostgreSQL 17 Integration**: Service container for testing

✅ **Build Jobs**:

- `build:production` - Builds Next.js with `yarn build`
- `build:docker` - Placeholder for Docker build (manual)

⚠️ **What's Missing**: Docker builds for both frontend and backend services

---

## Adding Docker Build Jobs

### Step 1: Add Global Docker Variables

Add these to your **variables** section at the top of `.gitlab-ci.yml`:

```yaml
variables:
  # ... existing variables ...

  # Docker configuration
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_BUILDKIT: "1"

  # Image naming
  FRONTEND_IMAGE: $CI_REGISTRY_IMAGE/frontend
  BACKEND_IMAGE: $CI_REGISTRY_IMAGE/backend
```

### Step 2: Replace the Manual Docker Build Job

Replace your current `build:docker` job (lines 223-240) with these two jobs:

```yaml
# Build Frontend Docker Image
build:docker:frontend:
  stage: build
  image: docker:24-cli
  services:
    - docker:24-dind
  variables:
    IMAGE_TAG: $FRONTEND_IMAGE:$CI_COMMIT_REF_SLUG
  before_script:
    - echo "🔐 Logging into GitLab Container Registry..."
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  script:
    - echo "🏗️ Building Frontend Docker image..."
    - echo "Image: $IMAGE_TAG"

    # Build with cache optimization
    - |
      docker build \
        --pull \
        --cache-from $FRONTEND_IMAGE:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
        --build-arg BUILD_COMMIT=$CI_COMMIT_SHORT_SHA \
        --tag "$IMAGE_TAG" \
        --file ./Dockerfile \
        .

    # Push to registry
    - docker push "$IMAGE_TAG"

    # Tag as latest on default branch
    - |
      if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
        echo "🏷️ Tagging as latest..."
        docker tag "$IMAGE_TAG" "$FRONTEND_IMAGE:latest"
        docker push "$FRONTEND_IMAGE:latest"
      fi

    - echo "✅ Frontend image built and pushed"
  rules:
    - if: $CI_COMMIT_BRANCH
      exists:
        - Dockerfile
  tags:
    - docker # Requires a GitLab runner with 'docker' tag

# Build Backend Docker Image
build:docker:backend:
  stage: build
  image: docker:24-cli
  services:
    - docker:24-dind
  variables:
    IMAGE_TAG: $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG
    DOCKERFILE: ./backend/alchm_kitchen/Dockerfile.production
    BUILD_CONTEXT: ./backend/alchm_kitchen
  before_script:
    - echo "🔐 Logging into GitLab Container Registry..."
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  script:
    - echo "🏗️ Building Backend Docker image..."
    - echo "Image: $IMAGE_TAG"
    - echo "Dockerfile: $DOCKERFILE"
    - echo "Context: $BUILD_CONTEXT"

    # Build with security scanning (Trivy in Dockerfile)
    - |
      docker build \
        --pull \
        --cache-from $BACKEND_IMAGE:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
        --build-arg BUILD_COMMIT=$CI_COMMIT_SHORT_SHA \
        --tag "$IMAGE_TAG" \
        --file $DOCKERFILE \
        $BUILD_CONTEXT

    # Push to registry
    - docker push "$IMAGE_TAG"

    # Tag as latest on default branch
    - |
      if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
        echo "🏷️ Tagging as latest..."
        docker tag "$IMAGE_TAG" "$BACKEND_IMAGE:latest"
        docker push "$BACKEND_IMAGE:latest"
      fi

    - echo "✅ Backend image built and pushed"
  rules:
    - if: $CI_COMMIT_BRANCH
      exists:
        - backend/alchm_kitchen/Dockerfile.production
  tags:
    - docker
```

### Step 3: Add Docker Image Testing (Optional but Recommended)

Add this job after your build jobs:

```yaml
test:docker:images:
  stage: test
  image: docker:24-cli
  services:
    - docker:24-dind
  needs:
    - build:docker:frontend
    - build:docker:backend
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  script:
    - echo "🧪 Testing Docker images..."

    # Pull images
    - docker pull $FRONTEND_IMAGE:$CI_COMMIT_REF_SLUG
    - docker pull $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG

    # Test frontend image
    - echo "Testing frontend image structure..."
    - docker run --rm $FRONTEND_IMAGE:$CI_COMMIT_REF_SLUG node --version

    # Test backend image
    - echo "Testing backend image structure..."
    - docker run --rm $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG node --version

    # Check image sizes
    - docker images | grep "$CI_COMMIT_REF_SLUG"

    - echo "✅ Docker images validated"
  allow_failure: true
  rules:
    - if: $CI_COMMIT_BRANCH
```

---

## Configuration Walkthrough

### 1. **Image Naming Strategy**

**Pattern**: `registry.gitlab.com/username/project/service:tag`

**Examples**:

```
registry.gitlab.com/yourname/whattoeatnext/frontend:main
registry.gitlab.com/yourname/whattoeatnext/frontend:feature-authentication
registry.gitlab.com/yourname/whattoeatnext/backend:main
registry.gitlab.com/yourname/whattoeatnext/backend:develop
```

**Variables**:

- `$CI_REGISTRY_IMAGE` = `registry.gitlab.com/yourname/whattoeatnext`
- `$CI_COMMIT_REF_SLUG` = Branch name (e.g., `main`, `feature-auth`)

### 2. **Build Context vs Dockerfile Location**

**Frontend** (simple):

```yaml
# Dockerfile and context are both at project root
--file ./Dockerfile
. # build context = root
```

**Backend** (nested):

```yaml
# Dockerfile is in subdirectory, context is also subdirectory
--file ./backend/alchm_kitchen/Dockerfile.production
./backend/alchm_kitchen # build context
```

### 3. **Build Arguments**

**Standard build args**:

```yaml
--build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
--build-arg BUILD_COMMIT=$CI_COMMIT_SHORT_SHA
--build-arg BUILD_VERSION=$CI_COMMIT_REF_NAME
```

**Usage in Dockerfile**:

```dockerfile
ARG BUILD_DATE
ARG BUILD_COMMIT
LABEL build.date="${BUILD_DATE}" \
      build.commit="${BUILD_COMMIT}"
```

### 4. **Cache Optimization**

**Layer caching**:

```yaml
--cache-from $FRONTEND_IMAGE:latest
--build-arg BUILDKIT_INLINE_CACHE=1
```

This tells Docker to:

1. Use the `latest` image as a cache source
2. Embed cache metadata in the image for future builds

**Benefits**:

- Faster builds (reuses unchanged layers)
- Reduced bandwidth (pulls fewer layers)

### 5. **Docker BuildKit**

**Enable with**:

```yaml
DOCKER_BUILDKIT: "1"
```

**Features**:

- Parallel build stages
- Better caching
- Secret mounting
- Improved build output

### 6. **Rules and Conditions**

**When to build**:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH # Only on branch commits
    exists:
      - Dockerfile # Only if Dockerfile exists
```

**Other rule options**:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main" # Only main branch
  - if: $CI_PIPELINE_SOURCE == "merge_request_event" # Only MRs
  - if: $CI_COMMIT_TAG # Only tags
  - when: manual # Manual trigger
```

### 7. **Job Dependencies**

**Explicit dependencies**:

```yaml
test:docker:images:
  needs:
    - build:docker:frontend # Wait for this job
    - build:docker:backend # Wait for this job
```

**Benefits**:

- Jobs run as soon as dependencies complete
- No need to wait for entire stage

---

## GitLab Variables Setup

### 1. **Automatic Variables** (No setup needed)

These are provided by GitLab automatically:

| Variable                | Description                | Example                            |
| ----------------------- | -------------------------- | ---------------------------------- |
| `$CI_REGISTRY`          | GitLab registry URL        | `registry.gitlab.com`              |
| `$CI_REGISTRY_IMAGE`    | Your project registry path | `registry.gitlab.com/user/project` |
| `$CI_REGISTRY_USER`     | Registry username          | `gitlab-ci-token`                  |
| `$CI_REGISTRY_PASSWORD` | Registry password          | `<auto-generated>`                 |
| `$CI_COMMIT_REF_SLUG`   | Sanitized branch name      | `main`, `feature-auth`             |
| `$CI_COMMIT_SHORT_SHA`  | Short commit hash          | `a1b2c3d4`                         |
| `$CI_DEFAULT_BRANCH`    | Default branch name        | `main` or `master`                 |

### 2. **Custom Variables** (Define in .gitlab-ci.yml)

```yaml
variables:
  FRONTEND_IMAGE: $CI_REGISTRY_IMAGE/frontend
  BACKEND_IMAGE: $CI_REGISTRY_IMAGE/backend
  DOCKER_BUILDKIT: "1"
```

### 3. **Project Variables** (Set in GitLab UI)

Navigate to: **Settings → CI/CD → Variables**

Add these if needed:

- `DOCKER_HUB_USERNAME` - If pushing to Docker Hub
- `DOCKER_HUB_TOKEN` - Docker Hub access token
- `STAGING_SERVER_SSH_KEY` - SSH key for deployments

---

## Testing the Pipeline

### 1. **Local Testing with GitLab Runner**

Install GitLab Runner locally:

```bash
# macOS
brew install gitlab-runner

# Start runner
gitlab-runner exec docker build:docker:frontend
```

### 2. **Test Docker Builds Manually**

**Frontend**:

```bash
cd /Users/GregCastro/Desktop/WhatToEatNext

docker build \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg BUILD_COMMIT=$(git rev-parse --short HEAD) \
  --tag whattoeatnext-frontend:test \
  --file ./Dockerfile \
  .

# Test the image
docker run --rm whattoeatnext-frontend:test node --version
```

**Backend**:

```bash
cd /Users/GregCastro/Desktop/WhatToEatNext

docker build \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg BUILD_COMMIT=$(git rev-parse --short HEAD) \
  --tag whattoeatnext-backend:test \
  --file ./backend/alchm_kitchen/Dockerfile.production \
  ./backend/alchm_kitchen

# Test the image
docker run --rm whattoeatnext-backend:test node --version
```

### 3. **Push and Monitor**

**Push to GitLab**:

```bash
git add .gitlab-ci.yml
git commit -m "Add Docker build pipeline for frontend and backend"
git push origin your-branch
```

**Monitor in GitLab**:

1. Go to **CI/CD → Pipelines**
2. Click on your pipeline
3. Watch the `build:docker:frontend` and `build:docker:backend` jobs

### 4. **Check Registry**

After successful build:

1. Go to **Packages & Registries → Container Registry**
2. You should see:
   ```
   frontend:main
   frontend:your-branch
   backend:main
   backend:your-branch
   ```

---

## Troubleshooting

### Error: "Cannot connect to Docker daemon"

**Cause**: Docker-in-Docker service not running or misconfigured.

**Solution**:

```yaml
services:
  - docker:24-dind
variables:
  DOCKER_HOST: tcp://docker:2376
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_TLS_VERIFY: 1
  DOCKER_CERT_PATH: "$DOCKER_TLS_CERTDIR/client"
```

### Error: "unauthorized: authentication required"

**Cause**: Not logged into GitLab registry.

**Solution**: Ensure `before_script` has login:

```yaml
before_script:
  - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
```

### Error: "No such file or directory: Dockerfile"

**Cause**: Wrong build context or Dockerfile path.

**Solution**: Check paths:

```yaml
# For frontend
--file ./Dockerfile
.  # context

# For backend
--file ./backend/alchm_kitchen/Dockerfile.production
./backend/alchm_kitchen  # context
```

### Error: "denied: access forbidden"

**Cause**: Runner doesn't have registry access.

**Solution**:

1. Go to **Settings → CI/CD → Variables**
2. Ensure `CI_REGISTRY_PASSWORD` is not masked
3. Check runner has `docker` executor

### Build is Slow

**Solutions**:

1. **Enable BuildKit**:

```yaml
DOCKER_BUILDKIT: "1"
```

2. **Use cache**:

```yaml
--cache-from $CI_REGISTRY_IMAGE/frontend:latest
```

3. **Optimize Dockerfile**:

```dockerfile
# Copy package files first (cached layer)
COPY package.json yarn.lock ./
RUN yarn install

# Then copy source (changes more often)
COPY . .
RUN yarn build
```

### Image Size Too Large

**Check size**:

```bash
docker images | grep whattoeatnext
```

**Solutions**:

1. **Use multi-stage builds** (already in your Dockerfiles ✅)
2. **Use alpine images**:

```dockerfile
FROM node:20-alpine  # Instead of node:20
```

3. **Clean up in same layer**:

```dockerfile
RUN apt-get update && apt-get install -y pkg \
    && rm -rf /var/lib/apt/lists/*
```

### Jobs Not Running

**Check rules**:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH # Must be a branch commit
    exists:
      - Dockerfile # File must exist
```

**Debug**:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH
    when: always # Always run for testing
```

---

## Next Steps

### 1. **Update .gitlab-ci.yml**

Replace your current `build:docker` job with the two jobs from [Step 2](#step-2-replace-the-manual-docker-build-job).

### 2. **Test Locally**

Run the manual Docker build commands to ensure images build successfully.

### 3. **Commit and Push**

```bash
git checkout -b feature/docker-pipeline
git add .gitlab-ci.yml
git commit -m "feat: Add Docker build pipeline for frontend and backend services"
git push origin feature/docker-pipeline
```

### 4. **Monitor First Run**

Watch the pipeline in GitLab and check for errors.

### 5. **Verify Registry**

Check that images appear in **Packages & Registries → Container Registry**.

### 6. **Update Deployment**

Modify `deploy:docker` job to use the built images:

```yaml
deploy:docker:staging:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploying frontend: $FRONTEND_IMAGE:$CI_COMMIT_REF_SLUG"
    - echo "Deploying backend: $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG"
    # Add actual deployment commands (kubectl, docker-compose, etc.)
  environment:
    name: staging
    url: https://staging.whattoeatnext.com
  when: manual
```

---

## Summary

**What You'll Have**:

- ✅ Automated Docker builds for frontend and backend
- ✅ Images pushed to GitLab Container Registry
- ✅ Proper tagging strategy (branch names + latest)
- ✅ Build caching for faster builds
- ✅ Image testing validation
- ✅ Integration with existing CI/CD stages

**Pipeline Flow**:

```
setup → validate → build (including Docker builds) → test → quality-gate → deploy
```

**Registry Structure**:

```
registry.gitlab.com/yourname/whattoeatnext/
├── frontend:main
├── frontend:develop
├── frontend:feature-xyz
├── backend:main
├── backend:develop
└── backend:feature-xyz
```

---

**Questions or Issues?**

- Check [GitLab Docker Build Docs](https://docs.gitlab.com/ci/docker/using_docker_build/)
- Review [Docker-in-Docker](https://docs.gitlab.com/ci/docker/using_docker_build/#use-docker-in-docker)
- Inspect pipeline logs in GitLab UI

---

_Created: November 6, 2025_
_PostgreSQL 17 + Docker BuildKit + Multi-stage builds_
