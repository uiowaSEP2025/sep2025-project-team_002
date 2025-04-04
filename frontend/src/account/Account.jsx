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

  // Media query to detect if we're on mobile (<= 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Desktop collapsible menu state
  const [menuOpen, setMenuOpen] = useState(true);

  // Mobile overlay menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User info state
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    is_school_verified: false,
    profile_picture: "",
  });

  // For any error or status messages
  const [message, setMessage] = useState("");

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
          setUser({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            transfer_type: data.transfer_type || "",
            is_school_verified: data.is_school_verified || false,
            profile_picture: data.profile_picture || "",
          });
        } else {
          const errorData = await response.json();
          setMessage(errorData.detail || errorData.error || "Unknown Error");
        }
      } catch (error) {
        console.error("Account page error:", error);

        if (error.message.includes("Failed to fetch")) {
          setMessage("Cannot connect to the server. Please check your network.");
        } else {
          setMessage("Network error: " + error.message);
        }
      }
    };
    fetchUserInfo();
  }, [navigate]);

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
        ...(user.transfer_type && user.transfer_type !== "graduate"
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
        localStorage.removeItem("token");
        navigate("/login");
      },
      icon: <LogoutIcon fontSize="medium" />
    }
  ];

  const renderMenuList = () =>
    menuItems.map((item, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton
          onClick={() => {
            item.action();
            if (isMobile) setMobileMenuOpen(false);
          }}
          sx={{ borderRadius: "20px", mb: 1, pl: 2 }}
        >
          {item.icon}
          {/* Desktop: only show text when side menu is expanded */}
          {!isMobile && menuOpen && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
          {/* Mobile: always show text */}
          {isMobile && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Animation variants
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

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
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Desktop side menu */}
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

      {/* Mobile hamburger */}
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

      {/* Mobile overlay */}
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
            {/* Overlay header */}
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

      {/* Main content area */}
      <Grid
        item
        xs={12}
        md={isMobile ? 12 : 9}
        sx={{
          p: 4,
          mt: isMobile ? 6 : 0 // NEW: add top margin on mobile so overlay button doesn't overlap
        }}
      >
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
                margin="normal"
                label="First Name"
                value={user.first_name}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                value={user.last_name}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={user.email}
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />
              <TextField
                fullWidth
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
      </Grid>
    </Grid>
  );
}

export default Account;