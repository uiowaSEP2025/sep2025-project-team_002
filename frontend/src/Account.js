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

// Icons
import MenuIcon from "@mui/icons-material/Menu";    // Hamburger icon
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import API_BASE_URL from "./utils/config";

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
    transfer_type: ""
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
            transfer_type: data.transfer_type || ""
          });
        } else {
          setMessage("Failed to fetch user info.");
        }
      } catch (error) {
        setMessage("Error: " + error.message);
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
    {
      text: "School",
      action: () => navigate("/school"),
      icon: <SchoolIcon fontSize="medium" />
    },
    {
      text: "Logout",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
      icon: <LogoutIcon fontSize="medium" />
    }
  ];

  // Re-usable function that renders the menu items
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
          {/* Desktop: only show text when side menu is expanded */}
          {!isMobile && menuOpen && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
          {/* Mobile: always show text in the overlay */}
          {isMobile && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Collapsible side menu variants (desktop)
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  // Mobile overlay slide-in/out from left
  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  return (
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

            {/* List of items */}
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
              flexDirection: "column"
            }}
          >
            {/* Sticky header at the top */}
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

            {/* Scrollable menu list area */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2  // extra padding for the list
              }}
            >
              <List>{renderMenuList()}</List>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA (Account Info) */}
      <Grid
        item
        xs={12}
        md={isMobile ? 12 : 9}
        sx={{
          p: 4,
          // Add top spacing on mobile so content isn't hidden behind the hamburger
          mt: isMobile ? 6 : 0
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700, fontSize: "2rem" }}
          >
            Account Information
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

          {user ? (
            <Box component="form" sx={{ mt: 2 }}>
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
                label="Transfer Type"
                value={
                  user.transfer_type
                    ? user.transfer_type === "transfer_in"
                      ? "Transfer In"
                      : "Transfer Out"
                    : "Not Specified"
                }
                disabled
                InputProps={{ sx: { borderRadius: "40px" } }}
              />

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
