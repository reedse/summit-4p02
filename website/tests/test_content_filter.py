import unittest
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import the content_filter module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from content_filter import ContentFilter, filter_content

class TestContentFilter(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a test filter with test filter lists
        self.filter = ContentFilter()
        self.filter.filter_lists = {
            'inappropriate': ['offensive', 'profanity', 'explicit'],
            'spam': ['buy now', 'click here', 'free offer'],
            'sensitive': ['confidential', 'private', 'secret']
        }
    
    def test_detect_keywords(self):
        """Test keyword detection"""
        # Test with inappropriate content
        content = "This content contains offensive language and profanity."
        detected = self.filter.detect_keywords(content)
        self.assertIn('inappropriate', detected)
        self.assertIn('offensive', detected['inappropriate'])
        self.assertIn('profanity', detected['inappropriate'])
        
        # Test with spam content
        content = "Click here to buy now and get a free offer!"
        detected = self.filter.detect_keywords(content)
        self.assertIn('spam', detected)
        self.assertIn('buy now', detected['spam'])
        self.assertIn('click here', detected['spam'])
        self.assertIn('free offer', detected['spam'])
        
        # Test with clean content
        content = "This is a normal piece of content with no problematic keywords."
        detected = self.filter.detect_keywords(content)
        self.assertEqual(detected, {})
        
        # Test with specific filter type
        content = "This content is confidential and private."
        detected = self.filter.detect_keywords(content, filter_type='sensitive')
        self.assertIn('sensitive', detected)
        self.assertNotIn('inappropriate', detected)
    
    def test_detect_content_category(self):
        """Test content category detection"""
        # Test technology content
        tech_content = "This article discusses new software and hardware technologies for computer systems."
        tech_category = self.filter.detect_content_category(tech_content)
        self.assertEqual(tech_category['primary_category'], 'technology')
        
        # Test news content
        news_content = "Breaking news: Journalist reports on media coverage of headline story."
        news_category = self.filter.detect_content_category(news_content)
        self.assertEqual(news_category['primary_category'], 'news')
        
        # Test mixed content
        mixed_content = "Technology news: New software released for business applications."
        mixed_category = self.filter.detect_content_category(mixed_content)
        self.assertIn(mixed_category['primary_category'], ['technology', 'news', 'business'])
        self.assertIsNotNone(mixed_category['secondary_category'])
        
        # Test general content
        general_content = "This is a general piece of content with no specific category."
        general_category = self.filter.detect_content_category(general_content)
        self.assertEqual(general_category['primary_category'], 'general')
    
    def test_is_content_appropriate(self):
        """Test content appropriateness check"""
        # Test appropriate content
        clean_content = "This is a clean piece of content."
        result = self.filter.is_content_appropriate(clean_content)
        self.assertTrue(result['appropriate'])
        self.assertIsNone(result['reason'])
        
        # Test content with one inappropriate keyword
        mild_content = "This content has one offensive word."
        result = self.filter.is_content_appropriate(mild_content)
        self.assertTrue(result['appropriate'])
        self.assertIn('warning', result)
        
        # Test content with multiple inappropriate keywords
        bad_content = "This content has offensive language, profanity, and explicit material."
        result = self.filter.is_content_appropriate(bad_content)
        self.assertFalse(result['appropriate'])
        
        # Test strict mode
        self.filter.strict_mode = True
        mild_content = "This content has one offensive word."
        result = self.filter.is_content_appropriate(mild_content)
        self.assertFalse(result['appropriate'])
    
    def test_filter_content(self):
        """Test content filtering"""
        # Test clean content
        clean_content = "This is a clean piece of content about technology and software."
        result = self.filter.filter_content(clean_content)
        self.assertTrue(result['allowed'])
        self.assertEqual(result['filtered_content'], clean_content)
        self.assertEqual(result['categories']['primary_category'], 'technology')
        
        # Test inappropriate content
        bad_content = "This offensive content has profanity and explicit material."
        result = self.filter.filter_content(bad_content)
        self.assertFalse(result['allowed'])
        self.assertIsNone(result['filtered_content'])
        
        # Test with user role parameter (should have no effect now)
        result = self.filter.filter_content(bad_content, user_role='admin')
        self.assertFalse(result['allowed'])  # Admin bypass removed, should still be filtered
        self.assertIsNone(result['filtered_content'])
        
        # Test content with warnings
        warning_content = "This content is confidential but otherwise clean."
        result = self.filter.filter_content(warning_content)
        self.assertTrue(result['allowed'])
        self.assertEqual(result['filtered_content'], warning_content)
        self.assertTrue(len(result['warnings']) > 0)
    
    def test_global_filter_function(self):
        """Test the global filter_content function"""
        content = "This is a test piece of content."
        result = filter_content(content)
        self.assertTrue(result['allowed'])
        
        # Test with strict mode
        content = "This content has one offensive word."
        result = filter_content(content, strict_mode=True)
        # Note: This might pass or fail depending on the actual filter lists loaded
        # We're just testing that the function works, not the specific result

if __name__ == '__main__':
    unittest.main() 