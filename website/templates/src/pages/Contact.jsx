import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TranslatedText from '../components/TranslatedText';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 600,
          borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <TranslatedText>Contact Us</TranslatedText>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          <TranslatedText>Have questions or need assistance? Our team is here to help! Reach out to us, and we'll get back to you as soon as possible.</TranslatedText>
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          <TranslatedText>📍 <strong>Address:</strong> 123 Innovation Street, Tech City, TX 75001</TranslatedText><br />  
          <TranslatedText>📧 <strong>Email:</strong> support@ourplatform.com</TranslatedText><br />  
          <TranslatedText>☎️ <strong>Phone:</strong> +1 (555) 123-4567</TranslatedText>  
        </Typography>

        {submitted ? (
          <Typography variant="h6" sx={{ color: '#FFD700', mt: 2 }}>
            <TranslatedText>✅ Your message is sent! We'll be in touch soon.</TranslatedText>
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={<TranslatedText>Your Name</TranslatedText>}
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
              required
            />
            <TextField
              fullWidth
              type="email"
              label={<TranslatedText>Your Email</TranslatedText>}
              name="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label={<TranslatedText>Your Message</TranslatedText>}
              name="message"
              value={formData.message}
              onChange={handleChange}
              sx={{ mb: 2, backgroundColor: 'white', borderRadius: '5px' }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#FFD700', color: '#8B0000', fontWeight: 'bold' }}
            >
              <TranslatedText>Send Message</TranslatedText>
            </Button>
          </form>
        )}

        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: '#FFD700', color: '#8B0000' }}
          onClick={() => navigate('/home')}
        >
          <TranslatedText>Back to Home</TranslatedText>
        </Button>
      </Paper>
    </Box>
  );
};

export default Contact;
