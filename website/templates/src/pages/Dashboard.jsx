import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import { Box, Typography, Grid, Paper, Button, Stack, Card, CardContent, IconButton, CircularProgress } from '@mui/material';
import TranslatedText from '../components/TranslatedText';
import {
  Edit as EditIcon,
  Description as TemplateIcon,
  AutoFixHigh as AIIcon,
  Share as PostIcon,
  Star as FavoritesIcon,
  Email as NewsletterIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Speed as SpeedIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/theme.css';
// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon, trend }) => (
  <Paper
    sx={{
      p: 'var(--spacing-lg)',
      background: 'var(--bg-primary)',
      borderRadius: 'var(--border-radius-lg)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid rgba(var(--primary), 0.1)',
      transition: 'var(--transition-normal)',
      '&:hover': {
        boxShadow: 'var(--shadow-lg)'
      }
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ 
        p: 'var(--spacing-md)', 
        borderRadius: 'var(--border-radius-md)', 
        background: 'var(--bg-accent)' 
      }}>
        {React.cloneElement(icon, { sx: { color: 'var(--primary)' } })}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          <TranslatedText>{title}</TranslatedText>
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" sx={{ 
            color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)', 
            fontWeight: 'var(--font-weight-bold)' 
          }}>
            {trend} <TranslatedText>this month</TranslatedText>
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onClick }) => (
  <Button
    variant="contained"
    startIcon={React.cloneElement(icon, { sx: { color: 'var(--text-light)' } })}
    onClick={onClick}
    sx={{
      py: 'var(--spacing-md)',
      px: 'var(--spacing-lg)',
      background: 'var(--primary)',
      color: 'var(--text-light)',
      boxShadow: 'var(--shadow-md)',
      '&:hover': {
        background: 'var(--primary-light)',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-lg)',
      },
      width: '100%',
      justifyContent: 'flex-start',
      transition: 'var(--transition-normal)'
    }}
  >
    <TranslatedText>{label}</TranslatedText>
  </Button>
);

// Feature Card Component
const FeatureCard = ({ title, icon, description, path }) => {
  const navigate = useNavigate();
  return (
    <Paper
      sx={{
        p: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--border-radius-lg)',
        color: 'var(--text-primary)',
        transition: 'var(--transition-normal)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(var(--primary), 0.1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'var(--shadow-lg)',
          borderColor: 'var(--primary)',
        }
      }}
      onClick={() => navigate(path)}
    >
      {React.cloneElement(icon, { 
        sx: { 
          fontSize: 'var(--font-size-xxxl)', 
          mb: 'var(--spacing-md)', 
          color: 'var(--primary)' 
        } 
      })}
      <Typography variant="h6" gutterBottom sx={{ 
        color: 'var(--text-primary)', 
        fontWeight: 'var(--font-weight-bold)' 
      }}>
        <TranslatedText>{title}</TranslatedText>
      </Typography>
      <Typography variant="body2" textAlign="center" sx={{ color: 'var(--text-secondary)' }}>
        <TranslatedText>{description}</TranslatedText>
      </Typography>
    </Paper>
  );
};

// Placeholder data for quick actions
const quickActions = [
  
  {
    icon: <PostIcon />,
    label: 'Create Post',
    onClick: () => navigate('/post-hub'), // Navigate to the Create Post page
  },
  {
    icon: <AIIcon />,
    label: 'Generate Summary',
    onClick: () => navigate('/summaries/generate'), // Navigate to the Generate Summary page
  },
  {
    icon: <NewsletterIcon />,
    label: 'Send Newsletter',
  
    onClick: () => navigate('/post-hub'), // Navigate to the Send Newsletter page
  },
  {
    icon: <TemplateIcon />,
    label: 'Explore Templates',
    onClick: () => navigate('/templates'), // Navigate to the Templates page
  },
];

// Placeholder data for features
const features = [
  { title: 'Templates', icon: <TemplateIcon />, description: 'Browse and use content templates.', path: '/templates' },
  { title: 'Articles', icon: <FavoritesIcon />, description: 'View news and saved articles.', path: '/articles' },
  { title: 'History', icon: <HistoryIcon />, description: 'Review your content history.', path: '/history' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [sentNewsletterCount, setSentNewsletterCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [plan, setPlan] = useState('Free'); // Default to Free plan
  const [runTutorial, setRunTutorial] = useState(false); // Don't start tutorial automatically
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sample data for charts - in a real app, this would come from API
  const [monthlyData, setMonthlyData] = useState({
    summaries: [4, 7, 5, 9, 11, newsletterCount],
    newsletters: [2, 3, 5, 4, 6, sentNewsletterCount],
    subscribers: [10, 15, 22, 28, 32, subscriberCount]
  });

  // New state for weekly data
  const [weeklyData, setWeeklyData] = useState({
    summaries: [0, 0, 0, 0, 0, 0, 0],
    newsletters: [0, 0, 0, 0, 0, 0, 0],
  });

  // Chart configuration
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Theme colors as direct values instead of CSS variables
  const themeColors = {
    primary: '#8B0000',
    primaryLight: '#a50000',
    primaryDark: '#660000',
    secondary: '#ffdd57',
    bgPaper: '#ffffff',
    bgAccent: 'rgba(139, 0, 0, 0.1)',
    bgAccentHover: 'rgba(139, 0, 0, 0.2)',
    textPrimary: '#1a1a1a',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderColorLight: 'rgba(0, 0, 0, 0.08)',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };
  
  const barChartData = {
    labels: days,
    datasets: [
      {
        label: 'Summaries',
        data: weeklyData.summaries,
        backgroundColor: themeColors.primary,
        borderColor: themeColors.primaryDark,
        borderWidth: 1,
        hoverBackgroundColor: themeColors.primaryLight,
      },
    ],
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: themeColors.bgPaper,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textPrimary,
        borderColor: themeColors.borderColor,
        borderWidth: 1,
        padding: 12,
        boxWidth: 10,
        usePointStyle: true,
        callbacks: {
          labelTextColor: () => themeColors.textPrimary
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: themeColors.borderColorLight,
        },
        ticks: {
          color: themeColors.textSecondary,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: themeColors.textSecondary,
        },
      },
    },
  };
  
  const lineChartData = {
    labels: days,
    datasets: [
      {
        label: 'Newsletters',
        data: weeklyData.newsletters,
        borderColor: themeColors.success,
        backgroundColor: 'rgba(76, 175, 80, 0.1)', // Success with opacity
        tension: 0.4,
        fill: true,
        pointBackgroundColor: themeColors.success,
        pointBorderColor: themeColors.bgPaper,
        pointHoverBackgroundColor: themeColors.success,
        pointHoverBorderColor: themeColors.success,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: themeColors.bgPaper,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textPrimary,
        borderColor: themeColors.borderColor,
        borderWidth: 1,
        padding: 12,
        boxWidth: 10,
        usePointStyle: true,
        callbacks: {
          labelTextColor: () => themeColors.textPrimary
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: themeColors.borderColorLight,
        },
        ticks: {
          color: themeColors.textSecondary,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: themeColors.textSecondary,
        },
      },
    },
  };
  
  const doughnutChartData = {
    labels: ['Subscribers', 'Target'],
    datasets: [
      {
        data: [subscriberCount, 100 - subscriberCount],
        backgroundColor: [
          themeColors.primary,
          themeColors.bgAccent,
        ],
        borderColor: [
          themeColors.primaryDark,
          themeColors.borderColorLight,
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          themeColors.primaryLight,
          themeColors.bgAccentHover,
        ],
      },
    ],
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: themeColors.bgPaper,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textPrimary,
        borderColor: themeColors.borderColor,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return `${value}%`;
          },
          labelTextColor: () => themeColors.textPrimary
        }
      }
    },
    cutout: '70%',
  };

  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing dashboard data...');
      
      // Use the explicit backend URL for refreshing data
      const backendUrl = import.meta.env.VITE_API_URL || 'https://reedse.pythonanywhere.com';
      console.log('Using explicit backend URL for refresh:', backendUrl);
      
      await Promise.all([
        fetchUserInfo(),
        fetchNewsletterCount(),
        fetchSentNewsletterCount(), 
        fetchSubscribers(),
        fetchWeeklySummaries(),
        fetchWeeklyNewsletters()
      ]);
      
      console.log('Dashboard data refresh complete');
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch user info, newsletter count, sent newsletters count, and Twitter post count
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check auth first
        console.log('About to check auth from Dashboard');
        await api.get('/api/check-auth');
        
        // Then fetch all data
        const results = await Promise.allSettled([
          fetchUserInfo(),
          fetchNewsletterCount(),
          fetchSentNewsletterCount(),
          fetchSubscribers(),
          fetchWeeklySummaries(),
          fetchWeeklyNewsletters()
        ]);

        // Process results and log any failures
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to fetch data set ${index}:`, result.reason);
          }
        });

        // Check if all critical data failed to load
        const criticalDataFailed = results.slice(0, 4).every(r => r.status === 'rejected');
        if (criticalDataFailed) {
          throw new Error('Failed to load critical dashboard data');
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserInfo = async () => {
      try {
        console.log('Fetching user info from Dashboard');
        const response = await api.get('/api/user-info');
        console.log('User info response:', response);
        if (response.data) {
          setPlan(response.data.role);
          setIsAdmin(response.data.role.toLowerCase() === 'admin');
        }
        return response.data;
      } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
      }
    };

    const fetchNewsletterCount = async () => {
      try {
        console.log('Fetching templates from Dashboard');
        // Test with explicit backend URL to see if this resolves the issue
        const backendUrl = import.meta.env.VITE_API_URL || 'https://reedse.pythonanywhere.com';
        console.log('Using explicit backend URL:', backendUrl);
        
        // Use the direct backend URL for this request as a test
        const response = await axios.get(`${backendUrl}/api/template/saved`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Templates response:', response);
        setNewsletterCount(response.data.templates.length);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    const fetchSentNewsletterCount = async () => {
      try {
        console.log('Fetching sent newsletters count from Dashboard');
        const response = await api.get('/api/newsletter/sent-this-month');
        console.log('Sent newsletters response:', response);
        setSentNewsletterCount(response.data.sent_this_month);
      } catch (error) {
        console.error('Error fetching sent newsletters count:', error);
      }
    };

    const fetchSubscribers = async () => {
      try {
        console.log('Fetching subscribers from Dashboard');
        const response = await api.get('/api/subscribers');
        console.log('Subscribers response:', response);
        setSubscriberCount(response.data.subscribers.length);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
      }
    };

    const fetchWeeklySummaries = async () => {
      try {
        console.log('Fetching weekly summaries from Dashboard...');
        const backendUrl = import.meta.env.VITE_API_URL || 'https://reedse.pythonanywhere.com';
        const response = await api.get('/api/summaries/weekly');
        console.log('Weekly summaries response:', response);
        
        // Initialize with zeros for all days
        const weeklySummariesData = Array(7).fill(0);
        
        // Get today's day of week (0-6, where 0 is Sunday)
        const today = new Date().getDay();
        
        // Set today's value to match the newsletterCount from the stat card
        weeklySummariesData[today] = newsletterCount;
        
        // If we have API data, incorporate it for previous days
        if (response.data && response.data.weekly_data) {
          response.data.weekly_data.forEach(item => {
            if (item.sent_at) {
              const itemDate = new Date(item.sent_at);
              const dayOfWeek = itemDate.getDay();
              
              // Only count items from previous days, not today
              if (dayOfWeek !== today) {
                weeklySummariesData[dayOfWeek] += 1;
              }
            }
          });
        }
        
        console.log('Processed weekly summaries data:', weeklySummariesData);
        
        setWeeklyData(prevData => ({
          ...prevData,
          summaries: weeklySummariesData
        }));
      } catch (error) {
        console.error('Error fetching weekly summaries:', error);
        // If API fails, use current count for today
        const fallbackData = Array(7).fill(0);
        fallbackData[new Date().getDay()] = newsletterCount;
        setWeeklyData(prevData => ({
          ...prevData,
          summaries: fallbackData
        }));
      }
    };

    const fetchWeeklyNewsletters = async () => {
      try {
        console.log('Fetching weekly newsletters from Dashboard...');
        const backendUrl = import.meta.env.VITE_API_URL || 'https://reedse.pythonanywhere.com';
        const response = await api.get('/api/newsletters/weekly');
        console.log('Weekly newsletters response:', response);
        
        // Initialize with zeros for all days
        const weeklyNewslettersData = Array(7).fill(0);
        
        // Get today's day of week (0-6, where 0 is Sunday)
        const today = new Date().getDay();
        
        // Set today's value to match the sentNewsletterCount from the stat card
        weeklyNewslettersData[today] = sentNewsletterCount;
        
        // If we have API data, incorporate it for previous days
        if (response.data && response.data.weekly_data) {
          response.data.weekly_data.forEach(item => {
            if (item.created_at) {
              const itemDate = new Date(item.created_at);
              const dayOfWeek = itemDate.getDay();
              
              // Only count items from previous days, not today
              if (dayOfWeek !== today) {
                weeklyNewslettersData[dayOfWeek] += 1;
              }
            }
          });
        }
        
        console.log('Processed weekly newsletters data:', weeklyNewslettersData);
        
        setWeeklyData(prevData => ({
          ...prevData,
          newsletters: weeklyNewslettersData
        }));
      } catch (error) {
        console.error('Error fetching weekly newsletters:', error);
        fallbackNewsletterData();
      }
    };
    
    // Helper function for newsletter fallback data
    const fallbackNewsletterData = () => {
      console.log('Using fallback newsletter data with sentNewsletterCount:', sentNewsletterCount);
      const today = new Date().getDay();
      const updatedNewsletterData = Array(7).fill(0);
      updatedNewsletterData[today] = sentNewsletterCount;
      
      setWeeklyData(prevData => ({
        ...prevData,
        newsletters: updatedNewsletterData
      }));
    };

    // Call our data fetching function
    fetchDashboardData();

    // Set up a 30-second refresh interval for real-time updates
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 30000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  // Update chart data when analytics values change
  useEffect(() => {
    setMonthlyData(prevData => ({
      ...prevData,
      summaries: [...prevData.summaries.slice(0, 5), newsletterCount],
      newsletters: [...prevData.newsletters.slice(0, 5), sentNewsletterCount],
      subscribers: [...prevData.subscribers.slice(0, 5), subscriberCount]
    }));
    
    // Update today's data in the weekly charts as well
    const today = new Date().getDay();
    setWeeklyData(prevData => {
      const updatedSummaries = [...prevData.summaries];
      const updatedNewsletters = [...prevData.newsletters];
      
      updatedSummaries[today] = newsletterCount;
      updatedNewsletters[today] = sentNewsletterCount;
      
      return {
        summaries: updatedSummaries,
        newsletters: updatedNewsletters
      };
    });
  }, [newsletterCount, sentNewsletterCount, subscriberCount]);

  const steps = [
    {
      target: '.welcome-section',
      content: <TranslatedText>Welcome to your dashboard! This is your main hub for managing content and analytics.</TranslatedText>,
      disableBeacon: true,
    },
    {
      target: '.analytics-section',
      content: <TranslatedText>Here you can view key metrics about your content performance.</TranslatedText>,
    },
    {
      target: '.quick-actions-section',
      content: <TranslatedText>Use these buttons to quickly create posts, summaries, or newsletters.</TranslatedText>,
    },
    {
      target: '.features-section',
      content: <TranslatedText>Explore templates, favorites, and history to manage your content.</TranslatedText>,
    },
    {
      target: '.charts-section',
      content: <TranslatedText>These charts show your content performance over time.</TranslatedText>,
    },
    {
      target: '.post-hub-button',
      content: <TranslatedText>Click here to quickly access the Post Hub for all your content needs.</TranslatedText>,
    },
    ...(isAdmin
      ? [
          {
            target: '.admin-panel-section',
            content: <TranslatedText>As an admin, you can manage users and system settings here.</TranslatedText>,
          },
        ]
      : []),
  ];

  const analytics = [
    { title: 'Summary', value: newsletterCount.toLocaleString(), icon: <TrendingUpIcon /> },
    { title: 'Newsletter Post', value: sentNewsletterCount.toLocaleString(), icon: <PeopleIcon /> },
    { title: 'Subscribers', value: subscriberCount.toLocaleString(), icon: <SpeedIcon /> },
    { title: 'Current Plan', value: plan, icon: <ArticleIcon /> }, // Updated to show the user's current plan
  ];

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: 3 
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 'var(--spacing-xl)',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showSkipButton
        locale={{
          back: <TranslatedText>Back</TranslatedText>,
          close: <TranslatedText>Close</TranslatedText>,
          last: <TranslatedText>Finish</TranslatedText>,
          next: <TranslatedText>Next</TranslatedText>,
          skip: <TranslatedText>Skip</TranslatedText>
        }}
        styles={{
          options: {
            zIndex: 1000,
          },
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTutorial(false); // Stop the tutorial
          }
        }}
      />

      {/* Welcome Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 'var(--spacing-xs)' }}>
        <Typography
          variant="h3"
          gutterBottom
          className="welcome-section"
          sx={{
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-bold)',
            m: 0,
          }}
        >
          <TranslatedText>Welcome back,</TranslatedText> {user?.firstName || <TranslatedText>User</TranslatedText>}
        </Typography>
        <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<TemplateIcon />}
          onClick={() => setRunTutorial(true)}
          sx={{
            borderRadius: 'var(--border-radius-md)',
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
            '&:hover': {
              borderColor: 'var(--primary-dark)',
              backgroundColor: 'rgba(var(--primary-rgb), 0.04)',
            }
          }}
        >
          <TranslatedText>Start Tutorial</TranslatedText>
        </Button>
        </Stack>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'var(--text-secondary)',
          mb: 'var(--spacing-xl)',
        }}
      >
        <TranslatedText>Here's what's happening with your content</TranslatedText>
      </Typography>

      {/* Post Hub Button - Prominent call to action */}
      <Box 
        className="post-hub-button"
        sx={{ 
          mb: 'var(--spacing-xl)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Card 
          sx={{ 
            width: '100%', 
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 'var(--shadow-xl)',
            }
          }}
          onClick={() => navigate('/post-hub')}
        >
          <CardContent sx={{ p: 'var(--spacing-lg) !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <DashboardIcon sx={{ color: 'white', fontSize: 'var(--font-size-xxxl)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'var(--font-weight-bold)' }}>
                    <TranslatedText>Post Hub</TranslatedText>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <TranslatedText>Access all your content creation tools in one place</TranslatedText>
                  </Typography>
                </Box>
              </Stack>
              <IconButton 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' } 
                }}
              >
                <ArrowForwardIcon sx={{ color: 'white' }} />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 'var(--spacing-xxl)' }} className="analytics-section">
        {analytics.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <AnalyticsCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Typography
        variant="h5"
        gutterBottom
        className="charts-section"
        sx={{
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        <TranslatedText>Performance Overview</TranslatedText>
      </Typography>

      <Grid container spacing={3} sx={{ mb: 'var(--spacing-xxl)' }}>
        {/* Summary Bar Chart */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 'var(--spacing-lg)',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-md)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-primary)' }}>
              <TranslatedText>Summaries (Last 7 Days)</TranslatedText>
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '200px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Newsletter Line Chart */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 'var(--spacing-lg)',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-md)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-primary)' }}>
              <TranslatedText>Newsletters (Last 7 Days)</TranslatedText>
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '200px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Subscribers Donut Chart */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 'var(--spacing-lg)',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-md)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-primary)' }}>
              <TranslatedText>Subscriber Engagement</TranslatedText>
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Box sx={{ width: '180px', height: '180px', position: 'relative' }}>
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                    {subscriberCount}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    <TranslatedText>Growth</TranslatedText>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Typography
        variant="h5"
        gutterBottom
        className="features-section"
        sx={{
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        <TranslatedText>Features</TranslatedText>
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>

      {/* Admin Panel Section */}
      {isAdmin && (
        <Typography
          variant="h5"
          gutterBottom
          className="admin-panel-section"
          sx={{
            color: 'var(--text-primary)',
            mt: 'var(--spacing-lg)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          <TranslatedText>Admin Panel</TranslatedText>
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard;