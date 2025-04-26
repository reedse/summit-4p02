import os
from dotenv import load_dotenv
from cache import redis_cache

# Load environment variables from .env.local
load_dotenv('../.env.local')

# Test connection and basic operations
def test_redis_connection():
    print("Testing Redis connection...")
    print(f"Using Redis URL: {os.getenv('REDIS_URL')}")
    
    # Test if connected
    if redis_cache.is_connected():
        print("✓ Successfully connected to Redis!")
        
        # Test write operation
        test_key = "test:connection"
        test_data = {
            "summary": "Test summary",
            "original_content": "Test content",
            "settings": {"length": 50, "tone": "professional"}
        }
        
        if redis_cache.cache_summary("Test content", 50, "professional", test_data):
            print("✓ Successfully wrote to Redis!")
            
            # Test read operation
            cached_data = redis_cache.get_cached_summary("Test content", 50, "professional")
            if cached_data:
                print("✓ Successfully read from Redis!")
                print("Cached data:", cached_data)
            else:
                print("✗ Failed to read from Redis")
        else:
            print("✗ Failed to write to Redis")
    else:
        print("✗ Failed to connect to Redis")

if __name__ == "__main__":
    test_redis_connection()
