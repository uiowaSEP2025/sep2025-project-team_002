import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  useMediaQuery
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RateReviewIcon from "@mui/icons-material/RateReview"
import API_BASE_URL from "../utils/config";

export async function fetchUserReviews() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/reviews/user-reviews/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user reviews");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
}

function MyReviews() {
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    is_school_verified: false,
    profile_picture: "",
  });

  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } },
  };

  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" },
  };

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
      text: "My Reviews",
      action: () => navigate ("/my-reviews"),
      icon: <RateReviewIcon fontSize ="medium" />
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
          {isMobile && <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />}
        </ListItemButton>
      </ListItem>
    ));

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchUserReviews();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body1">
        {error}
      </Typography>
    );
  }

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
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: menuOpen ? "space-between" : "center", mb: 2 }}>
              {menuOpen && <Typography variant="h6" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>My Account</Typography>}
              <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={{ color: "white" }}>
                <ArrowBackIcon sx={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
              </IconButton>
            </Box>
            <Divider sx={{ bgcolor: "grey.600", mb: 2 }} />
            {renderMenuList()}
          </motion.div>
        </Grid>
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: 3000 }}>
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{ bgcolor: "#1a1a1a", color: "white", "&:hover": { backgroundColor: "#333" } }}
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
              flexDirection: "column",
            }}
          >
            <Box sx={{ position: "sticky", top: 0, backgroundColor: "#1a1a1a", zIndex: 4500, p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff" }}>My Account</Typography>
                <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: "white" }}>
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Divider sx={{ bgcolor: "grey.600", mt: 2 }} />
            </Box>
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {renderMenuList()}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <Grid item xs={12} md={isMobile ? 12 : 9} sx={{ p: 4, mt: isMobile ? 6 : 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem" }}>
            My Reviews
          </Typography>

          {reviews.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No reviews found.</Typography>
          ) : (
            <Box sx={{ mt: 3 }}>
              {reviews.map((review) => (
                <Card key={review.review_id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{review.school_name || "Untitled School"}</Typography>
                    <Typography variant="subtitle1" sx={{ color: "gray" }}>
                      Sport: {review.sport || "N/A"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {review.review_message || "No review text"}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Head Coach: {review.head_coach_name || "Unknown"} • Rating: {review.head_coach}/5
                    </Typography>

                    <Typography variant="body2">Assistant Coaches: {review.assistant_coaches}/5</Typography>
                    <Typography variant="body2">Team Culture: {review.team_culture}/5</Typography>
                    <Typography variant="body2">Campus Life: {review.campus_life}/5</Typography>
                    <Typography variant="body2">Athletic Facilities: {review.athletic_facilities}/5</Typography>
                    <Typography variant="body2">Athletic Department: {review.athletic_department}/5</Typography>
                    <Typography variant="body2">Player Development: {review.player_development}/5</Typography>
                    <Typography variant="body2">NIL Opportunity: {review.nil_opportunity}/5</Typography>

                    {/* Created date */}
                    {review.created_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </motion.div>
      </Grid>
    </Grid>
  );
}

export default MyReviews;
