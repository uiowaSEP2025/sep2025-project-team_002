import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
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
  useMediaQuery,
  Paper,
  Avatar,
  Alert,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
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
import RateReviewIcon from '@mui/icons-material/RateReview';
import API_BASE_URL from "../utils/config.js";
import {useUser} from "../context/UserContext.jsx";

function Account() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Get user context for logout functionality
  const { logout, user, loading, profilePic } = useUser();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  if (loading) {
    return (
      <SidebarWrapper title="My Account" menuItems={[]}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Loading account information...
          </Typography>
        </Box>
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
    // Conditionally block "My Reviews" tab for high school transfer type
    ...(user?.transfer_type && user.transfer_type !== "high_school"
    ? [{
        text: "My Reviews",
        action: () => navigate("/account/my-reviews"),
        icon: <RateReviewIcon fontSize="medium" />
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
        // show the alert so the test’s spy fires
        alert(data.message || "Verification email sent!");
        setMessage(data.message || "Verification email sent!");
        setMessageType("success");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to send verification email.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      setMessage("Something went wrong. Please try again later.");
      setMessageType("error");
    }
  };

  return (
    <SidebarWrapper menuItems={menuItems} title="My Account">
      {/* Main content area */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "left",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
        >
          <Typography
            variant="h4"
            id="account-info-title"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", md: "2rem" },
              mb: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Account Information
          </Typography>

          {message && (
            <Alert
              severity={messageType}
              sx={{ mb: 3, borderRadius: 2 }}
              variant="filled"
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          )}

          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            {/* Display profile picture */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {profilePic ? (
                <Box
                  component="img"
                  src={profilePic}
                  alt={user?.first_name || "Profile"}
                  id="account-profile-image"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "/assets/profile-pictures/pic1.png"; // Fallback image
                  }}
                  sx={{
                    width: 175,
                    height: 175,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    mx: 'auto',
                    display: 'block',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
              ) : (
                <Avatar
                  alt={user?.first_name || "Profile"}
                  id="account-profile-image"
                  sx={{
                    width: 175,
                    height: 175,
                    mx: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    fontSize: '4rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                >
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                </Avatar>
              )}
            </Box>


          {user ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="account-first-name"
                    margin="normal"
                    label="First Name"
                    value={user.first_name}
                    disabled
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: {
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="account-last-name"
                    margin="normal"
                    label="Last Name"
                    value={user.last_name}
                    disabled
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: {
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                id="account-email"
                margin="normal"
                label="Email"
                value={user.email}
                disabled
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }
                }}
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
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }
                }}
              />
              {user.email && (
                <Paper
                  id="account-verification-box"
                  data-testid="account-verification-box"
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: user.email.endsWith(".edu")
                      ? user.is_school_verified
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    border: "1px solid",
                    borderColor: user.email.endsWith(".edu")
                      ? user.is_school_verified
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.warning.main, 0.3)
                      : alpha(theme.palette.error.main, 0.3),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      icon={
                        user.email.endsWith(".edu")
                          ? user.is_school_verified
                            ? <CheckCircleIcon />
                            : <InfoOutlinedIcon />
                          : <InfoOutlinedIcon />
                      }
                      label={
                        user.email.endsWith(".edu")
                          ? user.is_school_verified
                            ? "School Email Verified"
                            : "School Email Not Verified"
                          : "Personal Email"
                      }
                      color={
                        user.email.endsWith(".edu")
                          ? user.is_school_verified
                            ? "success"
                            : "warning"
                          : "error"
                      }
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />

                    <Tooltip
                      arrow
                      placement="top"
                      title={
                        user.email.endsWith(".edu")
                          ? "Get verified to earn trust for your voice!"
                          : "Only .edu emails can be verified. Update your email!"
                      }
                    >
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{ color: theme.palette.text.secondary, cursor: "pointer" }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Only show button if it's a .edu and not verified */}
                  {user.email.endsWith(".edu") && !user.is_school_verified && (
                    <Button
                      variant="contained"
                      id="verify-school-email-button"
                      size="small"
                      color="warning"
                      sx={{
                        borderRadius: 6,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        },
                      }}
                      onClick={handleSendVerification}
                    >
                      Verify Email
                    </Button>
                  )}
                </Paper>
              )}

              {/* Button to go to the Account Settings page */}
              <Button
                variant="contained"
                id="edit-change-info-button"
                fullWidth
                sx={{
                  mt: 3,
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
          </Paper>
          <Outlet />
        </Box>
      </Box>
    </SidebarWrapper>
  );
}

export default Account;