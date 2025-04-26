import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        if (response.status === 200) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError('Failed to load admin stats');
      }
    };
    fetchAdminStats();
  }, []);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!stats) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Users Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Counts</Typography>
            <Typography>Total Users: {stats.user_counts.total}</Typography>
            <Typography>Free Users: {stats.user_counts.free}</Typography>
            <Typography>Pro Users: {stats.user_counts.pro}</Typography>
            <Typography>Admin Users: {stats.user_counts.admin}</Typography>
          </Paper>
        </Grid>
        
        {/* AI Summaries Usage */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">AI Summaries</Typography>
            <Typography>{stats.ai_summary_count} summaries generated</Typography>
          </Paper>
        </Grid>
        
        {/* Scheduled Posts Usage */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Scheduled Posts</Typography>
            <Typography>{stats.scheduled_post_count} posts scheduled</Typography>
          </Paper>
        </Grid>
        
        {/* Email System Usage */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Email System</Typography>
            <Typography>{stats.email_usage_count} emails sent</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;