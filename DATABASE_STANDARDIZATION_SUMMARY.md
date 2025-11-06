# Database Standardization Summary
## PostgreSQL 17 - Complete Labeling and Configuration

**Date**: November 6, 2025
**Status**: ✅ Complete - All Databases Properly Labeled and Accessible

---

## Problem Identified

The Docker PostgreSQL container was:
1. Running PostgreSQL 15 (not 17)
2. Only had `alchm_kitchen` database
3. Missing `whattoeatnext` database
4. Had incompatible data from PostgreSQL 15

---

## Solution Implemented

### 1. **Docker Compose Modernization** ✅

**Updated Configuration**:
- Removed obsolete `version` declaration
- Upgraded to PostgreSQL 17 Alpine image
- Added health checks for service readiness
- Added automatic database initialization
- Changed container name for clarity: `whattoeatnext-postgres-17`
- Fixed port conflict (alchm-kitchen now on 8001)

### 2. **Database Initialization Script** ✅

**Created**: `backend/init-databases.sh`

This script automatically:
- Creates `whattoeatnext` database on container start
- Grants all privileges to the `user` role
- Handles proper quoting of reserved words
- Provides success feedback

### 3. **Volume Management** ✅

**Resolved PostgreSQL 15 → 17 Incompatibility**:
- Removed old PostgreSQL 15 data volume
- Created fresh PostgreSQL 17 volume
- Both databases initialized correctly

---

## Database Inventory

### Local PostgreSQL 17 (Port 5432)

**Installation**: `/Library/PostgreSQL/17/`
**Connection**: localhost:5432

| Database | Owner | Encoding | Purpose |
|----------|-------|----------|---------|
| `whattoeatnext` | postgres | UTF8 | Main application database |
| `alchm_kitchen` | postgres | UTF8 | Backend service database |

**Users**:
- `postgres` (superuser) - password: `password`
- `user` (application) - password: `password`

### Docker PostgreSQL 17 (Port 5434)

**Container**: `whattoeatnext-postgres-17`
**Image**: postgres:17-alpine
**Connection**: localhost:5434 (maps to container 5432)

| Database | Owner | Encoding | Purpose |
|----------|-------|----------|---------|
| `whattoeatnext` | user | UTF8 | Main application database |
| `alchm_kitchen` | user | UTF8 | Backend service database |

**User**:
- `user` - password: `password`

---

## Configuration Files Updated

### 1. `backend/docker-compose.yml`

**Changes**:
```yaml
# Removed obsolete version declaration
# Changed from: version: "3.8"
# To: (no version line)

# Upgraded PostgreSQL image
# Changed from: postgres:15
# To: postgres:17-alpine

# Added container name
container_name: whattoeatnext-postgres-17

# Added health check
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U user -d alchm_kitchen"]
  interval: 5s
  timeout: 5s
  retries: 5

# Added init script mount
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./init-databases.sh:/docker-entrypoint-initdb.d/init-databases.sh

# Updated depends_on with conditions
depends_on:
  postgres:
    condition: service_healthy
```

**Port Assignments**:
- `alchemical-core`: 8000 → connects to `alchm_kitchen`
- `alchm-kitchen`: 8001 → connects to `whattoeatnext`
- `postgres`: 5434 (host) → 5432 (container)
- `redis`: default ports

### 2. `backend/init-databases.sh` (NEW)

**Purpose**: Automatically initialize both databases

**Features**:
- Runs on first container start
- Idempotent (safe to run multiple times)
- Proper error handling (`set -e`)
- Quoted identifiers for reserved words
- Success confirmation message

---

## Service Configuration Matrix

### Database Connection Strings

| Service | Database | Connection String |
|---------|----------|-------------------|
| alchemical-core (Docker) | alchm_kitchen | postgresql://user:password@postgres:5432/alchm_kitchen |
| alchm-kitchen (Docker) | whattoeatnext | postgresql://user:password@postgres:5432/whattoeatnext |
| Local Development | whattoeatnext | postgresql://user:password@localhost:5432/whattoeatnext |
| Local Development | alchm_kitchen | postgresql://user:password@localhost:5432/alchm_kitchen |
| GitLab CI/CD | whattoeatnext | postgresql://user:password@postgres:5432/whattoeatnext |

### Port Mapping

| Service | Local Port | Container Port | Protocol |
|---------|------------|----------------|----------|
| PostgreSQL 17 (Native) | 5432 | N/A | TCP |
| PostgreSQL 17 (Docker) | 5434 | 5432 | TCP |
| alchemical-core | 8000 | 8000 | HTTP |
| alchm-kitchen | 8001 | 8000 | HTTP |
| Redis | 6379 | 6379 | TCP |

---

## Naming Convention Standards

### ✅ Standardized Names

**Databases**:
- `whattoeatnext` - Main application (lowercase, no hyphens)
- `alchm_kitchen` - Backend service (lowercase, underscores)

**Container Names**:
- `whattoeatnext-postgres-17` - PostgreSQL container (descriptive)
- `backend-redis-1` - Redis container

**Services** (in docker-compose.yml):
- `postgres` - PostgreSQL service
- `redis` - Redis service
- `alchemical-core` - Alchemy service
- `alchm-kitchen` - Kitchen service

**Environment Variables**:
- `POSTGRES_DB` - Primary database name
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `DATABASE_URL` - Full connection string

---

## Testing & Verification

### ✅ All Tests Passed

**Local PostgreSQL 17**:
```bash
✅ Both databases exist (whattoeatnext, alchm_kitchen)
✅ Both users can connect (postgres, user)
✅ Write permissions verified
✅ Schema access confirmed
✅ Version: PostgreSQL 17.6
```

**Docker PostgreSQL 17**:
```bash
✅ Container running: whattoeatnext-postgres-17
✅ Health check: Healthy
✅ Both databases created: whattoeatnext, alchm_kitchen
✅ User 'user' has full access
✅ Version: PostgreSQL 17.6 Alpine
✅ Init script executed successfully
```

### Test Commands

**List databases in Docker**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -l
```

**Test alchm_kitchen**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -d alchm_kitchen -c "SELECT current_database();"
```

**Test whattoeatnext**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -d whattoeatnext -c "SELECT current_database();"
```

**Check container health**:
```bash
docker ps | grep whattoeatnext-postgres-17
```

---

## Migration Notes

### PostgreSQL 15 → 17 Upgrade

**Issue**: Data directory incompatibility
```
FATAL: database files are incompatible with server
DETAIL: The data directory was initialized by PostgreSQL version 15,
        which is not compatible with this version 17.6.
```

**Resolution**:
1. Stopped all containers
2. Removed old volumes: `docker-compose down -v`
3. Removed specific volume: `docker volume rm backend_postgres_data`
4. Started fresh with PostgreSQL 17: `docker-compose up -d postgres`
5. Automatic initialization via init script

**Data Loss**: ✅ None - Old containers had no production data

---

## Docker Commands Reference

### Start Services
```bash
cd backend
docker-compose up -d postgres       # PostgreSQL only
docker-compose up -d                # All services
```

### Stop Services
```bash
docker-compose down                 # Stop containers
docker-compose down -v              # Stop and remove volumes
```

### View Logs
```bash
docker logs whattoeatnext-postgres-17
docker logs -f whattoeatnext-postgres-17  # Follow logs
```

### Execute Commands
```bash
# List databases
docker exec whattoeatnext-postgres-17 psql -U user -l

# Connect to database
docker exec -it whattoeatnext-postgres-17 psql -U user -d whattoeatnext

# Check version
docker exec whattoeatnext-postgres-17 psql -U user -c "SELECT version();"
```

### Health Check
```bash
# Check container health
docker ps | grep postgres

# Manual health check
docker exec whattoeatnext-postgres-17 pg_isready -U user -d alchm_kitchen
```

---

## GitLab CI/CD Integration

### Service Configuration

The `.gitlab-ci.yml` uses the same setup:

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

### Automatic Database Creation

The CI/CD pipeline creates both databases:
```bash
psql -h postgres -U user -c "CREATE DATABASE whattoeatnext;"
psql -h postgres -U user -c "CREATE DATABASE alchm_kitchen;"
```

---

## Troubleshooting

### Container Won't Start

**Check logs**:
```bash
docker logs whattoeatnext-postgres-17
```

**Common issues**:
1. Port conflict - Check if 5434 is in use
2. Volume issues - Remove old volumes
3. Init script errors - Check script syntax

### Database Not Visible

**Verify databases exist**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -l
```

**Recreate if needed**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -c "CREATE DATABASE whattoeatnext;"
```

### Permission Errors

**Grant permissions**:
```bash
docker exec whattoeatnext-postgres-17 psql -U user -d postgres -c \
  "GRANT ALL PRIVILEGES ON DATABASE whattoeatnext TO user;"
```

### Connection Refused

**Check container health**:
```bash
docker ps | grep whattoeatnext-postgres-17
docker exec whattoeatnext-postgres-17 pg_isready -U user
```

---

## Next Steps

### ✅ Completed
- [x] Docker container upgraded to PostgreSQL 17
- [x] Both databases created and accessible
- [x] Init script working correctly
- [x] Health checks configured
- [x] Service dependencies updated
- [x] Port conflicts resolved
- [x] Documentation completed

### 🔄 Recommended
- [ ] Start backend services to test integration
- [ ] Run backend migrations if any
- [ ] Test application connectivity
- [ ] Update any hardcoded connection strings
- [ ] Configure production database separately

---

## Summary

### What Changed

**Before**:
- PostgreSQL 15 in Docker
- Only `alchm_kitchen` database
- Missing `whattoeatnext` database
- Incompatible data format
- No health checks
- No automatic initialization

**After**:
- PostgreSQL 17.6 Alpine in Docker
- Both `alchm_kitchen` and `whattoeatnext` databases
- Fresh, compatible data structure
- Health checks configured
- Automatic database initialization
- Clear container naming: `whattoeatnext-postgres-17`
- Service dependencies with conditions
- Comprehensive documentation

### Database Locations

**Local Development** (Native PostgreSQL 17):
- Host: localhost
- Port: 5432
- Databases: whattoeatnext, alchm_kitchen
- Users: postgres, user

**Docker Development** (Containerized PostgreSQL 17):
- Host: localhost (external) / postgres (internal)
- Port: 5434 (external) / 5432 (internal)
- Databases: whattoeatnext, alchm_kitchen
- User: user
- Container: whattoeatnext-postgres-17

**GitLab CI/CD** (Service Container):
- Host: postgres
- Port: 5432
- Databases: Created automatically
- User: user

---

**Status**: ✅ **All Databases Properly Labeled and Accessible**

Both `alchm.kitchen` (alchm_kitchen) and `whattoeatnext` are now visible and accessible in Docker with PostgreSQL 17!

---

*Generated: November 6, 2025*
*PostgreSQL: 17.6 Alpine*
*Docker Compose: 2.x*
