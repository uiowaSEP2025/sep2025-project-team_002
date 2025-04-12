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
import SidebarWrapper from "../components/SidebarWrapper";


console.log("MyReviews Component Mounted");




function MyReviews() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    is_school_verified: false,
    profile_picture: "",
  });

  //   // Fetch user info on mount
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate("/login");
  //     return;
  //   }
  //
  //   const fetchUserReviews = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       console.log("Fetching user reviews...");
  //       const response = await fetch(`${API_BASE_URL}/api/reviews/user-reviews/`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch user reviews");
  //       }
  //       return await response.json();
  //     } catch (error) {
  //       console.error("Error fetching user reviews:", error);
  //       return [];
  //     }
  //   };
  //   fetchUserReviews();
  // }, [navigate]);

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
      action: () => navigate ("/account/my-reviews"),
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

  // Fetch user reviews asynchronously
  const fetchUserReviews = async () => {
    const token = localStorage.getItem("token");
      try {
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
  };

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        // Fetch user info
        const userResponse = await fetch(`${API_BASE_URL}/users/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        setUser(userData);  // Set user info state

        // Fetch reviews after user info is loaded
        const reviewsData = await fetchUserReviews();
        setReviews(reviewsData);  // Set reviews state
      } catch (error) {
        setError("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);  // Hide loading spinner after data is loaded
      }
    };
    loadUserData();
  }, [navigate]);

  // Animation variants
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } },
  };

  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" },
  };

  // useEffect(() => {
  //   console.log("Fetching reviews...");
  //   const loadReviews = async () => {
  //     try {
  //       const data = await fetchUserReviews();
  //       console.log("Data received in loadReviews:", data);  // Log the data received from fetchUserReviews
  //       setReviews(data); // Update the state with fetched reviews
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //       // console.log("Reviews loaded:", reviews); // Log when reviews are loaded
  //     }
  //   };
  //   loadReviews();
  // }, []);

  // Smooth loading transition with fade-in effect
  const loadingTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };





    // Debugging: Log the current loading and reviews states
  console.log("Loading State:", loading);
  console.log("Reviews:", reviews);

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
    <SidebarWrapper title="My Reviews" menuItems={menuItems}>
      <motion.div {...loadingTransition}>
        <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
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
      </motion.div>
    </SidebarWrapper>
  );
}

export default MyReviews;
