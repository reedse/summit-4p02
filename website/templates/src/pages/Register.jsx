import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper, 
  Grid, 
  InputAdornment, 
  IconButton, 
  Divider, 
  CircularProgress,
  Fade
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { register, login } from '../services/api';
import TranslatedText from '../components/TranslatedText';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log('Starting registration process...');
      console.log('Form data:', formData);
      setServerError('');
      setErrors({});
      
      console.log('Calling register API...');
      const registerResponse = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      console.log('Register API response:', registerResponse);

      if (registerResponse.message) {
        try {
          console.log('Registration successful, attempting login...');
          const loginResponse = await login(formData.email, formData.password);
          console.log('Login response:', loginResponse);
          
          if (loginResponse.user) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(loginResponse.user));
            if (loginResponse.token) {
              localStorage.setItem('token', loginResponse.token);
            }
            
            // Update parent component's user state
            if (onLogin) {
              onLogin(loginResponse.user);
            }
            
            // Navigate to home page
            navigate('/', { replace: true });
          }
        } catch (loginError) {
          console.error('Login after registration failed:', loginError);
          setServerError(<TranslatedText>Registration successful! Redirecting to login...</TranslatedText>);
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      if (error.error === 'Email already exists') {
        setServerError(<TranslatedText>This email is already registered. Please use a different email or try logging in.</TranslatedText>);
        setErrors((prev) => ({ ...prev, email: 'Email already exists' }));
      } else if (error.errors) {
        setErrors((prev) => ({ ...prev, ...error.errors }));
        setServerError(<TranslatedText>Please check your information and try again.</TranslatedText>);
      } else {
        setServerError(error.error || 'An unexpected error occurred. Please try again.');
      }
    }
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
            maxWidth: 500,
            borderRadius: '16px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)'
            },
            overflowY: 'auto',
            maxHeight: { xs: '90vh', sm: '80vh' }
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
          <TranslatedText>Create an Account</TranslatedText>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="firstName"
                label={<TranslatedText>First Name</TranslatedText>}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName ? <span style={{color: '#ff6b6b'}}>{errors.firstName}</span> : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: errors.firstName ? '#ff6b6b' : 'white' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="lastName"
                label={<TranslatedText>Last Name</TranslatedText>}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName ? <span style={{color: '#ff6b6b'}}>{errors.lastName}</span> : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: errors.lastName ? '#ff6b6b' : 'white' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="email"
                label={<TranslatedText>Email Address</TranslatedText>}
                name="email"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="password"
                label={<TranslatedText>Password</TranslatedText>}
                type={showPassword ? 'text' : 'password'}
                id="password"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="confirmPassword"
                label={<TranslatedText>Confirm Password</TranslatedText>}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword ? <span style={{color: '#ff6b6b'}}>{errors.confirmPassword}</span> : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: errors.confirmPassword ? '#ff6b6b' : 'white' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        sx={{ color: 'white' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
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
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
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
              <TranslatedText>Sign Up</TranslatedText>
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
            <TranslatedText>Already have an account?</TranslatedText>{' '}
            <Link 
              to="/login" 
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
              <TranslatedText>Sign In</TranslatedText>
            </Link>
          </Typography>
        </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;
