#!/usr/bin/env python3
"""
Nutritional Database MCP Server for WhatToEatNext

This MCP server provides access to nutritional databases including USDA FoodData Central
and other nutritional APIs. It implements caching, rate limiting, and secure credential
management while maintaining compatibility with existing ingredient data structures.
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
USDA_API_KEY = os.getenv("USDA_API_KEY", "")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")
CACHE_DURATION = int(os.getenv("CACHE_DURATION", "3600"))  # 1 hour
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "150"))
RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "86400"))  # 24 hours
FALLBACK_MODE = os.getenv("FALLBACK_MODE", "local")
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "5000")) / 1000  # Convert to seconds

# API URLs
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"
SPOONACULAR_BASE_URL = "https://api.spoonacular.com"

@dataclass
class NutritionalData:
    """Nutritional data structure matching WhatToEatNext ingredient format"""
    calories: float
    protein: float  # grams
    carbohydrates: float  # grams
    fat: float  # grams
    fiber: float  # grams
    sugar: float  # grams
    sodium: float  # mg
    potassium: float  # mg
    calcium: float  # mg
    iron: float  # mg
    magnesium: float  # mg
    phosphorus: float  # mg
    zinc: float  # mg
    vitamin_c: float  # mg
    vitamin_a: float  # IU
    vitamin_k: float  # mcg
    folate: float  # mcg
    source: str = "USDA FoodData Central"

@dataclass
class IngredientSearchResult:
    """Search result structure for ingredients"""
    fdc_id: int
    description: str
    brand_owner: Optional[str]
    ingredients: Optional[str]
    data_type: str
    publication_date: str
    score: float

class RateLimiter:
    """Simple rate limiter for API calls"""
    def __init__(self, max_requests: int, period_seconds: int):
        self.max_requests = max_requests
        self.period_seconds = period_seconds
        self.requests = []
    
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

class NutritionMCPServer:
    def __init__(self):
        self.server = Server("nutrition-api")
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.rate_limiter = RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_PERIOD)
        
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
        # Create a stable hash from the parameters
        content = json.dumps(kwargs, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid"""
        if "timestamp" not in cache_entry:
            return False
        
        cache_time = datetime.fromisoformat(cache_entry["timestamp"])
        now = datetime.now(timezone.utc)
        return (now - cache_time).total_seconds() < CACHE_DURATION
    
    def _get_fallback_nutritional_data(self, ingredient_name: str) -> NutritionalData:
        """Get fallback nutritional data for common ingredients"""
        # Basic nutritional data for common ingredients
        fallback_data = {
            "apple": NutritionalData(52, 0.3, 14, 0.2, 2.4, 10, 1, 107, 6, 0.12, 5, 11, 0.04, 4.6, 54, 2.2, 3),
            "banana": NutritionalData(89, 1.1, 23, 0.3, 2.6, 12, 1, 358, 5, 0.26, 27, 22, 0.15, 8.7, 64, 0.5, 20),
            "carrot": NutritionalData(41, 0.9, 10, 0.2, 2.8, 5, 69, 320, 33, 0.30, 12, 35, 0.24, 5.9, 835, 13.2, 19),
            "broccoli": NutritionalData(34, 2.8, 7, 0.4, 2.6, 1.5, 33, 316, 47, 0.73, 21, 66, 0.41, 89.2, 623, 102, 63),
            "chicken_breast": NutritionalData(165, 31, 0, 3.6, 0, 0, 74, 256, 15, 0.89, 29, 228, 0.90, 0, 21, 0.3, 4),
            "salmon": NutritionalData(208, 20, 0, 12, 0, 0, 59, 363, 12, 0.80, 29, 200, 0.64, 0, 59, 0.1, 25),
            "rice": NutritionalData(130, 2.7, 28, 0.3, 0.4, 0.1, 1, 35, 10, 0.80, 12, 43, 0.49, 0, 0, 0, 8),
            "spinach": NutritionalData(23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 558, 99, 2.71, 79, 49, 0.53, 28.1, 469, 483, 194)
        }
        
        # Try to find a close match
        ingredient_lower = ingredient_name.lower()
        for key, data in fallback_data.items():
            if key in ingredient_lower or ingredient_lower in key:
                return data
        
        # Return generic fallback
        return NutritionalData(100, 2, 20, 1, 2, 5, 50, 200, 50, 1, 25, 100, 0.5, 10, 100, 10, 20, "Fallback Data")

    async def _call_usda_api(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call USDA FoodData Central API"""
        if not USDA_API_KEY:
            raise ValueError("USDA API key not configured")
        
        if not self.rate_limiter.can_make_request():
            raise ValueError("Rate limit exceeded")
        
        if not self.session:
            raise RuntimeError("HTTP session not initialized")
        
        url = f"{USDA_BASE_URL}/{endpoint}"
        params["api_key"] = USDA_API_KEY
        
        try:
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                self.rate_limiter.record_request()
                return await response.json()
        except Exception as e:
            logger.error(f"USDA API call failed: {e}")
            raise

    async def search_ingredients(self, query: str, page_size: int = 25) -> List[IngredientSearchResult]:
        """Search for ingredients in USDA database"""
        cache_key = self._get_cache_key(action="search", query=query, page_size=page_size)
        
        # Check cache first
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info(f"Returning cached search results for: {query}")
            return [IngredientSearchResult(**item) for item in self.cache[cache_key]["data"]]
        
        try:
            params = {
                "query": query,
                "pageSize": page_size,
                "dataType": ["Foundation", "SR Legacy"],
                "sortBy": "score",
                "sortOrder": "desc"
            }
            
            result = await self._call_usda_api("foods/search", params)
            
            search_results = []
            for food in result.get("foods", []):
                search_results.append(IngredientSearchResult(
                    fdc_id=food.get("fdcId"),
                    description=food.get("description", ""),
                    brand_owner=food.get("brandOwner"),
                    ingredients=food.get("ingredients"),
                    data_type=food.get("dataType", ""),
                    publication_date=food.get("publicationDate", ""),
                    score=food.get("score", 0.0)
                ))
            
            # Cache the results
            self.cache[cache_key] = {
                "data": [asdict(result) for result in search_results],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            return search_results
            
        except Exception as e:
            logger.error(f"Ingredient search failed: {e}")
            # Return fallback search result
            return [IngredientSearchResult(
                fdc_id=0,
                description=f"Fallback result for: {query}",
                brand_owner=None,
                ingredients=None,
                data_type="Fallback",
                publication_date=datetime.now().isoformat(),
                score=0.5
            )]

    async def get_nutritional_data(self, fdc_id: int) -> NutritionalData:
        """Get detailed nutritional data for a specific food item"""
        cache_key = self._get_cache_key(action="nutrition", fdc_id=fdc_id)
        
        # Check cache first
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info(f"Returning cached nutritional data for FDC ID: {fdc_id}")
            return NutritionalData(**self.cache[cache_key]["data"])
        
        try:
            result = await self._call_usda_api(f"food/{fdc_id}", {})
            
            # Extract nutritional data from USDA response
            nutrients = {}
            for nutrient in result.get("foodNutrients", []):
                nutrient_name = nutrient.get("nutrient", {}).get("name", "").lower()
                amount = nutrient.get("amount", 0)
                
                # Map USDA nutrient names to our structure
                if "energy" in nutrient_name or "calorie" in nutrient_name:
                    nutrients["calories"] = amount
                elif "protein" in nutrient_name:
                    nutrients["protein"] = amount
                elif "carbohydrate" in nutrient_name and "fiber" not in nutrient_name:
                    nutrients["carbohydrates"] = amount
                elif "total lipid" in nutrient_name or "fat" in nutrient_name:
                    nutrients["fat"] = amount
                elif "fiber" in nutrient_name:
                    nutrients["fiber"] = amount
                elif "sugars" in nutrient_name:
                    nutrients["sugar"] = amount
                elif "sodium" in nutrient_name:
                    nutrients["sodium"] = amount
                elif "potassium" in nutrient_name:
                    nutrients["potassium"] = amount
                elif "calcium" in nutrient_name:
                    nutrients["calcium"] = amount
                elif "iron" in nutrient_name:
                    nutrients["iron"] = amount
                elif "magnesium" in nutrient_name:
                    nutrients["magnesium"] = amount
                elif "phosphorus" in nutrient_name:
                    nutrients["phosphorus"] = amount
                elif "zinc" in nutrient_name:
                    nutrients["zinc"] = amount
                elif "vitamin c" in nutrient_name or "ascorbic acid" in nutrient_name:
                    nutrients["vitamin_c"] = amount
                elif "vitamin a" in nutrient_name:
                    nutrients["vitamin_a"] = amount
                elif "vitamin k" in nutrient_name:
                    nutrients["vitamin_k"] = amount
                elif "folate" in nutrient_name:
                    nutrients["folate"] = amount
            
            # Create nutritional data with defaults for missing values
            nutritional_data = NutritionalData(
                calories=nutrients.get("calories", 0),
                protein=nutrients.get("protein", 0),
                carbohydrates=nutrients.get("carbohydrates", 0),
                fat=nutrients.get("fat", 0),
                fiber=nutrients.get("fiber", 0),
                sugar=nutrients.get("sugar", 0),
                sodium=nutrients.get("sodium", 0),
                potassium=nutrients.get("potassium", 0),
                calcium=nutrients.get("calcium", 0),
                iron=nutrients.get("iron", 0),
                magnesium=nutrients.get("magnesium", 0),
                phosphorus=nutrients.get("phosphorus", 0),
                zinc=nutrients.get("zinc", 0),
                vitamin_c=nutrients.get("vitamin_c", 0),
                vitamin_a=nutrients.get("vitamin_a", 0),
                vitamin_k=nutrients.get("vitamin_k", 0),
                folate=nutrients.get("folate", 0),
                source="USDA FoodData Central"
            )
            
            # Cache the result
            self.cache[cache_key] = {
                "data": asdict(nutritional_data),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            return nutritional_data
            
        except Exception as e:
            logger.error(f"Failed to get nutritional data for FDC ID {fdc_id}: {e}")
            # Return fallback data
            return self._get_fallback_nutritional_data(f"fdc_{fdc_id}")

    async def get_ingredient_properties(self, ingredient_name: str) -> Dict[str, Any]:
        """Get comprehensive ingredient properties including nutritional data"""
        # First search for the ingredient
        search_results = await self.search_ingredients(ingredient_name, page_size=5)
        
        if not search_results:
            return {
                "ingredient_name": ingredient_name,
                "nutritional_data": asdict(self._get_fallback_nutritional_data(ingredient_name)),
                "source": "fallback",
                "search_results": []
            }
        
        # Get nutritional data for the best match
        best_match = search_results[0]
        nutritional_data = await self.get_nutritional_data(best_match.fdc_id)
        
        return {
            "ingredient_name": ingredient_name,
            "best_match": asdict(best_match),
            "nutritional_data": asdict(nutritional_data),
            "source": "USDA FoodData Central",
            "search_results": [asdict(result) for result in search_results[:3]]
        }

    async def validate_ingredient_data(self, ingredient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate ingredient data against USDA standards"""
        validation_result = {
            "is_valid": True,
            "warnings": [],
            "errors": [],
            "suggestions": []
        }
        
        # Check for required nutritional fields
        required_fields = ["calories", "protein", "carbohydrates", "fat"]
        nutritional_data = ingredient_data.get("nutritional", {})
        
        for field in required_fields:
            if field not in nutritional_data:
                validation_result["warnings"].append(f"Missing required field: {field}")
        
        # Check for reasonable value ranges
        if nutritional_data.get("calories", 0) > 900:
            validation_result["warnings"].append("Calories seem unusually high")
        
        if nutritional_data.get("protein", 0) > 100:
            validation_result["warnings"].append("Protein content seems unusually high")
        
        # Check for source attribution
        if not ingredient_data.get("source"):
            validation_result["suggestions"].append("Consider adding source attribution")
        
        return validation_result

    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available nutritional tools"""
            return [
                Tool(
                    name="get_nutritional_data",
                    description="Get detailed nutritional data for a food item by FDC ID",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "fdc_id": {"type": "integer", "description": "USDA FoodData Central ID"}
                        },
                        "required": ["fdc_id"]
                    }
                ),
                Tool(
                    name="search_ingredients",
                    description="Search for ingredients in the USDA database",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query for ingredient"},
                            "page_size": {"type": "integer", "description": "Number of results to return", "default": 25}
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="get_ingredient_properties",
                    description="Get comprehensive ingredient properties including nutritional data",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "ingredient_name": {"type": "string", "description": "Name of the ingredient"}
                        },
                        "required": ["ingredient_name"]
                    }
                ),
                Tool(
                    name="validate_ingredient_data",
                    description="Validate ingredient data against USDA standards",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "ingredient_data": {"type": "object", "description": "Ingredient data to validate"}
                        },
                        "required": ["ingredient_data"]
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
            """Handle tool calls"""
            try:
                if name == "get_nutritional_data":
                    result = await self.get_nutritional_data(arguments["fdc_id"])
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(asdict(result), indent=2)}])
                
                elif name == "search_ingredients":
                    results = await self.search_ingredients(
                        arguments["query"],
                        arguments.get("page_size", 25)
                    )
                    result_data = [asdict(result) for result in results]
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result_data, indent=2)}])
                
                elif name == "get_ingredient_properties":
                    result = await self.get_ingredient_properties(arguments["ingredient_name"])
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result, indent=2)}])
                
                elif name == "validate_ingredient_data":
                    result = await self.validate_ingredient_data(arguments["ingredient_data"])
                    return CallToolResult(content=[{"type": "text", "text": json.dumps(result, indent=2)}])
                
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
    async with NutritionMCPServer() as server:
        server.setup_handlers()
        
        # Run the server
        from mcp.server.stdio import stdio_server
        
        async with stdio_server() as (read_stream, write_stream):
            await server.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="nutrition-api",
                    server_version="1.0.0",
                    capabilities=server.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

if __name__ == "__main__":
    asyncio.run(main())