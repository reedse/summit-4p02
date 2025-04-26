import React, { useContext } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { LanguageContext } from '../contexts/LanguageContext';
import { Language as LanguageIcon } from '@mui/icons-material';
import TranslatedText from './TranslatedText';

/**
 * A component that provides a dropdown menu for language selection
 * @param {Object} props - Component props
 * @param {boolean} props.isInSidebar - Whether the component is rendered in the sidebar
 * @returns {React.ReactElement} - The language toggle component
 */
const LanguageToggle = ({ isInSidebar = false }) => {
  const { language, availableLanguages, changeLanguage } = useContext(LanguageContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleClose();
  };
  
  // Get the current language name
  const currentLanguage = availableLanguages.find(lang => lang.code === language);
  
  return (
    <>
      <Button
        color="inherit"
        startIcon={!isInSidebar && <LanguageIcon />}
        onClick={handleClick}
        sx={{
          color: 'var(--text-light)',
          fontWeight: 'var(--font-weight-bold)',
          textTransform: 'none',
          transition: 'var(--transition-normal)',
          whiteSpace: 'nowrap',
          minWidth: 'auto',
          padding: isInSidebar ? '8px 16px' : '6px 8px',
          '&:hover': { color: 'var(--accent)' },
          ...(isInSidebar && {
            justifyContent: 'flex-start',
            width: '100%',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }),
        }}
      >
        {isInSidebar && (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              <TranslatedText>Current:</TranslatedText> {currentLanguage ? currentLanguage.name : 'English'}
            </Typography>
          </Box>
        )}
        {!isInSidebar && (
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { md: '0.9rem', lg: '1rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentLanguage ? currentLanguage.name : 'English'}
          </Typography>
        )}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            ...(isInSidebar && {
              width: '200px',
              maxWidth: '90%'
            }),
          },
        }}
        transformOrigin={isInSidebar ? 
          { horizontal: 'center', vertical: 'top' } : 
          { horizontal: 'right', vertical: 'top' }
        }
        anchorOrigin={isInSidebar ? 
          { horizontal: 'center', vertical: 'bottom' } : 
          { horizontal: 'right', vertical: 'bottom' }
        }
      >
        {availableLanguages.map((lang) => (
          <MenuItem 
            key={lang.code}
            selected={lang.code === language}
            onClick={() => handleLanguageChange(lang.code)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 221, 87, 0.15)',
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(255, 221, 87, 0.25)',
              },
            }}
          >
            <ListItemText primary={lang.name} />
            {lang.code === language && (
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                <span>✓</span>
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggle;
