import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
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
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [reviews, setReviews] = (location.state?.reviews || []);
  const [loading, setLoading] = useState(reviews && reviews.length === 0); // Check if reviews exist and are empty
  const [error, setError] = useState("");
console.log("RRReviews received in MyReviews:", reviews);

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    is_school_verified: false,
    profile_picture: "",
  });

useEffect(() => {
    if (!reviews.length) {
      setLoading(true);
      const fetchReviews = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`${API_BASE_URL}/api/reviews/user-reviews/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch reviews");
          }
          const data = await response.json();
          setReviews(data); // Set reviews if not passed via location.state
        } catch (error) {
          setError("Failed to load reviews");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchReviews(); // Fetch reviews if not passed via state
    } else {
      setLoading(false); // Stop loading if reviews are already available
    }
  }, [reviews]); // Only fetch reviews if they aren't passed

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
