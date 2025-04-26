import React, { useState, useEffect } from 'react';
import TranslatedText from '../components/TranslatedText';
import { 
  Box, Typography, Paper, Grid, IconButton, CircularProgress, 
  Alert, Snackbar, Divider, Select, MenuItem, Button, 
  FormControl, InputLabel, FormHelperText, OutlinedInput, Chip,
  Fade, Grow, Skeleton, useMediaQuery, useTheme
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/theme.css';
import { 
  searchNewsArticles, 
  toggleArticleFavorite, 
  getFavoriteArticles
} from '../services/api';
import ArticleCard from '../components/Articles/ArticleCard';
import axios from 'axios';

const AVAILABLE_CATEGORIES = [
  'business', 
  'entertainment', 
  'general', 
  'health', 
  'science', 
  'sports', 
  'technology'
];

const Articles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [plan, setPlan] = useState('Free'); // Default to 'Free'

  // News article state variables
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [favoriteArticles, setFavoriteArticles] = useState([]);
  const [articleLoading, setArticleLoading] = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  // Get theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch user info to update the plan from the database
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/user-info');
        if (response.status === 200) {
          setPlan(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
    fetchFavoriteArticles();
    setLoading(false);
  }, []);

  const fetchFavoriteArticles = async () => {
    try {
      const response = await getFavoriteArticles();
      setFavoriteArticles(response.favorites || []);
    } catch (err) {
      console.error('Error fetching favorite articles:', err);
      setNotification({
        open: true,
        message: <TranslatedText>Failed to load favorite articles</TranslatedText>,
        severity: 'error'
      });
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategories = event.target.value;
    // Limit to maximum 2 categories
    if (selectedCategories.length <= 2) {
      setCategories(selectedCategories);
    }
  };

  const handleSearchArticles = async () => {
    if (categories.length === 0) {
      setNotification({
        open: true,
        message: <TranslatedText>Please select at least one category</TranslatedText>,
        severity: 'warning'
      });
      return;
    }

    try {
      setArticleLoading(true);
      setShowArticles(true);
      
      // Add loading placeholders
      setArticles(Array(6).fill({ loading: true }));
      
      const response = await searchNewsArticles(categories);
      
      // Update favorite status for articles
      const articlesWithFavoriteStatus = response.articles.map(article => {
        const isFavorite = favoriteArticles.some(fav => fav.uuid === article.uuid);
        return { ...article, is_favorite: isFavorite };
      });
      
      setArticles(articlesWithFavoriteStatus);
    } catch (err) {
      console.error('Error searching articles:', err);
      setNotification({
        open: true,
        message: <TranslatedText>Failed to fetch articles</TranslatedText>,
        severity: 'error'
      });
      setArticles([]); // Clear loading placeholders on error
    } finally {
      setArticleLoading(false);
    }
  };

  const handleArticleFavoriteToggle = async (article) => {
    // Only restrict Free users; lift restrictions for Pro or Admin
    if (String(plan).toLowerCase() === 'free') {
      setNotification({
        open: true,
        message: <TranslatedText>Limited Access, for Pro only</TranslatedText>,
        severity: 'error',
      });
      return;
    }

    try {
      const response = await toggleArticleFavorite(article);
      
      if (response.success) {
        // Update article in articles list
        setArticles(articles.map(a => 
          a.uuid === article.uuid ? { ...a, is_favorite: response.is_favorite } : a
        ));
        
        // Update favorite articles list
        if (response.is_favorite) {
          setFavoriteArticles([...favoriteArticles, { ...article, is_favorite: true }]);
          setNotification({ 
            open: true, 
            message: <TranslatedText>Added to saved articles!</TranslatedText>, 
            severity: 'success' 
          });
        } else {
          setFavoriteArticles(favoriteArticles.filter(a => a.uuid !== article.uuid));
          setNotification({ 
            open: true, 
            message: <TranslatedText>Removed from saved articles!</TranslatedText>, 
            severity: 'info' 
          });
        }
      }
    } catch (err) {
      console.error('Error toggling article favorite:', err);
      setNotification({ 
        open: true, 
        message: <TranslatedText>Failed to update article save status.</TranslatedText>, 
        severity: 'error' 
      });
    }
  };

  const handleSummarizeArticle = (article) => {
    // Store the article URL in localStorage to be used by AISummary
    localStorage.setItem('articleToSummarize', article.url);
    // Navigate to AISummary page
    window.location.href = '/ai-summary';
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--spacing-xl)',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 'var(--spacing-xl)',
            maxWidth: '900px',
            width: '100%',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Skeleton variant="text" height={40} width="50%" sx={{ mb: 4 }} />
          
          <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 'var(--border-radius-md)' }} />
          
          <Skeleton variant="text" height={40} width="50%" sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 'var(--border-radius-md)' }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
          overflowY: 'auto',
        }}
      >
        <Snackbar 
          open={notification.open} 
          autoHideDuration={3000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        <Paper
          elevation={6}
          sx={{
            padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
            maxWidth: '900px',
            width: '100%',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* News Article Selection with improved styling */}
          <Grow in={true} timeout={800}>
            <Box sx={{ padding: 'var(--spacing-md)', mb: 2 }}>
              <Typography 
                variant="h4" 
                className="heading-primary"
                gutterBottom 
                sx={{ 
                  textAlign: 'left', 
                  pl: 'var(--spacing-md)', 
                  pr: 'var(--spacing-md)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 'var(--spacing-md)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2
                  }
                }}
              >
                <TranslatedText>News Articles</TranslatedText>
              </Typography>
            </Box>
          </Grow>
          <Box sx={{ pl: 'var(--spacing-md)', pr: 'var(--spacing-md)', mb: 4 }}>
            <FormControl sx={{ m: 1, width: '100%' }}>
              <InputLabel id="category-select-label"><TranslatedText>Categories</TranslatedText></InputLabel>
              <Select
                labelId="category-select-label"
                multiple
                value={categories}
                onChange={handleCategoryChange}
                input={<OutlinedInput label="Categories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'var(--primary-light)',
                            color: 'white',
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {AVAILABLE_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    <TranslatedText>{category.charAt(0).toUpperCase() + category.slice(1)}</TranslatedText>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText><TranslatedText>Select up to 2 categories</TranslatedText></FormHelperText>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={articleLoading ? null : <SearchIcon />}
              onClick={handleSearchArticles}
              disabled={articleLoading}
              sx={{ 
                mt: 2, 
                mb: 2, 
                minWidth: 150,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-md)',
                },
                '&:after': articleLoading ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  animation: 'loading 1.5s infinite linear',
                  '@keyframes loading': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                } : {}
              }}
            >
              {articleLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  <TranslatedText>Searching...</TranslatedText>
                </Box>
              ) : <TranslatedText>Search Articles</TranslatedText>}
            </Button>
          </Box>


        {/* Article Results with improved loading and empty states */}
        {showArticles && (
          <Fade in={true} timeout={800}>
            <Box sx={{ mb: 4 }}>
              {articles.length > 0 ? (
                <Grid container spacing={3}>
                  {articles.map((article, index) => (
                    <Grow in={true} timeout={(index + 1) * 200} key={article.uuid || index}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ArticleCard 
                          article={article}
                          onToggleFavorite={handleArticleFavoriteToggle}
                          onSummarize={handleSummarizeArticle}
                          loading={article.loading || false}
                        />
                      </Grid>
                    </Grow>
                  ))}
                </Grid>
              ) : (
                !articleLoading && (
                  <Fade in={true} timeout={500}>
                    <Paper 
                      elevation={2}
                      sx={{
                        p: 4,
                        mb: 3,
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-lg)',
                        textAlign: 'center',
                        border: '1px dashed var(--border-color)',
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 60, color: 'var(--text-secondary)', mb: 2, opacity: 0.6 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}><TranslatedText>No articles found</TranslatedText></Typography>
                      <Typography variant="body2" color="text.secondary">
                        <TranslatedText>Try different categories or try again later</TranslatedText>
                      </Typography>
                    </Paper>
                  </Fade>
                )
              )}
            </Box>
          </Fade>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Saved Articles Section with improved animations and UI */}
        <Grow in={true} timeout={1000}>
          <Box sx={{ padding: 'var(--spacing-md)', mb: 2 }}>
            <Typography 
              variant="h4" 
              className="heading-primary"
              gutterBottom 
              sx={{ 
                textAlign: 'left', 
                pl: 'var(--spacing-md)', 
                pr: 'var(--spacing-md)',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 'var(--spacing-md)',
                  width: 80,
                  height: 4,
                  backgroundColor: 'var(--primary)',
                  borderRadius: 2
                }
              }}
            >
              <TranslatedText>Saved Articles</TranslatedText>
            </Typography>
          </Box>
        </Grow>

        <Box sx={{ mb: 4 }}>
          {favoriteArticles.length > 0 ? (
            <Grid container spacing={3}>
              {favoriteArticles.map((article, index) => (
                <Grow in={true} timeout={(index + 1) * 200} key={article.uuid || index}>
                  <Grid item xs={12} sm={6} md={4}>
                    <ArticleCard 
                      article={article}
                      onToggleFavorite={handleArticleFavoriteToggle}
                      onSummarize={handleSummarizeArticle}
                    />
                  </Grid>
                </Grow>
              ))}
            </Grid>
          ) : (
            <Fade in={true} timeout={500}>
              <Paper
                elevation={2}
                sx={{
                  padding: 'var(--spacing-lg)',
                  mb: 'var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--border-radius-lg)',
                  textAlign: 'center',
                  border: '1px dashed var(--border-color)',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarBorderIcon sx={{ fontSize: 60, color: 'var(--text-secondary)', mb: 2, opacity: 0.6 }} />
                <Typography variant="h6">
                  {String(plan).toLowerCase() === 'free'
                    ? <TranslatedText>Limited Access, for Pro only</TranslatedText>
                    : <TranslatedText>No saved articles yet</TranslatedText>}
                </Typography>
                {String(plan).toLowerCase() !== 'free' && (
                  <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
                    <TranslatedText>Star articles to save them here</TranslatedText>
                  </Typography>
                )}
              </Paper>
            </Fade>
          )}
        </Box>
      </Paper>
    </Box>
  </Fade>
  );
};

export default Articles;