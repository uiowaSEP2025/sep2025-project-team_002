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
  InputAdornment
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
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
      }
    } catch (error) {
      console.error("AccountSettings error:", error);

      if (error.message.includes("Failed to fetch")) {
        setMessage("Unable to reach server. Check your connection.");
      }
      else if (error.message.includes("body stream already read")){
          setMessage("Update failed: Email already in use");
        }
      else {
        setMessage("Network error: " + error.message);
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
        setMessage(data.message);
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
      } else {
        setMessage("Network error: " + error.message);
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
      <Box>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
        >
          <Typography id="account-settings-title" variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: "2rem" }}>
            Account Settings
          </Typography>

          {message && (
            <Typography
              variant="body1"
              id="settings-error"
              color="error"
              sx={{ mb: 2, fontSize: "1.2rem" }}
            >
              {message}
            </Typography>
          )}
          <div style={{ textAlign: "center" }}>
            <h2 id="profile-pic-label">Choose Your Profile Picture</h2>
            {profilePic && profilePic.trim() ? (
              <img
                src={profilePic}
                id="selected-profile-pic"
                alt="Selected Profile"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/assets/profile-pictures/pic1.png";// Fallback image
                }}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  border: "3px solid #007bff",
                  objectFit: "cover",
                  marginBottom: "10px"
                }}
              />
            ) : (
              <AccountCircleIcon
                sx={{
                  fontSize: "150px",
                  color: "gray",
                  borderRadius: "50%",
                  backgroundColor: "#f0f0f0",
                  padding: "10px"
                }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              {profilePictures.map((pic, index) => (
                <IconButton key={index} onClick={() => updateProfilePic(pic)}>
                  <img
                    src={`/assets/profile-pictures/${pic}`}
                    alt={`Profile ${index + 1}`}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: profilePic === `/assets/profile-pictures/${pic}` ? "2px solid #007bff" : "none"
                    }}
                  />
                </IconButton>
              ))}
            </div>
          </div>
          <Box component="form" onSubmit={handleSaveChanges} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="settings-first-name"
              margin="normal"
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              InputProps={{ sx: { borderRadius: "40px" } }}
              required
            />
            <TextField
              fullWidth
              id="settings-last-name"
              margin="normal"
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              InputProps={{ sx: { borderRadius: "40px" } }}
              required
            />
            {/* Real-time email validation */}
            <TextField
              fullWidth
              id="settings-email"
              margin="normal"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{ sx: { borderRadius: "40px" } }}
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
              sx={{ mt: 3, borderRadius: "40px" }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Changes
            </Button>
          </Box>

          {/* CHANGE PASSWORD BUTTON */}
          <Button
            variant="outlined"
            id="change-password-button"
            fullWidth
            sx={{ mt: 2, borderRadius: "40px" }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenPasswordDialog}
          >
            Change Password
          </Button>
        </motion.div>
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
            borderRadius: "16px",
            p: 2,
            backgroundColor: "#fefefe"
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.5rem"
          }}
        >
          Change Password
        </DialogTitle>

        <Divider variant="middle" />

        <DialogContent>
          {/* Error message if any */}
          {passwordError && (
            <Typography id="change-password-error" color="error" sx={{ mb: 2, textAlign: "center" }}>
              {passwordError}
            </Typography>
          )}
          <PasswordForm onSubmit={handleChangePassword} includeCurrentPassword={true} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
          <Button
            variant="outlined"
            id="cancel-change-password-button"
            sx={{ borderRadius: "40px", width: "140px" }}
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
