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
  Tooltip,
  Tab,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from "@mui/icons-material/Home";
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
            
            {/* Reviews Summary */}
            <Card id="summary-card" sx={{ mb: 3 }}>
              <CardContent>
                <Typography id="summary-title" variant="h6" gutterBottom>
                  Program Summary
                </Typography>
                <ReviewSummary schoolId={id} sport={selectedSport} />
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
                {school.reviews
                  .filter(review => review.sport === selectedSport)
                  .map((review) => (
                    <Card 
                      id={`review-${review.review_id}`}
                      key={review.review_id} 
                      sx={{ mb: 2 }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography id={`coach-name-${review.review_id}`} variant="h6" gutterBottom>
                            Head Coach: {review.head_coach_name}
                          </Typography>
                          {review.user?.is_school_verified && (
                            <Tooltip title="This reviewer has verified their school email">
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <CheckCircleIcon sx={{ color: 'green' }} fontSize="small" />
                                <Typography variant="caption" sx={{ color: 'green', fontWeight: 500 }}>
                                  Verified Reviewer
                                </Typography>
                              </Stack>
                            </Tooltip>
                          )}
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
                              <Typography id={`${field}-score-${review.review_id}`} variant="caption">
                                {review[field]}/10
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SchoolPage; 