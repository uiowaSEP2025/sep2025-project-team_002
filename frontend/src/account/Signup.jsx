import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
  Collapse,
  Divider,
  useTheme,
  alpha,
  Link as MuiLink
} from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../utils/config.js';

// Use the PasswordStrengthBar you created
import PasswordStrengthBar from "../components/PasswordStrengthBar.jsx";

function Signup() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Local state for the signup form
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    verifyPassword: "",
    transferType: ""
  });

  // Toggles for show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for feedback messages (error/success)
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // State for toggling the features list on the left side
  const [showFeatures, setShowFeatures] = useState(false);

  // State for animation
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Toggle the display of the feature list
  const handleToggleFeatures = () => {
    setShowFeatures((prev) => !prev);
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle Show/Hide password
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Check if confirm password matches
  const passwordsMatch =
    formData.verifyPassword.length > 0 && formData.password === formData.verifyPassword;

  const isSubmitDisabled = !(
      formData.first_name &&
      formData.last_name &&
      formData.email &&
      formData.password &&
      formData.verifyPassword &&
      formData.transferType &&
      passwordsMatch
  );

  // Submit signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any required field is missing
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.verifyPassword || !formData.transferType) {
        setMessage("Please fill in all required fields.");
        setMessageType("error");
        return;
    }

    if (!passwordsMatch) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/signup/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          transfer_type: formData.transferType
        })
      });

      if (response.ok) {
        setMessage("Signup successful! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login", { state: { fromSignup: true } }), 1500);
      } else {
        const errorData = await response.json();
        setMessage("Signup failed: " + (errorData.detail || errorData.error || "Unknown error"));
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
    <Box sx={{ position: "relative", minHeight: '100vh' }}>
      {/* Back Arrow to home */}
      <Box
        sx={{
          position: "fixed",
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
            color: "white",
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Grid container sx={{ minHeight: "100vh" }}>
        {/* LEFT SIDE: Modern App Description & Feature Dropdown */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 10,
            px: 4,
            textAlign: "center",
            position: "relative",
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
            Sign up to explore your future school!
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

        {/* RIGHT SIDE: Signup Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            backgroundColor: theme.palette.background.default
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 450,
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
                Sign Up
              </Typography>

              {/* Error/Success Message */}
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    id="signup-first-name"
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    id="signup-last-name"
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                id="signup-email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                error={
                  // Show error if user has typed something & it doesn't match basic email pattern
                  formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                }
                helperText={
                  formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                    ? "Invalid email address"
                    : ""
                }
              />

              {/* PASSWORD FIELD */}
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                id="signup-password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* Show/Hide password icon */}
                      <IconButton edge="end" onClick={toggleShowPassword} aria-label = "toggle password visibility">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      {/* Tooltip (min requirements) */}
                      <Tooltip title="Min 6 chars, at least uppercase, lowercase, and number.">
                        <IconButton edge="end">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />

              {/* Password strength bar */}
              <PasswordStrengthBar password={formData.password} />

              {/* CONFIRM PASSWORD FIELD */}
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="verifyPassword"
                type={showConfirmPassword ? "text" : "password"}
                id="signup-confirm-password"
                value={formData.verifyPassword}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                error={
                  /* Turn the field red if user has typed something AND it doesn't match */
                  formData.verifyPassword.length > 0 &&
                  formData.verifyPassword !== formData.password
                }
                helperText={
                  formData.verifyPassword.length > 0 ? (
                    passwordsMatch ? (
                      <Typography component="span" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                        Passwords match
                      </Typography>
                    ) : (
                      <Typography component="span" sx={{ color: theme.palette.error.main, fontWeight: 500 }}>
                        Passwords do not match
                      </Typography>
                    )
                  ) : (
                    ""
                  )
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={toggleShowConfirmPassword}>
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* TRANSFER TYPE RADIO */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`
                }}
              >
                <FormControl component="fieldset" fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                    Choose your athletic status:
                  </Typography>
                  <RadioGroup
                    name="transferType"
                    value={formData.transferType}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="high_school"
                      control={<Radio id="signup-high_school" color="primary" />}
                      label="Prospective High School Athlete"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      value="transfer"
                      control={<Radio id="signup-transfer" color="primary" />}
                      label="Transferring Athlete"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      value="graduate"
                      control={<Radio id="signup-graduate" color="primary" />}
                      label="Graduated Athlete"
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>

              <Button
                id="signup-button"
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 600,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
                disabled={isSubmitDisabled}
              >
                Sign Up
              </Button>
            </form>

            </Paper>

            {/* ALREADY HAVE AN ACCOUNT? */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Already got an account?{' '}
                <Link
                  to="/login"
                  state={{ fromSignup: true }}
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Log in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Signup;
