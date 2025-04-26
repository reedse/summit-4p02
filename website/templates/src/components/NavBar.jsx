import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import TranslatedText from "./TranslatedText";
import { LanguageContext } from "../contexts/LanguageContext";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Contacts as ContactsIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Description as TemplateIcon,
  AutoFixHigh as AIIcon,
  Share as PostIcon,
  Star as FavoritesIcon,
  Email as NewsletterIcon,
  History as HistoryIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assests/logo.png";
import "../styles/theme.css";
import LanguageToggle from "./LanguageToggle";

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { language, availableLanguages, changeLanguage } = useContext(LanguageContext);

  const toggleSidebar = () => setOpen(!open);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Define navigation items based on authentication status
  const publicNavItems = [
    { label: "Home", path: "/home", icon: <HomeIcon /> },
    { label: "About Us", path: "/aboutus", icon: <InfoIcon /> },
    { label: "Contact Us", path: "/contact", icon: <ContactsIcon /> },
    { label: "Pricing", path: "/pricing", icon: <ContactsIcon /> },
  ];

  const authenticatedNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
  ];

  const protectedNavItems = [
    { label: "Draft", path: "/templates", icon: <TemplateIcon /> },
    { label: "AI Summary", path: "/ai-summary", icon: <AIIcon /> },
    { label: "Post HUB", path: "/post-hub", icon: <PostIcon /> },
    { label: "Articles", path: "/articles", icon: <FavoritesIcon /> },
    { label: "History", path: "/history", icon: <HistoryIcon /> },
    { label: "Translation", path: "/translation", icon: <TranslateIcon /> },
  ];

  // Get current navigation items based on auth status
  const currentNavItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: "var(--primary)",
          height: { xs: "var(--nav-height-mobile)", sm: "var(--nav-height)" },
          display: "flex",
          justifyContent: "center",
          border: "none",
          boxShadow: "var(--shadow-md)",
          zIndex: "var(--z-navbar)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            minHeight: {
              xs: "var(--nav-height-mobile)",
              sm: "var(--nav-height)",
            },
            px: { xs: "var(--spacing-sm)", sm: "var(--spacing-md)" },
          }}
        >
          {/* Left Side: Hamburger Menu + Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={toggleSidebar}
              sx={{ color: "var(--text-light)", mr: "var(--spacing-sm)" }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "120px", width: "auto", cursor: "pointer" }}
              onClick={() => handleNavigation(user ? "/dashboard" : "/home")}
            />
          </Box>

          {/* Center: Navigation Links */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "var(--spacing-lg)",
            }}
          >
            {currentNavItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: "var(--text-light)",
                  fontWeight: location.pathname === item.path ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                  textTransform: "none",
                  transition: "var(--transition-normal)",
                  borderBottom: location.pathname === item.path ? '2px solid var(--accent)' : 'none',
                  '&:hover': { color: 'var(--accent)' }
                }}
              >
                <TranslatedText>{item.label}</TranslatedText>
              </Button>
            ))}
          </Box>

          {/* Right Side: Language Toggle and Auth Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {/* Language Toggle */}
            <Box sx={{ 
              mr: 2, 
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px',
            }}>
              <LanguageToggle isInSidebar={false} />
            </Box>
            
            {!user ? (
              <>
                <Button
                  onClick={() => handleNavigation('/register')}
                  sx={{
                    color: 'var(--text-light)',
                    fontWeight: 'var(--font-weight-bold)',
                    textTransform: 'none',
                    transition: 'var(--transition-normal)',
                    '&:hover': { color: 'var(--accent)' },
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  <TranslatedText>Sign Up</TranslatedText>
                </Button>
                <Button
                  onClick={() => handleNavigation('/login')}
                  variant="contained"
                  sx={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-dark)',
                    fontWeight: 'var(--font-weight-bold)',
                    textTransform: 'none',
                    borderRadius: 'var(--border-radius)',
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    '&:hover': {
                      backgroundColor: 'var(--accent-hover)',
                    },
                    display: { xs: 'none', md: 'flex' },
                    ml: 'var(--spacing-sm)',
                  }}
                >
                  <TranslatedText>Login</TranslatedText>
                </Button>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    color: "var(--text-light)",
                    alignSelf: "center",
                    fontWeight: "var(--font-weight-medium)",
                    display: { xs: 'none', md: 'block' },
                    mr: 2
                  }}
                >
                  <TranslatedText>Welcome,</TranslatedText> {user.firstName}
                </Typography>
                <Button
                  onClick={onLogout}
                  sx={{
                    color: 'var(--text-light)',
                    fontWeight: 'var(--font-weight-bold)',
                    textTransform: 'none',
                    transition: 'var(--transition-normal)',
                    '&:hover': { color: 'var(--accent)' },
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  <TranslatedText>Logout</TranslatedText>
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleSidebar}
        sx={{
          "& .MuiDrawer-paper": {
            width: "var(--drawer-width)",
            background: "var(--primary)",
            color: "var(--text-light)",
            paddingTop: {
              xs: "var(--nav-height-mobile)",
              sm: "var(--nav-height)",
            },
            zIndex: "var(--z-drawer)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-md)",
            marginTop: "var(--spacing-lg)",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "120px",
              width: "auto",
              marginBottom: "var(--spacing-md)",
            }}
          />
        </Box>
        <List>
          {/* Current Navigation Items */}
          {currentNavItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "var(--bg-accent)",
                  "&:hover": {
                    backgroundColor: "var(--bg-accent-hover)",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: "var(--text-light)" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={<TranslatedText>{item.label}</TranslatedText>} />
            </ListItem>
          ))}

          {/* Protected Navigation Items */}
          {user && (
            <>
              <Divider
                sx={{
                  my: "var(--spacing-sm)",
                  backgroundColor: "var(--border-light)",
                }}
              />
              {protectedNavItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "var(--bg-accent)",
                      "&:hover": {
                        backgroundColor: "var(--bg-accent-hover)",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "var(--text-light)" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={<TranslatedText>{item.label}</TranslatedText>} />
                </ListItem>
              ))}
            </>
          )}

          {/* Language Toggle for Mobile */}
          <Divider
            sx={{
              my: "var(--spacing-sm)",
              backgroundColor: "var(--border-light)",
            }}
          />
          {/* Language header item */}
          <ListItem 
            sx={{ 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              py: 1.5,
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            <ListItemIcon sx={{ color: "var(--accent)" }}>
              <TranslateIcon />
            </ListItemIcon>
            <ListItemText 
              primary={<TranslatedText>Language</TranslatedText>} 
              sx={{ '& .MuiTypography-root': { fontWeight: 'bold' } }}
            />
          </ListItem>
          
          {/* Language options as separate list items */}
          {availableLanguages && availableLanguages.map((lang) => (
            <ListItem 
              button 
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              sx={{
                pl: 6,
                py: 1.5,
                borderLeft: language === lang.code ? '4px solid var(--accent)' : '4px solid transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                ...(language === lang.code && {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }),
              }}
            >
              <ListItemText 
                primary={lang.name} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '0.9rem',
                    fontWeight: language === lang.code ? 'bold' : 'normal',
                  } 
                }}
              />
              {language === lang.code && (
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <span>✓</span>
                </ListItemIcon>
              )}
            </ListItem>
          ))}
          
          {/* Authentication Items */}
          <Divider
            sx={{
              my: "var(--spacing-sm)",
              backgroundColor: "var(--border-light)",
            }}
          />
          {!user ? (
            <>
              <ListItem button onClick={() => handleNavigation("/register")}>
                <ListItemIcon sx={{ color: "var(--text-light)" }}>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary={<TranslatedText>Sign Up</TranslatedText>} />
              </ListItem>
              <ListItem button onClick={() => handleNavigation("/login")}>
                <ListItemIcon sx={{ color: "var(--text-light)" }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={<TranslatedText>Login</TranslatedText>} />
              </ListItem>
            </>
          ) : (
            <ListItem button onClick={onLogout}>
              <ListItemIcon sx={{ color: "var(--text-light)" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={<TranslatedText>Logout</TranslatedText>} />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default NavBar;
