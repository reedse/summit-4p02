import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Grid, Divider, Card, CardContent, CardActionArea, CardMedia, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Template1 from './Template1';
import Template2 from './Template2';
import Template3 from './Template3';
import { getSavedSummaries } from '../services/api';
import TranslatedText from '../components/TranslatedText';

const Template = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [activeView, setActiveView] = useState('selection'); // 'selection' or 'preview'
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState('Free'); // Default to 'Free'

  // Fetch user plan on component mount
  useEffect(() => {
    const fetchUserPlan = async () => {
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

    fetchUserPlan();
  }, []);

  // Fetch summaries on component mount
  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      try {
        // For now, we'll use mock data until the API is ready
        const mockSummaries = [
          {
            id: 1,
            headline: "The Future of AI in Healthcare",
            content: "Artificial intelligence is revolutionizing healthcare in unprecedented ways. From diagnosis to treatment planning, AI tools are becoming invaluable assets to medical professionals.\n\nRecent studies show that AI can detect certain conditions with accuracy comparable to human specialists. This could lead to earlier interventions and better patient outcomes, especially in underserved regions.\n\nHowever, challenges remain regarding ethics, data privacy, and integration with existing systems. As technology advances, addressing these concerns will be crucial for widespread adoption.",
            created_at: "2023-04-15"
          },
          {
            id: 2,
            headline: "Sustainable Business Practices",
            content: "Companies worldwide are increasingly adopting sustainable business models to address environmental concerns while meeting stakeholder expectations.\n\nImplementing green initiatives not only helps protect the planet but can also lead to cost savings and improved brand reputation. Many organizations are finding that sustainability and profitability can go hand in hand.\n\nConsumers are becoming more environmentally conscious, creating market demand for eco-friendly products and services. Businesses that adapt to this shift may find competitive advantages in the changing landscape.",
            created_at: "2023-04-12"
          },
          {
            id: 3,
            headline: "The Remote Work Revolution",
            content: "The pandemic has permanently altered how we think about work, with remote and hybrid models becoming the new normal for many industries.\n\nStudies indicate that remote work can increase productivity and employee satisfaction when implemented thoughtfully. Organizations are now investing in tools and policies to support distributed teams effectively.\n\nHowever, challenges around collaboration, company culture, and work-life boundaries continue to evolve. The most successful companies will be those that can balance flexibility with meaningful connection.",
            created_at: "2023-04-08"
          }
        ];
        
        setSummaries(mockSummaries);
        
        // Select the first summary by default
        if (mockSummaries.length > 0) {
          setSelectedSummary(mockSummaries[0]);
        }
        
        // Uncomment this section when the API is ready
        /*
        const response = await getSavedSummaries();
        setSummaries(response.summaries || []);
        // Select the first summary by default if available
        if (response.summaries && response.summaries.length > 0) {
          setSelectedSummary(response.summaries[0]);
        }
        */
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setError('Failed to load recent summaries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  const templates = [
    {
      id: 0,
      name: "Business Template",
      description: "A professional newsletter template with traditional styling, perfect for business updates and corporate communications.",
      features: ["Clean and professional layout", "Traditional black and white styling", "Ideal for business communications"],
      component: Template1,
      restricted: false, // Available to all users
    },
    {
      id: 1,
      name: "Modern Green",
      description: "A fresh, modern template with green accents, suitable for environmental organizations, wellness companies, and sustainability initiatives.",
      features: ["Earth-friendly green color scheme", "Modern typography", "Warm and inviting design"],
      component: Template2,
      restricted: false, // Available to all users
    },
    {
      id: 2,
      name: "Grid Layout",
      description: "A clean, organized grid-based template that allows for multiple sections of content in a modern, responsive layout.",
      features: ["Responsive grid design", "Multiple content areas", "Modern and minimal aesthetic"],
      component: Template3,
      restricted: true, // Restricted to Pro users
    },
  ];

  const handleTemplateSelect = (id) => {
    const selected = templates.find((template) => template.id === id);
    if (selected.restricted && plan.toLowerCase() === 'free') {
      alert('This template is only available for Pro users. Upgrade your plan to access it.');
      return;
    }
    setSelectedTemplate(id);
    setActiveView('preview');
  };

  const handleBackToSelection = () => {
    setActiveView('selection');
  };

  const handleUseTemplate = () => {
    // This would typically navigate to an editor with the selected template
    console.log(`Selected template: ${selectedTemplate + 1} with summary ID: ${selectedSummary?.id}`);
  };

  const handleSummaryChange = (event) => {
    const summaryId = event.target.value;
    const summary = summaries.find(s => s.id === summaryId);
    setSelectedSummary(summary);
  };

  // Custom templates that accept content as props
  const TemplateWithContent = ({ Component, summary }) => {
    if (!summary) {
      return <div style={{ padding: '20px', textAlign: 'center' }}><TranslatedText>No summary selected</TranslatedText></div>;
    }

    const { headline, content } = summary;
    
    // For Template1 (Business)
    if (Component === Template1) {
      return (
        <div
          style={{
            fontFamily: "Times New Roman, serif",
            color: "#000",
            backgroundColor: "#f4f4f4",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 20px",
              backgroundColor: "#fff",
              borderBottom: "2px solid #000",
            }}
          ></div>
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#fff",
              borderBottom: "2px solid #000",
            }}
          >
            <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
              {headline || <TranslatedText>BUSINESS</TranslatedText>}
            </h1>
            <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
              <TranslatedText>NEWSLETTER</TranslatedText>
            </h2>
          </div>
          <div style={{ padding: "20px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
                  <TranslatedText>Latest Updates</TranslatedText>
                </h2>
                <p className="par1" style={{ fontSize: "15px" }}>
                  {content || <TranslatedText>No content available</TranslatedText>}
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#333",
              color: "#fff",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
            <p style={{ margin: "0", fontSize: "12px" }}>
              <a
                href="https://facebook.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>Facebook</TranslatedText>
              </a>{" "}
              |
              <a
                href="https://twitter.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>Twitter</TranslatedText>
              </a>{" "}
              |
              <a
                href="https://linkedin.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>LinkedIn</TranslatedText>
              </a>
            </p>
            <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Footer information</TranslatedText></p>
          </div>
        </div>
      );
    }
    
    // For Template2 (Modern Green)
    if (Component === Template2) {
      return (
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#2E7D32",
            backgroundColor: "#E8F5E9",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "100%",
                height: "50px",
                backgroundColor: "#388E3C",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h1 style={{ fontSize: "36px", color: "#1B5E20", margin: "0" }}>
              {headline || <TranslatedText>Your title</TranslatedText>}
            </h1>
            <p style={{ fontSize: "14px", color: "#1B5E20", margin: "5px 0" }}>
              <TranslatedText>Official newsletter</TranslatedText>
            </p>
          </div>

          <div style={{ padding: "20px 0" }}>
            <h2 style={{ fontSize: "24px", color: "#1B5E20" }}>
              <TranslatedText>Featured Content</TranslatedText>
            </h2>
            <p className="par1" style={{ fontSize: "16px", color: "#1B5E20" }}>
              {content || <TranslatedText>No content available</TranslatedText>}
            </p>
          </div>
          <div style={{ padding: "20px 0", backgroundColor: "#C8E6C9" }}>
            <h3 style={{ fontSize: "18px", color: "#1B5E20" }}>
              <TranslatedText>Connect with us</TranslatedText>
            </h3>
            <div
              style={{
                padding: "10px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
              <p style={{ margin: "0", fontSize: "12px" }}>
                <a href="https://facebook.com" style={{ margin: "0 5px" }}>
                  <TranslatedText>Facebook</TranslatedText>
                </a>{" "}
                |
                <a href="https://twitter.com" style={{ margin: "0 5px" }}>
                  <TranslatedText>Twitter</TranslatedText>
                </a>{" "}
                |
                <a href="https://linkedin.com" style={{ margin: "0 5px" }}>
                  <TranslatedText>LinkedIn</TranslatedText>
                </a>
              </p>
              <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Footer information</TranslatedText></p>
            </div>
          </div>
        </div>
      );
    }
    
    // For Template3 (Grid Layout)
    if (Component === Template3) {
      // Split the content into three sections
      const paragraphs = content ? content.split('\n\n') : ['', '', ''];
      const section1 = paragraphs[0] || <TranslatedText>No content available</TranslatedText>;
      const section2 = paragraphs.length > 1 ? paragraphs[1] : <TranslatedText>No content available</TranslatedText>;
      const section3 = paragraphs.length > 2 ? paragraphs[2] : <TranslatedText>No content available</TranslatedText>;
      
      return (
        <div style={{
          fontFamily: "Arial, sans-serif",
          color: "#333",
          backgroundColor: "#f5f5f5",
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: "20px",
          gridTemplateAreas: `
            "header header header"
            "section1 section2 section3"
            "footer footer footer"
          `
        }}>
          <div style={{
            gridArea: "header",
            backgroundColor: "#4a4a4a",
            color: "white",
            padding: "20px",
            textAlign: "center",
            borderRadius: "5px"
          }}>
            <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
              {headline || <TranslatedText>Newsletter Title</TranslatedText>}
            </h1>
          </div>
          
          <div style={{
            gridArea: "section1",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>
              <TranslatedText>Section 1</TranslatedText>
            </h2>
            <p style={{ lineHeight: "1.6" }}>
              {section1}
            </p>
          </div>
          
          <div style={{
            gridArea: "section2",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>
              <TranslatedText>Section 2</TranslatedText>
            </h2>
            <p style={{ lineHeight: "1.6" }}>
              {section2}
            </p>
          </div>
          
          <div style={{
            gridArea: "section3",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>
              <TranslatedText>Section 3</TranslatedText>
            </h2>
            <p style={{ lineHeight: "1.6" }}>
              {section3}
            </p>
          </div>
          
          <div style={{
            gridArea: "footer",
            backgroundColor: "#333",
            color: "#fff",
            padding: "15px",
            textAlign: "center",
            borderRadius: "5px"
          }}>
            <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
            <p style={{ margin: "5px 0", fontSize: "12px" }}>
              <a
                href="https://facebook.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>Facebook</TranslatedText>
              </a>{" "}
              |
              <a
                href="https://twitter.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>Twitter</TranslatedText>
              </a>{" "}
              |
              <a
                href="https://linkedin.com"
                style={{ color: "#fff", margin: "0 5px" }}
              >
                <TranslatedText>LinkedIn</TranslatedText>
              </a>
            </p>
            <p style={{ margin: "5px 0", fontSize: "12px" }}><TranslatedText>&copy; 2024 Your Company Name</TranslatedText></p>
          </div>
        </div>
      );
    }
    
    // Fallback case
    return <Component />;
  };

  const TemplateSelectionView = () => (
    <>
      <Typography 
        variant="h4" 
        className="heading-primary"
        gutterBottom 
        sx={{ 
          textAlign: 'left', 
          mb: 'var(--spacing-lg)'
        }}
      >
        <TranslatedText>Newsletter Templates</TranslatedText>
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 'var(--spacing-lg)' }}>
        <TranslatedText>Choose a template format for your newsletter. You can customize colors, content, and layout after selection.</TranslatedText>
      </Typography>
      
      <Grid container spacing={4}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: template.restricted && plan.toLowerCase() === 'free' ? 'none' : 'translateY(-5px)',
                  boxShadow: template.restricted && plan.toLowerCase() === 'free' ? 'none' : 'var(--shadow-lg)',
                },
                opacity: template.restricted && plan.toLowerCase() === 'free' ? 0.5 : 1, // Dim restricted templates for Free users
              }}
            >
              <CardActionArea
                onClick={() => {
                  if (!(template.restricted && plan.toLowerCase() === 'free')) {
                    handleTemplateSelect(template.id);
                  }
                }}
                disabled={template.restricted && plan.toLowerCase() === 'free'} // Disable interaction for restricted templates
              >
                <Box 
                  sx={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <Box sx={{ transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                    {React.createElement(template.component)}
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TranslatedText>{template.name}</TranslatedText>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <TranslatedText>{template.description}</TranslatedText>
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {template.features.map((feature, idx) => (
                      <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                        <TranslatedText>{feature}</TranslatedText>
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );

  const TemplatePreviewView = () => {
    const ActiveTemplate = templates[selectedTemplate].component;
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 'var(--spacing-lg)' }}>
          <Box>
            <Typography variant="h4" className="heading-primary">
              <TranslatedText>{templates[selectedTemplate].name}</TranslatedText>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <TranslatedText>Preview the template with your recent summaries</TranslatedText>
            </Typography>
          </Box>
          <Button 
            variant="outlined"
            onClick={handleBackToSelection}
            sx={{ 
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              '&:hover': {
                borderColor: 'var(--primary-dark)',
                backgroundColor: 'rgba(var(--primary-rgb), 0.04)',
              }
            }}
          >
            <TranslatedText>Back to Templates</TranslatedText>
          </Button>
        </Box>
        
        {/* Summary Selection */}
        <FormControl fullWidth sx={{ mb: 'var(--spacing-lg)' }}>
          <InputLabel id="summary-select-label"><TranslatedText>Select a Summary</TranslatedText></InputLabel>
          <Select
            labelId="summary-select-label"
            id="summary-select"
            value={selectedSummary?.id || ''}
            label="Select a Summary"
            onChange={handleSummaryChange}
            disabled={loading || !summaries.length}
          >
            {summaries.map((summary) => (
              <MenuItem key={summary.id} value={summary.id}>
                {summary.headline || <TranslatedText>Summary #{summary.id}</TranslatedText>}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 2 }}>
            <TranslatedText>{error}</TranslatedText>
          </Typography>
        ) : (
          <Box sx={{ 
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            height: 'auto',
            minHeight: '500px',
            mb: 'var(--spacing-lg)',
            overflow: 'auto'
          }}>
            <TemplateWithContent 
              Component={ActiveTemplate} 
              summary={selectedSummary} 
            />
          </Box>
        )}
        
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUseTemplate}
              disabled={!selectedSummary}
              sx={{
                backgroundColor: 'var(--primary)',
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)',
                },
              }}
            >
              <TranslatedText>Use This Template</TranslatedText>
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-primary)',
        padding: 'var(--spacing-xl)',
        overflowY: 'auto',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 'var(--spacing-xl)',
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {activeView === 'selection' ? (
          <TemplateSelectionView />
        ) : (
          <TemplatePreviewView />
        )}
      </Paper>
    </Box>
  );
};

export default Template;