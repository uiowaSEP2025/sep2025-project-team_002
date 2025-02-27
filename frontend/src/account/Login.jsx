import React from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowRightIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";  // Import useNavigate for redirection
import API_BASE_URL from "../utils/config.js";

function Login() {
  const navigate = useNavigate(); // Get navigation function

  // State for the login form
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });

  // State for feedback messages (error/success)
  const [message, setMessage] = React.useState('');

  // State for toggling the features list on the left side
  const [showFeatures, setShowFeatures] = React.useState(false);

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
        navigate("/secure-home"); // Redirect to secure home page
      } else {
        const errorData = await response.json();
        setMessage("Login failed: " + "Username or password is incorrect"); 
        //(errorData.error || "Username or password is incorrect") use if trying to debug
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Network error: " + error.message);
    }
  };

  return (
      <Box sx={{ position: 'relative' }}>
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
          onClick={() => navigate("/")}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'black' }}
        >
        </Button>
      </Box>
    <Grid container sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Left Side: App Description and Feature Toggle */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundColor: '#1a1a1a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 10,
          px: 4,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Athletic Insider
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
          Login to explore your future school!
        </Typography>
        <Typography
          variant="subtitle1"
          onClick={handleToggleFeatures}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 4,
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
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'left' }}
            >
              <Box sx={{ p: 2 }}>
                {[
                  "Share your collegiate athletic experiences anonymously.",
                  "Help transfer athletes find schools that match their desires.",
                  "Rate facilities, team culture, coaching, dining, travel, and more.",
                  "Gain insights into athletic department culture and additional resources."
                ].map((feature, index) => (
                  <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#ccc', mt: 1 }}>
                    <CheckCircleIcon sx={{ color: 'lightgreen', mr: 1 }} /> {feature}
                  </Typography>
                ))}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
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
          p: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Login
          </Typography>
          {message && (
            <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              InputProps={{ sx: { borderRadius: '40px' } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{ sx: { borderRadius: '40px' } }}
            />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, borderRadius: '40px' }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </Button>
          </form>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate("/signup")}
              >
                Don't have an account? Sign up here
              </Typography>
            </Box>
        </motion.div>
      </Grid>
    </Grid>
      </Box>
  );
}

export default Login;
