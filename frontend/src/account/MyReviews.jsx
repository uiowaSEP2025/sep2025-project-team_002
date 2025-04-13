import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Pagination,
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
  const [error, setError] = useState("");

  // Pagination Settings
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const [totalPages, setTotalPages] = useState(1);  // Total number of pages

  // Calculate the reviews to display on the current page
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };


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
        ...(user.transfer_type !== "graduate"
      ? [{
          text: "Completed Preference Form",
          action: () => navigate("/user-preferences/"),
          icon: < CheckCircleIcon fontSize="medium" />,
          id: "completed-pref-form"
        }]
      : []
    ),
    // Conditionally block "My Reviews" tab for high school transfer type
    ...(user.transfer_type !== "high_school"
    ? [{
        text: "My Reviews",
        action: () => null,
        icon: <RateReviewIcon fontSize="medium" />
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

  // Smooth loading transition with fade-in effect
  const loadingTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  };

  // Set the total number of pages
  useEffect(() => {
    setTotalPages(Math.ceil(reviews.length / reviewsPerPage));
  }, [reviews]);

   return (
    <SidebarWrapper title="My Account" menuItems={menuItems}>
      <motion.div {...loadingTransition}>
        <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", }}>
          <Grid item xs={12} md={isMobile ? 12 : 9} sx={{ p: 4, mt: isMobile ? 6 : 0, flexGrow: 1, }}>
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

              {/* Display error message if there is an error */}
              {error && (
                <Typography sx={{ color: "red", mt: 2 }}>
                  {error}
                </Typography>
              )}

              {reviews.length === 0 ? (
                <Typography sx={{ mt: 2 }}>No reviews found.</Typography>
              ) : (
                <Box sx={{ mt: 3 }}>
                  {currentReviews.map((review) => (
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
    <Grid item xs={12} sx={{
      display: "flex",
      position: 'relative',
      justifyContent: "center",
      top: '-20px', // Adjust this value to place the pagination where you want
      left: '-90px', // Centering it with the review boxes
      }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Grid>
  </SidebarWrapper>
  );
}

export default MyReviews;
