# alchm.kitchen - Unified Backend

## Architecture Overview

**alchm.kitchen** is a unified FastAPI backend that serves as the single entry point for your alchemical food recommendation system. It orchestrates multiple services:

### Service Architecture
- **🏺 alchm.kitchen Backend (localhost:8000)** - Main unified API
- **🗄️ PostgreSQL Database (localhost:5434)** - Recipe storage, user data, caching
- **🔮 Render Alchemize API** - Planetary calculations and alchemical transformations
- **🌟 Planetary Agents Backend** - Advanced astrological computations (separate project)

### Data Flow
```
Frontend (Next.js)
    ↓
alchm.kitchen Backend (localhost:8000)
    ↓
├── PostgreSQL (localhost:5434) - recipes, cache, recommendations
├── Render Alchemize API - planetary calculations
└── Planetary Agents - advanced astrology (optional)
```

## Quick Start

### Option 1: Automated Setup
```bash
cd backend
./dev_start.sh
```

### Option 2: Manual Setup

1. **Start Infrastructure**
```bash
cd backend
docker-compose up -d postgres redis
sleep 10  # Wait for PostgreSQL to be ready
```

2. **Initialize Database**
```bash
cd backend
python3 scripts/init_database.py
python3 scripts/migrate_database.py migrate
```

3. **Start Backend**
```bash
cd backend
./start_services.sh
```

## API Endpoints

### 🔮 Alchemical Calculations (via Render API)
```bash
# Get current alchemical state
curl -X POST http://localhost:8000/alchemize \
  -H "Content-Type: application/json" \
  -d "{}"

# Get planetary positions
curl http://localhost:8000/planetary/current
```

### 🍳 Recipe Intelligence
```bash
# Get recipe recommendations
curl -X POST http://localhost:8000/recommend/recipes \
  -H "Content-Type: application/json" \
  -d '{"cuisine_preferences": ["Italian"]}'

# Get cuisine recommendations
curl "http://localhost:8000/cuisines/recommend?zodiac_sign=Aries&season=Spring"
```

### 🏥 Health & Monitoring
```bash
# Backend health check
curl http://localhost:8000/health
```

## Environment Variables

```bash
# External API URLs
ALCHEMIZE_API_URL=https://alchmize.onrender.com/api/alchemize
PLANETARY_AGENTS_URL=http://localhost:8000

# Database (Docker setup)
DATABASE_URL=postgresql://user:pass@localhost:5434/alchm_kitchen
DB_HOST=localhost
DB_PORT=5434
DB_NAME=alchm_kitchen
DB_USER=user
DB_PASSWORD=pass
```

## Development Workflow

### Full Development Stack
```bash
# Terminal 1: Database & Cache
cd backend && docker-compose up postgres redis

# Terminal 2: Backend
cd backend && ./start_services.sh

# Terminal 3: Frontend
npm run dev
```

### Testing API Integration
```bash
# Test alchemize integration
cd backend && python3 test_alchemize_integration.py

# Manual API testing
curl -X POST http://localhost:8000/alchemize \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7498, "longitude": -73.7976}'
```

## Key Features

- **🔄 Unified API** - Single backend for all frontend requests
- **🌐 External API Integration** - Seamlessly calls Render alchemize API
- **💾 Database Caching** - PostgreSQL for performance and data persistence
- **🎯 Recipe Intelligence** - AI-powered culinary recommendations
- **📊 Health Monitoring** - Comprehensive service status checks
- **🐳 Docker Ready** - Containerized infrastructure for development

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test database connection
docker exec backend-postgres-1 pg_isready -U user -d alchm_kitchen

# View database logs
docker logs backend-postgres-1
```

### Migration Issues
```bash
# Reset database
cd backend
python3 scripts/init_database.py --reset

# Manual migration
cd backend
python3 -c "
from alembic.config import Config
from alembic import command
cfg = Config('alembic.ini')
command.upgrade(cfg, 'head')
"
```

### API Testing
```bash
# Test backend health
curl http://localhost:8000/health

# Test alchemize API directly
curl -X POST https://alchmize.onrender.com/api/alchemize \
  -H "Content-Type: application/json" \
  -d "{}"
```
