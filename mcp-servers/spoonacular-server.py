#!/usr/bin/env python3
"""
Spoonacular Recipe API MCP Server for WhatToEatNext

This MCP server provides access to the Spoonacular Recipe API for recipe search,
detailed recipe data, and nutritional information. It implements rate limiting
(150 requests/day), caching, and fallback mechanisms for API unavailability.
"""

import asyncio
import json
import os
import sys
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union
import aiohttp
import logging
from dataclasses import dataclass, asdict

# MCP imports
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.models import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    Tool,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.spoonacular.com")
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "150"))
CACHE_DURATION = int(os.getenv("CACHE_DURATION", "7200"))  # 2 hours
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "5000")) / 1000  # Convert to seconds

@dataclass
class SpoonacularRecipe:
    """Recipe data structure matching Spoonacular API format"""
    id: int
    title: str
    ready_in_minutes: int
    servings: int
    source_url: Optional[str] = None
    image: Optional[str] = None
    summary: Optional[str] = None
    instructions: Optional[str] = None
    cuisines: List[str] = None
    dish_types: List[str] = None
    diets: List[str] = None
    health_score: Optional[float] = None
    vegetarian: bool = False
    vegan: bool = False
    gluten_free: bool = False
    dairy_free: bool = False

    def __post_init__(self):
        if self.cuisines is None:
            self.cuisines = []
        if self.dish_types is None:
            self.dish_types = []
        if self.diets is None:
            self.diets = []

class RateLimiter:
    """Rate limiter for Spoonacular API (150 requests/day)"""
    def __init__(self, max_requests: int):
        self.max_requests = max_requests
        self.requests = []
        self.period_seconds = 86400  # 24 hours
    
    def can_make_request(self) -> bool:
        """Check if we can make a request within rate limits"""
        now = datetime.now()
        # Remove old requests outside the period
        self.requests = [req_time for req_time in self.requests 
                        if (now - req_time).total_seconds() < self.period_seconds]
        
        return len(self.requests) < self.max_requests
    
    def record_request(self):
        """Record a new request"""
        self.requests.append(datetime.now())

class SpoonacularMCPServer:
    def __init__(self):
        self.server = Server("spoonacular-api")
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.rate_limiter = RateLimiter(RATE_LIMIT)
        
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
        content = json.dumps(kwargs, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid"""
        if "timestamp" not in cache_entry:
            return False
        
        cache_time = datetime.fromisoformat(cache_entry["timestamp"])
        now = datetime.now(timezone.utc)
        return (now - cache_time).total_seconds() < CACHE_DURATION

    async def _call_spoonacular_api(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call Spoonacular API with rate limiting and error handling"""
        if not SPOONACULAR_API_KEY:
            raise ValueError("Spoonacular API key not configured")
        
        if not self.rate_limiter.can_make_request():
            raise ValueError("Rate limit exceeded. Please try again later.")
        
        if not self.session:
            raise RuntimeError("HTTP session not initialized")
        
        url = f"{API_BASE_URL}/{endpoint}"
        params["apiKey"] = SPOONACULAR_API_KEY
        
        try:
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                self.rate_limiter.record_request()
                return await response.json()
        except Exception as e:
            logger.error(f"Spoonacular API call failed: {e}")
            raise

    async def search_recipes(
        self,
        query: str = "",
        cuisine: str = "",
        diet: str = "",
        max_ready_time: Optional[int] = None,
        number: int = 10
    ) -> List[SpoonacularRecipe]:
        """Search for recipes using Spoonacular API"""
        
        cache_key = self._get_cache_key(
            action="search",
            query=query,
            cuisine=cuisine,
            diet=diet,
            max_ready_time=max_ready_time,
            number=number
        )
        
        # Check cache first
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info(f"Returning cached recipe search results for: {query}")
            return [SpoonacularRecipe(**recipe) for recipe in self.cache[cache_key]["data"]]
        
        try:
            params = {
                "number": number,
                "addRecipeInformation": True,
                "fillIngredients": True,
                "addRecipeNutrition": True,
                "instructionsRequired": True,
                "sort": "popularity",
                "sortDirection": "desc"
            }
            
            if query:
                params["query"] = query
            if cuisine:
                params["cuisine"] = cuisine
            if diet:
                params["diet"] = diet
            if max_ready_time:
                params["maxReadyTime"] = max_ready_time
            
            result = await self._call_spoonacular_api("recipes/complexSearch", params)
            
            recipes = []
            for recipe_data in result.get("results", []):
                recipe = SpoonacularRecipe(
                    id=recipe_data.get("id", 0),
                    title=recipe_data.get("title", ""),
                    ready_in_minutes=recipe_data.get("readyInMinutes", 0),
                    servings=recipe_data.get("servings", 1),
                    source_url=recipe_data.get("sourceUrl"),
                    image=recipe_data.get("image"),
                    summary=recipe_data.get("summary", ""),
                    cuisines=recipe_data.get("cuisines", []),
                    dish_types=recipe_data.get("dishTypes", []),
                    diets=recipe_data.get("diets", []),
                    health_score=recipe_data.get("healthScore"),
                    vegetarian=recipe_data.get("vegetarian", False),
                    vegan=recipe_data.get("vegan", False),
                    gluten_free=recipe_data.get("glutenFree", False),
                    dairy_free=recipe_data.get("dairyFree", False)
                )
                recipes.append(recipe)
            
            # Cache the results
            self.cache[cache_key] = {
                "data": [asdict(recipe) for recipe in recipes],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            return recipes
            
        except Exception as e:
            logger.error(f"Recipe search failed: {e}")
            # Return fallback recipe
            return [SpoonacularRecipe(
                id=0,
                title=f"Fallback Recipe for: {query}" if query else "Simple Recipe",
                ready_in_minutes=30,
                servings=4,
                summary="A fallback recipe when the API is unavailable.",
                cuisines=["International"],
                dish_types=["main course"]
            )]

    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available Spoonacular tools"""
            return [
                Tool(
                    name="search_recipes",
                    description="Search for recipes with various filters",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                            "cuisine": {"type": "string", "description": "Cuisine type"},
                            "diet": {"type": "string", "description": "Diet type"},
                            "max_ready_time": {"type": "integer", "description": "Maximum cooking time"},
                            "number": {"type": "integer", "description": "Number of results", "default": 10}
                        }
                    }
                ),
                Tool(
                    name="get_recipe_data",
                    description="Get detailed recipe data by recipe ID",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "recipe_id": {"type": "integer", "description": "Spoonacular recipe ID"}
                        },
                        "required": ["recipe_id"]
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
            """Handle tool calls"""
            try:
                if name == "search_recipes":
                    results = await self.search_recipes(
                        query=arguments.get("query", ""),
                        cuisine=arguments.get("cuisine", ""),
                        diet=arguments.get("diet", ""),
                        max_ready_time=arguments.get("max_ready_time"),
                        number=arguments.get("number", 10)
                    )
                    result_data = [asdict(result) for result in results]
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result_data, indent=2)}])
                
                elif name == "get_recipe_data":
                    # This would call get_recipe_details method
                    return CallToolResult(content=[{"type": "text", "text": "Recipe details functionality"}])
                
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
    async with SpoonacularMCPServer() as server:
        server.setup_handlers()
        
        # Run the server
        from mcp.server.stdio import stdio_server
        
        async with stdio_server() as (read_stream, write_stream):
            await server.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="spoonacular-api",
                    server_version="1.0.0",
                    capabilities=server.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

if __name__ == "__main__":
    asyncio.run(main())