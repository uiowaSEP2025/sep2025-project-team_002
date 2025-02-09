import React from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowRightIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Signup() {
  // Form state example
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    verifyPassword: ''
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here will be my backend form validation
    console.log('Form submitted:', formData);
  };

  const [showFeatures, setShowFeatures] = React.useState(false);

  const handleToggleFeatures = () => {
    setShowFeatures(prev => !prev);
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Side: App Description */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundColor: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Typography variant="h3" gutterBottom>
          Athletic Insider:
        </Typography>
        <Typography variant="h6" gutterBottom>
          Sign up to explore future school!
        </Typography>
        <Typography
        variant="subtitle1"
        gutterBottom
        onClick={handleToggleFeatures}
        sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Take a peak of our top features
            {showFeatures ? (
            <ArrowRightIcon sx={{ mr: 0 }} />
          ) : (
            <ArrowDropDownIcon sx={{ mr: 0 }} />
          )}
        </Typography>
        {showFeatures && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Share your collegiate athletic experiences anonymously.</li>
            <li>Help transfer athletes find schools that match their desires.</li>
            <li>Rate facilities, team culture, coaching, dining, travel, and more.</li>
            <li>Gain insights into athletic department culture and additional resources.</li>
          </Box>
        </motion.div>
      )}
      </Grid>

      {/* Right Side: Signup Form */}
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
        {/* some animation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
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
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="Confirm Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              // Add a small hover animation:
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </Button>
          </form>
        </motion.div>
      </Grid>
    </Grid>
  );
}

export default Signup;
