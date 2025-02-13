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
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");

    // If no token is found, redirect user to login
    if (!token) {
      navigate("/login");
      return;
    }

    // Otherwise, attempt to fetch user info with the token
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
          // Assuming `data` is a single object { first_name, last_name, email, transfer_type, ... }
          setUser(data);
        } else {
          // If the response is not OK, we handle it as an error
          setMessage("Failed to fetch user info.");
        }
      } catch (error) {
        setMessage("Error: " + error.message);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Define menu items for the vertical menu
  const menuItems = [
    { text: "Return to Dashboard", action: () => navigate("/secure-home") },
    { text: "Account Info", action: () => navigate("/account") },
    { text: "Account Settings", action: () => navigate("/account/settings") },
    { text: "School", action: () => navigate("/school") },
    {
      text: "Logout",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  ];

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Left Side: Vertical Menu */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{ backgroundColor: "#1a1a1a", color: "white", p: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AccountCircleIcon fontSize="large" sx={{ mr: 1 }} />
          <Typography variant="h6">My Account</Typography>
        </Box>
        <Divider sx={{ bgcolor: "grey.600", mb: 2 }} />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={item.action} sx={{ borderRadius: "20px", mb: 1 }}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>

      {/* Right Side: Account Information */}
      <Grid item xs={12} md={9} sx={{ p: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "left" }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Account Information
          </Typography>
          {message && (
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}
          {user ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>First Name:</strong> {user.first_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Last Name:</strong> {user.last_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Transfer Type:</strong>{" "}
                {user.transfer_type
                  ? user.transfer_type === "transfer_in"
                    ? "Transfer In"
                    : "Transfer Out"
                  : "Not specified"}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1">Loading account information...</Typography>
          )}
        </motion.div>
      </Grid>
    </Grid>
  );
}

export default Account;
