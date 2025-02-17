import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  useMediaQuery,
  Paper,
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
import API_BASE_URL from "../utils/config";

function SchoolDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [school, setSchool] = useState(null);

  useEffect(() => {
    fetchSchoolDetail();
  }, [id]);

  const fetchSchoolDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/schools/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchool(data);
      } else {
        console.error('Error fetching school details');
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
    }
  };

  // Menu items (same as Schools.js)
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
            if (isMobile) setMobileMenuOpen(false);
          }}
          sx={{ borderRadius: "20px", mb: 1, pl: 2 }}
        >
          {item.icon}
          {!isMobile && menuOpen && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
          {isMobile && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Re-use the same animation variants as Schools.js
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  if (!school) return <div>Loading...</div>;

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
                  School Details
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
              color: "white",
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
                  School Details
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
                p: 2
              }}
            >
              <List>{renderMenuList()}</List>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
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
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700, fontSize: "2rem" }}
          >
            {school.school_name}
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Conference: {school.conference}
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Available Sports Programs
          </Typography>

          <Paper sx={{ p: 3, borderRadius: "12px" }}>
            {school.sports && school.sports.length > 0 ? (
              school.sports.map((sport) => (
                <Box
                  key={sport.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: "8px",
                    backgroundColor: "#f8f8f8",
                    "&:last-child": { mb: 0 }
                  }}
                >
                  <Typography variant="h6">{sport.name}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1">No sports programs available</Typography>
            )}
          </Paper>
        </motion.div>
      </Grid>
    </Grid>
  );
}

export default SchoolDetail; 