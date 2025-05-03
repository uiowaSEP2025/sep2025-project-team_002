import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Pagination,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
  Alert
} from "@mui/material";
import SidebarWrapper from "../components/SidebarWrapper.jsx";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import StarRating from "../components/StarRating";
import API_BASE_URL from "../utils/config";
import {useUser} from "../context/UserContext.jsx";



function MyReviews() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  const sportIcons = {
  "Men's Basketball": <SportsBasketballIcon />,
  "Women's Basketball": <SportsBasketballIcon />,
  "Football": <SportsFootballIcon />,
  "Volleyball": <SportsVolleyballIcon />,
  "Baseball": <SportsBaseballIcon />,
  "Men's Soccer": <SportsSoccerIcon />,
  "Women's Soccer": <SportsSoccerIcon />,
  "Wrestling": <SportsMmaIcon />,
};

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

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


  const { user, fetchUser } = useUser();

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
        ...(user?.transfer_type !== "graduate"
      ? [{
          text: "Completed Preference Form",
          action: () => navigate("/user-preferences/"),
          icon: < CheckCircleIcon fontSize="medium" />,
          id: "completed-pref-form"
        }]
      : []
    ),
    // Conditionally block "My Reviews" tab for high school transfer type
    ...(user?.transfer_type !== "high_school"
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
    const response = await fetch(`${API_BASE_URL}/api/reviews/user-reviews/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user reviews");
    }
    return await response.json();
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
        await fetchUser(); // Set user info state
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



  // Set the total number of pages
  useEffect(() => {
    setTotalPages(Math.ceil(reviews.length / reviewsPerPage));
  }, [reviews]);

  return (
    <SidebarWrapper title="My Account" menuItems={menuItems}>
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.75rem", md: "2rem" },
            mb: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Reviews
        </Typography>

        {/* Display error message if there is an error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : reviews.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Box sx={{ py: 4 }}>
              <RateReviewIcon
                sx={{
                  fontSize: 60,
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 2
                }}
              />
              <Typography variant="h6" color="text.secondary">
                You haven't written any reviews yet
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ mt: 3 }}>
            {currentReviews.map((review) => (
              <Paper
                key={review.review_id}
                elevation={2}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <Box sx={{
                  bgcolor: alpha(theme.palette.primary.light, 0.1),
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {review.school_name || "Untitled School"}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          icon={sportIcons[review.sport] || <SportsBasketballIcon />}
                          label={review.sport || "N/A"}
                          size="small"
                          sx={{
                            borderRadius: '16px',
                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                            color: theme.palette.primary.dark,
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {review.created_at && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {review.review_message && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.primary }}>
                        Review:
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: theme.palette.text.secondary,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        p: 2,
                        borderRadius: 2,
                        whiteSpace: 'pre-line'
                      }}>
                        {review.review_message}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, color: theme.palette.text.primary }}>
                    Ratings:
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Head Coach ({review.head_coach_name || "Unknown"}):</Typography>
                        <StarRating rating={review.head_coach} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Assistant Coaches:</Typography>
                        <StarRating rating={review.assistant_coaches} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Team Culture:</Typography>
                        <StarRating rating={review.team_culture} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Campus Life:</Typography>
                        <StarRating rating={review.campus_life} showValue={true} />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Athletic Facilities:</Typography>
                        <StarRating rating={review.athletic_facilities} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Athletic Department:</Typography>
                        <StarRating rating={review.athletic_department} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Player Development:</Typography>
                        <StarRating rating={review.player_development} showValue={true} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">NIL Opportunity:</Typography>
                        <StarRating rating={review.nil_opportunity} showValue={true} />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            ))}

            {/* Pagination */}
            {reviews.length > reviewsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                    },
                    '& .Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </SidebarWrapper>
  );
}

export default MyReviews;
