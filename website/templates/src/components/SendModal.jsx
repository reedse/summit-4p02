import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Snackbar, Alert, Checkbox, FormControlLabel, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import TranslatedText from './TranslatedText';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton'; // Make sure this import exists


const SendModal = ({ open, handleClose, newsletter, onSend }) => {
  const [manualEmail, setManualEmail] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'warning', 'info'

  useEffect(() => {
    if (open) {
      // Fetch subscribers when the modal is opened
      fetchSubscribers();
    } else {
      // Reset manualEmail and selectedEmails when the modal is closed
      setManualEmail('');
      setSelectedEmails([]);
    }
  }, [open]);

  const fetchSubscribers = async () => {
    try {
      const response = await axios.get('/api/subscribers');
      if (response.data && response.data.subscribers) {
        setSubscribers(response.data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const handleToggleSubscriber = (email) => {
    setSelectedEmails((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSend = async () => {
    try {
      let recipients = [...selectedEmails];
      if (manualEmail.trim() !== '') {
        recipients.push(manualEmail.trim());
      }
      recipients = [...new Set(recipients)];

      // Prepare the payload
      const payload = {
        recipients,
        subject: newsletter.headline,
        body: newsletter.content,
        newsletter_id: newsletter.id,
      };
      
      // Add section data for Template3
      if (newsletter.template_id === 2) {
        payload.isTemplate3 = true;
        payload.section1 = newsletter.section1 || '';
        payload.section2 = newsletter.section2 || '';
        payload.section3 = newsletter.section3 || '';
      }
      
      // Send the newsletter
      await axios.post('/api/newsletter/send', payload);
      
      // Show success notification
      setSnackbarOpen(true);
      setSnackbarMessage('Newsletter sent successfully!');
      setSnackbarSeverity('success');
      
      // Update parent state if needed.
      onSend();
      handleClose();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSnackbarOpen(true);
      setSnackbarMessage('Failed to send newsletter!');
      setSnackbarSeverity('error');
    }
  };

  const handleAddSubscriber = async () => {
    const trimmed = manualEmail.trim();

    // Check if the email already exists in the subscribers list
    if (!trimmed) return;
    if (subscribers.some((s) => s.email === trimmed)) {
      setSnackbarOpen(true);
      setSnackbarMessage('Subscriber already exists!');
      setSnackbarSeverity('error'); // Set severity to 'error'
      return;
    }

    try {
      const response = await axios.post('/api/subscribers', { email: trimmed });
      if (response.data.success) {
        const newSubscriber = response.data.subscriber || { id: Date.now(), email: trimmed }; // Fallback
        setSubscribers((prev) => [...prev, newSubscriber]);
        setSelectedEmails((prev) => [...prev, trimmed]);
        setManualEmail('');
        setSnackbarOpen(true);
        setSnackbarMessage('Subscriber added successfully!');
        setSnackbarSeverity('success'); // Set severity to 'success'
      } else {
        console.error('Error adding subscriber:', response.data.error);
        setSnackbarOpen(true);
        setSnackbarMessage('Failed to add subscriber!');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
      setSnackbarOpen(true);
      setSnackbarMessage('An error occurred while adding the subscriber.');
      setSnackbarSeverity('error');
    }
  };
  
  const handleDeleteSubscriber = async (subscriberId) => {
    try {
      await axios.delete(`/api/subscribers/${subscriberId}`);
      const deletedSubscriber = subscribers.find((sub) => sub.id === subscriberId);

      // Update the subscribers list
      setSubscribers((prev) => prev.filter((sub) => sub.id !== subscriberId));

      // Update the selected emails list
      setSelectedEmails((prev) =>
        prev.filter((email) => {
          return deletedSubscriber ? deletedSubscriber.email !== email : true;
        })
      );

      // Show success notification
      setSnackbarOpen(true);
      setSnackbarMessage('Subscriber deleted successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error deleting subscriber:', error);

      // Show error notification
      setSnackbarOpen(true);
      setSnackbarMessage('Failed to delete subscriber!');
      setSnackbarSeverity('error');
    }
  };
  
  const handleCloseModal = () => {
    setManualEmail('');
    setSelectedEmails([]);
    handleClose(); // Call the parent-provided close function
  };

  return (
    <>
      <Modal open={open} onClose={handleCloseModal}>
        <Box sx={{ 
          p: 4, 
          backgroundColor: 'white', 
          margin: 'auto', 
          mt: '10%', 
          width: '80%', 
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          borderRadius: 1,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            <TranslatedText>Send Newsletter</TranslatedText>
          </Typography>
          
          <TextField
            fullWidth
            label={<TranslatedText>Recipient Email (manual entry)</TranslatedText>}
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button 
            variant="text" 
            size="small" 
            onClick={handleAddSubscriber} 
            disabled={!manualEmail.trim()}
            sx={{ mt: -1, mb: 2 }}
          >
            + Add to Subscriber List
          </Button>

          
          {subscribers.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <TranslatedText>Select from your subscriber list:</TranslatedText>
              </Typography>
                <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEmails.length === subscribers.length && subscribers.length > 0}
                    indeterminate={selectedEmails.length > 0 && selectedEmails.length < subscribers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmails(subscribers.map((s) => s.email));
                      } else {
                        setSelectedEmails([]);
                      }
                    }}
                  />
                }
                label="Select All"
                />

              <List sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {subscribers.map((subscriber) => (
                  <ListItem
                  key={subscriber.email}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteSubscriber(subscriber.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedEmails.includes(subscriber.email)}
                        onChange={() => handleToggleSubscriber(subscriber.email)}
                      />
                    }
                    label={<ListItemText primary={subscriber.email} />}
                  />
                </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 2 }}>
              <TranslatedText>No subscribers found. Add some subscribers first or use manual entry.</TranslatedText>
            </Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              <TranslatedText>Cancel</TranslatedText>
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSend}
              disabled={selectedEmails.length === 0 && manualEmail.trim() === ''}
            >
              <TranslatedText>Send Newsletter</TranslatedText>
            </Button>
          </Box>
        </Box>
      </Modal>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendModal;