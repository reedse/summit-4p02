import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  IconButton,
  Card,
  Container,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import axios from 'axios';
import TranslatedText from '../components/TranslatedText';

const Translation = () => {
  // State management
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoDetect, setAutoDetect] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');

  const API_KEY = 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM';
  const API_URL = 'https://translation.googleapis.com/language/translate/v2';
  const DETECT_URL = 'https://translation.googleapis.com/language/translate/v2/detect';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
  ];

  const detectLanguage = async (text) => {
    if (!text.trim()) return;
    
    try {
      const response = await axios.post(
        `${DETECT_URL}?key=${API_KEY}`,
        {
          q: text
        }
      );

      if (response.data && response.data.data && response.data.data.detections && response.data.data.detections.length > 0) {
        const detected = response.data.data.detections[0][0].language;
        setDetectedLanguage(detected);
        if (autoDetect) {
          setSourceLanguage(detected);
        }
        return detected;
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Don't set error state here to avoid disrupting the UI
    }
    return null;
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    
    // Debounce language detection to avoid too many API calls
    if (text.trim().length > 5 && autoDetect) {
      const timeoutId = setTimeout(() => {
        detectLanguage(text);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If auto-detect is enabled, detect the language first
      let sourceLang = sourceLanguage;
      if (autoDetect) {
        const detected = await detectLanguage(inputText);
        if (detected) {
          sourceLang = detected;
        }
      }

      const requestBody = {
        q: inputText,
        target: targetLanguage,
        format: 'text'
      };
      
      // Only include source parameter if not using auto-detect
      if (!autoDetect) {
        requestBody.source = sourceLang;
      }

      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        requestBody
      );

      if (response.data && response.data.data && response.data.data.translations) {
        setOutputText(response.data.data.translations[0].translatedText);
        
        // If the translation included detected language info, update the UI
        if (response.data.data.translations[0].detectedSourceLanguage) {
          setDetectedLanguage(response.data.data.translations[0].detectedSourceLanguage);
        }
      } else {
        setError('Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.response?.data?.error?.message || 'An error occurred during translation');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (!autoDetect) {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText(inputText);
    } else {
      // If auto-detect is on, just swap the output to input
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText('');
      setAutoDetect(false); // Turn off auto-detect when swapping
    }
  };

  const handleAutoDetectChange = (e) => {
    setAutoDetect(e.target.checked);
    if (e.target.checked && inputText.trim()) {
      detectLanguage(inputText);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Common styling constants for reuse
  const commonSelectStyles = {
    color: '#333',
    backgroundColor: 'white',
    '.MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
    '.MuiSvgIcon-root': { color: '#666' },
    borderRadius: 4,
  };

  const commonTextFieldStyles = {
    backgroundColor: 'white',
    borderRadius: '4px',
    textarea: { color: '#333' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#ccc' },
      '&:hover fieldset': { borderColor: '#aaa' },
      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
    },
    '& .MuiInputBase-input': { 
      fontSize: '1rem',
      lineHeight: 1.5
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: 2, sm: 3 },
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Card
          elevation={1}
          sx={{
            padding: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            background: 'white',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" fontWeight="500" sx={{ textAlign: 'center', color: '#333' }}>
              <TranslatedText>Text Translation</TranslatedText>
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>
              <TranslatedText>{error}</TranslatedText>
            </Alert>
          )}

          {/* Main Translation Interface */}
          <Box sx={{ width: '100%' }}>
            {/* Language Controls Row */}
            <Box sx={{ width: '100%', mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Left Column - Source Language */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  {/* Source Language Label */}
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    <TranslatedText>Source Language</TranslatedText>
                  </Typography>
                  
                  {/* Auto Detect Option */}
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={autoDetect}
                        onChange={handleAutoDetectChange}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#1976d2',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#1976d2',
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: '#666' }}><TranslatedText>Auto Detect</TranslatedText></Typography>}
                    sx={{ 
                      color: '#666',
                      m: 0,
                    }}
                  />
                </Box>
                
                {/* Source Language Dropdown */}
                <FormControl fullWidth sx={{ mb: 1 }}>
                  <Select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    disabled={autoDetect}
                    displayEmpty
                    sx={{
                      ...commonSelectStyles,
                      height: 40,
                    }}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Detected Language Indicator */}
                {autoDetect && detectedLanguage && (
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 500,
                      }}
                    >
                      <TranslatedText>Detected:</TranslatedText> {getLanguageName(detectedLanguage)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Swap Button - Center */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', mt: { xs: 0, md: 4 } }}>
                <IconButton
                  onClick={handleSwapLanguages}
                  disabled={loading}
                  sx={{
                    background: '#1976d2',
                    color: 'white',
                    '&:hover': { background: '#1565c0' },
                    width: 40,
                    height: 40,
                  }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </Box>
              
              {/* Right Column - Target Language */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                  <TranslatedText>Target Language</TranslatedText>
                </Typography>
                
                {/* Target Language Dropdown */}
                <FormControl fullWidth>
                  <Select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    displayEmpty
                    sx={{
                      ...commonSelectStyles,
                      height: 40,
                    }}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* Text Areas Row */}
            <Box sx={{ display: 'flex', width: '100%', mb: 3 }}>
              {/* Left Column - Source Text Input */}
              <Box sx={{ flex: 1, pr: { xs: 0, md: 1.5 } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Enter text to translate"
                  value={inputText}
                  onChange={handleInputChange}
                  sx={{
                    ...commonTextFieldStyles,
                    '& .MuiOutlinedInput-root': {
                      ...commonTextFieldStyles['& .MuiOutlinedInput-root'],
                      borderRadius: '4px',
                    }
                  }}
                />
              </Box>
              
              {/* Center Space for Swap Button */}
              <Box sx={{ width: { xs: 0, md: '40px' }, display: { xs: 'none', md: 'block' } }} />
              
              {/* Right Column - Translation Output */}
              <Box sx={{ flex: 1, pl: { xs: 0, md: 1.5 }, mt: { xs: 3, md: 0 } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Translation will appear here"
                  value={outputText}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    ...commonTextFieldStyles,
                    '& .MuiOutlinedInput-root': {
                      ...commonTextFieldStyles['& .MuiOutlinedInput-root'],
                      borderRadius: '4px',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={loading}
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 3,
              backgroundColor: '#1976d2',
              color: 'white',
              fontWeight: 'normal',
              borderRadius: '4px',
              '&:hover': { backgroundColor: '#1565c0' },
              height: '45px',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {loading ? <CircularProgress size={24} /> : <TranslatedText>Translate</TranslatedText>}
          </Button>

          {/* Footer */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 2, 
              color: '#666',
              textAlign: 'center',
            }}
          >
            <TranslatedText>Powered by Google Translate API</TranslatedText>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default Translation;
