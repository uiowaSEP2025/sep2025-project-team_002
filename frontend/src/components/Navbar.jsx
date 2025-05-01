import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout, profilePic } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force re-render of navigation items when login state changes
  useEffect(() => {
    // Close any open menus when login state changes
    setAnchorEl(null);
  }, [isLoggedIn]);

  // Handle drawer toggle
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout(); // This will now handle navigation and state reset
  };

  // Navigation items
  const navItems = isLoggedIn
    ? [
        { text: 'Dashboard', path: '/secure-home' },
        // Only show My Reviews for non-high school users (transfer or graduate)
        ...(user?.transfer_type !== "high_school" ? [{ text: 'My Reviews', path: '/account/my-reviews' }] : []),
        // Only show Preferences for non-graduate users (high_school or transfer)
        ...(user?.transfer_type !== "graduate" ? [{ text: 'Preferences', path: '/user-preferences' }] : []),
      ]
    : [
        { text: 'Home', path: '/' },
        { text: 'About', path: '/about' },
      ];

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        backgroundColor: theme.palette.background.dark,
        color: '#fff',
        p: 2,
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Athletic Insider
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close drawer"
          onClick={toggleDrawer(false)}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              backgroundColor:
                location.pathname === item.path
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isLoggedIn ? (
          <ListItem
            button
            onClick={logout}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <>
            <ListItem
              button
              component={RouterLink}
              to="/login"
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              button
              component={RouterLink}
              to="/signup"
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
            >
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled
            ? theme.palette.background.paper
            : 'transparent',
          boxShadow: scrolled ? 1 : 'none',
          color: scrolled ? theme.palette.text.primary : '#fff',
          transition: 'all 0.3s ease',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to={isLoggedIn ? '/secure-home' : '/'}
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Athletic Insider
            </Typography>

            {/* Mobile menu icon */}
            {isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {isLoggedIn && (
                  <Tooltip title="Account">
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{ mr: 2 }}
                      aria-controls="profile-menu"
                      aria-haspopup="true"
                    >
                      {user?.profile_picture ? (
                        <Avatar
                          src={profilePic}
                          alt={`${user.first_name} ${user.last_name}`}
                          sx={{ width: 32, height: 32 }}
                        />
                      ) : (
                        <AccountCircleIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* Desktop navigation */}
            {!isMobile && (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  {navItems.map((item) => (
                    <Typography
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      variant="body1"
                      sx={{
                        color: 'inherit',
                        mx: 2,
                        py: 1,
                        textDecoration: 'none',
                        fontWeight: 500,
                        position: 'relative',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          width: location.pathname === item.path ? '100%' : '0%',
                          height: '2px',
                          backgroundColor: 'currentColor',
                          transition: 'width 0.3s ease',
                        },
                        '&:hover::after': {
                          width: '100%',
                        },
                      }}
                    >
                      {item.text}
                    </Typography>
                  ))}
                </Box>

                <Box>
                  {isLoggedIn ? (
                    <Tooltip title="Account">
                      <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{ ml: 2 }}
                        aria-controls="profile-menu"
                        aria-haspopup="true"
                      >
                        {user?.profile_picture ? (
                          <Avatar
                            src={profilePic}
                            alt={`${user.first_name} ${user.last_name}`}
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <AccountCircleIcon fontSize="large" />
                        )}
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Typography
                        component={RouterLink}
                        to="/login"
                        variant="body1"
                        sx={{
                          ml: 2,
                          color: 'inherit',
                          textDecoration: 'none',
                          fontWeight: 500,
                          position: 'relative',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -2,
                            left: 0,
                            width: '0%',
                            height: '2px',
                            backgroundColor: 'currentColor',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover::after': {
                            width: '100%',
                          },
                        }}
                      >
                        Login
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/signup"
                        variant="outlined"
                        color="inherit"
                        size="small"
                        sx={{
                          ml: 2,
                          borderRadius: 4,
                          borderWidth: '1px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderWidth: '1px',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Profile menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate('/account');
          }}
        >
          My Account
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate('/account/settings');
          }}
        >
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* Toolbar spacer */}
      <Toolbar />
    </>
  );
};

export default Navbar;
