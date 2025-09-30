# alchm.kitchen - Unified Backend

## Architecture Overview

**alchm.kitchen** is a unified FastAPI backend that orchestrates multiple services:

- **Local PostgreSQL Database** - Recipe storage, user data, caching
- **Render Alchemize API** - Planetary calculations and alchemical transformations
- **Planetary Agents Backend** - Advanced astrological computations (separate project)

## Quick Start

### 1. Start Infrastructure
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis
```

### 2. Initialize Database
```bash
# Create database and run migrations
python3 scripts/init_database.py
python3 scripts/migrate_database.py migrate
```

### 3. Start Backend
```bash
# Start unified alchm.kitchen backend
./start_services.sh
```

Backend will be available at: `http://localhost:8000`

## API Endpoints

### Alchemical Calculations (via Render)
- `POST /alchemize` - Get current alchemical state
- `GET /planetary/current` - Get planetary positions

### Recipe Intelligence
- `POST /recommend/recipes` - Get recipe recommendations
- `GET /cuisines/recommend` - Get cuisine recommendations
- `GET /health` - Health check

### Elemental Calculations (with caching)
- `POST /calculate/elemental` - Calculate elemental balance
- `POST /calculate/thermodynamics` - Calculate thermodynamics

## Environment Variables

```bash
# API URLs
ALCHEMIZE_API_URL=https://alchmize.onrender.com/api/alchemize
PLANETARY_AGENTS_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5434/alchm_kitchen
```

## Architecture Flow

```
Frontend (Next.js)
    ↓
alchm.kitchen Backend (localhost:8000)
    ↓
├── PostgreSQL (localhost:5434) - recipes, cache
├── Render Alchemize API - planetary calculations
└── Planetary Agents - advanced astrology
```

## Development

### Start Everything
```bash
# Terminal 1: Infrastructure
docker-compose up postgres redis

# Terminal 2: Backend
cd backend && ./start_services.sh

# Terminal 3: Frontend
npm run dev
```

### Testing
```bash
# Test health
curl http://localhost:8000/health

# Test alchemical calculation
curl -X POST http://localhost:8000/alchemize \
  -H "Content-Type: application/json" \
  -d "{}"
```

## Key Features

- **Unified API** - Single backend for all frontend requests
- **External API Integration** - Calls Render for planetary data
- **Database Caching** - PostgreSQL for performance
- **Recipe Intelligence** - AI-powered recommendations
- **Health Monitoring** - Comprehensive service checks
