# WhatToEatNext MCP Server Integration Guide

## Overview

This guide documents the comprehensive MCP (Model Context Protocol) server integration for the WhatToEatNext project. The integration provides robust, reliable access to astrological, nutritional, and recipe data through a multi-tier fallback system with intelligent caching, rate limiting, and error handling.

## Architecture

### Multi-Tier Fallback Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Primary API   │ -> │  Secondary API  │ -> │      Cache      │
│   (External)    │    │    (Local)      │    │   (1-2 hours)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Data    │ -> │   Hardcoded     │    │  Circuit        │
│   (Fallback)    │    │   Fallback      │    │  Breaker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## MCP Servers

### 1. Astrology API Server (`astrology-server.py`)

**Purpose**: Provides access to astrological calculations and planetary positions

**Features**:
- Real-time planetary positions for all 10 planets
- Location-based calculations with custom coordinates
- Dual zodiac system support (Tropical/Sidereal)
- Transit date validation against stored data
- Automatic fallback to local ephemeris calculations
- 5-second timeout with graceful degradation

**Available Tools**:
- `get_planetary_positions` - Current planetary positions
- `get_current_planetary_positions` - Alias for current positions
- `get_planetary_positions_for_date` - Historical positions
- `get_lunar_phase` - Current lunar phase information
- `calculate_elemental_influences` - Elemental and alchemical calculations
- `validate_transit_dates` - Transit timing validation
- `get_astrological_timing` - Optimal timing for activities

**Configuration**:
```json
{
  "ASTROLOGIZE_API_URL": "https://alchm-backend.onrender.com/astrologize",
  "LOCAL_API_BASE_URL": "http://localhost:3000/api",
  "API_TIMEOUT": "5000",
  "CACHE_DURATION": "3600",
  "CIRCUIT_BREAKER_THRESHOLD": "5"
}
```

### 2. Nutrition API Server (`nutrition-server.py`)

**Purpose**: Provides access to nutritional databases including USDA FoodData Central

**Features**:
- USDA FoodData Central integration
- Ingredient search and nutritional data retrieval
- Comprehensive nutritional profiles (macros, vitamins, minerals)
- Rate limiting and caching mechanisms
- Secure API key management
- Fallback to local nutritional database

**Available Tools**:
- `get_nutritional_data` - Detailed nutrition by FDC ID
- `search_ingredients` - Search USDA ingredient database
- `get_ingredient_properties` - Comprehensive ingredient data
- `validate_ingredient_data` - Nutritional data validation

**Data Structure**:
```python
@dataclass
class NutritionalData:
    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: float
    # ... 17 total nutritional fields
    source: str = "USDA FoodData Central"
```

### 3. Spoonacular Recipe API Server (`spoonacular-server.py`)

**Purpose**: Provides access to Spoonacular Recipe API for recipe data

**Features**:
- Recipe search with advanced filters
- Detailed recipe information and instructions
- Recipe nutrition analysis
- Ingredient-based recipe search
- Rate limiting (150 requests/day)
- Comprehensive caching (2-hour TTL)
- Fallback to local recipe database

**Available Tools**:
- `search_recipes` - Recipe search with filters
- `get_recipe_data` - Detailed recipe information
- `get_recipe_details` - Comprehensive recipe data
- `search_recipes_by_ingredients` - Find recipes by ingredients
- `get_recipe_nutrition` - Recipe nutritional analysis

**Rate Limiting**:
- Daily limit: 150 requests
- Automatic quota tracking
- Graceful degradation when limit exceeded

### 4. Fallback Manager (`fallback-manager.py`)

**Purpose**: Comprehensive fallback strategy management across all services

**Features**:
- Multi-tier fallback orchestration
- Circuit breaker pattern implementation
- Intelligent caching with TTL management
- Performance monitoring and statistics
- Automatic cache cleanup
- Fallback data validation

**Core Components**:
- `FallbackManager` - Main orchestration class
- `CircuitBreaker` - API failure protection
- `CacheManager` - Intelligent caching system
- `RateLimiter` - Request rate management

## Fallback Data

### Astrological Fallback Data

**File**: `fallback_data/astrology_positions.json`

Contains reliable planetary positions for March 28, 2025:
- All 10 planets with precise coordinates
- North and South Node positions
- Tropical zodiac system data
- High-precision ephemeris accuracy

### Nutritional Fallback Data

**File**: `fallback_data/nutrition_ingredients.json`

Contains nutritional data for 8 common ingredients:
- Complete macro and micronutrient profiles
- USDA FoodData Central verified values
- Standardized per-100g measurements
- Essential vitamins and minerals

### Recipe Fallback Data

**File**: `fallback_data/recipes_basic.json`

Contains 5 basic recipes covering:
- Various cuisines (Italian, American, Mediterranean)
- Different dietary requirements (vegetarian, vegan, gluten-free)
- Multiple meal types (breakfast, lunch, dinner)
- Simple, reliable cooking instructions

## Configuration

### Environment Variables

**Astrology Server**:
```bash
ASTROLOGIZE_API_URL=https://alchm-backend.onrender.com/astrologize
LOCAL_API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=5000
CACHE_DURATION=3600
DEFAULT_LATITUDE=40.7498
DEFAULT_LONGITUDE=-73.7976
DEFAULT_ZODIAC_SYSTEM=tropical
```

**Nutrition Server**:
```bash
USDA_API_KEY=${USDA_API_KEY}
SPOONACULAR_API_KEY=${SPOONACULAR_API_KEY}
CACHE_DURATION=3600
RATE_LIMIT_REQUESTS=150
RATE_LIMIT_PERIOD=86400
API_TIMEOUT=5000
```

**Spoonacular Server**:
```bash
SPOONACULAR_API_KEY=${SPOONACULAR_API_KEY}
API_BASE_URL=https://api.spoonacular.com
RATE_LIMIT=150
CACHE_DURATION=7200
API_TIMEOUT=5000
```

### Auto-Approved Tools

All servers include auto-approved tools for seamless operation:

**Astrology**: 9 auto-approved tools including planetary positions and timing
**Nutrition**: 6 auto-approved tools including ingredient search and validation
**Spoonacular**: 8 auto-approved tools including recipe search and nutrition
**Fallback Manager**: 6 auto-approved tools for system management

## Performance Characteristics

### Response Times
- **Primary API**: < 2 seconds for astrological calculations
- **Cache Hit**: < 100ms response time
- **Fallback Activation**: Automatic within 5 seconds
- **Local Data**: < 500ms response time

### Cache Management
- **Astrological Data**: 1-hour TTL
- **Nutritional Data**: 1-hour TTL
- **Recipe Data**: 2-hour TTL
- **Automatic Cleanup**: Every hour

### Error Handling
- **Circuit Breaker**: 5 failures trigger open state
- **Retry Logic**: 3 attempts with exponential backoff
- **Graceful Degradation**: Automatic fallback tier progression
- **User Notification**: Clear fallback indicators

## Integration with WhatToEatNext

### Existing API Compatibility

The MCP servers maintain full compatibility with existing APIs:
- Uses same `/api/astrologize` and `/api/alchemize` endpoints
- Preserves current timeout and fallback patterns
- Maintains location-based calculation capabilities
- Supports both tropical and sidereal zodiac systems

### Data Structure Compatibility

All MCP servers return data in formats compatible with existing WhatToEatNext types:
- `PlanetPosition` interface for astrological data
- `IngredientMapping` structure for nutritional data
- `SpoonacularRecipe` format for recipe data

### Error Handling Integration

MCP servers integrate with existing error handling:
- Maintains current logging patterns
- Preserves user-friendly error messages
- Integrates with existing fallback mechanisms
- Supports current debugging workflows

## Monitoring and Maintenance

### Health Monitoring

Each MCP server provides health monitoring:
- Circuit breaker status tracking
- Cache hit rate monitoring
- API response time tracking
- Error rate analysis

### Statistics and Reporting

Comprehensive statistics available:
```python
{
  "cache_stats": {
    "total_entries": 150,
    "memory_usage_estimate": 2048000,
    "hit_rate": 0.85
  },
  "circuit_breaker_stats": {
    "astrology": {"state": "CLOSED", "failure_count": 0},
    "nutrition": {"state": "CLOSED", "failure_count": 1}
  },
  "performance_metrics": {
    "average_response_time": 1.2,
    "fallback_activation_rate": 0.05
  }
}
```

### Maintenance Tasks

Regular maintenance includes:
- Cache cleanup every hour
- Circuit breaker reset as needed
- Fallback data validation
- Performance metrics collection
- Log rotation and archival

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure transmission protocols
- Rate limiting protection

### Data Privacy
- Local fallback data storage
- No sensitive data caching
- Secure API communications
- Privacy-compliant data handling

### Access Control
- Auto-approved tool restrictions
- Service-specific permissions
- Rate limiting enforcement
- Circuit breaker protection

## Troubleshooting

### Common Issues

1. **API Timeouts**: Check network connectivity and API status
2. **Rate Limits**: Monitor daily quota usage for Spoonacular
3. **Cache Issues**: Verify cache cleanup and TTL settings
4. **Fallback Failures**: Check local data file integrity

### Debugging Tools

- Comprehensive logging at INFO/ERROR levels
- Circuit breaker state monitoring
- Cache statistics and hit rates
- Performance metrics tracking
- Fallback tier usage analysis

### Recovery Procedures

1. **Circuit Breaker Reset**: Automatic after timeout period
2. **Cache Clearing**: Manual or automatic cleanup
3. **Fallback Data Refresh**: Update local data files
4. **Service Restart**: Full MCP server restart if needed

## Future Enhancements

### Planned Improvements

1. **Enhanced Caching**: Redis integration for distributed caching
2. **Advanced Monitoring**: Prometheus metrics integration
3. **Load Balancing**: Multiple API endpoint support
4. **Data Synchronization**: Automatic fallback data updates
5. **Performance Optimization**: Response time improvements

### Scalability Considerations

- Horizontal scaling support
- Database integration readiness
- CDN integration for global users
- Microservices architecture preparation

This comprehensive MCP integration provides a robust, reliable foundation for the WhatToEatNext project's external data needs while maintaining excellent performance and user experience.