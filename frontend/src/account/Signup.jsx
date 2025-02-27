import React from "react";
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
  InputAdornment
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowRightIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../utils/config.js';  // Adjust the path based on your file structure

// Use the PasswordStrengthBar you created
import PasswordStrengthBar from "../components/PasswordStrengthBar.jsx";

function Signup() {
  const navigate = useNavigate();

  // Local state for the signup form
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    verifyPassword: "",
    transferType: ""
  });

  // Toggles for show/hide password
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // State for feedback messages (error/success)
  const [message, setMessage] = React.useState("");

  // State for toggling the features list on the left side
  const [showFeatures, setShowFeatures] = React.useState(false);

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

  // Submit signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setMessage("Passwords do not match!");
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
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const errorData = await response.json();
        setMessage("Signup failed: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
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
          onClick={() => navigate("/")}
          startIcon={<ArrowBackIcon />}
          sx={{ color: "black" }}
        />
      </Box>

      <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {/* LEFT SIDE: Modern App Description & Feature Dropdown */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundColor: "#1a1a1a",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 10,
            px: 4,
            textAlign: "center",
            position: "relative"
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Athletic Insider
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            Sign up to explore your future school!
          </Typography>
          <Typography
            variant="subtitle1"
            onClick={handleToggleFeatures}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                style={{ textAlign: "left" }}
              >
                <Box sx={{ p: 2 }}>
                  {[
                    "Share your collegiate athletic experiences anonymously.",
                    "Help transfer athletes find schools that match their desires.",
                    "Rate facilities, team culture, coaching, dining, travel, and more.",
                    "Gain insights into athletic department culture and additional resources."
                  ].map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body1"
                      sx={{ display: "flex", alignItems: "center", color: "#ccc", mt: 1 }}
                    >
                      <CheckCircleIcon sx={{ color: "lightgreen", mr: 1 }} /> {feature}
                    </Typography>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
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
            p: 4
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: 400 }}
          >
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
              Sign Up
            </Typography>

            {/* Error/Success Message */}
            {message && (
              <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{ sx: { borderRadius: "40px" } }}
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
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  sx: { borderRadius: "40px" },
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* Show/Hide password icon */}
                      <IconButton edge="end" onClick={toggleShowPassword}>
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
                value={formData.verifyPassword}
                onChange={handleChange}
                required
                error={
                  /* Turn the field red if user has typed something AND it doesn't match */
                  formData.verifyPassword.length > 0 &&
                  formData.verifyPassword !== formData.password
                }
                helperText={
                  formData.verifyPassword.length > 0 ? (
                    passwordsMatch ? (
                      <Typography component="span" sx={{ color: "green" }}>
                        Passwords match
                      </Typography>
                    ) : (
                      <Typography component="span" sx={{ color: "red" }}>
                        Passwords do not match
                      </Typography>
                    )
                  ) : (
                    ""
                  )
                }
                InputProps={{
                  sx: { borderRadius: "40px" },
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
              <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Are you a transfer athlete?
                </Typography>
                <RadioGroup
                  row
                  name="transferType"
                  value={formData.transferType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="transfer_in" control={<Radio />} label="Transfer In" />
                  <FormControlLabel value="transfer_out" control={<Radio />} label="Transfer Out" />
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2, borderRadius: "40px" }}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </Button>
            </form>

            {/* ALREADY HAVE AN ACCOUNT? */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/login")}
              >
                Already got an account? Log in here
              </Typography>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Signup;
