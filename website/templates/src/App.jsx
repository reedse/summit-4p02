import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Template from './pages/Template';
import AISummary from './pages/AISummary';
import PostSystem from './pages/PostSystem';
import Articles from './pages/Articles';
import Newsletters from './pages/Newsletters';
import History from './pages/History';
import Translation from './pages/Translation';
import AboutUs from './pages/AboutUs';  
import Contact from './pages/Contact';  
import Pricing from './pages/Pricing';
import { Box } from '@mui/material';
import NavBar from './components/NavBar';
import './styles/theme.css';
import PostHub from './pages/PostHub';
import { LanguageProvider } from './contexts/LanguageContext';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <LanguageProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <NavBar user={user} onLogout={handleLogout} />
        <Box 
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            width: '100%',
            paddingTop: { 
              xs: 'var(--nav-height-mobile)',
              sm: 'var(--nav-height)'
            },
            background: 'var(--bg-secondary)',
            overflowX: 'hidden'
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/home" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="/aboutus" element={<AboutUs />} />  
            <Route path="/contact" element={<Contact />} />  
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/templates"
              element={user ? <Template /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/ai-summary"
              element={user ? <AISummary /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/post-system"
              element={user ? <PostSystem /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/articles"
              element={user ? <Articles /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/newsletters"
              element={user ? <Newsletters /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/history"
              element={user ? <History /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/translation"
              element={user ? <Translation /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/post-hub"
              element={user ? <PostHub /> : <Navigate to="/login" replace />}
            />

            {/* Redirect old favourites route to the new articles route */}
            <Route
              path="/favourites" 
              element={<Navigate to="/articles" replace />}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/home"} replace />} />
            
            {/* Catch all for 404 pages - add this at the end of your routes */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/home"} replace />} />
          </Routes>
        </Box>
      </Box>
    </LanguageProvider>
  );
};

export default App;