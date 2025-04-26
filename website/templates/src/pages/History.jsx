import React, { useState, useEffect } from 'react';
import TranslatedText from '../components/TranslatedText';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import {
  Mail as MailIcon,
  PostAdd as PostIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  AutoFixHigh as AIIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  DesignServices as TemplateIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getSavedTemplates, deleteTemplate, getSavedSummaries, deleteSummary } from '../services/api';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [summaryToDelete, setSummaryToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasTemplates, setHasTemplates] = useState(false);
  const [templateCount, setTemplateCount] = useState(0);
  const [deleteState, setDeleteState] = useState('initial'); // 'initial', 'hasTemplates', 'error', 'success'
  const [templateDeleteConfirmOpen, setTemplateDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateDeleteError, setTemplateDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch saved summaries when component mounts
    const fetchSavedSummaries = async () => {
      try {
        setLoading(true);
        console.log('Fetching saved summaries...');
        const response = await getSavedSummaries();
        console.log('API Response:', response);
        
        // Determine what data to use based on response structure
        let summariesData = response;
        if (response && response.summaries) {
          console.log('Found summaries in response.summaries');
          summariesData = response.summaries;
        }

        // Ensure we're setting an array, even if the response is empty or malformed
        const validSummaries = Array.isArray(summariesData) ? summariesData : [];
        console.log('Final summaries to be set:', validSummaries);
        setSavedSummaries(validSummaries);

      } catch (error) {
        console.error('Error fetching saved summaries:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error?.response?.status,
          data: error?.response?.data
        });
        setError('Failed to load summaries. Please try again later.');
        setSavedSummaries([]); // Ensure we set an empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Fetch both summaries and newsletters when component mounts
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch summaries
        await fetchSavedSummaries();
        // Fetch templates/newsletters
        await fetchTemplates();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...');
      const response = await getSavedTemplates();
      if (response && response.templates) {
        console.log('Fetched templates:', response.templates);
        // Transform the templates to properly handle content for different template types
        const processedTemplates = response.templates.map(template => {
          const processed = { ...template };
          
          // Add a displayContent property based on template type
          if (template.template_id === 2) { // Template3 (Grid Layout)
            // Check if we have section data from the updated schema
            if (template.section1 || template.section2 || template.section3) {
              console.log(`Template ${template.id} has section data`, {
                section1: template.section1?.substring(0, 30) + '...',
                section2: template.section2?.substring(0, 30) + '...',
                section3: template.section3?.substring(0, 30) + '...'
              });
              
              // Create a display content that shows it has multiple sections
              processed.displayContent = template.section1 || 'Section 1';
              processed.hasSections = true;
            } else {
              // Fallback to regular content
              processed.displayContent = template.content;
              processed.hasSections = false;
            }
          } else {
            // For all other templates, use standard content
            processed.displayContent = template.content;
            processed.hasSections = false;
          }
          
          return processed;
        });
        
        setTemplates(processedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again later.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExpandSummary = (id) => {
    setExpandedSummary(expandedSummary === id ? null : id);
  };

  const handleCopyToClipboard = (headline, summary) => {
    const textToCopy = `${headline}\n\n${summary}`;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDeleteTemplateClick = (id) => {
    setTemplateToDelete(id);
    setTemplateDeleteConfirmOpen(true);
    setTemplateDeleteError('');
  };

  const handleConfirmDeleteTemplate = async () => {
    try {
      setTemplateDeleteError('');
      await deleteTemplate(templateToDelete);
      setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== templateToDelete));
      setTemplateDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      setTemplateDeleteError(error.response?.data?.error || 'An unexpected error occurred while deleting the template.');
    }
  };

  const handleCancelTemplateDelete = () => {
    setTemplateDeleteConfirmOpen(false);
    setTemplateToDelete(null);
    setTemplateDeleteError('');
  };

  const handleDeleteSummaryClick = (id) => {
    setSummaryToDelete(id);
    setDeleteConfirmOpen(true);
    setDeleteState('initial');
    setErrorMessage('');
    setHasTemplates(false);
    setTemplateCount(0);
  };

  const handleConfirmDeleteSummary = async (forceDelete = false) => {
    try {
      setErrorMessage('');
      const response = await deleteSummary(summaryToDelete, forceDelete);
      
      // Check if the summary has templates but wasn't force deleted
      if (response.has_templates && !forceDelete) {
        setHasTemplates(true);
        setTemplateCount(response.template_count);
        setDeleteState('hasTemplates');
        return;
      }
      
      // If we got here, the deletion was successful
      setSavedSummaries((prevSummaries) => prevSummaries.filter((summary) => summary.id !== summaryToDelete));
      setDeleteConfirmOpen(false);
      setSummaryToDelete(null);
      setDeleteState('success');
    } catch (error) {
      console.error('Error deleting summary:', error);
      setErrorMessage(error.response?.data?.error || 'An unexpected error occurred while deleting the summary.');
      setDeleteState('error');
    }
  };

  const handleForceDelete = () => {
    handleConfirmDeleteSummary(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSummaryToDelete(null);
    setErrorMessage('');
    setHasTemplates(false);
    setTemplateCount(0);
    setDeleteState('initial');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getIcon = (type) => {
    return type === 'newsletter' ? <MailIcon /> : <PostIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get template style based on template_id
  const getTemplateStyle = (templateId) => {
    const styles = {
      0: { bgcolor: '#f5f5f5', icon: '💼' }, // Business Template
      1: { bgcolor: '#e8f5e9', icon: '🌿' }, // Modern Green
      2: { bgcolor: '#f5f5f5', icon: '📰' }, // Grid Layout
      3: { bgcolor: '#e1f5fe', icon: '💧' }, // Aqua Breeze
      4: { bgcolor: '#f3e5f5', icon: '💜' }, // Vibrant Purple
      5: { bgcolor: '#e0f2f1', icon: '📋' }, // Dual Column Layout
    };
    return styles[templateId] || { bgcolor: '#f5f5f5', icon: '📄' };
  };

  // Function to combine and sort newsletters and summaries for the All Content tab
  const getAllContent = () => {
    // Create a combined array with type property for identification
    const combinedContent = [
      ...templates.map(template => ({
        ...template,
        type: 'newsletter',
        displayDate: new Date(template.created_at)
      })),
      ...savedSummaries.map(summary => ({
        ...summary,
        type: 'summary',
        displayDate: new Date(summary.created_at)
      }))
    ];

    // Sort by creation date, newest first
    return combinedContent.sort((a, b) => b.displayDate - a.displayDate);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 'var(--spacing-xl)', 
      mb: 'var(--spacing-xl)' 
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="var(--spacing-xl)">
        <Typography variant="h4" component="h1" className="heading-primary">
          <TranslatedText>Content History</TranslatedText>
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Paper sx={{ 
        p: 'var(--spacing-md)', 
        mb: 'var(--spacing-xl)', 
        display: 'flex', 
        gap: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary"><TranslatedText>Total Posts</TranslatedText></Typography>
          <Typography variant="h4" className="text-primary">0</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary"><TranslatedText>Total Newsletters</TranslatedText></Typography>
          <Typography variant="h4" className="text-primary">{templates.length}</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary"><TranslatedText>AI Summaries</TranslatedText></Typography>
          <Typography variant="h4" className="text-primary">{savedSummaries.length}</Typography>
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ 
        width: '100%', 
        mb: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary)',
            },
            '& .MuiTab-root': {
              color: 'var(--text-secondary)',
              '&.Mui-selected': {
                color: 'var(--primary)',
              },
            },
          }}
        >
          <Tab label={<TranslatedText>All Content</TranslatedText>} />
          <Tab label={<TranslatedText>Posts</TranslatedText>} />
          <Tab label={<TranslatedText>Newsletters</TranslatedText>} />
          <Tab label={<TranslatedText>AI Summaries</TranslatedText>} />
        </Tabs>
      </Paper>

      {/* Content Display */}
      <Paper sx={{
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        {tabValue === 0 ? (
          // All Content Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                <TranslatedText>Loading content...</TranslatedText>
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : getAllContent().length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                <TranslatedText>No content history available</TranslatedText>
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)', mb: 3 }}>
                <TranslatedText>Create AI summaries or newsletter templates to get started</TranslatedText>
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArticleIcon />}
                  onClick={() => navigate('/articles')}
                >
                  <TranslatedText>Find Articles</TranslatedText>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AIIcon />}
                  onClick={() => navigate('/summarize')}
                >
                  <TranslatedText>Create AI Summary</TranslatedText>
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<TemplateIcon />}
                  onClick={() => navigate('/templates?skipOverlay=true')}
                >
                  <TranslatedText>Create Template</TranslatedText>
                </Button>
              </Box>
            </Box>
          ) : (
            <List>
              {getAllContent().map((item, index) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  {index > 0 && <Divider />}
                  <ListItem 
                    sx={{ 
                      display: 'block',
                      p: 'var(--spacing-md)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--bg-secondary)',
                      },
                    }}
                    onClick={() => item.type === 'summary' ? handleExpandSummary(item.id) : null}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        {item.type === 'summary' ? (
                          <AIIcon sx={{ color: 'var(--primary)' }} />
                        ) : (
                          <ArticleIcon sx={{ color: item.template_id ? 'var(--accent)' : 'var(--primary)' }} />
                        )}
                        <Box>
                          <Typography variant="h6" className="heading-secondary">
                            {item.headline}
                          </Typography>
                          <Typography variant="body2" className="text-secondary">
                            {item.type === 'summary' ? <TranslatedText>AI Summary</TranslatedText> : <><TranslatedText>Template</TranslatedText>: {item.template_name}</>} • <TranslatedText>Created</TranslatedText>: {formatDate(item.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        {item.type === 'summary' && item.tone && (
                          <Chip 
                            label={item.tone}
                            size="small"
                            sx={{ 
                              mr: 1,
                              backgroundColor: 'var(--bg-accent)',
                              color: 'var(--primary)',
                            }}
                          />
                        )}
                        {item.type === 'newsletter' && (
                          <IconButton 
                            size="small" 
                            title="Send" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/newsletters');
                            }}
                            sx={{ mr: 1 }}
                          >
                            <SendIcon />
                          </IconButton>
                        )}
                        {item.type === 'summary' ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(item.headline, item.summary);
                              }}
                              sx={{ mr: 1 }}
                            >
                              <CopyIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSummaryClick(item.id);
                              }}
                              sx={{ mr: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            size="small"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplateClick(item.id);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {item.type === 'summary' && (
                          <IconButton size="small">
                            {expandedSummary === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {item.type === 'summary' && (
                      <Collapse in={expandedSummary === item.id}>
                        <Box 
                          sx={{ 
                            mt: 'var(--spacing-md)',
                            p: 'var(--spacing-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--border-radius-md)',
                          }}
                        >
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {item.summary}
                          </Typography>
                          {item.tags && (
                            <Box sx={{ mt: 'var(--spacing-md)', display: 'flex', gap: 1 }}>
                              {item.tags.split(',').map((tag, i) => (
                                <Chip
                                  key={i}
                                  label={tag.trim()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderColor: 'var(--primary)',
                                    color: 'var(--primary)',
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    )}
                    {item.type === 'newsletter' && (
                      <Box sx={{ ml: 7, mt: 1 }}>
                        <Typography variant="body2" noWrap sx={{ color: 'var(--text-secondary)' }}>
                          {item.displayContent && item.displayContent.substring(0, 200)}...
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )
        ) : tabValue === 1 ? (
          // Posts Tab
          <Box p="var(--spacing-xl)" textAlign="center">
            <Typography variant="h6" className="text-secondary">
              <TranslatedText>No posts available</TranslatedText>
            </Typography>
            <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
              <TranslatedText>Your published posts will appear here</TranslatedText>
            </Typography>
          </Box>
        ) : tabValue === 2 ? (
          // Newsletters Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                <TranslatedText>Loading templates...</TranslatedText>
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : !Array.isArray(templates) || templates.length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                <TranslatedText>No newsletter templates</TranslatedText>
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
                <TranslatedText>Create templates in the Newsletter section to see them here</TranslatedText>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TemplateIcon />}
                onClick={() => navigate('/templates?skipOverlay=true')}
                sx={{ mt: 2 }}
              >
                <TranslatedText>Create Template</TranslatedText>
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              {templates.map((template) => {
                const templateStyle = getTemplateStyle(template.template_id);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card className="card" sx={{ position: 'relative' }}>
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '8px', 
                          bgcolor: templateStyle.bgcolor 
                        }} 
                      />
                      <CardContent sx={{ pt: 3 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              mr: 1, 
                              fontSize: '18px',
                              lineHeight: 1
                            }}
                          >
                            {templateStyle.icon}
                          </Typography>
                          <Chip 
                            label={template.template_name} 
                            size="small" 
                            sx={{ 
                              bgcolor: templateStyle.bgcolor,
                              mb: 1
                            }} 
                          />
                        </Box>
                        <Typography variant="h6" component="h2" noWrap className="heading-secondary">
                          {template.headline}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom className="text-secondary">
                          <TranslatedText>Created</TranslatedText>: {formatDate(template.created_at)}
                        </Typography>
                        <Typography variant="body2" noWrap className="text-primary" sx={{ mb: 1 }}>
                          {template.template_id === 2 && template.hasSections ? (
                            <>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip 
                                    label={<TranslatedText>Multi-Section</TranslatedText>} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                    sx={{ mr: 1, mb: 1, fontSize: '0.7rem' }}
                                  />
                                </Box>
                                {template.displayContent.substring(0, 80)}...
                              </Box>
                            </>
                          ) : (
                            template.displayContent.substring(0, 100) + '...'
                          )}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" title="Send" onClick={() => navigate(`/newsletters`)}>
                          <SendIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          title="Delete" 
                          onClick={() => handleDeleteTemplateClick(template.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )
        ) : tabValue === 3 ? (
          // AI Summaries Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                <TranslatedText>Loading summaries...</TranslatedText>
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : !Array.isArray(savedSummaries) || savedSummaries.length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                <TranslatedText>No saved AI summaries</TranslatedText>
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)', mb: 3 }}>
                <TranslatedText>Generate and save summaries to see them here</TranslatedText>
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArticleIcon />}
                  onClick={() => navigate('/articles')}
                >
                  <TranslatedText>Find Articles</TranslatedText>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AIIcon />}
                  onClick={() => navigate('/summarize')}
                >
                  <TranslatedText>Create AI Summary</TranslatedText>
                </Button>
              </Box>
            </Box>
          ) : (
            <List>
              {savedSummaries.map((summary, index) => (
                <React.Fragment key={summary.id}>
                  {index > 0 && <Divider />}
                  <ListItem 
                    sx={{ 
                      display: 'block',
                      p: 'var(--spacing-md)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--bg-secondary)',
                      },
                    }}
                    onClick={() => handleExpandSummary(summary.id)}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <AIIcon sx={{ color: 'var(--primary)' }} />
                        <Box>
                          <Typography variant="h6" className="heading-secondary">
                            {summary.headline}
                          </Typography>
                          <Typography variant="body2" className="text-secondary">
                            <TranslatedText>Created</TranslatedText>: {formatDate(summary.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Chip 
                          label={summary.tone}
                          size="small"
                          sx={{ 
                            mr: 1,
                            backgroundColor: 'var(--bg-accent)',
                            color: 'var(--primary)',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(summary.headline, summary.summary);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <CopyIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSummaryClick(summary.id);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton size="small">
                          {expandedSummary === summary.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                    <Collapse in={expandedSummary === summary.id}>
                      <Box 
                        sx={{ 
                          mt: 'var(--spacing-md)',
                          p: 'var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--border-radius-md)',
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {summary.summary}
                        </Typography>
                        {summary.tags && (
                          <Box sx={{ mt: 'var(--spacing-md)', display: 'flex', gap: 1 }}>
                            {summary.tags.split(',').map((tag, i) => (
                              <Chip
                                key={i}
                                label={tag.trim()}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )
        ) : (
          // Default/fallback content
          <Box p="var(--spacing-xl)" textAlign="center">
            <Typography variant="h6" className="text-secondary">
              <TranslatedText>No content available</TranslatedText>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>
          <TranslatedText>Delete Summary</TranslatedText>
        </DialogTitle>
        <DialogContent>
          {deleteState === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          {deleteState === 'hasTemplates' ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <TranslatedText>This summary is used in </TranslatedText> 
                {templateCount} 
                <TranslatedText> template(s).</TranslatedText>
              </Alert>
              <DialogContentText>
                <TranslatedText>
                  If you delete this summary, all associated templates will also be deleted. 
                  Do you want to continue?
                </TranslatedText>
              </DialogContentText>
            </>
          ) : (
            <DialogContentText>
              <TranslatedText>
                Are you sure you want to delete this summary? This action cannot be undone.
              </TranslatedText>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            <TranslatedText>Cancel</TranslatedText>
          </Button>
          
          {deleteState === 'hasTemplates' ? (
            <Button 
              onClick={handleForceDelete} 
              color="error"
            >
              <TranslatedText>Delete All</TranslatedText>
            </Button>
          ) : (
            <Button 
              onClick={() => handleConfirmDeleteSummary(false)} 
              color="error"
              disabled={deleteState === 'error'}
            >
              <TranslatedText>Delete</TranslatedText>
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Template Delete Confirmation Dialog */}
      <Dialog
        open={templateDeleteConfirmOpen}
        onClose={handleCancelTemplateDelete}
      >
        <DialogTitle>
          <TranslatedText>Delete Template</TranslatedText>
        </DialogTitle>
        <DialogContent>
          {templateDeleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {templateDeleteError}
            </Alert>
          )}
          <DialogContentText>
            <TranslatedText>
              Are you sure you want to delete this template? This action cannot be undone.
            </TranslatedText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTemplateDelete} color="primary">
            <TranslatedText>Cancel</TranslatedText>
          </Button>
          <Button 
            onClick={handleConfirmDeleteTemplate} 
            color="error"
            disabled={!!templateDeleteError}
          >
            <TranslatedText>Delete</TranslatedText>
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default History;
