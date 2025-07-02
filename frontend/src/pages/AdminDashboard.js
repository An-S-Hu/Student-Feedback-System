import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

function AdminDashboard() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Welcome, admin! Here you can view and manage feedback, analytics, and more.
          </Typography>
          {/* Add admin features here */}
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 