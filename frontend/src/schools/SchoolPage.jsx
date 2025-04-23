import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
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
  Tab,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import API_BASE_URL from "../utils/config";
import ReviewSummary from '../components/ReviewSummary';

// Function to calculate the average rating for a set of reviews
const calculateAverageRating = (reviews) => {
  const ratingFields = [
    'head_coach', 'assistant_coaches', 'team_culture', 'campus_life',
    'athletic_facilities', 'athletic_department', 'player_development', 'nil_opportunity'
  ];
  let totalSum = 0;
  let totalCount = 0;

  reviews.forEach(review => {
    ratingFields.forEach(field => {
      if (review[field] != null) { // Check if the rating exists
        totalSum += review[field];
        totalCount++;
      }
    });
  });

  return totalCount > 0 ? totalSum / totalCount : 0; // Return average or 0 if no ratings
};

// Function to calculate the average rating for each category
const calculateCategoryAverages = (reviews) => {
  const ratingFields = [
    'head_coach', 'assistant_coaches', 'team_culture', 'campus_life',
    'athletic_facilities', 'athletic_department', 'player_development', 'nil_opportunity'
  ];
  const averages = {};

  ratingFields.forEach(field => {
    const total = reviews.reduce((sum, review) => sum + (review[field] || 0), 0);
    averages[field] = reviews.length > 0 ? total / reviews.length : 0;
  });

  return averages;
};

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

  // Filter reviews for the currently selected sport
  const sportReviews = school.reviews?.filter(review => review.sport === selectedSport) || [];

  // Calculate the average rating for each category
  const categoryAverages = calculateCategoryAverages(sportReviews);

  const handleWriteReview = (sport) => {
    navigate(`/reviews/new?school=${id}&sport=${encodeURIComponent(sport)}`);
  };

  return (
    <Container maxWidth="lg">
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
            
            {/* Conditionally render Review Summary */}
            {sportReviews.length > 0 && (
              <Card id="summary-card" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography id="summary-title" variant="h6" gutterBottom>
                    Program Summary
                  </Typography>
                  <ReviewSummary schoolId={id} sport={selectedSport} />
                </CardContent>
              </Card>
            )}

            {/* Conditionally render Category Averages */}
            {sportReviews.length > 0 && (
              <Card id="category-averages-card" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography id="category-averages-title" variant="h6" gutterBottom>
                    Average Ratings by Category
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
                        <Typography id={`average-${field}-label`} variant="subtitle2">
                          {label}
                        </Typography>
                        <Rating
                          id={`average-${field}-rating`}
                          value={categoryAverages[field]}
                          readOnly
                          precision={0.1}
                          max={10}
                        />
                        <Typography id={`average-${field}-score`} variant="caption">
                          {categoryAverages[field].toFixed(1)}/10
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

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
                
                {/* Display reviews or message if none */}
                {sportReviews.length > 0 ? (
                  sportReviews.map((review) => (
                    <Card 
                      id={`review-${review.review_id}`}
                      key={review.review_id} 
                      sx={{ mb: 2 }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography id={`coach-name-${review.review_id}`} variant="h6">
                            Head Coach: {review.head_coach_name}
                          </Typography>
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
                        </Box>
                        
                        {review.coach_history && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mb: 2, 
                              backgroundColor: 'grey.100',
                              p: 2,
                              borderRadius: 1,
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {review.coach_history}
                          </Typography>
                        )}

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
                              <Typography id={`${field}-score-${review.review_id}`} variant="caption">
                                {review[field]}/10
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography id="no-reviews-message" sx={{ textAlign: 'center', mt: 3 }}>
                    No reviews available for {selectedSport} yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SchoolPage; 