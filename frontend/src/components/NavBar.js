import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const pages = [
  { label: 'Home', path: '/' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
  { label: 'Dashboard', path: '/admin' },
  { label: 'Feedback', path: '/feedback' }
];

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Student Feedback System
        </Typography>
        <Box>
          {pages.map(page => (
            <Button
              key={page.path}
              color={location.pathname === page.path ? 'secondary' : 'inherit'}
              component={Link}
              to={page.path}
              sx={{ mx: 1 }}
            >
              {page.label}
            </Button>
          ))}
          <Button color="inherit" onClick={handleLogout} sx={{ mx: 1 }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar; 