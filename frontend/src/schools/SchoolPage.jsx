import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Avatar,
  Badge,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Rating,
  Stack,
  Grid,
  Tabs,
  Tooltip,
  Tab,
  Pagination,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import API_BASE_URL from "../utils/config";
import ReviewSummary from '../components/ReviewSummary';

// Constants
const AVATAR_BASE_URL = "../../public/assets/profile-pictures/";

function SchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const isAuthenticated = !!localStorage.getItem('token');
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const [sortedReviews, setSortedReviews] = useState([]);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Filter reviews by selected sport
const sportDisplayToCode = {
  "Men's Basketball": "mbb",
  "Women's Basketball": "wbb",
  "Football": "fb",
  "Volleyball": "vb",
  "Baseball": "ba",
  "Men's Soccer": "msoc",
  "Women's Soccer": "wsoc",
  "Wrestling": "wr",
};

const filteredReviews = school?.reviews.filter(review => {
  // Normalize both values for comparison
  const reviewSport = review.sport.toLowerCase();
  const selectedCode = sportDisplayToCode[selectedSport]?.toLowerCase();

  return (
    reviewSport === selectedCode || // matches code (vb)
    reviewSport === selectedSport.toLowerCase() || // matches full name
    sportDisplayToCode[review.sport] === selectedSport // matches if review has code
  );
}) || [];

// In your filtering logic, add:
console.log("All reviews:", school?.reviews);
console.log("Selected sport code:", sportDisplayToCode[selectedSport]);
console.log("Filtered reviews:", filteredReviews);

  // Calculate the index of the last review on the current page
  const indexOfLastReview = currentPage * reviewsPerPage;
  // Calculate the index of the first review on the current page
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

  // Slice the reviews array to get the reviews for the current page
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const handleVote = async (reviewId, voteValue) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoginPromptOpen(true);
      // Auto-hide the login prompt after 5 seconds
      setTimeout(() => {
        setLoginPromptOpen(false);
      }, 5000);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${reviewId}/vote/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vote: voteValue }),
        }
      );

      const data = await response.json();
      setSortedReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.review_id === reviewId
            ? {
                ...r,
                my_vote: data.vote,
                helpful_count: data.helpful_count,
                unhelpful_count: data.unhelpful_count,
              }
            : r
        )
      );
    } catch (error) {
      console.error('Vote failed', error);
    }
  };

  // Use the AVATAR_BASE_URL constant defined at the top of the file

  useEffect(() => {
    if (!school || !selectedSport) return;

    const filtered = school.reviews.filter(review => review.sport === selectedSport);

    const sorted = [...filtered].sort((a, b) => {
      if (a.helpful_count !== b.helpful_count) {
        return b.helpful_count - a.helpful_count;
      }
      if (a.unhelpful_count !== b.unhelpful_count) {
        return a.unhelpful_count - b.unhelpful_count;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setSortedReviews(sorted);
    setCurrentPage(1);
  }, [school, selectedSport]);

  useEffect(() => {
    const fetchSchool = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const endpoint = token
          ? `${API_BASE_URL}/api/schools/${id}/`
          : `${API_BASE_URL}/api/public/schools/${id}/`;

        const headers = token
          ? {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          : {
              'Content-Type': 'application/json'
            };

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSchool(data);

        // Set default selected sport if available
        if (data.mbb) setSelectedSport("Men's Basketball");
        else if (data.wbb) setSelectedSport("Women's Basketball");
        else if (data.fb) setSelectedSport("Football");
        else if (data.vb) setSelectedSport("Volleyball");
        else if (data.ba) setSelectedSport("Baseball");
         else if (data.msoc) setSelectedSport("Men's Soccer");
        else if (data.wsoc) setSelectedSport("Women's Soccer");
        else if (data.wr) setSelectedSport("Wrestling");
      } catch (error) {
        console.error('Error fetching school:', error);
        setError('Failed to load school data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;  // No user logged in

    // Fetch User Info
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            transfer_type: data.transfer_type || "",
          });
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Bugsnag.notify(error);
      }
    };

    fetchUserInfo();
  }, []);



  // Prepare available sports list if school data is loaded
  const availableSports = [];
  if (school) {
    if (school.mbb) availableSports.push("Men's Basketball");
    if (school.wbb) availableSports.push("Women's Basketball");
    if (school.fb) availableSports.push("Football");
    if (school.vb) availableSports.push("Volleyball");
    if (school.ba) availableSports.push("Baseball");
    if (school.msoc) availableSports.push("Men's Soccer");
    if (school.wsoc) availableSports.push("Women's Soccer");
    if (school.wr) availableSports.push("Wrestling");
  }

  const handleWriteReview = (sport) => {
    // Pass the school ID, name, and selected sport as state to the review form
    navigate('/reviews/new', {
      state: {
        schoolId: id,
        schoolName: school?.name,
        selectedSport: sport
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading school information...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  // No school data
  if (!school) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            School information not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
      <>
      {/* Fixed Snackbar at top-center */}
      <Snackbar
        open={loginPromptOpen}
        autoHideDuration={5000}
        onClose={() => setLoginPromptOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: theme.zIndex.snackbar,
        }}
      >
        <Alert
          onClose={() => setLoginPromptOpen(false)}
          severity="warning"
          variant="filled"
          sx={{ width: '100%', maxWidth: 360 }}
        >
          Please log in to vote!
        </Alert>
      </Snackbar>
    <Container maxWidth="lg" sx={{
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '200px',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            zIndex: 2,
            p: 3,
          }}
        >
          <Typography id="school-name" variant="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
            {school.school_name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Chip
              icon={<SchoolIcon sx={{ color: 'white !important' }} />}
              label={school.conference}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />

            <Chip
              icon={<LocationOnIcon sx={{ color: 'white !important' }} />}
              label={school.location}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        {/* Navigation and Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            id="back-button"
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              borderRadius: 2,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Back to Schools
          </Button>

          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              pl: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.light, 0.1)
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500, mr: 1.5 }}>
              Overall Rating:
            </Typography>
            <Rating
              value={school.average_rating || 0}
              precision={0.1}
              readOnly
              sx={{
                color: theme.palette.warning.main,
                '& .MuiRating-iconEmpty': {
                  color: alpha(theme.palette.warning.main, 0.3)
                }
              }}
            />
            <Typography variant="body2" sx={{ ml: 1, color: theme.palette.text.secondary }}>
              ({school.review_count || 0} {school.review_count === 1 ? "review" : "reviews"})
            </Typography>
          </Paper>
        </Box>

        {/* Sport Selection Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Tabs
            value={selectedSport}
            onChange={(e, newValue) => setSelectedSport(newValue)}
            aria-label="sports tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                py: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            {availableSports.map((sport) => (
              <Tab
                id={`sport-tab-${sport.replace(/\s+/g, '-').toLowerCase()}`}
                key={sport}
                label={sport}
                value={sport}
                icon={<SportsSoccerIcon sx={{ mr: 1 }} />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* Sport-specific Content */}
        {selectedSport && (
          <Box id={`${selectedSport.replace(/\s+/g, '-').toLowerCase()}-content`}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                id="program-title"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {selectedSport} Program
              </Typography>

              {isAuthenticated && user.transfer_type !== "high_school" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleWriteReview(selectedSport)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  Write a Review
                </Button>
              )}
            </Box>

            {/* Reviews Summary */}
            <Paper
              elevation={2}
              id="summary-card"
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Box sx={{
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Typography
                  id="summary-title"
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Program Summary
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <ReviewSummary schoolId={id} sport={selectedSport} />
              </Box>
            </Paper>

            {/* Average Ratings Section */}
            <Paper
              elevation={2}
              id="average-ratings-card"
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Box sx={{
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Typography
                  id="average-ratings-title"
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Average Ratings
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {[
                    ['head_coach', 'Head Coach'],
                    ['assistant_coaches', 'Assistant Coaches'],
                    ['team_culture', 'Team Culture'],
                    ['campus_life', 'Campus Life'],
                    ['athletic_facilities', 'Athletic Facilities'],
                    ['athletic_department', 'Athletic Department'],
                    ['player_development', 'Player Development'],
                    ['nil_opportunity', 'NIL Opportunity']
                  ].map(([field, label]) => {
                    // Calculate average for this category
                    const average = filteredReviews.length > 0
                      ? filteredReviews.reduce((sum, review) => sum + review[field], 0) / filteredReviews.length
                      : 0;

                    return (
                      <Grid item xs={12} sm={6} md={3} key={field}>
                        <Box sx={{
                          mb: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%'
                        }}>
                          <Typography
                            id={`average-${field}-label`}
                            variant="subtitle2"
                            sx={{ mb: 0.5 }}
                          >
                            {label}
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5
                          }}>
                            <Rating
                              id={`average-${field}-rating`}
                              value={average}
                              readOnly
                              precision={0.1}
                              max={10}
                              size="small"
                            />
                            <Typography
                              id={`average-${field}-score`}
                              variant="caption"
                              sx={{
                                ml: 0.5,
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {average.toFixed(1)}/10
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>

            {/* Reviews Section */}
            <Paper
              elevation={2}
              id="reviews-section"
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
              }}>
              <Box sx={{
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography
                  id="reviews-title"
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Reviews
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Filter reviews by sport */}
                {currentReviews.length > 0 ? (
                  currentReviews.map((review) => (
                    <Card
                      id={`review-${review.review_id}`}
                      key={review.review_id}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        },
                      }}
                      data-testid={`review-${review.review_id}`}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              id={`coach-name-${review.review_id}`}
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                              }}
                            >
                              Head Coach: {review.head_coach_name}
                            </Typography>
                            {review.coach_history && (
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                                  p: 2,
                                  borderRadius: 2,
                                  whiteSpace: 'pre-line',
                                  border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
                                }}
                              >
                                {review.coach_history}
                              </Typography>
                            )}
                          </Box>

                          <Stack direction="row" spacing={2} alignItems="center">
                            {review.coach_no_longer_at_university && (
                              <Typography
                                component="span"
                                sx={{
                                  backgroundColor: 'warning.main',
                                  color: 'warning.contrastText',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.875rem'
                                }}
                              >
                                No Longer at University
                              </Typography>
                            )}

                            <Tooltip
                              title={
                                review.user?.is_school_verified
                                  ? "This reviewer has verified their school email"
                                  : ""
                              }
                            >
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                badgeContent={
                                  review.user?.is_school_verified ? (
                                    <CheckCircleIcon
                                      sx={{
                                        color: "green",
                                        fontSize: 14,
                                        backgroundColor: "white",
                                        borderRadius: "50%",
                                        boxShadow: 1,
                                      }}
                                    />
                                  ) : null
                                }
                              >
                                <Avatar
                                  src={
                                    review.user?.profile_picture
                                      ? `${AVATAR_BASE_URL}${review.user.profile_picture}`
                                      : "/default-avatar.png"
                                  }
                                  alt="Reviewer avatar"
                                  sx={{ width: 40, height: 40 }}
                                />
                              </Badge>
                            </Tooltip>

                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {new Date(review.created_at).toLocaleDateString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  color: review.user?.is_school_verified ? "green" : "text.secondary",
                                }}
                              >
                                {review.user?.is_school_verified
                                  ? "Verified"
                                  : "Unverified"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <Typography id={`review-text-${review.review_id}`} variant="body1" paragraph>
                          {review.review_message}
                        </Typography>

                        <Grid container spacing={2}>
                          {[
                            ['head_coach', 'Head Coach'],
                            ['assistant_coaches', 'Assistant Coaches'],
                            ['team_culture', 'Team Culture'],
                            ['campus_life', 'Campus Life'],
                            ['athletic_facilities', 'Athletic Facilities'],
                            ['athletic_department', 'Athletic Department'],
                            ['player_development', 'Player Development'],
                            ['nil_opportunity', 'NIL Opportunity']
                          ].map(([field, label]) => (
                            <Grid item xs={12} sm={6} md={3} key={field}>
                              <Box sx={{
                                mb: 1.5,
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                              }}>
                                <Typography
                                  id={`${field}-label-${review.review_id}`}
                                  variant="subtitle2"
                                  sx={{ mb: 0.5 }}
                                >
                                  {label}
                                </Typography>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 0.5
                                }}>
                                  <Rating
                                    id={`${field}-rating-${review.review_id}`}
                                    value={review[field]}
                                    readOnly
                                    max={10}
                                    size="small"
                                  />
                                  <Typography
                                    id={`${field}-score-${review.review_id}`}
                                    data-testid={`${field}-score-${review.review_id}`}
                                    variant="caption"
                                    sx={{
                                      ml: 0.5,
                                      fontWeight: 600,
                                      color: theme.palette.text.secondary,
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {review[field]}/10
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                          <Button
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleVote(review.review_id, 1)}
                            variant={review.my_vote === 1 ? 'contained' : 'outlined'}
                            size="small"
                            color="success"
                            aria-label={`Helpful (${review.helpful_count})`}
                            sx={{
                              borderRadius: 6,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              },
                            }}
                          >
                            Helpful ({review.helpful_count})
                          </Button>
                          <Button
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleVote(review.review_id, 0)}
                            variant={review.my_vote === 0 ? 'contained' : 'outlined'}
                            size="small"
                            color="error"
                            aria-label={`Unhelpful (${review.unhelpful_count})`}
                            sx={{
                              borderRadius: 6,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              },
                            }}
                          >
                            Unhelpful ({review.unhelpful_count})
                          </Button>
                        </Box>
                      </CardContent>

                    </Card>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No reviews available for this sport yet.
                    </Typography>
                  </Box>
                )}

                {/* Pagination */}
                {filteredReviews.length > reviewsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={Math.ceil(filteredReviews.length / reviewsPerPage)}
                      page={currentPage}
                      onChange={handleChangePage}
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
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
      </>
  );
}

export default SchoolPage;