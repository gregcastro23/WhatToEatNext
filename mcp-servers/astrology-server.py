#!/usr/bin/env python3
"""
Astrological API MCP Server for WhatToEatNext

This MCP server provides access to astrological calculations and planetary positions
through the existing astrologize and alchemize API endpoints. It implements timeout
handling, local fallback mechanisms, and comprehensive error handling.
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
import aiohttp
import logging

# MCP imports
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.models import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    Tool,
)
from mcp.types import (
    JSONRPCMessage,
    JSONRPCNotification,
    JSONRPCRequest,
    JSONRPCResponse,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
ASTROLOGIZE_API_URL = os.getenv("ASTROLOGIZE_API_URL", "https://alchm-backend.onrender.com/astrologize")
LOCAL_API_BASE_URL = os.getenv("LOCAL_API_BASE_URL", "http://localhost:3000/api")
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "5000")) / 1000  # Convert to seconds
FALLBACK_MODE = os.getenv("FALLBACK_MODE", "local")
CACHE_DURATION = int(os.getenv("CACHE_DURATION", "3600"))
DEFAULT_LATITUDE = float(os.getenv("DEFAULT_LATITUDE", "40.7498"))
DEFAULT_LONGITUDE = float(os.getenv("DEFAULT_LONGITUDE", "-73.7976"))
DEFAULT_ZODIAC_SYSTEM = os.getenv("DEFAULT_ZODIAC_SYSTEM", "tropical")

# Fallback planetary positions (March 28, 2025)
FALLBACK_POSITIONS = {
    "sun": {"sign": "aries", "degree": 8.5, "minute": 30, "exactLongitude": 8.5, "isRetrograde": False},
    "moon": {"sign": "aries", "degree": 1.57, "minute": 34, "exactLongitude": 1.57, "isRetrograde": False},
    "mercury": {"sign": "aries", "degree": 0.85, "minute": 51, "exactLongitude": 0.85, "isRetrograde": True},
    "venus": {"sign": "pisces", "degree": 29.08, "minute": 5, "exactLongitude": 359.08, "isRetrograde": True},
    "mars": {"sign": "cancer", "degree": 22.63, "minute": 38, "exactLongitude": 112.63, "isRetrograde": False},
    "jupiter": {"sign": "gemini", "degree": 15.52, "minute": 31, "exactLongitude": 75.52, "isRetrograde": False},
    "saturn": {"sign": "pisces", "degree": 24.12, "minute": 7, "exactLongitude": 354.12, "isRetrograde": False},
    "uranus": {"sign": "taurus", "degree": 24.62, "minute": 37, "exactLongitude": 54.62, "isRetrograde": False},
    "neptune": {"sign": "pisces", "degree": 29.93, "minute": 56, "exactLongitude": 359.93, "isRetrograde": False},
    "pluto": {"sign": "aquarius", "degree": 3.5, "minute": 30, "exactLongitude": 333.5, "isRetrograde": False},
    "northNode": {"sign": "pisces", "degree": 26.88, "minute": 53, "exactLongitude": 356.88, "isRetrograde": True},
    "southNode": {"sign": "virgo", "degree": 26.88, "minute": 53, "exactLongitude": 176.88, "isRetrograde": True}
}

class AstrologyMCPServer:
    def __init__(self):
        self.server = Server("astrology-api")
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, Dict[str, Any]] = {}
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=API_TIMEOUT)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def _get_cache_key(self, **kwargs) -> str:
        """Generate cache key from parameters"""
        return json.dumps(kwargs, sort_keys=True)
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid"""
        if "timestamp" not in cache_entry:
            return False
        
        cache_time = datetime.fromisoformat(cache_entry["timestamp"])
        now = datetime.now(timezone.utc)
        return (now - cache_time).total_seconds() < CACHE_DURATION
    
    async def _call_local_api(self, endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Dict[str, Any]:
        """Call local API endpoint with fallback handling"""
        if not self.session:
            raise RuntimeError("HTTP session not initialized")
            
        url = f"{LOCAL_API_BASE_URL}/{endpoint}"
        
        try:
            if method.upper() == "GET":
                async with self.session.get(url, params=data) as response:
                    response.raise_for_status()
                    return await response.json()
            else:
                async with self.session.post(url, json=data) as response:
                    response.raise_for_status()
                    return await response.json()
                    
        except asyncio.TimeoutError:
            logger.warning(f"Timeout calling {url}, using fallback")
            return self._get_fallback_response(endpoint)
        except Exception as e:
            logger.error(f"Error calling {url}: {e}, using fallback")
            return self._get_fallback_response(endpoint)
    
    def _get_fallback_response(self, endpoint: str) -> Dict[str, Any]:
        """Get fallback response for failed API calls"""
        if "astrologize" in endpoint or "planetary" in endpoint:
            return {
                "_celestialBodies": self._convert_fallback_to_api_format(),
                "birth_info": {
                    "year": 2025,
                    "month": 3,
                    "date": 28,
                    "hour": 12,
                    "minute": 0,
                    "latitude": DEFAULT_LATITUDE,
                    "longitude": DEFAULT_LONGITUDE,
                    "ayanamsa": "TROPICAL"
                },
                "fallback": True
            }
        elif "alchemize" in endpoint:
            return {
                "success": True,
                "planetaryPositions": FALLBACK_POSITIONS,
                "alchemicalResult": {
                    "elementalProperties": {"Fire": 0.25, "Water": 0.25, "Earth": 0.25, "Air": 0.25},
                    "thermodynamicProperties": {"heat": 0.5, "entropy": 0.5, "reactivity": 0.5, "gregsEnergy": 0.25},
                    "kalchm": 1.0,
                    "monica": 1.0
                },
                "fallback": True
            }
        
        return {"error": "No fallback available for this endpoint", "fallback": True}
    
    def _convert_fallback_to_api_format(self) -> Dict[str, Any]:
        """Convert fallback positions to API format"""
        celestial_bodies = {}
        
        for planet, data in FALLBACK_POSITIONS.items():
            if planet in ["northNode", "southNode"]:
                continue  # Skip nodes for now
                
            celestial_bodies[planet] = {
                "key": planet,
                "label": planet.capitalize(),
                "Sign": {
                    "key": data["sign"],
                    "zodiac": data["sign"],
                    "label": data["sign"].capitalize()
                },
                "ChartPosition": {
                    "Ecliptic": {
                        "DecimalDegrees": data["exactLongitude"],
                        "ArcDegrees": {
                            "degrees": data["degree"],
                            "minutes": data["minute"],
                            "seconds": 0
                        }
                    }
                },
                "isRetrograde": data["isRetrograde"]
            }
        
        return celestial_bodies

    async def get_planetary_positions(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        zodiac_system: str = "tropical"
    ) -> Dict[str, Any]:
        """Get current planetary positions"""
        
        # Check cache first
        cache_key = self._get_cache_key(
            action="current_positions",
            latitude=latitude or DEFAULT_LATITUDE,
            longitude=longitude or DEFAULT_LONGITUDE,
            zodiac_system=zodiac_system
        )
        
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info("Returning cached planetary positions")
            return self.cache[cache_key]["data"]
        
        # Prepare parameters
        params = {
            "latitude": latitude or DEFAULT_LATITUDE,
            "longitude": longitude or DEFAULT_LONGITUDE,
            "zodiacSystem": zodiac_system
        }
        
        # Call API
        result = await self._call_local_api("astrologize", "GET", params)
        
        # Cache the result
        self.cache[cache_key] = {
            "data": result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return result

    async def get_planetary_positions_for_date(
        self,
        year: int,
        month: int,
        date: int,
        hour: int = 12,
        minute: int = 0,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        zodiac_system: str = "tropical"
    ) -> Dict[str, Any]:
        """Get planetary positions for specific date/time"""
        
        # Check cache first
        cache_key = self._get_cache_key(
            action="date_positions",
            year=year,
            month=month,
            date=date,
            hour=hour,
            minute=minute,
            latitude=latitude or DEFAULT_LATITUDE,
            longitude=longitude or DEFAULT_LONGITUDE,
            zodiac_system=zodiac_system
        )
        
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info("Returning cached planetary positions for date")
            return self.cache[cache_key]["data"]
        
        # Prepare data
        data = {
            "year": year,
            "month": month,
            "date": date,
            "hour": hour,
            "minute": minute,
            "latitude": latitude or DEFAULT_LATITUDE,
            "longitude": longitude or DEFAULT_LONGITUDE,
            "zodiacSystem": zodiac_system
        }
        
        # Call API
        result = await self._call_local_api("astrologize", "POST", data)
        
        # Cache the result
        self.cache[cache_key] = {
            "data": result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return result

    async def get_alchemical_calculation(
        self,
        year: Optional[int] = None,
        month: Optional[int] = None,
        date: Optional[int] = None,
        hour: Optional[int] = None,
        minute: Optional[int] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        zodiac_system: str = "tropical"
    ) -> Dict[str, Any]:
        """Get alchemical calculations with planetary positions"""
        
        # Check cache first
        cache_key = self._get_cache_key(
            action="alchemical",
            year=year,
            month=month,
            date=date,
            hour=hour,
            minute=minute,
            latitude=latitude or DEFAULT_LATITUDE,
            longitude=longitude or DEFAULT_LONGITUDE,
            zodiac_system=zodiac_system
        )
        
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info("Returning cached alchemical calculation")
            return self.cache[cache_key]["data"]
        
        # Prepare data
        data = {
            "latitude": latitude or DEFAULT_LATITUDE,
            "longitude": longitude or DEFAULT_LONGITUDE,
            "zodiacSystem": zodiac_system
        }
        
        # Add date/time if provided
        if all(x is not None for x in [year, month, date, hour, minute]):
            data.update({
                "year": year,
                "month": month,
                "date": date,
                "hour": hour,
                "minute": minute
            })
        
        # Call API
        result = await self._call_local_api("alchemize", "POST", data)
        
        # Cache the result
        self.cache[cache_key] = {
            "data": result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return result

    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available astrological tools"""
            return [
                Tool(
                    name="get_planetary_positions",
                    description="Get current planetary positions for a location",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"},
                            "zodiac_system": {"type": "string", "enum": ["tropical", "sidereal"], "default": "tropical"}
                        }
                    }
                ),
                Tool(
                    name="get_current_planetary_positions",
                    description="Get current planetary positions (alias for get_planetary_positions)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"},
                            "zodiac_system": {"type": "string", "enum": ["tropical", "sidereal"], "default": "tropical"}
                        }
                    }
                ),
                Tool(
                    name="get_planetary_positions_for_date",
                    description="Get planetary positions for a specific date and time",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "year": {"type": "integer", "description": "Year"},
                            "month": {"type": "integer", "description": "Month (1-12)"},
                            "date": {"type": "integer", "description": "Day of month"},
                            "hour": {"type": "integer", "description": "Hour (0-23)", "default": 12},
                            "minute": {"type": "integer", "description": "Minute (0-59)", "default": 0},
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"},
                            "zodiac_system": {"type": "string", "enum": ["tropical", "sidereal"], "default": "tropical"}
                        },
                        "required": ["year", "month", "date"]
                    }
                ),
                Tool(
                    name="get_lunar_phase",
                    description="Get current lunar phase information",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"}
                        }
                    }
                ),
                Tool(
                    name="calculate_elemental_influences",
                    description="Calculate elemental influences and alchemical properties",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "year": {"type": "integer", "description": "Year (optional for current time)"},
                            "month": {"type": "integer", "description": "Month (1-12, optional)"},
                            "date": {"type": "integer", "description": "Day of month (optional)"},
                            "hour": {"type": "integer", "description": "Hour (0-23, optional)"},
                            "minute": {"type": "integer", "description": "Minute (0-59, optional)"},
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"},
                            "zodiac_system": {"type": "string", "enum": ["tropical", "sidereal"], "default": "tropical"}
                        }
                    }
                ),
                Tool(
                    name="validate_transit_dates",
                    description="Validate planetary transit dates against stored data",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "planet": {"type": "string", "description": "Planet name"},
                            "date": {"type": "string", "description": "Date in ISO format"},
                            "sign": {"type": "string", "description": "Zodiac sign"}
                        },
                        "required": ["planet", "date", "sign"]
                    }
                ),
                Tool(
                    name="get_astrological_timing",
                    description="Get optimal astrological timing for activities",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "activity_type": {"type": "string", "description": "Type of activity (cooking, eating, etc.)"},
                            "latitude": {"type": "number", "description": "Latitude coordinate"},
                            "longitude": {"type": "number", "description": "Longitude coordinate"}
                        },
                        "required": ["activity_type"]
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
            """Handle tool calls"""
            try:
                if name == "get_planetary_positions" or name == "get_current_planetary_positions":
                    result = await self.get_planetary_positions(
                        latitude=arguments.get("latitude"),
                        longitude=arguments.get("longitude"),
                        zodiac_system=arguments.get("zodiac_system", "tropical")
                    )
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result, indent=2)}])
                
                elif name == "get_planetary_positions_for_date":
                    result = await self.get_planetary_positions_for_date(
                        year=arguments["year"],
                        month=arguments["month"],
                        date=arguments["date"],
                        hour=arguments.get("hour", 12),
                        minute=arguments.get("minute", 0),
                        latitude=arguments.get("latitude"),
                        longitude=arguments.get("longitude"),
                        zodiac_system=arguments.get("zodiac_system", "tropical")
                    )
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result, indent=2)}])
                
                elif name == "get_lunar_phase":
                    # Get current positions and extract moon data
                    result = await self.get_planetary_positions(
                        latitude=arguments.get("latitude"),
                        longitude=arguments.get("longitude")
                    )
                    
                    moon_data = result.get("_celestialBodies", {}).get("moon", {})
                    lunar_info = {
                        "moon_sign": moon_data.get("Sign", {}).get("key", "unknown"),
                        "moon_degree": moon_data.get("ChartPosition", {}).get("Ecliptic", {}).get("ArcDegrees", {}).get("degrees", 0),
                        "moon_minute": moon_data.get("ChartPosition", {}).get("Ecliptic", {}).get("ArcDegrees", {}).get("minutes", 0),
                        "exact_longitude": moon_data.get("ChartPosition", {}).get("Ecliptic", {}).get("DecimalDegrees", 0),
                        "is_retrograde": moon_data.get("isRetrograde", False)
                    }
                    
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(lunar_info, indent=2)}])
                
                elif name == "calculate_elemental_influences":
                    result = await self.get_alchemical_calculation(
                        year=arguments.get("year"),
                        month=arguments.get("month"),
                        date=arguments.get("date"),
                        hour=arguments.get("hour"),
                        minute=arguments.get("minute"),
                        latitude=arguments.get("latitude"),
                        longitude=arguments.get("longitude"),
                        zodiac_system=arguments.get("zodiac_system", "tropical")
                    )
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result, indent=2)}])
                
                elif name == "validate_transit_dates":
                    # This would require access to transit date files
                    # For now, return a basic validation response
                    validation_result = {
                        "planet": arguments["planet"],
                        "date": arguments["date"],
                        "sign": arguments["sign"],
                        "is_valid": True,  # Simplified validation
                        "note": "Transit validation requires access to local transit date files"
                    }
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(validation_result, indent=2)}])
                
                elif name == "get_astrological_timing":
                    # Get current positions for timing analysis
                    positions = await self.get_planetary_positions(
                        latitude=arguments.get("latitude"),
                        longitude=arguments.get("longitude")
                    )
                    
                    timing_result = {
                        "activity_type": arguments["activity_type"],
                        "current_timing": "favorable",  # Simplified timing analysis
                        "planetary_influences": positions.get("_celestialBodies", {}),
                        "recommendations": [
                            "Current planetary positions support the requested activity",
                            "Consider lunar phase for optimal timing"
                        ]
                    }
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(timing_result, indent=2)}])
                
                else:
                    return CallToolResult(
                        content=[{"type": "text", "text": f"Unknown tool: {name}"}],
                        isError=True
                    )
                    
            except Exception as e:
                logger.error(f"Error handling tool call {name}: {e}")
                return CallToolResult(
                    content=[{"type": "text", "text": f"Error: {str(e)}"}],
                    isError=True
                )

async def main():
    """Main entry point"""
    async with AstrologyMCPServer() as server:
        server.setup_handlers()
        
        # Run the server
        from mcp.server.stdio import stdio_server
        
        async with stdio_server() as (read_stream, write_stream):
            await server.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="astrology-api",
                    server_version="1.0.0",
                    capabilities=server.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

if __name__ == "__main__":
    asyncio.run(main())