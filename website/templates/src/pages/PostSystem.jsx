import React, { useState, useEffect, useRef, Component } from 'react';
import TranslatedText from '../components/TranslatedText';

// Import API functions
import { getSavedSummaries } from '../services/api';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import {
  AccessTime as AccessTimeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  AttachFile as AttachFileIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Error as ErrorIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

import ScheduleIcon from '@mui/icons-material/Schedule';

import Tooltip from '@mui/material/Tooltip';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '../styles/theme.css';

import TwitterAuth from '../components/TwitterAuth';
import XIcon from '../components/XIcon';

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PostSystem Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            padding: 3,
            margin: 2,
            backgroundColor: '#ffebee',
            borderRadius: 1,
            border: '1px solid #f44336',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            <TranslatedText>Something went wrong in the Post System</TranslatedText>
          </Typography>
          <Typography variant="body1" paragraph>
            <TranslatedText>Please try refreshing the page. If the problem persists, contact support.</TranslatedText>
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            <TranslatedText>Refresh Page</TranslatedText>
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Wrapper component to apply the ErrorBoundary
const PostSystemWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <PostSystem />
    </ErrorBoundary>
  );
};

// Main component
const PostSystem = () => {
  // State for post content
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  
  // State for platform selection
  const [platforms, setPlatforms] = useState({
    twitter: false
  });
  
  // State for scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  
  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Twitter rate limit
  const [twitterRateLimit, setTwitterRateLimit] = useState({
    isLimited: false,
    message: '',
    resetTime: null
  });
  
  // State for alerts
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // State for post status dialog
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: '',
    content: '',
    results: null
  });

  // State for Twitter authentication
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false);
  const [twitterCredentials, setTwitterCredentials] = useState(null);

  // State for media attachments
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaError, setMediaError] = useState('');
  
  // State for saved summaries
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isFetchingSummaries, setIsFetchingSummaries] = useState(false);
  const [summariesError, setSummariesError] = useState('');
  
  // File input reference
  const fileInputRef = useRef(null);

  // Character limits for different platforms
  const characterLimits = {
    twitter: 280
  };

  // Media limits for different platforms
  const mediaLimits = {
    twitter: {
      count: 4,
      size: 5 * 1024 * 1024, // 5MB
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    }
  };

  // Function to check for past due posts and execute them automatically
  const checkAndExecutePastDuePosts = async (posts) => {
    const now = new Date();
    const pastDuePosts = posts.filter(post => 
      post.status === 'scheduled' && new Date(post.scheduled_time) < now
    );
    
    if (pastDuePosts.length > 0) {
      console.log(`Found ${pastDuePosts.length} past due posts - auto-executing`);
      
      // Execute each past due post automatically
      for (const post of pastDuePosts) {
        try {
          console.log(`Auto-executing post ${post.id}: ${post.content.substring(0, 30)}...`);
          
          // Use the correct endpoint to execute the post
          const response = await fetch(`/api/posts/execute/${post.id}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to auto-execute post ${post.id}:`, errorText);
            continue;
          }
          
          const data = await response.json();
          console.log(`Successfully auto-executed post ${post.id}:`, data);
          
          // Mark the post as executed in our local state
          setScheduledPosts(prev => prev.map(p => 
            p.id === post.id ? { ...p, status: 'completed' } : p
          ));
          
        } catch (error) {
          console.error(`Error auto-executing post ${post.id}:`, error);
        }
      }
    }
  };

  // Function to fetch scheduled posts
  const fetchScheduledPosts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching scheduled posts...');
      
      // Try to fetch data with a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/posts/scheduled', {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).catch(err => {
        console.warn('Fetch error:', err);
        return { ok: false, json: async () => ({ message: 'Network error' }) };
      });
      
      clearTimeout(timeoutId);
      
      if (!response || !response.ok) {
        console.warn('Response not OK or missing');
        // Return empty array to prevent errors but show a message
        setAlert({
          open: true,
          message: 'Could not load scheduled posts. Using local data.',
          severity: 'warning'
        });
        return [];
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Received data:', data);
      } catch (e) {
        console.error('JSON parse error:', e);
        data = { posts: [] };
      }
      
      // Process posts to ensure consistent format
      const processedPosts = (data.posts || []).map(post => ({
        ...post,
        // Ensure scheduled_time is a string
        scheduled_time: post.scheduled_time || new Date().toISOString(),
        // Ensure status has a default value
        status: post.status || 'scheduled',
        // Ensure content is a string
        content: post.content || '',
        // Ensure platforms is an array
        platforms: Array.isArray(post.platforms) ? post.platforms : ['twitter']
      }));
      
      setScheduledPosts(processedPosts);
      
      // Auto-execute any past due posts
      try {
        await checkAndExecutePastDuePosts(processedPosts);
      } catch (e) {
        console.error('Error checking past due posts:', e);
      }
      
      return processedPosts;
    } catch (error) {
      console.error('Error in fetchScheduledPosts:', error);
      setAlert({
        open: true,
        message: 'Error loading posts. Please try again.',
        severity: 'error'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle executing a scheduled post
  const handleExecuteScheduledPost = async (postId) => {
    try {
      setIsLoading(true);
      console.log(`Executing scheduled post with ID: ${postId}`);
      
      // Verify the post exists in our state
      const postToExecute = scheduledPosts.find(post => post.id === postId);
      if (!postToExecute) {
        console.error(`Post with ID ${postId} not found in local state`);
        throw new Error('Post not found');
      }
      
      console.log('Post to execute:', postToExecute);
      console.log('Twitter credentials check:', postToExecute.twitter_credentials ? 'Present' : 'Missing');
      
      // Use the correct API endpoint to execute the scheduled post
      console.log(`Sending POST request to /api/posts/execute/${postId}`);
      const response = await fetch(`/api/posts/execute/${postId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(errorText || 'Failed to execute post');
      }
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        // If can't parse JSON, use a default success message
        data = { message: 'Post executed successfully!' };
      }
      
      // Show success message
      setAlert({
        open: true,
        message: data.message || 'Post executed successfully!',
        severity: 'success'
      });
      
      // Show detailed results if available
      if (data.results) {
        console.log('Post results:', data.results);
        setStatusDialog({
          open: true,
          title: 'Post Results',
          content: 'Your post has been processed with the following results:',
          results: data.results
        });
      }
      
      // Mark the post as completed in our local state
      setScheduledPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, status: 'completed' } : post
      ));
      
      // Reset Twitter rate limit status if it was previously limited
      if (twitterRateLimit.isLimited) {
        setTwitterRateLimit({
          isLimited: false,
          message: '',
          resetTime: null
        });
      }
      
    } catch (error) {
      console.error('Error executing post:', error);
      
      // Check if the error message indicates a rate limit issue
      const errorMessage = error.message || 'Could not connect to server';
      const isRateLimitError = errorMessage.includes('rate limit') || 
                             errorMessage.includes('429') || 
                             errorMessage.includes('Too Many Requests');
      
      // Set Twitter rate limit warning if detected
      if (isRateLimitError) {
        // Calculate a reset time (default to 15 minutes from now)
        const resetTime = new Date();
        resetTime.setMinutes(resetTime.getMinutes() + 15);
        
        setTwitterRateLimit({
          isLimited: true,
          message: errorMessage,
          resetTime: resetTime
        });
        
        // Show a rate limit specific alert
        setAlert({
          open: true,
          message: 'Twitter rate limit exceeded. Please try again later.',
          severity: 'warning'
        });
      } else {
        // Regular error alert
        setAlert({
          open: true,
          message: `Error: ${errorMessage}`,
          severity: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

// Function to handle deleting a scheduled post
const handleDeleteScheduledPost = async (postId) => {
  try {
    setIsLoading(true);
    const response = await fetch(`/api/posts/scheduled/${postId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      setAlert({
        open: true,
        message: data.message || 'Post deleted successfully!',
        severity: 'success'
      });
      fetchScheduledPosts(); // Refresh the list
    } else {
      setAlert({
        open: true,
        message: data.message || 'Failed to delete post',
        severity: 'error'
      });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    setAlert({
      open: true,
      message: 'Error connecting to the server',
      severity: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};

// Initial fetch of scheduled posts and set up periodic checking
useEffect(() => {
  // Fetch scheduled posts when component mounts
  fetchScheduledPosts();
  
  // Set up interval to check for past due posts
  const checkInterval = setInterval(() => {
    fetchScheduledPosts().then(posts => {
      if (posts && posts.length > 0) {
        checkAndExecutePastDuePosts(posts);
      }
    });
  }, 60000); // Check every minute
  
  return () => {
    clearInterval(checkInterval);
  };
}, []); // Empty dependency array ensures this only runs once on mount

// Fetch saved summaries when component mounts
useEffect(() => {
  fetchSavedSummaries();
}, []);

// Function to fetch saved summaries
const fetchSavedSummaries = async () => {
  try {
    setIsFetchingSummaries(true);
    setSummariesError('');
    
    const response = await getSavedSummaries();
    
    if (response && response.success && response.summaries) {
      setSummaries(response.summaries);
    } else {
      setSummariesError('Failed to load summaries');
    }
  } catch (error) {
    console.error('Error fetching summaries:', error);
    setSummariesError('Error loading summaries: ' + (error.message || 'Unknown error'));
  } finally {
    setIsFetchingSummaries(false);
  }
};

// Function to handle selecting a summary
const handleSummarySelect = (event) => {
  const selectedId = Number(event.target.value);
  
  if (!selectedId) {
    setSelectedSummary(null);
    return;
  }
  
  const selected = summaries.find(summary => summary.id === selectedId);
  
  if (selected) {
    setSelectedSummary(selected);
    
    // Update the content with headline and summary text
    const headline = selected.headline || '';
    const summaryText = selected.summary || '';
    const combinedText = headline + '\n\n' + summaryText;
    setContent(combinedText);
    
    // Validate the content length for Twitter
    validateContent(combinedText);
  }
};

  // Function to render a scheduled post
  const renderScheduledPost = (post) => {
    const isPastDue = new Date(post.scheduled_time) < new Date();
    
    return (
      <Paper
        key={post.id}
        elevation={2}
        sx={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)',
          p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          {/* Post Content */}
          <Typography variant="body2" sx={{ 
            color: 'var(--text-primary)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {post.content}
          </Typography>
          
          {/* Post Details */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-xs)'
          }}>
            {/* Time and Platform */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              flexGrow: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 'var(--spacing-xxs)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: isPastDue ? 'var(--error)' : 'var(--text-secondary)'
              }}>
                <AccessTimeIcon sx={{ fontSize: 'inherit' }} />
                {new Date(post.scheduled_time).toLocaleString()}
                {isPastDue && post.status === 'scheduled' && ' (Past Due - Click Post Now)'}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <TwitterIcon sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  color: 'var(--secondary)'
                }} />
              </Box>
            </Box>
            
            {/* Status and Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)'
            }}>
              <Typography variant="caption" sx={{ 
                color: 'var(--text-secondary)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {post.status === 'scheduled' ? 'Scheduled' : post.status}
              </Typography>
              {post.status === 'scheduled' && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleExecuteScheduledPost(post.id)}
                    disabled={isLoading}
                    sx={{
                      background: 'var(--primary)',
                      color: 'var(--text-primary)',
                      minWidth: 0,
                      p: '2px 6px',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      minHeight: 0,
                      '&:hover': { background: 'var(--primary-light)' }
                    }}
                  >
                    <TranslatedText>Post Now</TranslatedText>
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteScheduledPost(post.id)}
                    disabled={isLoading}
                    sx={{
                      color: 'var(--text-secondary)',
                      p: '2px',
                      '&:hover': { color: 'var(--error)' }
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Handle platform selection change
  const handlePlatformChange = (event) => {
    // If trying to select Twitter but not authenticated
    if (event.target.name === 'twitter' && event.target.checked && !isTwitterAuthenticated) {
      setAlert({
        open: true,
        message: 'Please connect your Twitter account first',
        severity: 'warning'
      });
      return;
    }
    
    setPlatforms({
      ...platforms,
      [event.target.name]: event.target.checked
    });
    validateContent(content);
  };

  // Handle content change
  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setContent(newContent);
    validateContent(newContent);
  };

  // Validate content against platform rules
  const validateContent = (text) => {
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    if (selectedPlatforms.length === 0) {
      setContentError('');
      return true;
    }
    
    // Check character limits for each selected platform
    const errors = [];
    
    for (const platform of selectedPlatforms) {
      const limit = characterLimits[platform];
      if (text.length > limit) {
        errors.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)} has a ${limit} character limit (${text.length}/${limit})`);
      }
    }
    
    if (errors.length > 0) {
      setContentError(errors.join('. '));
      return false;
    } else {
      setContentError('');
      return true;
    }
  };

  // Handle Twitter authentication status change
  const handleTwitterAuthStatusChange = (status, credentials) => {
    setIsTwitterAuthenticated(status);
    setTwitterCredentials(credentials);
    
    // If Twitter is deauthenticated, deselect it from platforms
    if (!status && platforms.twitter) {
      setPlatforms({
        ...platforms,
        twitter: false
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validate files
    const validationError = validateFiles(files);
    if (validationError) {
      setMediaError(validationError);
      return;
    }
    
    // Create file objects with preview URLs
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file removal
  const handleFileRemove = (index) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  // Validate files against platform rules
  const validateFiles = (files) => {
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    if (selectedPlatforms.length === 0) {
      return null;
    }
    
    // Get the most restrictive limits from selected platforms
    let maxCount = Math.min(...selectedPlatforms.map(p => mediaLimits[p].count));
    let maxSize = Math.min(...selectedPlatforms.map(p => mediaLimits[p].size));
    let allowedTypes = selectedPlatforms.reduce((types, platform) => {
      return types.filter(type => mediaLimits[platform].types.includes(type));
    }, [...new Set(selectedPlatforms.flatMap(p => mediaLimits[p].types))]);
    
    // Check if adding these files would exceed the count limit
    if (mediaFiles.length + files.length > maxCount) {
      return `You can only attach up to ${maxCount} files for the selected platforms`;
    }
    
    // Check file sizes and types
    for (const file of files) {
      if (file.size > maxSize) {
        return `File "${file.name}" exceeds the maximum size limit (${Math.round(maxSize / (1024 * 1024))}MB)`;
      }
      
      if (!allowedTypes.includes(file.type)) {
        return `File type "${file.type}" is not supported by all selected platforms`;
      }
    }
    
    return null;
  };

  // Function to auto-truncate content to fit Twitter's character limit
  const handleAutoTruncate = () => {
    if (!platforms.twitter || content.length <= characterLimits.twitter) return;
    
    // Truncate the content to fit Twitter's character limit
    const truncatedContent = content.substring(0, characterLimits.twitter - 3) + '...';
    setContent(truncatedContent);
    validateContent(truncatedContent);
    
    // Show a notification
    setAlert({
      open: true,
      message: 'Content has been truncated to fit Twitter\'s character limit',
      severity: 'info'
    });
  };

  // Handle post submission
  const handlePost = async () => {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Check if Twitter is selected but not authenticated
    if (platforms.twitter && !isTwitterAuthenticated) {
      setAlert({
        open: true,
        message: 'Please connect your Twitter account before posting',
        severity: 'error'
      });
      return;
    }
    
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    try {
      setIsLoading(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      
      if (platforms.twitter) {
        formData.append('twitter_credentials', JSON.stringify(twitterCredentials));
      }
      
      // Add media files
      mediaFiles.forEach((mediaItem, index) => {
        formData.append(`media_${index}`, mediaItem.file);
      });
      
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          open: true,
          message: 'Post published successfully!',
          severity: 'success'
        });
        setContent('');
        setMediaFiles([]);
        setSelectedSummary(null);
        
        // Show detailed results if available
        if (data.results) {
          console.log('Post results:', data.results);
          setStatusDialog({
            open: true,
            title: 'Post Results',
            content: 'Your post has been processed with the following results:',
            results: data.results
          });
        }
        
        // Reset Twitter rate limit status if it was previously limited
        if (twitterRateLimit.isLimited) {
          setTwitterRateLimit({
            isLimited: false,
            message: '',
            resetTime: null
          });
        }
      } else {
        // Check if the error is related to Twitter rate limits
        const isRateLimitError = data.error && (
          data.error.includes('rate limit') || 
          data.error.includes('429') || 
          data.error.includes('Too Many Requests')
        );
        
        // For Twitter rate limit errors, set the rate limit state
        if (isRateLimitError && platforms.twitter) {
          // Extract reset time if available (default to 15 minutes from now)
          const resetTime = new Date();
          resetTime.setMinutes(resetTime.getMinutes() + 15);
          
          setTwitterRateLimit({
            isLimited: true,
            message: data.error,
            resetTime: resetTime
          });
          
          // Show a rate limit specific alert
          setAlert({
            open: true,
            message: 'Twitter rate limit exceeded. Please try again later.',
            severity: 'warning'
          });
        } else {
          // Regular error alert
          setAlert({
            open: true,
            message: data.error || 'Failed to publish post',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
      console.error('Error publishing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scheduling a post
  const handleSchedulePost = async () => {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Check if Twitter is selected but not authenticated
    if (platforms.twitter && !isTwitterAuthenticated) {
      setAlert({
        open: true,
        message: 'Please connect your Twitter account before scheduling',
        severity: 'error'
      });
      return;
    }
    
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    try {
      setIsLoading(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      formData.append('scheduled_time', scheduledTime.toISOString());
      
      if (platforms.twitter) {
        formData.append('twitter_credentials', JSON.stringify(twitterCredentials));
      }
      
      // Add media files
      mediaFiles.forEach((mediaItem, index) => {
        formData.append(`media_${index}`, mediaItem.file);
      });
      
      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          open: true,
          message: 'Post scheduled successfully!',
          severity: 'success'
        });
        setContent('');
        setMediaFiles([]);
        setIsScheduling(false);
        setSelectedSummary(null);
        fetchScheduledPosts(); // Refresh the list
      } else {
        setAlert({
          open: true,
          message: data.error || 'Failed to schedule post',
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
      console.error('Error scheduling post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate all inputs before submission
  const validateInputs = () => {
    // Check if content is provided
    if (!content.trim() && mediaFiles.length === 0) {
      setAlert({
        open: true,
        message: 'Please enter some content or attach media for your post',
        severity: 'error'
      });
      return false;
    }
    
    // Check if at least one platform is selected
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (selectedPlatforms.length === 0) {
      setAlert({
        open: true,
        message: 'Please select at least one platform',
        severity: 'error'
      });
      return false;
    }
    
    // Validate Twitter authentication
    if (platforms.twitter && !isTwitterAuthenticated) {
      setAlert({
        open: true,
        message: 'Please authenticate your Twitter account before posting',
        severity: 'error'
      });
      return false;
    }
    
    // Validate content against character limits for Twitter
    if (platforms.twitter && content.length > characterLimits.twitter) {
      setAlert({
        open: true,
        message: `Your content exceeds Twitter's ${characterLimits.twitter} character limit by ${content.length - characterLimits.twitter} characters. Please edit your content or use the Auto-Truncate feature.`,
        severity: 'error'
      });
      return false;
    }
    
    // Validate content against platform rules for other platforms
    if (content.trim() && !validateContent(content)) {
      setAlert({
        open: true,
        message: contentError,
        severity: 'error'
      });
      return false;
    }
    
    // Validate media files
    const mediaValidationError = validateFiles([]);
    if (mediaValidationError) {
      setAlert({
        open: true,
        message: mediaValidationError,
        severity: 'error'
      });
      return false;
    }
    
    return true;
  };

  // Show alert message
  const showAlert = (message, severity = 'info') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // Handle closing the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Handle closing the status dialog
  const handleCloseStatusDialog = () => {
    setStatusDialog({
      ...statusDialog,
      open: false
    });
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return <XIcon />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Component rendered

  return (
    <>
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--bg-primary)',
        position: 'relative',
        boxSizing: 'border-box',
        pt: { xs: 'var(--spacing-xl)', sm: 'calc(var(--spacing-xl) + var(--spacing-md))' },
        pb: { xs: 'var(--spacing-lg)', sm: 'var(--spacing-xl)' },
        px: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' }
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' }
        }}>
          {/* X (Twitter) Authentication Section */}
          <Paper elevation={3} sx={{
            borderRadius: '8px',
            background: '#ffffff',
            color: '#333333',
            overflow: 'hidden',
            mt: { xs: 1, sm: 2 },
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <Box sx={{
                p: { xs: 1, sm: 2 },
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <XIcon sx={{ fontSize: 20, color: '#000000' }} />
                <Typography variant="subtitle1" sx={{
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  <TranslatedText>X Authentication</TranslatedText>
                </Typography>
              </Box>
              
              {/* Content */}
              <Box sx={{ 
                p: { xs: 2, sm: 3 },
                backgroundColor: '#f9f9f9'
              }}>
                <TwitterAuth onAuthStatusChange={handleTwitterAuthStatusChange} />
              </Box>
            </Box>
          </Paper>
          
          {/* Main Content Section */}
          <Paper elevation={6} sx={{
            p: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' },
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h4" gutterBottom className="heading-primary" sx={{ 
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              <TranslatedText>Social Media Post System</TranslatedText>
            </Typography>
            <Typography variant="body1" gutterBottom className="text-secondary" sx={{ 
              textAlign: 'center', 
              mb: 'var(--spacing-xl)',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              <TranslatedText>Create, schedule, and manage your social media posts across multiple platforms.</TranslatedText>
            </Typography>
            
            {/* Twitter Rate Limit Warning Banner */}
            {twitterRateLimit.isLimited && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 'var(--spacing-md)', 
                  borderRadius: 'var(--border-radius-md)',
                  border: '2px solid #ff9800',
                  backgroundColor: '#fff3e0',
                  '& .MuiAlert-icon': {
                    color: '#ff9800'
                  }
                }}
              >
                <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <TranslatedText>Twitter Rate Limit Exceeded</TranslatedText>
                </AlertTitle>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  <TranslatedText>Your Twitter account has reached its API rate limit.</TranslatedText>
                  {twitterRateLimit.resetTime && (
                    <>Try again after <strong>{twitterRateLimit.resetTime.toLocaleTimeString()}</strong>.</>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#d32f2f' }}>
                  <TranslatedText>Error:</TranslatedText> {twitterRateLimit.message}
                </Typography>
              </Alert>
            )}
        
        {/* Content input */}
        <Box sx={{ mb: 'var(--spacing-md)' }}>
          {/* Summary Selection Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="summary-select-label">
              <TranslatedText>Select a saved summary</TranslatedText>
            </InputLabel>
            <Select
              labelId="summary-select-label"
              id="summary-select"
              value={selectedSummary ? Number(selectedSummary.id) : ''}
              onChange={handleSummarySelect}
              label={<TranslatedText>Select a saved summary</TranslatedText>}
              disabled={isFetchingSummaries}
              sx={{
                '& .MuiInputBase-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--border-color)' },
                  '&:hover fieldset': { borderColor: 'var(--primary)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                }
              }}
            >
              <MenuItem value="">
                <em><TranslatedText>None</TranslatedText></em>
              </MenuItem>
              {summaries.map((summary) => (
                <MenuItem key={summary.id} value={summary.id}>
                  {summary.headline || <TranslatedText>Untitled Summary</TranslatedText>}
                </MenuItem>
              ))}
            </Select>
            {isFetchingSummaries && <LinearProgress />}
            {summariesError && (
              <Typography variant="caption" color="error">
                {summariesError}
              </Typography>
            )}
          </FormControl>
          
          {/* Content Textarea with Character Count */}
          <TextField
            multiline
            minRows={4}
            maxRows={6}
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            fullWidth
            error={Boolean(contentError)}
            helperText={contentError}
            InputProps={{
              endAdornment: platforms.twitter && (
                <InputAdornment position="end">
                  <Box 
                    sx={{ 
                      width: 35, 
                      height: 35, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: content.length > characterLimits.twitter 
                        ? 'error.main' 
                        : content.length > characterLimits.twitter * 0.9 
                        ? 'warning.main' 
                        : 'success.main',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  >
                    {characterLimits.twitter - content.length}
                  </Box>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                color: 'var(--text-primary)',
                '& fieldset': { borderColor: 'var(--border-color)' },
                '&:hover fieldset': { borderColor: 'var(--primary)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                '&.Mui-error fieldset': { borderColor: 'var(--error)' }
              },
              '& .MuiInputLabel-root': {
                color: 'var(--text-secondary)',
                '&.Mui-focused': { color: 'var(--primary)' }
              }
            }}
          />
          
          {/* Character Count Display */}
          {platforms.twitter && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              mt: 1, 
              mb: 2 
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: content.length > characterLimits.twitter ? 'bold' : 'normal',
                  color: content.length > characterLimits.twitter 
                    ? 'error.main' 
                    : content.length > characterLimits.twitter * 0.9 
                    ? 'warning.main' 
                    : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {content.length > characterLimits.twitter && (
                  <ErrorIcon color="error" fontSize="small" />
                )}
                <TranslatedText>Character count:</TranslatedText> 
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {content.length}
                </Box> 
                / 
                <Box component="span">
                  {characterLimits.twitter}
                </Box>
                {content.length > characterLimits.twitter && (
                  <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold', ml: 1 }}>
                    (<TranslatedText>Exceeds limit by</TranslatedText> {content.length - characterLimits.twitter} <TranslatedText>characters</TranslatedText>)
                  </Box>
                )}
              </Typography>
            </Box>
          )}
          
          {/* Tips for Twitter Posts */}
          {platforms.twitter && (
            <Paper sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'info.contrastText', display: 'block' }}>
                    <TranslatedText>Twitter Post Tips:</TranslatedText>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.contrastText', display: 'block' }}>
                    <TranslatedText>• Keep it concise, remember the 280 character limit</TranslatedText>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.contrastText', display: 'block' }}>
                    <TranslatedText>• Use hashtags sparingly for better reach</TranslatedText>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.contrastText', display: 'block' }}>
                    <TranslatedText>• Consider adding media to increase engagement</TranslatedText>
                  </Typography>
                </Box>
                
                {/* Auto-truncate button */}
                {platforms.twitter && content.length > characterLimits.twitter && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="warning"
                    onClick={handleAutoTruncate}
                    sx={{ mt: 1, fontSize: '0.75rem' }}
                  >
                    <TranslatedText>Auto-Truncate</TranslatedText>
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Box>
        
        {/* Media attachments section */}
        <Box sx={{ mt: 'var(--spacing-md)', mb: 'var(--spacing-md)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-primary)' }}>
            <TranslatedText>Media Attachments</TranslatedText>
          </Typography>
          
          {mediaError && (
            <Alert severity="error" sx={{ mb: 'var(--spacing-md)' }}>
              {mediaError}
            </Alert>
          )}
          
          {/* Media files preview */}
          {mediaFiles.length > 0 && (
            <Stack direction="row" spacing={2} sx={{ mb: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
              {mediaFiles.map((file, index) => (
                <Card key={index} sx={{ 
                  width: 150, 
                  position: 'relative',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}>
                  {file.preview ? (
                    <CardMedia
                      component="img"
                      height="100"
                      image={file.preview}
                      alt={file.name}
                    />
                  ) : (
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DocumentIcon sx={{ fontSize: 40, color: 'var(--text-primary)' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 'var(--spacing-sm)' }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-primary)' }}>
                      {file.name}
                    </Typography>
                  </CardContent>
                  <IconButton 
                    size="small" 
                    onClick={() => handleFileRemove(index)}
                    sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      bgcolor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        bgcolor: 'var(--bg-secondary-hover)'
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          )}
          
          {/* File upload button */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="media-upload"
            multiple
          />
          <label htmlFor="media-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              sx={{
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)'
                }
              }}
            >
              <TranslatedText>Add Media</TranslatedText>
            </Button>
          </label>
          {mediaFiles.length > 0 && (
            <Box sx={{ mt: 'var(--spacing-sm)' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                <TranslatedText>Selected files:</TranslatedText> {mediaFiles.map(file => file.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Platform selection */}
        <FormControl component="fieldset" sx={{ mb: 'var(--spacing-lg)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-primary)' }}>
            <TranslatedText>Select Platforms</TranslatedText>
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={platforms.twitter}
                  onChange={handlePlatformChange}
                  name="twitter"
                  sx={{
                    color: 'var(--text-secondary)',
                    '&.Mui-checked': { color: 'var(--primary)' }
                  }}
                  icon={<XIcon />}
                  checkedIcon={<XIcon />}
                  disabled={!isTwitterAuthenticated}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)' }}>
                  <TranslatedText>Twitter</TranslatedText>
                  {!isTwitterAuthenticated && (
                    <Typography variant="caption" color="error" sx={{ ml: 'var(--spacing-sm)' }}>
                      <TranslatedText>(Authentication required)</TranslatedText>
                    </Typography>
                  )}
                </Box>
              }
            />
          </FormGroup>
        </FormControl>
        
        {/* Action buttons */}
        <Box sx={{ 
          mt: 'var(--spacing-lg)', 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%'
        }}>
          {/* When not scheduling, show both Post Now and Schedule Post buttons side by side */}
          {!isScheduling ? (
            <>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handlePost}
                disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated) || (platforms.twitter && content.length > characterLimits.twitter)}
                sx={{
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-bold)',
                  borderRadius: 'var(--border-radius-full)',
                  padding: '10px 20px',
                  flex: { xs: '1', sm: '0 0 auto' },
                  '&:hover': { 
                    background: 'var(--primary-dark)',
                    color: 'white'
                  },
                  '&.Mui-disabled': {
                    background: 'var(--bg-disabled)',
                    color: 'var(--text-disabled)'
                  }
                }}
              >
                <TranslatedText>Post Now</TranslatedText>
              </Button>
              
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={() => setIsScheduling(true)}
                disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated) || (platforms.twitter && content.length > characterLimits.twitter)}
                sx={{
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-bold)',
                  borderRadius: 'var(--border-radius-full)',
                  padding: '10px 20px',
                  flex: { xs: '1', sm: '0 0 auto' },
                  '&:hover': { 
                    background: 'var(--primary-dark)',
                    color: 'white'
                  },
                  '&.Mui-disabled': {
                    background: 'var(--bg-disabled)',
                    color: 'var(--text-disabled)'
                  }
                }}
              >
                <TranslatedText>Schedule Post</TranslatedText>
              </Button>
            </>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 3,
                backgroundColor: 'var(--bg-paper)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                zIndex: 1,
                mb: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <ScheduleIcon sx={{ color: 'var(--primary)', mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                    <TranslatedText>Schedule Your Post</TranslatedText>
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--text-secondary)' }}>
                    <TranslatedText>Precise Timing (12-hour format)</TranslatedText>
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <DatePicker
                      label={<TranslatedText>Date</TranslatedText>}
                      value={scheduledTime}
                      onChange={(newValue) => setScheduledTime(newValue)}
                      minDate={new Date()}
                      format="MMM dd, yyyy"
                      sx={{ width: '180px' }}
                    />
                      
                      <TextField
                        label={<TranslatedText>Hours</TranslatedText>}
                        type="number"
                        InputProps={{ 
                          inputProps: { min: 1, max: 12 },
                          endAdornment: <InputAdornment position="end"><TranslatedText>hr</TranslatedText></InputAdornment>
                        }}
                        size="small"
                        value={scheduledTime ? (scheduledTime.getHours() % 12 === 0 ? 12 : scheduledTime.getHours() % 12) : 12}
                        onChange={(e) => {
                          let hours = parseInt(e.target.value);
                          if (hours >= 1 && hours <= 12) {
                            const newTime = new Date(scheduledTime || new Date());
                            // Convert from 12-hour to 24-hour format
                            const isPM = newTime.getHours() >= 12;
                            hours = isPM ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
                            newTime.setHours(hours);
                            setScheduledTime(newTime);
                          }
                        }}
                        sx={{ width: '100px' }}
                      />
                      <TextField
                        label={<TranslatedText>Minutes</TranslatedText>}
                        type="number"
                        InputProps={{ 
                          inputProps: { min: 0, max: 59 },
                          endAdornment: <InputAdornment position="end"><TranslatedText>min</TranslatedText></InputAdornment>
                        }}
                        size="small"
                        value={scheduledTime ? scheduledTime.getMinutes() : 0}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value);
                          if (minutes >= 0 && minutes <= 59) {
                            const newTime = new Date(scheduledTime || new Date());
                            newTime.setMinutes(minutes);
                            setScheduledTime(newTime);
                          }
                        }}
                        sx={{ width: '100px' }}
                      />
                      <TextField
                        label={<TranslatedText>Seconds</TranslatedText>}
                        type="number"
                        InputProps={{ 
                          inputProps: { min: 0, max: 59 },
                          endAdornment: <InputAdornment position="end"><TranslatedText>sec</TranslatedText></InputAdornment>
                        }}
                        size="small"
                        value={scheduledTime ? scheduledTime.getSeconds() : 0}
                        onChange={(e) => {
                          const seconds = parseInt(e.target.value);
                          if (seconds >= 0 && seconds <= 59) {
                            const newTime = new Date(scheduledTime || new Date());
                            newTime.setSeconds(seconds);
                            setScheduledTime(newTime);
                          }
                        }}
                        sx={{ width: '100px' }}
                      />
                      
                      <FormControl sx={{ minWidth: 100 }}>
                        <InputLabel id="ampm-select-label"><TranslatedText>AM/PM</TranslatedText></InputLabel>
                        <Select
                          labelId="ampm-select-label"
                          id="ampm-select"
                          size="small"
                          value={scheduledTime ? (scheduledTime.getHours() >= 12 ? 'PM' : 'AM') : 'AM'}
                          label={<TranslatedText>AM/PM</TranslatedText>}
                          onChange={(e) => {
                            const newTime = new Date(scheduledTime || new Date());
                            const currentHours = newTime.getHours();
                            const currentIs12Hour = currentHours % 12 === 0 ? 12 : currentHours % 12;
                            
                            if (e.target.value === 'AM' && currentHours >= 12) {
                              // Convert from PM to AM
                              newTime.setHours(currentIs12Hour === 12 ? 0 : currentIs12Hour);
                            } else if (e.target.value === 'PM' && currentHours < 12) {
                              // Convert from AM to PM
                              newTime.setHours(currentIs12Hour === 12 ? 12 : currentIs12Hour + 12);
                            }
                            
                            setScheduledTime(newTime);
                          }}
                        >
                          <MenuItem value="AM"><TranslatedText>AM</TranslatedText></MenuItem>
                          <MenuItem value="PM"><TranslatedText>PM</TranslatedText></MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                </Box>
                
                <Box sx={{ 
                  mt: 3, 
                  pt: 2, 
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Chip 
                    icon={<ScheduleIcon />} 
                    label={scheduledTime ? <TranslatedText>Scheduled for:</TranslatedText> + ` ${scheduledTime.toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}` : <TranslatedText>Select a time</TranslatedText>}
                    color="primary" 
                    variant="outlined" 
                    sx={{ marginRight: 'auto' }} 
                  />
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic', ml: 1 }}>
                    <TranslatedText>Includes seconds precision</TranslatedText>
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)',
                  justifyContent: 'space-between',
                  mt: 2
                }}>
                  <Button
                    variant="contained"
                    startIcon={<ScheduleIcon />}
                    onClick={handleSchedulePost}
                    disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated) || (platforms.twitter && content.length > characterLimits.twitter)}
                    sx={{
                      background: 'var(--primary)',
                      color: 'white',
                      fontWeight: 'var(--font-weight-bold)',
                      borderRadius: 'var(--border-radius-full)',
                      flex: 1,
                      '&:hover': { 
                        background: 'var(--primary-dark)',
                        color: 'white'
                      },
                      '&.Mui-disabled': {
                        background: 'var(--bg-disabled)',
                        color: 'var(--text-disabled)'
                      }
                    }}
                  >
                    <TranslatedText>Confirm Schedule</TranslatedText>
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsScheduling(false)}
                    sx={{
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      '&:hover': {
                        borderColor: 'var(--primary-dark)',
                        color: 'var(--primary-dark)',
                        backgroundColor: 'rgba(25, 118, 210, 0.05)'
                      }
                    }}
                  >
                    <TranslatedText>Cancel</TranslatedText>
                  </Button>
                </Box>
              </Box>
            </LocalizationProvider>
          )}
        </Box>
      </Paper>

      {/* Scheduled Posts Section */}
      <Paper sx={{
        borderRadius: 'var(--border-radius-lg)',
        background: 'var(--bg-translucent)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-light)',
        overflow: 'hidden',
        mt: 3
      }}>
        <Box sx={{ p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' } }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              color: 'var(--primary)',
              textAlign: 'center'
            }}
          >
            <TranslatedText>Scheduled Posts</TranslatedText>
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {scheduledPosts.length > 0 ? (
            <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                mb: 2,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.3)',
                  },
                },
              }}>
              {scheduledPosts.map((post, index) => (
                <Paper 
                  key={post.id || index} 
                  sx={{
                    p: 1.5, 
                    mb: 1.5, 
                    position: 'relative',
                    border: '1px solid var(--border-color)',
                    backgroundColor: new Date(post.scheduled_time) < new Date() && post.status === 'scheduled' ? 'var(--warning-light)' : 'var(--bg-translucent-light)',
                    borderLeft: '5px solid var(--primary)',
                    transition: 'all 0.2s ease'                    
                  }}
                  elevation={1}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.95rem',
                    }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        color="primary"
                        size="small"
                        sx={{ mr: 1, height: 24, minWidth: 32 }}
                      />
                      <TranslatedText>Scheduled:</TranslatedText> {new Date(post.scheduled_time).toLocaleString()}
                      {new Date(post.scheduled_time) < new Date() && post.status === 'scheduled' && (
                        <Chip 
                          label={<TranslatedText>Past Due</TranslatedText>} 
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1, 
                    backgroundColor: 'rgba(0,0,0,0.04)', 
                    p: 0.75, 
                    borderRadius: '4px' 
                  }}>
                    <Chip 
                      label={post.status === 'scheduled' ? <TranslatedText>Scheduled</TranslatedText> : <TranslatedText>Completed</TranslatedText>} 
                      color={post.status === 'scheduled' ? 'primary' : 'success'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    
                    {/* Show platform icons */}
                    <Box sx={{ display: 'flex', ml: 'auto' }}>
                      {post.platforms && post.platforms.map ? post.platforms.map((platform, i) => (
                        <Tooltip key={i} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                          <Box component="span" sx={{ mx: 0.5 }}>
                            {platform === 'twitter' ? <XIcon fontSize="small" color="primary" /> :
                             platform === 'facebook' ? <FacebookIcon fontSize="small" color="primary" /> :
                             platform === 'linkedin' ? <LinkedInIcon fontSize="small" color="primary" /> :
                             <></>}
                          </Box>
                        </Tooltip>
                      )) : null}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    p: 1, 
                    backgroundColor: 'white', 
                    borderRadius: '4px',
                    border: '1px solid var(--border-color-light)',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {post.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    {post.status === 'scheduled' && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleExecuteScheduledPost(post.id)}
                          disabled={isLoading}
                          startIcon={<SendIcon />}
                          sx={{ mr: 1 }}
                        >
                          <TranslatedText>Post Now</TranslatedText>
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteScheduledPost(post.id)}
                          disabled={isLoading}
                          startIcon={<DeleteIcon />}
                        >
                          <TranslatedText>Delete</TranslatedText>
                        </Button>
                      </>
                    )}
                    {post.status === 'completed' && (
                      <Chip
                        icon={<CheckIcon />}
                        label={<TranslatedText>Posted Successfully</TranslatedText>}
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              p: 3, 
              textAlign: 'center', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', opacity: 0.5, mb: 1 }} />
              <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                <TranslatedText>No scheduled posts yet</TranslatedText>
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
                <TranslatedText>Use the form above to schedule your first post</TranslatedText>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Status Dialog */}
      {statusDialog.open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          onClick={handleCloseStatusDialog}
        >
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: 'sm',
              margin: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 2, backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Typography variant="h6">{statusDialog.title}</Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#ffffff' }}>
          <Typography gutterBottom>{statusDialog.content}</Typography>
          {statusDialog.results && (
            <List>
              {Object.entries(statusDialog.results).map(([platform, result]) => (
                <ListItem key={platform}>
                  <ListItemIcon>
                    {result.success ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    secondary={result.message}
                  />
                  {result.success && result.url && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ ml: 2 }}
                    >
                      <TranslatedText>View Post</TranslatedText>
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 2, 
              backgroundColor: '#ffffff',
              borderTop: '1px solid rgba(0, 0, 0, 0.12)' 
            }}>
              <Button onClick={handleCloseStatusDialog} sx={{ color: 'var(--primary)' }}>
                <TranslatedText>Close</TranslatedText>
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  </Box>
  </>
  );
};

export default PostSystemWithErrorBoundary;
