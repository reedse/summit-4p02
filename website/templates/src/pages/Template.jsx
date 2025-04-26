import React, { useState, useEffect } from "react";
import TranslatedText from "../components/TranslatedText";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";
import Template6 from "./Template6";
import { getSavedSummaries, saveTemplate } from "../services/api";

const Template = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(true); // Overlay state
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [activeView, setActiveView] = useState("selection"); // 'selection' or 'preview'
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // Check for skipOverlay query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const skipOverlay = queryParams.get('skipOverlay');
    
    if (skipOverlay === 'true') {
      setShowOverlay(false);
    }
  }, [location]);

  // Fetch summaries from the API
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      // Fetch real summaries from the API
      const response = await getSavedSummaries();
      console.log("API Response:", response);

      if (response && response.summaries && response.summaries.length > 0) {
        // Check the structure of the first summary to see what properties are available
        const firstSummary = response.summaries[0];
        console.log("First summary structure:", firstSummary);

        // Normalize the summaries to ensure they have the expected properties
        const normalizedSummaries = response.summaries.map((summary) => {
          // If summary has a "summary" field but no "content" field, copy it to content
          if (summary.summary && !summary.content) {
            return {
              ...summary,
              content: summary.summary,
            };
          }
          return summary;
        });

        console.log("Normalized summaries:", normalizedSummaries);

        setSummaries(normalizedSummaries);
        setSelectedSummary(normalizedSummaries[0]); // Select the first summary by default
        setEditedHeadline(normalizedSummaries[0].headline || "");
        setEditedContent(
          normalizedSummaries[0].content || normalizedSummaries[0].summary || ""
        );
        console.log(
          "Summaries loaded successfully:",
          normalizedSummaries.length
        );
      } else {
        // If no summaries are available, set empty arrays but don't show mock data
        console.log("No summaries found in API response");
        setSummaries([]);
        setSelectedSummary(null);
      }
    } catch (err) {
      console.error("Error fetching summaries:", err);
      setError("Failed to load recent summaries. Please try again later.");
      setSummaries([]);
      setSelectedSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summaries on component mount
  useEffect(() => {
    fetchSummaries();
  }, []);

  // Update edited content when selected summary changes
  useEffect(() => {
    if (selectedSummary) {
      setEditedHeadline(selectedSummary.headline || "");
      setEditedContent(selectedSummary.content || "");
    }
  }, [selectedSummary]);

  const handleRefreshSummaries = () => {
    setError(null); // Clear any previous errors
    fetchSummaries();
  };

  const templates = [
    {
      id: 0,
      name: "Business Template",
      description:
        <TranslatedText>A professional newsletter template with traditional styling, perfect for business updates and corporate communications.</TranslatedText>,
      features: [
        <TranslatedText>Clean and professional layout</TranslatedText>,
        <TranslatedText>Traditional black and white styling</TranslatedText>,
        <TranslatedText>Ideal for business communications</TranslatedText>,
      ],
      component: Template1,
    },
    {
      id: 1,
      name: "Modern Green",
      description:
        <TranslatedText>A fresh, modern template with green accents, suitable for environmental organizations, wellness companies, and sustainability initiatives.</TranslatedText>,
      features: [
        <TranslatedText>Earth-friendly green color scheme</TranslatedText>,
        <TranslatedText>Modern typography</TranslatedText>,
        <TranslatedText>Warm and inviting design</TranslatedText>,
      ],
      component: Template2,
    },
    {
      id: 2,
      name: "Grid Layout",
      description:
        <TranslatedText>A clean, organized grid-based template that allows for multiple sections of content in a modern, responsive layout.</TranslatedText>,
      features: [
        <TranslatedText>Responsive grid design</TranslatedText>,
        <TranslatedText>Multiple content areas</TranslatedText>,
        <TranslatedText>Modern and minimal aesthetic</TranslatedText>,
      ],
      component: Template3,
    },
    {
      id: 3,
      name: "Aqua Breeze",
      description:
        <TranslatedText>A refreshing template with a modern aqua theme, perfect for tech or lifestyle newsletters.</TranslatedText>,
      features: [
        <TranslatedText>Aqua color scheme</TranslatedText>,
        <TranslatedText>Modern typography</TranslatedText>,
        <TranslatedText>Clean and minimal design</TranslatedText>,
      ],
      component: Template4,
    },
    {
      id: 4,
      name: "Vibrant Purple",
      description:
        <TranslatedText>A bold and vibrant template with a purple theme, ideal for creative industries.</TranslatedText>,
      features: [
        <TranslatedText>Vibrant purple color scheme</TranslatedText>,
        <TranslatedText>Dynamic layout</TranslatedText>,
        <TranslatedText>Eye-catching design</TranslatedText>,
      ],
      component: Template5,
    },
    {
      id: 5,
      name: "Dual Column Layout",
      description:
        <TranslatedText>A professional dual-column layout, great for B2B newsletters or detailed content.</TranslatedText>,
      features: [
        <TranslatedText>Dual-column design</TranslatedText>,
        <TranslatedText>Professional look</TranslatedText>,
        <TranslatedText>Ideal for detailed content</TranslatedText>,
      ],
      component: Template6,
    },
  ];

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setActiveView("preview");
  };

  const handleBackToSelection = () => {
    setActiveView("selection");
  };

  const handleUseTemplate = async () => {
    if (!selectedSummary) {
      // Show error if no summary is selected
      setError("Please select a summary first");
      return;
    }

    // Ensure summary_id is a valid number
    if (!selectedSummary.id || isNaN(Number(selectedSummary.id))) {
      setError("Invalid summary ID. Please select a valid summary.");
      return;
    }

    try {
      // Set loading state
      setLoading(true);
      
      // Log the selected summary for debugging
      console.log("Selected Summary:", selectedSummary);
      console.log("Summary ID:", selectedSummary.id, "Type:", typeof selectedSummary.id);

      // Check for potentially empty/null values and provide defaults
      let headline = "";
      if (isEditing) {
        headline = editedHeadline || "";
      } else {
        headline = selectedSummary.headline || "";
      }
      
      let content = "";
      if (isEditing) {
        content = editedContent || "";
      } else {
        // Try content first, then fall back to summary field
        content = selectedSummary.content || selectedSummary.summary || "";
      }
      
      // Ensure we have required fields
      if (!headline.trim()) {
        throw new Error("Headline is required but is empty");
      }
      
      if (!content.trim()) {
        throw new Error("Content is required but is empty");
      }

      // Log the template data being sent
      console.log("Saving template with data:", {
        templateId: selectedTemplate,
        templateName: templates[selectedTemplate].name,
        summaryId: selectedSummary.id,
        headline: headline,
        content_length: content.length,
        content_preview: content.substring(0, 100) + "..." // Log just the beginning for brevity
      });
      
      // For Template3, also include section data
      if (selectedTemplate === 2) { // Template3 has ID 2
        // Get the section data
        let section1 = "";
        let section2 = "";
        let section3 = "";
        
        if (isEditing) {
          // If we're in editing mode, use the edited section values from form elements
          // First try to find React state-managed text fields
          const editedSection1El = document.querySelector('textarea[data-section="1"]');
          const editedSection2El = document.querySelector('textarea[data-section="2"]');
          const editedSection3El = document.querySelector('textarea[data-section="3"]');
          
          section1 = editedSection1El?.value || "";
          section2 = editedSection2El?.value || "";
          section3 = editedSection3El?.value || "";
          
          console.log("Using section data from text fields:", {
            section1_preview: section1.substring(0, 50) + (section1.length > 50 ? "..." : ""),
            section2_preview: section2.substring(0, 50) + (section2.length > 50 ? "..." : ""),
            section3_preview: section3.substring(0, 50) + (section3.length > 50 ? "..." : "")
          });
        } else {
          // If not editing, split the content into three sections using Template3's algorithm
          // This ensures consistency between what's displayed and what's saved
          const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n");
          
          // Reuse the same splitting logic used in Template3
          const splitTextEvenly = (text, numParts) => {
            // Match sentences
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            
            if (sentences.length < numParts) {
              return [text];
            }
            
            const totalLength = text.length;
            const idealSectionLength = Math.floor(totalLength / numParts);
            
            const sections = [];
            let currentSection = "";
            let currentSectionIndex = 0;
            
            for (let i = 0; i < sentences.length; i++) {
              const sentence = sentences[i];
              
              if (currentSection.length + sentence.length > idealSectionLength * 1.5 && 
                  currentSection.length > 0 && 
                  currentSectionIndex < numParts - 1) {
                sections.push(currentSection.trim());
                currentSection = sentence;
                currentSectionIndex++;
              } else {
                currentSection += sentence;
              }
              
              if (i === sentences.length - 1 && currentSection.length > 0) {
                sections.push(currentSection.trim());
              }
            }
            
            // Ensure we have the exact number of parts needed
            while (sections.length < numParts) {
              sections.push("");
            }
            
            // Take only the needed number of sections
            return sections.slice(0, numParts);
          };
          
          const sections = splitTextEvenly(normalizedContent, 3);
          section1 = sections[0] || "";
          section2 = sections[1] || "";
          section3 = sections[2] || "";
          
          console.log("Automatically split content into sections:", {
            section1_preview: section1.substring(0, 50) + (section1.length > 50 ? "..." : ""),
            section2_preview: section2.substring(0, 50) + (section2.length > 50 ? "..." : ""),
            section3_preview: section3.substring(0, 50) + (section3.length > 50 ? "..." : "")
          });
        }
        
        // Ensure we have valid strings for all sections
        section1 = section1 || "";
        section2 = section2 || "";
        section3 = section3 || "";
        
        console.log("Template3 sections:", {
          section1_length: section1.length,
          section2_length: section2.length,
          section3_length: section3.length
        });
        
        // Save the template with section data using the correct API format
        const result = await saveTemplate(
          selectedTemplate,
          templates[selectedTemplate].name,
          selectedSummary.id,
          headline,
          content,
          section1,
          section2,
          section3
        );
        
        console.log("Template3 save result:", result);
      } 
      // For Template6, include content_left and content_right columns
      else if (selectedTemplate === 5) { // Template6 has ID 5
        // Get the dual-column content data
        let contentLeft = "";
        let contentRight = "";
        
        if (isEditing) {
          // If we're in editing mode, use the edited values from form elements
          const editedLeftEl = document.querySelector('textarea[data-column="left"]');
          const editedRightEl = document.querySelector('textarea[data-column="right"]');
          
          contentLeft = editedLeftEl?.value || "";
          contentRight = editedRightEl?.value || "";
          
          console.log("Using column data from text fields:", {
            contentLeft_preview: contentLeft.substring(0, 50) + (contentLeft.length > 50 ? "..." : ""),
            contentRight_preview: contentRight.substring(0, 50) + (contentRight.length > 50 ? "..." : "")
          });
        } else {
          // If not editing, split the content into two sections
          const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n");
          
          // Split text evenly for dual columns
          const splitTextEvenly = (text, numParts = 2) => {
            // Match sentences
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            
            if (sentences.length < numParts) {
              return [text, ""];
            }
            
            const totalLength = text.length;
            const idealSectionLength = Math.floor(totalLength / numParts);
            
            const sections = [];
            let currentSection = "";
            let currentSectionIndex = 0;
            
            for (let i = 0; i < sentences.length; i++) {
              const sentence = sentences[i];
              
              if (currentSection.length + sentence.length > idealSectionLength * 1.5 && 
                  currentSection.length > 0 && 
                  currentSectionIndex < numParts - 1) {
                sections.push(currentSection.trim());
                currentSection = sentence;
                currentSectionIndex++;
              } else {
                currentSection += sentence;
              }
              
              if (i === sentences.length - 1 && currentSection.length > 0) {
                sections.push(currentSection.trim());
              }
            }
            
            // Ensure we have exactly the number of parts needed
            while (sections.length < numParts) {
              sections.push("");
            }
            
            // Take only the first numParts sections if we have more
            return sections.slice(0, numParts);
          };
          
          const sections = splitTextEvenly(normalizedContent, 2);
          contentLeft = sections[0] || "";
          contentRight = sections[1] || "";
          
          console.log("Automatically split content into columns:", {
            contentLeft_preview: contentLeft.substring(0, 50) + (contentLeft.length > 50 ? "..." : ""),
            contentRight_preview: contentRight.substring(0, 50) + (contentRight.length > 50 ? "..." : "")
          });
        }
        
        // Ensure we have valid strings for both columns
        contentLeft = contentLeft || "";
        contentRight = contentRight || "";
        
        console.log("Template6 columns:", {
          contentLeft_length: contentLeft.length,
          contentRight_length: contentRight.length
        });
        
        // Save the template with dual-column data
        const result = await saveTemplate(
          selectedTemplate,
          templates[selectedTemplate].name,
          selectedSummary.id,
          headline,
          content,
          null, // section1
          null, // section2
          null, // section3
          contentLeft, // content_left
          contentRight // content_right
        );
        
        console.log("Template6 save result:", result);
      } else {
        // Save the template to the database (regular templates)
        const result = await saveTemplate(
          selectedTemplate,
          templates[selectedTemplate].name,
          selectedSummary.id,
          headline,
          content
        );
        
        console.log("Regular template save result:", result);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Template "${templates[selectedTemplate].name}" saved successfully`,
        severity: "success",
      });

      // Navigate to the newsletters page after a short delay to show the snackbar
      setTimeout(() => {
        navigate("/newsletters");
      }, 1000);
    } catch (err) {
      console.error("Error saving template:", err);
      setError(`Failed to save template: ${err.message || "Unknown error"}`);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || "Failed to save template"}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSummaryChange = (event) => {
    const summaryId = event.target.value;
    const summary = summaries.find((s) => s.id === summaryId);
    setSelectedSummary(summary);
    // Set the edited content immediately when summary changes
    if (summary) {
      setEditedHeadline(summary.headline || "");
      // Check for either content or summary field
      setEditedContent(summary.content || summary.summary || "");
      console.log("Selected summary:", summary);
      console.log(
        "Setting edited content to:",
        summary.content || summary.summary || ""
      );
    }
    // Reset editing state when changing summary
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save the edited content to the selected summary
      if (selectedSummary) {
        const updatedSummary = {
          ...selectedSummary,
          headline: editedHeadline,
          content: editedContent,
        };

        // Update the summary in the summaries array
        const updatedSummaries = summaries.map((s) =>
          s.id === selectedSummary.id ? updatedSummary : s
        );

        setSummaries(updatedSummaries);
        setSelectedSummary(updatedSummary);

        // Show success message
        setSnackbar({
          open: true,
          message: "Preview changes saved successfully",
          severity: "success",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleHeadlineChange = (event) => {
    setEditedHeadline(event.target.value);
  };

  const handleContentChange = (event) => {
    setEditedContent(event.target.value);
  };

  const handleOverlaySelection = (option) => {
    if (option === "template") {
      setShowOverlay(false); // Proceed to template selection
    } else if (option === "no-template") {
      navigate("/ai-summary"); // Directly navigate to AI Summaries
    }
  };

  // NoSummariesAvailable component definition moved here before it's used
  const NoSummariesAvailable = () => {
    const navigate = useNavigate();
    
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6, 
          px: 4,
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--primary)' }}>
          <TranslatedText>No Summaries Available</TranslatedText>
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          <TranslatedText>
            To create a newsletter template, you need a summary first. You can either search for 
            articles to summarize or create an AI summary directly.
          </TranslatedText>
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/articles')}
              startIcon={<RefreshIcon />}
              sx={{
                borderWidth: '2px',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  borderWidth: '2px',
                  bgcolor: 'rgba(var(--primary-rgb), 0.08)'
                }
              }}
            >
              <TranslatedText>Search Articles</TranslatedText>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/ai-summary')}
              sx={{
                fontWeight: 'bold',
                px: 3,
                boxShadow: 'var(--shadow-md)',
                '&:hover': {
                  boxShadow: 'var(--shadow-lg)'
                }
              }}
            >
              <TranslatedText>Generate AI Summary</TranslatedText>
            </Button>
          </Grid>
        </Grid>
        
        <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
          <TranslatedText>
            Once you have created summaries, they will appear here for use with newsletter templates.
          </TranslatedText>
        </Typography>
      </Box>
    );
  };

  // Custom templates that accept content as props
  const TemplateWithContent = ({ Component, summary }) => {
    if (!summary) {
      return <NoSummariesAvailable />;
    }

    // Log the complete summary object to help debug issues
    console.log("TemplateWithContent - FULL Summary Object:", JSON.stringify(summary, null, 2));

    // Use edited content when editing, otherwise use summary data
    const headline = isEditing ? editedHeadline : summary.headline || "";
    const content = isEditing ? editedContent : summary.content || "";

    // Debug logging to identify content issues
    console.log("TemplateWithContent - Summary:", summary);
    console.log("TemplateWithContent - Content:", content);
    console.log("TemplateWithContent - Content type:", typeof content);
    console.log("TemplateWithContent - Edited content:", editedContent);

    // Handle different property names that might be used in the API response
    let finalContent = content;
    if (!finalContent && summary.summary) {
      finalContent = summary.summary;
      console.log("Using summary.summary instead of summary.content");
    }

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
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                sx={{ mb: 2 }}
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                  },
                }}
              />
            ) : (
              <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
                {headline ? <TranslatedText>{headline}</TranslatedText> : <TranslatedText>Newsletter Title</TranslatedText>}
              </h1>
            )}
            <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
              <TranslatedText>NEWSLETTER</TranslatedText>
            </h2>
          </div>
          <div style={{ padding: "20px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <div style={{ width: "100%" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
                  <TranslatedText>Latest Updates</TranslatedText>
                </h2>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    variant="outlined"
                    value={editedContent}
                    onChange={handleContentChange}
                    placeholder="Enter content"
                  />
                ) : (
                  <p
                    className="par1"
                    style={{ fontSize: "15px", whiteSpace: "pre-line" }}
                  >
                    {finalContent ? <TranslatedText>{finalContent}</TranslatedText> : <TranslatedText>No content available</TranslatedText>}
                  </p>
                )}
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
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                sx={{ mb: 2 }}
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#1B5E20",
                  },
                }}
              />
            ) : (
              <h1 style={{ fontSize: "36px", color: "#1B5E20", margin: "0" }}>
                {headline ? <TranslatedText>{headline}</TranslatedText> : <TranslatedText>Your title</TranslatedText>}
              </h1>
            )}
            <p style={{ fontSize: "14px", color: "#1B5E20", margin: "5px 0" }}>
              <TranslatedText>Official newsletter</TranslatedText>
            </p>
          </div>

          <div style={{ padding: "20px 0" }}>
            <h2 style={{ fontSize: "24px", color: "#1B5E20" }}>
              <TranslatedText>Featured Content</TranslatedText>
            </h2>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={editedContent}
                onChange={handleContentChange}
                placeholder="Enter content"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#1B5E20",
                    },
                  },
                }}
              />
            ) : (
              <p
                className="par1"
                style={{
                  fontSize: "16px",
                  color: "#1B5E20",
                  whiteSpace: "pre-line",
                }}
              >
                {finalContent || "No content available"}
              </p>
            )}
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
              <p style={{ margin: "0", fontSize: "12px" }}>
                Footer information
              </p>
            </div>
          </div>
        </div>
      );
    }

    // For Template3 (Grid Layout)
    if (Component === Template3) {
      // Split the content into three sections for editing or display
      const paragraphs = finalContent
        ? finalContent.split("\n\n")
        : ["", "", ""];

      // Debug logging to diagnose the content splitting issue
      console.log("Template.jsx - finalContent for Template3:", finalContent);
      console.log("Template.jsx - paragraphs after split:", paragraphs);
      
      // Ensure we have a string and normalize line breaks
      const normalizedContent = finalContent ? finalContent.toString().replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n") : "";
      
      // Parse the content into balanced sections for editing
      const splitContentEvenly = (text, numParts) => {
        // Match sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        if (sentences.length < numParts) {
          return new Array(numParts).fill("");
        }
        
        const totalLength = text.length;
        const idealSectionLength = Math.floor(totalLength / numParts);
        
        const sections = [];
        let currentSection = "";
        let currentSectionIndex = 0;
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          
          if (currentSection.length + sentence.length > idealSectionLength * 1.5 && 
              currentSection.length > 0 && 
              currentSectionIndex < numParts - 1) {
            sections.push(currentSection.trim());
            currentSection = sentence;
            currentSectionIndex++;
          } else {
            currentSection += sentence;
          }
          
          if (i === sentences.length - 1 && currentSection.length > 0) {
            sections.push(currentSection.trim());
          }
        }
        
        // Ensure we have exactly the number of parts needed
        while (sections.length < numParts) {
          sections.push("");
        }
        
        // Take only the needed number of sections
        return sections.slice(0, numParts);
      };
      
      // For editing mode, create three balanced sections
      const contentSections = splitContentEvenly(normalizedContent, 3);
      const section1 = contentSections[0] || "";
      const section2 = contentSections[1] || "";
      const section3 = contentSections[2] || "";
      
      console.log("Template.jsx - Sections prepared for editing:", {
        section1: section1.substring(0, 50) + (section1.length > 50 ? "..." : ""),
        section2: section2.substring(0, 50) + (section2.length > 50 ? "..." : ""),
        section3: section3.substring(0, 50) + (section3.length > 50 ? "..." : "")
      });

      // For editing mode, provide separate text fields for each section
      if (isEditing) {
        // State to track each section's content in edit mode
        const [editedSection1, setEditedSection1] = React.useState(section1);
        const [editedSection2, setEditedSection2] = React.useState(section2);
        const [editedSection3, setEditedSection3] = React.useState(section3);
        
        // When component mounts or content changes, update the section states
        React.useEffect(() => {
          setEditedSection1(section1);
          setEditedSection2(section2);
          setEditedSection3(section3);
        }, [finalContent]);
        
        // Function to update the combined content whenever a section changes
        const handleSectionChange = (index, value) => {
          // Update the appropriate section state
          if (index === 0) setEditedSection1(value);
          else if (index === 1) setEditedSection2(value);
          else if (index === 2) setEditedSection3(value);
          
          // Combine sections and update the main editedContent state
          setTimeout(() => {
            const newContent = [
              index === 0 ? value : editedSection1,
              index === 1 ? value : editedSection2,
              index === 2 ? value : editedSection3
            ].join("\n\n");
            console.log("Template.jsx - New combined content after section edit:", newContent);
            setEditedContent(newContent);
          }, 0);
        };

      return (
          <div style={{ width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                backgroundColor: "#f5f5f5",
                padding: "20px",
                borderRadius: "5px",
              }}
            >
              {/* Header for the editing view */}
          <div
            style={{
                  gridColumn: "1 / span 3",
              backgroundColor: "#4a4a4a",
              color: "white",
              padding: "20px",
              textAlign: "center",
              borderRadius: "5px",
                  marginBottom: "20px",
            }}
          >
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "white",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                }}
              />
          </div>

              {/* Section 1 Edit */}
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  borderBottom: "2px solid #4a4a4a",
                  paddingBottom: "10px",
                    fontSize: "20px",
                }}
              >
                  <TranslatedText>Section 1</TranslatedText>
              </h2>
              <TextField
                fullWidth
                multiline
                  rows={8}
                variant="outlined"
                  value={editedSection1}
                  onChange={(e) => handleSectionChange(0, e.target.value)}
                  placeholder="Enter content for section 1"
                  inputProps={{
                    "data-section": "1"
                  }}
                />
              </div>

              {/* Section 2 Edit */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    borderBottom: "2px solid #4a4a4a",
                    paddingBottom: "10px",
                    fontSize: "20px",
                  }}
                >
                  <TranslatedText>Section 2</TranslatedText>
                </h2>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={editedSection2}
                  onChange={(e) => handleSectionChange(1, e.target.value)}
                  placeholder="Enter content for section 2"
                  inputProps={{
                    "data-section": "2"
                  }}
                />
              </div>

              {/* Section 3 Edit */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    borderBottom: "2px solid #4a4a4a",
                    paddingBottom: "10px",
                    fontSize: "20px",
                  }}
                >
                  <TranslatedText>Section 3</TranslatedText>
                </h2>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={editedSection3}
                  onChange={(e) => handleSectionChange(2, e.target.value)}
                  placeholder="Enter content for section 3"
                  inputProps={{
                    "data-section": "3"
                  }}
                />
              </div>
          </div>
          </div>
        );
      }

      // For display mode, use the Template3 component directly
      return (
        <div style={{ width: "100%" }}>
          <Template3 
            headline={headline} 
            content={finalContent.replace(/\n/g, "\n\n")} // Ensure double line breaks for proper paragraph splitting
          />
        </div>
      );
    }

    // For Template4 (Aqua Breeze)
    if (Component === Template4) {
      return (
        <div style={{ width: "100%" }}>
          {isEditing ? (
            <div
              style={{
                fontFamily: "Montserrat, sans-serif",
                color: "#444",
                backgroundColor: "#e0f7fa",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#00796b",
                  color: "#fff",
                  padding: "20px",
                  textAlign: "center",
                  borderRadius: "10px 10px 0 0",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editedHeadline}
                  onChange={handleHeadlineChange}
                  placeholder="Enter headline"
                  inputProps={{
                    style: {
                      fontSize: "28px",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "white",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </div>
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                <h2 style={{ borderBottom: "2px solid #00796b", paddingBottom: "10px" }}>
                  <TranslatedText>Summary</TranslatedText>
                </h2>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder="Enter content"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#00796b",
                      },
                      "&:hover fieldset": {
                        borderColor: "#004d40",
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <Template4 headline={headline} content={finalContent} />
          )}
        </div>
      );
    }

    // For Template5 (Vibrant Purple)
    if (Component === Template5) {
      return (
        <div style={{ width: "100%" }}>
          {isEditing ? (
            <div
              style={{
                fontFamily: "Poppins, sans-serif",
                color: "#333",
                backgroundColor: "#f0f0f0",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#6200ea",
                  color: "#fff",
                  padding: "20px",
                  textAlign: "center",
                  borderRadius: "10px 10px 0 0",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editedHeadline}
                  onChange={handleHeadlineChange}
                  placeholder="Enter headline"
                  inputProps={{
                    style: {
                      fontSize: "28px",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "white",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </div>
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                <h2 style={{ borderBottom: "2px solid #6200ea", paddingBottom: "10px" }}>
                  <TranslatedText>Summary</TranslatedText>
                </h2>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder="Enter content"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#6200ea",
                      },
                      "&:hover fieldset": {
                        borderColor: "#3700b3",
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <Template5 headline={headline} content={finalContent} />
          )}
        </div>
      );
    }

    // For Template6 (Dual Column Layout)
    if (Component === Template6) {
      // Split the content into two columns for editing or display
      const normalizedContent = finalContent ? finalContent.toString().replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n") : "";
      
      // Parse the content into balanced sections for the two columns
      const splitContentEvenly = (text, numParts = 2) => {
        // Match sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        if (sentences.length < numParts) {
          return new Array(numParts).fill("");
        }
        
        const totalLength = text.length;
        const idealSectionLength = Math.floor(totalLength / numParts);
        
        const sections = [];
        let currentSection = "";
        let currentSectionIndex = 0;
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          
          if (currentSection.length + sentence.length > idealSectionLength * 1.5 && 
              currentSection.length > 0 && 
              currentSectionIndex < numParts - 1) {
            sections.push(currentSection.trim());
            currentSection = sentence;
            currentSectionIndex++;
          } else {
            currentSection += sentence;
          }
          
          if (i === sentences.length - 1 && currentSection.length > 0) {
            sections.push(currentSection.trim());
          }
        }
        
        // Ensure we have exactly the number of parts needed
        while (sections.length < numParts) {
          sections.push("");
        }
        
        // Take only the needed number of sections
        return sections.slice(0, numParts);
      };
      
      // For editing mode, create two balanced sections
      const contentColumns = splitContentEvenly(normalizedContent, 2);
      const contentLeft = contentColumns[0] || "";
      const contentRight = contentColumns[1] || "";
      
      console.log("Template.jsx - Columns prepared for Template6:", {
        contentLeft: contentLeft.substring(0, 50) + (contentLeft.length > 50 ? "..." : ""),
        contentRight: contentRight.substring(0, 50) + (contentRight.length > 50 ? "..." : "")
      });

      // For editing mode, provide separate text fields for each column
      if (isEditing) {
        // State to track each column's content in edit mode
        const [editedLeftColumn, setEditedLeftColumn] = React.useState(contentLeft);
        const [editedRightColumn, setEditedRightColumn] = React.useState(contentRight);
        
        // When component mounts or content changes, update the column states
        React.useEffect(() => {
          setEditedLeftColumn(contentLeft);
          setEditedRightColumn(contentRight);
        }, [finalContent]);
        
        // Function to update the combined content whenever a column changes
        const handleColumnChange = (column, value) => {
          // Update the appropriate column state
          if (column === "left") setEditedLeftColumn(value);
          else if (column === "right") setEditedRightColumn(value);
          
          // Combine columns and update the main editedContent state
          setTimeout(() => {
            const newContent = [
              column === "left" ? value : editedLeftColumn,
              column === "right" ? value : editedRightColumn
            ].join("\n\n");
            console.log("Template.jsx - New combined content after column edit:", newContent);
            setEditedContent(newContent);
          }, 0);
        };

        return (
          <div style={{ width: "100%" }}>
            <div
              style={{
                backgroundColor: "#2C2C54",
                padding: "40px",
                color: "#fff",
                borderRadius: "5px",
              }}
            >
              {/* Header for the editing view */}
              <div
                style={{
                  border: "2px solid #fff",
                  padding: "20px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editedHeadline}
                  onChange={handleHeadlineChange}
                  placeholder="Enter headline"
                  inputProps={{
                    style: {
                      fontSize: "28px",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "white",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridGap: "20px",
                }}
              >
                {/* Left Column Edit */}
                <div
                  style={{
                    backgroundColor: "#40407A",
                    padding: "20px",
                    borderRadius: "5px",
                  }}
                >
                  <h3 style={{ 
                    borderBottom: "1px solid #fff", 
                    paddingBottom: "8px", 
                    fontSize: "16px",
                    marginTop: 0 
                  }}>
                    Part 1
                  </h3>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    variant="outlined"
                    value={editedLeftColumn}
                    onChange={(e) => handleColumnChange("left", e.target.value)}
                    placeholder="Enter content for the left column"
                    inputProps={{
                      "data-column": "left",
                      style: {
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "white",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(255,255,255,0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "white",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "white",
                      },
                    }}
                  />
                </div>
                
                {/* Right Column Edit */}
                <div
                  style={{
                    backgroundColor: "#40407A",
                    padding: "20px",
                    borderRadius: "5px",
                  }}
                >
                  <h3 style={{ 
                    borderBottom: "1px solid #fff", 
                    paddingBottom: "8px", 
                    fontSize: "16px",
                    marginTop: 0 
                  }}>
                    Part 2
                  </h3>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    variant="outlined"
                    value={editedRightColumn}
                    onChange={(e) => handleColumnChange("right", e.target.value)}
                    placeholder="Enter content for the right column"
                    inputProps={{
                      "data-column": "right",
                      style: {
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "white",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(255,255,255,0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "white",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "white",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // For display mode, pass the content to the Template6 component
      return <Template6 headline={headline} content={finalContent} />;
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
          textAlign: "left",
          mb: "var(--spacing-lg)",
        }}
      >
        <TranslatedText>Newsletter Templates</TranslatedText>
      </Typography>

      <Typography variant="body1" sx={{ mb: "var(--spacing-lg)" }}>
        <TranslatedText>Choose a template format for your newsletter. You can customize colors, content, and layout after selection.</TranslatedText>
      </Typography>

      <Grid container spacing={4}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "var(--shadow-lg)",
                },
              }}
            >
              <CardActionArea onClick={() => handleTemplateSelect(template.id)}>
                <Box
                  sx={{
                    height: "200px",
                    overflow: "hidden",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <Box
                    sx={{
                      transform: "scale(0.5)",
                      transformOrigin: "top center",
                    }}
                  >
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
                      <Typography
                        component="li"
                        variant="body2"
                        key={idx}
                        sx={{ mb: 0.5 }}
                      >
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "var(--spacing-lg)",
          }}
        >
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
              borderColor: "var(--primary)",
              color: "var(--primary)",
              "&:hover": {
                borderColor: "var(--primary-dark)",
                backgroundColor: "rgba(var(--primary-rgb), 0.04)",
              },
            }}
          >
            <TranslatedText>Back to Templates</TranslatedText>
          </Button>
        </Box>

        {summaries.length > 0 ? (
          <>
            <Box
              sx={{
                mb: "var(--spacing-md)",
                p: 2,
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" paragraph>
                <strong><TranslatedText>How it works:</TranslatedText></strong> <TranslatedText>Select one of your saved summaries from the dropdown below to see how it would look in this template.</TranslatedText>
              </Typography>
              <Typography variant="body2">
                <TranslatedText>Once you've found the perfect combination, click "Use This Template" to proceed to the editor where you can make further customizations. You can also click the Edit button to make changes to the headline and content directly in this preview.</TranslatedText>
              </Typography>
            </Box>

            {/* Summary Selection */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: "var(--spacing-lg)",
              }}
            >
              <FormControl fullWidth sx={{ flexGrow: 1 }}>
                <InputLabel id="summary-select-label"><TranslatedText>Select a Summary</TranslatedText></InputLabel>
                <Select
                  labelId="summary-select-label"
                  id="summary-select"
                  value={selectedSummary?.id || ""}
                  label={<TranslatedText>Select a Summary</TranslatedText>}
                  onChange={handleSummaryChange}
                  disabled={loading || !summaries.length || isEditing}
                >
                  {summaries.map((summary) => (
                    <MenuItem key={summary.id} value={summary.id}>
                      {summary.headline || <TranslatedText>Summary #{summary.id}</TranslatedText>}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title={<TranslatedText>Refresh summaries list</TranslatedText>}>
                <IconButton
                  onClick={handleRefreshSummaries}
                  disabled={loading || isEditing}
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={isEditing ? <TranslatedText>Save changes</TranslatedText> : <TranslatedText>Edit content</TranslatedText>}>
                <IconButton
                  color={isEditing ? "success" : "primary"}
                  onClick={handleToggleEdit}
                  disabled={!selectedSummary}
                  sx={{ ml: 1 }}
                >
                  {isEditing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ my: 2 }}>
                {error}
              </Typography>
            ) : (
              <Box
                sx={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--border-radius-md)",
                  height: "auto",
                  minHeight: "500px",
                  mb: "var(--spacing-lg)",
                  overflow: "auto",
                }}
              >
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
                  disabled={!selectedSummary || isEditing}
                  sx={{
                    backgroundColor: "var(--primary)",
                    "&:hover": {
                      backgroundColor: "var(--primary-dark)",
                    },
                  }}
                >
                  <TranslatedText>Use This Template</TranslatedText>
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <NoSummariesAvailable />
        )}
      </>
    );
  };

  if (showOverlay) {
    return (
      <Box
        sx={{
          position: "fixed", // Ensure the overlay covers the entire screen
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(8px)", // Apply blur effect to the background
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Add a semi-transparent dark overlay
          zIndex: 1300, // Ensure it appears above other elements
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: "40px",
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "200px",
              height: "150px",
              border: "2px solid var(--primary)",
              borderRadius: "8px",
              textAlign: "center",
              padding: "20px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-rgb), 0.1)",
              },
            }}
            onClick={() => handleOverlaySelection("template")}
          >
            <Typography variant="h5" gutterBottom>
              <strong><TranslatedText>Template</TranslatedText></strong>
            </Typography>
            <Typography variant="body2">
              <TranslatedText>Templated summaries can only be sent out as emails.</TranslatedText>
            </Typography>
          </Box>
          <Box
            sx={{
              width: "200px",
              height: "150px",
              border: "2px solid var(--primary)",
              borderRadius: "8px",
              textAlign: "center",
              padding: "20px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-rgb), 0.1)",
              },
            }}
            onClick={() => handleOverlaySelection("no-template")}
          >
            <Typography variant="h5" gutterBottom>
              <strong><TranslatedText>No Template</TranslatedText></strong>
            </Typography>
            <Typography variant="body2">
              <TranslatedText>Non-templated summaries can be sent out as an email or posted to social media.</TranslatedText>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--bg-primary)",
        padding: "var(--spacing-xl)",
        overflowY: "auto",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: "var(--spacing-xl)",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {activeView === "selection" ? (
          <TemplateSelectionView />
        ) : (
          <TemplatePreviewView />
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Template;
