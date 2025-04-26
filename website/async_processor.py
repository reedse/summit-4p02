"""
Asynchronous Processing Module for AI Summary Feature

This module provides functionality for asynchronous processing of batch requests,
allowing for improved performance and responsiveness in the AI Summary feature.
"""

import asyncio
import threading
import queue
import time
import logging
import json
import hashlib
import gzip
import base64
from concurrent.futures import ThreadPoolExecutor
from functools import partial

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AsyncProcessor:
    """
    Asynchronous processor for handling batch requests and long-running operations
    """
    
    def __init__(self, max_workers=4, queue_size=100):
        """
        Initialize the async processor
        
        Args:
            max_workers (int): Maximum number of worker threads
            queue_size (int): Maximum size of the processing queue
        """
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.task_queue = queue.Queue(maxsize=queue_size)
        self.results = {}
        self.running = False
        self.worker_thread = None
        self.timeout = 60  # Default timeout in seconds
        
    def start(self):
        """Start the async processor worker thread"""
        if not self.running:
            self.running = True
            self.worker_thread = threading.Thread(target=self._process_queue)
            self.worker_thread.daemon = True
            self.worker_thread.start()
            logger.info("Async processor started")
            
    def stop(self):
        """Stop the async processor worker thread"""
        if self.running:
            self.running = False
            if self.worker_thread:
                self.worker_thread.join(timeout=5)
            self.executor.shutdown(wait=False)
            logger.info("Async processor stopped")
    
    def _process_queue(self):
        """Process tasks from the queue"""
        while self.running:
            try:
                # Get a task from the queue with a timeout
                task_id, func, args, kwargs, timeout = self.task_queue.get(timeout=1)
                
                # Submit the task to the executor
                future = self.executor.submit(func, *args, **kwargs)
                
                # Set a timeout for the task
                start_time = time.time()
                while not future.done():
                    if time.time() - start_time > timeout:
                        logger.warning(f"Task {task_id} timed out after {timeout} seconds")
                        self.results[task_id] = {
                            'status': 'timeout',
                            'error': f'Task timed out after {timeout} seconds'
                        }
                        break
                    time.sleep(0.1)
                
                # Get the result if the task completed
                if future.done():
                    try:
                        result = future.result()
                        self.results[task_id] = {
                            'status': 'completed',
                            'result': result
                        }
                    except Exception as e:
                        logger.error(f"Task {task_id} failed: {str(e)}")
                        self.results[task_id] = {
                            'status': 'error',
                            'error': str(e)
                        }
                
                # Mark the task as done
                self.task_queue.task_done()
                
            except queue.Empty:
                # No tasks in the queue, just continue
                continue
            except Exception as e:
                logger.error(f"Error in async processor: {str(e)}")
    
    def submit_task(self, func, *args, task_id=None, timeout=None, **kwargs):
        """
        Submit a task for asynchronous processing
        
        Args:
            func (callable): Function to execute
            *args: Arguments to pass to the function
            task_id (str, optional): Task ID for tracking
            timeout (int, optional): Timeout in seconds
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            str: Task ID for tracking the task
        """
        # Generate a task ID if not provided
        if task_id is None:
            task_id = hashlib.md5(f"{func.__name__}:{time.time()}".encode()).hexdigest()
        
        # Use default timeout if not specified
        if timeout is None:
            timeout = self.timeout
        
        # Add the task to the queue
        try:
            self.task_queue.put((task_id, func, args, kwargs, timeout), block=False)
            self.results[task_id] = {'status': 'pending'}
            logger.info(f"Task {task_id} submitted")
            return task_id
        except queue.Full:
            logger.error("Task queue is full")
            raise RuntimeError("Task queue is full")
    
    def get_task_status(self, task_id):
        """
        Get the status of a task
        
        Args:
            task_id (str): Task ID to check
            
        Returns:
            dict: Task status information
        """
        if task_id in self.results:
            return self.results[task_id]
        return {'status': 'unknown'}
    
    def clear_completed_tasks(self, max_age=3600):
        """
        Clear completed tasks from the results dictionary
        
        Args:
            max_age (int): Maximum age of completed tasks in seconds
        """
        current_time = time.time()
        to_remove = []
        
        for task_id, result in self.results.items():
            if result.get('status') in ['completed', 'error', 'timeout']:
                if 'timestamp' in result and current_time - result['timestamp'] > max_age:
                    to_remove.append(task_id)
        
        for task_id in to_remove:
            del self.results[task_id]
            
        logger.info(f"Cleared {len(to_remove)} completed tasks")

def compress_content(content):
    """
    Compress content using gzip
    
    Args:
        content (str): Content to compress
        
    Returns:
        str: Base64-encoded compressed content
    """
    try:
        # Convert string to bytes
        content_bytes = content.encode('utf-8')
        
        # Compress using gzip
        compressed = gzip.compress(content_bytes)
        
        # Encode as base64 for safe storage/transmission
        encoded = base64.b64encode(compressed).decode('ascii')
        
        # Calculate compression ratio
        original_size = len(content_bytes)
        compressed_size = len(compressed)
        ratio = (original_size - compressed_size) / original_size * 100
        
        logger.info(f"Compressed content: {original_size} bytes -> {compressed_size} bytes ({ratio:.2f}% reduction)")
        
        return encoded
    except Exception as e:
        logger.error(f"Compression error: {str(e)}")
        return None

def decompress_content(compressed_content):
    """
    Decompress content compressed with gzip
    
    Args:
        compressed_content (str): Base64-encoded compressed content
        
    Returns:
        str: Decompressed content
    """
    try:
        # Decode base64
        decoded = base64.b64decode(compressed_content)
        
        # Decompress gzip
        decompressed = gzip.decompress(decoded)
        
        # Convert bytes to string
        return decompressed.decode('utf-8')
    except Exception as e:
        logger.error(f"Decompression error: {str(e)}")
        return None

def chunk_content(content, max_chunk_size=5000, overlap=200):
    """
    Split content into chunks for processing
    
    Args:
        content (str): Content to chunk
        max_chunk_size (int): Maximum chunk size in characters
        overlap (int): Overlap between chunks in characters
        
    Returns:
        list: List of content chunks
    """
    if len(content) <= max_chunk_size:
        return [content]
    
    chunks = []
    start = 0
    
    while start < len(content):
        # Calculate end position
        end = min(start + max_chunk_size, len(content))
        
        # Try to find a sentence boundary for cleaner chunks
        if end < len(content):
            # Look for sentence boundaries (., !, ?)
            for boundary in ['. ', '! ', '? ']:
                boundary_pos = content.rfind(boundary, start, end)
                if boundary_pos > start + max_chunk_size * 0.5:  # Ensure chunk is at least half the max size
                    end = boundary_pos + 2  # Include the boundary characters
                    break
        
        # Add the chunk
        chunks.append(content[start:end])
        
        # Move to next chunk with overlap
        start = end - overlap
    
    logger.info(f"Split content into {len(chunks)} chunks")
    return chunks

# Create a global instance
async_processor = AsyncProcessor()
async_processor.start() 