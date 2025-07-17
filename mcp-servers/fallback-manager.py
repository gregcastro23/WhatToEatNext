#!/usr/bin/env python3
"""
Comprehensive Fallback Strategy Manager for WhatToEatNext MCP Servers

This module implements a multi-tier fallback system (API → Cache → Local) with
timeout handling, retry mechanisms, cache validity management, and graceful
degradation for all MCP servers in the WhatToEatNext ecosystem.
"""

import asyncio
import json
import os
import sys
import hashlib
import time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union, Callable, Awaitable
import aiohttp
import logging
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FallbackTier(Enum):
    """Fallback tier enumeration"""
    PRIMARY_API = "primary_api"
    SECONDARY_API = "secondary_api"
    CACHE = "cache"
    LOCAL_DATA = "local_data"
    HARDCODED = "hardcoded"

class ServiceType(Enum):
    """Service type enumeration"""
    ASTROLOGY = "astrology"
    NUTRITION = "nutrition"
    RECIPES = "recipes"

@dataclass
class FallbackConfig:
    """Configuration for fallback behavior"""
    service_type: ServiceType
    primary_timeout: float = 5.0  # seconds
    secondary_timeout: float = 3.0  # seconds
    cache_duration: int = 3600  # seconds
    max_retries: int = 3
    retry_delay: float = 1.0  # seconds
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: int = 60  # seconds
    enable_cache: bool = True
    enable_local_fallback: bool = True
    enable_hardcoded_fallback: bool = True

@dataclass
class FallbackResult:
    """Result from fallback system"""
    data: Any
    tier_used: FallbackTier
    success: bool
    error_message: Optional[str] = None
    response_time: float = 0.0
    cache_hit: bool = False
    fallback_reason: Optional[str] = None

class CircuitBreaker:
    """Circuit breaker implementation for API calls"""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def can_execute(self) -> bool:
        """Check if the circuit breaker allows execution"""
        if self.state == "CLOSED":
            return True
        elif self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        else:  # HALF_OPEN
            return True
    
    def record_success(self):
        """Record a successful execution"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def record_failure(self):
        """Record a failed execution"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

class CacheManager:
    """Cache management with TTL and validation"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.access_times: Dict[str, datetime] = {}
    
    def _generate_key(self, service: str, method: str, **kwargs) -> str:
        """Generate cache key"""
        key_data = {
            "service": service,
            "method": method,
            **kwargs
        }
        content = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, service: str, method: str, ttl: int = 3600, **kwargs) -> Optional[Any]:
        """Get cached data if valid"""
        key = self._generate_key(service, method, **kwargs)
        
        if key not in self.cache:
            return None
        
        cache_entry = self.cache[key]
        cache_time = datetime.fromisoformat(cache_entry["timestamp"])
        
        if (datetime.now(timezone.utc) - cache_time).total_seconds() > ttl:
            # Cache expired
            del self.cache[key]
            if key in self.access_times:
                del self.access_times[key]
            return None
        
        self.access_times[key] = datetime.now()
        return cache_entry["data"]
    
    def set(self, service: str, method: str, data: Any, **kwargs):
        """Set cached data"""
        key = self._generate_key(service, method, **kwargs)
        self.cache[key] = {
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.access_times[key] = datetime.now()
    
    def clear_expired(self, ttl: int = 3600):
        """Clear expired cache entries"""
        now = datetime.now(timezone.utc)
        expired_keys = []
        
        for key, entry in self.cache.items():
            cache_time = datetime.fromisoformat(entry["timestamp"])
            if (now - cache_time).total_seconds() > ttl:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.cache[key]
            if key in self.access_times:
                del self.access_times[key]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "total_entries": len(self.cache),
            "memory_usage_estimate": sum(len(str(entry)) for entry in self.cache.values()),
            "oldest_entry": min(self.access_times.values()) if self.access_times else None,
            "newest_entry": max(self.access_times.values()) if self.access_times else None
        }

class FallbackManager:
    """Comprehensive fallback strategy manager"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.session: Optional[aiohttp.ClientSession] = None
        self.local_data_path = Path(__file__).parent / "fallback_data"
        self.local_data_path.mkdir(exist_ok=True)
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def get_circuit_breaker(self, service: str) -> CircuitBreaker:
        """Get or create circuit breaker for service"""
        if service not in self.circuit_breakers:
            self.circuit_breakers[service] = CircuitBreaker()
        return self.circuit_breakers[service]
    
    async def execute_with_fallback(
        self,
        config: FallbackConfig,
        primary_func: Callable[[], Awaitable[Any]],
        secondary_func: Optional[Callable[[], Awaitable[Any]]] = None,
        cache_key_params: Optional[Dict[str, Any]] = None,
        local_fallback_func: Optional[Callable[[], Any]] = None,
        hardcoded_fallback: Optional[Any] = None
    ) -> FallbackResult:
        """Execute function with comprehensive fallback strategy"""
        
        start_time = time.time()
        service_name = config.service_type.value
        circuit_breaker = self.get_circuit_breaker(service_name)
        
        # Check cache first if enabled
        if config.enable_cache and cache_key_params:
            cached_data = self.cache_manager.get(
                service_name,
                "api_call",
                config.cache_duration,
                **cache_key_params
            )
            if cached_data is not None:
                return FallbackResult(
                    data=cached_data,
                    tier_used=FallbackTier.CACHE,
                    success=True,
                    response_time=time.time() - start_time,
                    cache_hit=True
                )
        
        # Try primary API
        if circuit_breaker.can_execute():
            try:
                result = await asyncio.wait_for(
                    primary_func(),
                    timeout=config.primary_timeout
                )
                
                # Cache successful result
                if config.enable_cache and cache_key_params:
                    self.cache_manager.set(
                        service_name,
                        "api_call",
                        result,
                        **cache_key_params
                    )
                
                circuit_breaker.record_success()
                return FallbackResult(
                    data=result,
                    tier_used=FallbackTier.PRIMARY_API,
                    success=True,
                    response_time=time.time() - start_time
                )
                
            except Exception as e:
                logger.warning(f"Primary API failed for {service_name}: {e}")
                circuit_breaker.record_failure()
        
        # Try secondary API if available
        if secondary_func and circuit_breaker.can_execute():
            try:
                result = await asyncio.wait_for(
                    secondary_func(),
                    timeout=config.secondary_timeout
                )
                
                # Cache successful result
                if config.enable_cache and cache_key_params:
                    self.cache_manager.set(
                        service_name,
                        "api_call",
                        result,
                        **cache_key_params
                    )
                
                return FallbackResult(
                    data=result,
                    tier_used=FallbackTier.SECONDARY_API,
                    success=True,
                    response_time=time.time() - start_time,
                    fallback_reason="Primary API unavailable"
                )
                
            except Exception as e:
                logger.warning(f"Secondary API failed for {service_name}: {e}")
        
        # Try local data fallback
        if config.enable_local_fallback and local_fallback_func:
            try:
                result = local_fallback_func()
                return FallbackResult(
                    data=result,
                    tier_used=FallbackTier.LOCAL_DATA,
                    success=True,
                    response_time=time.time() - start_time,
                    fallback_reason="APIs unavailable, using local data"
                )
            except Exception as e:
                logger.warning(f"Local fallback failed for {service_name}: {e}")
        
        # Use hardcoded fallback as last resort
        if config.enable_hardcoded_fallback and hardcoded_fallback is not None:
            return FallbackResult(
                data=hardcoded_fallback,
                tier_used=FallbackTier.HARDCODED,
                success=True,
                response_time=time.time() - start_time,
                fallback_reason="All other fallbacks failed, using hardcoded data"
            )
        
        # Complete failure
        return FallbackResult(
            data=None,
            tier_used=FallbackTier.HARDCODED,
            success=False,
            error_message="All fallback tiers failed",
            response_time=time.time() - start_time
        )
    
    def load_local_data(self, service: ServiceType, data_type: str) -> Optional[Any]:
        """Load local fallback data from files"""
        file_path = self.local_data_path / f"{service.value}_{data_type}.json"
        
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load local data from {file_path}: {e}")
            return None
    
    def save_local_data(self, service: ServiceType, data_type: str, data: Any):
        """Save data as local fallback"""
        file_path = self.local_data_path / f"{service.value}_{data_type}.json"
        
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save local data to {file_path}: {e}")
    
    def get_fallback_stats(self) -> Dict[str, Any]:
        """Get comprehensive fallback statistics"""
        circuit_breaker_stats = {}
        for service, cb in self.circuit_breakers.items():
            circuit_breaker_stats[service] = {
                "state": cb.state,
                "failure_count": cb.failure_count,
                "last_failure_time": cb.last_failure_time
            }
        
        return {
            "cache_stats": self.cache_manager.get_stats(),
            "circuit_breaker_stats": circuit_breaker_stats,
            "local_data_files": list(self.local_data_path.glob("*.json"))
        }

# Predefined fallback configurations for each service
ASTROLOGY_FALLBACK_CONFIG = FallbackConfig(
    service_type=ServiceType.ASTROLOGY,
    primary_timeout=5.0,
    secondary_timeout=3.0,
    cache_duration=3600,  # 1 hour for planetary positions
    max_retries=3,
    circuit_breaker_threshold=5,
    circuit_breaker_timeout=60
)

NUTRITION_FALLBACK_CONFIG = FallbackConfig(
    service_type=ServiceType.NUTRITION,
    primary_timeout=5.0,
    secondary_timeout=3.0,
    cache_duration=3600,  # 1 hour for nutritional data
    max_retries=2,
    circuit_breaker_threshold=3,
    circuit_breaker_timeout=30
)

RECIPES_FALLBACK_CONFIG = FallbackConfig(
    service_type=ServiceType.RECIPES,
    primary_timeout=5.0,
    secondary_timeout=3.0,
    cache_duration=7200,  # 2 hours for recipe data
    max_retries=2,
    circuit_breaker_threshold=3,
    circuit_breaker_timeout=30
)

# Hardcoded fallback data
ASTROLOGY_HARDCODED_FALLBACK = {
    "_celestialBodies": {
        "sun": {"sign": "aries", "degree": 8.5, "minute": 30, "exactLongitude": 8.5, "isRetrograde": False},
        "moon": {"sign": "aries", "degree": 1.57, "minute": 34, "exactLongitude": 1.57, "isRetrograde": False},
        "mercury": {"sign": "aries", "degree": 0.85, "minute": 51, "exactLongitude": 0.85, "isRetrograde": True},
        "venus": {"sign": "pisces", "degree": 29.08, "minute": 5, "exactLongitude": 359.08, "isRetrograde": True},
        "mars": {"sign": "cancer", "degree": 22.63, "minute": 38, "exactLongitude": 112.63, "isRetrograde": False},
        "jupiter": {"sign": "gemini", "degree": 15.52, "minute": 31, "exactLongitude": 75.52, "isRetrograde": False},
        "saturn": {"sign": "pisces", "degree": 24.12, "minute": 7, "exactLongitude": 354.12, "isRetrograde": False},
        "uranus": {"sign": "taurus", "degree": 24.62, "minute": 37, "exactLongitude": 54.62, "isRetrograde": False},
        "neptune": {"sign": "pisces", "degree": 29.93, "minute": 56, "exactLongitude": 359.93, "isRetrograde": False},
        "pluto": {"sign": "aquarius", "degree": 3.5, "minute": 30, "exactLongitude": 333.5, "isRetrograde": False}
    },
    "birth_info": {
        "year": 2025, "month": 3, "date": 28, "hour": 12, "minute": 0,
        "latitude": 40.7498, "longitude": -73.7976, "ayanamsa": "TROPICAL"
    },
    "fallback": True
}

NUTRITION_HARDCODED_FALLBACK = {
    "calories": 100, "protein": 2, "carbohydrates": 20, "fat": 1,
    "fiber": 2, "sugar": 5, "sodium": 50, "potassium": 200,
    "calcium": 50, "iron": 1, "magnesium": 25, "phosphorus": 100,
    "zinc": 0.5, "vitamin_c": 10, "vitamin_a": 100, "vitamin_k": 10,
    "folate": 20, "source": "Fallback Data", "fallback": True
}

RECIPES_HARDCODED_FALLBACK = [
    {
        "id": 1, "title": "Simple Pasta", "ready_in_minutes": 30, "servings": 4,
        "summary": "A simple pasta recipe for when APIs are unavailable.",
        "instructions": "Cook pasta according to package directions. Add your favorite sauce.",
        "cuisines": ["Italian"], "dish_types": ["main course"], "vegetarian": True,
        "health_score": 75.0, "fallback": True
    }
]

async def main():
    """Example usage of the fallback manager"""
    async with FallbackManager() as manager:
        
        # Example: Astrology API call with fallback
        async def primary_astrology_call():
            # This would be the actual API call
            raise Exception("API unavailable")
        
        def local_astrology_fallback():
            return manager.load_local_data(ServiceType.ASTROLOGY, "positions")
        
        result = await manager.execute_with_fallback(
            config=ASTROLOGY_FALLBACK_CONFIG,
            primary_func=primary_astrology_call,
            cache_key_params={"latitude": 40.7498, "longitude": -73.7976},
            local_fallback_func=local_astrology_fallback,
            hardcoded_fallback=ASTROLOGY_HARDCODED_FALLBACK
        )
        
        print(f"Astrology result: {result.tier_used.value}, Success: {result.success}")
        print(f"Response time: {result.response_time:.2f}s")
        
        # Get fallback statistics
        stats = manager.get_fallback_stats()
        print(f"Fallback stats: {json.dumps(stats, indent=2, default=str)}")

if __name__ == "__main__":
    asyncio.run(main())