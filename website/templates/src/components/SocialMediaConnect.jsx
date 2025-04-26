import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  LinkedIn as LinkedInIcon,
  Check as CheckIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const SocialMediaConnect = ({ onAccountsUpdated }) => {
  // State for connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    twitter: false,
    facebook: false,
    linkedin: false
  });
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // State for auth dialog
  const [authDialog, setAuthDialog] = useState({
    open: false,
    platform: '',
    username: '',
    password: '',
    error: ''
  });
  
  // Platform display names and icons
  const platforms = {
    twitter: {
      name: 'Twitter',
      icon: <TwitterIcon />,
      color: '#1DA1F2'
    },
    facebook: {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#4267B2'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0077B5'
    }
  };
  
  // Fetch connected accounts on component mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, []);
  
  // Fetch connected accounts from the backend
  const fetchConnectedAccounts = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to get the user's connected accounts
      // For this demo, we'll simulate a delay and then set some default values
      setTimeout(() => {
        setConnectedAccounts({
          twitter: false,
          facebook: false,
          linkedin: false
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      setIsLoading(false);
    }
  };
  
  // Handle opening the auth dialog
  const handleConnectClick = (platform) => {
    setAuthDialog({
      open: true,
      platform,
      username: '',
      password: '',
      error: ''
    });
  };
  
  // Handle closing the auth dialog
  const handleCloseDialog = () => {
    setAuthDialog({
      ...authDialog,
      open: false
    });
  };
  
  // Handle input change in the auth dialog
  const handleInputChange = (event) => {
    setAuthDialog({
      ...authDialog,
      [event.target.name]: event.target.value,
      error: '' // Clear any previous error
    });
  };
  
  // Handle form submission in the auth dialog
  const handleSubmit = async () => {
    // Validate inputs
    if (!authDialog.username || !authDialog.password) {
      setAuthDialog({
        ...authDialog,
        error: 'Please enter both username and password'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, this would be an OAuth flow or API call to authenticate with the platform
      // For this demo, we'll simulate a successful authentication
      setTimeout(() => {
        // Update connected accounts
        setConnectedAccounts({
          ...connectedAccounts,
          [authDialog.platform]: true
        });
        
        // Close the dialog
        setAuthDialog({
          ...authDialog,
          open: false
        });
        
        // Notify parent component
        if (onAccountsUpdated) {
          onAccountsUpdated({
            ...connectedAccounts,
            [authDialog.platform]: true
          });
        }
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error connecting account:', error);
      setAuthDialog({
        ...authDialog,
        error: 'Authentication failed. Please check your credentials and try again.'
      });
      setIsLoading(false);
    }
  };
  
  // Handle disconnecting an account
  const handleDisconnect = async (platform) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to revoke access
      // For this demo, we'll simulate a successful disconnection
      setTimeout(() => {
        // Update connected accounts
        setConnectedAccounts({
          ...connectedAccounts,
          [platform]: false
        });
        
        // Notify parent component
        if (onAccountsUpdated) {
          onAccountsUpdated({
            ...connectedAccounts,
            [platform]: false
          });
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Connected Social Media Accounts
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connect your social media accounts to post directly from this platform.
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.keys(platforms).map((platform) => (
            <Card key={platform} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: platforms[platform].color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {platforms[platform].icon}
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {platforms[platform].name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {connectedAccounts[platform] 
                      ? `Connected` 
                      : `Not connected`}
                  </Typography>
                </Box>
                
                {connectedAccounts[platform] && (
                  <CheckIcon color="success" />
                )}
              </CardContent>
              
              <Divider />
              
              <CardActions>
                {connectedAccounts[platform] ? (
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDisconnect(platform)}
                    disabled={isLoading}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="small" 
                    color="primary"
                    startIcon={<LinkIcon />}
                    onClick={() => handleConnectClick(platform)}
                    disabled={isLoading}
                  >
                    Connect
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Authentication Dialog */}
      <Dialog open={authDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          Connect to {authDialog.platform ? platforms[authDialog.platform].name : ''}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your {authDialog.platform ? platforms[authDialog.platform].name : ''} credentials to connect your account.
            In a real application, this would use OAuth for secure authentication.
          </DialogContentText>
          
          {authDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authDialog.error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username or Email"
            type="text"
            fullWidth
            variant="outlined"
            value={authDialog.username}
            onChange={handleInputChange}
          />
          
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={authDialog.password}
            onChange={handleInputChange}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialMediaConnect;
