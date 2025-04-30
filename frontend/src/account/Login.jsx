import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Collapse,
  IconButton,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../utils/config.js";
import { useUser } from '../context/UserContext';


function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { fetchUser } = useUser() || {};

  // State for the login form
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State for feedback messages (error/success)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  // State for toggling the features list on the left side
  const [showFeatures, setShowFeatures] = useState(false);

  // State for animation classes
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setFadeIn(true);
  }, []);

  // Toggle the display of feature list
  const handleToggleFeatures = () => {
    setShowFeatures(prev => !prev);
  };

  // Update formData state as inputs change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission and send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: check if email and password are entered
    if (!formData.email || !formData.password) {
      setMessage("Please enter both email and password!");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access); // Store auth token
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        await fetchUser();
        // Short delay for user to see success message
        setTimeout(() => {
          navigate("/secure-home"); // Redirect to secure home page
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage("Login failed: " + (errorData.detail || errorData.error || "Invalid credentials"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes("Failed to fetch")) {
        setMessage("Unable to reach the server. Please check your internet connection or try again later.");
      } else {
        setMessage("Network error: " + error.message);
      }
      setMessageType("error");
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Backward Arrow Button at Top Left */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1000
        }}
      >
        <Button
          variant="text"
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Side: App Description and Feature Toggle */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 10,
            px: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative circles */}
          <Box sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            top: '-100px',
            left: '-100px',
          }} />
          <Box sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            bottom: '50px',
            right: '-50px',
          }} />

          <Box sx={{
            position: 'relative',
            zIndex: 2,
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
          }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Athletic Insider
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, opacity: 0.9 }}>
              Login to explore your future school!
            </Typography>

            <Box
              onClick={handleToggleFeatures}
              sx={{
                mt: 4,
                py: 1,
                px: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500
                }}
              >
                Take a peek at our top features
                {showFeatures ? (
                  <ArrowRightIcon sx={{ ml: 1 }} />
                ) : (
                  <ArrowDropDownIcon sx={{ ml: 1 }} />
                )}
              </Typography>
            </Box>

            <Collapse in={showFeatures} timeout={400}>
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  textAlign: 'left'
                }}
              >
                {[
                  "Share your collegiate athletic experiences anonymously.",
                  "Help transfer athletes find schools that match their desires.",
                  "Rate facilities, team culture, coaching, dining, travel, and more.",
                  "Gain insights into athletic department culture and additional resources."
                ].map((feature, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.9)',
                      mt: 1.5
                    }}
                  >
                    <CheckCircleIcon sx={{ color: theme.palette.success.light, mr: 1, fontSize: '1rem' }} />
                    {feature}
                  </Typography>
                ))}
              </Paper>
            </Collapse>
          </Box>
        </Grid>

        {/* Right Side: Login Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            backgroundColor: theme.palette.background.default
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              transitionDelay: '0.2s'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Login
              </Typography>

              {message && (
                <Alert
                  severity={messageType}
                  sx={{ mb: 3, borderRadius: 2 }}
                  variant="filled"
                >
                  {message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 1 }}
                />

                <Box sx={{ mt: 1, textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    component={Link}
                    to="/forgot-password"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>

                <Button
                  id="login-button"
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                    },
                    '&:active': {
                      transform: 'translateY(1px)'
                    }
                  }}
                >
                  Login
                </Button>
              </form>
            </Paper>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Login;
