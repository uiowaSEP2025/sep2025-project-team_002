import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import SidebarWrapper from "../components/SidebarWrapper.jsx";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RateReviewIcon from "@mui/icons-material/RateReview"
import API_BASE_URL from "../utils/config";

console.log("MyReviews Component Mounted");

function MyReviews() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState("");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    is_school_verified: false,
    profile_picture: "",
  });

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

  useEffect(() => {
    console.log("Fetching reviews...");
    const loadReviews = async () => {
      try {
        const data = await fetchUserReviews();
        console.log("Data received in loadReviews:", data);  // Log the data received from fetchUserReviews
        setReviews(data); // Update the state with fetched reviews
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        // console.log("Reviews loaded:", reviews); // Log when reviews are loaded
      }
    };
    loadReviews();
  }, []);

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
   return (
    <SidebarWrapper title="My Account" menuItems={menuItems}>
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
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {review.review_message || "No review text"}
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Head Coach • {review.head_coach_name || "Unknown"}: {review.head_coach}/10
                        </Typography>

                        <Typography variant="body1" sx ={{ mt: 1 }}>Assistant Coaches: {review.assistant_coaches}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>Team Culture: {review.team_culture}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>Campus Life: {review.campus_life}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>Athletic Facilities: {review.athletic_facilities}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>Athletic Department: {review.athletic_department}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>Player Development: {review.player_development}/10</Typography>
                        <Typography variant="body1" sx ={{ mt: 1 }}>NIL Opportunity: {review.nil_opportunity}/10</Typography>

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
