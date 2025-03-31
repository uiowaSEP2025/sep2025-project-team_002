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

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import {UserProvider, useUser} from "../context/UserContext.jsx"

// Import your config base URL
import API_BASE_URL from "../utils/config.js";

// Import your password strength bar
import PasswordStrengthBar from "../components/PasswordStrengthBar.jsx";

import PasswordForm from "./PasswordForm.jsx";

function AccountSettings() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Desktop collapsible menu
  const [menuOpen, setMenuOpen] = useState(true);

  // Mobile overlay menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // For success/error messages
  const [message, setMessage] = useState("");

  // For profile picture updates (specifically)
  const { profilePic, updateProfilePic } = useUser();
  console.log("Current profile picture:", profilePic); // Debug log

  const profilePictures = ["pic1.png", "pic2.png", "pic3.png", "pic4.png", "pic5.png"];



  // Main user form data (editable)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: ""
  });

  // Real-time email validation:
  const emailIsInvalid =
    formData.email.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Dialog state for changing password
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Current password, new password, and confirm new password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for dialog errors

  // Show/hide toggles for each password field in the dialog
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // For real-time matching check
  const newPasswordsMatch =
    confirmNewPassword.length > 0 && newPassword === confirmNewPassword;

  // Fetch user info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            transfer_type: data.transfer_type || ""
          });
        } else {
          const errorData = await response.json();
          setMessage(errorData.detail || errorData.error || "Failed to fetch user info.");
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

    fetchUserInfo();
  }, [navigate]);

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
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmNewPass(false);
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
    {
      text: "Logout",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
      icon: <LogoutIcon fontSize="medium" />
    }
  ];

  // Render menu items
  const renderMenuList = () =>
    menuItems.map((item, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton
          onClick={() => {
            item.action();
            // If on mobile, close the overlay after navigating
            if (isMobile) setMobileMenuOpen(false);
          }}
          sx={{ borderRadius: "20px", mb: 1, pl: 2 }}
        >
          {item.icon}
          {/* Desktop: only show text if side menu is expanded */}
          {!isMobile && menuOpen && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
          {/* Mobile: always show text in overlay */}
          {isMobile && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Collapsible side menu (desktop)
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  // Mobile overlay slide-in/out
  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  return (
    <>
      <UserProvider>
      {/* MAIN GRID LAYOUT */}
      <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {/* DESKTOP / LARGE TABLET: Collapsible Side Menu */}
        {!isMobile && (
          <Grid item xs={12} md={3} sx={{ p: 0 }}>
            <motion.div
              variants={menuVariants}
              animate={menuOpen ? "open" : "closed"}
              initial="open"
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                height: "100vh",
                padding: 16,
                boxSizing: "border-box",
                overflow: "hidden"
              }}
            >
              {/* Top bar with title & arrow */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: menuOpen ? "space-between" : "center",
                  mb: 2
                }}
              >
                {menuOpen && (
                  <Typography variant="h6" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                    My Account
                  </Typography>
                )}
                <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={{ color: "white" }}>
                  <ArrowBackIcon
                    sx={{
                      transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s"
                    }}
                  />
                </IconButton>
              </Box>
              <Divider sx={{ bgcolor: "grey.600", mb: 2 }} />
              <List>{renderMenuList()}</List>
            </motion.div>
          </Grid>
        )}

        {/* MOBILE: Hamburger icon in top-left corner */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 3000
            }}
          >
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                bgcolor: "#1a1a1a",
                color: "white",
                "&:hover": { backgroundColor: "#333" }
              }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          </Box>
        )}

        {/* MOBILE OVERLAY MENU */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "#1a1a1a",
                zIndex: 4000,
                display: "flex",
                color: "white",
                flexDirection: "column"
              }}
            >
              {/* Sticky header */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#1a1a1a",
                  zIndex: 4500,
                  p: 2
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff" }}
                  >
                    My Account
                  </Typography>
                  <IconButton
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ color: "white" }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ bgcolor: "grey.600", mt: 2 }} />
              </Box>
              {/* Scrollable menu list */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2
                }}
              >
                <List>{renderMenuList()}</List>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT: Account Settings Form */}
        <Grid
          item
          xs={12}
          md={isMobile ? 12 : 9}
          sx={{
            p: 4,
            mt: isMobile ? 6 : 0
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: "2rem" }}>
              Account Settings
            </Typography>

            {message && (
              <Typography
                variant="body1"
                color="error"
                sx={{ mb: 2, fontSize: "1.2rem" }}
              >
                {message}
              </Typography>
            )}
            <div style={{ textAlign: "center" }}>
            <h2>Choose Your Profile Picture</h2>
            {profilePic && profilePic.trim() ? (
              <img
                src={profilePic}
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
        </Grid>
      </Grid>

      {/* DIALOG FOR CHANGING PASSWORD */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="sm"
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
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {passwordError}
            </Typography>
          )}
          <PasswordForm onSubmit={handleChangePassword} includeCurrentPassword={true} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
          <Button
            variant="outlined"
            sx={{ borderRadius: "40px", width: "140px" }}
            onClick={handleClosePasswordDialog}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      </UserProvider>
    </>

  );
}

export default AccountSettings;
