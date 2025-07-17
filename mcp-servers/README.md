# WhatToEatNext Astrology MCP Server

This MCP server provides access to astrological calculations and planetary positions for the WhatToEatNext application. It integrates with the existing astrologize and alchemize API endpoints while providing robust fallback mechanisms and caching.

## Features

- **Real-time Planetary Positions**: Get current planetary positions for any location
- **Historical Calculations**: Calculate planetary positions for specific dates and times
- **Alchemical Integration**: Access elemental influences and thermodynamic properties
- **Robust Fallback System**: Multi-tier fallback (API → Cache → Local data)
- **Intelligent Caching**: 1-hour cache duration for optimal performance
- **Timeout Handling**: 5-second timeouts with automatic fallback activation
- **Auto-approval Support**: Pre-approved tools for seamless integration

## Available Tools

### Core Planetary Tools
- `get_planetary_positions` - Get current planetary positions
- `get_current_planetary_positions` - Alias for current positions
- `get_planetary_positions_for_date` - Historical planetary positions
- `get_lunar_phase` - Current lunar phase information

### Astrological Analysis Tools
- `calculate_elemental_influences` - Elemental and alchemical calculations
- `validate_transit_dates` - Validate planetary transit timing
- `get_astrological_timing` - Optimal timing for activities

## Configuration

The server is configured through environment variables:

```bash
ASTROLOGIZE_API_URL=https://alchm-backend.onrender.com/astrologize
LOCAL_API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=5000
FALLBACK_MODE=local
CACHE_DURATION=3600
DEFAULT_LATITUDE=40.7498
DEFAULT_LONGITUDE=-73.7976
DEFAULT_ZODIAC_SYSTEM=tropical
```

## Fallback Strategy

1. **Primary**: External astrologize API
2. **Secondary**: Local API endpoints
3. **Tertiary**: Cached responses (1-hour validity)
4. **Final**: Hardcoded fallback positions (March 28, 2025)

## Integration with WhatToEatNext

This MCP server seamlessly integrates with the existing WhatToEatNext API architecture:

- Uses the same `/api/astrologize` and `/api/alchemize` endpoints
- Maintains compatibility with current timeout and fallback patterns
- Preserves location-based calculation capabilities
- Supports both tropical and sidereal zodiac systems

## Auto-approved Tools

The following tools are automatically approved for seamless operation:
- `get_planetary_positions`
- `get_current_planetary_positions`
- `get_lunar_phase`
- `get_planetary_positions_for_date`
- `validate_transit_dates`
- `get_astrological_timing`
- `calculate_elemental_influences`

## Error Handling

The server implements comprehensive error handling:
- Automatic fallback on API timeouts
- Graceful degradation when external services fail
- Detailed logging for debugging and monitoring
- User-friendly error messages with fallback indicators

## Performance

- **Response Time**: < 2 seconds for astrological calculations
- **Cache Hit Rate**: Optimized for 1-hour cache validity
- **Fallback Activation**: Automatic within 5 seconds
- **Memory Usage**: Efficient caching with automatic cleanup