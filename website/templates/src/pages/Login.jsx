import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Fade
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { login } from '../services/api';
import TranslatedText from '../components/TranslatedText';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      if (onLogin) onLogin(response.user);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 430,
            borderRadius: '16px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: 'white',
            mb: 3,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <TranslatedText>Sign In</TranslatedText>
        </Typography>

        {serverError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: '#ff5252'
              }
            }}
          >
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={<TranslatedText>Email Address</TranslatedText>}
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email ? <span style={{color: '#ff6b6b'}}>{errors.email}</span> : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: errors.email ? '#ff6b6b' : 'white' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              input: { color: 'white' },
              '& label': { color: 'white' },
              '& label.Mui-focused': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&:hover fieldset': { borderColor: '#ffdd57' },
                '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
              },
              '& .MuiInputAdornment-root': {
                color: 'white'
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={<TranslatedText>Password</TranslatedText>}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password ? <span style={{color: '#ff6b6b'}}>{errors.password}</span> : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: errors.password ? '#ff6b6b' : 'white' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              input: { color: 'white' },
              '& label': { color: 'white' },
              '& label.Mui-focused': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&:hover fieldset': { borderColor: '#ffdd57' },
                '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
              },
              '& .MuiInputAdornment-root': {
                color: 'white'
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2,
              mb: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
              color: '#8B0000',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: '30px',
              boxShadow: '0 4px 12px rgba(255, 221, 87, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                background: '#fff', 
                color: '#8B0000',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(255, 221, 87, 0.5)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(255, 221, 87, 0.4)'
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 221, 87, 0.5)',
                color: 'rgba(139, 0, 0, 0.7)'
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: '#8B0000' }} />
            ) : (
              <TranslatedText>Sign In</TranslatedText>
            )}
          </Button>
          
          <Divider sx={{ 
            my: 2, 
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            color: 'white'
          }}>
            <Typography variant="body2" sx={{ color: 'white', px: 1, fontSize: '0.8rem' }}>
              <TranslatedText>OR</TranslatedText>
            </Typography>
          </Divider>

          <Typography sx={{ color: 'white', fontSize: '0.95rem' }}>
            <TranslatedText>Don't have an account?</TranslatedText>{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#ffdd57', 
                fontWeight: 'bold', 
                textDecoration: 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  textShadow: '0 0 8px rgba(255, 221, 87, 0.5)'
                }
              }}
            >
              <TranslatedText>Sign Up</TranslatedText>
            </Link>
          </Typography>
        </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
