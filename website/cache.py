import redis
import json
import hashlib
from dotenv import load_dotenv
import os
from urllib.parse import urlparse
import ssl
from pathlib import Path

# Load environment variables from parent directory's .env.local
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(env_path)

class RedisCache:
    def __init__(self):
        redis_url = os.getenv('REDIS_URL')
        if not redis_url:
            raise ValueError(f"REDIS_URL environment variable is not set. Looking in: {env_path}")
            
        try:
            # Configure connection using URL
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True
            )
            
            # Test the connection
            self.redis_client.ping()
            print("Successfully connected to Redis Cloud!")
        except Exception as e:
            print(f"Failed to connect to Redis: {str(e)}")
            # Initialize a dummy client that will fail gracefully
            self.redis_client = None
            
        self.cache_expiry = int(os.getenv('REDIS_CACHE_EXPIRY', 3600))  # Default 1 hour

    def is_connected(self):
        """Check if Redis is connected and working"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False

    def generate_cache_key(self, content, length, tone):
        """Generate a unique cache key based on content and parameters"""
        # Create a string combining all parameters
        params = f"{content}:{length}:{tone}"
        # Generate MD5 hash of the parameters
        return f"summary:{hashlib.md5(params.encode()).hexdigest()}"

    def get_cached_summary(self, content, length, tone):
        """Get cached summary if it exists"""
        if not self.is_connected():
            return None
            
        try:
            cache_key = self.generate_cache_key(content, length, tone)
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                cached_result = json.loads(cached_data)
                cached_result['cached'] = True
                return cached_result
            return None
        except Exception as e:
            print(f"Redis get error: {str(e)}")
            return None

    def cache_summary(self, content, length, tone, summary_data):
        """Cache the summary data"""
        if not self.is_connected():
            return False
            
        try:
            cache_key = self.generate_cache_key(content, length, tone)
            self.redis_client.setex(
                cache_key,
                self.cache_expiry,
                json.dumps(summary_data)
            )
            return True
        except Exception as e:
            print(f"Redis set error: {str(e)}")
            return False

# Create a global instance
redis_cache = RedisCache()
