"""
Content Processing Module for AI Summary Feature

This module provides functionality for extracting, preprocessing, and sanitizing content
from various sources before sending it to the Gemini API for summarization.
"""

import re
import html
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import json
import hashlib
from html.parser import HTMLParser
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLStripper(HTMLParser):
    """HTML Parser for stripping HTML tags while preserving structure"""
    
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
        self.in_paragraph = False
        self.in_header = False
        self.in_list_item = False
        
    def handle_starttag(self, tag, attrs):
        if tag in ['p', 'div']:
            self.in_paragraph = True
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.in_header = True
        elif tag == 'li':
            self.in_list_item = True
            self.text.append("• ")  # Add bullet for list items
        elif tag == 'br':
            self.text.append("\n")
        
    def handle_endtag(self, tag):
        if tag in ['p', 'div']:
            self.in_paragraph = False
            self.text.append("\n\n")  # Double newline after paragraphs
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.in_header = False
            self.text.append("\n\n")  # Double newline after headers
        elif tag == 'li':
            self.in_list_item = False
            self.text.append("\n")  # Newline after list items
            
    def handle_data(self, data):
        self.text.append(data)
        
    def get_text(self):
        return ''.join(self.text)

def strip_html(html_content):
    """
    Strip HTML tags while preserving document structure
    
    Args:
        html_content (str): HTML content to strip
        
    Returns:
        str: Plain text with preserved structure
    """
    stripper = MLStripper()
    stripper.feed(html_content)
    text = stripper.get_text()
    
    # Clean up excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def extract_content_from_url(url):
    """
    Extract main content from a URL
    
    Args:
        url (str): URL to extract content from
        
    Returns:
        dict: Dictionary containing extracted content and metadata
    """
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return {
                "success": False,
                "error": "Invalid URL format"
            }
        
        # Add user agent to avoid being blocked
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        # Fetch the content
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract metadata
        metadata = {
            "title": soup.title.string if soup.title else "",
            "url": url,
            "domain": parsed_url.netloc,
        }
        
        # Try to find the main content
        # First, look for article tag
        main_content = soup.find('article')
        
        # If no article tag, try common content containers
        if not main_content:
            for container in ['main', 'div[role="main"]', '.content', '#content', '.post', '.article']:
                main_content = soup.select_one(container)
                if main_content:
                    break
        
        # If still no content found, use the body
        if not main_content:
            main_content = soup.body
        
        # Remove unwanted elements
        for element in main_content.select('script, style, nav, footer, header, aside, .ads, .comments, .sidebar'):
            element.decompose()
        
        # Extract text content
        content = strip_html(str(main_content))
        
        return {
            "success": True,
            "content": content,
            "metadata": metadata
        }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching URL {url}: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to fetch URL: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Error processing URL {url}: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to process content: {str(e)}"
        }

def sanitize_html(html_content):
    """
    Sanitize HTML content to remove potentially harmful elements
    
    Args:
        html_content (str): HTML content to sanitize
        
    Returns:
        str: Sanitized HTML content
    """
    # Use BeautifulSoup to parse and clean the HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove potentially dangerous tags
    for tag in soup.find_all(['script', 'iframe', 'embed', 'object', 'style']):
        tag.decompose()
    
    # Remove on* attributes (event handlers)
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.startswith('on'):
                del tag[attr]
    
    return str(soup)

def normalize_content(content):
    """
    Normalize content by removing excessive whitespace, normalizing quotes, etc.
    
    Args:
        content (str): Content to normalize
        
    Returns:
        str: Normalized content
    """
    # Replace multiple spaces with a single space
    content = re.sub(r'\s+', ' ', content)
    
    # Normalize quotes
    content = content.replace('"', '"').replace('"', '"')
    content = content.replace(''', "'").replace(''', "'")
    
    # Normalize dashes
    content = content.replace('—', '-').replace('–', '-')
    
    # Normalize ellipses
    content = content.replace('…', '...')
    
    # Remove control characters
    content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
    
    return content.strip()

def extract_metadata(content):
    """
    Extract metadata from content such as title, keywords, etc.
    
    Args:
        content (str): Content to extract metadata from
        
    Returns:
        dict: Dictionary containing extracted metadata
    """
    # Initialize metadata dictionary
    metadata = {
        "estimated_reading_time": 0,
        "word_count": 0,
        "keywords": [],
        "language": "en",  # Default to English
    }
    
    # Count words
    words = re.findall(r'\b\w+\b', content)
    word_count = len(words)
    metadata["word_count"] = word_count
    
    # Estimate reading time (average reading speed: 200-250 words per minute)
    reading_time_minutes = word_count / 225
    metadata["estimated_reading_time"] = max(1, round(reading_time_minutes))
    
    # Extract potential keywords (most frequent words, excluding common words)
    common_words = {'the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'with', 'for', 'as', 'on', 'was', 'be', 'at'}
    word_freq = {}
    for word in words:
        word = word.lower()
        if len(word) > 3 and word not in common_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get top 10 keywords
    keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    metadata["keywords"] = [keyword for keyword, _ in keywords]
    
    return metadata

def preprocess_for_gemini(content, max_length=10000):
    """
    Preprocess content to make it compatible with Gemini API
    
    Args:
        content (str): Content to preprocess
        max_length (int): Maximum content length for Gemini API
        
    Returns:
        str: Preprocessed content
    """
    # Normalize content
    content = normalize_content(content)
    
    # Truncate if too long
    if len(content) > max_length:
        # Try to truncate at a sentence boundary
        truncated = content[:max_length]
        last_period = truncated.rfind('.')
        if last_period > max_length * 0.8:  # If we can find a good breakpoint
            content = content[:last_period + 1]
        else:
            content = truncated
    
    return content

def process_content(input_data):
    """
    Main function to process content from various sources
    
    Args:
        input_data (dict): Dictionary containing input data
            - content (str): Text content or HTML
            - url (str, optional): URL to extract content from
            - is_html (bool, optional): Whether the content is HTML
            
    Returns:
        dict: Dictionary containing processed content and metadata
    """
    try:
        result = {
            "success": False,
            "content": "",
            "metadata": {},
            "error": None
        }
        
        # Check if URL is provided
        if 'url' in input_data and input_data['url']:
            url_result = extract_content_from_url(input_data['url'])
            if url_result["success"]:
                result["content"] = url_result["content"]
                result["metadata"] = url_result["metadata"]
                result["success"] = True
            else:
                result["error"] = url_result["error"]
                return result
        
        # Process direct content input
        elif 'content' in input_data and input_data['content']:
            content = input_data['content']
            
            # Check if content is HTML
            is_html = input_data.get('is_html', False)
            if is_html:
                # Sanitize HTML first
                content = sanitize_html(content)
                # Then strip HTML tags
                content = strip_html(content)
            
            # Normalize and preprocess content
            content = preprocess_for_gemini(content)
            
            # Extract metadata
            metadata = extract_metadata(content)
            
            result["content"] = content
            result["metadata"] = metadata
            result["success"] = True
        
        else:
            result["error"] = "No content or URL provided"
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing content: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to process content: {str(e)}"
        } 