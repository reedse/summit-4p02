import unittest
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import the content_processor module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from content_processor import (
    strip_html,
    sanitize_html,
    normalize_content,
    extract_metadata,
    preprocess_for_gemini,
    process_content
)

class TestContentProcessor(unittest.TestCase):
    
    def test_strip_html(self):
        """Test stripping HTML tags while preserving structure"""
        html_content = """
        <div>
            <h1>Test Heading</h1>
            <p>This is a paragraph with <strong>bold</strong> text.</p>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
        </div>
        """
        expected_content = "Test Heading\n\nThis is a paragraph with bold text.\n\n• Item 1\n• Item 2"
        result = strip_html(html_content)
        # Remove extra whitespace for comparison
        result = ' '.join(result.split())
        expected_content = ' '.join(expected_content.split())
        self.assertEqual(result, expected_content)
    
    def test_sanitize_html(self):
        """Test sanitizing HTML content"""
        malicious_html = """
        <div>
            <p>Normal text</p>
            <script>alert('XSS');</script>
            <p onclick="malicious()">Click me</p>
            <iframe src="evil.com"></iframe>
        </div>
        """
        sanitized = sanitize_html(malicious_html)
        self.assertNotIn("<script>", sanitized)
        self.assertNotIn("<iframe", sanitized)
        self.assertNotIn("onclick", sanitized)
        self.assertIn("<p>Normal text</p>", sanitized)
    
    def test_normalize_content(self):
        """Test normalizing content"""
        content = "This   has  extra   spaces and \"fancy\" quotes and an ellipsis…"
        normalized = normalize_content(content)
        self.assertEqual(normalized, 'This has extra spaces and "fancy" quotes and an ellipsis...')
    
    def test_extract_metadata(self):
        """Test extracting metadata from content"""
        content = "This is a test content with some keywords like artificial intelligence and machine learning. " * 20
        metadata = extract_metadata(content)
        self.assertIn("word_count", metadata)
        self.assertIn("estimated_reading_time", metadata)
        self.assertIn("keywords", metadata)
        self.assertTrue(metadata["word_count"] > 0)
        self.assertTrue(metadata["estimated_reading_time"] > 0)
        self.assertTrue(len(metadata["keywords"]) > 0)
    
    def test_preprocess_for_gemini(self):
        """Test preprocessing content for Gemini API"""
        # Test content truncation
        long_content = "This is a test sentence. " * 1000
        preprocessed = preprocess_for_gemini(long_content, max_length=100)
        self.assertTrue(len(preprocessed) <= 100)
        
        # Test that it ends with a complete sentence when possible
        self.assertTrue(preprocessed.endswith('.'))
    
    def test_process_content_with_text(self):
        """Test processing plain text content"""
        input_data = {
            "content": "This is a test content for processing.",
            "is_html": False
        }
        result = process_content(input_data)
        self.assertTrue(result["success"])
        self.assertEqual(result["content"], "This is a test content for processing.")
        self.assertIn("metadata", result)
    
    def test_process_content_with_html(self):
        """Test processing HTML content"""
        input_data = {
            "content": "<p>This is a <strong>test</strong> content for processing.</p>",
            "is_html": True
        }
        result = process_content(input_data)
        self.assertTrue(result["success"])
        self.assertEqual(result["content"], "This is a test content for processing.")
        self.assertIn("metadata", result)
    
    def test_process_content_empty(self):
        """Test processing empty content"""
        input_data = {
            "content": "",
            "is_html": False
        }
        result = process_content(input_data)
        self.assertFalse(result["success"])
        self.assertEqual(result["error"], "No content or URL provided")

if __name__ == '__main__':
    unittest.main() 