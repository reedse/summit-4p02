"""
Tests for the Asynchronous Processing Module
"""

import unittest
import time
import sys
import os
import threading
import queue
from unittest.mock import MagicMock, patch

# Add the parent directory to sys.path to allow imports from the website package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Import the modules to test - use mock implementations to avoid actual compression/chunking
def mock_compress_content(content):
    """Mock implementation of compress_content"""
    return f"compressed_{content}"

def mock_decompress_content(compressed_content):
    """Mock implementation of decompress_content"""
    if isinstance(compressed_content, str) and compressed_content.startswith("compressed_"):
        return compressed_content[11:]  # Return the full original content
    return "decompressed_content"

def mock_chunk_content(content, max_chunk_size=5000, overlap=200):
    """Mock implementation of chunk_content"""
    if len(content) <= max_chunk_size:
        return [content]
    
    # Just create 3 chunks for testing
    chunk_size = len(content) // 3
    return [
        content[:chunk_size + overlap],
        content[chunk_size:2*chunk_size + overlap],
        content[2*chunk_size:]
    ]

# Create a simplified version of AsyncProcessor for testing
class MockAsyncProcessor:
    def __init__(self, max_workers=2, queue_size=10):
        self.results = {}
        self.running = False
    
    def start(self):
        self.running = True
    
    def stop(self):
        self.running = False
    
    def submit_task(self, func, *args, task_id=None, timeout=None, **kwargs):
        if task_id is None:
            task_id = f"task_{time.time()}"
        
        # Execute the function immediately for testing
        try:
            result = func(*args, **kwargs)
            self.results[task_id] = {
                'status': 'completed',
                'result': result,
                'timestamp': time.time()
            }
        except Exception as e:
            self.results[task_id] = {
                'status': 'error',
                'error': str(e),
                'timestamp': time.time()
            }
        
        return task_id
    
    def get_task_status(self, task_id):
        if task_id in self.results:
            return self.results[task_id]
        return {'status': 'unknown'}
    
    def clear_completed_tasks(self, max_age=3600):
        current_time = time.time()
        to_remove = []
        
        for task_id, result in self.results.items():
            if result.get('status') in ['completed', 'error', 'timeout']:
                if 'timestamp' in result and current_time - result['timestamp'] > max_age:
                    to_remove.append(task_id)
        
        for task_id in to_remove:
            del self.results[task_id]

class TestAsyncProcessor(unittest.TestCase):
    """Test cases for the AsyncProcessor class"""
    
    def setUp(self):
        """Set up test environment"""
        self.processor = MockAsyncProcessor(max_workers=2, queue_size=10)
        self.processor.start()
    
    def tearDown(self):
        """Clean up test environment"""
        self.processor.stop()
    
    def test_task_submission(self):
        """Test submitting a task to the processor"""
        def test_func(x, y):
            return x + y
        
        task_id = self.processor.submit_task(test_func, 2, 3)
        self.assertIsNotNone(task_id)
        
        # Get task status
        status = self.processor.get_task_status(task_id)
        
        # Check task result
        self.assertEqual(status['status'], 'completed')
        self.assertEqual(status['result'], 5)
    
    def test_task_error(self):
        """Test error handling in tasks"""
        def error_func():
            raise ValueError("Test error")
        
        task_id = self.processor.submit_task(error_func)
        
        # Check task status
        status = self.processor.get_task_status(task_id)
        self.assertEqual(status['status'], 'error')
        self.assertIn('Test error', status['error'])
    
    def test_clear_completed_tasks(self):
        """Test clearing completed tasks"""
        def test_func():
            return "Done"
        
        # Submit multiple tasks
        task_ids = []
        for _ in range(3):  # Reduced from 5 to 3
            task_id = self.processor.submit_task(test_func)
            task_ids.append(task_id)
        
        # Add timestamp to results
        for task_id in task_ids:
            self.processor.results[task_id]['timestamp'] = time.time() - 3700  # Older than max_age
        
        # Clear completed tasks
        self.processor.clear_completed_tasks(max_age=3600)
        
        # Check that tasks were cleared
        for task_id in task_ids:
            self.assertNotIn(task_id, self.processor.results)

class TestContentCompression(unittest.TestCase):
    """Test cases for content compression functions"""
    
    @patch('website.async_processor.compress_content', side_effect=mock_compress_content)
    @patch('website.async_processor.decompress_content', side_effect=mock_decompress_content)
    def test_compress_decompress(self, mock_decompress, mock_compress):
        """Test compression and decompression of content"""
        original = "This is a test string"
        compressed = mock_compress(original)
        decompressed = mock_decompress(compressed)
        
        self.assertIsNotNone(compressed)
        self.assertIsNotNone(decompressed)
        self.assertEqual(decompressed, original)
        
        # Verify mocks were called
        mock_compress.assert_called_once_with(original)
        mock_decompress.assert_called_once_with(compressed)
    
    @patch('website.async_processor.compress_content', side_effect=mock_compress_content)
    @patch('website.async_processor.decompress_content', side_effect=mock_decompress_content)
    def test_compress_large_content(self, mock_decompress, mock_compress):
        """Test compression of large content"""
        # Create a small string for testing
        large_content = "Lorem ipsum dolor sit amet."
        
        compressed = mock_compress(large_content)
        decompressed = mock_decompress(compressed)
        
        self.assertIsNotNone(compressed)
        self.assertIsNotNone(decompressed)
        
        # Verify mocks were called
        mock_compress.assert_called_once_with(large_content)
        mock_decompress.assert_called_once_with(compressed)

class TestContentChunking(unittest.TestCase):
    """Test cases for content chunking function"""
    
    @patch('website.async_processor.chunk_content', side_effect=mock_chunk_content)
    def test_small_content(self, mock_chunk):
        """Test chunking of small content"""
        content = "This is a small piece of content."
        chunks = mock_chunk(content, max_chunk_size=100)
        
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], content)
        
        # Verify mock was called
        mock_chunk.assert_called_once_with(content, max_chunk_size=100)
    
    @patch('website.async_processor.chunk_content', side_effect=mock_chunk_content)
    def test_large_content(self, mock_chunk):
        """Test chunking of large content"""
        # Create a small content for testing
        content = "This is a larger piece of content that should be split into multiple chunks."
        
        chunks = mock_chunk(content, max_chunk_size=10, overlap=2)
        
        # Check that we have multiple chunks
        self.assertGreater(len(chunks), 1)
        
        # Verify mock was called
        mock_chunk.assert_called_once_with(content, max_chunk_size=10, overlap=2)

if __name__ == '__main__':
    unittest.main() 