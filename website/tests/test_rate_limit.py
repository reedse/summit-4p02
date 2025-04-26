#!/usr/bin/env python
"""
Test script for Twitter API rate limits
This script will attempt to post multiple tweets in quick succession
to test Twitter API rate limits.
"""

from website.twitter_api import post_tweet
import time

# Twitter credentials - using the same ones from twitter_api.py
CREDENTIALS = {
    'access_token': '846222756781834240-ToTHFa3UBKdbvU5n04ikwbjMzKktvh5',
    'access_token_secret': 'm77LO6GMlcCMAKQo0PNgbgSidfPUQul18AvFtWstZNX7S'
}

def test_rate_limit(num_tweets=3, delay=1):
    """
    Test Twitter API rate limits by posting multiple tweets
    
    Args:
        num_tweets (int): Number of tweets to post
        delay (int): Delay in seconds between tweets
    """
    print(f"Testing rate limits by posting {num_tweets} tweets with {delay}s delay")
    
    results = []
    
    for i in range(num_tweets):
        tweet_content = f"Rate limit test tweet #{i+1} - {time.time()}"
        print(f"\nAttempting to post tweet {i+1}/{num_tweets}: {tweet_content}")
        
        # Post the tweet
        result = post_tweet(tweet_content, CREDENTIALS)
        results.append(result)
        
        print(f"Result: {'SUCCESS' if result.get('success') else 'FAILED'}")
        if not result.get('success'):
            print(f"Error: {result.get('error')}")
        else:
            print(f"Tweet ID: {result.get('tweet_id')}")
        
        # Check if we hit a rate limit
        error_msg = result.get('error', '')
        if not result.get('success') and ('rate limit' in error_msg.lower() or '429' in error_msg):
            print("\n*** RATE LIMIT DETECTED! ***")
            print(f"Rate limit hit after {i+1} tweets")
            break
        
        # Wait before posting the next tweet
        if i < num_tweets - 1:
            print(f"Waiting {delay} seconds before next request...")
            time.sleep(delay)
    
    # Summary
    successes = sum(1 for r in results if r.get('success'))
    failures = len(results) - successes
    
    print("\n=== RATE LIMIT TEST SUMMARY ===")
    print(f"Total attempts: {len(results)}")
    print(f"Successful tweets: {successes}")
    print(f"Failed tweets: {failures}")
    
    if failures > 0:
        error_msgs = [r.get('error') for r in results if not r.get('success')]
        print("\nError messages:")
        for i, msg in enumerate(error_msgs):
            print(f"  {i+1}. {msg}")

if __name__ == "__main__":
    # You can adjust the number of tweets and delay between them
    test_rate_limit(num_tweets=5, delay=2)
