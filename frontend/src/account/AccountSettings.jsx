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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  Tooltip,
  InputAdornment,
  Paper,
  Alert,
  useTheme,
  alpha,
  Avatar
} from "@mui/material";
import RateReviewIcon from '@mui/icons-material/RateReview';


// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import { useContext } from "react";
import { UserContext, useUser } from "../context/UserContext"
import SidebarWrapper from "../components/SidebarWrapper";

// Import your config base URL
import API_BASE_URL from "../utils/config.js";


import PasswordForm from "./PasswordForm.jsx";

function AccountSettings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, updateProfilePic, profilePic, loading, fetchUser } = useUser();

  // Main user form data (editable)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: ""
  });

  // For success/error messages
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // For logout functionality
  const { logout } = useUser();

  const profilePictures = ["pic1.png", "pic2.png", "pic3.png", "pic4.png", "pic5.png"];

  // Initialize form data only once when component mounts or when user changes
  useEffect(() => {
    if (user) {
      // Only set form data if it's empty (initial load)
      if (!formData.first_name && !formData.last_name && !formData.email) {
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          transfer_type: user.transfer_type || ""
        });
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time email validation:
  const emailIsInvalid =
    formData.email.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Dialog state for changing password
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // for dialog errors

  // Handle text/radio changes in the main form
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Save changes to user info
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // PATCH request to update user fields
      const response = await fetch(`${API_BASE_URL}/users/user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          transfer_type: formData.transfer_type
        })
      });

      if (response.ok) {
        setMessage("Account info updated successfully");
        setMessageType("success");
        fetchUser();
      } else if (response.status === 401) {
        // Token expired or invalid
        logout();
        navigate("/login");
      } else {
        let errorText = "Unknown error";

        try {
          const errorData = await response.json();
          // Some backends return { "error": "..."} or { "detail": "..."}
          errorText = errorData.detail;
        } catch (parseError) {
          // If we fail to parse JSON, it might be an HTML error page
          const textData = await response.text();
          console.error("Raw error response (not JSON):", textData);
          // Provide a fallback message to the user
          errorText = "Server returned an unexpected error page.";
        }

        setMessage("Update failed: " + errorText);
        setMessageType("error");
      }
    } catch (error) {
      console.error("AccountSettings error:", error);

      if (error.message.includes("Failed to fetch")) {
        setMessage("Unable to reach server. Check your connection.");
        setMessageType("error");
      }
      else if (error.message.includes("body stream already read")){
          setMessage("Update failed: Email already in use");
          setMessageType("error");
        }
      else {
        setMessage("Network error: " + error.message);
        setMessageType("error");
      }
    }
  };

  // Open/Close the password dialog
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordError("");
  };

  // Handle the "change password" action inside the dialog
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Successfully changed password
        handleClosePasswordDialog();
        setMessage(data.message || "Password changed successfully");
        setMessageType("success");
      } else if (response.status === 401) {
        // Token expired or invalid
        logout();
        navigate("/login");
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.detail || errorData.error || "Could not change password");
      }
    } catch (error) {
      console.error("AccountSettings error:", error);

      if (error.message.includes("Failed to fetch")) {
        setMessage("Unable to reach server. Check your connection.");
        setMessageType("error");
      } else {
        setMessage("Network error: " + error.message);
        setMessageType("error");
      }
    }
  };


  // Menu items
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
    // {
    //   text: "School",
    //   action: () => navigate("/school"),
    //   icon: <SchoolIcon fontSize="medium" />
    // },
           ...(user?.transfer_type && user.transfer_type !== "graduate"
      ? [{
          text: "Completed Preference Form",
          action: () => navigate("/user-preferences/"),
          icon: <CheckCircleIcon fontSize="medium" />
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

  return (
    <SidebarWrapper menuItems={menuItems} title="My Account">
      {/* MAIN CONTENT: Account Settings Form */}
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        <Box sx={{ maxWidth: "700px", margin: "0 auto", textAlign: "left" }}>
          <Typography
            id="account-settings-title"
            variant="h4"
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
            Account Settings
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
              p: 4,
              mb: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              textAlign: "center"
            }}
          >
            <Typography
              variant="h5"
              id="profile-pic-label"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main
              }}
            >
              Choose Your Profile Picture
            </Typography>

            {profilePic && profilePic.trim() ? (
              <Box
                component="img"
                src={profilePic}
                id="selected-profile-pic"
                alt="Selected Profile"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/assets/profile-pictures/pic1.png";// Fallback image
                }}
                sx={{
                  width: 175,
                  height: 175,
                  borderRadius: "50%",
                  border: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  objectFit: "cover",
                  mb: 3,
                  mx: "auto",
                  display: "block",
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 175,
                  height: 175,
                  mx: "auto",
                  mb: 3,
                  fontSize: "4rem",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
              </Avatar>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
              {profilePictures.map((pic, index) => (
                <Box
                  key={index}
                  onClick={() => updateProfilePic(pic)}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: profilePic === `/assets/profile-pictures/${pic}` ?
                      `3px solid ${theme.palette.primary.main}` :
                      `3px solid transparent`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={`/assets/profile-pictures/${pic}`}
                    alt={`Profile ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main
              }}
            >
              Personal Information
            </Typography>

            <Box component="form" onSubmit={handleSaveChanges}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="settings-first-name"
                    margin="normal"
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="settings-last-name"
                    margin="normal"
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    required
                  />
                </Grid>
              </Grid>

              {/* Real-time email validation */}
              <TextField
                fullWidth
                id="settings-email"
                margin="normal"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                required
                type="email"
                error={emailIsInvalid}
                helperText={emailIsInvalid ? "Invalid email address" : ""}
              />

            {/* Transfer Type (radio) */}
            {/*<FormControl component="fieldset" sx={{ mt: 2 }}>*/}
            {/*  <FormLabel component="legend">Transfer Type</FormLabel>*/}
            {/*  <RadioGroup*/}
            {/*    row*/}
            {/*    name="transfer_type"*/}
            {/*    value={formData.transfer_type}*/}
            {/*    onChange={handleChange}*/}
            {/*  >*/}
            {/*    <FormControlLabel*/}
            {/*      value="transfer_in"*/}
            {/*      control={<Radio />}*/}
            {/*      label="Transfer In"*/}
            {/*    />*/}
            {/*    <FormControlLabel*/}
            {/*      value="transfer_out"*/}
            {/*      control={<Radio />}*/}
            {/*      label="Transfer Out"*/}
            {/*    />*/}
            {/*  </RadioGroup>*/}
            {/*</FormControl>*/}

              {/* SAVE CHANGES BUTTON */}
              <Button
                type="submit"
                id="save-changes-button"
                variant="contained"
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
              >
                Save Changes
              </Button>
            </Box>
          </Paper>

          {/* CHANGE PASSWORD BUTTON */}
          <Button
            variant="outlined"
            id="change-password-button"
            fullWidth
            sx={{
              mt: 2,
              mb: 4,
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
            onClick={handleOpenPasswordDialog}
          >
            Change Password
          </Button>
        </Box>
      </Box>

      {/* DIALOG FOR CHANGING PASSWORD */}
      <Dialog
        open={passwordDialogOpen}
        id="change-password-dialog"
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
        TransitionProps={{
          onExited: () => {
            const el = document.getElementById("change-password-button");
            if (el) el.focus();
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.5rem",
            color: theme.palette.primary.main,
            pb: 1
          }}
        >
          Change Password
        </DialogTitle>

        <Divider sx={{ mb: 2 }} />

        <DialogContent>
          {/* Error message if any */}
          {passwordError && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              variant="outlined"
            >
              {passwordError}
            </Alert>
          )}
          <PasswordForm onSubmit={handleChangePassword} includeCurrentPassword={true} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            id="cancel-change-password-button"
            sx={{
              px: 3,
              py: 1,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.light, 0.1),
                borderColor: theme.palette.error.light,
                color: theme.palette.error.main
              }
            }}
            onClick={handleClosePasswordDialog}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </SidebarWrapper>
  );
}

export default AccountSettings;
