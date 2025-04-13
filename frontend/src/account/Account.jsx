import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Button,
  TextField,
  useMediaQuery
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import SidebarWrapper from "../components/SidebarWrapper";

// Icons
import MenuIcon from "@mui/icons-material/Menu";    // Hamburger icon
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import API_BASE_URL from "../utils/config.js";
import {UserProvider, useUser} from "../context/UserContext.jsx"

function Account() {
  const navigate = useNavigate();

  // Get user context for logout functionality
  const { logout } = useUser();

  const [message] = useState("");

  const { user, loading } = useUser();

  if (loading) {
    return (
      <SidebarWrapper title="My Account" menuItems={[]}>
        <Typography variant="h6" sx={{ m: 4 }}>
          Loading...
        </Typography>
      </SidebarWrapper>
    );
  }

  // Menu items (the same for desktop/mobile)
  const menuItems = [
    {
      text: "Return to Dashboard",
      action: () => navigate("/secure-home"),
      icon: <DashboardIcon fontSize="medium" />
    },
    {
      text: "Account Info",
      action: () => navigate("/account"),
      icon: <AccountCircleIcon fontSize="medium" />
    },
    {
      text: "Account Settings",
      action: () => navigate("/account/settings"),
      icon: <SettingsIcon fontSize="medium" />
    },
        ...(user?.transfer_type && user.transfer_type !== "graduate"
      ? [{
          text: "Completed Preference Form",
          action: () => navigate("/user-preferences/"),
          icon: < CheckCircleIcon fontSize="medium" />,
                  id: "completed-pref-form"
        }]
      : []
    ),
    {
      text: "Logout",
      action: () => {
        logout();
        navigate("/login");
      },
      icon: <LogoutIcon fontSize="medium" />
    }
  ];

  const handleSendVerification = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/send-school-verification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Verification email sent!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send verification email.");
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <SidebarWrapper menuItems={menuItems} title="My Account">
      {/* Main content area */}
      <Box>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "left",
            // You could add responsive width or padding here if needed
          }}
        >
          <Typography
            variant="h4"
            id="account-info-title"
            gutterBottom
            sx={{ fontWeight: 700, fontSize: "2rem" }}
          >
            Account Information
          </Typography>

          <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: "#f5f5f5" }}>
        {/* Display selected profile picture */}
            <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
              {user.profile_picture ? (
                <img
                  src={`/assets/profile-pictures/${user.profile_picture}`} // dynamic source based on user profile picture
                  alt="Profile"
                  id="account-profile-image"
                  style={{
                    width: '175px',            // Larger size for the selected profile picture
                    height: '175px',           // Same size for consistency
                    objectFit: 'cover',        // Ensure the image covers the circle
                    borderRadius: '50%',       // Circular image
                    marginBottom: '10px',      // Optional: maintain spacing if needed
                  }}
                />
              ) : null} {/* Optional: Display this only if a new picture is selected */}
            </Box>
          </div>
          {message && (
            <Typography
              variant="body1"
              id="account-page-error"
              color="error"
              sx={{ mb: 2, fontSize: "1.2rem" }}
            >
              {message}
            </Typography>
          )}

          {user ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                id="account-first-name"
                margin="normal"
                label="First Name"
                value={user.first_name}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                id="account-last-name"
                margin="normal"
                label="Last Name"
                value={user.last_name}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                id="account-email"
                margin="normal"
                label="Email"
                value={user.email}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                id="account-athlete-status"
                margin="normal"
                label="Athlete Status"
                value={
                  user.transfer_type
                      ? user.transfer_type === "high_school"
                       ? "Prospective High School Athlete"
                       : user.transfer_type === "transfer"
                     ? "Transferring Athlete"
                     : user.transfer_type === "graduate"
                     ? "Graduated Athlete"
                                   :"Other"
                    : "Not Specified"
                }
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              {user.email && (
                <Box
                    id="account-verification-box"
                    data-testid="account-verification-box"
                    sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: user.email.endsWith(".edu")
                      ? user.is_school_verified
                        ? "#e8f5e9" // light green
                        : "#fff8e1" // light yellow
                      : "#ffebee", // light red
                    border: "1px solid",
                    borderColor: user.email.endsWith(".edu")
                      ? user.is_school_verified
                        ? "#66bb6a"
                        : "#ffcc80"
                      : "#ef9a9a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: user.email.endsWith(".edu")
                          ? user.is_school_verified
                            ? "green"
                            : "#ff9800"
                          : "#d32f2f"
                      }}
                    >
                      {user.email.endsWith(".edu")
                        ? user.is_school_verified
                          ? "✅ School Email Verified"
                          : "⚠️ School Email Not Verified"
                        : "⛔️ Personal Email without Verification"}
                    </Typography>

                    <Tooltip
                      arrow
                      title={
                        user.email.endsWith(".edu")
                          ? "Get verified to earn trust for your voice!"
                          : "Only .edu emails can be verified. Update your email!"
                      }
                    >
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#888", cursor: "pointer" }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Only show button if it's a .edu and not verified */}
                  {user.email.endsWith(".edu") && !user.is_school_verified && (
                    <Button
                      variant="contained"
                      id="verify-school-email-button"
                      size="small"
                      sx={{
                        borderRadius: "20px",
                        backgroundColor: "#ff9800",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#fb8c00"
                        }
                      }}
                      onClick={handleSendVerification}
                    >
                      Verify Email
                    </Button>
                  )}
                </Box>
              )}

              {/* Button to go to the Account Settings page */}
              <Button
                variant="contained"
                id="edit-change-info-button"
                fullWidth
                sx={{ mt: 3, borderRadius: "40px" }}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/account/settings")}
              >
                Edit / Change Info
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ fontSize: "1.2rem" }}>
              Loading account information...
            </Typography>
          )}
        </motion.div>
      </Box>
    </SidebarWrapper>
  );
}

export default Account;