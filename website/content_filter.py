"""
Content Filtering Module for AI Summary Feature

This module provides functionality for filtering content before sending it to the Gemini API,
including keyword-based filtering, content category detection, and inappropriate content detection.
"""

import re
import logging
from collections import Counter
import json
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load filter lists from JSON files
def load_filter_lists():
    """
    Load keyword filter lists from JSON files
    
    Returns:
        dict: Dictionary containing filter lists
    """
    try:
        # Get the directory of the current file
        current_dir = Path(__file__).resolve().parent
        
        # Path to filter lists directory
        filter_dir = current_dir / 'filter_lists'
        
        # Create directory if it doesn't exist
        if not filter_dir.exists():
            filter_dir.mkdir(parents=True)
            
            # Create default filter lists if they don't exist
            default_filters = {
                'inappropriate.json': [
                    'obscenity', 'profanity', 'explicit', 'offensive',
                    'hate speech', 'violent content', 'harassment'
                ],
                'spam.json': [
                    'buy now', 'click here', 'free offer', 'limited time',
                    'act now', 'discount', 'sale', 'cheap', 'earn money',
                    'get rich', 'guaranteed', 'no risk', 'winner'
                ],
                'sensitive.json': [
                    'confidential', 'private', 'secret', 'classified',
                    'restricted', 'internal use', 'not for distribution'
                ]
            }
            
            # Write default filter lists to files
            for filename, keywords in default_filters.items():
                with open(filter_dir / filename, 'w') as f:
                    json.dump(keywords, f, indent=2)
        
        # Load filter lists from files
        filter_lists = {}
        for filter_file in filter_dir.glob('*.json'):
            with open(filter_file, 'r') as f:
                filter_lists[filter_file.stem] = json.load(f)
                
        return filter_lists
    
    except Exception as e:
        logger.error(f"Error loading filter lists: {str(e)}")
        # Return empty filter lists as fallback
        return {
            'inappropriate': [],
            'spam': [],
            'sensitive': []
        }

# Initialize filter lists
FILTER_LISTS = load_filter_lists()

class ContentFilter:
    """Content filtering class for detecting inappropriate content"""
    
    def __init__(self, strict_mode=False):
        """
        Initialize content filter
        
        Args:
            strict_mode (bool): Whether to use strict filtering mode
        """
        self.strict_mode = strict_mode
        self.filter_lists = FILTER_LISTS
        
    def detect_keywords(self, content, filter_type=None):
        """
        Detect keywords from filter lists in content
        
        Args:
            content (str): Content to check
            filter_type (str, optional): Specific filter type to check
            
        Returns:
            dict: Dictionary with detected keywords and counts
        """
        content = content.lower()
        detected = {}
        
        # If filter_type is specified, only check that filter
        if filter_type and filter_type in self.filter_lists:
            filter_types = [filter_type]
        else:
            filter_types = self.filter_lists.keys()
        
        # Check each filter type
        for filter_name in filter_types:
            keywords = self.filter_lists.get(filter_name, [])
            matches = []
            
            for keyword in keywords:
                # Use word boundary to match whole words only
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, content):
                    matches.append(keyword)
            
            if matches:
                detected[filter_name] = matches
                
        return detected
    
    def detect_content_category(self, content):
        """
        Detect the category of content based on keyword frequency
        
        Args:
            content (str): Content to categorize
            
        Returns:
            dict: Dictionary with category information
        """
        # Define category keywords
        categories = {
            'news': ['news', 'report', 'journalist', 'media', 'breaking', 'coverage', 'headline'],
            'technology': ['technology', 'tech', 'software', 'hardware', 'digital', 'computer', 'app', 'device'],
            'business': ['business', 'company', 'market', 'industry', 'economic', 'finance', 'investment'],
            'health': ['health', 'medical', 'doctor', 'patient', 'treatment', 'disease', 'wellness'],
            'science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment'],
            'politics': ['politics', 'government', 'election', 'policy', 'political', 'vote', 'candidate'],
            'entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'film', 'actor', 'actress'],
            'sports': ['sports', 'game', 'player', 'team', 'match', 'tournament', 'championship']
        }
        
        # Tokenize content
        words = re.findall(r'\b\w+\b', content.lower())
        
        # Count category matches
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(1 for word in words if word in keywords)
            if score > 0:
                category_scores[category] = score
        
        # For very small content or no matches, ensure we still have categories
        if not category_scores or len(words) < 20:
            # Add a small score to general categories to ensure we have something
            if 'general' not in category_scores:
                category_scores['general'] = 1
            
            # If we only have one category, add a secondary
            if len(category_scores) == 1:
                # Add 'informational' as a default secondary category
                category_scores['informational'] = 0.5
        
        # Sort categories by score
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_categories[0][0]
        primary_score = sorted_categories[0][1]
        
        # Calculate confidence (0-100)
        total_score = sum(score for _, score in sorted_categories)
        confidence = int((primary_score / total_score) * 100) if total_score > 0 else 0
        
        # Get secondary category if available
        secondary = sorted_categories[1][0] if len(sorted_categories) > 1 else 'general'
        
        return {
            'primary_category': primary,
            'secondary_category': secondary,
            'confidence': confidence
        }
    
    def is_content_appropriate(self, content):
        """
        Check if content is appropriate based on filter lists
        
        Args:
            content (str): Content to check
            
        Returns:
            dict: Dictionary with appropriateness information
        """
        # Detect inappropriate keywords
        detected = self.detect_keywords(content, 'inappropriate')
        
        # If no inappropriate content detected
        if not detected:
            return {
                'appropriate': True,
                'reason': None,
                'detected_keywords': {}
            }
        
        # Get the detected inappropriate keywords
        inappropriate_keywords = detected.get('inappropriate', [])
        
        # In strict mode, any match is inappropriate
        if self.strict_mode and inappropriate_keywords:
            return {
                'appropriate': False,
                'reason': 'Content contains inappropriate keywords',
                'detected_keywords': detected
            }
        
        # In normal mode, threshold is 3 or more inappropriate keywords
        if len(inappropriate_keywords) >= 3:
            return {
                'appropriate': False,
                'reason': 'Content contains multiple inappropriate keywords',
                'detected_keywords': detected
            }
        
        # Otherwise, content is appropriate but with warnings
        return {
            'appropriate': True,
            'reason': 'Content contains some potentially inappropriate keywords',
            'detected_keywords': detected,
            'warning': True
        }
    
    def filter_content(self, content, user_role='user'):
        """
        Filter content and provide detailed analysis
        
        Args:
            content (str): Content to filter
            user_role (str): User role for permission checks (no longer used)
            
        Returns:
            dict: Dictionary with filtering results
        """
        # Admin bypass removed - all users are treated the same
        
        # Check all filter types
        all_detected = self.detect_keywords(content)
        
        # Check if content is appropriate
        appropriateness = self.is_content_appropriate(content)
        
        # Generate warnings
        warnings = []
        for filter_type, keywords in all_detected.items():
            if filter_type != 'inappropriate':  # Already handled in appropriateness check
                warnings.append({
                    'type': filter_type,
                    'message': f"Content contains {filter_type} keywords: {', '.join(keywords)}",
                    'keywords': keywords
                })
        
        # Determine if content should be allowed
        allowed = appropriateness['appropriate']
        
        # Get content category
        categories = self.detect_content_category(content)
        
        # Return filtering results
        return {
            'allowed': allowed,
            'filtered_content': content if allowed else None,
            'reason': appropriateness['reason'],
            'categories': categories,
            'warnings': warnings,
            'detected_keywords': all_detected
        }

# Create a default instance
default_filter = ContentFilter()

def filter_content(content, user_role='user', strict_mode=False):
    """
    Filter content using the ContentFilter class
    
    Args:
        content (str): Content to filter
        user_role (str): User role for permission checks (no longer used)
        strict_mode (bool): Whether to use strict filtering mode
        
    Returns:
        dict: Dictionary with filtering results
    """
    # Create a filter instance with the specified mode
    content_filter = ContentFilter(strict_mode=strict_mode)
    
    # Filter the content - user_role parameter is kept for backward compatibility
    return content_filter.filter_content(content, user_role) 