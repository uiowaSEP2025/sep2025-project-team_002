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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: ""
  });
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8000/users/user/", {
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

  // Define menu items with corresponding icons
  const menuItems = [
    { text: "Return to Dashboard", action: () => navigate("/secure-home"), icon: <DashboardIcon fontSize="medium" /> },
    { text: "Account Info", action: () => navigate("/account"), icon: <AccountCircleIcon fontSize="medium" /> },
    { text: "Account Settings", action: () => navigate("/account/settings"), icon: <SettingsIcon fontSize="medium" /> },
    { text: "School", action: () => navigate("/school"), icon: <SchoolIcon fontSize="medium" /> },
    { text: "Logout", action: () => { localStorage.removeItem("token"); navigate("/login"); }, icon: <LogoutIcon fontSize="medium" /> }
  ];

  // Animation variants for the collapsible menu container
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Left Side: Collapsible Vertical Menu */}
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: menuOpen ? "space-between" : "center", mb: 2 }}>
            {menuOpen && (
              <Typography variant="h6" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                My Account
              </Typography>
            )}
            <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={{ color: "white" }}>
              <ArrowBackIcon sx={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: "grey.600", mb: 2 }} />
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={item.action} sx={{ borderRadius: "20px", mb: 1, pl: 2 }}>
                  {item.icon}
                  {menuOpen && (
                    <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </motion.div>
      </Grid>

      {/* Right Side: Account Information */}
      <Grid item xs={12} md={9} sx={{ p: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: "2rem" }}>
            Account Information
          </Typography>
          {message && (
            <Typography variant="body1" color="error" sx={{ mb: 2, fontSize: "1.2rem" }}>
              {message}
            </Typography>
          )}
          {user ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "1.2rem" }}>
                <strong>First Name:</strong> {user.first_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "1.2rem" }}>
                <strong>Last Name:</strong> {user.last_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "1.2rem" }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "1.2rem" }}>
                <strong>Transfer Type:</strong>{" "}
                {user.transfer_type
                  ? user.transfer_type === "transfer_in"
                    ? "Transfer In"
                    : "Transfer Out"
                  : "Not specified"}
              </Typography>
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
