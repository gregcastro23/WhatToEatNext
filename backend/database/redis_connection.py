import os
import redis
from typing import Optional

def get_redis_client() -> Optional[redis.Redis]:
    """
    Get a Redis client instance.
    Falls back to None if REDIS_URL is not set or connection fails.
    """
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        return None
    
    try:
        # Use a timeout to avoid hanging if Redis is unreachable
        client = redis.from_url(redis_url, socket_timeout=5, socket_connect_timeout=5)
        # Verify connection
        client.ping()
        return client
    except Exception as e:
        print(f"Redis connection failed: {e}")
        return None
