import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon,
  DesignServices as TemplateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SendModal from '../components/SendModal';
import { getSavedTemplates, deleteTemplate } from '../services/api';

const Newsletters = () => {
  const [templates, setTemplates] = useState([]);
  const [sentThisMonth, setSentThisMonth] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [plan, setPlan] = useState('Free'); // Default to 'Free', update based on user session
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-info'); // Backend API to fetch user info
        const data = await response.json();
        if (response.ok) {
          setPlan(data.role); // Update the plan state (e.g., 'Free', 'Pro', 'Admin')
        } else {
          console.error('Failed to fetch user plan:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    fetchUserInfo();
    fetchTemplates();
    fetchSentThisMonth();
    console.log("Detected user plan/role:", plan);

  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
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
      setNotification({
        open: true,
        message: 'Error fetching templates',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentThisMonth = async () => {
    try {
      const response = await fetch('/api/newsletter/sent-this-month');
      const data = await response.json();
      if (response.ok) {
        setSentThisMonth(data.sent_this_month);
      }
    } catch (error) {
      console.error('Error fetching sent newsletters count:', error);
    }
  };

  const handleSend = (template) => {
    setSelectedTemplate(template);
    setIsSendModalOpen(true);
  };

  const handleSave = (updatedTemplate) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
    setNotification({ open: true, message: 'Template updated successfully', severity: 'success' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== id));
      setNotification({ open: true, message: 'Template deleted successfully', severity: 'info' });
    } catch (error) {
      console.error('Error deleting template:', error);
      setNotification({ open: true, message: 'Error deleting template', severity: 'error' });
    }
  };

  const handleSendComplete = async (updatedCount) => {
    if (updatedCount !== undefined) {
      setSentThisMonth(updatedCount);
    } else {
      try {
        const response = await fetch('/api/newsletter/sent-this-month');
        const data = await response.json();
        if (response.ok) {
          setSentThisMonth(data.sent_this_month);
        }
      } catch (error) {
        console.error('Error fetching sent newsletters count:', error);
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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

  return (
    <Container maxWidth="lg" sx={{ mt: 'var(--spacing-xl)', mb: 'var(--spacing-xl)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="var(--spacing-xl)">
        <Typography variant="h4" component="h1" className="heading-primary">
          Newsletter Templates
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<TemplateIcon />}
          onClick={() => navigate('/templates?skipOverlay=true')}
          sx={{
            background: 'var(--primary)',
            '&:hover': {
              background: 'var(--primary-light)',
            },
          }}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 'var(--spacing-md)',
              display: 'flex',
              gap: 'var(--spacing-md)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--border-radius-lg)',
            }}
          >
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Total Templates</Typography>
              <Typography variant="h4">{templates.length}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Sent This Month</Typography>
              <Typography variant="h4">{sentThisMonth}</Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">User Plan</Typography>
              <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>{plan}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Template List */}
        {templates.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No templates created yet
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Create your first template to get started
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TemplateIcon />}
                onClick={() => navigate('/templates')}
                sx={{ mt: 2 }}
              >
                Create Template
              </Button>
            </Paper>
          </Grid>
        ) : (
          templates.map((template) => {
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
                      Created: {new Date(template.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" noWrap className="text-primary" sx={{ mb: 1 }}>
                      {template.template_id === 2 && template.hasSections ? (
                        <>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label="Multi-Section" 
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
                    <IconButton size="small" title="Send" onClick={() => handleSend(template)}>
                      <SendIcon />
                    </IconButton>
                    <IconButton size="small" title="Delete" onClick={() => handleDelete(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Modals */}

      {selectedTemplate && (
        <SendModal
          open={isSendModalOpen}
          handleClose={() => setIsSendModalOpen(false)}
          newsletter={selectedTemplate}
          onSend={handleSendComplete}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={1500}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 20 }}  // Increase this value to push it lower
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Newsletters;
