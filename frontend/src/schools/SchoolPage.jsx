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
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HomeIcon from "@mui/icons-material/Home";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import API_BASE_URL from "../utils/config";
import ReviewSummary from '../components/ReviewSummary';

function SchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
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

  const AVATAR_BASE_URL = "../../public/assets/profile-pictures/";

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



  if (!school) return <div>Loading...</div>;

  const availableSports = [];
  if (school.mbb) availableSports.push("Men's Basketball");
  if (school.wbb) availableSports.push("Women's Basketball");
  if (school.fb) availableSports.push("Football");
  if (school.vb) availableSports.push("Volleyball");
  if (school.ba) availableSports.push("Baseball");
  if (school.msoc) availableSports.push("Men's Soccer");
  if (school.wsoc) availableSports.push("Women's Soccer");
  if (school.wr) availableSports.push("Wrestling");

  const handleWriteReview = (sport) => {
    navigate(`/reviews/new?school=${id}&sport=${encodeURIComponent(sport)}`);
  };

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={loginPromptOpen}
        autoHideDuration={3000}
        onClose={() => setLoginPromptOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLoginPromptOpen(false)}
          severity="warning"
          sx={{
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            border: '1px solid #bbdefb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 500,
            px: 2,
            py: 1.5,
            boxShadow: 2,
          }}
        >
          Please log in to vote!
        </Alert>
      </Snackbar>
      <Box sx={{ my: 4 }}>
        {/* Navigation */}
        <Button
          id="back-button"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 2 }}
        >
          Back to Schools
        </Button>

        {/* School Header */}
        <Typography id="school-name" variant="h3" component="h1" gutterBottom>
          {school.school_name}
        </Typography>
        <Typography id="school-info" variant="h6" color="text.secondary" gutterBottom>
          {school.conference} • {school.location}
        </Typography>

        {/* Sport Selection Tabs */}
        <Box id="sports-tabs" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedSport}
            onChange={(e, newValue) => setSelectedSport(newValue)}
            aria-label="sports tabs"
          >
            {availableSports.map((sport) => (
              <Tab
                id={`sport-tab-${sport.replace(/\s+/g, '-').toLowerCase()}`}
                key={sport}
                label={sport}
                value={sport}
              />
            ))}
          </Tabs>
        </Box>

        {/* Sport-specific Content */}
        {selectedSport && (
          <Box id={`${selectedSport.replace(/\s+/g, '-').toLowerCase()}-content`}>
            <Typography id="program-title" variant="h4" gutterBottom>
              {selectedSport} Program
            </Typography>

            {/* Reviews Summary */}
            <Card id="summary-card" sx={{ mb: 3 }}>
              <CardContent>
                <Typography id="summary-title" variant="h6" gutterBottom>
                  Program Summary
                </Typography>
                <ReviewSummary schoolId={id} sport={selectedSport} />
              </CardContent>
            </Card>

            {/* Average Ratings Section */}
            <Card id="average-ratings-card" sx={{ mb: 3 }}>
              <CardContent>
                <Typography id="average-ratings-title" variant="h6" gutterBottom>
                  Average Ratings
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
                  ].map(([field, label]) => {
                    // Calculate average for this category
                    const average = filteredReviews.length > 0
                      ? filteredReviews.reduce((sum, review) => sum + review[field], 0) / filteredReviews.length
                      : 0;

                    return (
                      <Grid item xs={6} sm={3} key={field}>
                        <Typography id={`average-${field}-label`} variant="subtitle2">
                          {label}
                        </Typography>
                        <Rating
                          id={`average-${field}-rating`}
                          value={average}
                          readOnly
                          precision={0.1}
                          max={10}
                        />
                        <Typography id={`average-${field}-score`} variant="caption">
                          {average.toFixed(1)}/10
                        </Typography>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card id="reviews-section">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography id="reviews-title" variant="h6">
                    Reviews
                  </Typography>
                  {isAuthenticated && user.transfer_type !== "high_school" && (
                    <Button
                      id="write-review-button"
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/reviews/new`, {
                        state: {
                          schoolId: id,
                          schoolName: school.school_name,
                          selectedSport: selectedSport
                        }
                      })}
                    >
                      Write a Review
                    </Button>
                  )}
                </Box>

                {/* Filter reviews by sport */}
                {currentReviews
                  .map((review) => (
                    <Card
                      id={`review-${review.review_id}`}
                      key={review.review_id}
                      sx={{ mb: 2 }}
                      data-testid={`review-${review.review_id}`}

                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography id={`coach-name-${review.review_id}`} variant="h6">
                              Head Coach: {review.head_coach_name}
                            </Typography>
                            {review.coach_history && (
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  backgroundColor: 'grey.100',
                                  p: 2,
                                  borderRadius: 1,
                                  whiteSpace: 'pre-line'
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
                            <Grid item xs={6} sm={3} key={field}>
                              <Typography id={`${field}-label-${review.review_id}`} variant="subtitle2">
                                {label}
                              </Typography>
                              <Rating
                                id={`${field}-rating-${review.review_id}`}
                                value={review[field]}
                                readOnly
                                max={10}
                              />
                              <Typography
                                id={`${field}-score-${review.review_id}`}
                                data-testid={`${field}-score-${review.review_id}`}
                                variant="caption"
                              >
                                {review[field]}/10
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Button
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleVote(review.review_id, 1)}
                            variant={review.my_vote === 1 ? 'contained' : 'outlined'}
                            size="small"
                          >
                            Helpful ({review.helpful_count})
                          </Button>
                          <Button
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleVote(review.review_id, 0)}
                            variant={review.my_vote === 0 ? 'contained' : 'outlined'}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            Unhelpful ({review.unhelpful_count})
                          </Button>
                        </Box>
                      </CardContent>

                    </Card>
                  ))}
                                      {/* Pagination */}
      <Pagination
        count={Math.ceil(filteredReviews.length / reviewsPerPage)} // Calculate number of pages
        page={currentPage}
        onChange={handleChangePage}
        color="primary"
        showFirstButton
        showLastButton
      />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SchoolPage;