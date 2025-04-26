import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Divider } from '@mui/material';
import axios from 'axios';

const EditModal = ({ open, handleClose, newsletter, onSave }) => {
  const [headline, setHeadline] = useState(newsletter?.headline || '');
  const [content, setContent] = useState(newsletter?.content || '');
  const [section1, setSection1] = useState(newsletter?.section1 || '');
  const [section2, setSection2] = useState(newsletter?.section2 || '');
  const [section3, setSection3] = useState(newsletter?.section3 || '');

  useEffect(() => {
    if (newsletter) {
      setHeadline(newsletter.headline || '');
      setContent(newsletter.content || '');
      setSection1(newsletter.section1 || '');
      setSection2(newsletter.section2 || '');
      setSection3(newsletter.section3 || '');
    }
  }, [newsletter]);

  const handleSave = async () => {
    try {
      const payload = {
        headline,
        content,
      };
      
      // Add section data for Template3
      if (newsletter.template_id === 2) {
        payload.section1 = section1;
        payload.section2 = section2;
        payload.section3 = section3;
      }
      
      const response = await axios.put(`/api/template/${newsletter.id}`, payload);
      
      // Update local state with response data
      const updatedNewsletter = {
        ...newsletter,
        headline,
        content,
        section1: payload.section1,
        section2: payload.section2,
        section3: payload.section3,
      };
      
      onSave(updatedNewsletter);
      handleClose();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const isTemplate3 = newsletter?.template_id === 2;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        margin: 'auto', 
        mt: 20, 
        width: '80%', 
        maxWidth: '800px', 
        maxHeight: '80%', 
        overflowY: 'auto' 
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Edit Template
        </Typography>
        
        <TextField
          fullWidth
          label="Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          sx={{ mt: 2, mb: 3 }}
        />
        
        {isTemplate3 ? (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Template Sections
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Section 1
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={section1}
              onChange={(e) => setSection1(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Section 2
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={section2}
              onChange={(e) => setSection2(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Section 3
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={section3}
              onChange={(e) => setSection3(e.target.value)}
              sx={{ mb: 3 }}
            />
          </>
        ) : (
          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={10}
            sx={{ mt: 2 }}
          />
        )}
        
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 3 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default EditModal;