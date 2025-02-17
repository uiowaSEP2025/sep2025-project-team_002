import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function SecureHome() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle opening the dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Logout handler: clear token and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

    // Navigate to review form
    const handleGoToReviewForm = () => {
      navigate("/review-form");
    };

  // Account info handler: redirect to account info page (update route as needed)
  const handleAccountInfo = () => {
    navigate("/account");
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top Right Circular Icon */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <IconButton
          onClick={handleMenuOpen}
          size="large"
          sx={{ bgcolor: "#fff", borderRadius: "50%" }}
        >
          <AccountCircleIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => { handleAccountInfo(); handleMenuClose(); }}>
            Account Info
          </MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center" }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Welcome to the Secure Home Page
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4 }}>
              You are now logged in.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToReviewForm}
            >
              Submit a Review
            </Button>
            {/* Additional secure content can be added here */}
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SecureHome;
